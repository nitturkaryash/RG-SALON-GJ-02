-- Combined migrations for Supabase

-- Create inventory tables
CREATE TABLE IF NOT EXISTS inventory_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * cost_per_unit) STORED
);

CREATE TABLE IF NOT EXISTS inventory_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED
);

CREATE TABLE IF NOT EXISTS inventory_balance_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    current_stock INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED
);

-- Create triggers to update balance_stock
CREATE OR REPLACE FUNCTION update_balance_stock() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- For purchases, add to stock
        IF TG_TABLE_NAME = 'inventory_purchases' THEN
            INSERT INTO inventory_balance_stock (product_id, current_stock)
            VALUES (NEW.product_id, NEW.quantity)
            ON CONFLICT (product_id) DO UPDATE
            SET current_stock = inventory_balance_stock.current_stock + NEW.quantity,
                last_updated = CURRENT_TIMESTAMP;
        -- For sales, subtract from stock
        ELSIF TG_TABLE_NAME = 'inventory_sales' THEN
            INSERT INTO inventory_balance_stock (product_id, current_stock)
            VALUES (NEW.product_id, -NEW.quantity)
            ON CONFLICT (product_id) DO UPDATE
            SET current_stock = inventory_balance_stock.current_stock - NEW.quantity,
                last_updated = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_purchase
AFTER INSERT ON inventory_purchases
FOR EACH ROW
EXECUTE FUNCTION update_balance_stock();

CREATE TRIGGER update_stock_on_sale
AFTER INSERT ON inventory_sales
FOR EACH ROW
EXECUTE FUNCTION update_balance_stock();

-- Create RLS policies
ALTER TABLE inventory_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_balance_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_products ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read inventory_purchases"
ON inventory_purchases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert into inventory_purchases"
ON inventory_purchases FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read inventory_sales"
ON inventory_sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert into inventory_sales"
ON inventory_sales FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read inventory_balance_stock"
ON inventory_balance_stock FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update inventory_balance_stock"
ON inventory_balance_stock FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read sales_products"
ON sales_products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert into sales_products"
ON sales_products FOR INSERT
TO authenticated
WITH CHECK (true); 