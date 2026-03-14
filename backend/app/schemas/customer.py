from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    total_debt: float
    created_at: datetime

class PaymentCreate(BaseModel):
    amount: float
    payment_method: str # cash, mpesa
    reference: Optional[str] = None
    note: Optional[str] = None

class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    customer_id: UUID
    user_id: Optional[UUID] = None
    amount: float
    payment_method: str
    reference: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
