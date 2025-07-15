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
}

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
            const serviceName = row['Service'] || row['PRODUCT NAME'] || row['service_name'] || 'Unknown Service';
            const category = row['Category'] || row['category'] || 'General';
            const stylist = row['Staff'] || row['stylist'] || row['Stylist'] || 'Admin';
            const quantity = parseInt(row['Qty'] || row['quantity'] || '1') || 1;
            const unitPrice = parseFloat(row['Unit Price'] || row['Price'] || row['unit_price'] || '0') || 0;
            const discount = parseFloat(row['Discount'] || row['discount'] || '0') || 0;
              const taxAmount = parseFloat(row['Tax'] || row['tax'] || '0') || 0;
              const total = parseFloat(row['Total'] || row['total'] || '0') || 0;

              // Calculate line totals (use provided totals or calculate)
              const subtotal = parseFloat(row['Subtotal(without tax & redemption)'] || (unitPrice * quantity).toString()) || (unitPrice * quantity);
              const taxPercent = subtotal > 0 ? (taxAmount / subtotal) * 100 : 18; // Calculate tax % or default to 18%
            const netAmount = subtotal - discount;
              const lineTotal = total || (netAmount + taxAmount);

            services.push({
              name: serviceName,
              category,
              stylist,
              quantity,
              unitPrice,
              discount,
              taxPercent,
              subtotal,
              netAmount,
              taxAmount,
              totalAmount: lineTotal
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

          // Handle payment information
          const paymentMode = firstRow['Payment Mode'] || firstRow['payment_method'] || 'cash';
          const payments: PaymentData[] = [];
          
          console.log(`Processing payments for invoice ${invoiceNo}:`, { paymentMode, clientName });
          
          // Parse payment mode string to extract multiple payments
          if (paymentMode && typeof paymentMode === 'string') {
            // Split by both '+' and ',' to handle multiple payment methods
            // e.g., "Card(1180) + Cash(500)" or "Cash(4821),GPay(701)"
            const paymentParts = paymentMode
              .split(/[+,]/)  // Split by either + or ,
              .map(part => part.trim())
              .filter(part => part.length > 0);  // Remove empty parts
            
            console.log(`Payment parts:`, paymentParts);
            
            let totalProcessedAmount = 0;
            
            for (const part of paymentParts) {
              let method = 'cash';
              let amount = 0;
              
              const lowerPart = part.toLowerCase();
              
              // Extract amount from brackets - e.g., "Cash(4821)" -> 4821
              const amountMatch = part.match(/\((\d+)\)/);
              if (amountMatch && amountMatch[1]) {
                amount = parseInt(amountMatch[1], 10);
              }
              
              // Determine payment method
              if (lowerPart.includes('card')) {
                method = 'card';
              } else if (lowerPart.includes('gpay') || lowerPart.includes('g pay')) {
                method = 'gpay';
              } else if (lowerPart.includes('upi')) {
                method = 'upi';
              } else if (lowerPart.includes('cash')) {
                method = 'cash';
              }
              
              // If no amount found in brackets, try to extract any numbers
              if (!amount) {
                const numberMatch = part.match(/\d+/);
                if (numberMatch) {
                  amount = parseInt(numberMatch[0], 10);
                }
              }
              
              console.log(`Payment part "${part}" -> method: ${method}, amount: ${amount}`);
              
              // Add payment if we found an amount
              if (amount > 0) {
                payments.push({
                  method,
                  amount,
                });
                totalProcessedAmount += amount;
              }
            }
            
            console.log(`Final payments array:`, payments);
            
            // If total processed amount doesn't match total bill, adjust the last payment
            const totalBill = parseFloat(firstRow['Total'] || firstRow['total'] || '0');
            if (totalProcessedAmount !== totalBill && payments.length > 0) {
              const difference = totalBill - totalProcessedAmount;
              console.log(`Adjusting last payment by ${difference} to match total bill`);
              payments[payments.length - 1].amount += difference;
            }
          }
          
          // If no valid payments were parsed, default to cash payment for total amount
          if (payments.length === 0) {
            const totalAmount = parseFloat(firstRow['Total'] || firstRow['total'] || '0');
            payments.push({
              method: 'cash',
              amount: totalAmount,
            });
          }
          
          // Verify total payments match order total
          const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
          if (Math.abs(totalPayments - totalAmount) > 0.01) { // Allow for small floating point differences
            console.warn(`Payment total (${totalPayments}) doesn't match order total (${totalAmount}) for invoice ${invoiceNo}`);
            // Adjust last payment to match total
            if (payments.length > 0) {
              payments[payments.length - 1].amount += (totalAmount - totalPayments);
            }
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

      const summary: ExcelImportSummary = {
        totalRows: json.length,
        uniqueInvoices: groupedData.size,
        aggregatedOrders,
        errors,
        rawRowsByInvoice
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
          
          // Create proper services JSON structure for pos_orders
          const servicesJson = order.services.map(service => ({
            id: uuidv4(),
            service_id: uuidv4(), // We don't have service IDs, so generate them
            service_name: service.name,
            name: service.name,
            category: service.category,
            stylist: service.stylist,
            stylist_name: service.stylist,
            quantity: service.quantity,
            price: service.unitPrice,
            unit_price: service.unitPrice,
            discount: service.discount,
            discount_amount: service.discount,
            tax_percent: service.taxPercent,
            gst_percentage: service.taxPercent,
            subtotal: service.subtotal,
            net_amount: service.netAmount,
            tax_amount: service.taxAmount,
            total: service.totalAmount,
            total_amount: service.totalAmount,
            type: 'service'
          }));

          // Create proper payments JSON structure
          const paymentsJson = order.payments.map(payment => ({
            id: uuidv4(),
            method: payment.method,
            payment_method: payment.method,
            amount: payment.amount,
            paid_amount: payment.amount,
            timestamp: new Date().toISOString()
          }));
          
          console.log(`Creating order for invoice ${order.invoiceNo}:`, {
            originalPayments: order.payments,
            finalPaymentsJson: paymentsJson,
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

          const orderPayload = {
            id: orderId,
            created_at: dateOnly,
            date: dateOnly,
            client_name: order.clientName,
            customer_name: order.clientName,
            stylist_name: order.services[0]?.stylist || 'Admin',
            services: servicesJson,
            payments: paymentsJson,
            
            // Financial calculations
            subtotal: Number(order.totals.subtotal) || 0,
            discount: Number(order.totals.discount) || 0,
            tax: Number(order.totals.taxAmount) || 0,
            total: Number(order.totals.totalAmount) || 0,
            total_amount: Number(order.totals.totalAmount) || 0,
            
            // Additional fields for SERVICE APRIL-2025.xlsx format
            payment_method: order.payments[0]?.method || 'cash',
            status: 'completed',
            type: 'sale',
            is_walk_in: true,
            is_split_payment: order.payments.length > 1,
            pending_amount: 0,
            
            // Excel specific data preservation
            stock_snapshot: {
              invoice_no: order.invoiceNo,
              client_phone: order.clientPhone,
              import_source: 'SERVICE APRIL-2025.xlsx',
              import_date: new Date().toISOString(),
              original_data: {
                raw_services: order.services,
                raw_payments: order.payments,
                raw_totals: order.totals
              }
            },
            
            // Multi-tenant fields
            tenant_id: SURAT_TENANT_ID,
            user_id: SURAT_USER_ID
          };

          console.log(`Importing order ${index + 1}/${summary.aggregatedOrders.length}: ${order.invoiceNo} for ${order.clientName}`);

          const { error } = await supabase.from('pos_orders').insert(orderPayload);

          if (error) {
            console.error(`Error inserting order ${order.invoiceNo}:`, error);
            failCount++;
            
            // Log specific error details for debugging
            if (error.message?.includes('invalid input syntax')) {
              console.error('Invalid data format detected:', {
                invoice: order.invoiceNo,
                error: error.message,
                payload: orderPayload
              });
            }
          } else {
            successCount++;
            console.log(`✓ Successfully imported order ${order.invoiceNo}`);
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
              This importer will automatically group services by Invoice Number and create aggregated orders. 
              Multiple services with the same invoice number will be combined into a single order.
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
                
                <Box display="flex" gap={2} mb={2}>
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
                  Aggregated Orders Preview (First 5)
                </Typography>
                
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice No</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Services</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.aggregatedOrders.slice(0, 5).map((order, index) => (
                        <TableRow key={index}>
                          <TableCell>{order.invoiceNo}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            {order.services.map((service, i) => (
                              <Chip 
                                key={i}
                                label={`${service.name} (${service.quantity})`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </TableCell>
                          <TableCell align="right">
                            ₹{order.totals.totalAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {summary.aggregatedOrders.length > 5 && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    ... and {summary.aggregatedOrders.length - 5} more orders
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
                  const servicesJson = order.services.map(service => ({
                    id: '...',
                    service_id: '...',
                    service_name: service.name,
                    name: service.name,
                    category: service.category,
                    stylist: service.stylist,
                    stylist_name: service.stylist,
                    quantity: service.quantity,
                    price: service.unitPrice,
                    unit_price: service.unitPrice,
                    discount: service.discount,
                    discount_amount: service.discount,
                    tax_percent: service.taxPercent,
                    gst_percentage: service.taxPercent,
                    subtotal: service.subtotal,
                    net_amount: service.netAmount,
                    tax_amount: service.taxAmount,
                    total: service.totalAmount,
                    total_amount: service.totalAmount,
                    type: 'service'
                  }));
                  const paymentsJson = order.payments.map(payment => ({
                    id: '...',
                    method: payment.method,
                    payment_method: payment.method,
                    amount: payment.amount,
                    paid_amount: payment.amount,
                    timestamp: '...'
                  }));
                  let jsDate: Date;
                  if (typeof order.date === 'number') {
                    jsDate = excelDateToJSDate(order.date);
                  } else {
                    jsDate = new Date(order.date);
                  }
                  const dateOnly = jsDate.toISOString().split('T')[0];
                  const orderPayload = {
                    id: '...',
                    created_at: dateOnly,
                    date: dateOnly,
                    client_name: order.clientName,
                    customer_name: order.clientName,
                    stylist_name: order.services[0]?.stylist || 'Admin',
                    services: servicesJson,
                    payments: paymentsJson,
                    subtotal: Number(order.totals.subtotal) || 0,
                    discount: Number(order.totals.discount) || 0,
                    tax: Number(order.totals.taxAmount) || 0,
                    total: Number(order.totals.totalAmount) || 0,
                    total_amount: Number(order.totals.totalAmount) || 0,
                    payment_method: order.payments[0]?.method || 'cash',
                    status: 'completed',
                    type: 'sale',
                    is_walk_in: true,
                    is_split_payment: order.payments.length > 1,
                    pending_amount: 0,
                    stock_snapshot: {
                      invoice_no: order.invoiceNo,
                      client_phone: order.clientPhone,
                      import_source: 'SERVICE APRIL-2025.xlsx',
                      import_date: new Date().toISOString(),
                      original_data: {
                        raw_services: order.services,
                        raw_payments: order.payments,
                        raw_totals: order.totals
                      }
                    },
                    tenant_id: SURAT_TENANT_ID,
                    user_id: SURAT_USER_ID
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