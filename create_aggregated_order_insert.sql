-- ===============================================
-- AGGREGATED ORDER INSERT SYSTEM
-- ===============================================
-- This script creates functions to aggregate orders by client name and date
-- to prevent duplicate orders for the same client on the same day

-- Function to aggregate orders by client name and date
CREATE OR REPLACE FUNCTION aggregate_orders_by_client_and_date()
RETURNS TRIGGER AS $$
DECLARE
    existing_order_id UUID;
    existing_services JSONB;
    existing_payments JSONB;
    new_services JSONB;
    new_payments JSONB;
    aggregated_services JSONB;
    aggregated_payments JSONB;
    total_amount NUMERIC := 0;
    total_subtotal NUMERIC := 0;
    total_tax NUMERIC := 0;
    total_discount NUMERIC := 0;
BEGIN
    -- Check if there's already an order for this client on the same date
    SELECT id, services, payments, subtotal, tax, discount
    INTO existing_order_id, existing_services, existing_payments, total_subtotal, total_tax, total_discount
    FROM pos_orders 
    WHERE client_name = NEW.client_name 
    AND DATE(created_at) = DATE(NEW.created_at)
    AND id != NEW.id
    LIMIT 1;

    -- If an existing order is found, aggregate the data
    IF existing_order_id IS NOT NULL THEN
        -- Get the new order's services and payments
        new_services := NEW.services;
        new_payments := NEW.payments;
        
        -- Combine services
        IF existing_services IS NULL THEN
            existing_services := '[]'::jsonb;
        END IF;
        IF new_services IS NULL THEN
            new_services := '[]'::jsonb;
        END IF;
        
        aggregated_services := existing_services || new_services;
        
        -- Combine payments by method
        IF existing_payments IS NULL THEN
            existing_payments := '[]'::jsonb;
        END IF;
        IF new_payments IS NULL THEN
            new_payments := '[]'::jsonb;
        END IF;
        
        -- Aggregate payment methods
        aggregated_payments := aggregate_payment_methods(existing_payments, new_payments);
        
        -- Calculate totals
        total_subtotal := COALESCE(total_subtotal, 0) + COALESCE(NEW.subtotal, 0);
        total_tax := COALESCE(total_tax, 0) + COALESCE(NEW.tax, 0);
        total_discount := COALESCE(total_discount, 0) + COALESCE(NEW.discount, 0);
        total_amount := total_subtotal + total_tax - total_discount;
        
        -- Update the existing order with aggregated data
        UPDATE pos_orders 
        SET 
            services = aggregated_services,
            payments = aggregated_payments,
            subtotal = total_subtotal,
            tax = total_tax,
            discount = total_discount,
            total = total_amount,
            total_amount = total_amount,
            stylist_name = CASE 
                WHEN stylist_name != NEW.stylist_name THEN 
                    stylist_name || ', ' || NEW.stylist_name
                ELSE stylist_name 
            END,
            payment_method = 'aggregated'
        WHERE id = existing_order_id;
        
        -- Prevent the new order from being inserted
        RETURN NULL;
    END IF;
    
    -- If no existing order, allow the new order to be inserted
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate payment methods
CREATE OR REPLACE FUNCTION aggregate_payment_methods(existing_payments JSONB, new_payments JSONB)
RETURNS JSONB AS $$
DECLARE
    payment_summary JSONB := '{}';
    payment_item JSONB;
    method TEXT;
    amount NUMERIC;
    final_payments JSONB := '[]';
BEGIN
    -- Process existing payments
    FOR payment_item IN SELECT jsonb_array_elements(existing_payments)
    LOOP
        method := payment_item->>'method';
        IF method IS NULL THEN
            method := payment_item->>'payment_method';
        END IF;
        amount := (payment_item->>'amount')::NUMERIC;
        
        IF payment_summary ? method THEN
            payment_summary := jsonb_set(
                payment_summary, 
                ARRAY[method], 
                to_jsonb((payment_summary->>method)::NUMERIC + amount)
            );
        ELSE
            payment_summary := jsonb_set(payment_summary, ARRAY[method], to_jsonb(amount));
        END IF;
    END LOOP;
    
    -- Process new payments
    FOR payment_item IN SELECT jsonb_array_elements(new_payments)
    LOOP
        method := payment_item->>'method';
        IF method IS NULL THEN
            method := payment_item->>'payment_method';
        END IF;
        amount := (payment_item->>'amount')::NUMERIC;
        
        IF payment_summary ? method THEN
            payment_summary := jsonb_set(
                payment_summary, 
                ARRAY[method], 
                to_jsonb((payment_summary->>method)::NUMERIC + amount)
            );
        ELSE
            payment_summary := jsonb_set(payment_summary, ARRAY[method], to_jsonb(amount));
        END IF;
    END LOOP;
    
    -- Convert summary back to array format
    FOR method IN SELECT jsonb_object_keys(payment_summary)
    LOOP
        amount := (payment_summary->>method)::NUMERIC;
        final_payments := final_payments || jsonb_build_array(
            jsonb_build_object(
                'method', method,
                'payment_method', method,
                'amount', amount
            )
        );
    END LOOP;
    
    RETURN final_payments;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for order aggregation
DROP TRIGGER IF EXISTS trigger_aggregate_orders ON pos_orders;
CREATE TRIGGER trigger_aggregate_orders
    BEFORE INSERT ON pos_orders
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_orders_by_client_and_date();

-- ===============================================
-- UPSERT FUNCTION FOR AGGREGATED ORDERS
-- ===============================================
-- Function to insert or update orders with aggregation
CREATE OR REPLACE FUNCTION upsert_aggregated_order(
    p_client_name TEXT,
    p_customer_name TEXT,
    p_stylist_name TEXT,
    p_services JSONB,
    p_payments JSONB,
    p_subtotal NUMERIC,
    p_tax NUMERIC,
    p_discount NUMERIC,
    p_total NUMERIC,
    p_payment_method TEXT DEFAULT 'cash',
    p_status TEXT DEFAULT 'completed',
    p_type TEXT DEFAULT 'sale',
    p_user_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_created_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS UUID AS $$
DECLARE
    existing_order_id UUID;
    new_order_id UUID;
    existing_services JSONB;
    existing_payments JSONB;
    aggregated_services JSONB;
    aggregated_payments JSONB;
    final_subtotal NUMERIC;
    final_tax NUMERIC;
    final_discount NUMERIC;
    final_total NUMERIC;
    combined_stylists TEXT;
BEGIN
    -- Check for existing order on the same date
    SELECT id, services, payments, subtotal, tax, discount, stylist_name
    INTO existing_order_id, existing_services, existing_payments, 
         final_subtotal, final_tax, final_discount, combined_stylists
    FROM pos_orders 
    WHERE client_name = p_client_name 
    AND DATE(created_at) = DATE(p_created_at)
    LIMIT 1;

    IF existing_order_id IS NOT NULL THEN
        -- Aggregate the data
        aggregated_services := COALESCE(existing_services, '[]'::jsonb) || COALESCE(p_services, '[]'::jsonb);
        aggregated_payments := aggregate_payment_methods(
            COALESCE(existing_payments, '[]'::jsonb), 
            COALESCE(p_payments, '[]'::jsonb)
        );
        
        -- Calculate totals
        final_subtotal := COALESCE(final_subtotal, 0) + COALESCE(p_subtotal, 0);
        final_tax := COALESCE(final_tax, 0) + COALESCE(p_tax, 0);
        final_discount := COALESCE(final_discount, 0) + COALESCE(p_discount, 0);
        final_total := final_subtotal + final_tax - final_discount;
        
        -- Combine stylist names
        IF combined_stylists != p_stylist_name AND p_stylist_name IS NOT NULL THEN
            combined_stylists := combined_stylists || ', ' || p_stylist_name;
        END IF;
        
        -- Update existing order
        UPDATE pos_orders 
        SET 
            services = aggregated_services,
            payments = aggregated_payments,
            subtotal = final_subtotal,
            tax = final_tax,
            discount = final_discount,
            total = final_total,
            total_amount = final_total,
            stylist_name = combined_stylists,
            payment_method = CASE 
                WHEN jsonb_array_length(aggregated_payments) > 1 THEN 'mixed'
                ELSE payment_method
            END,
            updated_at = NOW()
        WHERE id = existing_order_id;
        
        RETURN existing_order_id;
    ELSE
        -- Create new order
        new_order_id := gen_random_uuid();
        
        INSERT INTO pos_orders (
            id,
            created_at,
            date,
            client_name,
            customer_name,
            total_amount,
            total,
            subtotal,
            tax,
            discount,
            payment_method,
            payments,
            services,
            stylist_name,
            status,
            type,
            user_id,
            tenant_id
        ) VALUES (
            new_order_id,
            p_created_at,
            p_created_at,
            p_client_name,
            COALESCE(p_customer_name, p_client_name),
            p_total,
            p_total,
            p_subtotal,
            p_tax,
            p_discount,
            p_payment_method,
            p_payments,
            p_services,
            p_stylist_name,
            p_status,
            p_type,
            p_user_id,
            p_tenant_id
        );
        
        RETURN new_order_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- EXAMPLE USAGE
-- ===============================================
/*
-- Example of using the upsert function
SELECT upsert_aggregated_order(
    'Tarun Vatiani',
    'Tarun Vatiani', 
    'Vandan Gohil',
    '[{"name":"Hair Cut With Senior Hairdresser (Male)","category":"HAIR - Hair Cut","stylist":"Vandan Gohil","quantity":1,"unitPrice":1000,"discount":0,"taxPercent":18,"subtotal":1000,"netAmount":1000,"taxAmount":180,"totalAmount":1180}]'::jsonb,
    '[{"method":"gpay","amount":1180}]'::jsonb,
    1000,
    180,
    0,
    1180,
    'gpay',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- Second service for the same client on the same date
SELECT upsert_aggregated_order(
    'Tarun Vatiani',
    'Tarun Vatiani', 
    'Vandan Gohil',
    '[{"name":"Beard Trim","category":"HAIR - Beard Trim","stylist":"Vandan Gohil","quantity":1,"unitPrice":400,"discount":0,"taxPercent":18,"subtotal":400,"netAmount":400,"taxAmount":72,"totalAmount":472}]'::jsonb,
    '[{"method":"gpay","amount":472}]'::jsonb,
    400,
    72,
    0,
    472,
    'gpay',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);
*/

-- ===============================================
-- MODIFIED BATCH INSERT SCRIPT
-- ===============================================
-- Example of how to modify the existing batch inserts to use aggregation

/*
-- Instead of multiple INSERT statements for the same client/date:
-- Use the upsert function:

-- For Tarun Vatiani's Hair Cut service
SELECT upsert_aggregated_order(
    'Tarun Vatiani',
    'Tarun Vatiani',
    'Vandan Gohil',
    '[{"name":"Hair Cut With Senior Hairdresser (Male)","category":"HAIR - Hair Cut","stylist":"Vandan Gohil","quantity":1,"unitPrice":1000,"discount":0,"taxPercent":18,"subtotal":1000,"netAmount":1000,"taxAmount":180,"totalAmount":1180}]'::jsonb,
    '[{"method":"gpay","amount":1180}]'::jsonb,
    1000,
    180,
    0,
    1180,
    'gpay(1180)(₹1180.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- For Tarun Vatiani's Beard Trim service (will be aggregated with above)
SELECT upsert_aggregated_order(
    'Tarun Vatiani',
    'Tarun Vatiani',
    'Vandan Gohil',
    '[{"name":"Beard Trim","category":"HAIR - Beard Trim","stylist":"Vandan Gohil","quantity":1,"unitPrice":400,"discount":0,"taxPercent":18,"subtotal":400,"netAmount":400,"taxAmount":72,"totalAmount":472}]'::jsonb,
    '[{"method":"gpay","amount":472}]'::jsonb,
    400,
    72,
    0,
    472,
    'gpay(472)(₹472.00)',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    '2025-03-31T18:38:50.000Z'::timestamptz
);

-- Result: Single order with total 1652, both services combined, aggregated payment method
*/

-- Add a comment to track aggregated orders
COMMENT ON FUNCTION upsert_aggregated_order IS 'Upserts orders with automatic aggregation by client name and date';
COMMENT ON FUNCTION aggregate_orders_by_client_and_date IS 'Trigger function to automatically aggregate orders for same client on same date';
COMMENT ON FUNCTION aggregate_payment_methods IS 'Helper function to combine payment methods with totals'; 