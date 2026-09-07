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
