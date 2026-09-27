import uuid

from sqlalchemy.orm import Session

from app.integrations import content_storage

from app.models.about import AboutContent
from app.schemas.about import AboutContentAdminUpdate, AboutContentRead, AboutImageSlot
from app.services.exceptions import InvalidImageError
from app.services.i18n import resolve_translation_entry

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


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
    return AboutContentRead(**entry, main_image_url=content.main_image_url, cta_image_url=content.cta_image_url)


def _delete_stored_image(url: str | None) -> None:
    if not url:
        return
    path = content_storage.path_from_public_url(url)
    if path is not None:
        content_storage.delete_image(path)


def set_image(db: Session, slot: AboutImageSlot, content: bytes, content_type: str, filename: str) -> AboutContent:
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise InvalidImageError(f"Formato immagine non supportato: {content_type}")
    if len(content) > MAX_IMAGE_BYTES:
        raise InvalidImageError("L'immagine supera la dimensione massima di 5 MB")

    row = get_content_row(db)
    field = f"{slot}_image_url"
    old_url = getattr(row, field)

    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    public_url = content_storage.upload_image(f"about/{slot}-{uuid.uuid4()}.{extension}", content, content_type)

    setattr(row, field, public_url)
    db.commit()
    db.refresh(row)
    # La vecchia immagine si cancella solo dopo aver salvato la nuova.
    _delete_stored_image(old_url)
    return row


def clear_image(db: Session, slot: AboutImageSlot) -> AboutContent:
    row = get_content_row(db)
    field = f"{slot}_image_url"
    old_url = getattr(row, field)
    setattr(row, field, None)
    db.commit()
    db.refresh(row)
    _delete_stored_image(old_url)
    return row
