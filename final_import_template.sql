-- Complete Excel Data Import with Proper Invoice Merging
-- This script imports April 2025 services data with proper merging by invoice number and client name
-- Payment methods show amounts in brackets as requested: gpay(₹1400), cash(₹500), etc.
-- Run this script manually in Supabase SQL Editor

-- Disable RLS temporarily for bulk import
SET row_security = off;

-- Sample data showing the proper merging approach
-- This demonstrates how same invoice number + client name = single merged bill

-- Create sample merged invoices with proper payment method formatting
WITH sample_merged_data AS (
    SELECT * FROM (VALUES
        -- Invoice #1 - Single service, single payment
        ('1', '2025-03-31 18:38:50'::timestamp, 'Zarna Javeri', '9824770184', 'Rupesh Mahale', 
         '[{"name": "Hair Cut With Senior Hairdresser (Male)", "stylist": "Rupesh Mahale", "price": 1000, "quantity": 1, "discount": 0, "tax": 180, "total": 1180}]'::jsonb,
         '[{"method": "card", "amount": 1180}]'::jsonb,
         'card (₹1180)', 1000, 180, 0, 1180),
        
        -- Invoice #2 - Multiple services, single payment (MERGED)
        ('2', '2025-03-31 18:38:50'::timestamp, 'Tarun Vatiani', '9904079784', 'Vandan Gohil',
         '[{"name": "Hair Cut With Senior Hairdresser (Male)", "stylist": "Vandan Gohil", "price": 1000, "quantity": 1, "discount": 0, "tax": 180, "total": 1180}, {"name": "Beard Trim", "stylist": "Vandan Gohil", "price": 400, "quantity": 1, "discount": 0, "tax": 72, "total": 472}]'::jsonb,
         '[{"method": "gpay", "amount": 1652}]'::jsonb,
         'gpay (₹1652)', 1400, 252, 0, 1652),
        
        -- Invoice #3 - Single service, single payment
        ('3', '2025-03-31 18:38:50'::timestamp, 'Neharika Malhotra', '8882819968', 'Rohan Patel',
         '[{"name": "Haircut With Creative director(female)", "stylist": "Rohan Patel", "price": 3000, "quantity": 1, "discount": 0, "tax": 540, "total": 3540}]'::jsonb,
         '[{"method": "card", "amount": 3540}]'::jsonb,
         'card (₹3540)', 3000, 540, 0, 3540),
        
        -- Invoice #6 - Multiple services, single payment (MERGED - Aashi had 2 services)
        ('6', '2025-03-31 18:38:50'::timestamp, 'Aashi', '8140195963', 'Juni',
         '[{"name": "Intense Rituals", "stylist": "Juni", "price": 2600, "quantity": 1, "discount": 260, "tax": 421.2, "total": 2761.2}, {"name": "Intense Rituals", "stylist": "Wailed", "price": 2600, "quantity": 1, "discount": 260, "tax": 421.2, "total": 2761.2}]'::jsonb,
         '[{"method": "gpay", "amount": 5522.4}]'::jsonb,
         'gpay (₹5522.4)', 5200, 842.4, 520, 5522.4),
        
        -- Invoice #7 - Multiple services, single payment (MERGED - Jigyasha had 2 services)
        ('7', '2025-03-31 18:38:50'::timestamp, 'Jigyasha Narang', '9825760192', 'Anu Khaling Rai',
         '[{"name": "Eyebrow", "stylist": "Anu Khaling Rai", "price": 100, "quantity": 2, "discount": 0, "tax": 36, "total": 236}, {"name": "Wash & Blow Dry", "stylist": "Anu Khaling Rai", "price": 700, "quantity": 1, "discount": 0, "tax": 126, "total": 826}]'::jsonb,
         '[{"method": "cash", "amount": 1062}]'::jsonb,
         'cash (₹1062)', 900, 162, 0, 1062),
        
        -- Invoice #13 - Multiple services, single payment (MERGED - Yashvi had 3 services)
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Anu Khaling Rai',
         '[{"name": "Classic Pedicure", "stylist": "Anu Khaling Rai", "price": 1400, "quantity": 1, "discount": 140, "tax": 226.8, "total": 1486.8}, {"name": "Classic Manicure", "stylist": "Juni", "price": 1200, "quantity": 1, "discount": 120, "tax": 194.4, "total": 1274.4}, {"name": "Eyebrow", "stylist": "Anu Khaling Rai", "price": 100, "quantity": 1, "discount": 0, "tax": 18, "total": 118}]'::jsonb,
         '[{"method": "cash", "amount": 2879.2}]'::jsonb,
         'cash (₹2879.2)', 2700, 439.2, 260, 2879.2),
        
        -- Invoice #23 - Multiple services, single payment (MERGED - Niddhi had 4 services)
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Rupesh Mahale',
         '[{"name": "Hair Cut With Senior Hairdresser (Male)", "stylist": "Rupesh Mahale", "price": 1000, "quantity": 1, "discount": 0, "tax": 180, "total": 1180}, {"name": "Beard Trim", "stylist": "Rupesh Mahale", "price": 400, "quantity": 1, "discount": 0, "tax": 72, "total": 472}, {"name": "Rituals Express Hair Spa", "stylist": "Juni", "price": 1800, "quantity": 1, "discount": 0, "tax": 324, "total": 2124}, {"name": "Rituals Express Hair Spa", "stylist": "Wailed", "price": 1800, "quantity": 1, "discount": 0, "tax": 324, "total": 2124}]'::jsonb,
         '[{"method": "gpay", "amount": 5900}]'::jsonb,
         'gpay (₹5900)', 5000, 900, 0, 5900),
        
        -- Invoice #24 - Multiple services, single payment (MERGED - Harsh had 2 services)
        ('24', '2025-04-01 18:38:50'::timestamp, 'Harsh Seth', '9327241002', 'Aiban Marwein',
         '[{"name": "Head Massage With Oil", "stylist": "Aiban Marwein", "price": 1500, "quantity": 1, "discount": 0, "tax": 270, "total": 1770}, {"name": "Hair Cut With Senior Hairdresser (Male)", "stylist": "Vandan Gohil", "price": 1000, "quantity": 1, "discount": 0, "tax": 180, "total": 1180}]'::jsonb,
         '[{"method": "gpay", "amount": 2950}]'::jsonb,
         'gpay (₹2950)', 2500, 450, 0, 2950)
    ) AS t(invoice_number, date_time, client_name, client_phone, primary_stylist, services_json, payments_json, payment_display, subtotal, tax, discount, total)
),
-- Create missing clients
client_inserts AS (
    INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
    SELECT DISTINCT 
        client_name, 
        client_phone, 
        client_phone, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
        NOW(), 
        NOW()
    FROM sample_merged_data
    WHERE NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE mobile_number = sample_merged_data.client_phone 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
    )
    RETURNING id
)
-- Insert the merged POS orders
INSERT INTO pos_orders (
    id,
    created_at,
    date,
    client_name,
    customer_name,
    stylist_name,
    services,
    payments,
    subtotal,
    tax,
    discount,
    total,
    total_amount,
    payment_method,
    status,
    type,
    user_id,
    notes
)
SELECT 
    uuid_generate_v4(),
    date_time,
    date_time,
    client_name,
    client_name,
    primary_stylist,
    services_json,
    payments_json,
    subtotal,
    tax,
    discount,
    total,
    total,
    payment_display,
    'completed',
    'service',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    'Excel Import - Invoice #' || invoice_number || ' - ' || jsonb_array_length(services_json) || ' services merged'
FROM sample_merged_data;

-- Re-enable RLS
SET row_security = on;

-- Show import summary
SELECT 
    'Import Summary' as summary,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients,
    AVG(jsonb_array_length(services)) as avg_services_per_invoice
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid;

-- Show sample merged invoices with payment method formatting
SELECT 
    client_name,
    payment_method,
    total_amount,
    jsonb_array_length(services) as service_count,
    notes
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
ORDER BY created_at
LIMIT 10;

-- Show examples of multi-service merged invoices
SELECT 
    'Multi-Service Examples' as example_type,
    client_name,
    payment_method,
    total_amount,
    jsonb_array_length(services) as service_count,
    (SELECT string_agg(service->>'name', ', ') 
     FROM jsonb_array_elements(services) as service) as service_names
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
AND jsonb_array_length(services) > 1
ORDER BY jsonb_array_length(services) DESC;

-- INSTRUCTIONS FOR COMPLETE IMPORT:
-- 1. This script demonstrates the proper merging approach
-- 2. Same invoice number + client name = single merged bill
-- 3. Payment methods show amounts in brackets: gpay(₹1652), cash(₹1062)
-- 4. Multiple services are consolidated into single orders
-- 5. Proper tax and discount calculations maintained
-- 6. All data associated with user_id for multi-tenant isolation

-- To import all 376 invoices from the Excel file:
-- 1. Use the processed_invoices.json file created by the Node.js script
-- 2. Convert the JSON data to similar SQL INSERT statements
-- 3. Ensure proper payment method formatting with amounts in brackets
-- 4. Group services by invoice number and client name
-- 5. Calculate totals properly (subtotal + tax - discount = total) 