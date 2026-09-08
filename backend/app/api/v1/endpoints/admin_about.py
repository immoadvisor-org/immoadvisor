from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.about import AboutContentAdminRead, AboutContentAdminUpdate
from app.services import about_service

router = APIRouter(
    prefix="/admin/about",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=AboutContentAdminRead)
def get_about(db: Session = Depends(get_db)) -> AboutContentAdminRead:
    content = about_service.get_content_row(db)
    return AboutContentAdminRead(translations=content.translations or {})


@router.put("", response_model=AboutContentAdminRead)
def update_about(payload: AboutContentAdminUpdate, db: Session = Depends(get_db)) -> AboutContentAdminRead:
    content = about_service.update_content(db, payload)
    return AboutContentAdminRead(translations=content.translations or {})
