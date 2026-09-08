import uuid

import httpx

from app.core.config import get_settings


def _auth_headers() -> dict[str, str]:
    settings = get_settings()
    return {
        "apikey": settings.supabase_secret_key,
        "Authorization": f"Bearer {settings.supabase_secret_key}",
    }


def delete_user(user_id: uuid.UUID) -> None:
    """Elimina l'utente da Supabase Auth (Admin API). La riga in
    public.profiles viene rimossa automaticamente (ON DELETE CASCADE),
    mentre gli ordini restano con user_id impostato a NULL (ON DELETE
    SET NULL) per conservare lo storico contabile.
    """
    settings = get_settings()
    response = httpx.delete(
        f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
        headers=_auth_headers(),
        timeout=30,
    )
    response.raise_for_status()
