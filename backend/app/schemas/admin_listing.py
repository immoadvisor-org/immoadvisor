import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ListingTranslationInput(BaseModel):
    title: str
    short_description: str = ""
    full_description: str = ""


class AdminListingBase(BaseModel):
    slug: str
    city: str
    canton: str | None = None
    price_chf: Decimal
    rooms: Decimal
    active: bool = True
    display_order: int = 0
    translations: dict[str, ListingTranslationInput]
    image_urls: list[str] = []
    video_url: str | None = None


class AdminListingCreate(AdminListingBase):
    pass


class AdminListingUpdate(BaseModel):
    slug: str | None = None
    city: str | None = None
    canton: str | None = None
    price_chf: Decimal | None = None
    rooms: Decimal | None = None
    active: bool | None = None
    display_order: int | None = None
    translations: dict[str, ListingTranslationInput] | None = None
    image_urls: list[str] | None = None
    video_url: str | None = None


class AdminListingRead(AdminListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class ListingReorderItem(BaseModel):
    id: uuid.UUID
    display_order: int


class ListingReorderRequest(BaseModel):
    items: list[ListingReorderItem]


class RemoveListingImageRequest(BaseModel):
    url: str
