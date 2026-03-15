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

import traceback
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    with open("error.log", "a") as f:
        f.write(f"\n--- ERROR ON {request.url.path} ---\n")
        traceback.print_exc(file=f)
    print(f"500 Error intercepted: {exc}")
    return JSONResponse(status_code=500, content={"detail": str(exc)})


# ==============================
# CORS (for frontend)
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Facilitates Netlify <-> Render communication
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

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Serve the compiled React Frontend (dist folder)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# For Docker, dist is placed next to app directory. Locally, it's one level up from backend.
FRONTEND_DIST = os.path.join(BASE_DIR, "dist") if os.path.exists(os.path.join(BASE_DIR, "dist")) else os.path.join(os.path.dirname(BASE_DIR), "dist")

if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{file_path:path}")
    async def serve_spa_and_static(file_path: str):
        # Do not catch API routes
        if file_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
            
        full_path = os.path.join(FRONTEND_DIST, file_path)
        if os.path.isfile(full_path):
            return FileResponse(full_path)
            
        # Fallback to index.html for SPA routing
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
            
        return JSONResponse(status_code=404, content={"detail": "Frontend application not built"})
