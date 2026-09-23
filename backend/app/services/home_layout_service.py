from sqlalchemy.orm import Session

from app.models.home_layout import HomeLayout
from app.schemas.home_layout import HomeLayoutAdminUpdate

DEFAULT_SECTIONS = [
    {"key": "packages", "visible": True},
    {"key": "services", "visible": True},
    {"key": "about", "visible": True},
    {"key": "listings", "visible": True},
    {"key": "how_it_works", "visible": True},
]


def get_layout_row(db: Session) -> HomeLayout:
    layout = db.get(HomeLayout, 1)
    if layout is None:
        # Rete di sicurezza: dovrebbe già esistere dalla migration.
        layout = HomeLayout(id=1, sections=DEFAULT_SECTIONS)
        db.add(layout)
        db.commit()
        db.refresh(layout)
    return layout


def update_layout(db: Session, payload: HomeLayoutAdminUpdate) -> HomeLayout:
    layout = get_layout_row(db)
    layout.sections = [section.model_dump() for section in payload.sections]
    db.commit()
    db.refresh(layout)
    return layout
