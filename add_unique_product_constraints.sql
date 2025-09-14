-- ===============================================
-- ADD UNIQUE CONSTRAINTS FOR PRODUCT DUPLICATE PREVENTION
-- ===============================================
-- This script adds database-level constraints to prevent duplicate products

-- Add unique constraint on product name (case-insensitive)
-- This prevents duplicate product names regardless of case
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_master_name_unique 
ON public.product_master (LOWER(name));

-- Add unique constraint on HSN code (when not null and not empty)
-- HSN codes should be unique as they represent specific product categories
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_master_hsn_unique 
ON public.product_master (hsn_code) 
WHERE hsn_code IS NOT NULL AND hsn_code != '';

-- Add comments to document these constraints
COMMENT ON INDEX idx_product_master_name_unique IS 'Prevents duplicate product names (case-insensitive)';
COMMENT ON INDEX idx_product_master_hsn_unique IS 'Prevents duplicate HSN codes';

-- Verify the constraints are in place
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'product_master' 
AND indexname IN ('idx_product_master_name_unique', 'idx_product_master_hsn_unique');
