from sqlalchemy.orm import Session
from app.models.audit import AuditLog
import json

def log_action(
    db: Session, 
    user_id: str, 
    user_email: str, 
    action: str, 
    module: str, 
    details: str = None, 
    metadata: dict = None
):
    """
    Records a high-fidelity audit entry for administrative tracking.
    """
    log_entry = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        module=module,
        details=details,
        metadata_json=metadata
    )
    db.add(log_entry)
    db.commit()
    return log_entry

def get_recent_logs(db: Session, limit: int = 100):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
