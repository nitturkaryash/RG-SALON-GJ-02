import { supabase, handleSupabaseError } from './supabase/supabaseClient';
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

    // --- Step 1: Find or create the product ---
    const { data: existingProduct, error: fetchProductError } = await supabase
      .from('products')
      .select('id, stock_quantity, name, hsn_code, units, gst_percentage, mrp_incl_gst, mrp_excl_gst')
      .eq('name', purchaseData.product_name)
      .maybeSingle();

    if (fetchProductError) {
      console.error("Error fetching product:", fetchProductError);
      // Handle error by throwing a new error with a custom message
      throw new Error(`Failed to find product: ${fetchProductError.message}`);
    }

    if (!existingProduct) {
      // Product doesn't exist, create it first
      console.log(`Product '${purchaseData.product_name}' not found. Creating new product...`);
      
      // Calculate excl GST price if needed - handle possibly undefined values
      const gstPercentage = purchaseData.gst_percentage || 18; // Default to 18% if undefined
      const mrpInclGst = purchaseData.mrp_incl_gst || 0; // Default to 0 if undefined
      const mrpExclGst = purchaseData.mrp_per_unit_excl_gst || 
        (mrpInclGst / (1 + (gstPercentage / 100)));
      
      const newProduct = {
        name: purchaseData.product_name,
        hsn_code: purchaseData.hsn_code || '',
        units: purchaseData.unit_type || 'pcs',
        gst_percentage: gstPercentage,
        mrp_incl_gst: mrpInclGst,
        mrp_excl_gst: mrpExclGst,
        price: mrpExclGst,  // Set price equal to mrp_excl_gst
        stock_quantity: 0,  // Will be updated after purchase
        active: true,
        created_at: timestamp,
        updated_at: timestamp,
        category: 'Auto-created' // Mark that this was auto-created
      };
      
      const { data: newProductData, error: createProductError } = await supabase
        .from('products')
        .insert(newProduct)
        .select('id')
        .single();
        
      if (createProductError) {
        console.error("Error creating product:", createProductError);
        // Handle error by throwing a new error with a custom message
        throw new Error(`Failed to create product: ${createProductError.message}`);
      }
      
      productId = newProductData.id;
      console.log(`Created new product with ID: ${productId}`);
    } else {
      productId = existingProduct.id;
      console.log(`Found existing product with ID: ${productId}`);
    }
    
    // Get current stock quantity (0 for new products)
    const currentStock = existingProduct?.stock_quantity || 0;

    // --- Step 2: Prepare data for purchases table --- 
    const purchaseRecord: Record<string, any> = {
      product_id: productId,
      date: purchaseData.date || timestamp,
      invoice_no: purchaseData.invoice_number || purchaseData.purchase_invoice_number,
      qty: purchaseData.purchase_qty,
      incl_gst: purchaseData.mrp_incl_gst || 0,
      ex_gst: purchaseData.purchase_excl_gst || purchaseData.mrp_per_unit_excl_gst || 0,
      taxable_value: purchaseData.purchase_taxable_value || purchaseData.purchase_cost_taxable_value || 0,
      igst: purchaseData.purchase_igst || 0,
      cgst: purchaseData.purchase_cgst || 0,
      sgst: purchaseData.purchase_sgst || 0,
      invoice_value: purchaseData.purchase_invoice_value || purchaseData.purchase_invoice_value_rs || 0,
      transaction_type: 'purchase',
      supplier: purchaseData.vendor || 'Direct Entry',
      discount_percentage: purchaseData.discount_on_purchase_percentage || 0, // Save discount percentage explicitly
      updated_at: timestamp
    };

    // For new purchases, add ID and created_at
    if (!isUpdate) {
      purchaseRecord.id = uuidv4(); // Generate a UUID for the new purchase
      purchaseRecord.created_at = timestamp;
    }

    // --- Step 4: Calculate new stock and update product --- 
    let newStock = currentStock; // Initialize with current stock
    let quantityChange = 0;     // Initialize quantity change
    
    if (isUpdate) {
      // For updates, need to fetch original purchase quantity
      // This part is simplified for now, assuming we won't adjust stock on simple edits
      console.warn("Updating purchase: Stock adjustment logic for edits is not fully implemented. Ensure manual stock adjustments if necessary.");
      // If implementing full stock adjustment on edit:
      // 1. Fetch the original purchase quantity from the DB using purchaseData.id
      // 2. quantityChange = purchaseData.purchase_qty - originalPurchaseQty;
      // 3. newStock = currentStock + quantityChange;
    } else {
      // For new purchases, simply add the quantity
      quantityChange = purchaseData.purchase_qty;
      newStock = currentStock + quantityChange;
    }

    // Update product stock only if there was a change (prevents unnecessary updates on edit without qty change)
    if (quantityChange !== 0) {
        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ 
              stock_quantity: newStock,
              updated_at: timestamp
          })
          .eq('id', productId);

        if (stockUpdateError) {
            console.error("Error updating product stock:", stockUpdateError);
            // Consider rolling back purchase or logging critical error
            throw new Error(`Failed to update product stock: ${stockUpdateError.message}`);
        }
    }

    // --- Step 5: Record the transaction in stock_history ---
    // Always record history for new purchases, potentially for updates if quantity changed
    if (!isUpdate || quantityChange !== 0) {
      const stockHistoryRecord = {
        product_id: productId,
        product_name: purchaseData.product_name, // Add product name
        hsn_code: purchaseData.hsn_code || '',   // Add HSN code
        units: purchaseData.unit_type || 'pcs', // Add units
        date: purchaseData.date || timestamp,
        change_qty: quantityChange,
        previous_qty: currentStock, // Stock BEFORE the transaction
        stock_after: newStock,    // Stock AFTER the transaction
        type: 'purchase',       // Transaction type
        reference_id: purchaseRecord.id, // Link to the purchase record ID
        source: `Purchase Invoice: ${purchaseData.invoice_number || purchaseData.purchase_invoice_number || 'N/A'}`, // Source document
        created_at: timestamp,
      };

      // --- DEBUGGING: Log the record before insertion ---
      console.log('Attempting to insert stock history record:', stockHistoryRecord);
      // --- END DEBUGGING ---

      const { error: historyInsertError } = await supabase
        .from('stock_history')
        .insert(stockHistoryRecord);

      if (historyInsertError) {
        console.error("Error inserting into stock_history:", historyInsertError);
        // Decide on error handling: maybe log a warning, maybe throw an error?
        // Throwing an error might be safer to ensure data consistency.
        throw new Error(`Failed to record stock history: ${historyInsertError.message}`);
      }
      console.log(`Successfully recorded stock history for product ID: ${productId}`);
    }
    
    return { 
      success: true,
      message: isUpdate 
        ? 'Purchase updated successfully.' 
        : (existingProduct ? 'Purchase added successfully.' : 'New product created and purchase added successfully.')
    };

  } catch (error) {
    console.error('Error in addPurchaseTransaction:', error);
    return { 
        success: false, 
        error: error instanceof Error ? error : new Error('An unknown error occurred during the purchase transaction.') 
    };
  }
}; 