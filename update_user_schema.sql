-- Update database schema to remove admin functionality and create user-focused authentication

-- 1. Create new user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user')),
    salon_name VARCHAR(255),
    gst_percentage VARCHAR(10) DEFAULT '18',
    hsn_code VARCHAR(50),
    igst VARCHAR(10) DEFAULT '0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for user_profiles (users can only access their own data)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Migrate existing data from admin_users to user_profiles (if admin_users exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        -- Migrate salon owners to user profiles
        INSERT INTO user_profiles (user_id, email, is_active, role, salon_name, gst_percentage, hsn_code, igst, created_at)
        SELECT 
            user_id::UUID, 
            email, 
            is_active, 
            'user' as role,  -- Convert all users to 'user' role
            salon_name, 
            gst_percentage, 
            hsn_code, 
            igst, 
            created_at
        FROM admin_users 
        WHERE role = 'salon_owner'
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Migrated salon owners from admin_users to user_profiles';
    ELSE
        RAISE NOTICE 'admin_users table does not exist, skipping migration';
    END IF;
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- 6. Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Update existing tables to ensure they have proper RLS and user_id columns
-- This ensures all data is properly scoped to users

-- Update appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Update clients table  
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Update stylists table
ALTER TABLE stylists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON stylists(user_id);

-- Update services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);

-- Update products/inventory tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Update orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 8. Create or update RLS policies for all user tables
-- These policies ensure users can only access their own data

-- Appointments policies
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Stylists policies
DROP POLICY IF EXISTS "Users can view own stylists" ON stylists;
DROP POLICY IF EXISTS "Users can insert own stylists" ON stylists;
DROP POLICY IF EXISTS "Users can update own stylists" ON stylists;
DROP POLICY IF EXISTS "Users can delete own stylists" ON stylists;

ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stylists" ON stylists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stylists" ON stylists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stylists" ON stylists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stylists" ON stylists
    FOR DELETE USING (auth.uid() = user_id);

-- Services policies
DROP POLICY IF EXISTS "Users can view own services" ON services;
DROP POLICY IF EXISTS "Users can insert own services" ON services;
DROP POLICY IF EXISTS "Users can update own services" ON services;
DROP POLICY IF EXISTS "Users can delete own services" ON services;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own services" ON services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" ON services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON services
    FOR DELETE USING (auth.uid() = user_id);

-- Products policies
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON orders
    FOR DELETE USING (auth.uid() = user_id);

-- 9. Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SEQUENCE user_profiles_id_seq TO authenticated;

-- 10. Create a function to automatically set user_id for new records
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create triggers to automatically set user_id on insert
CREATE TRIGGER set_user_id_trigger_appointments
    BEFORE INSERT ON appointments
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_trigger_clients
    BEFORE INSERT ON clients
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_trigger_stylists
    BEFORE INSERT ON stylists
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_trigger_services
    BEFORE INSERT ON services
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_trigger_products
    BEFORE INSERT ON products
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_trigger_orders
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION set_user_id();

-- 12. Drop admin_users table after migration (optional - uncomment if you want to remove it)
-- DROP TABLE IF EXISTS admin_users CASCADE;

RAISE NOTICE 'User-focused authentication schema migration completed successfully!'; 