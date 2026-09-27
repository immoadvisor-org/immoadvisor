from pydantic import BaseModel, ConfigDict


class PageIntroSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    show_configurator_intro: bool
    show_listings_intro: bool


class PageIntroSettingsUpdate(BaseModel):
    show_configurator_intro: bool
    show_listings_intro: bool
