from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.crud.user import create_user, get_users_by_org, get_all_users, deactivate_user
from app.core.rbac import require_roles

router = APIRouter()


# ─── List users for the caller's org ─────────────────────────────────────────
@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    org_id = current_user.get("org")
    if org_id:
        return get_users_by_org(db, org_id)
    return get_all_users(db)


# ─── Create a new user ────────────────────────────────────────────────────────
@router.post("", response_model=UserOut)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    org_id = current_user.get("org")
    branch_id = current_user.get("branch")
    return create_user(db, user, org_id=org_id, branch_id=branch_id)


# ─── Get users by org ─────────────────────────────────────────────────────────
@router.get("/{org_id}", response_model=list[UserOut])
def list_users_by_org(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return get_users_by_org(db, org_id)


# ─── Deactivate a user ───────────────────────────────────────────────────────
@router.delete("/{user_id}")
def disable_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SUPER_ADMIN"]))
):
    user = deactivate_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deactivated"}
