import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.contact import ContactMessageStatus


class ContactMessageCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    message: str = Field(min_length=1, max_length=5000)
    listing_reference: str | None = Field(default=None, max_length=300)


class ContactMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    phone: str | None
    message: str
    listing_reference: str | None
    status: ContactMessageStatus
    notes: str | None
    created_at: datetime


class ContactMessageAdminUpdate(BaseModel):
    status: ContactMessageStatus | None = None
    notes: str | None = None
