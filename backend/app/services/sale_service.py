from sqlalchemy.orm import Session
from app.models.sale import Sale
from app.models.sale_items import SaleItem
from app.models.product import Product
from app.models.imei_records import IMEIRecord
from app.websocket_manager import manager
from fastapi import HTTPException
from decimal import Decimal

def create_sale(db: Session, sale_data, org_id: str):
    try:
        total_amount = Decimal(0)
        sale = Sale(
            branch_id=sale_data.branch_id,
            organization_id=sale_data.organization_id,
            payment_method=sale_data.payment_method,
            payment_status="PENDING"
        )
        db.add(sale)
        db.flush()  # assign ID before items

        for item in sale_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

            if product.stock_quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

            # Deduct stock
            product.stock_quantity -= item.quantity
            db.add(product)

            # Calculate total
            total_amount += product.selling_price * item.quantity

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=item.quantity,
                selling_price=product.selling_price,
                buying_price=product.buying_price
            )
            db.add(sale_item)

            # IMEI tracking
            if product.imei_tracking and item.imei_numbers:
                for imei in item.imei_numbers:
                    imei_record = IMEIRecord(
                        sale_id=sale.id,
                        product_id=product.id,
                        imei=imei
                    )
                    db.add(imei_record)

        sale.total_amount = total_amount
        db.commit()
        db.refresh(sale)

        # Broadcast new sale via WebSocket
        import asyncio
        asyncio.create_task(manager.broadcast(
            str(org_id),
            {
                "type": "new_sale",
                "sale_id": str(sale.id),
                "total_amount": float(sale.total_amount)
            }
        ))

        return sale

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
