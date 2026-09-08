from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.contact import ContactMessageRead, ContactSettingsRead, ContactSettingsUpdate
from app.services import contact_service

router = APIRouter(
    prefix="/admin/contact",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("/settings", response_model=ContactSettingsRead)
def get_settings(db: Session = Depends(get_db)) -> ContactSettingsRead:
    return ContactSettingsRead.model_validate(contact_service.get_settings_row(db))


@router.put("/settings", response_model=ContactSettingsRead)
def update_settings(payload: ContactSettingsUpdate, db: Session = Depends(get_db)) -> ContactSettingsRead:
    return ContactSettingsRead.model_validate(contact_service.update_settings(db, payload))


@router.get("/messages", response_model=list[ContactMessageRead])
def list_messages(db: Session = Depends(get_db)) -> list[ContactMessageRead]:
    messages = contact_service.list_messages(db)
    return [ContactMessageRead.model_validate(m) for m in messages]
