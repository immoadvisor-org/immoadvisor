import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class TranslationInput(BaseModel):
    name: str
    description: str = ""


class AdminServiceBase(BaseModel):
    slug: str
    category: str = "generico"
    price_chf: Decimal
    active: bool = True
    display_order: int = 0
    translations: dict[str, TranslationInput]
    image_urls: list[str] = []


class AdminServiceCreate(AdminServiceBase):
    pass


class AdminServiceUpdate(BaseModel):
    slug: str | None = None
    category: str | None = None
    price_chf: Decimal | None = None
    active: bool | None = None
    display_order: int | None = None
    translations: dict[str, TranslationInput] | None = None
    image_urls: list[str] | None = None


class AdminServiceRead(AdminServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class ReorderItem(BaseModel):
    id: uuid.UUID
    display_order: int


class ReorderRequest(BaseModel):
    items: list[ReorderItem]


class RemoveImageRequest(BaseModel):
    url: str
