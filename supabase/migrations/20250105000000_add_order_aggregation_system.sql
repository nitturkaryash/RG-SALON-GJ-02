-- Migration: Add Order Aggregation System
-- Date: 2025-01-05
-- Purpose: Add functions and triggers to automatically aggregate orders by client name and date

-- ===============================================
-- Function to aggregate payment methods
-- ===============================================
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

-- ===============================================
-- Trigger function to aggregate orders by client name and date
-- ===============================================
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

-- ===============================================
-- Upsert function for aggregated orders
-- ===============================================
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
-- Create the trigger (optional - commented out by default)
-- ===============================================
-- Uncomment the following lines if you want automatic aggregation on INSERT
-- WARNING: This will affect all existing INSERT operations
/*
DROP TRIGGER IF EXISTS trigger_aggregate_orders ON pos_orders;
CREATE TRIGGER trigger_aggregate_orders
    BEFORE INSERT ON pos_orders
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_orders_by_client_and_date();
*/

-- ===============================================
-- Function to manually aggregate existing duplicate orders
-- ===============================================
CREATE OR REPLACE FUNCTION merge_duplicate_orders_by_date()
RETURNS TEXT AS $$
DECLARE
    duplicate_record RECORD;
    base_order_id UUID;
    orders_to_merge UUID[];
    aggregated_services JSONB;
    aggregated_payments JSONB;
    total_subtotal NUMERIC;
    total_tax NUMERIC;
    total_discount NUMERIC;
    total_amount NUMERIC;
    combined_stylists TEXT;
    merge_count INTEGER := 0;
BEGIN
    -- Find groups of orders with same client_name and date
    FOR duplicate_record IN
        SELECT 
            client_name, 
            DATE(created_at) as order_date,
            COUNT(*) as order_count,
            ARRAY_AGG(id ORDER BY created_at) as order_ids
        FROM pos_orders 
        GROUP BY client_name, DATE(created_at) 
        HAVING COUNT(*) > 1
    LOOP
        -- Get the first order as the base
        base_order_id := duplicate_record.order_ids[1];
        orders_to_merge := duplicate_record.order_ids[2:];
        
        -- Initialize aggregated data with base order
        SELECT services, payments, subtotal, tax, discount, stylist_name
        INTO aggregated_services, aggregated_payments, total_subtotal, total_tax, total_discount, combined_stylists
        FROM pos_orders WHERE id = base_order_id;
        
        -- Ensure defaults
        aggregated_services := COALESCE(aggregated_services, '[]'::jsonb);
        aggregated_payments := COALESCE(aggregated_payments, '[]'::jsonb);
        total_subtotal := COALESCE(total_subtotal, 0);
        total_tax := COALESCE(total_tax, 0);
        total_discount := COALESCE(total_discount, 0);
        
        -- Aggregate data from other orders
        FOR i IN 1..array_length(orders_to_merge, 1)
        LOOP
            DECLARE
                merge_order RECORD;
            BEGIN
                SELECT services, payments, subtotal, tax, discount, stylist_name
                INTO merge_order
                FROM pos_orders WHERE id = orders_to_merge[i];
                
                -- Combine services
                aggregated_services := aggregated_services || COALESCE(merge_order.services, '[]'::jsonb);
                
                -- Combine payments
                aggregated_payments := aggregate_payment_methods(
                    aggregated_payments, 
                    COALESCE(merge_order.payments, '[]'::jsonb)
                );
                
                -- Add totals
                total_subtotal := total_subtotal + COALESCE(merge_order.subtotal, 0);
                total_tax := total_tax + COALESCE(merge_order.tax, 0);
                total_discount := total_discount + COALESCE(merge_order.discount, 0);
                
                -- Combine stylist names
                IF merge_order.stylist_name IS NOT NULL AND 
                   (combined_stylists IS NULL OR combined_stylists NOT LIKE '%' || merge_order.stylist_name || '%') THEN
                    combined_stylists := COALESCE(combined_stylists, '') || 
                                       CASE WHEN combined_stylists IS NOT NULL THEN ', ' ELSE '' END || 
                                       merge_order.stylist_name;
                END IF;
            END;
        END LOOP;
        
        -- Calculate final total
        total_amount := total_subtotal + total_tax - total_discount;
        
        -- Update base order with aggregated data
        UPDATE pos_orders 
        SET 
            services = aggregated_services,
            payments = aggregated_payments,
            subtotal = total_subtotal,
            tax = total_tax,
            discount = total_discount,
            total = total_amount,
            total_amount = total_amount,
            stylist_name = combined_stylists,
            payment_method = CASE 
                WHEN jsonb_array_length(aggregated_payments) > 1 THEN 'aggregated'
                ELSE payment_method
            END
        WHERE id = base_order_id;
        
        -- Delete the duplicate orders
        DELETE FROM pos_orders WHERE id = ANY(orders_to_merge);
        
        merge_count := merge_count + 1;
    END LOOP;
    
    RETURN 'Merged ' || merge_count || ' groups of duplicate orders';
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- Add comments for documentation
-- ===============================================
COMMENT ON FUNCTION aggregate_payment_methods IS 'Helper function to combine payment methods with totals';
COMMENT ON FUNCTION aggregate_orders_by_client_and_date IS 'Trigger function to automatically aggregate orders for same client on same date';
COMMENT ON FUNCTION upsert_aggregated_order IS 'Upserts orders with automatic aggregation by client name and date';
COMMENT ON FUNCTION merge_duplicate_orders_by_date IS 'Manually merges existing duplicate orders in the database';

-- ===============================================
-- Example usage
-- ===============================================
/*
-- To manually merge existing duplicate orders:
SELECT merge_duplicate_orders_by_date();

-- To use the upsert function for new orders:
SELECT upsert_aggregated_order(
    'Client Name',
    'Client Name',
    'Stylist Name',
    '[{"name":"Service Name","quantity":1,"unitPrice":1000}]'::jsonb,
    '[{"method":"cash","amount":1000}]'::jsonb,
    1000,
    180,
    0,
    1180
);
*/ 