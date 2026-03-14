from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.rbac import require_roles
from app.models.customer import Customer, CustomerPayment
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate, PaymentCreate, PaymentOut

router = APIRouter()

@router.post("", response_model=CustomerOut)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    org_id = user.get("org")
    customer = Customer(**customer_data.model_dump(), organization_id=org_id)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("", response_model=List[CustomerOut])
def list_customers(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    org_id = user.get("org")
    query = db.query(Customer)
    if org_id:
        query = query.filter(Customer.organization_id == org_id)
    return query.order_by(Customer.name.asc()).all()

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.patch("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer_data.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.post("/{customer_id}/payments", response_model=PaymentOut)
def record_payment(
    customer_id: UUID,
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create payment record
    payment = CustomerPayment(
        **payment_data.model_dump(),
        customer_id=customer_id,
        user_id=user.get("sub")
    )
    
    # Update customer debt
    customer.total_debt -= payment_data.amount
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/{customer_id}/payments", response_model=List[PaymentOut])
def get_customer_payments(
    customer_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    return db.query(CustomerPayment).filter(CustomerPayment.customer_id == customer_id).order_by(CustomerPayment.created_at.desc()).all()
