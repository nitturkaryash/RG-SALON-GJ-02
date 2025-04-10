-- Ensure the salon_consumption_products view exists
-- Check if the view already exists in the public schema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_views
        WHERE schemaname = 'public'
        AND viewname = 'salon_consumption_products'
    ) THEN
        -- Create the view if it doesn't exist
        EXECUTE '
        CREATE OR REPLACE VIEW public.salon_consumption_products AS
        SELECT 
            uuid_generate_v4() as id,
            "Requisition Voucher No.",
            order_id,
            "Date",
            "Product Name",
            "Consumption Qty.",
            "Purchase Cost per Unit (Ex. GST) (Rs.)",
            "Purchase GST Percentage",
            "Purchase Taxable Value (Rs.)",
            "Purchase IGST (Rs.)",
            "Purchase CGST (Rs.)",
            "Purchase SGST (Rs.)",
            "Total Purchase Cost (Rs.)",
            NOW() as created_at,
            NOW() as updated_at
        FROM (
            VALUES
                (''SALON-03'', ''9c88f038-b69f-4e3a-acc3-17f8d80b9717''::uuid, ''2025-04-09 12:08:05.105''::timestamp, ''facemask'', 1, 590, 18, 590.00, 0, 53.10, 53.10, 696.20)
        ) AS t(
            "Requisition Voucher No.",
            order_id,
            "Date",
            "Product Name",
            "Consumption Qty.",
            "Purchase Cost per Unit (Ex. GST) (Rs.)",
            "Purchase GST Percentage",
            "Purchase Taxable Value (Rs.)",
            "Purchase IGST (Rs.)",
            "Purchase CGST (Rs.)",
            "Purchase SGST (Rs.)",
            "Total Purchase Cost (Rs.)"
        )';
    END IF;
END
$$; 