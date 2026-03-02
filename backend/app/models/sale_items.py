from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    selling_price = Column(Float, nullable=False)
    buying_price = Column(Float, default=0.0)
