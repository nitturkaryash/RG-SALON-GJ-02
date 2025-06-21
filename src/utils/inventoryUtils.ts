import { supabase, handleSupabaseError } from './supabase/supabaseClient';
import { TABLES } from './supabase/supabaseClient'; // Import TABLES constant
import { Product } from '../hooks/useProducts'; // Import Product type if needed elsewhere
import { PurchaseTransaction } from '../hooks/usePurchaseHistory'; // Assuming this defines the structure accurately
import { v4 as uuidv4 } from 'uuid';

// Type for the input data expected from the form
// Adapt this based on the actual formData structure in Products.tsx
export type PurchaseFormData = Omit<PurchaseTransaction, 'purchase_id' | 'created_at' | 'updated_at'> & {
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
export const addPurchaseTransaction = async (purchaseData: PurchaseFormData) => {
  try {
    // --- Step 0: Validate input data ---
    const validation = validatePurchaseData(purchaseData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const timestamp = new Date().toISOString();
    let productId: string;
    const isUpdate = !!purchaseData.id; // Check if we're updating an existing purchase
    let originalPurchaseQty = 0; // To store the original quantity if updating

    console.log(`${isUpdate ? 'Updating' : 'Adding'} purchase transaction for product: ${purchaseData.product_name}`);

    // --- Step 1: Find or create the product ---
    const { data: existingProduct, error: fetchProductError } = await supabase
      .from('product_master')
      .select('id, stock_quantity, name, hsn_code, units, gst_percentage, mrp_incl_gst, mrp_excl_gst')
      .eq('name', purchaseData.product_name)
      .maybeSingle();

    if (fetchProductError) {
      console.error("Error fetching product:", fetchProductError);
      throw new Error(`Failed to find product: ${fetchProductError.message}`);
    }

    if (!existingProduct) {
      // Product doesn't exist, create it first
      console.log(`Product '${purchaseData.product_name}' not found. Creating new product...`);
      
      const gstPercentage = purchaseData.gst_percentage || 18;
      const mrpInclGst = purchaseData.mrp_incl_gst || 0;
      const mrpExclGst = purchaseData.mrp_per_unit_excl_gst || 
        (mrpInclGst / (1 + (gstPercentage / 100)));
      
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
        category: 'Auto-created'
      };
      
      const { data: newProductData, error: createProductError } = await supabase
        .from('product_master')
        .insert(newProduct)
        .select('id')
        .single();
        
      if (createProductError) {
        console.error("Error creating product:", createProductError);
        throw new Error(`Failed to create product: ${createProductError.message}`);
      }
      productId = newProductData.id;
      console.log(`Created new product with ID: ${productId}`);
    } else {
      productId = existingProduct.id;
      console.log(`Found existing product with ID: ${productId}, current stock: ${existingProduct.stock_quantity}`);
    }

    // Note: Price change detection and product master updates are now handled by database trigger
    // Note: Stock updates are now handled by database trigger

    // currentProductStock is the stock of the product *before this operation* (add or edit)
    const currentProductStock = existingProduct?.stock_quantity || 0;
    let quantityChange = 0;
    let newOverallProductStock = currentProductStock;

    if (isUpdate && purchaseData.id) {
      // Fetch the original purchase record to get its original quantity and product info
      const { data: originalPurchase, error: fetchOriginalError } = await supabase
        .from('purchase_history_with_stock')
        .select('purchase_qty, product_id, product_name, current_stock_at_purchase')
        .eq('purchase_id', purchaseData.id)
        .single();

      if (fetchOriginalError || !originalPurchase) {
        console.error("Error fetching original purchase for update:", fetchOriginalError);
        throw new Error(`Failed to fetch original purchase for update: ${fetchOriginalError?.message || 'Original purchase record not found.'}`);
      }
      
      originalPurchaseQty = originalPurchase.purchase_qty || 0;
      
      // Validate that we're editing the same product
      if (originalPurchase.product_name !== purchaseData.product_name) {
        console.warn(`Product name changed from '${originalPurchase.product_name}' to '${purchaseData.product_name}' during edit`);
        // If product name changed, we need to handle this as a more complex operation
        // For now, we'll allow it but log a warning
      }
      
      console.log(`Editing purchase. Original Qty: ${originalPurchaseQty}, New Qty: ${purchaseData.purchase_qty || 0}`);
      console.log(`Original product: ${originalPurchase.product_name}, New product: ${purchaseData.product_name}`);
    }

    // --- Step 2: Calculate quantityChange and newOverallProductStock ---
    const newPurchaseQty = purchaseData.purchase_qty || 0;
    if (isUpdate) {
      quantityChange = newPurchaseQty - originalPurchaseQty;
    } else {
      quantityChange = newPurchaseQty; // For new purchases, change is the full quantity
    }
    newOverallProductStock = currentProductStock + quantityChange;
    console.log(`Quantity change: ${quantityChange}, New overall product stock: ${newOverallProductStock}`);

    // --- Step 3: Prepare data for purchase_history_with_stock table ---
    // Calculate derived values
    const basePrice = purchaseData.mrp_excl_gst || purchaseData.mrp_per_unit_excl_gst || 0;
    const gstPercentage = purchaseData.gst_percentage || 18;
    const discountPercentage = purchaseData.discount_on_purchase_percentage || 0;
    
    // Calculate purchase cost per unit after discount
    const purchaseCostPerUnit = basePrice * (1 - (discountPercentage / 100));
    
    // Calculate taxable value
    const calculatedTaxableValue = purchaseCostPerUnit * newPurchaseQty;
    
    // Calculate GST amounts
    const gstAmount = (calculatedTaxableValue * gstPercentage) / 100;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const igstAmount = purchaseData.is_interstate ? gstAmount : 0;
    
    // Calculate final invoice value
    const calculatedInvoiceValue = calculatedTaxableValue + gstAmount;

    const purchaseRecord: Record<string, any> = {
      // purchase_id should be purchaseData.id if isUpdate, otherwise new uuid
      purchase_id: isUpdate ? purchaseData.id : uuidv4(), 
      date: purchaseData.date || timestamp,
      product_id: productId,
      product_name: purchaseData.product_name,
      hsn_code: purchaseData.hsn_code || null,
      units: purchaseData.unit_type || purchaseData.units || null,
      purchase_invoice_number: purchaseData.invoice_number || purchaseData.purchase_invoice_number || 'N/A',
      purchase_qty: newPurchaseQty,
      mrp_incl_gst: purchaseData.mrp_incl_gst || 0,
      mrp_excl_gst: basePrice,
      discount_on_purchase_percentage: discountPercentage,
      gst_percentage: gstPercentage,
      purchase_taxable_value: purchaseData.purchase_cost_taxable_value || calculatedTaxableValue,
      purchase_igst: purchaseData.is_interstate ? igstAmount : 0,
      purchase_cgst: purchaseData.is_interstate ? 0 : cgstAmount,
      purchase_sgst: purchaseData.is_interstate ? 0 : sgstAmount,
      purchase_invoice_value_rs: purchaseData.purchase_invoice_value || calculatedInvoiceValue,
      supplier: purchaseData.vendor || null,
      current_stock_at_purchase: newOverallProductStock,
      computed_stock_taxable_value: newOverallProductStock * purchaseCostPerUnit,
      computed_stock_igst: newOverallProductStock * (purchaseData.is_interstate ? igstAmount / newPurchaseQty : 0),
      computed_stock_cgst: newOverallProductStock * (purchaseData.is_interstate ? 0 : cgstAmount / newPurchaseQty),
      computed_stock_sgst: newOverallProductStock * (purchaseData.is_interstate ? 0 : sgstAmount / newPurchaseQty),
      computed_stock_total_value: newOverallProductStock * (purchaseCostPerUnit + (gstAmount / newPurchaseQty)),
      "Purchase_Cost/Unit(Ex.GST)": purchaseCostPerUnit,
      price_inlcuding_disc: purchaseCostPerUnit,
      transaction_type: 'purchase',
      created_at: timestamp,
      updated_at: timestamp
    };

    if (isUpdate) {
      // Remove created_at for updates
      delete purchaseRecord.created_at;
    }
    
    // --- Step 4: Persist the purchase record ---
    if (isUpdate && purchaseData.id) {
      const { error: purchaseUpdateError } = await supabase
        .from('purchase_history_with_stock')
        .update(purchaseRecord)
        .eq('purchase_id', purchaseData.id);
      if (purchaseUpdateError) {
        console.error("Error updating purchase record:", purchaseUpdateError);
        throw new Error(`Failed to update purchase: ${purchaseUpdateError.message || purchaseUpdateError.details || JSON.stringify(purchaseUpdateError)}`);
      }
      console.log("Purchase record updated successfully for ID:", purchaseData.id);
    } else {
      const { error: purchaseInsertError } = await supabase
        .from('purchase_history_with_stock')
        .insert(purchaseRecord);
      if (purchaseInsertError) {
        console.error("Error inserting purchase record:", purchaseInsertError);
        throw new Error(`Failed to record purchase: ${purchaseInsertError.message || purchaseInsertError.details || JSON.stringify(purchaseInsertError)}`);
      }
      console.log("New purchase record inserted successfully with ID:", purchaseRecord.purchase_id);
    }

    // --- Step 5: Update product's total stock quantity ---
    // This update should happen regardless of isUpdate, if quantityChange leads to a different newOverallProductStock
    // compared to currentProductStock before this specific transaction's effect was calculated.
    // However, the main logic for stock_quantity update should be based on newOverallProductStock directly.
    
    // Check if the stock actually needs updating to avoid unnecessary writes
    if (newOverallProductStock !== currentProductStock || !existingProduct?.stock_quantity) { // also update if initial stock was 0
        console.log(`Updating product stock for ID ${productId} from ${currentProductStock} to ${newOverallProductStock}`);
        const { error: stockUpdateError } = await supabase
          .from('product_master')
          .update({ 
              stock_quantity: newOverallProductStock,
              updated_at: timestamp
          })
          .eq('id', productId);

        if (stockUpdateError) {
            console.error("Error updating product stock:", stockUpdateError);
            throw new Error(`Failed to update product stock: ${stockUpdateError.message}`);
        }
        console.log(`Product stock updated to: ${newOverallProductStock} for product ID: ${productId}`);
    } else {
        console.log(`Product stock for ID ${productId} is already ${newOverallProductStock}. No update needed.`);
    }


    // --- Step 6: Record the transaction in stock_history ---
    // Record history if there was a meaningful change in quantity or it's a new purchase.
    if (quantityChange !== 0 || !isUpdate) {
      const stockHistoryRecord = {
        product_id: productId,
        product_name: purchaseData.product_name,
        hsn_code: purchaseData.hsn_code || '',
        units: purchaseData.unit_type || purchaseData.units || 'pcs',
        date: purchaseData.date || timestamp,
        // previous_qty for stock_history is the product's stock before this transaction's effect.
        previous_qty: currentProductStock, 
        current_qty: currentProductStock, // Added to satisfy NOT NULL constraint, assuming it means stock before change
        change_qty: quantityChange,
        stock_after: newOverallProductStock, // This is the new total stock of the product
        change_type: isUpdate ? 'purchase_edit' : 'purchase', // More specific type for edits
        reference_id: purchaseRecord.purchase_id,
        source: `Purchase Invoice: ${purchaseData.invoice_number || purchaseData.purchase_invoice_number || 'N/A'}`,
        created_at: timestamp,
      };

      console.log('Attempting to insert stock history record:', stockHistoryRecord);
      const { error: historyInsertError } = await supabase
        .from('stock_history')
        .insert(stockHistoryRecord);

      if (historyInsertError) {
        console.error("Error inserting into stock_history:", historyInsertError);
        throw new Error(`Failed to record stock history: ${historyInsertError.message}`);
      }
      console.log(`Successfully recorded stock history for product ID: ${productId}, change: ${quantityChange}`);
    } else {
      console.log("No quantity change for edited purchase, so no new stock history record created.");
    }
    
    // Return the updated/created purchase record, including the stock_after_purchase
    const resultData = { ...purchaseData, purchase_id: purchaseRecord.purchase_id, stock_after_purchase: newOverallProductStock };

    return { 
      success: true,
      message: isUpdate 
        ? 'Purchase updated successfully.' 
        : (existingProduct ? 'Purchase added successfully.' : 'New product created and purchase added successfully.'),
      data: resultData // Return the processed data
    };

  } catch (error) {
    console.error('Error in addPurchaseTransaction:', error);
    
    // Provide more detailed error information
    let errorMessage = 'An unknown error occurred during the purchase transaction.';
    
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
        error: new Error(errorMessage)
    };
  }
}; 

// Function to update product stock
export const updateProductStock = async (productId: string, quantity: number, transactionType: string = 'opening_balance') => {
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

    // Get current stock from purchase_history_with_stock
    const { data: latestStock, error: stockError } = await supabase
      .from('purchase_history_with_stock')
      .select('current_stock_at_purchase')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (stockError && stockError.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Error fetching current stock:', stockError);
      throw stockError;
    }

    // Use either the latest stock from history or the product's stock_quantity
    const currentStock = latestStock?.current_stock_at_purchase ?? product.stock_quantity ?? 0;
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
      transaction_type: transactionType
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
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product stock:', updateError);
      throw updateError;
    }

    return {
      success: true,
      newStock,
      message: 'Stock updated successfully'
    };
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
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
export const editPurchaseTransaction = async (purchaseId: string, updatedData: PurchaseFormData) => {
  const transactionTimestamp = new Date().toISOString();

  try {
    // --- Step 1: Fetch the original purchase record ---
    const { data: originalPurchase, error: fetchError } = await supabase
      .from('purchase_history_with_stock')
      .select('*')
      .eq('purchase_id', purchaseId)
      .single();

    if (fetchError || !originalPurchase) {
      console.error('Error fetching original purchase:', fetchError);
      throw new Error(`Original purchase with ID ${purchaseId} not found.`);
    }

    const productId = originalPurchase.product_id;

    // --- Step 2: Fetch the product from the product master ---
    const { data: product, error: productError } = await supabase
      .from('product_master')
      .select('id, stock_quantity, mrp_incl_gst, mrp_excl_gst, gst_percentage')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Error fetching product master data:', productError);
      throw new Error(`Product with ID ${productId} not found in product master.`);
    }

    // Note: Price change detection and updates are now handled by database trigger

    // --- Step 3: Prepare and update the purchase record ---
    const updatedPurchaseRecord = {
      date: updatedData.date,
      product_name: updatedData.product_name,
      hsn_code: updatedData.hsn_code,
      units: updatedData.unit_type || updatedData.units,
      purchase_invoice_number: updatedData.invoice_number || updatedData.purchase_invoice_number,
      purchase_qty: updatedData.purchase_qty,
      mrp_incl_gst: updatedData.mrp_incl_gst,
      mrp_excl_gst: updatedData.mrp_excl_gst || updatedData.mrp_per_unit_excl_gst,
      discount_on_purchase_percentage: updatedData.discount_on_purchase_percentage,
      gst_percentage: updatedData.gst_percentage,
      purchase_taxable_value: updatedData.purchase_cost_taxable_value,
      purchase_igst: updatedData.is_interstate ? ((updatedData.purchase_cost_taxable_value || 0) * (updatedData.gst_percentage || 18) / 100) : 0,
      purchase_cgst: !updatedData.is_interstate ? ((updatedData.purchase_cost_taxable_value || 0) * (updatedData.gst_percentage || 18) / 200) : 0,
      purchase_sgst: !updatedData.is_interstate ? ((updatedData.purchase_cost_taxable_value || 0) * (updatedData.gst_percentage || 18) / 200) : 0,
      purchase_invoice_value_rs: updatedData.purchase_invoice_value,
      supplier: updatedData.vendor,
      "Purchase_Cost/Unit(Ex.GST)": updatedData.mrp_excl_gst || updatedData.mrp_per_unit_excl_gst || 0,
      price_inlcuding_disc: updatedData.mrp_excl_gst || updatedData.mrp_per_unit_excl_gst || 0,
      updated_at: transactionTimestamp,
    };
    
    // Note: The database trigger will automatically:
    // 1. Update product master prices if they changed
    // 2. Log price changes to product_price_history
    // 3. Update stock quantities
    // 4. Log stock changes to stock_history
    
    const { error: updatePurchaseError } = await supabase
      .from('purchase_history_with_stock')
      .update(updatedPurchaseRecord)
      .eq('purchase_id', purchaseId);

    if (updatePurchaseError) {
      throw new Error(`Failed to update purchase record: ${updatePurchaseError.message}`);
    }

    console.log(`Purchase record updated successfully. Database trigger will handle price/stock updates.`);

    return { success: true };
  } catch (error) {
    console.error('Error in editPurchaseTransaction:', error);
    return { success: false, error: error instanceof Error ? error : new Error('An unknown error occurred') };
  }
};

/**
 * Deletes a purchase transaction and updates stock accordingly
 * @param purchaseId - The ID of the purchase to delete
 * @returns Promise with success/error result
 */
export const deletePurchaseTransaction = async (purchaseId: string) => {
  try {
    const timestamp = new Date().toISOString();

    // First, get the purchase record to understand what we're deleting
    const { data: purchaseToDelete, error: fetchError } = await supabase
      .from('purchase_history_with_stock')
      .select('*')
      .eq('purchase_id', purchaseId)
      .single();

    if (fetchError || !purchaseToDelete) {
      console.error("Error fetching purchase to delete:", fetchError);
      throw new Error(`Failed to find purchase record: ${fetchError?.message || 'Purchase not found'}`);
    }

    // Get the product to update its stock
    const { data: product, error: productError } = await supabase
      .from('product_master')
      .select('id, stock_quantity, name')
      .eq('id', purchaseToDelete.product_id)
      .single();

    if (productError) {
      console.error("Error fetching product for deletion:", productError);
      throw new Error(`Failed to find product: ${productError.message}`);
    }

    // Calculate new stock (subtract the deleted purchase quantity)
    const currentStock = product.stock_quantity || 0;
    const deletedQty = purchaseToDelete.purchase_qty || 0;
    const newStock = Math.max(0, currentStock - deletedQty);

    // Delete the purchase record
    const { error: deleteError } = await supabase
      .from('purchase_history_with_stock')
      .delete()
      .eq('purchase_id', purchaseId);

    if (deleteError) {
      console.error("Error deleting purchase record:", deleteError);
      throw new Error(`Failed to delete purchase: ${deleteError.message}`);
    }

    // Update product stock
    const { error: stockUpdateError } = await supabase
      .from('product_master')
      .update({ 
        stock_quantity: newStock,
        updated_at: timestamp
      })
      .eq('id', purchaseToDelete.product_id);

    if (stockUpdateError) {
      console.error("Error updating product stock after deletion:", stockUpdateError);
      throw new Error(`Failed to update product stock: ${stockUpdateError.message}`);
    }

    // Record the deletion in stock history
    const stockHistoryRecord = {
      product_id: purchaseToDelete.product_id,
      product_name: purchaseToDelete.product_name,
      hsn_code: purchaseToDelete.hsn_code || '',
      units: purchaseToDelete.units || 'pcs',
      date: timestamp,
      previous_qty: currentStock,
      current_qty: currentStock,
      change_qty: -deletedQty, // Negative because we're removing stock
      stock_after: newStock,
      change_type: 'purchase_delete',
      reference_id: purchaseId,
      source: `Deleted Purchase Invoice: ${purchaseToDelete.purchase_invoice_number || 'N/A'}`,
      created_at: timestamp,
    };

    const { error: historyError } = await supabase
      .from('stock_history')
      .insert(stockHistoryRecord);

    if (historyError) {
      console.error("Error recording deletion in stock history:", historyError);
      // Don't throw here as the main operation succeeded
    }

    console.log(`Purchase ${purchaseId} deleted successfully. Stock updated from ${currentStock} to ${newStock}`);

    return {
      success: true,
      message: 'Purchase deleted successfully',
      data: { deletedQty, newStock, productName: product.name }
    };

  } catch (error) {
    console.error('Error in deletePurchaseTransaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to delete purchase')
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
      console.error("Error fetching purchase:", error);
      throw new Error(`Failed to fetch purchase: ${error.message}`);
    }

    return {
      success: true,
      data: purchase
    };

  } catch (error) {
    console.error('Error in getPurchaseById:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to fetch purchase')
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
        query = query.ilike('purchase_invoice_number', `%${filters.invoiceNumber}%`);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }
    }

    const { data: purchases, error } = await query;

    if (error) {
      console.error("Error fetching purchases:", error);
      throw new Error(`Failed to fetch purchases: ${error.message}`);
    }

    return {
      success: true,
      data: purchases || []
    };

  } catch (error) {
    console.error('Error in getAllPurchases:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to fetch purchases')
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
      .select('purchase_qty, purchase_invoice_value_rs, purchase_taxable_value');

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
      console.error("Error fetching purchase statistics:", error);
      throw new Error(`Failed to fetch purchase statistics: ${error.message}`);
    }

    // Calculate statistics
    const totalPurchases = purchases?.length || 0;
    const totalQuantity = purchases?.reduce((sum, p) => sum + (p.purchase_qty || 0), 0) || 0;
    const totalValue = purchases?.reduce((sum, p) => sum + (p.purchase_invoice_value_rs || 0), 0) || 0;
    const totalTaxableValue = purchases?.reduce((sum, p) => sum + (p.purchase_taxable_value || 0), 0) || 0;
    const averageOrderValue = totalPurchases > 0 ? totalValue / totalPurchases : 0;

    return {
      success: true,
      data: {
        totalPurchases,
        totalQuantity,
        totalValue,
        totalTaxableValue,
        averageOrderValue
      }
    };

  } catch (error) {
    console.error('Error in getPurchaseStatistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to fetch purchase statistics')
    };
  }
}; 

/**
 * Validates purchase form data before processing
 * @param purchaseData - The purchase data to validate
 * @returns Validation result with errors if any
 */
export const validatePurchaseData = (purchaseData: PurchaseFormData) => {
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

  if (!purchaseData.purchase_invoice_number?.trim() && !purchaseData.invoice_number?.trim()) {
    errors.push('Purchase invoice number is required');
  }

  // Numeric validations
  if (!purchaseData.purchase_qty || purchaseData.purchase_qty <= 0) {
    errors.push('Purchase quantity must be greater than 0');
  }

  if (!purchaseData.mrp_incl_gst || purchaseData.mrp_incl_gst <= 0) {
    errors.push('MRP including GST must be greater than 0');
  }

  if (purchaseData.gst_percentage && (purchaseData.gst_percentage < 0 || purchaseData.gst_percentage > 100)) {
    errors.push('GST percentage must be between 0 and 100');
  }

  if (purchaseData.discount_on_purchase_percentage && (purchaseData.discount_on_purchase_percentage < 0 || purchaseData.discount_on_purchase_percentage > 100)) {
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

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates all derived values for a purchase transaction
 * @param purchaseData - The base purchase data
 * @returns Calculated values for the purchase
 */
export const calculatePurchaseValues = (purchaseData: PurchaseFormData) => {
  const basePrice = purchaseData.mrp_excl_gst || purchaseData.mrp_per_unit_excl_gst || 0;
  const gstPercentage = purchaseData.gst_percentage || 18;
  const discountPercentage = purchaseData.discount_on_purchase_percentage || 0;
  const quantity = purchaseData.purchase_qty || 0;
  const isInterstate = purchaseData.is_interstate || false;

  // Calculate purchase cost per unit after discount
  const purchaseCostPerUnit = basePrice * (1 - (discountPercentage / 100));
  
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
  const mrpExclGst = basePrice || (purchaseData.mrp_incl_gst ? purchaseData.mrp_incl_gst / (1 + (gstPercentage / 100)) : 0);

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
    profitMargin: purchaseData.mrp_incl_gst ? ((purchaseData.mrp_incl_gst - (purchaseCostPerUnit * (1 + gstPercentage / 100))) / purchaseData.mrp_incl_gst) * 100 : 0
  };
}; 