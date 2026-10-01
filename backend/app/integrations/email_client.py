"""Trasporto email: invia un messaggio già composto tramite Resend.

Non sa nulla di modelli, firme o eventi del sito: quello è compito di
app.services.email_service (composizione) e app.services.email_notifications
(quali email partono per ogni evento).
"""

import logging
from dataclasses import dataclass, field

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

RESEND_ENDPOINT = "https://api.resend.com/emails"


@dataclass(frozen=True)
class EmailAttachment:
    filename: str
    content_base64: str
    content_type: str
    # Se valorizzato, l'allegato è referenziabile nell'HTML con "cid:<content_id>".
    content_id: str | None = None


@dataclass(frozen=True)
class EmailMessage:
    to: list[str]
    subject: str
    html: str
    reply_to: str | None = None
    attachments: list[EmailAttachment] = field(default_factory=list)


def _to_payload(message: EmailMessage, sender: str) -> dict:
    payload: dict = {"from": sender, "to": message.to, "subject": message.subject, "html": message.html}
    if message.reply_to:
        payload["reply_to"] = message.reply_to
    if message.attachments:
        payload["attachments"] = [
            {
                "filename": a.filename,
                "content": a.content_base64,
                "content_type": a.content_type,
                **({"content_id": a.content_id} if a.content_id else {}),
            }
            for a in message.attachments
        ]
    return payload


def send(message: EmailMessage) -> None:
    """Invia via Resend. Se RESEND_API_KEY o i destinatari mancano, o l'invio
    fallisce, logga e prosegue invece di far fallire l'operazione che l'ha
    innescata: il dato è comunque già salvato nel database.
    """
    settings = get_settings()
    if not settings.resend_api_key or not message.to:
        logger.warning("Invio email saltato (RESEND_API_KEY o destinatari non configurati): %s", message.subject)
        return

    try:
        response = httpx.post(
            RESEND_ENDPOINT,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json=_to_payload(message, settings.email_from),
            timeout=15,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        detail = exc.response.text if isinstance(exc, httpx.HTTPStatusError) else ""
        logger.exception("Invio email fallito: %s %s", message.subject, detail)
