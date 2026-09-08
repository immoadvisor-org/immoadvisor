import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.integrations.email_client import send_customer_item_status_email, send_customer_order_status_email
from app.schemas.order import AdminOrderRead, OrderItemStatusUpdate, OrderStatusUpdate
from app.services import order_service
from app.services.exceptions import OrderItemNotFoundError, OrderNotFoundError

router = APIRouter(
    prefix="/admin/orders",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminOrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[AdminOrderRead]:
    orders = order_service.list_all_orders(db)
    return [AdminOrderRead.model_validate(order) for order in orders]


@router.patch("/{order_id}/status", response_model=AdminOrderRead)
def update_order_status(
    order_id: uuid.UUID, payload: OrderStatusUpdate, db: Session = Depends(get_db)
) -> AdminOrderRead:
    try:
        order = order_service.get_order(db, order_id)
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    order = order_service.update_order_status(db, order, payload.status)
    send_customer_order_status_email(order)
    return AdminOrderRead.model_validate(order)


@router.patch("/{order_id}/items/{item_id}/status", response_model=AdminOrderRead)
def update_order_item_status(
    order_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: OrderItemStatusUpdate,
    db: Session = Depends(get_db),
) -> AdminOrderRead:
    try:
        item = order_service.get_order_item(db, item_id)
    except OrderItemNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    if item.order_id != order_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servizio d'ordine non trovato")

    item = order_service.update_order_item_status(db, item, payload.status)
    send_customer_item_status_email(item.order, item)
    return AdminOrderRead.model_validate(item.order)
