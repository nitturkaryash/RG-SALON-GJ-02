-- Create a function to fix the stylists table with elevated privileges
CREATE OR REPLACE FUNCTION fix_stylists_user_id_mapping()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Disable RLS temporarily
    ALTER TABLE stylists DISABLE ROW LEVEL SECURITY;

    -- Drop existing foreign key if it exists
    ALTER TABLE stylists DROP CONSTRAINT IF EXISTS stylists_user_id_fkey;

    -- Update the specific user_id we know about
    UPDATE stylists
    SET user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    WHERE user_id = 'e8cf4c8a-89c3-4c53-968d-25b06811665f';

    -- Add the foreign key constraint
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
END;
$$;

-- Execute the function
SELECT fix_stylists_user_id_mapping(); 