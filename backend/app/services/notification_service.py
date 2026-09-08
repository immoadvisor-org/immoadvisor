import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification import NotificationRecipient
from app.schemas.notification import NotificationPurpose


def list_recipients(db: Session, purpose: NotificationPurpose) -> list[NotificationRecipient]:
    stmt = (
        select(NotificationRecipient)
        .where(NotificationRecipient.purpose == purpose)
        .order_by(NotificationRecipient.email)
    )
    return list(db.scalars(stmt))


def list_recipient_emails(db: Session, purpose: NotificationPurpose) -> list[str]:
    return [r.email for r in list_recipients(db, purpose)]


def add_recipient(db: Session, purpose: NotificationPurpose, email: str) -> NotificationRecipient:
    existing = db.scalars(
        select(NotificationRecipient).where(
            NotificationRecipient.purpose == purpose, NotificationRecipient.email == email
        )
    ).first()
    if existing:
        return existing

    recipient = NotificationRecipient(
        id=uuid.uuid4(), purpose=purpose, email=email, created_at=datetime.now(timezone.utc)
    )
    db.add(recipient)
    db.commit()
    db.refresh(recipient)
    return recipient


def remove_recipient(db: Session, recipient_id: uuid.UUID) -> None:
    recipient = db.get(NotificationRecipient, recipient_id)
    if recipient is not None:
        db.delete(recipient)
        db.commit()
