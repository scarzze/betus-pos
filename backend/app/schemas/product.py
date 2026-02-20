from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ProductBase(BaseModel):
    name: str
    buying_price: float
    selling_price: float
    stock_quantity: int
    imei_tracking: Optional[bool] = False


class ProductCreate(ProductBase):
    branch_id: UUID
    organization_id: UUID


class ProductUpdate(BaseModel):
    name: Optional[str]
    buying_price: Optional[float]
    selling_price: Optional[float]
    stock_quantity: Optional[int]
    imei_tracking: Optional[bool]


class ProductOut(ProductBase):
    id: UUID
    sku: str
    low_stock_threshold: int

    class Config:
        from_attributes = True
