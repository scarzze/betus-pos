from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from typing import Optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str
    role: str = "SALES"
    organization_id: Optional[UUID] = None
    branch_id: Optional[UUID] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    role: str
    is_active: bool
    organization_id: Optional[UUID] = None
    branch_id: Optional[UUID] = None
