-- ===============================================
-- COMPLETE DATABASE SETUP FOR R&G SALON
-- ===============================================
-- Run this script in your Supabase SQL Editor
-- URL: https://mtyudylsozncvilibxda.supabase.co

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. AUTHENTICATION TABLES
-- ===============================================

-- Auth table for admin login
CREATE TABLE IF NOT EXISTS auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Admin users table (alternative auth method)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 2. CORE SALON MANAGEMENT TABLES
-- ===============================================

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  total_spent NUMERIC DEFAULT 0,
  pending_payment NUMERIC DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Stylists table
CREATE TABLE IF NOT EXISTS stylists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- Duration in minutes
  price NUMERIC NOT NULL,
  category TEXT,
  type TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 3. INVENTORY MANAGEMENT TABLES
-- ===============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  active BOOLEAN DEFAULT TRUE,
  hsn_code TEXT,
  unit TEXT DEFAULT 'piece',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory purchases table
CREATE TABLE IF NOT EXISTS inventory_purchases (
  purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  product_name TEXT NOT NULL,
  hsn_code TEXT,
  units TEXT,
  purchase_invoice_number TEXT,
  purchase_qty INTEGER NOT NULL,
  mrp_incl_gst FLOAT,
  mrp_excl_gst FLOAT,
  discount_on_purchase_percentage FLOAT DEFAULT 0,
  gst_percentage FLOAT DEFAULT 18,
  purchase_taxable_value FLOAT,
  purchase_igst FLOAT DEFAULT 0,
  purchase_cgst FLOAT,
  purchase_sgst FLOAT,
  purchase_invoice_value_rs FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory sales table
CREATE TABLE IF NOT EXISTS inventory_sales (
  sale_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  product_name TEXT NOT NULL,
  hsn_code TEXT,
  units TEXT,
  invoice_no TEXT,
  sales_qty INTEGER NOT NULL,
  purchase_cost_per_unit_ex_gst FLOAT,
  purchase_gst_percentage FLOAT DEFAULT 18,
  purchase_taxable_value FLOAT,
  purchase_igst FLOAT DEFAULT 0,
  purchase_cgst FLOAT,
  purchase_sgst FLOAT,
  total_purchase_cost FLOAT,
  mrp_incl_gst FLOAT,
  mrp_excl_gst FLOAT,
  discount_on_sales_percentage FLOAT DEFAULT 0,
  discounted_sales_rate_excl_gst FLOAT,
  sales_gst_percentage FLOAT DEFAULT 18,
  sales_taxable_value FLOAT,
  igst_rs FLOAT DEFAULT 0,
  cgst_rs FLOAT,
  sgst_rs FLOAT,
  invoice_value_rs FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory consumption table
CREATE TABLE IF NOT EXISTS inventory_consumption (
  consumption_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  product_name TEXT NOT NULL,
  hsn_code TEXT,
  units TEXT,
  requisition_voucher_no TEXT,
  consumption_qty INTEGER NOT NULL,
  purchase_cost_per_unit_ex_gst FLOAT,
  purchase_gst_percentage FLOAT DEFAULT 18,
  purchase_taxable_value FLOAT,
  purchase_igst FLOAT DEFAULT 0,
  purchase_cgst FLOAT,
  purchase_sgst FLOAT,
  total_purchase_cost FLOAT,
  balance_qty INTEGER,
  taxable_value FLOAT,
  igst_rs FLOAT DEFAULT 0,
  cgst_rs FLOAT,
  sgst_rs FLOAT,
  invoice_value FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 4. POS SYSTEM TABLES
-- ===============================================

-- POS Orders table
CREATE TABLE IF NOT EXISTS pos_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_name TEXT,
  consumption_purpose TEXT,
  consumption_notes TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'sale',
  is_salon_consumption BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  payment_method TEXT DEFAULT 'cash'
);

-- POS Order Items table
CREATE TABLE IF NOT EXISTS pos_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT 'service',
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  gst_percentage NUMERIC DEFAULT 18,
  hsn_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pos_order_id UUID REFERENCES pos_orders(id)
);

-- ===============================================
-- 5. SALES HISTORY TABLE
-- ===============================================

-- Sales products table (for historical sales data)
CREATE TABLE IF NOT EXISTS sales_products (
  serial_no TEXT PRIMARY KEY,
  order_id TEXT,
  date TEXT,
  product_name TEXT,
  quantity TEXT,
  unit_price_ex_gst TEXT,
  gst_percentage TEXT,
  taxable_value TEXT,
  cgst_amount TEXT,
  sgst_amount TEXT,
  total_purchase_cost TEXT,
  discount TEXT,
  tax TEXT,
  payment_amount TEXT,
  payment_method TEXT,
  payment_date TEXT
);

-- ===============================================
-- 6. INDEXES FOR PERFORMANCE
-- ===============================================

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_purchases_date ON inventory_purchases(date);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_no ON inventory_sales(invoice_no);
CREATE INDEX IF NOT EXISTS idx_consumption_voucher_no ON inventory_consumption(requisition_voucher_no);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Client indexes
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ===============================================
-- 7. VIEWS FOR DASHBOARD
-- ===============================================

-- Inventory balance stock view
CREATE OR REPLACE VIEW inventory_balance_stock AS
SELECT
  p.product_name,
  p.hsn_code,
  p.units,
  SUM(p.purchase_qty) as total_purchases,
  COALESCE(SUM(s.sales_qty), 0) as total_sales,
  COALESCE(SUM(c.consumption_qty), 0) as total_consumption,
  SUM(p.purchase_qty) - COALESCE(SUM(s.sales_qty), 0) - COALESCE(SUM(c.consumption_qty), 0) as balance_qty,
  AVG(p.purchase_taxable_value / NULLIF(p.purchase_qty, 0)) as avg_purchase_cost_per_unit
FROM
  inventory_purchases p
LEFT JOIN
  inventory_sales s ON p.product_name = s.product_name
LEFT JOIN
  inventory_consumption c ON p.product_name = c.product_name
GROUP BY
  p.product_name, p.hsn_code, p.units;

-- ===============================================
-- 8. SAMPLE DATA INSERTION
-- ===============================================

-- Insert admin user for login
INSERT INTO auth (username, password_hash, email, role) 
VALUES ('admin', 'admin', 'admin@rgsalon.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (full_name, phone, email) VALUES
('John Doe', '+91-9876543210', 'john.doe@email.com'),
('Jane Smith', '+91-9876543211', 'jane.smith@email.com'),
('Robert Johnson', '+91-9876543212', 'robert.j@email.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample stylists
INSERT INTO stylists (name, email, phone) VALUES
('Sarah Wilson', 'sarah@rgsalon.com', '+91-9876543220'),
('Mike Chen', 'mike@rgsalon.com', '+91-9876543221'),
('Lisa Anderson', 'lisa@rgsalon.com', '+91-9876543222')
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, duration, price, category, type) VALUES
('Haircut', 'Professional haircut and styling', 60, 500, 'Hair', 'service'),
('Hair Wash', 'Deep cleansing hair wash', 30, 200, 'Hair', 'service'),
('Facial', 'Rejuvenating facial treatment', 90, 800, 'Skin', 'service'),
('Manicure', 'Professional nail care', 45, 400, 'Nails', 'service'),
('Pedicure', 'Foot care and nail treatment', 60, 500, 'Nails', 'service')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category, hsn_code, unit) VALUES
('Shampoo', 'Professional hair shampoo', 1200, 50, 'Hair Care', '3305', 'bottle'),
('Conditioner', 'Hair conditioning treatment', 1500, 30, 'Hair Care', '3305', 'bottle'),
('Face Mask', 'Hydrating face mask', 800, 25, 'Skin Care', '3304', 'piece'),
('Nail Polish', 'Premium nail polish', 300, 100, 'Nail Care', '3304', 'bottle')
ON CONFLICT (id) DO NOTHING;

-- Insert sample inventory purchases
INSERT INTO inventory_purchases (
  product_name, hsn_code, units, purchase_qty, 
  mrp_incl_gst, mrp_excl_gst, gst_percentage,
  purchase_taxable_value, purchase_cgst, purchase_sgst,
  purchase_invoice_value_rs, purchase_invoice_number
) VALUES
('Shampoo', '3305', 'bottle', 50, 1200, 1016.95, 18, 50847.50, 4576.28, 4576.28, 60000, 'INV-001'),
('Conditioner', '3305', 'bottle', 30, 1500, 1271.19, 18, 38135.70, 3432.21, 3432.21, 45000, 'INV-002'),
('Face Mask', '3304', 'piece', 25, 800, 677.97, 18, 16949.15, 1525.42, 1525.42, 20000, 'INV-003')
ON CONFLICT (purchase_id) DO NOTHING;

-- Insert sample sales data
INSERT INTO sales_products (
  serial_no, order_id, date, product_name, quantity, 
  unit_price_ex_gst, gst_percentage, taxable_value,
  cgst_amount, sgst_amount, total_purchase_cost,
  discount, tax, payment_amount, payment_method, payment_date
) VALUES
('SALES-001', uuid_generate_v4()::text, '2024-01-15', 'Shampoo', '1', '1016.95', '18', '1016.95', '91.53', '91.53', '1200.00', '0', '183.06', '1200', 'cash', '2024-01-15 10:30:00'),
('SALES-002', uuid_generate_v4()::text, '2024-01-15', 'Face Mask', '2', '677.97', '18', '1355.94', '122.07', '122.07', '1600.00', '0', '244.14', '1600', 'card', '2024-01-15 11:45:00'),
('SALES-003', uuid_generate_v4()::text, '2024-01-16', 'Conditioner', '1', '1271.19', '18', '1271.19', '114.41', '114.41', '1500.00', '0', '228.82', '1500', 'cash', '2024-01-16 14:20:00')
ON CONFLICT (serial_no) DO NOTHING;

-- ===============================================
-- 9. HELPFUL FUNCTIONS
-- ===============================================

-- Function to check admin login
CREATE OR REPLACE FUNCTION check_admin_login(username_input TEXT, password_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth
    WHERE username = username_input 
    AND password_hash = password_input
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- SETUP COMPLETE
-- ===============================================

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '🔑 Admin Login: username="admin", password="admin"';
  RAISE NOTICE '📊 Sample data has been inserted';
  RAISE NOTICE '🚀 Your salon management system is ready!';
END $$; 