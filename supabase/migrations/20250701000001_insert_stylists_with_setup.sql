-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temporarily alter RLS
ALTER TABLE stylists DISABLE ROW LEVEL SECURITY;

-- Insert stylists data
INSERT INTO stylists (id, user_id, name, phone, created_at, updated_at, available, specialties, breaks, holidays)
VALUES 
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Rohan Patel', '9876543210', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Amit Shah', '9876543211', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Priya Sharma', '9876543212', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Neha Patel', '9876543213', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Raj Kumar', '9876543214', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Meera Singh', '9876543215', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Vikram Desai', '9876543216', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Anjali Mehta', '9876543217', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Kiran Shah', '9876543218', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Deepak Verma', '9876543219', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Pooja Gandhi', '9876543220', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Rahul Joshi', '9876543221', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Sonia Kapoor', '9876543222', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Arjun Malhotra', '9876543223', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Maya Reddy', '9876543224', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Suresh Kumar', '9876543225', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Divya Patel', '9876543226', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Rajesh Shah', '9876543227', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Anita Desai', '9876543228', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Prakash Iyer', '9876543229', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Ritu Sharma', '9876543230', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Sanjay Gupta', '9876543231', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Kavita Rao', '9876543232', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Mohan Singh', '9876543233', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Geeta Patel', '9876543234', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Ramesh Kumar', '9876543235', NOW(), NOW(), true, '{}', '{}', '{}'),
    (gen_random_uuid(), '3f4b718f-70cb-4873-a62c-b8806a92e25b', 'Anil Thapa', '9876543236', NOW(), NOW(), true, '{}', '{}', '{}');

-- Re-enable RLS
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY; 