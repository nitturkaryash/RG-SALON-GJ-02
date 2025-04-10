-- Migration to create the inventory_salon_consumption table
-- This should be applied through the Supabase Studio SQL Editor or via migrations

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the inventory_salon_consumption table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_salon_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  product_name TEXT NOT NULL,
  hsn_code TEXT,
  units TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  purpose TEXT DEFAULT 'Salon Use',
  stylist_name TEXT,
  notes TEXT,
  price_per_unit NUMERIC DEFAULT 0,
  gst_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create relevant indexes
CREATE INDEX IF NOT EXISTS idx_salon_consumption_date ON inventory_salon_consumption(date);
CREATE INDEX IF NOT EXISTS idx_salon_consumption_product ON inventory_salon_consumption(product_name);

-- Function to check if the table exists
CREATE OR REPLACE FUNCTION check_inventory_salon_consumption_table()
RETURNS BOOLEAN AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_salon_consumption'
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$ LANGUAGE plpgsql; 