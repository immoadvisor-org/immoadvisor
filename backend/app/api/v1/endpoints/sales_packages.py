from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.sales_package import SalesPackageRead, SalesPackagesContentRead
from app.services import catalog_service, sales_packages_service
from app.services.i18n import resolve_locale, translate_sales_package

router = APIRouter(prefix="/sales-packages", tags=["sales-packages"])


@router.get("", response_model=list[SalesPackageRead])
def list_sales_packages(locale: str | None = None, db: Session = Depends(get_db)) -> list[SalesPackageRead]:
    resolved_locale = resolve_locale(locale)
    packages = catalog_service.list_active_sales_packages(db)
    return [
        SalesPackageRead(
            id=package.id,
            slug=package.slug,
            monthly_price_chf=package.monthly_price_chf,
            featured=package.featured,
            installments=package.installments,
            name=translate_sales_package(package, resolved_locale)["name"],
            featured_label=translate_sales_package(package, resolved_locale)["featuredLabel"],
            includes_label=translate_sales_package(package, resolved_locale)["includesLabel"],
            features=translate_sales_package(package, resolved_locale)["features"],
        )
        for package in packages
    ]


@router.get("/content", response_model=SalesPackagesContentRead)
def get_sales_packages_content(
    locale: str | None = None, db: Session = Depends(get_db)
) -> SalesPackagesContentRead:
    resolved_locale = resolve_locale(locale)
    content = sales_packages_service.get_content_row(db)
    result = sales_packages_service.resolve_for_locale(content, resolved_locale)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contenuto non ancora configurato"
        )
    return result
