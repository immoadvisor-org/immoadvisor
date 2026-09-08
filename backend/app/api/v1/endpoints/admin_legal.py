from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.legal import LegalContentAdminRead, LegalContentAdminUpdate
from app.services import legal_service

router = APIRouter(
    prefix="/admin/legal",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=LegalContentAdminRead)
def get_legal(db: Session = Depends(get_db)) -> LegalContentAdminRead:
    content = legal_service.get_content_row(db)
    return LegalContentAdminRead(translations=content.translations or {})


@router.put("", response_model=LegalContentAdminRead)
def update_legal(payload: LegalContentAdminUpdate, db: Session = Depends(get_db)) -> LegalContentAdminRead:
    content = legal_service.update_content(db, payload)
    return LegalContentAdminRead(translations=content.translations or {})
