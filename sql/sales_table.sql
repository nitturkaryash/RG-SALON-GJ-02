-- Create sales table for tracking POS transactions
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Product information (linked to Product Master)
    product_id UUID REFERENCES products(id),
    
    -- Transaction details
    quantity INTEGER NOT NULL DEFAULT 1,
    price_excl_gst NUMERIC(10,2) NOT NULL,
    gst_percentage NUMERIC(5,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    
    -- Calculated values
    taxable_value NUMERIC(10,2) NOT NULL, -- price_excl_gst * quantity (after discount)
    igst NUMERIC(10,2) DEFAULT 0,
    cgst NUMERIC(10,2) DEFAULT 0,
    sgst NUMERIC(10,2) DEFAULT 0,
    total_value NUMERIC(10,2) NOT NULL,  -- taxable_value + GST amounts
    
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

-- Create a trigger to update product stock when a sale is recorded
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

-- Add RLS policies for secure access
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all sales records
CREATE POLICY sales_select_policy ON sales
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert sales records
CREATE POLICY sales_insert_policy ON sales
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_stylist_id ON sales(stylist_id); 