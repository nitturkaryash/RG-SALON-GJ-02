-- Backup existing data
CREATE TEMPORARY TABLE IF NOT EXISTS products_backup AS SELECT * FROM products;

-- Drop existing table
DROP TABLE IF EXISTS products CASCADE;

-- Recreate table with proper schema
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  product_name TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  mrp_incl_gst NUMERIC NOT NULL DEFAULT 0,
  mrp_excl_gst NUMERIC NOT NULL DEFAULT 0,
  gst_percentage NUMERIC NOT NULL DEFAULT 18,
  hsn_code TEXT,
  units TEXT,
  unit_type TEXT,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_hsn_code ON products(hsn_code);
CREATE INDEX idx_products_gst_percentage ON products(gst_percentage);

-- Restore data with proper GST calculations
INSERT INTO products (
  id, name, description, price, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  hsn_code, units, stock_quantity, category, active,
  created_at, updated_at
)
SELECT 
  id, name, description, price,
  COALESCE(mrp_incl_gst, price) as mrp_incl_gst,
  COALESCE(mrp_excl_gst, price / (1 + (COALESCE(gst_percentage, 18) / 100))) as mrp_excl_gst,
  COALESCE(gst_percentage, 18) as gst_percentage,
  hsn_code, units, stock_quantity, category, active,
  created_at, updated_at
FROM products_backup;

-- Drop the temporary table
DROP TABLE IF EXISTS products_backup; 