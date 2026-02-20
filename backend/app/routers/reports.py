from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.rbac import require_roles
from app.models.sale import Sale
from app.models.sale_items import SaleItem
from app.models.product import Product
from app.models.payment import Payment
from app.crud.product import get_products_by_branch
import csv
import io

router = APIRouter()


# ==============================
# Sales Report
# ==============================
@router.get("/sales")
def sales_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    staff_id: str = None,
    payment_method: str = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    query = db.query(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_date
    )

    if staff_id:
        query = query.filter(Sale.created_by == staff_id)
    if payment_method:
        query = query.filter(Sale.payment_method == payment_method)

    results = query.all()
    total_sales = len(results)
    total_amount = sum([s.total_amount for s in results])
    avg_order_value = total_amount / total_sales if total_sales else 0

    return {
        "total_sales": total_sales,
        "total_amount": float(total_amount),
        "average_order_value": float(avg_order_value),
        "sales": [
            {"id": str(s.id), "total": float(s.total_amount), "payment_method": s.payment_method} for s in results
        ]
    }


# ==============================
# Profit & Loss Report
# ==============================
@router.get("/profit-loss")
def profit_loss_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    query = db.query(SaleItem, Sale).join(Sale, Sale.id == SaleItem.sale_id).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_date,
        Sale.payment_status == "PAID"
    )

    report = []
    gross_revenue = 0
    total_cogs = 0
    total_profit = 0
    total_loss = 0

    for item, sale in query.all():
        revenue = item.selling_price * item.quantity
        cost = item.buying_price * item.quantity
        profit = revenue - cost
        gross_revenue += revenue
        total_cogs += cost
        if profit >= 0:
            total_profit += profit
        else:
            total_loss += abs(profit)

        report.append({
            "product_id": str(item.product_id),
            "quantity": item.quantity,
            "revenue": float(revenue),
            "cost": float(cost),
            "profit": float(profit if profit > 0 else 0),
            "loss": float(abs(profit) if profit < 0 else 0)
        })

    net_profit = total_profit - total_loss
    profit_margin = (net_profit / gross_revenue * 100) if gross_revenue else 0

    return {
        "gross_revenue": float(gross_revenue),
        "total_cogs": float(total_cogs),
        "total_profit": float(total_profit),
        "total_loss": float(total_loss),
        "net_profit": float(net_profit),
        "profit_margin": float(profit_margin),
        "details": report
    }


# ==============================
# Inventory Report
# ==============================
@router.get("/inventory")
def inventory_report(
    branch_id: str = None,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    products = get_products_by_branch(db, branch_id) if branch_id else db.query(Product).all()
    report = []
    for p in products:
        report.append({
            "id": str(p.id),
            "name": p.name,
            "stock_quantity": p.stock_quantity,
            "low_stock_threshold": p.low_stock_threshold
        })
    return report


# ==============================
# M-Pesa Transaction Report
# ==============================
@router.get("/mpesa")
def mpesa_report(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    transactions = db.query(Payment).filter(
        Payment.created_at >= start_date,
        Payment.created_at <= end_date,
        Payment.method == "MPESA"
    ).all()
    report = []
    for t in transactions:
        report.append({
            "transaction_code": t.transaction_code,
            "amount": float(t.amount),
            "reference": t.sale_id,
            "status": t.status,
            "date": t.created_at.isoformat()
        })
    return report


# ==============================
# CSV Export Example
# ==============================
@router.get("/export/sales/csv")
def export_sales_csv(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    query = db.query(Sale).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_date
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Sale ID", "Total Amount", "Payment Method", "Created At"])
    for s in query.all():
        writer.writerow([str(s.id), float(s.total_amount), s.payment_method, s.created_at.isoformat()])

    return {"csv": output.getvalue()}
