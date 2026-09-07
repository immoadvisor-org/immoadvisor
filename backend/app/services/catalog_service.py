from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.service import Service


def list_active_services(db: Session) -> list[Service]:
    stmt = select(Service).where(Service.active.is_(True)).order_by(Service.display_order, Service.slug)
    return list(db.scalars(stmt))
