from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.contact import ContactMessageCreate
from app.services import contact_service, email_notifications

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=204)
def submit_contact_message(payload: ContactMessageCreate, db: Session = Depends(get_db)) -> None:
    message = contact_service.create_message(db, payload)
    email_notifications.contact_message_received(db, message)
