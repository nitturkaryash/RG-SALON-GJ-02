import { supabase, TABLES } from '../lib/supabase';

// Interface for stock transaction
interface StockTransaction {
  id: string;
  product_name: string;
  quantity: number;
  transaction_type: 'purchase' | 'sale' | 'consumption' | 'adjustment';
  date: string;
  created_at: string;
}

// Interface for stock balance
interface StockBalance {
  product_name: string;
  current_stock: number;
  total_purchases: number;
  total_sales: number;
  total_consumption: number;
}

export interface InventoryAdjustment {
  productName: string;
  productId?: string;
  quantity: number;
}

export interface OrderInventoryAdjustmentPayload {
  orderReference?: string | null;
  orderDate?: string | null;
  adjustments: InventoryAdjustment[];
}

// Function to recalculate stock for a specific product after a transaction is deleted
export const recalculateProductStockAfterDeletion = async (
  productName: string,
  deletedTransaction: {
    quantity: number;
    transaction_type: 'purchase' | 'sale' | 'consumption';
    date: string;
  }
): Promise<void> => {
  try {
    console.log(
      `Recalculating stock for product: ${productName} after deletion`
    );

    // Get all transactions for this product ordered by date
    const transactions = await getAllProductTransactions(productName);

    // Remove the deleted transaction from the list (if it exists)
    const filteredTransactions = transactions.filter(
      t =>
        !(
          t.quantity === deletedTransaction.quantity &&
          t.transaction_type === deletedTransaction.transaction_type &&
          t.date === deletedTransaction.date
        )
    );

    // Recalculate stock based on remaining transactions
    let runningStock = 0;
    const updatedTransactions: any[] = [];

    for (const transaction of filteredTransactions) {
      // Calculate new stock after this transaction
      if (transaction.transaction_type === 'purchase') {
        runningStock += transaction.quantity;
      } else if (
        transaction.transaction_type === 'sale' ||
        transaction.transaction_type === 'consumption'
      ) {
        runningStock -= transaction.quantity;
      }

      // Store the updated stock for this transaction
      updatedTransactions.push({
        ...transaction,
        stock_after_transaction: runningStock,
      });
    }

    // Update all subsequent transactions with new stock levels
    await updateTransactionStockLevels(updatedTransactions);

    // Update the product master table with the final stock
    await updateProductMasterStock(productName, runningStock);

    console.log(
      `Stock recalculation completed for ${productName}. Final stock: ${runningStock}`
    );
  } catch (error) {
    console.error('Error recalculating product stock:', error);
    throw error;
  }
};

// Function to get all transactions for a product
const getAllProductTransactions = async (
  productName: string
): Promise<StockTransaction[]> => {
  try {
    const transactions: StockTransaction[] = [];

    // Get purchase transactions from purchase_history_with_stock
    const { data: purchases, error: purchaseError } = await supabase
      .from(TABLES.PURCHASE_HISTORY_WITH_STOCK)
      .select(
        'purchase_id as id, product_name, purchase_qty as quantity, date, created_at'
      )
      .eq('product_name', productName)
      .order('date', { ascending: true });

    if (purchaseError) {
      console.error('Error fetching purchase transactions:', purchaseError);
    } else if (purchases) {
      transactions.push(
        ...purchases.map((p: any) => ({
          id: p.id,
          product_name: p.product_name,
          quantity: p.quantity,
          date: p.date,
          created_at: p.created_at,
          transaction_type: 'purchase' as const,
        }))
      );
    }

    // Get sales transactions from sales_history_final
    const { data: sales, error: salesError } = await supabase
      .from(TABLES.SALES)
      .select('sale_id as id, product_name, quantity, date, created_at')
      .eq('product_name', productName)
      .order('date', { ascending: true });

    if (salesError) {
      console.error('Error fetching sales transactions:', salesError);
    } else if (sales) {
      transactions.push(
        ...sales.map((s: any) => ({
          id: s.id,
          product_name: s.product_name,
          quantity: s.quantity,
          date: s.date,
          created_at: s.created_at,
          transaction_type: 'sale' as const,
        }))
      );
    }

    // Get consumption transactions from salon_consumption_new
    const { data: consumption, error: consumptionError } = await supabase
      .from(TABLES.CONSUMPTION)
      .select('id, "Product Name", "Consumption_Qty", "Date", created_at')
      .eq('Product Name', productName)
      .order('Date', { ascending: true });

    if (consumptionError) {
      console.error(
        'Error fetching consumption transactions:',
        consumptionError
      );
    } else if (consumption) {
      transactions.push(
        ...consumption.map((c: any) => ({
          id: c.id,
          product_name: c['Product Name'],
          quantity: c['Consumption_Qty'],
          transaction_type: 'consumption' as const,
          date: c['Date'],
          created_at: c.created_at || c['Date'],
        }))
      );
    }

    // Sort all transactions by date
    return transactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error getting product transactions:', error);
    return [];
  }
};

// Function to update transaction stock levels
const updateTransactionStockLevels = async (
  transactions: any[]
): Promise<void> => {
  try {
    const salesBaseTable = TABLES.SALES_BASE || 'inventory_sales_new';

    for (const transaction of transactions) {
      if (transaction.transaction_type === 'purchase') {
        const { error } = await supabase
          .from(TABLES.PURCHASE_HISTORY_WITH_STOCK)
          .update({ stock_after_purchase: transaction.stock_after_transaction })
          .eq('purchase_id', transaction.id);

        if (error) {
          console.error(
            `Error updating purchase transaction ${transaction.id}:`,
            error
          );
        }
      } else if (transaction.transaction_type === 'sale') {
        const updatePayload: Record<string, number> = {
          current_stock: transaction.stock_after_transaction,
          remaining_stock: transaction.stock_after_transaction,
        };

        const { error } = await supabase
          .from(salesBaseTable)
          .update(updatePayload)
          .eq('sale_id', transaction.id);

        if (error) {
          console.error(
            `Error updating sales transaction ${transaction.id}:`,
            error
          );
        }
      }
      // Consumption table currently has no stock fields to update
    }
  } catch (error) {
    console.error('Error updating transaction stock levels:', error);
  }
};

// Function to update product master stock
const updateProductMasterStock = async (
  productName: string,
  newStock: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_master')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('name', productName);

    if (error) {
      console.error(
        `Error updating product master stock for ${productName}:`,
        error
      );
    } else {
      console.log(
        `Updated product master stock for ${productName}: ${newStock}`
      );
    }
  } catch (error) {
    console.error('Error updating product master:', error);
  }
};

// Function to recalculate all stock levels (for migration or full recalculation)
export const recalculateAllStockLevels = async (): Promise<void> => {
  try {
    console.log('Starting full stock recalculation for all products...');

    // Get all unique product names
    const { data: products, error: productsError } = await supabase
      .from('product_master')
      .select('name')
      .eq('active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    if (!products || products.length === 0) {
      console.log('No products found to recalculate');
      return;
    }

    console.log(`Recalculating stock for ${products.length} products...`);

    // Recalculate stock for each product
    for (const product of products) {
      await recalculateProductStock(product.name);
    }

    console.log('Full stock recalculation completed successfully!');
  } catch (error) {
    console.error('Error during full stock recalculation:', error);
    throw error;
  }
};

// Function to recalculate stock for a single product
const recalculateProductStock = async (productName: string): Promise<void> => {
  try {
    const transactions = await getAllProductTransactions(productName);

    let runningStock = 0;
    const updatedTransactions: any[] = [];

    for (const transaction of transactions) {
      // Calculate new stock after this transaction
      if (transaction.transaction_type === 'purchase') {
        runningStock += transaction.quantity;
      } else if (
        transaction.transaction_type === 'sale' ||
        transaction.transaction_type === 'consumption'
      ) {
        runningStock -= transaction.quantity;
      }

      // Store the updated stock for this transaction
      updatedTransactions.push({
        ...transaction,
        stock_after_transaction: runningStock,
      });
    }

    // Update all transactions with new stock levels
    await updateTransactionStockLevels(updatedTransactions);

    // Update the product master table with the final stock
    await updateProductMasterStock(productName, runningStock);

    console.log(
      `Stock recalculated for ${productName}. Final stock: ${runningStock}`
    );
  } catch (error) {
    console.error(`Error recalculating stock for ${productName}:`, error);
  }
};

// Function to handle purchase deletion and stock adjustment
export const handlePurchaseDeletion = async (
  purchaseId: string
): Promise<void> => {
  try {
    console.log(`Handling purchase deletion: ${purchaseId}`);

    // Get the purchase transaction details before deletion
    const { data: purchase, error: fetchError } = await supabase
      .from('purchase_history_with_stock')
      .select('product_name, purchase_qty, date')
      .eq('purchase_id', purchaseId)
      .single();

    if (fetchError || !purchase) {
      console.error('Error fetching purchase for deletion:', fetchError);
      return;
    }

    // Recalculate stock after deletion
    await recalculateProductStockAfterDeletion(purchase.product_name, {
      quantity: purchase.purchase_qty,
      transaction_type: 'purchase',
      date: purchase.date,
    });

    console.log(
      `Stock recalculation completed after purchase deletion: ${purchaseId}`
    );
  } catch (error) {
    console.error('Error handling purchase deletion:', error);
    throw error;
  }
};

// Function to handle sales deletion and stock adjustment
export const handleSalesDeletion = async (saleId: string): Promise<void> => {
  try {
    console.log(`Handling sales deletion: ${saleId}`);

    // Get the sales transaction details before deletion
    const { data: sale, error: fetchError } = await supabase
      .from(TABLES.SALES)
      .select('product_name, quantity, date')
      .eq('sale_id', saleId)
      .single();

    if (fetchError || !sale) {
      console.error('Error fetching sale for deletion:', fetchError);
      return;
    }

    // Recalculate stock after deletion
    await recalculateProductStockAfterDeletion(sale.product_name, {
      quantity: sale.quantity,
      transaction_type: 'sale',
      date: sale.date,
    });

    console.log(
      `Stock recalculation completed after sales deletion: ${saleId}`
    );
  } catch (error) {
    console.error('Error handling sales deletion:', error);
    throw error;
  }
};

// Function to handle consumption deletion and stock adjustment
export const handleConsumptionDeletion = async (
  consumptionId: string
): Promise<void> => {
  try {
    console.log(`Handling consumption deletion: ${consumptionId}`);

    // Get the consumption transaction details before deletion
    const { data: consumption, error: fetchError } = await supabase
      .from(TABLES.CONSUMPTION)
      .select('"Product Name", "Consumption_Qty", "Date"')
      .eq('id', consumptionId)
      .single();

    if (fetchError || !consumption) {
      console.error('Error fetching consumption for deletion:', fetchError);
      return;
    }

    // Recalculate stock after deletion
    await recalculateProductStockAfterDeletion(consumption['Product Name'], {
      quantity: consumption['Consumption_Qty'],
      transaction_type: 'consumption',
      date: consumption['Date'],
    });

    console.log(
      `Stock recalculation completed after consumption deletion: ${consumptionId}`
    );
  } catch (error) {
    console.error('Error handling consumption deletion:', error);
    throw error;
  }
};

export const restoreInventoryAfterOrderDeletion = async (
  payload: OrderInventoryAdjustmentPayload
): Promise<void> => {
  if (!payload || !Array.isArray(payload.adjustments)) {
    console.log('restoreInventoryAfterOrderDeletion: No adjustments provided');
    return;
  }

  const productNames = new Set<string>();

  payload.adjustments.forEach(adjustment => {
    if (!adjustment?.productName) {
      return;
    }

    const quantity = Number(adjustment?.quantity || 0);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return;
    }

    productNames.add(adjustment.productName);
  });

  if (productNames.size === 0) {
    console.log(
      'restoreInventoryAfterOrderDeletion: No valid product adjustments needed'
    );
    return;
  }

  for (const productName of productNames.values()) {
    try {
      await recalculateProductStockAfterDeletion(productName, {
        quantity: 0,
        transaction_type: 'sale',
        date: payload.orderDate || new Date().toISOString(),
      });
    } catch (recalcError) {
      console.warn(
        `restoreInventoryAfterOrderDeletion: Failed to recalculate stock for ${productName}:`,
        recalcError
      );
    }
  }
};

// Test function to verify database connectivity and table structure
export const testStockRecalculationSystem = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log('Testing stock recalculation system...');

    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from(TABLES.PURCHASE_HISTORY_WITH_STOCK)
      .select('purchase_id, product_name, purchase_qty, date')
      .limit(1);

    if (testError) {
      return {
        success: false,
        message: `Database connection failed: ${testError.message}`,
        data: { error: testError },
      };
    }

    // Test 2: Check if we can fetch from sales table
    const { data: salesData, error: salesError } = await supabase
      .from(TABLES.SALES)
      .select('sale_id, product_name, quantity, date')
      .limit(1);

    if (salesError) {
      return {
        success: false,
        message: `Sales table access failed: ${salesError.message}`,
        data: { error: salesError },
      };
    }

    // Test 3: Check if we can fetch from consumption table
    const { data: consumptionData, error: consumptionError } = await supabase
      .from(TABLES.CONSUMPTION)
      .select('id, "Product Name", "Consumption_Qty", "Date"')
      .limit(1);

    if (consumptionError) {
      return {
        success: false,
        message: `Consumption table access failed: ${consumptionError.message}`,
        data: { error: consumptionError },
      };
    }

    // Test 4: Check if we can access product_master table
    const { data: productData, error: productError } = await supabase
      .from('product_master')
      .select('id, name, stock_quantity')
      .limit(1);

    if (productError) {
      return {
        success: false,
        message: `Product master table access failed: ${productError.message}`,
        data: { error: productError },
      };
    }

    return {
      success: true,
      message:
        'Stock recalculation system test passed! All database connections working.',
      data: {
        purchaseRecords: testData?.length || 0,
        salesRecords: salesData?.length || 0,
        consumptionRecords: consumptionData?.length || 0,
        productRecords: productData?.length || 0,
      },
    };
  } catch (error) {
    console.error('Stock recalculation system test failed:', error);
    return {
      success: false,
      message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: { error },
    };
  }
};
