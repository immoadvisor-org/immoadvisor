from sqlalchemy import Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HomeLayout(Base):
    """Ordine e visibilità delle sezioni "a blocco" della home page
    (Pacchetti, Servizi, Chi siamo, Annunci, Come funziona): un singleton
    con un array ordinato, gestibile dall'admin. Hero e la sezione di
    contatto finale sono fisse e non fanno parte di questo elenco.
    """

    __tablename__ = "home_layout"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    # [{"key": "packages", "visible": true}, {"key": "services", "visible": true}, ...]
    sections: Mapped[list] = mapped_column(JSONB, default=list)
