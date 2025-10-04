import { supabase } from './supabaseClient';

/**
 * Deploy the atomic stock update function to prevent race conditions
 * This function ensures microsecond-precision stock calculations
 */
export const deployAtomicStockUpdateFunction = async (): Promise<{
  success: boolean;
  error?: string;
  message: string;
}> => {
  try {
    console.log('🚀 Deploying atomic stock update function...');

    // Read the SQL file content
    const sqlContent = `
-- Atomic Stock Update Function with Microsecond Precision
-- This function prevents race conditions by performing stock calculation and update in a single transaction

CREATE OR REPLACE FUNCTION atomic_stock_update_with_purchase(
    p_product_id UUID,
    p_purchase_quantity INTEGER,
    p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock INTEGER;
    v_new_stock INTEGER;
    v_transaction_id UUID;
    v_result JSONB;
    v_lock_time TIMESTAMPTZ;
    v_start_time TIMESTAMPTZ;
BEGIN
    -- Record start time with microsecond precision
    v_start_time := clock_timestamp();
    
    -- Generate unique transaction ID
    v_transaction_id := gen_random_uuid();
    
    -- Lock the product row for update to prevent race conditions
    -- This ensures only one process can update the stock at a time
    SELECT stock_quantity INTO v_current_stock
    FROM product_master 
    WHERE id = p_product_id
    FOR UPDATE NOWAIT;
    
    -- Record lock acquisition time
    v_lock_time := clock_timestamp();
    
    -- Check if product exists
    IF v_current_stock IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Product not found',
            'transaction_id', v_transaction_id,
            'timestamp', v_start_time
        );
    END IF;
    
    -- Calculate new stock
    v_new_stock := v_current_stock + p_purchase_quantity;
    
    -- Validate stock calculation
    IF v_new_stock < 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Stock would become negative',
            'current_stock', v_current_stock,
            'purchase_quantity', p_purchase_quantity,
            'transaction_id', v_transaction_id,
            'timestamp', v_start_time
        );
    END IF;
    
    -- Update the stock atomically
    UPDATE product_master 
    SET 
        stock_quantity = v_new_stock,
        updated_at = v_lock_time
    WHERE id = p_product_id;
    
    -- Build success result with timing information
    v_result := jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'previous_stock', v_current_stock,
        'new_stock', v_new_stock,
        'purchase_quantity', p_purchase_quantity,
        'start_time', v_start_time,
        'lock_time', v_lock_time,
        'end_time', clock_timestamp(),
        'duration_microseconds', EXTRACT(MICROSECONDS FROM (clock_timestamp() - v_start_time))
    );
    
    -- Log the transaction for debugging
    INSERT INTO stock_transaction_log (
        transaction_id,
        product_id,
        operation_type,
        previous_stock,
        new_stock,
        quantity_change,
        timestamp,
        duration_microseconds
    ) VALUES (
        v_transaction_id,
        p_product_id,
        'purchase_addition',
        v_current_stock,
        v_new_stock,
        p_purchase_quantity,
        v_lock_time,
        EXTRACT(MICROSECONDS FROM (clock_timestamp() - v_start_time))
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN lock_not_available THEN
        -- Handle concurrent access
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Concurrent access detected - please retry',
            'transaction_id', v_transaction_id,
            'timestamp', v_start_time,
            'duration_microseconds', EXTRACT(MICROSECONDS FROM (clock_timestamp() - v_start_time))
        );
    WHEN OTHERS THEN
        -- Handle any other errors
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'transaction_id', v_transaction_id,
            'timestamp', v_start_time,
            'duration_microseconds', EXTRACT(MICROSECONDS FROM (clock_timestamp() - v_start_time))
        );
END;
$$;

-- Create a table to log stock transactions for debugging and auditing
CREATE TABLE IF NOT EXISTS stock_transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    product_id UUID NOT NULL,
    operation_type TEXT NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    duration_microseconds NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_stock_transaction_log_product_timestamp 
ON stock_transaction_log (product_id, timestamp);
`;

    // Execute the SQL to create the function
    const { error } = await supabase.rpc('exec_sql', {
      query: sqlContent,
    });

    if (error) {
      console.error('❌ Failed to deploy atomic stock update function:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to deploy atomic stock update function',
      };
    }

    console.log('✅ Atomic stock update function deployed successfully!');

    // Test the function to make sure it works
    const testResult = await testAtomicStockUpdateFunction();

    return {
      success: true,
      message: testResult.success
        ? 'Atomic stock update function deployed and tested successfully'
        : `Function deployed but test failed: ${testResult.error}`,
    };
  } catch (error) {
    console.error('❌ Error deploying atomic stock update function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to deploy atomic stock update function',
    };
  }
};

/**
 * Test the atomic stock update function
 */
const testAtomicStockUpdateFunction = async (): Promise<{
  success: boolean;
  error?: string;
  message: string;
}> => {
  try {
    console.log('🧪 Testing atomic stock update function...');

    // Find a test product to use
    const { data: testProduct, error: productError } = await supabase
      .from('product_master')
      .select('id, name, stock_quantity')
      .limit(1)
      .single();

    if (productError || !testProduct) {
      return {
        success: false,
        error: 'No test product found',
        message: 'Cannot test function without a test product',
      };
    }

    console.log(
      `📦 Testing with product: ${testProduct.name} (ID: ${testProduct.id})`
    );

    // Test the atomic function
    const { data: result, error } = await supabase.rpc(
      'atomic_stock_update_with_purchase',
      {
        p_product_id: testProduct.id,
        p_purchase_quantity: 0, // Add 0 to just test the function without changing stock
        p_timestamp: new Date().toISOString(),
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Function test failed',
      };
    }

    if (!result || !result.success) {
      return {
        success: false,
        error: result?.error || 'Unknown error',
        message: 'Function returned failure',
      };
    }

    console.log('✅ Atomic stock update function test passed!');
    console.log('📊 Test results:', {
      transaction_id: result.transaction_id,
      duration_microseconds: result.duration_microseconds,
      previous_stock: result.previous_stock,
      new_stock: result.new_stock,
    });

    return {
      success: true,
      message: `Function test passed in ${result.duration_microseconds} microseconds`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Function test failed',
    };
  }
};

/**
 * Get stock transaction logs for debugging
 */
export const getStockTransactionLogs = async (
  productId?: string,
  limit: number = 10
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  try {
    let query = supabase
      .from('stock_transaction_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
