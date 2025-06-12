-- Add multi-expert fields to pos_orders table
-- This will allow proper tracking of multi-expert orders

ALTER TABLE pos_orders 
  ADD COLUMN IF NOT EXISTS multi_expert BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_experts INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS expert_index INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id);

-- Create index for efficient querying of multi-expert orders
CREATE INDEX IF NOT EXISTS idx_pos_orders_appointment_id ON pos_orders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_multi_expert ON pos_orders(multi_expert);

-- Add a comment explaining the fields
COMMENT ON COLUMN pos_orders.multi_expert IS 'Indicates if this order is part of a multi-expert appointment';
COMMENT ON COLUMN pos_orders.total_experts IS 'Total number of experts involved in this appointment';
COMMENT ON COLUMN pos_orders.expert_index IS 'Index of this expert in the multi-expert order (1-based)';
COMMENT ON COLUMN pos_orders.appointment_id IS 'Reference to the appointment this order belongs to'; 