-- Create function to recalculate stock for all subsequent purchase records
CREATE OR REPLACE FUNCTION recalculate_stock_after_purchase_delete(
  deleted_product_id UUID,
  deleted_date DATE,
  deleted_quantity INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
  purchase_record RECORD;
  new_current_stock INTEGER;
  new_stock_taxable_value DECIMAL;
  new_stock_igst DECIMAL;
  new_stock_cgst DECIMAL;
  new_stock_sgst DECIMAL;
  new_stock_total_value DECIMAL;
BEGIN
  -- Update all purchase records for the same product that come after the deleted date
  FOR purchase_record IN 
    SELECT * FROM purchase_history_with_stock 
    WHERE product_id = deleted_product_id 
    AND date >= deleted_date
    ORDER BY date ASC
  LOOP
    -- Calculate new current stock at purchase for this record
    -- Subtract the deleted quantity from the current stock
    SELECT (
      (SELECT COALESCE(SUM(p2.purchase_qty), 0)
       FROM inventory_purchases p2
       WHERE p2.product_name = purchase_record.product_name AND p2.date <= purchase_record.date)
      - (SELECT COALESCE(SUM(s.quantity), 0)
         FROM inventory_sales_new s
         WHERE s.product_name = purchase_record.product_name AND s.date <= purchase_record.date)
      - (SELECT COALESCE(SUM(c.consumption_qty), 0)
         FROM inventory_consumption c
         WHERE c.product_name = purchase_record.product_name AND c.date <= purchase_record.date)
    ) - deleted_quantity INTO new_current_stock;

    -- Ensure stock doesn't go below 0
    new_current_stock := GREATEST(new_current_stock, 0);

    -- Calculate new stock values
    new_stock_taxable_value := new_current_stock * COALESCE(purchase_record.mrp_excl_gst, 0);
    new_stock_igst := new_current_stock * COALESCE(purchase_record.mrp_excl_gst, 0) * (COALESCE(purchase_record.gst_percentage, 18) / 100.0);
    new_stock_cgst := new_current_stock * COALESCE(purchase_record.mrp_excl_gst, 0) * (COALESCE(purchase_record.gst_percentage, 18) / 200.0);
    new_stock_sgst := new_current_stock * COALESCE(purchase_record.mrp_excl_gst, 0) * (COALESCE(purchase_record.gst_percentage, 18) / 200.0);
    new_stock_total_value := new_stock_taxable_value + new_stock_igst + new_stock_cgst + new_stock_sgst;

    -- Update the purchase record
    UPDATE purchase_history_with_stock
    SET 
      current_stock_at_purchase = new_current_stock,
      computed_stock_taxable_value = new_stock_taxable_value,
      computed_stock_igst = new_stock_igst,
      computed_stock_cgst = new_stock_cgst,
      computed_stock_sgst = new_stock_sgst,
      computed_stock_total_value = new_stock_total_value,
      updated_at = NOW()
    WHERE purchase_id = purchase_record.purchase_id;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$; 