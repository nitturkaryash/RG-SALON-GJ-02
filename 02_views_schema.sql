-- =======================================================
-- DATABASE VIEWS EXPORT
-- Project: pankajhadole24@gmail.com's Project
-- Generated: $(date)
-- Total Views: 12
-- =======================================================

-- =======================================================
-- PUBLIC SCHEMA VIEWS
-- =======================================================

-- View: product_stock_status
-- Description: Tracks product stock status with running totals from sales and transactions
CREATE OR REPLACE VIEW public.product_stock_status AS
WITH combined_events AS (
    SELECT 
        po.id AS event_id,
        po.created_at AS event_date,
        po.id AS order_id,
        ((jsonb_array_elements(po.services) ->> 'product_id'::text))::uuid AS product_id,
        (((jsonb_array_elements(po.services) ->> 'quantity'::text))::integer * '-1'::integer) AS quantity_change
    FROM pos_orders po
    WHERE (po.type = 'sale'::text)
    UNION ALL
    SELECT 
        psth.id AS event_id,
        to_timestamp(psth."Date", 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS event_date,
        NULL::uuid AS order_id,
        NULL::uuid AS product_id,
        CASE
            WHEN ((psth."Change Type")::text = 'addition'::text) THEN psth."Quantity Change"
            WHEN ((psth."Change Type")::text = 'reduction'::text) THEN (- psth."Quantity Change")
            ELSE 0
        END AS quantity_change
    FROM product_stock_transaction_history psth
), events_with_products AS (
    SELECT 
        combined_events.event_id,
        combined_events.event_date,
        combined_events.order_id,
        combined_events.product_id,
        combined_events.quantity_change
    FROM combined_events
    WHERE (combined_events.product_id IS NOT NULL)
), running_stock AS (
    SELECT 
        events_with_products.event_id,
        events_with_products.event_date,
        events_with_products.order_id,
        events_with_products.product_id,
        events_with_products.quantity_change,
        sum(events_with_products.quantity_change) OVER (
            PARTITION BY events_with_products.product_id 
            ORDER BY events_with_products.event_date, events_with_products.event_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS remaining_stock
    FROM events_with_products
)
SELECT 
    event_id,
    event_date,
    order_id,
    product_id,
    quantity_change,
    remaining_stock
FROM running_stock
ORDER BY event_date, event_id;

-- View: product_stock_transaction_history  
-- Description: Formatted view of product stock transactions with human-readable dates
CREATE OR REPLACE VIEW public.product_stock_transaction_history AS
SELECT 
    t.id,
    to_char(((t.created_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Kolkata'::text), 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS "Date",
    p.name AS "Product Name",
    p.hsn_code AS "HSN Code",
    'pcs'::text AS "Units",
    CASE
        WHEN lower(COALESCE(t.source, ''::character varying))::text = 'purchase' THEN 'addition'::character varying
        WHEN ((t.display_type)::text = 'reduction'::text) THEN 'reduction'::character varying
        WHEN ((t.display_type)::text = 'addition'::text) THEN 'addition'::character varying
        WHEN (t.display_type IS NOT NULL) THEN t.display_type
        ELSE t.transaction_type
    END AS "Change Type",
    COALESCE(t.source, 'inventory_update'::character varying) AS "Source",
    COALESCE((o.id)::text, '-'::text) AS "Reference ID",
    t.quantity AS "Quantity Change",
    t.new_stock AS "Quantity After Change"
FROM ((product_stock_transactions t
    LEFT JOIN product_master p ON ((t.product_id = p.id)))
    LEFT JOIN pos_orders o ON ((t.order_id = o.id)))
ORDER BY t.created_at DESC;

-- View: products
-- Description: Simplified view of product_master table
CREATE OR REPLACE VIEW public.products AS
SELECT 
    id,
    name,
    description,
    price,
    stock_quantity,
    category,
    active,
    created_at,
    updated_at,
    collection_id,
    hsn_code,
    units,
    mrp_incl_gst,
    mrp_excl_gst,
    gst_percentage,
    sku,
    product_type
FROM product_master pm;

-- View: sale_stock_view
-- Description: Simplified stock tracking view for sales and transactions
CREATE OR REPLACE VIEW public.sale_stock_view AS
WITH combined_events AS (
    SELECT 
        po.id AS event_id,
        po.created_at AS event_date,
        ((jsonb_array_elements(po.services) ->> 'product_id'::text))::uuid AS product_id,
        (((jsonb_array_elements(po.services) ->> 'quantity'::text))::integer * '-1'::integer) AS quantity_change
    FROM pos_orders po
    WHERE (po.type = 'sale'::text)
    UNION ALL
    SELECT 
        psth.id AS event_id,
        to_timestamp(psth."Date", 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS event_date,
        NULL::uuid AS product_id,
        CASE
            WHEN ((psth."Change Type")::text = 'addition'::text) THEN psth."Quantity Change"
            WHEN ((psth."Change Type")::text = 'reduction'::text) THEN (- psth."Quantity Change")
            ELSE 0
        END AS quantity_change
    FROM product_stock_transaction_history psth
), stock_running_total AS (
    SELECT 
        combined_events.event_id,
        combined_events.event_date,
        combined_events.product_id,
        sum(combined_events.quantity_change) OVER (
            PARTITION BY combined_events.product_id 
            ORDER BY combined_events.event_date, combined_events.event_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS remaining_stock
    FROM combined_events
)
SELECT 
    event_id,
    event_date,
    product_id,
    remaining_stock
FROM stock_running_total
ORDER BY event_date, event_id;

-- View: sales_history_2
-- Description: Detailed sales history with tax calculations and stock tracking
CREATE OR REPLACE VIEW public.sales_history_2 AS
WITH sales_data AS (
    SELECT 
        po.id AS order_id,
        po.date AS order_date,
        ((item.value ->> 'service_id'::text))::uuid AS product_id,
        (item.value ->> 'service_name'::text) AS product_name,
        sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
        ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
        ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
        ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
        ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
        po.discount_percentage,
        po.tax,
        pm.hsn_code,
        pm.units AS product_type,
        po.type,
        COALESCE((po.current_stock)::integer, 0) AS stock_before_sale,
        pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
    FROM ((pos_orders po
        CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
        LEFT JOIN product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
    WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
    GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), 
             (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), 
             (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), 
             po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, 
             pm."Purchase_Cost/Unit(Ex.GST)"
), sales_with_serial AS (
    SELECT 
        sales_data.*,
        row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
    FROM sales_data
), total_sold_per_product AS (
    SELECT 
        sales_with_serial.product_id,
        sum(sales_with_serial.quantity) AS total_sold
    FROM sales_with_serial
    GROUP BY sales_with_serial.product_id
), cumulative_sales AS (
    SELECT 
        s.*,
        t.total_sold,
        sum(s.quantity) OVER (
            PARTITION BY s.product_id 
            ORDER BY s.order_date, s.order_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_quantity_sold
    FROM (sales_with_serial s
        JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
), final_sales AS (
    SELECT 
        ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
        cumulative_sales.order_id,
        date(cumulative_sales.order_date) AS date,
        cumulative_sales.product_name,
        cumulative_sales.quantity,
        cumulative_sales.unit_price_ex_gst,
        cumulative_sales.gst_percentage,
        round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
        round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
        round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
        round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
        cumulative_sales.discount_percentage,
        cumulative_sales.tax,
        cumulative_sales.hsn_code,
        cumulative_sales.product_type,
        cumulative_sales.mrp_incl_gst,
        cumulative_sales.discounted_sales_rate_ex_gst,
        round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
        0 AS igst_amount,
        (cumulative_sales.stock_before_sale - cumulative_sales.quantity) AS stock,
        round((((cumulative_sales.stock_before_sale - cumulative_sales.quantity))::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
    FROM cumulative_sales
)
SELECT 
    serial_no,
    order_id,
    date,
    product_name,
    quantity,
    unit_price_ex_gst,
    gst_percentage,
    taxable_value,
    cgst_amount,
    sgst_amount,
    total_purchase_cost,
    discount_percentage,
    tax,
    hsn_code,
    product_type,
    mrp_incl_gst,
    discounted_sales_rate_ex_gst,
    invoice_value,
    igst_amount,
    stock,
    stock_taxable_value
FROM final_sales;

-- View: sales_history_final
-- Description: Final sales history view (duplicate of sales_history_2)
CREATE OR REPLACE VIEW public.sales_history_final AS
WITH sales_data AS (
    SELECT 
        po.id AS order_id,
        po.date AS order_date,
        ((item.value ->> 'service_id'::text))::uuid AS product_id,
        (item.value ->> 'service_name'::text) AS product_name,
        sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
        ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
        ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
        ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
        ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
        po.discount_percentage,
        po.tax,
        pm.hsn_code,
        pm.units AS product_type,
        po.type,
        COALESCE((po.current_stock)::integer, 0) AS stock_before_sale,
        pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
    FROM ((pos_orders po
        CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
        LEFT JOIN product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
    WHERE (po.type = 'sale'::text)
    GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), 
             (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), 
             (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), 
             po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, 
             pm."Purchase_Cost/Unit(Ex.GST)"
), sales_with_serial AS (
    SELECT 
        sales_data.*,
        row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
    FROM sales_data
), total_sold_per_product AS (
    SELECT 
        sales_with_serial.product_id,
        sum(sales_with_serial.quantity) AS total_sold
    FROM sales_with_serial
    GROUP BY sales_with_serial.product_id
), cumulative_sales AS (
    SELECT 
        s.*,
        t.total_sold,
        sum(s.quantity) OVER (
            PARTITION BY s.product_id 
            ORDER BY s.order_date, s.order_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_quantity_sold
    FROM (sales_with_serial s
        JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
), final_sales AS (
    SELECT 
        ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
        cumulative_sales.order_id,
        date(cumulative_sales.order_date) AS date,
        cumulative_sales.product_name,
        cumulative_sales.quantity,
        cumulative_sales.unit_price_ex_gst,
        cumulative_sales.gst_percentage,
        round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
        round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
        round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
        round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
        cumulative_sales.discount_percentage,
        cumulative_sales.tax,
        cumulative_sales.hsn_code,
        cumulative_sales.product_type,
        cumulative_sales.mrp_incl_gst,
        cumulative_sales.discounted_sales_rate_ex_gst,
        round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
        0 AS igst_amount,
        (cumulative_sales.stock_before_sale - cumulative_sales.quantity) AS stock,
        round((((cumulative_sales.stock_before_sale - cumulative_sales.quantity))::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
    FROM cumulative_sales
)
SELECT 
    serial_no,
    order_id,
    date,
    product_name,
    quantity,
    unit_price_ex_gst,
    gst_percentage,
    taxable_value,
    cgst_amount,
    sgst_amount,
    total_purchase_cost,
    discount_percentage,
    tax,
    hsn_code,
    product_type,
    mrp_incl_gst,
    discounted_sales_rate_ex_gst,
    invoice_value,
    igst_amount,
    stock,
    stock_taxable_value
FROM final_sales;

-- View: sales_history_grouped
-- Description: Grouped sales history by order with combined product information
CREATE OR REPLACE VIEW public.sales_history_grouped AS
SELECT 
    po.id AS order_id,
    row_number() OVER (ORDER BY po.created_at DESC) AS serial_no,
    (po.created_at)::date AS date,
    po.client_name,
    po.stylist_name,
    string_agg(DISTINCT (service_item.value ->> 'service_name'::text), ', '::text) AS combined_product_names,
    string_agg(DISTINCT (service_item.value ->> 'hsn_code'::text), ', '::text) FILTER (WHERE (((service_item.value ->> 'hsn_code'::text) IS NOT NULL) AND ((service_item.value ->> 'hsn_code'::text) <> ''::text))) AS combined_hsn_codes,
    sum(((service_item.value ->> 'quantity'::text))::numeric) AS total_quantity,
    sum((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric)) AS total_taxable_value,
    sum((((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric) * ((service_item.value ->> 'gst_percentage'::text))::numeric) / (200)::numeric)) AS total_cgst_amount,
    sum((((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric) * ((service_item.value ->> 'gst_percentage'::text))::numeric) / (200)::numeric)) AS total_sgst_amount,
    COALESCE(po.discount, (0)::double precision) AS total_discount,
    sum(((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric) * ((1)::numeric + (((service_item.value ->> 'gst_percentage'::text))::numeric / (100)::numeric)))) AS total_invoice_value,
    avg(((service_item.value ->> 'gst_percentage'::text))::numeric) AS gst_percentage,
    po.payment_method,
    po.status,
    po.total AS order_total
FROM (pos_orders po
    CROSS JOIN LATERAL jsonb_array_elements(po.services) service_item(value))
WHERE ((po.type = 'sale'::text) AND ((service_item.value ->> 'type'::text) = 'product'::text) AND (po.services IS NOT NULL) AND (jsonb_array_length(po.services) > 0))
GROUP BY po.id, po.created_at, po.client_name, po.stylist_name, po.discount, po.payment_method, po.status, po.total
ORDER BY po.created_at DESC;

-- View: salon_c
-- Description: Combined salon data including sales and consumption
CREATE OR REPLACE VIEW public.salon_c AS
WITH combined_data AS (
    SELECT 
        po.id AS order_id,
        po.date AS order_date,
        ((item.value ->> 'service_id'::text))::uuid AS product_id,
        (item.value ->> 'service_name'::text) AS product_name,
        sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
        ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
        ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
        ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
        ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
        po.discount_percentage,
        po.tax,
        pm.hsn_code,
        pm.units AS product_type,
        po.type,
        COALESCE((po.current_stock)::integer, 0) AS stock_before_sale,
        pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
    FROM ((pos_orders po
        CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
        LEFT JOIN product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
    WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
    GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), 
             (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), 
             (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), 
             po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, 
             pm."Purchase_Cost/Unit(Ex.GST)"
    UNION ALL
    SELECT 
        po.id AS order_id,
        po.date AS order_date,
        ((item.value ->> 'service_id'::text))::uuid AS product_id,
        (item.value ->> 'service_name'::text) AS product_name,
        sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
        ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
        ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
        ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
        ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
        po.discount_percentage,
        po.tax,
        pm.hsn_code,
        pm.units AS product_type,
        po.type,
        COALESCE((po.current_stock)::integer, 0) AS stock_before_sale,
        pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
    FROM ((pos_orders po
        CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
        LEFT JOIN product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
    WHERE ((po.type = 'salon_consumption'::text) AND (po.is_salon_consumption = true) AND ((item.value ->> 'type'::text) = 'product'::text))
    GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), 
             (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), 
             (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), 
             po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, 
             pm."Purchase_Cost/Unit(Ex.GST)"
), sales_with_serial AS (
    SELECT 
        combined_data.*,
        row_number() OVER (PARTITION BY combined_data.product_id ORDER BY combined_data.order_date, combined_data.order_id) AS rn
    FROM combined_data
), total_sold_per_product AS (
    SELECT 
        sales_with_serial.product_id,
        sum(sales_with_serial.quantity) AS total_sold
    FROM sales_with_serial
    GROUP BY sales_with_serial.product_id
), cumulative_sales AS (
    SELECT 
        s.*,
        t.total_sold,
        sum(s.quantity) OVER (
            PARTITION BY s.product_id 
            ORDER BY s.order_date, s.order_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_quantity_sold
    FROM (sales_with_serial s
        JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
), final_sales AS (
    SELECT 
        ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
        cumulative_sales.order_id,
        date(cumulative_sales.order_date) AS date,
        cumulative_sales.product_name,
        cumulative_sales.quantity,
        cumulative_sales.unit_price_ex_gst,
        cumulative_sales.gst_percentage,
        round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
        round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
        round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
        round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
        cumulative_sales.discount_percentage,
        cumulative_sales.tax,
        cumulative_sales.hsn_code,
        cumulative_sales.product_type,
        cumulative_sales.mrp_incl_gst,
        cumulative_sales.discounted_sales_rate_ex_gst,
        round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
        0 AS igst_amount,
        (cumulative_sales.stock_before_sale - cumulative_sales.quantity) AS stock,
        round((((cumulative_sales.stock_before_sale - cumulative_sales.quantity))::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
    FROM cumulative_sales
)
SELECT 
    serial_no,
    order_id,
    date,
    product_name,
    quantity,
    unit_price_ex_gst,
    gst_percentage,
    taxable_value,
    cgst_amount,
    sgst_amount,
    total_purchase_cost,
    discount_percentage,
    tax,
    hsn_code,
    product_type,
    mrp_incl_gst,
    discounted_sales_rate_ex_gst,
    invoice_value,
    igst_amount,
    stock,
    stock_taxable_value
FROM final_sales;

-- View: salon_consumption_final  
-- Description: Detailed salon consumption tracking with tax calculations
CREATE OR REPLACE VIEW public.salon_consumption_final AS
WITH consumption_data AS (
    SELECT 
        po.id AS order_id,
        po.date AS order_date,
        item.value AS item,
        ((item.value ->> 'id'::text))::uuid AS product_id,
        ((item.value ->> 'quantity'::text))::integer AS quantity,
        ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
        ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
        ((item.value ->> 'price'::text))::numeric AS mrp_incl_gst,
        ((item.value ->> 'price'::text))::numeric AS discounted_sales_rate_ex_gst,
        COALESCE(po.discount_percentage, (0)::numeric) AS discount_percentage,
        po.tax,
        pm.hsn_code,
        pm.units AS product_type,
        po.type,
        (item.value ->> 'name'::text) AS product_name,
        (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock,
        pm."Purchase_Cost/Unit(Ex.GST)"
    FROM ((pos_orders po
        CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
        LEFT JOIN product_master pm ON ((pm.id = ((item.value ->> 'id'::text))::uuid)))
    WHERE ((po.type = 'salon_consumption'::text) AND (po.is_salon_consumption = true) AND ((item.value ->> 'type'::text) = 'product'::text))
), consumption_with_serial AS (
    SELECT 
        consumption_data.*,
        row_number() OVER (PARTITION BY consumption_data.product_id ORDER BY consumption_data.order_date, consumption_data.order_id) AS rn
    FROM consumption_data
), total_consumed_per_product AS (
    SELECT 
        consumption_with_serial.product_id,
        sum(consumption_with_serial.quantity) AS total_sold
    FROM consumption_with_serial
    GROUP BY consumption_with_serial.product_id
), cumulative_consumption AS (
    SELECT 
        s.*,
        t.total_sold,
        sum(s.quantity) OVER (
            PARTITION BY s.product_id 
            ORDER BY s.order_date, s.order_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_quantity_sold
    FROM (consumption_with_serial s
        JOIN total_consumed_per_product t ON ((s.product_id = t.product_id)))
), final_consumption AS (
    SELECT 
        ('CONSUMPTION-'::text || lpad((row_number() OVER (ORDER BY cumulative_consumption.order_date))::text, 2, '0'::text)) AS serial_no,
        cumulative_consumption.order_id,
        date(cumulative_consumption.order_date) AS date,
        cumulative_consumption.product_name,
        cumulative_consumption.quantity,
        cumulative_consumption.unit_price_ex_gst,
        cumulative_consumption.gst_percentage,
        round((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric), 2) AS taxable_value,
        round(((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
        round(((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
        round(((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
        cumulative_consumption.discount_percentage,
        cumulative_consumption.tax,
        cumulative_consumption.hsn_code,
        cumulative_consumption.product_type,
        cumulative_consumption.mrp_incl_gst,
        cumulative_consumption.discounted_sales_rate_ex_gst,
        round((((cumulative_consumption.quantity)::numeric * cumulative_consumption.unit_price_ex_gst) * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS invoice_value,
        0 AS igst_amount,
        cumulative_consumption.current_stock AS stock,
        round(((cumulative_consumption.current_stock)::numeric * cumulative_consumption."Purchase_Cost/Unit(Ex.GST)"), 2) AS stock_taxable_value,
        round((((((cumulative_consumption.current_stock)::numeric * cumulative_consumption."Purchase_Cost/Unit(Ex.GST)") * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount_stock,
        round((((((cumulative_consumption.current_stock)::numeric * cumulative_consumption."Purchase_Cost/Unit(Ex.GST)") * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount_stock
    FROM cumulative_consumption
)
SELECT 
    serial_no,
    order_id,
    date,
    product_name,
    quantity,
    unit_price_ex_gst,
    gst_percentage,
    taxable_value,
    cgst_amount,
    sgst_amount,
    total_purchase_cost,
    discount_percentage,
    tax,
    hsn_code,
    product_type,
    mrp_incl_gst,
    discounted_sales_rate_ex_gst,
    invoice_value,
    igst_amount,
    stock,
    stock_taxable_value,
    cgst_amount_stock,
    sgst_amount_stock
FROM final_consumption;

-- View: salon_consumption_new
-- Description: New format for salon consumption reporting
CREATE OR REPLACE VIEW public.salon_consumption_new AS
WITH consumption_data AS (
    SELECT 
        po.id AS order_id,
        (po.created_at)::timestamp without time zone AS order_date,
        ((service.value ->> 'service_id'::text))::uuid AS product_id,
        COALESCE(((service.value ->> 'quantity'::text))::integer, 1) AS quantity,
        ((service.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
        COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric) AS gst_percentage,
        pm.hsn_code,
        pm.units AS product_type,
        (service.value ->> 'service_name'::text) AS product_name,
        (COALESCE((po.current_stock)::integer, 0) - COALESCE(((service.value ->> 'quantity'::text))::integer, 1)) AS current_stock_after_consumption
    FROM ((pos_orders po
        CROSS JOIN LATERAL jsonb_array_elements(po.services) service(value))
        LEFT JOIN product_master pm ON ((pm.id = ((service.value ->> 'service_id'::text))::uuid)))
    WHERE ((po.type = 'salon_consumption'::text) AND (po.is_salon_consumption = true) AND ((service.value ->> 'type'::text) = 'product'::text))
), consumption_with_serial AS (
    SELECT 
        consumption_data.*,
        row_number() OVER (PARTITION BY consumption_data.product_id ORDER BY consumption_data.order_date, consumption_data.order_id) AS rn
    FROM consumption_data
), total_consumed_per_product AS (
    SELECT 
        consumption_with_serial.product_id,
        sum(consumption_with_serial.quantity) AS total_consumed
    FROM consumption_with_serial
    GROUP BY consumption_with_serial.product_id
), cumulative_consumption AS (
    SELECT 
        c.*,
        t.total_consumed,
        sum(c.quantity) OVER (
            PARTITION BY c.product_id 
            ORDER BY c.order_date, c.order_id 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_quantity_consumed
    FROM (consumption_with_serial c
        JOIN total_consumed_per_product t ON ((c.product_id = t.product_id)))
), final_consumption AS (
    SELECT 
        ('SALON-'::text || lpad((row_number() OVER (ORDER BY cumulative_consumption.order_date))::text, 2, '0'::text)) AS "Requisition Voucher No.",
        cumulative_consumption.order_id,
        date(cumulative_consumption.order_date) AS "Date",
        cumulative_consumption.product_name AS "Product Name",
        cumulative_consumption.quantity AS "Consumption Qty.",
        cumulative_consumption.hsn_code AS "HSN_Code",
        round(cumulative_consumption.unit_price_ex_gst, 2) AS "Purchase_Cost_per_Unit_Ex_GST_Rs",
        cumulative_consumption.gst_percentage AS "Purchase_GST_Percentage",
        round((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric), 2) AS "Purchase_Taxable_Value_Rs",
        0 AS "Purchase_IGST_Rs",
        round((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (200)::numeric), 2) AS "Purchase_CGST_Rs",
        round((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (200)::numeric), 2) AS "Purchase_SGST_Rs",
        round(((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS "Total_Purchase_Cost_Rs",
        round((cumulative_consumption.unit_price_ex_gst * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS "Discounted_Sales_Rate_Rs",
        cumulative_consumption.current_stock_after_consumption AS "Current_Stock"
    FROM cumulative_consumption
)
SELECT 
    "Requisition Voucher No.",
    order_id,
    "Date",
    "Product Name",
    "Consumption Qty.",
    "HSN_Code",
    "Purchase_Cost_per_Unit_Ex_GST_Rs",
    "Purchase_GST_Percentage",
    "Purchase_Taxable_Value_Rs",
    "Purchase_IGST_Rs",
    "Purchase_CGST_Rs",
    "Purchase_SGST_Rs",
    "Total_Purchase_Cost_Rs",
    "Discounted_Sales_Rate_Rs",
    "Current_Stock"
FROM final_consumption;

-- View: vw_stock_transactions
-- Description: Stock transactions view with user and product details
CREATE OR REPLACE VIEW public.vw_stock_transactions AS
SELECT 
    pst.id,
    pst.created_at,
    pm.name AS product_name,
    pst.quantity,
    pst.previous_stock,
    pst.new_stock,
    pst.transaction_type,
    pst.source,
    pst.source_type,
    pst.display_type,
    pst.notes,
    pst.user_id,
    p.email AS user_email
FROM ((product_stock_transactions pst
    JOIN product_master pm ON ((pm.id = pst.product_id)))
    LEFT JOIN profiles p ON ((p.id = pst.user_id)))
ORDER BY pst.created_at DESC;

-- =======================================================
-- VIEW CREATION COMPLETED
-- Total views created: 12
-- =======================================================

COMMENT ON VIEW public.product_stock_status IS 'Tracks product stock status with running totals from sales and transactions';
COMMENT ON VIEW public.product_stock_transaction_history IS 'Formatted view of product stock transactions with human-readable dates';
COMMENT ON VIEW public.products IS 'Simplified view of product_master table';
COMMENT ON VIEW public.sale_stock_view IS 'Simplified stock tracking view for sales and transactions';
COMMENT ON VIEW public.sales_history_2 IS 'Detailed sales history with tax calculations and stock tracking';
COMMENT ON VIEW public.sales_history_final IS 'Final sales history view (duplicate of sales_history_2)';
COMMENT ON VIEW public.sales_history_grouped IS 'Grouped sales history by order with combined product information';
COMMENT ON VIEW public.salon_c IS 'Combined salon data including sales and consumption';
COMMENT ON VIEW public.salon_consumption_final IS 'Detailed salon consumption tracking with tax calculations';
COMMENT ON VIEW public.salon_consumption_new IS 'New format for salon consumption reporting';
COMMENT ON VIEW public.vw_stock_transactions IS 'Stock transactions view with user and product details';