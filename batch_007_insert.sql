INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Saniraj Chaubey', NULL, NULL, 1770, 'sale',
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
  'Juni', 'Saniraj Chaubey', '2025-04-12 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Dhruv Jain', '2025-04-12 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Dhruv Jain', '2025-04-12 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 2360, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2000,
      'category', 'Skin - De Tan',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Clean Up',
      'service_name', 'Clean Up',
      'gst_percentage', 18,
      'subtotal', 2000,
      'tax', 360,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 2360, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 590, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Skin - De Tan',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Face De Tan',
      'service_name', 'Face De Tan',
      'gst_percentage', 18,
      'subtotal', 500,
      'tax', 90,
      'discount', 500
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 590, NULL, 50,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 118, 'sale',
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
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 118, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 236, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 200,
      'category', 'SKIN - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Ear wax',
      'service_name', 'Ear wax',
      'gst_percentage', 18,
      'subtotal', 200,
      'tax', 36,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 236, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Shital Sharda', NULL, NULL, 1770, 'sale',
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
  'Juni', 'Shital Sharda', '2025-04-12 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Shital Sharda', NULL, NULL, 1770, 'sale',
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
  'Jenet', 'Shital Sharda', '2025-04-12 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Jamshid Bhatheba', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Jamshid Bhatheba', '2025-04-12 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Mansi Agrawal', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Mansi Agrawal', '2025-04-12 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Mansi Agrawal', NULL, NULL, 2761.2, 'sale',
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
  'Kinal Solanki', 'Mansi Agrawal', '2025-04-12 00:00:00+00', 2761.2, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Saloni Shrivastav', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Saloni Shrivastav', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'rajni', NULL, NULL, 2360, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2000,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 50,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 2000,
      'tax', 360,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'rajni', '2025-04-13 00:00:00+00', 2360, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'rajni', NULL, NULL, 1416, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1200,
      'category', 'Nails - Manicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Classic Manicure',
      'service_name', 'Classic Manicure',
      'gst_percentage', 18,
      'subtotal', 1200,
      'tax', 216,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'rajni', '2025-04-13 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Yash', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 2761.2, 'sale',
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
  'Juni', 'Yash', '2025-04-13 00:00:00+00', 2761.2, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'Yash', '2025-04-13 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 3186, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 3000,
      'category', 'Skin - Bleach',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Facial',
      'service_name', 'Facial',
      'gst_percentage', 18,
      'subtotal', 2700,
      'tax', 486,
      'discount', 300
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Yash', '2025-04-13 00:00:00+00', 3186, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 590, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Skin - De Tan',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Face De Tan',
      'service_name', 'Face De Tan',
      'gst_percentage', 18,
      'subtotal', 500,
      'tax', 90,
      'discount', 500
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Yash', '2025-04-13 00:00:00+00', 590, NULL, 50,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1416, 'sale',
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
  'Vandan Gohil', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 295, 'sale',
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
  'Kinal Solanki', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 295, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 295, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 250,
      'category', 'Nails - nail cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Feets Nail Cut And File',
      'service_name', 'Feets Nail Cut And File',
      'gst_percentage', 18,
      'subtotal', 250,
      'tax', 45,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 295, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1416, 'sale',
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
  'Shanti Thapa', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Surbhi Rathi', NULL, NULL, 3068, 'sale',
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
      'subtotal', 2600,
      'tax', 468,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Surbhi Rathi', '2025-04-13 00:00:00+00', 3068, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Ishan Singh', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Ishan Singh', '2025-04-13 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Vansh kegriwal', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Vansh kegriwal', '2025-04-13 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Kinjal Hirpara', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Kinjal Hirpara', '2025-04-13 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Dr Manoj Satyawani', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Dr Manoj Satyawani', '2025-04-13 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Dr Manoj Satyawani', NULL, NULL, 1416, 'sale',
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
  'Rupesh Mahale', 'Dr Manoj Satyawani', '2025-04-13 00:00:00+00', 1416, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Nandini Dalal', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Nandini Dalal', '2025-04-13 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Nandini Dalal', NULL, NULL, 2950, 'sale',
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
  'Admin', 'Nandini Dalal', '2025-04-13 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Lisa Patel', NULL, NULL, 826, 'sale',
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
  'Tenzy Pradhan', 'Lisa Patel', '2025-04-13 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 0, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 40,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Krina Shah', '2025-04-13 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'Skin - Massage',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Foot Massage',
      'service_name', 'Foot Massage',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Krina Shah', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 118, 'sale',
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
  'Anu Khaling Rai', 'Krina Shah', '2025-04-13 00:00:00+00', 118, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 177, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 150,
      'category', 'Skin - Threading',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Upper Lips',
      'service_name', 'Upper Lips',
      'gst_percentage', 18,
      'subtotal', 150,
      'tax', 27,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Krina Shah', '2025-04-13 00:00:00+00', 177, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'jash sheth', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'jash sheth', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Harsh Dipak Shah', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Harsh Dipak Shah', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Karan Aneja', NULL, NULL, 1180, 'sale',
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
  'Rupesh Mahale', 'Karan Aneja', '2025-04-13 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Shefali Shah', NULL, NULL, 2832, 'sale',
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
  'Elgita', 'Shefali Shah', '2025-04-13 00:00:00+00', 2832, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Shefali Shah', NULL, NULL, 236, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 200,
      'category', 'SKIN - Waxing',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Nose Wax',
      'service_name', 'Nose Wax',
      'gst_percentage', 18,
      'subtotal', 200,
      'tax', 36,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Shefali Shah', '2025-04-13 00:00:00+00', 236, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Leena Kayath', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Leena Kayath', '2025-04-13 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Bunty Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Haircut With Senior Hairdresser(Female)',
      'service_name', 'Haircut With Senior Hairdresser(Female)',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Bunty Patel', '2025-04-14 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Aditi Rayka', NULL, NULL, 3068, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2600,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 65,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Root Touch Up',
      'service_name', 'Root Touch Up',
      'gst_percentage', 18,
      'subtotal', 2600,
      'tax', 468,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Aditi Rayka', '2025-04-14 00:00:00+00', 3068, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Aditi Rayka', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Aditi Rayka', '2025-04-14 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Jaya kijriwal', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Jaya kijriwal', '2025-04-14 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Divya jain', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Divya jain', '2025-04-14 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Mehul Chanchpara', NULL, NULL, 1180, 'sale',
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
  'Mehul Kinariwala', 'Mehul Chanchpara', '2025-04-14 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);