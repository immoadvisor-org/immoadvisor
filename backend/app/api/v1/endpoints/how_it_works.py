from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.how_it_works import HowItWorksContentRead
from app.services import how_it_works_service
from app.services.i18n import resolve_locale

router = APIRouter(prefix="/how-it-works", tags=["how-it-works"])


@router.get("", response_model=HowItWorksContentRead)
def get_how_it_works(locale: str | None = None, db: Session = Depends(get_db)) -> HowItWorksContentRead:
    resolved_locale = resolve_locale(locale)
    content = how_it_works_service.get_content_row(db)
    result = how_it_works_service.resolve_for_locale(content, resolved_locale)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenuto non ancora configurato"
        )
    return result
