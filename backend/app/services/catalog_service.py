from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sales_package import SalesPackage
from app.models.service import Service


def list_active_services(db: Session) -> list[Service]:
    stmt = select(Service).where(Service.active.is_(True)).order_by(Service.display_order, Service.slug)
    return list(db.scalars(stmt))


def list_active_sales_packages(db: Session) -> list[SalesPackage]:
    stmt = (
        select(SalesPackage)
        .where(SalesPackage.active.is_(True))
        .order_by(SalesPackage.display_order, SalesPackage.slug)
    )
    return list(db.scalars(stmt))
