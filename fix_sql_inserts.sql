-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert the first few records to test the format
INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Zarna Javeri', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Senior Hairdresser (Male)',
      'service_name', 'Hair Cut With Senior Hairdresser (Male)',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Zarna Javeri', '2025-04-01 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
),
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Tarun Vatiani', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Senior Hairdresser (Male)',
      'service_name', 'Hair Cut With Senior Hairdresser (Male)',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Tarun Vatiani', '2025-04-01 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
),
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Tarun Vatiani', NULL, NULL, 472, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 400,
      'category', 'HAIR - Beard Trim',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Beard Trim',
      'service_name', 'Beard Trim',
      'gst_percentage', 18,
      'subtotal', 400,
      'tax', 72,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Tarun Vatiani', '2025-04-01 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
); 