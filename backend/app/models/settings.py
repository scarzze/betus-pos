from sqlalchemy import Column, String, Integer, Boolean
from app.core.database import Base

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # General
    shop_name = Column(String, default="Betus Electronics")
    phone_number = Column(String, default="+254 712 345 678")
    location = Column(String, default="Nairobi, Kenya")
    receipt_footer = Column(String, default="Thank you for shopping at Betus!")
    currency = Column(String, default="KES")
    
    # Payment
    mpesa_till_number = Column(String, default="123456")
    daraja_consumer_key = Column(String, nullable=True)
    daraja_consumer_secret = Column(String, nullable=True)
    payment_timeout = Column(Integer, default=60)
    
    # Inventory
    low_stock_threshold = Column(Integer, default=10)
    sku_prefix = Column(String, default="VLX")
    imei_tracking = Column(Boolean, default=True)
    
    # Security
    session_timeout = Column(Integer, default=30)
    max_login_attempts = Column(Integer, default=5)
    password_min_length = Column(Integer, default=8)
