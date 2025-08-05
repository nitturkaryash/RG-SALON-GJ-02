# Purchase History with Stock - Complete Implementation Guide

## Overview

This implementation provides a comprehensive solution for the `purchase_history_with_stock` table that automatically handles stock calculations for:

- ✅ **Historical date insertions** - Adding purchases with older dates
- ✅ **Purchase deletions** - Removing old purchases with automatic stock recalculation
- ✅ **Purchase updates** - Modifying quantities with automatic adjustments
- ✅ **Multi-user isolation** - Each user's data is completely isolated

## Key Features

### 1. **Automatic Stock Calculation**
The system calculates `current_stock_at_purchase` using the formula:
```
Current Stock = Total Purchases (up to date) - Total Sales (up to date) - Total Consumption (up to date)
```

### 2. **Smart Historical Handling**
When you add/modify/delete a purchase with an historical date, the system automatically:
- Recalculates stock for that date
- Updates ALL subsequent purchase records
- Maintains data consistency across all dates

### 3. **Computed Stock Values**
Automatically calculates:
- `computed_stock_taxable_value`
- `computed_stock_igst/cgst/sgst`
- `computed_stock_total_value`

## Scenarios Explained

### Scenario 1: Historical Purchase Addition

**Situation**: Today is 8/7/2025, you want to add a purchase dated 8/6/2025

**Before Addition**:
```
Purchase No 2: Date 8/6/2025, Qty 2 tubes, Current Stock: 2
```

**After Adding Purchase No 1 (8/6/2025, 1 tube)**:
```
Purchase No 1: Date 8/6/2025, Qty 1 tube, Current Stock: 1
Purchase No 2: Date 8/6/2025, Qty 2 tubes, Current Stock: 3  ← Auto-updated
```

### Scenario 2: Historical Purchase Deletion

**Before Deletion**:
```
Purchase No 1: Date 8/6/2025, Qty 1 tube, Current Stock: 1
Purchase No 2: Date 8/6/2025, Qty 2 tubes, Current Stock: 3
```

**After Deleting Purchase No 1**:
```
Purchase No 2: Date 8/6/2025, Qty 2 tubes, Current Stock: 2  ← Auto-updated
```

### Scenario 3: Purchase Quantity Update

**Before Update**:
```
Purchase: Date 8/6/2025, Qty 1 tube, Current Stock: 1
```

**After Updating Qty to 3 tubes**:
```
Purchase: Date 8/6/2025, Qty 3 tubes, Current Stock: 3  ← Auto-updated
```

## Database Setup Instructions

### Step 1: Apply the Main Script
```sql
-- Run the entire comprehensive_purchase_history_with_stock_setup.sql file
-- This creates the table, indexes, functions, and triggers
```

### Step 2: Verify Installation
```sql
-- Check if table exists
SELECT COUNT(*) FROM public.purchase_history_with_stock;

-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%purchase_history%';

-- Check if triggers exist
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.purchase_history_with_stock'::regclass;
```

### Step 3: Test the System
```sql
-- Test with sample data (replace user_id with actual user ID)
INSERT INTO public.purchase_history_with_stock (
  purchase_id, date, product_name, purchase_qty, mrp_incl_gst, mrp_excl_gst, 
  gst_percentage, user_id
) VALUES (
  gen_random_uuid(), '2025-08-06', 'Test Product', 5, 100.00, 84.75, 18.00,
  'your-user-id-here'
);

-- Verify stock calculation
SELECT product_name, date, purchase_qty, current_stock_at_purchase 
FROM public.purchase_history_with_stock 
WHERE product_name = 'Test Product'
ORDER BY date;
```

## Manual Operations

### Recalculate Stock for Specific Product
```sql
SELECT public.recalculate_product_stock('Product Name', 'user-uuid-here');
```

### Recalculate All Products for User
```sql
SELECT public.recalculate_all_user_stock('user-uuid-here');
```

### Check Current Stock at Date
```sql
SELECT public.calculate_current_stock_at_date('Product Name', '2025-08-06', 'user-uuid-here');
```

## Integration with Existing Code

### TypeScript Usage Example
```typescript
// When inserting a new purchase
const { data, error } = await supabase
  .from('purchase_history_with_stock')
  .insert({
    purchase_id: generateUUID(),
    date: '2025-08-06',
    product_name: 'Hair Shampoo',
    purchase_qty: 10,
    mrp_incl_gst: 590.00,
    mrp_excl_gst: 500.00,
    gst_percentage: 18.00,
    // user_id will be auto-set by trigger
  });

// The system automatically:
// 1. Sets user_id from current session
// 2. Calculates current_stock_at_purchase
// 3. Computes all stock values
// 4. Updates subsequent records if this is a historical date
```

### Delete with Automatic Recalculation
```typescript
// When deleting a purchase
const { error } = await supabase
  .from('purchase_history_with_stock')
  .delete()
  .eq('purchase_id', purchaseId);

// The system automatically:
// 1. Removes the record
// 2. Recalculates stock for all subsequent records
// 3. Updates computed values
```

## Performance Considerations

### Indexes Created
- `idx_purchase_history_user_id` - Fast user filtering
- `idx_purchase_history_product_name` - Product-based queries
- `idx_purchase_history_date` - Date-based operations
- `idx_purchase_history_user_product_date` - Composite index for stock calculations

### Optimization Tips
1. **Batch Operations**: For bulk imports, disable triggers temporarily
2. **User Isolation**: Always filter by user_id in queries
3. **Date Ordering**: The system processes records in chronological order

## Error Handling

### Common Issues and Solutions

**Issue**: Stock calculations seem incorrect
**Solution**: Run manual recalculation
```sql
SELECT public.recalculate_all_user_stock('your-user-id');
```

**Issue**: User ID not being set automatically
**Solution**: Ensure user is properly authenticated and profile exists
```sql
SELECT id FROM public.profiles WHERE auth_user_id = auth.uid();
```

**Issue**: Performance issues with large datasets
**Solution**: Check if indexes are created and being used
```sql
EXPLAIN ANALYZE SELECT * FROM purchase_history_with_stock WHERE user_id = 'uuid' AND product_name = 'name';
```

## Migration from Existing Data

If you have existing purchase data:

```sql
-- 1. Create backup
CREATE TABLE purchase_history_backup AS SELECT * FROM purchase_history_with_stock;

-- 2. Add user_id to existing records (replace with actual user ID)
UPDATE purchase_history_with_stock 
SET user_id = 'your-user-id-here' 
WHERE user_id IS NULL;

-- 3. Recalculate all stock
SELECT public.recalculate_all_user_stock('your-user-id-here');
```

## Testing Scenarios

### Test Case 1: Historical Insertion
```sql
-- Insert future date first
INSERT INTO purchase_history_with_stock (purchase_id, date, product_name, purchase_qty, user_id)
VALUES (gen_random_uuid(), '2025-08-10', 'Test Product', 5, 'user-id');

-- Insert historical date
INSERT INTO purchase_history_with_stock (purchase_id, date, product_name, purchase_qty, user_id)
VALUES (gen_random_uuid(), '2025-08-05', 'Test Product', 3, 'user-id');

-- Verify: 8/5 should show stock=3, 8/10 should show stock=8
SELECT date, purchase_qty, current_stock_at_purchase 
FROM purchase_history_with_stock 
WHERE product_name = 'Test Product' 
ORDER BY date;
```

### Test Case 2: Deletion Impact
```sql
-- Delete the historical record
DELETE FROM purchase_history_with_stock 
WHERE date = '2025-08-05' AND product_name = 'Test Product';

-- Verify: 8/10 should now show stock=5 (reduced by 3)
SELECT date, purchase_qty, current_stock_at_purchase 
FROM purchase_history_with_stock 
WHERE product_name = 'Test Product' 
ORDER BY date;
```

## Support and Maintenance

### Monitoring Stock Accuracy
```sql
-- Compare calculated vs stored stock
WITH calculated_stock AS (
  SELECT 
    phs.purchase_id,
    phs.current_stock_at_purchase as stored_stock,
    public.calculate_current_stock_at_date(phs.product_name, phs.date::DATE, phs.user_id) as calculated_stock
  FROM purchase_history_with_stock phs
)
SELECT * FROM calculated_stock 
WHERE stored_stock != calculated_stock;
```

### Regular Maintenance
```sql
-- Monthly recalculation (recommended)
SELECT public.recalculate_all_user_stock('user-id-here');
```

This implementation provides a robust, scalable solution for purchase history with automatic stock management that handles all your specified scenarios correctly.