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

/**
 * Convert data to CSV format and trigger download
 * @param data - Array of objects to convert to CSV
 * @param fileName - Name of the CSV file (without extension)
 * @param headers - Object mapping data keys to header labels
 */
export const exportToCSV = (data, fileName, headers) => {
    if (!data || data.length === 0) {
        console.error('No data to export');
        return;
    }

    // Round ALL numeric values in the data to integers
    const roundedData = data.map(item => {
        const newItem = { ...item };
        Object.keys(newItem).forEach(key => {
            if (typeof newItem[key] === 'number') {
                // Round ALL numbers to integers
                newItem[key] = Math.round(newItem[key]);
            } else if (typeof newItem[key] === 'string' && !isNaN(parseFloat(newItem[key]))) {
                // Round string numbers as well
                const numValue = parseFloat(newItem[key]);
                if (!isNaN(numValue)) {
                    newItem[key] = Math.round(numValue).toString();
                }
            }
        });
        return newItem;
    });

    // Create header row
    const headerRow = Object.values(headers).join(',');
    // Create data rows
    const rows = roundedData.map(item => {
        return Object.keys(headers)
            .map(key => {
            const value = item[key];
            // Handle special formatting
            if (typeof value === 'number') {
                // Ensure all numbers are rounded to integers
                return Math.round(value).toString();
            }
            if (value === null || value === undefined) {
                return '';
            }
            // Wrap strings with commas in quotes
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value.toString();
        })
            .join(',');
    });
    // Combine header and rows
    const csv = [headerRow, ...rows].join('\n');
    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    // Create a hidden link and trigger download
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
export const exportToPDF = (data, fileName, headers, title) => {
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
    doc.text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, doc.internal.pageSize.getWidth() - 15, 10, { align: 'right' });
    // Prepare header and data for table
    const tableHeaders = Object.values(headers);
    const tableData = data.map(item => {
        // Round ALL numeric values to integers
        const roundedItem = { ...item };
        Object.keys(roundedItem).forEach(key => {
            if (typeof roundedItem[key] === 'number') {
                // Round ALL numbers to integers
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
                if (key.includes('price') || key.includes('total') || key.includes('tax') ||
                    key.includes('subtotal') || key.includes('discount') || key.includes('cost') ||
                    key.includes('cgst') || key.includes('sgst')) {
                    return `₹${value}`;
                }
                return value.toString();
            }
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object' && value instanceof Date) {
                return value.toLocaleDateString();
            }
            return value.toString();
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

// Internal helper to normalize order data, similar to normalizeOrder in Orders.tsx
function normalizeOrderInternal(order) {
    return {
        ...order,
        client_name: order.client_name || order.customer_name,
        customer_name: order.customer_name || order.client_name,
        is_salon_consumption: order.is_salon_consumption === true,
        consumption_purpose: order.consumption_purpose,
        services: order.services,
        created_at: order.created_at,
        id: order.id,
        status: order.status || 'pending',
        total: order.total || order.total_amount || 0,
        total_amount: order.total_amount || order.total || 0,
    };
}

// Internal helper to check if an order is for salon consumption
function isSalonConsumptionOrderInternal(normOrder) {
    return !!(
        normOrder.is_salon_consumption === true ||
        normOrder.consumption_purpose ||
        normOrder.client_name === 'Salon Consumption' ||
        (normOrder.services && normOrder.services.some(s => s.for_salon_use === true))
    );
}

// Generates the display Order ID (e.g., sales-0001, salon-0001)
function generateDisplayOrderId(orderToFormat, allOrdersForContext) {
    if (!orderToFormat.id) {
        return 'Unknown';
    }
    const normOrder = normalizeOrderInternal(orderToFormat);
    const isSalon = isSalonConsumptionOrderInternal(normOrder);
    if (!allOrdersForContext || allOrdersForContext.length === 0) {
        return orderToFormat.id;
    }
    const ctx = allOrdersForContext.map(normalizeOrderInternal);
    const sorted = [...ctx].sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
    const idx = sorted.findIndex(o => o.id === normOrder.id);
    if (idx === -1) {
        return orderToFormat.id.substring(0, 8);
    }
    const same = sorted.slice(0, idx + 1).filter(o => isSalonConsumptionOrderInternal(o) === isSalon);
    const formatted = String(same.length).padStart(4, '0');
    return isSalon ? `salon-${formatted}` : `sales-${formatted}`;
}

/**
 * Helper function to format order data specifically for export
 * @param ordersToExport - Array of order objects to be exported
 * @param allOrdersForContext - Full list of orders for generating sequential IDs
 * @returns Formatted array for export
 */
export const formatOrdersForExport = (ordersToExport, allOrdersForContext) => {
    return ordersToExport.map(order => {
        // Generate the display Order ID based on all orders context
        const displayId = generateDisplayOrderId(order, allOrdersForContext);
        // Helper function to safely get and round numbers
        const safeGetNumber = (value) => {
            if (typeof value === 'number') {
                return isNaN(value) ? 0 : Math.round(value);
            }
            if (typeof value === 'string') {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? 0 : Math.round(parsed);
            }
            return 0;
        };

        // Calculate CGST and SGST (9% each from total 18% GST) - rounded
        const totalTax = safeGetNumber(order.tax);
        const cgst = Math.round(totalTax / 2); // 9% CGST
        const sgst = Math.round(totalTax / 2); // 9% SGST
        
        // Format payment information with amounts (rounded)
        let paymentInfo = '';
        if (order.payments && order.payments.length > 0) {
            // For split payments, show each payment method with amount
            paymentInfo = order.payments.map((payment) => {
                const method = payment.payment_method?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
                const amount = safeGetNumber(payment.amount);
                return `${method}: ₹${amount}`;
            }).join(', ');
            
            // Add pending amount if exists
            const pendingAmount = safeGetNumber(order.pending_amount);
            if (pendingAmount > 0) {
                paymentInfo += `, Pending: ₹${pendingAmount}`;
            }
        } else {
            // For single payment, show payment method with total amount
            const method = order.payment_method?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
            const totalAmount = safeGetNumber(order.total || order.total_amount);
            paymentInfo = `${method}: ₹${totalAmount}`;
            
            // Add pending amount if exists
            const pendingAmount = safeGetNumber(order.pending_amount);
            if (pendingAmount > 0) {
                paymentInfo += `, Pending: ₹${pendingAmount}`;
            }
        }
        
        return {
            id: displayId,
            created_at: new Date(order.created_at).toLocaleString(),
            client_name: order.client_name,
            stylist_name: order.stylist_name,
            subtotal: safeGetNumber(order.subtotal),
            cgst: cgst,
            sgst: sgst,
            discount: safeGetNumber(order.discount),
            total: safeGetNumber(order.total),
            payment_details: paymentInfo,
            status: order.status,
            is_walk_in: order.is_walk_in ? 'Walk-in' : 'Appointment',
            services: order.services.map((s) => s.service_name).join(', ')
        };
    });
};
/**
 * Order export header definitions
 */
export const orderExportHeaders = {
    id: 'Order ID',
    created_at: 'Date & Time',
    client_name: 'Customer',
    stylist_name: 'Stylist',
    subtotal: 'Subtotal (₹)',
    cgst: 'CGST 9% (₹)',
    sgst: 'SGST 9% (₹)',
    discount: 'Discount (₹)',
    total: 'Total (₹)',
    payment_details: 'Payment Details',
    status: 'Status',
    is_walk_in: 'Type',
    services: 'Services'
};
