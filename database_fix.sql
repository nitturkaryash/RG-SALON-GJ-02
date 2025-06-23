-- =================================================================
-- DATABASE FIX SCRIPT
-- Run this in your Supabase SQL Editor to fix recent issues.
-- =================================================================

-- Step 1: Create the helper function to get the current user's ID
-- This function is essential for Row Level Security (RLS) to work.
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid STABLE LANGUAGE SQL AS $$
  SELECT
    COALESCE(
      auth.uid(),
      (current_setting('request.jwt.claims', true)::JSON->>'sub')::uuid
    );
$$;

-- Step 2: Add role and salon_name columns to admin_users table
-- This is needed for the new multi-tenant (super_admin vs salon_owner) logic.
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS role text DEFAULT 'salon_owner',
ADD COLUMN IF NOT EXISTS salon_name text;

-- Step 3: Ensure existing users have the default role
UPDATE public.admin_users
SET role = 'salon_owner'
WHERE role IS NULL;

-- Step 4: Update RLS policy for the admin_users table
-- This allows a super_admin to see all users, while salon_owners can only see themselves.
DROP POLICY IF EXISTS "user_access_admin_users" ON public.admin_users;
CREATE POLICY "user_access_admin_users" ON public.admin_users
  FOR ALL USING (
    -- Users can see their own record
    user_id = auth.user_id() OR
    -- The super_admin can see all records
    EXISTS (
      SELECT 1 FROM public.admin_users sa
      WHERE sa.user_id = auth.user_id()
      AND sa.role = 'super_admin'
      AND sa.is_active = true
    )
  );

-- =================================================================
-- SCRIPT END
-- After running this, the "function auth.user_id() does not exist"
-- error should be resolved, and the admin panel should work as expected.
-- ================================================================= 