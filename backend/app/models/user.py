from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # SUPER_ADMIN ADMIN SALES
    is_active = Column(Boolean, default=True)
