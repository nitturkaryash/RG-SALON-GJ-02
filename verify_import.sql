-- Final verification after all batches
SELECT 
  COUNT(*) as total_imported,
  SUM(total_amount) as total_revenue,
  COUNT(DISTINCT client_name) as unique_clients,
  COUNT(DISTINCT stylist_name) as unique_stylists,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
  AND date >= '2025-03-31'::date;

-- Expected results:
-- total_imported: 376
-- total_revenue: 5064584785.120001
-- unique_clients: 376
-- unique_stylists: 24

-- Re-enable triggers after all batches
ALTER TABLE pos_orders ENABLE TRIGGER handle_pos_orders_user_id_trigger;
ALTER TABLE pos_orders ENABLE TRIGGER set_tenant_id_pos_orders;

-- Sample of imported data
SELECT 
  client_name,
  payment_method,
  total_amount,
  stylist_name,
  jsonb_array_length(services) as service_count
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
  AND date >= '2025-03-31'::date
ORDER BY total_amount DESC
LIMIT 10;
