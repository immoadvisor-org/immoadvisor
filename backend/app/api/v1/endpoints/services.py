from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.service import ServiceRead
from app.services import catalog_service
from app.services.i18n import resolve_locale

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceRead])
def list_services(locale: str | None = None, db: Session = Depends(get_db)) -> list[ServiceRead]:
    resolved_locale = resolve_locale(locale)
    services = catalog_service.list_active_services(db)
    return [ServiceRead.from_model(service, resolved_locale) for service in services]
