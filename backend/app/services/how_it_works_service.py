from sqlalchemy.orm import Session

from app.models.how_it_works import HowItWorksContent
from app.schemas.how_it_works import HowItWorksContentAdminUpdate, HowItWorksContentRead
from app.services.i18n import resolve_translation_entry


def get_content_row(db: Session) -> HowItWorksContent:
    content = db.get(HowItWorksContent, 1)
    if content is None:
        # Rete di sicurezza: dovrebbe già esistere dalla migration.
        content = HowItWorksContent(id=1, translations={})
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


def update_content(db: Session, payload: HowItWorksContentAdminUpdate) -> HowItWorksContent:
    content = get_content_row(db)
    content.translations = {
        locale: entry.model_dump() for locale, entry in payload.translations.items()
    }
    db.commit()
    db.refresh(content)
    return content


def resolve_for_locale(content: HowItWorksContent, locale: str) -> HowItWorksContentRead | None:
    entry = resolve_translation_entry(content.translations or {}, locale)
    if entry is None:
        return None
    return HowItWorksContentRead(**entry)
