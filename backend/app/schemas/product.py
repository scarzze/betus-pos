from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    sku: str
    category: Optional[str] = None
    buying_price: float = 0.0
    selling_price: float
    stock: int = 0                  # frontend sends "stock"
    low_stock_threshold: int = 10
    imei_tracked: bool = False      # frontend sends "imei_tracked"
    branch_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    buying_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    imei_tracked: Optional[bool] = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    sku: str
    category: Optional[str] = None
    buying_price: float
    selling_price: float
    stock: int = 0                  # serialised as "stock" (mapped from stock_quantity)
    low_stock_threshold: int
    imei_tracked: bool = False      # serialised as "imei_tracked"

    @classmethod
    def from_orm(cls, obj):
        # Map DB column names → frontend field names
        return cls(
            id=obj.id,
            name=obj.name,
            sku=obj.sku,
            category=obj.category,
            buying_price=obj.buying_price,
            selling_price=obj.selling_price,
            stock=obj.stock_quantity,
            low_stock_threshold=obj.low_stock_threshold,
            imei_tracked=obj.imei_tracking,
        )
