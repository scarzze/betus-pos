from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.settings import SettingsBase, SettingsOut
from app.crud.settings import get_settings, update_settings
from app.core.rbac import require_roles

router = APIRouter()


@router.get("/", response_model=SettingsOut)
def read_settings(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    settings = get_settings(db)
    return settings


@router.put("/", response_model=SettingsOut)
def modify_settings(
    settings_data: SettingsBase,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN"]))
):
    settings = update_settings(db, settings_data)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings
