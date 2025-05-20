-- Add current_balance column to members table
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS current_balance NUMERIC DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.members.current_balance
  IS 'Stores the remaining monetary value of the membership account'; 