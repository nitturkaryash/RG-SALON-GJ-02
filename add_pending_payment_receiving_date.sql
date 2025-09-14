-- Add pending payment receiving date to pos_orders table
-- This migration adds the pending_payment_receiving_date field to track when pending payments are expected to be received

-- Add the column if it doesn't exist
ALTER TABLE public.pos_orders 
ADD COLUMN IF NOT EXISTS pending_payment_receiving_date timestamp with time zone;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_pos_orders_pending_payment_receiving_date 
ON public.pos_orders(pending_payment_receiving_date);

-- Add comment for clarity
COMMENT ON COLUMN public.pos_orders.pending_payment_receiving_date 
IS 'Date when pending payment is expected to be received from the client';
