from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.services.email_service import LOGO_PREVIEW_SRC, render_signature_html
from app.schemas.email_template import EmailPreviewRead, EmailTemplateAdminRead, EmailTemplateUpdate
from app.services import email_template_service
from app.services.email_template_service import (
    SAMPLE_VALUES,
    SIGNATURE_KEY,
    TEMPLATES,
    render_body_html,
    render_subject,
)

router = APIRouter(
    prefix="/admin/emails",
    tags=["admin"],
    dependencies=[Depends(get_current_admin_user)],
)


def _validate_key(key: str) -> str:
    if key not in TEMPLATES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modello email inesistente")
    return key


@router.get("", response_model=list[EmailTemplateAdminRead])
def list_templates(db: Session = Depends(get_db)) -> list[EmailTemplateAdminRead]:
    return email_template_service.list_for_admin(db)


@router.get("/{key}", response_model=EmailTemplateAdminRead)
def get_template(key: str, db: Session = Depends(get_db)) -> EmailTemplateAdminRead:
    return email_template_service.get_for_admin(db, _validate_key(key))


@router.put("/{key}", response_model=EmailTemplateAdminRead)
def save_template(key: str, payload: EmailTemplateUpdate, db: Session = Depends(get_db)) -> EmailTemplateAdminRead:
    return email_template_service.save_template(db, _validate_key(key), payload)


@router.delete("/{key}", response_model=EmailTemplateAdminRead)
def reset_template(key: str, db: Session = Depends(get_db)) -> EmailTemplateAdminRead:
    """Cancella la personalizzazione e torna al testo predefinito."""
    return email_template_service.reset_template(db, _validate_key(key))


@router.post("/{key}/preview", response_model=EmailPreviewRead)
def preview_template(key: str, payload: EmailTemplateUpdate, db: Session = Depends(get_db)) -> EmailPreviewRead:
    """Anteprima del testo in modifica (non ancora salvato) con dati di esempio."""
    _validate_key(key)
    if key == SIGNATURE_KEY:
        signature_body, show_logo = payload.body, payload.show_logo
        content = ""
        subject = None
    else:
        signature = email_template_service.get_template(db, SIGNATURE_KEY)
        signature_body, show_logo = signature.body, signature.show_logo
        content = render_body_html(payload.body, SAMPLE_VALUES)
        subject = render_subject(payload.subject or "", SAMPLE_VALUES)
    html = content + render_signature_html(signature_body, show_logo, logo_src=LOGO_PREVIEW_SRC)
    return EmailPreviewRead(subject=subject, html=html)
