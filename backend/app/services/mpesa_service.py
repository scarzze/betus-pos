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

    try:
        response = requests.get(
            url,
            auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
            timeout=10
        )
        data = response.json()
        if "access_token" not in data:
            print(f"M-Pesa Auth Error: {data}")
            raise Exception(f"Failed to get access token: {data.get('errorMessage', 'Unknown error')}")
        return data["access_token"]
    except Exception as e:
        print(f"M-Pesa Auth Connection Error: {str(e)}")
        raise e

def stk_push(phone: str, amount: int, reference: str):
    # Normalize phone to 2547XXXXXXXX format
    phone = phone.strip().replace("+", "")
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif not phone.startswith("254"):
        phone = "254" + phone

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
        "AccountReference": str(reference)[:12], # SAFARICOM LIMIT: 12 chars
        "TransactionDesc": "Betus POS Payment"
    }

    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        return {"ResponseCode": "1", "errorMessage": f"Connection Error: {str(e)}"}
