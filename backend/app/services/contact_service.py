from datetime import datetime, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageAdminUpdate, ContactMessageCreate
from app.services.exceptions import ContactMessageNotFoundError


def create_message(db: Session, payload: ContactMessageCreate) -> ContactMessage:
    message = ContactMessage(
        id=uuid.uuid4(),
        created_at=datetime.now(timezone.utc),
        **payload.model_dump(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def list_messages(db: Session, limit: int = 100) -> list[ContactMessage]:
    stmt = select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(limit)
    return list(db.scalars(stmt))


def get_message_or_raise(db: Session, message_id: uuid.UUID) -> ContactMessage:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise ContactMessageNotFoundError(f"Messaggio {message_id} non trovato")
    return message


def update_message(
    db: Session, message_id: uuid.UUID, payload: ContactMessageAdminUpdate
) -> ContactMessage:
    message = get_message_or_raise(db, message_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(message, field, value)
    db.commit()
    db.refresh(message)
    return message
