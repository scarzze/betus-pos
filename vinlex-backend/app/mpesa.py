import requests
import base64
from datetime import datetime
from .config import(
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_URL
)

def get_access_token():
  url = "https://sandbox.safaricom.co.ke/oath/v1/generate?grant_type_=client_credentials"
  response = requests.get(url, auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET))
  return response.json()["access_token"]

def stk_push(phone, amount, reference):
  access_token = get_access_token()
  url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
password = base64.b64encode(
  (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
).decode()

payload = {
  "BusinessShortCode": MPESA_SHORTCODE,
  "Password": password,
  "Timestamp": timestamp,
  "TransactionType": "CustomerPayBillOnline",
  "Amount": amount,
  "PartyA": phone,
  "PartyB": MPESA_SHORTCODE,
  "PhoneNumber": phone,
  "CallBackURL": CALLBACK_URL,
  "AccountReference": reference,
  "TransactionDesc": "VinLex Electronics and Mobile Accessories Payment
  
}

header = {"Authorization": f"Bearer {access_token}"}

response = requests.post(url, json=payload, headers=headers)
return response.json()
