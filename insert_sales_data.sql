-- Insert sales data into pos_orders table with product items
-- This will populate the sales_product_new view

-- First entry (will create both SALES-01 and SALES-02 in the view since it has two identical products)
INSERT INTO pos_orders (
    id, 
    date, 
    type,
    services,
    discount,
    tax,
    payments
) VALUES (
    '07233b3f-93a7-4bd8-aa06-c58b64af26c7',
    '2025-04-20',
    'sale',
    jsonb_build_array(
        jsonb_build_object(
            'service_name', 'shampoo',
            'quantity', 1,
            'price', 1694.92,
            'type', 'product'
        ),
        jsonb_build_object(
            'service_name', 'shampoo',
            'quantity', 1,
            'price', 1694.92,
            'type', 'product'
        )
    ),
    400,
    610.1712,
    jsonb_build_array(
        jsonb_build_object(
            'amount', 3200.01008,
            'payment_method', 'cash',
            'payment_date', '2025-04-20 12:08:27.964'
        )
    )
);

-- Second entry (will create SALES-03 in the view)
INSERT INTO pos_orders (
    id, 
    date, 
    type,
    services,
    discount,
    tax
) VALUES (
    'e0182555-9572-469d-b40f-c74acc250e35',
    '2025-04-20',
    'sale',
    jsonb_build_array(
        jsonb_build_object(
            'service_name', 'facemask',
            'quantity', 1,
            'price', 500,
            'type', 'product'
        )
    ),
    200,
    90
);

-- Verify the data appears in the view
SELECT * FROM sales_product_new ORDER BY serial_no; 