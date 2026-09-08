import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ContactMessageStatus(str, enum.Enum):
    RECEIVED = "received"
    CONTACTED = "contacted"
    TO_RECONTACT = "to_recontact"
    COMPLETED = "completed"


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    message: Mapped[str] = mapped_column(String)
    # Riferimento testuale (non FK) all'annuncio a cui si riferisce la
    # richiesta, se inviata dalla pagina di dettaglio annuncio.
    listing_reference: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[ContactMessageStatus] = mapped_column(
        SAEnum(
            ContactMessageStatus,
            name="contact_message_status",
            values_callable=lambda e: [i.value for i in e],
        ),
        default=ContactMessageStatus.RECEIVED,
    )
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
