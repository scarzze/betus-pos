from sqlalchemy import Column, Float, ForeignKey, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    total_amount = Column(Float)
    payment_method = Column(String)
    payment_status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
