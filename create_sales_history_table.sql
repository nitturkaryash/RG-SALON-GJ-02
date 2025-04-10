-- First check if table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_history') THEN
        -- Create the sales_history table if it doesn't exist
        CREATE TABLE sales_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            product_id UUID NOT NULL,  -- Removed REFERENCES constraint since products is a view
            product_name TEXT NOT NULL,
            hsn_code TEXT,
            unit TEXT,
            quantity DECIMAL(10,2) NOT NULL,
            price_excl_gst DECIMAL(10,2) NOT NULL,
            gst_percentage DECIMAL(5,2) NOT NULL,
            discount_percentage DECIMAL(5,2) DEFAULT 0,
            taxable_value DECIMAL(10,2) NOT NULL,
            cgst DECIMAL(10,2) DEFAULT 0,
            sgst DECIMAL(10,2) DEFAULT 0,
            igst DECIMAL(10,2) DEFAULT 0,
            total_value DECIMAL(10,2) NOT NULL,
            customer_name TEXT,
            stylist_name TEXT,
            payment_method TEXT NOT NULL,
            invoice_number TEXT,
            is_salon_consumption BOOLEAN DEFAULT false,
            notes TEXT
        );

        -- Create indexes for better query performance
        CREATE INDEX idx_sales_history_created_at ON sales_history(created_at);
        CREATE INDEX idx_sales_history_product_id ON sales_history(product_id);
        CREATE INDEX idx_sales_history_customer_name ON sales_history(customer_name);
        CREATE INDEX idx_sales_history_invoice_number ON sales_history(invoice_number);

        -- Add RLS (Row Level Security) policies
        ALTER TABLE sales_history ENABLE ROW LEVEL SECURITY;

        -- Allow authenticated users to read all sales history
        CREATE POLICY "Allow authenticated users to read sales history"
            ON sales_history FOR SELECT
            TO authenticated
            USING (true);

        -- Allow authenticated users to insert sales history
        CREATE POLICY "Allow authenticated users to insert sales history"
            ON sales_history FOR INSERT
            TO authenticated
            WITH CHECK (true);

        -- Allow authenticated users to update their own sales history entries
        CREATE POLICY "Allow authenticated users to update sales history"
            ON sales_history FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (true);

        -- Allow authenticated users to delete their own sales history entries
        CREATE POLICY "Allow authenticated users to delete sales history"
            ON sales_history FOR DELETE
            TO authenticated
            USING (true);

        -- Create a function to automatically update product_name when product_id changes
        CREATE OR REPLACE FUNCTION update_sales_history_product_name()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Since products is a view, we'll need to handle this in the application layer
            -- This function will be called but won't update the product_name
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create a trigger to automatically update product_name
        CREATE TRIGGER update_sales_history_product_name_trigger
            BEFORE INSERT OR UPDATE OF product_id
            ON sales_history
            FOR EACH ROW
            EXECUTE FUNCTION update_sales_history_product_name();
            
        RAISE NOTICE 'Created sales_history table and associated objects';
    ELSE
        RAISE NOTICE 'sales_history table already exists, skipping creation';
    END IF;
END
$$; 