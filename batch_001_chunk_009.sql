INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Shreya Jaju', NULL, NULL, 1770, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Haircut With Senior Hairdresser(Female)',
      'service_name', 'Haircut With Senior Hairdresser(Female)',
      'gst_percentage', 18,
      'subtotal', 1500,
      'tax', 270,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Shreya Jaju', '2025-04-03 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-03 00:00:00+00', 'sanjay virani', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'sanjay virani', '2025-04-03 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Pankaj Dhingra', NULL, NULL, 1416, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1200,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 30,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Global Color',
      'service_name', 'Global Color',
      'gst_percentage', 18,
      'subtotal', 1200,
      'tax', 216,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Pankaj Dhingra', '2025-04-03 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Lakshmi Baid', NULL, NULL, 649, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 550,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Normal Wash',
      'service_name', 'Normal Wash',
      'gst_percentage', 18,
      'subtotal', 550,
      'tax', 99,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Lakshmi Baid', '2025-04-03 00:00:00+00', 649, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'),
(
  uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Viraj Khandwala', NULL, NULL, 4720, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 4000,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 100,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Global Color',
      'service_name', 'Global Color',
      'gst_percentage', 18,
      'subtotal', 4000,
      'tax', 720,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Viraj Khandwala', '2025-04-03 00:00:00+00', 4720, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);