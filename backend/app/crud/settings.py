from sqlalchemy.orm import Session
from app.models.settings import Settings

def get_settings(db: Session):
    return db.query(Settings).first()


def update_settings(db: Session, settings_data):
    settings = get_settings(db)
    if not settings:
        return None
    for key, value in settings_data.dict(exclude_unset=True).items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
