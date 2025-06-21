-- Enhanced Product Price History Table with both GST inclusive and exclusive tracking
DROP TABLE IF EXISTS public.product_price_history CASCADE;

CREATE TABLE public.product_price_history (
    id bigserial NOT NULL,
    product_id uuid NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    old_mrp_incl_gst numeric NOT NULL,
    new_mrp_incl_gst numeric NOT NULL,
    old_mrp_excl_gst numeric,
    new_mrp_excl_gst numeric,
    old_gst_percentage numeric,
    new_gst_percentage numeric,
    source_of_change text,
    reference_id text,
    user_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_price_history_pkey PRIMARY KEY (id),
    CONSTRAINT product_price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES product_master(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_price_history_product_id ON public.product_price_history(product_id);
CREATE INDEX idx_product_price_history_changed_at ON public.product_price_history(changed_at);
CREATE INDEX idx_product_price_history_source ON public.product_price_history(source_of_change);

-- Add some helpful comments
COMMENT ON TABLE public.product_price_history IS 'Tracks all price changes for products including both GST inclusive and exclusive prices';
COMMENT ON COLUMN public.product_price_history.old_mrp_incl_gst IS 'Previous MRP including GST';
COMMENT ON COLUMN public.product_price_history.new_mrp_incl_gst IS 'New MRP including GST';
COMMENT ON COLUMN public.product_price_history.old_mrp_excl_gst IS 'Previous MRP excluding GST';
COMMENT ON COLUMN public.product_price_history.new_mrp_excl_gst IS 'New MRP excluding GST';
COMMENT ON COLUMN public.product_price_history.source_of_change IS 'Source that triggered the price change (purchase_history_add, purchase_history_edit, manual_edit, etc.)';
COMMENT ON COLUMN public.product_price_history.reference_id IS 'Reference to the transaction that caused this change (purchase_id, etc.)'; 