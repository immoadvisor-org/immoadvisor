import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.integrations import supabase_storage
from app.models.service import Service
from app.schemas.admin_service import AdminServiceCreate, AdminServiceUpdate
from app.services.exceptions import InvalidImageError, ServiceInUseError, ServiceNotFoundError

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}


def list_all_services(db: Session) -> list[Service]:
    stmt = select(Service).order_by(Service.display_order, Service.slug)
    return list(db.scalars(stmt))


def get_service_or_raise(db: Session, service_id: uuid.UUID) -> Service:
    service = db.get(Service, service_id)
    if service is None:
        raise ServiceNotFoundError(f"Servizio {service_id} non trovato")
    return service


def create_service(db: Session, payload: AdminServiceCreate) -> Service:
    data = payload.model_dump()
    service = Service(id=uuid.uuid4(), created_at=datetime.now(timezone.utc), **data)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def update_service(db: Session, service_id: uuid.UUID, payload: AdminServiceUpdate) -> Service:
    service = get_service_or_raise(db, service_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service_id: uuid.UUID) -> None:
    service = get_service_or_raise(db, service_id)
    db.delete(service)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ServiceInUseError(
            "Impossibile eliminare: il servizio è presente in ordini esistenti. Disattivalo invece."
        ) from exc


def reorder_services(db: Session, ordering: list[tuple[uuid.UUID, int]]) -> None:
    for service_id, display_order in ordering:
        get_service_or_raise(db, service_id)
        db.query(Service).filter(Service.id == service_id).update({"display_order": display_order})
    db.commit()


def add_service_image(
    db: Session, service_id: uuid.UUID, content: bytes, content_type: str, filename: str
) -> Service:
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise InvalidImageError(f"Formato immagine non supportato: {content_type}")
    if len(content) > MAX_IMAGE_BYTES:
        raise InvalidImageError("L'immagine supera la dimensione massima di 5 MB")

    service = get_service_or_raise(db, service_id)
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    path = f"{service_id}/{uuid.uuid4()}.{extension}"
    public_url = supabase_storage.upload_image(path, content, content_type)

    service.image_urls = [*(service.image_urls or []), public_url]
    db.commit()
    db.refresh(service)
    return service


def remove_service_image(db: Session, service_id: uuid.UUID, image_url: str) -> Service:
    service = get_service_or_raise(db, service_id)
    service.image_urls = [url for url in (service.image_urls or []) if url != image_url]
    db.commit()
    db.refresh(service)

    storage_path = supabase_storage.path_from_public_url(image_url)
    if storage_path is not None:
        supabase_storage.delete_image(storage_path)

    return service
