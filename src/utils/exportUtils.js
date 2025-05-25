import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './format';
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
    // Create header row
    const headerRow = Object.values(headers).join(',');
    // Create data rows
    const rows = data.map(item => {
        return Object.keys(headers)
            .map(key => {
            const value = item[key];
            // Handle special formatting
            if (typeof value === 'number') {
                return value.toString();
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
        return Object.keys(headers).map(key => {
            const value = item[key];
            // Format based on data type
            if (typeof value === 'number') {
                // Check if it might be a currency value by key name
                if (key.includes('price') || key.includes('total') || key.includes('tax') ||
                    key.includes('subtotal') || key.includes('discount') || key.includes('cost') ||
                    key.includes('cgst') || key.includes('sgst')) {
                    return formatCurrency(value);
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
/**
 * Helper function to format order data specifically for export
 * @param orders - Array of order objects
 * @returns Formatted array for export
 */
export const formatOrdersForExport = (orders) => {
    return orders.map(order => {
        // Calculate CGST and SGST (9% each from total 18% GST)
        const totalTax = order.tax || 0;
        const cgst = totalTax / 2; // 9% CGST
        const sgst = totalTax / 2; // 9% SGST
        
        // Format payment information with amounts
        let paymentInfo = '';
        if (order.payments && order.payments.length > 0) {
            // For split payments, show each payment method with amount
            paymentInfo = order.payments.map((payment) => {
                const method = payment.payment_method?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
                const amount = payment.amount || 0;
                return `${method}: ₹${amount}`;
            }).join(', ');
            
            // Add pending amount if exists
            if (order.pending_amount && order.pending_amount > 0) {
                paymentInfo += `, Pending: ₹${order.pending_amount}`;
            }
        } else {
            // For single payment, show payment method with total amount
            const method = order.payment_method?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Unknown';
            const totalAmount = order.total || order.total_amount || 0;
            paymentInfo = `${method}: ₹${totalAmount}`;
            
            // Add pending amount if exists
            if (order.pending_amount && order.pending_amount > 0) {
                paymentInfo += `, Pending: ₹${order.pending_amount}`;
            }
        }
        
        return {
            id: order.id,
            created_at: new Date(order.created_at).toLocaleString(),
            client_name: order.client_name,
            stylist_name: order.stylist_name,
            subtotal: order.subtotal,
            cgst: cgst,
            sgst: sgst,
            discount: order.discount,
            total: order.total,
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
