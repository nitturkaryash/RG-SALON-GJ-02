-- Check if sales table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sales'
) as "sales_table_exists";

-- Get column information for sales table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'sales'
ORDER BY ordinal_position;

-- Get constraints on sales table
SELECT
    con.conname as constraint_name,
    con.contype as constraint_type,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM
    pg_constraint con
JOIN
    pg_class rel ON rel.oid = con.conrelid
JOIN
    pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE
    nsp.nspname = 'public'
    AND rel.relname = 'sales'; 