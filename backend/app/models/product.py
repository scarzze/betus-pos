from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"), nullable=True)

    name = Column(String)
    sku = Column(String, unique=True)
    category = Column(String, nullable=True)
    buying_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)
    imei_tracking = Column(Boolean, default=False)
