-- Import April 2025 Services Data - Batch 1 (First 20 records)
-- Test batch to validate the import process

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
        ('15', '2025-04-01 18:38:50'::timestamp, 'Pooja Goyal', '9913465019', 'Nikhil Pujari', 'Haircut With Senior Hairdresser(Female)', 1500, 1, 0, 18, 'gpay')
    ) AS t(invoice_number, date_time, client_name, client_phone, stylist_name, service_name, service_price, quantity, discount_percent, tax_percent, payment_method)
),

-- Create missing clients
clients_to_create AS (
    INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
    SELECT DISTINCT 
        client_name, 
        client_phone, 
        client_phone, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE mobile_number = raw_data.client_phone 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
    )
    RETURNING id, full_name, mobile_number
),

-- Create missing stylists
stylists_to_create AS (
    INSERT INTO stylists (name, user_id, available, created_at, updated_at)
    SELECT DISTINCT 
        stylist_name, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
        true, 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM stylists 
        WHERE name = raw_data.stylist_name 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
    )
    RETURNING id, name
),

-- Create missing services
services_to_create AS (
    INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
    SELECT DISTINCT 
        service_name, 
        service_price, 
        60, -- default duration
        'service', 
        true, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid, 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM services 
        WHERE name = raw_data.service_name 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
    )
    RETURNING id, name, price
),

-- Group data by invoice
invoice_data AS (
    SELECT 
        invoice_number,
        date_time,
        client_name,
        client_phone,
        stylist_name,
        payment_method,
        jsonb_agg(
            jsonb_build_object(
                'service_name', service_name,
                'price', service_price,
                'quantity', quantity,
                'discount_percent', discount_percent,
                'tax_percent', tax_percent,
                'subtotal', service_price * quantity,
                'discount', (service_price * quantity) * (discount_percent / 100),
                'taxable', (service_price * quantity) * (1 - discount_percent / 100),
                'tax', (service_price * quantity) * (1 - discount_percent / 100) * (tax_percent / 100),
                'total', (service_price * quantity) * (1 - discount_percent / 100) * (1 + tax_percent / 100)
            )
        ) as services_data,
        SUM(service_price * quantity) as subtotal,
        SUM((service_price * quantity) * (discount_percent / 100)) as total_discount,
        SUM((service_price * quantity) * (1 - discount_percent / 100) * (tax_percent / 100)) as total_tax,
        SUM((service_price * quantity) * (1 - discount_percent / 100) * (1 + tax_percent / 100)) as total_amount
    FROM raw_data
    GROUP BY invoice_number, date_time, client_name, client_phone, stylist_name, payment_method
),

-- Create services JSON with proper IDs
final_invoice_data AS (
    SELECT 
        i.*,
        jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'service_id', s.id,
                'service_name', (service_item.value->>'service_name'),
                'type', 'service',
                'price', (service_item.value->>'price')::numeric,
                'quantity', (service_item.value->>'quantity')::integer,
                'duration', 60,
                'subtotal', (service_item.value->>'subtotal')::numeric,
                'discount', (service_item.value->>'discount')::numeric,
                'tax', (service_item.value->>'tax')::numeric,
                'total', (service_item.value->>'total')::numeric,
                'gst_percentage', (service_item.value->>'tax_percent')::numeric,
                'unit_price', (service_item.value->>'price')::numeric
            )
        ) as services_json
    FROM invoice_data i
    CROSS JOIN LATERAL jsonb_array_elements(i.services_data) as service_item(value)
    LEFT JOIN services s ON s.name = (service_item.value->>'service_name') 
        AND s.user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
    GROUP BY i.invoice_number, i.date_time, i.client_name, i.client_phone, i.stylist_name, 
             i.payment_method, i.subtotal, i.total_discount, i.total_tax, i.total_amount
)

-- Insert POS orders
INSERT INTO pos_orders (
    date,
    client_name,
    stylist_name,
    services,
    subtotal,
    tax,
    discount,
    total,
    payment_method,
    status,
    type,
    user_id,
    created_at
)
SELECT 
    date_time,
    client_name,
    stylist_name,
    services_json,
    subtotal,
    total_tax,
    total_discount,
    total_amount,
    payment_method,
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    date_time
FROM final_invoice_data
WHERE NOT EXISTS (
    SELECT 1 FROM pos_orders po
    WHERE po.client_name = final_invoice_data.client_name
    AND po.stylist_name = final_invoice_data.stylist_name
    AND po.date::date = final_invoice_data.date_time::date
    AND po.user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
);

-- Show import summary
SELECT 
    COUNT(*) as total_orders_imported,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    SUM(total) as total_revenue
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid
AND created_at >= NOW() - INTERVAL '1 hour'; 