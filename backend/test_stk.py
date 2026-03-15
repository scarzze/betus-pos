import requests

try:
    print('Testing STK Push')
    # Use a dummy UUID for sale_id if needed, or we just hit the STK endpoint if we can fake a sale
    # Actually wait, we have to create a sale first
    from app.core.database import SessionLocal
    from app.models.sale import Sale
    import uuid

    db = SessionLocal()
    sale = Sale(id=uuid.uuid4(), total_amount=1, sale_number='TEST-123')
    db.add(sale)
    db.commit()
    db.refresh(sale)
    
    res = requests.post(f'http://localhost:8000/api/mpesa/stk/{sale.id}?phone=254726205091')
    print('STK Result:', res.status_code, res.text)
except Exception as e:
    print('Error:', e)
