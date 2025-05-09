CREATE OR REPLACE FUNCTION delete_sales_item(item_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  affected_rows INT;
BEGIN
  -- Log the deletion attempt for debugging
  RAISE NOTICE 'Attempting to delete sales item with ID: %', item_id;
  
  -- Check if the item exists
  IF NOT EXISTS (SELECT 1 FROM pos_order_items WHERE id = item_id::UUID) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found with ID: ' || item_id
    );
  END IF;

  -- Delete the item from pos_order_items
  DELETE FROM pos_order_items 
  WHERE id = item_id::UUID
  RETURNING count(*) INTO affected_rows;
  
  -- Check if deletion was successful
  IF affected_rows > 0 THEN
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully deleted sales item',
      'affected_rows', affected_rows
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'error', 'Failed to delete item. No rows affected.'
    );
  END IF;
  
  RETURN result;
END;
$$; 