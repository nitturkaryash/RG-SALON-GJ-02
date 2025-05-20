-- Add current_balance and total_membership_amount columns to members table
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS current_balance NUMERIC DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS total_membership_amount NUMERIC DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.members.current_balance
  IS 'Stores the remaining monetary value of the membership account';

COMMENT ON COLUMN public.members.total_membership_amount
  IS 'Stores the original total membership amount at time of purchase'; 