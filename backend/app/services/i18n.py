from app.models.listing import Listing
from app.models.service import Service

SUPPORTED_LOCALES: tuple[str, ...] = ("en", "it", "de", "fr")
DEFAULT_LOCALE = "it"


def resolve_locale(requested: str | None) -> str:
    if requested in SUPPORTED_LOCALES:
        return requested
    return DEFAULT_LOCALE


def translate_service(service: Service, locale: str) -> tuple[str, str]:
    """Nome e descrizione del servizio nella lingua richiesta.

    Fallback: lingua richiesta -> lingua di default -> qualunque
    traduzione disponibile -> slug (garantisce sempre un nome non vuoto).
    """
    translations = service.translations or {}

    for candidate in (locale, DEFAULT_LOCALE, *SUPPORTED_LOCALES):
        entry = translations.get(candidate)
        if entry and entry.get("name"):
            return entry["name"], entry.get("description", "")

    return service.slug, ""


def translate_listing(listing: Listing, locale: str) -> tuple[str, str, str]:
    """Titolo, descrizione breve ed estesa dell'annuncio nella lingua
    richiesta, con lo stesso fallback di translate_service.
    """
    translations = listing.translations or {}

    for candidate in (locale, DEFAULT_LOCALE, *SUPPORTED_LOCALES):
        entry = translations.get(candidate)
        if entry and entry.get("title"):
            return entry["title"], entry.get("short_description", ""), entry.get("full_description", "")

    return listing.slug, "", ""


def resolve_translation_entry(translations: dict, locale: str) -> dict | None:
    """Voce di un blob { lingua: {...} } per la lingua richiesta, con lo
    stesso fallback di translate_service: richiesta -> default -> qualunque
    disponibile. Usato per contenuti dinamici diversi dai servizi (es. Chi siamo).
    """
    for candidate in (locale, DEFAULT_LOCALE, *SUPPORTED_LOCALES):
        entry = translations.get(candidate)
        if entry:
            return entry
    return None
