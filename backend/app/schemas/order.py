import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderFulfillmentStatus, OrderPaymentStatus


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    service_id: uuid.UUID
    service_name_snapshot: str
    price_chf_snapshot: Decimal


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    payment_status: OrderPaymentStatus
    fulfillment_status: OrderFulfillmentStatus
    total_chf: Decimal
    created_at: datetime
    items: list[OrderItemRead]


class AdminOrderRead(OrderRead):
    email: str | None


class FulfillmentStatusUpdate(BaseModel):
    status: OrderFulfillmentStatus


class CheckoutSessionCreate(BaseModel):
    service_ids: list[uuid.UUID] = Field(min_length=1)
    locale: str | None = None


class CheckoutSessionRead(BaseModel):
    order_id: uuid.UUID
    checkout_url: str
