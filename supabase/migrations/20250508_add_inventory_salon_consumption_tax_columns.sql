-- Add current stock and tax columns to inventory_salon_consumption table
ALTER TABLE inventory_salon_consumption 
ADD COLUMN current_stock INTEGER,
ADD COLUMN current_stock_value DECIMAL(10, 2),
ADD COLUMN c_cgst DECIMAL(10, 2),
ADD COLUMN c_sgst DECIMAL(10, 2),
ADD COLUMN c_tax DECIMAL(10, 2);

-- Notify Supabase of schema changes
NOTIFY pgrst, 'reload schema'; 