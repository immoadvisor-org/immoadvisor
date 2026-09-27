import base64
import logging
from pathlib import Path

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.contact import ContactMessage
from app.models.order import Order
from app.services import email_template_service
from app.services.email_template_service import SIGNATURE_KEY, render_body_html, render_subject

logger = logging.getLogger(__name__)

FROM_ADDRESS = "ImmoAdvisor <onboarding@resend.dev>"

# Il logo viaggia come allegato inline (Content-ID) invece che come data URI:
# Gmail, Outlook e la maggior parte dei client bloccano le immagini "data:",
# mentre un allegato referenziato con "cid:" viene mostrato ovunque e non
# dipende da un URL pubblico raggiungibile.
_LOGO_PATH = Path(__file__).parent / "assets" / "logo.png"
_LOGO_CONTENT_ID = "immoadvisor-logo"
_LOGO_BASE64 = base64.b64encode(_LOGO_PATH.read_bytes()).decode() if _LOGO_PATH.exists() else None
_LOGO_ATTACHMENT = (
    {
        "filename": "logo.png",
        "content": _LOGO_BASE64,
        "content_type": "image/png",
        "content_id": _LOGO_CONTENT_ID,
    }
    if _LOGO_BASE64
    else None
)
# Solo per l'anteprima nel browser dell'admin, dove "cid:" non si risolve.
LOGO_PREVIEW_SRC = f"data:image/png;base64,{_LOGO_BASE64}" if _LOGO_BASE64 else ""


def render_signature_html(body: str, show_logo: bool, logo_src: str = f"cid:{_LOGO_CONTENT_ID}") -> str:
    logo = (
        f'<img src="{logo_src}" alt="ImmoAdvisor" width="150" height="44" '
        'style="display:block;margin-bottom:8px;border:0;" />'
        if show_logo and _LOGO_BASE64
        else ""
    )
    text = render_body_html(body, {}, paragraph_style="margin:0 0 6px;color:#64748b;font-size:13px;")
    return f'<div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;">{logo}{text}</div>'


def _send_email(db: Session, to: list[str], subject: str, html: str, reply_to: str | None = None) -> None:
    """Invia una email via Resend. Se RESEND_API_KEY o i destinatari non sono
    configurati, salta silenziosamente (loggando un avviso) invece di far
    fallire l'operazione che l'ha innescata: il dato è comunque già salvato
    nel database a prescindere dall'invio della notifica.
    """
    settings = get_settings()
    if not settings.resend_api_key or not to:
        logger.warning("Invio email saltato (RESEND_API_KEY o destinatari non configurati): %s", subject)
        return

    signature = email_template_service.get_template(db, SIGNATURE_KEY)
    payload: dict = {
        "from": FROM_ADDRESS,
        "to": to,
        "subject": subject,
        "html": html + render_signature_html(signature.body, signature.show_logo),
    }
    if reply_to:
        payload["reply_to"] = reply_to
    if signature.show_logo and _LOGO_ATTACHMENT:
        payload["attachments"] = [_LOGO_ATTACHMENT]

    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Invio email fallito: %s", subject)


def _send_template(db: Session, key: str, to: list[str], values: dict[str, str], reply_to: str | None = None) -> None:
    template = email_template_service.get_template(db, key)
    _send_email(
        db,
        to=to,
        subject=render_subject(template.subject or "", values),
        html=render_body_html(template.body, values),
        reply_to=reply_to,
    )


def send_contact_notification(db: Session, message: ContactMessage, recipients: list[str]) -> None:
    values = {
        "nome": message.first_name,
        "cognome": message.last_name,
        "email": message.email,
        "telefono": message.phone or "-",
        "messaggio": message.message,
        "annuncio": message.listing_reference or "",
    }
    key = "contact_admin_listing" if message.listing_reference else "contact_admin"
    _send_template(db, key, recipients, values, reply_to=message.email)


PAYMENT_STATUS_LABELS = {
    "pending": "In attesa di pagamento",
    "paid": "Pagato",
    "active": "Abbonamento attivo (pagamento a rate)",
    "past_due": "Rata non riuscita",
    "completed": "Rate completate",
    "cancelled": "Annullato / pagamento non riuscito",
    "refund_pending": "Rimborso in corso",
    "refunded": "Rimborsato",
}


def _order_values(order: Order) -> dict[str, str]:
    has_installments = order.payment_mode == "installments" and order.installments_total is not None
    return {
        "totale": str(order.total_chf),
        "rate": f"Rate pagate: {order.installments_paid} di {order.installments_total}" if has_installments else "",
        "rate_pagate": str(order.installments_paid),
        "rate_totali": str(order.installments_total or ""),
        "servizi": "\n".join(
            f"• {item.service_name_snapshot} — CHF {item.price_chf_snapshot}" for item in order.items
        ),
    }


def send_order_notification(db: Session, order: Order, recipients: list[str]) -> None:
    status_label = PAYMENT_STATUS_LABELS.get(order.payment_status.value, order.payment_status.value)
    values = {**_order_values(order), "stato": status_label, "cliente": order.email or "-"}
    # L'oggetto predefinito usa lo stato in minuscolo ("Ordine pagato: ...").
    template = email_template_service.get_template(db, "order_admin")
    subject_values = {**values, "stato": status_label.lower(), "cliente": order.email or "utente"}
    _send_email(
        db,
        to=recipients,
        subject=render_subject(template.subject or "", subject_values),
        html=render_body_html(template.body, values),
    )


def send_customer_payment_status_email(db: Session, order: Order) -> None:
    if not order.email:
        return

    status = order.payment_status.value
    if order.payment_mode == "installments" and status == "cancelled" and order.installments_paid > 0:
        # Un abbonamento interrotto dopo che almeno una rata è già stata
        # incassata non è "nessun addebito effettuato".
        key = "customer_payment_installments_interrupted"
    else:
        key = f"customer_payment_{status}"
    if key not in email_template_service.TEMPLATES:
        logger.warning("Nessun modello email per lo stato di pagamento %s", status)
        return
    _send_template(db, key, [order.email], _order_values(order))


def send_customer_fulfillment_status_email(db: Session, order: Order) -> None:
    if not order.email:
        return

    key = f"customer_fulfillment_{order.fulfillment_status.value}"
    if key not in email_template_service.TEMPLATES:
        logger.warning("Nessun modello email per lo stato di lavorazione %s", order.fulfillment_status.value)
        return
    _send_template(db, key, [order.email], _order_values(order))
