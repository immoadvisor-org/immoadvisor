from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.page_intro_settings import PageIntroSettingsRead, PageIntroSettingsUpdate
from app.services import page_intro_settings_service

router = APIRouter(
    prefix="/admin/page-intro-settings",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=PageIntroSettingsRead)
def get_page_intro_settings(db: Session = Depends(get_db)) -> PageIntroSettingsRead:
    settings = page_intro_settings_service.get_settings(db)
    return PageIntroSettingsRead.model_validate(settings)


@router.patch("", response_model=PageIntroSettingsRead)
def update_page_intro_settings(
    payload: PageIntroSettingsUpdate, db: Session = Depends(get_db)
) -> PageIntroSettingsRead:
    settings = page_intro_settings_service.update_settings(
        db, payload.show_configurator_intro, payload.show_listings_intro
    )
    return PageIntroSettingsRead.model_validate(settings)
