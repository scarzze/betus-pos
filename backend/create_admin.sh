#!/bin/bash
cd /home/ybh/whybh/work/betus-pos/backend
source /home/ybh/venvs/dev/bin/activate
python - <<'EOF'
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.organization import Organization
from app.core.security import hash_password
import uuid

Base.metadata.create_all(bind=engine)
db = SessionLocal()

org = db.query(Organization).first()
if not org:
    org = Organization(id=uuid.uuid4(), name='Betus', subscription_plan='PRO')
    db.add(org)
    db.flush()

existing = db.query(User).filter(User.email == 'admin@betus.co.ke').first()
if existing:
    print('User already exists - resetting password')
    existing.hashed_password = hash_password('betus2024')
    existing.is_active = True
else:
    u = User(
        id=uuid.uuid4(),
        email='admin@betus.co.ke',
        hashed_password=hash_password('betus2024'),
        role='SUPER_ADMIN',
        organization_id=org.id,
        is_active=True,
    )
    db.add(u)
    print('Created admin@betus.co.ke / betus2024')

db.commit()
db.close()
print('Done.')
EOF
