CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_name TEXT,
  consumption_purpose TEXT,
  consumption_notes TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'sale',
  is_salon_consumption BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  payment_method TEXT DEFAULT 'cash'
);


CREATE TABLE IF NOT EXISTS pos_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT 'service',
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  gst_percentage NUMERIC DEFAULT 18,
  hsn_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pos_order_id UUID REFERENCES pos_orders(id)
);



