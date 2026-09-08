from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.legal import LegalContentRead
from app.services import legal_service
from app.services.i18n import resolve_locale

router = APIRouter(prefix="/legal", tags=["legal"])


@router.get("", response_model=LegalContentRead)
def get_legal(locale: str | None = None, db: Session = Depends(get_db)) -> LegalContentRead:
    resolved_locale = resolve_locale(locale)
    content = legal_service.get_content_row(db)
    result = legal_service.resolve_for_locale(content, resolved_locale)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenuto non ancora configurato"
        )
    return result
