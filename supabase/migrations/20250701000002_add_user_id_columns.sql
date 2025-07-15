-- Add user_id column to tables that don't have it
ALTER TABLE IF EXISTS public.balance_stock_transactions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.breaks 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.inventory_purchases 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.inventory_sales 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.inventory_consumption 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.pos_orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.pos_order_items 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.product_master 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.services 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE IF EXISTS public.stylists 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop existing views that need to be updated
DROP VIEW IF EXISTS public.products;
DROP VIEW IF EXISTS public.balance_stock_view;
DROP VIEW IF EXISTS public.inventory_balance_stock;

-- Recreate views with user_id
CREATE VIEW public.products AS
SELECT 
    pm.id,
    pm.name,
    pm.description,
    pm.price,
    pm.stock_quantity,
    pm.category,
    pm.active,
    pm.created_at,
    pm.updated_at,
    pm.collection_id,
    pm.hsn_code,
    pm.units,
    pm.mrp_incl_gst,
    pm.mrp_excl_gst,
    pm.gst_percentage,
    pm.sku,
    pm.product_type,
    pm.user_id
FROM public.product_master pm;

CREATE VIEW public.balance_stock_view AS
SELECT 
    products.id AS product_id,
    products.name AS product_name,
    products.stock_quantity AS balance_qty,
    products.hsn_code,
    products.units,
    products.user_id
FROM public.products
WHERE products.stock_quantity IS NOT NULL;

CREATE OR REPLACE VIEW inventory_balance_stock AS
SELECT
    p.product_name,
    p.hsn_code,
    p.units,
    SUM(p.purchase_qty) as total_purchases,
    COALESCE(SUM(s.sales_qty), 0) as total_sales,
    COALESCE(SUM(c.consumption_qty), 0) as total_consumption,
    SUM(p.purchase_qty) - COALESCE(SUM(s.sales_qty), 0) - COALESCE(SUM(c.consumption_qty), 0) as balance_qty,
    AVG(p.purchase_taxable_value / NULLIF(p.purchase_qty, 0)) as avg_purchase_cost_per_unit,
    p.user_id
FROM
    inventory_purchases p
LEFT JOIN
    inventory_sales s ON p.product_name = s.product_name AND p.user_id = s.user_id
LEFT JOIN
    inventory_consumption c ON p.product_name = c.product_name AND p.user_id = c.user_id
GROUP BY
    p.product_name, p.hsn_code, p.units, p.user_id;

-- Add RLS policies for multi-tenancy
ALTER TABLE public.balance_stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON public.balance_stock_transactions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.balance_stock_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.balance_stock_transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.balance_stock_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Repeat for other tables
CREATE POLICY "Users can view their own data" ON public.breaks FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.breaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.breaks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.breaks FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.inventory_purchases FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.inventory_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.inventory_purchases FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.inventory_purchases FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.inventory_sales FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.inventory_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.inventory_sales FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.inventory_sales FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.inventory_consumption FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.inventory_consumption FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.inventory_consumption FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.inventory_consumption FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.pos_orders FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.pos_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.pos_orders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.pos_orders FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.pos_order_items FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.pos_order_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.pos_order_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.pos_order_items FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.product_master FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.product_master FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.product_master FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.product_master FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.services FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.services FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.services FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.services FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own data" ON public.stylists FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON public.stylists FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.stylists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON public.stylists FOR DELETE
    USING (auth.uid() = user_id);

-- Add default value for user_id in all tables
ALTER TABLE public.balance_stock_transactions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.breaks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.inventory_purchases ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.inventory_sales ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.inventory_consumption ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.pos_orders ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.pos_order_items ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.product_master ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.services ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.stylists ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Add NOT NULL constraint after adding default value
ALTER TABLE public.balance_stock_transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.breaks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.inventory_purchases ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.inventory_sales ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.inventory_consumption ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.pos_orders ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.pos_order_items ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.product_master ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.services ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.stylists ALTER COLUMN user_id SET NOT NULL; 