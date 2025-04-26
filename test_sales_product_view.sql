-- Check if sales_product_new view exists
SELECT EXISTS (
   SELECT FROM pg_views
   WHERE viewname = 'sales_product_new'
) AS view_exists;

-- Show the columns of the view
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'sales_product_new'
ORDER BY 
    ordinal_position;

-- Retrieve a sample of 5 records (to verify data)
SELECT * FROM sales_product_new LIMIT 5; 