import logging

import httpx

from app.core.config import get_settings
from app.models.contact import ContactMessage
from app.models.order import Order

logger = logging.getLogger(__name__)

FROM_ADDRESS = "ImmoAdvisor <onboarding@resend.dev>"


def _send_email(to: list[str], subject: str, html: str, reply_to: str | None = None) -> None:
    """Invia una email via Resend. Se RESEND_API_KEY o i destinatari non sono
    configurati, salta silenziosamente (loggando un avviso) invece di far
    fallire l'operazione che l'ha innescata: il dato è comunque già salvato
    nel database a prescindere dall'invio della notifica.
    """
    settings = get_settings()
    if not settings.resend_api_key or not to:
        logger.warning("Invio email saltato (RESEND_API_KEY o destinatari non configurati): %s", subject)
        return

    payload: dict = {"from": FROM_ADDRESS, "to": to, "subject": subject, "html": html}
    if reply_to:
        payload["reply_to"] = reply_to

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


def send_contact_notification(message: ContactMessage, recipients: list[str]) -> None:
    body = (
        f"<p><strong>Nome:</strong> {message.first_name} {message.last_name}</p>"
        f"<p><strong>Email:</strong> {message.email}</p>"
        f"<p><strong>Telefono:</strong> {message.phone or '-'}</p>"
        f"<p><strong>Messaggio:</strong></p>"
        f"<p>{message.message}</p>"
    )
    _send_email(
        to=recipients,
        subject=f"Nuovo messaggio di contatto da {message.first_name} {message.last_name}",
        html=body,
        reply_to=message.email,
    )


ORDER_STATUS_LABELS = {
    "paid": "Pagato",
    "cancelled": "Annullato / non completato",
    "pending": "In attesa",
    "processing": "In lavorazione",
    "completed": "Completato",
}


def send_order_notification(order: Order, recipients: list[str]) -> None:
    status_label = ORDER_STATUS_LABELS.get(order.status.value, order.status.value)
    items_html = "".join(
        f"<li>{item.service_name_snapshot} — CHF {item.price_chf_snapshot}</li>" for item in order.items
    )
    body = (
        f"<p><strong>Stato:</strong> {status_label}</p>"
        f"<p><strong>Cliente:</strong> {order.email or '-'}</p>"
        f"<p><strong>Totale:</strong> CHF {order.total_chf}</p>"
        f"<p><strong>Servizi:</strong></p>"
        f"<ul>{items_html}</ul>"
    )
    _send_email(
        to=recipients,
        subject=f"Ordine {status_label.lower()}: CHF {order.total_chf} da {order.email or 'utente'}",
        html=body,
    )
