import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.admin_listing import (
    AdminListingCreate,
    AdminListingRead,
    AdminListingUpdate,
    ListingReorderRequest,
    RemoveListingImageRequest,
)
from app.services import admin_listing_service
from app.services.exceptions import InvalidImageError, ListingNotFoundError

router = APIRouter(
    prefix="/admin/listings",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminListingRead])
def list_listings(db: Session = Depends(get_db)) -> list[AdminListingRead]:
    listings = admin_listing_service.list_all_listings(db)
    return [AdminListingRead.model_validate(listing) for listing in listings]


@router.post("", response_model=AdminListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(payload: AdminListingCreate, db: Session = Depends(get_db)) -> AdminListingRead:
    listing = admin_listing_service.create_listing(db, payload)
    return AdminListingRead.model_validate(listing)


@router.patch("/{listing_id}", response_model=AdminListingRead)
def update_listing(
    listing_id: uuid.UUID, payload: AdminListingUpdate, db: Session = Depends(get_db)
) -> AdminListingRead:
    try:
        listing = admin_listing_service.update_listing(db, listing_id, payload)
    except ListingNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AdminListingRead.model_validate(listing)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    try:
        admin_listing_service.delete_listing(db, listing_id)
    except ListingNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_listings(payload: ListingReorderRequest, db: Session = Depends(get_db)) -> None:
    try:
        admin_listing_service.reorder_listings(
            db, [(item.id, item.display_order) for item in payload.items]
        )
    except ListingNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{listing_id}/images", response_model=AdminListingRead)
async def upload_listing_image(
    listing_id: uuid.UUID, file: UploadFile = File(...), db: Session = Depends(get_db)
) -> AdminListingRead:
    content = await file.read()
    try:
        listing = admin_listing_service.add_listing_image(
            db,
            listing_id,
            content,
            file.content_type or "application/octet-stream",
            file.filename or "image.jpg",
        )
    except ListingNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return AdminListingRead.model_validate(listing)


@router.delete("/{listing_id}/images", response_model=AdminListingRead)
def remove_listing_image(
    listing_id: uuid.UUID, payload: RemoveListingImageRequest, db: Session = Depends(get_db)
) -> AdminListingRead:
    try:
        listing = admin_listing_service.remove_listing_image(db, listing_id, payload.url)
    except ListingNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AdminListingRead.model_validate(listing)
