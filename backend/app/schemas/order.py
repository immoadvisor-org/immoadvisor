import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    service_id: uuid.UUID
    service_name_snapshot: str
    price_chf_snapshot: Decimal


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: OrderStatus
    total_chf: Decimal
    created_at: datetime
    items: list[OrderItemRead]


class CheckoutSessionCreate(BaseModel):
    service_ids: list[uuid.UUID] = Field(min_length=1)
    locale: str | None = None


class CheckoutSessionRead(BaseModel):
    order_id: uuid.UUID
    checkout_url: str
