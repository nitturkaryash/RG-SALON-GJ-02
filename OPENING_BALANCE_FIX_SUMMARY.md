# Opening Balance Fix Summary

## Issues Fixed

### 1. Double Entry Problem
**Problem**: When adding an opening balance, the system was creating two entries.

**Root Cause**: The code was trying to use `inventory_purchases` table which doesn't exist or has different schema than expected.

**Solution**: Modified `usePurchaseHistory.ts` to insert directly into `purchase_history_with_stock` table only, which is the main table being used for purchase history.

### 2. Terminology Confusion
**Problem**: The system used "Inventory Update" terminology which was confusing since it's actually for opening balance entries.

**Solution**: Renamed all references from "inventory_update" to "opening_balance" throughout the codebase.

## Changes Made

### 1. Frontend Changes

#### `src/hooks/usePurchaseHistory.ts`
- Updated `PurchaseTransaction` interface to include all transaction types: `'purchase' | 'opening_balance' | 'stock_increment' | 'stock_decrement' | 'pos_sale'`
- Fixed `addOpeningBalance` function to insert directly into `purchase_history_with_stock` table
- Changed transaction_type from `'inventory_update'` to `'opening_balance'`
- Removed references to `inventory_purchases` table

#### `src/pages/InventoryManager.tsx`
- Renamed function from `handleOpenInventoryUpdate` to `handleOpenOpeningBalance`
- Changed button text from "Update Inventory" to "Add Opening Balance"
- Updated all references from `'inventory_update'` to `'opening_balance'`
- Fixed TypeScript type comparisons to prevent linter errors
- Updated dialog title to show "Add Opening Balance" in inventory mode

#### `src/utils/inventoryUtils.ts`
- Changed default transaction type from `'inventory_update'` to `'opening_balance'`
- Updated supplier text from `'INVENTORY UPDATE'` to `'OPENING BALANCE'`
- Changed invoice number to `'OPENING BALANCE'`

### 2. Database Changes

#### `manual_database_update.sql` (Updated)
Updated the manual SQL script to:
- Work only with `purchase_history_with_stock` table
- Drop existing transaction_type constraints
- Update existing records from `'inventory_update'` to `'opening_balance'`
- Add new constraints that include `'opening_balance'` but exclude `'inventory_update'`
- Update column comments to reflect the change
- Provide verification queries

#### `supabase/migrations/20250614000000_fix_opening_balance_constraint.sql`
- Updated migration to replace `'inventory_update'` with `'opening_balance'` in constraints
- Added data migration to update existing records

## How to Apply the Fix

### 1. Database Update
Run the `manual_database_update.sql` script in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of manual_database_update.sql
-- into your Supabase SQL Editor and execute
```

### 2. Frontend Update
The frontend changes are already applied in the codebase. No additional action needed.

## Verification

After applying the fix:

1. **Check Database Constraints**:
   ```sql
   SELECT tc.table_name, tc.constraint_name, cc.check_clause
   FROM information_schema.table_constraints tc
   JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
   WHERE tc.constraint_name LIKE '%transaction_type_check%';
   ```

2. **Verify No Double Entries**:
   - Add a new opening balance through the UI
   - Check that only one record is created in `purchase_history_with_stock`
   - Verify the record has `transaction_type = 'opening_balance'`

3. **Check UI Changes**:
   - Button should now say "Add Opening Balance" instead of "Update Inventory"
   - Dialog title should show "Add Opening Balance"
   - Opening balance entries should be labeled as "OPENING BALANCE" in the table

## Expected Behavior After Fix

1. **Single Entry**: Adding opening balance creates only one record in `purchase_history_with_stock` table
2. **Correct Labeling**: All opening balance entries are clearly marked as "OPENING BALANCE"
3. **Proper Categorization**: Opening balance entries are distinguished from regular purchases
4. **No Type Errors**: TypeScript compilation should be clean without type comparison warnings

## Files Modified

- `src/hooks/usePurchaseHistory.ts`
- `src/pages/InventoryManager.tsx`
- `src/utils/inventoryUtils.ts`
- `supabase/migrations/20250614000000_fix_opening_balance_constraint.sql`
- `manual_database_update.sql` (updated to work only with purchase_history_with_stock)

## Testing Checklist

- [ ] Database constraints updated successfully
- [ ] No existing records with `'inventory_update'` transaction type
- [ ] Adding opening balance creates only one database record in `purchase_history_with_stock`
- [ ] UI shows "Add Opening Balance" button and dialog title
- [ ] Opening balance entries display as "OPENING BALANCE" in tables
- [ ] No TypeScript compilation errors
- [ ] Stock quantities update correctly when adding opening balance 