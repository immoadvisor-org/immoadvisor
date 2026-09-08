from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ListingsSettings(Base):
    __tablename__ = "listings_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    # Interruttore generale: se falso, la sezione Annunci non compare né nel
    # menu né in home, indipendentemente dal fatto che esistano annunci attivi.
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
