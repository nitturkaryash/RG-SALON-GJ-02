-- ===============================================
-- CLEANUP DUPLICATE CLIENTS BEFORE APPLYING CONSTRAINTS
-- ===============================================
-- This script will help clean up duplicate client names before applying unique constraints

-- Step 1: Create a backup table first
CREATE TABLE IF NOT EXISTS clients_backup AS 
SELECT * FROM public.clients;

-- Step 2: Identify and handle duplicate client names
-- This query shows all duplicates with their details
SELECT 
    LOWER(full_name) as normalized_name,
    full_name,
    id,
    phone,
    email,
    created_at,
    total_spent,
    pending_payment,
    COUNT(*) OVER (PARTITION BY LOWER(full_name)) as duplicate_count
FROM public.clients 
WHERE LOWER(full_name) IN (
    SELECT LOWER(full_name)
    FROM public.clients
    GROUP BY LOWER(full_name)
    HAVING COUNT(*) > 1
)
ORDER BY LOWER(full_name), created_at;

-- Step 3: For each duplicate group, we'll keep the earliest created record
-- and merge data from duplicates (sum total_spent, pending_payment)
-- Then delete the duplicate records

-- Create a temporary table to hold the clients we want to keep
CREATE TEMP TABLE clients_to_keep AS
WITH ranked_clients AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (
            PARTITION BY LOWER(full_name) 
            ORDER BY created_at ASC, 
                     CASE WHEN total_spent > 0 THEN 1 ELSE 2 END,
                     CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 2 END
        ) as rn
    FROM public.clients
),
aggregated_data AS (
    SELECT 
        LOWER(full_name) as normalized_name,
        SUM(COALESCE(total_spent, 0)) as total_spent_sum,
        SUM(COALESCE(pending_payment, 0)) as pending_payment_sum,
        COUNT(*) as duplicate_count
    FROM public.clients
    GROUP BY LOWER(full_name)
)
SELECT 
    rc.*,
    ad.total_spent_sum,
    ad.pending_payment_sum,
    ad.duplicate_count
FROM ranked_clients rc
JOIN aggregated_data ad ON LOWER(rc.full_name) = ad.normalized_name
WHERE rc.rn = 1;

-- Step 4: Update the clients we're keeping with aggregated data
UPDATE public.clients 
SET 
    total_spent = ctk.total_spent_sum,
    pending_payment = ctk.pending_payment_sum,
    updated_at = NOW()
FROM clients_to_keep ctk
WHERE public.clients.id = ctk.id
AND ctk.duplicate_count > 1;

-- Step 5: Delete duplicate records (keeping only the first one from each group)
DELETE FROM public.clients 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY LOWER(full_name) 
                ORDER BY created_at ASC,
                         CASE WHEN total_spent > 0 THEN 1 ELSE 2 END,
                         CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 2 END
            ) as rn
        FROM public.clients
    ) ranked
    WHERE rn > 1
);

-- Step 6: Show summary of cleanup
SELECT 
    'Before cleanup' as stage,
    COUNT(*) as total_clients,
    COUNT(DISTINCT LOWER(full_name)) as unique_names
FROM clients_backup
UNION ALL
SELECT 
    'After cleanup' as stage,
    COUNT(*) as total_clients,
    COUNT(DISTINCT LOWER(full_name)) as unique_names
FROM public.clients;

-- Step 7: Verify no duplicates remain
SELECT 
    LOWER(full_name) as normalized_name,
    COUNT(*) as count
FROM public.clients
GROUP BY LOWER(full_name)
HAVING COUNT(*) > 1;

-- If the above query returns no rows, you can proceed to apply the unique constraints
