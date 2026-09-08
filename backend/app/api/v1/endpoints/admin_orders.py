import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.integrations.email_client import send_customer_payment_status_email, send_customer_fulfillment_status_email
from app.integrations.stripe_client import create_refund
from app.models.order import OrderPaymentStatus
from app.schemas.order import AdminOrderRead, FulfillmentStatusUpdate
from app.services import order_service
from app.services.exceptions import OrderNotFoundError

router = APIRouter(
    prefix="/admin/orders",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminOrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[AdminOrderRead]:
    orders = order_service.list_all_orders(db)
    return [AdminOrderRead.model_validate(order) for order in orders]


@router.get("/{order_id}", response_model=AdminOrderRead)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)) -> AdminOrderRead:
    try:
        order = order_service.get_order(db, order_id)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AdminOrderRead.model_validate(order)


@router.patch("/{order_id}/fulfillment-status", response_model=AdminOrderRead)
def update_fulfillment_status(
    order_id: uuid.UUID, payload: FulfillmentStatusUpdate, db: Session = Depends(get_db)
) -> AdminOrderRead:
    try:
        order = order_service.get_order(db, order_id)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    order = order_service.update_fulfillment_status(db, order, payload.status)
    send_customer_fulfillment_status_email(order)
    return AdminOrderRead.model_validate(order)


@router.post("/{order_id}/refund", response_model=AdminOrderRead)
def refund_order(order_id: uuid.UUID, db: Session = Depends(get_db)) -> AdminOrderRead:
    try:
        order = order_service.get_order(db, order_id)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    if order.payment_status != OrderPaymentStatus.PAID or not order.stripe_payment_intent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo un ordine pagato può essere rimborsato",
        )

    refund = create_refund(order.stripe_payment_intent)
    order = order_service.mark_refund_pending(db, order, refund.id)
    send_customer_payment_status_email(order)
    return AdminOrderRead.model_validate(order)
