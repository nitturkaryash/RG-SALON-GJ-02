/**
 * Utility functions to help with inventory operations
 */

/**
 * Validates and sanitizes a product before inserting into inventory_sales
 * @param {Object} product - The product object to validate
 * @returns {Object} - A sanitized product object with default values for missing fields
 */
export function validateInventoryProduct(product) {
  if (!product) return null;
  
  // Create a sanitized copy
  const sanitized = { ...product };
  
  // Ensure product_name is never null (required field)
  if (!sanitized.product_name && sanitized.name) {
    sanitized.product_name = sanitized.name;
  } else if (!sanitized.product_name && sanitized.service_name) {
    sanitized.product_name = sanitized.service_name;
  } else if (!sanitized.product_name) {
    sanitized.product_name = sanitized.id ? `Unknown Product (${sanitized.id})` : 'Unknown Product';
  }
  
  // Set reasonable defaults for other required fields
  if (!sanitized.date) {
    sanitized.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  if (sanitized.quantity === undefined || sanitized.quantity === null) {
    sanitized.quantity = 1;
  }
  
  return sanitized;
}

/**
 * Prepares an array of products for insertion into inventory_sales
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of validated and sanitized product objects
 */
export function prepareInventoryProducts(products) {
  if (!products || !Array.isArray(products)) return [];
  
  return products
    .filter(product => product) // Remove any null/undefined items
    .map(product => validateInventoryProduct(product));
}

/**
 * Checks if an order contains any products (as opposed to just services)
 * @param {Object} order - The order object to check
 * @returns {boolean} - True if the order contains at least one product
 */
export function orderHasProducts(order) {
  if (!order || !order.services || !Array.isArray(order.services)) {
    return false;
  }
  
  return order.services.some(service => 
    service && service.type === 'product'
  );
}

/**
 * Extracts products from an order object
 * @param {Object} order - The order object
 * @returns {Array} - Array of product objects extracted from the order
 */
export function extractProductsFromOrder(order) {
  if (!order || !order.services || !Array.isArray(order.services)) {
    return [];
  }
  
  return order.services
    .filter(service => service && service.type === 'product')
    .map(product => ({
      product_id: product.service_id || product.id,
      product_name: product.service_name || product.name || 'Unknown Product',
      quantity: product.quantity || 1,
      mrp_incl_gst: product.price || 0,
      gst_percentage: product.gst_percentage || 18,
      hsn_code: product.hsn_code || '',
      date: new Date().toISOString().split('T')[0],
      order_id: order.id,
      customer_name: order.client_name || order.customer_name || 'Walk-in',
      payment_method: order.payment_method || 'cash',
      status: order.status || 'completed'
    }));
}

/**
 * Error handler for inventory operations
 * @param {Error} error - The error object
 * @param {string} operation - The operation that caused the error
 * @returns {Object} - An object with success: false and the error details
 */
export function handleInventoryError(error, operation = 'inventory operation') {
  console.error(`Error in ${operation}:`, error);
  
  // Return a standardized error object
  return {
    success: false,
    error: error.message || 'Unknown error',
    details: error.details || null,
    operation
  };
} 