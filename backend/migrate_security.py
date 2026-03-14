import psycopg2
from app.core.config import settings

def migrate():
    print("Initiating Schema Migration: Shield Protocol Integration...")
    try:
        # Extract connection details from DATABASE_URL
        # URL format: postgresql://betus:betus@localhost:5432/betus
        conn = psycopg2.connect(settings.DATABASE_URL)
        cur = conn.cursor()
        
        # Add security columns to users table
        print("Expanding 'users' table architecture...")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;")
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration Successful: Defensive columns initialized.")
    except Exception as e:
        print(f"Migration Failed: {str(e)}")

if __name__ == "__main__":
    migrate()
