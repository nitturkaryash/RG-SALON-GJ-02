-- COMPREHENSIVE STOCK MANAGEMENT TEST SCENARIOS
-- Product: TEST AUG 3#
-- User ID: Starting with 3 (Surat location)

-- Test Product Details
-- Product ID: c1864a85-b3ec-4be6-855c-68565809a758
-- Product Name: TEST AUG 3#
-- HSN Code: 78787878
-- Units: TUBES
-- MRP (Excl GST): 6000
-- GST: 18%
-- MRP (Incl GST): 7080

-- SCENARIO 1: Initial Purchase - Starting from Zero Stock
-- Expected: Stock should increase from 0 to 10
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-01-01 10:00:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'INV-001',
    10, -- Purchase 10 units
    7080,
    6000,
    0,
    18,
    60000, -- 10 * 6000
    0,
    5400, -- 18% CGST on 60000
    5400, -- 18% SGST on 60000
    70800, -- 60000 + 5400 + 5400
    'Supplier A',
    0, -- Starting stock = 0
    0, -- Previous stock value = 0
    0,
    0,
    0,
    0,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'purchase',
    6000,
    '2025-01-01 10:00:00',
    '2025-01-01 10:00:00'
);

-- SCENARIO 2: Second Purchase - Adding to Existing Stock
-- Expected: Stock should increase from 10 to 25
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-01-15 14:30:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'INV-002',
    15, -- Purchase 15 more units
    7080,
    6000,
    0,
    18,
    90000, -- 15 * 6000
    0,
    8100, -- 18% CGST on 90000
    8100, -- 18% SGST on 90000
    106200, -- 90000 + 8100 + 8100
    'Supplier B',
    10, -- Stock before this purchase = 10
    60000, -- Previous stock value = 10 * 6000
    0,
    5400,
    5400,
    70800,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'purchase',
    6000,
    '2025-01-15 14:30:00',
    '2025-01-15 14:30:00'
);

-- SCENARIO 3: First Sale - Reducing Stock
-- Expected: Stock should decrease from 25 to 22
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-02-01 11:15:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'SALE-001',
    -3, -- Sell 3 units (negative quantity)
    7080,
    6000,
    0,
    18,
    -18000, -- -3 * 6000
    0,
    -1620, -- 18% CGST on -18000
    -1620, -- 18% SGST on -18000
    -21240, -- -18000 - 1620 - 1620
    'Customer A',
    25, -- Stock before this sale = 25
    150000, -- Previous stock value = 25 * 6000
    0,
    13500,
    13500,
    177000,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'sale',
    6000,
    '2025-02-01 11:15:00',
    '2025-02-01 11:15:00'
);

-- SCENARIO 4: Bulk Sale - Significant Stock Reduction
-- Expected: Stock should decrease from 22 to 12
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-02-10 16:45:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'SALE-002',
    -10, -- Sell 10 units (bulk sale)
    7080,
    6000,
    0,
    18,
    -60000, -- -10 * 6000
    0,
    -5400, -- 18% CGST on -60000
    -5400, -- 18% SGST on -60000
    -70800, -- -60000 - 5400 - 5400
    'Customer B',
    22, -- Stock before this sale = 22
    132000, -- Previous stock value = 22 * 6000
    0,
    11880,
    11880,
    155760,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'sale',
    6000,
    '2025-02-10 16:45:00',
    '2025-02-10 16:45:00'
);

-- SCENARIO 5: Purchase with Different Price - Price Variance Test
-- Expected: Stock should increase from 12 to 20, but with different cost
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-02-20 09:30:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'INV-003',
    8, -- Purchase 8 units at different price
    7670, -- Different MRP incl GST
    6500, -- Different MRP excl GST (increased price)
    0,
    18,
    52000, -- 8 * 6500
    0,
    4680, -- 18% CGST on 52000
    4680, -- 18% SGST on 52000
    61360, -- 52000 + 4680 + 4680
    'Supplier C',
    12, -- Stock before this purchase = 12
    72000, -- Previous stock value = 12 * 6000
    0,
    6480,
    6480,
    84960,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6500,
    'purchase',
    6500,
    '2025-02-20 09:30:00',
    '2025-02-20 09:30:00'
);

-- SCENARIO 6: Overselling Attempt - Testing Negative Stock Prevention
-- Expected: This should result in negative stock (stock goes from 20 to -5)
-- This tests the negative stock scenario mentioned in QuickBooks documentation
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-03-01 13:20:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'SALE-003',
    -25, -- Oversell: trying to sell 25 units when only 20 available
    7080,
    6000,
    0,
    18,
    -150000, -- -25 * 6000
    0,
    -13500, -- 18% CGST on -150000
    -13500, -- 18% SGST on -150000
    -177000, -- -150000 - 13500 - 13500
    'Customer C',
    20, -- Stock before this sale = 20
    124000, -- Previous stock value (mixed prices)
    0,
    11160,
    11160,
    146320,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'sale',
    6000,
    '2025-03-01 13:20:00',
    '2025-03-01 13:20:00'
);

-- SCENARIO 7: Stock Correction Purchase - Fixing Negative Stock
-- Expected: Stock should increase from -5 to 15
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2025-03-05 10:45:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'INV-004',
    20, -- Purchase 20 units to fix negative stock
    7080,
    6000,
    0,
    18,
    120000, -- 20 * 6000
    0,
    10800, -- 18% CGST on 120000
    10800, -- 18% SGST on 120000
    141600, -- 120000 + 10800 + 10800
    'Supplier A',
    -5, -- Stock before this purchase = -5 (negative)
    -30000, -- Negative stock value = -5 * 6000
    0,
    -2700,
    -2700,
    -35400,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'purchase',
    6000,
    '2025-03-05 10:45:00',
    '2025-03-05 10:45:00'
);

-- SCENARIO 8: Mixed Transactions on Same Day
-- Expected: Multiple transactions on same day should be handled correctly
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES 
-- Transaction 8A: Morning Sale
(
    gen_random_uuid(),
    '2025-03-10 08:30:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'SALE-004',
    -5, -- Sell 5 units in morning
    7080,
    6000,
    0,
    18,
    -30000,
    0,
    -2700,
    -2700,
    -35400,
    'Customer D',
    15, -- Stock before morning sale = 15
    90000,
    0,
    8100,
    8100,
    106200,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'sale',
    6000,
    '2025-03-10 08:30:00',
    '2025-03-10 08:30:00'
),
-- Transaction 8B: Afternoon Purchase
(
    gen_random_uuid(),
    '2025-03-10 15:45:00',
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'INV-005',
    12, -- Purchase 12 units in afternoon
    7080,
    6000,
    0,
    18,
    72000,
    0,
    6480,
    6480,
    84960,
    'Supplier D',
    10, -- Stock before afternoon purchase = 10
    60000,
    0,
    5400,
    5400,
    70800,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'purchase',
    6000,
    '2025-03-10 15:45:00',
    '2025-03-10 15:45:00'
);

-- SCENARIO 9: Old Date Transaction (Backdated Entry)
-- Expected: This should affect historical calculations
INSERT INTO purchase_history_with_stock (
    purchase_id,
    date,
    product_id,
    product_name,
    hsn_code,
    units,
    purchase_invoice_number,
    purchase_qty,
    mrp_incl_gst,
    mrp_excl_gst,
    discount_on_purchase_percentage,
    gst_percentage,
    purchase_taxable_value,
    purchase_igst,
    purchase_cgst,
    purchase_sgst,
    purchase_invoice_value_rs,
    supplier,
    current_stock_at_purchase,
    computed_stock_taxable_value,
    computed_stock_igst,
    computed_stock_cgst,
    computed_stock_sgst,
    computed_stock_total_value,
    user_id,
    "Purchase_Cost/Unit(Ex.GST)",
    transaction_type,
    price_inlcuding_disc,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '2024-12-15 14:20:00', -- Backdated to previous year
    'c1864a85-b3ec-4be6-855c-68565809a758',
    'TEST AUG 3#',
    '78787878',
    'TUBES',
    'INV-BACK-001',
    5, -- Purchase 5 units (backdated)
    7080,
    6000,
    0,
    18,
    30000,
    0,
    2700,
    2700,
    35400,
    'Supplier E',
    0, -- This was before any stock existed
    0,
    0,
    0,
    0,
    0,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    6000,
    'purchase',
    6000,
    '2025-03-15 16:00:00', -- Current timestamp when entered
    '2025-03-15 16:00:00'
);