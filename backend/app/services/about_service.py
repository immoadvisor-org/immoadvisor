from sqlalchemy.orm import Session

from app.models.about import AboutContent
from app.schemas.about import AboutContentAdminUpdate, AboutContentRead
from app.services.i18n import resolve_translation_entry


def get_content_row(db: Session) -> AboutContent:
    content = db.get(AboutContent, 1)
    if content is None:
        # Rete di sicurezza: dovrebbe già esistere dalla migration.
        content = AboutContent(id=1, translations={})
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


def update_content(db: Session, payload: AboutContentAdminUpdate) -> AboutContent:
    content = get_content_row(db)
    content.translations = {
        locale: entry.model_dump() for locale, entry in payload.translations.items()
    }
    db.commit()
    db.refresh(content)
    return content


def resolve_for_locale(content: AboutContent, locale: str) -> AboutContentRead | None:
    entry = resolve_translation_entry(content.translations or {}, locale)
    if entry is None:
        return None
    return AboutContentRead(**entry)
