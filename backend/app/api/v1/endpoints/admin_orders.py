from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.order import AdminOrderRead
from app.services import order_service

router = APIRouter(
    prefix="/admin/orders",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminOrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[AdminOrderRead]:
    orders = order_service.list_all_orders(db)
    return [AdminOrderRead.model_validate(order) for order in orders]
