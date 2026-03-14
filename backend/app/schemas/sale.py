from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List, Optional
from datetime import datetime


# ─────────────────────────────────────────────
# Items inside a sale (as sent by the frontend)
# ─────────────────────────────────────────────
class SaleItemIn(BaseModel):
    product_id: UUID
    product_name: Optional[str] = None
    quantity: int
    selling_price: float
    buying_price: float = 0.0
    subtotal: Optional[float] = None


# ─────────────────────────────────────────────
# Create payload — matches exactly what Sales.tsx sends
# ─────────────────────────────────────────────
class SaleCreate(BaseModel):
    sale_number: Optional[str] = None
    user_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    payment_method: str          # "cash" | "mpesa" | "credit"
    total_amount: float
    total_cost: float = 0.0
    profit: float = 0.0
    status: Optional[str] = "completed"
    items: List[SaleItemIn]


# ─────────────────────────────────────────────
# Item included in SaleOut
# ─────────────────────────────────────────────
class SaleItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: UUID
    quantity: int
    selling_price: float
    buying_price: float


# ─────────────────────────────────────────────
# Full sale response
# ─────────────────────────────────────────────
class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sale_number: Optional[str] = None
    customer_id: Optional[UUID] = None
    total_amount: float
    total_cost: float = 0.0
    profit: float = 0.0
    payment_method: str
    payment_status: str
    created_at: datetime
