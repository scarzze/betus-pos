from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.crud.user import create_user, get_users_by_org, deactivate_user
from app.core.rbac import require_roles

router = APIRouter()


@router.post("/", response_model=UserOut)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return create_user(db, user)


@router.get("/{org_id}", response_model=list[UserOut])
def list_users(
    org_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return get_users_by_org(db, org_id)


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
