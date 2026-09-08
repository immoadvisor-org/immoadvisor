from pydantic import BaseModel, ConfigDict


class ListingsSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enabled: bool


class ListingsSettingsUpdate(BaseModel):
    enabled: bool
