-- Drop the unique constraint on membership_tiers.name to allow full customizability of tier names
ALTER TABLE public.membership_tiers
  DROP CONSTRAINT IF EXISTS membership_tiers_name_key;

-- (Optionally) recreate a non-unique index if lookups by name are still desired
-- CREATE INDEX IF NOT EXISTS idx_membership_tiers_name ON public.membership_tiers(name); 