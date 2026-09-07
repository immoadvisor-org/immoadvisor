import uuid
from decimal import Decimal

from pydantic import BaseModel

from app.models.service import Service
from app.services.i18n import translate_service


class ServiceRead(BaseModel):
    id: uuid.UUID
    slug: str
    category: str
    price_chf: Decimal
    name: str
    description: str
    image_urls: list[str]

    @classmethod
    def from_model(cls, service: Service, locale: str) -> "ServiceRead":
        name, description = translate_service(service, locale)
        return cls(
            id=service.id,
            slug=service.slug,
            category=service.category,
            price_chf=service.price_chf,
            name=name,
            description=description,
            image_urls=service.image_urls or [],
        )
