from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthenticatedUser, get_current_user, get_db
from app.integrations.stripe_client import create_checkout_session, create_installment_checkout_session
from app.schemas.order import (
    CheckoutSessionCreate,
    CheckoutSessionRead,
    PackageCheckoutSessionCreate,
)
from app.services import order_service
from app.services.exceptions import SalesPackageNotFoundError, ServiceNotFoundError
from app.services.i18n import resolve_locale

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/session", response_model=CheckoutSessionRead)
def create_session(
    payload: CheckoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> CheckoutSessionRead:
    resolved_locale = resolve_locale(payload.locale)
    try:
        order = order_service.create_pending_order(
            db, current_user.user_id, payload.service_ids, resolved_locale, current_user.email
        )
    except ServiceNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    stripe_session = create_checkout_session(order)
    order_service.attach_stripe_session(db, order, stripe_session.id)

    return CheckoutSessionRead(order_id=order.id, checkout_url=stripe_session.url)


@router.post("/package-session", response_model=CheckoutSessionRead)
def create_package_session(
    payload: PackageCheckoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> CheckoutSessionRead:
    resolved_locale = resolve_locale(payload.locale)
    try:
        order = order_service.create_pending_order_for_package(
            db,
            current_user.user_id,
            payload.package_id,
            resolved_locale,
            payload.payment_mode,
            current_user.email,
        )
    except SalesPackageNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if payload.payment_mode == "installments":
        item = order.items[0]
        stripe_session = create_installment_checkout_session(
            order, item.service_name_snapshot, item.price_chf_snapshot
        )
    else:
        stripe_session = create_checkout_session(order)
    order_service.attach_stripe_session(db, order, stripe_session.id)

    return CheckoutSessionRead(order_id=order.id, checkout_url=stripe_session.url)
