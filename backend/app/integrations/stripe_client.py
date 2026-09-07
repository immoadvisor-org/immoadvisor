import uuid

import stripe

from app.core.config import get_settings
from app.models.order import Order

settings = get_settings()
stripe.api_key = settings.stripe_secret_key


def create_checkout_session(order: Order) -> stripe.checkout.Session:
    line_items = [
        {
            "price_data": {
                "currency": "chf",
                "unit_amount": int(item.price_chf_snapshot * 100),
                "product_data": {"name": item.service_name_snapshot},
            },
            "quantity": 1,
        }
        for item in order.items
    ]

    return stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        # Google Pay/Apple Pay non sono tipi separati: Stripe li mostra
        # automaticamente dentro "card" quando browser/dispositivo li supportano.
        payment_method_types=["card", "twint", "paypal"],
        success_url=f"{settings.frontend_url}/account/orders?checkout=success&order_id={order.id}",
        cancel_url=f"{settings.frontend_url}/cart?checkout=cancelled",
        client_reference_id=str(order.id),
        metadata={"order_id": str(order.id)},
    )


def construct_webhook_event(payload: bytes, signature_header: str) -> stripe.Event:
    return stripe.Webhook.construct_event(
        payload, signature_header, settings.stripe_webhook_secret
    )


def extract_order_id_from_session(session: stripe.checkout.Session) -> uuid.UUID:
    return uuid.UUID(session["client_reference_id"])
