from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.integrations.email_client import send_contact_notification
from app.schemas.contact import ContactMessageCreate
from app.services import contact_service, notification_service

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=204)
def submit_contact_message(payload: ContactMessageCreate, db: Session = Depends(get_db)) -> None:
    message = contact_service.create_message(db, payload)
    recipients = notification_service.list_recipient_emails(db, "contact")
    send_contact_notification(message, recipients)
