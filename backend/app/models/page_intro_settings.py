from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PageIntroSettings(Base):
    __tablename__ = "page_intro_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    # Interruttori indipendenti: se falsi, la pagina corrispondente nasconde
    # solo il banner introduttivo (hero), il contenuto sottostante resta invariato.
    show_configurator_intro: Mapped[bool] = mapped_column(Boolean, default=True)
    show_listings_intro: Mapped[bool] = mapped_column(Boolean, default=True)
