import requests
import base64
from datetime import datetime
from app.core.config import settings

def generate_password():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    data = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + timestamp
    password = base64.b64encode(data.encode()).decode()
    return password, timestamp

def get_access_token():
    url = (
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        if settings.MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    )

    response = requests.get(
        url,
        auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET)
    )
    return response.json()["access_token"]

def stk_push(phone, amount, reference):
    password, timestamp = generate_password()
    token = get_access_token()

    url = (
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        if settings.MPESA_ENV == "sandbox"
        else "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    )

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": reference,
        "TransactionDesc": "VinLex POS Payment"
    }

    headers = {"Authorization": f"Bearer {token}"}

    return requests.post(url, json=payload, headers=headers).json()
