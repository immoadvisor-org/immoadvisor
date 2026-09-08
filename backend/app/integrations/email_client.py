import logging

import httpx

from app.core.config import get_settings
from app.models.contact import ContactMessage

logger = logging.getLogger(__name__)


def send_contact_notification(message: ContactMessage, to_email: str | None) -> None:
    """Notifica via email l'arrivo di un nuovo messaggio di contatto.

    Il messaggio è comunque già salvato nel database a prescindere da
    questa funzione: se RESEND_API_KEY o l'email di destinazione non sono
    configurate, la notifica viene semplicemente saltata (loggato un avviso)
    invece di far fallire la richiesta dell'utente.
    """
    settings = get_settings()
    if not settings.resend_api_key or not to_email:
        logger.warning(
            "Notifica email di contatto saltata (RESEND_API_KEY o notification_email non configurati)"
        )
        return

    body = (
        f"<p><strong>Nome:</strong> {message.first_name} {message.last_name}</p>"
        f"<p><strong>Email:</strong> {message.email}</p>"
        f"<p><strong>Telefono:</strong> {message.phone or '-'}</p>"
        f"<p><strong>Messaggio:</strong></p>"
        f"<p>{message.message}</p>"
    )

    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": "ImmoAdvisor <onboarding@resend.dev>",
                "to": [to_email],
                "reply_to": message.email,
                "subject": f"Nuovo messaggio di contatto da {message.first_name} {message.last_name}",
                "html": body,
            },
            timeout=15,
        )
        response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Invio della notifica email di contatto fallito")
