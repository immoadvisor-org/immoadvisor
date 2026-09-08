import uuid
from datetime import datetime

from pydantic import BaseModel


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
