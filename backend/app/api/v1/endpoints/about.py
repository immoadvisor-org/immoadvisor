from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.about import AboutContentRead
from app.services import about_service
from app.services.i18n import resolve_locale

router = APIRouter(prefix="/about", tags=["about"])


@router.get("", response_model=AboutContentRead)
def get_about(locale: str | None = None, db: Session = Depends(get_db)) -> AboutContentRead:
    resolved_locale = resolve_locale(locale)
    content = about_service.get_content_row(db)
    result = about_service.resolve_for_locale(content, resolved_locale)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenuto non ancora configurato"
        )
    return result
