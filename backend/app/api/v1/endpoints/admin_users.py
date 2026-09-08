import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.integrations.supabase_auth_admin import delete_user
from app.schemas.profile import ProfileRead
from app.services import admin_user_service

router = APIRouter(
    prefix="/admin/users",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[ProfileRead])
def list_users(db: Session = Depends(get_db)) -> list[ProfileRead]:
    return admin_user_service.list_users(db)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(user_id: uuid.UUID) -> None:
    delete_user(user_id)
