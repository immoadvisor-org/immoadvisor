from sqlalchemy import Boolean, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HowItWorksContent(Base):
    __tablename__ = "how_it_works_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    # Se false, la sezione non viene mostrata in home (stessa impostazione
    # per tutte le lingue).
    visible: Mapped[bool] = mapped_column(Boolean, default=True)
    # { "it": {"title": ..., "text": ..., "steps": [{"title":..., "text":...}, ...]}, "en": {...}, ... }
    translations: Mapped[dict] = mapped_column(JSONB, default=dict)
