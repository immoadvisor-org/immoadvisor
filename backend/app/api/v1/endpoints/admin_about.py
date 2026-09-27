from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.models.about import AboutContent
from app.schemas.about import AboutContentAdminRead, AboutContentAdminUpdate, AboutImageSlot
from app.services import about_service
from app.services.exceptions import InvalidImageError

router = APIRouter(
    prefix="/admin/about",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


def _to_admin_read(content: AboutContent) -> AboutContentAdminRead:
    return AboutContentAdminRead(
        translations=content.translations or {},
        main_image_url=content.main_image_url,
        cta_image_url=content.cta_image_url,
    )


@router.get("", response_model=AboutContentAdminRead)
def get_about(db: Session = Depends(get_db)) -> AboutContentAdminRead:
    return _to_admin_read(about_service.get_content_row(db))


@router.put("", response_model=AboutContentAdminRead)
def update_about(payload: AboutContentAdminUpdate, db: Session = Depends(get_db)) -> AboutContentAdminRead:
    return _to_admin_read(about_service.update_content(db, payload))


@router.post("/images/{slot}", response_model=AboutContentAdminRead)
async def upload_about_image(
    slot: AboutImageSlot, file: UploadFile = File(...), db: Session = Depends(get_db)
) -> AboutContentAdminRead:
    content = await file.read()
    try:
        row = about_service.set_image(
            db, slot, content, file.content_type or "application/octet-stream", file.filename or "image.jpg"
        )
    except InvalidImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return _to_admin_read(row)


@router.delete("/images/{slot}", response_model=AboutContentAdminRead)
def remove_about_image(slot: AboutImageSlot, db: Session = Depends(get_db)) -> AboutContentAdminRead:
    """Rimuove l'immagine caricata: il sito torna a quella predefinita."""
    return _to_admin_read(about_service.clear_image(db, slot))
