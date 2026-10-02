from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.schemas.email_template import EmailPreviewRead, EmailTemplateAdminRead, EmailTemplateUpdate
from app.services import email_template_service
from app.services.email_service import LOGO_PREVIEW_SRC, render_signature_html
from app.services.email_template_service import (
    SIGNATURE_KEY,
    TEMPLATES,
    render_body_html,
    render_subject,
    sample_values,
)
from app.services.i18n import resolve_locale

router = APIRouter(
    prefix="/admin/emails",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


def _locale(locale: str | None = Query(default=None)) -> str:
    return resolve_locale(locale)


def _validate_key(key: str) -> str:
    if key not in TEMPLATES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modello email inesistente")
    return key


@router.get("", response_model=list[EmailTemplateAdminRead])
def list_templates(locale: str = Depends(_locale), db: Session = Depends(get_db)) -> list[EmailTemplateAdminRead]:
    return email_template_service.list_for_admin(db, locale)


@router.get("/{key}", response_model=EmailTemplateAdminRead)
def get_template(key: str, locale: str = Depends(_locale), db: Session = Depends(get_db)) -> EmailTemplateAdminRead:
    return email_template_service.get_for_admin(db, _validate_key(key), locale)


@router.put("/{key}", response_model=EmailTemplateAdminRead)
def save_template(
    key: str, payload: EmailTemplateUpdate, locale: str = Depends(_locale), db: Session = Depends(get_db)
) -> EmailTemplateAdminRead:
    return email_template_service.save_template(db, _validate_key(key), locale, payload)


@router.delete("/{key}", response_model=EmailTemplateAdminRead)
def reset_template(key: str, locale: str = Depends(_locale), db: Session = Depends(get_db)) -> EmailTemplateAdminRead:
    """Cancella la personalizzazione in questa lingua e torna al testo predefinito."""
    return email_template_service.reset_template(db, _validate_key(key), locale)


@router.post("/{key}/preview", response_model=EmailPreviewRead)
def preview_template(
    key: str, payload: EmailTemplateUpdate, locale: str = Depends(_locale), db: Session = Depends(get_db)
) -> EmailPreviewRead:
    """Anteprima del testo in modifica (non ancora salvato) con dati di esempio,
    con la firma nella stessa lingua."""
    _validate_key(key)
    locale = email_template_service.template_locale(TEMPLATES[key], locale)
    values = sample_values(locale)
    if key == SIGNATURE_KEY:
        signature_body, show_logo = payload.body, payload.show_logo
        content = ""
        subject = None
    else:
        signature = email_template_service.get_template(db, SIGNATURE_KEY, locale)
        signature_body, show_logo = signature.body, signature.show_logo
        content = render_body_html(payload.body, values)
        subject = render_subject(payload.subject or "", values)
    html = content + render_signature_html(signature_body, show_logo, logo_src=LOGO_PREVIEW_SRC)
    return EmailPreviewRead(subject=subject, html=html)
