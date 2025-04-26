-- Migration to create the sales_product_new table
-- This should be applied through the Supabase Studio SQL Editor or via migrations

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the sales_product_new table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_product_new (
  serial_no TEXT PRIMARY KEY,
  order_id TEXT,
  date TEXT,
  product_name TEXT,
  quantity TEXT,
  unit_price_ex_gst TEXT,
  gst_percentage TEXT,
  taxable_value TEXT,
  cgst_amount TEXT,
  sgst_amount TEXT,
  total_purchase_cost TEXT,
  discount TEXT,
  tax TEXT,
  payment_amount TEXT,
  payment_method TEXT,
  payment_date TEXT
);

-- Create relevant indexes
CREATE INDEX IF NOT EXISTS idx_sales_product_new_date ON sales_product_new(date);
CREATE INDEX IF NOT EXISTS idx_sales_product_new_product ON sales_product_new(product_name);
CREATE INDEX IF NOT EXISTS idx_sales_product_new_order ON sales_product_new(order_id);

-- Insert sample data if the table is empty
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO record_count FROM sales_product_new;
  
  IF record_count = 0 THEN
    INSERT INTO "public"."sales_product_new" ("serial_no", "order_id", "date", "product_name", "quantity", "unit_price_ex_gst", "gst_percentage", "taxable_value", "cgst_amount", "sgst_amount", "total_purchase_cost", "discount", "tax", "payment_amount", "payment_method", "payment_date") 
    VALUES 
      ('SALES-01', '07233b3f-93a7-4bd8-aa06-c58b64af26c7', '2025-04-20', 'shampoo', '1', '1694.92', null, '1694.92', null, null, null, '400', '610.1712', '3200.01008', 'cash', '2025-04-20 12:08:27.964'), 
      ('SALES-02', '07233b3f-93a7-4bd8-aa06-c58b64af26c7', '2025-04-20', 'shampoo', '1', '1694.92', null, '1694.92', null, null, null, '400', '610.1712', '3200.01008', 'cash', '2025-04-20 12:08:27.964'), 
      ('SALES-03', 'e0182555-9572-469d-b40f-c74acc250e35', '2025-04-20', 'facemask', '1', '500', null, '500.00', null, null, null, '200', '90', '0', null, null);
    
    RAISE NOTICE 'Sample data inserted into sales_product_new table';
  ELSE
    RAISE NOTICE 'Table sales_product_new already has data, skipping sample data insertion';
  END IF;
END
$$; 