-- ===========================================================================
-- SUPABASE DATABASE SCHEMA BACKUP
-- Generated on: 2024-06-29
-- Project: Salon_Software_for_all (mlwlhrewrhcjfyqicjvn)
-- 
-- This file contains the complete schema backup including:
-- - Table definitions with all columns and constraints
-- - Foreign key relationships
-- - Indexes
-- - Functions and triggers
-- - Row Level Security (RLS) policies
-- ===========================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- ===========================================================================
-- TABLES
-- ===========================================================================

-- Active Sessions Table
CREATE TABLE public.active_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid,
    started_at timestamp with time zone DEFAULT now(),
    last_active timestamp with time zone DEFAULT now(),
    ip_address text,
    user_agent text,
    is_active boolean DEFAULT true,
    device_type text,
    browser text,
    actions_count integer DEFAULT 0,
    session_duration integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Admin Users Table
CREATE TABLE public.admin_users (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL,
    email character varying NOT NULL UNIQUE,
    password character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    gst_percentage text,
    hsn_code text,
    igst text,
    role text DEFAULT 'salon_owner'::text,
    salon_name text
);

-- Auth Table
CREATE TABLE public.auth (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    username character varying NOT NULL UNIQUE,
    password_hash character varying NOT NULL,
    email character varying,
    role character varying DEFAULT 'admin'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    is_active boolean DEFAULT true
);

-- Clients Table
CREATE TABLE public.clients (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_visit timestamp with time zone,
    notes text,
    total_spent numeric DEFAULT 0,
    pending_payment numeric DEFAULT 0,
    mobile_number character varying DEFAULT ''::character varying NOT NULL,
    gender text,
    birth_date date,
    anniversary_date date,
    appointment_count integer DEFAULT 0
);

-- Stylists Table
CREATE TABLE public.stylists (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    bio text,
    gender text,
    available boolean DEFAULT true,
    image_url text,
    specialties text[] DEFAULT '{}'::text[],
    breaks jsonb DEFAULT '[]'::jsonb,
    holidays jsonb DEFAULT '[]'::jsonb
);

-- Services Collections Table
CREATE TABLE public.service_collections (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Service Subcollections Table
CREATE TABLE public.service_subcollections (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    collection_id uuid,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Services Table
CREATE TABLE public.services (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    duration integer NOT NULL,
    collection_id uuid,
    type text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subcollection_id uuid,
    gender text,
    membership_eligible boolean DEFAULT true
);

-- Appointments Table
CREATE TABLE public.appointments (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    client_id uuid,
    stylist_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text,
    notes text,
    paid boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    billed boolean DEFAULT false,
    stylist_ids uuid[],
    service_ids uuid[] DEFAULT ARRAY[]::uuid[] NOT NULL,
    service_id uuid,
    reminder_sent boolean DEFAULT false,
    is_for_someone_else boolean DEFAULT false NOT NULL,
    reminder_24h_sent boolean DEFAULT false,
    reminder_2h_sent boolean DEFAULT false,
    booking_id uuid,
    checked_in boolean DEFAULT false,
    booker_name text,
    booker_phone text,
    booker_email text
);

-- Appointment Services Table
CREATE TABLE public.appointment_services (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    service_id uuid NOT NULL,
    client_id uuid,
    start_time time without time zone,
    end_time time without time zone,
    stylist_id uuid,
    sequence_order integer,
    CONSTRAINT appointment_services_unique_expert_service UNIQUE (appointment_id, service_id, stylist_id)
);

-- Appointment Stylists Table
CREATE TABLE public.appointment_stylists (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    appointment_id uuid,
    stylist_id uuid,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    client_id uuid,
    CONSTRAINT appointment_stylists_appointment_id_stylist_id_key UNIQUE (appointment_id, stylist_id)
);

-- Appointment Clients Table
CREATE TABLE public.appointment_clients (
    appointment_id uuid NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (client_id, appointment_id)
);

-- Product Collections Table
CREATE TABLE public.product_collections (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);

-- Product Master Table
CREATE TABLE public.product_master (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    stock_quantity integer DEFAULT 0,
    category text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    collection_id uuid,
    hsn_code text,
    units text,
    mrp_incl_gst numeric,
    mrp_excl_gst numeric,
    gst_percentage integer DEFAULT 18,
    sku text,
    product_type text,
    "Purchase_Cost/Unit(Ex.GST)" numeric,
    user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);

-- Products Table (Legacy)
CREATE TABLE public.products (
    id uuid,
    name text,
    description text,
    price numeric,
    stock_quantity integer,
    category text,
    active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    collection_id uuid,
    hsn_code text,
    units text,
    mrp_incl_gst numeric,
    mrp_excl_gst numeric,
    sku text,
    product_type text,
    "Purchase_Cost/Unit(Ex.GST)" numeric,
    user_id uuid
);

-- Product Stock Transactions Table
CREATE TABLE public.product_stock_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    product_id uuid,
    transaction_type character varying NOT NULL,
    quantity integer NOT NULL,
    previous_stock integer,
    new_stock integer,
    order_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    display_type character varying,
    source_type character varying,
    source character varying,
    duplicate_protection_key text UNIQUE,
    created_at_tz timestamp with time zone,
    user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);

-- Product Stock Transaction History Table
CREATE TABLE public.product_stock_transaction_history (
    id uuid,
    "Date" date,
    "Product" text,
    "Type" character varying,
    "Quantity" integer,
    "Previous_Stock" integer,
    "New_Stock" integer,
    "Notes" text,
    user_id uuid
);

-- POS Orders Table
CREATE TABLE public.pos_orders (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    client_name text,
    consumption_purpose text,
    consumption_notes text,
    total numeric DEFAULT 0 NOT NULL,
    type text DEFAULT 'sale'::text,
    is_salon_consumption boolean,
    status text DEFAULT 'completed'::text,
    payment_method text DEFAULT 'cash'::text,
    stylist_id text,
    services jsonb,
    subtotal double precision,
    tax double precision,
    discount double precision,
    is_walk_in boolean,
    payments jsonb,
    pending_amount double precision,
    is_split_payment boolean,
    appointment_id text,
    is_salon_purchase boolean,
    stylist_name text,
    customer_name text,
    date timestamp with time zone DEFAULT now(),
    total_amount numeric DEFAULT 0,
    appointment_time timestamp with time zone,
    discount_percentage numeric DEFAULT 0,
    requisition_voucher_no text,
    stock_snapshot jsonb DEFAULT '{}'::jsonb,
    current_stock text,
    multi_expert_group_id uuid,
    multi_expert boolean DEFAULT false,
    total_experts integer DEFAULT 1,
    expert_index integer DEFAULT 1
);

-- POS Order Items Table
CREATE TABLE public.pos_order_items (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    service_id uuid,
    service_name text NOT NULL,
    service_type text DEFAULT 'service'::text,
    price numeric NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    gst_percentage numeric DEFAULT 18,
    hsn_code text,
    created_at timestamp with time zone DEFAULT now(),
    pos_order_id uuid,
    order_id text,
    product_id text,
    product_name text,
    unit_price numeric,
    total_price numeric,
    type text DEFAULT 'product'::text
);

-- Membership Tiers Table
CREATE TABLE public.membership_tiers (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL,
    duration_months integer NOT NULL,
    benefits text[] DEFAULT '{}'::text[],
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Members Table
CREATE TABLE public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    client_name text NOT NULL,
    tier_id uuid NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    expires_at date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_balance numeric DEFAULT 0 NOT NULL,
    total_membership_amount numeric DEFAULT 0 NOT NULL,
    benefit_amount numeric DEFAULT 0
);

-- Stylist Holidays Table
CREATE TABLE public.stylist_holidays (
    id uuid NOT NULL PRIMARY KEY,
    stylist_id uuid,
    holiday_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);

-- Breaks Table
CREATE TABLE public.breaks (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    stylist_id uuid,
    break_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    email character varying NOT NULL UNIQUE,
    full_name character varying,
    phone_number character varying,
    whatsapp_number character varying,
    role character varying DEFAULT 'user'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    auth_user_id uuid DEFAULT auth.uid() NOT NULL UNIQUE,
    username character varying,
    avatar_url text,
    metadata jsonb
);

-- User Profiles Table
CREATE TABLE public.user_profiles (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid,
    email character varying NOT NULL,
    is_active boolean DEFAULT true,
    role character varying DEFAULT 'user'::character varying,
    salon_name character varying,
    gst_percentage character varying DEFAULT '18'::character varying,
    hsn_code character varying,
    igst character varying DEFAULT '0'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    username character varying UNIQUE
);

-- Purchase History with Stock Table
CREATE TABLE public.purchase_history_with_stock (
    purchase_id text,
    product_id text,
    date date,
    product_name text,
    hsn_code text,
    units text,
    purchase_invoice_number text,
    purchase_qty integer,
    mrp_incl_gst numeric,
    mrp_excl_gst numeric,
    discount_on_purchase_percentage integer,
    gst_percentage integer,
    purchase_taxable_value numeric,
    purchase_igst numeric,
    purchase_cgst numeric,
    purchase_sgst numeric,
    purchase_invoice_value_rs numeric,
    supplier text,
    current_stock_at_purchase integer,
    computed_stock_taxable_value numeric,
    computed_stock_cgst numeric,
    computed_stock_sgst numeric,
    computed_stock_igst numeric,
    computed_stock_total_value numeric,
    "Purchase_Cost/Unit(Ex.GST)" numeric,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    transaction_type text,
    user_id uuid
);

-- Sales History Final Table
CREATE TABLE public.sales_history_final (
    id uuid,
    date date,
    product_name text,
    hsn_code text,
    quantity integer,
    selling_price numeric,
    total_amount numeric,
    gst_percentage numeric,
    order_id text,
    stylist_name text,
    customer_name text,
    user_id uuid
);

-- Salon Consumption New Table
CREATE TABLE public.salon_consumption_new (
    id uuid,
    "Date" date,
    "Product" text,
    "Quantity" integer,
    "Units" text,
    "Purpose" text,
    user_id uuid
);

-- Backup Schedules Table
CREATE TABLE public.backup_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    client_id uuid UNIQUE,
    frequency text,
    time time without time zone NOT NULL,
    backup_type text,
    storage_type text,
    last_run timestamp with time zone,
    next_run timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Backups Table
CREATE TABLE public.backups (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    client_id uuid,
    table_name text NOT NULL,
    backup_type text,
    status text,
    restore_status text,
    backup_size bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    completed_at timestamp with time zone,
    restore_started_at timestamp with time zone,
    restore_completed_at timestamp with time zone,
    backup_options jsonb DEFAULT '{}'::jsonb
);

-- ===========================================================================
-- FOREIGN KEY CONSTRAINTS
-- ===========================================================================

-- Appointment related foreign keys
ALTER TABLE public.appointment_clients ADD CONSTRAINT appointment_clients_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);
ALTER TABLE public.appointment_clients ADD CONSTRAINT appointment_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);

ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);

ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);

ALTER TABLE public.appointments ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);

-- Product related foreign keys
ALTER TABLE public.product_master ADD CONSTRAINT fk_product_collection FOREIGN KEY (collection_id) REFERENCES public.product_collections(id);
ALTER TABLE public.product_stock_transactions ADD CONSTRAINT product_stock_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_master(id);

-- Service related foreign keys
ALTER TABLE public.services ADD CONSTRAINT fk_service_collection FOREIGN KEY (collection_id) REFERENCES public.service_collections(id);
ALTER TABLE public.service_subcollections ADD CONSTRAINT service_subcollections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.service_collections(id);
ALTER TABLE public.services ADD CONSTRAINT services_subcollection_id_fkey FOREIGN KEY (subcollection_id) REFERENCES public.service_subcollections(id);

-- Membership related foreign keys
ALTER TABLE public.members ADD CONSTRAINT members_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
ALTER TABLE public.members ADD CONSTRAINT members_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.membership_tiers(id);

-- POS related foreign keys
ALTER TABLE public.pos_order_items ADD CONSTRAINT pos_order_items_pos_order_id_fkey FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id);

-- Stylist related foreign keys
ALTER TABLE public.stylist_holidays ADD CONSTRAINT stylist_holidays_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);
ALTER TABLE public.breaks ADD CONSTRAINT breaks_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);

-- ===========================================================================
-- INDEXES
-- ===========================================================================

-- User ID indexes for multi-tenant support
CREATE INDEX IF NOT EXISTS idx_appointment_clients_user_id ON public.appointment_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_services_user_id ON public.appointment_services(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_stylists_user_id ON public.appointment_stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON public.stylists(user_id);

-- Service and collection indexes
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(collection_id);
CREATE INDEX IF NOT EXISTS idx_service_collections_user_id ON public.service_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_service_collections_name ON public.service_collections(name);
CREATE INDEX IF NOT EXISTS idx_service_subcollections_user_id ON public.service_subcollections(user_id);
CREATE INDEX IF NOT EXISTS idx_service_subcollections_collection_id ON public.service_subcollections(collection_id);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON public.product_master(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.product_master(active);

-- Stock transaction indexes
CREATE INDEX IF NOT EXISTS idx_product_stock_transactions_product_id ON public.product_stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_transactions_created_at ON public.product_stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_product_stock_transactions_order_id ON public.product_stock_transactions(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_duplicate_protection ON public.product_stock_transactions(duplicate_protection_key);

-- POS order indexes
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON public.pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_created_at ON public.pos_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_orders_status ON public.pos_orders(status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_client_name ON public.pos_orders(client_name);
CREATE INDEX IF NOT EXISTS idx_pos_orders_customer_name ON public.pos_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_pos_orders_multi_expert ON public.pos_orders(multi_expert);
CREATE INDEX IF NOT EXISTS idx_pos_orders_multi_expert_group_id ON public.pos_orders(multi_expert_group_id);

-- POS order items indexes
CREATE INDEX IF NOT EXISTS idx_pos_order_items_user_id ON public.pos_order_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_order_items_order_id ON public.pos_order_items(order_id);

-- Membership indexes
CREATE INDEX IF NOT EXISTS idx_membership_tiers_user_id ON public.membership_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_tiers_name ON public.membership_tiers(name);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_client_id ON public.members(client_id);
CREATE INDEX IF NOT EXISTS idx_members_tier_id ON public.members(tier_id);
CREATE INDEX IF NOT EXISTS idx_members_expiry ON public.members(expires_at);

-- Stylist holiday indexes
CREATE INDEX IF NOT EXISTS idx_stylist_holidays_stylist_id ON public.stylist_holidays(stylist_id);
CREATE INDEX IF NOT EXISTS idx_stylist_holidays_date ON public.stylist_holidays(holiday_date);

-- Profile indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS profiles_auth_user_id_idx ON public.profiles(auth_user_id);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- ===========================================================================
-- FUNCTIONS
-- ===========================================================================

-- User ID function
CREATE OR REPLACE FUNCTION public.user_id()
RETURNS uuid
LANGUAGE sql
AS $_$
  SELECT
    COALESCE(
      auth.uid(),
      (current_setting('request.jwt.claims', true)::JSON->>'sub')::uuid
    );
$_$;

-- Set User ID Trigger Function
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$function$;

-- Updated At Trigger Functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Profile Management Functions
CREATE OR REPLACE FUNCTION public.update_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.profiles WHERE auth_user_id = OLD.id;
  RETURN OLD;
END;
$function$;

-- Session Management Functions
CREATE OR REPLACE FUNCTION public.update_session(p_user_id uuid, p_ip_address text, p_user_agent text)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
    v_session_id UUID;
BEGIN
    -- Try to find existing active session
    SELECT id INTO v_session_id
    FROM public.active_sessions
    WHERE user_id = p_user_id AND is_active = true
    ORDER BY last_active DESC
    LIMIT 1;

    IF v_session_id IS NULL THEN
        -- Create new session
        INSERT INTO public.active_sessions (
            user_id, ip_address, user_agent,
            device_type, browser
        )
        VALUES (
            p_user_id, p_ip_address, p_user_agent,
            CASE 
                WHEN p_user_agent ILIKE '%mobile%' THEN 'mobile'
                WHEN p_user_agent ILIKE '%tablet%' THEN 'tablet'
                ELSE 'desktop'
            END,
            CASE
                WHEN p_user_agent ILIKE '%firefox%' THEN 'Firefox'
                WHEN p_user_agent ILIKE '%chrome%' THEN 'Chrome'
                WHEN p_user_agent ILIKE '%safari%' THEN 'Safari'
                WHEN p_user_agent ILIKE '%edge%' THEN 'Edge'
                ELSE 'Other'
            END
        )
        RETURNING id INTO v_session_id;
    ELSE
        -- Update existing session
        UPDATE public.active_sessions
        SET 
            last_active = now(),
            actions_count = actions_count + 1,
            session_duration = EXTRACT(EPOCH FROM (now() - started_at))::INTEGER,
            updated_at = now()
        WHERE id = v_session_id;
    END IF;

    RETURN v_session_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_session(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.active_sessions
    SET 
        is_active = false,
        session_duration = EXTRACT(EPOCH FROM (now() - started_at))::INTEGER,
        updated_at = now()
    WHERE user_id = p_user_id AND is_active = true;
END;
$function$;

-- Product Stock Management Functions
CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_updates jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  result JSONB := '{"success": true, "results": []}'::JSONB;
  update_item JSONB;
  product_id TEXT;
  quantity INTEGER;
  current_stock INTEGER;
  new_stock INTEGER;
  order_id UUID;
  notes TEXT;
BEGIN
  -- Extract order ID if present
  IF jsonb_array_length(product_updates) > 0 AND 
     product_updates[1] ? 'order_id' THEN
    order_id := (product_updates[1]->>'order_id')::UUID;
  END IF;

  -- Handle each product update
  FOREACH update_item IN ARRAY product_updates
  LOOP
    product_id := update_item->>'product_id';
    quantity := (update_item->>'quantity')::INTEGER;
    notes := update_item->>'notes';
    
    -- Skip invalid inputs
    IF product_id IS NULL OR quantity <= 0 THEN
      CONTINUE;
    END IF;
    
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM product_master
    WHERE id = product_id;
    
    IF current_stock IS NOT NULL THEN
      -- Calculate new stock (ensure not negative)
      new_stock := GREATEST(0, current_stock - quantity);
      
      -- Update the stock
      UPDATE product_master 
      SET stock_quantity = new_stock
      WHERE id = product_id;
      
      -- Record the transaction in history table
      INSERT INTO product_stock_transactions (
        product_id, 
        transaction_type, 
        quantity, 
        previous_stock, 
        new_stock, 
        order_id,
        notes
      ) VALUES (
        product_id::UUID, 
        'decrement', 
        quantity, 
        current_stock, 
        new_stock, 
        order_id,
        notes
      );
      
      -- Add to results
      result := jsonb_set(
        result, 
        '{results}', 
        (result->'results') || jsonb_build_object(
          'product_id', product_id,
          'old_stock', current_stock,
          'new_stock', new_stock
        )
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$function$;

-- Appointment Conflict Check Function
CREATE OR REPLACE FUNCTION public.check_appointment_conflict()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE stylist_id = NEW.stylist_id
        AND id != NEW.id
        AND status != 'cancelled'
        AND (
            (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Appointment time conflicts with an existing appointment';
    END IF;
    RETURN NEW;
END;
$function$;

-- Stylist Holiday Management Functions
CREATE OR REPLACE FUNCTION public.update_stylists_on_holiday()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE stylists 
  SET available = false
  WHERE id IN (
    SELECT DISTINCT stylist_id 
    FROM stylist_holidays 
    WHERE holiday_date = CURRENT_DATE
    AND stylist_id IS NOT NULL
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_stylists_not_on_holiday()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE stylists 
  SET available = true
  WHERE id NOT IN (
    SELECT DISTINCT stylist_id 
    FROM stylist_holidays 
    WHERE holiday_date = CURRENT_DATE
    AND stylist_id IS NOT NULL
  );
END;
$function$;

-- ===========================================================================
-- TRIGGERS
-- ===========================================================================

-- Updated At Triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_profile_updated_at();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.stylists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.service_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.service_subcollections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_updated_at_trigger BEFORE UPDATE ON public.appointment_stylists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User ID Assignment Triggers
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.stylists FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.service_collections FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.service_subcollections FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.appointment_services FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.appointment_stylists FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.appointment_clients FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.pos_orders FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.pos_order_items FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.membership_tiers FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_trigger BEFORE INSERT ON public.members FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Appointment Conflict Check Trigger
CREATE TRIGGER check_appointment_conflict_trigger BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.check_appointment_conflict();

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================================================

-- Enable RLS on all user tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcollections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for authenticated users
CREATE POLICY "Allow authenticated users full access" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.stylists FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.service_collections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.service_subcollections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.appointment_services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.appointment_stylists FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.appointment_clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.pos_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.pos_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.membership_tiers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.product_master FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.product_stock_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access" ON public.stylist_holidays FOR ALL USING (auth.role() = 'authenticated');

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- ===========================================================================
-- GRANTS AND PERMISSIONS
-- ===========================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ===========================================================================
-- COMMENTS
-- ===========================================================================

COMMENT ON TABLE public.clients IS 'Client/customer information';
COMMENT ON TABLE public.stylists IS 'Stylist/employee information';
COMMENT ON TABLE public.services IS 'Services offered by the salon';
COMMENT ON TABLE public.appointments IS 'Appointment bookings';
COMMENT ON TABLE public.pos_orders IS 'Point of sale orders';
COMMENT ON TABLE public.membership_tiers IS 'Membership tier definitions';
COMMENT ON TABLE public.members IS 'Client memberships';
COMMENT ON TABLE public.product_master IS 'Product inventory master data';
COMMENT ON TABLE public.product_stock_transactions IS 'Product stock movement history';

-- ===========================================================================
-- END OF SCHEMA BACKUP
-- ===========================================================================