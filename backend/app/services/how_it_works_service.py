import uuid

from sqlalchemy.orm import Session

from app.integrations import content_storage
from app.models.how_it_works import HowItWorksContent
from app.schemas.how_it_works import HowItWorksContentAdminUpdate, HowItWorksContentRead
from app.services.exceptions import InvalidImageError
from app.services.i18n import resolve_translation_entry

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}


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
    return HowItWorksContentRead(**entry, background_image_url=content.background_image_url)


def set_background_image(
    db: Session, content: bytes, content_type: str, filename: str
) -> HowItWorksContent:
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise InvalidImageError(f"Formato immagine non supportato: {content_type}")
    if len(content) > MAX_IMAGE_BYTES:
        raise InvalidImageError("L'immagine supera la dimensione massima di 5 MB")

    row = get_content_row(db)
    old_url = row.background_image_url

    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    path = f"how-it-works/{uuid.uuid4()}.{extension}"
    public_url = content_storage.upload_image(path, content, content_type)

    row.background_image_url = public_url
    db.commit()
    db.refresh(row)

    if old_url:
        old_path = content_storage.path_from_public_url(old_url)
        if old_path is not None:
            content_storage.delete_image(old_path)

    return row


def clear_background_image(db: Session) -> HowItWorksContent:
    row = get_content_row(db)
    old_url = row.background_image_url
    row.background_image_url = None
    db.commit()
    db.refresh(row)

    if old_url:
        old_path = content_storage.path_from_public_url(old_url)
        if old_path is not None:
            content_storage.delete_image(old_path)

    return row
