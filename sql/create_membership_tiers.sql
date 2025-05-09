-- Create the membership_tiers table

-- Ensure the uuid-ossp extension is enabled if you want to use uuid_generate_v4() as default
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.membership_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  benefits TEXT[] DEFAULT '{}'::TEXT[], -- Array of text, defaults to empty
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a trigger to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_membership_tiers
BEFORE UPDATE ON public.membership_tiers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Initial data for membership tiers
INSERT INTO public.membership_tiers (name, price, duration_months, benefits, description) VALUES
('Gold', 2999.00, 12, '{"Priority booking", "Exclusive workshops", "20% off all services"}', 'Our premium Gold membership plan.'),
('Silver', 1999.00, 12, '{"Access to all standard services", "Monthly newsletter", "10% off products"}', 'Our popular Silver membership plan.'),
('Platinum', 4999.00, 12, '{"All Gold benefits", "Personalized consultations", "Free monthly premium service", "Dedicated support line"}', 'The ultimate Platinum experience with unparalleled benefits.');

-- Set up row level security (RLS) policies
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for different operations
CREATE POLICY "Allow read access for all authenticated users" ON public.membership_tiers 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON public.membership_tiers 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" ON public.membership_tiers 
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users" ON public.membership_tiers 
  FOR DELETE USING (auth.role() = 'authenticated'); 