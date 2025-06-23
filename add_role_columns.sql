-- Add role and salon_name columns to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'salon_owner',
ADD COLUMN IF NOT EXISTS salon_name text;

-- Update existing users without role to be salon_owner
UPDATE public.admin_users 
SET role = 'salon_owner' 
WHERE role IS NULL;

-- Update RLS policy to include role filtering for super admin
DROP POLICY IF EXISTS "user_access_admin_users" ON public.admin_users;
CREATE POLICY "user_access_admin_users" ON public.admin_users
  FOR ALL USING (
    user_id = auth.user_id() OR 
    EXISTS (
      SELECT 1 FROM public.admin_users sa 
      WHERE sa.user_id = auth.user_id() 
      AND sa.role = 'super_admin' 
      AND sa.is_active = true
    )
  ); 