from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rbac import require_roles
from datetime import datetime
from app.services.analytics_service import (
    get_today_sales,
    calculate_profit_loss,
    top_products,
    weekly_sales,
    get_low_stock_products,
    get_recent_sales
)

router = APIRouter()


@router.get("/summary")
def dashboard_summary(
    branch_id: str = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    profit_loss = calculate_profit_loss(db, branch_id, start_date=today_start)
    sales_today = len(get_today_sales(db, branch_id))
    top_10 = top_products(db, branch_id)
    weekly = weekly_sales(db, branch_id)
    low_stock = get_low_stock_products(db, branch_id)
    recent = get_recent_sales(db, branch_id)

    return {
        "today_sales_count": sales_today,
        "profit_loss": profit_loss,
        "top_products": top_10,
        "weekly_sales": weekly,
        "low_stock": low_stock,
        "recent_sales": recent
    }


@router.get("/analytics")
def dashboard_analytics(
    branch_id: str = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    data = calculate_profit_loss(db, branch_id)
    return data
