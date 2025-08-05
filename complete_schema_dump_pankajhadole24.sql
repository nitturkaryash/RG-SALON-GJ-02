-- =====================================================
-- Complete Schema Dump for pankajhadole24@gmail.com Project
-- Project ID: mtyudylsozncvilibxda
-- Generated: 2024-12-19
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles table (user management)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    auth_user_id uuid REFERENCES auth.users(id),
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

-- Product Master table
CREATE TABLE public.product_master (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    gst_percentage integer DEFAULT 18,
    sku text,
    product_type text,
    "Purchase_Cost/Unit(Ex.GST)" numeric(10,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    collection_id uuid,
    user_id uuid REFERENCES profiles(id) NOT NULL DEFAULT auth.uid()
);

-- POS Orders table
CREATE TABLE public.pos_orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name text,
    customer_name text,
    stylist_id text,
    stylist_name text,
    total numeric(10,2) NOT NULL DEFAULT 0,
    subtotal double precision,
    tax double precision,
    discount double precision DEFAULT 0,
    payment_method text DEFAULT 'cash',
    status text DEFAULT 'completed',
    is_walk_in boolean DEFAULT false,
    is_split_payment boolean DEFAULT false,
    pending_amount double precision DEFAULT 0,
    services jsonb,
    date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    type text DEFAULT 'sale',
    source text DEFAULT 'pos',
    is_salon_consumption boolean DEFAULT false,
    consumption_purpose text,
    consumption_notes text,
    current_stock text,
    stock_snapshot jsonb DEFAULT '{}'::jsonb,
    user_id uuid REFERENCES profiles(id) NOT NULL DEFAULT auth.uid(),
    tenant_id text NOT NULL DEFAULT '',
    multi_expert_group_id uuid,
    multi_expert boolean DEFAULT false,
    total_experts integer DEFAULT 1,
    expert_index integer DEFAULT 1,
    source text DEFAULT 'pos',
    invoice_no text,
    invoice_number text,
    serial_number text,
    client_id uuid REFERENCES clients(id),
    notes text
);

-- Product Stock Transactions table
CREATE TABLE public.product_stock_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES product_master(id),
    transaction_type varchar NOT NULL,
    quantity integer NOT NULL,
    previous_stock integer,
    new_stock integer,
    order_id uuid REFERENCES pos_orders(id),
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    display_type varchar,
    source_type varchar,
    source varchar,
    reference_id uuid,
    duplicate_protection_key text UNIQUE,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at_tz timestamptz
);

-- Clients table
CREATE TABLE public.clients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name text NOT NULL,
    phone text,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_visit timestamptz,
    notes text,
    total_spent numeric DEFAULT 0,
    pending_payment numeric DEFAULT 0,
    mobile_number varchar NOT NULL DEFAULT '',
    gender text,
    birth_date date,
    anniversary_date date,
    appointment_count integer DEFAULT 0,
    profile_id uuid REFERENCES profiles(id),
    user_id uuid REFERENCES profiles(id)
);

-- Stylists table
CREATE TABLE public.stylists (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    bio text,
    gender text CHECK (gender = ANY (ARRAY['male', 'female', 'other'])),
    available boolean DEFAULT true,
    image_url text,
    specialties text[] DEFAULT '{}',
    breaks jsonb DEFAULT '[]',
    holidays jsonb DEFAULT '[]',
    user_id uuid REFERENCES profiles(id),
    designation text
);

-- Services table
CREATE TABLE public.services (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    duration integer NOT NULL,
    collection_id uuid,
    type text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    subcollection_id uuid,
    gender text CHECK (gender = ANY (ARRAY['male', 'female'])),
    membership_eligible boolean DEFAULT true,
    user_id uuid REFERENCES profiles(id)
);

-- Service Collections table
CREATE TABLE public.service_collections (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id)
);

-- Service Subcollections table
CREATE TABLE public.service_subcollections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id uuid REFERENCES service_collections(id),
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES profiles(id)
);

-- Product Collections table
CREATE TABLE public.product_collections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    user_id uuid REFERENCES profiles(id)
);

-- Appointments table
CREATE TABLE public.appointments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid REFERENCES clients(id),
    stylist_id uuid REFERENCES stylists(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text DEFAULT 'scheduled',
    notes text,
    paid boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    billed boolean DEFAULT false,
    stylist_ids uuid[],
    service_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
    service_id uuid REFERENCES services(id),
    reminder_sent boolean DEFAULT false,
    is_for_someone_else boolean NOT NULL DEFAULT false,
    reminder_24h_sent boolean DEFAULT false,
    reminder_2h_sent boolean DEFAULT false,
    booking_id uuid,
    checked_in boolean DEFAULT false,
    booker_name text,
    booker_phone text,
    booker_email text,
    tenant_id text NOT NULL DEFAULT '',
    user_id uuid REFERENCES profiles(id)
);

-- =====================================================
-- INVENTORY TABLES
-- =====================================================

-- Sales table
CREATE TABLE public.sales (
    id uuid PRIMARY KEY,
    product_id uuid REFERENCES product_master(id) NOT NULL,
    date text,
    invoice_no text,
    qty numeric DEFAULT 0 NOT NULL,
    incl_gst numeric DEFAULT 0,
    ex_gst numeric DEFAULT 0,
    taxable_value numeric DEFAULT 0,
    igst numeric DEFAULT 0,
    cgst numeric DEFAULT 0,
    sgst numeric DEFAULT 0,
    invoice_value numeric DEFAULT 0,
    customer text,
    payment_method text CHECK (payment_method IS NULL OR (payment_method = ANY (ARRAY['cash', 'card', 'online', 'other']))),
    transaction_type text DEFAULT 'sale',
    converted_to_consumption boolean DEFAULT false,
    converted_at timestamptz,
    consumption_id uuid,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    customer_name text,
    customer_id uuid REFERENCES customers(id),
    stylist_name text,
    stylist_id uuid REFERENCES stylists(id),
    invoice_number text,
    order_id uuid,
    stock_updated boolean DEFAULT false,
    discount_percentage numeric DEFAULT 0,
    gst_percentage numeric DEFAULT 0,
    price_excl_gst numeric,
    total_value numeric,
    quantity integer DEFAULT 1,
    is_salon_consumption boolean DEFAULT false,
    mrp_incl_gst numeric,
    user_id uuid REFERENCES auth.users(id)
);

-- Consumption table
CREATE TABLE public.consumption (
    id uuid PRIMARY KEY,
    product_id uuid REFERENCES product_master(id) NOT NULL,
    date text,
    qty numeric DEFAULT 0 NOT NULL,
    purpose text,
    transaction_type text DEFAULT 'consumption',
    original_sale_id uuid,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    user_id uuid REFERENCES auth.users(id)
);

-- Stock History table
CREATE TABLE public.stock_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date timestamptz DEFAULT CURRENT_TIMESTAMP,
    product_id text NOT NULL,
    product_name text NOT NULL,
    previous_qty integer NOT NULL,
    current_qty integer NOT NULL,
    change_qty integer NOT NULL,
    change_type text NOT NULL,
    source text NOT NULL,
    reference_id text,
    notes text,
    created_by text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    hsn_code text,
    units text,
    serial_no text,
    gst_percentage numeric,
    taxable_value numeric,
    igst_amount numeric,
    cgst_amount numeric,
    sgst_amount numeric,
    stock_value_incl_gst numeric,
    consumption_type text,
    qty_change integer,
    stock_after integer,
    type varchar,
    invoice_id varchar,
    user_id uuid REFERENCES profiles(id)
);

-- Purchase History with Stock table
CREATE TABLE public.purchase_history_with_stock (
    purchase_id uuid PRIMARY KEY,
    date timestamp NOT NULL,
    product_id uuid,
    product_name text,
    hsn_code text,
    units text,
    purchase_invoice_number text,
    purchase_qty integer,
    mrp_incl_gst numeric,
    mrp_excl_gst numeric,
    discount_on_purchase_percentage numeric,
    gst_percentage numeric,
    purchase_taxable_value numeric,
    purchase_igst numeric,
    purchase_cgst numeric,
    purchase_sgst numeric,
    purchase_invoice_value_rs numeric,
    supplier text,
    current_stock_at_purchase integer,
    computed_stock_taxable_value numeric,
    computed_stock_igst numeric,
    computed_stock_cgst numeric,
    computed_stock_sgst numeric,
    computed_stock_total_value numeric,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    tax_inlcuding_disc numeric,
    user_id uuid REFERENCES profiles(id),
    "Purchase_Cost/Unit(Ex.GST)" numeric,
    transaction_type text DEFAULT 'purchase',
    price_inlcuding_disc numeric
);

-- =====================================================
-- MEMBERSHIP TABLES
-- =====================================================

-- Membership Tiers table
CREATE TABLE public.membership_tiers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    price numeric NOT NULL CHECK (price >= 0::numeric),
    duration_months integer NOT NULL CHECK (duration_months > 0),
    benefits text[] DEFAULT '{}',
    description text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES profiles(id)
);

-- Members table
CREATE TABLE public.members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) NOT NULL,
    client_name text NOT NULL,
    tier_id uuid REFERENCES membership_tiers(id) NOT NULL,
    purchase_date date NOT NULL DEFAULT CURRENT_DATE,
    expires_at date NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    current_balance numeric NOT NULL DEFAULT 0,
    total_membership_amount numeric NOT NULL DEFAULT 0,
    benefit_amount numeric,
    user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Loyalty Points table
CREATE TABLE public.loyalty_points (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid REFERENCES clients(id) NOT NULL,
    points_earned numeric DEFAULT 0,
    points_redeemed numeric DEFAULT 0,
    points_balance numeric DEFAULT 0,
    last_transaction_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- ADMINISTRATIVE TABLES
-- =====================================================

-- Admin Users table
CREATE TABLE public.admin_users (
    id integer PRIMARY KEY DEFAULT nextval('admin_users_id_seq'),
    email varchar NOT NULL UNIQUE,
    password varchar NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    gst_percentage text,
    hsn_code text,
    igst text,
    user_id uuid REFERENCES profiles(id)
);

-- Auth table
CREATE TABLE public.auth (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    username varchar NOT NULL UNIQUE,
    password_hash varchar NOT NULL,
    email varchar,
    role varchar NOT NULL DEFAULT 'admin',
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    last_login timestamptz,
    is_active boolean DEFAULT true,
    user_id uuid REFERENCES profiles(id) DEFAULT get_current_profile_id()
);

-- =====================================================
-- NOTIFICATION TABLES
-- =====================================================

-- Notification Logs table
CREATE TABLE public.notification_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id uuid,
    notification_type varchar NOT NULL,
    sent_at timestamptz DEFAULT now(),
    status varchar NOT NULL,
    old_appointment_id uuid,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Appointment Reminders table
CREATE TABLE public.appointment_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid REFERENCES appointments(id) NOT NULL,
    reminder_type varchar NOT NULL CHECK (reminder_type::text = ANY (ARRAY['24h', '2h', 'custom'])),
    sent_at timestamptz NOT NULL DEFAULT now(),
    status varchar NOT NULL DEFAULT 'sent' CHECK (status::text = ANY (ARRAY['sent', 'failed', 'delivered', 'read'])),
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- RELATIONSHIP TABLES
-- =====================================================

-- Appointment Clients table
CREATE TABLE public.appointment_clients (
    appointment_id uuid REFERENCES appointments(id) NOT NULL,
    client_id uuid REFERENCES clients(id) NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES profiles(id),
    PRIMARY KEY (appointment_id, client_id)
);

-- Appointment Services table
CREATE TABLE public.appointment_services (
    appointment_id uuid REFERENCES appointments(id) NOT NULL,
    service_id uuid REFERENCES services(id) NOT NULL,
    client_id uuid REFERENCES clients(id),
    start_time time,
    end_time time,
    stylist_id uuid REFERENCES stylists(id),
    sequence_order integer,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES profiles(id)
);

-- Appointment Stylists table
CREATE TABLE public.appointment_stylists (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id uuid REFERENCES appointments(id),
    stylist_id uuid REFERENCES stylists(id),
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    client_id uuid REFERENCES clients(id),
    user_id uuid REFERENCES profiles(id)
);

-- Order Stylists table
CREATE TABLE public.order_stylists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES pos_orders(id),
    stylist_id uuid REFERENCES stylists(id),
    share_percentage numeric,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- POS Order Items table
CREATE TABLE public.pos_order_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id uuid,
    service_name text NOT NULL,
    service_type text DEFAULT 'service',
    price numeric NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    gst_percentage numeric DEFAULT 18,
    hsn_code text,
    created_at timestamptz DEFAULT now(),
    pos_order_id uuid REFERENCES pos_orders(id),
    order_id text,
    product_id text,
    product_name text,
    unit_price numeric,
    total_price numeric,
    type text DEFAULT 'product',
    user_id uuid REFERENCES profiles(id)
);

-- =====================================================
-- STOCK MANAGEMENT TABLES
-- =====================================================

-- Stock Snapshots table
CREATE TABLE public.stock_snapshots (
    sale_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    order_date date NOT NULL,
    initial_stock bigint NOT NULL,
    current_stock bigint NOT NULL,
    total_sold bigint NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    quantity integer DEFAULT 1 NOT NULL,
    order_type varchar DEFAULT 'sale' NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    PRIMARY KEY (sale_order_id, product_id)
);

-- Stock Deduction Debug Log table
CREATE TABLE public.stock_deduction_debug_log (
    id integer PRIMARY KEY DEFAULT nextval('stock_deduction_debug_log_id_seq'),
    timestamp timestamptz DEFAULT now(),
    order_id uuid,
    product_id uuid,
    product_name text,
    requested_quantity integer,
    previous_stock integer,
    new_stock integer,
    actual_deduction integer,
    services_json text,
    notes text,
    user_id uuid REFERENCES auth.users(id)
);

-- Stock Details table
CREATE TABLE public.stock_details (
    id integer PRIMARY KEY DEFAULT nextval('stock_details_id_seq'),
    product_name varchar NOT NULL,
    hsn_code varchar,
    units varchar,
    user_id uuid REFERENCES auth.users(id)
);

-- Stock Reductions table
CREATE TABLE public.stock_reductions (
    reduction_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date timestamp DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    product_id text,
    hsn_code text,
    units text,
    reduction_qty integer NOT NULL,
    reduction_type text NOT NULL,
    reference_id text,
    invoice_no text,
    purchase_cost_per_unit_ex_gst double precision,
    purchase_gst_percentage double precision DEFAULT 18,
    purchase_taxable_value double precision,
    purchase_igst double precision DEFAULT 0,
    purchase_cgst double precision,
    purchase_sgst double precision,
    total_purchase_cost double precision,
    balance_qty_after_reduction integer,
    taxable_value double precision,
    igst_rs double precision DEFAULT 0,
    cgst_rs double precision,
    sgst_rs double precision,
    invoice_value double precision,
    notes text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- BREAKS AND SCHEDULING TABLES
-- =====================================================

-- Breaks table
CREATE TABLE public.breaks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    stylist_id uuid REFERENCES stylists(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Stylist Breaks table
CREATE TABLE public.stylist_breaks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    stylist_id uuid REFERENCES stylists(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    reason text,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Stylist Holidays table
CREATE TABLE public.stylist_holidays (
    id uuid PRIMARY KEY,
    stylist_id uuid REFERENCES stylists(id),
    holiday_date date NOT NULL,
    reason text,
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- BALANCE STOCK TABLES
-- =====================================================

-- Balance Stock History table
CREATE TABLE public.balance_stock_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_time timestamptz DEFAULT CURRENT_TIMESTAMP,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    change_type text NOT NULL,
    source text DEFAULT 'inventory_update',
    reference_id text DEFAULT '-',
    quantity_change numeric NOT NULL,
    quantity_after_change numeric NOT NULL,
    created_by text,
    transaction_id text,
    user_id uuid REFERENCES auth.users(id)
);

-- Balance Stock Transactions table
CREATE TABLE public.balance_stock_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_time timestamptz DEFAULT CURRENT_TIMESTAMP,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    change_type text,
    source text DEFAULT 'inventory_update',
    reference_id text DEFAULT '-',
    quantity_change numeric DEFAULT 0,
    quantity_after_change numeric DEFAULT 0,
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- INVENTORY CONSUMPTION TABLES
-- =====================================================

-- Inventory Consumption table
CREATE TABLE public.inventory_consumption (
    consumption_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date timestamp DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    requisition_voucher_no text,
    consumption_qty integer NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    purchase_cost_per_unit_ex_gst double precision,
    purchase_gst_percentage double precision,
    purchase_taxable_value double precision,
    purchase_igst double precision,
    purchase_cgst double precision,
    purchase_sgst double precision,
    total_purchase_cost double precision,
    balance_qty integer,
    taxable_value double precision,
    igst_rs double precision,
    cgst_rs double precision,
    sgst_rs double precision,
    invoice_value double precision,
    current_stock integer,
    stock_taxable_value double precision,
    stock_igst double precision,
    stock_cgst double precision,
    stock_sgst double precision,
    stock_total_value double precision,
    user_id uuid REFERENCES auth.users(id)
);

-- Inventory Transactions table
CREATE TABLE public.inventory_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_time timestamptz DEFAULT CURRENT_TIMESTAMP,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    change_type text NOT NULL,
    source text DEFAULT 'inventory_update',
    reference_id text DEFAULT '-',
    quantity_change numeric NOT NULL,
    quantity_after_change numeric NOT NULL,
    user_id uuid REFERENCES auth.users(id)
);

-- Inventory Salon Consumption table
CREATE TABLE public.inventory_salon_consumption (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date timestamp DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    quantity integer DEFAULT 1 NOT NULL,
    purpose text DEFAULT 'Salon Use',
    stylist_name text,
    notes text,
    price_per_unit numeric DEFAULT 0,
    gst_percentage numeric DEFAULT 0,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    current_stock integer,
    current_stock_value numeric,
    c_cgst numeric,
    c_sgst numeric,
    c_tax numeric,
    user_id uuid REFERENCES auth.users(id)
);

-- Salon Consumption Products Table
CREATE TABLE public.salon_consumption_products_table (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Requisition Voucher No." text NOT NULL,
    order_id uuid,
    "Date" timestamptz DEFAULT now(),
    "Product Name" text NOT NULL,
    "Consumption Qty." integer NOT NULL,
    "Purchase Cost per Unit (Ex. GST) (Rs.)" numeric NOT NULL,
    "Purchase GST Percentage" numeric NOT NULL,
    "Purchase Taxable Value (Rs.)" numeric NOT NULL,
    "Purchase IGST (Rs.)" numeric DEFAULT 0,
    "Purchase CGST (Rs.)" numeric DEFAULT 0,
    "Purchase SGST (Rs.)" numeric DEFAULT 0,
    "Total Purchase Cost (Rs.)" numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- EXPIRED PRODUCTS TABLE
-- =====================================================

-- Expired Products table
CREATE TABLE public.expired_products (
    expired_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    date timestamp DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    quantity integer NOT NULL,
    expiry_date timestamp NOT NULL,
    notes text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================

-- Customers table
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    tenant_id text NOT NULL DEFAULT '',
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- SALES PRODUCT NEW TABLE
-- =====================================================

-- Sales Product New table
CREATE TABLE public.sales_product_new (
    serial_no text PRIMARY KEY,
    order_id text,
    date text,
    product_name text,
    quantity text,
    unit_price_ex_gst text,
    gst_percentage text,
    taxable_value text,
    cgst_amount text,
    sgst_amount text,
    total_purchase_cost text,
    discount text,
    tax text,
    payment_amount text,
    payment_method text,
    payment_date text,
    user_id uuid REFERENCES auth.users(id),
    product_type text
);

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================

-- Organizations table
CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- SALONS TABLE
-- =====================================================

-- Salons table
CREATE TABLE public.salons (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    address text,
    phone_number text,
    whatsapp_number text,
    owner_id uuid REFERENCES profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

-- =====================================================
-- SESSION MANAGEMENT TABLES
-- =====================================================

-- Active Sessions table
CREATE TABLE public.active_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    started_at timestamptz DEFAULT now(),
    last_active timestamptz DEFAULT now(),
    ip_address text,
    user_agent text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'
);

-- User Sessions table
CREATE TABLE public.user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid REFERENCES auth.users(id) NOT NULL,
    profile_id uuid REFERENCES profiles(id) NOT NULL,
    device_info jsonb NOT NULL,
    ip_address text NOT NULL,
    location jsonb,
    started_at timestamptz NOT NULL DEFAULT now(),
    last_active timestamptz NOT NULL DEFAULT now(),
    is_active boolean NOT NULL DEFAULT true,
    actions_count integer NOT NULL DEFAULT 0
);

-- =====================================================
-- SUPPORT TABLES
-- =====================================================

-- Support Tickets table
CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES profiles(id),
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'open' CHECK (status = ANY (ARRAY['open', 'in_progress', 'resolved', 'closed'])),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority = ANY (ARRAY['low', 'medium', 'high', 'urgent'])),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    assigned_to uuid REFERENCES profiles(id),
    metadata jsonb DEFAULT '{}'
);

-- =====================================================
-- BACKUP TABLES
-- =====================================================

-- Admin Backups table
CREATE TABLE public.admin_backups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    backup_data jsonb NOT NULL,
    file_paths jsonb DEFAULT '[]',
    backup_type text NOT NULL,
    backup_size bigint,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
    status text DEFAULT 'completed',
    error_message text
);

-- Admin Backup Schedules table
CREATE TABLE public.admin_backup_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar NOT NULL,
    description text,
    frequency varchar NOT NULL,
    cron_expression varchar NOT NULL,
    backup_type text NOT NULL DEFAULT 'full',
    retention_days integer NOT NULL DEFAULT 30,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    last_run_at timestamptz
);

-- Admin Backup Logs table
CREATE TABLE public.admin_backup_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_id uuid REFERENCES admin_backups(id),
    event_type varchar NOT NULL,
    message text NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- =====================================================
-- SECURITY TABLES
-- =====================================================

-- Rate Limits table
CREATE TABLE public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    ip_address text NOT NULL,
    endpoint text NOT NULL,
    request_count integer NOT NULL DEFAULT 1,
    window_start timestamptz NOT NULL DEFAULT now()
);

-- Security Events table
CREATE TABLE public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    event_type text NOT NULL,
    severity text NOT NULL,
    ip_address text,
    user_agent text,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- DATA IMPORT TABLES
-- =====================================================

-- Data Import Logs table
CREATE TABLE public.data_import_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id),
    table_name text NOT NULL,
    rows_imported integer NOT NULL DEFAULT 0,
    success boolean NOT NULL DEFAULT false,
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    file_name text,
    file_size integer,
    import_duration integer,
    validation_errors jsonb,
    column_mappings jsonb,
    missing_data_strategy jsonb
);

-- =====================================================
-- PRODUCT PRICE HISTORY TABLE
-- =====================================================

-- Product Price History table
CREATE TABLE public.product_price_history (
    id bigint PRIMARY KEY DEFAULT nextval('product_price_history_id_seq'),
    product_id uuid REFERENCES product_master(id) NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now(),
    old_mrp_incl_gst numeric NOT NULL,
    new_mrp_incl_gst numeric NOT NULL,
    old_mrp_excl_gst numeric,
    new_mrp_excl_gst numeric,
    old_gst_percentage numeric,
    new_gst_percentage numeric,
    source_of_change text,
    reference_id text,
    user_id uuid REFERENCES profiles(id),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- ORDERS TABLES
-- =====================================================

-- Orders table
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    order_date date NOT NULL,
    order_time time NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text NOT NULL,
    special_requests text,
    items jsonb NOT NULL DEFAULT '[]',
    total_amount numeric DEFAULT 0,
    status text DEFAULT 'pending',
    user_id uuid REFERENCES auth.users(id)
);

-- Order Items table
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id),
    name text NOT NULL,
    price numeric NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    category text,
    created_at timestamptz DEFAULT now()
);

-- =====================================================
-- PENDING PAYMENT HISTORY TABLE
-- =====================================================

-- Pending Payment History table
CREATE TABLE public.pending_payment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) NOT NULL,
    amount_paid numeric NOT NULL,
    payment_method varchar NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- TRIGGER DEBUG LOG TABLE
-- =====================================================

-- Trigger Debug Log table
CREATE TABLE public.trigger_debug_log (
    id integer PRIMARY KEY DEFAULT nextval('trigger_debug_log_id_seq'),
    timestamp timestamp DEFAULT now(),
    operation text,
    details text,
    error_message text,
    user_id uuid REFERENCES auth.users(id)
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get current profile ID function
CREATE OR REPLACE FUNCTION get_current_profile_id() RETURNS uuid AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Handle new user function
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

-- =====================================================
-- VIEWS
-- =====================================================

-- Product Stock Transaction History view
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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Handle new user trigger
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_created_at ON pos_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_product_stock_transactions_product_id ON product_stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_user_id ON consumption(user_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own orders" ON pos_orders
    FOR SELECT USING (user_id = get_current_profile_id());

CREATE POLICY "Users can insert their own orders" ON pos_orders
    FOR INSERT WITH CHECK (user_id = get_current_profile_id());

CREATE POLICY "Users can view their own products" ON product_master
    FOR SELECT USING (user_id = get_current_profile_id());

CREATE POLICY "Users can insert their own products" ON product_master
    FOR INSERT WITH CHECK (user_id = get_current_profile_id());

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints that might be missing
ALTER TABLE product_master 
ADD CONSTRAINT fk_product_collection 
FOREIGN KEY (collection_id) REFERENCES product_collections(id);

ALTER TABLE services 
ADD CONSTRAINT fk_service_collection 
FOREIGN KEY (collection_id) REFERENCES service_collections(id);

ALTER TABLE services 
ADD CONSTRAINT services_subcollection_id_fkey 
FOREIGN KEY (subcollection_id) REFERENCES service_subcollections(id);

ALTER TABLE service_subcollections 
ADD CONSTRAINT service_subcollections_collection_id_fkey 
FOREIGN KEY (collection_id) REFERENCES service_collections(id);

-- =====================================================
-- SEQUENCES
-- =====================================================

-- Create sequences if they don't exist
CREATE SEQUENCE IF NOT EXISTS admin_users_id_seq;
CREATE SEQUENCE IF NOT EXISTS stock_deduction_debug_log_id_seq;
CREATE SEQUENCE IF NOT EXISTS stock_details_id_seq;
CREATE SEQUENCE IF NOT EXISTS trigger_debug_log_id_seq;
CREATE SEQUENCE IF NOT EXISTS product_price_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS migrations_id_seq;

-- =====================================================
-- END OF SCHEMA DUMP
-- ===================================================== 