from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.listing import ListingRead
from app.services import listing_catalog_service
from app.services.i18n import resolve_locale

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("", response_model=list[ListingRead])
def list_listings(
    locale: str | None = None,
    city: str | None = None,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
    rooms_min: Decimal | None = None,
    rooms_max: Decimal | None = None,
    limit: int | None = None,
    db: Session = Depends(get_db),
) -> list[ListingRead]:
    resolved_locale = resolve_locale(locale)
    listings = listing_catalog_service.list_active_listings(
        db,
        city=city,
        price_min=price_min,
        price_max=price_max,
        rooms_min=rooms_min,
        rooms_max=rooms_max,
        limit=limit,
    )
    return [ListingRead.from_model(listing, resolved_locale) for listing in listings]


@router.get("/{slug}", response_model=ListingRead)
def get_listing(slug: str, locale: str | None = None, db: Session = Depends(get_db)) -> ListingRead:
    resolved_locale = resolve_locale(locale)
    listing = listing_catalog_service.get_active_listing_by_slug(db, slug)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annuncio non trovato")
    return ListingRead.from_model(listing, resolved_locale)
