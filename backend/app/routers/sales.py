from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.sale import SaleCreate, SaleOut
from app.services.sale_service import create_sale
from app.models.sale import Sale
from app.core.rbac import require_roles

router = APIRouter()


@router.post("/", response_model=SaleOut)
def new_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    org_id = str(user["org"])
    return create_sale(db, sale, org_id)


@router.get("/branch/{branch_id}", response_model=list[SaleOut])
def list_sales(
    branch_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN"]))
):
    return db.query(Sale).filter(Sale.branch_id == branch_id).order_by(Sale.created_at.desc()).all()


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_roles(["SUPER_ADMIN", "ADMIN", "SALES"]))
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
