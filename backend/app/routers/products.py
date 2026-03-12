from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.crud.product import (
    create_product,
    get_all_products,
    get_products_by_branch,
    get_product_by_id,
    update_product,
    delete_product,
    deduct_stock,
    check_low_stock,
)
from app.core.rbac import require_roles

router = APIRouter()


# ─── List all products (org-scoped from JWT) ──────────────────────────────────
@router.get("", response_model=list[ProductOut])
def list_all_products(
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    org_id = user.get("org")
    products = get_all_products(db, org_id)
    return [ProductOut.from_orm(p) for p in products]


# ─── Add product ──────────────────────────────────────────────────────────────
@router.post("", response_model=ProductOut)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    org_id = user.get("org")
    branch_id = user.get("branch")
    p = create_product(db, product, org_id=org_id, branch_id=branch_id)
    return ProductOut.from_orm(p)


# ─── List products by branch ──────────────────────────────────────────────────
@router.get("/branch/{branch_id}", response_model=list[ProductOut])
def list_products(
    branch_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    return [ProductOut.from_orm(p) for p in get_products_by_branch(db, branch_id)]


# ─── Deduct stock (called by Sales page after completing a sale) ───────────────
@router.post("/{product_id}/deduct")
def deduct_product_stock(
    product_id: UUID,
    payload: dict,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    qty = payload.get("qty", 0)
    product = deduct_stock(db, product_id, qty)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Stock deducted", "stock": product.stock_quantity}


# ─── Get single product ───────────────────────────────────────────────────────
@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductOut.from_orm(product)


# ─── Update product ───────────────────────────────────────────────────────────
@router.put("/{product_id}", response_model=ProductOut)
def edit_product(
    product_id: UUID,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    updated = update_product(db, product_id, product.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductOut.from_orm(updated)


# ─── Delete product ───────────────────────────────────────────────────────────
@router.delete("/{product_id}")
def remove_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN"]))
):
    deleted = delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


# ─── Low stock check ──────────────────────────────────────────────────────────
@router.get("/low-stock/branch/{branch_id}", response_model=list[ProductOut])
def low_stock_products(
    branch_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return [ProductOut.from_orm(p) for p in check_low_stock(db, branch_id)]
