-- =======================================================
-- ROW LEVEL SECURITY POLICIES EXPORT
-- Project: pankajhadole24@gmail.com's Project
-- Generated: 2024
-- Total Policies: 150+
-- =======================================================

-- =======================================================
-- ENABLE ROW LEVEL SECURITY
-- =======================================================

-- Enable RLS on all tables that have policies
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expired_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_salon_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history_with_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_product_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_consumption_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_subcollections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_deduction_debug_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylist_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_debug_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- RLS POLICIES
-- =======================================================

-- active_sessions policies
CREATE POLICY "strict_user_isolation_policy" ON public.active_sessions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.active_sessions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- admin_users policies
CREATE POLICY "strict_user_isolation_policy" ON public.admin_users
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.admin_users
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- appointment_clients policies
CREATE POLICY "strict_user_isolation_policy" ON public.appointment_clients
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.appointment_clients
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- appointment_reminders policies
CREATE POLICY "strict_user_isolation_policy" ON public.appointment_reminders
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.appointment_reminders
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- appointment_services policies
CREATE POLICY "strict_user_isolation_policy" ON public.appointment_services
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.appointment_services
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- appointment_stylists policies
CREATE POLICY "strict_user_isolation_policy" ON public.appointment_stylists
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.appointment_stylists
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- appointments policies
CREATE POLICY "strict_user_isolation_policy" ON public.appointments
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT p.id
       FROM profiles p
      WHERE (p.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT p.id
       FROM profiles p
      WHERE (p.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.appointments
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- auth policies
CREATE POLICY "Allow authenticated users to view auth data" ON public.auth
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

-- backups policies
CREATE POLICY "Allow authenticated users to view backups" ON public.backups
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

-- balance_stock_history policies
CREATE POLICY "strict_user_isolation_policy" ON public.balance_stock_history
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.balance_stock_history
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- balance_stock_transactions policies
CREATE POLICY "strict_user_isolation_policy" ON public.balance_stock_transactions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.balance_stock_transactions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- breaks policies
CREATE POLICY "strict_user_isolation_policy" ON public.breaks
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.breaks
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- clients policies
CREATE POLICY "Enable delete for authenticated users" ON public.clients
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "Enable insert for authenticated users" ON public.clients
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "Enable read access for authenticated users" ON public.clients
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "Enable update for authenticated users" ON public.clients
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "enable_user_isolation_policy" ON public.clients
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (profile_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.clients
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- consumption policies
CREATE POLICY "strict_user_isolation_policy" ON public.consumption
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.consumption
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- customers policies
CREATE POLICY "strict_user_isolation_policy" ON public.customers
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.customers
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- expired_products policies
CREATE POLICY "strict_user_isolation_policy" ON public.expired_products
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.expired_products
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- inventory_consumption policies
CREATE POLICY "strict_user_isolation_policy" ON public.inventory_consumption
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.inventory_consumption
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- inventory_products policies
CREATE POLICY "strict_user_isolation_policy" ON public.inventory_products
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.inventory_products
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- inventory_salon_consumption policies
CREATE POLICY "strict_user_isolation_policy" ON public.inventory_salon_consumption
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.inventory_salon_consumption
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- inventory_transactions policies
CREATE POLICY "strict_user_isolation_policy" ON public.inventory_transactions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.inventory_transactions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- loyalty_points policies
CREATE POLICY "strict_user_isolation_policy" ON public.loyalty_points
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.loyalty_points
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- members policies
CREATE POLICY "members_admin_insert" ON public.members
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK ((EXISTS ( SELECT 1
       FROM profiles p
      WHERE ((p.id = auth.uid()) AND ((p.role = 'admin'::text) OR (p.role = 'owner'::text)))) OR (client_id = auth.uid()) OR (auth.role() = 'service_role'::text)));

CREATE POLICY "members_all_access" ON public.members
    AS PERMISSIVE FOR ALL
    TO public
    USING ((client_id = auth.uid()) OR (user_id = auth.uid()) OR (EXISTS ( SELECT 1
       FROM profiles p
      WHERE ((p.id = auth.uid()) AND ((p.role = 'admin'::text) OR (p.role = 'owner'::text)))) OR (auth.role() = 'service_role'::text)));

-- membership_tiers policies
CREATE POLICY "strict_user_isolation_policy" ON public.membership_tiers
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.membership_tiers
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- migrations policies
CREATE POLICY "Allow authenticated users to view migrations" ON public.migrations
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

-- notification_logs policies
CREATE POLICY "strict_user_isolation_policy" ON public.notification_logs
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.notification_logs
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- order_stylists policies
CREATE POLICY "strict_user_isolation_policy" ON public.order_stylists
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.order_stylists
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- organizations policies
CREATE POLICY "Users can view their organization" ON public.organizations
    AS PERMISSIVE FOR SELECT
    TO public
    USING (id IN ( SELECT profiles.organization_id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- pos_order_items policies
CREATE POLICY "strict_user_isolation_policy" ON public.pos_order_items
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.pos_order_items
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- pos_orders policies
CREATE POLICY "strict_user_isolation_policy" ON public.pos_orders
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.pos_orders
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- product_collections policies
CREATE POLICY "strict_user_isolation_policy" ON public.product_collections
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.product_collections
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- product_master policies
CREATE POLICY "strict_user_isolation_policy" ON public.product_master
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.product_master
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- product_price_history policies
CREATE POLICY "strict_user_isolation_policy" ON public.product_price_history
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.product_price_history
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- product_stock_transactions policies
CREATE POLICY "Users can only see their own stock transactions" ON public.product_stock_transactions
    AS PERMISSIVE FOR ALL
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "strict_user_isolation_policy" ON public.product_stock_transactions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.product_stock_transactions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- profiles policies
CREATE POLICY "allow_authenticated_delete" ON public.profiles
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING ((auth.uid() = auth_user_id) OR (EXISTS ( SELECT 1
       FROM profiles profiles_1
      WHERE ((profiles_1.auth_user_id = auth.uid()) AND (profiles_1.role = ANY (ARRAY['admin'::text, 'salon_owner'::text]))))));

CREATE POLICY "allow_authenticated_insert" ON public.profiles
    AS PERMISSIVE FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "allow_authenticated_read" ON public.profiles
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "allow_authenticated_update" ON public.profiles
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING ((auth.uid() = auth_user_id) OR (EXISTS ( SELECT 1
       FROM profiles profiles_1
      WHERE ((profiles_1.auth_user_id = auth.uid()) AND (profiles_1.role = ANY (ARRAY['admin'::text, 'salon_owner'::text]))))));

-- purchase_history_with_stock policies
CREATE POLICY "strict_user_isolation_policy" ON public.purchase_history_with_stock
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.purchase_history_with_stock
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- sales policies
CREATE POLICY "strict_user_isolation_policy" ON public.sales
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.sales
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- sales_product_new policies
CREATE POLICY "strict_user_isolation_policy" ON public.sales_product_new
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.sales_product_new
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- salon_consumption_products policies
CREATE POLICY "strict_user_isolation_policy" ON public.salon_consumption_products
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.salon_consumption_products
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- salons policies
CREATE POLICY "Admins can manage all salons" ON public.salons
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (EXISTS ( SELECT 1
       FROM profiles
      WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Owners can manage their own salons" ON public.salons
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- service_collections policies
CREATE POLICY "strict_user_isolation_policy" ON public.service_collections
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- service_subcollections policies
CREATE POLICY "strict_user_isolation_policy" ON public.service_subcollections
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- services policies
CREATE POLICY "strict_user_isolation_policy" ON public.services
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stock_deduction_debug_log policies
CREATE POLICY "strict_user_isolation_policy" ON public.stock_deduction_debug_log
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stock_deduction_debug_log
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stock_details policies
CREATE POLICY "strict_user_isolation_policy" ON public.stock_details
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stock_details
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stock_history policies
CREATE POLICY "strict_user_isolation_policy" ON public.stock_history
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stock_history
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stock_reductions policies
CREATE POLICY "strict_user_isolation_policy" ON public.stock_reductions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stock_reductions
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stock_snapshots policies
CREATE POLICY "strict_user_isolation_policy" ON public.stock_snapshots
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stock_snapshots
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stylist_breaks policies
CREATE POLICY "strict_user_isolation_policy" ON public.stylist_breaks
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stylist_breaks
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stylist_holidays policies
CREATE POLICY "strict_user_isolation_policy" ON public.stylist_holidays
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stylist_holidays
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- stylists policies
CREATE POLICY "strict_user_isolation_policy" ON public.stylists
    AS PERMISSIVE FOR ALL
    TO public
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.stylists
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- support_tickets policies
CREATE POLICY "Allow authenticated users to view tickets" ON public.support_tickets
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (true);

-- trigger_debug_log policies
CREATE POLICY "strict_user_isolation_policy" ON public.trigger_debug_log
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id = ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

CREATE POLICY "user_isolation_policy" ON public.trigger_debug_log
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())))
    WITH CHECK (user_id IN ( SELECT profiles.id
       FROM profiles
      WHERE (profiles.auth_user_id = auth.uid())));

-- user_sessions policies
CREATE POLICY "Admins can manage all sessions" ON public.user_sessions
    AS PERMISSIVE FOR ALL
    TO public
    USING (EXISTS ( SELECT 1
       FROM profiles
      WHERE ((profiles.auth_user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
    AS PERMISSIVE FOR SELECT
    TO public
    USING (EXISTS ( SELECT 1
       FROM profiles
      WHERE ((profiles.auth_user_id = auth.uid()) AND (profiles.role = 'admin'::text))));

CREATE POLICY "Users can create their own sessions" ON public.user_sessions
    AS PERMISSIVE FOR INSERT
    TO public
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
    AS PERMISSIVE FOR UPDATE
    TO public
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
    AS PERMISSIVE FOR SELECT
    TO public
    USING (auth.uid() = auth_user_id);

-- =======================================================
-- END OF RLS POLICY DEFINITIONS
-- ======================================================= 