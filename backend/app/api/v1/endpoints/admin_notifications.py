import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.notification import (
    NotificationPurpose,
    NotificationRecipientCreate,
    NotificationRecipientRead,
)
from app.services import notification_service

router = APIRouter(
    prefix="/admin/notifications",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)

VALID_PURPOSES = {"contact", "order"}


def _validate_purpose(purpose: str) -> NotificationPurpose:
    if purpose not in VALID_PURPOSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Categoria non valida")
    return purpose  # type: ignore[return-value]


@router.get("/{purpose}", response_model=list[NotificationRecipientRead])
def list_recipients(purpose: str, db: Session = Depends(get_db)) -> list[NotificationRecipientRead]:
    resolved_purpose = _validate_purpose(purpose)
    recipients = notification_service.list_recipients(db, resolved_purpose)
    return [NotificationRecipientRead.model_validate(r) for r in recipients]


@router.post("/{purpose}", response_model=NotificationRecipientRead, status_code=status.HTTP_201_CREATED)
def add_recipient(
    purpose: str, payload: NotificationRecipientCreate, db: Session = Depends(get_db)
) -> NotificationRecipientRead:
    resolved_purpose = _validate_purpose(purpose)
    recipient = notification_service.add_recipient(db, resolved_purpose, payload.email)
    return NotificationRecipientRead.model_validate(recipient)


@router.delete("/recipient/{recipient_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_recipient(recipient_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    notification_service.remove_recipient(db, recipient_id)
