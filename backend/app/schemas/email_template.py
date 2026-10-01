from typing import Literal

from pydantic import BaseModel

EmailTemplateGroup = Literal["signature", "admin", "customer_contact", "customer_payment", "customer_fulfillment"]


class EmailTemplateAdminRead(BaseModel):
    key: str
    group: EmailTemplateGroup
    # La firma non ha oggetto: subject e default_subject restano None.
    subject: str | None
    body: str
    show_logo: bool
    default_subject: str | None
    default_body: str
    placeholders: list[str]
    is_customized: bool


class EmailTemplateUpdate(BaseModel):
    subject: str | None = None
    body: str
    show_logo: bool = True


class EmailPreviewRead(BaseModel):
    subject: str | None
    html: str
