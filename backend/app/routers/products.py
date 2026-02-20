from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.crud.product import (
    create_product,
    get_products_by_branch,
    get_product_by_id,
    update_product,
    delete_product,
    check_low_stock
)
from app.core.rbac import require_roles

router = APIRouter()


@router.post("/", response_model=ProductOut)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return create_product(db, product)


@router.get("/branch/{branch_id}", response_model=list[ProductOut])
def list_products(
    branch_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    return get_products_by_branch(db, branch_id)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def edit_product(
    product_id: UUID,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    updated = update_product(db, product_id, product.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


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


@router.get("/low-stock/branch/{branch_id}", response_model=list[ProductOut])
def low_stock_products(
    branch_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return check_low_stock(db, branch_id)
