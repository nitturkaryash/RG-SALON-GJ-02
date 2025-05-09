-- File: sql/one_shot_multitenancy_setup.sql
BEGIN;

-- 1. Add tenant_id columns to your client-scoped tables
ALTER TABLE IF EXISTS public.appointments   ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS public.customers      ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS public.pos_orders     ADD COLUMN IF NOT EXISTS tenant_id TEXT NOT NULL DEFAULT '';

-- 2. Create helper function to extract tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS TEXT STABLE LANGUAGE SQL AS $$
  SELECT
    NULLIF(
      ( current_setting('request.jwt.claims', true)::JSON
          -> 'app_metadata'
          ->> 'tenant_id'
      ), ''
    );
$$;

-- 3. Enable Row-Level Security on each table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders   ENABLE ROW LEVEL SECURITY;

-- 4. Create tenant-only RLS policies
CREATE POLICY "tenant_access_all_appointments" ON public.appointments
  FOR ALL USING (tenant_id = auth.tenant_id());
CREATE POLICY "tenant_access_all_customers" ON public.customers
  FOR ALL USING (tenant_id = auth.tenant_id());
CREATE POLICY "tenant_access_all_pos_orders" ON public.pos_orders
  FOR ALL USING (tenant_id = auth.tenant_id());

-- 5. Trigger to auto-set tenant_id on insert
CREATE OR REPLACE FUNCTION public.set_tenant_id() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.tenant_id IS NULL OR NEW.tenant_id = '' THEN
    NEW.tenant_id := auth.tenant_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_tenant_id_appointments BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_customers BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
CREATE TRIGGER set_tenant_id_pos_orders BEFORE INSERT ON public.pos_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();

-- 6. One-off backfill existing rows (remove or guard this block after running)
UPDATE public.appointments SET tenant_id = u.app_metadata->>'tenant_id'
  FROM auth.users u WHERE public.appointments.user_id = u.id;
UPDATE public.customers   SET tenant_id = u.app_metadata->>'tenant_id'
  FROM auth.users u WHERE public.customers.user_id = u.id;
UPDATE public.pos_orders  SET tenant_id = u.app_metadata->>'tenant_id'
  FROM auth.users u WHERE public.pos_orders.user_id = u.id;

COMMIT;

-- ====================================================================
-- JS SNIPPET: assign or backfill tenant_id via @supabase/supabase-admin
-- const { createClient } = require('@supabase/supabase-admin');
-- const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
-- 
-- // New user signup with tenant_id:
-- await supabaseAdmin.auth.admin.createUser({
--   email,
--   password,
--   app_metadata: { tenant_id: 'abc-123' }
-- });
-- 
-- // One-off backfill existing users:
-- const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
-- for (const u of users) {
--   await supabaseAdmin.auth.admin.updateUserById(u.id, {
--     app_metadata: { tenant_id: 'default-tenant-id' }
--   });
-- }

-- ====================================================================
-- TESTING & GRADUAL ROLLOUT:
-- 1) In staging, create 2 test users with different tenant_ids
-- 2) Log in as each user; verify data isolation
-- 3) Deploy migration to production
-- 4) Monitor RLS enforcement; flip policies restrictive if needed
-- 5) Audit auth.users.app_metadata periodically
-- ==================================================================== 