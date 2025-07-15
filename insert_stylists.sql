-- Insert all stylists with user_id starting from 3
-- This script assumes the auth.users table has user IDs starting from 3

INSERT INTO public.stylists (id, user_id, name, email, phone, created_at, updated_at, bio, gender, available, image_url, specialties, breaks, holidays)
VALUES 
(uuid_generate_v4(), '3'::uuid, 'Rohan Patel', NULL, '9586511155', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '4'::uuid, 'Toshi Amir', NULL, '7359718468', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '5'::uuid, 'Nikhil Pujari', NULL, '8733095907', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '6'::uuid, 'Arpan sampang Rai', NULL, '7069371392', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '7'::uuid, 'Pavan Pradhan', NULL, '8141873843', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '8'::uuid, 'Vandana', NULL, '9924426951', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '9'::uuid, 'Rupesh Mahale', NULL, '9054940604', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '10'::uuid, 'Shubham Khalashi', NULL, '8849407271', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '11'::uuid, 'Tanvi Kshirsagar', NULL, '9503556939', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '12'::uuid, 'Shanti Thapa', NULL, '9054605198', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '13'::uuid, 'Anu Khaling Rai', NULL, '8972096022', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '14'::uuid, 'Arju Rumdali Rai', NULL, '8145174579', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '15'::uuid, 'Janet', NULL, '9023867542', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '16'::uuid, 'Alban Marwein', NULL, '9402546067', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '17'::uuid, 'Ruba', NULL, '9863751276', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '18'::uuid, 'Elgita', NULL, '9865532713', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '19'::uuid, 'Twinkle Magar', NULL, '6909410226', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '20'::uuid, 'Bhavna', NULL, '6283039278', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '21'::uuid, 'Walted', NULL, '6909540303', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '22'::uuid, 'Juni', NULL, '6009096991', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '23'::uuid, 'Admin', NULL, '2130128390', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '24'::uuid, 'Nandini Mhajan', NULL, '9016607140', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '25'::uuid, 'Ajay Bhosale', NULL, '7261536277', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '26'::uuid, 'Kinal Solanki', NULL, '8128706040', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '27'::uuid, 'Teenu Sen', NULL, '8295846845', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '28'::uuid, 'Mehul Kinariwala', NULL, '7801974712', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]'),
(uuid_generate_v4(), '29'::uuid, 'Anil Thapa', NULL, '9599030184', NOW(), NOW(), NULL, NULL, true, NULL, '{}', '[]', '[]');

-- Display confirmation message
SELECT 'Successfully inserted 27 stylists with user_id starting from 3' as message; 