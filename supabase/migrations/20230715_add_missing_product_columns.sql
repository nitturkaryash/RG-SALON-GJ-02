-- Add missing columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS mrp_incl_gst NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS mrp_excl_gst NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_percentage NUMERIC DEFAULT 18,
ADD COLUMN IF NOT EXISTS hsn_code TEXT,
ADD COLUMN IF NOT EXISTS units TEXT;

-- Create a function to update the schema (used to update existing entries)
CREATE OR REPLACE FUNCTION update_product_gst_values()
RETURNS VOID AS $$
BEGIN
  -- Update mrp_excl_gst for all existing products
  UPDATE products
  SET mrp_excl_gst = price / (1 + (gst_percentage / 100)),
      mrp_incl_gst = price
  WHERE mrp_incl_gst = 0 OR mrp_excl_gst = 0;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT update_product_gst_values();

-- Drop the function after it's been used
DROP FUNCTION IF EXISTS update_product_gst_values();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_hsn_code ON products(hsn_code);
CREATE INDEX IF NOT EXISTS idx_products_gst_percentage ON products(gst_percentage); 