-- Add transaction_type column to purchases table to distinguish between purchases and inventory updates
-- This migration ensures backward compatibility by setting existing records as 'purchase'

-- Add the transaction_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'purchases' 
        AND column_name = 'transaction_type'
    ) THEN
        ALTER TABLE purchases 
        ADD COLUMN transaction_type VARCHAR(20) DEFAULT 'purchase';
        
        -- Add a check constraint to ensure only valid values
        ALTER TABLE purchases 
        ADD CONSTRAINT purchases_transaction_type_check 
        CHECK (transaction_type IN ('purchase', 'inventory_update'));
        
        -- Update all existing records to be 'purchase' type
        UPDATE purchases 
        SET transaction_type = 'purchase' 
        WHERE transaction_type IS NULL;
        
        -- Make the column NOT NULL after updating existing records
        ALTER TABLE purchases 
        ALTER COLUMN transaction_type SET NOT NULL;
        
        RAISE NOTICE 'Added transaction_type column to purchases table';
    ELSE
        RAISE NOTICE 'transaction_type column already exists in purchases table';
    END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_type 
ON purchases(transaction_type);

-- Add comments for documentation
COMMENT ON COLUMN purchases.transaction_type IS 'Type of transaction: purchase (normal purchase with invoice) or inventory_update (stock adjustment without invoice)';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'purchases' 
AND column_name = 'transaction_type'; 