"""Modelli delle email inviate dal sito, modificabili dall'admin.

I testi predefiniti sono definiti qui; nel database (tabella
email_templates) si salvano solo quelli personalizzati. Il testo e' scritto
in chiaro dall'admin: una riga vuota separa i paragrafi, **testo** diventa
grassetto e {segnaposto} viene sostituito con i dati della singola email.
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
from app.schemas.email_template import EmailTemplateAdminRead, EmailTemplateGroup, EmailTemplateUpdate

logger = logging.getLogger(__name__)

SIGNATURE_KEY = "signature"


@dataclass(frozen=True)
class TemplateDefinition:
    group: EmailTemplateGroup
    subject: str | None
    body: str
    placeholders: tuple[str, ...]


_ORDER_PLACEHOLDERS = ("totale", "rate", "servizi")
_ORDER_DETAILS = "**Totale:** CHF {totale}\n{rate}\n\n**Servizi:**\n{servizi}"


def _customer_payment(subject_title: str, message: str) -> TemplateDefinition:
    return TemplateDefinition(
        group="customer_payment",
        subject=f"ImmoAdvisor — {subject_title}",
        body=f"{message}\n\n{_ORDER_DETAILS}",
        placeholders=_ORDER_PLACEHOLDERS,
    )


def _customer_fulfillment(subject_title: str, message: str) -> TemplateDefinition:
    return TemplateDefinition(
        group="customer_fulfillment",
        subject=f"ImmoAdvisor — {subject_title}",
        body=f"{message}\n\n**Servizi:**\n{{servizi}}",
        placeholders=("servizi",),
    )


# L'ordine qui e' anche quello mostrato nella sezione admin.
TEMPLATES: dict[str, TemplateDefinition] = {
    SIGNATURE_KEY: TemplateDefinition(
        group="signature", subject=None, body="Lo staff di ImmoAdvisor", placeholders=()
    ),
    "contact_admin": TemplateDefinition(
        group="admin",
        subject="Nuovo messaggio di contatto da {nome} {cognome}",
        body=(
            "**Nome:** {nome} {cognome}\n**Email:** {email}\n**Telefono:** {telefono}\n\n"
            "**Messaggio:**\n{messaggio}"
        ),
        placeholders=("nome", "cognome", "email", "telefono", "messaggio"),
    ),
    "contact_admin_listing": TemplateDefinition(
        group="admin",
        subject="Richiesta informazioni per annuncio: {annuncio}",
        body=(
            "**Nome:** {nome} {cognome}\n**Email:** {email}\n**Telefono:** {telefono}\n"
            "**Annuncio:** {annuncio}\n\n**Messaggio:**\n{messaggio}"
        ),
        placeholders=("nome", "cognome", "email", "telefono", "annuncio", "messaggio"),
    ),
    "contact_customer": TemplateDefinition(
        group="customer_contact",
        subject="ImmoAdvisor — Abbiamo ricevuto il tuo messaggio",
        body=(
            "Ciao {nome},\n\ngrazie per averci scritto! Abbiamo ricevuto il tuo messaggio e ti "
            "risponderemo il prima possibile.\n\n**Il tuo messaggio:**\n{messaggio}"
        ),
        placeholders=("nome", "cognome", "messaggio"),
    ),
    "contact_customer_listing": TemplateDefinition(
        group="customer_contact",
        subject="ImmoAdvisor — Richiesta ricevuta per l'annuncio {annuncio}",
        body=(
            "Ciao {nome},\n\ngrazie per l'interesse! Abbiamo ricevuto la tua richiesta di informazioni "
            "sull'annuncio **{annuncio}** e ti ricontatteremo il prima possibile.\n\n"
            "**Il tuo messaggio:**\n{messaggio}"
        ),
        placeholders=("nome", "cognome", "annuncio", "messaggio"),
    ),
    "order_admin": TemplateDefinition(
        group="admin",
        subject="Ordine {stato}: CHF {totale} da {cliente}",
        body="**Stato pagamento:** {stato}\n**Cliente:** {cliente}\n" + _ORDER_DETAILS,
        placeholders=("stato", "cliente", *_ORDER_PLACEHOLDERS),
    ),
    "customer_payment_paid": _customer_payment(
        "Pagamento confermato",
        "Grazie per il tuo acquisto! Abbiamo ricevuto il pagamento e a breve il nostro team prenderà in carico i servizi richiesti. Ti aggiorneremo via email man mano che procediamo.",
    ),
    "customer_payment_active": _customer_payment(
        "Pagamento rateale attivo",
        "Grazie! Abbiamo ricevuto la rata e il tuo pacchetto è confermato. Le rate successive verranno addebitate automaticamente ogni mese sulla stessa carta, fino al completamento del piano.",
    ),
    "customer_payment_past_due": _customer_payment(
        "Rata non riuscita",
        "L'ultimo addebito della rata mensile non è andato a buon fine. Stripe riprova automaticamente nei prossimi giorni; se il metodo di pagamento non è più valido, aggiornalo il prima possibile per evitare l'interruzione del servizio.",
    ),
    "customer_payment_completed": _customer_payment(
        "Tutte le rate pagate",
        "Complimenti, hai completato il pagamento rateale del tuo pacchetto! Grazie per aver scelto ImmoAdvisor.",
    ),
    "customer_payment_cancelled": _customer_payment(
        "Pagamento non riuscito",
        "Il pagamento per il tuo ordine non è andato a buon fine (sessione scaduta o annullata). Nessun addebito è stato effettuato. Puoi riprovare in qualsiasi momento dal carrello; se pensi si tratti di un errore, contattaci pure.",
    ),
    # Abbonamento interrotto dopo che almeno una rata e' gia' stata incassata:
    # il testo di "cancelled" ("nessun addebito") sarebbe fuorviante.
    "customer_payment_installments_interrupted": TemplateDefinition(
        group="customer_payment",
        subject="ImmoAdvisor — Pagamento rateale interrotto",
        body=(
            "Il pagamento rateale del tuo pacchetto si è interrotto dopo {rate_pagate} rata/e su {rate_totali} "
            "(rata non riuscita anche dopo i tentativi automatici, oppure cancellazione richiesta). Le rate già "
            "addebitate non vengono restituite automaticamente; contattaci se pensi si tratti di un errore.\n\n"
            + _ORDER_DETAILS
        ),
        placeholders=("rate_pagate", "rate_totali", *_ORDER_PLACEHOLDERS),
    ),
    "customer_payment_refund_pending": _customer_payment(
        "Rimborso in corso",
        "Abbiamo avviato il rimborso del tuo ordine. L'accredito sul tuo metodo di pagamento richiede in genere alcuni giorni lavorativi; ti confermeremo via email al completamento.",
    ),
    "customer_payment_refunded": _customer_payment(
        "Rimborso completato",
        "Il rimborso del tuo ordine è stato completato. L'importo è stato accreditato sul tuo metodo di pagamento originale.",
    ),
    "customer_payment_pending": _customer_payment(
        "Ordine in attesa di pagamento",
        "Il tuo ordine è stato creato ed è in attesa di conferma del pagamento.",
    ),
    "customer_fulfillment_pending": _customer_fulfillment(
        "Ordine ricevuto",
        "Il tuo ordine è stato ricevuto e sarà presto preso in carico dal nostro team.",
    ),
    "customer_fulfillment_processing": _customer_fulfillment(
        "Ordine preso in carico",
        "Il tuo ordine è stato preso in carico dal nostro team e siamo al lavoro sui servizi richiesti.",
    ),
    "customer_fulfillment_completed": _customer_fulfillment(
        "Ordine completato",
        "Tutti i servizi del tuo ordine sono stati completati. Grazie per aver scelto ImmoAdvisor!",
    ),
}

# Dati di esempio per l'anteprima nella sezione admin.
SAMPLE_VALUES: dict[str, str] = {
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "telefono": "+41 79 123 45 67",
    "messaggio": "Buongiorno, vorrei maggiori informazioni.\nGrazie!",
    "annuncio": "IA-1024",
    "stato": "Pagato",
    "cliente": "mario.rossi@example.com",
    "totale": "1'490.00",
    "rate": "Rate pagate: 2 di 6",
    "rate_pagate": "2",
    "rate_totali": "6",
    "servizi": "• Fotografia professionale — CHF 490.00\n• Pubblicazione annuncio — CHF 1'000.00",
}


@dataclass(frozen=True)
class ResolvedTemplate:
    subject: str | None
    body: str
    show_logo: bool


def _load_overrides(db: Session) -> dict[str, EmailTemplate]:
    # Se la tabella non esiste ancora (migrazione non applicata) o il database
    # non risponde, le email partono comunque con i testi predefiniti invece
    # di far fallire l'operazione che le ha innescate.
    try:
        return {row.key: row for row in db.scalars(select(EmailTemplate))}
    except SQLAlchemyError:
        logger.exception("Lettura modelli email fallita, uso i testi predefiniti")
        db.rollback()
        return {}


def _resolve(definition: TemplateDefinition, override: EmailTemplate | None) -> ResolvedTemplate:
    if override is None:
        return ResolvedTemplate(subject=definition.subject, body=definition.body, show_logo=True)
    subject = override.subject if definition.subject is not None and override.subject else definition.subject
    return ResolvedTemplate(subject=subject, body=override.body, show_logo=override.show_logo)


def get_template(db: Session, key: str) -> ResolvedTemplate:
    definition = TEMPLATES[key]
    return _resolve(definition, _load_overrides(db).get(key))


def list_for_admin(db: Session) -> list[EmailTemplateAdminRead]:
    overrides = _load_overrides(db)
    return [_to_admin_read(key, definition, overrides.get(key)) for key, definition in TEMPLATES.items()]


def get_for_admin(db: Session, key: str) -> EmailTemplateAdminRead:
    return _to_admin_read(key, TEMPLATES[key], _load_overrides(db).get(key))


def _to_admin_read(key: str, definition: TemplateDefinition, override: EmailTemplate | None) -> EmailTemplateAdminRead:
    resolved = _resolve(definition, override)
    return EmailTemplateAdminRead(
        key=key,
        group=definition.group,
        subject=resolved.subject,
        body=resolved.body,
        show_logo=resolved.show_logo,
        default_subject=definition.subject,
        default_body=definition.body,
        placeholders=list(definition.placeholders),
        is_customized=override is not None,
    )


def save_template(db: Session, key: str, payload: EmailTemplateUpdate) -> EmailTemplateAdminRead:
    definition = TEMPLATES[key]
    row = db.get(EmailTemplate, key)
    if row is None:
        row = EmailTemplate(key=key)
        db.add(row)
    row.subject = payload.subject if definition.subject is not None else None
    row.body = payload.body
    row.show_logo = payload.show_logo
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    return get_for_admin(db, key)


def reset_template(db: Session, key: str) -> EmailTemplateAdminRead:
    row = db.get(EmailTemplate, key)
    if row is not None:
        db.delete(row)
        db.commit()
    return get_for_admin(db, key)


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
