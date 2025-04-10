-- POS Schema for R&G Salon

-- Table 1: POS Orders
CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  customer_name TEXT DEFAULT 'Salon Internal',
  stylist_name TEXT,
  purchase_type TEXT NOT NULL DEFAULT 'regular',
  payment_method TEXT DEFAULT 'Cash',
  status TEXT DEFAULT 'Unknown',
  total_amount FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: POS Order Items
CREATE TABLE IF NOT EXISTS pos_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES pos_orders(order_id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price FLOAT DEFAULT 0,
  total_price FLOAT DEFAULT 0,
  type TEXT DEFAULT 'Product',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_pos_orders_date ON pos_orders(date);
CREATE INDEX IF NOT EXISTS idx_pos_orders_type ON pos_orders(purchase_type);
CREATE INDEX IF NOT EXISTS idx_pos_order_items_order ON pos_order_items(order_id);

-- Create a view for salon consumption orders
CREATE OR REPLACE VIEW salon_consumption_orders AS
SELECT 
  o.id,
  o.order_id,
  o.date,
  i.product_name,
  i.quantity,
  o.stylist_name,
  o.status,
  i.total_price as total_amount,
  i.type,
  o.payment_method
FROM 
  pos_orders o
JOIN 
  pos_order_items i ON o.order_id = i.order_id
WHERE 
  o.purchase_type = 'salon_consumption'
ORDER BY 
  o.date DESC; 