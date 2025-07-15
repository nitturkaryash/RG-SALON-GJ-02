-- Import April 2025 Services Data with Proper Invoice Merging
-- This script creates merged invoices where same client + invoice number = single bill
-- Payment methods include amounts in brackets
-- Run this script manually in Supabase SQL Editor

-- Disable RLS temporarily for bulk import
SET row_security = off;

-- Create the raw data as a temporary table
CREATE TEMP TABLE temp_service_data AS
WITH raw_data AS (
    SELECT * FROM (VALUES
        ('1', '2025-03-31 18:38:50'::timestamp, 'Zarna Javeri', '9824770184', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'card'),
        ('2', '2025-03-31 18:38:50'::timestamp, 'Tarun Vatiani', '9904079784', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('2', '2025-03-31 18:38:50'::timestamp, 'Tarun Vatiani', '9904079784', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('3', '2025-03-31 18:38:50'::timestamp, 'Neharika Malhotra', '8882819968', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'card'),
        ('4', '2025-03-31 18:38:50'::timestamp, 'Kira', '8141038380', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 600, 18, 'gpay'),
        ('5', '2025-03-31 18:38:50'::timestamp, 'Rahul Kedia', '9978122122', 'Rohan Patel', 'Hair Cut With Creative director (Male)', 2500, 1, 0, 18, 'gpay'),
        ('6', '2025-03-31 18:38:50'::timestamp, 'Aashi', '8140195963', 'Juni', 'Intense Rituals', 2600, 1, 260, 18, 'gpay'),
        ('6', '2025-03-31 18:38:50'::timestamp, 'Aashi', '8140195963', 'Wailed', 'Intense Rituals', 2600, 1, 260, 18, 'gpay'),
        ('7', '2025-03-31 18:38:50'::timestamp, 'Jigyasha Narang', '9825760192', 'Anu Khaling Rai', 'Eyebrow', 100, 2, 0, 18, 'cash'),
        ('7', '2025-03-31 18:38:50'::timestamp, 'Jigyasha Narang', '9825760192', 'Anu Khaling Rai', 'Wash & Blow Dry', 700, 1, 0, 18, 'cash'),
        ('8', '2025-03-31 18:38:50'::timestamp, 'Gauri Savaliya', '9913311455', 'Toshi Jamir', 'Creative Color', 15500, 1, 0, 18, 'card'),
        ('9', '2025-03-31 18:38:50'::timestamp, 'Muskan Nandwani', '9016589750', 'Admin', 'Hair Strengthning', 2500, 1, 0, 18, 'card'),
        ('10', '2025-03-31 18:38:50'::timestamp, 'Nikita Shah', '9824130919', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 650, 1, 0, 18, 'cash'),
        ('11', '2025-03-31 18:38:50'::timestamp, 'Prachi patel', '9925326920', 'Shubham Khalashi', 'Root Touch Up', 40, 30, 0, 18, 'cash'),
        ('12', '2025-03-31 18:38:50'::timestamp, 'Dimple Sharma', '8128998353', 'Admin', 'FACE PACK', 1000, 1, 0, 18, 'gpay'),
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Anu Khaling Rai', 'Classic Pedicure', 1400, 1, 140, 18, 'cash'),
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Juni', 'Classic Manicure', 1200, 1, 120, 18, 'cash'),
        ('13', '2025-03-31 18:38:50'::timestamp, 'Yashvi Doshi', '9099599877', 'Anu Khaling Rai', 'Eyebrow', 100, 1, 0, 18, 'cash'),
        ('14', '2025-04-01 18:38:50'::timestamp, 'Seep Mahajan', '9825183837', 'Anju Rumdali Rai', 'Root Touch Up', 40, 60, 0, 18, 'gpay'),
        ('15', '2025-04-01 18:38:50'::timestamp, 'Pooja Goyal', '9913465019', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'gpay'),
        ('16', '2025-04-01 18:38:50'::timestamp, 'deepak bulchandi', '9925007176', 'Vandan Gohil', 'Beard Trim', 400, 1, 0, 18, 'card'),
        ('18', '2025-04-01 18:38:50'::timestamp, 'Sashwot', '8734005134', 'Aiban Marwein', 'Full Leg Wax', 950, 1, 0, 18, 'gpay'),
        ('19', '2025-04-01 18:38:50'::timestamp, 'Dhawal Doshi', '8320117268', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'cash'),
        ('19', '2025-04-01 18:38:50'::timestamp, 'Dhawal Doshi', '8320117268', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'cash'),
        ('20', '2025-04-01 18:38:50'::timestamp, 'Veena Kodwani Dawer', '9825144666', 'Shubham Khalashi', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('21', '2025-04-01 18:38:50'::timestamp, 'ashha jain', '9898860007', 'Ajay Shirsath', 'Olaplex Hair Treatment', 2600, 1, 260, 18, 'cash'),
        ('22', '2025-04-01 18:38:50'::timestamp, 'Richa Dhingra', '9879062092', 'Jenet', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('22', '2025-04-01 18:38:50'::timestamp, 'Richa Dhingra', '9879062092', 'Jenet', 'Classic Pedicure', 1400, 1, 140, 18, 'cash'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Rupesh Mahale', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Rupesh Mahale', 'Beard Trim', 400, 1, 0, 18, 'gpay'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Juni', 'Rituals Express Hair Spa', 1800, 1, 0, 18, 'gpay'),
        ('23', '2025-04-01 18:38:50'::timestamp, 'Niddhi Patel', '9913890626', 'Wailed', 'Rituals Express Hair Spa', 1800, 1, 0, 18, 'gpay'),
        ('24', '2025-04-01 18:38:50'::timestamp, 'Harsh Seth', '9327241002', 'Aiban Marwein', 'Head Massage With Oil', 1500, 1, 0, 18, 'gpay'),
        ('24', '2025-04-01 18:38:50'::timestamp, 'Harsh Seth', '9327241002', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 1000, 1, 0, 18, 'gpay'),
        ('25', '2025-04-01 18:38:50'::timestamp, 'Kavita Mittal', '9712900696', 'Rupesh Mahale', 'Root Touch Up', 40, 50, 0, 18, 'cash'),
        ('26', '2025-04-01 18:38:50'::timestamp, 'Gaurav', '9426439142', 'Rupesh Mahale', 'Global Color', 40, 30, 0, 18, 'gpay'),
        ('27', '2025-04-01 18:38:50'::timestamp, 'Chintan jariwala', '9913333667', 'Vandan Gohil', 'Hair Cut With Senior Hairdresser (Male)', 650, 1, 0, 18, 'cash'),
        ('28', '2025-04-02 18:38:50'::timestamp, 'Preeti', '9879013960', 'Jenet', 'Root Touch Up', 40, 55, 0, 18, 'card'),
        ('28', '2025-04-02 18:38:50'::timestamp, 'Preeti', '9879013960', 'Jenet', 'Classic Pedicure', 1400, 1, 0, 18, 'card'),
        ('29', '2025-04-02 18:38:50'::timestamp, 'Rusali Valani', '8758545160', 'Rohan Patel', 'Haircut With Creative director(female)', 3000, 1, 0, 18, 'cash'),
        ('30', '2025-04-02 18:38:50'::timestamp, 'Shreya Jaju', '9979376000', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'cash')
    ) AS t(invoice_number, date_time, client_name, client_phone, stylist_name, service_name, service_price, quantity, discount_amount, tax_percent, payment_method)
)
SELECT * FROM raw_data;

-- Create missing clients
INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
SELECT DISTINCT 
    client_name, 
    client_phone, 
    client_phone, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
    NOW(), 
    NOW()
FROM temp_service_data
WHERE NOT EXISTS (
    SELECT 1 FROM clients 
    WHERE mobile_number = temp_service_data.client_phone 
    AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Create missing stylists
INSERT INTO stylists (name, user_id, available, created_at, updated_at)
SELECT DISTINCT 
    stylist_name, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
    true, 
    NOW(), 
    NOW()
FROM temp_service_data
WHERE NOT EXISTS (
    SELECT 1 FROM stylists 
    WHERE name = temp_service_data.stylist_name 
    AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Create missing services
INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
SELECT DISTINCT 
    service_name, 
    service_price, 
    60, 
    'service', 
    true, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
    NOW(), 
    NOW()
FROM temp_service_data
WHERE NOT EXISTS (
    SELECT 1 FROM services 
    WHERE name = temp_service_data.service_name 
    AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Create merged POS orders with proper payment method formatting
WITH grouped_invoices AS (
    SELECT 
        invoice_number,
        client_name,
        client_phone,
        date_time,
        -- Primary stylist (first one)
        (array_agg(stylist_name ORDER BY service_name))[1] as primary_stylist,
        -- All stylists involved
        array_agg(DISTINCT stylist_name) as all_stylists,
        -- Services JSON with detailed information
        jsonb_agg(
            jsonb_build_object(
                'name', service_name,
                'price', service_price,
                'quantity', quantity,
                'discount', discount_amount,
                'tax_percent', tax_percent,
                'stylist', stylist_name,
                'subtotal', service_price * quantity,
                'total', service_price * quantity - discount_amount,
                'tax_amount', (service_price * quantity - discount_amount) * tax_percent / 100
            ) ORDER BY service_name
        ) as services_json,
        -- Calculate totals per payment method
        jsonb_object_agg(
            payment_method,
            jsonb_build_object(
                'method', payment_method,
                'amount', SUM(service_price * quantity - discount_amount),
                'display', payment_method || ' (₹' || SUM(service_price * quantity - discount_amount) || ')'
            )
        ) as payment_methods_obj,
        -- Payment method display string
        string_agg(
            DISTINCT payment_method || ' (₹' || SUM(service_price * quantity - discount_amount) || ')',
            ', '
        ) as payment_display,
        -- Totals
        SUM(service_price * quantity) as gross_total,
        SUM(discount_amount) as total_discount,
        SUM(service_price * quantity - discount_amount) as net_total,
        SUM((service_price * quantity - discount_amount) * tax_percent / 100) as total_tax,
        COUNT(*) as service_count
    FROM temp_service_data
    GROUP BY invoice_number, client_name, client_phone, date_time, payment_method
),
final_invoices AS (
    SELECT 
        invoice_number,
        client_name,
        client_phone,
        date_time,
        primary_stylist,
        services_json,
        -- Convert payment methods object to array
        jsonb_agg(payment_methods_obj) as payments,
        string_agg(payment_display, ', ') as payment_method_display,
        SUM(gross_total) as final_gross_total,
        SUM(total_discount) as final_total_discount,
        SUM(net_total) as final_net_total,
        SUM(total_tax) as final_total_tax,
        SUM(service_count) as total_services
    FROM grouped_invoices
    GROUP BY invoice_number, client_name, client_phone, date_time, primary_stylist, services_json
)
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
    payments,
    final_net_total,
    final_total_tax,
    final_total_discount,
    final_net_total + final_total_tax,
    final_net_total + final_total_tax,
    payment_method_display,
    'completed',
    'service',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    'Imported from Excel - Invoice #' || invoice_number || ' - ' || total_services || ' services'
FROM final_invoices;

-- Re-enable RLS
SET row_security = on;

-- Show import summary
SELECT 
    'Import Summary' as summary,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as stylists_involved,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid;

-- Show sample merged invoices
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