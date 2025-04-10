-- Update inventory_products table to add all the new fields

-- Add date field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS date TEXT;

-- Add invoice_number field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add purchase_qty field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_qty NUMERIC DEFAULT 1;

-- Add purchase_incl_gst field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_incl_gst NUMERIC DEFAULT 0;

-- Add purchase_excl_gst field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_excl_gst NUMERIC DEFAULT 0;

-- Add mrp_percentage field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS mrp_percentage NUMERIC DEFAULT 0;

-- Add mrp_per_unit_excl_gst field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS mrp_per_unit_excl_gst NUMERIC DEFAULT 0;

-- Add discount_on_purchase_percentage field (if it doesn't exist)
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS discount_on_purchase_percentage NUMERIC DEFAULT 0;

-- Add purchase_cost_taxable_value field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_cost_taxable_value NUMERIC DEFAULT 0;

-- Add purchase_igst field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_igst NUMERIC DEFAULT 0;

-- Add purchase_cgst field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_cgst NUMERIC DEFAULT 0;

-- Add purchase_sgst field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_sgst NUMERIC DEFAULT 0;

-- Add purchase_invoice_value field
ALTER TABLE inventory_products
ADD COLUMN IF NOT EXISTS purchase_invoice_value NUMERIC DEFAULT 0;

-- Set default date value for existing products
UPDATE inventory_products
SET date = TO_CHAR(created_at, 'YYYY-MM-DD')
WHERE date IS NULL;

-- Set default values for purchase prices based on MRP
UPDATE inventory_products
SET purchase_incl_gst = mrp_incl_gst
WHERE purchase_incl_gst = 0 AND mrp_incl_gst > 0;

UPDATE inventory_products
SET purchase_excl_gst = mrp_excl_gst
WHERE purchase_excl_gst = 0 AND mrp_excl_gst > 0; 