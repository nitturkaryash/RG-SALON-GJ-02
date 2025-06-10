-- Check if client_name column exists, add it if not
DO $$
BEGIN
    BEGIN
        -- Check if client_name column exists
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'appointments'
            AND column_name = 'client_name'
        ) THEN
            -- Add client_name column if it doesn't exist
            ALTER TABLE appointments
            ADD COLUMN client_name TEXT;
            
            RAISE NOTICE 'Added client_name column to appointments table';
        ELSE
            RAISE NOTICE 'client_name column already exists in appointments table';
        END IF;
    END;

    BEGIN
        -- Check if client_phone column exists
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'appointments'
            AND column_name = 'client_phone'
        ) THEN
            -- Add client_phone column if it doesn't exist
            ALTER TABLE appointments
            ADD COLUMN client_phone TEXT;
            
            RAISE NOTICE 'Added client_phone column to appointments table';
        ELSE
            RAISE NOTICE 'client_phone column already exists in appointments table';
        END IF;
    END;
END $$; 