-- Disable RLS temporarily
ALTER TABLE stylists DISABLE ROW LEVEL SECURITY;

-- Drop existing foreign key if it exists
ALTER TABLE stylists DROP CONSTRAINT IF EXISTS stylists_user_id_fkey;

-- Update any NULL or invalid user_ids to reference a valid profile
DO $$
DECLARE
    default_profile_id uuid;
BEGIN
    -- Get a default profile ID
    SELECT id INTO default_profile_id FROM profiles LIMIT 1;

    -- Update any NULL or invalid user_ids
    UPDATE stylists s
    SET user_id = default_profile_id
    WHERE user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = s.user_id
    );
END $$;

-- Add correct foreign key to profiles table
ALTER TABLE stylists
ADD CONSTRAINT stylists_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists
DROP POLICY IF EXISTS strict_user_isolation_policy ON stylists;

-- Create the policy
CREATE POLICY strict_user_isolation_policy ON stylists
FOR ALL
TO authenticated
USING (
    user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
)
WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
); 