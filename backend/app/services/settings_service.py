from sqlalchemy.orm import Session
from app.crud.settings import get_settings, update_settings


def fetch_settings(db: Session):
    return get_settings(db)


def modify_settings_service(db: Session, data):
    return update_settings(db, data)
