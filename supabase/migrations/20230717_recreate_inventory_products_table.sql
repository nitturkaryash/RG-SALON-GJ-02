-- Backup existing data
CREATE TEMPORARY TABLE IF NOT EXISTS inventory_products_backup AS 
SELECT * FROM inventory_products WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'inventory_products'
);

-- Drop existing table
DROP TABLE IF EXISTS inventory_products CASCADE;

-- Recreate table with proper schema
CREATE TABLE inventory_products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  hsn_code TEXT,
  units TEXT,
  unit_type TEXT,
  mrp_incl_gst NUMERIC NOT NULL DEFAULT 0,
  mrp_excl_gst NUMERIC NOT NULL DEFAULT 0,
  gst_percentage NUMERIC NOT NULL DEFAULT 18,
  discount_on_purchase_percentage NUMERIC DEFAULT 0,
  stock_quantity NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_products_name ON inventory_products(product_name);
CREATE INDEX idx_inventory_products_hsn_code ON inventory_products(hsn_code);
CREATE INDEX idx_inventory_products_status ON inventory_products(status);

-- Restore data with proper GST calculations if backup exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'pg_temp' AND table_name = 'inventory_products_backup'
  ) THEN
    INSERT INTO inventory_products (
      product_id, product_name, hsn_code, units, 
      mrp_incl_gst, mrp_excl_gst, gst_percentage,
      discount_on_purchase_percentage, stock_quantity, status,
      created_at, updated_at
    )
    SELECT 
      product_id, product_name, hsn_code, units,
      COALESCE(mrp_incl_gst, 0) as mrp_incl_gst,
      COALESCE(mrp_excl_gst, COALESCE(mrp_incl_gst, 0) / (1 + (COALESCE(gst_percentage, 18) / 100))) as mrp_excl_gst,
      COALESCE(gst_percentage, 18) as gst_percentage,
      COALESCE(discount_on_purchase_percentage, 0), 
      COALESCE(stock_quantity, 0), 
      COALESCE(status, 'active'),
      created_at, updated_at
    FROM inventory_products_backup;
  END IF;
END $$;

-- Drop the temporary table
DROP TABLE IF EXISTS inventory_products_backup; 