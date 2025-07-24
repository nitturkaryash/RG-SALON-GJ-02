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

interface ServiceData {
  name: string;
  category: string;
  stylist: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxPercent: number;
  subtotal: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  type: 'service' | 'product' | 'membership';
  hsnCode?: string;
}

interface PaymentData {
  method: string;
  amount: number;
}

interface AggregatedOrder {
  invoiceNo: string;
  clientName: string;
  clientPhone: string;
  date: string;
  services: ServiceData[];
  payments: PaymentData[];
  totals: {
    subtotal: number;
    discount: number;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
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
    
    if (extractedNumber) {
      // Format as 4-digit padded number
      const paddedNumber = String(extractedNumber).padStart(4, '0');
      return `sales-${paddedNumber}`;
    } else {
      // Fallback to sequential numbering if no number found
      return `sales-${String(fallbackIndex).padStart(4, '0')}`;
    }
  } catch (error) {
    // Fallback to sequential numbering on any error
    return `sales-${String(fallbackIndex).padStart(4, '0')}`;
  }
};

export default function AggregatedExcelImporter() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<ExcelImportSummary | null>(null);
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
      setSummary(null);
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

  const analyzeExcelFile = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // First, analyze the file structure
      const analysis = await analyzeFile(file);
      logExcelAnalysis(analysis);
      
      // Validate structure
      const validation = validateOrdersExcelStructure(analysis);
      if (!validation.isValid) {
        console.warn('Missing columns:', validation.missingColumns);
        console.warn('Suggestions:', validation.suggestions);
        
        if (validation.suggestions.length > 0) {
          toast.warn(`Excel structure warning: ${validation.suggestions.join(', ')}`);
        }
      }

      // Get the raw data
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        dateNF: 'yyyy-mm-dd'
      });

      if (json.length === 0) {
        toast.error('Excel file is empty');
        return;
      }

      console.log('Raw Excel Data:', json.slice(0, 3)); // Log first 3 rows for debugging

      // Group data by invoice number
      const groupedData = new Map<string, any[]>();
      const errors: string[] = [];

      json.forEach((row, index) => {
        try {
          // Get invoice number - try multiple possible column names
          const invoiceNo = row['Invoice No'] || 
                           row['Invoice Number'] || 
                           row['invoice_no'] || 
                           row['INVOICE NO'] ||
                           `AUTO-${index + 1}`;

          if (!groupedData.has(invoiceNo)) {
            groupedData.set(invoiceNo, []);
          }
          groupedData.get(invoiceNo)!.push({ ...row, rowIndex: index + 2 }); // +2 for Excel row number (1-indexed + header)
        } catch (error) {
          console.error(`Error processing row ${index + 2}:`, error);
          errors.push(`Row ${index + 2}: Error processing row - ${error}`);
        }
      });

      // Aggregate each group into a single order
      const aggregatedOrders: AggregatedOrder[] = [];
      const rawRowsByInvoice: { [invoiceNo: string]: any[] } = {};

      for (const [invoiceNo, rows] of groupedData) {
        try {
          const firstRow = rows[0];
          
          // Extract common order information from first row
          const clientName = firstRow['Guest Name'] || firstRow['Client Name'] || firstRow['client_name'] || 'Unknown Client';
          const clientPhone = (firstRow['Guest Number'] || firstRow['Phone'] || firstRow['phone'] || '').toString();
          const dateValue = firstRow['Date'] || firstRow['date'] || new Date();
          
          let parsedDate: Date;
          try {
            parsedDate = parseExcelDate(dateValue);
          } catch (dateError) {
            console.warn(`Date parsing failed for invoice ${invoiceNo}:`, dateError);
            parsedDate = new Date();
          }
          
          const date = parsedDate.toISOString().split('T')[0];

          // Aggregate services from all rows with same invoice
          const services: ServiceData[] = [];
          let totalSubtotal = 0;
          let totalDiscount = 0;
          let totalTaxAmount = 0;
          let totalAmount = 0;

          rows.forEach((row, rowIndex) => {
            try {
            const serviceName = row['Service'] || row['PRODUCT NAME'] || row['Product Name'] || row['service_name'] || row['Item'] || 'Unknown Service';
            const category = row['Category'] || row['category'] || 'General';
            const stylist = row['Staff'] || row['stylist'] || row['Stylist'] || 'Admin';
            const quantity = parseInt(row['Qty'] || row['quantity'] || row['Quantity'] || '1') || 1;
            const unitPrice = parseFloat(row['Unit Price'] || row['Price'] || row['unit_price'] || row['Rate'] || row['Amount'] || '0') || 0;
            const discount = parseFloat(row['Discount'] || row['discount'] || '0') || 0;
              const taxAmount = parseFloat(row['Tax'] || row['tax'] || row['GST'] || '0') || 0;
              const total = parseFloat(row['Total'] || row['total'] || row['Amount'] || '0') || 0;

              // Get HSN code to determine item type - check multiple possible column names
              const hsnCode = (
                row['hsn code'] ||  // This is the actual column name in the Excel
                row['HSN CODE'] || 
                row['HSN Code'] || 
                row['hsn_code'] || 
                row['HSN'] || 
                row['Hsn Code'] ||
                row['HSN_CODE'] ||
                row['hsncode'] ||
                ''
              ).toString().trim();
              
              // SIMPLE RULE: Only HSN code filled = PRODUCT, everything else = SERVICE
              let itemType: 'service' | 'product' | 'membership' = 'service';
              const lowerServiceName = serviceName.toLowerCase();
              const lowerCategory = category.toLowerCase();
              
              // ONLY check for HSN codes - this is the definitive rule for products
              if (hsnCode && hsnCode.length > 0) {
                itemType = 'product';
                console.log(`✓ Product detected (HSN filled): ${serviceName} [HSN: ${hsnCode}]`);
              } 
              // Fallback: Check for "product" in name or category
              else if (
                lowerServiceName.includes('product') ||
                lowerCategory.includes('product')
              ) {
                itemType = 'product';
                console.log(`✓ Product detected (Name/Category): ${serviceName}`);
              }
              // Check for membership items (only if no HSN code)
              else if (
                lowerServiceName.includes('membership') || 
                lowerServiceName.includes('member') || 
                lowerServiceName.includes('tier') ||
                lowerServiceName.includes('package') ||
                lowerServiceName.includes('plan') ||
                lowerCategory.includes('membership') ||
                lowerCategory.includes('member')
              ) {
                itemType = 'membership';
                console.log(`✓ Membership detected: ${serviceName}`);
              } else {
                // Everything else without HSN code = SERVICE
                itemType = 'service';
                console.log(`✓ Service detected (no HSN): ${serviceName}`);
              }
              
              // Additional debugging for products that might have issues
              if (itemType === 'product') {
                console.log(`🔍 PRODUCT DEBUG for ${serviceName}:`, {
                  hsnCode: hsnCode || 'NONE',
                  originalUnitPrice: unitPrice,
                  total: total,
                  quantity: quantity,
                  category: category,
                  canBackCalculate: total > 0 && quantity > 0 && unitPrice === 0
                });
              }

              // Calculate line totals (use provided totals or calculate)
              // If unitPrice is 0 but we have a total, try to back-calculate the unit price
              let finalUnitPrice = unitPrice;
              let finalTotal = total;
              
              if (unitPrice === 0 && total > 0 && quantity > 0) {
                // Back-calculate unit price from total
                finalUnitPrice = total / quantity;
                console.log(`Back-calculated unit price for ${serviceName}: ${finalUnitPrice} (from total: ${total}, qty: ${quantity})`);
              } else if (unitPrice > 0 && total === 0) {
                // Calculate total from unit price
                finalTotal = unitPrice * quantity;
              }
              
              const subtotal = parseFloat(row['Subtotal(without tax & redemption)'] || (finalUnitPrice * quantity).toString()) || (finalUnitPrice * quantity);
              const taxPercent = subtotal > 0 ? (taxAmount / subtotal) * 100 : 18; // Calculate tax % or default to 18%
            const netAmount = subtotal - discount;
              const lineTotal = finalTotal || (netAmount + taxAmount);

            services.push({
              name: serviceName,
              category,
              stylist,
              quantity,
              unitPrice: finalUnitPrice,
              discount,
              taxPercent,
              subtotal,
              netAmount,
              taxAmount,
              totalAmount: lineTotal,
              type: itemType,
              hsnCode: hsnCode || undefined
            });

            totalSubtotal += subtotal;
            totalDiscount += discount;
            totalTaxAmount += taxAmount;
            totalAmount += lineTotal;
            } catch (serviceError) {
              console.error(`Error processing service in row ${rowIndex} of invoice ${invoiceNo}:`, serviceError);
              errors.push(`Invoice ${invoiceNo}, Row ${rowIndex}: Error processing service - ${serviceError}`);
            }
          });

          // Handle payment information with improved parsing
          const paymentMode = firstRow['Payment Mode'] || firstRow['payment_method'] || 'cash';
          const payments: PaymentData[] = [];
          
          console.log(`💳 Processing payments for invoice ${invoiceNo}:`, { 
            paymentMode, 
            clientName, 
            orderTotal: totalAmount,
            rawPaymentString: JSON.stringify(paymentMode)
          });
          
          // Parse payment mode string to extract multiple payments
          if (paymentMode && typeof paymentMode === 'string' && paymentMode.toLowerCase() !== 'cash') {
            console.log(`🔍 Parsing payment mode: "${paymentMode}" for invoice ${invoiceNo}`);
            
            // Enhanced parsing to handle various formats:
            // "Cash(4821),GPay(701)", "Card(1180) + Cash(500)", "Card 1180 + Cash 500", etc.
            
            // First, normalize the string by replacing common separators
            let normalizedPayment = paymentMode
              .replace(/\s*\+\s*/g, '|')  // Replace + with |
              .replace(/\s*,\s*/g, '|')   // Replace , with |
              .replace(/\s*&\s*/g, '|')   // Replace & with |
              .replace(/\s*and\s*/gi, '|'); // Replace 'and' with |
            
            const paymentParts = normalizedPayment
              .split('|')
              .map(part => part.trim())
              .filter(part => part.length > 0);
            
            console.log(`🔗 Payment parts after normalization:`, paymentParts);
            
            let totalProcessedAmount = 0;
            
            for (const part of paymentParts) {
              let method = 'cash';
              let amount = 0;
              
              const lowerPart = part.toLowerCase();
              console.log(`🧩 Processing payment part: "${part}"`);
              
              // Determine payment method first - improved detection
              if (lowerPart.includes('card') || lowerPart.includes('debit') || lowerPart.includes('credit')) {
                method = 'card';
              } else if (lowerPart.includes('gpay') || lowerPart.includes('g pay') || lowerPart.includes('google pay')) {
                method = 'gpay';
              } else if (lowerPart.includes('upi') || lowerPart.includes('paytm') || lowerPart.includes('phonepe')) {
                method = 'upi';
              } else if (lowerPart.includes('cash')) {
                method = 'cash';
              } else if (lowerPart.includes('balance')) {
                method = 'pay_later';
              } else if (lowerPart.includes('membership')) {
                method = 'membership';
              } else {
                // If no method identified, try to guess from context
                method = 'cash'; // Default to cash
              }
              
              // Extract amount using multiple patterns - FIXED regex for exact Excel format
              // Pattern 1: Amount in parentheses - e.g., "Cash(4821)", "GPay(701)"
              let amountMatch = part.match(/\((\d+(?:\.\d{1,2})?)\)/);
              if (amountMatch && amountMatch[1]) {
                amount = parseFloat(amountMatch[1]);
                console.log(`✅ Pattern 1 match: ${method}(${amount})`);
              } else {
                // Pattern 2: Amount after method name - e.g., "Card 1180", "Cash 500.50"
                amountMatch = part.match(/(?:card|cash|gpay|upi|paytm|phonepe)\s*[:=]?\s*(\d+(?:\.\d{1,2})?)/i);
                if (amountMatch && amountMatch[1]) {
                  amount = parseFloat(amountMatch[1]);
                  console.log(`✅ Pattern 2 match: ${method} ${amount}`);
                } else {
                  // Pattern 3: Just extract any decimal number from the string
                  amountMatch = part.match(/(\d+(?:\.\d{1,2})?)/);
                  if (amountMatch && amountMatch[1]) {
                    amount = parseFloat(amountMatch[1]);
                    console.log(`✅ Pattern 3 match: extracted ${amount} from "${part}"`);
                  }
                }
              }
              
              console.log(`💰 Payment part "${part}" -> method: ${method}, amount: ${amount}`);
              
              // Add payment if we found a valid amount
              if (amount > 0) {
                payments.push({
                  method,
                  amount,
                });
                totalProcessedAmount += amount;
                console.log(`✅ Added payment: ${method} ₹${amount}`);
              } else {
                console.warn(`⚠️ Could not extract amount from payment part: "${part}"`);
              }
            }
            
            console.log(`📊 Final parsed payments for invoice ${invoiceNo}:`, payments.map(p => `${p.method}: ₹${p.amount}`).join(' + '));
            console.log(`💵 Total processed: ₹${totalProcessedAmount}, Order total: ₹${totalAmount}`);
            
            // Special logging for your example case
            if (paymentMode === "Cash(4821),GPay(701)" || paymentMode.includes("Cash(4821)")) {
              console.log(`🎯 SPECIAL TEST CASE - Original: "${paymentMode}"`);
              console.log(`🎯 Expected: Cash ₹4821 + GPay ₹701 = ₹5522`);
              console.log(`🎯 Actual parsed:`, payments);
              console.log(`🎯 Total parsed: ₹${totalProcessedAmount} vs Expected: ₹5522`);
            }
            
            // If we couldn't parse any payments, fallback to single cash payment
            if (payments.length === 0) {
              console.log(`❌ No payments parsed from "${paymentMode}", using total as cash payment`);
              payments.push({
                method: 'cash',
                amount: totalAmount,
              });
            } else {
              // Check if total processed amount matches the order total
              const difference = Math.abs(totalAmount - totalProcessedAmount);
              if (difference > 0.01) { // Allow for small floating point differences
                console.log(`⚠️ Payment total mismatch - Order: ₹${totalAmount}, Parsed: ₹${totalProcessedAmount}, Difference: ₹${difference}`);
                
                // For now, don't adjust - let user see the actual parsed amounts
                // This helps with debugging
              } else {
                console.log(`✅ Payment totals match perfectly!`);
              }
            }
          } else {
            // Simple case - single payment method
            const amount = totalAmount;
            let method = 'cash';
            
            if (paymentMode && typeof paymentMode === 'string') {
              const lowerPayment = paymentMode.toLowerCase();
              if (lowerPayment.includes('card')) {
                method = 'card';
              } else if (lowerPayment.includes('gpay') || lowerPayment.includes('upi')) {
                method = 'gpay';
              }
            }
            
            payments.push({
              method,
              amount,
            });
          }
          
          // Don't consolidate payments - keep each payment separate as requested
          // Just filter out invalid payments
          const finalPayments = payments.filter(payment => payment.amount > 0);
          
          if (finalPayments.length === 0) {
            // Fallback to cash if no valid payments found
            finalPayments.push({
              method: 'cash',
              amount: totalAmount
            });
          }
          
          // Replace payments with filtered ones
          payments.length = 0; // Clear original array
          payments.push(...finalPayments);
          
          console.log(`Final payments for invoice ${invoiceNo} (${payments.length} separate payments):`, payments);
          
          // Final verification and logging
          const finalTotalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
          if (Math.abs(finalTotalPayments - totalAmount) > 0.01) {
            console.warn(`Final payment total (${finalTotalPayments}) doesn't match order total (${totalAmount}) for invoice ${invoiceNo}`);
            console.warn(`Original payment mode: "${paymentMode}"`);
            console.warn(`Final payments:`, payments);
          } else {
            console.log(`✓ Payment total matches order total for invoice ${invoiceNo}: ${finalTotalPayments}`);
          }

          aggregatedOrders.push({
            invoiceNo,
            clientName,
            clientPhone,
            date,
            services,
            payments,
            totals: {
              subtotal: totalSubtotal,
              discount: totalDiscount,
              netAmount: totalSubtotal - totalDiscount,
              taxAmount: totalTaxAmount,
              totalAmount: totalAmount
            }
          });

          rawRowsByInvoice[invoiceNo] = rows;

        } catch (error) {
          console.error(`Error aggregating data for invoice ${invoiceNo}:`, error);
          errors.push(`Invoice ${invoiceNo}: Error aggregating data - ${error}`);
        }
      }

      // Calculate analytics for the summary
      let totalProducts = 0;
      let totalServices = 0;
      let totalMemberships = 0;
      let hsnProducts = 0;
      let namePatternProducts = 0;
      
      const invoiceMapping = aggregatedOrders.map(order => {
        let productCount = 0;
        let serviceCount = 0;
        let membershipCount = 0;
        
        order.services.forEach(service => {
          if (service.type === 'product') {
            productCount++;
            totalProducts++;
            // Since we now ONLY detect products by HSN code, all products should have HSN codes
            if (service.hsnCode) {
              hsnProducts++;
            } else {
              // This should never happen with the new logic, but log if it does
              console.warn(`Product without HSN code detected: ${service.name}`);
              namePatternProducts++;
            }
          } else if (service.type === 'service') {
            serviceCount++;
            totalServices++;
          } else if (service.type === 'membership') {
            membershipCount++;
            totalMemberships++;
          }
        });
        
        return {
          invoiceNo: order.invoiceNo,
          clientName: order.clientName,
          totalAmount: order.totals.totalAmount,
          productCount,
          serviceCount,
          membershipCount
        };
      });

      // Calculate payment method breakdown
      const paymentMethodTotals: { [method: string]: { count: number, amount: number } } = {};
      aggregatedOrders.forEach(order => {
        order.payments.forEach(payment => {
          if (!paymentMethodTotals[payment.method]) {
            paymentMethodTotals[payment.method] = { count: 0, amount: 0 };
          }
          paymentMethodTotals[payment.method].count++;
          paymentMethodTotals[payment.method].amount += payment.amount;
        });
      });

      const summary: ExcelImportSummary = {
        totalRows: json.length,
        uniqueInvoices: groupedData.size,
        aggregatedOrders,
        errors,
        rawRowsByInvoice,
        analytics: {
          totalProducts,
          totalServices,
          totalMemberships,
          productsByType: {
            hsnProducts,
            namePatternProducts
          },
          invoiceMapping,
          paymentMethods: paymentMethodTotals
        } as any
      };

      setSummary(summary);
      console.log('Aggregated Orders:', aggregatedOrders);

    } catch (error) {
      console.error('Error analyzing Excel file:', error);
      toast.error('Error analyzing Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const importToDatabase = async () => {
    if (!summary || summary.aggregatedOrders.length === 0) {
      toast.error('No data to import');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    let successCount = 0;
    let failCount = 0;

    try {
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;

      if (!user?.id) {
        toast.error('Please log in to import orders');
        setIsImporting(false);
        return;
      }

      console.log(`Starting import of ${summary.aggregatedOrders.length} orders...`);

      for (const [index, order] of summary.aggregatedOrders.entries()) {
        try {
          const orderId = uuidv4();
          
          // Process products separately - insert into product master and inventory tables
          const productServices = order.services.filter(service => service.type === 'product');
          const nonProductServices = order.services.filter(service => service.type !== 'product');
          
          // For each product, call the RPC to decrement stock
          for (const product of productServices) {
            if (!product.hsnCode) {
              console.warn(`Skipping stock update for ${product.name} because it has no HSN code.`);
              continue;
            }
            
            console.log(`📦 Processing product for stock update: ${product.name} (HSN: ${product.hsnCode}, Qty: ${product.quantity})`);
            
            try {
              // Using import_decrement_product_stock function that bypasses RLS/auth for import operations
              const { data, error: rpcError } = await supabase.rpc('import_decrement_product_stock', {
                p_hsn_code: product.hsnCode,
                p_quantity_sold: product.quantity,
                p_user_id: SURAT_USER_ID,
              });

              if (rpcError) {
                console.error(`❌ RPC Error for ${product.name} : ${JSON.stringify(rpcError)}`);
                toast.error(`Failed to update stock for ${product.name}`);
                failCount++;
              } else {
                console.log(`✅ RPC Result for ${product.name}: ${data}`);
                if (data && data.startsWith && data.startsWith('Warning:')) {
                  toast.warn(data);
                } else {
                  toast.success(data || `Stock updated for ${product.name}`);
                }
              }
            } catch (stockError: any) {
              console.error(`❌ Exception updating stock for ${product.name}:`, stockError);
              toast.error(`Error updating stock for ${product.name}: ${stockError.message || 'Unknown error'}`);
              failCount++;
            }
          }

          if (failCount > 0) {
            toast.error(`${failCount} stock updates failed.`);
          } else {
            toast.success('All product stocks updated successfully!');
          }

          // Create proper services JSON structure for pos_orders (excluding products that are now in inventory)
          const servicesJson = nonProductServices.map(service => {
            const taxable_value = service.subtotal;
            const unit_price_inc_gst = service.unitPrice * (1 + service.taxPercent / 100);
            
            return {
              id: uuidv4(),
              service_id: uuidv4(), // This can be a new UUID
              name: service.name,
              service_name: service.name,
              category: service.category,
              stylist: service.stylist,
              stylist_name: service.stylist,
              quantity: service.quantity,
              price: service.unitPrice,
              unit_price: service.unitPrice,
              unit_price_inc_gst: unit_price_inc_gst,
              mrp_incl_gst: unit_price_inc_gst, // Assuming same for services
              discount: service.discount,
              discount_amount: service.discount,
              tax_percent: service.taxPercent,
              gst_percentage: service.taxPercent,
              subtotal: service.subtotal,
              net_amount: service.netAmount,
              taxable_value: taxable_value,
              tax_amount: service.taxAmount,
              cgst_amount: service.taxAmount / 2,
              sgst_amount: service.taxAmount / 2,
              total: service.totalAmount,
              total_amount: service.totalAmount,
              type: service.type,
              hsn_code: service.hsnCode,
            };
          });

          // Add product items as special service entries for receipt/billing purposes
          const productServiceEntries = productServices.map(product => {
            const taxable_value = product.subtotal;
            const unit_price_inc_gst = product.unitPrice * (1 + product.taxPercent / 100);

            return {
              id: uuidv4(),
              service_id: uuidv4(), // Can be a new UUID, or you might want to link to product_master
              name: `${product.name} (Product)`,
              service_name: `${product.name} (Product)`,
              category: `PRODUCT - ${product.category}`,
              stylist: product.stylist,
              stylist_name: product.stylist,
              quantity: product.quantity,
              price: product.unitPrice,
              unit_price: product.unitPrice,
              unit_price_inc_gst: unit_price_inc_gst,
              mrp_incl_gst: unit_price_inc_gst,
              discount: product.discount,
              discount_amount: product.discount,
              tax_percent: product.taxPercent,
              gst_percentage: product.taxPercent,
              subtotal: product.subtotal,
              net_amount: product.netAmount,
              taxable_value: taxable_value,
              tax_amount: product.taxAmount,
              cgst_amount: product.taxAmount / 2,
              sgst_amount: product.taxAmount / 2,
              total: product.totalAmount,
              total_amount: product.totalAmount,
              type: 'product',
              hsn_code: product.hsnCode,
              is_inventory_item: true,
            };
          });
          
          // Combine services and product entries for the order
          const allServicesJson = [...servicesJson, ...productServiceEntries];

          // Create proper payments JSON structure
          const paymentsJson = order.payments.map(payment => ({
            id: uuidv4(),
            method: payment.method,
            payment_method: payment.method,
            amount: payment.amount,
            paid_amount: payment.amount,
            timestamp: new Date().toISOString(),
            duplicate_protection_key: `${orderId}-${payment.method}-${payment.amount}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
          }));
          
          console.log(`Creating order for invoice ${order.invoiceNo}:`, {
            totalServices: allServicesJson.length,
            productCount: productServices.length,
            serviceCount: nonProductServices.length,
            isSplitPayment: order.payments.length > 1
          });
          
          // Prepare order payload for pos_orders table with all available columns
          let jsDate: Date;
          if (typeof order.date === 'number') {
            jsDate = excelDateToJSDate(order.date);
          } else {
            jsDate = new Date(order.date);
          }
          const dateOnly = jsDate.toISOString().split('T')[0];

          // Extract serial number from Excel invoice number and format for frontend
          // Excel: "sales-0438" → Frontend: "sales-0438" (preserve exact number)
          const serialNumber = extractSerialNumber(order.invoiceNo.toString(), index + 1);
          console.log(`📋 Excel "${order.invoiceNo}" → Frontend "${serialNumber}"`);
          
          // Ensure proper data types and validation
          const safeTotalAmount = Number(order.totals.totalAmount) || 0;
          const safeSubtotal = Number(order.totals.subtotal) || 0;
          const safeTax = Number(order.totals.taxAmount) || 0;
          const safeDiscount = Number(order.totals.discount) || 0;
          
          // Check for pay_later method to adjust status and pending amount
          const hasPayLater = order.payments.some(p => p.method === 'pay_later');
          const paidAmount = order.payments
            .filter(p => p.method !== 'pay_later')
            .reduce((sum, p) => sum + p.amount, 0);
          const pendingAmount = hasPayLater ? safeTotalAmount - paidAmount : 0;
          const orderStatus = pendingAmount > 0 ? 'pending' : 'completed';

          // Create simplified order payload with only standard fields
          const orderPayload = {
            id: orderId,
            serial_number: serialNumber, // Add serial number to top level
            invoice_number: order.invoiceNo, // Add invoice number
            created_at: dateOnly,
            date: dateOnly,
            client_name: String(order.clientName || 'Unknown Client'),
            customer_name: String(order.clientName || 'Unknown Client'),
            stylist_name: String(order.services[0]?.stylist || 'Admin'),
            services: allServicesJson,
            payments: paymentsJson,
            
            // Financial calculations - ensure they're valid numbers
            subtotal: safeSubtotal,
            discount: safeDiscount,
            discount_percentage: safeSubtotal > 0 ? (safeDiscount / safeSubtotal) * 100 : 0,
            tax: safeTax,
            total: safeTotalAmount,
            total_amount: safeTotalAmount,
            
            // Standard fields
            payment_method: String(order.payments.map(p => p.method).join(', ') || 'cash'),
            status: orderStatus,
            type: 'sale',
            is_walk_in: true,
            is_split_payment: Boolean(order.payments.length > 1),
            pending_amount: pendingAmount,
            
            // Add user and tenant IDs
            user_id: SURAT_USER_ID,
            tenant_id: SURAT_TENANT_ID,

            // Add a unique key for duplicate protection
            duplicate_protection_key: `${orderId}-${order.invoiceNo}-${Date.now()}`,

            // Store all Excel and serial mapping data in stock_snapshot JSONB field
            stock_snapshot: {
              excel_invoice_no: order.invoiceNo,
              serial_number: serialNumber, // Keep for reference
              frontend_serial: serialNumber,
              excel_to_frontend_mapping: `${order.invoiceNo} → ${serialNumber}`,
              client_phone: order.clientPhone || '',
              import_source: file?.name || 'april_2025_import',
              import_date: new Date().toISOString(),
              original_data: {
                raw_services: order.services,
                raw_payments: order.payments,
                raw_totals: order.totals,
                products_processed: productServices.length,
                services_processed: nonProductServices.length
              }
            }
          };

          console.log(`Importing order ${index + 1}/${summary.aggregatedOrders.length}: ${order.invoiceNo} → ${serialNumber} for ${order.clientName}`);

          console.log(`🔍 Order payload for ${order.invoiceNo}:`, {
            id: orderPayload.id,
            client_name: orderPayload.client_name,
            total: orderPayload.total,
            services_count: order.services.length,
            payments_count: order.payments.length
          });

          // Omit the 'id' field to let the database generate it
          const { id, ...orderPayloadWithoutId } = orderPayload;

          const { error } = await supabase.from('pos_orders').insert(orderPayloadWithoutId);

          if (error) {
            console.error(`❌ Error inserting order ${order.invoiceNo}:`, {
              error: error,
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            
            // Log the problematic payload for debugging
            console.error(`❌ Problematic payload for ${order.invoiceNo}:`, orderPayload);
            failCount++;
          } else {
            successCount++;
            console.log(`✅ Successfully imported order ${order.invoiceNo} → ${serialNumber}`);
          }

        } catch (orderError) {
          console.error(`Error processing order ${order.invoiceNo}:`, orderError);
          failCount++;
        }
        // Update progress after each order
        setProgress(Math.round(((index + 1) / summary.aggregatedOrders.length) * 100));
      }

      // Show final results
      console.log(`Import completed: ${successCount} success, ${failCount} failed`);
      
      if (successCount > 0) {
        setSuccessMsg(`Successfully imported ${successCount} orders!`);
        setShowSuccess(true);
      }
      
      if (failCount > 0) {
        toast.warn(`${failCount} orders failed to import. Check console for details.`);
      }
      
      if (successCount === summary.aggregatedOrders.length) {
        setSuccessMsg(`🎉 All ${successCount} orders imported successfully!`);
        setShowSuccess(true);
        // Clear the summary to reset the component
        setSummary(null);
      setFile(null);
      }

    } catch (error) {
      console.error('Import process failed:', error);
      toast.error(`Import failed: ${error}`);
    } finally {
      setIsImporting(false);
      setProgress(0);
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
          const pendingAmount = Math.max(0, order.totalAmount - order.payments.reduce((sum, p) => sum + p.amount, 0));

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
              This importer will automatically group items by Invoice Number and create aggregated orders. 
              Multiple items with the same invoice number will be combined into a single order.<br/>
              <strong>Simple Categorization Rules (Based on HSN Code Column):</strong><br/>
              • Items with <strong>filled HSN code</strong> = <strong>PRODUCTS</strong> (orange) → Properly categorized in orders<br/>
              • Items with <strong>empty HSN code</strong> + membership keywords = <strong>MEMBERSHIPS</strong> (green)<br/>
              • Items with <strong>empty HSN code</strong> (all other items) = <strong>SERVICES</strong> (blue)<br/>
              <strong>Rule:</strong> Only rows with HSN codes are products. Everything else is services/memberships.<br/>
              <strong>Payment Handling:</strong> Multiple payment methods (e.g., "Card(1180) + Cash(500)") are parsed and shown separately.<br/>
              <strong>Invoice Mapping:</strong> Excel serial numbers are preserved exactly in frontend (e.g., sales-0438 stays sales-0438).<br/>
              <strong>Serial Numbers:</strong> Frontend displays the exact same serial numbers as your Excel sheet.<br/>
              <strong>✅ Fixed:</strong> Duplicate protection conflicts resolved - imports now work without 409 errors.<br/>
              <strong>Note:</strong> Products will be properly categorized and included in orders. Missing unit prices will be calculated from totals.
            </Alert>
            
            <TextField
              type="file"
              fullWidth
              inputProps={{ accept: '.xlsx,.xls' }}
              onChange={handleImport}
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
                      onClick={analyzeExcelFile}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Analyzing...' : 'Analyze File'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {summary && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Summary
                </Typography>
                
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                  <Chip 
                    icon={<Info />} 
                    label={`${summary.totalRows} Total Rows`} 
                    color="primary" 
                  />
                  <Chip 
                    icon={<Check />} 
                    label={`${summary.uniqueInvoices} Unique Invoices`} 
                    color="success" 
                  />
                  {summary.errors.length > 0 && (
                    <Chip 
                      icon={<Warning />} 
                      label={`${summary.errors.length} Errors`} 
                      color="error" 
                    />
                  )}
                </Box>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🔗 Excel to Frontend Serial Number Mapping
                  </Typography>
                  <Typography variant="body2">
                    <strong>{summary.uniqueInvoices} Excel invoices</strong> will preserve their original serial numbers in your frontend system.
                    <br/>Example: Excel "sales-0438" → Frontend "sales-0438" (exact match preservation)
                    <br/>Original Excel invoice numbers are also stored in <code>excel_invoice_no</code> field.
                  </Typography>
                </Alert>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  📊 Item Type Breakdown
                </Typography>
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                  <Chip 
                    label={`🟠 ${summary.analytics.totalProducts} Products`} 
                    color="warning"
                    variant="outlined"
                  />
                  <Chip 
                    label={`🔵 ${summary.analytics.totalServices} Services`} 
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`🟢 ${summary.analytics.totalMemberships} Memberships`} 
                    color="success"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Product Detection Method:
                </Typography>
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip 
                    label={`${summary.analytics.productsByType.hsnProducts} products (HSN code filled)`} 
                    size="small"
                    color="warning"
                  />
                  {summary.analytics.productsByType.namePatternProducts > 0 && (
                    <Chip 
                      label={`${summary.analytics.productsByType.namePatternProducts} by name pattern (LEGACY)`} 
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  💳 Payment Method Summary
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  {Object.entries(summary.analytics.paymentMethods).map(([method, data]) => {
                    const label = method.toUpperCase(); // Display method name in uppercase
                    return (
                      <Chip 
                        key={method}
                        label={`${label}: ${data.count} payments (₹${data.amount.toFixed(2)})`} 
                        size="small"
                        color={method === 'cash' ? 'default' : method === 'card' ? 'info' : 'success'}
                        variant="outlined"
                      />
                    );
                  })}
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  📋 Invoice Mapping (Excel → Frontend Serial)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 2 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Excel Invoice #</TableCell>
                        <TableCell>Serial Number</TableCell>
                        <TableCell>Client Name</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="center">🟠 Products</TableCell>
                        <TableCell align="center">🔵 Services</TableCell>
                        <TableCell align="center">🟢 Memberships</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.analytics.invoiceMapping.slice(0, 10).map((invoice, index) => {
                        const serialNumber = extractSerialNumber(invoice.invoiceNo.toString(), index + 1);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Chip label={invoice.invoiceNo} size="small" variant="outlined" color="secondary" />
                            </TableCell>
                            <TableCell>
                              <Chip label={serialNumber} size="small" color="primary" />
                            </TableCell>
                            <TableCell>{invoice.clientName}</TableCell>
                            <TableCell align="right">₹{invoice.totalAmount.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              {invoice.productCount > 0 && (
                                <Chip label={invoice.productCount} size="small" color="warning" />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {invoice.serviceCount > 0 && (
                                <Chip label={invoice.serviceCount} size="small" color="primary" />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {invoice.membershipCount > 0 && (
                                <Chip label={invoice.membershipCount} size="small" color="success" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {summary.analytics.invoiceMapping.length > 10 && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                    ... and {summary.analytics.invoiceMapping.length - 10} more invoices
                  </Typography>
                )}

                {summary.errors.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Errors found:</Typography>
                    {summary.errors.slice(0, 5).map((error, index) => (
                      <Typography key={index} variant="body2">• {error}</Typography>
                    ))}
                    {summary.errors.length > 5 && (
                      <Typography variant="body2">... and {summary.errors.length - 5} more</Typography>
                    )}
                  </Alert>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Aggregated Orders Preview (First 6)
                </Typography>
                
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice No</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Items (Services/Products/Memberships)</TableCell>
                        <TableCell>Payments</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.aggregatedOrders.slice(0, 6).map((order, index) => (
                        <TableRow key={index}>
                          <TableCell>{order.invoiceNo}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            {order.services.map((service, i) => {
                              const getTypeColor = (type: string) => {
                                switch (type) {
                                  case 'product': return 'warning';
                                  case 'membership': return 'success';
                                  default: return 'primary';
                                }
                              };
                              
                              return (
                              <Chip 
                                key={i}
                                  label={`${service.type.toUpperCase()}: ${service.name} (${service.quantity})${service.hsnCode ? ` [HSN: ${service.hsnCode}]` : ''}`}
                                size="small"
                                  color={getTypeColor(service.type) as any}
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                              );
                            })}
                          </TableCell>
                          <TableCell>
                            {order.payments.map((payment, i) => {
                              const getPaymentColor = (method: string) => {
                                switch (method.toLowerCase()) {
                                  case 'card': return 'info';
                                  case 'gpay': 
                                  case 'upi': return 'success';
                                  case 'cash': return 'default';
                                  case 'membership': return 'secondary';
                                  case 'pay_later': return 'error';
                                  default: return 'secondary';
                                }
                              };
                              
                              const label = payment.method.toUpperCase();

                              return (
                                <Chip 
                                  key={i}
                                  label={`${label}: ₹${payment.amount.toFixed(2)}`}
                                  size="small"
                                  color={getPaymentColor(payment.method) as any}
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              );
                            })}
                          </TableCell>
                          <TableCell align="right">
                            ₹{order.totals.totalAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {summary.aggregatedOrders.length > 6 && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    ... and {summary.aggregatedOrders.length - 6} more orders
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          {isImporting && (
            <Box mb={2}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Importing... {progress}%
              </Typography>
            </Box>
          )}
          {summary && summary.aggregatedOrders.length > 0 && (
            <>
              <Box mt={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle1">Detailed Mapped Data Preview (First 3 Orders)</Typography>
                  <IconButton size="small" onClick={() => setShowDetails((v) => !v)}>
                    {showDetails ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    (See all columns and merged data)
                  </Typography>
                </Box>
                <Collapse in={showDetails}>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice No</TableCell>
                          <TableCell>Client Name</TableCell>
                          <TableCell>Client Phone</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Services (JSON)</TableCell>
                          <TableCell>Payments (JSON)</TableCell>
                          <TableCell>Subtotal</TableCell>
                          <TableCell>Discount</TableCell>
                          <TableCell>Tax</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>User ID</TableCell>
                          <TableCell>Tenant ID</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summary.aggregatedOrders.slice(0, 3).map((order, idx) => {
                          // Simulate the mapped payload for preview
                          const servicesJson = JSON.stringify(order.services, null, 2);
                          const paymentsJson = JSON.stringify(order.payments, null, 2);
                          let jsDate: Date;
                          if (typeof order.date === 'number') {
                            jsDate = excelDateToJSDate(order.date);
                          } else {
                            jsDate = new Date(order.date);
                          }
                          const dateOnly = jsDate.toISOString().split('T')[0];
                          return (
                            <TableRow key={idx}>
                              <TableCell>{order.invoiceNo}</TableCell>
                              <TableCell>{order.clientName}</TableCell>
                              <TableCell>{order.clientPhone}</TableCell>
                              <TableCell>{order.date}</TableCell>
                              <TableCell>
                                <pre style={{ fontSize: 10, margin: 0, maxWidth: 200, whiteSpace: 'pre-wrap' }}>{servicesJson}</pre>
                              </TableCell>
                              <TableCell>
                                <pre style={{ fontSize: 10, margin: 0, maxWidth: 120, whiteSpace: 'pre-wrap' }}>{paymentsJson}</pre>
                              </TableCell>
                              <TableCell>{order.totals.subtotal}</TableCell>
                              <TableCell>{order.totals.discount}</TableCell>
                              <TableCell>{order.totals.taxAmount}</TableCell>
                              <TableCell>{order.totals.totalAmount}</TableCell>
                              <TableCell>completed</TableCell>
                              <TableCell>sale</TableCell>
                              <TableCell style={{ fontSize: 10 }}>{SURAT_USER_ID}</TableCell>
                              <TableCell style={{ fontSize: 10 }}>{SURAT_TENANT_ID}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Box>
            </>
          )}
          {summary && summary.aggregatedOrders.length > 0 && (
            <>
              <Box mt={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle1">Raw vs. Mapped Data (First {showAllOrders ? summary.aggregatedOrders.length : 5} Orders)</Typography>
                  {summary.aggregatedOrders.length > 5 && (
                    <Button size="small" onClick={() => setShowAllOrders(v => !v)}>
                      {showAllOrders ? 'Show First 5' : `Show All (${summary.aggregatedOrders.length})`}
                    </Button>
                  )}
                </Box>
                {(showAllOrders ? summary.aggregatedOrders : summary.aggregatedOrders.slice(0, 5)).map((order, idx) => {
                  // Find all raw rows that contributed to this order (by invoice number)
                  const rawRows = summary.rawRowsByInvoice?.[order.invoiceNo] || [];
                  // Simulate the mapped payload for preview (same as in importToDatabase)
                  const servicesJson = order.services.map(service => {
                    const taxable_value = service.subtotal;
                    const unit_price_inc_gst = service.unitPrice * (1 + service.taxPercent / 100);
                    
                    return {
                      id: uuidv4(),
                      service_id: uuidv4(), // This can be a new UUID
                      name: service.name,
                      service_name: service.name,
                      category: service.category,
                      stylist: service.stylist,
                      stylist_name: service.stylist,
                      quantity: service.quantity,
                      price: service.unitPrice,
                      unit_price: service.unitPrice,
                      unit_price_inc_gst: unit_price_inc_gst,
                      mrp_incl_gst: unit_price_inc_gst, // Assuming same for services
                      discount: service.discount,
                      discount_amount: service.discount,
                      tax_percent: service.taxPercent,
                      gst_percentage: service.taxPercent,
                      subtotal: service.subtotal,
                      net_amount: service.netAmount,
                      taxable_value: taxable_value,
                      tax_amount: service.taxAmount,
                      cgst_amount: service.taxAmount / 2,
                      sgst_amount: service.taxAmount / 2,
                      total: service.totalAmount,
                      total_amount: service.totalAmount,
                      type: service.type,
                      hsn_code: service.hsnCode,
                    };
                  });
                  const paymentsJson = order.payments.map(payment => ({
                    id: uuidv4(),
                    method: payment.method,
                    payment_method: payment.method,
                    amount: payment.amount,
                    paid_amount: payment.amount,
                    timestamp: new Date().toISOString()
                  }));
                  let jsDate: Date;
                  if (typeof order.date === 'number') {
                    jsDate = excelDateToJSDate(order.date);
                  } else {
                    jsDate = new Date(order.date);
                  }
                  const dateOnly = jsDate.toISOString().split('T')[0];
                  const orderPayload = {
                    id: uuidv4(), // Generate a new ID for the preview
                    serial_number: extractSerialNumber(order.invoiceNo.toString(), idx + 1), // Add for preview
                    invoice_number: order.invoiceNo, // Add for preview
                    created_at: dateOnly,
                    date: dateOnly,
                    client_name: order.clientName,
                    customer_name: order.clientName,
                    stylist_name: order.services[0]?.stylist || 'Admin',
                    services: servicesJson,
                    payments: paymentsJson,
                    subtotal: Number(order.totals.subtotal) || 0,
                    discount: Number(order.totals.discount) || 0,
                    discount_percentage: Number(order.totals.subtotal) > 0 ? (Number(order.totals.discount) / Number(order.totals.subtotal)) * 100 : 0,
                    tax: Number(order.totals.taxAmount) || 0,
                    total: Number(order.totals.totalAmount) || 0,
                    total_amount: Number(order.totals.totalAmount) || 0,
                    payment_method: String(order.payments.map(p => p.method).join(', ') || 'cash'),
                    status: 'completed',
                    type: 'sale',
                    is_walk_in: true,
                    is_split_payment: order.payments.length > 1,
                    pending_amount: 0,
                    user_id: SURAT_USER_ID,
                    tenant_id: SURAT_TENANT_ID,
                    stock_snapshot: {
                      invoice_no: order.invoiceNo,
                      serial_number: extractSerialNumber(order.invoiceNo.toString(), idx + 1), // Add for preview
                      invoice_number: order.invoiceNo, // Add for preview
                      client_phone: order.clientPhone,
                      import_source: file?.name || 'april_2025_import',
                      import_date: new Date().toISOString(),
                      original_data: {
                        raw_services: order.services,
                        raw_payments: order.payments,
                        raw_totals: order.totals
                      }
                    }
                  };
                  return (
                    <Box key={idx} mb={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">Order {idx + 1} (Invoice: {order.invoiceNo}, Client: {order.clientName})</Typography>
                        <IconButton size="small" onClick={() => setExpandedOrder(expandedOrder === idx ? null : idx)}>
                          {expandedOrder === idx ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedOrder === idx}>
                        <Paper variant="outlined" sx={{ p: 2, mt: 1, background: '#f9f9f9', overflow: 'auto' }}>
                          <Box display="flex" gap={4}>
                            {/* Raw Excel Data (all rows for this invoice) */}
                            <Box flex={1} minWidth={300}>
                              <Typography variant="body2" fontWeight="bold" mb={1}>Raw Excel Data</Typography>
                              {rawRows.length === 0 ? (
                                <Typography variant="caption">No raw rows found for this invoice.</Typography>
                              ) : (
                                rawRows.map((raw: any, i: any) => (
                                  <TableContainer key={i} component={Paper} variant="outlined" sx={{ mb: 1, maxWidth: 400 }}>
                                    <Table size="small">
                                      <TableBody>
                                        {Object.entries(raw).map(([col, val]) => (
                                          <TableRow key={col}>
                                            <TableCell sx={{ fontWeight: 600 }}>{col}</TableCell>
                                            <TableCell>{String(val)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                ))
                              )}
                            </Box>
                            {/* Mapped Final Data */}
                            <Box flex={1} minWidth={350}>
                              <Typography variant="body2" fontWeight="bold" mb={1}>Mapped Import Data</Typography>
                              <Paper variant="outlined" sx={{ p: 1, background: '#fff', maxHeight: 400, overflow: 'auto' }}>
                                <pre style={{ fontSize: 12, margin: 0 }}>{JSON.stringify(orderPayload, null, 2)}</pre>
                              </Paper>
                            </Box>
                          </Box>
                        </Paper>
                      </Collapse>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {summary && summary.aggregatedOrders.length > 0 && (
            <Button 
              variant="contained" 
              onClick={importToDatabase}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : `Import ${summary.aggregatedOrders.length} Orders`}
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