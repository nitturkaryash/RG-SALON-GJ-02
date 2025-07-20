-- Function to decrement product stock and log the change
create or replace function decrement_product_stock(
  p_hsn_code text,
  p_quantity_sold int,
  p_user_id uuid
)
returns text as $$
declare
  v_product_id uuid;
  v_product_name text;
  v_current_stock integer;
  v_new_stock integer;
  v_duplicate_key text;
begin
  -- Find the product by HSN code and user ID
  select id, name, stock_quantity into v_product_id, v_product_name, v_current_stock
  from public.product_master
  where hsn_code = p_hsn_code and user_id = p_user_id;

  -- If product is found, decrement its stock
  if v_product_id is not null then
    -- Calculate new stock (prevent negative)
    v_new_stock := greatest(0, v_current_stock - p_quantity_sold);
    
    -- Update stock quantity
    update public.product_master
    set
      stock_quantity = v_new_stock,
      updated_at = now()
    where id = v_product_id;
    
    -- Generate unique duplicate protection key
    v_duplicate_key := v_product_id::text || '_' || p_quantity_sold::text || '_' || extract(epoch from now())::bigint::text || '_' || random()::text;
    
    -- Log the stock transaction with conflict handling
    insert into public.product_stock_transactions (
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      notes,
      source,
      duplicate_protection_key,
      user_id,
      created_at
    ) values (
      v_product_id,
      'pos_sale',
      p_quantity_sold,
      v_current_stock,
      v_new_stock,
      'Stock decrement from Excel import via RPC',
      'excel_import',
      v_duplicate_key,
      p_user_id,
      now()
    )
    on conflict (duplicate_protection_key) do nothing;
    
    return 'Stock updated for ' || v_product_name || ' from ' || v_current_stock || ' to ' || v_new_stock;
  else
    -- If product is not found, return a warning
    return 'Warning: Product with HSN code ' || p_hsn_code || ' not found.';
  end if;
end;
$$ language plpgsql; 