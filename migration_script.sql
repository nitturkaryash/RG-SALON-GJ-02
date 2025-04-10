-- Step 1: Insert data from sales table
INSERT INTO sales_history (
    product_id,
    product_name,
    hsn_code,
    unit,
    quantity,
    price_excl_gst,
    gst_percentage,
    discount_percentage,
    taxable_value,
    cgst,
    sgst,
    igst,
    total_value,
    customer_name,
    stylist_name,
    payment_method,
    invoice_number,
    is_salon_consumption,
    created_at
)
SELECT 
    s.product_id,
    COALESCE(p.name, 'Unknown Product') as product_name,
    COALESCE(p.hsn_code, '') as hsn_code,
    COALESCE(p.units, '') as unit,
    COALESCE(s.quantity, 0) as quantity,
    COALESCE(s.price_excl_gst, 0) as price_excl_gst,
    COALESCE(s.gst_percentage, 0) as gst_percentage,
    COALESCE(s.discount_percentage, 0) as discount_percentage,
    COALESCE(s.taxable_value, 0) as taxable_value,
    COALESCE(s.cgst, 0) as cgst,
    COALESCE(s.sgst, 0) as sgst,
    COALESCE(s.igst, 0) as igst,
    COALESCE(s.total_value, 0) as total_value,
    COALESCE(s.customer_name, 'Walk-in Customer') as customer_name,
    COALESCE(s.stylist_name, 'Self Service') as stylist_name,
    COALESCE(s.payment_method, 'Cash') as payment_method,
    COALESCE(s.invoice_number, '') as invoice_number,
    COALESCE(s.is_salon_consumption, false) as is_salon_consumption,
    s.created_at
FROM 
    sales s
LEFT JOIN 
    products p ON s.product_id = p.id
WHERE 
    s.product_id IS NOT NULL;

-- Optionally, also insert data from the sales table if it exists and has relevant data
-- Uncomment and adjust if needed
/*
INSERT INTO sales_history (
    product_id,
    product_name,
    hsn_code,
    unit,
    quantity,
    price_excl_gst,
    gst_percentage,
    discount_percentage,
    taxable_value,
    cgst,
    sgst,
    igst,
    total_value,
    customer_name,
    stylist_name,
    payment_method,
    invoice_number,
    is_salon_consumption,
    created_at
)
SELECT 
    s.product_id,
    COALESCE(p.name, 'Unknown Product') as product_name,
    COALESCE(p.hsn_code, '') as hsn_code,
    COALESCE(p.units, '') as unit,
    COALESCE(s.quantity, 0) as quantity,
    COALESCE(s.price_excl_gst, 0) as price_excl_gst,
    COALESCE(s.gst_percentage, 0) as gst_percentage,
    COALESCE(s.discount_percentage, 0) as discount_percentage,
    COALESCE(s.taxable_value, 0) as taxable_value,
    COALESCE(s.cgst, 0) as cgst,
    COALESCE(s.sgst, 0) as sgst,
    COALESCE(s.igst, 0) as igst,
    COALESCE(s.total_value, 0) as total_value,
    COALESCE(s.customer_name, 'Walk-in Customer') as customer_name,
    COALESCE(s.stylist_name, 'Self Service') as stylist_name,
    COALESCE(s.payment_method, 'Cash') as payment_method,
    COALESCE(s.invoice_number, '') as invoice_number,
    false as is_salon_consumption,
    s.created_at
FROM 
    sales s
LEFT JOIN 
    products p ON s.product_id = p.id
WHERE 
    s.product_id IS NOT NULL;
*/

-- Add a check to verify the data has been migrated successfully
SELECT COUNT(*) as migrated_records FROM sales_history; 