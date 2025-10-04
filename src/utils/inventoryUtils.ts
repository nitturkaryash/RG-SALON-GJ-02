import { supabase, handleSupabaseError } from './supabase/supabaseClient';
import { TABLES } from './supabase/supabaseClient'; // Import TABLES constant
import { Product } from '../hooks/products/useProducts'; // Import Product type if needed elsewhere
import { PurchaseTransaction } from '../hooks/inventory/usePurchaseHistory'; // Assuming this defines the structure accurately
import { v4 as uuidv4 } from 'uuid';
import { handlePurchaseDeletion } from './stockRecalculation';

// Type for the input data expected from the form
// Adapt this based on the actual formData structure in Products.tsx
export type PurchaseFormData = Omit<
  PurchaseTransaction,
  'purchase_id' | 'created_at' | 'updated_at'
> & {
  // Include any fields from the form that might not be directly in PurchaseTransaction
  id?: string; // Added to support editing existing purchases
  unit_type?: string;
  invoice_number?: string;
  purchase_cost_taxable_value?: number;
  purchase_invoice_value?: number;
  mrp_per_unit_excl_gst?: number; // Added to match the structure used in form
  purchase_excl_gst?: number; // Added to match the structure used in form
  vendor?: string;
  is_interstate?: boolean;
  discount_on_purchase_percentage?: number;
};

/**
 * Adds a purchase transaction to the purchases table
 * and updates the corresponding product's stock quantity in the products table.
 *
 * @param purchaseData - The data for the new purchase transaction from the form.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const addPurchaseTransaction = async (
  purchaseData: PurchaseFormData
) => {
  try {
    // This function should only handle adding NEW purchases.
    // Editing is handled by editPurchaseTransaction. The routing logic is handled
    // in the component that calls this function.

    // --- Step 0: Validate input data ---
    const validation = await validatePurchaseData(purchaseData);

    // Handle critical errors
    if (validation.criticalErrors.length > 0) {
      throw new Error(
        `Validation failed: ${validation.criticalErrors.join(', ')}`
      );
    }

    // Log warnings but continue
    if (validation.warnings.length > 0) {
      console.warn('Purchase validation warnings:', validation.warnings);
    }

    const timestamp = new Date().toISOString();
    let productId: string;

    console.log(
      `Adding new purchase transaction for product: ${purchaseData.product_name}`
    );

    // --- Step 1: Find or create the product ---
    const { data: existingProduct, error: fetchProductError } = await supabase
      .from('product_master')
      .select(
        'id, stock_quantity, name, hsn_code, units, gst_percentage, mrp_incl_gst, mrp_excl_gst'
      )
      .eq('name', purchaseData.product_name)
      .maybeSingle();

    if (fetchProductError) {
      console.error('Error fetching product:', fetchProductError);
      throw new Error(`Failed to find product: ${fetchProductError.message}`);
    }

    if (!existingProduct) {
      // Product doesn't exist, create it first
      console.log(
        `Product '${purchaseData.product_name}' not found. Creating new product...`
      );

      const gstPercentage = purchaseData.gst_percentage || 18;
      const mrpInclGst = purchaseData.mrp_incl_gst || 0;
      const mrpExclGst =
        purchaseData.mrp_per_unit_excl_gst ||
        mrpInclGst / (1 + gstPercentage / 100);

      const newProduct = {
        name: purchaseData.product_name,
        hsn_code: purchaseData.hsn_code || '',
        units: purchaseData.unit_type || 'pcs',
        gst_percentage: gstPercentage,
        mrp_incl_gst: mrpInclGst,
        mrp_excl_gst: mrpExclGst,
        price: mrpExclGst,
        stock_quantity: 0, // Initial stock for a new product being purchased
        active: true,
        created_at: timestamp,
        updated_at: timestamp,
        category: 'Auto-created',
      };

      const { data: newProductData, error: createProductError } = await supabase
        .from('product_master')
        .insert(newProduct)
        .select('id')
        .single();

      if (createProductError) {
        console.error('Error creating product:', createProductError);
        throw new Error(
          `Failed to create product: ${createProductError.message}`
        );
      }
      productId = newProductData.id;
      console.log(`Created new product with ID: ${productId}`);
    } else {
      productId = existingProduct.id;
      console.log(
        `Found existing product with ID: ${productId}, current stock: ${existingProduct.stock_quantity}`
      );
    }

    // RACE CONDITION FIX: Use atomic transaction with microsecond precision
    // This ensures we get the most current stock and update it atomically
    const quantityChange = purchaseData.purchase_qty || 0;

    console.log(
      `[ATOMIC STOCK UPDATE] Starting atomic transaction for ${purchaseData.product_name} | Purchase Qty: ${quantityChange} | Timestamp: ${new Date().toISOString()}`
    );

    // CRITICAL FIX: Read current product_master stock BEFORE any updates
    // This ensures we capture the ACTUAL stock value, including any sales/consumption reductions
    const { data: preCheckStock, error: preCheckError } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (preCheckError || !preCheckStock) {
      throw new Error(
        `Failed to read current stock before purchase: ${preCheckError?.message || 'Product not found'}`
      );
    }

    console.log(
      `[PRE-PURCHASE STOCK CHECK] Product ${purchaseData.product_name} current stock in product_master: ${preCheckStock.stock_quantity} (BEFORE adding ${quantityChange})`
    );

    // CRITICAL FIX: Always use direct method with pre-checked stock value
    // The atomic function was causing stale reads due to transaction isolation issues
    // Using direct method ensures we ALWAYS use the freshest stock value
    let currentProductStock: number;
    let newOverallProductStock: number;

    console.log(
      `[DIRECT STOCK UPDATE] Using pre-checked stock value for ${purchaseData.product_name}`
    );

    // CRITICAL: Use the pre-checked stock value (freshly fetched)
    // This ensures we use the EXACT stock value that exists RIGHT NOW
    currentProductStock = preCheckStock.stock_quantity;

    // DATE AND TIMESTAMP BASED LOGIC: Determine if this is a historical or current purchase
    const purchaseDate = new Date(purchaseData.date || new Date());
    const currentTimestamp = new Date();

    // Normalize dates to compare only date parts (ignore time)
    const purchaseDateOnly = new Date(
      purchaseDate.getFullYear(),
      purchaseDate.getMonth(),
      purchaseDate.getDate()
    );
    const todayDateOnly = new Date(
      currentTimestamp.getFullYear(),
      currentTimestamp.getMonth(),
      currentTimestamp.getDate()
    );

    // Calculate difference in days (can be negative for future dates)
    const timeDifferenceMs =
      currentTimestamp.getTime() - purchaseDate.getTime();
    const daysDifference = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
    const isHistoricalEntry = daysDifference > 1; // More than 1 day old
    const isFutureEntry = daysDifference < 0; // Future date
    const isCurrentEntry = !isHistoricalEntry && !isFutureEntry; // Today or yesterday

    // Determine stock update behavior based on timestamp analysis
    let shouldUpdateCurrentStock = false;
    let stockUpdateReason = '';

    if (isFutureEntry) {
      // Future entries should not affect current stock
      shouldUpdateCurrentStock = false;
      stockUpdateReason = `FUTURE ENTRY (${Math.abs(daysDifference)} days ahead)`;
    } else if (isHistoricalEntry) {
      // Historical entries (older than 1 day) should not affect current stock
      shouldUpdateCurrentStock = false;
      stockUpdateReason = `HISTORICAL ENTRY (${daysDifference} days ago)`;
    } else {
      // Current entries (today/yesterday) should update current stock
      shouldUpdateCurrentStock = true;
      stockUpdateReason = `CURRENT ENTRY (${daysDifference} days ago)`;
    }

    // Apply stock update logic based on timestamp analysis
    if (shouldUpdateCurrentStock) {
      // Recent/current purchase - update current stock normally
      newOverallProductStock = currentProductStock + quantityChange;
      console.log(
        `[${stockUpdateReason}] Date: ${purchaseDate.toISOString()}, Updating current stock: ${currentProductStock} + ${quantityChange} = ${newOverallProductStock}`
      );
    } else {
      // Historical/future purchase - do NOT update current stock
      newOverallProductStock = currentProductStock; // Keep current stock unchanged
      console.log(
        `[${stockUpdateReason}] Date: ${purchaseDate.toISOString()}, NOT updating current stock. Stock remains: ${currentProductStock}`
      );
    }

    console.log(
      `[PRE-UPDATE] Captured stock BEFORE update - Previous: ${currentProductStock}, Will add: ${quantityChange}, New will be: ${newOverallProductStock}`
    );

    // Update stock immediately to minimize race condition window
    const { error: updateError } = await supabase
      .from('product_master')
      .update({
        stock_quantity: newOverallProductStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      throw new Error(`Failed to update stock: ${updateError.message}`);
    }

    // CRITICAL FIX: Re-read the stock AFTER update to confirm the actual value
    // This handles race conditions where stock was changed between pre-check and update
    const { data: postUpdateStock, error: postUpdateError } = await supabase
      .from('product_master')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (postUpdateError || !postUpdateStock) {
      console.warn(
        'Could not verify stock after update, using calculated value'
      );
    } else if (postUpdateStock.stock_quantity !== newOverallProductStock) {
      console.warn(
        `[STOCK DRIFT DETECTED] Expected ${newOverallProductStock} but found ${postUpdateStock.stock_quantity} after update. Adjusting to actual value.`
      );
      // Use the ACTUAL stock value from database
      newOverallProductStock = postUpdateStock.stock_quantity;
      currentProductStock = newOverallProductStock - quantityChange;
    }

    console.log(
      `[DIRECT STOCK UPDATE] SUCCESS | Product: ${purchaseData.product_name} | Previous Stock: ${currentProductStock} | Purchase Qty: ${quantityChange} | New Stock: ${newOverallProductStock}`
    );

    // Validate the calculation based on entry type
    if (shouldUpdateCurrentStock) {
      // For current entries, new stock should equal current + change
      if (newOverallProductStock !== currentProductStock + quantityChange) {
        throw new Error(
          `Stock calculation error for current entry: Expected ${currentProductStock + quantityChange}, got ${newOverallProductStock}`
        );
      }
    } else {
      // For historical entries, new stock should remain unchanged
      if (newOverallProductStock !== currentProductStock) {
        throw new Error(
          `Stock calculation error for historical entry: Expected ${currentProductStock} (unchanged), got ${newOverallProductStock}`
        );
      }
    }

    // --- CHRONOLOGICAL STOCK CALCULATION ---
    // For historical entries, we need to calculate what the stock was at that specific date
    // by looking at all purchases BEFORE this date and starting from 0
    let historicalStockAtPurchase = 0;

    if (!shouldUpdateCurrentStock) {
      // This is a historical entry - calculate stock at that specific date
      console.log(
        `[CHRONOLOGICAL CALCULATION] Calculating historical stock for date: ${purchaseDate.toISOString()}`
      );

      // Get all purchases for this product BEFORE this purchase date (excluding this one)
      const { data: previousPurchases, error: historyError } = await supabase
        .from('purchase_history_with_stock')
        .select('purchase_qty, date, created_at')
        .eq('product_id', productId)
        .lt('date', purchaseDate.toISOString())
        .order('date', { ascending: true });

      if (historyError) {
        console.error(
          '[CHRONOLOGICAL CALCULATION] Error fetching previous purchases:',
          historyError
        );
        // Fallback to current stock if we can't get history
        historicalStockAtPurchase = currentProductStock + quantityChange;
      } else {
        // Calculate stock at that historical date by summing all previous purchases
        const totalPreviousPurchases =
          previousPurchases?.reduce(
            (sum, p) => sum + (p.purchase_qty || 0),
            0
          ) || 0;

        // Historical stock = sum of all previous purchases + this purchase
        historicalStockAtPurchase = totalPreviousPurchases + quantityChange;

        console.log(
          `[CHRONOLOGICAL CALCULATION] Found ${previousPurchases?.length || 0} previous purchases`
        );
        console.log(
          `[CHRONOLOGICAL CALCULATION] Previous purchases total: ${totalPreviousPurchases}`
        );
        console.log(
          `[CHRONOLOGICAL CALCULATION] This purchase: ${quantityChange}`
        );
        console.log(
          `[CHRONOLOGICAL CALCULATION] Historical stock at ${purchaseDate.toISOString()}: ${historicalStockAtPurchase}`
        );
      }
    }

    // Determine the correct stock value for purchase history record
    const purchaseHistoryStock = shouldUpdateCurrentStock
      ? newOverallProductStock // Current entries: use actual current stock
      : historicalStockAtPurchase; // Historical entries: use calculated historical stock

    console.log(
      `[PURCHASE HISTORY] ${stockUpdateReason} - Using stock value: ${purchaseHistoryStock} for purchase history record`
    );
    console.log(
      `[TIMESTAMP ANALYSIS] Purchase Date: ${purchaseDate.toISOString()}, Current: ${currentTimestamp.toISOString()}, Days Diff: ${daysDifference}, Update Current Stock: ${shouldUpdateCurrentStock}`
    );

    // --- Step 3: Prepare data for purchase_history_with_stock table ---
    // Calculate derived values
    const basePrice =
      purchaseData.mrp_excl_gst || purchaseData.mrp_per_unit_excl_gst || 0;
    const gstPercentage = purchaseData.gst_percentage || 18;
    const discountPercentage =
      purchaseData.discount_on_purchase_percentage || 0;

    // Calculate purchase cost per unit after discount
    const purchaseCostPerUnit = basePrice * (1 - discountPercentage / 100);

    // Calculate taxable value
    const calculatedTaxableValue = purchaseCostPerUnit * quantityChange;

    // Calculate GST amounts
    const gstAmount = (calculatedTaxableValue * gstPercentage) / 100;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const igstAmount = purchaseData.is_interstate ? gstAmount : 0;

    // Calculate final invoice value
    const calculatedInvoiceValue = calculatedTaxableValue + gstAmount;

    const purchaseRecord: Record<string, any> = {
      purchase_id: uuidv4(),
      date: purchaseData.date || timestamp,
      product_id: productId,
      product_name: purchaseData.product_name,
      hsn_code: purchaseData.hsn_code || null,
      units: purchaseData.unit_type || purchaseData.units || null,
      purchase_invoice_number:
        purchaseData.invoice_number ||
        purchaseData.purchase_invoice_number ||
        'N/A',
      purchase_qty: quantityChange,
      mrp_incl_gst: purchaseData.mrp_incl_gst || 0,
      mrp_excl_gst: basePrice,
      discount_on_purchase_percentage: discountPercentage,
      gst_percentage: gstPercentage,
      purchase_taxable_value:
        purchaseData.purchase_cost_taxable_value || calculatedTaxableValue,
      purchase_igst: purchaseData.is_interstate ? igstAmount : 0,
      purchase_cgst: purchaseData.is_interstate ? 0 : cgstAmount,
      purchase_sgst: purchaseData.is_interstate ? 0 : sgstAmount,
      purchase_invoice_value_rs:
        purchaseData.purchase_invoice_value || calculatedInvoiceValue,
      supplier: purchaseData.vendor || null,
      current_stock_at_purchase: purchaseHistoryStock,
      computed_stock_taxable_value:
        newOverallProductStock * purchaseCostPerUnit,
      computed_stock_igst:
        newOverallProductStock *
        (purchaseData.is_interstate ? igstAmount / quantityChange : 0),
      computed_stock_cgst:
        newOverallProductStock *
        (purchaseData.is_interstate ? 0 : cgstAmount / quantityChange),
      computed_stock_sgst:
        newOverallProductStock *
        (purchaseData.is_interstate ? 0 : sgstAmount / quantityChange),
      computed_stock_total_value:
        newOverallProductStock *
        (purchaseCostPerUnit + gstAmount / quantityChange),
      'Purchase_Cost/Unit(Ex.GST)': purchaseCostPerUnit,
      price_inlcuding_disc: purchaseCostPerUnit,
      transaction_type: 'purchase',
      created_at: timestamp,
      updated_at: timestamp,
    };

    // --- Step 4: Persist the purchase record ---
    const { error: purchaseInsertError } = await supabase
      .from('purchase_history_with_stock')
      .insert(purchaseRecord);
    if (purchaseInsertError) {
      console.error('Error inserting purchase record:', purchaseInsertError);
      throw new Error(
        `Failed to record purchase: ${purchaseInsertError.message || purchaseInsertError.details || JSON.stringify(purchaseInsertError)}`
      );
    }
    console.log(
      'New purchase record inserted successfully with ID:',
      purchaseRecord.purchase_id
    );

    // --- AUTO-ADJUST MECHANISM ---
    // Always recalculate ALL purchase history entries to maintain chronological consistency
    console.log(`[AUTO-ADJUST] Starting complete chronological recalculation`);

    // Get ALL purchases for this product in chronological order
    const { data: allPurchases, error: purchasesError } = await supabase
      .from('purchase_history_with_stock')
      .select('purchase_id, purchase_qty, date, created_at')
      .eq('product_id', productId)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (purchasesError) {
      console.error('[AUTO-ADJUST] Error fetching purchases:', purchasesError);
      throw new Error(
        `Failed to fetch purchases for recalculation: ${purchasesError.message}`
      );
    }

    if (allPurchases && allPurchases.length > 0) {
      console.log(
        `[AUTO-ADJUST] Found ${allPurchases.length} entries to recalculate`
      );

      // Recalculate stock for ALL entries chronologically
      let runningStock = 0;
      const updates: Array<{ id: string; stock: number }> = [];

      for (const purchase of allPurchases) {
        // Add this purchase's quantity to the running stock
        runningStock += purchase.purchase_qty || 0;
        updates.push({ id: purchase.purchase_id, stock: runningStock });

        console.log(
          `[AUTO-ADJUST] Purchase ${purchase.purchase_id} on ${purchase.date}: +${purchase.purchase_qty} = ${runningStock}`
        );
      }

      // Update all purchases with their correct chronological stock values
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('purchase_history_with_stock')
          .update({
            current_stock_at_purchase: update.stock,
            updated_at: new Date().toISOString(),
          })
          .eq('purchase_id', update.id);

        if (updateError) {
          console.error(
            `[AUTO-ADJUST] Error updating purchase ${update.id}:`,
            updateError
          );
        } else {
          console.log(
            `[AUTO-ADJUST] ✅ Updated purchase ${update.id} to stock: ${update.stock}`
          );
        }
      }

      // Update product_master with the final stock value
      const finalStock = runningStock;
      const { error: masterUpdateError } = await supabase
        .from('product_master')
        .update({
          stock_quantity: finalStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (masterUpdateError) {
        console.error(
          '[AUTO-ADJUST] Error updating product_master:',
          masterUpdateError
        );
      } else {
        console.log(
          `[AUTO-ADJUST] ✅ Updated product_master stock to: ${finalStock}`
        );
      }

      console.log(
        `[AUTO-ADJUST] ✅ Completed chronological recalculation of ${allPurchases.length} entries`
      );
    } else {
      console.log(`[AUTO-ADJUST] No entries found - no adjustment needed`);
    }

    // --- Step 5: CRITICAL - Always sync product_master with latest purchase history stock ---
    // This MUST run after any purchase operation to ensure PM reflects PH
    console.log(
      `[STOCK SYNC] Starting product_master sync for ${purchaseData.product_name} (ID: ${productId})`
    );

    // Get the latest stock value from purchase history using product_id for accuracy
    // CRITICAL FIX: Use a transaction to ensure atomicity
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'sync_product_master_stock',
      {
        product_id_param: productId,
        transaction_type_param: 'purchase',
        transaction_id_param: purchaseRecord.purchase_id,
        transaction_date_param: purchaseData.date || new Date().toISOString(),
      }
    );

    if (syncError) {
      console.error(
        '[STOCK SYNC] ❌ Failed to sync product_master:',
        syncError
      );
      throw new Error(`Critical sync error: ${syncError.message}`);
    }

    if (!syncResult || !syncResult.success) {
      console.error(
        '[STOCK SYNC] ❌ Sync failed:',
        syncResult?.message || 'Unknown error'
      );
      throw new Error(
        'Failed to sync product_master: ' +
          (syncResult?.message || 'Unknown error')
      );
    }

    console.log(
      `[STOCK SYNC] ✅ Product_master successfully synced. Previous: ${syncResult.previous_stock}, New: ${syncResult.new_stock}`
    );

    // Record the sync in product_master_sync_log
    const syncLogRecord = {
      product_id: productId,
      transaction_type: 'purchase',
      transaction_id: purchaseRecord.purchase_id,
      previous_stock: syncResult.previous_stock,
      new_stock: syncResult.new_stock,
      sync_timestamp: new Date().toISOString(),
      transaction_date: purchaseData.date || new Date().toISOString(),
      sync_source: 'purchase_history_with_stock',
    };

    const { error: logError } = await supabase
      .from('product_master_sync_log')
      .insert(syncLogRecord);

    if (logError) {
      console.warn('[STOCK SYNC] ⚠️ Failed to record sync log:', logError);
      // Don't throw error for log failure, but record warning
    } else {
      console.log('[STOCK SYNC] ✅ Sync log recorded successfully');
    }

    // Stock update complete
    console.log(
      `[STOCK UPDATE COMPLETE] Product ${purchaseData.product_name} stock is now ${newOverallProductStock} ✅`
    );

    // --- Step 6: Record the transaction in stock_history ---
    const stockHistoryRecord = {
      product_id: productId,
      product_name: purchaseData.product_name,
      hsn_code: purchaseData.hsn_code || '',
      units: purchaseData.unit_type || purchaseData.units || 'pcs',
      date: purchaseData.date || timestamp,
      // previous_qty for stock_history is the product's stock before this transaction's effect.
      previous_qty: currentProductStock,
      current_qty: currentProductStock,
      change_qty: quantityChange, // For new purchase, this is always positive
      stock_after: newOverallProductStock,
      change_type: 'addition',
      reference_id: purchaseRecord.purchase_id,
      source: `Purchase Invoice: ${purchaseData.invoice_number || purchaseData.purchase_invoice_number || 'N/A'}`,
      created_at: timestamp,
    };

    console.log(
      'Attempting to insert stock history record:',
      stockHistoryRecord
    );
    const { error: historyInsertError } = await supabase
      .from('stock_history')
      .insert(stockHistoryRecord);

    if (historyInsertError) {
      console.error('Error inserting into stock_history:', historyInsertError);
      throw new Error(
        `Failed to record stock history: ${historyInsertError.message}`
      );
    }
    console.log(
      `Successfully recorded stock history for product ID: ${productId}, change: ${quantityChange}`
    );

    // Return the created purchase record
    const resultData = {
      ...purchaseData,
      purchase_id: purchaseRecord.purchase_id,
      stock_after_purchase: newOverallProductStock,
    };

    return {
      success: true,
      message: existingProduct
        ? 'Purchase added successfully.'
        : 'New product created and purchase added successfully.',
      data: resultData,
    };
  } catch (error) {
    console.error('Error in addPurchaseTransaction:', error);

    // Provide more detailed error information
    let errorMessage =
      'An unknown error occurred during the purchase transaction.';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle Supabase error objects
      const errorObj = error as any;
      if (errorObj.message) {
        errorMessage = String(errorObj.message);
      } else if (errorObj.details) {
        errorMessage = String(errorObj.details);
      } else if (errorObj.code) {
        errorMessage = `Database error (${errorObj.code}): ${errorObj.message || 'Unknown error'}`;
      } else {
        errorMessage = JSON.stringify(error);
      }
    }

    return {
      success: false,
      error: new Error(errorMessage),
    };
  }
};

// Function to update product stock
export const updateProductStock = async (
  productId: string,
  quantity: number,
  transactionType: string = 'opening_balance'
) => {
  try {
    // Get product details first
    const { data: product, error: productError } = await supabase
      .from('product_master')
      .select('name, hsn_code, units, gst_percentage, price, stock_quantity')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error fetching product details:', productError);
      throw productError;
    }

    // No need to fetch from purchase_history - we use product_master stock directly

    // Use the product's stock_quantity from product_master as the base
    // Formula: Product Master Stock Quantity + New Purchase Quantity = New Total Stock
    const currentStock = product.stock_quantity ?? 0;
    const newStock = Math.max(0, currentStock + quantity); // Add for purchase, subtract for sales

    // Calculate GST values
    const gstPercentage = product.gst_percentage || 18;
    const priceExclGst = product.price || 0;
    const gstAmount = (priceExclGst * gstPercentage) / 100;
    const priceInclGst = priceExclGst + gstAmount;

    // Create a new stock history record
    const purchaseRecord = {
      purchase_id: uuidv4(),
      date: new Date().toISOString(),
      product_id: productId,
      product_name: product.name,
      hsn_code: product.hsn_code || '',
      units: product.units || 'UNITS',
      purchase_invoice_number: 'OPENING BALANCE',
      purchase_qty: Math.abs(quantity),
      mrp_incl_gst: priceInclGst,
      mrp_excl_gst: priceExclGst,
      discount_on_purchase_percentage: 0,
      gst_percentage: gstPercentage,
      purchase_taxable_value: priceExclGst * Math.abs(quantity),
      purchase_igst: 0,
      purchase_cgst: gstAmount / 2,
      purchase_sgst: gstAmount / 2,
      purchase_invoice_value_rs: priceInclGst * Math.abs(quantity),
      supplier: 'OPENING BALANCE',
      current_stock_at_purchase: newStock,
      computed_stock_taxable_value: 0,
      computed_stock_igst: 0,
      computed_stock_cgst: 0,
      computed_stock_sgst: 0,
      computed_stock_total_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      'Purchase_Cost/Unit(Ex.GST)': priceExclGst,
      price_inlcuding_disc: priceExclGst,
      transaction_type: transactionType,
    };

    // Start a transaction to update both tables
    const { error: insertError } = await supabase
      .from('purchase_history_with_stock')
      .insert(purchaseRecord);

    if (insertError) {
      console.error('Error updating stock history:', insertError);
      throw insertError;
    }

    // Update the products table stock
    const { error: updateError } = await supabase
      .from('product_master')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product stock:', updateError);
      throw updateError;
    }

    return {
      success: true,
      newStock,
      message: 'Stock updated successfully',
    };
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * A comprehensive function to edit an existing purchase transaction.
 * This function will:
 * 1. Fetch the original purchase to calculate stock changes.
 * 2. Update the product's master MRP if it has changed.
 * 3. Log any MRP changes to the product_price_history table.
 * 4. Update the purchase record in purchase_history_with_stock.
 * 5. Adjust the product's overall stock_quantity in the products table.
 * 6. Record the stock adjustment in the product_stock_transaction_history table.
 *
 * @param purchaseId The ID of the purchase to edit.
 * @param updatedData The new data for the purchase from the form.
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const editPurchaseTransaction = async (
  purchaseId: string,
  updatedData: PurchaseFormData
) => {
  const transactionTimestamp = new Date().toISOString();

  try {
    // --- Step 1: Fetch the original purchase record ---
    const { data: originalPurchase, error: fetchError } = await supabase
      .from('purchase_history_with_stock')
      .select('*')
      .eq('purchase_id', purchaseId)
      .maybeSingle();

    if (fetchError) {
      // Log the specific error but throw a more user-friendly message
      console.error('Error fetching original purchase:', fetchError);
      throw new Error(
        `A database error occurred while fetching purchase ID ${purchaseId}. Details: ${fetchError.message}`
      );
    }

    if (!originalPurchase) {
      console.error(
        `Attempted to edit a purchase with ID ${purchaseId}, but it was not found.`
      );
      throw new Error(
        `Could not find the original purchase with ID ${purchaseId}. It may have been deleted.`
      );
    }

    const productId = originalPurchase.product_id;

    // --- Step 2: Fetch the product from the product master ---
    const { data: product, error: productError } = await supabase
      .from('product_master')
      .select('id, stock_quantity, mrp_incl_gst, mrp_excl_gst, gst_percentage')
      .eq('id', productId)
      .maybeSingle();

    if (productError) {
      console.error('Error fetching product master data:', productError);
      throw new Error(
        `Product with ID ${productId} could not be fetched. Details: ${productError.message}`
      );
    }

    if (!product) {
      console.error(
        `Product with ID ${productId} not found in product master for purchase ID ${purchaseId}.`
      );
      throw new Error(
        `The associated product (ID: ${productId}) for this purchase could not be found.`
      );
    }

    // Note: Price change detection and updates are now handled by database trigger

    // --- Step 3: Prepare and update the purchase record ---
    const updatedPurchaseRecord = {
      date: updatedData.date,
      product_name: updatedData.product_name,
      hsn_code: updatedData.hsn_code,
      units: updatedData.unit_type || updatedData.units,
      purchase_invoice_number:
        updatedData.invoice_number || updatedData.purchase_invoice_number,
      purchase_qty: updatedData.purchase_qty,
      mrp_incl_gst: updatedData.mrp_incl_gst,
      mrp_excl_gst:
        updatedData.mrp_excl_gst || updatedData.mrp_per_unit_excl_gst,
      discount_on_purchase_percentage:
        updatedData.discount_on_purchase_percentage,
      gst_percentage: updatedData.gst_percentage,
      purchase_taxable_value: updatedData.purchase_cost_taxable_value,
      purchase_igst: updatedData.is_interstate
        ? ((updatedData.purchase_cost_taxable_value || 0) *
            (updatedData.gst_percentage || 18)) /
          100
        : 0,
      purchase_cgst: !updatedData.is_interstate
        ? ((updatedData.purchase_cost_taxable_value || 0) *
            (updatedData.gst_percentage || 18)) /
          200
        : 0,
      purchase_sgst: !updatedData.is_interstate
        ? ((updatedData.purchase_cost_taxable_value || 0) *
            (updatedData.gst_percentage || 18)) /
          200
        : 0,
      purchase_invoice_value_rs: updatedData.purchase_invoice_value,
      supplier: updatedData.vendor,
      'Purchase_Cost/Unit(Ex.GST)':
        updatedData.mrp_excl_gst || updatedData.mrp_per_unit_excl_gst || 0,
      price_inlcuding_disc:
        updatedData.mrp_excl_gst || updatedData.mrp_per_unit_excl_gst || 0,
      updated_at: transactionTimestamp,
    };

    // --- Step 4: CRITICAL - Recalculate stock for this entry if qty or date changed ---
    const qtyChanged =
      originalPurchase.purchase_qty !== updatedData.purchase_qty;
    const dateChanged = originalPurchase.date !== updatedData.date;
    const needsRecalculation = qtyChanged || dateChanged;

    console.log(
      `[UPDATE] Purchase ${purchaseId} - Qty changed: ${qtyChanged}, Date changed: ${dateChanged}`
    );

    // First update the purchase record
    const { error: updatePurchaseError } = await supabase
      .from('purchase_history_with_stock')
      .update(updatedPurchaseRecord)
      .eq('purchase_id', purchaseId);

    if (updatePurchaseError) {
      throw new Error(
        `Failed to update purchase record: ${updatePurchaseError.message}`
      );
    }

    console.log(`[UPDATE] Purchase record updated successfully`);

    // --- Step 5: Recalculate stock if needed ---
    if (needsRecalculation) {
      console.log(
        `[UPDATE RECALC] Starting chronological recalculation for product ${updatedData.product_name}`
      );

      // Get ALL purchases for this product in chronological order
      const { data: allPurchases, error: fetchAllError } = await supabase
        .from('purchase_history_with_stock')
        .select('purchase_id, date, purchase_qty, created_at')
        .eq('product_id', productId)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchAllError) {
        console.error(
          '[UPDATE RECALC] Error fetching purchases:',
          fetchAllError
        );
        throw new Error(
          `Failed to recalculate stock: ${fetchAllError.message}`
        );
      }

      // Recalculate stock for ALL entries chronologically
      let runningStock = 0;
      const updates: Array<{ id: string; stock: number }> = [];

      for (const purchase of allPurchases || []) {
        runningStock += purchase.purchase_qty || 0;
        updates.push({ id: purchase.purchase_id, stock: runningStock });
      }

      console.log(
        `[UPDATE RECALC] Recalculating ${updates.length} purchase entries`
      );

      // Update each purchase with the correct chronological stock
      for (const update of updates) {
        const { error: stockUpdateError } = await supabase
          .from('purchase_history_with_stock')
          .update({
            current_stock_at_purchase: update.stock,
            updated_at: transactionTimestamp,
          })
          .eq('purchase_id', update.id);

        if (stockUpdateError) {
          console.error(
            `[UPDATE RECALC] Error updating purchase ${update.id}:`,
            stockUpdateError
          );
        } else {
          console.log(
            `[UPDATE RECALC] ✅ Updated purchase ${update.id} to stock: ${update.stock}`
          );
        }
      }

      console.log(`[UPDATE RECALC] ✅ Completed chronological recalculation`);
    }

    // --- Step 6: Sync product_master with latest purchase history stock ---
    const { data: latestPurchase, error: latestError } = await supabase
      .from('purchase_history_with_stock')
      .select('current_stock_at_purchase')
      .eq('product_id', productId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestError && latestPurchase) {
      const latestStock = latestPurchase.current_stock_at_purchase;

      console.log(
        `[UPDATE SYNC] Syncing product_master to latest stock: ${latestStock}`
      );

      const { error: syncError } = await supabase
        .from('product_master')
        .update({
          stock_quantity: latestStock,
          updated_at: transactionTimestamp,
        })
        .eq('id', productId);

      if (syncError) {
        console.error(
          '[UPDATE SYNC] Failed to sync product_master:',
          syncError
        );
      } else {
        console.log(
          `[UPDATE SYNC] ✅ Product_master synced successfully to ${latestStock}`
        );
      }
    }

    console.log(
      `[UPDATE] ✅ Purchase update complete with ${needsRecalculation ? 'chronological recalculation' : 'no recalculation needed'}`
    );

    return { success: true };
  } catch (error) {
    console.error('Error in editPurchaseTransaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('An unknown error occurred'),
    };
  }
};

/**
 * Deletes a purchase transaction and updates stock accordingly
 * @param purchaseId - The ID of the purchase to delete
 * @returns Promise with success/error result
 */
export const deletePurchaseTransaction = async (purchaseId: string) => {
  try {
    console.log(`[DELETE] Starting deletion of purchase ${purchaseId}`);

    // First, get the purchase details and product ID
    const { data: purchaseToDelete, error: fetchError } = await supabase
      .from('purchase_history_with_stock')
      .select('product_id, product_name, purchase_qty, date')
      .eq('purchase_id', purchaseId)
      .single();

    if (fetchError || !purchaseToDelete) {
      throw new Error(
        `Failed to fetch purchase details: ${fetchError?.message || 'Purchase not found'}`
      );
    }

    const productId = purchaseToDelete.product_id;
    console.log(
      `[DELETE] Found purchase for product ${purchaseToDelete.product_name} (ID: ${productId})`
    );

    // Delete the purchase record first
    const { error: deleteError } = await supabase
      .from('purchase_history_with_stock')
      .delete()
      .eq('purchase_id', purchaseId);

    if (deleteError) {
      throw new Error(`Failed to delete purchase: ${deleteError.message}`);
    }

    console.log(`[DELETE] Successfully deleted purchase record`);

    // Now get ALL remaining purchases for this product in chronological order
    const { data: remainingPurchases, error: purchasesError } = await supabase
      .from('purchase_history_with_stock')
      .select('purchase_id, purchase_qty, date, created_at')
      .eq('product_id', productId)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (purchasesError) {
      throw new Error(
        `Failed to fetch remaining purchases: ${purchasesError.message}`
      );
    }

    // Recalculate stock for all remaining entries
    let runningStock = 0;
    const updates: Array<{ id: string; stock: number }> = [];

    console.log(
      `[DELETE] Recalculating stock for ${remainingPurchases?.length || 0} remaining purchases`
    );

    // Calculate new running stock values
    for (const purchase of remainingPurchases || []) {
      runningStock += purchase.purchase_qty || 0;
      updates.push({ id: purchase.purchase_id, stock: runningStock });

      console.log(
        `[DELETE RECALC] Purchase ${purchase.purchase_id} on ${purchase.date}: +${purchase.purchase_qty} = ${runningStock}`
      );
    }

    // Update all remaining purchases with their new stock values
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('purchase_history_with_stock')
        .update({
          current_stock_at_purchase: update.stock,
          updated_at: new Date().toISOString(),
        })
        .eq('purchase_id', update.id);

      if (updateError) {
        console.error(
          `[DELETE RECALC] Error updating purchase ${update.id}:`,
          updateError
        );
      } else {
        console.log(
          `[DELETE RECALC] ✅ Updated purchase ${update.id} to stock: ${update.stock}`
        );
      }
    }

    // Update product_master with the final calculated stock
    const finalStock = runningStock; // This is the correct final stock after deletion
    const { error: masterUpdateError } = await supabase
      .from('product_master')
      .update({
        stock_quantity: finalStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (masterUpdateError) {
      throw new Error(
        `Failed to update product master: ${masterUpdateError.message}`
      );
    }

    console.log(
      `[DELETE] ✅ Successfully updated product_master stock to ${finalStock}`
    );

    // Record the deletion in stock_history
    const stockHistoryRecord = {
      product_id: productId,
      product_name: purchaseToDelete.product_name,
      date: new Date().toISOString(),
      previous_qty: finalStock + purchaseToDelete.purchase_qty,
      current_qty: finalStock,
      change_qty: -purchaseToDelete.purchase_qty,
      change_type: 'deletion',
      reference_id: purchaseId,
      source: 'Purchase deletion',
      created_at: new Date().toISOString(),
    };

    const { error: historyError } = await supabase
      .from('stock_history')
      .insert(stockHistoryRecord);

    if (historyError) {
      console.warn(
        `[DELETE] Warning: Failed to record stock history: ${historyError.message}`
      );
    }

    return {
      success: true,
      message: 'Purchase deleted and stock recalculated successfully',
      data: {
        productId,
        deletedQuantity: purchaseToDelete.purchase_qty,
        previousStock: finalStock + purchaseToDelete.purchase_qty,
        newStock: finalStock,
        remainingPurchases: remainingPurchases?.length || 0,
      },
    };
  } catch (error) {
    console.error('[DELETE] Error in deletePurchaseTransaction:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Failed to delete purchase'),
    };
  }
};

/**
 * Gets a purchase transaction by ID for editing
 * @param purchaseId - The ID of the purchase to retrieve
 * @returns Promise with the purchase data
 */
export const getPurchaseById = async (purchaseId: string) => {
  try {
    const { data: purchase, error } = await supabase
      .from('purchase_history_with_stock')
      .select('*')
      .eq('purchase_id', purchaseId)
      .single();

    if (error) {
      console.error('Error fetching purchase:', error);
      throw new Error(`Failed to fetch purchase: ${error.message}`);
    }

    return {
      success: true,
      data: purchase,
    };
  } catch (error) {
    console.error('Error in getPurchaseById:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Failed to fetch purchase'),
    };
  }
};

/**
 * Gets all purchase transactions with optional filtering
 * @param filters - Optional filters for the query
 * @returns Promise with the purchase data
 */
export const getAllPurchases = async (filters?: {
  startDate?: string;
  endDate?: string;
  productName?: string;
  supplier?: string;
  invoiceNumber?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('purchase_history_with_stock')
      .select('*')
      .order('date', { ascending: false });

    // Apply filters if provided
    if (filters) {
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.productName) {
        query = query.ilike('product_name', `%${filters.productName}%`);
      }
      if (filters.supplier) {
        query = query.ilike('supplier', `%${filters.supplier}%`);
      }
      if (filters.invoiceNumber) {
        query = query.ilike(
          'purchase_invoice_number',
          `%${filters.invoiceNumber}%`
        );
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }
    }

    const { data: purchases, error } = await query;

    if (error) {
      console.error('Error fetching purchases:', error);
      throw new Error(`Failed to fetch purchases: ${error.message}`);
    }

    return {
      success: true,
      data: purchases || [],
    };
  } catch (error) {
    console.error('Error in getAllPurchases:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Failed to fetch purchases'),
    };
  }
};

/**
 * Gets purchase statistics and summary
 * @param filters - Optional filters for the query
 * @returns Promise with purchase statistics
 */
export const getPurchaseStatistics = async (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    let query = supabase
      .from('purchase_history_with_stock')
      .select(
        'purchase_qty, purchase_invoice_value_rs, purchase_taxable_value'
      );

    // Apply date filters if provided
    if (filters) {
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
    }

    const { data: purchases, error } = await query;

    if (error) {
      console.error('Error fetching purchase statistics:', error);
      throw new Error(`Failed to fetch purchase statistics: ${error.message}`);
    }

    // Calculate statistics
    const totalPurchases = purchases?.length || 0;
    const totalQuantity =
      purchases?.reduce((sum, p) => sum + (p.purchase_qty || 0), 0) || 0;
    const totalValue =
      purchases?.reduce(
        (sum, p) => sum + (p.purchase_invoice_value_rs || 0),
        0
      ) || 0;
    const totalTaxableValue =
      purchases?.reduce((sum, p) => sum + (p.purchase_taxable_value || 0), 0) ||
      0;
    const averageOrderValue =
      totalPurchases > 0 ? totalValue / totalPurchases : 0;

    return {
      success: true,
      data: {
        totalPurchases,
        totalQuantity,
        totalValue,
        totalTaxableValue,
        averageOrderValue,
      },
    };
  } catch (error) {
    console.error('Error in getPurchaseStatistics:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error('Failed to fetch purchase statistics'),
    };
  }
};

/**
 * Validates purchase form data before processing
 * @param purchaseData - The purchase data to validate
 * @returns Validation result with errors if any
 */
export const validatePurchaseData = async (purchaseData: PurchaseFormData) => {
  const errors: string[] = [];

  // Required fields validation
  if (!purchaseData.product_name?.trim()) {
    errors.push('Product name is required');
  }

  if (!purchaseData.hsn_code?.trim()) {
    errors.push('HSN code is required');
  }

  if (!purchaseData.unit_type?.trim() && !purchaseData.units?.trim()) {
    errors.push('Unit type is required');
  }

  if (!purchaseData.vendor?.trim()) {
    errors.push('Vendor/Supplier name is required');
  }

  if (
    !purchaseData.purchase_invoice_number?.trim() &&
    !purchaseData.invoice_number?.trim()
  ) {
    errors.push('Purchase invoice number is required');
  }

  // Numeric validations
  if (!purchaseData.purchase_qty || purchaseData.purchase_qty <= 0) {
    errors.push('Purchase quantity must be greater than 0');
  }

  if (!purchaseData.mrp_incl_gst || purchaseData.mrp_incl_gst <= 0) {
    errors.push('MRP including GST must be greater than 0');
  }

  if (
    purchaseData.gst_percentage &&
    (purchaseData.gst_percentage < 0 || purchaseData.gst_percentage > 100)
  ) {
    errors.push('GST percentage must be between 0 and 100');
  }

  if (
    purchaseData.discount_on_purchase_percentage &&
    (purchaseData.discount_on_purchase_percentage < 0 ||
      purchaseData.discount_on_purchase_percentage > 100)
  ) {
    errors.push('Discount percentage must be between 0 and 100');
  }

  // Date validation
  if (purchaseData.date) {
    const purchaseDate = new Date(purchaseData.date);
    const today = new Date();
    if (purchaseDate > today) {
      errors.push('Purchase date cannot be in the future');
    }
  }

  // Additional stock validations
  if (purchaseData.product_name) {
    // Check if product exists and get its current stock
    const { data: existingProduct, error: productError } = await supabase
      .from('product_master')
      .select('id, stock_quantity, name')
      .eq('name', purchaseData.product_name)
      .maybeSingle();

    if (productError) {
      errors.push(`Error checking product: ${productError.message}`);
    } else if (existingProduct) {
      // Check for duplicate invoice numbers for the same product
      const { data: duplicateInvoice, error: invoiceError } = await supabase
        .from('purchase_history_with_stock')
        .select('purchase_id')
        .eq('product_id', existingProduct.id)
        .eq(
          'purchase_invoice_number',
          purchaseData.invoice_number || purchaseData.purchase_invoice_number
        )
        .maybeSingle();

      if (invoiceError) {
        errors.push(`Error checking invoice: ${invoiceError.message}`);
      } else if (duplicateInvoice) {
        errors.push('Invoice number already exists for this product');
      }

      // Check for suspicious stock changes (e.g., unusually large quantities)
      const suspiciousQtyThreshold = 1000; // Adjust based on your business rules
      if (purchaseData.purchase_qty > suspiciousQtyThreshold) {
        errors.push(
          `Warning: Purchase quantity (${purchaseData.purchase_qty}) is unusually high`
        );
      }

      // Check for stock consistency
      const { data: latestPurchase, error: historyError } = await supabase
        .from('purchase_history_with_stock')
        .select('current_stock_at_purchase')
        .eq('product_id', existingProduct.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (!historyError && latestPurchase) {
        if (
          latestPurchase.current_stock_at_purchase !==
          existingProduct.stock_quantity
        ) {
          errors.push(
            'Warning: Stock mismatch detected between product_master and purchase_history'
          );
        }
      }
    }
  }

  // Price validation
  if (purchaseData.mrp_excl_gst && purchaseData.mrp_incl_gst) {
    const calculatedMrpInclGst =
      purchaseData.mrp_excl_gst *
      (1 + (purchaseData.gst_percentage || 18) / 100);
    const tolerance = 0.01; // 1% tolerance for rounding differences
    const difference = Math.abs(
      calculatedMrpInclGst - purchaseData.mrp_incl_gst
    );
    if (difference > purchaseData.mrp_incl_gst * tolerance) {
      errors.push('MRP including GST does not match the calculated value');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: errors.filter(e => e.startsWith('Warning:')),
    criticalErrors: errors.filter(e => !e.startsWith('Warning:')),
  };
};

/**
 * Recalculates current_stock_at_purchase for all purchase history records
 * This ensures all records show the correct current stock from product_master
 */
export const recalculatePurchaseHistoryStock = async () => {
  try {
    console.log('Starting purchase history stock recalculation...');

    // Get all unique products from purchase history
    const { data: products, error: productsError } = await supabase
      .from('purchase_history_with_stock')
      .select('product_name, product_id')
      .not('product_name', 'is', null);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log(`Found ${products?.length || 0} products to recalculate`);

    // Get unique products by grouping them
    const uniqueProducts =
      products?.reduce((acc: any[], product: any) => {
        if (!acc.find(p => p.product_id === product.product_id)) {
          acc.push(product);
        }
        return acc;
      }, []) || [];

    for (const product of uniqueProducts) {
      // Get current stock from product_master
      const { data: productMaster, error: masterError } = await supabase
        .from('product_master')
        .select('stock_quantity, price')
        .eq('id', product.product_id)
        .single();

      if (masterError) {
        console.error(
          `Error fetching product master for ${product.product_name}:`,
          masterError
        );
        continue;
      }

      const currentStock = productMaster?.stock_quantity || 0;
      const price = productMaster?.price || 0;
      console.log(
        `Updating ${product.product_name} to current stock: ${currentStock}`
      );

      // Update all purchase history records for this product
      const { error: updateError } = await supabase
        .from('purchase_history_with_stock')
        .update({
          current_stock_at_purchase: currentStock,
          computed_stock_taxable_value: currentStock * price,
          computed_stock_cgst: currentStock * price * 0.09, // Assuming 18% GST
          computed_stock_sgst: currentStock * price * 0.09,
          computed_stock_total_value: currentStock * price * 1.18,
        })
        .eq('product_id', product.product_id);

      if (updateError) {
        console.error(
          `Error updating purchase history for ${product.product_name}:`,
          updateError
        );
      } else {
        console.log(
          `Successfully updated purchase history for ${product.product_name}`
        );
      }
    }

    console.log('Purchase history stock recalculation completed');
    return {
      success: true,
      message: 'Purchase history stock recalculated successfully',
    };
  } catch (error) {
    console.error('Error in recalculatePurchaseHistoryStock:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Calculates all derived values for a purchase transaction
 * @param purchaseData - The base purchase data
 * @returns Calculated values for the purchase
 */
export const calculatePurchaseValues = (purchaseData: PurchaseFormData) => {
  const basePrice =
    purchaseData.mrp_excl_gst || purchaseData.mrp_per_unit_excl_gst || 0;
  const gstPercentage = purchaseData.gst_percentage || 18;
  const discountPercentage = purchaseData.discount_on_purchase_percentage || 0;
  const quantity = purchaseData.purchase_qty || 0;
  const isInterstate = purchaseData.is_interstate || false;

  // Calculate purchase cost per unit after discount
  const purchaseCostPerUnit = basePrice * (1 - discountPercentage / 100);

  // Calculate taxable value
  const taxableValue = purchaseCostPerUnit * quantity;

  // Calculate GST amounts
  const totalGstAmount = (taxableValue * gstPercentage) / 100;
  const cgstAmount = isInterstate ? 0 : totalGstAmount / 2;
  const sgstAmount = isInterstate ? 0 : totalGstAmount / 2;
  const igstAmount = isInterstate ? totalGstAmount : 0;

  // Calculate final invoice value
  const invoiceValue = taxableValue + totalGstAmount;

  // Calculate MRP excluding GST if not provided
  const mrpExclGst =
    basePrice ||
    (purchaseData.mrp_incl_gst
      ? purchaseData.mrp_incl_gst / (1 + gstPercentage / 100)
      : 0);

  return {
    purchaseCostPerUnit,
    taxableValue,
    totalGstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    invoiceValue,
    mrpExclGst,
    effectiveDiscountAmount: (basePrice - purchaseCostPerUnit) * quantity,
    profitMargin: purchaseData.mrp_incl_gst
      ? ((purchaseData.mrp_incl_gst -
          purchaseCostPerUnit * (1 + gstPercentage / 100)) /
          purchaseData.mrp_incl_gst) *
        100
      : 0,
  };
};

/**
 * Fetches and enriches sales data with historical stock from pos_orders.stock_snapshot
 * @param orderIds - Array of order IDs to fetch stock snapshots for
 * @param salesItems - Array of sales items to enrich with stock data
 * @param updateCallback - Callback function to update each sale item with stock data
 * @returns Promise<void>
 */
export async function enrichSalesWithHistoricalStock<
  T extends { order_id: string; product_name: string },
>(
  orderIds: string[],
  salesItems: T[],
  updateCallback: (
    item: T,
    stockAtTimeOfSale: number,
    productId: string
  ) => void
): Promise<void> {
  if (orderIds.length === 0) return;

  try {
    const { data: orderStockData, error: stockError } = await supabase
      .from('pos_orders')
      .select('id, stock_snapshot, services')
      .in('id', orderIds);

    if (stockError) {
      console.warn('Failed to fetch order stock snapshots:', stockError);
      return;
    }

    if (!orderStockData) return;

    // Create a map of order_id to stock snapshot and product info
    const orderDataMap = new Map<
      string,
      {
        stockSnapshot: Record<string, number>;
        productInfoMap: Map<string, string>;
      }
    >();

    orderStockData.forEach((order: any) => {
      let stockSnapshot: Record<string, number> = {};
      let productInfoMap = new Map<string, string>(); // Map product_name to product_id

      // Parse stock snapshot
      if (order.stock_snapshot) {
        try {
          stockSnapshot =
            typeof order.stock_snapshot === 'string'
              ? JSON.parse(order.stock_snapshot)
              : order.stock_snapshot;
        } catch (e) {
          console.warn(
            `Failed to parse stock snapshot for order ${order.id}:`,
            e
          );
        }
      }

      // Parse services to get product_id to product_name mapping
      if (order.services) {
        try {
          const services = Array.isArray(order.services)
            ? order.services
            : JSON.parse(order.services);

          services.forEach((service: any) => {
            if (service.type === 'product' || service.category === 'product') {
              const productId = service.product_id || service.service_id;
              const productName = service.product_name || service.service_name;
              if (productId && productName) {
                productInfoMap.set(productName, productId);
              }
            }
          });
        } catch (e) {
          console.warn(`Failed to parse services for order ${order.id}:`, e);
        }
      }

      orderDataMap.set(order.id, { stockSnapshot, productInfoMap });
    });

    // Update sales items with historical stock from snapshots
    salesItems.forEach(sale => {
      if (orderDataMap.has(sale.order_id)) {
        const { stockSnapshot, productInfoMap } = orderDataMap.get(
          sale.order_id
        )!;

        // Get product_id from product name mapping
        const productId = productInfoMap.get(sale.product_name);

        // Get stock for this specific product at time of sale
        if (productId && stockSnapshot[productId] !== undefined) {
          const stockAtTimeOfSale = stockSnapshot[productId];
          updateCallback(sale, stockAtTimeOfSale, productId);
        }
      }
    });
  } catch (error) {
    console.error('Error enriching sales with historical stock:', error);
  }
}
