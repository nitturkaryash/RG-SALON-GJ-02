import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../utils/supabase/supabaseClient';
import { toast } from 'react-toastify';

// Surat user constants
const SURAT_USER_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b";
const SURAT_TENANT_ID = "surat@rngspalon.in";

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

const AprilDataImporter: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    warnings: string[];
  } | null>(null);

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

  // Data validation function
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

  // Order processing function
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

  // Stock management function
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
          notes: `Sale from imported order ${service.invoiceNo}`,
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
    setImportResults(null);

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
      const warnings: string[] = [];
      
      if (invalid.length > 0) {
        warnings.push(`Found ${invalid.length} invalid rows that will be skipped`);
        console.warn('Invalid rows found:', invalid);
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
            duplicate_protection_key: `${orderId}-${payment.method}-${payment.amount}-${Date.now()}`
          }));

          // Calculate totals
          const subtotal = order.totalAmount - order.totalTax;
          const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
          const pendingAmount = Math.max(0, order.totalAmount - paidAmount);

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
            paid_amount: paidAmount,
            pending_amount: pendingAmount,
            status: pendingAmount > 0 ? 'partial' : 'completed',
            is_split_payment: order.payments.length > 1,
            redemption_amount: order.redemptionAmount,
            redemption_source: order.redemptionSource,
            user_id: SURAT_USER_ID,
            tenant_id: SURAT_TENANT_ID,
            duplicate_protection_key: `${orderId}-${order.invoiceNo}-import`,
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
                warnings.push(`Failed to update stock for product: ${service.service}`);
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

      // Set results
      setImportResults({
        success: successCount,
        errors: errorCount,
        warnings
      });

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
      if (!importResults) {
        setImportProgress(0);
        setImportStatus('');
      }
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📊 April 2025 Data Importer
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          <strong>✨ Advanced Import Features:</strong>
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Service and Product orders" secondary="Handles both services and product sales" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Multi-expert orders" secondary="Supports multiple stylists per order" />
          </ListItem>
          <ListItem>
            <ListItemIcon><InventoryIcon color="info" /></ListItemIcon>
            <ListItemText primary="Automatic stock management" secondary="Deducts product quantities and tracks transactions" />
          </ListItem>
          <ListItem>
            <ListItemIcon><ErrorIcon color="warning" /></ListItemIcon>
            <ListItemText primary="Data validation" secondary="Validates and reports data quality issues" />
          </ListItem>
        </List>
      </Paper>

      <input
        type="file"
        id="april-import-input"
        style={{ display: 'none' }}
        onChange={handleImport}
        accept=".xlsx,.xls"
        disabled={isImporting}
      />
      
      <label htmlFor="april-import-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadFileIcon />}
          disabled={isImporting}
          size="large"
          sx={{ mb: 2 }}
        >
          {isImporting ? 'Importing...' : 'Import APRIL-2025_combine.xlsx'}
        </Button>
      </label>

      {isImporting && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            {importStatus}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={importProgress} 
            sx={{ mb: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="textSecondary">
            {Math.round(importProgress)}% complete
          </Typography>
        </Box>
      )}

      {importResults && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            📈 Import Results
          </Typography>
          
          {importResults.success > 0 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Successfully imported {importResults.success} orders
            </Alert>
          )}
          
          {importResults.errors > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to import {importResults.errors} orders
            </Alert>
          )}
          
          {importResults.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Warnings:</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {importResults.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AprilDataImporter; 