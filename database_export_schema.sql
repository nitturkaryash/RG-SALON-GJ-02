-- =============================================
-- COMPLETE DATABASE SCHEMA EXPORT
-- Project: Salon Software Database
-- Generated: 2025-01-06
-- =============================================

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS public;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- AUTH SCHEMA TABLES
-- =============================================

-- auth.users table
CREATE TABLE IF NOT EXISTS auth.users (
    instance_id uuid,
    id uuid NOT NULL PRIMARY KEY,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text UNIQUE DEFAULT NULL,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT '',
    phone_change_token character varying(255) DEFAULT '',
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT '',
    email_change_confirm_status smallint DEFAULT 0 CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2),
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT '',
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean NOT NULL DEFAULT false,
    deleted_at timestamp with time zone,
    is_anonymous boolean NOT NULL DEFAULT false
);

-- auth.identities table
CREATE TABLE IF NOT EXISTS auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- auth.sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal text CHECK (aal = ANY (ARRAY['aal1'::text, 'aal2'::text, 'aal3'::text])),
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- auth.refresh_tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    instance_id uuid,
    id bigserial PRIMARY KEY,
    token character varying(255) UNIQUE,
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid,
    FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- Additional auth tables (simplified for brevity)
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL PRIMARY KEY,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS auth.schema_migrations (
    version character varying(255) NOT NULL PRIMARY KEY
);

-- =============================================
-- PUBLIC SCHEMA TABLES
-- =============================================

-- admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL,
    email character varying NOT NULL UNIQUE,
    password character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    gst_percentage text,
    hsn_code text,
    igst text,
    role text DEFAULT 'salon_owner',
    salon_name text,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    mobile_number character varying NOT NULL DEFAULT '',
    gender text,
    birth_date date,
    anniversary_date date,
    appointment_count integer DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- stylists table
CREATE TABLE IF NOT EXISTS public.stylists (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    bio text,
    gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
    available boolean DEFAULT true,
    image_url text,
    specialties text[] DEFAULT '{}',
    breaks jsonb DEFAULT '[]',
    holidays jsonb DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- service_collections table
CREATE TABLE IF NOT EXISTS public.service_collections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- service_subcollections table
CREATE TABLE IF NOT EXISTS public.service_subcollections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    collection_id uuid,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (collection_id) REFERENCES public.service_collections(id)
);

-- services table
CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
    membership_eligible boolean DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (collection_id) REFERENCES public.service_collections(id),
    FOREIGN KEY (subcollection_id) REFERENCES public.service_subcollections(id)
);

-- appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    client_id uuid,
    stylist_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled',
    notes text,
    paid boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    billed boolean DEFAULT false,
    stylist_ids uuid[],
    service_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
    service_id uuid,
    reminder_sent boolean DEFAULT false,
    is_for_someone_else boolean NOT NULL DEFAULT false,
    reminder_24h_sent boolean DEFAULT false,
    reminder_2h_sent boolean DEFAULT false,
    booking_id uuid,
    checked_in boolean DEFAULT false,
    booker_name text,
    booker_phone text,
    booker_email text,
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (client_id) REFERENCES public.clients(id),
    FOREIGN KEY (stylist_id) REFERENCES public.stylists(id),
    FOREIGN KEY (service_id) REFERENCES public.services(id)
);

-- appointment_clients table
CREATE TABLE IF NOT EXISTS public.appointment_clients (
    appointment_id uuid NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (appointment_id, client_id),
    FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
    FOREIGN KEY (client_id) REFERENCES public.clients(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- appointment_services table
CREATE TABLE IF NOT EXISTS public.appointment_services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    service_id uuid NOT NULL,
    client_id uuid,
    start_time time without time zone,
    end_time time without time zone,
    stylist_id uuid,
    sequence_order integer,
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
    FOREIGN KEY (service_id) REFERENCES public.services(id),
    FOREIGN KEY (client_id) REFERENCES public.clients(id),
    FOREIGN KEY (stylist_id) REFERENCES public.stylists(id)
);

-- appointment_stylists table
CREATE TABLE IF NOT EXISTS public.appointment_stylists (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    appointment_id uuid,
    stylist_id uuid,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    client_id uuid,
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
    FOREIGN KEY (stylist_id) REFERENCES public.stylists(id),
    FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- membership_tiers table
CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL CHECK (price >= 0),
    duration_months integer NOT NULL CHECK (duration_months > 0),
    benefits text[] DEFAULT '{}',
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- members table
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    client_name text NOT NULL,
    tier_id uuid NOT NULL,
    purchase_date date NOT NULL DEFAULT CURRENT_DATE,
    expires_at date NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    current_balance numeric NOT NULL DEFAULT 0,
    total_membership_amount numeric NOT NULL DEFAULT 0,
    benefit_amount numeric DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (client_id) REFERENCES public.clients(id),
    FOREIGN KEY (tier_id) REFERENCES public.membership_tiers(id)
);

-- product_collections table
CREATE TABLE IF NOT EXISTS public.product_collections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- product_master table
CREATE TABLE IF NOT EXISTS public.product_master (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    FOREIGN KEY (collection_id) REFERENCES public.product_collections(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- product_stock_transactions table
CREATE TABLE IF NOT EXISTS public.product_stock_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid,
    transaction_type character varying NOT NULL,
    quantity integer NOT NULL,
    previous_stock integer,
    new_stock integer,
    order_id uuid,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    display_type character varying,
    source_type character varying,
    source character varying,
    duplicate_protection_key text UNIQUE,
    created_at_tz timestamp with time zone,
    user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    FOREIGN KEY (product_id) REFERENCES public.product_master(id),
    FOREIGN KEY (created_by) REFERENCES auth.users(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- pos_orders table
CREATE TABLE IF NOT EXISTS public.pos_orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    client_name text,
    consumption_purpose text,
    consumption_notes text,
    total numeric NOT NULL DEFAULT 0,
    type text DEFAULT 'sale',
    is_salon_consumption boolean,
    status text DEFAULT 'completed',
    payment_method text DEFAULT 'cash',
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
    stock_snapshot jsonb DEFAULT '{}',
    current_stock text,
    multi_expert_group_id uuid,
    multi_expert boolean DEFAULT false,
    total_experts integer DEFAULT 1,
    expert_index integer DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- pos_order_items table
CREATE TABLE IF NOT EXISTS public.pos_order_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    service_id uuid,
    service_name text NOT NULL,
    service_type text DEFAULT 'service',
    price numeric NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    gst_percentage numeric DEFAULT 18,
    hsn_code text,
    created_at timestamp with time zone DEFAULT now(),
    pos_order_id uuid,
    order_id text,
    product_id text,
    product_name text,
    unit_price numeric,
    total_price numeric,
    type text DEFAULT 'product',
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id)
);

-- stylist_holidays table
CREATE TABLE IF NOT EXISTS public.stylist_holidays (
    id uuid NOT NULL,
    stylist_id uuid,
    holiday_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    FOREIGN KEY (stylist_id) REFERENCES public.stylists(id),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- breaks table
CREATE TABLE IF NOT EXISTS public.breaks (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    stylist_id uuid,
    break_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id),
    FOREIGN KEY (stylist_id) REFERENCES public.stylists(id)
);

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email character varying NOT NULL UNIQUE,
    full_name character varying,
    phone_number character varying,
    whatsapp_number character varying,
    role character varying NOT NULL DEFAULT 'user',
    is_active boolean NOT NULL DEFAULT true,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    auth_user_id uuid NOT NULL UNIQUE DEFAULT auth.uid(),
    username character varying,
    avatar_url text,
    metadata jsonb,
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);

-- backups table
CREATE TABLE IF NOT EXISTS public.backups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid,
    table_name text NOT NULL,
    backup_type text CHECK (backup_type = ANY (ARRAY['cloud'::text, 'local'::text, 'both'::text])),
    status text CHECK (status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'failed'::text])),
    restore_status text CHECK (restore_status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'failed'::text])),
    backup_size bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    completed_at timestamp with time zone,
    restore_started_at timestamp with time zone,
    restore_completed_at timestamp with time zone,
    backup_options jsonb DEFAULT '{}' CHECK (
        ((backup_options ->> 'type') = ANY (ARRAY['full'::text, 'incremental'::text, 'differential'::text])) AND 
        ((backup_options ->> 'compression')::boolean) IS NOT NULL AND 
        ((backup_options ->> 'encryption')::boolean) IS NOT NULL
    ),
    FOREIGN KEY (client_id) REFERENCES auth.users(id),
    FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- backup_schedules table
CREATE TABLE IF NOT EXISTS public.backup_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid UNIQUE,
    frequency text CHECK (frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])),
    time time without time zone NOT NULL,
    backup_type text CHECK (backup_type = ANY (ARRAY['full'::text, 'incremental'::text, 'differential'::text])),
    storage_type text CHECK (storage_type = ANY (ARRAY['cloud'::text, 'local'::text, 'both'::text])),
    last_run timestamp with time zone,
    next_run timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (client_id) REFERENCES auth.users(id)
);

-- active_sessions table
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
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
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- auth table (custom application auth)
CREATE TABLE IF NOT EXISTS public.auth (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    username character varying NOT NULL UNIQUE,
    password_hash character varying NOT NULL,
    email character varying,
    role character varying NOT NULL DEFAULT 'admin',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    is_active boolean DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id SERIAL PRIMARY KEY,
    user_id uuid,
    email character varying NOT NULL,
    is_active boolean DEFAULT true,
    role character varying DEFAULT 'user' CHECK (role = 'user'),
    salon_name character varying,
    gst_percentage character varying DEFAULT '18',
    hsn_code character varying,
    igst character varying DEFAULT '0',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    username character varying UNIQUE,
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- =============================================
-- STORAGE SCHEMA TABLES
-- =============================================

-- storage.buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);

-- storage.objects table
CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

-- storage.migrations table
CREATE TABLE IF NOT EXISTS storage.migrations (
    id integer NOT NULL PRIMARY KEY,
    name character varying NOT NULL UNIQUE,
    hash character varying NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Additional storage tables for multipart uploads
CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads (
    id text NOT NULL PRIMARY KEY,
    in_progress_size bigint NOT NULL DEFAULT 0,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL,
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_metadata jsonb,
    FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    upload_id text NOT NULL,
    size bigint NOT NULL DEFAULT 0,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL,
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id),
    FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id)
);

-- =============================================
-- INDEXES AND CONSTRAINTS
-- =============================================

-- Add essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON public.stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON public.pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_master_user_id ON public.product_master(user_id);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all public tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies (can be customized based on requirements)
-- Example for clients table:
-- CREATE POLICY "Users can only see their own clients" ON public.clients
--   FOR ALL USING (auth.uid() = user_id);

COMMENT ON SCHEMA public IS 'Salon software main application schema';
COMMENT ON SCHEMA auth IS 'Supabase authentication schema';
COMMENT ON SCHEMA storage IS 'Supabase storage schema';

-- End of schema export 