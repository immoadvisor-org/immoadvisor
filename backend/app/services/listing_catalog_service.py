from decimal import Decimal
from typing import Literal

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from app.models.listing import Listing

ListingSort = Literal["default", "price_asc", "price_desc", "rooms_asc", "rooms_desc", "newest"]


def list_active_listings(
    db: Session,
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
) -> list[Listing]:
    stmt = select(Listing).where(Listing.active.is_(True))

    if q:
        # Ricerca libera su luogo e testi in tutte le lingue: chi scrive
        # "lago" in italiano deve trovare anche un annuncio tradotto solo in
        # tedesco se il testo italiano lo cita.
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Listing.city.ilike(pattern),
                Listing.canton.ilike(pattern),
                cast(Listing.translations, String).ilike(pattern),
            )
        )
    if city:
        stmt = stmt.where(Listing.city.ilike(f"%{city}%"))
    if canton:
        stmt = stmt.where(func.lower(Listing.canton) == canton.lower())
    if price_min is not None:
        stmt = stmt.where(Listing.price_chf >= price_min)
    if price_max is not None:
        stmt = stmt.where(Listing.price_chf <= price_max)
    if rooms_min is not None:
        stmt = stmt.where(Listing.rooms >= rooms_min)
    if rooms_max is not None:
        stmt = stmt.where(Listing.rooms <= rooms_max)
    if has_images:
        stmt = stmt.where(func.jsonb_array_length(Listing.image_urls) > 0)
    if has_video:
        stmt = stmt.where(Listing.video_url.is_not(None), Listing.video_url != "")

    order_by = {
        "price_asc": (Listing.price_chf.asc(),),
        "price_desc": (Listing.price_chf.desc(),),
        "rooms_asc": (Listing.rooms.asc(),),
        "rooms_desc": (Listing.rooms.desc(),),
        "newest": (Listing.created_at.desc(),),
    }.get(sort, ())
    stmt = stmt.order_by(*order_by, Listing.display_order, Listing.slug)
    if limit is not None:
        stmt = stmt.limit(limit)

    return list(db.scalars(stmt))


def get_listing_facets(db: Session) -> dict:
    """Valori effettivamente presenti negli annunci attivi, per proporre
    nella ricerca solo città/cantoni e intervalli che danno risultati.
    """
    active = Listing.active.is_(True)
    cities = db.scalars(select(Listing.city).where(active).distinct().order_by(Listing.city)).all()
    cantons = db.scalars(
        select(Listing.canton)
        .where(active, Listing.canton.is_not(None), Listing.canton != "")
        .distinct()
        .order_by(Listing.canton)
    ).all()
    price_min, price_max, rooms_min, rooms_max = db.execute(
        select(
            func.min(Listing.price_chf),
            func.max(Listing.price_chf),
            func.min(Listing.rooms),
            func.max(Listing.rooms),
        ).where(active)
    ).one()
    return {
        "cities": [c for c in cities if c],
        "cantons": list(cantons),
        "price_min": price_min,
        "price_max": price_max,
        "rooms_min": rooms_min,
        "rooms_max": rooms_max,
    }


def get_active_listing_by_slug(db: Session, slug: str) -> Listing | None:
    stmt = select(Listing).where(Listing.slug == slug, Listing.active.is_(True))
    return db.scalars(stmt).first()
