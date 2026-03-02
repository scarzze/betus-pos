from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.crud.user import get_user_by_email
from app.core.security import verify_password, create_access_token


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User inactive")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "org": str(user.organization_id),
        "branch": str(user.branch_id) if user.branch_id else None
    })

    return {"access_token": token, "token_type": "bearer"}
