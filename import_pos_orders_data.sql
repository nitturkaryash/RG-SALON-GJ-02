-- Comprehensive POS Orders Data Import Script
-- This script handles invoice grouping, reference data validation, and duplicate prevention
-- Make sure to set your user_id at the top

-- Set the user_id for multi-tenant support
\set user_id '3f4b718f-70cb-4873-a62c-b8806a92e25b'

-- Create temporary table for raw data import
CREATE TEMP TABLE temp_pos_data (
    invoice_number TEXT,
    date_time TIMESTAMP,
    client_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    stylist_name TEXT,
    service_name TEXT,
    service_price NUMERIC,
    service_duration INTEGER,
    quantity INTEGER DEFAULT 1,
    discount_percentage NUMERIC DEFAULT 0,
    tax_percentage NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    notes TEXT
);

-- Example data insertion - Replace this with your actual data
-- INSERT INTO temp_pos_data VALUES
-- ('INV-001', '2024-01-15 10:00:00', 'John Doe', '9876543210', 'john@example.com', 'Sarah Smith', 'Haircut', 500.00, 60, 1, 0, 18, 'cash', 'Regular customer'),
-- ('INV-001', '2024-01-15 10:00:00', 'John Doe', '9876543210', 'john@example.com', 'Sarah Smith', 'Hair Wash', 200.00, 30, 1, 0, 18, 'cash', 'Add-on service'),
-- ('INV-002', '2024-01-15 11:00:00', 'Jane Smith', '9876543211', 'jane@example.com', 'Mike Johnson', 'Facial', 800.00, 90, 1, 10, 18, 'card', 'Premium service');

-- TODO: Add your actual data here using the format above
-- Each row should represent one service item in an invoice
-- Multiple rows with the same invoice_number will be grouped together

-- Function to get or create client
CREATE OR REPLACE FUNCTION get_or_create_client(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    client_id UUID;
BEGIN
    -- Try to find existing client by phone or email
    SELECT id INTO client_id
    FROM clients
    WHERE (mobile_number = p_phone OR email = p_email)
    AND user_id = p_user_id
    LIMIT 1;
    
    -- If not found, create new client
    IF client_id IS NULL THEN
        INSERT INTO clients (
            full_name,
            mobile_number,
            email,
            phone,
            user_id,
            created_at,
            updated_at
        ) VALUES (
            p_name,
            COALESCE(p_phone, ''),
            p_email,
            p_phone,
            p_user_id,
            NOW(),
            NOW()
        ) RETURNING id INTO client_id;
    END IF;
    
    RETURN client_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create stylist
CREATE OR REPLACE FUNCTION get_or_create_stylist(
    p_name TEXT,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    stylist_id UUID;
BEGIN
    -- Try to find existing stylist by name
    SELECT id INTO stylist_id
    FROM stylists
    WHERE name = p_name
    AND user_id = p_user_id
    LIMIT 1;
    
    -- If not found, create new stylist
    IF stylist_id IS NULL THEN
        INSERT INTO stylists (
            name,
            user_id,
            available,
            created_at,
            updated_at
        ) VALUES (
            p_name,
            p_user_id,
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO stylist_id;
    END IF;
    
    RETURN stylist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create service
CREATE OR REPLACE FUNCTION get_or_create_service(
    p_name TEXT,
    p_price NUMERIC,
    p_duration INTEGER,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    service_id UUID;
BEGIN
    -- Try to find existing service by name
    SELECT id INTO service_id
    FROM services
    WHERE name = p_name
    AND user_id = p_user_id
    LIMIT 1;
    
    -- If not found, create new service
    IF service_id IS NULL THEN
        INSERT INTO services (
            name,
            price,
            duration,
            type,
            active,
            user_id,
            created_at,
            updated_at
        ) VALUES (
            p_name,
            p_price,
            p_duration,
            'service',
            true,
            p_user_id,
            NOW(),
            NOW()
        ) RETURNING id INTO service_id;
    END IF;
    
    RETURN service_id;
END;
$$ LANGUAGE plpgsql;

-- Main import process
DO $$
DECLARE
    rec RECORD;
    current_invoice TEXT := '';
    order_id UUID;
    client_id UUID;
    stylist_id UUID;
    service_id UUID;
    services_json JSONB := '[]'::jsonb;
    total_amount NUMERIC := 0;
    subtotal_amount NUMERIC := 0;
    tax_amount NUMERIC := 0;
    discount_amount NUMERIC := 0;
    current_user_id UUID := :'user_id'::UUID;
BEGIN
    -- Process each row in the temp table
    FOR rec IN 
        SELECT * FROM temp_pos_data 
        ORDER BY invoice_number, service_name
    LOOP
        -- If this is a new invoice, save the previous one and start fresh
        IF current_invoice != '' AND current_invoice != rec.invoice_number THEN
            -- Insert the completed order
            INSERT INTO pos_orders (
                id,
                date,
                client_name,
                stylist_name,
                services,
                subtotal,
                tax,
                discount,
                total,
                payment_method,
                status,
                type,
                user_id,
                created_at
            ) VALUES (
                order_id,
                rec.date_time,
                rec.client_name,
                rec.stylist_name,
                services_json,
                subtotal_amount,
                tax_amount,
                discount_amount,
                total_amount,
                rec.payment_method,
                'completed',
                'sale',
                current_user_id,
                rec.date_time
            );
            
            -- Reset for next invoice
            services_json := '[]'::jsonb;
            total_amount := 0;
            subtotal_amount := 0;
            tax_amount := 0;
            discount_amount := 0;
        END IF;
        
        -- If this is a new invoice, initialize
        IF current_invoice != rec.invoice_number THEN
            current_invoice := rec.invoice_number;
            order_id := gen_random_uuid();
            
            -- Check if this invoice already exists
            IF EXISTS (
                SELECT 1 FROM pos_orders 
                WHERE client_name = rec.client_name 
                AND stylist_name = rec.stylist_name 
                AND date::date = rec.date_time::date
                AND user_id = current_user_id
            ) THEN
                RAISE NOTICE 'Invoice % already exists, skipping...', rec.invoice_number;
                CONTINUE;
            END IF;
        END IF;
        
        -- Get or create related entities
        client_id := get_or_create_client(rec.client_name, rec.client_phone, rec.client_email, current_user_id);
        stylist_id := get_or_create_stylist(rec.stylist_name, current_user_id);
        service_id := get_or_create_service(rec.service_name, rec.service_price, rec.service_duration, current_user_id);
        
        -- Calculate amounts for this service
        DECLARE
            service_subtotal NUMERIC := rec.service_price * rec.quantity;
            service_discount NUMERIC := service_subtotal * (rec.discount_percentage / 100);
            service_taxable NUMERIC := service_subtotal - service_discount;
            service_tax NUMERIC := service_taxable * (rec.tax_percentage / 100);
            service_total NUMERIC := service_taxable + service_tax;
        BEGIN
            -- Add service to services JSON array
            services_json := services_json || jsonb_build_object(
                'id', service_id,
                'service_id', service_id,
                'service_name', rec.service_name,
                'type', 'service',
                'price', rec.service_price,
                'quantity', rec.quantity,
                'duration', rec.service_duration,
                'subtotal', service_subtotal,
                'discount', service_discount,
                'tax', service_tax,
                'total', service_total,
                'gst_percentage', rec.tax_percentage,
                'unit_price', rec.service_price
            );
            
            -- Add to totals
            subtotal_amount := subtotal_amount + service_subtotal;
            discount_amount := discount_amount + service_discount;
            tax_amount := tax_amount + service_tax;
            total_amount := total_amount + service_total;
        END;
    END LOOP;
    
    -- Insert the last invoice if there was data
    IF current_invoice != '' THEN
        INSERT INTO pos_orders (
            id,
            date,
            client_name,
            stylist_name,
            services,
            subtotal,
            tax,
            discount,
            total,
            payment_method,
            status,
            type,
            user_id,
            created_at
        ) VALUES (
            order_id,
            (SELECT date_time FROM temp_pos_data WHERE invoice_number = current_invoice LIMIT 1),
            (SELECT client_name FROM temp_pos_data WHERE invoice_number = current_invoice LIMIT 1),
            (SELECT stylist_name FROM temp_pos_data WHERE invoice_number = current_invoice LIMIT 1),
            services_json,
            subtotal_amount,
            tax_amount,
            discount_amount,
            total_amount,
            (SELECT payment_method FROM temp_pos_data WHERE invoice_number = current_invoice LIMIT 1),
            'completed',
            'sale',
            current_user_id,
            (SELECT date_time FROM temp_pos_data WHERE invoice_number = current_invoice LIMIT 1)
        );
    END IF;
    
    RAISE NOTICE 'Import completed successfully!';
END $$;

-- Clean up temporary functions
DROP FUNCTION IF EXISTS get_or_create_client(TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS get_or_create_stylist(TEXT, UUID);
DROP FUNCTION IF EXISTS get_or_create_service(TEXT, NUMERIC, INTEGER, UUID);

-- Drop temporary table
DROP TABLE IF EXISTS temp_pos_data;

-- Display import summary
SELECT 
    COUNT(*) as total_orders_imported,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    SUM(total) as total_revenue
FROM pos_orders 
WHERE user_id = :'user_id'::UUID
AND created_at >= NOW() - INTERVAL '1 hour'; 