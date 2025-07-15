-- Simple POS Orders Data Import Template
-- Replace the INSERT statements below with your actual data

-- First, let's create any missing clients
INSERT INTO clients (full_name, mobile_number, email, phone, user_id, created_at, updated_at)
VALUES 
    ('Sample Client 1', '9876543210', 'client1@example.com', '9876543210', '3f4b718f-70cb-4873-a62c-b8806a92e25b', NOW(), NOW()),
    ('Sample Client 2', '9876543211', 'client2@example.com', '9876543211', '3f4b718f-70cb-4873-a62c-b8806a92e25b', NOW(), NOW())
ON CONFLICT (mobile_number) DO NOTHING;

-- Create any missing stylists
INSERT INTO stylists (name, user_id, available, created_at, updated_at)
VALUES 
    ('Sample Stylist 1', '3f4b718f-70cb-4873-a62c-b8806a92e25b', true, NOW(), NOW()),
    ('Sample Stylist 2', '3f4b718f-70cb-4873-a62c-b8806a92e25b', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create any missing services
INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
VALUES 
    ('Haircut', 500.00, 60, 'service', true, '3f4b718f-70cb-4873-a62c-b8806a92e25b', NOW(), NOW()),
    ('Hair Wash', 200.00, 30, 'service', true, '3f4b718f-70cb-4873-a62c-b8806a92e25b', NOW(), NOW()),
    ('Facial', 800.00, 90, 'service', true, '3f4b718f-70cb-4873-a62c-b8806a92e25b', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Now insert the POS orders
-- Replace this with your actual data
INSERT INTO pos_orders (
    id,
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
) VALUES 
-- Sample Invoice 1 with multiple services
(
    gen_random_uuid(),
    '2024-01-15 10:00:00',
    'Sample Client 1',
    'Sample Stylist 1',
    '[
        {
            "id": "' || (SELECT id FROM services WHERE name = 'Haircut' LIMIT 1) || '",
            "service_id": "' || (SELECT id FROM services WHERE name = 'Haircut' LIMIT 1) || '",
            "service_name": "Haircut",
            "type": "service",
            "price": 500.00,
            "quantity": 1,
            "duration": 60,
            "subtotal": 500.00,
            "discount": 0,
            "tax": 90.00,
            "total": 590.00,
            "gst_percentage": 18,
            "unit_price": 500.00
        },
        {
            "id": "' || (SELECT id FROM services WHERE name = 'Hair Wash' LIMIT 1) || '",
            "service_id": "' || (SELECT id FROM services WHERE name = 'Hair Wash' LIMIT 1) || '",
            "service_name": "Hair Wash",
            "type": "service",
            "price": 200.00,
            "quantity": 1,
            "duration": 30,
            "subtotal": 200.00,
            "discount": 0,
            "tax": 36.00,
            "total": 236.00,
            "gst_percentage": 18,
            "unit_price": 200.00
        }
    ]'::jsonb,
    700.00,  -- subtotal
    126.00,  -- tax (18% of 700)
    0,       -- discount
    826.00,  -- total
    'cash',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    '2024-01-15 10:00:00'
);

-- Add more sample invoices as needed
-- Just copy the structure above and modify the values

-- TODO: Replace the sample data above with your actual invoice data
-- For each invoice:
-- 1. Generate a unique UUID for the id
-- 2. Set the correct date and time
-- 3. Set client_name and stylist_name
-- 4. Create the services JSON array with all services for that invoice
-- 5. Calculate subtotal, tax, discount, and total
-- 6. Set payment_method and other fields as needed 