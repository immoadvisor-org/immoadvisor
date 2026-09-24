from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.listing import ListingFacetsRead, ListingRead
from app.schemas.listing_settings import ListingsSettingsRead
from app.services import listing_catalog_service, listings_settings_service
from app.services.i18n import resolve_locale
from app.services.listing_catalog_service import ListingSort

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=list[ListingRead])
def list_listings(
    locale: str | None = None,
    q: str | None = None,
    city: str | None = None,
    canton: str | None = None,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
    rooms_min: Decimal | None = None,
    rooms_max: Decimal | None = None,
    has_images: bool = False,
    has_video: bool = False,
    sort: ListingSort = "default",
    limit: int | None = None,
    db: Session = Depends(get_db),
) -> list[ListingRead]:
    resolved_locale = resolve_locale(locale)
    listings = listing_catalog_service.list_active_listings(
        db,
        q=q,
        city=city,
        canton=canton,
        price_min=price_min,
        price_max=price_max,
        rooms_min=rooms_min,
        rooms_max=rooms_max,
        has_images=has_images,
        has_video=has_video,
        sort=sort,
        limit=limit,
    )
    return [ListingRead.from_model(listing, resolved_locale) for listing in listings]


@router.get("/facets", response_model=ListingFacetsRead)
def get_listing_facets(db: Session = Depends(get_db)) -> ListingFacetsRead:
    return ListingFacetsRead(**listing_catalog_service.get_listing_facets(db))


@router.get("/settings", response_model=ListingsSettingsRead)
def get_listings_settings(db: Session = Depends(get_db)) -> ListingsSettingsRead:
    settings = listings_settings_service.get_settings(db)
    return ListingsSettingsRead.model_validate(settings)


@router.get("/{slug}", response_model=ListingRead)
def get_listing(slug: str, locale: str | None = None, db: Session = Depends(get_db)) -> ListingRead:
    resolved_locale = resolve_locale(locale)
    listing = listing_catalog_service.get_active_listing_by_slug(db, slug)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annuncio non trovato")
    return ListingRead.from_model(listing, resolved_locale)
