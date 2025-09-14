-- ===============================================
-- CLEANUP DUPLICATE PRODUCTS BEFORE APPLYING CONSTRAINTS
-- ===============================================
-- This script will help clean up duplicate product names and HSN codes before applying unique constraints

-- Step 1: Create a backup table first
CREATE TABLE IF NOT EXISTS product_master_backup AS 
SELECT * FROM public.product_master;

-- Step 2: Check for existing duplicates
SELECT 
    'Current duplicate analysis' as stage,
    COUNT(*) as total_products,
    COUNT(DISTINCT LOWER(name)) as unique_names,
    COUNT(*) - COUNT(DISTINCT LOWER(name)) as duplicate_names
FROM public.product_master;

-- Step 3: Show duplicate product names
SELECT 
    LOWER(name) as normalized_name,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as product_ids,
    STRING_AGG(name, ' | ') as actual_names
FROM public.product_master 
GROUP BY LOWER(name) 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 4: Show duplicate HSN codes (if any)
SELECT 
    hsn_code,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as product_ids,
    STRING_AGG(name, ' | ') as product_names
FROM public.product_master 
WHERE hsn_code IS NOT NULL AND hsn_code != ''
GROUP BY hsn_code 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 5: Remove duplicate product names (keep the most recent one)
-- This will delete older duplicates, keeping only the newest product for each name
DELETE FROM public.product_master p1
WHERE EXISTS (
    SELECT 1 
    FROM public.product_master p2 
    WHERE LOWER(p1.name) = LOWER(p2.name)
    AND p1.id != p2.id
    AND (
        p1.created_at < p2.created_at 
        OR (p1.created_at = p2.created_at AND p1.id < p2.id)
    )
);

-- Step 6: Remove duplicate HSN codes (keep the most recent one)
-- This will delete older duplicates, keeping only the newest product for each HSN code
DELETE FROM public.product_master p1
WHERE hsn_code IS NOT NULL AND hsn_code != ''
AND EXISTS (
    SELECT 1 
    FROM public.product_master p2 
    WHERE p1.hsn_code = p2.hsn_code
    AND p1.id != p2.id
    AND (
        p1.created_at < p2.created_at 
        OR (p1.created_at = p2.created_at AND p1.id < p2.id)
    )
);

-- Step 7: Show summary of cleanup
SELECT 
    'Before cleanup' as stage,
    COUNT(*) as total_products,
    COUNT(DISTINCT LOWER(name)) as unique_names
FROM product_master_backup
UNION ALL
SELECT 
    'After cleanup' as stage,
    COUNT(*) as total_products,
    COUNT(DISTINCT LOWER(name)) as unique_names
FROM public.product_master;

-- Step 8: Verify no duplicates remain
SELECT 
    LOWER(name) as normalized_name,
    COUNT(*) as count
FROM public.product_master 
GROUP BY LOWER(name) 
HAVING COUNT(*) > 1;

-- If the above query returns no results, you're ready to apply the unique constraints
-- Run add_unique_product_constraints.sql next
