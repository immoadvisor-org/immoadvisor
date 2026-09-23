from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.home_layout import HomeLayoutAdminRead, HomeLayoutAdminUpdate
from app.services import home_layout_service

router = APIRouter(
    prefix="/admin/home-layout",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=HomeLayoutAdminRead)
def get_home_layout(db: Session = Depends(get_db)) -> HomeLayoutAdminRead:
    layout = home_layout_service.get_layout_row(db)
    return HomeLayoutAdminRead(sections=layout.sections or [])


@router.put("", response_model=HomeLayoutAdminRead)
def update_home_layout(
    payload: HomeLayoutAdminUpdate, db: Session = Depends(get_db)
) -> HomeLayoutAdminRead:
    layout = home_layout_service.update_layout(db, payload)
    return HomeLayoutAdminRead(sections=layout.sections or [])
