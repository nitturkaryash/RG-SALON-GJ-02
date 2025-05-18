-- Alter the pos_orders table to change column types
ALTER TABLE IF EXISTS pos_orders 
  ALTER COLUMN stock_snapshot TYPE TEXT,
  ALTER COLUMN current_stock TYPE TEXT; 