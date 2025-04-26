# Remaining Stock Calculation in Sales History

## Overview

The Sales History table now includes a "Remaining Stock" column that shows the calculated stock level after each transaction. This allows tracking of inventory changes over time for each product.

## How It Works

The remaining stock is calculated in the database using the following approach:

1. **Initial Stock Calculation**: For each product, we calculate the initial stock by adding all sold quantities to the current stock level. This gives us a starting point that represents what the stock would have been before any sales.

2. **Running Total**: For each sale, we calculate a running total of quantity sold for that product up to that point in time.

3. **Remaining Stock**: The remaining stock for each row is calculated by subtracting the running total from the initial stock.

4. **Zero Floor**: We ensure the remaining stock never goes below zero using the `GREATEST(0, remaining_stock)` function.

## Implementation Details

The calculation is implemented in the `sales_product_new` view which uses a window function to calculate the running total of quantities sold for each product ordered by date:

```sql
-- Calculate remaining stock after each sale
SELECT
  rs.*,
  isc.initial_stock,
  (isc.initial_stock - SUM(rs.quantity::numeric) OVER (
    PARTITION BY rs.product_id 
    ORDER BY rs.date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ))::numeric AS remaining_stock
FROM
  ranked_sales rs
JOIN
  initial_stock_calc isc ON rs.product_id = isc.product_id
```

## Deployment

To apply this change to your database, run the migration script:

### Windows (PowerShell)
```powershell
.\scripts\run_migrations.ps1
```

### Linux/MacOS (Bash)
```bash
bash scripts/run_migrations.sh
```

Or manually execute the SQL file:
```
supabase/migrations/20250615_add_remaining_stock_to_sales_view.sql
```

## Front-end Integration

The Sales History component has been updated to display this information and there's no need for frontend calculation as the remaining stock data now comes directly from the database.

## Benefits

- Accurately track product stock levels over time
- Understand historical inventory changes
- Identify potential inventory discrepancies
- Visualize stock fluctuations with color-coded indicators (red for low stock, orange for medium, green for good) 