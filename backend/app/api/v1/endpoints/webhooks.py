import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.integrations.stripe_client import construct_webhook_event, extract_order_id_from_session
from app.models.order import OrderStatus
from app.services import order_service
from app.services.exceptions import OrderNotFoundError
from app.services.fulfillment_service import orchestrate_post_payment

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)) -> dict[str, bool]:
    payload = await request.body()
    signature_header = request.headers.get("stripe-signature", "")

    try:
        event = construct_webhook_event(payload, signature_header)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook non valido"
        ) from exc

    if event["type"] in ("checkout.session.completed", "checkout.session.expired"):
        session = event["data"]["object"]
        order_id = extract_order_id_from_session(session)

        try:
            order = order_service.get_order(db, order_id)
        except OrderNotFoundError:
            logger.error("Webhook Stripe per ordine inesistente: %s", order_id)
            return {"received": True}

        if event["type"] == "checkout.session.completed":
            order = order_service.mark_order_paid(db, order, session["payment_intent"])
            orchestrate_post_payment(db, order)
        elif order.status == OrderStatus.PENDING:
            # Solo un ordine ancora "in attesa" va annullato: se nel frattempo è
            # già stato pagato (evento arrivato in ordine diverso), non toccarlo.
            order_service.mark_order_cancelled(db, order)

    return {"received": True}
