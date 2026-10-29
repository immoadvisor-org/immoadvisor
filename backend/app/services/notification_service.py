import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
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


def subscriptions_for(db: Session, email: str) -> list[NotificationPurpose]:
    stmt = select(NotificationRecipient.purpose).where(func.lower(NotificationRecipient.email) == email.lower())
    return sorted(set(db.scalars(stmt)))  # type: ignore[arg-type]


def set_subscriptions(db: Session, email: str, purposes: list[NotificationPurpose]) -> None:
    """Iscrive l'indirizzo esattamente alle categorie indicate."""
    current = db.scalars(
        select(NotificationRecipient).where(func.lower(NotificationRecipient.email) == email.lower())
    ).all()
    for recipient in current:
        if recipient.purpose not in purposes:
            db.delete(recipient)
    db.commit()
    existing = {r.purpose for r in current}
    for purpose in purposes:
        if purpose not in existing:
            add_recipient(db, purpose, email)
