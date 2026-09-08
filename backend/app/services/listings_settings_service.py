from sqlalchemy.orm import Session

from app.models.listing_settings import ListingsSettings


def get_settings(db: Session) -> ListingsSettings:
    settings = db.get(ListingsSettings, 1)
    if settings is None:
        settings = ListingsSettings(id=1, enabled=True)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, enabled: bool) -> ListingsSettings:
    settings = get_settings(db)
    settings.enabled = enabled
    db.commit()
    db.refresh(settings)
    return settings
