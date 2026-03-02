from sqlalchemy.orm import Session
from app.models.product import Product
from app.utils.sku import generate_sku


def create_product(db: Session, product_data, org_id=None, branch_id=None):
    product = Product(
        name=product_data.name,
        sku=product_data.sku or generate_sku(product_data.name),
        category=product_data.category,
        buying_price=product_data.buying_price,
        selling_price=product_data.selling_price,
        stock_quantity=product_data.stock,
        low_stock_threshold=product_data.low_stock_threshold,
        imei_tracking=product_data.imei_tracked,
        branch_id=product_data.branch_id or branch_id,
        organization_id=product_data.organization_id or org_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_all_products(db: Session, org_id=None):
    query = db.query(Product)
    if org_id:
        query = query.filter(Product.organization_id == org_id)
    return query.order_by(Product.name).all()


def get_products_by_branch(db: Session, branch_id):
    return db.query(Product).filter(Product.branch_id == branch_id).all()


def get_product_by_id(db: Session, product_id):
    return db.query(Product).filter(Product.id == product_id).first()


def update_product(db: Session, product_id, data: dict):
    product = get_product_by_id(db, product_id)
    if not product:
        return None
    # Map frontend field names → DB column names
    field_map = {"stock": "stock_quantity", "imei_tracked": "imei_tracking"}
    for key, value in data.items():
        db_key = field_map.get(key, key)
        if hasattr(product, db_key):
            setattr(product, db_key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id):
    product = get_product_by_id(db, product_id)
    if not product:
        return None
    db.delete(product)
    db.commit()
    return product


def deduct_stock(db: Session, product_id, qty: int):
    product = get_product_by_id(db, product_id)
    if not product:
        return None
    product.stock_quantity = max(0, product.stock_quantity - qty)
    db.commit()
    db.refresh(product)
    return product


def check_low_stock(db: Session, branch_id):
    return db.query(Product).filter(
        Product.branch_id == branch_id,
        Product.stock_quantity <= Product.low_stock_threshold
    ).all()
