from datetime import datetime, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate


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
