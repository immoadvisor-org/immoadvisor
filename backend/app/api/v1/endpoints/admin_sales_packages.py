import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.sales_package import (
    AdminSalesPackageCreate,
    AdminSalesPackageRead,
    AdminSalesPackageUpdate,
    SalesPackageReorderRequest,
    SalesPackagesContentAdminRead,
    SalesPackagesContentAdminUpdate,
)
from app.services import admin_sales_package_service, sales_packages_service
from app.services.exceptions import SalesPackageInUseError, SalesPackageNotFoundError

router = APIRouter(
    prefix="/admin/sales-packages",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminSalesPackageRead])
def list_sales_packages(db: Session = Depends(get_db)) -> list[AdminSalesPackageRead]:
    packages = admin_sales_package_service.list_all_sales_packages(db)
    return [AdminSalesPackageRead.model_validate(package) for package in packages]


@router.post("", response_model=AdminSalesPackageRead, status_code=status.HTTP_201_CREATED)
def create_sales_package(
    payload: AdminSalesPackageCreate, db: Session = Depends(get_db)
) -> AdminSalesPackageRead:
    package = admin_sales_package_service.create_sales_package(db, payload)
    return AdminSalesPackageRead.model_validate(package)


@router.patch("/{package_id}", response_model=AdminSalesPackageRead)
def update_sales_package(
    package_id: uuid.UUID, payload: AdminSalesPackageUpdate, db: Session = Depends(get_db)
) -> AdminSalesPackageRead:
    try:
        package = admin_sales_package_service.update_sales_package(db, package_id, payload)
    except SalesPackageNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return AdminSalesPackageRead.model_validate(package)


@router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sales_package(package_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    try:
        admin_sales_package_service.delete_sales_package(db, package_id)
    except SalesPackageNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except SalesPackageInUseError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_sales_packages(payload: SalesPackageReorderRequest, db: Session = Depends(get_db)) -> None:
    try:
        admin_sales_package_service.reorder_sales_packages(
            db, [(item.id, item.display_order) for item in payload.items]
        )
    except SalesPackageNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


def _to_content_admin_read(content) -> SalesPackagesContentAdminRead:
    return SalesPackagesContentAdminRead(translations=content.translations or {})


@router.get("/content", response_model=SalesPackagesContentAdminRead)
def get_sales_packages_content(db: Session = Depends(get_db)) -> SalesPackagesContentAdminRead:
    content = sales_packages_service.get_content_row(db)
    return _to_content_admin_read(content)


@router.put("/content", response_model=SalesPackagesContentAdminRead)
def update_sales_packages_content(
    payload: SalesPackagesContentAdminUpdate, db: Session = Depends(get_db)
) -> SalesPackagesContentAdminRead:
    content = sales_packages_service.update_content(db, payload)
    return _to_content_admin_read(content)
