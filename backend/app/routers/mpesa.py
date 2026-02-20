from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.mpesa_service import stk_push
from app.models.sale import Sale
from app.models.payment import Payment
from app.websocket.manager import manager
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

    response = stk_push(
        phone=phone,
        amount=int(sale.total_amount),
        reference=str(sale.id)
    )

    if "ResponseCode" not in response:
        raise HTTPException(status_code=400, detail="Failed to initiate STK")

    return {
        "message": "STK push sent",
        "mpesa_response": response
    }


# ==============================
# 2️⃣ Daraja Callback Endpoint
# ==============================

@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    data = await request.json()

    try:
        callback = data["Body"]["stkCallback"]
        result_code = callback["ResultCode"]
        checkout_request_id = callback["CheckoutRequestID"]

    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid callback format")

    # Extract reference
    metadata = callback.get("CallbackMetadata", {}).get("Item", [])

    transaction_code = None
    amount = None
    phone = None
    reference = None

    for item in metadata:
        if item["Name"] == "MpesaReceiptNumber":
            transaction_code = item["Value"]
        elif item["Name"] == "Amount":
            amount = item["Value"]
        elif item["Name"] == "PhoneNumber":
            phone = item["Value"]

    # The AccountReference was sale_id
    reference = callback.get("AccountReference")

    if not reference:
        return {"ResultCode": 0, "ResultDesc": "Accepted"}

    sale = db.query(Sale).filter(Sale.id == reference).first()

    if not sale:
        return {"ResultCode": 0, "ResultDesc": "Accepted"}

    if result_code == 0:
        sale.payment_status = "PAID"

        payment = Payment(
            sale_id=sale.id,
            amount=amount,
            method="MPESA",
            status="SUCCESS",
            transaction_code=transaction_code
        )
        db.add(payment)
        db.commit()

        # 🔥 Real-time broadcast to frontend
        await manager.broadcast(
            str(sale.organization_id),
            {
                "type": "payment_success",
                "sale_id": str(sale.id),
                "amount": amount,
                "transaction_code": transaction_code
            }
        )

    else:
        sale.payment_status = "FAILED"
        db.commit()

        await manager.broadcast(
            str(sale.organization_id),
            {
                "type": "payment_failed",
                "sale_id": str(sale.id)
            }
        )

    return {"ResultCode": 0, "ResultDesc": "Accepted"}
