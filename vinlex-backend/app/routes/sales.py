from fastapi import APIRouter
from ..mpesa import stk_push

router = APIRouter(prefix="/sales", tags=["sales"])

@router.post("/mpesa-pay")
def mpesa_payment(phone: str, amount: int, reference: str):
  response = stk_push(phone, amount, reference)
  return response
