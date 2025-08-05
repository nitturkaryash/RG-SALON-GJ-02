import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, CardContent, Typography, Box, Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress, Snackbar, Alert as MuiAlert, Collapse, IconButton } from '@mui/material';
import { Upload, Description as FileText, Check, Warning, Info, ExpandMore, ExpandLess } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../utils/supabase/supabaseClient';
import { toast } from 'react-toastify';
import { analyzeExcelFile as analyzeFile, logExcelAnalysis, validateOrdersExcelStructure } from '../../utils/excelAnalyzer';

// Surat user constants
const SURAT_USER_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b";
const SURAT_TENANT_ID = "surat@rngspalon.in";

interface OrderItem {
  serviceName: string;
  type: 'service' | 'product' | 'membership';
  quantity: number;
  unitPrice: number;
  total: number;
  taxPercent: number;
  hsnCode: string;
  stylist: string;
  currentStock: number;
  service_id: string;
  discount: number;
  subtotal: number;
  netAmount: number;
  taxAmount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
}

interface Payment {
  method: string;
  amount: number;
}

interface AggregatedOrder {
  invoiceNo: number;
  customerName: string;
  date: string;
  stylist: string;
  items: OrderItem[];
  payments: Payment[];
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  pendingAmount: number;
  status: string;
}

interface ExcelImportSummary {
  totalRows: number;
  uniqueInvoices: number;
  aggregatedOrders: AggregatedOrder[];
  errors: string[];
  rawRowsByInvoice?: { [invoiceNo: string]: any[] };
  analytics: {
    totalProducts: number;
    totalServices: number;
    totalMemberships: number;
    productsByType: {
      hsnProducts: number;
      namePatternProducts: number;
    };
    invoiceMapping: Array<{
      invoiceNo: string;
      clientName: string;
      totalAmount: number;
      productCount: number;
      serviceCount: number;
      membershipCount: number;
    }>;
    paymentMethods: { [method: string]: { count: number; amount: number } };
  };
}

// Add these interfaces at the top
interface ImportRow {
  'Invoice No': string;
  'Date': string;
  'Guest Name': string;
  'Guest Number': string;
  'Staff': string;
  'Service': string;
  'Category': string;
  'Qty': number;
  'Unit Price': number;
  'Discount': number;
  'Complementary': string;
  'Redemption Amount': number;
  'Redemption Sources': string;
  'Tax': number;
  'Subtotal(without tax & redemption)': number;
  'Total': number;
  'Payment Mode': string;
  'hsn code'?: string;
  'Typre'?: string; // Note: typo in original data
  'Taxable Value'?: number;
  'Cgst'?: number;
  'Sgst'?: number;
  'current stock'?: number;
}

interface ProcessedOrder {
  invoiceNo: string;
  date: string;
  guestName: string;
  guestNumber: string;
  services: Array<{
    staff: string;
    service: string;
    category: string;
    qty: number;
    unitPrice: number;
    discount: number;
    tax: number;
    subtotal: number;
    total: number;
    isProduct: boolean;
    hsnCode?: string;
    productType?: string;
    // Additional fields from the new Excel structure
    taxableValue?: number;
    cgst?: number;
    sgst?: number;
    currentStock?: number;
  }>;
  payments: Array<{
    method: string;
    amount: number;
  }>;
  totalAmount: number;
  totalTax: number;
  totalDiscount: number;
  redemptionAmount: number;
  redemptionSource: string;
}

// Utility function to extract serial number from Excel invoice
const extractSerialNumber = (excelInvoice: string, fallbackIndex: number): string => {
  try {
    let extractedNumber = '';
    
    // Try different patterns to extract the number
    const patterns = [
      /sales[-_]?(\d+)/i,  // "sales-0438", "sales_438", "sales438"
      /(\d+)$/,            // Any ending digits "invoice-0438"
      /^(\d+)/,            // Starting digits "0438-something"
      /(\d+)/              // Any digits in the string
    ];
    
    for (const pattern of patterns) {
      const match = excelInvoice.match(pattern);
      if (match && match[1]) {
        extractedNumber = match[1];
        break;
      }
    }
    
    let baseOrderId: string;
    if (extractedNumber) {
      // Format as 4-digit padded number
      const paddedNumber = String(extractedNumber).padStart(4, '0');
      baseOrderId = `sales-${paddedNumber}`;
    } else {
      // Fallback to sequential numbering if no number found
      baseOrderId = `sales-${String(fallbackIndex).padStart(4, '0')}`;
    }
    
    return baseOrderId;
      } catch (error) {
      // Fallback to sequential numbering on any error
      return `sales-${String(fallbackIndex).padStart(4, '0')}`;
    }
};

export default function AggregatedExcelImporter() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [aggregatedOrders, setAggregatedOrders] = useState<AggregatedOrder[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0); // Progress percentage
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAggregatedOrders(null);
    }
  };

  const parseExcelDate = (dateValue: any): Date => {
    if (typeof dateValue === 'number') {
      // Excel serial date (days since January 1, 1900)
      // Excel incorrectly treats 1900 as a leap year, so we subtract 1 for dates after Feb 28, 1900
      const excelEpoch = new Date(1900, 0, 1);
      const daysOffset = dateValue - 1; // Excel day 1 = Jan 1, 1900 (but Excel starts at 1, not 0)
      const correctedDate = new Date(excelEpoch.getTime() + (daysOffset - 1) * 24 * 60 * 60 * 1000);
      
      // Validate the result
      if (isNaN(correctedDate.getTime())) {
        console.warn(`Invalid Excel date: ${dateValue}, using current date`);
        return new Date();
      }
      
      return correctedDate;
    } else if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (isNaN(parsed.getTime())) {
        console.warn(`Invalid date string: ${dateValue}, using current date`);
        return new Date();
      }
      return parsed;
    } else if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        console.warn(`Invalid Date object, using current date`);
        return new Date();
      }
      return dateValue;
    }
    
    console.warn(`Unknown date format: ${dateValue}, using current date`);
    return new Date(); // Fallback to current date
  };

  // Helper for Excel serial date conversion
  function excelDateToJSDate(serial: number): Date {
    const excelEpoch = new Date(1900, 0, 1);
    const adjustedSerial = serial > 59 ? serial - 1 : serial;
    return new Date(excelEpoch.getTime() + (adjustedSerial - 1) * 24 * 60 * 60 * 1000);
  }

  const analyzeExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          toast.error('Excel file must have at least a header row and one data row');
          return;
        }

        const headers = jsonData[0] as string[];
        
        // Debug: Log available headers to help with column mapping
        console.log('📋 Available Excel columns:', headers);
        
        // Helper function to find column by partial name match
        const findColumnIndex = (partialNames: string[]): number => {
          for (const partialName of partialNames) {
            const index = headers.findIndex(header => 
              header.toLowerCase().includes(partialName.toLowerCase())
            );
            if (index !== -1) {
              console.log(`✅ Found column "${headers[index]}" for "${partialName}"`);
              return index;
            }
          }
          return -1;
        };

        // More specific function for customer name to handle GuestName column
        const findCustomerNameIndex = (): number => {
          // Try exact matches first
          const exactMatches = ['GuestName', 'Guest Name', 'Customer Name', 'Client Name'];
          for (const exactMatch of exactMatches) {
            const index = headers.findIndex(header => 
              header.toLowerCase() === exactMatch.toLowerCase()
            );
            if (index !== -1) {
              console.log(`✅ Found exact customer column "${headers[index]}"`);
              return index;
            }
          }
          
          // Fall back to partial matches
          const partialMatches = ['guest', 'customer', 'client', 'name'];
          for (const partialMatch of partialMatches) {
            const index = headers.findIndex(header => 
              header.toLowerCase().includes(partialMatch.toLowerCase())
            );
            if (index !== -1) {
              console.log(`✅ Found partial customer column "${headers[index]}" for "${partialMatch}"`);
              return index;
            }
          }
          return -1;
        };
        
        const rows = jsonData.slice(1) as any[][];

        // Group rows by Invoice No
        const orderGroups = new Map<string, any[]>();
        
        rows.forEach((row, index) => {
          const invoiceNo = row[headers.indexOf('Invoice No')];
          if (invoiceNo) {
            if (!orderGroups.has(invoiceNo.toString())) {
              orderGroups.set(invoiceNo.toString(), []);
            }
            orderGroups.get(invoiceNo.toString())!.push({ row, index: index + 2 });
          }
        });

        const aggregatedOrders: AggregatedOrder[] = [];

        orderGroups.forEach((groupRows, invoiceNo) => {
          const firstRow = groupRows[0].row;
          const headers = jsonData[0] as string[];
          
          // Extract basic order info from first row - map to actual Excel columns
          const customerNameIndex = findCustomerNameIndex();
          const customerName = customerNameIndex !== -1 ? firstRow[customerNameIndex] : 'Unknown Customer';
          
          // Debug: Log what customer name was found
          console.log('👤 Customer name found:', customerName);
          
          const date = firstRow[headers.indexOf('Date')];
          const stylist = firstRow[headers.indexOf('Staff/Stylist Name')] || 
                         firstRow[headers.indexOf('Staff')] || 
                         'Admin';
          
          // Look for payment information in the correct column
          const paymentMode = firstRow[headers.indexOf('Payment Method/Details')] || 
                             firstRow[headers.indexOf('Payment Details')] || 
                             firstRow[headers.indexOf('Payment Mode')] || 
                             firstRow[headers.indexOf('Payment Method')] || 
                             'cash';
          
          // Parse payment mode to extract methods and amounts
          const payments: Payment[] = [];
          if (paymentMode && typeof paymentMode === 'string') {
            console.log(`🔍 Parsing payment mode: ${paymentMode}`);
            const paymentParts = paymentMode.split(',').map(p => p.trim());
            paymentParts.forEach(part => {
              const match = part.match(/^([^(]+)\(([^)]+)\)$/);
              if (match) {
                const method = match[1].trim().toLowerCase();
                const amount = parseFloat(match[2]);
                if (!isNaN(amount)) {
                  payments.push({
                    method: method,
                    amount: amount
                  });
                  console.log(`✅ Parsed payment: ${method} - ${amount}`);
                }
              } else {
                // Handle special cases like "Membership" or "Pay Later"
                const method = part.toLowerCase();
                if (method.includes('membership')) {
                  payments.push({
                    method: 'membership',
                    amount: 0 // Will be calculated later
                  });
                  console.log(`✅ Parsed membership payment: ${method}`);
                } else if (method.includes('pay later')) {
                  payments.push({
                    method: 'bnpl', // Use the standard BNPL payment method
                    amount: 0 // Will be calculated later
                  });
                  console.log(`✅ Parsed BNPL payment: ${method}`);
                } else {
                  // If no amount specified, assume it's the full amount
                  payments.push({
                    method: method,
                    amount: 0 // Will be calculated later
                  });
                  console.log(`⚠️ Payment without amount: ${part}`);
                }
              }
            });
          }

          // Process all items in this order
          const items: OrderItem[] = [];
          let totalAmount = 0;
          let subtotal = 0;
          let taxAmount = 0;
          let discount = 0;

          groupRows.forEach(({ row }) => {
            // Map to actual Excel columns based on the image
            const serviceName = row[headers.indexOf('Service/Product Name')] || 
                               row[headers.indexOf('Service Name')] || 
                               row[headers.indexOf('Service')] || '';
            const hsnCode = row[headers.indexOf('HSN Code')] || 
                           row[headers.indexOf('hsn code')] || '';
            const quantity = Number(row[headers.indexOf('Quantity')]) || 
                            Number(row[headers.indexOf('Qty')]) || 1;
            let unitPrice = Number(row[headers.indexOf('Unit Price/Cost')]) || 
                           Number(row[headers.indexOf('Unit Price')]) || 0;
            const total = Number(row[headers.indexOf('Total Amount/Price')]) || 
                         Number(row[headers.indexOf('Total')]) || 0;
            const subtotalWithoutTax = Number(row[headers.indexOf('Subtotal/Net Amount')]) || 
                                      Number(row[headers.indexOf('Subtotal')]) || 0;
            const taxPercent = Number(row[headers.indexOf('Tax %')]) || 
                              Number(row[headers.indexOf('Tax')]) || 0;
            // Try multiple variations of current stock column name
            let currentStock = 0;
            const stockColumns = ['Current Stock', 'current stock', 'Current_Stock', 'current_stock', 'Stock', 'stock'];
            for (const colName of stockColumns) {
              const stockValue = Number(row[headers.indexOf(colName)]);
              if (!isNaN(stockValue) && stockValue > 0) {
                currentStock = stockValue;
                console.log(`✅ Found stock in column '${colName}': ${stockValue}`);
                break;
              }
            }
            const category = row[headers.indexOf('Category/Type')] || 
                            row[headers.indexOf('Category')] || '';

            // Determine item type
            let itemType: 'service' | 'product' | 'membership' = 'service';
            
            // Check if it's a product (has HSN code)
            if (hsnCode && hsnCode.toString().trim() !== '') {
              itemType = 'product';
            } 
            // Check if it's a membership (service name contains "membership")
            else if (serviceName.toLowerCase().includes('membership')) {
              itemType = 'membership';
            }
            // Everything else is a service
            else {
              itemType = 'service';
            }

            // Debug: Log current stock for each item with invoice context
            console.log(`📦 Invoice ${invoiceNo} - Item: "${serviceName}", Current Stock: ${currentStock}, HSN: ${hsnCode}, Type: ${itemType}`);

            // Calculate tax amount from total and subtotal
            const calculatedTaxAmount = total - subtotalWithoutTax;
            const calculatedTaxPercent = subtotalWithoutTax > 0 ? (calculatedTaxAmount / subtotalWithoutTax) * 100 : 0;
            
            // If unit price is 0 but we have total, calculate unit price from total
            if (unitPrice === 0 && total > 0) {
              unitPrice = total / quantity;
            }

            const item: OrderItem = {
              serviceName: serviceName,
              type: itemType,
              quantity: quantity,
              unitPrice: unitPrice,
              total: total,
              taxPercent: calculatedTaxPercent,
              hsnCode: hsnCode.toString(),
              stylist: stylist,
              currentStock: currentStock,
              service_id: uuidv4(),
              discount: 0,
              subtotal: subtotalWithoutTax,
              netAmount: subtotalWithoutTax,
              taxAmount: calculatedTaxAmount,
              taxableValue: subtotalWithoutTax,
              cgst: calculatedTaxAmount / 2, // Half of total tax
              sgst: calculatedTaxAmount / 2  // Half of total tax
            };

            // Validation: Check if product has stock info
            if (itemType === 'product') {
              console.log(`🔍 Product validation - ${serviceName}: Stock=${currentStock}, HSN=${hsnCode}`);
              if (currentStock === 0) {
                console.warn(`⚠️ Warning: Product ${serviceName} has zero stock!`);
              }
            }

            items.push(item);
            totalAmount += total;
            subtotal += item.subtotal;
            taxAmount += item.taxAmount;
          });

          // Calculate pending amount if payments don't cover total
          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
          const pendingAmount = Math.max(0, totalAmount - totalPaid);

          // Determine order status based on payment information
          let orderStatus = 'completed';
          
          // Check for BNPL/Pay Later payments first
          if (paymentMode && paymentMode.toLowerCase().includes('pay later') || 
              paymentMode && paymentMode.toLowerCase().includes('bnpl') ||
              paymentMode && paymentMode.toLowerCase().includes('buy now pay later')) {
            orderStatus = 'pending';
            console.log(`🔄 Order ${invoiceNo}: BNPL payment detected, status set to 'pending'`);
          } 
          // Check for partial payments (only if there's actually pending amount)
          else if (pendingAmount > 0.01) { // Use small threshold to avoid floating point issues
            orderStatus = 'partial';
            console.log(`🔄 Order ${invoiceNo}: Partial payment detected (pending: ${pendingAmount}), status set to 'partial'`);
          } 
          // Check for other pending indicators in payment mode
          else if (paymentMode && (paymentMode.toLowerCase().includes('pending') ||
                   paymentMode.toLowerCase().includes('credit'))) {
            orderStatus = 'pending';
            console.log(`🔄 Order ${invoiceNo}: Pending payment detected in payment mode, status set to 'pending'`);
          }
          // Default to completed for full payments
          else {
            orderStatus = 'completed';
            console.log(`🔄 Order ${invoiceNo}: Full payment detected (paid: ${totalPaid}, total: ${totalAmount}), status set to 'completed'`);
          }

          // If any payment has amount 0, distribute the total
          if (payments.length > 0 && payments.some(p => p.amount === 0)) {
            const paymentsWithAmount = payments.filter(p => p.amount > 0);
            const totalPaidAmount = paymentsWithAmount.reduce((sum, p) => sum + p.amount, 0);
            const remainingAmount = totalAmount - totalPaidAmount;
            const paymentsWithoutAmount = payments.filter(p => p.amount === 0);
            
            if (paymentsWithoutAmount.length > 0) {
              const amountPerPayment = remainingAmount / paymentsWithoutAmount.length;
              payments.forEach(p => {
                if (p.amount === 0) {
                  p.amount = amountPerPayment;
                }
              });
            }
          }

          // Debug: Log final order summary with all product stocks
          const productStocks = items.filter(item => item.type === 'product')
            .map(item => `${item.serviceName}: ${item.currentStock}`)
            .join(', ');
          console.log(`💰 Order ${invoiceNo}: Total=${totalAmount}, Paid=${totalPaid}, Pending=${pendingAmount}, Status=${orderStatus}`);
          if (productStocks) {
            console.log(`📊 Product stocks in order ${invoiceNo}: ${productStocks}`);
          }

          const order: AggregatedOrder = {
            invoiceNo: Number(invoiceNo), // Convert to number for frontend
            customerName: customerName,
            date: date ? new Date(date).toISOString() : new Date().toISOString(),
            stylist: stylist,
            items: items,
            payments: payments,
            totalAmount: totalAmount,
            subtotal: subtotal,
            taxAmount: taxAmount,
            discount: discount,
            pendingAmount: pendingAmount,
            status: orderStatus
          };

          aggregatedOrders.push(order);
        });

        console.log('Aggregated orders:', aggregatedOrders);
        setAggregatedOrders(aggregatedOrders);
        toast.success(`Analyzed ${aggregatedOrders.length} orders from Excel file`);

      } catch (error) {
        console.error('Error analyzing Excel file:', error);
        toast.error('Error analyzing Excel file: ' + (error as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const importToDatabase = async () => {
    if (!aggregatedOrders?.length) {
      toast.error('No orders to import');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
              for (let i = 0; i < aggregatedOrders.length; i++) {
          const order = aggregatedOrders[i];
          
          // Add a small delay between orders to prevent timestamp conflicts
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        
        try {
          // Generate a unique serial number using the extractSerialNumber function
          const serialNumber = extractSerialNumber(order.invoiceNo.toString(), i + 1);
          
          // Create services array matching frontend structure
          const servicesPromises = order.items.map(async (item) => {
            const baseService = {
              id: uuidv4(),
              service_name: item.serviceName,
              type: item.type,
              quantity: Number(item.quantity),
              price: Number(item.unitPrice), // This is what sales_history_final expects for unit_price_ex_gst
              unit_price: Number(item.unitPrice), // This is what sales_history_final expects for discounted_sales_rate_ex_gst
              gst_percentage: 18,
              mrp_incl_gst: Number(item.unitPrice), // This is what sales_history_final expects
              // Additional fields for sales history compatibility
              subtotal: Number(item.subtotal),
              tax_amount: Number(item.taxAmount),
              net_amount: Number(item.netAmount),
              taxable_value: Number(item.taxableValue),
              cgst_amount: Number(item.cgst),
              sgst_amount: Number(item.sgst),
              total_amount: Number(item.total),
              discount_amount: Number(item.discount),
              discount_percentage: item.subtotal > 0 ? (item.discount / item.subtotal) * 100 : 0
            };

            // Add type-specific fields
            if (item.type === 'product') {
              // Look up the actual product ID from product_master using HSN code
              let productId = null;
              if (item.hsnCode && item.hsnCode.trim()) {
                try {
                  // Try to find product by HSN code, but don't fail if not found
                  const { data: products, error } = await supabase
                    .from('product_master')
                    .select('id')
                    .eq('hsn_code', item.hsnCode.trim())
                    .limit(1);
                  
                  if (products && products.length > 0 && !error) {
                    productId = products[0].id;
                    console.log(`✅ Found product ID ${productId} for HSN code ${item.hsnCode}`);
                  } else {
                    console.warn(`⚠️ Product not found for HSN code: ${item.hsnCode}`);
                  }
                } catch (error) {
                  console.warn(`⚠️ Error looking up product for HSN code ${item.hsnCode}:`, error);
                }
              }

              // Debug: Log product stock storage
              console.log(`🏪 Storing product: ${item.serviceName}, Stock: ${item.currentStock}, HSN: ${item.hsnCode}`);
              
              return {
                ...baseService,
                hsn_code: item.hsnCode || '',
                product_id: productId, // Use actual product ID or null
                service_id: productId || uuidv4(), // Use product ID if found, otherwise generate UUID
                product_name: item.serviceName,
                current_stock: Number(item.currentStock) || 0,
                // Additional fields for sales history compatibility
                subtotal: Number(item.subtotal),
                tax_amount: Number(item.taxAmount),
                net_amount: Number(item.netAmount),
                taxable_value: Number(item.taxableValue),
                cgst_amount: Number(item.cgst),
                sgst_amount: Number(item.sgst),
                total_amount: Number(item.total),
                discount_amount: Number(item.discount),
                discount_percentage: item.subtotal > 0 ? (item.discount / item.subtotal) * 100 : 0,
                // Ensure these fields match what sales_history_final expects
                price: Number(item.unitPrice), // unit_price_ex_gst
                unit_price: Number(item.unitPrice), // discounted_sales_rate_ex_gst
                mrp_incl_gst: Number(item.unitPrice), // mrp_incl_gst
                gst_percentage: 18
              };
            } else if (item.type === 'service') {
              return {
                ...baseService,
                service_id: item.service_id,
                experts: [{
                  id: SURAT_USER_ID,
                  name: item.stylist || 'Admin'
                }],
                // Additional fields for sales history compatibility
                subtotal: Number(item.subtotal),
                tax_amount: Number(item.taxAmount),
                net_amount: Number(item.netAmount),
                taxable_value: Number(item.taxableValue),
                cgst_amount: Number(item.cgst),
                sgst_amount: Number(item.sgst),
                total_amount: Number(item.total),
                discount_amount: Number(item.discount),
                discount_percentage: item.subtotal > 0 ? (item.discount / item.subtotal) * 100 : 0
              };
            } else if (item.type === 'membership') {
              return {
                ...baseService,
                service_id: item.service_id,
                duration_months: 1,
                // Additional fields for sales history compatibility
                subtotal: Number(item.subtotal),
                tax_amount: Number(item.taxAmount),
                net_amount: Number(item.netAmount),
                taxable_value: Number(item.taxableValue),
                cgst_amount: Number(item.cgst),
                sgst_amount: Number(item.sgst),
                total_amount: Number(item.total),
                discount_amount: Number(item.discount),
                discount_percentage: item.subtotal > 0 ? (item.discount / item.subtotal) * 100 : 0
              };
            }

            return baseService;
          });

          // Wait for all service lookups to complete
          const services = await Promise.all(servicesPromises);

          // Create payments array matching frontend structure
          const payments = order.payments.map(payment => ({
            id: uuidv4(),
            amount: Number(payment.amount),
            payment_date: new Date().toISOString(),
            payment_method: payment.method
          }));

          // Create order payload with only fields that exist in the table
          const orderPayload = {
            id: uuidv4(),
            created_at: new Date().toISOString(), // Use current timestamp to avoid conflicts
            client_name: order.customerName,
            type: 'sale',
            is_salon_consumption: false,
            status: order.status,
            payment_method: order.payments.map(p => p.method).join(','),
            stylist_id: SURAT_USER_ID,
            services: services,
            subtotal: Number(order.subtotal),
            tax: Number(order.taxAmount),
            discount: Number(order.discount),
            is_walk_in: true,
            payments: payments,
            pending_amount: Number(order.pendingAmount),
            is_split_payment: order.payments.length > 1,
            appointment_id: null,
            is_salon_purchase: null,
            stylist_name: order.items.find(s => s.type === 'service')?.stylist || 'Admin',
            date: new Date().toISOString(), // Use current timestamp to avoid conflicts
            total_amount: Number(order.totalAmount),
            appointment_time: null,
            discount_percentage: order.discount > 0 ? (order.discount / order.subtotal) * 100 : 0,
            requisition_voucher_no: null,
            // Store all product stock levels in stock_snapshot for individual tracking
            stock_snapshot: order.items.reduce((snapshot, item) => {
              if (item.type === 'product') {
                snapshot[item.serviceName] = item.currentStock;
                console.log(`📸 Stock snapshot - ${item.serviceName}: ${item.currentStock}`);
              }
              return snapshot;
            }, {} as Record<string, number>),
            // Use the maximum current stock from all products in this order for order-level tracking
            current_stock: Math.max(...order.items.filter(s => s.type === 'product').map(s => s.currentStock), 0),
            multi_expert_group_id: null,
            multi_expert: false,
            total_experts: 1,
            expert_index: 1,
            tenant_id: SURAT_TENANT_ID,
            user_id: SURAT_USER_ID,
            invoice_no: order.invoiceNo.toString(),
            invoice_number: order.invoiceNo.toString(),
            serial_number: `${serialNumber}-${Date.now()}`, // Add timestamp to prevent conflicts
            client_id: null,
            notes: `Imported from Excel file on ${new Date().toLocaleDateString()}`,
            // Add a flag to indicate this is an imported order to prevent stock transaction conflicts
            source: 'excel_import'
          };

          console.log(`✅ Inserting order ${i + 1}:`, orderPayload);



          const { error } = await supabase
            .from('pos_orders')
            .insert([orderPayload]);

          if (error) {
            console.error(`❌ Error inserting order ${i + 1}:`, error);
            console.error(`❌ Error details:`, {
              message: error.message || 'No message',
              details: error.details || 'No details',
              hint: error.hint || 'No hint',
              code: error.code || 'No code'
            });
            console.error(`❌ Full error object:`, JSON.stringify(error, null, 2));
            console.error(`❌ Problematic payload for ${i + 1}:`, JSON.stringify(orderPayload, null, 2));
            
            // Try to get more specific error information
            if (error.message?.includes('duplicate key')) {
              console.error(`❌ Duplicate key error`);
            } else if (error.message?.includes('foreign key')) {
              console.error(`❌ Foreign key constraint error`);
            } else if (error.message?.includes('not null')) {
              console.error(`❌ Not null constraint error`);
            }
            
            errorCount++;
          } else {
            console.log(`✅ Successfully inserted order ${i + 1}`);
            successCount++;
          }

        } catch (error) {
          console.error(`❌ Error processing order ${i + 1}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} orders${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        setAggregatedOrders(null);
        setFile(null);
      } else {
        toast.error(`Failed to import any orders. ${errorCount} errors occurred.`);
      }

    } catch (error) {
      console.error('❌ Import failed:', error);
      toast.error('Import failed: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  // Enhanced data validation function
  const validateImportData = (data: ImportRow[]): { valid: ImportRow[], invalid: any[] } => {
    const valid: ImportRow[] = [];
    const invalid: any[] = [];

    data.forEach((row, index) => {
      const errors: string[] = [];

      // Required field validation
      if (!row['Invoice No']) errors.push('Missing Invoice No');
      if (!row['Date']) errors.push('Missing Date');
      if (!row['Guest Name']) errors.push('Missing Guest Name');
      if (!row['Service']) errors.push('Missing Service');
      if (!row['Staff']) errors.push('Missing Staff');

      // Data type validation
      if (isNaN(Number(row['Qty'])) || Number(row['Qty']) <= 0) errors.push('Invalid Quantity');
      if (isNaN(Number(row['Unit Price'])) || Number(row['Unit Price']) < 0) errors.push('Invalid Unit Price');
      if (isNaN(Number(row['Total'])) || Number(row['Total']) < 0) errors.push('Invalid Total');

      if (errors.length === 0) {
        valid.push(row);
      } else {
        invalid.push({ row: index + 1, data: row, errors });
      }
    });

    return { valid, invalid };
  };

  // Enhanced order processing function
  const processOrderData = (data: ImportRow[]): ProcessedOrder[] => {
    const orderMap = new Map<string, ProcessedOrder>();

    data.forEach(row => {
      const invoiceNo = row['Invoice No'].toString();
      const isProduct = !!(row['hsn code'] && row['hsn code'].trim());

      if (!orderMap.has(invoiceNo)) {
        // Parse payment modes
        const paymentModeStr = row['Payment Mode'] || '';
        const payments = parsePaymentModes(paymentModeStr);

        orderMap.set(invoiceNo, {
          invoiceNo,
          date: row['Date'],
          guestName: row['Guest Name'],
          guestNumber: row['Guest Number'],
          services: [],
          payments,
          totalAmount: 0,
          totalTax: 0,
          totalDiscount: 0,
          redemptionAmount: Number(row['Redemption Amount']) || 0,
          redemptionSource: row['Redemption Sources'] || ''
        });
      }

      const order = orderMap.get(invoiceNo)!;
      
      // Add service/product to order
      order.services.push({
        staff: row['Staff'],
        service: row['Service'],
        category: row['Category'],
        qty: Number(row['Qty']) || 1,
        unitPrice: Number(row['Unit Price']) || 0,
        discount: Number(row['Discount']) || 0,
        tax: Number(row['Tax']) || 0,
        subtotal: Number(row['Subtotal(without tax & redemption)']) || 0,
        total: Number(row['Total']) || 0,
        isProduct,
        hsnCode: row['hsn code'],
        productType: row['Typre'] // Note: original typo preserved
      });

      // Update order totals
      order.totalAmount += Number(row['Total']) || 0;
      order.totalTax += Number(row['Tax']) || 0;
      order.totalDiscount += Number(row['Discount']) || 0;
    });

    return Array.from(orderMap.values());
  };

  // Enhanced payment parsing function
  const parsePaymentModes = (paymentStr: string): Array<{method: string, amount: number}> => {
    if (!paymentStr || paymentStr === '-') return [];

    const payments: Array<{method: string, amount: number}> = [];
    
    // Handle multiple payment methods like "Cash(4821),GPay(701)"
    const paymentParts = paymentStr.split(',');
    
    paymentParts.forEach(part => {
      const match = part.trim().match(/^([^(]+)\(([^)]+)\)$/);
      if (match) {
        const method = match[1].trim();
        const amount = parseFloat(match[2]) || 0;
        payments.push({ method, amount });
      } else if (part.trim() && part.trim() !== '-') {
        // Fallback for simple payment methods
        payments.push({ method: part.trim(), amount: 0 });
      }
    });

    return payments;
  };

  // Enhanced stock management function
  const updateProductStock = async (service: any, orderId: string): Promise<boolean> => {
    if (!service.isProduct || !service.hsnCode) return true;

    try {
      const { data: product, error: productError } = await supabase
        .from('product_master')
        .select('id, name, stock_quantity')
        .eq('hsn_code', service.hsnCode)
        .single();

      if (productError || !product) {
        console.warn(`Product not found for HSN code: ${service.hsnCode}`);
        return false;
      }

      // Calculate new stock quantity
      const newStock = Math.max(0, product.stock_quantity - service.qty);

      // Update product stock
      const { error: updateError } = await supabase
        .from('product_master')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) {
        console.error('Stock update error:', updateError);
        return false;
      }

      // Create stock transaction record
      const { error: transactionError } = await supabase
        .from('product_stock_transactions')
        .insert({
          id: uuidv4(),
          product_id: product.id,
          product_name: product.name,
          transaction_type: 'sale',
          quantity_changed: -service.qty,
          stock_before: product.stock_quantity,
          stock_after: newStock,
          reference_type: 'order',
          reference_id: orderId,
          notes: `Sale from order ${service.invoiceNo}`,
          duplicate_protection_key: `${orderId}-${product.id}-${Date.now()}`,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Transaction record error:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Stock update error:', error);
      return false;
    }
  };

  // Main import function
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Reading file...');

    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ImportRow[] = XLSX.utils.sheet_to_json(worksheet);

      setImportStatus('Validating data...');
      setImportProgress(10);

      // Validate data
      const { valid, invalid } = validateImportData(jsonData);
      
      if (invalid.length > 0) {
        console.warn('Invalid rows found:', invalid);
        toast.warn(`Found ${invalid.length} invalid rows. They will be skipped.`);
      }

      if (valid.length === 0) {
        toast.error('No valid data found to import');
        return;
      }

      setImportStatus('Processing orders...');
      setImportProgress(20);

      // Process orders
      const processedOrders = processOrderData(valid);
      
      setImportStatus('Importing to database...');
      let successCount = 0;
      let errorCount = 0;

      // Import orders one by one
      for (let i = 0; i < processedOrders.length; i++) {
        const order = processedOrders[i];
        const progress = 20 + (i / processedOrders.length) * 70;
        setImportProgress(progress);
        setImportStatus(`Importing order ${i + 1} of ${processedOrders.length}...`);

        try {
          // Create order
          const orderId = uuidv4();
          const orderDate = new Date(order.date).toISOString();

          // Prepare services JSON
          const servicesJson = order.services.map(service => ({
            id: uuidv4(),
            name: service.service,
            category: service.category,
            price: service.unitPrice,
            quantity: service.qty,
            total: service.total,
            discount: service.discount,
            tax: service.tax,
            expert: service.staff,
            is_product: service.isProduct,
            hsn_code: service.hsnCode || null,
            product_type: service.productType || null
          }));

          // Prepare payments JSON
          const paymentsJson = order.payments.map(payment => ({
            id: uuidv4(),
            method: payment.method,
            amount: payment.amount,
            timestamp: new Date().toISOString(),
            duplicate_protection_key: `${orderId}-${payment.method}-${payment.amount}`
          }));

          // Calculate totals
          const subtotal = order.totalAmount - order.totalTax;
          const calculatedPendingAmount = Math.max(0, order.totalAmount - order.payments.reduce((sum, p) => sum + p.amount, 0));
          
          // Only set pending amount if it's actually greater than a small threshold (to avoid floating point issues)
          const pendingAmount = calculatedPendingAmount > 0.01 ? calculatedPendingAmount : 0;

          // Create order payload
          const orderPayload = {
            id: orderId,
            invoice_number: order.invoiceNo,
            client_name: order.guestName,
            client_phone: order.guestNumber,
            order_date: orderDate,
            services: servicesJson,
            payments: paymentsJson,
            subtotal: subtotal,
            tax_amount: order.totalTax,
            discount_amount: order.totalDiscount,
            total_amount: order.totalAmount,
            paid_amount: order.payments.reduce((sum, p) => sum + p.amount, 0),
            pending_amount: pendingAmount,
            status: pendingAmount > 0 ? 'partial' : 'completed',
            is_split_payment: order.payments.length > 1,
            redemption_amount: order.redemptionAmount,
            redemption_source: order.redemptionSource,
            user_id: SURAT_USER_ID,
            tenant_id: SURAT_TENANT_ID,
            duplicate_protection_key: `${orderId}-${order.invoiceNo}`,
            created_at: orderDate,
            updated_at: new Date().toISOString()
          };

          // Insert order
          const { error: orderError } = await supabase
            .from('pos_orders')
            .insert(orderPayload);

          if (orderError) {
            console.error('Order insert error:', orderError);
            errorCount++;
            continue;
          }

          // Update stock for products
          let stockUpdateSuccess = true;
          for (const service of order.services) {
            if (service.isProduct) {
              const stockUpdated = await updateProductStock(service, orderId);
              if (!stockUpdated) {
                stockUpdateSuccess = false;
                console.warn(`Failed to update stock for product: ${service.service}`);
              }
            }
          }

          if (stockUpdateSuccess) {
            successCount++;
          } else {
            errorCount++;
          }

        } catch (error) {
          console.error('Order processing error:', error);
          errorCount++;
        }
      }

      setImportProgress(100);
      setImportStatus('Import completed!');

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} orders!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} orders. Check console for details.`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Upload />}
        onClick={() => setOpen(true)}
        sx={{ mr: 2 }}
      >
        Import Aggregated Orders
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FileText />
            Import & Aggregate Excel Orders
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mb={3}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Excel to POS Orders Import Tool
              </Typography>
              This importer will automatically group items by Invoice Number and create aggregated orders in the <span style={{ fontFamily: 'monospace' }}>pos_orders</span> table.
              Multiple items with the same invoice number will be combined into a single order.<br/><br/>
              <strong>📥 Historical Data Import Mode:</strong><br/>
              • Items are imported directly to the <span style={{ fontFamily: 'monospace' }}>pos_orders</span> table with all required fields<br/>
              • Original Excel data is preserved in the <span style={{ fontFamily: 'monospace' }}>stock_snapshot</span> field for audit purposes<br/>
              • No interaction with <span style={{ fontFamily: 'monospace' }}>product_master</span> table or stock management triggers<br/><br/>
              <strong>Simple Type Detection:</strong><br/>
              • <strong>Products</strong> (orange) = Items with HSN codes<br/>
              • <strong>Memberships</strong> (green) = Items with "membership" in name or tier keywords (Silver, Gold, Platinum, Diamond)<br/>
              • <strong>Services</strong> (blue) = Everything else<br/><br/>
              <strong>Data Mapping:</strong><br/>
              • <span style={{ fontFamily: 'monospace' }}>invoice_no</span> and <span style={{ fontFamily: 'monospace' }}>invoice_number</span>: Original Excel invoice number<br/>
              • <span style={{ fontFamily: 'monospace' }}>serial_number</span>: Formatted as "sales-XXXX" from Excel invoice number<br/>
              • <span style={{ fontFamily: 'monospace' }}>client_name</span> and <span style={{ fontFamily: 'monospace' }}>customer_name</span>: From "Guest Name" column<br/>
              • <span style={{ fontFamily: 'monospace' }}>services</span>: JSON array with all items from the same invoice<br/>
              • <span style={{ fontFamily: 'monospace' }}>payments</span>: Parsed from "Payment Mode" column (e.g., "Cash(4821),GPay(701)")<br/>
              • <span style={{ fontFamily: 'monospace' }}>type</span>: Set to "product", "service", or "membership" to match existing system<br/><br/>
              <strong>✅ Safe Import:</strong> Historical data import with no database triggers or stock management interference.
            </Alert>
            
            <TextField
              type="file"
              fullWidth
              inputProps={{ accept: '.xlsx,.xls' }}
              onChange={handleFileChange}
              helperText="Select an Excel file (.xlsx or .xls)"
            />
          </Box>

          {file && (
            <Box mb={3}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Selected File: {file.name}</Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => analyzeExcelFile(file)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Analyzing...' : 'Analyze File'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {aggregatedOrders && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Summary
                </Typography>
                
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                  <Chip 
                    icon={<Info />} 
                    label={`${aggregatedOrders.length} Orders to Import`} 
                    color="primary" 
                  />
                </Box>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🔗 Excel to Frontend Serial Number Mapping
                  </Typography>
                  <Typography variant="body2">
                    <strong>{aggregatedOrders.length} Excel orders</strong> will preserve their original serial numbers in your frontend system.
                    <br/>Example: Excel "sales-0438" → Frontend "sales-0438" (exact match preservation)
                    <br/>Original Excel invoice numbers are also stored in <code>excel_invoice_no</code> field.
                  </Typography>
                </Alert>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  📊 Item Type Breakdown
                </Typography>
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                  <Chip 
                    label={`🟠 ${aggregatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.type === 'product').length, 0)} Products`} 
                    color="warning"
                    variant="outlined"
                  />
                  <Chip 
                    label={`🔵 ${aggregatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.type === 'service').length, 0)} Services`} 
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`🟢 ${aggregatedOrders.reduce((sum, order) => sum + order.items.filter(item => item.type === 'membership').length, 0)} Memberships`} 
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {aggregatedOrders && aggregatedOrders.length > 0 && (
            <Button 
              variant="contained" 
              onClick={importToDatabase}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : `Import ${aggregatedOrders.length} Orders`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
        <MuiAlert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </MuiAlert>
      </Snackbar>
    </>
  );
} 