import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.integrations import listing_storage
from app.models.listing import Listing
from app.schemas.admin_listing import AdminListingCreate, AdminListingUpdate
from app.services.exceptions import InvalidImageError, ListingNotFoundError

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}


def list_all_listings(db: Session) -> list[Listing]:
    stmt = select(Listing).order_by(Listing.display_order, Listing.slug)
    return list(db.scalars(stmt))


def get_listing_or_raise(db: Session, listing_id: uuid.UUID) -> Listing:
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise ListingNotFoundError(f"Annuncio {listing_id} non trovato")
    return listing


def create_listing(db: Session, payload: AdminListingCreate) -> Listing:
    data = payload.model_dump()
    listing = Listing(id=uuid.uuid4(), created_at=datetime.now(timezone.utc), **data)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def update_listing(db: Session, listing_id: uuid.UUID, payload: AdminListingUpdate) -> Listing:
    listing = get_listing_or_raise(db, listing_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing


def delete_listing(db: Session, listing_id: uuid.UUID) -> None:
    listing = get_listing_or_raise(db, listing_id)
    db.delete(listing)
    db.commit()


def reorder_listings(db: Session, ordering: list[tuple[uuid.UUID, int]]) -> None:
    for listing_id, display_order in ordering:
        get_listing_or_raise(db, listing_id)
        db.query(Listing).filter(Listing.id == listing_id).update({"display_order": display_order})
    db.commit()


def add_listing_image(
    db: Session, listing_id: uuid.UUID, content: bytes, content_type: str, filename: str
) -> Listing:
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise InvalidImageError(f"Formato immagine non supportato: {content_type}")
    if len(content) > MAX_IMAGE_BYTES:
        raise InvalidImageError("L'immagine supera la dimensione massima di 5 MB")

    listing = get_listing_or_raise(db, listing_id)
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    path = f"{listing_id}/{uuid.uuid4()}.{extension}"
    public_url = listing_storage.upload_image(path, content, content_type)

    listing.image_urls = [*(listing.image_urls or []), public_url]
    db.commit()
    db.refresh(listing)
    return listing


def remove_listing_image(db: Session, listing_id: uuid.UUID, image_url: str) -> Listing:
    listing = get_listing_or_raise(db, listing_id)
    listing.image_urls = [url for url in (listing.image_urls or []) if url != image_url]
    db.commit()
    db.refresh(listing)

    storage_path = listing_storage.path_from_public_url(image_url)
    if storage_path is not None:
        listing_storage.delete_image(storage_path)

    return listing
