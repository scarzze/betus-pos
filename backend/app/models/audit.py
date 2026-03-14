from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String)  # e.g., "DELETE_PRODUCT", "UPDATE_PRICE", "LOGIN"
    module = Column(String)  # e.g., "INVENTORY", "AUTH", "EXPENSES"
    details = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metadata_json = Column(JSON, nullable=True)  # Store specific data like { "product_id": "..." }
