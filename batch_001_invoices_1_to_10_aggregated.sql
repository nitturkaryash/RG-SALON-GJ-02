-- Batch 1: Invoices 1 to 10 (Aggregated Version)
-- Total invoices in batch: 10
-- This version uses the upsert_aggregated_order function to automatically
-- combine orders for the same client on the same date

-- First, ensure the aggregation functions are loaded
\i create_aggregated_order_insert.sql

-- 1. Zarna Javeri - Single service
SELECT upsert_aggregated_order(
    'Zarna Javeri',
    'Zarna Javeri',
    'Rupesh Mahale',
    '[{"name":"Hair Cut With Senior Hairdresser (Male)","category":"HAIR - Hair Cut","stylist":"Rupesh Mahale","quantity":1,"unitPrice":1000,"discount":0,"taxPercent":18,"subtotal":1000,"netAmount":1000,"taxAmount":180,"totalAmount":1180}]'::jsonb,
    '[{"method":"card","amount":1180}]'::jsonb,
    1000,
    180,
    0,
    1180,
    'card(1180)(₹1180.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 2. Tarun Vatiani - Hair Cut service (first service)
SELECT upsert_aggregated_order(
    'Tarun Vatiani',
    'Tarun Vatiani',
    'Vandan Gohil',
    '[{"name":"Hair Cut With Senior Hairdresser (Male)","category":"HAIR - Hair Cut","stylist":"Vandan Gohil","quantity":1,"unitPrice":1000,"discount":0,"taxPercent":18,"subtotal":1000,"netAmount":1000,"taxAmount":180,"totalAmount":1180}]'::jsonb,
    '[{"method":"gpay","amount":1180}]'::jsonb,
    1000,
    180,
    0,
    1180,
    'gpay(1180)(₹1180.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 3. Tarun Vatiani - Beard Trim service (will be aggregated with above)
SELECT upsert_aggregated_order(
    'Tarun Vatiani',
    'Tarun Vatiani',
    'Vandan Gohil',
    '[{"name":"Beard Trim","category":"HAIR - Beard Trim","stylist":"Vandan Gohil","quantity":1,"unitPrice":400,"discount":0,"taxPercent":18,"subtotal":400,"netAmount":400,"taxAmount":72,"totalAmount":472}]'::jsonb,
    '[{"method":"gpay","amount":472}]'::jsonb,
    400,
    72,
    0,
    472,
    'gpay(472)(₹472.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 4. Neharika Malhotra - Single service
SELECT upsert_aggregated_order(
    'Neharika Malhotra',
    'Neharika Malhotra',
    'Rohan Patel',
    '[{"name":"Haircut With Creative director(female)","category":"HAIR - Hair Cut","stylist":"Rohan Patel","quantity":1,"unitPrice":3000,"discount":0,"taxPercent":18,"subtotal":3000,"netAmount":3000,"taxAmount":540,"totalAmount":3540}]'::jsonb,
    '[{"method":"card","amount":3540}]'::jsonb,
    3000,
    540,
    0,
    3540,
    'card(3540)(₹3540.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 5. Kira - Single service with discount
SELECT upsert_aggregated_order(
    'Kira',
    'Kira',
    'Rohan Patel',
    '[{"name":"Haircut With Creative director(female)","category":"HAIR - Hair Cut","stylist":"Rohan Patel","quantity":1,"unitPrice":3000,"discount":600,"taxPercent":18,"subtotal":3000,"netAmount":2400,"taxAmount":432,"totalAmount":2832}]'::jsonb,
    '[{"method":"gpay","amount":2832}]'::jsonb,
    3000,
    432,
    600,
    2832,
    'gpay(2832)(₹2832.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 6. Rahul Kedia - Single service
SELECT upsert_aggregated_order(
    'Rahul Kedia',
    'Rahul Kedia',
    'Rohan Patel',
    '[{"name":"Hair Cut With Creative director (Male)","category":"HAIR - Hair Cut","stylist":"Rohan Patel","quantity":1,"unitPrice":2500,"discount":0,"taxPercent":18,"subtotal":2500,"netAmount":2500,"taxAmount":450,"totalAmount":2950}]'::jsonb,
    '[{"method":"gpay","amount":2950}]'::jsonb,
    2500,
    450,
    0,
    2950,
    'gpay(2950)(₹2950.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 7. Aashi - First Intense Ritual service
SELECT upsert_aggregated_order(
    'Aashi',
    'Aashi',
    'Juni',
    '[{"name":"Intense Rituals","category":"Hair - Hair Treatment","stylist":"Juni","quantity":1,"unitPrice":2600,"discount":260,"taxPercent":18,"subtotal":2600,"netAmount":2340,"taxAmount":421.2,"totalAmount":2761.2}]'::jsonb,
    '[{"method":"cash","amount":2761.2}]'::jsonb,
    2600,
    421.2,
    260,
    2761.2,
    'cash(2761.2)(₹2761.20)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 8. Aashi - Second Intense Ritual service (will be aggregated with above)
SELECT upsert_aggregated_order(
    'Aashi',
    'Aashi',
    'Wailed',
    '[{"name":"Intense Rituals","category":"Hair - Hair Treatment","stylist":"Wailed","quantity":1,"unitPrice":2600,"discount":260,"taxPercent":18,"subtotal":2600,"netAmount":2340,"taxAmount":421.2,"totalAmount":2761.2}]'::jsonb,
    '[{"method":"cash","amount":2761.2}]'::jsonb,
    2600,
    421.2,
    260,
    2761.2,
    'cash(2761.2)(₹2761.20)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 9. Jigyasha Narang - Eyebrow service (first service)
SELECT upsert_aggregated_order(
    'Jigyasha Narang',
    'Jigyasha Narang',
    'Anu Khaling Rai',
    '[{"name":"Eyebrow","category":"Skin - Threading","stylist":"Anu Khaling Rai","quantity":2,"unitPrice":100,"discount":0,"taxPercent":18,"subtotal":200,"netAmount":200,"taxAmount":36,"totalAmount":236}]'::jsonb,
    '[{"method":"cash","amount":236}]'::jsonb,
    200,
    36,
    0,
    236,
    'cash(236)(₹236.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 10. Jigyasha Narang - Wash & Blow Dry service (will be aggregated with above)
SELECT upsert_aggregated_order(
    'Jigyasha Narang',
    'Jigyasha Narang',
    'Anu Khaling Rai',
    '[{"name":"Wash & Blow Dry","category":"Hair - Hair Styling","stylist":"Anu Khaling Rai","quantity":1,"unitPrice":700,"discount":0,"taxPercent":18,"subtotal":700,"netAmount":700,"taxAmount":126,"totalAmount":826}]'::jsonb,
    '[{"method":"cash","amount":826}]'::jsonb,
    700,
    126,
    0,
    826,
    'cash(826)(₹826.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 11. Gauri Savaliya - Single service
SELECT upsert_aggregated_order(
    'Gauri Savaliya',
    'Gauri Savaliya',
    'Toshi Jamir',
    '[{"name":"Creative Color","category":"Hair - Hair Color","stylist":"Toshi Jamir","quantity":1,"unitPrice":15500,"discount":0,"taxPercent":18,"subtotal":15500,"netAmount":15500,"taxAmount":2790,"totalAmount":18290}]'::jsonb,
    '[{"method":"card","amount":18290}]'::jsonb,
    15500,
    2790,
    0,
    18290,
    'card(18290)(₹18290.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 12. Muskan Nandwani - Single service
SELECT upsert_aggregated_order(
    'Muskan Nandwani',
    'Muskan Nandwani',
    'Admin',
    '[{"name":"Hair Strengthning","category":"Hair - Hair Treatment","stylist":"Admin","quantity":1,"unitPrice":2500,"discount":0,"taxPercent":18,"subtotal":2500,"netAmount":2500,"taxAmount":450,"totalAmount":2950}]'::jsonb,
    '[{"method":"card","amount":2950}]'::jsonb,
    2500,
    450,
    0,
    2950,
    'card(5850)(₹2950.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 13. Nikita Shah - Hair Cut service (first service)
SELECT upsert_aggregated_order(
    'Nikita Shah',
    'Nikita Shah',
    'Rupesh Mahale',
    '[{"name":"Hair Cut With Senior Hairdresser (Male)","category":"HAIR - Hair Cut","stylist":"Rupesh Mahale","quantity":1,"unitPrice":650,"discount":0,"taxPercent":18,"subtotal":650,"netAmount":650,"taxAmount":117,"totalAmount":767}]'::jsonb,
    '[{"method":"cash","amount":767}]'::jsonb,
    650,
    117,
    0,
    767,
    'cash(767)(₹767.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 14. Nikita Shah - Haircut With Senior Hairdresser(Female) service (will be aggregated)
SELECT upsert_aggregated_order(
    'Nikita Shah',
    'Nikita Shah',
    'Nikhil Pujari',
    '[{"name":"Haircut With Senior Hairdresser(Female)","category":"HAIR - Hair Cut","stylist":"Nikhil Pujari","quantity":1,"unitPrice":1500,"discount":0,"taxPercent":18,"subtotal":1500,"netAmount":1500,"taxAmount":270,"totalAmount":1770}]'::jsonb,
    '[{"method":"cash","amount":1770}]'::jsonb,
    1500,
    270,
    0,
    1770,
    'cash(1770)(₹1770.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- 15. Nikita Shah - Deep Tissue Massage service (will be aggregated)
SELECT upsert_aggregated_order(
    'Nikita Shah',
    'Nikita Shah',
    'Wailed',
    '[{"name":"Deep Tissue Massage 60 Mins","category":"Skin - Massage","stylist":"Wailed","quantity":1,"unitPrice":3500,"discount":700,"taxPercent":18,"subtotal":3500,"netAmount":2800,"taxAmount":504,"totalAmount":3304}]'::jsonb,
    '[{"method":"cash","amount":3304}]'::jsonb,
    3500,
    504,
    700,
    3304,
    'cash(3304)(₹3304.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- Show the final aggregated results
SELECT 
    client_name,
    DATE(created_at) as order_date,
    stylist_name,
    jsonb_array_length(services) as service_count,
    jsonb_array_length(payments) as payment_method_count,
    subtotal,
    tax,
    discount,
    total_amount,
    services,
    payments
FROM pos_orders 
WHERE DATE(created_at) = '2025-03-31'
ORDER BY client_name;

-- Summary report
SELECT 
    'Summary Report' as report_type,
    COUNT(*) as total_orders,
    COUNT(DISTINCT client_name) as unique_clients,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM pos_orders 
WHERE DATE(created_at) = '2025-03-31'; 