from fastapi import FastAPI, Request
from .database import engine, Base
from .routes import users, products, sales, reports

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(reports.router)

@app.post("/mpesa/callback")
async def mpesa_callback(request: Request):
  data = await request.json()
  print("M-Pesa Callback:", data)
  return {"ResultCode": 0, "ResultDesc": "Accepted"}
