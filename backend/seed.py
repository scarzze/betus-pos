"""
Seed script: creates the Betus org + super admin user.
Run once after creating the DB:
  cd backend
  python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import engine, SessionLocal, Base
from app.models import organization, user, branch, product, sale, sale_items, payment  # ensure all models are imported
from app.core.security import hash_password
import uuid

def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        from app.models.organization import Organization
        from app.models.user import User

        # Check if already seeded
        if db.query(User).count() > 0:
            print("✅ Already seeded — skipping.")
            return

        # Create default org
        org = Organization(
            id=uuid.uuid4(),
            name="Betus",
            subscription_plan="PRO",
        )
        db.add(org)
        db.flush()

        # Create super admin
        admin = User(
            id=uuid.uuid4(),
            email="admin@betus.co.ke",
            hashed_password=hash_password("betus2024"),
            role="SUPER_ADMIN",
            organization_id=org.id,
            is_active=True,
        )
        db.add(admin)
        db.commit()

        print("✅ Seeded successfully!")
        print("   Email   : admin@betus.co.ke")
        print("   Password: betus2024")
        print("   Role    : SUPER_ADMIN")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
