from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.sale import SaleCreate, SaleOut
from app.models.sale import Sale
from app.models.sale_items import SaleItem
from app.models.product import Product
from app.models.customer import Customer
from app.core.rbac import require_roles

router = APIRouter()


# ─── Create a new sale ────────────────────────────────────────────────────────
@router.post("", response_model=SaleOut)
def new_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    org_id = user.get("org")
    user_id = user.get("sub")

    try:
        # Check customer if provided
        customer = None
        if sale_data.customer_id:
            customer = db.query(Customer).filter(Customer.id == sale_data.customer_id).first()
            if not customer:
                raise HTTPException(status_code=400, detail="Customer not found")

        # Determine payment status
        status = sale_data.status.upper() if sale_data.status else "COMPLETED"
        payment_method = sale_data.payment_method.upper()
        
        if payment_method == "CREDIT":
            status = "UNPAID"
        elif payment_method == "MPESA":
            status = "PENDING" # Requires Callback to finalize

        sale = Sale(
            sale_number=sale_data.sale_number,
            user_id=user_id,
            organization_id=org_id,
            customer_id=sale_data.customer_id,
            payment_method=payment_method,
            payment_status=status,
            total_amount=sale_data.total_amount,
            total_cost=sale_data.total_cost,
            profit=sale_data.profit,
        )
        db.add(sale)
        
        # If credit sale, update customer debt
        if sale_data.payment_method.lower() == "credit" and customer:
            customer.total_debt += sale_data.total_amount
            db.add(customer)

        db.flush()  # get sale.id before creating items

        for item in sale_data.items:
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item.product_id,
                quantity=item.quantity,
                selling_price=item.selling_price,
                buying_price=item.buying_price,
            )
            db.add(sale_item)

            # Deduct stock
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product:
                product.stock_quantity = max(0, product.stock_quantity - item.quantity)
                db.add(product)

        db.commit()
        db.refresh(sale)
        return sale

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ─── List all sales for this org ──────────────────────────────────────────────
@router.get("", response_model=list[SaleOut])
def list_all_sales(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    org_id = user.get("org")
    query = db.query(Sale)
    if org_id:
        query = query.filter(Sale.organization_id == org_id)
    return query.order_by(Sale.created_at.desc()).all()


# ─── List sales by branch ─────────────────────────────────────────────────────
@router.get("/branch/{branch_id}", response_model=list[SaleOut])
def list_sales(
    branch_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return db.query(Sale).filter(Sale.branch_id == branch_id).order_by(Sale.created_at.desc()).all()


# ─── Get single sale ──────────────────────────────────────────────────────────
@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
