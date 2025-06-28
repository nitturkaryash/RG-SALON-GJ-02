-- ===============================================
-- USER-BASED SCHEMA MIGRATION
-- Implementing multi-tenant architecture using user_id
-- ===============================================

BEGIN;

-- Step 1: Update admin_users table to include user_id foreign key
-- First, let's ensure the admin_users table has the new structure
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE,
ADD COLUMN IF NOT EXISTS gst_percentage text,
ADD COLUMN IF NOT EXISTS hsn_code text,
ADD COLUMN IF NOT EXISTS igst text;

-- Add foreign key constraint to auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admin_users_user_id_fkey'
    ) THEN
        ALTER TABLE public.admin_users 
        ADD CONSTRAINT admin_users_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Add user_id column to all relevant tables
-- Core business tables
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stylists ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Product and inventory tables
ALTER TABLE public.product_master ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_purchases ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_sales_new ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_salon_consumption ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- POS and sales tables
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.pos_order_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Additional tables
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.membership_tiers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.loyalty_points ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Stock and transaction tables
ALTER TABLE public.product_stock_transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.balance_stock_transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.stock_reductions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Other important tables
ALTER TABLE public.consumption ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.expired_products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Create helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid STABLE LANGUAGE SQL AS $$
  SELECT 
    COALESCE(
      auth.uid(),
      (current_setting('request.jwt.claims', true)::JSON->>'sub')::uuid
    );
$$;

-- Step 4: Enable Row Level Security on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sales_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_salon_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expired_products ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for user isolation
-- Admin users policy
DROP POLICY IF EXISTS "user_access_admin_users" ON public.admin_users;
CREATE POLICY "user_access_admin_users" ON public.admin_users
  FOR ALL USING (user_id = auth.user_id());

-- Appointments policy
DROP POLICY IF EXISTS "user_access_appointments" ON public.appointments;
CREATE POLICY "user_access_appointments" ON public.appointments
  FOR ALL USING (user_id = auth.user_id());

-- Clients policy
DROP POLICY IF EXISTS "user_access_clients" ON public.clients;
CREATE POLICY "user_access_clients" ON public.clients
  FOR ALL USING (user_id = auth.user_id());

-- Stylists policy
DROP POLICY IF EXISTS "user_access_stylists" ON public.stylists;
CREATE POLICY "user_access_stylists" ON public.stylists
  FOR ALL USING (user_id = auth.user_id());

-- Services policy
DROP POLICY IF EXISTS "user_access_services" ON public.services;
CREATE POLICY "user_access_services" ON public.services
  FOR ALL USING (user_id = auth.user_id());

-- Product master policy
DROP POLICY IF EXISTS "user_access_product_master" ON public.product_master;
CREATE POLICY "user_access_product_master" ON public.product_master
  FOR ALL USING (user_id = auth.user_id());

-- Inventory purchases policy
DROP POLICY IF EXISTS "user_access_inventory_purchases" ON public.inventory_purchases;
CREATE POLICY "user_access_inventory_purchases" ON public.inventory_purchases
  FOR ALL USING (user_id = auth.user_id());

-- Inventory sales policy
DROP POLICY IF EXISTS "user_access_inventory_sales_new" ON public.inventory_sales_new;
CREATE POLICY "user_access_inventory_sales_new" ON public.inventory_sales_new
  FOR ALL USING (user_id = auth.user_id());

-- Inventory salon consumption policy
DROP POLICY IF EXISTS "user_access_inventory_salon_consumption" ON public.inventory_salon_consumption;
CREATE POLICY "user_access_inventory_salon_consumption" ON public.inventory_salon_consumption
  FOR ALL USING (user_id = auth.user_id());

-- POS orders policy
DROP POLICY IF EXISTS "user_access_pos_orders" ON public.pos_orders;
CREATE POLICY "user_access_pos_orders" ON public.pos_orders
  FOR ALL USING (user_id = auth.user_id());

-- POS order items policy
DROP POLICY IF EXISTS "user_access_pos_order_items" ON public.pos_order_items;
CREATE POLICY "user_access_pos_order_items" ON public.pos_order_items
  FOR ALL USING (user_id = auth.user_id());

-- Sales products policy
DROP POLICY IF EXISTS "user_access_sales_products" ON public.sales_products;
CREATE POLICY "user_access_sales_products" ON public.sales_products
  FOR ALL USING (user_id = auth.user_id());

-- Members policy
DROP POLICY IF EXISTS "user_access_members" ON public.members;
CREATE POLICY "user_access_members" ON public.members
  FOR ALL USING (user_id = auth.user_id());

-- Membership tiers policy
DROP POLICY IF EXISTS "user_access_membership_tiers" ON public.membership_tiers;
CREATE POLICY "user_access_membership_tiers" ON public.membership_tiers
  FOR ALL USING (user_id = auth.user_id());

-- Loyalty points policy
DROP POLICY IF EXISTS "user_access_loyalty_points" ON public.loyalty_points;
CREATE POLICY "user_access_loyalty_points" ON public.loyalty_points
  FOR ALL USING (user_id = auth.user_id());

-- Product stock transactions policy
DROP POLICY IF EXISTS "user_access_product_stock_transactions" ON public.product_stock_transactions;
CREATE POLICY "user_access_product_stock_transactions" ON public.product_stock_transactions
  FOR ALL USING (user_id = auth.user_id());

-- Balance stock transactions policy
DROP POLICY IF EXISTS "user_access_balance_stock_transactions" ON public.balance_stock_transactions;
CREATE POLICY "user_access_balance_stock_transactions" ON public.balance_stock_transactions
  FOR ALL USING (user_id = auth.user_id());

-- Stock reductions policy
DROP POLICY IF EXISTS "user_access_stock_reductions" ON public.stock_reductions;
CREATE POLICY "user_access_stock_reductions" ON public.stock_reductions
  FOR ALL USING (user_id = auth.user_id());

-- Consumption policy
DROP POLICY IF EXISTS "user_access_consumption" ON public.consumption;
CREATE POLICY "user_access_consumption" ON public.consumption
  FOR ALL USING (user_id = auth.user_id());

-- Expired products policy
DROP POLICY IF EXISTS "user_access_expired_products" ON public.expired_products;
CREATE POLICY "user_access_expired_products" ON public.expired_products
  FOR ALL USING (user_id = auth.user_id());

-- Step 6: Create function to auto-set user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.user_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Step 7: Create triggers for all tables to auto-set user_id
DROP TRIGGER IF EXISTS set_user_id_admin_users ON public.admin_users;
CREATE TRIGGER set_user_id_admin_users BEFORE INSERT ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_appointments ON public.appointments;
CREATE TRIGGER set_user_id_appointments BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_clients ON public.clients;
CREATE TRIGGER set_user_id_clients BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_stylists ON public.stylists;
CREATE TRIGGER set_user_id_stylists BEFORE INSERT ON public.stylists
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_services ON public.services;
CREATE TRIGGER set_user_id_services BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_product_master ON public.product_master;
CREATE TRIGGER set_user_id_product_master BEFORE INSERT ON public.product_master
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_inventory_purchases ON public.inventory_purchases;
CREATE TRIGGER set_user_id_inventory_purchases BEFORE INSERT ON public.inventory_purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_inventory_sales_new ON public.inventory_sales_new;
CREATE TRIGGER set_user_id_inventory_sales_new BEFORE INSERT ON public.inventory_sales_new
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_inventory_salon_consumption ON public.inventory_salon_consumption;
CREATE TRIGGER set_user_id_inventory_salon_consumption BEFORE INSERT ON public.inventory_salon_consumption
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_pos_orders ON public.pos_orders;
CREATE TRIGGER set_user_id_pos_orders BEFORE INSERT ON public.pos_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_pos_order_items ON public.pos_order_items;
CREATE TRIGGER set_user_id_pos_order_items BEFORE INSERT ON public.pos_order_items
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_sales_products ON public.sales_products;
CREATE TRIGGER set_user_id_sales_products BEFORE INSERT ON public.sales_products
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_members ON public.members;
CREATE TRIGGER set_user_id_members BEFORE INSERT ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_membership_tiers ON public.membership_tiers;
CREATE TRIGGER set_user_id_membership_tiers BEFORE INSERT ON public.membership_tiers
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_loyalty_points ON public.loyalty_points;
CREATE TRIGGER set_user_id_loyalty_points BEFORE INSERT ON public.loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_product_stock_transactions ON public.product_stock_transactions;
CREATE TRIGGER set_user_id_product_stock_transactions BEFORE INSERT ON public.product_stock_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_balance_stock_transactions ON public.balance_stock_transactions;
CREATE TRIGGER set_user_id_balance_stock_transactions BEFORE INSERT ON public.balance_stock_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_stock_reductions ON public.stock_reductions;
CREATE TRIGGER set_user_id_stock_reductions BEFORE INSERT ON public.stock_reductions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_consumption ON public.consumption;
CREATE TRIGGER set_user_id_consumption BEFORE INSERT ON public.consumption
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_expired_products ON public.expired_products;
CREATE TRIGGER set_user_id_expired_products BEFORE INSERT ON public.expired_products
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON public.stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_product_master_user_id ON public.product_master(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_user_id ON public.inventory_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sales_new_user_id ON public.inventory_sales_new(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_salon_consumption_user_id ON public.inventory_salon_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON public.pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_order_items_user_id ON public.pos_order_items(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_products_user_id ON public.sales_products(user_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_tiers_user_id ON public.membership_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_transactions_user_id ON public.product_stock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_stock_transactions_user_id ON public.balance_stock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_reductions_user_id ON public.stock_reductions(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_user_id ON public.consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_expired_products_user_id ON public.expired_products(user_id);

-- Step 9: Create function to create new admin user with tenant setup
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email text,
  admin_password text,
  gst_percentage_param text DEFAULT NULL,
  hsn_code_param text DEFAULT NULL,
  igst_param text DEFAULT NULL
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- This function should be called after creating a user in Supabase Auth
  -- Get the current authenticated user ID
  new_user_id := auth.user_id();
  
  IF new_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'No authenticated user found');
  END IF;
  
  -- Insert into admin_users table
  INSERT INTO public.admin_users (
    user_id,
    email,
    password,
    is_active,
    gst_percentage,
    hsn_code,
    igst
  ) VALUES (
    new_user_id,
    admin_email,
    admin_password,
    true,
    gst_percentage_param,
    hsn_code_param,
    igst_param
  );
  
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', admin_email,
    'message', 'Admin user created successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User-based schema migration completed successfully!';
  RAISE NOTICE '🔑 All tables now have user_id columns with proper RLS policies';
  RAISE NOTICE '🛡️ Row Level Security enabled for data isolation';
  RAISE NOTICE '⚡ Triggers created for automatic user_id assignment';
  RAISE NOTICE '📊 Performance indexes created';
  RAISE NOTICE '🎯 Ready for multi-user environment';
END $$; 