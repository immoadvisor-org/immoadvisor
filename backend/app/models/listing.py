import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String, unique=True)
    city: Mapped[str] = mapped_column(String)
    canton: Mapped[str | None] = mapped_column(String, nullable=True)
    price_chf: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    # Numero di locali secondo la convenzione svizzera (es. 4.5), non m².
    rooms: Mapped[Decimal] = mapped_column(Numeric(3, 1))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    # { "it": {"title":..., "short_description":..., "full_description":...}, "en": {...}, ... }
    translations: Mapped[dict] = mapped_column(JSONB, default=dict)
    # URL pubblici delle foto caricate su Supabase Storage, in ordine di visualizzazione
    image_urls: Mapped[list[str]] = mapped_column(JSONB, default=list)
    video_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
