INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES 
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Himanshi', NULL, NULL, 2596, 'sale',
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
  'Juni', 'Himanshi', '2025-04-24 00:00:00+00', 2596, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 1652, 'sale',
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
  'Jenet', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 1652, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 2360, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 2000,
      'category', 'Hair - Hair Color',
      'hsn_code', '33059090',
      'quantity', 50,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Global Color',
      'service_name', 'Global Color',
      'gst_percentage', 18,
      'subtotal', 2000,
      'tax', 360,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 2360, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 826, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 700,
      'category', 'Nails - Manicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Express Manicure(female)',
      'service_name', 'Express Manicure(female)',
      'gst_percentage', 18,
      'subtotal', 700,
      'tax', 126,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 472, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 400,
      'category', 'Skin - Threading',
      'hsn_code', '33059090',
      'quantity', 4,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Eyebrow',
      'service_name', 'Eyebrow',
      'gst_percentage', 18,
      'subtotal', 400,
      'tax', 72,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 1180, 'sale',
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
  'Admin', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 1652, 'sale',
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
  'Anu Khaling Rai', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 1652, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Roma', NULL, NULL, 649, 'sale',
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
  'Shanti Thapa', 'Roma', '2025-04-24 00:00:00+00', 649, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Jaya patel', NULL, NULL, 1770, 'sale',
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
      'subtotal', 1500,
      'tax', 270,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-24 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Anushri', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Anushri', '2025-04-24 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Anushri', NULL, NULL, 236, 'sale',
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
  'Anu Khaling Rai', 'Anushri', '2025-04-24 00:00:00+00', 236, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Arpit Narola', NULL, NULL, 2950, 'sale',
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
  'Rohan Patel', 'Arpit Narola', '2025-04-24 00:00:00+00', 2950, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Kavita Mittal', NULL, NULL, 2124, 'sale',
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
  'Wailed', 'Kavita Mittal', '2025-04-24 00:00:00+00', 2124, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Kavita Mittal', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Kavita Mittal', '2025-04-24 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Santam Agarwal', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'Santam Agarwal', '2025-04-24 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Mansi Agrawal', NULL, NULL, 1003, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 850,
      'category', 'Nails - Nail Paint',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hand Gel Paint',
      'service_name', 'Hand Gel Paint',
      'gst_percentage', 18,
      'subtotal', 850,
      'tax', 153,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Mansi Agrawal', '2025-04-24 00:00:00+00', 1003, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'pritam agarwal', NULL, NULL, 1180, 'sale',
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
  'Vandan Gohil', 'pritam agarwal', '2025-04-25 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'pritam agarwal', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'pritam agarwal', '2025-04-25 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Sugam Rungta', NULL, NULL, 826, 'sale',
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
  'Ajay Shirsath', 'Sugam Rungta', '2025-04-25 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Gargi 98', NULL, NULL, 826, 'sale',
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
  'Rupesh Mahale', 'Gargi 98', '2025-04-25 00:00:00+00', 826, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rutvik 88', NULL, NULL, 472, 'sale',
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
  'Mehul Kinariwala', 'Rutvik 88', '2025-04-25 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ayush', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Ayush', '2025-04-25 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ayush', NULL, NULL, 118, 'sale',
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
  'Anu Khaling Rai', 'Ayush', '2025-04-25 00:00:00+00', 118, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prachi', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Prachi', '2025-04-25 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prince Rathi', NULL, NULL, 472, 'sale',
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
  'Rupesh Mahale', 'Prince Rathi', '2025-04-25 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prince Rathi', NULL, NULL, 1180, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1000,
      'category', 'SKIN - De Tan',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Face De Tan',
      'service_name', 'Face De Tan',
      'gst_percentage', 18,
      'subtotal', 1000,
      'tax', 180,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Prince Rathi', '2025-04-25 00:00:00+00', 1180, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aman Agarwal 99', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'Aman Agarwal 99', '2025-04-25 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aman Agarwal 99', NULL, NULL, 472, 'sale',
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
  'Vandan Gohil', 'Aman Agarwal 99', '2025-04-25 00:00:00+00', 472, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rohan Gupta', NULL, NULL, 590, 'sale',
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
  'Mehul Kinariwala', 'Rohan Gupta', '2025-04-25 00:00:00+00', 590, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rohan Gupta', NULL, NULL, 590, 'sale',
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
  'Mehul Kinariwala', 'Rohan Gupta', '2025-04-25 00:00:00+00', 590, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aarti mundra', NULL, NULL, 0, 'sale',
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
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Aarti mundra', '2025-04-25 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aarti mundra', NULL, NULL, 0, 'sale',
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
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Aarti mundra', '2025-04-25 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aarti mundra', NULL, NULL, 0, 'sale',
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
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'Aarti mundra', '2025-04-25 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ruchi Patel', NULL, NULL, 1770, 'sale',
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
  'Nikhil Pujari', 'Ruchi Patel', '2025-04-25 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Seema Sims', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Seema Sims', '2025-04-25 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Seema Sims', NULL, NULL, 5900, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 5000,
      'category', 'Hair - Hair Treatment',
      'hsn_code', '33059090',
      'quantity', 2,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Strengthning',
      'service_name', 'Hair Strengthning',
      'gst_percentage', 18,
      'subtotal', 5000,
      'tax', 900,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Seema Sims', '2025-04-25 00:00:00+00', 5900, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rujal Patel', NULL, NULL, 2360, 'sale',
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
  'Tenzy Pradhan', 'Rujal Patel', '2025-04-25 00:00:00+00', 2360, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rujal Patel', NULL, NULL, 3540, 'sale',
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
  'Rohan Patel', 'Rujal Patel', '2025-04-25 00:00:00+00', 3540, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rujal Patel', NULL, NULL, 1486.8, 'sale',
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
  'Kinal Solanki', 'Rujal Patel', '2025-04-25 00:00:00+00', 1486.8, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 1770, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1500,
      'category', 'HAIR - Hair Cut',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Hair Cut With Senior Hairdresser (Male)',
      'service_name', 'Hair Cut With Senior Hairdresser (Male)',
      'gst_percentage', 18,
      'subtotal', 1500,
      'tax', 270,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Rajvi Shah', '2025-04-25 00:00:00+00', 1770, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 236, 'sale',
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
  'Anu Khaling Rai', 'Rajvi Shah', '2025-04-25 00:00:00+00', 236, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 767, 'sale',
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
  'Anu Khaling Rai', 'Rajvi Shah', '2025-04-25 00:00:00+00', 767, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 1121, 'sale',
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
  'Ruba', 'Rajvi Shah', '2025-04-25 00:00:00+00', 1121, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 1805.4, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 1700,
      'category', 'Nails - Pedicure',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Spa Pedicure',
      'service_name', 'Spa Pedicure',
      'gst_percentage', 18,
      'subtotal', 1530,
      'tax', 275.4,
      'discount', 170
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Rajvi Shah', '2025-04-25 00:00:00+00', 1805.4, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 3186, 'sale',
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
  'Ruba', 'Rajvi Shah', '2025-04-25 00:00:00+00', 3186, NULL, 10,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
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
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Ajita Italiya', '2025-04-25 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
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
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Ajita Italiya', '2025-04-25 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', NULL, '', jsonb_build_array(
    jsonb_build_object(
      'type', 'service',
      'price', 700,
      'category', 'Hair - Hair Styling',
      'hsn_code', '33059090',
      'quantity', 1,
      'product_id', uuid_generate_v4(),
      'service_id', uuid_generate_v4(),
      'product_name', 'Curls',
      'service_name', 'Curls',
      'gst_percentage', 0,
      'subtotal', 0,
      'tax', 0,
      'discount', 0
    )
  ), true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Ajita Italiya', '2025-04-25 00:00:00+00', 0, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
),
(
  uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 118, 'sale',
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
  'Shanti Thapa', 'Ruchika Chaudhary', '2025-04-25 00:00:00+00', 118, NULL, 0,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);