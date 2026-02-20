from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"))

    name = Column(String)
    sku = Column(String, unique=True)
    buying_price = Column(Float)
    selling_price = Column(Float)
    stock_quantity = Column(Integer)
    low_stock_threshold = Column(Integer, default=5)
    imei_tracking = Column(Boolean, default=False)
