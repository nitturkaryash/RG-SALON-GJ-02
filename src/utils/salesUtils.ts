import { supabase } from './supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface SaleData {
  product_id: string;
  quantity: number;
  price_excl_gst: number;
  gst_percentage: number;
  discount_percentage?: number;
  customer_name?: string;
  stylist_name?: string;
  payment_method: 'Cash' | 'Card' | 'UPI' | 'Other';
  invoice_number?: string;
  order_id?: string;
}

/**
 * Unified function to sync a completed POS sale to the Sales History
 * This should be called when an order is completed in the POS system
 * IMPORTANT: Only product items should be recorded in Sales History, not services
 */
export const syncToSalesHistory = async (orderData: {
  services: Array<{
    id: string;
    name?: string;
    product_name?: string;
    quantity: number;
    price: number;
    gst_percentage?: number;
    type?: string; // Add type field to check
  }>;
  customer_name: string;
  stylist_name?: string;
  payment_method: string;
  discount?: number;
  invoice_number?: string;
  order_id: string;
}) => {
  try {
    console.log('📦 Syncing POS product sales to Sales History...', orderData);

    // Add debug log specifically for salon consumption
    if (orderData.customer_name === 'Salon Consumption') {
      console.log('🎯 FOUND SALON CONSUMPTION RECORD TO SAVE:', {
        products: orderData.services.length,
        first_product: orderData.services[0],
        customer: orderData.customer_name,
      });
    }

    if (!orderData.services || orderData.services.length === 0) {
      console.warn('No products in order data, skipping sales history sync');
      return { success: false, error: 'No products to record' };
    }

    const results = [];

    // Filter to ensure we only process items that are products (not services)
    const productItemsOnly = orderData.services.filter(product => {
      // Always check for type field, verify it's a product (case-insensitive)
      if (product.type) {
        const isProduct = product.type.toLowerCase() === 'product';
        if (!isProduct) {
          console.log(
            `Skipping non-product item: ${product.name || product.product_name} (type: ${product.type})`
          );
        }
        return isProduct;
      }
      // If no type field, we'll check the presence of a product ID
      // This is a more conservative approach - only products with explicit type='product' or valid product IDs are included
      const hasValidId = !!product.id && product.id.length > 0;
      if (!hasValidId) {
        console.log(
          `Skipping item without valid product ID: ${product.name || product.product_name}`
        );
      }
      return hasValidId;
    });

    console.log(
      `📦 After filtering: ${productItemsOnly.length} of ${orderData.services.length} items are products`
    );

    if (productItemsOnly.length === 0) {
      console.warn(
        'No product items found after filtering, skipping sales history sync'
      );
      return {
        success: true,
        message: 'No product items to record in Sales History',
      };
    }

    // Process each product as a separate sales record
    for (const product of productItemsOnly) {
      // Skip products without ID
      if (!product.id) {
        console.warn('Skipping product without ID in sales history sync');
        continue;
      }

      // Get the latest product details from the database to ensure accurate prices and GST
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(
          'id, name, mrp_incl_gst, price, gst_percentage, hsn_code, units'
        )
        .eq('id', product.id)
        .single();

      if (productError) {
        console.error(
          `Error fetching product data for ${product.id}:`,
          productError
        );
        continue; // Skip this product but try others
      }

      // Use the fetched product data or fall back to the provided data
      const productName =
        productData?.name || product.name || product.product_name;
      const gstPercentage =
        productData?.gst_percentage || product.gst_percentage || 0;

      // Get the price (including GST)
      const priceInclGst =
        productData?.mrp_incl_gst || productData?.price || product.price;

      // Calculate price excluding GST
      const priceExclGst = priceInclGst / (1 + gstPercentage / 100);

      // Convert payment method to the format expected by Sales History
      const salesPaymentMethod = (() => {
        const method = orderData.payment_method.toLowerCase();
        if (method.includes('cash')) return 'Cash' as const;
        if (
          method.includes('card') ||
          method.includes('credit') ||
          method.includes('debit')
        )
          return 'Card' as const;
        if (method.includes('upi')) return 'UPI' as const;
        return 'Other' as const;
      })();

      // Create the sale data object
      const saleData: SaleData = {
        product_id: product.id,
        quantity: product.quantity || 1,
        price_excl_gst: priceExclGst,
        gst_percentage: gstPercentage,
        discount_percentage: orderData.discount
          ? (orderData.discount / priceInclGst) * 100
          : 0,
        customer_name: orderData.customer_name || 'Walk-in Customer',
        stylist_name: orderData.stylist_name,
        payment_method: salesPaymentMethod,
        invoice_number: orderData.invoice_number,
        order_id: orderData.order_id,
      };

      // Record the transaction using the existing function
      const result = await recordSaleTransaction(saleData);
      results.push(result);

      // Log success or failure
      if (result.success) {
        console.log(`📦 Successfully recorded sale for product ${productName}`);
      } else {
        console.error(
          `📦 Failed to record sale for product ${productName}:`,
          result.error
        );
      }
    }

    // Check if all sales were recorded successfully
    const allSuccessful = results.every(r => r.success);

    return {
      success: allSuccessful,
      results: results,
      message: allSuccessful
        ? `All ${results.length} product sales recorded successfully`
        : 'Some product sales failed to record',
    };
  } catch (error) {
    console.error('Error syncing to sales history:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error('Unknown error in syncToSalesHistory'),
    };
  }
};

/**
 * Records a sales transaction in the database
 * This function will be called from the POS system when an order is completed
 */
export const recordSaleTransaction = async (saleData: SaleData) => {
  try {
    // Log the incoming data for debugging
    console.log('📊 SALES DATA:', saleData);

    // Check if the item is a service and skip if so.
    if (
      (saleData as any).type === 'service' ||
      (saleData as any).service_name
    ) {
      console.log(
        'Skipping service item in recordSaleTransaction:',
        (saleData as any).service_name || saleData.product_id
      );
      return { success: true, message: 'Service item skipped' };
    }

    // Validate required fields
    if (!saleData.product_id) {
      console.error('Missing required product_id');
      return {
        success: false,
        error: new Error('Missing required product_id'),
      };
    }

    // Calculate taxable value after discount
    const discount = saleData.discount_percentage || 0;
    const discountFactor = 1 - discount / 100;
    const priceAfterDiscount = saleData.price_excl_gst * discountFactor;
    const taxableValue = priceAfterDiscount * saleData.quantity;

    // Calculate GST amounts (assuming intra-state by default)
    const gstRate = saleData.gst_percentage / 100;
    const totalGST = taxableValue * gstRate;

    // Assuming intra-state transaction (CGST + SGST)
    // For inter-state, you would set IGST = totalGST and CGST/SGST = 0
    const cgst = totalGST / 2;
    const sgst = totalGST / 2;
    const igst = 0; // For intra-state

    // Calculate total value
    const totalValue = taxableValue + cgst + sgst + igst;

    // Map payment method to one of the allowed values for the check constraint
    // The constraint only allows: 'cash', 'card', 'online', 'other'
    const mappedPaymentMethod = (() => {
      const method = (saleData.payment_method || '').toLowerCase();
      if (method.includes('cash')) return 'cash';
      if (
        method.includes('card') ||
        method.includes('credit') ||
        method.includes('debit')
      )
        return 'card';
      if (
        method.includes('upi') ||
        method.includes('online') ||
        method.includes('net') ||
        method.includes('bank')
      )
        return 'online';
      return 'other';
    })();

    console.log(
      `📊 Mapped payment method from "${saleData.payment_method}" to "${mappedPaymentMethod}"`
    );

    // Create record matching EXACT database column names
    const salesRecord = {
      id: uuidv4(),
      product_id: saleData.product_id,

      // Match database expectations
      qty: saleData.quantity, // For compatibility with existing code
      quantity: saleData.quantity, // For newer code

      // Price fields
      price_excl_gst: saleData.price_excl_gst,
      ex_gst: saleData.price_excl_gst, // For compatibility

      // GST fields
      gst_percentage: saleData.gst_percentage,
      taxable_value: parseFloat(taxableValue.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: parseFloat(igst.toFixed(2)),

      // Value fields
      total_value: parseFloat(totalValue.toFixed(2)),
      invoice_value: parseFloat(totalValue.toFixed(2)), // For compatibility

      // Customer fields - populate both for compatibility
      customer_name: saleData.customer_name || 'Walk-in Customer',
      customer: saleData.customer_name || 'Walk-in Customer',

      // Invoice fields - populate both for compatibility
      invoice_number: saleData.invoice_number,
      invoice_no: saleData.invoice_number,

      // Payment method - use mapped value that satisfies the check constraint
      payment_method: mappedPaymentMethod,

      // Add is_salon_consumption flag when customer is 'Salon Consumption'
      is_salon_consumption: saleData.customer_name === 'Salon Consumption',

      // Add other optional fields if they exist
      transaction_type: 'sale',
      stylist_name: saleData.stylist_name,
      order_id: saleData.order_id,
      discount_percentage: discount,
    };

    // Debug log for salon consumption records
    if (saleData.customer_name === 'Salon Consumption') {
      console.log('🎯 SALON CONSUMPTION RECORD READY TO SAVE:', {
        product_id: salesRecord.product_id,
        customer_name: salesRecord.customer_name,
        is_salon_consumption: salesRecord.is_salon_consumption,
      });
    }

    console.log('📤 SENDING TO DB:', salesRecord);

    // Insert into sales table
    const { data, error } = await supabase.from('sales').insert(salesRecord);

    if (error) {
      console.error('❌ DB INSERT ERROR:', error);
      return { success: false, error };
    }

    console.log('✅ SALES RECORD CREATED SUCCESSFULLY');
    return {
      success: true,
      message: 'Sale recorded successfully',
      data,
    };
  } catch (error) {
    console.error('❌ EXCEPTION:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('An unknown error occurred'),
    };
  }
};

/**
 * Provides an option to manually update stock for a product
 * This is a fallback in case the automatic trigger fails
 */
export const updateProductStock = async (
  productId: string,
  quantity: number
) => {
  try {
    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const currentStock = product?.stock_quantity || 0;
    const newStock = Math.max(currentStock - quantity, 0); // Don't allow negative stock

    // Update stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating product stock:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Failed to update stock'),
    };
  }
};
