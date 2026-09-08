from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.how_it_works import HowItWorksContentAdminRead, HowItWorksContentAdminUpdate
from app.services import how_it_works_service

router = APIRouter(
    prefix="/admin/how-it-works",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=HowItWorksContentAdminRead)
def get_how_it_works(db: Session = Depends(get_db)) -> HowItWorksContentAdminRead:
    content = how_it_works_service.get_content_row(db)
    return HowItWorksContentAdminRead(translations=content.translations or {})


@router.put("", response_model=HowItWorksContentAdminRead)
def update_how_it_works(
    payload: HowItWorksContentAdminUpdate, db: Session = Depends(get_db)
) -> HowItWorksContentAdminRead:
    content = how_it_works_service.update_content(db, payload)
    return HowItWorksContentAdminRead(translations=content.translations or {})
