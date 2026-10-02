"""Modelli delle email inviate dal sito, modificabili dall'admin per lingua.

I testi predefiniti sono in email_template_defaults; nel database (tabella
email_templates, chiave key + locale) si salvano solo quelli personalizzati.
"""

import html
import logging
import re
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.email_template import EmailTemplate
from app.schemas.email_template import EmailTemplateAdminRead, EmailTemplateUpdate
from app.services.email_template_defaults import (
    SIGNATURE_KEY,
    TEMPLATES,
    TemplateDefinition,
    sample_values,
)
from app.services.i18n import DEFAULT_LOCALE

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class ResolvedTemplate:
    subject: str | None
    body: str
    show_logo: bool


def template_locale(definition: TemplateDefinition, locale: str | None) -> str:
    """La lingua richiesta se il modello la prevede, altrimenti quella predefinita."""
    return locale if locale in definition.locales else DEFAULT_LOCALE


def _load_overrides(db: Session, key: str | None = None) -> dict[tuple[str, str], EmailTemplate]:
    # Se la tabella non esiste ancora (migrazione non applicata) o il database
    # non risponde, le email partono comunque con i testi predefiniti invece
    # di far fallire l'operazione che le ha innescate.
    stmt = select(EmailTemplate)
    if key is not None:
        stmt = stmt.where(EmailTemplate.key == key)
    try:
        return {(row.key, row.locale): row for row in db.scalars(stmt)}
    except SQLAlchemyError:
        logger.exception("Lettura modelli email fallita, uso i testi predefiniti")
        db.rollback()
        return {}


def _resolve(definition: TemplateDefinition, locale: str, override: EmailTemplate | None) -> ResolvedTemplate:
    default_subject = definition.subject[locale] if definition.subject is not None else None
    if override is None:
        return ResolvedTemplate(subject=default_subject, body=definition.body[locale], show_logo=True)
    subject = override.subject if default_subject is not None and override.subject else default_subject
    return ResolvedTemplate(subject=subject, body=override.body, show_logo=override.show_logo)


def get_template(db: Session, key: str, locale: str | None = None) -> ResolvedTemplate:
    definition = TEMPLATES[key]
    resolved_locale = template_locale(definition, locale)
    return _resolve(definition, resolved_locale, _load_overrides(db, key).get((key, resolved_locale)))


def list_for_admin(db: Session, locale: str) -> list[EmailTemplateAdminRead]:
    overrides = _load_overrides(db)
    return [_to_admin_read(key, definition, locale, overrides) for key, definition in TEMPLATES.items()]


def get_for_admin(db: Session, key: str, locale: str) -> EmailTemplateAdminRead:
    return _to_admin_read(key, TEMPLATES[key], locale, _load_overrides(db, key))


def _to_admin_read(
    key: str, definition: TemplateDefinition, locale: str, overrides: dict[tuple[str, str], EmailTemplate]
) -> EmailTemplateAdminRead:
    resolved_locale = template_locale(definition, locale)
    override = overrides.get((key, resolved_locale))
    resolved = _resolve(definition, resolved_locale, override)
    return EmailTemplateAdminRead(
        key=key,
        group=definition.group,
        locale=resolved_locale,
        locales=list(definition.locales),
        customized_locales=[loc for loc in definition.locales if (key, loc) in overrides],
        subject=resolved.subject,
        body=resolved.body,
        show_logo=resolved.show_logo,
        default_subject=definition.subject[resolved_locale] if definition.subject is not None else None,
        default_body=definition.body[resolved_locale],
        placeholders=list(definition.placeholders),
        is_customized=override is not None,
    )


def save_template(db: Session, key: str, locale: str, payload: EmailTemplateUpdate) -> EmailTemplateAdminRead:
    definition = TEMPLATES[key]
    resolved_locale = template_locale(definition, locale)
    row = db.get(EmailTemplate, (key, resolved_locale))
    if row is None:
        row = EmailTemplate(key=key, locale=resolved_locale)
        db.add(row)
    row.subject = payload.subject if definition.subject is not None else None
    row.body = payload.body
    row.show_logo = payload.show_logo
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_for_admin(db, key, resolved_locale)


def reset_template(db: Session, key: str, locale: str) -> EmailTemplateAdminRead:
    resolved_locale = template_locale(TEMPLATES[key], locale)
    row = db.get(EmailTemplate, (key, resolved_locale))
    if row is not None:
        db.delete(row)
        db.commit()
    return get_for_admin(db, key, resolved_locale)


_PLACEHOLDER_RE = re.compile(r"\{(\w+)\}")
_BOLD_RE = re.compile(r"\*\*(.+?)\*\*")


def render_subject(subject: str, values: dict[str, str]) -> str:
    return _PLACEHOLDER_RE.sub(lambda m: values.get(m.group(1), m.group(0)), subject)


def render_body_html(body: str, values: dict[str, str], paragraph_style: str = "margin:0 0 14px;") -> str:
    """Testo dell'admin -> HTML. I valori sono inseriti prima dell'escape
    cosi' anche i dati dell'utente (es. il messaggio di contatto) vengono
    trattati come testo, mai come HTML."""
    text = _PLACEHOLDER_RE.sub(lambda m: values.get(m.group(1), m.group(0)), body)
    paragraphs = re.split(r"\n\s*\n", text.strip())
    rendered = []
    for paragraph in paragraphs:
        # Riga vuota dopo la sostituzione (es. {rate} per un pagamento unico): la saltiamo.
        lines = [line for line in paragraph.split("\n") if line.strip()]
        if not lines:
            continue
        escaped = "<br>".join(_BOLD_RE.sub(r"<strong>\1</strong>", html.escape(line)) for line in lines)
        rendered.append(f'<p style="{paragraph_style}">{escaped}</p>')
    return "".join(rendered)
