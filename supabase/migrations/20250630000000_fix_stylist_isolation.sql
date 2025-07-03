-- Disable RLS temporarily to make changes
ALTER TABLE stylists DISABLE ROW LEVEL SECURITY;

-- Ensure user_id column exists and is properly typed
ALTER TABLE stylists DROP CONSTRAINT IF EXISTS stylists_user_id_fkey;
ALTER TABLE stylists ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE stylists ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint to auth.users
ALTER TABLE stylists
ADD CONSTRAINT stylists_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON stylists(user_id);

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "user_access_stylists" ON stylists;
DROP POLICY IF EXISTS "Users can view own stylists" ON stylists;
DROP POLICY IF EXISTS "Users can insert own stylists" ON stylists;
DROP POLICY IF EXISTS "Users can update own stylists" ON stylists;
DROP POLICY IF EXISTS "Users can delete own stylists" ON stylists;
DROP POLICY IF EXISTS "Allow authenticated users to view stylists" ON stylists;
DROP POLICY IF EXISTS "strict_user_isolation_policy" ON stylists;

-- Create new unified policies
CREATE POLICY "stylist_isolation_select" ON stylists 
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "stylist_isolation_insert" ON stylists 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "stylist_isolation_update" ON stylists 
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "stylist_isolation_delete" ON stylists 
    FOR DELETE 
    USING (user_id = auth.uid());

-- Create or replace trigger to automatically set user_id
CREATE OR REPLACE FUNCTION public.set_stylist_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_stylist_user_id_trigger ON stylists;
CREATE TRIGGER set_stylist_user_id_trigger
    BEFORE INSERT ON stylists
    FOR EACH ROW
    EXECUTE FUNCTION public.set_stylist_user_id();

-- Re-enable RLS
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;

-- Fix members table to use profiles instead of clients
BEGIN;

-- First drop the existing foreign key constraint on client_id
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_client_id_fkey;

-- Rename client_id to profile_id and update its reference
ALTER TABLE public.members RENAME COLUMN client_id TO profile_id;
ALTER TABLE public.members ADD CONSTRAINT members_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id column nullable (temporarily needed during transition)
ALTER TABLE public.members ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policy
DROP POLICY IF EXISTS "user_access_members" ON public.members;

-- Create new RLS policy that allows access based on profile_id
CREATE POLICY "user_access_members" ON public.members
  FOR ALL USING (
    profile_id = auth.uid() OR 
    user_id = auth.uid() OR
    (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'isAdmin' = 'true'))
  );

-- Create a trigger to set user_id from profile_id
CREATE OR REPLACE FUNCTION public.set_member_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Set user_id same as profile_id since they both reference auth.users
  NEW.user_id := NEW.profile_id;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS set_user_id_members ON public.members;
DROP TRIGGER IF EXISTS set_member_user_id ON public.members;

-- Create new trigger
CREATE TRIGGER set_member_user_id
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_member_user_id();

-- Update existing records to have matching user_id and profile_id
UPDATE public.members SET user_id = profile_id WHERE user_id IS NULL;

-- Add NOT NULL constraint back to user_id after data is fixed
ALTER TABLE public.members ALTER COLUMN user_id SET NOT NULL;

-- Recreate the index on profile_id
DROP INDEX IF EXISTS idx_members_client_id;
CREATE INDEX IF NOT EXISTS idx_members_profile_id ON public.members(profile_id);

COMMIT; 