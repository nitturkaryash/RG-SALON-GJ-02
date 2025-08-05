-- Create function to calculate current stock at purchase
CREATE OR REPLACE FUNCTION calculate_current_stock_at_purchase(
  product_name_param TEXT,
  date_param DATE
)
RETURNS TABLE(current_stock INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT (
    (SELECT COALESCE(SUM(p2.purchase_qty), 0)
     FROM public.inventory_purchases p2
     WHERE p2.product_name = product_name_param AND p2.date <= date_param)
    - (SELECT COALESCE(SUM(s.quantity), 0)
       FROM public.inventory_sales_new s
       WHERE s.product_name = product_name_param AND s.date <= date_param)
    - (SELECT COALESCE(SUM(c.consumption_qty), 0)
       FROM public.inventory_consumption c
       WHERE c.product_name = product_name_param AND c.date <= date_param)
  ) AS current_stock;
END;
$$; 