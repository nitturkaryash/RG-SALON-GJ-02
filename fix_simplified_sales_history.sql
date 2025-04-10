-- First check what data we currently have
SELECT COUNT(*) FROM simplified_sales_history;

-- Insert a test record that will definitely show up
INSERT INTO simplified_sales_history (
    product_name,
    quantity,
    price,
    gst_percentage,
    tax_amount,
    total_amount,
    customer_name,
    payment_method,
    invoice_number,
    created_at
) VALUES (
    'Test Product',
    1,
    1000.00,
    18.0,
    180.00,
    1180.00,
    'Test Customer',
    'Cash',
    'TEST-001',
    NOW()
) ON CONFLICT DO NOTHING;

-- Check data again
SELECT * FROM simplified_sales_history ORDER BY created_at DESC LIMIT 10;

-- Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'simplified_sales_history';

-- Show RLS policies
SELECT * FROM pg_policies WHERE tablename = 'simplified_sales_history';

-- Refresh our memory of the table structure
\d simplified_sales_history 