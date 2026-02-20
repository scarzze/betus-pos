from sqlalchemy import Column, Float, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id"))
    amount = Column(Float)
    method = Column(String)
    status = Column(String)
    transaction_code = Column(String, nullable=True)
