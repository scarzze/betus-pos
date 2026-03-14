from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class OnlineOrder(Base):
    __tablename__ = "online_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_name = Column(String)
    customer_email = Column(String)
    customer_phone = Column(String)
    shipping_address = Column(String)
    
    total_amount = Column(Float)
    status = Column(String, default="PENDING") # PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
    
    payment_method = Column(String) # MPESA, CARD, CASH_ON_DELIVERY
    payment_reference = Column(String, nullable=True)
    mpesa_checkout_id = Column(String, nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    items = Column(JSON) # List of { product_id, name, price, quantity }

    # Sync with POS sales once fulfilled
    pos_sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id"), nullable=True)
