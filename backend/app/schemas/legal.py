from pydantic import BaseModel


class LegalTranslationInput(BaseModel):
    content: str


class LegalContentRead(LegalTranslationInput):
    """Contenuto risolto per una singola lingua, quello che consuma il pubblico."""


class LegalContentAdminRead(BaseModel):
    translations: dict[str, LegalTranslationInput]


class LegalContentAdminUpdate(BaseModel):
    translations: dict[str, LegalTranslationInput]
