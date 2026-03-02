from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_data, org_id=None, branch_id=None):
    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role.upper(),
        organization_id=user_data.organization_id or org_id,
        branch_id=user_data.branch_id or branch_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_users_by_org(db: Session, org_id):
    return db.query(User).filter(User.organization_id == org_id).all()


def get_all_users(db: Session):
    return db.query(User).all()


def deactivate_user(db: Session, user_id):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = False
        db.commit()
    return user
