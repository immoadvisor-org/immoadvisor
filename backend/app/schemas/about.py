from pydantic import BaseModel


class AboutTranslationInput(BaseModel):
    title: str
    intro: str
    value1_title: str
    value1_text: str
    value2_title: str
    value2_text: str
    value3_title: str
    value3_text: str
    cta_title: str
    cta_text: str
    cta_button: str


class AboutContentRead(AboutTranslationInput):
    """Contenuto risolto per una singola lingua, quello che consuma il pubblico."""


class AboutContentAdminRead(BaseModel):
    translations: dict[str, AboutTranslationInput]


class AboutContentAdminUpdate(BaseModel):
    translations: dict[str, AboutTranslationInput]
