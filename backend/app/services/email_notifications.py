"""Quali email partono per ogni evento del sito.

Gli endpoint chiamano solo queste funzioni: qui si decide, per ogni evento,
quale modello usare, a chi (staff e/o cliente) e con quali valori.
"""

import logging

from sqlalchemy.orm import Session

from app.models.contact import ContactMessage
from app.models.order import Order
from app.services import email_service, notification_service
from app.services.email_service import TemplateEmail
from app.services.email_template_defaults import INSTALLMENTS_LINE
from app.services.email_template_service import TEMPLATES
from app.services.i18n import resolve_locale

logger = logging.getLogger(__name__)

PAYMENT_STATUS_LABELS = {
    "pending": "In attesa di pagamento",
    "paid": "Pagato",
    "active": "Abbonamento attivo (pagamento a rate)",
    "past_due": "Rata non riuscita",
    "completed": "Rate completate",
    "cancelled": "Annullato / pagamento non riuscito",
    "refund_pending": "Rimborso in corso",
    "refunded": "Rimborsato",
}


def _customer(email: str | None) -> list[str]:
    return [email] if email else []


def _existing_template(key: str) -> str | None:
    if key not in TEMPLATES:
        logger.warning("Nessun modello email %s", key)
        return None
    return key


# --- Messaggi di contatto -------------------------------------------------


def _contact_values(message: ContactMessage) -> dict[str, str]:
    return {
        "nome": message.first_name,
        "cognome": message.last_name,
        "email": message.email,
        "telefono": message.phone or "-",
        "messaggio": message.message,
        "annuncio": message.listing_reference or "",
    }


def contact_message_received(db: Session, message: ContactMessage) -> None:
    """Notifica allo staff + conferma di ricezione al cliente."""
    values = _contact_values(message)
    suffix = "_listing" if message.listing_reference else ""
    email_service.send(
        db,
        TemplateEmail(
            template_key=f"contact_admin{suffix}",
            to=notification_service.list_recipient_emails(db, "contact"),
            values=values,
            reply_to=message.email,
        ),
        TemplateEmail(
            template_key=f"contact_customer{suffix}",
            to=_customer(message.email),
            values=values,
            locale=message.locale,
        ),
    )


# --- Ordini ---------------------------------------------------------------


def _order_values(order: Order, locale: str | None) -> dict[str, str]:
    has_installments = order.payment_mode == "installments" and order.installments_total is not None
    installments_line = INSTALLMENTS_LINE[resolve_locale(locale)]
    return {
        "totale": str(order.total_chf),
        "rate": installments_line.format(paid=order.installments_paid, total=order.installments_total)
        if has_installments
        else "",
        "rate_pagate": str(order.installments_paid),
        "rate_totali": str(order.installments_total or ""),
        "servizi": "\n".join(
            f"• {item.service_name_snapshot} — CHF {item.price_chf_snapshot}" for item in order.items
        ),
    }


def _staff_order_email(db: Session, order: Order) -> TemplateEmail:
    status_label = PAYMENT_STATUS_LABELS.get(order.payment_status.value, order.payment_status.value)
    values = {**_order_values(order, None), "stato": status_label, "cliente": order.email or "-"}
    return TemplateEmail(
        template_key="order_admin",
        to=notification_service.list_recipient_emails(db, "order"),
        values=values,
        # L'oggetto predefinito usa lo stato in minuscolo ("Ordine pagato: ...").
        subject_values={**values, "stato": status_label.lower(), "cliente": order.email or "utente"},
    )


def _customer_order_email(order: Order, template_key: str) -> TemplateEmail:
    return TemplateEmail(
        template_key=template_key,
        to=_customer(order.email),
        values=_order_values(order, order.locale),
        locale=order.locale,
    )


def _customer_payment_template(order: Order) -> str | None:
    status = order.payment_status.value
    if order.payment_mode == "installments" and status == "cancelled" and order.installments_paid > 0:
        # Un abbonamento interrotto dopo che almeno una rata è già stata
        # incassata non è "nessun addebito effettuato".
        return _existing_template("customer_payment_installments_interrupted")
    return _existing_template(f"customer_payment_{status}")


def order_payment_status_changed(db: Session, order: Order, notify_staff: bool = True) -> None:
    emails: list[TemplateEmail] = [_staff_order_email(db, order)] if notify_staff else []
    key = _customer_payment_template(order)
    if key:
        emails.append(_customer_order_email(order, key))
    email_service.send(db, *emails)


def order_fulfillment_status_changed(db: Session, order: Order) -> None:
    key = _existing_template(f"customer_fulfillment_{order.fulfillment_status.value}")
    if key:
        email_service.send(db, _customer_order_email(order, key))
