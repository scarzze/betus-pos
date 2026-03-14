from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.product import Product
from app.models.online_order import OnlineOrder
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter()

# --- Schemas ---
class ShopProduct(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    image_url: Optional[str]
    selling_price: float
    category: Optional[str]
    stock_quantity: int
    specifications: Optional[dict]

    class Config:
        from_attributes = True

class CheckoutItem(BaseModel):
    product_id: uuid.UUID
    quantity: int

class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    payment_method: str
    items: List[CheckoutItem]

# --- Endpoints ---

@router.get("/products", response_model=List[ShopProduct])
def get_shop_products(db: Session = Depends(get_db)):
    """
    Retrieves the public catalog for the Betus Digital Flagship.
    """
    return db.query(Product).filter(Product.is_online == True).all()

@router.get("/products/{product_id}", response_model=ShopProduct)
def get_shop_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_online == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found in digital catalog")
    return product

from app.services.mpesa_service import stk_push

# ... existing code ...

@router.post("/checkout")
def checkout(order_data: CheckoutRequest, db: Session = Depends(get_db)):
    """
    Processes a storefront checkout and initializes a digital transaction.
    """
    order_items = []
    total_amount = 0.0
    
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable")
        
        if product.stock_quantity < item.quantity:
             raise HTTPException(status_code=400, detail=f"Inventory deficit for {product.name}")
        
        price = product.selling_price
        subtotal = price * item.quantity
        total_amount += subtotal
        
        order_items.append({
            "product_id": str(product.id),
            "name": product.name,
            "price": price,
            "quantity": item.quantity
        })
    
    new_order = OnlineOrder(
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        shipping_address=order_data.shipping_address,
        total_amount=total_amount,
        payment_method=order_data.payment_method.upper(),
        items=order_items,
        status="PENDING"
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # If MPESA, trigger STK Push
    if order_data.payment_method.upper() == "MPESA":
        try:
            # Reference must be max 12 chars for Safaricom
            mpesa_response = stk_push(
                phone=order_data.customer_phone,
                amount=int(total_amount),
                reference=f"W{str(new_order.id.hex)[:11]}"
            )
            if mpesa_response.get("ResponseCode") == "0":
                new_order.mpesa_checkout_id = mpesa_response.get("CheckoutRequestID")
                db.commit()
            
            # Return mpesa details for the frontend to handle
            return {
                "order_id": str(new_order.id),
                "status": "PENDING",
                "total": total_amount,
                "mpesa_status": mpesa_response.get("ResponseDescription"),
                "checkout_id": new_order.mpesa_checkout_id,
                "message": "Identity Handshake Initialized. Please check your phone for the M-Pesa prompt."
            }
        except Exception as e:
            print(f"M-Pesa STK Push Error: {str(e)}")
            # Fallback response if STK fail
            return {
                "order_id": str(new_order.id),
                "status": "PENDING",
                "total": total_amount,
                "message": "Order saved but M-Pesa prompt failed. Please contact support."
            }

    return {
        "order_id": str(new_order.id),
        "status": "PENDING",
        "total": total_amount,
        "message": "Order initialized successfully."
    }
