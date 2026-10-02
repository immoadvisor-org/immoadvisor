from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmailTemplate(Base):
    """Testo personalizzato di una email in una lingua: esiste una riga solo
    per i modelli modificati dall'admin, gli altri usano il testo predefinito
    nel codice."""

    __tablename__ = "email_templates"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    locale: Mapped[str] = mapped_column(String, primary_key=True)
    subject: Mapped[str | None] = mapped_column(String, nullable=True)
    body: Mapped[str] = mapped_column(Text)
    # Usato solo dalla firma: mostra il logo sopra il testo.
    show_logo: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
