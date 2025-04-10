-- Add discount_percentage column to purchases table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'purchases' AND column_name = 'discount_percentage') THEN
        ALTER TABLE purchases ADD COLUMN discount_percentage NUMERIC(5,2) DEFAULT 0;
        RAISE NOTICE 'Added discount_percentage column to purchases table.';
    ELSE
        RAISE NOTICE 'discount_percentage column already exists in purchases table.';
    END IF;
END $$;

-- Add updated_at column to purchases table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'purchases' AND column_name = 'updated_at') THEN
        ALTER TABLE purchases ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to purchases table.';
    ELSE
        -- Ensure the default value is set even if the column exists
        ALTER TABLE purchases ALTER COLUMN updated_at SET DEFAULT NOW();
        RAISE NOTICE 'updated_at column already exists in purchases table, ensured default is set.';
    END IF;
END $$;

-- Optional: Ensure created_at column exists and has default
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'purchases' AND column_name = 'created_at') THEN
        ALTER TABLE purchases ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to purchases table.';
    ELSE
        -- Ensure the default value is set even if the column exists
        ALTER TABLE purchases ALTER COLUMN created_at SET DEFAULT NOW();
        RAISE NOTICE 'created_at column already exists in purchases table, ensured default is set.';
    END IF;
END $$;

-- Optional: Add an index for product_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_product_id' AND tablename = 'purchases') THEN
        CREATE INDEX idx_purchases_product_id ON purchases(product_id);
        RAISE NOTICE 'Created index idx_purchases_product_id on purchases table.';
    ELSE
        RAISE NOTICE 'Index idx_purchases_product_id already exists on purchases table.';
    END IF;
END $$; 