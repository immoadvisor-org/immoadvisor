import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.sales_package import SalesPackage
from app.schemas.sales_package import AdminSalesPackageCreate, AdminSalesPackageUpdate
from app.services.exceptions import SalesPackageInUseError, SalesPackageNotFoundError


def list_all_sales_packages(db: Session) -> list[SalesPackage]:
    stmt = select(SalesPackage).order_by(SalesPackage.display_order, SalesPackage.slug)
    return list(db.scalars(stmt))


def get_sales_package_or_raise(db: Session, package_id: uuid.UUID) -> SalesPackage:
    package = db.get(SalesPackage, package_id)
    if package is None:
        raise SalesPackageNotFoundError(f"Pacchetto {package_id} non trovato")
    return package


def create_sales_package(db: Session, payload: AdminSalesPackageCreate) -> SalesPackage:
    data = payload.model_dump()
    package = SalesPackage(id=uuid.uuid4(), created_at=datetime.now(timezone.utc), **data)
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


def update_sales_package(
    db: Session, package_id: uuid.UUID, payload: AdminSalesPackageUpdate
) -> SalesPackage:
    package = get_sales_package_or_raise(db, package_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(package, field, value)

    db.commit()
    db.refresh(package)
    return package


def delete_sales_package(db: Session, package_id: uuid.UUID) -> None:
    package = get_sales_package_or_raise(db, package_id)
    db.delete(package)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise SalesPackageInUseError(
            "Impossibile eliminare: il pacchetto è presente in ordini esistenti. Disattivalo invece."
        ) from exc


def reorder_sales_packages(db: Session, ordering: list[tuple[uuid.UUID, int]]) -> None:
    for package_id, display_order in ordering:
        get_sales_package_or_raise(db, package_id)
        db.query(SalesPackage).filter(SalesPackage.id == package_id).update(
            {"display_order": display_order}
        )
    db.commit()
