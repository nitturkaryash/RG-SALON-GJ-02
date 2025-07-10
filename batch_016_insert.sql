INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Akhand Desai', '2025-04-29 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Akhand Desai', '2025-04-29 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 1770, 'sale',
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
  'Arpan sampang Rai', 'Akhand Desai', '2025-04-29 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 1770, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1500,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Head Massage With Oil',
      'service_name', 'Head Massage With Oil',
      'gst_percentage', 18,
      'subtotal', 1500,
      'tax', 270,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Akhand Desai', '2025-04-29 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'janvi Dave', NULL, NULL, 649, 'sale',
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
  'Ruba', 'janvi Dave', '2025-04-29 00:00:00+00', 649, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'janvi Dave', NULL, NULL, 767, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 650,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Back Wash Protien Treatment',
      'service_name', 'Back Wash Protien Treatment',
      'gst_percentage', 18,
      'subtotal', 650,
      'tax', 117,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'janvi Dave', '2025-04-29 00:00:00+00', 767, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'janvi Dave', NULL, NULL, 118, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 100,
      'category', 'Skin - Threading',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Eyebrow',
      'service_name', 'Eyebrow',
      'gst_percentage', 18,
      'subtotal', 100,
      'tax', 18,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'janvi Dave', '2025-04-29 00:00:00+00', 118, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Priyanka Italiya', NULL, NULL, 1770, 'sale',
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
  'Arpan sampang Rai', 'Priyanka Italiya', '2025-04-29 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Neha Shabu', NULL, NULL, 1770, 'sale',
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
  'Toshi Jamir', 'Neha Shabu', '2025-04-29 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Anushka Bakshani', NULL, NULL, 1770, 'sale',
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
  'Toshi Jamir', 'Anushka Bakshani', '2025-04-29 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Zemy sojitra', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Zemy sojitra', '2025-04-30 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Amit Agarwal', NULL, NULL, 472, 'sale',
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
  'Mehul Kinariwala', 'Amit Agarwal', '2025-04-30 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Amit Agarwal', NULL, NULL, 590, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 500,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Male Wash And Stylling',
      'service_name', 'Male Wash And Stylling',
      'gst_percentage', 18,
      'subtotal', 500,
      'tax', 90,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Amit Agarwal', '2025-04-30 00:00:00+00', 590, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Mishal Bhakta', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Mishal Bhakta', '2025-04-30 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kajal', NULL, NULL, 3068, 'sale',
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
      'subtotal', 2600,
      'tax', 468,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Kajal', '2025-04-30 00:00:00+00', 3068, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kajal', NULL, NULL, 1180, 'sale',
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
  'Mehul Kinariwala', 'Kajal', '2025-04-30 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Ritesh Sharma', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Ritesh Sharma', '2025-04-30 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Nishant pitaliya', NULL, NULL, 472, 'sale',
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
  'Mehul Kinariwala', 'Nishant pitaliya', '2025-04-30 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Nishant pitaliya', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Nishant pitaliya', '2025-04-30 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Abdul Hasan', NULL, NULL, 295, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 250,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Male Wash And Stylling',
      'service_name', 'Male Wash And Stylling',
      'gst_percentage', 18,
      'subtotal', 250,
      'tax', 45,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Abdul Hasan', '2025-04-30 00:00:00+00', 295, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Samveg Shah', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Samveg Shah', '2025-04-30 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Samveg Shah', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'Samveg Shah', '2025-04-30 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 1888, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1600,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 40,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 1600,
      'tax', 288,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-30 00:00:00+00', 1888, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 590, 'sale',
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
  'Vandan Gohil', 'Jaya patel', '2025-04-30 00:00:00+00', 590, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 1770, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1500,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Head Massage With Oil',
      'service_name', 'Head Massage With Oil',
      'gst_percentage', 18,
      'subtotal', 1500,
      'tax', 270,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Jaya patel', '2025-04-30 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 2454.4, 'sale',
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
      'subtotal', 2080,
      'tax', 374.4,
      'discount', 520
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-30 00:00:00+00', 2454.4, NULL, 20,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 885, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1500,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Curls',
      'service_name', 'Curls',
      'gst_percentage', 18,
      'subtotal', 750,
      'tax', 135,
      'discount', 750
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-30 00:00:00+00', 885, NULL, 50,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jay Dangar', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Jay Dangar', '2025-04-30 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jay Dangar', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Jay Dangar', '2025-04-30 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Mittal Kathrotiwala', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Mittal Kathrotiwala', '2025-04-30 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kaazvin Variava', NULL, NULL, 826, 'sale',
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
  'Shanti Thapa', 'Kaazvin Variava', '2025-04-30 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kaazvin Variava', NULL, NULL, 2124, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1800,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 45,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 1800,
      'tax', 324,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Kaazvin Variava', '2025-04-30 00:00:00+00', 2124, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Vivek Patel', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'Vivek Patel', '2025-04-30 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Monty Dhankecha', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Monty Dhankecha', '2025-04-30 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Monty Dhankecha', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Monty Dhankecha', '2025-04-30 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 2596, 'sale',
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
  'Rupesh Mahale', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 2596, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 767, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 650,
      'category', 'SKIN - Waxing',
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
  'Jenet', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 767, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 767, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 650,
      'category', 'Skin - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Half Leg Wax',
      'service_name', 'Half Leg Wax',
      'gst_percentage', 18,
      'subtotal', 650,
      'tax', 117,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 767, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 236, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 200,
      'category', 'Skin - Threading',
      'hsn_code', '33059090',
      'quantity', 2,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Eyebrow',
      'service_name', 'Eyebrow',
      'gst_percentage', 18,
      'subtotal', 200,
      'tax', 36,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 236, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), 'null', '-', NULL, NULL, 1329136.06, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 5063038110,
      'category', '-',
      'hsn_code', '33059090',
      'quantity', 5130,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', '-',
      'service_name', '-',
      'gst_percentage', 18,
      'subtotal', 1126417,
      'tax', 202719.06,
      'discount', 28120
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  '-', '-', 'null', 1329136.06, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);