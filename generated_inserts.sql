
INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Zarna Javeri', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Zarna Javeri', '2025-04-01 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Tarun Vatiani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Tarun Vatiani', '2025-04-01 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Tarun Vatiani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Tarun Vatiani', '2025-04-01 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Neharika Malhotra', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Neharika Malhotra', '2025-04-01 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Kira', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":2400,"tax":432,"discount":600}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Kira', '2025-04-01 00:00:00+00', 2832, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Rahul Kedia', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rahul Kedia', '2025-04-01 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Aashi', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Aashi', '2025-04-01 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Aashi', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Aashi', '2025-04-01 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Jigyasha Narang', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jigyasha Narang', '2025-04-01 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Jigyasha Narang', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jigyasha Narang', '2025-04-01 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Gauri Savaliya', NULL, NULL, 18290, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":15500,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Creative Color","service_name":"Creative Color","gst_percentage":18,"subtotal":15500,"tax":2790,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Gauri Savaliya', '2025-04-01 00:00:00+00', 18290, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Muskan Nandwani', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Muskan Nandwani', '2025-04-01 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Nikita Shah', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Nikita Shah', '2025-04-01 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Prachi patel', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Prachi patel', '2025-04-01 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Dimple Sharma', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - FACE","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"FACE PACK","service_name":"FACE PACK","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Dimple Sharma', '2025-04-01 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Yashvi Doshi', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Yashvi Doshi', '2025-04-01 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Yashvi Doshi', NULL, NULL, 1274.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1080,"tax":194.4,"discount":120}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Yashvi Doshi', '2025-04-01 00:00:00+00', 1274.4, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-01 00:00:00+00', 'Yashvi Doshi', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Yashvi Doshi', '2025-04-01 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Seep Mahajan', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'Seep Mahajan', '2025-04-02 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Pooja Goyal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Pooja Goyal', '2025-04-02 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'deepak bulchandi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'deepak bulchandi', '2025-04-02 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Sashwot', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Sashwot', '2025-04-02 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Dhawal Doshi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Dhawal Doshi', '2025-04-02 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Dhawal Doshi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Dhawal Doshi', '2025-04-02 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Veena Kodwani Dawer', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Veena Kodwani Dawer', '2025-04-02 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'ashha jain', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'ashha jain', '2025-04-02 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Richa Dhingra', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Richa Dhingra', '2025-04-02 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Richa Dhingra', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Richa Dhingra', '2025-04-02 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Niddhi Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Niddhi Patel', '2025-04-02 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Niddhi Patel', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Niddhi Patel', '2025-04-02 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Niddhi Patel', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Rituals Express Hair Spa","service_name":"Rituals Express Hair Spa","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Niddhi Patel', '2025-04-02 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Niddhi Patel', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Rituals Express Hair Spa","service_name":"Rituals Express Hair Spa","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Niddhi Patel', '2025-04-02 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Harsh Seth', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Harsh Seth', '2025-04-02 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Harsh Seth', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Harsh Seth', '2025-04-02 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Kavita Mittal', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Kavita Mittal', '2025-04-02 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Gaurav', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Gaurav', '2025-04-02 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-02 00:00:00+00', 'Chintan jariwala', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Chintan jariwala', '2025-04-02 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Preeti', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Preeti', '2025-04-03 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Preeti', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Preeti', '2025-04-03 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Rusali Valani', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rusali Valani', '2025-04-03 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Shreya Jaju', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Shreya Jaju', '2025-04-03 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'sanjay virani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'sanjay virani', '2025-04-03 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Pankaj Dhingra', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Pankaj Dhingra', '2025-04-03 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Lakshmi Baid', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Normal Wash","service_name":"Normal Wash","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Lakshmi Baid', '2025-04-03 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Viraj Khandwala', NULL, NULL, 4720, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":4000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":100,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":4000,"tax":720,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Viraj Khandwala', '2025-04-03 00:00:00+00', 4720, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Viraj Khandwala', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Viraj Khandwala', '2025-04-03 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Vincy Parekh', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Vincy Parekh', '2025-04-03 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Vincy Parekh', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Vincy Parekh', '2025-04-03 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Shyam', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Shyam', '2025-04-03 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Shipra Dave', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Shipra Dave', '2025-04-03 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Harshita Agarwal', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'Harshita Agarwal', '2025-04-03 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'anjali Sharma', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'anjali Sharma', '2025-04-03 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'anjali Sharma', NULL, NULL, 1888, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Color Toner","service_name":"Color Toner","gst_percentage":18,"subtotal":1600,"tax":288,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'anjali Sharma', '2025-04-03 00:00:00+00', 1888, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Minu Nandwani', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Minu Nandwani', '2025-04-03 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Krunal Mahatma', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Krunal Mahatma', '2025-04-03 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Krunal Mahatma', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Krunal Mahatma', '2025-04-03 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-03 00:00:00+00', 'Krunal Mahatma', NULL, NULL, 531, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":450,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":18,"subtotal":450,"tax":81,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Krunal Mahatma', '2025-04-03 00:00:00+00', 531, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Toral Koshiya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Toral Koshiya', '2025-04-04 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Toral Koshiya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Toral Koshiya', '2025-04-04 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Maina Simediya', NULL, NULL, 1888, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1600,"tax":288,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Maina Simediya', '2025-04-04 00:00:00+00', 1888, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Jay Dangar', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jay Dangar', '2025-04-04 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Mannat Suknani', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mannat Suknani', '2025-04-04 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Rinkesh', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rinkesh', '2025-04-04 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Nikita Rawal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Nikita Rawal', '2025-04-04 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Hardik Gambhir', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Hardik Gambhir', '2025-04-04 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Hardik Gambhir', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Hardik Gambhir', '2025-04-04 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Rupali Shah', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Rupali Shah', '2025-04-04 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Chirag Vekariya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Chirag Vekariya', '2025-04-04 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Chirag Vekariya', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Chirag Vekariya', '2025-04-04 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'vikash dang', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":0,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'vikash dang', '2025-04-04 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Jagruti Kabutarwala', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Jagruti Kabutarwala', '2025-04-04 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-04 00:00:00+00', 'Sukanya 98', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Sukanya 98', '2025-04-04 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Yazad Bhesania', NULL, NULL, 377.6, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":320,"tax":57.6,"discount":80}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yazad Bhesania', '2025-04-05 00:00:00+00', 377.6, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Yazad Bhesania', NULL, NULL, 519.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":18,"subtotal":440,"tax":79.2,"discount":110}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yazad Bhesania', '2025-04-05 00:00:00+00', 519.2, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Neha Vepari', NULL, NULL, 4720, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":4000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":100,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":4000,"tax":720,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Neha Vepari', '2025-04-05 00:00:00+00', 4720, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Tarun', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Tarun', '2025-04-05 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Tarun', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Tarun', '2025-04-05 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Ruchika Savaliya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Ruchika Savaliya', '2025-04-05 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Dhiral Daruwala', NULL, NULL, 377.6, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":320,"tax":57.6,"discount":80}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Dhiral Daruwala', '2025-04-05 00:00:00+00', 377.6, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Yash', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yash', '2025-04-05 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Yash', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Yash', '2025-04-05 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Nancy Gangwani', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Nancy Gangwani', '2025-04-05 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Nancy Gangwani', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash And Twist","service_name":"Wash And Twist","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Nancy Gangwani', '2025-04-05 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Lisa Patel', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'Lisa Patel', '2025-04-05 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Dhaval Mahatma', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Dhaval Mahatma', '2025-04-05 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Dhaval Mahatma', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Dhaval Mahatma', '2025-04-05 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Dhaval Mahatma', NULL, NULL, 944, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":800,"category":"Body Hair Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Chest Hair Trim","service_name":"Chest Hair Trim","gst_percentage":18,"subtotal":800,"tax":144,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'Dhaval Mahatma', '2025-04-05 00:00:00+00', 944, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Dr Ruta', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Dr Ruta', '2025-04-05 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'rashika', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'rashika', '2025-04-05 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'rashika', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'rashika', '2025-04-05 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Payal Bhattar', NULL, NULL, 11505, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":9750,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":65,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Keratin Treatment","service_name":"Keratin Treatment","gst_percentage":18,"subtotal":9750,"tax":1755,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Payal Bhattar', '2025-04-05 00:00:00+00', 11505, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Payal Bhattar', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Payal Bhattar', '2025-04-05 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Payal Bhattar', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Payal Bhattar', '2025-04-05 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Payal Bhattar', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Payal Bhattar', '2025-04-05 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Abhilasha Agarwal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Epres treatment","service_name":"Epres treatment","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Pawan Pradhan', 'Abhilasha Agarwal', '2025-04-05 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-05 00:00:00+00', 'Abhilasha Agarwal', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Abhilasha Agarwal', '2025-04-05 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Savi 958', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Rituals Express Hair Spa","service_name":"Rituals Express Hair Spa","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Savi 958', '2025-04-06 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Pari Gajera', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Pari Gajera', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Pari Gajera', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Pari Gajera', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Sunil Juneja', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sunil Juneja', '2025-04-06 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Sunil Juneja', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Sunil Juneja', '2025-04-06 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Sunil Juneja', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Sunil Juneja', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Sunil Juneja', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sunil Juneja', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Tipu', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Tipu', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Tipu', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Tipu', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Jenish Champaniria', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jenish Champaniria', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Jenish Champaniria', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jenish Champaniria', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Jenish Champaniria', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face De Tan","service_name":"Face De Tan","gst_percentage":18,"subtotal":500,"tax":90,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jenish Champaniria', '2025-04-06 00:00:00+00', 590, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Jenish Champaniria', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jenish Champaniria', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Niddhi Kejriwal', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Niddhi Kejriwal', '2025-04-06 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Niddhi Kejriwal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Niddhi Kejriwal', '2025-04-06 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'zubin joshina', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'zubin joshina', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Niraj Joshi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Niraj Joshi', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Rajni', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Rajni', '2025-04-06 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Zanab Alika', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Zanab Alika', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'TANVI NILESH SUKHARAMWALA', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'TANVI NILESH SUKHARAMWALA', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'TANVI NILESH SUKHARAMWALA', '2025-04-06 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ayush', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Ayush', '2025-04-06 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ayush', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Ayush', '2025-04-06 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ayush', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Ayush', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Prince Rathi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Prince Rathi', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-06T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Ajita Italiya', '2025-04-06 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":400,"payment_date":"2025-04-06T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Ajita Italiya', '2025-04-06 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1600,"payment_date":"2025-04-06T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Rupesh Mahale', 'Ajita Italiya', '2025-04-06 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":400,"payment_date":"2025-04-06T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Rupesh Mahale', 'Ajita Italiya', '2025-04-06 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":550,"payment_date":"2025-04-06T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Rupesh Mahale', 'Ajita Italiya', '2025-04-06 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":2600,"payment_date":"2025-04-06T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Toshi Jamir', 'Ajita Italiya', '2025-04-06 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Amit Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Amit Agarwal', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Amit Agarwal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Amit Agarwal', '2025-04-06 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Sanjay Kankariya', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Sanjay Kankariya', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Sanjay Kankariya', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Up","service_name":"Clean Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Sanjay Kankariya', '2025-04-06 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Kinnari Usa', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Kinnari Usa', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Kinnari Usa', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Kinnari Usa', '2025-04-06 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Kinnari Usa', NULL, NULL, 10620, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":9000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Creative Color","service_name":"Creative Color","gst_percentage":18,"subtotal":9000,"tax":1620,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Kinnari Usa', '2025-04-06 00:00:00+00', 10620, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Kinnari Usa', NULL, NULL, 7670, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":6500,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Color Toner","service_name":"Color Toner","gst_percentage":18,"subtotal":6500,"tax":1170,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Kinnari Usa', '2025-04-06 00:00:00+00', 7670, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Kinnari Usa', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Kinnari Usa', '2025-04-06 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Priyanka Vihang Solanki', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Priyanka Vihang Solanki', '2025-04-06 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Bhaumik Gandhi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bhaumik Gandhi', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Bhaumik Gandhi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bhaumik Gandhi', '2025-04-06 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-06 00:00:00+00', 'Bhaumik Gandhi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Bhaumik Gandhi', '2025-04-06 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Kavita', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Kavita', '2025-04-07 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Neha Bhatia', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Neha Bhatia', '2025-04-07 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Neha Bhatia', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Neha Bhatia', '2025-04-07 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Neha Bhatia', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Neha Bhatia', '2025-04-07 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Neha Bhatia', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Upper Lips","service_name":"Upper Lips","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Neha Bhatia', '2025-04-07 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Neha Bhatia', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Forehead","service_name":"Forehead","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Neha Bhatia', '2025-04-07 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Rekha', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Rekha', '2025-04-07 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Rekha', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Color Toner","service_name":"Color Toner","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Rekha', '2025-04-07 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Rekha', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Rekha', '2025-04-07 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-07 00:00:00+00', 'Rekha', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Rekha', '2025-04-07 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Parth Simediya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Parth Simediya', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Dimple Reshamwala', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Pawan Pradhan', 'Dimple Reshamwala', '2025-04-08 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Dimple Reshamwala', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Dandruff Treatment","service_name":"Dandruff Treatment","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dimple Reshamwala', '2025-04-08 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Rohan Mehta', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rohan Mehta', '2025-04-08 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manisha Shah', NULL, NULL, 2454.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2080,"tax":374.4,"discount":520}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Manisha Shah', '2025-04-08 00:00:00+00', 2454.4, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Urjaa Patel', '2025-04-08 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 944, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":800,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Front Wax","service_name":"Front Wax","gst_percentage":18,"subtotal":800,"tax":144,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 944, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Bikini Wax","service_name":"Bikini Wax","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Back Wax","service_name":"Back Wax","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 708, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":600,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hip Wax","service_name":"Hip Wax","gst_percentage":18,"subtotal":600,"tax":108,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 708, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 3186, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - FACE","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"FACIAL","service_name":"FACIAL","gst_percentage":18,"subtotal":2700,"tax":486,"discount":300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 3186, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Urjaa Patel', '2025-04-08 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Urjaa Patel', '2025-04-08 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Urjaa Patel', '2025-04-08 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Urjaa Patel', '2025-04-08 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 295, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":250,"category":"Nails - nail cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hands Nail Cut And File","service_name":"Hands Nail Cut And File","gst_percentage":18,"subtotal":250,"tax":45,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Urjaa Patel', '2025-04-08 00:00:00+00', 295, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Urjaa Patel', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Urjaa Patel', '2025-04-08 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Rushabh K', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Rushabh K', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Jinesh Jain', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jinesh Jain', '2025-04-08 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Nidhi jain', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":25,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Nidhi jain', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manoj Shah', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Manoj Shah', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manoj Shah', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Manoj Shah', '2025-04-08 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Manoj Shah', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Manoj Shah', '2025-04-08 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Purvi Asodariya', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Purvi Asodariya', '2025-04-08 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Soniya Jain', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Soniya Jain', '2025-04-08 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Parth K', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Parth K', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Nancy Tated', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Nancy Tated', '2025-04-08 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Nancy Tated', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Nancy Tated', '2025-04-08 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Jigyasha Agarwal', NULL, NULL, 413, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":350,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Flicks or Bangs cut","service_name":"Flicks or Bangs cut","gst_percentage":18,"subtotal":350,"tax":63,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Jigyasha Agarwal', '2025-04-08 00:00:00+00', 413, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Bhumika Panjabi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bhumika Panjabi', '2025-04-08 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-08 00:00:00+00', 'Bhumika Panjabi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bhumika Panjabi', '2025-04-08 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Sakshi Tekriwal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Sakshi Tekriwal', '2025-04-09 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Hiren Chevli', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Hiren Chevli', '2025-04-09 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Hiren Chevli', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Hiren Chevli', '2025-04-09 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Hiren Chevli', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Hiren Chevli', '2025-04-09 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Anu Agarwal', NULL, NULL, 4720, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":4000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":100,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":4000,"tax":720,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Anu Agarwal', '2025-04-09 00:00:00+00', 4720, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Anu Agarwal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Anu Agarwal', '2025-04-09 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Anu Agarwal', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Anu Agarwal', '2025-04-09 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Yogita Baid', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Yogita Baid', '2025-04-09 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Sangeeta Agarwal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sangeeta Agarwal', '2025-04-09 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Ashit Jani', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2000,"tax":360,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Ashit Jani', '2025-04-09 00:00:00+00', 2360, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Ashit Jani', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Ashit Jani', '2025-04-09 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'chintan patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'chintan patel', '2025-04-09 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Maharshi Mahatma', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Maharshi Mahatma', '2025-04-09 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Shipra Dave', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Shipra Dave', '2025-04-09 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jigar Atmarambhai Gajjar', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2000,"tax":360,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jigar Atmarambhai Gajjar', '2025-04-09 00:00:00+00', 2360, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 3304, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3500,"category":"Skin - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Swedish Massage 60 Mins","service_name":"Swedish Massage 60 Mins","gst_percentage":18,"subtotal":2800,"tax":504,"discount":700}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Jaya patel', '2025-04-09 00:00:00+00', 3304, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-09 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-09 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jaya patel', '2025-04-09 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 944, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":800,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Front Wax","service_name":"Front Wax","gst_percentage":18,"subtotal":800,"tax":144,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-09 00:00:00+00', 944, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Back Wax","service_name":"Back Wax","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-09 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Bikini Wax","service_name":"Bikini Wax","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-09 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 2454.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2080,"tax":374.4,"discount":520}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Jaya patel', '2025-04-09 00:00:00+00', 2454.4, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-09 00:00:00+00', 'Jaya patel', NULL, NULL, 708, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":600,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hip Wax","service_name":"Hip Wax","gst_percentage":18,"subtotal":600,"tax":108,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-09 00:00:00+00', 708, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Dhwani Kheni(DJ)', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Dhwani Kheni(DJ)', '2025-04-10 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Krishna Vakariya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Krishna Vakariya', '2025-04-10 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Priyanshu Merchant', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Nails - nail cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hands Nail Cut And File","service_name":"Hands Nail Cut And File","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Priyanshu Merchant', '2025-04-10 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Priyanshu Merchant', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Priyanshu Merchant', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Priyanshu Merchant', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Nails - nail cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Feets Nail Cut And File","service_name":"Feets Nail Cut And File","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Priyanshu Merchant', '2025-04-10 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Rashi Kapadia', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Rashi Kapadia', '2025-04-10 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Rashi Kapadia', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Rashi Kapadia', '2025-04-10 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Pooja friend', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Pooja friend', '2025-04-10 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Netra Bhakta', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Netra Bhakta', '2025-04-10 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Netra Bhakta', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Normal Wash","service_name":"Normal Wash","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Netra Bhakta', '2025-04-10 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Tushar Agarwal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Tushar Agarwal', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Tushar Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Tushar Agarwal', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Manali sanghvi', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Manali sanghvi', '2025-04-10 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Manali sanghvi', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Manali sanghvi', '2025-04-10 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Mitul Savani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Mitul Savani', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Mitul Savani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Mitul Savani', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Rushab Shah', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Rushab Shah', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Raghav Agarwal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Raghav Agarwal', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Raghav Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Raghav Agarwal', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Raghav Agarwal', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Raghav Agarwal', '2025-04-10 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Mayur Raol', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Mayur Raol', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Poonam Kapoor', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Poonam Kapoor', '2025-04-10 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Poonam Kapoor', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Poonam Kapoor', '2025-04-10 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Richa Dhingra', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Richa Dhingra', '2025-04-10 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Chaitra Gangwani', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Chaitra Gangwani', '2025-04-10 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Chaitra Gangwani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Chaitra Gangwani', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Chaitra Gangwani', NULL, NULL, 200, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Consultation","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Tips","service_name":"Tips","gst_percentage":0,"subtotal":200,"tax":0,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Chaitra Gangwani', '2025-04-10 00:00:00+00', 200, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Vinita 98', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Vinita 98', '2025-04-10 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Vishwa jeet', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Vishwa jeet', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Vishwa jeet', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Vishwa jeet', '2025-04-10 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Siddharth c', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Siddharth c', '2025-04-10 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Siddharth c', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Siddharth c', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Krishnam Duggal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Krishnam Duggal', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Dilip Sanghvi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Dilip Sanghvi', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Dilip Sanghvi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Dilip Sanghvi', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sonee Motiwala', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Sonee Motiwala', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sonee Motiwala', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Sonee Motiwala', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sonee Motiwala', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Bikini Wax","service_name":"Bikini Wax","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Sonee Motiwala', '2025-04-10 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sonee Motiwala', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2000,"tax":360,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sonee Motiwala', '2025-04-10 00:00:00+00', 2360, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sonee Motiwala', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Sonee Motiwala', '2025-04-10 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sejal vyas', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Sejal vyas', '2025-04-10 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-10 00:00:00+00', 'Sejal vyas', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Sejal vyas', '2025-04-10 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Richa 972', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Curls","service_name":"Curls","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Richa 972', '2025-04-11 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Mittal Prajapati', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mittal Prajapati', '2025-04-11 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Rajni', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Rajni', '2025-04-11 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Radhika', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Radhika', '2025-04-11 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kush Jariwala', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Kush Jariwala', '2025-04-11 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kush Jariwala', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Kush Jariwala', '2025-04-11 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kush Jariwala', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Kush Jariwala', '2025-04-11 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Bharti Prajash Dumashiya', NULL, NULL, 1593, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1350,"tax":243,"discount":150}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Bharti Prajash Dumashiya', '2025-04-11 00:00:00+00', 1593, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Rachit Gadia', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Rachit Gadia', '2025-04-11 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kayanush Todiwala', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Kayanush Todiwala', '2025-04-11 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kayanush Todiwala', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Kayanush Todiwala', '2025-04-11 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kayanush Todiwala', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Kayanush Todiwala', '2025-04-11 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kayanush Todiwala', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Kayanush Todiwala', '2025-04-11 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Kayanush Todiwala', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Kayanush Todiwala', '2025-04-11 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'lata', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'lata', '2025-04-11 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Saurabh Gadia', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Saurabh Gadia', '2025-04-11 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Akshat Gambhir', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Akshat Gambhir', '2025-04-11 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Deepa Jani', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Deepa Jani', '2025-04-11 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Deepa Jani', NULL, NULL, 2454.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2080,"tax":374.4,"discount":520}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Deepa Jani', '2025-04-11 00:00:00+00', 2454.4, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Deepa Jani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand Normal Nail Paint","service_name":"Hand Normal Nail Paint","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Deepa Jani', '2025-04-11 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Khushboo Supariwala', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Khushboo Supariwala', '2025-04-11 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Rohan Panwala', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Rohan Panwala', '2025-04-11 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Rohan Panwala', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Rohan Panwala', '2025-04-11 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Ayushi Mashruwala', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Ayushi Mashruwala', '2025-04-11 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Ayushi Mashruwala', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Ayushi Mashruwala', '2025-04-11 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Aashi Junjunwala', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Aashi Junjunwala', '2025-04-11 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Aashi Junjunwala', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Aashi Junjunwala', '2025-04-11 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Shital Jalan', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Shital Jalan', '2025-04-11 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Minaxi khana', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Minaxi khana', '2025-04-11 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Nikita Shah', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Nikita Shah', '2025-04-11 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Nikita Shah', NULL, NULL, 3304, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3500,"category":"Skin - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Deep Tissue Massage 60 Mins","service_name":"Deep Tissue Massage 60 Mins","gst_percentage":18,"subtotal":2800,"tax":504,"discount":700}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Nikita Shah', '2025-04-11 00:00:00+00', 3304, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 1003, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":850,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand Gel Paint","service_name":"Hand Gel Paint","gst_percentage":18,"subtotal":850,"tax":153,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Ruchika Chaudhary', '2025-04-11 00:00:00+00', 1003, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Feet Normal Nail Paint","service_name":"Feet Normal Nail Paint","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Ruchika Chaudhary', '2025-04-11 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Ruchika Chaudhary', '2025-04-11 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-11 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 4720, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":4000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":100,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":4000,"tax":720,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Ruchika Chaudhary', '2025-04-11 00:00:00+00', 4720, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Bharat', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bharat', '2025-04-12 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'manisha', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'manisha', '2025-04-12 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Kachhadiya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Dhruv Kachhadiya', '2025-04-12 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Kachhadiya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Dhruv Kachhadiya', '2025-04-12 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Sanjay Gangwani', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sanjay Gangwani', '2025-04-12 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Sanjay Gangwani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Sanjay Gangwani', '2025-04-12 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Ronak Gupta', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Ronak Gupta', '2025-04-12 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Anuj Agarwal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Anuj Agarwal', '2025-04-12 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Anuj Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Anuj Agarwal', '2025-04-12 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Anuj Agarwal', NULL, NULL, 3186, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":2700,"tax":486,"discount":300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Anuj Agarwal', '2025-04-12 00:00:00+00', 3186, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Anuj Agarwal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Anuj Agarwal', '2025-04-12 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Shipra Dave', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Shipra Dave', '2025-04-12 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Niddhi Mankani', '2025-04-12 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Saniraj Chaubey', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Saniraj Chaubey', '2025-04-12 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Saniraj Chaubey', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Saniraj Chaubey', '2025-04-12 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Dhruv Jain', '2025-04-12 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Dhruv Jain', '2025-04-12 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Up","service_name":"Clean Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face De Tan","service_name":"Face De Tan","gst_percentage":18,"subtotal":500,"tax":90,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 590, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Dhruv Jain', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"SKIN - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Ear wax","service_name":"Ear wax","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dhruv Jain', '2025-04-12 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Shital Sharda', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Shital Sharda', '2025-04-12 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Shital Sharda', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Shital Sharda', '2025-04-12 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Jamshid Bhatheba', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Jamshid Bhatheba', '2025-04-12 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Mansi Agrawal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mansi Agrawal', '2025-04-12 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-12 00:00:00+00', 'Mansi Agrawal', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Mansi Agrawal', '2025-04-12 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Saloni Shrivastav', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Saloni Shrivastav', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'rajni', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'rajni', '2025-04-13 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'rajni', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'rajni', '2025-04-13 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yash', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Yash', '2025-04-13 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yash', '2025-04-13 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 3186, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":2700,"tax":486,"discount":300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Yash', '2025-04-13 00:00:00+00', 3186, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Yash', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face De Tan","service_name":"Face De Tan","gst_percentage":18,"subtotal":500,"tax":90,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Yash', '2025-04-13 00:00:00+00', 590, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 295, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":250,"category":"Nails - nail cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hands Nail Cut And File","service_name":"Hands Nail Cut And File","gst_percentage":18,"subtotal":250,"tax":45,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 295, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 295, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":250,"category":"Nails - nail cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Feets Nail Cut And File","service_name":"Feets Nail Cut And File","gst_percentage":18,"subtotal":250,"tax":45,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 295, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'TANVI NILESH SUKHARAMWALA', '2025-04-13 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Surbhi Rathi', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Surbhi Rathi', '2025-04-13 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Ishan Singh', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Ishan Singh', '2025-04-13 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Vansh kegriwal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Vansh kegriwal', '2025-04-13 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Kinjal Hirpara', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Kinjal Hirpara', '2025-04-13 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Dr Manoj Satyawani', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Dr Manoj Satyawani', '2025-04-13 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Dr Manoj Satyawani', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Dr Manoj Satyawani', '2025-04-13 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Nandini Dalal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Nandini Dalal', '2025-04-13 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Nandini Dalal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Nandini Dalal', '2025-04-13 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Lisa Patel', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Lisa Patel', '2025-04-13 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":0,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":0,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Krina Shah', '2025-04-13 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Foot Massage","service_name":"Foot Massage","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Krina Shah', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Krina Shah', '2025-04-13 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Krina Shah', NULL, NULL, 177, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":150,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Upper Lips","service_name":"Upper Lips","gst_percentage":18,"subtotal":150,"tax":27,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Krina Shah', '2025-04-13 00:00:00+00', 177, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'jash sheth', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'jash sheth', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Harsh Dipak Shah', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Harsh Dipak Shah', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Karan Aneja', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Karan Aneja', '2025-04-13 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Shefali Shah', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Elgita', 'Shefali Shah', '2025-04-13 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Shefali Shah', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"SKIN - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Nose Wax","service_name":"Nose Wax","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Shefali Shah', '2025-04-13 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-13 00:00:00+00', 'Leena Kayath', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Leena Kayath', '2025-04-13 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Bunty Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Bunty Patel', '2025-04-14 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Aditi Rayka', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":65,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Aditi Rayka', '2025-04-14 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Aditi Rayka', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Aditi Rayka', '2025-04-14 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Jaya kijriwal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Jaya kijriwal', '2025-04-14 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Divya jain', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Divya jain', '2025-04-14 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Mehul Chanchpara', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Mehul Chanchpara', '2025-04-14 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Mehul Chanchpara', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Mehul Chanchpara', '2025-04-14 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Mehul Chanchpara', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Mehul Chanchpara', '2025-04-14 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Roma', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Roma', '2025-04-14 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Sandip Patel', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'Sandip Patel', '2025-04-14 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-14 00:00:00+00', 'Sandip Patel', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anju Rumdali Rai', 'Sandip Patel', '2025-04-14 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Karan', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2000,"tax":360,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Karan', '2025-04-15 00:00:00+00', 2360, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Karan', NULL, NULL, 944, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":800,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":800,"tax":144,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Karan', '2025-04-15 00:00:00+00', 944, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Karan', NULL, NULL, 295, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":250,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Male Wash And Stylling","service_name":"Male Wash And Stylling","gst_percentage":18,"subtotal":250,"tax":45,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Karan', '2025-04-15 00:00:00+00', 295, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Khushboo Agarwal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Khushboo Agarwal', '2025-04-15 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Hemang patel', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Hemang patel', '2025-04-15 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'janvi Dave', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'janvi Dave', '2025-04-15 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'janvi Dave', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'janvi Dave', '2025-04-15 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'janvi Dave', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":35,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Color Toner","service_name":"Color Toner","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'janvi Dave', '2025-04-15 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'janvi Dave', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"Skin - Threading","hsn_code":"33059090","quantity":4,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'janvi Dave', '2025-04-15 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'janvi Dave', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'janvi Dave', '2025-04-15 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'janvi Dave', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'janvi Dave', '2025-04-15 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Shilpa Narang', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Shilpa Narang', '2025-04-15 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Anand Gulabani', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2000,"tax":360,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Anand Gulabani', '2025-04-15 00:00:00+00', 2360, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Anand Gulabani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Anand Gulabani', '2025-04-15 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Anand Gulabani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"SKIN - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Anand Gulabani', '2025-04-15 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Keyur Kheni', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Keyur Kheni', '2025-04-15 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Ashmi Chawla', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Ashmi Chawla', '2025-04-15 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Preksha Chawla', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Preksha Chawla', '2025-04-15 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Preksha Chawla', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Preksha Chawla', '2025-04-15 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Preksha Chawla', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Preksha Chawla', '2025-04-15 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Jay Shah', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jay Shah', '2025-04-15 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Jay Shah', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Jay Shah', '2025-04-15 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Jay Shah', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Jay Shah', '2025-04-15 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Jay Shah', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Jay Shah', '2025-04-15 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Sonal Khurana', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Sonal Khurana', '2025-04-15 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Sonal Khurana', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Sonal Khurana', '2025-04-15 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Bansi Meruliya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bansi Meruliya', '2025-04-15 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Bansi Meruliya', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bansi Meruliya', '2025-04-15 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Anupama Sultania', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Anupama Sultania', '2025-04-15 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Anupama Sultania', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Anupama Sultania', '2025-04-15 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Shipra Dave', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Shipra Dave', '2025-04-15 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Dhaval Mahatma', NULL, NULL, 1003, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":850,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":850,"tax":153,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Dhaval Mahatma', '2025-04-15 00:00:00+00', 1003, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Sanjay Jain', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Sanjay Jain', '2025-04-15 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Shreya Sharma', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Shreya Sharma', '2025-04-15 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-15 00:00:00+00', 'Shreya Sharma', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Shreya Sharma', '2025-04-15 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Prince Rathi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Prince Rathi', '2025-04-16 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Prince Rathi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Prince Rathi', '2025-04-16 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Bala Sonpal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Bala Sonpal', '2025-04-16 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Bala Sonpal', NULL, NULL, 1888, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1600,"tax":288,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Bala Sonpal', '2025-04-16 00:00:00+00', 1888, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sangita Tailam', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Sangita Tailam', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sangita Tailam', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Sangita Tailam', '2025-04-16 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sakshi', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Curls","service_name":"Curls","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Sakshi', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sakshi', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand Normal Nail Paint","service_name":"Hand Normal Nail Paint","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Sakshi', '2025-04-16 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sakshi', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Feet Normal Nail Paint","service_name":"Feet Normal Nail Paint","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Sakshi', '2025-04-16 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Abishek Jain', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Abishek Jain', '2025-04-16 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Rushab Shah', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rushab Shah', '2025-04-16 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Zemy sojitra', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Zemy sojitra', '2025-04-16 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Zemy sojitra', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Zemy sojitra', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Zemy sojitra', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Zemy sojitra', '2025-04-16 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Unnati Sawlani', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-16T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Unnati Sawlani', '2025-04-16 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'sanjay virani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'sanjay virani', '2025-04-16 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'sanjay virani', NULL, NULL, 1982.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1680,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":42,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1680,"tax":302.4,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'sanjay virani', '2025-04-16 00:00:00+00', 1982.4, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'sanjay virani', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'sanjay virani', '2025-04-16 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'sanjay virani', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"SKIN - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face De Tan","service_name":"Face De Tan","gst_percentage":18,"subtotal":500,"tax":90,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'sanjay virani', '2025-04-16 00:00:00+00', 590, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'sanjay virani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'sanjay virani', '2025-04-16 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sonal Kapadia', NULL, NULL, 4248, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":90,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":3600,"tax":648,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Sonal Kapadia', '2025-04-16 00:00:00+00', 4248, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sonal Kapadia', NULL, NULL, 1274.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1080,"tax":194.4,"discount":120}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Sonal Kapadia', '2025-04-16 00:00:00+00', 1274.4, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Sonal Kapadia', NULL, NULL, 1805.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1700,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Spa Pedicure","service_name":"Spa Pedicure","gst_percentage":18,"subtotal":1530,"tax":275.4,"discount":170}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Sonal Kapadia', '2025-04-16 00:00:00+00', 1805.4, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'zubin joshina', NULL, NULL, 11800, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":10000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Creative Color","service_name":"Creative Color","gst_percentage":18,"subtotal":10000,"tax":1800,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'zubin joshina', '2025-04-16 00:00:00+00', 11800, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Avni', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Avni', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Kalpa Kapadia', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Kalpa Kapadia', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Divya Nathani', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Divya Nathani', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Jaya patel', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-16 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Jaya patel', NULL, NULL, 2454.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2080,"tax":374.4,"discount":520}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Pawan Pradhan', 'Jaya patel', '2025-04-16 00:00:00+00', 2454.4, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Jaya patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Jaya patel', '2025-04-16 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Jaya patel', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jaya patel', '2025-04-16 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Shekhar Yadav', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Shekhar Yadav', '2025-04-16 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-16 00:00:00+00', 'Shekhar Yadav', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Shekhar Yadav', '2025-04-16 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Rahul Bhandari', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Rahul Bhandari', '2025-04-17 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Pinal Sheth', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Normal Wash","service_name":"Normal Wash","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Pinal Sheth', '2025-04-17 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Pinal Sheth', NULL, NULL, 5900, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":5000,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":5000,"tax":900,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Pinal Sheth', '2025-04-17 00:00:00+00', 5900, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Renny Shihora', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Renny Shihora', '2025-04-17 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Preksha Chawla', NULL, NULL, 4779, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":4500,"category":"Skin - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Body Polishing","service_name":"Body Polishing","gst_percentage":18,"subtotal":4050,"tax":729,"discount":450}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Preksha Chawla', '2025-04-17 00:00:00+00', 4779, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Jay Bardolia', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jay Bardolia', '2025-04-17 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Niddhi Patel', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Niddhi Patel', '2025-04-17 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Niddhi Patel', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Half Leg Wax","service_name":"Half Leg Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Niddhi Patel', '2025-04-17 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Niddhi Patel', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Niddhi Patel', '2025-04-17 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Niddhi Patel', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Niddhi Patel', '2025-04-17 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Zeel Tanawala', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Zeel Tanawala', '2025-04-17 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Jignesh Patel', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jignesh Patel', '2025-04-17 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Jignesh Patel', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jignesh Patel', '2025-04-17 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Jignesh Patel', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Jignesh Patel', '2025-04-17 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Jignesh Patel', NULL, NULL, 3186, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":2700,"tax":486,"discount":300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Jignesh Patel', '2025-04-17 00:00:00+00', 3186, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Priyesh Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"SKIN - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Back Wax","service_name":"Back Wax","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Priyesh Patel', '2025-04-17 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Aditi Nayak', NULL, NULL, 2655, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2250,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":15,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Keratin Treatment","service_name":"Keratin Treatment","gst_percentage":18,"subtotal":2250,"tax":405,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Pawan Pradhan', 'Aditi Nayak', '2025-04-17 00:00:00+00', 2655, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-17 00:00:00+00', 'Punit Rathi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Punit Rathi', '2025-04-17 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Priyanshu Vora', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Priyanshu Vora', '2025-04-18 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Saloni Agarwal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Saloni Agarwal', '2025-04-18 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Ruzda', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Ruzda', '2025-04-18 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Sanjay Jain', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Sanjay Jain', '2025-04-18 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Sanjay Jain', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Sanjay Jain', '2025-04-18 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Sanjay Jain', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Express Manicure(female)","service_name":"Express Manicure(female)","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Sanjay Jain', '2025-04-18 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Sanchita Seth', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Sanchita Seth', '2025-04-18 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Monty Dhankecha', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Monty Dhankecha', '2025-04-18 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Monty Dhankecha', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Monty Dhankecha', '2025-04-18 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Preety Mehta', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Preety Mehta', '2025-04-18 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Preety Mehta', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Preety Mehta', '2025-04-18 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Manali sanghvi', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Manali sanghvi', '2025-04-18 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Vibhuti', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Vibhuti', '2025-04-18 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Pragati Kothiya', NULL, NULL, 1274.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":18,"subtotal":1080,"tax":194.4,"discount":120}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Pragati Kothiya', '2025-04-18 00:00:00+00', 1274.4, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Pragati Kothiya', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Pragati Kothiya', '2025-04-18 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Pragati Kothiya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand De Tan","service_name":"Hand De Tan","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Pragati Kothiya', '2025-04-18 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Anuj Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Anuj Agarwal', '2025-04-18 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Manish Mangotia', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Manish Mangotia', '2025-04-18 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Manish Mangotia', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Manish Mangotia', '2025-04-18 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Manish Mangotia', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Manish Mangotia', '2025-04-18 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Prasha Gandhi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Prasha Gandhi', '2025-04-18 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Prasha Gandhi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Prasha Gandhi', '2025-04-18 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Shipra Dave', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Shipra Dave', '2025-04-18 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Jenny shah', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Jenny shah', '2025-04-18 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'amit patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'amit patel', '2025-04-18 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Vaishnavi Jariwala', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shubham Khalashi', 'Vaishnavi Jariwala', '2025-04-18 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-18 00:00:00+00', 'Vaishnavi Jariwala', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Vaishnavi Jariwala', '2025-04-18 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Shahid', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Shahid', '2025-04-19 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Shahid', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Shahid', '2025-04-19 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Hari', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Hari', '2025-04-19 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Hari', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Hari', '2025-04-19 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Jeet', NULL, NULL, 2655, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2250,"tax":405,"discount":250}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jeet', '2025-04-19 00:00:00+00', 2655, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Jeet', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Jeet', '2025-04-19 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Dimple Sharma', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dimple Sharma', '2025-04-19 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Dimple Sharma', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Dimple Sharma', '2025-04-19 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'vasu', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'vasu', '2025-04-19 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Dhrasti Thakkar', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Dhrasti Thakkar', '2025-04-19 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Jaymin Chorawala', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jaymin Chorawala', '2025-04-19 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Amit shah', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Amit shah', '2025-04-19 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Pragati Kothiya', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Pragati Kothiya', '2025-04-19 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Pragati Kothiya', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Pragati Kothiya', '2025-04-19 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Neha Mittal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Neha Mittal', '2025-04-19 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Neha Mittal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Neha Mittal', '2025-04-19 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Dhrumi Narang', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Dhrumi Narang', '2025-04-19 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Shiba Khanna', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'Shiba Khanna', '2025-04-19 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Shiba Khanna', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Shiba Khanna', '2025-04-19 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Aditya Garg', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Aditya Garg', '2025-04-19 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Aditya Garg', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Aditya Garg', '2025-04-19 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Aditya Garg', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face De Tan","service_name":"Face De Tan","gst_percentage":18,"subtotal":500,"tax":90,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Aditya Garg', '2025-04-19 00:00:00+00', 590, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-19 00:00:00+00', 'Veena', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Veena', '2025-04-19 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Anahita Jain', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Anahita Jain', '2025-04-20 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'kishan Narang', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'kishan Narang', '2025-04-20 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Subhankit Pandey', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Subhankit Pandey', '2025-04-20 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'chaarvi Gupta', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'chaarvi Gupta', '2025-04-20 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'chaarvi Gupta', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'chaarvi Gupta', '2025-04-20 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Krishna Malani', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Krishna Malani', '2025-04-20 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'stu(Sanket Modh)', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'stu(Sanket Modh)', '2025-04-20 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Nirmal Merchant', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Nirmal Merchant', '2025-04-20 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":650,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":950,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Bhavna', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Bikini Wax","service_name":"Bikini Wax","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Skin - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Up","service_name":"Clean Up","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":2000,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Upper Lips","service_name":"Upper Lips","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":100,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Manicure","service_name":"Classic Manicure","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1200,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Jenet', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1400,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Shital Sharda', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Chetan', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Chetan', '2025-04-20 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Chetan', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'Chetan', '2025-04-20 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Darshana patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Darshana patel', '2025-04-20 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Darshana patel', NULL, NULL, 5192, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":4400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":110,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":4400,"tax":792,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Darshana patel', '2025-04-20 00:00:00+00', 5192, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Darshana patel', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Skin - Threading","hsn_code":"33059090","quantity":3,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Darshana patel', '2025-04-20 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Darshana patel', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Darshana patel', '2025-04-20 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Vishwa Patel', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Vishwa Patel', '2025-04-20 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Vishwa Patel', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Vishwa Patel', '2025-04-20 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Vishwa Patel', NULL, NULL, 1003, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":850,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Feet Gel Paint","service_name":"Feet Gel Paint","gst_percentage":18,"subtotal":850,"tax":153,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Vishwa Patel', '2025-04-20 00:00:00+00', 1003, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Vishwa Patel', NULL, NULL, 1003, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":850,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand Gel Paint","service_name":"Hand Gel Paint","gst_percentage":18,"subtotal":850,"tax":153,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Vishwa Patel', '2025-04-20 00:00:00+00', 1003, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Kuldeep', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Kuldeep', '2025-04-20 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Kuldeep', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Kuldeep', '2025-04-20 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Kuldeep', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Kuldeep', '2025-04-20 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shyam Vithalani', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2000,"tax":360,"discount":500}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Shyam Vithalani', '2025-04-20 00:00:00+00', 2360, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Shyam Vithalani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Shyam Vithalani', '2025-04-20 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Manan Agarwal', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Manan Agarwal', '2025-04-20 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Manan Agarwal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Manan Agarwal', '2025-04-20 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Noorani', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'Noorani', '2025-04-20 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Noorani', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Noorani', '2025-04-20 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Satyam Pande', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Satyam Pande', '2025-04-20 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Satyam Pande', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Satyam Pande', '2025-04-20 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Surali Agarwal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Surali Agarwal', '2025-04-20 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 15930, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":13500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":90,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Keratin Treatment","service_name":"Keratin Treatment","gst_percentage":18,"subtotal":13500,"tax":2430,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'TANVI NILESH SUKHARAMWALA', '2025-04-20 00:00:00+00', 15930, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Ajita Italiya', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":400,"payment_date":"2025-04-20T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Ajita Italiya', '2025-04-20 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-20 00:00:00+00', 'Mahek Tamakuwala', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mahek Tamakuwala', '2025-04-20 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'TANVI NILESH SUKHARAMWALA', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'TANVI NILESH SUKHARAMWALA', '2025-04-21 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'Saloni Shrivastav', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Saloni Shrivastav', '2025-04-21 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'joint comisioner wife jigyasa', NULL, NULL, 1534, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":1300,"tax":234,"discount":1300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'joint comisioner wife jigyasa', '2025-04-21 00:00:00+00', 1534, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'joint comisioner wife jigyasa', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Skin - FACE","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"CLEAN UP","service_name":"CLEAN UP","gst_percentage":18,"subtotal":1000,"tax":180,"discount":1000}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'joint comisioner wife jigyasa', '2025-04-21 00:00:00+00', 1180, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'Sashi Jain', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Sashi Jain', '2025-04-21 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'Palak Rathi', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Palak Rathi', '2025-04-21 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'Shipra Dave', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Normal Wash","service_name":"Normal Wash","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Shipra Dave', '2025-04-21 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-21 00:00:00+00', 'Param Shah', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Param Shah', '2025-04-21 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Khiyati niyak', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Khiyati niyak', '2025-04-22 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Aarti Goyal', NULL, NULL, 5900, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":5000,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":5000,"tax":900,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Aarti Goyal', '2025-04-22 00:00:00+00', 5900, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Rahul Bhandari', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Rahul Bhandari', '2025-04-22 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Rahul Bhandari', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Rahul Bhandari', '2025-04-22 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Kavita Kejirwal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Kavita Kejirwal', '2025-04-22 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Aagna Ajmera', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Aagna Ajmera', '2025-04-22 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'RushiRaj', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'RushiRaj', '2025-04-22 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Devanshi Pathwara', NULL, NULL, 18290, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":15500,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Creative Color","service_name":"Creative Color","gst_percentage":18,"subtotal":15500,"tax":2790,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Devanshi Pathwara', '2025-04-22 00:00:00+00', 18290, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Hoshedar Variava', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Hoshedar Variava', '2025-04-22 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Premil Shah', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Premil Shah', '2025-04-22 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Premil Shah', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Premil Shah', '2025-04-22 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Parima', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":2400,"tax":432,"discount":600}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Parima', '2025-04-22 00:00:00+00', 2832, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Monark', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Monark', '2025-04-22 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Monark', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Monark', '2025-04-22 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Ruzda', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Ruzda', '2025-04-22 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Abhinav sindhe', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Abhinav sindhe', '2025-04-22 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Abhinav sindhe', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Abhinav sindhe', '2025-04-22 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Neha Daga', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Neha Daga', '2025-04-22 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Manisha Shah', NULL, NULL, 3304, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3500,"category":"Skin - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Swedish Massage 60 Mins","service_name":"Swedish Massage 60 Mins","gst_percentage":18,"subtotal":2800,"tax":504,"discount":700}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Manisha Shah', '2025-04-22 00:00:00+00', 3304, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Manisha Shah', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":2400,"tax":432,"discount":600}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Manisha Shah', '2025-04-22 00:00:00+00', 2832, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Manisha Shah', NULL, NULL, 2454.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2080,"tax":374.4,"discount":520}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Manisha Shah', '2025-04-22 00:00:00+00', 2454.4, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Manisha Shah', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Manisha Shah', '2025-04-22 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Aditi Sharma', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Aditi Sharma', '2025-04-22 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-22 00:00:00+00', 'Aditi Sharma', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Aditi Sharma', '2025-04-22 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Manish', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Manish', '2025-04-23 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Shreya 756', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Shreya 756', '2025-04-23 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Shital Sharda', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Shital Sharda', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":400,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Shital Sharda', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Sugam Rungta', NULL, NULL, 2832, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2400,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":60,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2400,"tax":432,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Sugam Rungta', '2025-04-23 00:00:00+00', 2832, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Sugam Rungta', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Sugam Rungta', '2025-04-23 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Sugam Rungta', NULL, NULL, 6490, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":5500,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Partial Foil","service_name":"Partial Foil","gst_percentage":18,"subtotal":5500,"tax":990,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Sugam Rungta', '2025-04-23 00:00:00+00', 6490, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Ashna Sharma', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Ashna Sharma', '2025-04-23 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Kaazvin Variava', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Kaazvin Variava', '2025-04-23 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Kaazvin Variava', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Kaazvin Variava', '2025-04-23 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Chaitra Gangwani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Chaitra Gangwani', '2025-04-23 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Chaitra Gangwani', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Chaitra Gangwani', '2025-04-23 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Dr Deep Modh', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Dr Deep Modh', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Dr Deep Modh', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1200,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Dr Deep Modh', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Jiya kevaria', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":2000,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Shubham Khalashi', 'Jiya kevaria', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Jiya kevaria', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1500,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Nikhil Pujari', 'Jiya kevaria', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Jiya kevaria', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":100,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Jiya kevaria', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Sunita (DSP wife)', NULL, NULL, 413, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":350,"tax":63,"discount":350}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Sunita (DSP wife)', '2025-04-23 00:00:00+00', 413, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Aditi Desai', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Vandan Gohil', 'Aditi Desai', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Aditi Desai', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1500,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Arpan sampang Rai', 'Aditi Desai', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Aditi Desai', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":8250,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Keratin Treatment","service_name":"Keratin Treatment","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":8250,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Arpan sampang Rai', 'Aditi Desai', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Aditi Desai', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":700,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Tenzy Pradhan', 'Aditi Desai', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Aditi Desai', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":200,"payment_date":"2025-04-23T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Anu Khaling Rai', 'Aditi Desai', '2025-04-23 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Radhika Agarwal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Radhika Agarwal', '2025-04-23 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Amit Jani', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Amit Jani', '2025-04-23 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Amit Jani', NULL, NULL, 1888, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1600,"tax":288,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Amit Jani', '2025-04-23 00:00:00+00', 1888, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Rinky Malpani', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Rinky Malpani', '2025-04-23 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Rinky Malpani', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Rinky Malpani', '2025-04-23 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-23 00:00:00+00', 'Mani Raheja', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Mani Raheja', '2025-04-23 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Jainet', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Jainet', '2025-04-24 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dhruvil shah', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Dhruvil shah', '2025-04-24 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dhruvil shah', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Dhruvil shah', '2025-04-24 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Yug Talukdar', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Yug Talukdar', '2025-04-24 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Rohan Lavangwala', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Rohan Lavangwala', '2025-04-24 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Aastha Agarwal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Aastha Agarwal', '2025-04-24 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Aastha Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Aastha Agarwal', '2025-04-24 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Himanshi', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Himanshi', '2025-04-24 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Nails - Manicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Express Manicure(female)","service_name":"Express Manicure(female)","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"Skin - Threading","hsn_code":"33059090","quantity":4,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Dr Atri Talukdar', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dr Atri Talukdar', '2025-04-24 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Roma', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Normal Wash","service_name":"Normal Wash","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Roma', '2025-04-24 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Jaya patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Curls","service_name":"Curls","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-24 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Anushri', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Anushri', '2025-04-24 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Anushri', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Anushri', '2025-04-24 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Arpit Narola', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Arpit Narola', '2025-04-24 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Kavita Mittal', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Kavita Mittal', '2025-04-24 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Kavita Mittal', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Kavita Mittal', '2025-04-24 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Santam Agarwal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Santam Agarwal', '2025-04-24 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-24 00:00:00+00', 'Mansi Agrawal', NULL, NULL, 1003, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":850,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand Gel Paint","service_name":"Hand Gel Paint","gst_percentage":18,"subtotal":850,"tax":153,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Mansi Agrawal', '2025-04-24 00:00:00+00', 1003, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'pritam agarwal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'pritam agarwal', '2025-04-25 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'pritam agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'pritam agarwal', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Sugam Rungta', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ajay Shirsath', 'Sugam Rungta', '2025-04-25 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Gargi 98', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Gargi 98', '2025-04-25 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rutvik 88', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Rutvik 88', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ayush', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Ayush', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ayush', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Ayush', '2025-04-25 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prachi', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Prachi', '2025-04-25 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prince Rathi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Prince Rathi', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prince Rathi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"SKIN - De Tan","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face De Tan","service_name":"Face De Tan","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Prince Rathi', '2025-04-25 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aman Agarwal 99', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Aman Agarwal 99', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aman Agarwal 99', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Aman Agarwal 99', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rohan Gupta', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Rohan Gupta', '2025-04-25 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rohan Gupta', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Rohan Gupta', '2025-04-25 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aarti mundra', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1800,"payment_date":"2025-04-25T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Ajay Shirsath', 'Aarti mundra', '2025-04-25 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aarti mundra', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":2600,"payment_date":"2025-04-25T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Jenet', 'Aarti mundra', '2025-04-25 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Aarti mundra', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":100,"payment_date":"2025-04-25T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Bhavna', 'Aarti mundra', '2025-04-25 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ruchi Patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Ruchi Patel', '2025-04-25 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Seema Sims', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Seema Sims', '2025-04-25 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Seema Sims', NULL, NULL, 5900, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":5000,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Strengthning","service_name":"Hair Strengthning","gst_percentage":18,"subtotal":5000,"tax":900,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Seema Sims', '2025-04-25 00:00:00+00', 5900, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rujal Patel', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Rujal Patel', '2025-04-25 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rujal Patel', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Rujal Patel', '2025-04-25 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rujal Patel', NULL, NULL, 1486.8, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1260,"tax":226.8,"discount":140}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Rujal Patel', '2025-04-25 00:00:00+00', 1486.8, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Rajvi Shah', '2025-04-25 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Rajvi Shah', '2025-04-25 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Rajvi Shah', '2025-04-25 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Rajvi Shah', '2025-04-25 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 1805.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1700,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Spa Pedicure","service_name":"Spa Pedicure","gst_percentage":18,"subtotal":1530,"tax":275.4,"discount":170}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Rajvi Shah', '2025-04-25 00:00:00+00', 1805.4, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Rajvi Shah', NULL, NULL, 3186, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":2700,"tax":486,"discount":300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Rajvi Shah', '2025-04-25 00:00:00+00', 3186, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1600,"payment_date":"2025-04-25T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Toshi Jamir', 'Ajita Italiya', '2025-04-25 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Skin - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Foot Massage","service_name":"Foot Massage","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":1000,"payment_date":"2025-04-25T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Wailed', 'Ajita Italiya', '2025-04-25 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ajita Italiya', NULL, NULL, 0, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Curls","service_name":"Curls","gst_percentage":0,"subtotal":0,"tax":0,"discount":0}]'::jsonb, true,
  '[{"id":extensions.uuid_generate_v4(),"amount":700,"payment_date":"2025-04-25T00:00:00Z","payment_method":"Redemption"}]'::jsonb, 0, true, NULL, false,
  'Shanti Thapa', 'Ajita Italiya', '2025-04-25 00:00:00+00', 0, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Ruchika Chaudhary', '2025-04-25 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Ruchika Chaudhary', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Ruchika Chaudhary', '2025-04-25 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Sonam Jain', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Sonam Jain', '2025-04-25 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Sonam Jain', NULL, NULL, 1321.6, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1120,"tax":201.6,"discount":280}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Sonam Jain', '2025-04-25 00:00:00+00', 1321.6, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Sonam Jain', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Back Wash Protein Treatment","service_name":"Back Wash Protein Treatment","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Kinal Solanki', 'Sonam Jain', '2025-04-25 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Sonam Jain', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'Sonam Jain', '2025-04-25 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Dimple Sharma', NULL, NULL, 3186, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Facial","service_name":"Facial","gst_percentage":18,"subtotal":2700,"tax":486,"discount":300}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dimple Sharma', '2025-04-25 00:00:00+00', 3186, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Dimple Sharma', NULL, NULL, 531, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":450,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face Wax","service_name":"Face Wax","gst_percentage":18,"subtotal":450,"tax":81,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dimple Sharma', '2025-04-25 00:00:00+00', 531, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Dimple Sharma', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Dimple Sharma', '2025-04-25 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Dimple Sharma', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Color Toner","service_name":"Color Toner","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Pawan Pradhan', 'Dimple Sharma', '2025-04-25 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Prem Varlini', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Prem Varlini', '2025-04-25 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Amit 98', NULL, NULL, 2958.26, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2507,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2507,"tax":451.26,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Amit 98', '2025-04-25 00:00:00+00', 2958.26, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Kishan Kukadiya', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Kishan Kukadiya', '2025-04-25 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Kishan Kukadiya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Kishan Kukadiya', '2025-04-25 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Namrata Mohindra', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Namrata Mohindra', '2025-04-25 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Namrata Mohindra', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Namrata Mohindra', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Soniya Jain', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Soniya Jain', '2025-04-25 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Soniya Jain', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Admin', 'Soniya Jain', '2025-04-25 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-25 00:00:00+00', 'Soniya Jain', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Soniya Jain', '2025-04-25 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Mayank Bansal', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mayank Bansal', '2025-04-26 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Mayank Bansal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Mayank Bansal', '2025-04-26 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Mayank Bansal', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mayank Bansal', '2025-04-26 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Mayank Bansal', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Mayank Bansal', '2025-04-26 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Yazad Bhesania', NULL, NULL, 377.6, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":320,"tax":57.6,"discount":80}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yazad Bhesania', '2025-04-26 00:00:00+00', 377.6, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Yazad Bhesania', NULL, NULL, 519.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":18,"subtotal":440,"tax":79.2,"discount":110}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yazad Bhesania', '2025-04-26 00:00:00+00', 519.2, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Yash', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Yash', '2025-04-26 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Ruchika Savaliya', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Ruchika Savaliya', '2025-04-26 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Pooja Bajaj', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Pooja Bajaj', '2025-04-26 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Pooja Bajaj', NULL, NULL, 413, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":350,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Flicks or Bangs cut","service_name":"Flicks or Bangs cut","gst_percentage":18,"subtotal":350,"tax":63,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Pooja Bajaj', '2025-04-26 00:00:00+00', 413, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'vishal surana', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'vishal surana', '2025-04-26 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'vishal surana', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'vishal surana', '2025-04-26 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Vinita 95', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Vinita 95', '2025-04-26 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Sushila Patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Sushila Patel', '2025-04-26 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Sneh', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Sneh', '2025-04-26 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Shweta Gupta', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Shweta Gupta', '2025-04-26 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Shweta Gupta', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Shweta Gupta', '2025-04-26 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Shweta Gupta', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Shweta Gupta', '2025-04-26 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Seema Bhandari', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":65,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Seema Bhandari', '2025-04-26 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-26 00:00:00+00', 'Seema Bhandari', NULL, NULL, 1593, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1350,"tax":243,"discount":150}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Seema Bhandari', '2025-04-26 00:00:00+00', 1593, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Dipti Mehta', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":25,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Dipti Mehta', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Harshit Shurana', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Harshit Shurana', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Pratik Bhojwani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Pratik Bhojwani', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Pratik Bhojwani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Pratik Bhojwani', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Jinesh Patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Jinesh Patel', '2025-04-27 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Stuti Agarwal', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Stuti Agarwal', '2025-04-27 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Stuti Agarwal', NULL, NULL, 1121, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":950,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Leg Wax","service_name":"Full Leg Wax","gst_percentage":18,"subtotal":950,"tax":171,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Stuti Agarwal', '2025-04-27 00:00:00+00', 1121, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Stuti Agarwal', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Stuti Agarwal', '2025-04-27 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'shenaz Mehta', NULL, NULL, 2360, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":50,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2000,"tax":360,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'shenaz Mehta', '2025-04-27 00:00:00+00', 2360, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'shenaz Mehta', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'shenaz Mehta', '2025-04-27 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'shenaz Mehta', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"SKIN - Massage","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Foot Massage","service_name":"Foot Massage","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'shenaz Mehta', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'shenaz Mehta', NULL, NULL, 2655, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2250,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":15,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Keratin Treatment","service_name":"Keratin Treatment","gst_percentage":18,"subtotal":2250,"tax":405,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'shenaz Mehta', '2025-04-27 00:00:00+00', 2655, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Govind', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Govind', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Govind', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Govind', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Vinod Kothari', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Vinod Kothari', '2025-04-27 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Vinny Narang', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Vinny Narang', '2025-04-27 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Roma', NULL, NULL, 1321.6, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1120,"tax":201.6,"discount":280}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Roma', '2025-04-27 00:00:00+00', 1321.6, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Roma', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Roma', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Arpit Jain', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Arpit Jain', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Arpit Jain', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Arpit Jain', '2025-04-27 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Abhi shivam samsung', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Abhi shivam samsung', '2025-04-27 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Abhi shivam samsung', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Abhi shivam samsung', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Abhi shivam samsung', NULL, NULL, 1416, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":30,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Global Color","service_name":"Global Color","gst_percentage":18,"subtotal":1200,"tax":216,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Abhi shivam samsung', '2025-04-27 00:00:00+00', 1416, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Abhi shivam samsung', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Colour","service_name":"Beard Colour","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Abhi shivam samsung', '2025-04-27 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Nirav Patel', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Nirav Patel', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Niddhi Chapariya', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Niddhi Chapariya', '2025-04-27 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Hetanshi Kinariwala', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Hetanshi Kinariwala', '2025-04-27 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Arshi Narang', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'Arshi Narang', '2025-04-27 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Tanay Vaid', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Tanay Vaid', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Kuldeep Rathi', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Kuldeep Rathi', '2025-04-27 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Heer Patel', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Heer Patel', '2025-04-27 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Priti Agarwal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Priti Agarwal', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Priti Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Priti Agarwal', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Hani Adnani', NULL, NULL, 8850, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":7500,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Creative Color","service_name":"Creative Color","gst_percentage":18,"subtotal":7500,"tax":1350,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Hani Adnani', '2025-04-27 00:00:00+00', 8850, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Hani Adnani', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Hani Adnani', '2025-04-27 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Hani Adnani', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Hani Adnani', '2025-04-27 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Rachana 75', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Rachana 75', '2025-04-27 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Rushi Jagani', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Rushi Jagani', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Rushi Jagani', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Rushi Jagani', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Jenil Gandhi', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jenil Gandhi', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Jenil Gandhi', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jenil Gandhi', '2025-04-27 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-27 00:00:00+00', 'Darshan 98', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Darshan 98', '2025-04-27 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-28 00:00:00+00', 'Rinkle Jariwala', NULL, NULL, 1652, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1400,"category":"Nails - Pedicure","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Classic Pedicure","service_name":"Classic Pedicure","gst_percentage":18,"subtotal":1400,"tax":252,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Rinkle Jariwala', '2025-04-28 00:00:00+00', 1652, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-28 00:00:00+00', 'Disha Javeri', NULL, NULL, 1003, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":850,"category":"Skin - Bleach","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Face Bleach","service_name":"Face Bleach","gst_percentage":18,"subtotal":850,"tax":153,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Aiban Marwein', 'Disha Javeri', '2025-04-28 00:00:00+00', 1003, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-28 00:00:00+00', 'Rupal Shross', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Rupal Shross', '2025-04-28 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-28 00:00:00+00', 'Archana jARIWALA', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Archana jARIWALA', '2025-04-28 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-28 00:00:00+00', 'sejal', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Bhavna', 'sejal', '2025-04-28 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-28 00:00:00+00', 'Tanishka Asija', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Tanishka Asija', '2025-04-28 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Jiya Dholakiya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jiya Dholakiya', '2025-04-29 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Jiya Dholakiya', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jiya Dholakiya', '2025-04-29 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Jiya Dholakiya', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Intense Rituals","service_name":"Intense Rituals","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Jiya Dholakiya', '2025-04-29 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Vidhisha 84', NULL, NULL, 354, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":300,"category":"Nails - Nail Paint","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hand Gel Removal","service_name":"Hand Gel Removal","gst_percentage":18,"subtotal":300,"tax":54,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Vidhisha 84', '2025-04-29 00:00:00+00', 354, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Vidhisha 84', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Nails - nail cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hands Nail Cut And File","service_name":"Hands Nail Cut And File","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Juni', 'Vidhisha 84', '2025-04-29 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Henil Mehta', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Henil Mehta', '2025-04-29 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Nikita Misruf', NULL, NULL, 2761.2, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2340,"tax":421.2,"discount":260}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Wailed', 'Nikita Misruf', '2025-04-29 00:00:00+00', 2761.2, NULL, 10.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Snehal Patel', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Snehal Patel', '2025-04-29 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Snehal Patel', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Snehal Patel', '2025-04-29 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Mona Dodiya', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Mona Dodiya', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Mona Dodiya', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Mona Dodiya', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Komal Shah', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Komal Shah', '2025-04-29 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Nayan Nitesh', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Nayan Nitesh', '2025-04-29 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Nayan Nitesh', NULL, NULL, 295, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":250,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Male Wash And Stylling","service_name":"Male Wash And Stylling","gst_percentage":18,"subtotal":250,"tax":45,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Nayan Nitesh', '2025-04-29 00:00:00+00', 295, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Akhand Desai', '2025-04-29 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Akhand Desai', '2025-04-29 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Akhand Desai', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Akhand Desai', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Akhand Desai', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'janvi Dave', NULL, NULL, 649, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":550,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Normal Wash","service_name":"Normal Wash","gst_percentage":18,"subtotal":550,"tax":99,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'janvi Dave', '2025-04-29 00:00:00+00', 649, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'janvi Dave', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Back Wash Protien Treatment","service_name":"Back Wash Protien Treatment","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'janvi Dave', '2025-04-29 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'janvi Dave', NULL, NULL, 118, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":100,"category":"Skin - Threading","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":100,"tax":18,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'janvi Dave', '2025-04-29 00:00:00+00', 118, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Priyanka Italiya', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Arpan sampang Rai', 'Priyanka Italiya', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Neha Shabu', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Neha Shabu', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-29 00:00:00+00', 'Anushka Bakshani', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Toshi Jamir', 'Anushka Bakshani', '2025-04-29 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Zemy sojitra', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Senior Hairdresser(Female)","service_name":"Haircut With Senior Hairdresser(Female)","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Nikhil Pujari', 'Zemy sojitra', '2025-04-30 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Amit Agarwal', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Amit Agarwal', '2025-04-30 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Amit Agarwal', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Male Wash And Stylling","service_name":"Male Wash And Stylling","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Amit Agarwal', '2025-04-30 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Mishal Bhakta', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Mishal Bhakta', '2025-04-30 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kajal', NULL, NULL, 3068, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2600,"tax":468,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Tenzy Pradhan', 'Kajal', '2025-04-30 00:00:00+00', 3068, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kajal', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":25,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Kajal', '2025-04-30 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Ritesh Sharma', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Ritesh Sharma', '2025-04-30 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Nishant pitaliya', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Mehul Kinariwala', 'Nishant pitaliya', '2025-04-30 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Nishant pitaliya', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Nishant pitaliya', '2025-04-30 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Abdul Hasan', NULL, NULL, 295, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":250,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Male Wash And Stylling","service_name":"Male Wash And Stylling","gst_percentage":18,"subtotal":250,"tax":45,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Abdul Hasan', '2025-04-30 00:00:00+00', 295, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Samveg Shah', NULL, NULL, 1180, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Senior Hairdresser (Male)","service_name":"Hair Cut With Senior Hairdresser (Male)","gst_percentage":18,"subtotal":1000,"tax":180,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Samveg Shah', '2025-04-30 00:00:00+00', 1180, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Samveg Shah', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Samveg Shah', '2025-04-30 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 1888, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1600,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":40,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1600,"tax":288,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-30 00:00:00+00', 1888, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 590, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":500,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Clean Shaving","service_name":"Clean Shaving","gst_percentage":18,"subtotal":500,"tax":90,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Jaya patel', '2025-04-30 00:00:00+00', 590, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 1770, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Head Massage With Oil","service_name":"Head Massage With Oil","gst_percentage":18,"subtotal":1500,"tax":270,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Ruba', 'Jaya patel', '2025-04-30 00:00:00+00', 1770, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 2454.4, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2600,"category":"Hair - Hair Treatment","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Olaplex Hair Treatment","service_name":"Olaplex Hair Treatment","gst_percentage":18,"subtotal":2080,"tax":374.4,"discount":520}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-30 00:00:00+00', 2454.4, NULL, 20.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jaya patel', NULL, NULL, 885, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1500,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Curls","service_name":"Curls","gst_percentage":18,"subtotal":750,"tax":135,"discount":750}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Anu Khaling Rai', 'Jaya patel', '2025-04-30 00:00:00+00', 885, NULL, 50.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jay Dangar', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Jay Dangar', '2025-04-30 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Jay Dangar', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Jay Dangar', '2025-04-30 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Mittal Kathrotiwala', NULL, NULL, 3540, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":3000,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Haircut With Creative director(female)","service_name":"Haircut With Creative director(female)","gst_percentage":18,"subtotal":3000,"tax":540,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Mittal Kathrotiwala', '2025-04-30 00:00:00+00', 3540, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kaazvin Variava', NULL, NULL, 826, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":700,"category":"Hair - Hair Styling","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Wash & Blow Dry","service_name":"Wash & Blow Dry","gst_percentage":18,"subtotal":700,"tax":126,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Kaazvin Variava', '2025-04-30 00:00:00+00', 826, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Kaazvin Variava', NULL, NULL, 2124, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":1800,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":45,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":1800,"tax":324,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Kaazvin Variava', '2025-04-30 00:00:00+00', 2124, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Vivek Patel', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Vandan Gohil', 'Vivek Patel', '2025-04-30 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Monty Dhankecha', NULL, NULL, 2950, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2500,"category":"HAIR - Hair Cut","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Hair Cut With Creative director (Male)","service_name":"Hair Cut With Creative director (Male)","gst_percentage":18,"subtotal":2500,"tax":450,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rohan Patel', 'Monty Dhankecha', '2025-04-30 00:00:00+00', 2950, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Monty Dhankecha', NULL, NULL, 472, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":400,"category":"HAIR - Beard Trim","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Beard Trim","service_name":"Beard Trim","gst_percentage":18,"subtotal":400,"tax":72,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Monty Dhankecha', '2025-04-30 00:00:00+00', 472, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 2596, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":2200,"category":"Hair - Hair Color","hsn_code":"33059090","quantity":55,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Root Touch Up","service_name":"Root Touch Up","gst_percentage":18,"subtotal":2200,"tax":396,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Rupesh Mahale', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 2596, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"SKIN - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Full Hand Wax","service_name":"Full Hand Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 767, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":650,"category":"Skin - Waxing","hsn_code":"33059090","quantity":1,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Half Leg Wax","service_name":"Half Leg Wax","gst_percentage":18,"subtotal":650,"tax":117,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Jenet', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 767, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);

INSERT INTO pos_orders (
  id, created_at, client_name, consumption_purpose, consumption_notes, total, type,
  is_salon_consumption, status, payment_method, stylist_id, services, is_walk_in,
  payments, pending_amount, is_split_payment, appointment_id, is_salon_purchase,
  stylist_name, customer_name, date, total_amount, appointment_time, discount_percentage,
  requisition_voucher_no, stock_snapshot, current_stock, multi_expert_group_id,
  multi_expert, total_experts, expert_index, tenant_id, user_id
) VALUES (
  extensions.uuid_generate_v4(), '2025-04-30 00:00:00+00', 'Niddhi Mankani', NULL, NULL, 236, 'sale',
  false, 'completed', 'null', '', '[{"type":"service","price":200,"category":"Skin - Threading","hsn_code":"33059090","quantity":2,"product_id":extensions.uuid_generate_v4(),"service_id":extensions.uuid_generate_v4(),"product_name":"Eyebrow","service_name":"Eyebrow","gst_percentage":18,"subtotal":200,"tax":36,"discount":0}]'::jsonb, true,
  '[]'::jsonb, 0, false, NULL, false,
  'Shanti Thapa', 'Niddhi Mankani', '2025-04-30 00:00:00+00', 236, NULL, 0.00,
  NULL, '{}'::jsonb, '0', NULL,
  false, 1, 1, '', NULL
);
