import httpx

from app.core.config import get_settings

BUCKET = "listing-images"


def _auth_headers() -> dict[str, str]:
    settings = get_settings()
    return {
        "apikey": settings.supabase_secret_key,
        "Authorization": f"Bearer {settings.supabase_secret_key}",
    }


def upload_image(path: str, content: bytes, content_type: str) -> str:
    settings = get_settings()
    response = httpx.post(
        f"{settings.supabase_url}/storage/v1/object/{BUCKET}/{path}",
        content=content,
        headers={
            **_auth_headers(),
            "Content-Type": content_type,
            "x-upsert": "true",
        },
        timeout=30,
    )
    response.raise_for_status()
    return f"{settings.supabase_url}/storage/v1/object/public/{BUCKET}/{path}"


def delete_image(path: str) -> None:
    settings = get_settings()
    httpx.delete(
        f"{settings.supabase_url}/storage/v1/object/{BUCKET}/{path}",
        headers=_auth_headers(),
        timeout=30,
    )


def path_from_public_url(url: str) -> str | None:
    marker = f"/object/public/{BUCKET}/"
    if marker not in url:
        return None
    return url.split(marker, 1)[1]
