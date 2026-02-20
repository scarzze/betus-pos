from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class SaleItemBase(BaseModel):
    product_id: UUID
    quantity: int
    imei_numbers: Optional[List[str]] = None  # only if IMEI tracking


class SaleCreate(BaseModel):
    branch_id: UUID
    organization_id: UUID
    items: List[SaleItemBase]
    payment_method: str  # CASH / MPESA


class SaleOut(BaseModel):
    id: UUID
    total_amount: float
    payment_status: str
    created_at: datetime
    items: List[SaleItemBase]

    class Config:
        from_attributes = True
