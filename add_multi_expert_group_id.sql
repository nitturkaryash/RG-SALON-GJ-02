-- Add multi_expert_group_id field to pos_orders table
-- This will allow proper grouping of walk-in multi-expert orders

ALTER TABLE pos_orders 
  ADD COLUMN IF NOT EXISTS multi_expert_group_id UUID;

-- Create index for efficient querying of multi-expert group orders
CREATE INDEX IF NOT EXISTS idx_pos_orders_multi_expert_group_id ON pos_orders(multi_expert_group_id);

-- Add a comment explaining the field
COMMENT ON COLUMN pos_orders.multi_expert_group_id IS 'Groups walk-in multi-expert orders that belong to the same customer transaction'; 