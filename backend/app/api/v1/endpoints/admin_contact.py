import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.contact import ContactMessageAdminUpdate, ContactMessageRead
from app.services import contact_service
from app.services.exceptions import ContactMessageNotFoundError

router = APIRouter(
    prefix="/admin/contact",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("/messages", response_model=list[ContactMessageRead])
def list_messages(db: Session = Depends(get_db)) -> list[ContactMessageRead]:
    messages = contact_service.list_messages(db)
    return [ContactMessageRead.model_validate(m) for m in messages]


@router.patch("/messages/{message_id}", response_model=ContactMessageRead)
def update_message(
    message_id: uuid.UUID, payload: ContactMessageAdminUpdate, db: Session = Depends(get_db)
) -> ContactMessageRead:
    try:
        message = contact_service.update_message(db, message_id, payload)
    except ContactMessageNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ContactMessageRead.model_validate(message)
