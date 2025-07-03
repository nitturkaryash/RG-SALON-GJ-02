-- =============================================================================
-- SALON MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA EXPORT
-- Generated: 2025-01-03
-- Project: pamkajhadole24@gmail.com's Project (mtyudylsozncvilibxda)
-- =============================================================================
-- TABLE DEFINITIONS
-- =============================================================================

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- AUTH SCHEMA TABLES (Supabase Authentication)
-- =============================================================================

-- User authentication and identity management
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
    phone character varying(15),
    phone_confirmed_at timestamp with time zone,
    phone_change character varying(15),
    phone_change_token character varying(255),
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255),
    email_change_confirm_status smallint,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255),
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    identity_data jsonb NOT NULL,
    provider character varying(255) NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    instance_id uuid,
    id bigserial PRIMARY KEY,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- =============================================================================
-- PUBLIC SCHEMA TABLES (Main Business Logic)
-- =============================================================================

-- Organizations and Profiles
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    id text PRIMARY KEY,
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    username text,
    full_name text,
    email text,
    role text DEFAULT 'user'::text,
    is_active boolean DEFAULT true,
    organization_id uuid REFERENCES organizations(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    avatar_url text,
    phone text,
    address text
);

-- Salon Management
CREATE TABLE IF NOT EXISTS salons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    address text,
    phone text,
    email text,
    profile_id text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Stylist Management
CREATE TABLE IF NOT EXISTS stylists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text,
    specialization text,
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stylist_breaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id uuid NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    reason text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stylist_holidays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id uuid NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
    holiday_date date NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Client Management
CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text,
    date_of_birth date,
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Membership System
CREATE TABLE IF NOT EXISTS membership_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    benefits jsonb,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id),
    tier_id uuid REFERENCES membership_tiers(id),
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS loyalty_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id),
    points integer NOT NULL DEFAULT 0,
    earned_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date timestamp with time zone,
    transaction_type text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Service Management
CREATE TABLE IF NOT EXISTS service_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS service_subcollections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    collection_id uuid NOT NULL REFERENCES service_collections(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10,2),
    duration integer,
    collection_id uuid REFERENCES service_collections(id) ON DELETE CASCADE,
    subcollection_id uuid REFERENCES service_subcollections(id) ON DELETE CASCADE,
    active boolean DEFAULT true,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointment Management
CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stylist_id uuid REFERENCES stylists(id),
    service_id uuid REFERENCES services(id) ON DELETE CASCADE,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text,
    notes text,
    reminder_sent boolean DEFAULT false,
    reminder_24h_sent boolean DEFAULT false,
    reminder_2h_sent boolean DEFAULT false,
    checked_in boolean DEFAULT false,
    paid boolean DEFAULT false,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS appointment_clients (
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (appointment_id, client_id)
);

CREATE TABLE IF NOT EXISTS appointment_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id),
    stylist_id uuid REFERENCES stylists(id),
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (appointment_id, service_id, stylist_id)
);

CREATE TABLE IF NOT EXISTS appointment_stylists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    stylist_id uuid NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id),
    is_primary boolean DEFAULT false,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (appointment_id, stylist_id)
);

CREATE TABLE IF NOT EXISTS appointment_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    status text DEFAULT 'pending'::text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (appointment_id, reminder_type) DEFERRABLE INITIALLY DEFERRED
);

-- Product Management
CREATE TABLE IF NOT EXISTS product_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10,2),
    cost_price numeric(10,2),
    stock_quantity integer DEFAULT 0,
    collection_id uuid REFERENCES product_collections(id) ON DELETE CASCADE,
    active boolean DEFAULT true,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_price_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
    old_price numeric(10,2),
    new_price numeric(10,2),
    old_cost_price numeric(10,2),
    new_cost_price numeric(10,2),
    changed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    source_of_change text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory Management
CREATE TABLE IF NOT EXISTS inventory_products (
    product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    category text,
    quantity integer DEFAULT 0,
    unit_price numeric(10,2),
    total_value numeric(10,2),
    reorder_level integer,
    status text DEFAULT 'active'::text,
    hsn_code text,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    transaction_type text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2),
    total_amount numeric(10,2),
    transaction_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    reference_number text,
    notes text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_consumption (
    consumption_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    quantity_consumed integer NOT NULL,
    consumption_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    purpose text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Point of Sale (POS) System
CREATE TABLE IF NOT EXISTS pos_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text,
    customer_name text,
    client_name text,
    total_amount numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    final_amount numeric(10,2) DEFAULT 0,
    payment_method text,
    status text DEFAULT 'pending'::text,
    multi_expert boolean DEFAULT false,
    multi_expert_group_id uuid,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pos_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES pos_orders(id),
    item_type text NOT NULL,
    item_name text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_stylists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
    stylist_id uuid NOT NULL REFERENCES stylists(id),
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sales Management
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text,
    address text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES product_master(id),
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    stylist_id uuid REFERENCES stylists(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    is_salon_consumption boolean DEFAULT false,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_product_new (
    serial_no uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Stock Management
CREATE TABLE IF NOT EXISTS product_stock_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
    transaction_type text NOT NULL,
    quantity integer NOT NULL,
    reference_type text,
    order_id uuid,
    notes text,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    duplicate_protection_key text UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL,
    product_name text NOT NULL,
    change_type text NOT NULL,
    quantity_before integer,
    quantity_changed integer,
    quantity_after integer,
    price numeric(10,2),
    total_value numeric(10,2),
    source text,
    reference_id text,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_snapshots (
    sale_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name text NOT NULL,
    quantity_sold integer NOT NULL,
    stock_before integer NOT NULL,
    stock_after integer NOT NULL,
    order_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_type text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (sale_order_id, product_id)
);

-- Additional Business Tables
CREATE TABLE IF NOT EXISTS breaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id uuid NOT NULL REFERENCES stylists(id),
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    reason text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS consumption (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES product_master(id),
    sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    consumption_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Administrative Tables
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'admin'::text,
    is_active boolean DEFAULT true,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS active_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token text NOT NULL,
    ip_address inet,
    user_agent text,
    is_active boolean DEFAULT true,
    last_activity timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token text NOT NULL,
    is_active boolean DEFAULT true,
    last_active timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    status text DEFAULT 'open'::text,
    priority text DEFAULT 'medium'::text,
    client_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to text REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS backups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_name text NOT NULL,
    backup_type text NOT NULL,
    file_path text,
    file_size bigint,
    status text DEFAULT 'pending'::text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- Notification and Logging Tables
CREATE TABLE IF NOT EXISTS notification_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid,
    recipient_email text,
    recipient_phone text,
    message_type text NOT NULL,
    message_content text,
    status text DEFAULT 'pending'::text,
    sent_at timestamp with time zone,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS trigger_debug_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Utility and Debug Tables
CREATE TABLE IF NOT EXISTS balance_stock_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    balance_stock integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS balance_stock_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    old_balance integer,
    new_balance integer,
    change_amount integer,
    transaction_type text,
    transaction_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS balance_stock_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    transaction_type text NOT NULL,
    quantity integer NOT NULL,
    reference_id text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS expired_products (
    expired_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    expiry_date date NOT NULL,
    quantity integer NOT NULL,
    action_taken text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_salon_consumption (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    quantity integer NOT NULL,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_history_with_stock (
    purchase_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    supplier_name text,
    stock_before integer,
    stock_after integer,
    user_id uuid REFERENCES auth.users(id),
    profile_id text REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS salon_consumption_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "Date" date,
    "Requisition Voucher No." text,
    "Product Name" text,
    "Consumed Qty" integer,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_deduction_debug_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid,
    product_name text,
    quantity_to_deduct integer,
    stock_before integer,
    stock_after integer,
    operation_status text,
    error_message text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    opening_stock integer DEFAULT 0,
    purchases integer DEFAULT 0,
    sales integer DEFAULT 0,
    salon_consumption integer DEFAULT 0,
    closing_stock integer DEFAULT 0,
    date date DEFAULT CURRENT_DATE,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_reductions (
    reduction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name text NOT NULL,
    quantity_reduced integer NOT NULL,
    reason text,
    reference_id text,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Legacy Tables
CREATE TABLE IF NOT EXISTS auth (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS migrations (
    id integer PRIMARY KEY,
    name text UNIQUE NOT NULL,
    applied_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- END OF TABLE DEFINITIONS
-- ============================================================================= 