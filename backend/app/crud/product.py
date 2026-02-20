from sqlalchemy.orm import Session
from app.models.product import Product
from app.utils.sku import generate_sku


def create_product(db: Session, product_data):
    product = Product(
        name=product_data.name,
        buying_price=product_data.buying_price,
        selling_price=product_data.selling_price,
        stock_quantity=product_data.stock_quantity,
        low_stock_threshold=5,
        sku=generate_sku(product_data.name),
        imei_tracking=product_data.imei_tracking,
        branch_id=product_data.branch_id,
        organization_id=product_data.organization_id
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products_by_branch(db: Session, branch_id):
    return db.query(Product).filter(Product.branch_id == branch_id).all()


def get_product_by_id(db: Session, product_id):
    return db.query(Product).filter(Product.id == product_id).first()


def update_product(db: Session, product_id, data: dict):
    product = get_product_by_id(db, product_id)
    if not product:
        return None
    for key, value in data.items():
        setattr(product, key, value)
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


def check_low_stock(db: Session, branch_id):
    return db.query(Product).filter(
        Product.branch_id == branch_id,
        Product.stock_quantity <= Product.low_stock_threshold
    ).all()
