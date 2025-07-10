INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Gauri Savaliya', NULL, NULL, 18290, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 15500,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Creative Color',
      'service_name', 'Creative Color',
      'gst_percentage', 18,
      'subtotal', 15500,
      'tax', 2790,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Gauri Savaliya', '2025-04-01 00:00:00+00', 18290, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Muskan Nandwani', NULL, NULL, 2950, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Strengthning',
      'service_name', 'Hair Strengthning',
      'gst_percentage', 18,
      'subtotal', 2500,
      'tax', 450,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Muskan Nandwani', '2025-04-01 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Nikita Shah', NULL, NULL, 767, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 650,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Senior Hairdresser (Male)',
      'service_name', 'Hair Cut With Senior Hairdresser (Male)',
      'gst_percentage', 18,
      'subtotal', 650,
      'tax', 117,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Nikita Shah', '2025-04-01 00:00:00+00', 767, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Prachi patel', NULL, NULL, 1416, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1200,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 30,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 1200,
      'tax', 216,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Prachi patel', '2025-04-01 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Dimple Sharma', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Skin - FACE',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'FACE PACK',
      'service_name', 'FACE PACK',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Dimple Sharma', '2025-04-01 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);