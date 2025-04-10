-- Check if last_visit column exists
DO $$
DECLARE
   column_exists boolean;
BEGIN
   SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name = 'last_visit'
   ) INTO column_exists;

   IF NOT column_exists THEN
      EXECUTE 'ALTER TABLE clients ADD COLUMN last_visit TIMESTAMP WITH TIME ZONE';
      RAISE NOTICE 'Added last_visit column to clients table';
   ELSE
      RAISE NOTICE 'last_visit column already exists';
   END IF;
END $$;

-- Check if other required columns exist
DO $$
DECLARE
   column_exists boolean;
BEGIN
   SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name = 'notes'
   ) INTO column_exists;

   IF NOT column_exists THEN
      EXECUTE 'ALTER TABLE clients ADD COLUMN notes TEXT';
      RAISE NOTICE 'Added notes column to clients table';
   ELSE
      RAISE NOTICE 'notes column already exists';
   END IF;
END $$;

DO $$
DECLARE
   column_exists boolean;
BEGIN
   SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name = 'total_spent'
   ) INTO column_exists;

   IF NOT column_exists THEN
      EXECUTE 'ALTER TABLE clients ADD COLUMN total_spent NUMERIC DEFAULT 0';
      RAISE NOTICE 'Added total_spent column to clients table';
   ELSE
      RAISE NOTICE 'total_spent column already exists';
   END IF;
END $$;

DO $$
DECLARE
   column_exists boolean;
BEGIN
   SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'clients'
      AND column_name = 'pending_payment'
   ) INTO column_exists;

   IF NOT column_exists THEN
      EXECUTE 'ALTER TABLE clients ADD COLUMN pending_payment NUMERIC DEFAULT 0';
      RAISE NOTICE 'Added pending_payment column to clients table';
   ELSE
      RAISE NOTICE 'pending_payment column already exists';
   END IF;
END $$; 