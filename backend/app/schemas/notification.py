import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr

NotificationPurpose = Literal["contact", "order"]


class NotificationRecipientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str


class NotificationRecipientCreate(BaseModel):
    email: EmailStr
