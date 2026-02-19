from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="staff")  # roles: admin, staff

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String)
    amount = Column(Float)
    status = Column(String, default="pending")
    mpesa_receipt = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
