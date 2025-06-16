import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './format';

/**
 * Export Utilities for Orders
 * 
 * All numeric values in exports are automatically rounded to integers
 * to eliminate decimal places and provide cleaner output for reports.
 * This includes currency amounts, tax calculations, and any other numeric data.
 */

// Type for the jspdf-autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Convert data to CSV format and trigger download
 * @param data - Array of objects to convert to CSV
 * @param fileName - Name of the CSV file (without extension)
 * @param headers - Object mapping data keys to header labels
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers: Record<keyof T, string>
): void => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Round ALL numeric values in the data to integers
  const roundedData = data.map(item => {
    const newItem: Record<string, any> = { ...item };
    Object.keys(newItem).forEach(key => {
      if (typeof newItem[key] === 'number') {
        // Round ALL numbers to integers, not just monetary ones
        newItem[key] = Math.round(newItem[key]);
      } else if (typeof newItem[key] === 'string' && !isNaN(parseFloat(newItem[key]))) {
        // Round string numbers as well
        const numValue = parseFloat(newItem[key]);
        if (!isNaN(numValue)) {
          newItem[key] = Math.round(numValue).toString();
        }
      }
    });
    return newItem as T;
  });

  const headerRow = Object.values(headers).join(',');
  const rows = roundedData.map(item => {
    return Object.keys(headers)
      .map(key => {
        const value = item[key as keyof T];
        if (typeof value === 'number') {
          // Ensure all numbers are rounded to integers
          return Math.round(value).toString();
        }
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      })
      .join(',');
  });

  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert data to PDF format and trigger download
 * @param data - Array of objects to convert to PDF
 * @param fileName - Name of the PDF file (without extension)
 * @param headers - Object mapping data keys to header labels
 * @param title - Title for the PDF document
 */
export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  headers: Record<keyof T, string>,
  title: string
): void => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  doc.setFontSize(10);
  
  // Add date and time
  const now = new Date();
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
    doc.internal.pageSize.getWidth() - 15, 
    10, 
    { align: 'right' }
  );

  // Prepare header and data for table
  const tableHeaders = Object.values(headers);
  const tableData = data.map(item => {
    // Round ALL numeric values to integers
    const roundedItem: Record<string, any> = { ...item };
    Object.keys(roundedItem).forEach(key => {
      if (typeof roundedItem[key] === 'number') {
        // Round ALL numbers to integers, not just monetary ones
        roundedItem[key] = Math.round(roundedItem[key]);
      } else if (typeof roundedItem[key] === 'string' && !isNaN(parseFloat(roundedItem[key]))) {
        // Round string numbers as well
        const numValue = parseFloat(roundedItem[key]);
        if (!isNaN(numValue)) {
          roundedItem[key] = Math.round(numValue);
        }
      }
    });
    
    return Object.keys(headers).map(key => {
      const value = roundedItem[key];
      
      // Format based on data type
      if (typeof value === 'number') {
        // Check if it might be a currency value by key name
        const keyStr = key.toString().toLowerCase();
        if (keyStr.includes('price') || keyStr.includes('total') || keyStr.includes('tax') || 
            keyStr.includes('subtotal') || keyStr.includes('discount') || keyStr.includes('cost') ||
            keyStr.includes('cgst') || keyStr.includes('sgst') || keyStr.includes('amount')) {
          // Format currency values with rupee symbol (already rounded)
          return `₹${value}`;
        }
        // All other numbers are just returned as rounded integers
        return value.toString();
      }
      
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'object' && value instanceof Date) {
        return value.toLocaleDateString();
      }
      
      return String(value);
    });
  });

  // Create the table
  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
    startY: 25,
    headStyles: {
      fillColor: [107, 142, 35], // Olive green to match theme
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [247, 247, 247]
    },
    margin: { top: 25 }
  });

  // Save PDF
  doc.save(`${fileName}.pdf`);
};

// Helper type (simplified version of ExtendedOrder from Orders.tsx)
interface ExportOrderData {
  id: string;
  created_at?: string;
  client_name?: string;
  customer_name?: string;
  is_salon_consumption?: boolean;
  consumption_purpose?: string;
  services?: any[];
  status?: string;
  total?: number;
  total_amount?: number;
  [key: string]: any;
}

// Internal helper to normalize order data, similar to normalizeOrder in Orders.tsx
const normalizeOrderInternal = (order: any): ExportOrderData => {
  return {
    ...order,
    client_name: order.client_name || order.customer_name,
    customer_name: order.customer_name || order.client_name,
    is_salon_consumption: typeof order.is_salon_consumption === 'boolean' ? order.is_salon_consumption : false, // Ensure boolean
    consumption_purpose: order.consumption_purpose,
    services: order.services,
    created_at: order.created_at,
    id: order.id,
    status: order.status || 'pending',
    total: order.total || order.total_amount || 0,
    total_amount: order.total_amount || order.total || 0,
  };
};

// Internal helper to check if an order is for salon consumption, similar to isSalonConsumptionOrder in Orders.tsx
const isSalonConsumptionOrderInternal = (normalizedOrder: ExportOrderData): boolean => {
  return !!(
    normalizedOrder.is_salon_consumption === true ||
    normalizedOrder.consumption_purpose ||
    normalizedOrder.client_name === 'Salon Consumption' ||
    (normalizedOrder.services && normalizedOrder.services.some((s: any) => s.for_salon_use === true))
  );
};

// Generates the display Order ID (e.g., sales-0001, salon-0001) - simplified version matching Orders.tsx
const generateDisplayOrderId = (
  orderToFormat: any,
  allOrdersForContext: any[]
): string => {
  console.log('🔢 generateDisplayOrderId called for order:', orderToFormat.id?.substring(0, 8));
  
  if (!orderToFormat.id) {
    console.log('❌ No order ID found, returning Unknown');
    return 'Unknown';
  }
  
  const normalizedOrderToFormat = normalizeOrderInternal(orderToFormat); // Renamed for clarity
  
  // Check if this is a salon consumption order
  const isSalonOrder = isSalonConsumptionOrderInternal(normalizedOrderToFormat);
  console.log('🏪 Is salon order for', normalizedOrderToFormat.id?.substring(0,8), ':', isSalonOrder);
  
  if (!allOrdersForContext || allOrdersForContext.length === 0) {
    console.log('❌ No context orders, returning raw ID for', normalizedOrderToFormat.id?.substring(0,8));
    return orderToFormat.id; // Return original raw ID if no context
  }
  
  console.log('📊 Total orders in context for', normalizedOrderToFormat.id?.substring(0,8), ':', allOrdersForContext.length);
  
  // Normalize all orders in the context ONCE
  const normalizedContextOrders = allOrdersForContext.map(normalizeOrderInternal);

  // Sort orders by creation date to maintain consistent numbering
  const sortedOrders = [...normalizedContextOrders].sort((a, b) => { // Use normalizedContextOrders
    const dateA = new Date(a.created_at || '').getTime();
    const dateB = new Date(b.created_at || '').getTime();
    return dateA - dateB;
  });

  // Find the index of the current order in the sorted list
  const orderIndex = sortedOrders.findIndex(o => o.id === normalizedOrderToFormat.id);
  console.log('📍 Order index in sorted list for', normalizedOrderToFormat.id?.substring(0,8), ':', orderIndex);
  
  if (orderIndex === -1) {
    // Fallback if order not found
    console.log('❌ Order', normalizedOrderToFormat.id?.substring(0,8), 'not found in context, returning substring ID');
    return orderToFormat.id.substring(0, 8); // Return a shortened original ID
  }
  
  // Get all orders of the same type (salon or sales) that come before this one
  const sameTypeOrders = sortedOrders
    .slice(0, orderIndex + 1)
    // Filter now uses the already normalized 'o' from sortedOrders (which came from normalizedContextOrders)
    .filter(o => isSalonConsumptionOrderInternal(o) === isSalonOrder); 
  
  // Get the position of this order among orders of the same type
  const orderNumber = sameTypeOrders.length;
  console.log('🔢 Order number for this type for', normalizedOrderToFormat.id?.substring(0,8), ':', orderNumber);
  
  // Format with leading zeros to ensure 4 digits
  const formattedNumber = String(orderNumber).padStart(4, '0');
  console.log('📋 Formatted number for', normalizedOrderToFormat.id?.substring(0,8), ':', formattedNumber);
  
  // Return the formatted ID based on order type
  const finalId = isSalonOrder ? `salon-${formattedNumber}` : `sales-${formattedNumber}`;
  console.log('🎯 Final generated ID for', normalizedOrderToFormat.id?.substring(0,8), ':', finalId);
  return finalId;
};

/**
 * Helper function to format order data specifically for export
 * 
 * COMPREHENSIVE EXPORT INCLUDES:
 * - Order identification (ID, creation date, appointment info)
 * - Customer & Stylist details (names, IDs) 
 * - Purchase classification (type, salon consumption status)
 * - Service breakdown (names, types, individual prices, count)
 * - Financial details (subtotal, CGST/SGST breakdown, tax, discount, total)
 * - Payment information (method, detailed breakdown, pending amounts)
 * - Order status and classification (completed/pending, walk-in/appointment)
 * - Multi-expert order indicators and aggregation details
 * - Notes and additional metadata
 * 
 * @param ordersToExport - Array of order objects to be exported
 * @param allOrdersForContext - Full list of orders for generating sequential IDs
 * @returns Formatted array for export with all comprehensive data
 */
export const formatOrdersForExport = (ordersToExport: any[], allOrdersForContext: any[]): any[] => {
  console.log('🚀 formatOrdersForExport called with:', {
    ordersToExportCount: ordersToExport.length,
    allOrdersForContextCount: allOrdersForContext.length,
    firstOrderRawId: ordersToExport[0]?.id?.substring(0, 8),
  });

  const safeGetNumber = (value: any): number => {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : Math.round(value);
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : Math.round(parsed);
    }
    return 0;
  };

  // Helper function to determine purchase type
  const getPurchaseType = (order: any) => {
    if (!order || !order.services || !Array.isArray(order.services) || order.services.length === 0) {
      return 'Unknown';
    }
    
    const hasServices = order.services.some((service: any) => 
      service && (!service.type || service.type === 'service')
    );
    const hasProducts = order.services.some((service: any) => 
      service && service.type === 'product'
    );
    const hasMemberships = order.services.some((service: any) => 
      service && (service.type === 'membership' || service.category === 'membership')
    );
    
    // Return membership if only memberships are present
    if (hasMemberships && !hasServices && !hasProducts) return 'Membership';
    
    // Return combined types if multiple types are present
    const types = [];
    if (hasServices) types.push('Service');
    if (hasProducts) types.push('Product');
    if (hasMemberships) types.push('Membership');
    
    if (types.length > 1) return types.join(' & ');
    if (hasProducts) return 'Product';
    if (hasMemberships) return 'Membership';
    return 'Service';
  };

  // Helper function to check if order is salon consumption
  const isSalonConsumption = (order: any) => {
    return !!(
      order.is_salon_consumption === true ||
      order.consumption_purpose ||
      order.client_name === 'Salon Consumption' ||
      (order.services && order.services.some((s: any) => s.for_salon_use === true))
    );
  };

  return ordersToExport.map((originalOrder, index) => {
    const displayId = generateDisplayOrderId(originalOrder, allOrdersForContext);
    
    console.log(`🔍 Order ${index + 1}: Raw ID ${originalOrder.id?.substring(0, 8)} -> Display ID: ${displayId}`);

    const taxVal = safeGetNumber(originalOrder.tax);
    const totalTax = taxVal;
    const cgst = Math.round(totalTax / 2);
    const sgst = Math.round(totalTax / 2);

    let paymentInfo = '';
    if (originalOrder.payments && originalOrder.payments.length > 0) {
      paymentInfo = originalOrder.payments.map((payment: any) => {
        const method = payment.payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown';
        const amount = safeGetNumber(payment.amount);
        return `${method}: ₹${amount}`;
      }).join(', ');
      const pendingAmountVal = safeGetNumber(originalOrder.pending_amount);
      if (pendingAmountVal > 0) {
        paymentInfo += `, Pending: ₹${pendingAmountVal}`;
      }
    } else {
      const method = originalOrder.payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown';
      const totalAmount = safeGetNumber(originalOrder.total || originalOrder.total_amount);
      paymentInfo = `${method}: ₹${totalAmount}`;
      const pendingAmountVal = safeGetNumber(originalOrder.pending_amount);
      if (pendingAmountVal > 0) {
        paymentInfo += `, Pending: ₹${pendingAmountVal}`;
      }
    }

    // Get individual service details
    const serviceNames = originalOrder.services && Array.isArray(originalOrder.services) 
      ? originalOrder.services.map((s: any) => s.service_name).join(', ') 
      : '';

    const serviceTypes = originalOrder.services && Array.isArray(originalOrder.services)
      ? originalOrder.services.map((s: any) => s.type || 'Service').join(', ')
      : '';

    const servicePrices = originalOrder.services && Array.isArray(originalOrder.services)
      ? originalOrder.services.map((s: any) => `₹${safeGetNumber(s.price)}`).join(', ')
      : '';

    // Check if this is a multi-expert order
    const isMultiExpert = (originalOrder as any).aggregated_multi_expert === true;

    // Calculate accurate totals for display
    let displayTotal = safeGetNumber(originalOrder.total || originalOrder.total_amount);
    if (!isMultiExpert && originalOrder.payments && originalOrder.payments.length > 0) {
      const regularPaymentTotal = originalOrder.payments
        .filter((payment: any) => payment.payment_method !== 'membership')
        .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
      
      if (regularPaymentTotal > 0) {
        displayTotal = regularPaymentTotal;
      }
    }

    const result = {
      id: displayId, // Use the generated display ID
      created_at: new Date(originalOrder.created_at).toLocaleString(),
      client_name: originalOrder.client_name || originalOrder.customer_name || 'Unknown',
      client_id: originalOrder.client_id || '',
      stylist_name: originalOrder.stylist_name || 'No stylist assigned',
      stylist_id: originalOrder.stylist?.id || originalOrder.stylist_id || '',
      purchase_type: getPurchaseType(originalOrder),
      is_salon_consumption: isSalonConsumption(originalOrder) ? 'Yes' : 'No',
      consumption_purpose: originalOrder.consumption_purpose || '',
      appointment_id: originalOrder.appointment_id || '',
      appointment_time: originalOrder.appointment_time ? new Date(originalOrder.appointment_time).toLocaleString() : '',
      is_multi_expert: isMultiExpert ? 'Yes' : 'No',
      items_count: originalOrder.services?.length || 0,
      service_names: serviceNames,
      service_types: serviceTypes,
      service_prices: servicePrices,
      subtotal: safeGetNumber(originalOrder.subtotal),
      cgst: cgst,
      sgst: sgst,
      total_tax: totalTax,
      discount: safeGetNumber(originalOrder.discount),
      total: displayTotal,
      pending_amount: safeGetNumber(originalOrder.pending_amount),
      payment_method: originalOrder.payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Cash',
      payment_details: paymentInfo,
      status: originalOrder.status || 'Pending',
      is_walk_in: originalOrder.is_walk_in ? 'Walk-in' : 'Appointment',
      notes: originalOrder.notes || ''
    };

    console.log(`✅ Final result for order ${index + 1}: ID = ${result.id}`);
    return result;
  });
};

/**
 * Order export header definitions - Enhanced with all available data
 */
export const orderExportHeaders = {
  id: 'Order ID',
  created_at: 'Date & Time',
  client_name: 'Customer Name',
  client_id: 'Customer ID',
  stylist_name: 'Stylist Name',
  stylist_id: 'Stylist ID',
  purchase_type: 'Purchase Type',
  is_salon_consumption: 'Salon Consumption',
  consumption_purpose: 'Consumption Purpose',
  appointment_id: 'Appointment ID',
  appointment_time: 'Appointment Time',
  is_multi_expert: 'Multi-Expert Order',
  items_count: 'Number of Items',
  service_names: 'Service Names',
  service_types: 'Service Types',
  service_prices: 'Service Prices',
  subtotal: 'Subtotal (₹)',
  cgst: 'CGST 9% (₹)',
  sgst: 'SGST 9% (₹)',
  total_tax: 'Total Tax (₹)',
  discount: 'Discount (₹)',
  total: 'Total (₹)',
  pending_amount: 'Pending Amount (₹)',
  payment_method: 'Primary Payment Method',
  payment_details: 'Payment Details',
  status: 'Status',
  is_walk_in: 'Order Type',
  notes: 'Notes'
}; 