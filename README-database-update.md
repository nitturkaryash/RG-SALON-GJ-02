# Database Update Instructions

To fix the issue with Purchase Cost/Unit (Ex.GST) and Taxable Value calculations, please run the following SQL in the Supabase SQL Editor:

```sql
-- Add purchase_cost_per_unit_ex_gst column to inventory_purchases table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'inventory_purchases' 
        AND column_name = 'purchase_cost_per_unit_ex_gst'
    ) THEN
        ALTER TABLE inventory_purchases 
        ADD COLUMN purchase_cost_per_unit_ex_gst FLOAT;
        
        -- Update existing records to calculate this value
        UPDATE inventory_purchases
        SET purchase_cost_per_unit_ex_gst = (
            CASE 
                WHEN mrp_excl_gst IS NOT NULL AND discount_on_purchase_percentage IS NOT NULL
                THEN mrp_excl_gst * (1 - (discount_on_purchase_percentage / 100))
                WHEN purchase_qty > 0 AND purchase_taxable_value IS NOT NULL 
                THEN purchase_taxable_value / purchase_qty
                ELSE NULL
            END
        );
        
        -- Now update purchase_taxable_value based on purchase_cost_per_unit_ex_gst * purchase_qty
        UPDATE inventory_purchases
        SET purchase_taxable_value = purchase_cost_per_unit_ex_gst * purchase_qty
        WHERE purchase_cost_per_unit_ex_gst IS NOT NULL AND purchase_qty IS NOT NULL;
        
        -- Update GST values based on the new taxable value
        UPDATE inventory_purchases
        SET 
            purchase_cgst = purchase_taxable_value * (gst_percentage / 200),
            purchase_sgst = purchase_taxable_value * (gst_percentage / 200),
            purchase_invoice_value_rs = purchase_taxable_value * (1 + (gst_percentage / 100))
        WHERE purchase_taxable_value IS NOT NULL AND gst_percentage IS NOT NULL;
        
        RAISE NOTICE 'Added purchase_cost_per_unit_ex_gst column and updated related calculations in inventory_purchases table';
    ELSE
        RAISE NOTICE 'purchase_cost_per_unit_ex_gst column already exists in inventory_purchases table';
    END IF;
END $$;
```

## Steps to Run the SQL:

1. Log into your Supabase account
2. Navigate to the SQL Editor
3. Paste the above SQL into the editor
4. Click "Run" to execute the script

This will:
1. Add the purchase_cost_per_unit_ex_gst column if it doesn't exist
2. Calculate its value from mrp_excl_gst and discount_on_purchase_percentage
3. Update the purchase_taxable_value to be purchase_cost_per_unit_ex_gst * purchase_qty
4. Update all related GST and invoice value calculations 