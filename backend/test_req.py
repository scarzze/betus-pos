import requests
import json
import uuid

# Test the sales endpoint with a valid payload
payload = {
    "sale_number": "TEST-1234",
    "payment_method": "mpesa",
    "total_amount": 1,
    "total_cost": 0,
    "profit": 0,
    "status": "completed",
    "items": [
        {
            "product_id": str(uuid.uuid4()),  # This might fail Foreign Key check if product doesn't exist
            "quantity": 1,
            "selling_price": 1,
            "buying_price": 0,
            "subtotal": 1
        }
    ]
}

# The sales endpoint requires auth, so we can't test it directly without a token.
# But what about STK push? Let's just create a test route momentarily in mpesa.py.
