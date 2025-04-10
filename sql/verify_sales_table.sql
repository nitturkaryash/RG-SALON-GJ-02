-- Check the structure of the sales table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'sales'
ORDER BY ordinal_position;

-- Check for any recent sales data
SELECT 
    s.id,
    s.created_at,
    p.name as product_name,
    s.quantity,
    s.price_excl_gst,
    s.gst_percentage,
    s.taxable_value,
    s.cgst,
    s.sgst,
    s.igst,
    s.total_value,
    s.customer_name,
    s.stylist_name,
    s.payment_method,
    s.invoice_number,
    s.order_id
FROM 
    sales s
LEFT JOIN 
    products p ON s.product_id = p.id
ORDER BY 
    s.created_at DESC
LIMIT 10;

-- Count sales records by payment method
SELECT 
    payment_method, 
    COUNT(*) as record_count,
    SUM(total_value) as total_sales
FROM 
    sales
GROUP BY 
    payment_method
ORDER BY 
    record_count DESC;

-- Check for missing product references
SELECT 
    id,
    product_id,
    created_at
FROM 
    sales
WHERE 
    product_id NOT IN (SELECT id FROM products)
LIMIT 10; 