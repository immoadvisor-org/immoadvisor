from fastapi import APIRouter, Depends, status

from app.api.deps import AuthenticatedUser, get_current_user
from app.integrations.supabase_auth_admin import delete_user

router = APIRouter(prefix="/account", tags=["account"])


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(current_user: AuthenticatedUser = Depends(get_current_user)) -> None:
    delete_user(current_user.user_id)
