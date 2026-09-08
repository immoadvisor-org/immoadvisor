from sqlalchemy.orm import Session

from app.models.legal import LegalContent
from app.schemas.legal import LegalContentAdminUpdate, LegalContentRead
from app.services.i18n import resolve_translation_entry


def get_content_row(db: Session) -> LegalContent:
    content = db.get(LegalContent, 1)
    if content is None:
        content = LegalContent(id=1, translations={})
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


def update_content(db: Session, payload: LegalContentAdminUpdate) -> LegalContent:
    content = get_content_row(db)
    content.translations = {
        locale: entry.model_dump() for locale, entry in payload.translations.items()
    }
    db.commit()
    db.refresh(content)
    return content


def resolve_for_locale(content: LegalContent, locale: str) -> LegalContentRead | None:
    entry = resolve_translation_entry(content.translations or {}, locale)
    if entry is None:
        return None
    return LegalContentRead(**entry)
