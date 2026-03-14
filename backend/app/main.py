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
    expenses,
    customers,
    settings,
    audit,
    shop,
    web_orders,
)

app = FastAPI(
    title="Betus Electronics POS",
    version="1.0.0"
)

# ==============================
# CORS (for frontend)
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Security Headers Middleware
# ==============================
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' *;"
    return response

# ==============================
# Create tables (DEV ONLY — use Alembic in production)
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
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(shop.router, prefix="/api/shop", tags=["Shop"])
app.include_router(web_orders.router, prefix="/api/web-orders", tags=["Web Orders"])
app.include_router(websocket.router)


@app.get("/")
def health_check():
    return {"status": "Betus Backend Running"}


# ==============================
# Startup: seed super admin
# ==============================
@app.on_event("startup")
def on_startup():
    from app.models.user import User
    from app.core.security import hash_password
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "scarzze@gmail.com").first()
        if not admin_user:
            admin_user = User(
                email="scarzze@gmail.com",
                hashed_password=hash_password("scarzze@2030"),
                role="SUPER_ADMIN",
                organization_id=None,
                branch_id=None,
                is_active=True,
            )
            db.add(admin_user)
        else:
            # Force update password to ensure it matches the latest requirement
            admin_user.hashed_password = hash_password("scarzze@2030")
            admin_user.is_active = True
        
        db.commit()

        # Seed default settings if empty
        from app.models.settings import Settings
        if not db.query(Settings).first():
            config = Settings(
                shop_name="Betus Electronics",
                receipt_footer="Thank you for shopping at Betus!",
                currency="KES"
            )
            db.add(config)
            db.commit()
    finally:
        db.close()
