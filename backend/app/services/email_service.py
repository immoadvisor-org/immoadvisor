"""Composizione delle email a partire dai modelli modificabili dall'admin.

Unico punto in cui un modello (oggetto + testo + segnaposto) diventa un
EmailMessage pronto da spedire, con firma e logo aggiunti in fondo.
"""

import base64
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.integrations import email_client
from app.integrations.email_client import EmailAttachment, EmailMessage
from app.services import email_template_service
from app.services.email_template_service import SIGNATURE_KEY, render_body_html, render_subject

# Il logo viaggia come allegato inline (Content-ID) invece che come data URI:
# Gmail, Outlook e la maggior parte dei client bloccano le immagini "data:",
# mentre un allegato referenziato con "cid:" viene mostrato ovunque e non
# dipende da un URL pubblico raggiungibile.
_LOGO_PATH = Path(__file__).resolve().parent.parent / "integrations" / "assets" / "logo.png"
_LOGO_CONTENT_ID = "immoadvisor-logo"
_LOGO_BASE64 = base64.b64encode(_LOGO_PATH.read_bytes()).decode() if _LOGO_PATH.exists() else None
_LOGO_ATTACHMENT = (
    EmailAttachment(
        filename="logo.png", content_base64=_LOGO_BASE64, content_type="image/png", content_id=_LOGO_CONTENT_ID
    )
    if _LOGO_BASE64
    else None
)
# Solo per l'anteprima nel browser dell'admin, dove "cid:" non si risolve.
LOGO_PREVIEW_SRC = f"data:image/png;base64,{_LOGO_BASE64}" if _LOGO_BASE64 else ""


@dataclass(frozen=True)
class TemplateEmail:
    """Una email da inviare: quale modello, a chi e con quali valori."""

    template_key: str
    to: list[str]
    values: dict[str, str]
    reply_to: str | None = None
    # Valori alternativi per l'oggetto, quando deve leggere diversamente dal testo.
    subject_values: dict[str, str] | None = None


def render_signature_html(body: str, show_logo: bool, logo_src: str = f"cid:{_LOGO_CONTENT_ID}") -> str:
    logo = (
        f'<img src="{logo_src}" alt="ImmoAdvisor" width="150" height="44" '
        'style="display:block;margin-bottom:8px;border:0;" />'
        if show_logo and _LOGO_BASE64
        else ""
    )
    text = render_body_html(body, {}, paragraph_style="margin:0 0 6px;color:#64748b;font-size:13px;")
    return f'<div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;">{logo}{text}</div>'


def compose(db: Session, email: TemplateEmail) -> EmailMessage:
    template = email_template_service.get_template(db, email.template_key)
    signature = email_template_service.get_template(db, SIGNATURE_KEY)
    attach_logo = signature.show_logo and _LOGO_ATTACHMENT is not None
    return EmailMessage(
        to=email.to,
        subject=render_subject(template.subject or "", email.subject_values or email.values),
        html=render_body_html(template.body, email.values) + render_signature_html(signature.body, signature.show_logo),
        reply_to=email.reply_to,
        attachments=[_LOGO_ATTACHMENT] if attach_logo else [],
    )


def send(db: Session, *emails: TemplateEmail) -> None:
    """Compone e invia ogni email; quelle senza destinatari vengono saltate."""
    for email in emails:
        if email.to:
            email_client.send(compose(db, email))
