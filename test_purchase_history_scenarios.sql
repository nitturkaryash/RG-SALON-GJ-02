-- =========================================================================
-- PURCHASE HISTORY STOCK SCENARIOS - COMPREHENSIVE TEST SCRIPT
-- =========================================================================
-- This script tests all scenarios for the purchase_history_with_stock table
-- Run this after setting up the main table and functions
-- =========================================================================

-- Test Setup: Create a test user (replace with actual user ID in production)
-- =========================================================================
DO $$
DECLARE
  test_user_id UUID := '3f4b718f-70cb-4873-a62c-b8806a92e25b'; -- Replace with actual user ID
BEGIN
  -- Clean up any existing test data
  DELETE FROM public.purchase_history_with_stock 
  WHERE product_name = 'Test Tubes' AND user_id = test_user_id;
  
  -- Also clean up from related tables
  DELETE FROM public.inventory_purchases 
  WHERE product_name = 'Test Tubes' AND user_id = test_user_id;
  
  DELETE FROM public.inventory_sales_new 
  WHERE product_name = 'Test Tubes' AND user_id = test_user_id;
  
  DELETE FROM public.inventory_consumption 
  WHERE product_name = 'Test Tubes' AND user_id = test_user_id;
  
  RAISE NOTICE 'Test data cleaned up for user: %', test_user_id;
END
$$;

-- =========================================================================
-- SCENARIO 1: Normal Purchase Flow (Forward Chronological Order)
-- =========================================================================

RAISE NOTICE '=== SCENARIO 1: Normal Purchase Flow ===';

-- Purchase 1: 8/6/2025, 1 tube
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_name, purchase_qty, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  purchase_invoice_number, supplier, user_id
) VALUES (
  '11111111-1111-1111-1111-111111111111'::UUID,
  '2025-08-06 10:00:00',
  'Test Tubes',
  1,
  118.00,
  100.00,
  18.00,
  'INV-001',
  'Supplier A',
  '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID
);

-- Purchase 2: 8/6/2025, 2 tubes (later in the day)
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_name, purchase_qty, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  purchase_invoice_number, supplier, user_id
) VALUES (
  '22222222-2222-2222-2222-222222222222'::UUID,
  '2025-08-06 15:00:00',
  'Test Tubes',
  2,
  118.00,
  100.00,
  18.00,
  'INV-002',
  'Supplier B',
  '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID
);

-- View Scenario 1 Results
SELECT 
  'Scenario 1 - Initial Purchases' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Expected Results:
-- Purchase 1: current_stock_at_purchase = 1
-- Purchase 2: current_stock_at_purchase = 3

-- =========================================================================
-- SCENARIO 2: Historical Purchase Deletion
-- =========================================================================

RAISE NOTICE '=== SCENARIO 2: Historical Purchase Deletion ===';

-- Delete Purchase 1 (the earlier one)
DELETE FROM public.purchase_history_with_stock 
WHERE purchase_id = '11111111-1111-1111-1111-111111111111'::UUID;

-- View results after deletion
SELECT 
  'Scenario 2 - After Deletion' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Expected Results:
-- Purchase 2: current_stock_at_purchase = 2 (reduced from 3 to 2)

-- =========================================================================
-- SCENARIO 3: Historical Date Addition (Older Date)
-- =========================================================================

RAISE NOTICE '=== SCENARIO 3: Historical Date Addition ===';

-- Today is 8/7/2025, adding entry for 8/5/2025 (historical date)
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_name, purchase_qty, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  purchase_invoice_number, supplier, user_id
) VALUES (
  '33333333-3333-3333-3333-333333333333'::UUID,
  '2025-08-05 14:00:00',  -- Historical date (1 day before existing)
  'Test Tubes',
  3,  -- Adding 3 tubes historically
  118.00,
  100.00,
  18.00,
  'INV-003',
  'Supplier C',
  '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID
);

-- View results after historical addition
SELECT 
  'Scenario 3 - After Historical Addition' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Expected Results:
-- INV-003 (8/5): current_stock_at_purchase = 3
-- INV-002 (8/6): current_stock_at_purchase = 5 (updated from 2 to 5)

-- =========================================================================
-- SCENARIO 4: Multiple Historical Additions
-- =========================================================================

RAISE NOTICE '=== SCENARIO 4: Multiple Historical Additions ===';

-- Add another historical entry between existing dates
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_name, purchase_qty, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  purchase_invoice_number, supplier, user_id
) VALUES (
  '44444444-4444-4444-4444-444444444444'::UUID,
  '2025-08-05 20:00:00',  -- Same day as INV-003, but later time
  'Test Tubes',
  1,  -- Adding 1 more tube
  118.00,
  100.00,
  18.00,
  'INV-004',
  'Supplier D',
  '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID
);

-- View comprehensive results
SELECT 
  'Scenario 4 - Multiple Historical' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value,
  CASE 
    WHEN LAG(current_stock_at_purchase) OVER (ORDER BY date, created_at) IS NULL 
    THEN purchase_qty
    ELSE current_stock_at_purchase - LAG(current_stock_at_purchase) OVER (ORDER BY date, created_at)
  END as stock_increase
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Expected Results:
-- INV-003 (8/5 14:00): current_stock_at_purchase = 3, stock_increase = 3
-- INV-004 (8/5 20:00): current_stock_at_purchase = 4, stock_increase = 1  
-- INV-002 (8/6 15:00): current_stock_at_purchase = 6, stock_increase = 2

-- =========================================================================
-- SCENARIO 5: Purchase Quantity Update
-- =========================================================================

RAISE NOTICE '=== SCENARIO 5: Purchase Quantity Update ===';

-- Update INV-003 quantity from 3 to 5 tubes
UPDATE public.purchase_history_with_stock 
SET 
  purchase_qty = 5,  -- Increase from 3 to 5
  updated_at = NOW()
WHERE purchase_id = '33333333-3333-3333-3333-333333333333'::UUID;

-- View results after update
SELECT 
  'Scenario 5 - After Quantity Update' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Expected Results:
-- INV-003 (8/5 14:00): current_stock_at_purchase = 5 (updated), purchase_qty = 5
-- INV-004 (8/5 20:00): current_stock_at_purchase = 6 (auto-updated)
-- INV-002 (8/6 15:00): current_stock_at_purchase = 8 (auto-updated)

-- =========================================================================
-- SCENARIO 6: Adding Sales and Consumption to Test Complex Calculations
-- =========================================================================

RAISE NOTICE '=== SCENARIO 6: Complex Stock Calculations with Sales/Consumption ===';

-- Add some sales (these should reduce stock calculations)
INSERT INTO public.inventory_sales_new (
  id, product_name, quantity, date, user_id
) VALUES 
  (gen_random_uuid(), 'Test Tubes', 2, '2025-08-05 22:00:00', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID),
  (gen_random_uuid(), 'Test Tubes', 1, '2025-08-06 16:00:00', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID);

-- Add some consumption
INSERT INTO public.inventory_consumption (
  id, product_name, consumption_qty, date, user_id
) VALUES 
  (gen_random_uuid(), 'Test Tubes', 1, '2025-08-06 17:00:00', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID);

-- Trigger recalculation by updating a record
UPDATE public.purchase_history_with_stock 
SET updated_at = NOW()
WHERE purchase_id = '44444444-4444-4444-4444-444444444444'::UUID;

-- View final complex calculations
SELECT 
  'Scenario 6 - With Sales/Consumption' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value,
  ROUND(current_stock_at_purchase * mrp_incl_gst, 2) as expected_total_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Manual verification of stock calculation
SELECT 
  'Manual Stock Verification' as verification,
  date,
  public.calculate_current_stock_at_date(
    'Test Tubes', 
    date::DATE, 
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID
  ) as manually_calculated_stock,
  current_stock_at_purchase as stored_stock,
  CASE 
    WHEN public.calculate_current_stock_at_date('Test Tubes', date::DATE, '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID) = current_stock_at_purchase 
    THEN '✓ CORRECT'
    ELSE '✗ MISMATCH'
  END as validation
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- =========================================================================
-- SCENARIO 7: Complete Deletion and Re-addition Test
-- =========================================================================

RAISE NOTICE '=== SCENARIO 7: Complete Deletion and Re-addition ===';

-- Delete all purchases
DELETE FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes';

-- Re-add in non-chronological order to test sorting
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_name, purchase_qty, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  purchase_invoice_number, supplier, user_id
) VALUES 
  -- Add future date first
  ('77777777-7777-7777-7777-777777777777'::UUID, '2025-08-10 10:00:00', 'Test Tubes', 3, 118.00, 100.00, 18.00, 'INV-007', 'Supplier G', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID),
  -- Add middle date
  ('66666666-6666-6666-6666-666666666666'::UUID, '2025-08-08 10:00:00', 'Test Tubes', 2, 118.00, 100.00, 18.00, 'INV-006', 'Supplier F', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID),
  -- Add earliest date last
  ('55555555-5555-5555-5555-555555555555'::UUID, '2025-08-07 10:00:00', 'Test Tubes', 4, 118.00, 100.00, 18.00, 'INV-005', 'Supplier E', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID);

-- View final results with corrected stock after complex operations
SELECT 
  'Final Scenario - Non-chronological Addition' as scenario,
  purchase_invoice_number,
  date,
  purchase_qty,
  current_stock_at_purchase,
  computed_stock_total_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes'
ORDER BY date, created_at;

-- Expected Final Results (considering existing sales/consumption):
-- INV-005 (8/7): stock should account for all previous sales/consumption
-- INV-006 (8/8): stock = previous + 2
-- INV-007 (8/10): stock = previous + 3

-- =========================================================================
-- PERFORMANCE AND UTILITY TESTS
-- =========================================================================

RAISE NOTICE '=== PERFORMANCE AND UTILITY TESTS ===';

-- Test manual recalculation function
SELECT 'Manual Recalculation Result:' as test,
       public.recalculate_product_stock('Test Tubes', '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID);

-- Test full user recalculation
SELECT 'Full User Recalculation:' as test,
       public.recalculate_all_user_stock('3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID);

-- Performance test: Check query execution plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT product_name, date, current_stock_at_purchase 
FROM public.purchase_history_with_stock 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'::UUID 
  AND product_name = 'Test Tubes'
ORDER BY date;

-- =========================================================================
-- SUMMARY AND VALIDATION
-- =========================================================================

RAISE NOTICE '=== FINAL SUMMARY AND VALIDATION ===';

-- Summary of all test data
SELECT 
  'FINAL SUMMARY' as summary,
  COUNT(*) as total_purchases,
  SUM(purchase_qty) as total_purchased_qty,
  MAX(current_stock_at_purchase) as final_stock,
  SUM(computed_stock_total_value) as total_stock_value
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Tubes';

-- Validation query to ensure all calculations are correct
WITH validation AS (
  SELECT 
    purchase_id,
    product_name,
    date,
    current_stock_at_purchase as stored_stock,
    public.calculate_current_stock_at_date(product_name, date::DATE, user_id) as calculated_stock
  FROM public.purchase_history_with_stock 
  WHERE product_name = 'Test Tubes'
)
SELECT 
  'VALIDATION RESULTS' as validation,
  COUNT(*) as total_records,
  COUNT(CASE WHEN stored_stock = calculated_stock THEN 1 END) as correct_calculations,
  COUNT(CASE WHEN stored_stock != calculated_stock THEN 1 END) as incorrect_calculations,
  CASE 
    WHEN COUNT(CASE WHEN stored_stock != calculated_stock THEN 1 END) = 0 
    THEN '✅ ALL CALCULATIONS CORRECT'
    ELSE '❌ SOME CALCULATIONS INCORRECT'
  END as overall_status
FROM validation;

-- Clean up test data (optional - comment out if you want to keep test data)
/*
DELETE FROM public.purchase_history_with_stock WHERE product_name = 'Test Tubes';
DELETE FROM public.inventory_sales_new WHERE product_name = 'Test Tubes';
DELETE FROM public.inventory_consumption WHERE product_name = 'Test Tubes';
RAISE NOTICE 'Test data cleaned up successfully';
*/

RAISE NOTICE '=== ALL SCENARIOS COMPLETED ===';
RAISE NOTICE 'Check the results above to verify that:';
RAISE NOTICE '1. Historical insertions update subsequent records correctly';
RAISE NOTICE '2. Deletions recalculate all affected records';
RAISE NOTICE '3. Updates propagate changes to future records';
RAISE NOTICE '4. Stock calculations consider purchases, sales, and consumption';
RAISE NOTICE '5. Non-chronological data entry works correctly';