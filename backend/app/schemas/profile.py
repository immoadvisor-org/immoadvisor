import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.notification import NotificationPurpose


class ProfileRead(BaseModel):
    id: uuid.UUID
    email: str | None
    first_name: str | None
    last_name: str | None
    phone: str | None
    address_line: str | None
    postal_code: str | None
    city: str | None
    canton: str | None
    avs_number: str | None
    is_admin: bool
    created_at: datetime


class AdminCreate(BaseModel):
    """Nuovo amministratore: se l'email esiste già, quell'account viene
    promosso ad admin e la password viene ignorata."""

    email: EmailStr
    password: str | None = Field(default=None, min_length=8)
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    # Email dello staff da ricevere: "order" (ordini/pagamenti), "contact" (messaggi).
    subscriptions: list[NotificationPurpose] = []


class AdminRead(BaseModel):
    id: uuid.UUID
    email: str | None
    first_name: str | None
    last_name: str | None
    subscriptions: list[NotificationPurpose]


class AdminSubscriptionsUpdate(BaseModel):
    subscriptions: list[NotificationPurpose]
