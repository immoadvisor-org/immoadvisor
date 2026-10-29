import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthenticatedUser, get_current_admin_user, get_db
from app.integrations.supabase_auth_admin import EmailAlreadyRegisteredError, create_user, delete_user
from app.schemas.profile import AdminCreate, AdminRead, AdminSubscriptionsUpdate, ProfileRead
from app.services import admin_user_service, notification_service

router = APIRouter(
    prefix="/admin/users",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("/admins", response_model=list[AdminRead])
def list_admins(db: Session = Depends(get_db)) -> list[AdminRead]:
    return [
        AdminRead(
            id=u.id,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            subscriptions=notification_service.subscriptions_for(db, u.email) if u.email else [],
        )
        for u in admin_user_service.list_users(db)
        if u.is_admin
    ]


@router.get("", response_model=list[ProfileRead])
def list_users(db: Session = Depends(get_db)) -> list[ProfileRead]:
    return admin_user_service.list_users(db)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(user_id: uuid.UUID, db: Session = Depends(get_db)) -> None:
    if admin_user_service.is_admin_user(db, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non è possibile eliminare un utente amministratore",
        )
    delete_user(user_id)


@router.post("/admins", status_code=status.HTTP_201_CREATED)
def create_admin(payload: AdminCreate, db: Session = Depends(get_db)) -> dict[str, str]:
    """Registra un nuovo account con i permessi da amministratore, oppure
    promuove ad admin l'account che usa già quell'email."""
    user_id = admin_user_service.find_user_id_by_email(db, payload.email)
    created = user_id is None
    if created:
        if not payload.password:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La password è obbligatoria")
        metadata = {
            key: value
            for key, value in {
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "phone": payload.phone,
            }.items()
            if value
        }
        try:
            user_id = create_user(payload.email, payload.password, metadata)
        except EmailAlreadyRegisteredError:
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Email già registrata") from None
    admin_user_service.set_admin(db, user_id, True)
    notification_service.set_subscriptions(db, payload.email, payload.subscriptions)
    return {"id": str(user_id), "status": "created" if created else "promoted"}


@router.delete("/{user_id}/admin", status_code=status.HTTP_204_NO_CONTENT)
def revoke_admin(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
) -> None:
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non puoi revocare i tuoi permessi da amministratore",
        )
    try:
        admin_user_service.set_admin(db, user_id, False)
    except LookupError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Utente non trovato") from None
    email = admin_user_service.email_of(db, user_id)
    if email:
        notification_service.set_subscriptions(db, email, [])


@router.put("/{user_id}/subscriptions", status_code=status.HTTP_204_NO_CONTENT)
def update_subscriptions(user_id: uuid.UUID, payload: AdminSubscriptionsUpdate, db: Session = Depends(get_db)) -> None:
    email = admin_user_service.email_of(db, user_id)
    if email is None or not admin_user_service.is_admin_user(db, user_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Amministratore non trovato")
    notification_service.set_subscriptions(db, email, payload.subscriptions)
