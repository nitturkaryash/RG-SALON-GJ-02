-- Make sure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stylists table if it doesn't exist
CREATE TABLE IF NOT EXISTS stylists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If sales table doesn't exist, create it with all required columns
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Product information
    product_id UUID REFERENCES products(id),
    
    -- Transaction details
    quantity INTEGER NOT NULL DEFAULT 1,
    price_excl_gst NUMERIC(10,2) NOT NULL,
    gst_percentage NUMERIC(5,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    
    -- Calculated values
    taxable_value NUMERIC(10,2) NOT NULL,
    igst NUMERIC(10,2) DEFAULT 0,
    cgst NUMERIC(10,2) DEFAULT 0,
    sgst NUMERIC(10,2) DEFAULT 0,
    total_value NUMERIC(10,2) NOT NULL,
    
    -- Customer and stylist info
    customer_name TEXT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    stylist_name TEXT,
    stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Other')),
    invoice_number TEXT,
    
    -- Order reference (if applicable)
    order_id UUID,
    
    -- Stock tracking flags
    stock_updated BOOLEAN DEFAULT FALSE
);

-- If sales table exists, add missing columns
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'customer_name') THEN
        ALTER TABLE sales ADD COLUMN customer_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'customer_id') THEN
        ALTER TABLE sales ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'stylist_name') THEN
        ALTER TABLE sales ADD COLUMN stylist_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'stylist_id') THEN
        ALTER TABLE sales ADD COLUMN stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'invoice_number') THEN
        ALTER TABLE sales ADD COLUMN invoice_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'order_id') THEN
        ALTER TABLE sales ADD COLUMN order_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'stock_updated') THEN
        ALTER TABLE sales ADD COLUMN stock_updated BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create trigger function to update product stock on sale if it doesn't exist
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease the stock quantity in the products table
    UPDATE products
    SET 
        stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Mark the sale as stock-updated
    NEW.stock_updated = TRUE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to automatically update stock quantities
DROP TRIGGER IF EXISTS trg_update_product_stock_on_sale ON sales;
CREATE TRIGGER trg_update_product_stock_on_sale
BEFORE INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_on_sale();

-- Make sure RLS is enabled
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Select policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy 
        WHERE polname = 'sales_select_policy' AND polrelid = 'sales'::regclass
    ) THEN
        CREATE POLICY sales_select_policy ON sales
            FOR SELECT
            USING (auth.role() = 'authenticated');
    END IF;
    
    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy 
        WHERE polname = 'sales_insert_policy' AND polrelid = 'sales'::regclass
    ) THEN
        CREATE POLICY sales_insert_policy ON sales
            FOR INSERT
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
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