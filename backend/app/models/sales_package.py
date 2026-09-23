import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SalesPackage(Base):
    """Pacchetto di vendita acquistabile direttamente (Basic, Medium, ...).

    Stesso pattern di Service: catalogo gestito dall'admin, senza limite al
    numero di pacchetti.
    """

    __tablename__ = "sales_packages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String, unique=True)
    monthly_price_chf: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    # Numero di rate mensili proposto per il pagamento rateale di questo
    # pacchetto (usato per creare l'abbonamento Stripe a cicli fissi).
    installments: Mapped[int] = mapped_column(Integer, default=4)
    # Se false, il pagamento in un'unica soluzione non è offerto per questo
    # pacchetto: solo il rateale.
    allow_single_payment: Mapped[bool] = mapped_column(Boolean, default=True)
    # { "it": {"name": ..., "featuredLabel": ..., "includesLabel": ...,
    #           "features": ["...", ...]}, "en": {...}, "de": {...}, "fr": {...} }
    translations: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class SalesPackagesContent(Base):
    """Testi della pagina "Pacchetti di vendita" (titolo, tabella di
    confronto, note): non include i pacchetti stessi, vedi SalesPackage.
    """

    __tablename__ = "sales_packages_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    translations: Mapped[dict] = mapped_column(JSONB, default=dict)
