from pydantic import BaseModel


class HowItWorksTranslationInput(BaseModel):
    title: str
    text: str


class HowItWorksContentRead(HowItWorksTranslationInput):
    """Contenuto risolto per una singola lingua, quello che consuma il pubblico."""


class HowItWorksContentAdminRead(BaseModel):
    translations: dict[str, HowItWorksTranslationInput]


class HowItWorksContentAdminUpdate(BaseModel):
    translations: dict[str, HowItWorksTranslationInput]
