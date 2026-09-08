from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.how_it_works import HowItWorksContentAdminRead, HowItWorksContentAdminUpdate
from app.services import how_it_works_service
from app.services.exceptions import InvalidImageError

router = APIRouter(
    prefix="/admin/how-it-works",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


def _to_admin_read(content) -> HowItWorksContentAdminRead:
    return HowItWorksContentAdminRead(
        translations=content.translations or {},
        background_image_url=content.background_image_url,
    )


@router.get("", response_model=HowItWorksContentAdminRead)
def get_how_it_works(db: Session = Depends(get_db)) -> HowItWorksContentAdminRead:
    content = how_it_works_service.get_content_row(db)
    return _to_admin_read(content)


@router.put("", response_model=HowItWorksContentAdminRead)
def update_how_it_works(
    payload: HowItWorksContentAdminUpdate, db: Session = Depends(get_db)
) -> HowItWorksContentAdminRead:
    content = how_it_works_service.update_content(db, payload)
    return _to_admin_read(content)


@router.post("/image", response_model=HowItWorksContentAdminRead)
async def upload_background_image(
    file: UploadFile = File(...), db: Session = Depends(get_db)
) -> HowItWorksContentAdminRead:
    content = await file.read()
    try:
        row = how_it_works_service.set_background_image(
            db, content, file.content_type or "application/octet-stream", file.filename or "image.jpg"
        )
    except InvalidImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return _to_admin_read(row)


@router.delete("/image", response_model=HowItWorksContentAdminRead)
def remove_background_image(db: Session = Depends(get_db)) -> HowItWorksContentAdminRead:
    row = how_it_works_service.clear_background_image(db)
    return _to_admin_read(row)
