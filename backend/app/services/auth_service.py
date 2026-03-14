from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.crud.user import get_user_by_email
from app.core.security import verify_password, create_access_token
from app.crud.settings import get_settings

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check for active lockout
    if user.locked_until and user.locked_until > datetime.utcnow():
        wait_seconds = int((user.locked_until - datetime.utcnow()).total_seconds())
        raise HTTPException(
            status_code=423, # Locked
            detail=f"Security lockout active. Please wait {wait_seconds} seconds."
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is deactivated")

    # Validate Password
    if not verify_password(password, user.hashed_password):
        # Increment failure counter
        user.failed_attempts += 1
        
        # Consult security policies
        sys_settings = get_settings(db)
        max_attempts = sys_settings.max_login_attempts if sys_settings else 5
        
        if user.failed_attempts >= max_attempts:
            # Enforce 15-minute restrictive cooling period
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            db.commit()
            raise HTTPException(
                status_code=423,
                detail="Critical: Shield protocol active. Account locked for 15 minutes due to multiple failures."
            )
        
        db.commit()
        remaining = max_attempts - user.failed_attempts
        raise HTTPException(
            status_code=401, 
            detail=f"Invalid security key. {remaining} authorization attempts remaining."
        )

    # Success: Reset security counters
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()

    from app.services.audit_service import log_action
    
    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "org": str(user.organization_id),
        "branch": str(user.branch_id) if user.branch_id else None
    })

    # Record successful login
    log_action(
        db, 
        user_id=str(user.id), 
        user_email=user.email, 
        action="AUTH_LOGIN_SUCCESS", 
        module="SECURITY",
        details="Principal authenticated successfully. Security counters reset."
    )

    return {"access_token": token, "token_type": "bearer"}
