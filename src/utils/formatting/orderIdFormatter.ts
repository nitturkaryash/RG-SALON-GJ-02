/**
 * Utility functions for consistent order ID formatting across the application
 * Ensures that same order IDs get same serial numbers like sales_002, salon_011, etc.
 */

export interface OrderForFormatting {
  id: string;
  created_at?: string;
  date?: string;
  services?: any[];
  type?: string;
  consumption_purpose?: string;
}

/**
 * Normalizes order objects to have consistent structure
 */
export const normalizeOrder = (order: any): OrderForFormatting => {
  return {
    id: order.id,
    created_at: order.created_at || order.date,
    date: order.date || order.created_at,
    services: order.services || [],
    type: order.type,
    consumption_purpose: order.consumption_purpose,
  };
};

/**
 * Determines if an order is a salon consumption order
 */
export const isSalonConsumptionOrder = (order: OrderForFormatting): boolean => {
  // Check if order has consumption_purpose (indicates salon consumption)
  if (order.consumption_purpose) {
    return true;
  }

  // Check if all services are marked for salon use
  if (order.services && order.services.length > 0) {
    return order.services.every(
      (service: any) => service.for_salon_use === true
    );
  }

  return false;
};

/**
 * Determines if an order is a membership-only order
 */
export const isMembershipOnlyOrder = (order: OrderForFormatting): boolean => {
  if (!order || !order.services || order.services.length === 0) {
    return false;
  }

  // Check if all services are memberships
  return order.services.every((service: any) => {
    // Check explicit type/category
    if (service.type === 'membership' || service.category === 'membership') {
      return true;
    }

    // Check for membership fields
    if (service.duration_months || service.benefit_amount || service.benefitAmount) {
      return true;
    }

    // Check name patterns
    const serviceName = (service.item_name || service.service_name || service.name || '').toLowerCase();
    const membershipPatterns = [
      'silver', 'gold', 'platinum', 'diamond', 'membership', 'member', 
      'tier', 'package', 'subscription', 'plan'
    ];

    return membershipPatterns.some(pattern => serviceName.includes(pattern));
  });
};

/**
 * Generates a consistent display order ID (e.g., RNG0001/2526, SC0001/2526)
 * @param orderToFormat - The order to format
 * @param allOrdersForContext - All orders to determine sequential numbering
 * @returns Formatted order ID like RNG0001/2526 or SC0001/2526
 */
export const generateDisplayOrderId = (
  orderToFormat: OrderForFormatting,
  allOrdersForContext: OrderForFormatting[]
): string => {
  if (!orderToFormat.id) {
    return 'Unknown';
  }

  const normalizedOrder = normalizeOrder(orderToFormat);

  // Check if this is a salon consumption order
  const isSalonOrder = isSalonConsumptionOrder(normalizedOrder);

  if (!allOrdersForContext || allOrdersForContext.length === 0) {
    return orderToFormat.id; // Return original ID if no context
  }

  // Normalize all orders in the context
  const normalizedContextOrders = allOrdersForContext.map(normalizeOrder);

  // Sort orders by creation date to maintain consistent numbering
  const sortedOrders = [...normalizedContextOrders].sort((a, b) => {
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateA - dateB;
  });

  // Find the index of the current order in the sorted list
  const orderIndex = sortedOrders.findIndex(o => o.id === normalizedOrder.id);

  if (orderIndex === -1) {
    // Fallback if order not found
    return orderToFormat.id.substring(0, 8);
  }

  // Check if this is a membership-only order
  const isMembershipOrder = isMembershipOnlyOrder(normalizedOrder);

  // Get all orders of the same type (membership, salon, or sales) that come before this one
  const sameTypeOrders = sortedOrders
    .slice(0, orderIndex + 1)
    .filter(o => {
      if (isMembershipOrder) {
        return isMembershipOnlyOrder(o);
      } else {
        return isSalonConsumptionOrder(o) === isSalonOrder && !isMembershipOnlyOrder(o);
      }
    });

  // Get the position of this order among orders of the same type
  const orderNumber = sameTypeOrders.length;

  // Format with leading zeros to ensure 4 digits
  const formattedNumber = String(orderNumber).padStart(4, '0');

  // Get the year from the order date
  const orderDate = new Date(normalizedOrder.created_at || '');
  const year = orderDate.getFullYear();

  // Format year as 2526 for 2025-2026 period
  const yearFormat =
    year >= 2025
      ? '2526'
      : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;

  // Return the formatted ID based on order type
  if (isMembershipOrder) {
    return `MEM${formattedNumber}/${yearFormat}`;
  } else if (isSalonOrder) {
    return `SC${formattedNumber}/${yearFormat}`;
  } else {
    return `RNG${formattedNumber}/${yearFormat}`;
  }
};

/**
 * Gets the display order ID for a single order given all orders context
 * This is a convenience function for when you have a single order and all orders
 */
export const getDisplayOrderId = (
  orderId: string,
  allOrders: any[]
): string => {
  const orderToFormat = allOrders.find(order => order.id === orderId);
  if (!orderToFormat) {
    return orderId.substring(0, 8);
  }

  return generateDisplayOrderId(orderToFormat, allOrders);
};

/**
 * Batch format multiple orders with consistent serial numbers
 * @param orders - Array of orders to format
 * @returns Array of orders with displayOrderId property added
 */
export const batchFormatOrderIds = <T extends { id: string }>(
  orders: T[]
): (T & { displayOrderId: string })[] => {
  return orders.map(order => ({
    ...order,
    displayOrderId: generateDisplayOrderId(order, orders),
  }));
};

/**
 * Formats an order ID consistently across the application
 * Uses the same logic as the Orders page to generate RNG0001/2526 or SC0001/2526 format
 */
export const formatOrderIdForDisplay = (
  order: any,
  allOrders: any[] = []
): string => {
  if (!order || !order.id) return 'Unknown';

  // If order already has a formatted order_id, use it
  if (
    order.order_id &&
    (order.order_id.startsWith('RNG') || order.order_id.startsWith('SC') || order.order_id.startsWith('MEM'))
  ) {
    return order.order_id;
  }

  // Check if this is a membership-only order
  const isMembershipOrder = isMembershipOnlyOrder(order);

  // Check if this is a salon consumption order
  const isSalonOrder =
    order.is_salon_consumption === true ||
    order.type === 'salon_consumption' ||
    order.type === 'salon-consumption' ||
    order.consumption_purpose ||
    order.client_name === 'Salon Consumption';

  if (!allOrders || allOrders.length === 0) {
    return order.id;
  }

  // Sort orders by creation date to maintain consistent numbering
  const sortedOrders = [...allOrders].sort((a, b) => {
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateA - dateB;
  });

  // Find the index of the current order in the sorted list
  const orderIndex = sortedOrders.findIndex(o => o.id === order.id);

  if (orderIndex === -1) {
    return order.id.substring(0, 8);
  }

  // Get all orders of the same type (membership, salon, or sales) that come before this one
  const sameTypeOrders = sortedOrders.slice(0, orderIndex + 1).filter(o => {
    if (isMembershipOrder) {
      return isMembershipOnlyOrder(o);
    } else {
      const isOtherSalon =
        o.is_salon_consumption === true ||
        o.type === 'salon_consumption' ||
        o.type === 'salon-consumption' ||
        o.consumption_purpose ||
        o.client_name === 'Salon Consumption';
      return isOtherSalon === isSalonOrder && !isMembershipOnlyOrder(o);
    }
  });

  // Get the position of this order among orders of the same type
  const orderNumber = sameTypeOrders.length;

  // Format with leading zeros to ensure 4 digits
  const formattedNumber = String(orderNumber).padStart(4, '0');

  // Get the year from the order date
  const orderDate = new Date(order.created_at || '');
  const year = orderDate.getFullYear();

  // Format year as 2526 for 2025-2026 period
  const yearFormat =
    year >= 2025
      ? '2526'
      : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;

  // Return the formatted ID based on order type
  if (isMembershipOrder) {
    return `MEM${formattedNumber}/${yearFormat}`;
  } else if (isSalonOrder) {
    return `SC${formattedNumber}/${yearFormat}`;
  } else {
    return `RNG${formattedNumber}/${yearFormat}`;
  }
};

/**
 * Simple order ID formatter for cases where we only have the order_id string
 * If it's already formatted (RNG0001/2526 or SC0001/2526), return as is
 * Otherwise, generate a formatted ID based on the hash
 */
export const formatOrderIdSimple = (
  orderId: string,
  orderData?: any
): string => {
  if (!orderId) return 'Unknown';

  // If already formatted, return as is
  if (orderId.startsWith('RNG') || orderId.startsWith('SC') || orderId.startsWith('MEM')) {
    return orderId;
  }

  // For raw hash IDs, create a simple formatted version
  // Extract a numeric value from the hash for consistent numbering
  const hashNumber =
    Math.abs(
      orderId.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
    ) % 10000;

  const formattedNumber = String(hashNumber).padStart(4, '0');

  // Check if it's a membership-only order
  const isMembershipOrder = orderData ? isMembershipOnlyOrder(orderData) : false;

  // Determine if it's salon consumption based on available data
  const isSalonOrder =
    orderData?.is_salon_consumption === true ||
    orderData?.consumption_purpose ||
    orderData?.client_name === 'Salon Consumption' ||
    orderData?.type === 'salon_consumption' ||
    orderData?.type === 'salon-consumption';

  // Get the year from order data or current date
  const orderDate = orderData?.created_at
    ? new Date(orderData.created_at)
    : new Date();
  const year = orderDate.getFullYear();

  // Format year as 2526 for 2025-2026 period
  const yearFormat =
    year >= 2025
      ? '2526'
      : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;

  // Return the formatted ID based on order type
  if (isMembershipOrder) {
    return `MEM${formattedNumber}/${yearFormat}`;
  } else if (isSalonOrder) {
    return `SC${formattedNumber}/${yearFormat}`;
  } else {
    return `RNG${formattedNumber}/${yearFormat}`;
  }
};
