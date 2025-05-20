-- Create a dedicated members table for front-end MembersPage
-- Uses existing trigger function trigger_set_timestamp for updated_at
CREATE TABLE IF NOT EXISTS public.members (
  id            UUID            NOT NULL DEFAULT gen_random_uuid(),
  client_id     UUID            NOT NULL REFERENCES public.clients(id),
  client_name   TEXT            NOT NULL,
  tier_id       UUID            NOT NULL REFERENCES public.membership_tiers(id),
  purchase_date DATE            NOT NULL DEFAULT CURRENT_DATE,
  expires_at    DATE            NOT NULL,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  CONSTRAINT members_pkey PRIMARY KEY (id)
);

-- Indexes for common lookup patterns
CREATE INDEX IF NOT EXISTS idx_members_client_id ON public.members(client_id);
CREATE INDEX IF NOT EXISTS idx_members_tier_id   ON public.members(tier_id);
CREATE INDEX IF NOT EXISTS idx_members_expiry    ON public.members(expires_at);

-- Keep updated_at in sync
CREATE TRIGGER set_timestamp_members
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp(); 