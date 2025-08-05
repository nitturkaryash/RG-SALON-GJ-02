-- Test script for purchase delete function
-- This script helps verify that deleting an old purchase entry properly updates all current stock values

-- Step 1: Check current purchase history for a specific product
-- Replace 'your-product-id' with an actual product ID from your database
SELECT 
  purchase_id,
  product_name,
  date,
  purchase_qty,
  current_stock_at_purchase,
  purchase_invoice_number
FROM purchase_history_with_stock 
WHERE product_id = 'your-product-id'
ORDER BY date ASC;

-- Step 2: Check current product stock
SELECT 
  id,
  name,
  stock_quantity
FROM product_master 
WHERE id = 'your-product-id';

-- Step 3: Test the delete function (replace with actual purchase_id)
-- SELECT delete_purchase_with_stock_recalculation('purchase-uuid-here');

-- Step 4: Verify the results after deletion
-- Run the same queries as Step 1 and Step 2 to see the updated values

-- Expected behavior:
-- 1. The deleted purchase should be removed from purchase_history_with_stock
-- 2. All remaining purchase records should have updated current_stock_at_purchase values
-- 3. The product_master stock_quantity should be reduced by the deleted quantity
-- 4. All entries above the deleted entry should show reduced current stock values 