import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.integrations.immoscout_client import ImmoScoutClient, ListingPayload
from app.models.order import Order
from app.models.service import Service

logger = logging.getLogger(__name__)

# Gli slug dei servizi che attivano la pubblicazione automatica su ImmoScout24.
IMMOSCOUT_TRIGGER_SLUGS = {"annuncio-immoscout"}


def orchestrate_post_payment(db: Session, order: Order) -> None:
    """Avvia i fulfillment automatici dei servizi acquistati in un ordine pagato.

    Ogni servizio ha un proprio "fulfillment": alcuni sono automatizzabili
    (pubblicazione annuncio), altri restano attività manuali per Carmine
    (es. sopralluogo fotografico) e qui vengono solo tracciati/loggati.
    """
    # Le righe d'ordine per un pacchetto (item.service_id is None) non hanno
    # un fulfillment automatico dedicato: solo i servizi a la carte lo
    # attivano.
    service_ids = [item.service_id for item in order.items if item.service_id is not None]
    purchased_slugs = set(
        db.scalars(select(Service.slug).where(Service.id.in_(service_ids)))
    ) if service_ids else set()

    if purchased_slugs & IMMOSCOUT_TRIGGER_SLUGS:
        client = ImmoScoutClient()
        listing_id = client.publish_listing(
            ListingPayload(
                order_id=str(order.id),
                title=f"Annuncio per ordine {order.id}",
                description="Generato automaticamente dopo conferma pagamento.",
            )
        )
        logger.info("Annuncio ImmoScout24 pubblicato: %s (ordine %s)", listing_id, order.id)

    logger.info("Fulfillment avviato per ordine %s con %d servizi", order.id, len(order.items))
