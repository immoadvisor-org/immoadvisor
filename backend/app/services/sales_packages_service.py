from sqlalchemy.orm import Session

from app.models.sales_package import SalesPackagesContent
from app.schemas.sales_package import SalesPackagesContentAdminUpdate, SalesPackagesContentRead
from app.services.i18n import resolve_translation_entry


def get_content_row(db: Session) -> SalesPackagesContent:
    content = db.get(SalesPackagesContent, 1)
    if content is None:
        # Rete di sicurezza: dovrebbe già esistere dalla migration.
        content = SalesPackagesContent(id=1, translations={})
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


def update_content(db: Session, payload: SalesPackagesContentAdminUpdate) -> SalesPackagesContent:
    content = get_content_row(db)
    content.translations = {
        locale: entry.model_dump() for locale, entry in payload.translations.items()
    }
    db.commit()
    db.refresh(content)
    return content


def resolve_for_locale(content: SalesPackagesContent, locale: str) -> SalesPackagesContentRead | None:
    entry = resolve_translation_entry(content.translations or {}, locale)
    if entry is None:
        return None
    return SalesPackagesContentRead(**entry)
