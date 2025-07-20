import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Grid,
  Divider,
  ButtonGroup,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardHeader,
  TablePagination,
  Container,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  LocalPrintshopOutlined as PrintIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Spa as SpaIcon,
  Inventory as InventoryIcon,
  ShoppingBag as ShoppingBagIcon,
  PaymentRounded as PaymentIcon,
  DateRange as DateRangeIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  LocalMall as LocalMallIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  ContentCut as ContentCutIcon,
  Delete as DeleteIcon,
  CardMembership as CardMembershipIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/format'
import { AccessibleDialog } from '../components/AccessibleDialog'
import { exportToCSV, exportToPDF, formatOrdersForExport, orderExportHeaders } from '../utils/exportUtils'
import { printBill } from '../utils/printUtils'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PaymentMethod, usePOS, PaymentDetail } from '../hooks/usePOS'
import CompletePaymentDialog from '../components/orders/CompletePaymentDialog'
import DateRangePicker from '../components/dashboard/DateRangePicker'
import { toast } from 'react-toastify'
import ErrorBoundary from '../components/ErrorBoundary'
import { useNavigate } from 'react-router-dom'
import { Order as BaseOrder } from '../models/orderTypes'
import { useServiceCollections } from '../hooks/useServiceCollections'
import { supabase, TABLES } from '../utils/supabase/supabaseClient'
import { useQueryClient } from '@tanstack/react-query'
import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import AggregatedExcelImporter from '../components/orders/AggregatedExcelImporter'

// Extended Order interface that encapsulates all the properties we need
type ExtendedOrder = {
  id: string;
  created_at?: string;
  date?: string;
  client_name?: string; 
  customer_name?: string;
  stylist_name?: string;
  stylist?: { name?: string; id?: string };
  status: 'pending' | 'completed' | 'cancelled' | string;
  total?: number;
  total_amount?: number;
  pending_amount?: number;
  payment_method?: string;
  invoice_number?: string; // Add this
  payments?: any[];
  services?: any[];
  consumption_purpose?: string;
  _productCategories?: string[];
  _serviceCategories?: string[];
  // Required for type assertion compatibility
  [key: string]: any;
};

// Tab values for order categories
enum OrderTab {
  ALL = 'all',
  COMPLETED = 'completed',
  PENDING = 'pending',
  SALON_CONSUMPTION = 'salon_consumption',
  SERVICES = 'services',
  PRODUCTS = 'products',
  MEMBERSHIPS = 'memberships',
}

export default function Orders() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { orders, isLoading, refreshOrders, deleteOrderById, deleteAllOrders, deleteOrdersInDateRange } = useOrders()
  const { updateOrderPayment } = usePOS()
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<OrderTab>(OrderTab.ALL)
  
  // Updated date range state to work with DateRangePicker
  const [startDate, setStartDate] = useState<Date | null>(null) // Show all orders by default
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  
  const [isSalonPurchaseFilter, setIsSalonPurchaseFilter] = useState<string>('all')
  
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null)
  
  // Delete all orders confirmation
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  
  // Order stats
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    salonPurchases: 0,
    services: 0,
    products: 0,
    memberships: 0,
    totalRevenue: 0,
  })

  // New state for import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Convert any order to our ExtendedOrder type
  const normalizeOrder = (order: any): ExtendedOrder => {
    let services = order.services;
    if (typeof services === 'string') {
      try {
        services = JSON.parse(services);
      } catch (e) {
        console.warn(`Could not parse services for order ${order.id}`, e);
        services = [];
      }
    }

    let payments = order.payments;
    if (typeof payments === 'string') {
      try {
        payments = JSON.parse(payments);
      } catch (e) {
        console.warn(`Could not parse payments for order ${order.id}`, e);
        payments = [];
      }
    }

    // Ensure services and payments are arrays
    if (!Array.isArray(services)) {
      services = [];
    }
    if (!Array.isArray(payments)) {
      payments = [];
    }

    return {
      ...order,
      services,
      payments,
      status: order.status || 'pending',
      client_name: order.client_name || order.customer_name,
      customer_name: order.customer_name || order.client_name,
      total: order.total || order.total_amount || 0,
      total_amount: order.total_amount || order.total || 0,
    } as ExtendedOrder;
  };

  const handleImportOrders = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    setIsImporting(true);
    setImportDialogOpen(false);
    const loadingToast = toast.info('Importing orders...', { autoClose: false });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get raw data with headers for column mapping
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Ensure dates are parsed as strings
      });

      if (json.length === 0) {
        toast.warn('The selected file is empty or has no data.');
        setIsImporting(false);
        toast.dismiss(loadingToast);
        return;
      }

      // Helper function to find column index
      function findColumnIndex(headers: any[], possibleNames: string[]): number {
        for (const name of possibleNames) {
          const index = headers.findIndex(h => h && h.toString().toLowerCase().includes(name.toLowerCase()));
          if (index !== -1) return index;
        }
        return -1;
      }

      // Enhanced column mapping for flexible import
      const headers = rawData[0] || [];
      const columnMap = {
        // Common columns
        date: findColumnIndex(headers, ['Date', 'date', 'DATE']),
        guestName: findColumnIndex(headers, ['Guest Name', 'guest name', 'Customer Name', 'customer name', 'Client Name']),
        guestNumber: findColumnIndex(headers, ['Guest Number', 'guest number', 'Phone', 'phone', 'Mobile', 'Contact']),
        staff: findColumnIndex(headers, ['Staff', 'staff', 'Stylist', 'stylist', 'Employee']),
        category: findColumnIndex(headers, ['Category', 'category', 'CATEGORY']),
        qty: findColumnIndex(headers, ['Qty', 'qty', 'Quantity', 'quantity', 'QTY']),
        unitPrice: findColumnIndex(headers, ['Unit Price', 'unit price', 'Price', 'price', 'Rate']),
        discount: findColumnIndex(headers, ['Discount', 'discount', 'DISCOUNT']),
        taxableValue: findColumnIndex(headers, ['Taxable Value', 'taxable value', 'Taxable Amount']),
        cgst: findColumnIndex(headers, ['Cgst', 'cgst', 'CGST']),
        sgst: findColumnIndex(headers, ['Sgst', 'sgst', 'SGST']),
        total: findColumnIndex(headers, ['Total', 'total', 'TOTAL']),
        // Product-specific columns
        productName: findColumnIndex(headers, ['PRODUCT NAME', 'Product Name', 'product name', 'Product']),
        hsnCode: findColumnIndex(headers, ['HSN CODE', 'HSN Code', 'hsn code', 'HSN']),
        type: findColumnIndex(headers, ['TYPE', 'Type', 'type', 'Product Type']),
        // Service-specific columns
        serviceName: findColumnIndex(headers, ['Service', 'service', 'SERVICE']),
        paymentMode: findColumnIndex(headers, ['Payment Mode', 'payment mode', 'Payment Method', 'payment method']),
        subtotal: findColumnIndex(headers, ['Subtotal', 'subtotal', 'Subtotal(without tax & redemption)']),
        tax: findColumnIndex(headers, ['Tax', 'tax', 'TAX'])
      };

      // Helper function to get value from row using column mapping
      function getValueFromRow(row: any, rowArray: any[], columnIndex: number, fallback: any = null): any {
        if (columnIndex === -1) return fallback;
        return rowArray[columnIndex] || row[headers[columnIndex]] || fallback;
      }

      // Helper function to parse Excel date
      function parseExcelDate(dateValue: any): Date {
        if (!dateValue) return new Date();
        
        // If it's a number (Excel serial date)
        if (typeof dateValue === 'number') {
          return new Date((dateValue - 25569) * 86400 * 1000);
        }
        
        // If it's already a string, try to parse it
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      }

      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      const tenantId = user?.email || 'salon_admin';

      // Validate user authentication
      if (!user?.id) {
        toast.error('Please log in to import orders');
        setIsImporting(false);
        toast.dismiss(loadingToast);
        return;
      }

      let successCount = 0;
      let failCount = 0;
      let isProductImport = false;
      
      // Determine import type based on columns
      if (columnMap.productName !== -1) {
        isProductImport = true;
        toast.info('🛍️ Product import detected', { autoClose: 2000 });
      } else if (columnMap.serviceName !== -1) {
        toast.info('💄 Service import detected', { autoClose: 2000 });
      }

      console.log('📋 Column mapping:', columnMap);
      console.log('📊 Import type:', isProductImport ? 'Product' : 'Service');

      for (let i = 0; i < json.length; i++) {
        const row = json[i];
        const rowArray = rawData[i + 1]; // +1 because rawData includes header
        
        try {
          const orderId = uuidv4();
          
          // Extract common data
          const dateValue = getValueFromRow(row, rowArray, columnMap.date);
          const parsedDate = parseExcelDate(dateValue);
          const guestName = getValueFromRow(row, rowArray, columnMap.guestName, 'Walk-in').toString().trim();
          const guestNumber = getValueFromRow(row, rowArray, columnMap.guestNumber, '').toString().trim();
          const staff = getValueFromRow(row, rowArray, columnMap.staff, 'Admin').toString().trim();
          const category = getValueFromRow(row, rowArray, columnMap.category, 'General').toString().trim();
          const qty = Number(getValueFromRow(row, rowArray, columnMap.qty, 1)) || 1;
          const unitPrice = Number(getValueFromRow(row, rowArray, columnMap.unitPrice, 0)) || 0;
          const discount = Number(getValueFromRow(row, rowArray, columnMap.discount, 0)) || 0;
          const cgst = Number(getValueFromRow(row, rowArray, columnMap.cgst, 0)) || 0;
          const sgst = Number(getValueFromRow(row, rowArray, columnMap.sgst, 0)) || 0;
          const total = Number(getValueFromRow(row, rowArray, columnMap.total, 0)) || 0;
          
          let orderPayload: any = {};

          if (isProductImport) {
            // Product import logic
            const productName = getValueFromRow(row, rowArray, columnMap.productName, 'Unknown Product').toString().trim();
            const hsnCode = getValueFromRow(row, rowArray, columnMap.hsnCode, '').toString().trim();
            const productType = getValueFromRow(row, rowArray, columnMap.type, '').toString().trim();
            const taxableValue = Number(getValueFromRow(row, rowArray, columnMap.taxableValue, 0)) || 0;
            
            orderPayload = {
              id: orderId,
              created_at: parsedDate.toISOString(),
              date: parsedDate.toISOString(),
              client_name: guestName,
              client_phone: guestNumber,
              customer_name: guestName,
              stylist_name: staff,
              total: total,
              total_amount: total,
              payment_method: 'cash', // Default to cash for products
              status: 'completed',
              subtotal: taxableValue || (unitPrice * qty),
              tax: cgst + sgst,
              discount: discount,
              is_walk_in: true,
              type: 'product',
              tenant_id: tenantId,
              user_id: user.id,
              services: JSON.stringify([{
                id: uuidv4(),
                name: productName,
                service_name: productName,
                product_name: productName,
                category: category,
                quantity: qty,
                price: unitPrice,
                unit_price: unitPrice,
                total: unitPrice * qty,
                type: 'product',
                hsn_code: hsnCode,
                product_type: productType,
                cgst: cgst,
                sgst: sgst,
                taxable_value: taxableValue
              }]),
              payments: JSON.stringify([{
                payment_method: 'cash',
                amount: total,
                method: 'cash'
              }]),
              // Store original Excel data for reference
              stock_snapshot: JSON.stringify({
                original_row: row,
                excel_row_index: i + 1,
                import_timestamp: new Date().toISOString(),
                import_type: 'product'
              })
            };

          } else {
            // Service import logic
            const serviceName = getValueFromRow(row, rowArray, columnMap.serviceName, 'General Service').toString().trim();
            const rawPayment = getValueFromRow(row, rowArray, columnMap.paymentMode, 'Cash').toString();
            const subtotalValue = Number(getValueFromRow(row, rowArray, columnMap.subtotal, 0)) || 0;
            const taxValue = Number(getValueFromRow(row, rowArray, columnMap.tax, 0)) || 0;
            
            // Parse payment method
            const methodMatch = rawPayment.match(/^[A-Za-z ]+/);
            const method = (methodMatch ? methodMatch[0].trim().toLowerCase() : 'cash').replace(' ', '_');

            orderPayload = {
              id: orderId,
              created_at: parsedDate.toISOString(),
              date: parsedDate.toISOString(),
              client_name: guestName,
              client_phone: guestNumber,
              customer_name: guestName,
              stylist_name: staff,
              total: total,
              total_amount: total,
              payment_method: method,
              status: 'completed',
              subtotal: subtotalValue || (unitPrice * qty),
              tax: taxValue || (cgst + sgst),
              discount: discount,
              is_walk_in: true,
              type: 'service',
              tenant_id: tenantId,
              user_id: user.id,
              services: JSON.stringify([{
                id: uuidv4(),
                name: serviceName,
                service_name: serviceName,
                category: category,
                quantity: qty,
                price: unitPrice,
                unit_price: unitPrice,
                total: unitPrice * qty,
                type: 'service'
              }]),
              payments: JSON.stringify([{
                payment_method: method,
                amount: total,
                method: method
              }]),
              // Store original Excel data for reference
              stock_snapshot: JSON.stringify({
                original_row: row,
                excel_row_index: i + 1,
                import_timestamp: new Date().toISOString(),
                import_type: 'service'
              })
            };
          }

          console.log(`Processing row ${i + 1}:`, orderPayload);

          const { error: insertError } = await supabase.from('pos_orders').insert(orderPayload);
          if (insertError) {
            console.error(`Error inserting row ${i + 1}:`, insertError);
            failCount++;
          } else {
            successCount++;
          }
        } catch (rowError) {
          console.error(`Error processing row ${i + 1}:`, rowError);
          failCount++;
        }
      }

      toast.dismiss(loadingToast);
      
      if (successCount > 0) {
        toast.success(`✅ Import complete! ${successCount} ${isProductImport ? 'products' : 'services'} imported successfully.`);
      }
      
      if (failCount > 0) {
        toast.error(`❌ ${failCount} rows failed to import. Check console for details.`);
      }
      
      refreshOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error importing orders:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to import orders. Check console for details.');
    } finally {
      setIsImporting(false);
      // Reset file input
      const fileInput = document.getElementById('import-orders-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleProductImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    const loadingToast = toast.info('Importing product orders...', { autoClose: false });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let failCount = 0;

      for (const row of json) {
        try {
          const orderId = uuidv4();
          const totalAmount = parseFloat(row['Total']) || 0;
          const tax = (parseFloat(row['Cgst']) || 0) + (parseFloat(row['Sgst']) || 0);

          const orderPayload = {
            id: orderId,
            created_at: new Date(row['Date']),
            client_name: row['Guest Name'] || 'Walk-in',
            stylist_name: row['Staff'] || 'Admin',
            total: totalAmount,
            total_amount: totalAmount,
            payment_method: 'cash', // Defaulting as not present in product sheet
            status: 'completed',
            subtotal: parseFloat(row['Taxable Value']) || 0,
            tax: tax,
            discount: parseFloat(row['Discount']) || 0,
            is_walk_in: true,
            payments: [{ method: 'cash', amount: totalAmount }],
            services: [
              {
                id: uuidv4(),
                name: row['PRODUCT NAME'],
                product_name: row['PRODUCT NAME'],
                category: row['Category'],
                quantity: parseInt(row['Qty'], 10) || 1,
                price: parseFloat(row['Unit Price']) || 0,
                unitPrice: parseFloat(row['Unit Price']) || 0,
                hsn_code: row['HSN CODE'],
                type: 'product',
              },
            ],
          };

          const { error } = await supabase.from('pos_orders').insert(orderPayload);

          if (error) {
            console.error('Error inserting order:', error);
            failCount++;
          } else {
            successCount++;
          }
        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
          failCount++;
        }
      }

      toast.dismiss(loadingToast);
      if (failCount > 0) {
        toast.error(`${failCount} product orders failed to import. ${successCount} succeeded.`);
      } else {
        toast.success(`${successCount} product orders imported successfully!`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred during product import.');
      console.error('Product import error:', error);
    }
  };

  // Aggregate multi-expert orders with same appointment_id
  const aggregatedOrders = useMemo(() => {
    if (!orders) return [];

    const result: ExtendedOrder[] = [];
    const aggMap: Record<string, ExtendedOrder> = {};

    console.log('[Orders Aggregation] Processing orders:', orders.length);
    
    // Group orders by appointment_id and multi_expert_group_id to find potential multi-expert orders
    const ordersByAppointment: Record<string, ExtendedOrder[]> = {};
    const ordersByMultiExpertGroup: Record<string, ExtendedOrder[]> = {};
    const standaloneOrders: ExtendedOrder[] = [];
    
    orders.forEach(raw => {
      const order = normalizeOrder(raw);
      console.log('[Orders Aggregation] Order:', {
        id: order.id,
        client: order.client_name,
        stylist: order.stylist_name,
        multi_expert: order.multi_expert,
        appointment_id: order.appointment_id,
        multi_expert_group_id: order.multi_expert_group_id,
        total: order.total
      });
      
      if (order.appointment_id) {
        if (!ordersByAppointment[order.appointment_id]) {
          ordersByAppointment[order.appointment_id] = [];
        }
        ordersByAppointment[order.appointment_id].push(order);
      } else if (order.multi_expert_group_id) {
        // Walk-in multi-expert orders grouped by multi_expert_group_id
        if (!ordersByMultiExpertGroup[order.multi_expert_group_id]) {
          ordersByMultiExpertGroup[order.multi_expert_group_id] = [];
        }
        ordersByMultiExpertGroup[order.multi_expert_group_id].push(order);
      } else {
        standaloneOrders.push(order);
      }
    });

    // Process appointment-based orders
    Object.entries(ordersByAppointment).forEach(([appointmentId, appointmentOrders]) => {
      if (appointmentOrders.length > 1) {
        // This is a multi-expert appointment - aggregate the orders
        console.log('[Orders Aggregation] Aggregating multi-expert orders for appointment:', appointmentId, 'orders:', appointmentOrders.length);
        
        // Use the first order as the base
        const baseOrder = appointmentOrders[0];
        
        // For multi-expert orders, calculate the original customer-facing total from services
        // The individual orders contain split amounts for stylist commission tracking,
        // but the customer should see the original full amount
        
        let finalTotal, finalSubtotal, finalTax;
        
        // Aggregate all payments from the split orders
        const aggregatedPayments: any[] = [];
        const paymentSummary: Record<string, number> = {};

        appointmentOrders.forEach(order => {
          if (order.payments && Array.isArray(order.payments)) {
            order.payments.forEach(p => {
              paymentSummary[p.payment_method] = (paymentSummary[p.payment_method] || 0) + p.amount;
            });
          }
        });
        
        for (const [method, amount] of Object.entries(paymentSummary)) {
          aggregatedPayments.push({ payment_method: method, amount: amount });
        }
        
        // Calculate the correct customer-facing total from the services
        // Aggregate services by name to avoid counting duplicates from multiple experts
        const serviceAggregation: Record<string, { 
          quantity: number; 
          unit_price: number; 
          total_price: number;
          name: string;
        }> = {};
        
        appointmentOrders.forEach(order => {
          if (order.services && Array.isArray(order.services)) {
            order.services.forEach((service: any) => {
              // Handle both old and new service field names - prioritize 'name' field from actual data
              const serviceName = service.name || service.service_name || service.item_name;
              const quantity = service.quantity || 1;
              // Handle different price field names - prioritize 'unitPrice' from actual data
              const price = service.unitPrice || service.price || service.unit_price || 0;
              
              if (!serviceAggregation[serviceName]) {
                serviceAggregation[serviceName] = {
                  quantity: 0,
                  unit_price: 0,
                  total_price: 0,
                  name: serviceName
                };
              }
              
              // Sum up the prices from all experts working on this service
              serviceAggregation[serviceName].unit_price += price;
              serviceAggregation[serviceName].total_price += (price * quantity);
            });
          }
        });
        
        // Calculate totals from aggregated services
        finalSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        finalTax = finalSubtotal * 0.18; // 18% GST
        finalTotal = finalSubtotal + finalTax - (baseOrder.discount || 0);
        
        console.log('[Orders Aggregation] Calculated customer-facing total from services. Total:', finalTotal, 'Subtotal:', finalSubtotal, 'Tax:', finalTax);
        
        aggMap[appointmentId] = {
          ...baseOrder,
          id: baseOrder.appointment_id, // Use appointment_id as a unique key for the map
          aggregated_from_ids: appointmentOrders.map(o => o.id), // For debugging
          aggregated_multi_expert: true,
          total: finalTotal, // Use the correct aggregated total
          total_amount: finalTotal,
          subtotal: finalSubtotal,
          tax: finalTax,
          stylist_name: appointmentOrders.map(o => o.stylist_name || o.stylist?.name).filter(Boolean).join(', '),
          stylists: appointmentOrders.map(o => o.stylist || { name: o.stylist_name, id: o.stylist_id }).filter(s => s && s.id),
          payments: aggregatedPayments, // Use the aggregated payments
          services: Object.values(serviceAggregation).map(s => ({
            service_name: s.name,
            item_name: s.name,
            quantity: s.quantity,
            price: s.unit_price,
            type: 'service'
          })),
          stylist_names: [], // Initialize empty array for stylist names
        };

        // Aggregate stylist names from all orders
        appointmentOrders.forEach(order => {
          if (order.stylist_name && !aggMap[appointmentId].stylist_names.includes(order.stylist_name)) {
            aggMap[appointmentId].stylist_names.push(order.stylist_name);
          }
        });

        // Update stylist_name to show all stylists
        aggMap[appointmentId].stylist_name = aggMap[appointmentId].stylist_names.filter(Boolean).join(', ');
        
        console.log('[Orders Aggregation] Created aggregate for appointment:', appointmentId, 'stylists:', aggMap[appointmentId].stylist_name, 'total:', aggMap[appointmentId].total, 'items:', aggMap[appointmentId].services?.length);
        
        result.push(aggMap[appointmentId] as ExtendedOrder);
      } else {
        // Single order for this appointment
        console.log('[Orders Aggregation] Added single appointment order:', appointmentOrders[0].id);
        result.push(appointmentOrders[0]);
      }
    });

    // Process walk-in multi-expert orders (grouped by multi_expert_group_id)
    Object.entries(ordersByMultiExpertGroup).forEach(([groupId, groupOrders]) => {
      if (groupOrders.length > 1) {
        // This is a walk-in multi-expert order - aggregate the orders
        console.log('[Orders Aggregation] Aggregating walk-in multi-expert orders for group:', groupId, 'orders:', groupOrders.length);
        
        // Use the first order as the base
        const baseOrder = groupOrders[0];
        
        // Aggregate payments for walk-in multi-expert orders
        const aggregatedPayments: any[] = [];
        const paymentSummary: Record<string, number> = {};
        groupOrders.forEach(order => {
          if (order.payments && Array.isArray(order.payments)) {
            order.payments.forEach(p => {
              paymentSummary[p.payment_method] = (paymentSummary[p.payment_method] || 0) + p.amount;
            });
          }
        });
        for (const [method, amount] of Object.entries(paymentSummary)) {
          aggregatedPayments.push({ payment_method: method, amount: amount });
        }
        
        // Sum up the total from all orders in the group
        const totalAmount = groupOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const subtotal = groupOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
        const tax = groupOrders.reduce((sum, order) => sum + (order.tax || 0), 0);
        const discount = groupOrders.reduce((sum, order) => sum + (order.discount || 0), 0);
        const allServices = groupOrders.flatMap(o => o.services || []);
        
        aggMap[groupId] = {
          ...baseOrder,
          id: groupId, // Use group_id as a unique key
          aggregated_multi_expert: true,
          total: totalAmount,
          total_amount: totalAmount,
          subtotal: subtotal,
          tax: tax,
          discount: discount,
          stylist_name: groupOrders.map(o => o.stylist_name || o.stylist?.name).filter(Boolean).join(', '),
          stylists: groupOrders.map(o => o.stylist || { name: o.stylist_name, id: o.stylist_id }).filter(s => s && s.id),
          services: allServices,
          payments: aggregatedPayments, // Use aggregated payments
          stylist_names: [], // Initialize empty array for stylist names
        };

        // Aggregate stylist names from all orders
        groupOrders.forEach(order => {
          if (order.stylist_name && !aggMap[groupId].stylist_names.includes(order.stylist_name)) {
            aggMap[groupId].stylist_names.push(order.stylist_name);
          }
        });

        // Update stylist_name to show all stylists
        aggMap[groupId].stylist_name = aggMap[groupId].stylist_names.filter(Boolean).join(', ');
        
        console.log('[Orders Aggregation] Created walk-in aggregate for group:', groupId, 'stylists:', aggMap[groupId].stylist_name, 'total:', aggMap[groupId].total, 'items:', aggMap[groupId].services?.length);
        
        result.push(aggMap[groupId] as ExtendedOrder);
      } else {
        // Single order in this group (shouldn't happen, but handle gracefully)
        console.log('[Orders Aggregation] Added single walk-in multi-expert order:', groupOrders[0].id);
        result.push(groupOrders[0]);
      }
    });

    // Add standalone orders (no appointment_id or multi_expert_group_id)
    standaloneOrders.forEach(order => {
      console.log('[Orders Aggregation] Added standalone order:', order.id);
      result.push(order);
    });

    console.log('[Orders Aggregation] Final result count:', result.length, 'from original:', orders.length);

    // Sort by created_at desc to match previous behaviour
    return result.sort((a, b) => {
      const da = new Date(a.created_at || '').getTime();
      const db = new Date(b.created_at || '').getTime();
      return db - da;
    });
  }, [orders]);
  
  const isSalonConsumptionOrder = (order: ExtendedOrder) => {
    // Check all possible ways an order can be marked as salon consumption
    return (
      order.is_salon_consumption === true || 
      order.consumption_purpose || // Check for consumption_purpose field we added
      order.client_name === 'Salon Consumption' || // Match the client_name we set in handleCreateSalonConsumption
      (order.services && order.services.some((s: any) => s.for_salon_use === true)) // Check if any service is marked for salon use
    );
  };

  const getPurchaseType = (order: ExtendedOrder) => {
    if (!order) {
      return 'service'; // Default fallback
    }

    // Handle orders that might not have services array or have empty services
    if (!order.services || !Array.isArray(order.services) || order.services.length === 0) {
      // Check if this is a salon consumption order
      if (isSalonConsumptionOrder(order)) {
        return 'service'; // Salon consumption orders are typically service-related
      }
      
      // Try to determine type from other indicators
      // Check for membership-related amounts
      if (order.payments && order.payments.some((p: any) => p.payment_method === 'membership')) {
        return 'service'; // Services paid with membership
      }
      
      // Check for typical membership purchase amounts
      const total = order.total || order.total_amount || 0;
      if ([1000, 5000, 10000, 15000, 25000, 50000, 100000].includes(total)) {
        return 'membership'; // Likely membership purchase
      }
      
      // Default to service if we can't determine
      return 'service';
    }
    
    // Helper function to check if a service is a membership
    const isMembershipService = (service: any) => {
      if (!service) return false;
      
      // Check explicit type/category
      if (service.type === 'membership' || service.category === 'membership') {
        return true;
      }
      
      // Check for membership fields
      if (service.duration_months || service.benefit_amount || service.benefitAmount) {
        return true;
      }
      
      // Check name patterns (more comprehensive)
      const serviceName = (service.item_name || service.service_name || service.name || '').toLowerCase();
      const membershipPatterns = [
        'silver', 'gold', 'platinum', 'diamond', 
        'membership', 'member', 'tier', 'package',
        'subscription', 'plan'
      ];
      
      return membershipPatterns.some(pattern => serviceName.includes(pattern));
    };
    
    // Check for membership services first
    const hasMemberships = order.services.some(isMembershipService) || 
    // Check if this is a membership purchase (NOT using membership balance to pay)
    // Look for orders where someone bought a membership (paid with cash/card, not membership balance)
    (order.payments && 
     order.payments.every((payment: any) => payment.payment_method !== 'membership') && // Not paid with membership balance
     [1000, 5000, 10000, 15000, 25000, 50000, 100000].includes(order.total || order.total_amount || 0)) || // Common membership prices
    // Or check for specific membership-related fields
    (order.services && order.services.some((service: any) => 
      service.benefit_amount || service.benefitAmount || service.duration_months
    ));
    
    // Removed debug logging for production

    // Enhanced product detection with smart fallbacks
    const hasProducts = order.services.some((service: any) => {
      if (!service) return false;
      const isMembership = isMembershipService(service);
      
      // Check for explicit product type/category
      if (service.type === 'product' || service.category === 'product') {
        return !isMembership;
      }
      
      // Smart detection for products based on product-like attributes
      const hasProductAttributes = service.product_id || service.product_name || 
                                   service.hsn_code || service.stock_quantity !== undefined;
      
      return hasProductAttributes && !isMembership;
    });
    
    // Check for regular services (exclude membership services and products)
    const hasServices = order.services.some((service: any) => {
      if (!service) return false;
      const isMembership = isMembershipService(service);
      
      // Explicit service type
      if (service.type === 'service' || service.category === 'service') {
        return !isMembership;
      }
      
      // Check if it's explicitly a product
      const isExplicitProduct = service.type === 'product' || service.category === 'product';
      const hasProductAttributes = service.product_id || service.product_name || 
                                   service.hsn_code || service.stock_quantity !== undefined;
      const isProduct = isExplicitProduct || hasProductAttributes;
      
      // Only treat as service if it's not a product or membership
      return !isProduct && !isMembership;
    });
    
    // Check product, service, and membership subcategories
    const productCategories = new Set();
    const serviceCategories = new Set();
    const membershipCategories = new Set();
    
    order.services.forEach((service: any) => {
      if (service) {
        const isMembershipItem = isMembershipService(service);
        
        if (service.type === 'product' && service.category && !isMembershipItem) {
          productCategories.add(service.category.toLowerCase());
        } else if ((!service.type || service.type === 'service') && service.category && !isMembershipItem) {
          serviceCategories.add(service.category.toLowerCase());
        } else if (isMembershipItem) {
          membershipCategories.add('membership');
        }
      }
    });
    
    // Store the categories for filtering
    (order as any)._productCategories = Array.from(productCategories);
    (order as any)._serviceCategories = Array.from(serviceCategories);
    (order as any)._membershipCategories = Array.from(membershipCategories);
    
    // Return membership if only memberships are present
    if (hasMemberships && !hasServices && !hasProducts) return 'membership';
    
    // Return combined types if multiple types are present
    const types = [];
    if (hasServices) types.push('service');
    if (hasProducts) types.push('product');
    if (hasMemberships) types.push('membership');
    
    if (types.length > 1) {
      // Return specific combination instead of generic "both"
      if (types.includes('membership') && types.includes('service') && types.includes('product')) {
        return 'service_product_membership';
      } else if (types.includes('membership') && types.includes('service')) {
        return 'service_membership';
      } else if (types.includes('membership') && types.includes('product')) {
        return 'product_membership';
      } else {
        return 'both'; // service + product (no membership)
      }
    }
    if (hasProducts) return 'product';
    if (hasMemberships) return 'membership';
    return 'service'; // Default to service for all remaining cases
  };

  const filteredOrders = useMemo(() => {
    if (!aggregatedOrders) return [];
    
    return aggregatedOrders.map(orderRaw => {
      // Create a copy of the order to modify and normalize it
      const order = normalizeOrder(orderRaw);
      
      // If this is a salon consumption order, always set status to completed
      if (isSalonConsumptionOrder(order)) {
        order.status = 'completed';
      }
      
      return order; // order is now ExtendedOrder
    }).filter((order) => { // order here is ExtendedOrder
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        (order.id && order.id.toLowerCase().includes(searchLower)) ||
        (order.invoice_number && order.invoice_number.toLowerCase().includes(searchLower)) || // Search by invoice number
        ((order.client_name || order.customer_name) && 
         (order.client_name || order.customer_name || '').toLowerCase().includes(searchLower)) ||
        (order.stylist && order.stylist.name && order.stylist.name.toLowerCase().includes(searchLower)) ||
        (order.created_at && new Date(order.created_at).toLocaleDateString().includes(searchLower));
        
      // Payment method filter
      const matchesPayment = 
        paymentFilter === 'all' || 
        order.payment_method === paymentFilter ||
        (paymentFilter === 'split' && Array.isArray(order.payments) && order.payments.length > 0);
      
      // Status filter  
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Salon consumption filter
      const matchesSalonConsumption = 
        isSalonPurchaseFilter === 'all' || 
        (isSalonPurchaseFilter === 'true' && isSalonConsumptionOrder(order)) ||
        (isSalonPurchaseFilter === 'false' && !isSalonConsumptionOrder(order));
      
      // Purchase type filter - enhanced with categories and membership combinations
      const orderType = getPurchaseType(order);
      let matchesPurchaseType = false;
      
      if (purchaseTypeFilter === 'all') {
        matchesPurchaseType = true;
      } else if (purchaseTypeFilter === orderType) {
        // Exact match
        matchesPurchaseType = true;
      } else if (purchaseTypeFilter === 'membership') {
        // Match any order containing memberships
        matchesPurchaseType = orderType === 'membership' || 
                            orderType === 'service_membership' || 
                            orderType === 'product_membership' || 
                            orderType === 'service_product_membership';
      } else if (purchaseTypeFilter === 'service') {
        // Match any order containing services
        matchesPurchaseType = orderType === 'service' || 
                            orderType === 'both' || 
                            orderType === 'service_membership' || 
                            orderType === 'service_product_membership';
      } else if (purchaseTypeFilter === 'product') {
        // Match any order containing products
        matchesPurchaseType = orderType === 'product' || 
                            orderType === 'both' || 
                            orderType === 'product_membership' || 
                            orderType === 'service_product_membership';
      } else if (purchaseTypeFilter === 'both') {
        // Match mixed service/product orders (legacy support)
        matchesPurchaseType = orderType === 'both' || 
                            orderType === 'service_product_membership';
      } else if (purchaseTypeFilter.startsWith('product:')) {
        // Product category filtering
        const category = purchaseTypeFilter.split(':')[1];
        matchesPurchaseType = (orderType === 'product' || orderType === 'both' || 
                            orderType === 'product_membership' || orderType === 'service_product_membership') && 
                            (order as any)._productCategories && 
                            (order as any)._productCategories.some((cat: string) => cat.includes(category));
      } else if (purchaseTypeFilter.startsWith('service:')) {
        // Service category filtering
        const category = purchaseTypeFilter.split(':')[1];
        matchesPurchaseType = (orderType === 'service' || orderType === 'both' || 
                            orderType === 'service_membership' || orderType === 'service_product_membership') && 
                            (order as any)._serviceCategories && 
                            (order as any)._serviceCategories.some((cat: string) => cat.includes(category));
      }
        
      // Date range filter using startDate and endDate
      let matchesDateRange = true;
      if (startDate) {
        const orderDate = new Date(order.created_at || '');
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        if (orderDate < startOfDay) {
          matchesDateRange = false;
        }
      }
      
      if (endDate && matchesDateRange) {
        const orderDate = new Date(order.created_at || '');
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (orderDate > endOfDay) {
          matchesDateRange = false;
        }
      }
      
      return matchesSearch && matchesPayment && matchesStatus && matchesSalonConsumption && matchesPurchaseType && matchesDateRange;
    });
  }, [aggregatedOrders, searchQuery, paymentFilter, statusFilter, purchaseTypeFilter, isSalonPurchaseFilter, startDate, endDate]);

  // Update order stats when filtered orders change (based on date range and other filters)
  useEffect(() => {
    if (filteredOrders) {
      const stats = {
        total: filteredOrders.length,
        completed: filteredOrders.filter(order => normalizeOrder(order).status === 'completed').length,
        pending: filteredOrders.filter(order => normalizeOrder(order).status === 'pending').length,
        salonPurchases: filteredOrders.filter(order => isSalonConsumptionOrder(normalizeOrder(order))).length,
        services: filteredOrders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'service' || type === 'both';
        }).length,
        products: filteredOrders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'product' || type === 'both';
        }).length,
        memberships: filteredOrders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'membership' || 
                 type === 'service_membership' || 
                 type === 'product_membership' || 
                 type === 'service_product_membership';
        }).length,
        totalRevenue: filteredOrders.reduce((sum, orderRaw) => {
          const order = normalizeOrder(orderRaw);
          // Only count completed orders or the paid portion of pending orders
          if (order.status === 'completed') {
            return sum + (order.total || 0);
          } else if (order.status === 'pending' && (order.pending_amount || 0) < (order.total || 0)) {
            return sum + ((order.total || 0) - (order.pending_amount || 0));
          }
          return sum;
        }, 0),
      };
      setOrderStats(stats);
    }
  }, [filteredOrders]);

  // When orders are loaded from the API, normalize them (commented out to prevent recursion)
  /*
  useEffect(() => {
    if (rawOrders?.length) {
      setOrders(rawOrders.map(normalizeOrder));
    }
  }, [rawOrders]);
  */

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    // Clear the selected order after dialog closes
    setTimeout(() => setSelectedOrder(null), 300)
  }
  
  const handlePrintBill = (order: any) => {
    printBill(order)
  }

  const handleDeleteOrder = async (order: any) => {
    setOrderToDelete(order)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    
    try {
      const orderId = orderToDelete.order_id || orderToDelete.id
      
      if (!orderId) {
        toast.error('Order ID not found')
        return
      }
      
      toast.info('Deleting order...')
      
      const success = await deleteOrderById(orderId)
      
      if (success) {
        // The secondary delete for salon_consumption_products is assumed to be handled by the backend
        // or within deleteOrderById. Removing the explicit client-side attempt.
        
        setDeleteConfirmOpen(false)
        setOrderToDelete(null)
        if (filteredOrders.length <= rowsPerPage && page > 0) {
          setPage(0)
        }
        // Invalidate clients query to refetch client data
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        // Ensure a success toast for the primary deletion is shown if not handled by deleteOrderById.
        // For example: toast.success('Order deleted successfully');
      }
    } catch (error) {
      console.error('Error in confirmDeleteOrder:', error)
      toast.error('Failed to delete order')
    }
  }

  const handleDeleteAllOrders = () => {
    setDeleteAllConfirmOpen(true)
  }

  const confirmDeleteAllOrders = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.info('Deleting selected date range orders...', {
        autoClose: false,
        closeButton: false
      });
      
      // Use the bulk delete function instead of deleting one by one
      const success = await deleteOrdersInDateRange(startDate || undefined, endDate || undefined);
      
      // Close the loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success(`Successfully deleted orders from ${startDate ? startDate.toLocaleDateString() : 'the beginning'} to ${endDate ? endDate.toLocaleDateString() : 'today'}`);
        // Close the dialog
        setDeleteAllConfirmOpen(false);
        // Reset to first page
        setPage(0);
      } else {
        toast.error('Failed to delete orders. Please try again.');
      }
    } catch (error) {
      console.error('Error in confirmDeleteAllOrders:', error);
      toast.error('An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  const handleExportCSV = () => {
    if (!aggregatedOrders || aggregatedOrders.length === 0) return;
    
    // Use exactly what's displayed on frontend
    const formattedOrders = filteredOrders.map((order) => ({
      'Order ID': formatOrderId(order),
      'Invoice #': order.invoice_number || 'N/A',
      'Date': order.created_at ? new Date(order.created_at).toLocaleString() : 'Unknown date',
      'Customer': order.client_name || 'Unknown client',
      'Stylist': order.stylist_name || 'No stylist',
      'Services/Products': (() => {
        if (!order.services || order.services.length === 0) return 'No items';
        
        // For multi-expert orders, aggregate services by name to get correct details
        if ((order as any).aggregated_multi_expert) {
          const serviceAggregation: Record<string, { quantity: number; type: string; price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;
            const type = service.type || 'service';
            
            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { 
                quantity: quantity, 
                type: type,
                price: price 
              };
            }
          });
          
          return Object.entries(serviceAggregation)
            .map(([name, details]) => `${name} (${details.type}) - Qty: ${details.quantity}`)
            .join('; ');
        }
        
        // For regular orders
        return order.services
          .map((service: any) => {
            const name = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const type = service.type || 'service';
            return `${name} (${type}) - Qty: ${quantity}`;
          })
          .join('; ');
      })(),
      'Items Count': (() => {
        if (!order.services || order.services.length === 0) return '0';
        
        if ((order as any).aggregated_multi_expert) {
          const serviceAggregation: Record<string, boolean> = {};
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            serviceAggregation[serviceName] = true;
          });
          return Object.keys(serviceAggregation).length.toString();
        }
        
        return order.services.length.toString();
      })(),
      'Type': (() => {
        const isSalonConsumption = isSalonConsumptionOrder(order);
        if (isSalonConsumption) return 'Salon Consumption';
        
        const type = getPurchaseType(order);
        switch (type) {
          case 'service': return 'Service';
          case 'product': return 'Product';
          case 'membership': return 'Membership';
          case 'both': return 'Service & Product';
          default: return 'Unknown';
        }
      })(),
      'Payment Method': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        if (order.payments && order.payments.length > 0) {
          const paymentSummary: Record<string, number> = {};
          
          if (isAggregatedOrder) {
            const expertCount = order.services 
              ? [...new Set(order.services.map((s: any) => s.stylist_name).filter(Boolean))].length 
              : 1;
            
            order.payments.forEach(payment => {
              const method = payment.payment_method;
              paymentSummary[method] = (paymentSummary[method] || 0) + (payment.amount * expertCount);
            });
          } else {
            order.payments.forEach(payment => {
              const method = payment.payment_method;
              paymentSummary[method] = (paymentSummary[method] || 0) + payment.amount;
            });
          }

          return Object.entries(paymentSummary).map(([method, amount]) => 
            `${PAYMENT_METHOD_LABELS[method as PaymentMethod] || method}: ${Math.round(amount)}`
          ).join(', ');
        }
        
        const paymentMethod = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || order.payment_method || 'Unknown';
        let totalAmount = order.total || order.total_amount || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          const correctSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
          const correctTax = correctSubtotal * 0.18;
          totalAmount = correctSubtotal + correctTax - (order.discount || 0);
        }
        
        return `${paymentMethod}: ${Math.round(totalAmount)}`;
      })(),
      'Status': order.status || 'unknown',
      'Subtotal (Ex. Tax)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let subtotal = order.subtotal || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          subtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        } else if (order.payments && order.payments.length > 0) {
          // For orders with payments, calculate subtotal from total
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            subtotal = regularPaymentTotal / 1.18; // Remove 18% tax to get subtotal
          }
        }
        
        return Math.round(subtotal).toString();
      })(),
      'CGST (9%)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let subtotal = order.subtotal || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          subtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        } else if (order.payments && order.payments.length > 0) {
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            subtotal = regularPaymentTotal / 1.18;
          }
        }
        
        const cgst = subtotal * 0.09; // 9% CGST
        return Math.round(cgst).toString();
      })(),
      'SGST (9%)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let subtotal = order.subtotal || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          subtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        } else if (order.payments && order.payments.length > 0) {
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            subtotal = regularPaymentTotal / 1.18;
          }
        }
        
        const sgst = subtotal * 0.09; // 9% SGST
        return Math.round(sgst).toString();
      })(),
      'IGST (0%)': "0", // IGST is 0% for intra-state transactions
      'Total Amount (Incl. Tax)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let displayTotal = order.total_amount || order.total || 0;
        
        if (isAggregatedOrder) {
          if (order.services && order.services.length > 0) {
            const serviceAggregation: Record<string, { total_price: number }> = {};
            
            order.services.forEach((service: any) => {
              const serviceName = service.service_name || service.item_name || service.name;
              const quantity = service.quantity || 1;
              const price = service.price || 0;

              if (!serviceAggregation[serviceName]) {
                serviceAggregation[serviceName] = { total_price: 0 };
              }
              serviceAggregation[serviceName].total_price += (price * quantity);
            });

            const correctSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
            const correctTax = correctSubtotal * 0.18;
            displayTotal = correctSubtotal + correctTax - (order.discount || 0);
          }
        } else if (order.payments && order.payments.length > 0) {
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            displayTotal = regularPaymentTotal;
          }
        }
        
        return Math.round(displayTotal).toString();
      })()
    }));
    
    // Update the type export logic for CSV
    formattedOrders.forEach((order, index) => {
      const originalOrder = filteredOrders[index];
      const type = getPurchaseType(originalOrder);
      
      switch (type) {
        case 'service': order['Type'] = 'Service'; break;
        case 'product': order['Type'] = 'Product'; break;
        case 'membership': order['Type'] = 'Membership'; break;
        case 'both': order['Type'] = 'Mixed (Service & Product)'; break;
        case 'service_membership': order['Type'] = 'Mixed (Service & Membership)'; break;
        case 'product_membership': order['Type'] = 'Mixed (Product & Membership)'; break;
        case 'service_product_membership': order['Type'] = 'Mixed (Service & Product & Membership)'; break;
        default: order['Type'] = 'Unknown'; break;
      }
    });

    // Create headers mapping for CSV export
    const headers = {
      'Order ID': 'Order ID',
      'Invoice #': 'Invoice #',
      'Date': 'Date & Time',
      'Customer': 'Customer',
      'Stylist': 'Stylist',
      'Services/Products': 'Services/Products Details',
      'Items Count': 'Items Count',
      'Type': 'Type',
      'Payment Method': 'Payment Method',
      'Status': 'Status',
      'Subtotal (Ex. Tax)': 'Subtotal (Ex. Tax)',
      'CGST (9%)': 'CGST (9%)',
      'SGST (9%)': 'SGST (9%)',
      'IGST (0%)': 'IGST (0%)',
      'Total Amount (Incl. Tax)': 'Total Amount (Incl. Tax)'
    };
    
    exportToCSV(formattedOrders, 'salon-orders-export', headers);
  }

  const handleExportPDF = () => {
    if (!aggregatedOrders || aggregatedOrders.length === 0) return;
    
    // Use exactly the same format as CSV export
    const formattedOrdersPDF = filteredOrders.map((order) => ({
      'Order ID': formatOrderId(order),
      'Invoice #': order.invoice_number || 'N/A',
      'Date': order.created_at ? new Date(order.created_at).toLocaleString() : 'Unknown date',
      'Customer': order.client_name || 'Unknown client',
      'Stylist': order.stylist_name || 'No stylist',
      'Services/Products': (() => {
        if (!order.services || order.services.length === 0) return 'No items';
        
        // For multi-expert orders, aggregate services by name to get correct details
        if ((order as any).aggregated_multi_expert) {
          const serviceAggregation: Record<string, { quantity: number; type: string; price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;
            const type = service.type || 'service';
            
            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { 
                quantity: quantity, 
                type: type,
                price: price 
              };
            }
          });
          
          return Object.entries(serviceAggregation)
            .map(([name, details]) => `${name} (${details.type}) - Qty: ${details.quantity}`)
            .join('; ');
        }
        
        // For regular orders
        return order.services
          .map((service: any) => {
            const name = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const type = service.type || 'service';
            return `${name} (${type}) - Qty: ${quantity}`;
          })
          .join('; ');
      })(),
      'Items Count': (() => {
        if (!order.services || order.services.length === 0) return '0';
        
        if ((order as any).aggregated_multi_expert) {
          const serviceAggregation: Record<string, boolean> = {};
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            serviceAggregation[serviceName] = true;
          });
          return Object.keys(serviceAggregation).length.toString();
        }
        
        return order.services.length.toString();
      })(),
      'Type': (() => {
        const isSalonConsumption = isSalonConsumptionOrder(order);
        if (isSalonConsumption) return 'Salon Consumption';
        
        const type = getPurchaseType(order);
        switch (type) {
          case 'service': return 'Service';
          case 'product': return 'Product';
          case 'membership': return 'Membership';
          case 'both': return 'Service & Product';
          default: return 'Unknown';
        }
      })(),
      'Payment Method': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        if (order.payments && order.payments.length > 0) {
          const paymentSummary: Record<string, number> = {};
          
          if (isAggregatedOrder) {
            const expertCount = order.services 
              ? [...new Set(order.services.map((s: any) => s.stylist_name).filter(Boolean))].length 
              : 1;
            
            order.payments.forEach(payment => {
              const method = payment.payment_method;
              paymentSummary[method] = (paymentSummary[method] || 0) + (payment.amount * expertCount);
            });
          } else {
            order.payments.forEach(payment => {
              const method = payment.payment_method;
              paymentSummary[method] = (paymentSummary[method] || 0) + payment.amount;
            });
          }

          return Object.entries(paymentSummary).map(([method, amount]) => 
            `${PAYMENT_METHOD_LABELS[method as PaymentMethod] || method}: ${Math.round(amount)}`
          ).join(', ');
        }
        
        const paymentMethod = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || order.payment_method || 'Unknown';
        let totalAmount = order.total || order.total_amount || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          const correctSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
          const correctTax = correctSubtotal * 0.18;
          totalAmount = correctSubtotal + correctTax - (order.discount || 0);
        }
        
        return `${paymentMethod}: ${Math.round(totalAmount)}`;
      })(),
      'Status': order.status || 'unknown',
      'Subtotal (Ex. Tax)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let subtotal = order.subtotal || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          subtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        } else if (order.payments && order.payments.length > 0) {
          // For orders with payments, calculate subtotal from total
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            subtotal = regularPaymentTotal / 1.18; // Remove 18% tax to get subtotal
          }
        }
        
        return Math.round(subtotal).toString();
      })(),
      'CGST (9%)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let subtotal = order.subtotal || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          subtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        } else if (order.payments && order.payments.length > 0) {
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            subtotal = regularPaymentTotal / 1.18;
          }
        }
        
        const cgst = subtotal * 0.09; // 9% CGST
        return Math.round(cgst).toString();
      })(),
      'SGST (9%)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let subtotal = order.subtotal || 0;
        
        if (isAggregatedOrder && order.services && order.services.length > 0) {
          const serviceAggregation: Record<string, { total_price: number }> = {};
          
          order.services.forEach((service: any) => {
            const serviceName = service.service_name || service.item_name || service.name;
            const quantity = service.quantity || 1;
            const price = service.price || 0;

            if (!serviceAggregation[serviceName]) {
              serviceAggregation[serviceName] = { total_price: 0 };
            }
            serviceAggregation[serviceName].total_price += (price * quantity);
          });

          subtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
        } else if (order.payments && order.payments.length > 0) {
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            subtotal = regularPaymentTotal / 1.18;
          }
        }
        
        const sgst = subtotal * 0.09; // 9% SGST
        return Math.round(sgst).toString();
      })(),
      'IGST (0%)': "0", // IGST is 0% for intra-state transactions
      'Total Amount (Incl. Tax)': (() => {
        const isAggregatedOrder = (order as any).aggregated_multi_expert;
        
        let displayTotal = order.total_amount || order.total || 0;
        
        if (isAggregatedOrder) {
          if (order.services && order.services.length > 0) {
            const serviceAggregation: Record<string, { total_price: number }> = {};
            
            order.services.forEach((service: any) => {
              const serviceName = service.service_name || service.item_name || service.name;
              const quantity = service.quantity || 1;
              const price = service.price || 0;

              if (!serviceAggregation[serviceName]) {
                serviceAggregation[serviceName] = { total_price: 0 };
              }
              serviceAggregation[serviceName].total_price += (price * quantity);
            });

            const correctSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
            const correctTax = correctSubtotal * 0.18;
            displayTotal = correctSubtotal + correctTax - (order.discount || 0);
          }
        } else if (order.payments && order.payments.length > 0) {
          const regularPaymentTotal = order.payments
            .filter((payment: any) => payment.payment_method !== 'membership')
            .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
          
          if (regularPaymentTotal > 0) {
            displayTotal = regularPaymentTotal;
          }
        }
        
        return Math.round(displayTotal).toString();
      })()
    }));
    
    // Create headers mapping for PDF export - same as CSV
    const headers = {
      'Order ID': 'Order ID',
      'Invoice #': 'Invoice #',
      'Date': 'Date & Time',
      'Customer': 'Customer',
      'Stylist': 'Stylist',
      'Services/Products': 'Services/Products Details',
      'Items Count': 'Items Count',
      'Type': 'Type',
      'Payment Method': 'Payment Method',
      'Status': 'Status',
      'Subtotal (Ex. Tax)': 'Subtotal (Ex. Tax)',
      'CGST (9%)': 'CGST (9%)',
      'SGST (9%)': 'SGST (9%)',
      'IGST (0%)': 'IGST (0%)',
      'Total Amount (Incl. Tax)': 'Total Amount (Incl. Tax)'
    };
    
    // Update the type export logic for PDF
    formattedOrdersPDF.forEach((order, index) => {
      const originalOrder = filteredOrders[index];
      const type = getPurchaseType(originalOrder);
      
      switch (type) {
        case 'service': order['Type'] = 'Service'; break;
        case 'product': order['Type'] = 'Product'; break;
        case 'membership': order['Type'] = 'Membership'; break;
        case 'both': order['Type'] = 'Mixed (Service & Product)'; break;
        case 'service_membership': order['Type'] = 'Mixed (Service & Membership)'; break;
        case 'product_membership': order['Type'] = 'Mixed (Product & Membership)'; break;
        case 'service_product_membership': order['Type'] = 'Mixed (Service & Product & Membership)'; break;
        default: order['Type'] = 'Unknown'; break;
      }
    });

    // Use landscape orientation for better column width
    exportToPDF(
      formattedOrdersPDF, 
      'salon-orders-export', 
      headers, 
      'Salon Orders Report'
    );
  }

  // Function that bridges between the component's expected prop name and our implementation
  const handleCompletePayment = (order: ExtendedOrder) => {
    setSelectedOrder(order)
    setPaymentDialogOpen(true)
  }

  // Handler for processing the payment update
  const handlePaymentUpdate = async (orderId: string, paymentDetails: PaymentDetail) => {
    // Assuming updateOrderPayment is a react-query mutation object
    await updateOrderPayment.mutateAsync({ orderId, paymentDetails }) 
  }
  
  // Function that bridges between CompletePaymentDialog's expected prop and our implementation
  const handleCompletePaymentSubmit = async (orderId: string, paymentDetails: PaymentDetail) => {
    return handlePaymentUpdate(orderId, paymentDetails);
  }
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: OrderTab) => {
    setActiveTab(newValue);
    
    // Reset pagination when changing tabs
    setPage(0);
    
    // Apply appropriate filters based on the selected tab
    switch (newValue) {
      case OrderTab.COMPLETED:
        setStatusFilter('completed');
        break;
      case OrderTab.PENDING:
        setStatusFilter('pending');
        break;
      case OrderTab.SALON_CONSUMPTION:
        setIsSalonPurchaseFilter('true');
        break;
      case OrderTab.SERVICES:
        setPurchaseTypeFilter('service');
        break;
      case OrderTab.PRODUCTS:
        setPurchaseTypeFilter('product');
        break;
      case OrderTab.MEMBERSHIPS:
        setPurchaseTypeFilter('membership');
        break;
      default:
        // Reset all filters when going to "All" tab
        setStatusFilter('all');
        setPurchaseTypeFilter('all');
        setIsSalonPurchaseFilter('all');
    }
  };
  
  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  // Apply pagination
  const paginatedOrders = useMemo(() => {
    if (rowsPerPage === -1) {
      // Show all orders when "All" is selected
      return filteredOrders;
    }
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  // Render purchase type chip with icon
  const renderPurchaseTypeChip = (type: string, order?: ExtendedOrder) => {
    // Check if this is a salon consumption order
    const isSalonConsumption = order ? isSalonConsumptionOrder(order) : false;
    
    if (isSalonConsumption) {
      return (
        <Chip
          icon={<InventoryIcon fontSize="small" />}
          label="Salon Consumption"
          size="small"
          color="secondary"
          sx={{ fontWeight: 500 }}
        />
      );
    }
    
    switch (type) {
      case 'service':
        return (
          <Chip
            icon={<SpaIcon fontSize="small" />}
            label="Service"
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      case 'product':
        return (
          <Chip
            icon={<ShoppingBagIcon fontSize="small" />}
            label="Product"
            size="small"
            color="info"
            variant="outlined"
          />
        );
      case 'membership':
        return (
          <Chip
            icon={<CardMembershipIcon fontSize="small" />}
            label="Membership"
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      case 'both':
        return (
          <Chip
            icon={<StoreIcon fontSize="small" />}
            label="Service & Product"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'service_membership':
        return (
          <Chip
            icon={<CardMembershipIcon fontSize="small" />}
            label="Service & Membership"
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      case 'product_membership':
        return (
          <Chip
            icon={<CardMembershipIcon fontSize="small" />}
            label="Product & Membership"
            size="small"
            color="info"
            variant="outlined"
          />
        );
      case 'service_product_membership':
        return (
          <Chip
            icon={<StoreIcon fontSize="small" />}
            label="Service & Product & Membership"
            size="small"
            color="secondary"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            label="Unknown"
            size="small"
            color="default"
            variant="outlined"
          />
        );
    }
  };

  // Format the current time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true
    });
  };

  const [lastRefreshTime, setLastRefreshTime] = useState(formatTime(new Date()));

  // Force refresh function
  const handleForceRefresh = async () => {
    try {
      // Directly use the refresh function from the hook
      refreshOrders();
      
      // Update last refresh time and show success message
      setLastRefreshTime(formatTime(new Date()));
      toast.success("Orders refreshed successfully");
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Failed to refresh orders");
    }
  };

  // Show active filter chips below the filter controls
  const renderActiveFilters = () => {
    const filters = [];
    
    // Purchase type filter
    if (purchaseTypeFilter !== 'all') {
      let label = '';
      if (purchaseTypeFilter === 'service') label = 'Services Only';
      else if (purchaseTypeFilter === 'product') label = 'Products Only';
      else if (purchaseTypeFilter === 'both') label = 'Services & Products';
      else if (purchaseTypeFilter.startsWith('product:')) {
        const category = purchaseTypeFilter.split(':')[1];
        label = `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
      }
      else if (purchaseTypeFilter.startsWith('service:')) {
        const category = purchaseTypeFilter.split(':')[1];
        label = `${category.charAt(0).toUpperCase() + category.slice(1)} Services`;
      }
      
      filters.push(
        <Chip 
          key="purchaseType"
          label={label}
          size="small"
          color="primary"
          onDelete={() => setPurchaseTypeFilter('all')}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    
    // Date range filter - only show if it's not the default 30-day range
    if (startDate) {
      const label = `Date: ${startDate.toLocaleDateString()} - ${endDate ? endDate.toLocaleDateString() : 'Now'}`;
      
      filters.push(
        <Chip 
          key="dateRange"
          label={label}
          size="small"
          color="primary"
          onDelete={() => {
            setStartDate(null);
            setEndDate(new Date());
            setPage(0); // Reset pagination when clearing date filter
          }}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filters.push(
        <Chip 
          key="status"
          label={`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
          size="small"
          color="primary"
          onDelete={() => setStatusFilter('all')}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    
    // Only render if there are active filters
    if (filters.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          Active Filters:
        </Typography>
        {filters}
      </Box>
    );
  };

  const { serviceCollections, isLoading: isLoadingServiceCollections } = useServiceCollections();

  // Add this function before the return statement
  const formatOrderId = (order: ExtendedOrder) => {
    if (!order.id) return 'Unknown';
    
    // Check if this is a salon consumption order
    const isSalonOrder = isSalonConsumptionOrder(order);
    
    if (!aggregatedOrders) return order.id;
    
    // Sort orders by creation date to maintain consistent numbering
    const sortedOrders = [...aggregatedOrders].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateA - dateB;
    });

    // Find the index of the current order in the sorted list
    const orderIndex = sortedOrders.findIndex(o => o.id === order.id);
    
    // Get all orders of the same type (salon or sales) that come before this one
    const sameTypeOrders = sortedOrders
      .slice(0, orderIndex + 1)
      .filter(o => isSalonConsumptionOrder(normalizeOrder(o)) === isSalonOrder);
    
    // Get the position of this order among orders of the same type
    const orderNumber = sameTypeOrders.length;
    
    // Format with leading zeros to ensure 4 digits
    const formattedNumber = String(orderNumber).padStart(4, '0');
    
    // Return the formatted ID based on order type
    return isSalonOrder ? `salon-${formattedNumber}` : `sales-${formattedNumber}`;
  };

  // Add this function before the return statement
  const renderPaymentMethods = (order: ExtendedOrder) => {
    if (order.payments && order.payments.length > 0) {
      // For aggregated orders, payments are already summarized.
      // For regular orders, this will just show the payments.
      return (
        <Box>
          {order.payments.map((payment, index) => {
            // Handle both 'method' and 'payment_method' fields for backward compatibility
            const paymentMethod = payment.method || payment.payment_method;
            const amount = payment.amount || 0;
            
            return (
              <Box key={index} sx={{ mb: 0.5 }}>
                <Chip
                  size="small"
                  label={`${PAYMENT_METHOD_LABELS[paymentMethod as PaymentMethod] || paymentMethod || 'Unknown'}: ${formatCurrency(amount)}`}
                  sx={{ mr: 0.5 }}
                />
              </Box>
            );
          })}
          {(order.pending_amount || 0) > 0 && order.status !== 'completed' && (
            <Box sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={`Pending: ${formatCurrency(order.pending_amount || 0)}`}
                color="warning"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      );
    }
    
    // Fallback for older orders or single payment orders without a payments array
    const paymentMethod = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || order.payment_method || 'Unknown';
    const totalAmount = order.total || order.total_amount || 0;
    
    return (
      <Box>
        <Chip
          size="small"
          label={`${paymentMethod}: ${formatCurrency(totalAmount)}`}
          color="primary"
          variant="outlined"
        />
         {(order.pending_amount || 0) > 0 && order.status !== 'completed' && (
           <Box sx={{ mt: 0.5 }}>
             <Chip
               size="small"
               label={`Pending: ${formatCurrency(order.pending_amount || 0)}`}
               color="warning"
               variant="outlined"
             />
           </Box>
         )}
      </Box>
    );
  };

  const handleEditOrder = (order: ExtendedOrder) => {
    // Navigate to POS with order data for editing
    navigate('/pos', {
      state: {
        editOrderData: {
          orderId: order.id,
          clientName: order.client_name || order.customer_name,
          clientId: order.client_id,
          stylistId: order.stylist?.id || order.stylist_id,
          services: order.services || [],
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total || order.total_amount || 0,
          paymentMethod: order.payment_method,
          payments: order.payments || [],
          status: order.status,
          isSalonConsumption: isSalonConsumptionOrder(order),
          consumptionPurpose: order.consumption_purpose,
          notes: order.notes,
          created_at: order.created_at
        }
      }
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Orders</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {(() => {
                if (!startDate) {
                  return `All time • ${filteredOrders.length} orders`;
                }
                
                const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
                const today = new Date();
                const isLast30Days = 
                  startDate && endDate &&
                  startDate.toDateString() === thirtyDaysAgo.toDateString() &&
                  endDate.toDateString() === today.toDateString();

                if (isLast30Days) {
                  return `Last 30 days • ${filteredOrders.length} orders`;
                } else {
                  return `${startDate.toLocaleDateString()} - ${endDate ? endDate.toLocaleDateString() : 'Now'} • ${filteredOrders.length} orders`;
                }
              })()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Export Buttons */}
            {filteredOrders.length > 0 && (
              <>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<CsvIcon />}
                  onClick={handleExportCSV}
                  size="small"
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<PdfIcon />}
                  onClick={handleExportPDF}
                  size="small"
                >
                  Export PDF
                </Button>
              </>
            )}
            <input
              type="file"
              id="import-orders-input"
              style={{ display: 'none' }}
              onChange={handleImportOrders}
              accept=".xlsx, .xls"
            />
            <label htmlFor="import-orders-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFileIcon />}
                sx={{ mr: 1 }}
              >
                Import Services
              </Button>
            </label>

            <input
              type="file"
              id="import-products-input"
              style={{ display: 'none' }}
              onChange={handleProductImport}
              accept=".xlsx, .xls"
            />
            <label htmlFor="import-products-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFileIcon />}
              >
                Import Products
              </Button>
            </label>
            
            {/* New Aggregated Excel Importer */}
            <AggregatedExcelImporter />
            
            <Button 
              variant="contained" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAllOrders}
              size="small"
            >
              Delete Date Range Orders
            </Button>
          </Box>
        </Box>
        
        {/* Order Analytics */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem', color: 'primary.main' }}>
            {(() => {
              if (!startDate) {
                return "Analytics - All Time";
              }
              const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
              const today = new Date();
              const isLast30Days =
                startDate && endDate &&
                startDate.toDateString() === thirtyDaysAgo.toDateString() &&
                endDate.toDateString() === today.toDateString();

              if (isLast30Days) {
                return "Analytics - Last 30 Days";
              } else {
                return `Analytics - ${startDate.toLocaleDateString()} to ${endDate ? endDate.toLocaleDateString() : 'Now'}`;
              }
            })()}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Total Orders */}
          <Grid item xs={12} sm={6} md={3}>
            <Card raised={false} variant="outlined" sx={{ p: 1.5 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600 }}>
                  Total Orders
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, mb: 1.5, fontWeight: 'bold' }}>
                  {orderStats.total}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ height: 6, borderRadius: 3 }} 
                />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Salon Consumption Orders - Highlighted specialty stat */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              raised={false}
              variant="outlined"
              sx={{
                p: 1.5,
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <InventoryIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600 }}>
                    Salon Consumption
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ mt: 0.5, mb: 1.5, fontWeight: 'bold' }}>
                  {orderStats.salonPurchases}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress
                    variant="determinate"
                    value={orderStats.total ? (orderStats.salonPurchases / orderStats.total) * 100 : 0}
                    color="info"
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      flexGrow: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ ml: 1 }} color="text.secondary">
                    {orderStats.total ? Math.round((orderStats.salonPurchases / orderStats.total) * 100) : 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Orders */}
          <Grid item xs={12} sm={6} md={3}>
            <Card raised={false} variant="outlined" sx={{ p: 1.5 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600 }}>
                  Completed
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, mb: 1.5, fontWeight: 'bold' }}>
                  {orderStats.completed}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={orderStats.total ? (orderStats.completed / orderStats.total) * 100 : 0} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3, flexGrow: 1 }} 
                  />
                  <Typography variant="caption" sx={{ ml: 1 }} color="text.secondary">
                    {orderStats.total ? Math.round((orderStats.completed / orderStats.total) * 100) : 0}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Card raised={false} variant="outlined" sx={{ p: 1.5 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600 }}>
                  Total Revenue
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, mb: 1.5, fontWeight: 'bold' }}>
                  {formatCurrency(orderStats.totalRevenue)}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  color="primary"
                  sx={{ height: 6, borderRadius: 3 }} 
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Order Tabs */}
        <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: '40px',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                px: 2,
                py: 1
              }
            }}
            textColor="primary"
            aria-label="order filter tabs"
          >
            <Tab 
              icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
              iconPosition="start"
              label={`All (${orderStats.total})`} 
              value={OrderTab.ALL}
            />
            <Tab 
              icon={<CheckIcon sx={{ fontSize: 22 }} />} 
              iconPosition="start"
              label={`Completed (${orderStats.completed})`} 
              value={OrderTab.COMPLETED}
            />
            <Tab 
              icon={<PaymentIcon sx={{ fontSize: 22 }} />}
              iconPosition="start"
              label={`Pending (${orderStats.pending})`} 
              value={OrderTab.PENDING}
            />
            <Tab 
              icon={<InventoryIcon sx={{ fontSize: 22 }} color="secondary" />}
              iconPosition="start"
              label={`Salon Consumption (${orderStats.salonPurchases})`} 
              value={OrderTab.SALON_CONSUMPTION}
              sx={{ 
                "& .MuiTab-iconWrapper": { color: "secondary.main" },
                fontWeight: activeTab === OrderTab.SALON_CONSUMPTION ? 600 : 400
              }} 
            />
            <Tab 
              icon={<ContentCutIcon sx={{ fontSize: 22 }} />}
              iconPosition="start"
              label={`Services (${orderStats.services})`} 
              value={OrderTab.SERVICES}
            />
            <Tab 
              icon={<LocalMallIcon sx={{ fontSize: 22 }} />}
              iconPosition="start"
              label={`Products (${orderStats.products})`} 
              value={OrderTab.PRODUCTS}
            />
            <Tab 
              icon={<CardMembershipIcon sx={{ fontSize: 22 }} />}
              iconPosition="start"
              label={`Memberships (${orderStats.memberships})`} 
              value={OrderTab.MEMBERSHIPS}
            />
          </Tabs>
        </Paper>
        
        {/* Search and filter controls */}
        {orders && orders.length > 0 && (
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="payment-filter-label">Payment Method</InputLabel>
                      <Select
                        labelId="payment-filter-label"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        label="Payment Method"
                      >
                        <MenuItem value="all">All Payment Methods</MenuItem>
                        {PAYMENT_METHODS.map((method) => (
                          <MenuItem key={method} value={method}>
                            {PAYMENT_METHOD_LABELS[method]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="purchase-type-filter-label">Purchase Type</InputLabel>
                      <Select
                        labelId="purchase-type-filter-label"
                        value={purchaseTypeFilter}
                        onChange={(e) => setPurchaseTypeFilter(e.target.value)}
                        label="Purchase Type"
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="service">Services Only</MenuItem>
                        <MenuItem value="product">Products Only</MenuItem>
                        <MenuItem value="both">Services & Products</MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                          Product Categories
                        </Typography>
                        <MenuItem value="product:retail">Retail Products</MenuItem>
                        <MenuItem value="product:salon">Salon Products</MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                          Service Categories
                        </Typography>
                        {serviceCollections?.map(collection => (
                          <MenuItem 
                            key={collection.id} 
                            value={`service:${collection.id}`}
                          >
                            {collection.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="salon-purchase-filter-label">Salon Consumption</InputLabel>
                      <Select
                        labelId="salon-purchase-filter-label"
                        value={isSalonPurchaseFilter}
                        onChange={(e) => setIsSalonPurchaseFilter(e.target.value)}
                        label="Salon Consumption"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="true">Salon Consumption</MenuItem>
                        <MenuItem value="false">Customer Purchases</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Date Range Filter with DateRangePicker */}
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Select Date Range:
                    </Typography>
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onDateRangeChange={(newStartDate, newEndDate) => {
                        setStartDate(newStartDate);
                        setEndDate(newEndDate);
                        // Reset pagination when date range changes
                        setPage(0);
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={8} display="flex" alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const newStartDate = new Date(new Date().setDate(new Date().getDate() - 30));
                        const newEndDate = new Date();
                        setStartDate(newStartDate);
                        setEndDate(newEndDate);
                        setPage(0);
                      }}
                    >
                      Reset to Last 30 Days
                    </Button>
                    
                    {orders && orders.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Loaded {orders.length} total orders | Showing {filteredOrders.length} orders from {startDate ? startDate.toLocaleDateString() : 'the beginning'} to {endDate ? endDate.toLocaleDateString() : 'today'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Render active filters */}
        {renderActiveFilters()}
        
        {/* Horizontal Scroll Help Info */}
        {filteredOrders.length > 0 && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              mb: 1.5, 
              background: 'linear-gradient(45deg, #f8fdf0 30%, #f0f8e6 90%)',
              border: '1px solid #8baf3f',
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ color: '#7da237', fontSize: '20px' }} />
              <Typography variant="body2" sx={{ color: '#7da237', fontWeight: 500 }}>
                💡 <strong>Horizontal Scroll Tip:</strong> Hold <kbd style={{ 
                  background: '#f0f8e6', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  border: '1px solid #c8d9a5',
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}>Shift</kbd> + Mouse Wheel to scroll horizontally, or use the scroll bar below the table
              </Typography>
            </Box>
          </Paper>
        )}
        
        {filteredOrders.length > 0 ? (
          <>
            <TableContainer 
              component={Paper}
              sx={{ 
                overflow: 'auto',
                overflowX: 'scroll', // Force horizontal scrollbar to always show
                cursor: 'grab',
                '&:active': {
                  cursor: 'grabbing'
                },
                // Enhanced scrollbar styling for better visibility
                '&::-webkit-scrollbar': {
                  height: '12px',
                  width: '12px'
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(45deg, #8baf3f 30%, #7da237 90%)',
                  borderRadius: '6px',
                  border: '1px solid #6d8c30',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7da237 30%, #6d8c30 90%)',
                    transform: 'scale(1.1)'
                  }
                },
                '&::-webkit-scrollbar-corner': {
                  background: '#f1f1f1'
                },
                // For Firefox
                scrollbarWidth: 'thin',
                scrollbarColor: '#8baf3f #f1f1f1'
              }}
              onWheel={(e) => {
                // Enable horizontal scrolling with mouse wheel when shift is held
                if (e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              <Table sx={{ minWidth: 1400 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Stylist</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    // Check if this is a salon consumption order
                    const isSalonOrder = isSalonConsumptionOrder(order);
                    // Check if this is an aggregated multi-expert order
                    const isAggregatedOrder = (order as any).aggregated_multi_expert;
                    
                    return (
                    <TableRow 
                      key={order.id}
                      sx={{
                        backgroundColor: isSalonOrder ? 'rgba(237, 108, 2, 0.05)' : 
                                        isAggregatedOrder ? 'rgba(156, 39, 176, 0.05)' : 'inherit',
                        '&:hover': {
                          backgroundColor: isSalonOrder ? 'rgba(237, 108, 2, 0.12)' : 
                                          isAggregatedOrder ? 'rgba(156, 39, 176, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                        },
                        borderLeft: isAggregatedOrder ? '3px solid #9c27b0' : 'none'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatOrderId(order)}
                          {isAggregatedOrder && (
                            <Chip 
                              size="small" 
                              label="Multi-Expert" 
                              color="secondary" 
                              sx={{ ml: 1, fontSize: '0.7rem' }} 
                            />
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {order.invoice_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.created_at ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(order.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(order.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </Typography>
                          </Box>
                        ) : (
                          'Unknown date'
                        )}
                      </TableCell>
                      <TableCell>
                        {order.client_name || 'Unknown client'}
                        {isSalonOrder && (
                          <Chip 
                            size="small" 
                            label="Salon Use" 
                            color="warning" 
                            sx={{ ml: 1, backgroundColor: '#FF6B00', color: 'white' }} 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Check if this is a multi-expert order by looking at services
                          const allStylistsFromServices = new Set<string>();
                          (order.services || []).forEach((service: any) => {
                            // Add from legacy stylist_name field
                            if (service.stylist_name) {
                              allStylistsFromServices.add(service.stylist_name);
                            }
                            // Add from experts array
                            if (service.experts && Array.isArray(service.experts)) {
                              service.experts.forEach((expert: any) => {
                                if (expert && expert.name) {
                                  allStylistsFromServices.add(expert.name);
                                }
                              });
                            }
                          });
                          
                          // Combine with order-level stylist info
                          if (order.stylist_name) {
                            // Split comma-separated names and add each
                            order.stylist_name.split(',').forEach((name: string) => {
                              const trimmedName = name.trim();
                              if (trimmedName) {
                                allStylistsFromServices.add(trimmedName);
                              }
                            });
                          }

                          const allStylists = Array.from(allStylistsFromServices);
                          
                          if (allStylists.length === 0) {
                            return 'No stylist';
                          } else if (allStylists.length === 1) {
                            return allStylists[0];
                          } else {
                            // Multi-expert scenario
                            return (
                              <Box>
                                <Typography variant="body2" component="div">
                                  {allStylists.join(', ')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" component="div">
                                  Multi-expert
                                </Typography>
                              </Box>
                            );
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Debug logging to understand the data structure
                          console.log('🔍 Order services debug:', {
                            orderId: order.id,
                            services: order.services,
                            servicesType: typeof order.services,
                            servicesLength: order.services?.length,
                            isArray: Array.isArray(order.services),
                            firstService: order.services?.[0],
                            serviceNames: order.services?.map((s: any) => s.name || s.service_name || s.item_name)
                          });
                          
                          if (!order.services || order.services.length === 0) return '0 items';
                          
                          // For multi-expert orders, aggregate services by name to get correct counts
                          if ((order as any).aggregated_multi_expert) {
                            const serviceAggregation: Record<string, { quantity: number; count: number }> = {};
                            
                            order.services.forEach((service: any) => {
                              // Handle both old and new service field names
                              const serviceName = service.name || service.service_name || service.item_name;
                              const quantity = service.quantity || 1;
                              
                              if (!serviceAggregation[serviceName]) {
                                serviceAggregation[serviceName] = { quantity: 0, count: 0 };
                              }
                              
                              // Only count the service once, not per expert
                              if (serviceAggregation[serviceName].count === 0) {
                                serviceAggregation[serviceName].quantity = quantity;
                              }
                              serviceAggregation[serviceName].count = 1; // Mark as counted
                            });
                            
                            const uniqueServiceTypes = Object.keys(serviceAggregation).length;
                            const totalQuantity = Object.values(serviceAggregation).reduce((sum, item) => sum + item.quantity, 0);
                            
                            if (uniqueServiceTypes === 1) {
                              return `${totalQuantity} item${totalQuantity > 1 ? 's' : ''}`;
                            }
                            
                            return (
                              <Box>
                                <Typography variant="body2" component="div">
                                  {uniqueServiceTypes} types
                                </Typography>
                                <Typography variant="caption" color="text.secondary" component="div">
                                  {totalQuantity} total qty
                                </Typography>
                              </Box>
                            );
                          }
                          
                          // For regular orders, use the existing logic
                          const itemCount = order.services.length;
                          const totalQuantity = order.services.reduce((sum: number, service: any) => {
                            // Handle both old and new service field names
                            return sum + (service.quantity || 1);
                          }, 0);
                          
                          if (itemCount === 0) return '0 items';
                          if (itemCount === 1) return `${totalQuantity} item${totalQuantity > 1 ? 's' : ''}`;
                          
                          return (
                            <Box>
                              <Typography variant="body2" component="div">
                                {itemCount} types
                              </Typography>
                              <Typography variant="caption" color="text.secondary" component="div">
                                {totalQuantity} total qty
                              </Typography>
                            </Box>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {renderPurchaseTypeChip(getPurchaseType(order), order)}
                      </TableCell>
                      <TableCell>{renderPaymentMethods(order)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={order.status || 'unknown'}
                          color={
                            order.status === 'completed'
                              ? 'success'
                              : order.status === 'pending'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Check if this is an aggregated multi-expert order
                          const isAggregatedOrder = (order as any).aggregated_multi_expert;
                          
                          // Calculate total from actual payments for accuracy
                          let displayTotal = order.total_amount || order.total || 0;
                          
                          if (isAggregatedOrder) {
                            // For multi-expert orders, calculate the correct total from services
                            if (order.services && order.services.length > 0) {
                              const serviceAggregation: Record<string, { total_price: number }> = {};
                              
                              order.services.forEach((service: any) => {
                                const serviceName = service.service_name || service.item_name || service.name;
                                const quantity = service.quantity || 1;
                                const price = service.price || 0;

                                if (!serviceAggregation[serviceName]) {
                                  serviceAggregation[serviceName] = { total_price: 0 };
                                }
                                serviceAggregation[serviceName].total_price += (price * quantity);
                              });

                              const correctSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
                              const correctTax = correctSubtotal * 0.18;
                              displayTotal = correctSubtotal + correctTax - (order.discount || 0);
                            }
                          } else if (order.payments && order.payments.length > 0) {
                            // For regular orders, calculate total payments excluding membership payments
                            const regularPaymentTotal = order.payments
                              .filter((payment: any) => payment.payment_method !== 'membership')
                              .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
                            
                            // If there are any regular payments, use that as the display total
                            // Otherwise, fall back to the original total amount
                            if (regularPaymentTotal > 0) {
                              displayTotal = regularPaymentTotal;
                            }
                          }
                          
                          return (
                            <Typography 
                              fontWeight="medium" 
                              color={isSalonOrder ? '#FF6B00' : 'text.primary'}
                            >
                              ₹{Math.round(displayTotal)}
                            </Typography>
                          );
                        })()}
                      </TableCell>
                      <TableCell align="right">
                        <ButtonGroup size="small" variant="outlined">
                          <Tooltip title="View Details">
                            <Button
                              color="primary"
                              onClick={() => handleViewDetails(order)}
                              startIcon={<VisibilityIcon />}
                            >
                              View
                            </Button>
                          </Tooltip>
                          <Tooltip title="Edit Order">
                            <Button
                              color="info"
                              onClick={() => handleEditOrder(order)}
                              startIcon={<EditIcon />}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                          <Tooltip title="Print Bill">
                            <Button
                              color="secondary"
                              onClick={() => handlePrintBill(order)}
                              startIcon={<PrintIcon />}
                            >
                              Print
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete Order">
                            <Button
                              color="error"
                              onClick={() => handleDeleteOrder(order)}
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <TablePagination
                component="div"
                count={filteredOrders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[25, 50, 100, 200, 500, 1000, { label: 'All', value: -1 }]}
              />
            </Box>
          </>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {orders && orders.length > 0 
                ? 'No orders match your search criteria. Try adjusting your filters.'
                : 'No orders found. Orders from the POS system will appear here.'}
            </Typography>
          </Paper>
        )}

        {/* Order Details Dialog - Using the accessible dialog component */}
        {selectedOrder && (
          <AccessibleDialog
            open={detailsOpen}
            onClose={handleCloseDetails}
            maxWidth="md"
            fullWidth
            title={(
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <span>Order Details</span>
              </Box>
            )}
            actions={
              <>
                <Button 
                  onClick={() => selectedOrder && handlePrintBill(selectedOrder)}
                  variant="contained"
                  color="secondary"
                  startIcon={<ReceiptIcon />}
                  sx={{ mr: 1 }}
                >
                  Print Bill
                </Button>
                <Button 
                  onClick={handleCloseDetails} 
                  color="primary" 
                  variant="contained"
                >
                  Close
                </Button>
              </>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Order Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Order ID:</strong> {formatOrderId(selectedOrder)}
                    {(selectedOrder as any).aggregated_multi_expert && (
                      <Chip 
                        size="small" 
                        label="Multi-Expert Order" 
                        color="secondary" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Invoice #:</strong> {selectedOrder.invoice_number || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Customer:</strong> {selectedOrder.client_name}
                    {isSalonConsumptionOrder(selectedOrder) && (
                      <Chip 
                        size="small" 
                        label="Salon Consumption" 
                        color="warning" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Stylist{(() => {
                      // Check if this is a multi-expert order by looking at services
                      const allStylistsFromServices = new Set<string>();
                      (selectedOrder.services || []).forEach((service: any) => {
                        // Add from legacy stylist_name field
                        if (service.stylist_name) allStylistsFromServices.add(service.stylist_name);
                        // Add from experts array
                        if (service.experts && Array.isArray(service.experts)) {
                          service.experts.forEach((expert: any) => {
                            if (expert.name) allStylistsFromServices.add(expert.name);
                          });
                        }
                      });
                      return allStylistsFromServices.size > 1 ? 's' : '';
                    })()}:</strong> {(() => {
                      // Display all stylists from services if available, otherwise use order-level stylist_name
                      const allStylistsFromServices = new Set<string>();
                      (selectedOrder.services || []).forEach((service: any) => {
                        // Prioritize experts array over legacy stylist_name field
                        if (service.experts && Array.isArray(service.experts)) {
                          service.experts.forEach((expert: any) => {
                            if (expert.name) allStylistsFromServices.add(expert.name);
                          });
                        } else if (service.stylist_name) {
                          // Only use legacy field if no experts array exists
                          allStylistsFromServices.add(service.stylist_name);
                        }
                      });
                      
                      if (allStylistsFromServices.size > 0) {
                        return Array.from(allStylistsFromServices).join(', ');
                      }
                      return selectedOrder.stylist_name || 'No stylist';
                    })()}
                    {(() => {
                      // Check if this is a multi-expert order
                      const allStylistsFromServices = new Set<string>();
                      (selectedOrder.services || []).forEach((service: any) => {
                        // Add from legacy stylist_name field
                        if (service.stylist_name) allStylistsFromServices.add(service.stylist_name);
                        // Add from experts array
                        if (service.experts && Array.isArray(service.experts)) {
                          service.experts.forEach((expert: any) => {
                            if (expert.name) allStylistsFromServices.add(expert.name);
                          });
                        }
                      });
                      
                      return allStylistsFromServices.size > 1 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Multi-expert service collaboration
                        </Typography>
                      ) : null;
                    })()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Purchase Type:</strong> <Box component="span" sx={{ ml: 1 }}>{renderPurchaseTypeChip(getPurchaseType(selectedOrder), selectedOrder)}</Box>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedOrder.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Payment Method:</strong>{" "}
                    {Array.isArray(selectedOrder.payments) && selectedOrder.payments.length > 0
                      ? selectedOrder.payments.map((p: PaymentDetail) =>
                          PAYMENT_METHOD_LABELS[p.payment_method as PaymentMethod] ||
                          p.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                        ).join(', ')
                      : PAYMENT_METHOD_LABELS[selectedOrder.payment_method as PaymentMethod] ||
                        selectedOrder.payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Cash'}
                  </Typography>
                  {selectedOrder.appointment_time && (
                    <Typography variant="body2">
                      <strong>Appointment Time:</strong> {new Date(selectedOrder.appointment_time).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Payment Summary</Typography>
                <Box sx={{ mb: 2 }}>
                  {(() => {
                    // For multi-expert orders, calculate correct totals from services
                    const isAggregatedMultiExpert = (selectedOrder as any).aggregated_multi_expert;
                    let displaySubtotal = selectedOrder.subtotal || 0;
                    let displayTax = selectedOrder.tax || 0;
                    let displayTotal = selectedOrder.total_amount || selectedOrder.total || 0;
                    
                    if (isAggregatedMultiExpert && selectedOrder.services && selectedOrder.services.length > 0) {
                      // Calculate correct totals from aggregated services
                      const serviceAggregation: Record<string, {
                        total_price: number;
                        quantity: number;
                      }> = {};

                      // Aggregate services by name to avoid counting duplicates from multiple experts
                      selectedOrder.services.forEach((service: any) => {
                        const serviceName = service.service_name || service.item_name || service.name;
                        const quantity = service.quantity || 1;
                        const price = service.price || 0;

                        if (!serviceAggregation[serviceName]) {
                          serviceAggregation[serviceName] = {
                            total_price: 0,
                            quantity: quantity
                          };
                        }

                        // Add up the prices from all experts working on this service
                        serviceAggregation[serviceName].total_price += (price * quantity);
                      });

                      // Calculate the correct subtotal from aggregated services
                      const correctSubtotal = Object.values(serviceAggregation).reduce((sum, item) => sum + item.total_price, 0);
                      const correctTax = correctSubtotal * 0.18; // 18% GST
                      const correctTotal = correctSubtotal + correctTax - (selectedOrder.discount || 0);
                      
                      displaySubtotal = correctSubtotal;
                      displayTax = correctTax;
                      displayTotal = correctTotal;
                    }

                    return (
                      <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                          <Typography variant="body2">{formatCurrency(displaySubtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">GST (18%):</Typography>
                          <Typography variant="body2">{formatCurrency(displayTax)}</Typography>
                  </Box>
                  {selectedOrder.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Discount:</Typography>
                      <Typography variant="body2" color="error">-{formatCurrency(selectedOrder.discount)}</Typography>
                    </Box>
                  )}
                        
                        {isAggregatedMultiExpert && (
                          <Box sx={{ mb: 1, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              <InfoIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              This is a multi-expert order. Amounts shown are the total for all services across all experts.
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">Total:</Typography>
                          <Typography variant="body2" fontWeight="bold">{formatCurrency(displayTotal)}</Typography>
                        </Box>
                      </>
                    );
                  })()}
                  
                  {/* Check if this order has membership payments */}
                  {(() => {
                    const hasMembershipPayment = selectedOrder.payments && selectedOrder.payments.some((payment: any) => payment.payment_method === 'membership');
                    const membershipAmount = selectedOrder.payments 
                      ? selectedOrder.payments
                          .filter((payment: any) => payment.payment_method === 'membership')
                          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
                      : 0;
                    
                    // For multi-expert orders, calculate the correct payment amounts
                    const isAggregatedMultiExpert = (selectedOrder as any).aggregated_multi_expert;
                    let regularAmount = selectedOrder.payments 
                      ? selectedOrder.payments
                          .filter((payment: any) => payment.payment_method !== 'membership')
                          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
                      : (selectedOrder.total_amount || selectedOrder.total || 0);
                    
                    // For multi-expert orders, multiply by the number of experts to get the actual payment amount
                    if (isAggregatedMultiExpert && selectedOrder.payments && selectedOrder.payments.length > 0) {
                      // Calculate how many experts were involved by looking at unique stylists
                      const expertCount = selectedOrder.services 
                        ? [...new Set(selectedOrder.services.map((s: any) => s.stylist_name).filter(Boolean))].length 
                        : 1;
                      
                      regularAmount = selectedOrder.payments
                        .filter((payment: any) => payment.payment_method !== 'membership')
                        .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) * expertCount;
                    }
                    
                    const totalOrderAmount = selectedOrder.total_amount || selectedOrder.total || 0;
                    
                    if (hasMembershipPayment && membershipAmount > 0) {
                      // Calculate estimated GST discount for membership payment (assuming 18% GST)
                      const estimatedMembershipGSTDiscount = membershipAmount * 0.18 / 1.18;
                      
                      return (
                        <>
                          <Divider sx={{ my: 2 }} />
                          
                          {/* Payment Breakdown Section */}
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Payment Breakdown:
                          </Typography>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                            <Typography variant="body2" color="primary.main">Services via Membership (Ex. GST):</Typography>
                            <Typography variant="body2" fontWeight="500" color="primary.main">
                              {formatCurrency(membershipAmount)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                            <Typography variant="body2">Products & Regular Services (Incl. GST):</Typography>
                            <Typography variant="body2" fontWeight="500">
                              {formatCurrency(regularAmount)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2, ml: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              <InfoIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              Membership payments exclude GST • Products cannot be paid with membership balance
                            </Typography>
                          </Box>
                          
                          {/* Total Amount with detailed breakdown */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold">Total Amount (All Items):</Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(totalOrderAmount + membershipAmount)}
                            </Typography>
                          </Box>
                          
                          {/* Show membership GST discount if applicable */}
                          {estimatedMembershipGSTDiscount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                              <Typography variant="body2" color="success.main">Less: Membership GST Discount:</Typography>
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                -{formatCurrency(estimatedMembershipGSTDiscount)}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Show membership payment deduction */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                            <Typography variant="body2" color="primary.main">Less: Membership Payment:</Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="medium">
                              -{formatCurrency(membershipAmount)}
                            </Typography>
                          </Box>
                          
                          {/* Show additional discount if any */}
                          {selectedOrder.discount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                              <Typography variant="body2" color="warning.main">Less: Additional Discount:</Typography>
                              <Typography variant="body2" color="warning.main" fontWeight="medium">
                                -{formatCurrency(selectedOrder.discount)}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Final amount that client paid */}
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, bgcolor: 'success.lighter', p: 1, borderRadius: 1 }}>
                            <Typography variant="h6" fontWeight="bold">Client to Pay:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              {formatCurrency(regularAmount)}
                            </Typography>
                          </Box>
                          
                          {/* Membership discount explanation */}
                          <Box sx={{ mb: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                            <Typography variant="caption" color="info.main" sx={{ display: 'flex', alignItems: 'center' }}>
                              <InfoIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                              Membership Discount Applied: GST is excluded when paying via membership balance. 
                              ₹{formatCurrency(membershipAmount)} was deducted from membership balance.
                            </Typography>
                          </Box>
                        </>
                      );
                    } else {
                      // Standard display when no membership payments - REMOVED THE DUPLICATE TOTAL SECTION
                      return null;
                    }
                  })()}
                  
                  {/* Show payment details for split payments OR when there are membership payments */}
                  {((selectedOrder.is_split_payment || (selectedOrder as any).aggregated_multi_expert) || 
                    (selectedOrder.payments && selectedOrder.payments.some((payment: any) => payment.payment_method === 'membership'))) && 
                   selectedOrder.payments && selectedOrder.payments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Payment Details</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Method</TableCell>
                              <TableCell align="right">Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(() => {
                              // For multi-expert orders, aggregate payments by method and multiply by expert count
                              const isAggregatedMultiExpert = (selectedOrder as any).aggregated_multi_expert;
                              
                              if (isAggregatedMultiExpert) {
                                // Calculate how many experts were involved
                                const expertCount = selectedOrder.services 
                                  ? [...new Set(selectedOrder.services.map((s: any) => s.stylist_name).filter(Boolean))].length 
                                  : 1;
                                
                                // Group payments by method and multiply by expert count to get actual amount paid
                                const aggregatedPayments: Record<string, number> = {};
                                selectedOrder.payments.forEach((payment: any) => {
                                  const method = payment.payment_method;
                                  aggregatedPayments[method] = (aggregatedPayments[method] || 0) + (payment.amount * expertCount);
                                });
                                
                                return Object.entries(aggregatedPayments).map(([method, amount]) => (
                                  <TableRow key={method}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {method === 'membership' && (
                                          <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                        )}
                                        {PAYMENT_METHOD_LABELS[method as PaymentMethod]}
                                        {method === 'membership' && (
                                          <Chip size="small" label="Balance Used" color="primary" variant="outlined" sx={{ ml: 1 }} />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right">{formatCurrency(amount)}</TableCell>
                                  </TableRow>
                                ));
                              } else {
                                // For regular orders, show payments as they are
                                return selectedOrder.payments.map((payment: PaymentDetail) => (
                                <TableRow key={payment.id}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {payment.payment_method === 'membership' && (
                                        <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                      )}
                                      {PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod]}
                                      {payment.payment_method === 'membership' && (
                                        <Chip size="small" label="Balance Used" color="primary" variant="outlined" sx={{ ml: 1 }} />
                                      )}
                                    </Box>
                                  </TableCell>
                                    <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                                </TableRow>
                                ));
                              }
                            })()}
                            {selectedOrder.pending_amount > 0 && selectedOrder.status !== 'completed' && (
                              <TableRow>
                                <TableCell>
                                  <Typography color="error">Pending Payment:</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography color="error">{formatCurrency(selectedOrder.pending_amount)}</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Membership Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        // Aggregate services by service name
                        const serviceAggregation: Record<string, {
                          service_name: string;
                          type: string;
                          unit_price: number;
                          total_quantity: number;
                          total_price: number;
                          stylists: string[];
                          for_salon_use?: boolean;
                          benefit_amount?: number;
                          paid_with_membership?: boolean;
                        }> = {};

                        (selectedOrder.services || []).forEach((service: any) => {
                          const serviceName = service.service_name || service.item_name || service.name;
                          const quantity = service.quantity || 1;
                          const price = service.price || 0;
                          const stylistName = service.stylist_name;

                          if (!serviceAggregation[serviceName]) {
                            serviceAggregation[serviceName] = {
                              service_name: serviceName,
                              type: service.type || 'Service',
                              unit_price: 0, // Will calculate the total price from all experts
                              total_quantity: quantity, // Use the service quantity directly
                              total_price: 0, // Will calculate from all expert prices
                              stylists: [],
                              for_salon_use: service.forSalonUse || service.for_salon_use,
                              benefit_amount: service.benefit_amount || service.benefitAmount,
                              paid_with_membership: service.paid_with_membership
                            };
                          }

                          // Add up the prices from all experts working on this service
                          serviceAggregation[serviceName].unit_price += price;
                          serviceAggregation[serviceName].total_price += (price * quantity);
                          
                          // Track stylists from stylist_name field (legacy)
                          if (stylistName && !serviceAggregation[serviceName].stylists.includes(stylistName)) {
                            serviceAggregation[serviceName].stylists.push(stylistName);
                          }
                          
                          // Track stylists from experts array (new multi-expert format)
                          if (service.experts && Array.isArray(service.experts)) {
                            service.experts.forEach((expert: any) => {
                              if (expert.name && !serviceAggregation[serviceName].stylists.includes(expert.name)) {
                                serviceAggregation[serviceName].stylists.push(expert.name);
                              }
                            });
                          }
                        });

                        return Object.values(serviceAggregation).map((aggregatedService, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {aggregatedService.service_name}
                              {/* Show stylist info for multi-expert orders */}
                              {aggregatedService.stylists.length > 0 && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {aggregatedService.stylists.length === 1 
                                    ? `Stylist: ${aggregatedService.stylists[0]}`
                                    : `Stylists: ${aggregatedService.stylists.join(', ')}`
                                  }
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="small" 
                                label={(() => {
                                  // Check if it's a membership item
                                  if (aggregatedService.type === 'membership' || 
                                      (aggregatedService.service_name && ['Silver', 'Gold', 'Platinum', 'Diamond'].some(tier => 
                                        aggregatedService.service_name.toLowerCase().includes(tier.toLowerCase())))) {
                                    return 'Membership';
                                  }
                                  return aggregatedService.type || 'Service';
                                })()} 
                                color={(() => {
                                  if (aggregatedService.type === 'product') return 'secondary';
                                  if (aggregatedService.type === 'membership' || 
                                      (aggregatedService.service_name && ['Silver', 'Gold', 'Platinum', 'Diamond'].some(tier => 
                                        aggregatedService.service_name.toLowerCase().includes(tier.toLowerCase())))) {
                                    return 'success';
                                  }
                                  return 'primary';
                                })()}
                              />
                              {aggregatedService.for_salon_use && (
                                <Chip size="small" label="Salon Use" color="warning" sx={{ ml: 0.5 }} />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="medium">
                                {aggregatedService.total_quantity}
                                {aggregatedService.stylists.length > 1 && (
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    ({aggregatedService.stylists.length} experts)
                                  </Typography>
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(aggregatedService.unit_price)}
                              {aggregatedService.stylists.length > 1 && aggregatedService.total_quantity > aggregatedService.stylists.length && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  (per unit)
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(aggregatedService.total_price)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {/* Show membership purchase details for purchased membership tiers */}
                              {aggregatedService.type === 'membership' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                  <Chip
                                    icon={<CardMembershipIcon fontSize="small" />}
                                    label="Membership Purchased"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                  {aggregatedService.benefit_amount && (
                                    <Typography variant="caption" color="text.secondary">
                                      Benefit: ₹{(aggregatedService.benefit_amount || 0).toLocaleString()}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                              
                              {/* Show if service was paid with membership balance */}
                              {aggregatedService.type === 'service' && aggregatedService.paid_with_membership && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <Chip
                                    icon={<CheckIcon fontSize="small" />}
                                    label="Paid via Membership"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    (GST Excluded)
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Show benefit amount consumption for other membership items */}
                              {aggregatedService.type !== 'membership' && aggregatedService.type !== 'service' && 
                               aggregatedService.benefit_amount && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <Chip
                                    icon={<AccountBalanceWalletIcon fontSize="small" />}
                                    label={`Benefit: ₹${(aggregatedService.benefit_amount || 0).toLocaleString()}`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                </Box>
                              )}
                              
                              {/* Show dash only for products and services without membership details */}
                              {(aggregatedService.type === 'product' || 
                                (aggregatedService.type === 'service' && !aggregatedService.paid_with_membership)) && 
                               !aggregatedService.benefit_amount && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </AccessibleDialog>
        )}
        
        {/* Payment Completion Dialog */}
        {selectedOrder && (
          <CompletePaymentDialog
            open={paymentDialogOpen}
            onClose={() => setPaymentDialogOpen(false)}
            order={selectedOrder}
            onCompletePayment={handleCompletePaymentSubmit}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteOrder} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete All Orders Confirmation Dialog */}
        <Dialog
          open={deleteAllConfirmOpen}
          onClose={() => setDeleteAllConfirmOpen(false)}
          aria-labelledby="alert-dialog-title-all"
          aria-describedby="alert-dialog-description-all"
        >
          <DialogTitle id="alert-dialog-title-all">{"Delete Orders in Date Range"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description-all">
              Warning: This will permanently delete ALL orders from {startDate ? startDate.toLocaleDateString() : 'the beginning'} to {endDate ? endDate.toLocaleDateString() : 'today'}. 
              {(() => {
                const ordersInRange = filteredOrders.filter(order => {
                  const orderDate = new Date(order.created_at || '');
                  const startCheck = !startDate || orderDate >= new Date(new Date(startDate).setHours(0,0,0,0));
                  const endCheck = !endDate || orderDate <= new Date(new Date(endDate).setHours(23,59,59,999));
                  return startCheck && endCheck;
                });
                return ` This will delete ${ordersInRange.length} order${ordersInRange.length !== 1 ? 's' : ''}.`;
              })()} 
              This action cannot be undone. Are you absolutely sure you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAllConfirmOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteAllOrders} 
              color="error" 
              variant="contained"
              autoFocus
            >
              Yes, Delete Date Range Orders
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Orders Dialog */}
        <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
          <DialogTitle>Import Orders from Excel</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select an Excel file (.xlsx) to import orders. Please ensure the columns match the required format.
            </DialogContentText>
            <Button
              variant="contained"
              component="label"
              sx={{ mt: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".xlsx"
                onChange={handleImportOrders}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
} 