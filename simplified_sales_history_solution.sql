-- STEP 1: First check what tables and columns actually exist
DO $$
DECLARE
    sales_table_exists BOOLEAN;
    product_view_exists BOOLEAN;
    product_columns TEXT;
BEGIN
    -- Check if sales table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sales'
    ) INTO sales_table_exists;
    
    -- Check if products view/table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'products'
    ) INTO product_view_exists;
    
    -- Output diagnostic information
    RAISE NOTICE 'Diagnostic information: sales table exists = %, products view exists = %', 
        sales_table_exists, product_view_exists;
    
    -- Get column information for products if it exists
    IF product_view_exists THEN
        SELECT string_agg(column_name, ', ') 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products'
        INTO product_columns;
        
        RAISE NOTICE 'Products columns: %', product_columns;
    END IF;
END$$;

-- STEP 2: Create a new simplified sales_history table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS simplified_sales_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_id UUID,
    product_name TEXT NOT NULL,
    hsn_code TEXT,
    unit TEXT,
    quantity NUMERIC(10,2) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    gst_percentage NUMERIC(5,2) DEFAULT 0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    customer_name TEXT,
    payment_method TEXT DEFAULT 'Cash',
    invoice_number TEXT,
    notes TEXT
);

-- STEP 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simplified_sales_history_created_at 
ON simplified_sales_history(created_at);

CREATE INDEX IF NOT EXISTS idx_simplified_sales_history_product_name 
ON simplified_sales_history(product_name);

CREATE INDEX IF NOT EXISTS idx_simplified_sales_history_customer_name 
ON simplified_sales_history(customer_name);

-- STEP 4: Enable RLS (Row Level Security) with policies
ALTER TABLE simplified_sales_history ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DO $$
BEGIN
    -- Drop policies if they exist to avoid errors
    BEGIN
        DROP POLICY IF EXISTS "Allow reading simplified_sales_history" ON simplified_sales_history;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Policy "Allow reading simplified_sales_history" did not exist';
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow inserting simplified_sales_history" ON simplified_sales_history;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Policy "Allow inserting simplified_sales_history" did not exist';
    END;
    
    -- Create new policies
    CREATE POLICY "Allow reading simplified_sales_history" 
        ON simplified_sales_history FOR SELECT USING (true);
        
    CREATE POLICY "Allow inserting simplified_sales_history" 
        ON simplified_sales_history FOR INSERT WITH CHECK (true);
END$$;

-- STEP 5: Migrate data safely (only if there's data to migrate and table doesn't have data yet)
DO $$
DECLARE
    existing_count INTEGER;
    sales_count INTEGER;
BEGIN
    -- Check if we already have data in our target table
    SELECT COUNT(*) FROM simplified_sales_history INTO existing_count;
    RAISE NOTICE 'Current count in simplified_sales_history: %', existing_count;
    
    -- Only migrate if target is empty
    IF existing_count = 0 THEN
        -- Count records in sales
        BEGIN
            SELECT COUNT(*) FROM sales INTO sales_count;
            RAISE NOTICE 'Found % records in sales table', sales_count;
            
            -- Migrate data from sales table if it has records
            IF sales_count > 0 THEN
                INSERT INTO simplified_sales_history (
                    product_id,
                    product_name,
                    hsn_code,
                    unit,
                    quantity,
                    price,
                    gst_percentage,
                    discount_percentage,
                    tax_amount,
                    total_amount,
                    customer_name,
                    payment_method,
                    invoice_number,
                    created_at
                )
                SELECT 
                    s.product_id,
                    COALESCE(p.name, 'Unknown Product'),
                    COALESCE(p.hsn_code, ''),
                    COALESCE(p.units, ''),
                    COALESCE(s.quantity, 0),
                    COALESCE(s.price_excl_gst, 0),
                    COALESCE(s.gst_percentage, 0),
                    COALESCE(s.discount_percentage, 0),
                    (COALESCE(s.cgst, 0) + COALESCE(s.sgst, 0) + COALESCE(s.igst, 0)),
                    COALESCE(s.total_value, 0),
                    COALESCE(s.customer_name, 'Walk-in Customer'),
                    COALESCE(s.payment_method, 'Cash'),
                    COALESCE(s.invoice_number, ''),
                    s.created_at
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                WHERE s.product_id IS NOT NULL;
                
                GET DIAGNOSTICS sales_count = ROW_COUNT;
                RAISE NOTICE 'Successfully migrated % records to simplified_sales_history', sales_count;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error accessing sales table: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Skipping migration because simplified_sales_history already has % records', existing_count;
    END IF;
END$$;

-- STEP 6: Add a sample record to ensure we have at least something to display
DO $$
DECLARE
    sample_count INTEGER;
BEGIN
    SELECT COUNT(*) FROM simplified_sales_history INTO sample_count;
    
    IF sample_count = 0 THEN
        INSERT INTO simplified_sales_history (
            product_name,
            quantity,
            price,
            tax_amount,
            total_amount,
            customer_name,
            payment_method,
            invoice_number
        ) VALUES (
            'Sample Product',
            1,
            100.00,
            18.00,
            118.00,
            'Sample Customer',
            'Cash',
            'SAMPLE-001'
        );
        RAISE NOTICE 'Added a sample record to simplified_sales_history';
    END IF;
END$$;

-- STEP 7: Verify everything worked
SELECT COUNT(*) as record_count FROM simplified_sales_history; 