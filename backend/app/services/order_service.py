import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderFulfillmentStatus, OrderItem, OrderPaymentStatus
from app.models.service import Service
from app.services.exceptions import (
    InvalidFulfillmentTransitionError,
    OrderNotFoundError,
    OrderNotRefundableError,
    ServiceNotFoundError,
)
from app.services.i18n import translate_service


def create_pending_order(
    db: Session,
    user_id: uuid.UUID,
    service_ids: list[uuid.UUID],
    locale: str,
    email: str | None = None,
) -> Order:
    unique_ids = list(dict.fromkeys(service_ids))
    services = list(
        db.scalars(select(Service).where(Service.id.in_(unique_ids), Service.active.is_(True)))
    )
    found_ids = {service.id for service in services}
    missing = set(unique_ids) - found_ids
    if missing:
        raise ServiceNotFoundError(f"Servizi non trovati o non attivi: {missing}")

    now = datetime.now(timezone.utc)
    total = sum((service.price_chf for service in services), start=0)

    order = Order(
        id=uuid.uuid4(),
        user_id=user_id,
        email=email,
        payment_status=OrderPaymentStatus.PENDING,
        fulfillment_status=OrderFulfillmentStatus.PENDING,
        total_chf=total,
        created_at=now,
        updated_at=now,
    )
    order.items = [
        OrderItem(
            id=uuid.uuid4(),
            service_id=service.id,
            service_name_snapshot=translate_service(service, locale)[0],
            price_chf_snapshot=service.price_chf,
            created_at=now,
        )
        for service in services
    ]

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, order_id: uuid.UUID) -> Order:
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
    )
    order = db.scalars(stmt).first()
    if order is None:
        raise OrderNotFoundError(f"Ordine {order_id} non trovato")
    return order


def get_order_by_payment_intent(db: Session, payment_intent: str) -> Order | None:
    stmt = (
        select(Order)
        .where(Order.stripe_payment_intent == payment_intent)
        .options(selectinload(Order.items))
    )
    return db.scalars(stmt).first()


def list_all_orders(db: Session) -> list[Order]:
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return list(db.scalars(stmt))


def get_orders_for_user(db: Session, user_id: uuid.UUID) -> list[Order]:
    stmt = (
        select(Order)
        .where(Order.user_id == user_id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return list(db.scalars(stmt))


def attach_stripe_session(db: Session, order: Order, stripe_session_id: str) -> Order:
    order.stripe_session_id = stripe_session_id
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


def mark_order_paid(db: Session, order: Order, stripe_payment_intent: str) -> Order:
    order.payment_status = OrderPaymentStatus.PAID
    order.stripe_payment_intent = stripe_payment_intent
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


def mark_order_cancelled(db: Session, order: Order) -> Order:
    order.payment_status = OrderPaymentStatus.CANCELLED
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


# Percorso di lavorazione a senso unico: "pending" è solo lo stato di
# partenza implicito (mai impostabile esplicitamente), da qui si può solo
# avanzare verso "processing" e poi "completed" — mai retrocedere, per non
# generare notifiche email contraddittorie al cliente.
_FULFILLMENT_PREREQUISITE = {
    OrderFulfillmentStatus.PROCESSING: OrderFulfillmentStatus.PENDING,
    OrderFulfillmentStatus.COMPLETED: OrderFulfillmentStatus.PROCESSING,
}


def update_fulfillment_status(
    db: Session, order: Order, new_status: OrderFulfillmentStatus
) -> Order:
    required_previous = _FULFILLMENT_PREREQUISITE.get(new_status)
    if required_previous is None or order.fulfillment_status != required_previous:
        raise InvalidFulfillmentTransitionError(
            f"Impossibile passare l'ordine {order.id} da "
            f"{order.fulfillment_status.value} a {new_status.value}"
        )
    if new_status == OrderFulfillmentStatus.PROCESSING and order.payment_status != OrderPaymentStatus.PAID:
        raise InvalidFulfillmentTransitionError(
            f"L'ordine {order.id} deve essere pagato prima di essere preso in carico"
        )

    order.fulfillment_status = new_status
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


def mark_refund_pending(db: Session, order: Order, stripe_refund_id: str) -> Order:
    if order.payment_status != OrderPaymentStatus.PAID:
        raise OrderNotRefundableError(
            f"L'ordine {order.id} non è rimborsabile nello stato {order.payment_status.value}"
        )
    order.payment_status = OrderPaymentStatus.REFUND_PENDING
    order.stripe_refund_id = stripe_refund_id
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


def mark_refunded(db: Session, order: Order) -> Order:
    order.payment_status = OrderPaymentStatus.REFUNDED
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order
