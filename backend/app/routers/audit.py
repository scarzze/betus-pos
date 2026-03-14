from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.audit_service import get_recent_logs
from app.core.rbac import require_roles

router = APIRouter()

@router.get("")
def read_audit_logs(
    db: Session = Depends(get_db),
    admin=Depends(require_roles(["SUPER_ADMIN"]))
):
    """
    Exposes the forensic audit trail to root administrators.
    """
    return get_recent_logs(db)
