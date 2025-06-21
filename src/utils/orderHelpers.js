/**
 * Utility functions for working with orders
 */

/**
 * Normalizes an order object to ensure all necessary fields exist
 * This helps bridge the gap between different naming conventions in the app
 * @param {Object} order - The order object to normalize
 * @returns {Object} - A normalized order object
 */
export function normalizeOrder(order) {
  if (!order) return null;
  
  // Create a copy so we don't modify the original
  const normalized = { ...order };
  
  // Handle customer_name vs client_name
  if (!normalized.client_name && normalized.customer_name) {
    normalized.client_name = normalized.customer_name;
  } else if (!normalized.customer_name && normalized.client_name) {
    normalized.customer_name = normalized.client_name;
  }
  
  // Handle total vs total_amount
  if (normalized.total === undefined && normalized.total_amount !== undefined) {
    normalized.total = normalized.total_amount;
  } else if (normalized.total_amount === undefined && normalized.total !== undefined) {
    normalized.total_amount = normalized.total;
  }
  
  // Ensure payments is an array
  if (!normalized.payments) {
    normalized.payments = [];
  } else if (typeof normalized.payments === 'string') {
    try {
      normalized.payments = JSON.parse(normalized.payments);
    } catch (e) {
      normalized.payments = [];
    }
  }
  
  // Ensure services is an array
  if (!normalized.services) {
    normalized.services = [];
  } else if (typeof normalized.services === 'string') {
    try {
      normalized.services = JSON.parse(normalized.services);
    } catch (e) {
      normalized.services = [];
    }
  }
  
  // Ensure status has a value
  if (!normalized.status) {
    normalized.status = 'completed';
  }
  
  // Ensure order_id exists
  if (!normalized.order_id && normalized.id) {
    normalized.order_id = normalized.id;
  }
  
  // Ensure id exists
  if (!normalized.id && normalized.order_id) {
    normalized.id = normalized.order_id;
  }
  
  return normalized;
}

/**
 * Normalizes an array of orders
 * @param {Array} orders - Array of order objects
 * @returns {Array} - Array of normalized order objects
 */
export function normalizeOrders(orders) {
  if (!orders || !Array.isArray(orders)) return [];
  return orders.map(order => normalizeOrder(order));
}

/**
 * Determines if an order is a salon consumption order
 * @param {Object} order - The order object to check
 * @returns {boolean} - True if this is a salon consumption order
 */
export function isSalonConsumptionOrder(order) {
  if (!order) return false;
  
  return (
    order.is_salon_consumption === true || 
    order.consumption_purpose || 
    order.client_name === 'Salon Consumption' ||
    order.customer_name === 'Salon Consumption' ||
    (order.services && order.services.some(s => s.for_salon_use === true))
  );
}

/**
 * Gets the purchase type of an order (service, product, or both)
 * @param {Object} order - The order object to check
 * @returns {string} - The purchase type ('service', 'product', 'both', or 'unknown')
 */
export function getPurchaseType(order) {
  if (!order || !order.services || !Array.isArray(order.services) || order.services.length === 0) {
    return 'unknown';
  }
  
  const hasServices = order.services.some(service => 
    service && service.type === 'service'
  );
  
  const hasProducts = order.services.some(service => 
    service && (service.type === 'product' || service.category === 'product')
  );
  
  // For items without explicit type, check if they come from product tables or have product-like attributes
  const hasUnknownProducts = order.services.some(service => 
    service && 
    !service.type && 
    !service.category && 
    (service.product_id || service.product_name || service.hsn_code || service.stock_quantity !== undefined)
  );
  
  const totalProducts = hasProducts || hasUnknownProducts;
  
  if (hasServices && totalProducts) return 'both';
  if (totalProducts) return 'product';
  if (hasServices) return 'service';
  return 'unknown';
}

/**
 * Formats currency value
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export function formatOrderCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${parseFloat(amount).toFixed(2)}`;
}

/**
 * Calculate the total amount for an order containing both products and services
 * 
 * @param {Array} products - Array of product items
 * @param {Array} services - Array of service items 
 * @returns {number} - The total amount
 */
export const calculateTotal = (products = [], services = []) => {
  const productTotal = products.reduce((sum, product) => {
    const price = product.price || 0;
    const quantity = product.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const serviceTotal = services.reduce((sum, service) => {
    const price = service.price || 0;
    const quantity = service.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  return productTotal + serviceTotal;
}; 