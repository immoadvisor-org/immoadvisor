from sqlalchemy.orm import Session

from app.models.page_intro_settings import PageIntroSettings


def get_settings(db: Session) -> PageIntroSettings:
    settings = db.get(PageIntroSettings, 1)
    if settings is None:
        settings = PageIntroSettings(id=1, show_configurator_intro=True, show_listings_intro=True)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, show_configurator_intro: bool, show_listings_intro: bool) -> PageIntroSettings:
    settings = get_settings(db)
    settings.show_configurator_intro = show_configurator_intro
    settings.show_listings_intro = show_listings_intro
    db.commit()
    db.refresh(settings)
    return settings
