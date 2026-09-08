from datetime import datetime, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contact import ContactMessage, ContactSettings
from app.schemas.contact import ContactMessageCreate, ContactSettingsUpdate


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


def get_settings_row(db: Session) -> ContactSettings:
    settings = db.get(ContactSettings, 1)
    if settings is None:
        # Rete di sicurezza: la riga singleton dovrebbe già esistere dalla
        # migration, ma la creiamo se per qualche motivo manca.
        settings = ContactSettings(id=1, notification_email=None)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, payload: ContactSettingsUpdate) -> ContactSettings:
    settings = get_settings_row(db)
    settings.notification_email = payload.notification_email
    db.commit()
    db.refresh(settings)
    return settings
