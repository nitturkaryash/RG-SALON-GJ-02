-- ===============================================
-- QUICK FIX: DISABLE RLS FOR DEVELOPMENT
-- This is a temporary solution to get the app working
-- ===============================================

-- Disable RLS on main tables for development
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable on other related tables if they exist and cause issues
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.stylists TO authenticated;
GRANT ALL ON public.services TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.orders TO authenticated;

-- Also grant permissions to anon users for public access
GRANT SELECT ON public.clients TO anon;
GRANT SELECT ON public.stylists TO anon;
GRANT SELECT ON public.services TO anon;

SELECT 'RLS disabled successfully! App should now work normally.' as status; 