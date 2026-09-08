from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.listing import Listing


def list_active_listings(
    db: Session,
    city: str | None = None,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
    rooms_min: Decimal | None = None,
    rooms_max: Decimal | None = None,
    limit: int | None = None,
) -> list[Listing]:
    stmt = select(Listing).where(Listing.active.is_(True))

    if city:
        stmt = stmt.where(Listing.city.ilike(f"%{city}%"))
    if price_min is not None:
        stmt = stmt.where(Listing.price_chf >= price_min)
    if price_max is not None:
        stmt = stmt.where(Listing.price_chf <= price_max)
    if rooms_min is not None:
        stmt = stmt.where(Listing.rooms >= rooms_min)
    if rooms_max is not None:
        stmt = stmt.where(Listing.rooms <= rooms_max)

    stmt = stmt.order_by(Listing.display_order, Listing.slug)
    if limit is not None:
        stmt = stmt.limit(limit)

    return list(db.scalars(stmt))


def get_active_listing_by_slug(db: Session, slug: str) -> Listing | None:
    stmt = select(Listing).where(Listing.slug == slug, Listing.active.is_(True))
    return db.scalars(stmt).first()
