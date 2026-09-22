import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderFulfillmentStatus, OrderItem, OrderPaymentStatus
from app.models.sales_package import SalesPackage
from app.models.service import Service
from app.services.exceptions import (
    InvalidFulfillmentTransitionError,
    OrderNotFoundError,
    OrderNotRefundableError,
    SalesPackageNotFoundError,
    ServiceNotFoundError,
)
from app.services.i18n import translate_sales_package, translate_service


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


def create_pending_order_for_package(
    db: Session,
    user_id: uuid.UUID,
    package_id: uuid.UUID,
    locale: str,
    payment_mode: str,
    email: str | None = None,
) -> Order:
    package = db.get(SalesPackage, package_id)
    if package is None or not package.active:
        raise SalesPackageNotFoundError(f"Pacchetto {package_id} non trovato o non attivo")

    is_installments = payment_mode == "installments"
    # Il totale del contratto è sempre rata x numero di rate, sia che lo si
    # paghi a rate sia che lo si paghi in un'unica soluzione: cambia solo
    # COME viene addebitato, non l'importo complessivo dovuto.
    total_contract_value = package.monthly_price_chf * package.installments

    now = datetime.now(timezone.utc)
    order = Order(
        id=uuid.uuid4(),
        user_id=user_id,
        email=email,
        payment_status=OrderPaymentStatus.PENDING,
        fulfillment_status=OrderFulfillmentStatus.PENDING,
        total_chf=total_contract_value,
        payment_mode=payment_mode,
        installments_total=package.installments if is_installments else None,
        created_at=now,
        updated_at=now,
    )
    order.items = [
        OrderItem(
            id=uuid.uuid4(),
            package_id=package.id,
            service_name_snapshot=translate_sales_package(package, locale)["name"],
            # Per il rateale questo è l'importo di UNA rata (passato a
            # Stripe come price ricorrente mensile). Per il pagamento in
            # un'unica soluzione è invece l'intero importo da addebitare
            # subito: qui NON deve mai restare il prezzo mensile da solo,
            # altrimenti si addebiterebbe una sola rata invece del totale.
            price_chf_snapshot=package.monthly_price_chf if is_installments else total_contract_value,
            created_at=now,
        )
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


def get_order_by_subscription_id(db: Session, subscription_id: str) -> Order | None:
    stmt = (
        select(Order)
        .where(Order.stripe_subscription_id == subscription_id)
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
    # Per un ordine a rate il lavoro può iniziare non appena la prima rata è
    # stata incassata ("active"), senza aspettare che tutte le rate siano
    # state pagate ("completed").
    _PAYABLE_STATUSES = (OrderPaymentStatus.PAID, OrderPaymentStatus.ACTIVE, OrderPaymentStatus.COMPLETED)
    if new_status == OrderFulfillmentStatus.PROCESSING and order.payment_status not in _PAYABLE_STATUSES:
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


# ---------------------------------------------------------------------------
# Ciclo di vita del pagamento rateale (payment_mode = "installments")
# ---------------------------------------------------------------------------


def activate_installment_order(
    db: Session, order: Order, subscription_id: str, subscription_schedule_id: str
) -> Order:
    """Collega l'abbonamento Stripe all'ordine, appena la prima rata è
    stata pagata (evento checkout.session.completed). Il conteggio delle
    rate pagate viene invece incrementato solo da invoice.paid (anche per
    la prima), per non contarla due volte.
    """
    order.payment_status = OrderPaymentStatus.ACTIVE
    order.stripe_subscription_id = subscription_id
    order.stripe_subscription_schedule_id = subscription_schedule_id
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


def record_installment_payment(db: Session, order: Order, invoice_id: str) -> tuple[Order, bool]:
    """Registra l'incasso di una rata. Idempotente rispetto a `invoice_id`:
    se la stessa fattura viene notificata più volte (consegna ripetuta del
    webhook Stripe) non viene contata due volte.

    Restituisce l'ordine aggiornato e True se questa chiamata ha davvero
    incrementato il conteggio (per decidere se inviare le notifiche).
    """
    if order.stripe_last_invoice_id == invoice_id:
        return order, False

    order.installments_paid += 1
    order.stripe_last_invoice_id = invoice_id
    if order.installments_total is not None and order.installments_paid >= order.installments_total:
        order.payment_status = OrderPaymentStatus.COMPLETED
    else:
        order.payment_status = OrderPaymentStatus.ACTIVE
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order, True


def mark_installment_past_due(db: Session, order: Order) -> Order:
    order.payment_status = OrderPaymentStatus.PAST_DUE
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order


def mark_installment_cancelled(db: Session, order: Order) -> Order:
    order.payment_status = OrderPaymentStatus.CANCELLED
    order.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)
    return order
