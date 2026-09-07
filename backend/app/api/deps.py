from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user
from app.db.session import get_db
from app.models.profile import Profile


def get_current_admin_user(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AuthenticatedUser:
    profile = db.get(Profile, current_user.user_id)
    if profile is None or not profile.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accesso riservato agli amministratori",
        )
    return current_user


__all__ = ["AuthenticatedUser", "get_current_user", "get_current_admin_user", "get_db"]
