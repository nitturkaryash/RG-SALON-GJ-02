ALTER TABLE pos_orders
ADD COLUMN IF NOT EXISTS client_id uuid;

ALTER TABLE pos_orders
ADD CONSTRAINT IF NOT EXISTS pos_orders_client_id_fkey
FOREIGN KEY (client_id) REFERENCES clients(id)
ON DELETE SET NULL;

-- Optional: Add an index for performance
CREATE INDEX IF NOT EXISTS idx_pos_orders_client_id ON pos_orders(client_id); 