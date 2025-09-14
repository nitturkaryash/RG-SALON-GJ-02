import { supabase } from './supabase/supabaseClient';

/**
 * Fetch products from inventory_purchases and services from services table
 * with no dummy data fallbacks
 * @returns Array of products and services with stock information
 */
export const fetchProductsWithStock = async () => {
  console.log('Fetching actual products and services data...');
  const allItems = new Map(); // Use Map to deduplicate items by name
  let authenticationErrorDetected = false;

  try {
    // 1. FIRST check inventory_products table (main Products section)
    try {
      console.log('Checking inventory_products table...');
      const { data: productsData, error: productsError } = await supabase
        .from('inventory_products')
        .select('*')
        .order('product_name', { ascending: true });

      if (productsError) {
        if (productsError.code === '42P01') {
          console.warn('inventory_products table does not exist');
        } else if (
          productsError.message &&
          productsError.message.includes('Invalid API key')
        ) {
          console.error(
            'Authentication error detected with Supabase:',
            productsError
          );
          authenticationErrorDetected = true;
        } else {
          console.error(
            'Error fetching from inventory_products:',
            productsError
          );
        }
      } else if (productsData && productsData.length > 0) {
        console.log(
          `Found ${productsData.length} products in inventory_products table`
        );

        // Add products to map
        productsData.forEach(product => {
          allItems.set(product.product_name, {
            id: product.product_id || `product-${product.product_name}`,
            name: product.product_name,
            price: product.mrp_incl_gst || 0,
            stock: product.stock_quantity || 0,
            hsn_code: product.hsn_code || '',
            units: product.units || 'pcs',
            gst_percentage: product.gst_percentage || 18,
            type: 'Product',
            source: 'inventory_products',
          });
        });
      }
    } catch (err) {
      console.warn('Error accessing inventory_products table:', err);
    }

    // Skip further Supabase queries if we detected an authentication error
    if (authenticationErrorDetected) {
      console.warn(
        'Skipping additional Supabase queries due to authentication error'
      );
      throw new Error(
        'Authentication error with Supabase. Please check your API keys.'
      );
    }

    // 3. Get services from services table
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*');

      if (servicesError) {
        if (servicesError.code === '42P01') {
          console.warn('services table does not exist');
        } else {
          console.error('Error fetching from services table:', servicesError);
        }
      } else if (servicesData && servicesData.length > 0) {
        console.log(`Found ${servicesData.length} services in services table`);

        // Add services to the products map
        servicesData.forEach(service => {
          const serviceName = service.name || service.service_name;
          allItems.set(`service-${serviceName}`, {
            id: service.id || `service-${serviceName}`,
            name: serviceName,
            price: service.price || 0,
            stock: Infinity, // Services have unlimited stock
            hsn_code: service.hsn_code || service.sac_code || '',
            units: 'service',
            gst_percentage: service.gst_percentage || 18,
            type: 'Service',
            duration: service.duration || 60,
            description: service.description || '',
          });
        });
      }
    } catch (err) {
      console.warn('Error accessing services table:', err);
    }

    // 4. Update stock information from inventory_balance_stock view
    try {
      const { data: stockData, error: stockError } = await supabase
        .from('inventory_balance_stock')
        .select('product_name, balance_qty, mrp_incl_gst');

      if (stockError) {
        if (stockError.code === '42P01') {
          console.warn('inventory_balance_stock view does not exist');
        } else {
          console.error(
            'Error fetching from inventory_balance_stock:',
            stockError
          );
        }
      } else if (stockData && stockData.length > 0) {
        console.log(
          `Found ${stockData.length} products with stock information`
        );

        // Update stock quantities for products
        stockData.forEach(stockItem => {
          if (allItems.has(stockItem.product_name)) {
            const product = allItems.get(stockItem.product_name);

            // Only update stock from balance_stock if the source is inventory_purchases
            // For inventory_products, keep the stock_quantity from that table
            if (product.source === 'inventory_purchases') {
              product.stock = stockItem.balance_qty || 0;
              // Update price from balance_stock if available
              if (stockItem.mrp_incl_gst) {
                product.price = stockItem.mrp_incl_gst;
              }
            }

            allItems.set(stockItem.product_name, product);
          }
        });
      }
    } catch (stockErr) {
      console.warn(
        'Could not fetch inventory balance, using default stock values:',
        stockErr
      );
    }

    // If no products found at all, return empty array instead of demo products
    if (allItems.size === 0) {
      console.log('No products found in any source.');
      return [];
    }

    // Convert map to array and sort alphabetically
    const results = Array.from(allItems.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    console.log(`Total unique products and services: ${results.length}`);

    return results;
  } catch (error) {
    console.error('Error fetching products and services:', error);
    // Return empty array instead of demo data
    return [];
  }
};

/**
 * Check if there's enough stock for a product
 * @param productName Product name to check
 * @param quantity Quantity to validate
 * @returns Boolean indicating if enough stock is available
 */
export const checkProductStock = async (productName, quantity) => {
  try {
    // First check inventory_balance_stock if it exists
    const { data, error } = await supabase
      .from('inventory_balance_stock')
      .select('balance_qty')
      .eq('product_name', productName)
      .single();

    if (!error && data) {
      return data.balance_qty >= quantity;
    }

    // If inventory check fails, fallback to product's stock field
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock')
      .eq('name', productName)
      .single();

    if (productError) {
      console.warn('Could not check stock for product:', productName);
      return true; // Allow purchase if we can't check stock
    }

    return product.stock >= quantity;
  } catch (error) {
    console.error('Error checking product stock:', error);
    return true; // Allow purchase if stock check fails
  }
};

/**
 * Update inventory when an order is completed
 * @param order Order object with items to process
 * @returns Result indicating success or failure
 */
export const updateInventoryOnOrderCompletion = async order => {
  try {
    if (!order || !order.order_id || !order.items || order.items.length === 0) {
      return { success: false, message: 'Invalid order data' };
    }

    // For each product in the order
    for (const item of order.items) {
      if (item.type !== 'Product') continue; // Skip services

      // Create consumption record
      const consumptionRecord = {
        id: `consume-${order.order_id}-${item.product_name}`.replace(
          /\s+/g,
          '-'
        ),
        date: order.date || new Date().toISOString(),
        product_name: item.name || item.product_name,
        requisition_voucher_no: order.order_id,
        consumption_qty: item.quantity,
        purchase_cost_per_unit_ex_gst: item.price ? item.price / 1.18 : 0, // Approximate excl GST price
        purchase_gst_percentage: item.gst_percentage || 18,
      };

      // Try to insert consumption record if inventory system exists
      try {
        const { error: insertError } = await supabase
          .from('inventory_consumption')
          .insert(consumptionRecord);

        if (insertError) {
          console.warn(
            'Error inserting consumption record, inventory may not be set up:',
            insertError
          );
        }
      } catch (err) {
        console.warn(
          'Could not update inventory, it may not be set up yet:',
          err
        );
      }

      // Update product stock in products table
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('name', item.name || item.product_name)
          .single();

        if (!productError && product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);

          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('name', item.name || item.product_name);

          if (updateError) {
            console.warn('Error updating product stock:', updateError);
          }
        }
      } catch (err) {
        console.warn('Error updating product stock:', err);
      }
    }

    return { success: true, message: 'Inventory updated successfully' };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Check stock for multiple products at once
 * @param items Array of {product_name, quantity} objects to check
 * @returns Object with valid items and invalid items
 */
export const validateStockForItems = async items => {
  try {
    const productNames = items.map(item => item.name || item.product_name);

    // Try to get stock from inventory_balance_stock first
    let stockMap = {};
    try {
      const { data, error } = await supabase
        .from('inventory_balance_stock')
        .select('product_name, balance_qty')
        .in('product_name', productNames);

      if (!error && data && data.length > 0) {
        // Create a map for easier lookup
        data.forEach(product => {
          stockMap[product.product_name] = product.balance_qty || 0;
        });
      }
    } catch (err) {
      console.warn(
        'Could not check inventory stock, will use products table instead:',
        err
      );
    }

    // If inventory check fails, get stock from products table
    if (Object.keys(stockMap).length === 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, stock')
        .in('name', productNames);

      if (!productsError && products && products.length > 0) {
        products.forEach(product => {
          stockMap[product.name] = product.stock || 0;
        });
      }
    }

    // Validate each item
    const validItems = [];
    const invalidItems = [];

    for (const item of items) {
      const productName = item.name || item.product_name;

      if (
        item.type === 'Service' || // Skip validation for services
        (stockMap[productName] !== undefined &&
          stockMap[productName] >= item.quantity)
      ) {
        validItems.push(item);
      } else {
        invalidItems.push({
          ...item,
          available: stockMap[productName] || 0,
        });
      }
    }

    return {
      valid: validItems,
      invalid: invalidItems,
      success: invalidItems.length === 0,
    };
  } catch (error) {
    console.error('Error validating stock for items:', error);
    return { valid: [], invalid: items, success: false };
  }
};
