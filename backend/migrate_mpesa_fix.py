import psycopg2
from app.core.config import settings

def migrate():
    # Parse connection string
    # DATABASE_URL: "postgresql://betus:betus@localhost:5432/betus"
    conn = psycopg2.connect(settings.DATABASE_URL)
    cur = conn.cursor()
    
    try:
        print("Starting migration: Adding mpesa_checkout_id to sales and online_orders...")
        
        # Add column to sales
        cur.execute("""
            ALTER TABLE sales 
            ADD COLUMN IF NOT EXISTS mpesa_checkout_id VARCHAR;
        """)
        
        # Add column to online_orders
        cur.execute("""
            ALTER TABLE online_orders 
            ADD COLUMN IF NOT EXISTS mpesa_checkout_id VARCHAR;
        """)
        
        conn.commit()
        print("✅ Migration successful: Columns added.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    migrate()
