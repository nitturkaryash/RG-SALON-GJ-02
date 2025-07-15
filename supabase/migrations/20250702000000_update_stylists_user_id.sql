-- Disable RLS
ALTER TABLE public.stylists DISABLE ROW LEVEL SECURITY;

-- Update all stylists to use Surat Admin's user_id
UPDATE public.stylists
SET user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
WHERE true;

-- Re-enable RLS
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;

-- Verify the update (with RLS disabled for the check)
ALTER TABLE public.stylists DISABLE ROW LEVEL SECURITY;
SELECT COUNT(*) as updated_count 
FROM public.stylists 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b';
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY; 