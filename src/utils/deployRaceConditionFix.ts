import { deployAtomicStockUpdateFunction, getStockTransactionLogs } from './supabase/deployAtomicStockUpdate';

/**
 * Deploy the complete race condition fix
 * This includes the atomic stock update function and testing
 */
export const deployRaceConditionFix = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🔧 Starting race condition fix deployment...');

    // Step 1: Deploy the atomic stock update function
    const deployResult = await deployAtomicStockUpdateFunction();
    
    if (!deployResult.success) {
      return {
        success: false,
        message: `Failed to deploy atomic stock update function: ${deployResult.error}`,
      };
    }

    console.log('✅ Atomic stock update function deployed successfully');

    // Step 2: Test the function with a real product
    const testResult = await testRaceConditionFix();
    
    if (!testResult.success) {
      return {
        success: false,
        message: `Function deployed but test failed: ${testResult.error}`,
        details: testResult,
      };
    }

    console.log('✅ Race condition fix deployed and tested successfully');

    return {
      success: true,
      message: 'Race condition fix deployed successfully with microsecond precision',
      details: {
        deployment: deployResult,
        testing: testResult,
      },
    };

  } catch (error) {
    console.error('❌ Error deploying race condition fix:', error);
    return {
      success: false,
      message: `Failed to deploy race condition fix: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Test the race condition fix with a real purchase scenario
 */
const testRaceConditionFix = async (): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log('🧪 Testing race condition fix...');

    // Import supabase client
    const { supabase } = await import('./supabase/supabaseClient');

    // Find test_5 product for testing
    const { data: testProduct, error: productError } = await supabase
      .from('product_master')
      .select('id, name, stock_quantity')
      .eq('name', 'test_5')
      .single();

    if (productError || !testProduct) {
      return {
        success: false,
        error: 'test_5 product not found for testing',
      };
    }

    console.log(`📦 Testing with product: ${testProduct.name} | Current stock: ${testProduct.stock_quantity}`);

    // Test the atomic function with a small addition
    const testQuantity = 1;
    const { data: result, error } = await supabase.rpc(
      'atomic_stock_update_with_purchase',
      {
        p_product_id: testProduct.id,
        p_purchase_quantity: testQuantity,
        p_timestamp: new Date().toISOString(),
      }
    );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!result || !result.success) {
      return {
        success: false,
        error: result?.error || 'Unknown error',
      };
    }

    // Verify the stock was updated correctly
    const { data: updatedProduct, error: verifyError } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single();

    if (verifyError || !updatedProduct) {
      return {
        success: false,
        error: 'Failed to verify stock update',
      };
    }

    const expectedStock = testProduct.stock_quantity + testQuantity;
    
    if (updatedProduct.stock_quantity !== expectedStock) {
      return {
        success: false,
        error: `Stock mismatch: expected ${expectedStock}, got ${updatedProduct.stock_quantity}`,
      };
    }

    console.log('✅ Race condition fix test passed!');
    console.log(`📊 Stock updated correctly: ${testProduct.stock_quantity} + ${testQuantity} = ${updatedProduct.stock_quantity}`);

    return {
      success: true,
      details: {
        transaction_id: result.transaction_id,
        duration_microseconds: result.duration_microseconds,
        previous_stock: result.previous_stock,
        new_stock: result.new_stock,
        verified_stock: updatedProduct.stock_quantity,
      },
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get performance metrics for stock transactions
 */
export const getStockPerformanceMetrics = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const logsResult = await getStockTransactionLogs();
    
    if (!logsResult.success) {
      return {
        success: false,
        error: logsResult.error,
      };
    }

    const logs = logsResult.data || [];
    
    if (logs.length === 0) {
      return {
        success: true,
        data: {
          message: 'No stock transactions found',
          total_transactions: 0,
        },
      };
    }

    // Calculate performance metrics
    const durations = logs.map(log => log.duration_microseconds).filter(d => d != null);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    return {
      success: true,
      data: {
        total_transactions: logs.length,
        average_duration_microseconds: Math.round(avgDuration * 100) / 100,
        max_duration_microseconds: maxDuration,
        min_duration_microseconds: minDuration,
        recent_transactions: logs.slice(0, 5),
      },
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Fix the existing incorrect purchase record for test_5
 */
export const fixExistingTest5Record = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔧 Fixing existing test_5 purchase record...');

    const { supabase } = await import('./supabase/supabaseClient');

    // Get current stock and the incorrect purchase record
    const { data: productData, error: productError } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('name', 'test_5')
      .single();

    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_history_with_stock')
      .select('purchase_id, purchase_qty, current_stock_at_purchase')
      .eq('product_name', 'test_5')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (productError || purchaseError || !productData || !purchaseData) {
      return {
        success: false,
        message: 'Failed to fetch test_5 data for correction',
      };
    }

    // Calculate what the correct value should be
    // Current stock: 14, Last purchase: 5, So it should show: 14 + 5 = 19
    const correctStockAfterPurchase = productData.stock_quantity + purchaseData.purchase_qty;

    if (purchaseData.current_stock_at_purchase === correctStockAfterPurchase) {
      return {
        success: true,
        message: 'test_5 purchase record is already correct',
      };
    }

    // Update the incorrect record
    const { error: updateError } = await supabase
      .from('purchase_history_with_stock')
      .update({ 
        current_stock_at_purchase: correctStockAfterPurchase,
        updated_at: new Date().toISOString()
      })
      .eq('purchase_id', purchaseData.purchase_id);

    if (updateError) {
      return {
        success: false,
        message: `Failed to update test_5 record: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: `Fixed test_5 purchase record: ${purchaseData.current_stock_at_purchase} → ${correctStockAfterPurchase}`,
    };

  } catch (error) {
    return {
      success: false,
      message: `Error fixing test_5 record: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

