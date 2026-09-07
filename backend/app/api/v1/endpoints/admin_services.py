import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.admin_service import (
    AdminServiceCreate,
    AdminServiceRead,
    AdminServiceUpdate,
    RemoveImageRequest,
    ReorderRequest,
)
from app.services import admin_catalog_service
from app.services.exceptions import InvalidImageError, ServiceInUseError, ServiceNotFoundError

router = APIRouter(
    prefix="/admin/services",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminServiceRead])
def list_services(db: Session = Depends(get_db)) -> list[AdminServiceRead]:
    services = admin_catalog_service.list_all_services(db)
    return [AdminServiceRead.model_validate(service) for service in services]


@router.post("", response_model=AdminServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: AdminServiceCreate, db: Session = Depends(get_db)
) -> AdminServiceRead:
    service = admin_catalog_service.create_service(db, payload)
    return AdminServiceRead.model_validate(service)


@router.patch("/{service_id}", response_model=AdminServiceRead)
def update_service(
    service_id: uuid.UUID, payload: AdminServiceUpdate, db: Session = Depends(get_db)
) -> AdminServiceRead:
    try:
        service = admin_catalog_service.update_service(db, service_id, payload)
    except ServiceNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AdminServiceRead.model_validate(service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    try:
        admin_catalog_service.delete_service(db, service_id)
    except ServiceNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ServiceInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_services(payload: ReorderRequest, db: Session = Depends(get_db)) -> None:
    try:
        admin_catalog_service.reorder_services(
            db, [(item.id, item.display_order) for item in payload.items]
        )
    except ServiceNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{service_id}/images", response_model=AdminServiceRead)
async def upload_service_image(
    service_id: uuid.UUID, file: UploadFile = File(...), db: Session = Depends(get_db)
) -> AdminServiceRead:
    content = await file.read()
    try:
        service = admin_catalog_service.add_service_image(
            db,
            service_id,
            content,
            file.content_type or "application/octet-stream",
            file.filename or "image.jpg",
        )
    except ServiceNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return AdminServiceRead.model_validate(service)


@router.delete("/{service_id}/images", response_model=AdminServiceRead)
def remove_service_image(
    service_id: uuid.UUID, payload: RemoveImageRequest, db: Session = Depends(get_db)
) -> AdminServiceRead:
    try:
        service = admin_catalog_service.remove_service_image(db, service_id, payload.url)
    except ServiceNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AdminServiceRead.model_validate(service)
