from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.mpesa_service import stk_push
from app.models.sale import Sale
from app.models.payment import Payment
from app.websocket_manager import manager
from uuid import UUID

router = APIRouter()


# ==============================
# 1️⃣ Initiate STK Push
# ==============================

@router.post("/stk/{sale_id}")
def initiate_stk(
    sale_id: UUID,
    phone: str,
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    if sale.payment_status == "PAID":
        raise HTTPException(status_code=400, detail="Already paid")

    try:
        # Use sale_number as reference (short and recognizable on phone)
        response = stk_push(
            phone=phone,
            amount=int(sale.total_amount),
            reference=sale.sale_number or str(sale.id)[:12]
        )
        
        if response.get("ResponseCode") != "0":
            error_msg = response.get("errorMessage") or response.get("CustomerMessage") or "Safaricom Handshake Refused"
            raise HTTPException(status_code=400, detail=f"M-Pesa Error: {error_msg}")

        # Store the CheckoutRequestID to link with the callback later
        sale.mpesa_checkout_id = response.get("CheckoutRequestID")
        db.commit()

        return {
            "message": "STK push sent",
            "mpesa_response": response
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        if isinstance(e, HTTPException): raise e
        # Check if it's an AttributeError (likely migration issue)
        detail = str(e)
        if "mpesa_checkout_id" in detail:
            detail = "Critical System Error: M-Pesa telemetry field not found in database. Please ensure migrations are applied and server is restarted."
        raise HTTPException(status_code=500, detail=f"Internal Gateway Error: {detail}")


# ==============================
# 2️⃣ Daraja Callback Endpoint
# ==============================

from app.models.online_order import OnlineOrder

# ... existing code ...

@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    data = await request.json()

    try:
        callback = data["Body"]["stkCallback"]
        result_code = callback["ResultCode"]
        checkout_request_id = callback["CheckoutRequestID"]
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid callback format")

    metadata = callback.get("CallbackMetadata", {}).get("Item", [])
    transaction_code = None
    amount = None
    
    for item in metadata:
        if item["Name"] == "MpesaReceiptNumber":
            transaction_code = item["Value"]
        elif item["Name"] == "Amount":
            amount = item["Value"]

    # The most reliable way to find the record is by CheckoutRequestID
    # Check Online Orders first
    target = db.query(OnlineOrder).filter(OnlineOrder.mpesa_checkout_id == checkout_request_id).first()
    is_web = True
    
    if not target:
        # Check POS Sales
        target = db.query(Sale).filter(Sale.mpesa_checkout_id == checkout_request_id).first()
        is_web = False

    if not target:
        # Fallback to AccountReference if CheckoutRequestID lookup fails
        reference_raw = callback.get("AccountReference", "")
        if reference_raw.startswith("WEB_"):
             order_id = reference_raw.replace("WEB_", "")
             target = db.query(OnlineOrder).filter(OnlineOrder.id == order_id).first()
             is_web = True
        else:
             target = db.query(Sale).filter((Sale.id == reference_raw) | (Sale.sale_number == reference_raw)).first()
             is_web = False

    if not target:
        return {"ResultCode": 0, "ResultDesc": "Accepted (Target Not Found)"}

    if result_code == 0:
        target.status = "PAID" if is_web else "COMPLETED"
        if not is_web:
            target.payment_status = "PAID"

        payment = Payment(
            sale_id=target.id if not is_web else None,
            amount=amount,
            method="MPESA",
            status="SUCCESS",
            transaction_code=transaction_code
        )
        db.add(payment)
        db.commit()

        # Real-time broadcast
        msg_type = "web_order_paid" if is_web else "payment_success"
        await manager.broadcast(
            str(target.organization_id) if not is_web else "GLOBAL", # Web orders broadcast to all admins
            {
                "type": msg_type,
                "id": str(target.id),
                "transaction_code": transaction_code
            }
        )
    else:
        target.status = "FAILED"
        if not is_web:
            target.payment_status = "FAILED"
        db.commit()

    return {"ResultCode": 0, "ResultDesc": "Accepted"}
