-- Check if sales table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sales'
) as "sales_table_exists";

-- Count rows in sales table
SELECT COUNT(*) as total_sales_records FROM sales; 