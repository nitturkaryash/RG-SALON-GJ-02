-- Drop existing constraints if they exist
ALTER TABLE inventory_purchases DROP CONSTRAINT IF EXISTS inventory_purchases_transaction_type_check;
ALTER TABLE purchase_history_with_stock DROP CONSTRAINT IF EXISTS purchase_history_transaction_type_check;

-- Add updated constraint for inventory_purchases table
ALTER TABLE inventory_purchases 
ADD CONSTRAINT inventory_purchases_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'inventory_update', 'stock_increment', 'stock_decrement', 'pos_sale'));

-- Add updated constraint for purchase_history_with_stock table
ALTER TABLE purchase_history_with_stock 
ADD CONSTRAINT purchase_history_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'inventory_update', 'stock_increment', 'stock_decrement', 'pos_sale')); 