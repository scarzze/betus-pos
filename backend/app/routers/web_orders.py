from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.online_order import OnlineOrder
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_items import SaleItem
from app.core.rbac import require_roles
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("", response_model=List[dict])
def get_all_web_orders(db: Session = Depends(get_db), current_user = Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))):
    """
    Forensic retrieval of all digital transactions for administrative fulfillment.
    """
    orders = db.query(OnlineOrder).order_by(OnlineOrder.created_at.desc()).all()
    # return as dict to include all fields flexibly
    return [
        {
            "id": str(o.id),
            "customer_name": o.customer_name,
            "customer_email": o.customer_email,
            "customer_phone": o.customer_phone,
            "shipping_address": o.shipping_address,
            "total_amount": o.total_amount,
            "status": o.status,
            "payment_method": o.payment_method,
            "payment_reference": o.payment_reference,
            "created_at": o.created_at,
            "items": o.items,
            "pos_sale_id": str(o.pos_sale_id) if o.pos_sale_id else None
        } for o in orders
    ]

@router.patch("/{order_id}/status")
def update_order_status(
    order_id: uuid.UUID, 
    update: OrderStatusUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    order = db.query(OnlineOrder).filter(OnlineOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = update.status.upper()
    db.commit()
    return {"message": f"Order status recalibrated to {order.status}"}

@router.post("/{order_id}/fulfill")
def fulfill_order(
    order_id: uuid.UUID, 
    db: Session = Depends(get_db), 
    current_user = Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    """
    Converts a Digital Transaction into a physical POS Sale.
    Deducts stock and records fulfillment.
    """
    order = db.query(OnlineOrder).filter(OnlineOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status == "DELIVERED":
        raise HTTPException(status_code=400, detail="Order already fulfilled and delivered")

    # 1. Create a POS Sale
    new_sale = Sale(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        branch_id=current_user.branch_id,
        total_amount=order.total_amount,
        payment_method=order.payment_method,
        status="COMPLETED"
    )
    db.add(new_sale)
    db.flush() # Get sale ID

    # 2. Add items and deduct stock
    for item in order.items:
        prod_id = uuid.UUID(item['product_id'])
        product = db.query(Product).filter(Product.id == prod_id).first()
        
        if product:
            product.stock_quantity -= item['quantity']
            
            sale_item = SaleItem(
                sale_id=new_sale.id,
                product_id=product.id,
                quantity=item['quantity'],
                unit_price=item['price'],
                total_price=item['price'] * item['quantity']
            )
            db.add(sale_item)

    # 3. Mark order as fulfilled
    order.status = "DELIVERED"
    order.pos_sale_id = new_sale.id
    
    db.commit()
    return {"message": "Order successfully fulfilled and integrated into POS ledger", "sale_id": str(new_sale.id)}
