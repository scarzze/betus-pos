import psycopg2
from app.core.config import settings

def migrate():
    print("Initiating Schema Migration: E-commerce Integration...")
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cur = conn.cursor()
        
        # 1. Expand Product table
        print("Expanding 'products' table for storefront metadata...")
        cur.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;")
        cur.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR;")
        cur.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;")
        cur.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;")
        
        # 2. Create OnlineOrder table (primitive version via SQL for speed)
        print("Creating 'online_orders' table architecture...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS online_orders (
                id UUID PRIMARY KEY,
                customer_name VARCHAR,
                customer_email VARCHAR,
                customer_phone VARCHAR,
                shipping_address TEXT,
                total_amount FLOAT,
                status VARCHAR DEFAULT 'PENDING',
                payment_method VARCHAR,
                payment_reference VARCHAR,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                items JSONB,
                pos_sale_id UUID REFERENCES sales(id)
            );
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration Successful: Unified Commerce architecture initialized.")
    except Exception as e:
        print(f"Migration Failed: {str(e)}")

if __name__ == "__main__":
    migrate()
