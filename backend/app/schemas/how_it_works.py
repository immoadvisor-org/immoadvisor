from pydantic import BaseModel


class HowItWorksTranslationInput(BaseModel):
    title: str
    text: str


class HowItWorksContentRead(HowItWorksTranslationInput):
    """Contenuto risolto per una singola lingua, quello che consuma il pubblico."""

    background_image_url: str | None = None


class HowItWorksContentAdminRead(BaseModel):
    translations: dict[str, HowItWorksTranslationInput]
    background_image_url: str | None = None


class HowItWorksContentAdminUpdate(BaseModel):
    translations: dict[str, HowItWorksTranslationInput]
