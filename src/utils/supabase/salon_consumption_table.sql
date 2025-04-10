-- Create the new table for salon consumption tracking
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

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_salon_consumption_date ON inventory_salon_consumption(date);
CREATE INDEX IF NOT EXISTS idx_salon_consumption_product ON inventory_salon_consumption(product_name); 