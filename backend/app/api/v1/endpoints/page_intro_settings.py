from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.page_intro_settings import PageIntroSettingsRead
from app.services import page_intro_settings_service

router = APIRouter(prefix="/page-intro-settings", tags=["page-intro-settings"])


@router.get("", response_model=PageIntroSettingsRead)
def get_page_intro_settings(db: Session = Depends(get_db)) -> PageIntroSettingsRead:
    settings = page_intro_settings_service.get_settings(db)
    return PageIntroSettingsRead.model_validate(settings)
