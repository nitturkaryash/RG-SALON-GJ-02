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
    const timestamp = new Date().toISOString();
    let productId: string;
    const isUpdate = !!purchaseData.id; // Check if we're updating an existing purchase
    let originalPurchaseQty = 0; // To store the original quantity if updating

    // --- Step 1: Find or create the product ---
    const { data: existingProduct, error: fetchProductError } = await supabase
      .from('products')
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
        .from('products')
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
    
    // currentProductStock is the stock of the product *before this operation* (add or edit)
    const currentProductStock = existingProduct?.stock_quantity || 0;
    let quantityChange = 0;
    let newOverallProductStock = currentProductStock;

    if (isUpdate && purchaseData.id) {
      // Fetch the original purchase record to get its original quantity
      const { data: originalPurchase, error: fetchOriginalError } = await supabase
        .from(TABLES.PURCHASES)
        .select('purchase_qty')
        .eq('purchase_id', purchaseData.id)
        .single();

      if (fetchOriginalError || !originalPurchase) {
        console.error("Error fetching original purchase for update:", fetchOriginalError);
        throw new Error(`Failed to fetch original purchase for update: ${fetchOriginalError?.message || 'Original purchase record not found.'}`);
      }
      originalPurchaseQty = originalPurchase.purchase_qty || 0;
      console.log(`Editing purchase. Original Qty: ${originalPurchaseQty}, New Qty: ${purchaseData.purchase_qty || 0}`);
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

    // --- Step 3: Prepare data for purchases table ---
    const purchaseRecord: Record<string, any> = {
      // purchase_id should be purchaseData.id if isUpdate, otherwise new uuid
      purchase_id: isUpdate ? purchaseData.id : uuidv4(), 
      product_id: productId,
      product_name: purchaseData.product_name,
      date: purchaseData.date || timestamp,
      hsn_code: purchaseData.hsn_code || null,
      units: purchaseData.unit_type || purchaseData.units || null,
      purchase_invoice_number: purchaseData.invoice_number || purchaseData.purchase_invoice_number || 'N/A',
      purchase_qty: newPurchaseQty,
      mrp_incl_gst: purchaseData.mrp_incl_gst || 0,
      mrp_excl_gst: purchaseData.mrp_excl_gst || purchaseData.mrp_per_unit_excl_gst || 0,
      discount_on_purchase_percentage: purchaseData.discount_on_purchase_percentage || 0,
      gst_percentage: purchaseData.gst_percentage || 18,
      purchase_taxable_value: purchaseData.purchase_cost_taxable_value || purchaseData.purchase_taxable_value || 0,
      purchase_igst: purchaseData.purchase_igst || 0,
      purchase_cgst: purchaseData.purchase_cgst || 0,
      purchase_sgst: purchaseData.purchase_sgst || 0,
      purchase_invoice_value_rs: purchaseData.purchase_invoice_value || purchaseData.purchase_invoice_value_rs || 0,
      updated_at: timestamp,
      // Set 'current_stock' to the product's new total stock after this transaction
      // This makes "Stock After Purchase" reflect the updated total.
      current_stock: newOverallProductStock,
      Vendor: purchaseData.vendor || null
    };

    if (!isUpdate) {
      purchaseRecord.created_at = timestamp;
    }
    
    // --- Step 4: Persist the purchase record ---
    if (isUpdate && purchaseData.id) {
      const { error: purchaseUpdateError } = await supabase
        .from(TABLES.PURCHASES)
        .update(purchaseRecord)
        .eq('purchase_id', purchaseData.id); // Use purchaseData.id for eq
      if (purchaseUpdateError) {
        console.error("Error updating purchase record:", purchaseUpdateError);
        throw new Error(`Failed to update purchase: ${purchaseUpdateError.message}`);
      }
      console.log("Purchase record updated successfully for ID:", purchaseData.id);
    } else {
      const { error: purchaseInsertError } = await supabase
        .from(TABLES.PURCHASES)
        .insert(purchaseRecord);
      if (purchaseInsertError) {
        console.error("Error inserting purchase record:", purchaseInsertError);
        throw new Error(`Failed to record purchase: ${purchaseInsertError.message}`);
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
          .from('products')
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
    return { 
        success: false, 
        error: error instanceof Error ? error : new Error('An unknown error occurred during the purchase transaction.') 
    };
  }
}; 

// Function to update product stock
export const updateProductStock = async (productId: string, quantity: number, transactionType: string = 'inventory_update') => {
  try {
    // Get product details first
    const { data: product, error: productError } = await supabase
      .from('products')
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
      purchase_invoice_number: `INV-UPDATE-${Date.now()}`,
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
      supplier: 'INVENTORY UPDATE',
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
      .from('products')
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
      error: error.message
    };
  }
}; 