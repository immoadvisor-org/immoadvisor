from sqlalchemy import Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HowItWorksContent(Base):
    __tablename__ = "how_it_works_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    # { "it": {"title": ..., "text": ..., "steps": [{"title":..., "text":...}, ...]}, "en": {...}, ... }
    translations: Mapped[dict] = mapped_column(JSONB, default=dict)
