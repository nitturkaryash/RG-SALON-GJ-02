-- ===============================================
-- USER-BASED SCHEMA SETUP SCRIPT
-- Complete setup for multi-user salon management system
-- ===============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. UPDATE ADMIN_USERS TABLE WITH NEW STRUCTURE
-- ===============================================

-- Drop and recreate admin_users table with the new structure as specified
DROP TABLE IF EXISTS public.admin_users CASCADE;

CREATE TABLE public.admin_users (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE, -- Link to Supabase Auth users
  email character varying(255) NOT NULL UNIQUE,
  password character varying(255) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  gst_percentage text,
  hsn_code text,
  igst text,
  
  -- Foreign key constraint to auth.users
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ===============================================
-- 2. CORE SALON MANAGEMENT TABLES WITH USER_ID
-- ===============================================

-- Create or update core tables with user_id for multi-tenancy
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  notes text,
  total_spent numeric DEFAULT 0,
  pending_payment numeric DEFAULT 0,
  last_visit timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stylists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration integer NOT NULL, -- Duration in minutes
  price numeric NOT NULL,
  category text,
  type text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ===============================================
-- 3. INVENTORY MANAGEMENT TABLES WITH USER_ID
-- ===============================================

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  stock_quantity integer DEFAULT 0,
  category text,
  active boolean DEFAULT true,
  hsn_code text,
  unit text DEFAULT 'piece',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_purchases (
  purchase_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date timestamp NOT NULL DEFAULT NOW(),
  product_name text NOT NULL,
  hsn_code text,
  units text,
  purchase_invoice_number text,
  purchase_qty integer NOT NULL,
  mrp_incl_gst float,
  mrp_excl_gst float,
  discount_on_purchase_percentage float DEFAULT 0,
  gst_percentage float DEFAULT 18,
  purchase_taxable_value float,
  purchase_igst float DEFAULT 0,
  purchase_cgst float,
  purchase_sgst float,
  purchase_invoice_value_rs float,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- ===============================================
-- 4. POS SYSTEM TABLES WITH USER_ID
-- ===============================================

CREATE TABLE IF NOT EXISTS public.pos_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  client_name text,
  consumption_purpose text,
  consumption_notes text,
  total numeric NOT NULL DEFAULT 0,
  type text DEFAULT 'sale',
  is_salon_consumption boolean DEFAULT false,
  status text DEFAULT 'completed',
  payment_method text DEFAULT 'cash'
);

CREATE TABLE IF NOT EXISTS public.pos_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid,
  service_name text NOT NULL,
  service_type text DEFAULT 'service',
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  gst_percentage numeric DEFAULT 18,
  hsn_code text,
  created_at timestamp with time zone DEFAULT now(),
  pos_order_id uuid REFERENCES pos_orders(id)
);

-- ===============================================
-- 5. AUTHENTICATION AND HELPER FUNCTIONS
-- ===============================================

-- Create helper function to get current user ID
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid STABLE LANGUAGE SQL AS $$
  SELECT 
    COALESCE(
      auth.uid(),
      (current_setting('request.jwt.claims', true)::JSON->>'sub')::uuid
    );
$$;

-- Updated admin login function for new schema
CREATE OR REPLACE FUNCTION public.check_admin_login_with_user(email_input text, password_input text)
RETURNS TABLE(
  id integer,
  email text,
  user_id uuid,
  is_active boolean,
  gst_percentage text,
  hsn_code text,
  igst text
) 
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    au.id,
    au.email::text,
    au.user_id,
    au.is_active,
    au.gst_percentage,
    au.hsn_code,
    au.igst
  FROM public.admin_users au
  WHERE au.email = email_input 
    AND au.password = password_input
    AND au.is_active = true;
$$;

-- Function to create admin user with Supabase auth integration
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email text,
  admin_password text,
  gst_percentage_param text DEFAULT '18',
  hsn_code_param text DEFAULT '',
  igst_param text DEFAULT '0'
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
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

-- ===============================================
-- 6. ROW LEVEL SECURITY SETUP
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "user_access_admin_users" ON public.admin_users
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_clients" ON public.clients
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_stylists" ON public.stylists
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_services" ON public.services
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_products" ON public.products
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_inventory_purchases" ON public.inventory_purchases
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_pos_orders" ON public.pos_orders
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "user_access_pos_order_items" ON public.pos_order_items
  FOR ALL USING (user_id = auth.user_id());

-- ===============================================
-- 7. TRIGGERS FOR AUTOMATIC USER_ID ASSIGNMENT
-- ===============================================

-- Create trigger function to auto-set user_id
CREATE OR REPLACE FUNCTION public.set_user_id() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.user_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for all tables
CREATE TRIGGER set_user_id_admin_users BEFORE INSERT ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_clients BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_stylists BEFORE INSERT ON public.stylists
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_services BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_products BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_inventory_purchases BEFORE INSERT ON public.inventory_purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_pos_orders BEFORE INSERT ON public.pos_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_pos_order_items BEFORE INSERT ON public.pos_order_items
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- ===============================================
-- 8. CREATE PERFORMANCE INDEXES
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON public.stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_purchases_user_id ON public.inventory_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON public.pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_order_items_user_id ON public.pos_order_items(user_id);

-- ===============================================
-- 9. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '🎉 USER-BASED SCHEMA SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables Created/Updated:';
  RAISE NOTICE '   • admin_users (with user_id foreign key)';
  RAISE NOTICE '   • clients, stylists, services';
  RAISE NOTICE '   • products, inventory_purchases';
  RAISE NOTICE '   • pos_orders, pos_order_items';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security Features:';
  RAISE NOTICE '   • Row Level Security (RLS) enabled';
  RAISE NOTICE '   • User isolation policies created';
  RAISE NOTICE '   • Automatic user_id assignment triggers';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Performance:';
  RAISE NOTICE '   • Indexes created for all user_id columns';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 New Supabase Credentials:';
  RAISE NOTICE '   URL: https://mlwlhrewrhcjfyqicjvn.supabase.co';
  RAISE NOTICE '   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '   1. Create users in Supabase Auth';
  RAISE NOTICE '   2. Link admin_users records to auth.users';
  RAISE NOTICE '   3. Test user isolation';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for Multi-User Environment!';
END $$; 