-- Drop existing table if exists and create exact table structure
DROP TABLE IF EXISTS public.sales_products;

-- Create the table with exact column names
CREATE TABLE public.sales_products (
  "serial_no" TEXT PRIMARY KEY,
  "order_id" TEXT,
  "date" TEXT,
  "product_name" TEXT,
  "quantity" TEXT,
  "unit_price_ex_gst" TEXT,
  "gst_percentage" TEXT,
  "taxable_value" TEXT,
  "cgst_amount" TEXT,
  "sgst_amount" TEXT,
  "total_purchase_cost" TEXT,
  "discount" TEXT,
  "tax" TEXT,
  "payment_amount" TEXT,
  "payment_method" TEXT,
  "payment_date" TEXT
);

-- Insert exact data
INSERT INTO "public"."sales_products" ("serial_no", "order_id", "date", "product_name", "quantity", "unit_price_ex_gst", "gst_percentage", "taxable_value", "cgst_amount", "sgst_amount", "total_purchase_cost", "discount", "tax", "payment_amount", "payment_method", "payment_date") 
VALUES 
('SALES-01', '9825edc8-0943-4f49-a0e2-2b0534d9d105', '2025-04-09', 'facemask', '1', '590', '18', '590.00', '53.10', '53.10', '696.20', '0', '160', '1050', 'cash', '2025-04-09 12:34:23.581'), 
('SALES-02', '66bc3fd4-78f2-4a73-8514-b605f078e845', '2025-04-09', 'hair fall control shampoo', '1', '5310', '18', '5310.00', '477.90', '477.90', '6265.80', '0', '1912', '12532', 'cash', '2025-04-09 12:34:57.902'), 
('SALES-03', '66bc3fd4-78f2-4a73-8514-b605f078e845', '2025-04-09', 'hair fall control shampoo', '1', '5310', '18', '5310.00', '477.90', '477.90', '6265.80', '0', '1912', '12532', 'cash', '2025-04-09 12:34:57.902'); 