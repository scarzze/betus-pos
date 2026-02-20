from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.models.sale import Sale
from app.models.sale_items import SaleItem
from app.models.product import Product
from app.models.user import User


def get_today_sales(db: Session, branch_id=None):
    today = datetime.utcnow().date()
    query = db.query(Sale).filter(
        func.date(Sale.created_at) == today,
        Sale.payment_status == "PAID"
    )
    if branch_id:
        query = query.filter(Sale.branch_id == branch_id)
    return query.all()


def calculate_profit_loss(db: Session, branch_id=None, start_date=None, end_date=None):
    query = db.query(SaleItem, Sale).join(Sale, Sale.id == SaleItem.sale_id).filter(
        Sale.payment_status == "PAID"
    )

    if branch_id:
        query = query.filter(Sale.branch_id == branch_id)
    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    total_revenue = 0
    total_cogs = 0
    total_profit = 0
    total_loss = 0

    for item, sale in query.all():
        revenue = item.selling_price * item.quantity
        cogs = item.buying_price * item.quantity
        profit = revenue - cogs
        total_revenue += revenue
        total_cogs += cogs
        if profit >= 0:
            total_profit += profit
        else:
            total_loss += abs(profit)

    net_profit = total_profit - total_loss
    profit_margin = (net_profit / total_revenue * 100) if total_revenue else 0

    return {
        "gross_revenue": float(total_revenue),
        "cogs": float(total_cogs),
        "total_profit": float(total_profit),
        "total_loss": float(total_loss),
        "net_profit": float(net_profit),
        "profit_margin": float(profit_margin)
    }


def top_products(db: Session, branch_id=None, limit=10):
    query = db.query(
        Product.name,
        func.sum(SaleItem.quantity).label("total_sold"),
        func.sum(SaleItem.quantity * SaleItem.selling_price).label("revenue")
    ).join(SaleItem, SaleItem.product_id == Product.id
    ).join(Sale, Sale.id == SaleItem.sale_id
    ).filter(Sale.payment_status == "PAID")

    if branch_id:
        query = query.filter(Product.branch_id == branch_id)

    query = query.group_by(Product.name).order_by(func.sum(SaleItem.quantity).desc()).limit(limit)
    return [{"name": r[0], "sold": int(r[1]), "revenue": float(r[2])} for r in query.all()]


def weekly_sales(db: Session, branch_id=None):
    today = datetime.utcnow()
    week_ago = today - timedelta(days=7)
    query = db.query(
        func.date(Sale.created_at).label("day"),
        func.sum(SaleItem.selling_price * SaleItem.quantity).label("revenue")
    ).join(SaleItem, Sale.id == SaleItem.sale_id
    ).filter(
        Sale.payment_status == "PAID",
        Sale.created_at >= week_ago
    )
    if branch_id:
        query = query.filter(Sale.branch_id == branch_id)

    query = query.group_by(func.date(Sale.created_at)).order_by(func.date(Sale.created_at))
    return [{"date": str(r.day), "revenue": float(r.revenue)} for r in query.all()]
