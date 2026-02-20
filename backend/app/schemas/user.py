from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    role: str


class UserCreate(UserBase):
    password: str
    organization_id: UUID
    branch_id: Optional[UUID] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: UUID
    is_active: bool
    organization_id: UUID
    branch_id: Optional[UUID]

    class Config:
        from_attributes = True
