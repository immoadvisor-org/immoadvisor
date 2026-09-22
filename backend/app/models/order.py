import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderPaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"
    # Rimborso richiesto su Stripe, in attesa di conferma via webhook.
    REFUND_PENDING = "refund_pending"
    REFUNDED = "refunded"
    # Stati specifici del pagamento rateale (payment_mode = "installments"):
    # "active" mentre le rate vengono addebitate con successo, "past_due" se
    # una rata non va a buon fine (Stripe la ritenta automaticamente),
    # "completed" quando tutte le rate sono state incassate.
    ACTIVE = "active"
    PAST_DUE = "past_due"
    COMPLETED = "completed"


class OrderFulfillmentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("profiles.id")
    )
    # Snapshot dell'email del cliente al momento dell'ordine: permette di
    # elencare gli ordini in admin senza dover interrogare lo schema auth,
    # e resta corretta anche se l'utente cambia poi la propria email.
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    # Stato del pagamento (gestito dal sistema via Stripe: checkout e
    # rimborsi) e stato di lavorazione dell'ordine (gestito manualmente
    # dall'admin) sono concetti separati: un ordine pagato può essere "in
    # lavorazione" o "completato" indipendentemente da un eventuale rimborso
    # successivo.
    payment_status: Mapped[OrderPaymentStatus] = mapped_column(
        SAEnum(
            OrderPaymentStatus, name="order_payment_status", values_callable=lambda e: [i.value for i in e]
        ),
        default=OrderPaymentStatus.PENDING,
    )
    fulfillment_status: Mapped[OrderFulfillmentStatus] = mapped_column(
        SAEnum(
            OrderFulfillmentStatus,
            name="order_fulfillment_status",
            values_callable=lambda e: [i.value for i in e],
        ),
        default=OrderFulfillmentStatus.PENDING,
    )
    total_chf: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    stripe_session_id: Mapped[str | None] = mapped_column(String, nullable=True)
    stripe_payment_intent: Mapped[str | None] = mapped_column(String, nullable=True)
    stripe_refund_id: Mapped[str | None] = mapped_column(String, nullable=True)
    # Pagamento rateale (abbonamento Stripe a N cicli fissi): "single" è il
    # pagamento in un'unica soluzione di sempre, "installments" quello a
    # rate. Gli altri campi sotto sono popolati solo per "installments".
    payment_mode: Mapped[str] = mapped_column(String, default="single")
    installments_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    installments_paid: Mapped[int] = mapped_column(Integer, default=0)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String, nullable=True)
    stripe_subscription_schedule_id: Mapped[str | None] = mapped_column(String, nullable=True)
    # Id dell'ultima fattura Stripe già elaborata: evita di contare due
    # volte la stessa rata se un webhook viene consegnato più di una volta.
    stripe_last_invoice_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"))
    # Una riga d'ordine referenzia esattamente uno dei due (mai entrambi,
    # mai nessuno) — vincolo imposto a livello di database, vedi migration
    # 018_order_items_packages.sql.
    service_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("services.id"), nullable=True
    )
    package_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sales_packages.id"), nullable=True
    )
    service_name_snapshot: Mapped[str] = mapped_column(String)
    price_chf_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    order: Mapped[Order] = relationship(back_populates="items")
