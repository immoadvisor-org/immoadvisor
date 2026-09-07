from functools import lru_cache
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)

# Supabase firma i JWT con chiavi asimmetriche (ES256): non c'è più un
# secret condiviso da conoscere, si verifica la firma contro la chiave
# pubblica corrispondente pubblicata su SUPABASE_JWKS_URL. PyJWKClient la
# scarica e la mette in cache (creato pigramente, non al import del modulo,
# così i test che non toccano endpoint protetti non richiedono rete).
@lru_cache
def _get_jwk_client() -> PyJWKClient:
    return PyJWKClient(get_settings().supabase_jwks_url)


class AuthenticatedUser:
    def __init__(self, user_id: UUID, email: str | None):
        self.user_id = user_id
        self.email = email


def decode_supabase_token(token: str) -> AuthenticatedUser:
    try:
        signing_key = _get_jwk_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido o scaduto",
        ) from exc

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token privo di identificativo utente",
        )

    return AuthenticatedUser(user_id=UUID(subject), email=payload.get("email"))


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthenticatedUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticazione richiesta",
        )
    return decode_supabase_token(credentials.credentials)
