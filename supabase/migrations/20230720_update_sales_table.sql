-- Check if customers table exists, if not create it
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check if stylists table exists, if not create it
CREATE TABLE IF NOT EXISTS stylists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make sure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safely add columns to sales table if they don't exist
DO $$
BEGIN
    -- Add customer_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'customer_name') THEN
        ALTER TABLE sales ADD COLUMN customer_name TEXT;
    END IF;

    -- Add customer_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'customer_id') THEN
        ALTER TABLE sales ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
    END IF;

    -- Add stylist_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'stylist_name') THEN
        ALTER TABLE sales ADD COLUMN stylist_name TEXT;
    END IF;

    -- Add stylist_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'stylist_id') THEN
        ALTER TABLE sales ADD COLUMN stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL;
    END IF;

    -- Add invoice_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'invoice_number') THEN
        ALTER TABLE sales ADD COLUMN invoice_number TEXT;
    END IF;

    -- Add order_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'order_id') THEN
        ALTER TABLE sales ADD COLUMN order_id UUID;
    END IF;

    -- Add stock_updated if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'stock_updated') THEN
        ALTER TABLE sales ADD COLUMN stock_updated BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Make sure all necessary indexes exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_product_id') THEN
        CREATE INDEX idx_sales_product_id ON sales(product_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_created_at') THEN
        CREATE INDEX idx_sales_created_at ON sales(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_customer_id') THEN
        CREATE INDEX idx_sales_customer_id ON sales(customer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sales_stylist_id') THEN
        CREATE INDEX idx_sales_stylist_id ON sales(stylist_id);
    END IF;
END $$; 