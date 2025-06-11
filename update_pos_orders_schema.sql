-- Update pos_orders table schema to match code expectations

-- First, check if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pos_orders') THEN
    -- Add missing columns to pos_orders table
    ALTER TABLE pos_orders 
    ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS client_name TEXT,
    ADD COLUMN IF NOT EXISTS consumption_purpose TEXT,
    ADD COLUMN IF NOT EXISTS consumption_notes TEXT,
    ADD COLUMN IF NOT EXISTS total FLOAT,
    ADD COLUMN IF NOT EXISTS type TEXT,
    ADD COLUMN IF NOT EXISTS is_salon_consumption BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS status TEXT,
    ADD COLUMN IF NOT EXISTS payment_method TEXT,
    ADD COLUMN IF NOT EXISTS stylist_id TEXT,
    ADD COLUMN IF NOT EXISTS services JSONB,
    ADD COLUMN IF NOT EXISTS subtotal FLOAT,
    ADD COLUMN IF NOT EXISTS tax FLOAT,
    ADD COLUMN IF NOT EXISTS discount FLOAT,
    ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS payments JSONB,
    ADD COLUMN IF NOT EXISTS pending_amount FLOAT,
    ADD COLUMN IF NOT EXISTS is_split_payment BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS appointment_id TEXT,
    ADD COLUMN IF NOT EXISTS is_salon_purchase BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stylist_name TEXT,
    ADD COLUMN IF NOT EXISTS order_id TEXT,
    ADD COLUMN IF NOT EXISTS customer_name TEXT,
    ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS total_amount FLOAT,
    ADD COLUMN IF NOT EXISTS appointment_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS discount_percentage FLOAT,
    ADD COLUMN IF NOT EXISTS requisition_voucher_no TEXT,
    ADD COLUMN IF NOT EXISTS stock_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS current_stock TEXT;
    
    -- Ensure total_amount and total fields are synchronized
    CREATE OR REPLACE FUNCTION sync_total_fields() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.total IS NULL AND NEW.total_amount IS NOT NULL THEN
        NEW.total := NEW.total_amount;
      ELSIF NEW.total_amount IS NULL AND NEW.total IS NOT NULL THEN
        NEW.total_amount := NEW.total;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS sync_total_trigger ON pos_orders;
    CREATE TRIGGER sync_total_trigger
    BEFORE INSERT OR UPDATE ON pos_orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_total_fields();
    
    -- Similarly, sync customer_name and client_name
    CREATE OR REPLACE FUNCTION sync_customer_fields() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.client_name IS NULL AND NEW.customer_name IS NOT NULL THEN
        NEW.client_name := NEW.customer_name;
      ELSIF NEW.customer_name IS NULL AND NEW.client_name IS NOT NULL THEN
        NEW.customer_name := NEW.client_name;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS sync_customer_trigger ON pos_orders;
    CREATE TRIGGER sync_customer_trigger
    BEFORE INSERT OR UPDATE ON pos_orders
    FOR EACH ROW
    EXECUTE FUNCTION sync_customer_fields();
    
    RAISE NOTICE 'Successfully updated pos_orders table schema';
  ELSE
    RAISE NOTICE 'pos_orders table does not exist, please create it first';
  END IF;
END $$;

-- Check table structure after changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pos_orders'
ORDER BY ordinal_position; 