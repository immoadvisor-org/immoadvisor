from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.home_layout import HomeLayoutRead
from app.services import home_layout_service

router = APIRouter(prefix="/home-layout", tags=["home-layout"])


@router.get("", response_model=HomeLayoutRead)
def get_home_layout(db: Session = Depends(get_db)) -> HomeLayoutRead:
    layout = home_layout_service.get_layout_row(db)
    return HomeLayoutRead(sections=layout.sections or [])
