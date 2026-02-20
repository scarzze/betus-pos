from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_roles
from app.services.analytics_service import (
    get_today_sales,
    calculate_profit_loss,
    top_products,
    weekly_sales
)

router = APIRouter()


@router.get("/summary")
def dashboard_summary(
    branch_id: str = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    profit_loss = calculate_profit_loss(db, branch_id)
    sales_today = len(get_today_sales(db, branch_id))
    top_10 = top_products(db, branch_id)
    weekly = weekly_sales(db, branch_id)

    return {
        "today_sales_count": sales_today,
        "profit_loss": profit_loss,
        "top_products": top_10,
        "weekly_sales": weekly
    }


@router.get("/analytics")
def dashboard_analytics(
    branch_id: str = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    data = calculate_profit_loss(db, branch_id)
    return data
