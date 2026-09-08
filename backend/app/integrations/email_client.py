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
    listing_line = (
        f"<p><strong>Annuncio:</strong> {message.listing_reference}</p>" if message.listing_reference else ""
    )
    body = (
        f"<p><strong>Nome:</strong> {message.first_name} {message.last_name}</p>"
        f"<p><strong>Email:</strong> {message.email}</p>"
        f"<p><strong>Telefono:</strong> {message.phone or '-'}</p>"
        f"{listing_line}"
        f"<p><strong>Messaggio:</strong></p>"
        f"<p>{message.message}</p>"
    )
    subject = (
        f"Richiesta informazioni per annuncio: {message.listing_reference}"
        if message.listing_reference
        else f"Nuovo messaggio di contatto da {message.first_name} {message.last_name}"
    )
    _send_email(to=recipients, subject=subject, html=body, reply_to=message.email)


PAYMENT_STATUS_LABELS = {
    "pending": "In attesa di pagamento",
    "paid": "Pagato",
    "cancelled": "Annullato / pagamento non riuscito",
    "refund_pending": "Rimborso in corso",
    "refunded": "Rimborsato",
}

FULFILLMENT_STATUS_LABELS = {
    "pending": "Da lavorare",
    "processing": "In lavorazione",
    "completed": "Completato",
}


def _order_items_html(order: Order) -> str:
    return "".join(
        f"<li>{item.service_name_snapshot} — CHF {item.price_chf_snapshot}</li>" for item in order.items
    )


def send_order_notification(order: Order, recipients: list[str]) -> None:
    status_label = PAYMENT_STATUS_LABELS.get(order.payment_status.value, order.payment_status.value)
    body = (
        f"<p><strong>Stato pagamento:</strong> {status_label}</p>"
        f"<p><strong>Cliente:</strong> {order.email or '-'}</p>"
        f"<p><strong>Totale:</strong> CHF {order.total_chf}</p>"
        f"<p><strong>Servizi:</strong></p>"
        f"<ul>{_order_items_html(order)}</ul>"
    )
    _send_email(
        to=recipients,
        subject=f"Ordine {status_label.lower()}: CHF {order.total_chf} da {order.email or 'utente'}",
        html=body,
    )


# Messaggio mostrato al cliente per ogni stato di pagamento dell'ordine: a
# differenza della notifica admin (sintetica), qui il tono è rivolto a chi
# ha acquistato e spiega cosa aspettarsi.
CUSTOMER_PAYMENT_STATUS_MESSAGES = {
    "paid": (
        "Pagamento confermato",
        "Grazie per il tuo acquisto! Abbiamo ricevuto il pagamento e a breve il nostro team prenderà in carico i servizi richiesti. Ti aggiorneremo via email man mano che procediamo.",
    ),
    "cancelled": (
        "Pagamento non riuscito",
        "Il pagamento per il tuo ordine non è andato a buon fine (sessione scaduta o annullata). Nessun addebito è stato effettuato. Puoi riprovare in qualsiasi momento dal carrello; se pensi si tratti di un errore, contattaci pure.",
    ),
    "refund_pending": (
        "Rimborso in corso",
        "Abbiamo avviato il rimborso del tuo ordine. L'accredito sul tuo metodo di pagamento richiede in genere alcuni giorni lavorativi; ti confermeremo via email al completamento.",
    ),
    "refunded": (
        "Rimborso completato",
        "Il rimborso del tuo ordine è stato completato. L'importo è stato accreditato sul tuo metodo di pagamento originale.",
    ),
    "pending": (
        "Ordine in attesa di pagamento",
        "Il tuo ordine è stato creato ed è in attesa di conferma del pagamento.",
    ),
}

CUSTOMER_FULFILLMENT_STATUS_MESSAGES = {
    "processing": (
        "Ordine preso in carico",
        "Il tuo ordine è stato preso in carico dal nostro team e siamo al lavoro sui servizi richiesti.",
    ),
    "completed": (
        "Ordine completato",
        "Tutti i servizi del tuo ordine sono stati completati. Grazie per aver scelto ImmoAdvisor!",
    ),
    "pending": (
        "Ordine ricevuto",
        "Il tuo ordine è stato ricevuto e sarà presto preso in carico dal nostro team.",
    ),
}


def send_customer_payment_status_email(order: Order) -> None:
    if not order.email:
        return

    title, message = CUSTOMER_PAYMENT_STATUS_MESSAGES.get(
        order.payment_status.value, ("Aggiornamento ordine", "Lo stato del pagamento del tuo ordine è cambiato.")
    )
    body = (
        f"<p>{message}</p>"
        f"<p><strong>Totale:</strong> CHF {order.total_chf}</p>"
        f"<p><strong>Servizi:</strong></p>"
        f"<ul>{_order_items_html(order)}</ul>"
    )
    _send_email(to=[order.email], subject=f"ImmoAdvisor — {title}", html=body)


def send_customer_fulfillment_status_email(order: Order) -> None:
    if not order.email:
        return

    title, message = CUSTOMER_FULFILLMENT_STATUS_MESSAGES.get(
        order.fulfillment_status.value, ("Aggiornamento ordine", "Lo stato di lavorazione del tuo ordine è cambiato.")
    )
    body = (
        f"<p>{message}</p>"
        f"<p><strong>Servizi:</strong></p>"
        f"<ul>{_order_items_html(order)}</ul>"
    )
    _send_email(to=[order.email], subject=f"ImmoAdvisor — {title}", html=body)
