# Purchase Delete with Automatic Stock Recalculation

## Overview
This feature automatically recalculates stock values for all subsequent purchase records when you delete an old purchase row. The current stock in the above rows will be automatically adjusted based on the deleted row's consumed quantity.

## Setup Instructions

### 1. Apply Database Functions
Copy and paste the entire contents of `purchase_delete_stock_recalculation.sql` into your Supabase SQL Editor and run it. This will create three functions:

- `calculate_current_stock_at_purchase()` - Calculates current stock at a specific date
- `recalculate_stock_after_purchase_delete()` - Recalculates stock for all subsequent records
- `delete_purchase_with_stock_recalculation()` - Main function that handles deletion with automatic recalculation

### 2. Updated TypeScript Code
The `deletePurchaseTransaction` function in `src/utils/inventoryUtils.ts` has been updated to use the new database function for better performance and reliability.

## How It Works

1. **When you delete a purchase record:**
   - The system first identifies the purchase to delete
   - Deletes the purchase record from `purchase_history_with_stock`
   - Finds all subsequent purchase records for the same product (same or later date)
   - Recalculates the `current_stock_at_purchase` for each subsequent record
   - Updates all computed stock values (taxable, IGST, CGST, SGST, total)
   - Updates the product's current stock in `product_master`
   - Records the deletion in `stock_history`

2. **Stock Calculation Logic:**
   ```
   Current Stock = Total Purchases (up to date) - Total Sales (up to date) - Total Consumption (up to date)
   ```

3. **Example:**
   - You have 3 purchase records: Jan 1 (100 units), Jan 15 (50 units), Feb 1 (25 units)
   - Current stock after Feb 1: 175 units
   - If you delete the Jan 15 record (50 units):
     - Jan 1 record: current_stock_at_purchase remains 100 (no change)
     - Feb 1 record: current_stock_at_purchase becomes 125 (100 + 25, since Jan 15 is deleted)
     - Product master stock: updated to 125

## Benefits

- **Automatic Recalculation:** No manual intervention needed
- **Data Integrity:** All subsequent records are properly updated
- **Audit Trail:** All changes are recorded in stock_history
- **Performance:** Uses efficient database functions instead of multiple API calls
- **Consistency:** Ensures stock calculations are always accurate

## Testing

After applying the functions, you can test by:

1. Going to the Purchase History section
2. Deleting an old purchase record
3. Verifying that:
   - The record is deleted
   - Subsequent records show updated current stock values
   - The product's current stock is updated correctly
   - A record appears in stock_history

## Troubleshooting

If you encounter issues:

1. **Check the stock_history table** for deletion records
2. **Verify the functions exist** by running: `SELECT * FROM information_schema.routines WHERE routine_name LIKE '%purchase%';`
3. **Test individual functions** using the commented test queries in the SQL file

## Rollback

If needed, you can rollback by:
1. Dropping the functions: `DROP FUNCTION IF EXISTS delete_purchase_with_stock_recalculation(UUID);`
2. Reverting the TypeScript code to the previous version 