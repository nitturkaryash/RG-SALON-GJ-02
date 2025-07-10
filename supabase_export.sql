-- Supabase Database Export
-- Generated at: 2024-03-14

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS public.admin_users_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.migrations_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.product_price_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.stock_details_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.stock_deduction_debug_log_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.trigger_debug_log_id_seq;

-- Create tables
CREATE TABLE IF NOT EXISTS public.active_sessions (
    user_agent text,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    ip_address text,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    last_active timestamp with time zone DEFAULT now(),
    started_at timestamp with time zone DEFAULT now(),
    user_id uuid
);

CREATE TABLE IF NOT EXISTS public.admin_backup_logs (
    event_type character varying(50) NOT NULL,
    message text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    details jsonb,
    backup_id uuid,
    id uuid NOT NULL DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS public.admin_backup_schedules (
    backup_type text NOT NULL DEFAULT 'full'::text,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    retention_days integer NOT NULL DEFAULT 30,
    is_active boolean DEFAULT true,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    last_run_at timestamp with time zone,
    cron_expression character varying(100) NOT NULL,
    frequency character varying(50) NOT NULL,
    description text
);

CREATE TABLE IF NOT EXISTS public.breaks (
    user_id uuid,
    description text,
    stylist_id uuid,
    updated_at timestamp with time zone DEFAULT now(),
    start_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    end_time timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clients (
    notes text,
    anniversary_date date,
    updated_at timestamp with time zone DEFAULT now(),
    mobile_number character varying(20) NOT NULL DEFAULT ''::character varying,
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    last_visit timestamp with time zone,
    total_spent numeric DEFAULT 0,
    pending_payment numeric DEFAULT 0,
    user_id uuid,
    profile_id uuid,
    appointment_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    birth_date date,
    phone text,
    email text,
    full_name text NOT NULL,
    gender text
);

CREATE TABLE IF NOT EXISTS public.consumption (
    product_id uuid NOT NULL,
    qty numeric(10,2) NOT NULL DEFAULT 0,
    original_sale_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    purpose text,
    date text,
    id uuid NOT NULL,
    transaction_type text DEFAULT 'consumption'::text,
    user_id uuid
);

CREATE TABLE IF NOT EXISTS public.customers (
    updated_at timestamp with time zone DEFAULT now(),
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    name text NOT NULL,
    email text,
    phone text,
    tenant_id text NOT NULL DEFAULT ''::text
);

CREATE TABLE IF NOT EXISTS public.data_import_logs (
    success boolean NOT NULL DEFAULT false,
    rows_imported integer NOT NULL DEFAULT 0,
    user_id uuid,
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    table_name text NOT NULL,
    error_message text,
    file_name text,
    missing_data_strategy jsonb,
    column_mappings jsonb,
    validation_errors jsonb,
    import_duration integer,
    file_size integer,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expired_products (
    expiry_date timestamp without time zone NOT NULL,
    hsn_code text,
    product_name text NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    user_id uuid,
    notes text,
    units text,
    expired_id uuid NOT NULL DEFAULT uuid_generate_v4(),
    date timestamp without time zone NOT NULL DEFAULT now(),
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_consumption (
    updated_at timestamp without time zone DEFAULT now(),
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
    user_id uuid,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    requisition_voucher_no text,
    purchase_sgst double precision,
    purchase_cgst double precision,
    purchase_igst double precision,
    purchase_taxable_value double precision,
    purchase_gst_percentage double precision,
    purchase_cost_per_unit_ex_gst double precision,
    created_at timestamp without time zone DEFAULT now(),
    consumption_qty integer NOT NULL,
    date timestamp without time zone NOT NULL DEFAULT now(),
    consumption_id uuid NOT NULL DEFAULT uuid_generate_v4()
);

-- ... (continuing with all other tables)

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_id ON public.appointments(stylist_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_products_user_id ON public.inventory_products(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_user_id ON public.pos_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON public.stylists(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.clients
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" ON public.appointments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" ON public.services
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" ON public.stylists
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.appointments
    ADD CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES public.clients(id),
    ADD CONSTRAINT fk_appointments_stylist FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);

ALTER TABLE public.pos_order_items
    ADD CONSTRAINT fk_pos_order_items_order FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id);

ALTER TABLE public.clients
    ADD CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Set primary keys
ALTER TABLE public.active_sessions ADD PRIMARY KEY (id);
ALTER TABLE public.admin_backup_logs ADD PRIMARY KEY (id);
ALTER TABLE public.admin_backup_schedules ADD PRIMARY KEY (id);
ALTER TABLE public.appointments ADD PRIMARY KEY (id);
ALTER TABLE public.clients ADD PRIMARY KEY (id);
ALTER TABLE public.inventory_products ADD PRIMARY KEY (product_id);
ALTER TABLE public.pos_orders ADD PRIMARY KEY (id);
ALTER TABLE public.services ADD PRIMARY KEY (id);
ALTER TABLE public.stylists ADD PRIMARY KEY (id);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- End of schema export
