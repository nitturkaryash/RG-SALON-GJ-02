-- Create sales_history_final table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_history_final (
    id SERIAL PRIMARY KEY,
    serial_no VARCHAR(100) NOT NULL,
    order_id UUID NOT NULL,
    date DATE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_ex_gst DECIMAL(10, 2) NOT NULL,
    gst_percentage DECIMAL(10, 2) NOT NULL,
    taxable_value DECIMAL(10, 2) NOT NULL,
    cgst_amount DECIMAL(10, 2) NOT NULL,
    sgst_amount DECIMAL(10, 2) NOT NULL,
    total_purchase_cost DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    hsn_code VARCHAR(50) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    mrp_incl_gst DECIMAL(10, 2),
    discounted_sales_rate_ex_gst DECIMAL(10, 2),
    invoice_value DECIMAL(10, 2) NOT NULL,
    igst_amount DECIMAL(10, 2) NOT NULL,
    current_stock INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add an index on the date column for faster filtering
CREATE INDEX IF NOT EXISTS idx_sales_history_date ON sales_history_final(date);

-- Add an index on the order_id column for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_history_order_id ON sales_history_final(order_id);

-- Insert sample data
INSERT INTO sales_history_final (
    serial_no, order_id, date, product_name, quantity, unit_price_ex_gst, 
    gst_percentage, taxable_value, cgst_amount, sgst_amount, total_purchase_cost, 
    discount, tax, hsn_code, product_type, mrp_incl_gst, discounted_sales_rate_ex_gst, 
    invoice_value, igst_amount, current_stock
) VALUES 
    (
        'SALES-01', '97ed8a0b-9624-49ea-9ded-b0817b5e5a9c', '2025-05-18', 'L''Oreal Shampoo', 
        1, 3200, 18, 3200.00, 288.00, 288.00, 3776.00, 0, 576, '1212', 'pcs', 
        null, null, 3776.00, 0, 17
    ),
    (
        'SALES-02', 'b5f8c5e9-7e1d-4c3a-9821-4a078a9f2e5c', '2025-05-17', 'Schwarzkopf Hair Color', 
        2, 1250, 18, 2500.00, 225.00, 225.00, 2950.00, 100, 450, '3304', 'bottle', 
        1550.00, 1200.00, 2950.00, 0, 25
    ),
    (
        'SALES-03', 'c75eb6f1-1dd2-4520-9c2f-44a878bac8d5', '2025-05-16', 'Matrix Hair Serum', 
        3, 850, 12, 2550.00, 153.00, 153.00, 2856.00, 50, 306, '3305', 'bottles', 
        980.00, 825.00, 2856.00, 0, 8
    ),
    (
        'SALES-04', 'd9ae7bc6-2ef3-4f76-8b93-5c128fd6a2da', '2025-05-15', 'Wella Hair Spray', 
        1, 1800, 18, 1800.00, 162.00, 162.00, 2124.00, 0, 324, '3305', 'can', 
        2124.00, null, 2124.00, 0, 12
    ),
    (
        'SALES-05', 'e4f2a3b1-5c6d-7e8f-9a0b-1c2d3e4f5a67', '2025-05-14', 'Tresemme Conditioner', 
        2, 950, 18, 1900.00, 171.00, 171.00, 2242.00, 75, 342, '3305', 'bottle', 
        1200.00, 1100.00, 2242.00, 0, 20
    ),
    (
        'SALES-06', 'f6e5d4c3-b2a1-9f8e-7d6c-5b4a3c2d1e0f', '2025-05-13', 'Moroccan Oil Treatment', 
        1, 3500, 18, 3500.00, 315.00, 315.00, 4130.00, 0, 630, '1212', 'bottle', 
        4130.00, null, 4130.00, 0, 5
    ),
    (
        'SALES-07', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '2025-05-12', 'Olaplex Bond Maintainer', 
        1, 2800, 18, 2800.00, 252.00, 252.00, 3304.00, 0, 504, '3304', 'bottle', 
        3304.00, null, 3304.00, 0, 7
    ),
    (
        'SALES-08', '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '2025-05-11', 'Schwarzkopf Hair Color', 
        3, 1250, 18, 3750.00, 337.50, 337.50, 4425.00, 150, 675, '3304', 'bottle', 
        1550.00, 1200.00, 4425.00, 0, 22
    ),
    (
        'SALES-09', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '2025-05-10', 'Kerastase Shampoo', 
        1, 2500, 18, 2500.00, 225.00, 225.00, 2950.00, 0, 450, '1212', 'bottle', 
        2950.00, null, 2950.00, 0, 10
    ),
    (
        'SALES-10', '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', '2025-05-09', 'Biolage Hair Mask', 
        2, 1800, 18, 3600.00, 324.00, 324.00, 4248.00, 100, 648, '3304', 'jar', 
        2200.00, 1750.00, 4248.00, 0, 15
    ); 