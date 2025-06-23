-- ================================================
-- ADMIN SETUP FIX FOR R&G SALON
-- Run this script in your Supabase SQL Editor
-- ================================================

-- Step 1: Fix the RLS policy for admin_users to prevent infinite recursion
-- Drop the problematic policy first
DROP POLICY IF EXISTS "user_access_admin_users" ON public.admin_users;

-- Create a simple, non-recursive policy
CREATE POLICY "admin_users_policy" ON public.admin_users
  FOR ALL USING (
    -- Allow users to see their own record
    user_id = auth.uid() 
    OR 
    -- Allow if user has super_admin role (but avoid recursion)
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.is_active = true
    )
  );

-- Step 2: Ensure the admin_users table has the correct structure
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'salon_owner';

ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS salon_name TEXT;

-- Step 3: Create a super admin user if none exists
DO $$
DECLARE
  admin_count INTEGER;
  new_user_id UUID;
BEGIN
  -- Check if any super admin exists
  SELECT COUNT(*) INTO admin_count 
  FROM public.admin_users 
  WHERE role = 'super_admin' AND is_active = true;
  
  IF admin_count = 0 THEN
    -- Create a UUID for the admin user (this would normally come from auth.users)
    new_user_id := gen_random_uuid();
    
    -- Insert the super admin user
    INSERT INTO public.admin_users (
      user_id,
      email, 
      password,
      is_active,
      role,
      salon_name,
      gst_percentage,
      hsn_code,
      igst
    ) VALUES (
      new_user_id,
      'admin@salon.co',
      'admin123',
      true,
      'super_admin',
      'R&G Salon',
      '18',
      '',
      '0'
    );
    
    RAISE NOTICE 'Super admin user created with email: admin@salon.co';
  ELSE
    RAISE NOTICE 'Super admin already exists, skipping creation';
  END IF;
END $$;

-- Step 4: If you have existing users that need to be promoted to super_admin,
-- uncomment and modify the following lines:

-- UPDATE public.admin_users 
-- SET role = 'super_admin' 
-- WHERE email = 'your-existing-email@example.com';

-- Step 5: Verify the setup
SELECT 
  id,
  email,
  role,
  is_active,
  salon_name,
  created_at
FROM public.admin_users 
WHERE role = 'super_admin';

-- ================================================
-- INSTRUCTIONS:
-- ================================================
-- 1. Copy this entire script
-- 2. Go to your Supabase Dashboard > SQL Editor
-- 3. Paste and run this script
-- 4. Check the output to confirm the super admin was created
-- 5. Try logging in with:
--    Email: admin@salon.co
--    Password: admin123
-- ================================================

-- Alternative: If you have an existing auth user you want to promote,
-- find their user_id and run:
-- 
-- INSERT INTO public.admin_users (user_id, email, password, is_active, role, salon_name)
-- VALUES ('your-auth-user-id-here', 'your-email@example.com', 'your-password', true, 'super_admin', 'Your Salon Name')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', is_active = true; 