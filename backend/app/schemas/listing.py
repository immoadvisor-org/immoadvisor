import uuid
from decimal import Decimal

from pydantic import BaseModel

from app.models.listing import Listing
from app.services.i18n import translate_listing


class ListingRead(BaseModel):
    id: uuid.UUID
    slug: str
    city: str
    canton: str | None
    price_chf: Decimal
    rooms: Decimal
    title: str
    short_description: str
    full_description: str
    image_urls: list[str]
    video_url: str | None

    @classmethod
    def from_model(cls, listing: Listing, locale: str) -> "ListingRead":
        title, short_description, full_description = translate_listing(listing, locale)
        return cls(
            id=listing.id,
            slug=listing.slug,
            city=listing.city,
            canton=listing.canton,
            price_chf=listing.price_chf,
            rooms=listing.rooms,
            title=title,
            short_description=short_description,
            full_description=full_description,
            image_urls=listing.image_urls or [],
            video_url=listing.video_url,
        )
