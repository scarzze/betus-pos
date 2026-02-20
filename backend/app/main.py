from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import (
    auth,
    users,
    products,
    sales,
    dashboard,
    reports,
    mpesa,
    websocket,
)
from app.models.user import User
from app.core.security import hash_password
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

app = FastAPI(
    title="VinLex Electronics POS",
    version="1.0.0"
)

# ==============================
# Default Super Admin Seed
# ==============================

def seed_super_admin():
    db: Session = SessionLocal()
    if not db.query(User).filter(User.email == "hydancheru@gmail.com").first():
        user = User(
            email="hydancheru@gmail.com",
            hashed_password=hash_password("DanHacks@2030"),
            role="SUPER_ADMIN",
            organization_id=None,
            branch_id=None,
            is_active=True
        )
        db.add(user)
        db.commit()
    db.close()

seed_super_admin()
# ==============================
# CORS (for Vercel frontend)
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Create tables (DEV ONLY)
# In production use Alembic
# ==============================
Base.metadata.create_all(bind=engine)

# ==============================
# Register Routers
# ==============================
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(mpesa.router, prefix="/api/mpesa", tags=["M-Pesa"])
app.include_router(websocket.router)

@app.get("/")
def health_check():
    return {"status": "VinLex Backend Running"}
