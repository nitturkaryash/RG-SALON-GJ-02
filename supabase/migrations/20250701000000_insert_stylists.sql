-- Disable triggers temporarily
ALTER TABLE public.stylists DISABLE TRIGGER ALL;

-- Disable RLS temporarily
ALTER TABLE public.stylists DISABLE ROW LEVEL SECURITY;

-- Insert stylists
INSERT INTO public.stylists (id, user_id, name, phone, created_at, updated_at, available, specialties, breaks, holidays)
VALUES 
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Rohan Patel', '9586511155', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Toshi Amir', '7359718468', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Nikhil Pujari', '8733095907', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Arpan sampang Rai', '7069371392', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Pavan Pradhan', '8141873843', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Vandana', '9924426951', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Rupesh Mahale', '9054940604', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Shubham Khalashi', '8849407271', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Tanvi Kshirsagar', '9503556939', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Shanti Thapa', '9054605198', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Anu Khaling Rai', '8972096022', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Arju Rumdali Rai', '8145174579', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Janet', '9023867542', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Alban Marwein', '9402546067', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Ruba', '9863751276', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Elgita', '9865532713', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Twinkle Magar', '6909410226', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Bhavna', '6283039278', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Walted', '6909540303', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Juni', '6009096991', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Admin', '2130128390', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Nandini Mhajan', '9016607140', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Ajay Bhosale', '7261536277', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Kinal Solanki', '8128706040', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Teenu Sen', '8295846845', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Mehul Kinariwala', '7801974712', NOW(), NOW(), true, '{}', '[]', '[]'),
(uuid_generate_v4(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Anil Thapa', '9599030184', NOW(), NOW(), true, '{}', '[]', '[]');

-- Re-enable triggers
ALTER TABLE public.stylists ENABLE TRIGGER ALL;

-- Re-enable RLS
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY; 