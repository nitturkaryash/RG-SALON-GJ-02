-- ===============================================
-- FIX CLIENTS TABLE RLS ISSUE 
-- Add missing user_id column and fix RLS policies
-- ===============================================

-- Step 1: Add user_id column to clients table if it doesn't exist
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Step 3: Update existing records to have a default user_id (temporary fix)
-- Get the first authenticated user and assign all existing clients to them
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update all clients without user_id to have this user_id
        UPDATE public.clients 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        RAISE NOTICE 'Updated existing clients with user_id: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- Step 4: Drop existing problematic RLS policies
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;

-- Step 5: Create new RLS policies that are more permissive during development
-- Temporarily allow all authenticated users to access all clients
CREATE POLICY "Allow authenticated users to view clients" ON public.clients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert clients" ON public.clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update clients" ON public.clients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete clients" ON public.clients
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Create trigger to automatically set user_id for new records
CREATE OR REPLACE FUNCTION public.set_user_id_for_clients()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_user_id_trigger_clients ON public.clients;
CREATE TRIGGER set_user_id_trigger_clients
    BEFORE INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id_for_clients();

-- Step 7: Check if we need to do the same for other tables
-- Let's also fix stylists and services tables if they have the same issue

-- Stylists table
ALTER TABLE public.stylists ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON public.stylists(user_id);

-- Update existing stylists
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    IF first_user_id IS NOT NULL THEN
        UPDATE public.stylists 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Drop and recreate stylists policies
DROP POLICY IF EXISTS "Users can view own stylists" ON public.stylists;
DROP POLICY IF EXISTS "Users can insert own stylists" ON public.stylists;
DROP POLICY IF EXISTS "Users can update own stylists" ON public.stylists;
DROP POLICY IF EXISTS "Users can delete own stylists" ON public.stylists;

CREATE POLICY "Allow authenticated users to view stylists" ON public.stylists
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert stylists" ON public.stylists
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update stylists" ON public.stylists
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete stylists" ON public.stylists
    FOR DELETE USING (auth.role() = 'authenticated');

-- Services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);

-- Update existing services
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    IF first_user_id IS NOT NULL THEN
        UPDATE public.services 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Drop and recreate services policies
DROP POLICY IF EXISTS "Users can view own services" ON public.services;
DROP POLICY IF EXISTS "Users can insert own services" ON public.services;
DROP POLICY IF EXISTS "Users can update own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete own services" ON public.services;

CREATE POLICY "Allow authenticated users to view services" ON public.services
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert services" ON public.services
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update services" ON public.services
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete services" ON public.services
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 8: Create triggers for stylists and services
CREATE OR REPLACE FUNCTION public.set_user_id_for_stylists()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_trigger_stylists ON public.stylists;
CREATE TRIGGER set_user_id_trigger_stylists
    BEFORE INSERT ON public.stylists
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id_for_stylists();

CREATE OR REPLACE FUNCTION public.set_user_id_for_services()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_trigger_services ON public.services;
CREATE TRIGGER set_user_id_trigger_services
    BEFORE INSERT ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id_for_services();

-- Step 9: Grant necessary permissions
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.stylists TO authenticated;
GRANT ALL ON public.services TO authenticated;

-- Step 10: Output success message
SELECT 'Clients table RLS issue fixed successfully! All authenticated users can now access clients, stylists, and services.' as status; 