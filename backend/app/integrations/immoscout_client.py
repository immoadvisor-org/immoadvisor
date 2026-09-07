import logging
from dataclasses import dataclass

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class ListingPayload:
    order_id: str
    title: str
    description: str


class ImmoScoutClient:
    """Client per l'API partner di ImmoScout24.

    Implementazione da completare quando saranno disponibili le credenziali
    partner: la struttura dei metodi rispecchia già il flusso previsto
    (pubblica annuncio dopo il pagamento confermato).
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.immoscout_api_key
        self._base_url = settings.immoscout_api_base_url

    def publish_listing(self, payload: ListingPayload) -> str:
        if not self._api_key:
            logger.warning(
                "IMMOSCOUT_API_KEY non configurata: pubblicazione simulata per ordine %s",
                payload.order_id,
            )
            return "simulated-listing-id"

        raise NotImplementedError(
            "Integrazione reale con l'API ImmoScout24 da implementare "
            "con le credenziali partner."
        )
