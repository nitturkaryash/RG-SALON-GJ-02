# Opening Balance Stock Calculation Fix

## Issue Description

When adding opening balance entries, the system was showing incorrect current stock data. The problem was in how the `current_stock_at_purchase` field was being calculated for opening balance transactions.

## Root Cause

In the `addOpeningBalance` function in `src/hooks/usePurchaseHistory.ts`, the `current_stock_at_purchase` field was incorrectly set to just the opening balance quantity:

```typescript
// INCORRECT - Before fix
current_stock_at_purchase: openingData.opening_qty,
```

This was wrong because `current_stock_at_purchase` should represent the **total stock after the transaction**, not just the transaction quantity itself.

## The Fix

The fix involves properly calculating the total stock after adding the opening balance:

```typescript
// CORRECT - After fix
// First get current stock
const { data: currentProduct, error: fetchError } = await supabase
  .from('products')
  .select('stock_quantity')
  .eq('id', openingData.product_id)
  .single();

// Calculate the total stock after adding opening balance
const currentStock = currentProduct?.stock_quantity || 0;
const totalStockAfterOpening = currentStock + openingData.opening_qty;

// Use the total stock in the record
current_stock_at_purchase: totalStockAfterOpening,
```

## What Changed

### File: `src/hooks/usePurchaseHistory.ts`

1. **Added stock calculation logic**: Before inserting the opening balance record, we now fetch the current stock from the products table.

2. **Fixed current_stock_at_purchase**: Instead of setting it to just the opening quantity, we calculate the total stock after adding the opening balance.

3. **Improved error handling**: Made the stock fetching operation mandatory (throws error if it fails) to ensure data consistency.

4. **Streamlined product update**: Simplified the product stock update logic since we already have the current stock.

## How It Works Now

1. **Fetch Current Stock**: Get the current stock quantity from the products table
2. **Calculate Total**: Add the opening balance quantity to the current stock
3. **Store Correct Value**: Use this total as `current_stock_at_purchase`
4. **Update Product**: Update the products table with the new total stock

## Example

Before fix:
- Current stock in products table: 10 units
- Adding opening balance: 5 units
- `current_stock_at_purchase` was set to: 5 (WRONG)
- Displayed current stock: 5 units (WRONG)

After fix:
- Current stock in products table: 10 units
- Adding opening balance: 5 units
- `current_stock_at_purchase` is set to: 15 (CORRECT)
- Displayed current stock: 15 units (CORRECT)

## Impact

This fix ensures that:
1. Opening balance entries show the correct total stock after the opening balance is added
2. Stock calculations in the inventory system are accurate
3. Reports and analytics based on stock data are correct
4. The system maintains data consistency between the products table and purchase history

## Testing

To verify the fix:
1. Add an opening balance for a product that already has some stock
2. Check that the "Current Stock" column shows the total (existing + opening balance)
3. Verify that the products table is updated with the correct total stock
4. Ensure that subsequent transactions calculate stock correctly based on this total

## Files Modified

- `src/hooks/usePurchaseHistory.ts` - Fixed the `addOpeningBalance` function 