-- List all tables in the database to see what's available
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Also check for any tables with 'sales' in the name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%sales%'
ORDER BY table_name; 