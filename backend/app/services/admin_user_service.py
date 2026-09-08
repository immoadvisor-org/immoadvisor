import uuid

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.profile import ProfileRead

# Richiede un raw query con join sullo schema auth: public.profiles non
# memorizza l'email (per non doverla tenere sincronizzata se l'utente la
# cambia), quindi per l'elenco admin la leggiamo direttamente da auth.users.
_LIST_USERS_SQL = text("""
    select
        p.id, u.email, p.first_name, p.last_name, p.phone,
        p.address_line, p.postal_code, p.city, p.canton,
        p.avs_number, p.is_admin, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc
""")


def list_users(db: Session) -> list[ProfileRead]:
    rows = db.execute(_LIST_USERS_SQL).mappings().all()
    return [ProfileRead(**row) for row in rows]


def is_admin_user(db: Session, user_id: uuid.UUID) -> bool:
    profile = db.get(Profile, user_id)
    return bool(profile and profile.is_admin)
