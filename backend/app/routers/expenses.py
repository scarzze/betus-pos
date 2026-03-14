from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.core.rbac import require_roles
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseOut

router = APIRouter()

@router.post("", response_model=ExpenseOut)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    org_id = user.get("org")
    user_id = user.get("sub")
    
    expense_dict = expense_data.model_dump()
    if not expense_dict.get("expense_date"):
        expense_dict["expense_date"] = datetime.utcnow()
        
    expense = Expense(
        **expense_dict,
        organization_id=org_id,
        user_id=user_id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("", response_model=List[ExpenseOut])
def list_expenses(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    org_id = user.get("org")
    query = db.query(Expense)
    if org_id:
        query = query.filter(Expense.organization_id == org_id)
    return query.order_by(Expense.expense_date.desc()).all()

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}
