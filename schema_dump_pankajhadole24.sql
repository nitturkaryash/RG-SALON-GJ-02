-- =====================================================
-- Schema Dump for pankajhadole24@gmail.com Project
-- Project ID: mtyudylsozncvilibxda
-- Generated: 2024-12-19
-- =====================================================

-- Core Tables
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    auth_user_id uuid REFERENCES auth(id),
    full_name text,
    avatar_url text,
    email text,
    username text,
    phone_number text,
    whatsapp_number text,
    role text DEFAULT 'user',
    is_active boolean DEFAULT true,
    organization_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.product_master (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10,2),
    stock_quantity integer DEFAULT 0,
    category text,
    active boolean DEFAULT true,
    hsn_code text,
    units text,
    mrp_incl_gst numeric(10,2),
    mrp_excl_gst numeric(10,2),
    gst_percentage numeric(5,2),
    sku text,
    product_type text,
    "Purchase_Cost/Unit(Ex.GST)" numeric(10,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id)
);

CREATE TABLE public.pos_orders (
    id uuid PRIMARY KEY,
    client_name text,
    customer_name text,
    stylist_id uuid,
    stylist_name text,
    total numeric(10,2) NOT NULL,
    subtotal numeric(10,2),
    tax numeric(10,2),
    discount numeric(10,2) DEFAULT 0,
    payment_method text,
    status text DEFAULT 'completed',
    is_walk_in boolean DEFAULT false,
    is_split_payment boolean DEFAULT false,
    pending_amount numeric(10,2) DEFAULT 0,
    services jsonb,
    date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    type text DEFAULT 'sale',
    source text DEFAULT 'pos',
    is_salon_consumption boolean DEFAULT false,
    consumption_purpose text,
    consumption_notes text,
    current_stock jsonb,
    stock_snapshot jsonb,
    user_id uuid REFERENCES profiles(id),
    tenant_id text
);

CREATE TABLE public.product_stock_transactions (
    id uuid PRIMARY KEY,
    product_id uuid REFERENCES product_master(id),
    transaction_type text NOT NULL,
    quantity integer NOT NULL,
    previous_stock integer,
    new_stock integer,
    order_id uuid REFERENCES pos_orders(id),
    notes text,
    created_at timestamptz DEFAULT now(),
    display_type text,
    source_type text,
    source text,
    reference_id uuid,
    duplicate_protection_key text UNIQUE,
    user_id uuid REFERENCES profiles(id),
    created_by uuid,
    created_at_tz timestamptz
);

CREATE TABLE public.clients (
    id uuid PRIMARY KEY,
    full_name text NOT NULL,
    email text,
    phone text,
    address text,
    total_spent numeric(10,2) DEFAULT 0,
    loyalty_points integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id)
);

CREATE TABLE public.stylists (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text,
    specialization text,
    commission_percentage numeric(5,2),
    available boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id)
);

-- Key Functions
CREATE OR REPLACE FUNCTION get_current_profile_id() RETURNS uuid AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
DECLARE
  _role text;
  _is_active boolean;
  _username text;
  _full_name text;
BEGIN
  _role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  _is_active := COALESCE((new.raw_user_meta_data->>'is_active')::boolean, true);
  _full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  _username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  IF EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = new.id) THEN
    RETURN new;
  END IF;

  INSERT INTO public.profiles (
    id, auth_user_id, full_name, avatar_url, email, username,
    phone_number, whatsapp_number, role, is_active, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new.id, _full_name, new.raw_user_meta_data->>'avatar_url',
    new.email, _username, new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'whatsapp_number', _role, _is_active, now(), now()
  );
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Key Views
CREATE VIEW public.product_stock_transaction_history AS
SELECT t.id,
       to_char(((t.created_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Kolkata'::text), 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS "Date",
       p.name AS "Product Name",
       p.hsn_code AS "HSN Code",
       'pcs'::text AS "Units",
       CASE
           WHEN (lower((COALESCE(t.source, ''::character varying))::text) = 'purchase'::text) THEN 'addition'::character varying
           WHEN ((t.display_type)::text = 'reduction'::text) THEN 'reduction'::character varying
           WHEN ((t.display_type)::text = 'addition'::text) THEN 'addition'::character varying
           WHEN (t.display_type IS NOT NULL) THEN t.display_type
           ELSE t.transaction_type
       END AS "Change Type",
       COALESCE(t.source, 'inventory_update'::character varying) AS "Source",
       COALESCE((o.id)::text, '-'::text) AS "Reference ID",
       t.quantity AS "Quantity Change",
       t.new_stock AS "Quantity After Change"
FROM ((product_stock_transactions t
       LEFT JOIN product_master p ON ((t.product_id = p.id)))
       LEFT JOIN pos_orders o ON ((t.order_id = o.id)))
ORDER BY t.created_at DESC;

-- Triggers
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_created_at ON pos_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_product_stock_transactions_product_id ON product_stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);

-- RLS Policies
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON pos_orders
    FOR SELECT USING (user_id = get_current_profile_id());

CREATE POLICY "Users can insert their own orders" ON pos_orders
    FOR INSERT WITH CHECK (user_id = get_current_profile_id());

CREATE POLICY "Users can view their own products" ON product_master
    FOR SELECT USING (user_id = get_current_profile_id());

CREATE POLICY "Users can insert their own products" ON product_master
    FOR INSERT WITH CHECK (user_id = get_current_profile_id()); 