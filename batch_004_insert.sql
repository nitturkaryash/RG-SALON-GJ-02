INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Rekha', NULL, NULL, 1121, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 950,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Full Leg Wax',
      'service_name', 'Full Leg Wax',
      'gst_percentage', 18,
      'subtotal', 950,
      'tax', 171,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Rekha', '2025-04-07 00:00:00+00', 1121, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Parth Simediya', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Parth Simediya', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Dimple Reshamwala', NULL, NULL, 2596, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2200,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 55,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 2200,
      'tax', 396,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Pawan Pradhan', 'Dimple Reshamwala', '2025-04-08 00:00:00+00', 2596, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Dimple Reshamwala', NULL, NULL, 1770, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1500,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Dandruff Treatment',
      'service_name', 'Dandruff Treatment',
      'gst_percentage', 18,
      'subtotal', 1500,
      'tax', 270,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dimple Reshamwala', '2025-04-08 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Rohan Mehta', NULL, NULL, 2950, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Creative director (Male)',
      'service_name', 'Hair Cut With Creative director (Male)',
      'gst_percentage', 18,
      'subtotal', 2500,
      'tax', 450,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rohan Mehta', '2025-04-08 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manisha Shah', NULL, NULL, 2454.4, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2600,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Intense Rituals',
      'service_name', 'Intense Rituals',
      'gst_percentage', 18,
      'subtotal', 2080,
      'tax', 374.4,
      'discount', 520
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Manisha Shah', '2025-04-08 00:00:00+00', 2454.4, NULL, 20,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 2950, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Creative director (Male)',
      'service_name', 'Hair Cut With Creative director (Male)',
      'gst_percentage', 18,
      'subtotal', 2500,
      'tax', 450,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Urjaa Patel', '2025-04-08 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1416, 'sale',
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
  'Rupesh Mahale', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 767, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 650,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Full Hand Wax',
      'service_name', 'Full Hand Wax',
      'gst_percentage', 18,
      'subtotal', 650,
      'tax', 117,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 767, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1121, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 950,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Full Leg Wax',
      'service_name', 'Full Leg Wax',
      'gst_percentage', 18,
      'subtotal', 950,
      'tax', 171,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1121, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 944, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 800,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Front Wax',
      'service_name', 'Front Wax',
      'gst_percentage', 18,
      'subtotal', 800,
      'tax', 144,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 944, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Bikini Wax',
      'service_name', 'Bikini Wax',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Back Wax',
      'service_name', 'Back Wax',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 708, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 600,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hip Wax',
      'service_name', 'Hip Wax',
      'gst_percentage', 18,
      'subtotal', 600,
      'tax', 108,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 708, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 3186, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 3000,
      'category', 'Skin - FACE',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'FACIAL',
      'service_name', 'FACIAL',
      'gst_percentage', 18,
      'subtotal', 2700,
      'tax', 486,
      'discount', 300
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 3186, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 354, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 300,
      'category', 'Skin - Threading',
      'hsn_code', '33059090',
      'quantity', 3,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Eyebrow',
      'service_name', 'Eyebrow',
      'gst_percentage', 18,
      'subtotal', 300,
      'tax', 54,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 354, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Urjaa Patel', '2025-04-08 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 649, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 550,
      'category', 'HAIR - Beard Trim',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Beard Colour',
      'service_name', 'Beard Colour',
      'gst_percentage', 18,
      'subtotal', 550,
      'tax', 99,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Urjaa Patel', '2025-04-08 00:00:00+00', 649, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1486.8, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1400,
      'category', 'Nails - Pedicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Classic Pedicure',
      'service_name', 'Classic Pedicure',
      'gst_percentage', 18,
      'subtotal', 1260,
      'tax', 226.8,
      'discount', 140
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1486.8, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 295, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 250,
      'category', 'Nails - nail cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hands Nail Cut And File',
      'service_name', 'Hands Nail Cut And File',
      'gst_percentage', 18,
      'subtotal', 250,
      'tax', 45,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Urjaa Patel', '2025-04-08 00:00:00+00', 295, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 2761.2, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2600,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Intense Rituals',
      'service_name', 'Intense Rituals',
      'gst_percentage', 18,
      'subtotal', 2340,
      'tax', 421.2,
      'discount', 260
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Urjaa Patel', '2025-04-08 00:00:00+00', 2761.2, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Rushabh K', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Rushabh K', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Jinesh Jain', NULL, NULL, 2950, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Creative director (Male)',
      'service_name', 'Hair Cut With Creative director (Male)',
      'gst_percentage', 18,
      'subtotal', 2500,
      'tax', 450,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jinesh Jain', '2025-04-08 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Nidhi jain', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 25,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Nidhi jain', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manoj Shah', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Manoj Shah', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manoj Shah', NULL, NULL, 2761.2, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2600,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Intense Rituals',
      'service_name', 'Intense Rituals',
      'gst_percentage', 18,
      'subtotal', 2340,
      'tax', 421.2,
      'discount', 260
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Manoj Shah', '2025-04-08 00:00:00+00', 2761.2, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manoj Shah', NULL, NULL, 2761.2, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2600,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Olaplex Hair Treatment',
      'service_name', 'Olaplex Hair Treatment',
      'gst_percentage', 18,
      'subtotal', 2340,
      'tax', 421.2,
      'discount', 260
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Manoj Shah', '2025-04-08 00:00:00+00', 2761.2, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Purvi Asodariya', NULL, NULL, 2832, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2400,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 60,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 2400,
      'tax', 432,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Purvi Asodariya', '2025-04-08 00:00:00+00', 2832, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Soniya Jain', NULL, NULL, 2950, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Creative director (Male)',
      'service_name', 'Hair Cut With Creative director (Male)',
      'gst_percentage', 18,
      'subtotal', 2500,
      'tax', 450,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Soniya Jain', '2025-04-08 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Parth K', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Parth K', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Nancy Tated', NULL, NULL, 1486.8, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1400,
      'category', 'Nails - Pedicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Classic Pedicure',
      'service_name', 'Classic Pedicure',
      'gst_percentage', 18,
      'subtotal', 1260,
      'tax', 226.8,
      'discount', 140
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Nancy Tated', '2025-04-08 00:00:00+00', 1486.8, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Nancy Tated', NULL, NULL, 1486.8, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1400,
      'category', 'Nails - Pedicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Classic Pedicure',
      'service_name', 'Classic Pedicure',
      'gst_percentage', 18,
      'subtotal', 1260,
      'tax', 226.8,
      'discount', 140
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Nancy Tated', '2025-04-08 00:00:00+00', 1486.8, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Jigyasha Agarwal', NULL, NULL, 413, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 350,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Flicks or Bangs cut',
      'service_name', 'Flicks or Bangs cut',
      'gst_percentage', 18,
      'subtotal', 350,
      'tax', 63,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Jigyasha Agarwal', '2025-04-08 00:00:00+00', 413, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Bhumika Panjabi', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Bhumika Panjabi', '2025-04-08 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Bhumika Panjabi', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'Bhumika Panjabi', '2025-04-08 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Sakshi Tekriwal', NULL, NULL, 1770, 'sale',
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
  'Arpan sampang Rai', 'Sakshi Tekriwal', '2025-04-09 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Hiren Chevli', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Hiren Chevli', '2025-04-09 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Hiren Chevli', NULL, NULL, 1416, 'sale',
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
  'Rupesh Mahale', 'Hiren Chevli', '2025-04-09 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Hiren Chevli', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Hiren Chevli', '2025-04-09 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Anu Agarwal', NULL, NULL, 4720, 'sale',
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
  'Nikhil Pujari', 'Anu Agarwal', '2025-04-09 00:00:00+00', 4720, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Anu Agarwal', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Anu Agarwal', '2025-04-09 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Anu Agarwal', NULL, NULL, 1652, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1400,
      'category', 'Nails - Pedicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Classic Pedicure',
      'service_name', 'Classic Pedicure',
      'gst_percentage', 18,
      'subtotal', 1400,
      'tax', 252,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Anu Agarwal', '2025-04-09 00:00:00+00', 1652, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Yogita Baid', NULL, NULL, 826, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 700,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Wash & Blow Dry',
      'service_name', 'Wash & Blow Dry',
      'gst_percentage', 18,
      'subtotal', 700,
      'tax', 126,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Yogita Baid', '2025-04-09 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Sangeeta Agarwal', NULL, NULL, 3540, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 3000,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Haircut With Creative director(female)',
      'service_name', 'Haircut With Creative director(female)',
      'gst_percentage', 18,
      'subtotal', 3000,
      'tax', 540,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sangeeta Agarwal', '2025-04-09 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Ashit Jani', NULL, NULL, 2360, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Creative director (Male)',
      'service_name', 'Hair Cut With Creative director (Male)',
      'gst_percentage', 18,
      'subtotal', 2000,
      'tax', 360,
      'discount', 500
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Ashit Jani', '2025-04-09 00:00:00+00', 2360, NULL, 20,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Ashit Jani', NULL, NULL, 590, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 500,
      'category', 'HAIR - Beard Trim',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Clean Shaving',
      'service_name', 'Clean Shaving',
      'gst_percentage', 18,
      'subtotal', 500,
      'tax', 90,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Ashit Jani', '2025-04-09 00:00:00+00', 590, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'chintan patel', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'chintan patel', '2025-04-09 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Maharshi Mahatma', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Maharshi Mahatma', '2025-04-09 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Shipra Dave', NULL, NULL, 826, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 700,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Wash & Blow Dry',
      'service_name', 'Wash & Blow Dry',
      'gst_percentage', 18,
      'subtotal', 700,
      'tax', 126,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Shipra Dave', '2025-04-09 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jigar Atmarambhai Gajjar', NULL, NULL, 2360, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Creative director (Male)',
      'service_name', 'Hair Cut With Creative director (Male)',
      'gst_percentage', 18,
      'subtotal', 2000,
      'tax', 360,
      'discount', 500
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jigar Atmarambhai Gajjar', '2025-04-09 00:00:00+00', 2360, NULL, 20,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);