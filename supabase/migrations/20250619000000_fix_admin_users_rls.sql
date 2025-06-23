-- Function to get the current user's role without invoking RLS on admin_users
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search path
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM admin_users WHERE user_id = auth.uid();
  RETURN user_role;
END;
$$;

-- Drop the old, recursive policy
DROP POLICY IF EXISTS "user_access_admin_users" ON public.admin_users;

-- Create a new, non-recursive policy
CREATE POLICY "user_access_admin_users" ON public.admin_users
  FOR ALL USING (
    user_id = auth.uid() OR public.get_current_user_role() = 'super_admin'
  ); 