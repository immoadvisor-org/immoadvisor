import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.integrations.email_client import send_customer_payment_status_email, send_order_notification
from app.integrations.stripe_client import (
    construct_webhook_event,
    extract_order_id_from_session,
    limit_subscription_to_fixed_cycles,
)
from app.models.order import OrderPaymentStatus
from app.services import notification_service, order_service
from app.services.exceptions import OrderNotFoundError
from app.services.fulfillment_service import orchestrate_post_payment

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _notify(db: Session, order) -> None:
    recipients = notification_service.list_recipient_emails(db, "order")
    send_order_notification(order, recipients)
    send_customer_payment_status_email(order)


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

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = extract_order_id_from_session(session)
        try:
            order = order_service.get_order(db, order_id)
        except OrderNotFoundError:
            logger.error("Webhook Stripe per ordine inesistente: %s", order_id)
            return {"received": True}

        if session.get("mode") == "subscription":
            # Primo pagamento del piano rateale: l'abbonamento Stripe è
            # appena stato creato in modalità "aperta" (nessun limite di
            # cicli, Checkout non lo supporta in fase di creazione) — lo
            # trasformiamo subito in una Subscription Schedule a numero di
            # rate fisso, così Stripe smette di addebitare da sola a fine
            # mandato.
            subscription_id = session["subscription"]
            schedule = limit_subscription_to_fixed_cycles(subscription_id, order.installments_total)
            order = order_service.activate_installment_order(db, order, subscription_id, schedule["id"])
            orchestrate_post_payment(db, order)
            _notify(db, order)
        else:
            order = order_service.mark_order_paid(db, order, session["payment_intent"])
            orchestrate_post_payment(db, order)
            _notify(db, order)

    elif event_type == "checkout.session.expired":
        session = event["data"]["object"]
        order_id = extract_order_id_from_session(session)
        try:
            order = order_service.get_order(db, order_id)
        except OrderNotFoundError:
            logger.error("Webhook Stripe per ordine inesistente: %s", order_id)
            return {"received": True}

        # Solo un ordine ancora "in attesa" va annullato: se nel frattempo è
        # già stato pagato (evento arrivato in ordine diverso), non toccarlo.
        if order.payment_status == OrderPaymentStatus.PENDING:
            order = order_service.mark_order_cancelled(db, order)
            _notify(db, order)

    elif event_type == "invoice.paid":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")
        if not subscription_id:
            return {"received": True}

        order = order_service.get_order_by_subscription_id(db, subscription_id)
        if order is None:
            logger.error("Webhook Stripe invoice.paid per subscription sconosciuta: %s", subscription_id)
            return {"received": True}

        order, changed = order_service.record_installment_payment(db, order, invoice["id"])
        if changed:
            _notify(db, order)

    elif event_type == "invoice.payment_failed":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")
        if not subscription_id:
            return {"received": True}

        order = order_service.get_order_by_subscription_id(db, subscription_id)
        if order is None:
            logger.error("Webhook Stripe invoice.payment_failed per subscription sconosciuta: %s", subscription_id)
            return {"received": True}

        if order.payment_status == OrderPaymentStatus.ACTIVE:
            order = order_service.mark_installment_past_due(db, order)
            _notify(db, order)

    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        order = order_service.get_order_by_subscription_id(db, subscription["id"])
        if order is None:
            return {"received": True}

        # L'abbonamento termina da solo a rate concluse (end_behavior
        # "cancel" sulla Subscription Schedule): in quel caso l'ordine è
        # già "completed" grazie a invoice.paid e non va toccato. Qui
        # intercettiamo solo la fine anticipata (cancellazione manuale, o
        # rate non riuscite fino all'esaurimento dei tentativi di Stripe).
        if order.payment_status not in (
            OrderPaymentStatus.COMPLETED,
            OrderPaymentStatus.CANCELLED,
            OrderPaymentStatus.REFUNDED,
        ):
            order = order_service.mark_installment_cancelled(db, order)
            _notify(db, order)

    elif event_type == "charge.refunded":
        charge = event["data"]["object"]
        payment_intent = charge.get("payment_intent")
        order = order_service.get_order_by_payment_intent(db, payment_intent) if payment_intent else None
        if order is None:
            logger.error("Webhook Stripe charge.refunded per payment_intent sconosciuto: %s", payment_intent)
            return {"received": True}

        if order.payment_status == OrderPaymentStatus.REFUND_PENDING:
            order = order_service.mark_refunded(db, order)
            _notify(db, order)

    return {"received": True}
