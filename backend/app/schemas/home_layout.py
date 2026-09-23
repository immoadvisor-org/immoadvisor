from typing import Literal

from pydantic import BaseModel

HomeSectionKey = Literal["packages", "services", "about", "listings", "how_it_works"]


class HomeSectionInput(BaseModel):
    key: HomeSectionKey
    visible: bool = True


class HomeLayoutRead(BaseModel):
    sections: list[HomeSectionInput]


class HomeLayoutAdminRead(BaseModel):
    sections: list[HomeSectionInput]


class HomeLayoutAdminUpdate(BaseModel):
    sections: list[HomeSectionInput]
