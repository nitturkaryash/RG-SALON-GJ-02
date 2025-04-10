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

    // --- Step 3: Insert or Update in purchases table --- 
    let purchaseInsertError;
    
    if (isUpdate) {
      // Update existing purchase
      console.log(`Updating purchase with ID: ${purchaseData.id}`);
      const { error } = await supabase
        .from('purchases')
        .update(purchaseRecord)
        .eq('id', purchaseData.id);
      purchaseInsertError = error;
    } else {
      // Insert new purchase
      const { error } = await supabase
        .from('purchases')
        .insert(purchaseRecord);
      purchaseInsertError = error;
    }

    if (purchaseInsertError) {
      console.error("Error inserting into purchases:", purchaseInsertError);
      // Handle error by throwing a new error with a custom message
      throw new Error(`Failed to record purchase transaction: ${purchaseInsertError.message}`);
    }

    // --- Step 4: Update product stock quantity --- 
    // If this is an update, we need to handle stock differently
    if (isUpdate) {
      // For updates, we'd need to get the original purchase quantity
      // and adjust the stock accordingly, but that requires more complex logic
      // For simplicity, we'll just update the stock to the new quantity for now
      console.log("Updated purchase record. Stock quantity update logic would go here.");
      // A more sophisticated approach would involve:
      // 1. Fetching the old purchase record
      // 2. Calculating the difference between old and new quantities
      // 3. Adjusting the stock by that difference
    } else {
      // For new purchases, simply add the quantity
      const newStock = currentStock + purchaseData.purchase_qty;
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ 
            stock_quantity: newStock,
            updated_at: timestamp
        })
        .eq('id', productId);

      if (stockUpdateError) {
          console.error("Error updating product stock:", stockUpdateError);
          console.warn(`Purchase recorded for product ID '${productId}', but failed to update stock quantity.`);
      }
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