-- Disable RLS
ALTER TABLE public.stylists DISABLE ROW LEVEL SECURITY;

-- Update all stylists to use the specified user_id
UPDATE public.stylists
SET user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
WHERE true;

-- Re-enable RLS
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY; 