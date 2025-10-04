import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
} from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  CircularProgress,
  InputAdornment,
  Alert,
  Divider,
  Tabs,
  Tab,
  Autocomplete,
  FormControlLabel,
  Switch,
  TableFooter,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  FilterAlt as FilterIcon,
  FilterAltOff as FilterOffIcon,
  Speed as SpeedIcon,
  LocalShipping as LocalShippingIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProducts, Product } from '../hooks/products/useProducts';
import {
  usePurchaseHistory,
  PurchaseTransaction,
  OpeningBalanceData,
} from '../hooks/inventory/usePurchaseHistory';
import {
  addPurchaseTransaction,
  editPurchaseTransaction,
} from '../utils/inventoryUtils';
// ProductFormData interface moved to types
interface ProductFormData {
  product_name: string;
  hsn_code: string;
  units: string;
  purchase_qty: number;
  purchase_price: number;
  gst_percentage: number;
  total_amount: number;
  supplier_name: string;
  purchase_date: string;
  notes: string;
}

const initialFormData: ProductFormData = {
  product_name: '',
  hsn_code: '',
  units: 'pcs',
  purchase_qty: 0,
  purchase_price: 0,
  gst_percentage: 18,
  total_amount: 0,
  supplier_name: '',
  purchase_date: new Date().toISOString().split('T')[0],
  notes: '',
};
import { supabase, handleSupabaseError } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import {
  calculatePriceExcludingGST,
  calculateGSTAmount,
} from '../utils/gstCalculations';
import { SelectChangeEvent } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import DateRangeCalendar from '../components/dashboard/DateRangeCalendar';
import {
  formatCurrency,
  formatDateKolkata,
} from '../utils/formatting/formatters';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#8baf3f',
  color: 'white',
  fontSize: '0.8rem',
  padding: '8px 12px',
  whiteSpace: 'nowrap',
  textTransform: 'capitalize',
}));

// Define interface for sales history items
interface SalesHistoryItem {
  id?: string;
  serial_no: string;
  order_id: string;
  date: string;
  product_name: string;
  quantity: number;
  unit_price_ex_gst: number;
  unit_price_incl_gst: number; // New field
  gst_percentage: number;
  taxable_value: number;
  discount_percentage: number; // New field
  taxable_after_discount: number; // New field
  cgst_amount: number;
  sgst_amount: number;
  total_purchase_cost: number;
  discount: number;
  tax: number;
  hsn_code: string;
  product_type: string;
  mrp_incl_gst: number | null;
  discounted_sales_rate_ex_gst: number | null;
  invoice_value: number;
  igst_amount: number;
  stock: number; // Changed from current_stock
  stock_taxable_value: number; // Changed from taxable_value_current_stock
  stock_cgst: number; // Changed from cgst_current_stock
  stock_sgst: number; // Changed from sgst_current_stock
  stock_total_value: number; // Changed from total_value_current_stock
  invoice_number?: string;
  invoice_no?: string;
}

// Define interface for salon consumption items
interface SalonConsumptionItem {
  id?: string;
  requisition_voucher_no: string;
  order_id: string;
  date: string;
  product_name: string;
  product_type: string;
  consumption_qty: number;
  hsn_code: string | null;
  purchase_cost_per_unit_ex_gst: number;
  purchase_gst_percentage: number;
  purchase_taxable_value: number;
  purchase_igst: number;
  purchase_cgst: number;
  purchase_sgst: number;
  total_purchase_cost: number;
  discounted_sales_rate: number;
  current_stock: number;
  created_at?: string;
  serial_no?: string; // Add this field
  invoice_number?: string;
  invoice_no?: string;
}

// Define interface for balance stock items
interface BalanceStockItem {
  id: string;
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  change_type: 'reduction' | 'addition';
  source: string;
  reference_id: string;
  quantity_change: number;
  quantity_after_change: number;
  serial_no?: string; // Add this field
}

// Define interface for ExtendedProductFormData
interface ExtendedProductFormData extends ProductFormData {
  product_id: string;
  purchase_id?: string;
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  purchase_invoice_number: string;
  purchase_qty: number;
  mrp_incl_gst: number;
  mrp_excl_gst: number;
  discount_on_purchase_percentage: number;
  purchase_excl_gst: number;
  gst_percentage: number;
  purchase_cost_taxable_value: number;
  purchase_igst: number;
  purchase_cgst: number;
  purchase_sgst: number;
  purchase_invoice_value: number;
  vendor: string;
  supplier: string;
  stock_after_purchase?: number;
  total_value?: number;
  total_tax?: number;
  is_interstate: boolean;
  mrp_per_unit_excl_gst: number;
  unit_type: string;
  purchase_cost_per_unit_ex_gst: number;
  invoice_number?: string;
  invoice_no?: string;
}

// Update the extendedInitialFormData with all required fields
const extendedInitialFormData: ExtendedProductFormData = {
  product_id: '',
  date: (() => {
    // Initialize with current time in India timezone
    const now = new Date();
    const indiaOffset = 5.5 * 60; // India is UTC+5:30
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const indiaTime = new Date(utcTime + indiaOffset * 60000);
    return indiaTime.toISOString();
  })(),
  product_name: '',
  hsn_code: '',
  units: '',
  unit_type: '',
  purchase_invoice_number: '',
  purchase_qty: 0,
  mrp_incl_gst: 0,
  mrp_excl_gst: 0,
  discount_on_purchase_percentage: 0,
  gst_percentage: 18,
  purchase_cost_taxable_value: 0,
  purchase_igst: 0,
  purchase_cgst: 0,
  purchase_sgst: 0,
  purchase_invoice_value: 0,
  vendor: '',
  supplier: '',
  is_interstate: false,
  mrp_per_unit_excl_gst: 0,
  purchase_cost_per_unit_ex_gst: 0,
  purchase_excl_gst: 0,
  purchase_price: 0,
  total_amount: 0,
  supplier_name: '',
  purchase_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function InventoryManager() {
  const {
    products: productMasterList,
    isLoading: isLoadingProducts,
    error: errorProducts,
    fetchProducts,
  } = useProducts();
  const {
    purchases,
    isLoading: isLoadingPurchases,
    error: errorPurchases,
    fetchPurchases: fetchPurchasesFromHook,
    deletePurchaseTransaction,
    updatePurchaseTransaction,
    addOpeningBalance,
  } = usePurchaseHistory();

  const [open, setOpen] = useState(false);
  const [purchaseFormData, setPurchaseFormData] =
    useState<ExtendedProductFormData>(extendedInitialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogMode, setDialogMode] = useState<'purchase' | 'inventory'>(
    'purchase'
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [activeTab, setActiveTab] = useState<
    'purchaseHistory' | 'salesHistory' | 'salonConsumption'
  >('purchaseHistory');

  // Add state for product types for the dialog's unit dropdown
  const [productTypesForDialog, setProductTypesForDialog] = useState<string[]>(
    []
  );
  const [isLoadingProductTypesDialog, setIsLoadingProductTypesDialog] =
    useState<boolean>(false);

  // Purchase history filter and sort state
  const [purchaseHistoryFilter, setPurchaseHistoryFilter] = useState({
    productName: '',
    hsnCode: '',
    vendor: '',
    invoiceNumber: '',
    minAmount: '',
    maxAmount: '',
  });
  const [purchaseSortConfig, setPurchaseSortConfig] = useState<{
    key: keyof PurchaseTransaction | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc',
  });

  // State for sales history
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
  const [isLoadingSalesHistory, setIsLoadingSalesHistory] =
    useState<boolean>(false);
  const [salesHistoryError, setSalesHistoryError] = useState<string | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SalesHistoryItem | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc',
  });

  // State for salon consumption
  const [salonConsumption, setSalonConsumption] = useState<
    SalonConsumptionItem[]
  >([]);
  const [isLoadingSalonConsumption, setIsLoadingSalonConsumption] =
    useState<boolean>(false);
  const [salonConsumptionError, setSalonConsumptionError] = useState<
    string | null
  >(null);
  const [salonSortConfig, setSalonSortConfig] = useState<{
    key: keyof SalonConsumptionItem | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc',
  });

  // State for balance stock
  const [balanceStock, setBalanceStock] = useState<BalanceStockItem[]>([]);
  const [isLoadingBalanceStock, setIsLoadingBalanceStock] =
    useState<boolean>(false);
  const [balanceStockError, setBalanceStockError] = useState<string | null>(
    null
  );
  const [balanceStockSortConfig, setBalanceStockSortConfig] = useState<{
    key: keyof BalanceStockItem | null;
    direction: 'asc' | 'desc';
  }>({
    key: null,
    direction: 'asc',
  });

  // Sales history filter state
  const [salesHistoryFilter, setSalesHistoryFilter] = useState({
    productName: '',
    hsnCode: '',
    productType: '',
    minAmount: '',
    maxAmount: '',
  });

  // Salon consumption filter state
  const [salonConsumptionFilter, setSalonConsumptionFilter] = useState({
    productName: '',
    voucherNo: '',
    minAmount: '',
    maxAmount: '',
  });

  // Balance stock filter state
  const [balanceStockFilter, setBalanceStockFilter] = useState({
    productName: '',
    changeType: '',
    source: '',
    hsn: '',
    minQuantity: '',
    maxQuantity: '',
  });

  // State for export functionality
  const [isExporting, setIsExporting] = useState(false);

  // State for all orders context (for consistent order ID formatting)
  const [allOrdersForContext, setAllOrdersForContext] = useState<any[]>([]);

  // Date filter state - simplified for purchase history only
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    endDate: new Date(), // Today
    isActive: false,
  });

  // State for managing date range calendar
  const [dateRangeAnchorEl, setDateRangeAnchorEl] =
    useState<HTMLElement | null>(null);

  // Add this after the existing state declarations around line 240
  // State for managing multiple product additions in current session
  const [addedProductsSummary, setAddedProductsSummary] = useState<
    ExtendedProductFormData[]
  >([]);
  const [currentSessionTotal, setCurrentSessionTotal] = useState<{
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
  }>({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
  });

  // Add state for tracking summary item being edited
  const [editingSummaryIndex, setEditingSummaryIndex] = useState<number | null>(
    null
  );

  // Function to initialize database tables
  const initializeDatabaseTables = useCallback(async () => {
    try {
      console.log('Initializing database tables...');
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }, []);

  // This is the local wrapper for the fetchPurchases function from the hook
  const fetchPurchasesData = useCallback(async () => {
    await fetchPurchasesFromHook();

    // After fetching, assign serial numbers
    setPurchaseSortConfig({ key: 'date', direction: 'desc' }); // Default sort by date, newest first
  }, [fetchPurchasesFromHook]);

  // Function to fetch sales history data
  const fetchSalesHistory = useCallback(async () => {
    console.log('[InventoryManager] Starting fetchSalesHistory...');
    setIsLoadingSalesHistory(true);
    setSalesHistoryError(null);

    try {
      console.log(
        '[InventoryManager] Fetching sales history from sales_history_final...'
      );
      const { data, error } = await supabase
        .from('sales_history_final')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        console.log(
          `[InventoryManager] Fetched ${data.length} sales history records`
        );

        // The sales_history_final view already includes product_type from product_master
        console.log(
          '[InventoryManager] Using product_type directly from sales_history_final view'
        );
        // Sort data by date, oldest first (for assigning serial numbers)
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB; // Ascending order (oldest first)
        });

        // Assign sequential serial numbers with SALES- prefix
        const dataWithSerialNumbers = sortedData.map((item, index) => {
          // Ensure all necessary fields are properly calculated
          const unitPriceIncGst =
            item.unit_price_ex_gst * (1 + item.gst_percentage / 100);
          const discountPercentage = item.discount_percentage || 0;
          const taxableAfterDiscount =
            item.taxable_value * (1 - discountPercentage / 100);

          // Recalculate GST amounts based on taxable after discount
          const recalculatedCgst =
            taxableAfterDiscount * (item.gst_percentage / 200); // CGST = GST% / 2
          const recalculatedSgst =
            taxableAfterDiscount * (item.gst_percentage / 200); // SGST = GST% / 2
          const recalculatedIgst = 0; // IGST is always 0 for intra-state

          // Calculate corrected tax (sum of all GST components)
          const correctedTax =
            recalculatedCgst + recalculatedSgst + recalculatedIgst;

          // Calculate corrected invoice value
          const correctedInvoiceValue =
            taxableAfterDiscount +
            recalculatedCgst +
            recalculatedSgst +
            recalculatedIgst;

          // Current stock calculations using remaining stock from database
          const remainingStock = item.stock || 0; // Use stock field from sales_history_final view
          const taxableValueCurrentStock =
            remainingStock * item.unit_price_ex_gst;
          const cgstCurrentStock =
            taxableValueCurrentStock * (item.gst_percentage / 200);
          const sgstCurrentStock =
            taxableValueCurrentStock * (item.gst_percentage / 200);
          const totalValueCurrentStock =
            taxableValueCurrentStock + cgstCurrentStock + sgstCurrentStock;

          // Get product type directly from the view (already includes product_type from product_master)
          const productName = item.product_name || 'Unknown Product';
          const productType = item.product_type || 'Unknown';

          console.log(
            `[InventoryManager] Processing product "${productName}" with type: ${productType}`
          );

          const processedItem = {
            ...item,
            serial_no: `SALES-${String(index + 1).padStart(2, '0')}`,
            unit_price_incl_gst: unitPriceIncGst,
            discount_percentage: discountPercentage,
            taxable_after_discount: taxableAfterDiscount,
            // Use recalculated GST amounts for sales transaction
            cgst_amount: recalculatedCgst,
            sgst_amount: recalculatedSgst,
            igst_amount: recalculatedIgst,
            tax: correctedTax,
            invoice_value: correctedInvoiceValue,
            // Current stock calculations
            taxable_value_current_stock: taxableValueCurrentStock,
            cgst_current_stock: cgstCurrentStock,
            sgst_current_stock: sgstCurrentStock,
            total_value_current_stock: totalValueCurrentStock,
            // Ensure MRP and discounted rates are populated with real values if empty
            mrp_incl_gst: item.mrp_incl_gst || unitPriceIncGst,
            discounted_sales_rate_ex_gst:
              item.discounted_sales_rate_ex_gst || item.unit_price_ex_gst,
            // Set the product type from the matching
            product_type: productType,
          };

          // Log every few items to verify product type assignment
          if (index < 3) {
            console.log(
              `[InventoryManager] Sample processed item ${index + 1}:`,
              {
                product_name: processedItem.product_name,
                product_type: processedItem.product_type,
                hsn_code: processedItem.hsn_code,
              }
            );
          }

          return processedItem;
        });

        // Sort back by serial number descending (newest first) for display
        const finalSortedData = dataWithSerialNumbers.sort((a, b) => {
          const serialA = String(a.serial_no || '').replace('SALES-', '');
          const serialB = String(b.serial_no || '').replace('SALES-', '');
          const numA = parseInt(serialA) || 0;
          const numB = parseInt(serialB) || 0;
          return numB - numA; // Descending order (newest first - higher serial numbers)
        });

        setSalesHistory(finalSortedData);
        console.log(
          `[InventoryManager] Sales history processing complete. Final data count: ${finalSortedData.length}`
        );

        // Log a summary of product type mapping results
        const productTypeCounts = finalSortedData.reduce(
          (acc: Record<string, number>, item) => {
            const type = item.product_type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          },
          {}
        );
        console.log(
          '[InventoryManager] Product type distribution:',
          productTypeCounts
        );
      } else {
        setSalesHistory([]);
      }
    } catch (error) {
      console.error('Error fetching sales history:', error);
      setSalesHistoryError('Failed to load sales history data');
    } finally {
      setIsLoadingSalesHistory(false);
    }
  }, [supabase]);

  // Function to fetch salon consumption data with serial numbers
  const fetchSalonConsumption = useCallback(async () => {
    setIsLoadingSalonConsumption(true);
    setSalonConsumptionError(null);

    try {
      console.log('Fetching salon consumption data...');

      // First, fetch all orders for context to generate consistent order IDs
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('pos_orders')
        .select(
          'id, created_at, is_salon_consumption, consumption_purpose, type, client_name'
        )
        .order('created_at', { ascending: false });

      if (allOrdersError) {
        console.error('Error fetching all orders for context:', allOrdersError);
      } else {
        setAllOrdersForContext(allOrders || []);
      }

      const { data, error } = await supabase
        .from('salon_consumption_new')
        .select('*')
        .order('Date', { ascending: false });

      console.log('Salon consumption query result:', { data, error });

      if (error) {
        throw error;
      }

      if (data) {
        // Fetch all products from the product master to get HSN codes
        try {
          const productsResponse = await supabase
            .from('products')
            .select('name, hsn_code');

          // Create a map of product name to HSN code for quick lookup
          const productHsnMap: Record<string, string> = {};
          if (productsResponse.data) {
            productsResponse.data.forEach((product: any) => {
              if (product.name && product.hsn_code) {
                productHsnMap[product.name.toLowerCase()] = product.hsn_code;
              }
            });
          }

          console.log(
            'Product HSN map created with',
            Object.keys(productHsnMap).length,
            'products'
          );

          // Normalize the column names to match our interface
          console.log('Raw data from salon_consumption_new:', data);
          console.log('Sample raw item:', data[0]);
          console.log(
            'Available keys in raw data:',
            data[0] ? Object.keys(data[0]) : 'No data'
          );
          console.log('Product HSN Map:', productHsnMap);

          const normalizedData = data.map((item, index) => {
            // Try to get HSN code from multiple sources with fallbacks
            const productName = item['Product Name'] || '';
            const hsnFromRecord =
              item['HSN Code'] || item.HSN_Code || item.hsn_code;
            // Look up HSN code from product master using lowercase for case-insensitive matching
            const hsnFromProductMaster = productName
              ? productHsnMap[productName.toLowerCase()]
              : undefined;
            // Use HSN from record first, then from product master, then fallback to '-'
            const finalHsnCode = hsnFromRecord || hsnFromProductMaster || '-';

            console.log(
              `Item ${index}: Product="${productName}", HSN from record="${hsnFromRecord}", HSN from master="${hsnFromProductMaster}", Final HSN="${finalHsnCode}"`
            );

            // Format the order ID properly using the existing formatOrderId function
            const orderForFormatting = {
              id: item.order_id,
              created_at: item.Date,
              is_salon_consumption: true, // Salon consumption orders
              type: 'salon_consumption',
            };
            const formattedOrderId = formatOrderId(orderForFormatting);

            return {
              id: item.order_id,
              requisition_voucher_no: item['Requisition Voucher No.'],
              order_id: formattedOrderId,
              date: item.Date, // Changed from Date to match interface
              product_name: productName,
              product_type: item.product_type || '', // Add product_type field
              consumption_qty: Number(item['Consumption Qty.']),
              hsn_code: finalHsnCode, // Use the HSN code with fallbacks
              purchase_cost_per_unit_ex_gst: Number(
                item.Purchase_Cost_per_Unit_Ex_GST_Rs
              ),
              purchase_gst_percentage: Number(item.Purchase_GST_Percentage),
              purchase_taxable_value: Number(item.Purchase_Taxable_Value_Rs),
              purchase_igst: Number(item.Purchase_IGST_Rs),
              purchase_cgst: Number(item.Purchase_CGST_Rs),
              purchase_sgst: Number(item.Purchase_SGST_Rs),
              total_purchase_cost: Number(item.Total_Purchase_Cost_Rs),
              discounted_sales_rate: Number(item.Discounted_Sales_Rate_Rs),
              current_stock: Number(item.Current_Stock),
              created_at: item.Date, // Use Date as created_at
              serial_no: `SALON-${data.length - index}`, // Add serial numbers in reverse order
            };
          });
          console.log(
            'Normalized salon consumption data with serial numbers:',
            normalizedData
          );
          setSalonConsumption(normalizedData);
        } catch (productError) {
          console.error('Error fetching products for HSN codes:', productError);
          // Still process the salon consumption data even if product lookup fails
          const normalizedData = data.map((item, index) => {
            // Format the order ID properly using the existing formatOrderId function
            const orderForFormatting = {
              id: item.order_id,
              created_at: item.Date,
              is_salon_consumption: true, // Salon consumption orders
              type: 'salon_consumption',
            };
            const formattedOrderId = formatOrderId(orderForFormatting);

            return {
              id: item.order_id,
              requisition_voucher_no: item['Requisition Voucher No.'],
              order_id: formattedOrderId,
              date: item.Date,
              product_name: item['Product Name'] || '',
              product_type: item.product_type || '', // Add product_type field
              consumption_qty: Number(item['Consumption Qty.']),
              hsn_code:
                item['HSN Code'] || item.HSN_Code || item.hsn_code || '-', // Fallback without product lookup
              purchase_cost_per_unit_ex_gst: Number(
                item.Purchase_Cost_per_Unit_Ex_GST_Rs
              ),
              purchase_gst_percentage: Number(item.Purchase_GST_Percentage),
              purchase_taxable_value: Number(item.Purchase_Taxable_Value_Rs),
              purchase_igst: Number(item.Purchase_IGST_Rs),
              purchase_cgst: Number(item.Purchase_CGST_Rs),
              purchase_sgst: Number(item.Purchase_SGST_Rs),
              total_purchase_cost: Number(item.Total_Purchase_Cost_Rs),
              discounted_sales_rate: Number(item.Discounted_Sales_Rate_Rs),
              current_stock: Number(item.Current_Stock),
              created_at: item.Date,
              serial_no: `SALON-${data.length - index}`,
            };
          });
          setSalonConsumption(normalizedData);
        }
      } else {
        console.log('No salon consumption data returned');
        setSalonConsumption([]);
      }
    } catch (error) {
      console.error('Error fetching salon consumption data:', error);
      setSalonConsumptionError('Failed to load salon consumption data');
    } finally {
      setIsLoadingSalonConsumption(false);
    }
  }, [supabase]);

  // Function to fetch balance stock data
  const fetchBalanceStock = useCallback(async () => {
    setIsLoadingBalanceStock(true);
    setBalanceStockError(null);

    try {
      console.log('Fetching balance stock data...');
      const { data, error } = await supabase
        .from('product_stock_transaction_history')
        .select('*')
        .order('Date', { ascending: false });

      console.log('Balance stock query result:', { data, error });

      if (error) {
        throw error;
      }

      if (data) {
        console.log('Raw data from product_stock_transaction_history:', data);
        const normalizedData = data.map((item, index) => ({
          id: item.id,
          date: item.Date,
          product_name: item['Product Name'],
          hsn_code: item['HSN Code'],
          units: item.Units,
          change_type: item['Change Type'] as 'reduction' | 'addition',
          source: item.Source,
          reference_id: item['Reference ID'],
          quantity_change: Number(item['Quantity Change']),
          quantity_after_change: Number(item['Quantity After Change']),
          serial_no: `STOCK-${data.length - index}`, // Add serial numbers in reverse order
        }));
        console.log(
          'Normalized balance stock data with serial numbers:',
          normalizedData
        );
        setBalanceStock(normalizedData);
      } else {
        console.log('No balance stock data returned');
        setBalanceStock([]);
      }
    } catch (error) {
      console.error('Error fetching balance stock data:', error);
      setBalanceStockError('Failed to load balance stock data');
    } finally {
      setIsLoadingBalanceStock(false);
    }
  }, [supabase]);

  // Add a function to get serial number
  const getBalanceStockSerialNo = (item: BalanceStockItem, index: number) => {
    // Always generate a consistent serial number based on total count and index
    return `STOCK-${balanceStock.length - index}`;
  };

  useEffect(() => {
    initializeDatabaseTables();
    fetchPurchasesData();
    fetchSalesHistory();
    fetchSalonConsumption();
    // fetchBalanceStock();

    const fetchDialogProductTypes = async () => {
      setIsLoadingProductTypesDialog(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_type');
        if (error) {
          console.error(
            'Error context: fetching product types for dialog',
            error
          );
          throw handleSupabaseError(error);
        }
        if (data) {
          const distinctTypes = Array.from(
            new Set(
              data
                .map(item => item.product_type)
                .filter(pt => pt && pt.trim() !== '')
            )
          ).sort();
          setProductTypesForDialog(
            distinctTypes.length > 0
              ? distinctTypes
              : ['pcs', 'units', 'bottles']
          );
        } else {
          setProductTypesForDialog(['pcs', 'units', 'bottles']);
        }
      } catch (err) {
        console.error('Error fetching product types for dialog:', err);
        toast.error(
          err instanceof Error
            ? err.message
            : 'Failed to load unit types for dialog.'
        );
        setProductTypesForDialog(['pcs', 'units', 'bottles']);
      } finally {
        setIsLoadingProductTypesDialog(false);
      }
    };
    fetchDialogProductTypes();
  }, [
    initializeDatabaseTables,
    fetchPurchasesData,
    fetchSalesHistory,
    fetchSalonConsumption,
    supabase,
    handleSupabaseError,
  ]);

  // Function to apply date filter to data
  const applyDateFilter = (data: any[]): any[] => {
    if (!dateFilter.isActive) {
      return data;
    }

    // Clone the dates and set hours for proper comparison
    const startDate = new Date(dateFilter.startDate);
    startDate.setHours(0, 0, 0, 0); // Start of day

    const endDate = new Date(dateFilter.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day

    // Filter data by date
    const filteredData = data.filter(item => {
      // Get the date from the item, using different potential date fields
      let itemDate: Date | null = null;

      if (item.date) {
        itemDate = new Date(item.date);
      } else if (item.Date) {
        // Added check for Date field with capital D
        itemDate = new Date(item.Date);
      } else if (item.created_at) {
        itemDate = new Date(item.created_at);
      } else {
        return false; // Skip items without a date
      }

      if (!isNaN(itemDate.getTime())) {
        return itemDate >= startDate && itemDate <= endDate;
      }

      return false;
    });

    return filteredData;
  };

  // Calculate filtered purchase history data using useMemo for efficiency
  const filteredPurchases = useMemo(() => {
    // First apply date filter
    const dateFiltered = applyDateFilter(purchases);

    // Then apply other filters
    return dateFiltered.filter(item => {
      // Product name filter
      if (
        purchaseHistoryFilter.productName &&
        !item.product_name
          .toLowerCase()
          .includes(purchaseHistoryFilter.productName.toLowerCase())
      ) {
        return false;
      }

      // HSN code filter
      if (
        purchaseHistoryFilter.hsnCode &&
        (!item.hsn_code ||
          !item.hsn_code
            .toLowerCase()
            .includes(purchaseHistoryFilter.hsnCode.toLowerCase()))
      ) {
        return false;
      }

      // Vendor filter
      if (
        purchaseHistoryFilter.vendor &&
        (!item.supplier ||
          !item.supplier
            .toLowerCase()
            .includes(purchaseHistoryFilter.vendor.toLowerCase()))
      ) {
        return false;
      }

      // Invoice number filter
      if (
        purchaseHistoryFilter.invoiceNumber &&
        (!item.purchase_invoice_number ||
          !item.purchase_invoice_number
            .toLowerCase()
            .includes(purchaseHistoryFilter.invoiceNumber.toLowerCase()))
      ) {
        return false;
      }

      // Min amount filter
      if (
        purchaseHistoryFilter.minAmount &&
        Number(item.purchase_invoice_value_rs) <
          Number(purchaseHistoryFilter.minAmount)
      ) {
        return false;
      }

      // Max amount filter
      if (
        purchaseHistoryFilter.maxAmount &&
        Number(item.purchase_invoice_value_rs) >
          Number(purchaseHistoryFilter.maxAmount)
      ) {
        return false;
      }

      return true;
    });
  }, [purchases, dateFilter, purchaseHistoryFilter]);

  // Get sorted purchase history data
  const sortedPurchases = useMemo(() => {
    // First, filter out items that are regular purchases (not opening balance)
    const regularPurchases = filteredPurchases.filter(
      item =>
        item.transaction_type !== 'stock_increment' &&
        item.transaction_type !== 'opening_balance'
    );

    if (!purchaseSortConfig.key) {
      // Default sort by date, newest first
      const sorted = [...filteredPurchases].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      // Explicitly assign serial numbers in sorted data - only count regular purchases for numbering
      const withSerialNos = sorted.map(item => {
        if (
          item.transaction_type === 'stock_increment' ||
          item.transaction_type === 'opening_balance'
        ) {
          return {
            ...item,
            serial_no: 'OPENING BALANCE',
          };
        } else {
          // Sort regular purchases by date, newest first
          const sortedRegularPurchases = [...regularPurchases].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateA - dateB; // Ascending order (oldest first)
          });

          const purchaseIndex = sortedRegularPurchases.findIndex(
            p => p.purchase_id === item.purchase_id
          );
          // Reverse the numbering - highest number for newest purchases
          return {
            ...item,
            serial_no: `PURCHASE-${sortedRegularPurchases.length - purchaseIndex}`,
          };
        }
      });

      return withSerialNos;
    }

    // Sort by the specified key
    const sorted = [...filteredPurchases].sort((a, b) => {
      const aValue = a[purchaseSortConfig.key as keyof PurchaseTransaction];
      const bValue = b[purchaseSortConfig.key as keyof PurchaseTransaction];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return purchaseSortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return purchaseSortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    // Assign serial numbers based on sorted data
    const withSerialNos = sorted.map(item => {
      if (
        item.transaction_type === 'stock_increment' ||
        item.transaction_type === 'opening_balance'
      ) {
        return {
          ...item,
          serial_no: 'OPENING BALANCE',
        };
      } else {
        // Count only regular purchases for numbering
        const regularPurchases = purchases.filter(
          p =>
            !(
              p.transaction_type === 'stock_increment' ||
              p.transaction_type === 'opening_balance'
            )
        );

        // Sort regular purchases by date, newest first
        const sortedRegularPurchases = [...regularPurchases].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB; // Ascending order (oldest first)
        });

        const purchaseIndex = sortedRegularPurchases.findIndex(
          p => p.purchase_id === item.purchase_id
        );
        // Reverse the numbering - highest number for newest purchases
        return {
          ...item,
          serial_no: `PURCHASE-${sortedRegularPurchases.length - purchaseIndex}`,
        };
      }
    });

    return withSerialNos;
  }, [filteredPurchases, purchaseSortConfig, purchases]);

  // Calculate filtered sales history data using useMemo for efficiency
  const filteredSalesHistory = useMemo(() => {
    // First apply date filter
    const dateFiltered = applyDateFilter(salesHistory);

    // Then apply other filters
    return dateFiltered.filter(item => {
      // Product name filter
      if (
        salesHistoryFilter.productName &&
        !item.product_name
          .toLowerCase()
          .includes(salesHistoryFilter.productName.toLowerCase())
      ) {
        return false;
      }

      // HSN code filter
      if (
        salesHistoryFilter.hsnCode &&
        !item.hsn_code
          .toLowerCase()
          .includes(salesHistoryFilter.hsnCode.toLowerCase())
      ) {
        return false;
      }

      // Product type filter
      if (
        salesHistoryFilter.productType &&
        !item.product_type
          .toLowerCase()
          .includes(salesHistoryFilter.productType.toLowerCase())
      ) {
        return false;
      }

      // Min amount filter
      if (
        salesHistoryFilter.minAmount &&
        Number(item.invoice_value) < Number(salesHistoryFilter.minAmount)
      ) {
        return false;
      }

      // Max amount filter
      if (
        salesHistoryFilter.maxAmount &&
        Number(item.invoice_value) > Number(salesHistoryFilter.maxAmount)
      ) {
        return false;
      }

      return true;
    });
  }, [salesHistory, dateFilter, salesHistoryFilter]);

  // Calculate filtered salon consumption data using useMemo
  const filteredSalonConsumption = useMemo(() => {
    // First apply date filter
    const dateFiltered = applyDateFilter(salonConsumption);

    // Then apply other filters
    return dateFiltered.filter(item => {
      // Product name filter
      if (
        salonConsumptionFilter.productName &&
        !item.product_name
          .toLowerCase()
          .includes(salonConsumptionFilter.productName.toLowerCase())
      ) {
        return false;
      }

      // Voucher number filter
      if (
        salonConsumptionFilter.voucherNo &&
        !item.requisition_voucher_no
          .toLowerCase()
          .includes(salonConsumptionFilter.voucherNo.toLowerCase())
      ) {
        return false;
      }

      // Min amount filter
      if (
        salonConsumptionFilter.minAmount &&
        Number(item.total_purchase_cost) <
          Number(salonConsumptionFilter.minAmount)
      ) {
        return false;
      }

      // Max amount filter
      if (
        salonConsumptionFilter.maxAmount &&
        Number(item.total_purchase_cost) >
          Number(salonConsumptionFilter.maxAmount)
      ) {
        return false;
      }

      return true;
    });
  }, [salonConsumption, dateFilter, salonConsumptionFilter]);

  // Calculate filtered balance stock data using useMemo
  const filteredBalanceStock = useMemo(() => {
    // First apply date filter
    const dateFiltered = applyDateFilter(balanceStock);

    // Then apply other filters
    return dateFiltered.filter(item => {
      // Product name filter
      if (
        balanceStockFilter.productName &&
        !item.product_name
          .toLowerCase()
          .includes(balanceStockFilter.productName.toLowerCase())
      ) {
        return false;
      }

      // Change type filter
      if (
        balanceStockFilter.changeType &&
        item.change_type !== balanceStockFilter.changeType
      ) {
        return false;
      }

      // Source filter
      if (
        balanceStockFilter.source &&
        !item.source
          .toLowerCase()
          .includes(balanceStockFilter.source.toLowerCase())
      ) {
        return false;
      }

      // HSN filter
      if (
        balanceStockFilter.hsn &&
        !item.hsn_code
          .toLowerCase()
          .includes(balanceStockFilter.hsn.toLowerCase())
      ) {
        return false;
      }

      // Min quantity filter
      if (
        balanceStockFilter.minQuantity &&
        Math.abs(Number(item.quantity_change)) <
          Number(balanceStockFilter.minQuantity)
      ) {
        return false;
      }

      // Max quantity filter
      if (
        balanceStockFilter.maxQuantity &&
        Math.abs(Number(item.quantity_change)) >
          Number(balanceStockFilter.maxQuantity)
      ) {
        return false;
      }

      return true;
    });
  }, [balanceStock, dateFilter, balanceStockFilter]);

  // Apply sorting to sales history data
  const handleRequestSort = (property: keyof SalesHistoryItem) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';

    // When sorting by date, we want the default to be newest first (desc)
    if (property === 'date' && sortConfig.key !== 'date') {
      setSortConfig({
        key: property,
        direction: 'desc',
      });
    } else {
      setSortConfig({
        key: property,
        direction: isAsc ? 'desc' : 'asc',
      });
    }
  };

  // Apply sorting to salon consumption data
  const handleSalonRequestSort = (property: keyof SalonConsumptionItem) => {
    const isAsc =
      salonSortConfig.key === property && salonSortConfig.direction === 'asc';
    setSalonSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc',
    });
  };

  // Get sorted sales history data
  const sortedSalesHistory = useMemo(() => {
    if (!sortConfig.key) {
      // Default sort by date, newest first
      return [...filteredSalesHistory].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    }

    return [...filteredSalesHistory].sort((a, b) => {
      if (a[sortConfig.key!] === null) return 1;
      if (b[sortConfig.key!] === null) return -1;

      const valueA = a[sortConfig.key!];
      const valueB = b[sortConfig.key!];

      // Special handling for serial numbers in SALES-XX format
      if (sortConfig.key === 'serial_no') {
        // Extract the numeric part of SALES-XX
        const numA = parseInt(String(valueA).replace('SALES-', ''));
        const numB = parseInt(String(valueB).replace('SALES-', ''));
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      if (sortConfig.key === 'date') {
        // Special handling for dates
        const dateA = new Date(valueA as string).getTime();
        const dateB = new Date(valueB as string).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // For numbers and other comparable types
      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredSalesHistory, sortConfig]);

  // Get sorted salon consumption data
  const sortedSalonConsumption = useMemo(() => {
    if (!salonSortConfig.key) {
      // Default sort by date, newest first
      const sorted = [...filteredSalonConsumption].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      // Explicitly assign serial numbers in sorted data
      const withSerialNos = sorted.map((item, index) => ({
        ...item,
        serial_no: `SALON-${filteredSalonConsumption.length - index}`,
      }));

      return withSerialNos;
    }

    const sorted = [...filteredSalonConsumption].sort((a, b) => {
      if (a[salonSortConfig.key!] === null) return 1;
      if (b[salonSortConfig.key!] === null) return -1;

      const valueA = a[salonSortConfig.key!];
      const valueB = b[salonSortConfig.key!];

      if (valueA < valueB) {
        return salonSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return salonSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Explicitly assign serial numbers in sorted data
    const withSerialNos = sorted.map((item, index) => ({
      ...item,
      serial_no: `SALON-${filteredSalonConsumption.length - index}`,
    }));

    return withSerialNos;
  }, [filteredSalonConsumption, salonSortConfig]);

  // Calculate totals using useMemo
  const totalPurchaseQty = useMemo(
    () =>
      filteredPurchases.reduce(
        (sum, item) => sum + (item.purchase_qty || 0),
        0
      ),
    [filteredPurchases]
  );

  // Calculate totals for sales history
  const salesHistoryTotals = useMemo(() => {
    return filteredSalesHistory.reduce(
      (totals, item) => {
        return {
          quantity: totals.quantity + Number(item.quantity || 0),
          taxableValue: totals.taxableValue + Number(item.taxable_value || 0),
          cgstAmount: totals.cgstAmount + Number(item.cgst_amount || 0),
          sgstAmount: totals.sgstAmount + Number(item.sgst_amount || 0),
          igstAmount: totals.igstAmount + Number(item.igst_amount || 0),
          invoiceValue: totals.invoiceValue + Number(item.invoice_value || 0),
        };
      },
      {
        quantity: 0,
        taxableValue: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        invoiceValue: 0,
      }
    );
  }, [filteredSalesHistory]);

  // Calculate totals for salon consumption
  const salonConsumptionTotals = useMemo(() => {
    return filteredSalonConsumption.reduce(
      (totals, item) => {
        // Calculate current stock values using remaining stock from database
        const currentStock = Number(item.Current_Stock || 0); // Use Current_Stock from salon_consumption_new view
        const taxableValueCurrentStock =
          currentStock * Number(item.Purchase_Cost_per_Unit_Ex_GST_Rs || 0);
        const cgstCurrentStock =
          taxableValueCurrentStock *
          (Number(item.Purchase_GST_Percentage || 0) / 200);
        const sgstCurrentStock =
          taxableValueCurrentStock *
          (Number(item.Purchase_GST_Percentage || 0) / 200);
        const igstCurrentStock =
          item.Purchase_IGST_Rs > 0
            ? taxableValueCurrentStock *
              (Number(item.Purchase_GST_Percentage || 0) / 100)
            : 0;
        const totalValueCurrentStock =
          taxableValueCurrentStock +
          cgstCurrentStock +
          sgstCurrentStock +
          igstCurrentStock;

        return {
          quantity: totals.quantity + Number(item.consumption_qty || 0),
          taxableValue:
            totals.taxableValue + Number(item.purchase_taxable_value || 0),
          cgstAmount: totals.cgstAmount + Number(item.purchase_cgst || 0),
          sgstAmount: totals.sgstAmount + Number(item.purchase_sgst || 0),
          igstAmount: totals.igstAmount + Number(item.purchase_igst || 0),
          totalValue: totals.totalValue + Number(item.total_purchase_cost || 0),
          taxableValueCurrentStock:
            totals.taxableValueCurrentStock + taxableValueCurrentStock,
          cgstCurrentStock: totals.cgstCurrentStock + cgstCurrentStock,
          sgstCurrentStock: totals.sgstCurrentStock + sgstCurrentStock,
          igstCurrentStock: totals.igstCurrentStock + igstCurrentStock,
          totalValueCurrentStock:
            totals.totalValueCurrentStock + totalValueCurrentStock,
        };
      },
      {
        quantity: 0,
        taxableValue: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalValue: 0,
        taxableValueCurrentStock: 0,
        cgstCurrentStock: 0,
        sgstCurrentStock: 0,
        igstCurrentStock: 0,
        totalValueCurrentStock: 0,
      }
    );
  }, [filteredSalonConsumption]);

  // Function to handle exporting data based on the active tab
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    console.log('🚀 Starting Inventory Excel export:', {
      activeTab,
      sortedPurchasesCount: sortedPurchases.length,
      sortedSalesHistoryCount: sortedSalesHistory.length,
      sortedSalonConsumptionCount: sortedSalonConsumption.length,
      sortedBalanceStockCount: sortedBalanceStock.length,
    });

    try {
      const workbook = XLSX.utils.book_new();

      // Helper function to safely format numbers with proper decimal places
      const safeNumber = (value: any, decimals: number = 2): number => {
        if (value === null || value === undefined || isNaN(Number(value)))
          return 0;
        return Number(Number(value).toFixed(decimals));
      };

      // Helper function to safely format strings
      const safeString = (value: any): string => {
        if (value === null || value === undefined) return '-';
        return String(value);
      };

      // Helper function to safely format dates
      const safeDate = (value: any): string => {
        if (!value) return '-';
        try {
          return formatDateKolkata(value); // Use Kolkata timezone
        } catch (e) {
          return value.toString();
        }
      };

      // Sort purchases in ascending order (oldest first) for export
      const sortedPurchasesForExport = [...sortedPurchases].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // Purchase History sheet - All columns as in frontend with validation
      const purchaseData = sortedPurchasesForExport.map((purchase, index) => {
        // Use the stock_after_purchase directly from the purchase record
        const stockAfterPurchaseDisplay =
          typeof purchase.stock_after_purchase === 'number'
            ? purchase.stock_after_purchase
            : 0;

        // Calculations for current stock columns
        let totalValueMRP = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        const gstRate = purchase.gst_percentage ?? 18;

        if (
          typeof purchase.stock_after_purchase === 'number' &&
          purchase.stock_after_purchase > 0
        ) {
          const mrpExGst = calculatePriceExcludingGST(
            purchase.mrp_incl_gst ?? 0,
            purchase.gst_percentage ?? 0
          );
          const discountPercentage =
            purchase.discount_on_purchase_percentage ?? 0;
          const discountedPurchaseCostPerUnit =
            mrpExGst * (1 - discountPercentage / 100);

          totalValueMRP =
            purchase.stock_after_purchase * discountedPurchaseCostPerUnit;

          if (purchase.purchase_igst && purchase.purchase_igst > 0) {
            totalIGST = totalValueMRP * (gstRate / 100);
          } else {
            totalCGST = totalValueMRP * (gstRate / 200);
            totalSGST = totalValueMRP * (gstRate / 200);
          }
        }

        // Get the serial number using the same logic as the display
        let serialNo = 'OPENING BALANCE';
        if (
          purchase.transaction_type !== 'stock_increment' &&
          purchase.transaction_type !== 'opening_balance'
        ) {
          // Get only regular purchases for counting
          const regularPurchases = sortedPurchasesForExport.filter(
            p =>
              p.transaction_type !== 'stock_increment' &&
              p.transaction_type !== 'opening_balance'
          );

          // Sort regular purchases by date, newest first
          const sortedRegularPurchases = [...regularPurchases].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateA - dateB; // Ascending order (oldest first)
          });

          // Find position in regular purchases
          const purchaseIndex = sortedRegularPurchases.findIndex(
            p => p.purchase_id === purchase.purchase_id
          );
          if (purchaseIndex !== -1) {
            // Reverse the numbering - highest number for newest purchases
            serialNo = `PURCHASE-${sortedRegularPurchases.length - purchaseIndex}`;
          }
        }

        // Calculate MRP Ex GST
        const mrpExGst = calculatePriceExcludingGST(
          purchase.mrp_incl_gst ?? 0,
          purchase.gst_percentage ?? 0
        );

        // Calculate Purchase Cost/Unit (Ex.GST)
        const discountPercentage =
          purchase.discount_on_purchase_percentage ?? 0;
        const purchaseCostPerUnit = mrpExGst * (1 - discountPercentage / 100);

        const rowData = {
          'Serial No':
            purchase.transaction_type === 'stock_increment' ||
            purchase.transaction_type === 'opening_balance' ||
            purchase.transaction_type === 'inventory_update'
              ? 'OPENING BALANCE'
              : serialNo,
          Date: safeDate(purchase.date),
          'Product Name': safeString(purchase.product_name),
          'HSN Code': safeString(purchase.hsn_code),
          UNITS: safeString(purchase.units),
          Vendor:
            purchase.transaction_type === 'stock_increment' ||
            purchase.transaction_type === 'opening_balance'
              ? 'OPENING BALANCE'
              : safeString(purchase.supplier),
          'Purchase Invoice No.':
            purchase.transaction_type === 'stock_increment' ||
            purchase.transaction_type === 'opening_balance'
              ? 'OPENING BALANCE'
              : safeString(purchase.purchase_invoice_number),
          'Purchase Qty.': safeNumber(purchase.purchase_qty, 0),
          'MRP Incl. GST (Rs.)': safeNumber(purchase.mrp_incl_gst),
          'MRP Ex. GST (Rs.)': safeNumber(mrpExGst),
          'Discount %': safeNumber(purchase.discount_on_purchase_percentage),
          'Purchase Cost/Unit (Ex.GST)': safeNumber(purchaseCostPerUnit),
          'GST %': safeNumber(purchase.gst_percentage),
          'Taxable Value (Transaction Rs.)': safeNumber(
            purchase.purchase_taxable_value
          ),
          'IGST (Transaction Rs.)': safeNumber(purchase.purchase_igst),
          'CGST (Transaction Rs.)': safeNumber(purchase.purchase_cgst),
          'SGST (Transaction Rs.)': safeNumber(purchase.purchase_sgst),
          'Invoice Value (Transaction Rs.)': safeNumber(
            purchase.purchase_invoice_value_rs
          ),
          'Current Stock After Purchase': safeNumber(
            stockAfterPurchaseDisplay,
            0
          ),
          'Total Taxable Value (Current Stock Rs.)': safeNumber(totalValueMRP),
          'Total CGST (Current Stock Rs.)': safeNumber(totalCGST),
          'Total SGST (Current Stock Rs.)': safeNumber(totalSGST),
          'Total IGST (Current Stock Rs.)': safeNumber(totalIGST),
          'Total Amount (Incl. GST Current Stock Rs.)': safeNumber(
            totalValueMRP + totalCGST + totalSGST + totalIGST
          ),
          'Transaction Type': safeString(
            purchase.transaction_type || 'purchase'
          ),
        };

        // Log first row for validation
        if (index === 0) {
          console.log('📊 Purchase data first row:', rowData);
        }

        return rowData;
      });

      if (purchaseData.length) {
        console.log(
          `✅ Creating Purchase History sheet with ${purchaseData.length} rows`
        );
        const ws = XLSX.utils.json_to_sheet(purchaseData);

        // Apply yellow highlighting to inventory update rows
        const inventoryUpdateRows: number[] = [];
        sortedPurchasesForExport.forEach((purchase, index) => {
          if (
            purchase.transaction_type === 'stock_increment' ||
            purchase.transaction_type === 'opening_balance'
          ) {
            inventoryUpdateRows.push(index + 2); // +2 because Excel is 1-indexed and row 1 is headers
          }
        });

        // Apply yellow background to inventory update rows
        if (inventoryUpdateRows.length > 0) {
          console.log(
            `🎨 Applying highlighting to ${inventoryUpdateRows.length} inventory update rows`
          );
          const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

          for (const rowIndex of inventoryUpdateRows) {
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellRef = XLSX.utils.encode_cell({
                r: rowIndex - 1,
                c: col,
              }); // -1 because XLSX uses 0-based indexing
              if (ws[cellRef]) {
                if (!ws[cellRef].s) ws[cellRef].s = {};
                ws[cellRef].s.fill = {
                  fgColor: { rgb: 'FFFF00' }, // Yellow background
                  patternType: 'solid',
                };
              }
            }
          }
        }

        XLSX.utils.book_append_sheet(workbook, ws, 'Purchase History');
      }

      // Sort sales history in ascending order (oldest first) for export
      const sortedSalesHistoryForExport = [...sortedSalesHistory].sort(
        (a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        }
      );

      // Sales History sheet - All columns as in frontend with validation
      const salesData = sortedSalesHistoryForExport.map((sale, index) => {
        const unitPriceInclGst =
          sale.unit_price_incl_gst ||
          sale.unit_price_ex_gst * (1 + sale.gst_percentage / 100);
        const discountPercentage = sale.discount_percentage || 0;
        const taxableAfterDiscount =
          sale.taxable_after_discount ||
          sale.taxable_value * (1 - discountPercentage / 100);
        const mrpInclGst = sale.mrp_incl_gst || unitPriceInclGst;
        const discountedRate =
          sale.discounted_sales_rate_ex_gst || sale.unit_price_ex_gst;

        // Calculate stock values if missing
        const stockTaxableValue =
          sale.stock_taxable_value || sale.stock * sale.unit_price_ex_gst;
        const stockCgst =
          sale.stock_cgst || stockTaxableValue * (sale.gst_percentage / 200);
        const stockSgst =
          sale.stock_sgst || stockTaxableValue * (sale.gst_percentage / 200);
        const stockTotalValue =
          sale.stock_total_value || stockTaxableValue + stockCgst + stockSgst;

        const rowData = {
          'Serial No': safeString(sale.serial_no),
          Date: safeDate(sale.date),
          'Product Name': safeString(sale.product_name),
          'HSN Code': safeString(sale.hsn_code),
          'Product Type': safeString(sale.product_type),
          'Qty.': safeNumber(sale.quantity, 0),
          'Unit Price (Ex. GST)': safeNumber(sale.unit_price_ex_gst),
          'Unit Price (Incl. GST)': safeNumber(unitPriceInclGst),
          'Taxable Value': safeNumber(sale.taxable_value),
          'GST %': safeNumber(sale.gst_percentage),
          'Discount %': safeNumber(discountPercentage),
          'Taxable After Discount': safeNumber(taxableAfterDiscount),
          CGST: safeNumber(sale.cgst_amount),
          SGST: safeNumber(sale.sgst_amount),
          IGST: safeNumber(sale.igst_amount),
          Discount: safeNumber(sale.discount),
          Tax: safeNumber(sale.tax),
          'Invoice Value': safeNumber(sale.invoice_value),
          'MRP (Incl. GST)': safeNumber(mrpInclGst),
          'Discounted Rate': safeNumber(discountedRate),
          Stock: safeNumber(sale.stock, 0),
          'Stock Taxable Value': safeNumber(stockTaxableValue),
          'Stock CGST': safeNumber(stockCgst),
          'Stock SGST': safeNumber(stockSgst),
          'Stock Total Value': safeNumber(stockTotalValue),
          'Order ID': safeString(sale.order_id),
        };

        // Log first row for validation
        if (index === 0) {
          console.log('📊 Sales data first row:', rowData);
        }

        return rowData;
      });

      if (salesData.length) {
        console.log(
          `✅ Creating Sales History sheet with ${salesData.length} rows`
        );
        const ws = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(workbook, ws, 'Sales History');
      }

      // Sort salon consumption in ascending order (oldest first) for export
      const sortedSalonConsumptionForExport = [...sortedSalonConsumption].sort(
        (a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        }
      );

      // Salon Consumption sheet - All columns as in frontend with validation
      const salonData = sortedSalonConsumptionForExport.map((item, index) => {
        const taxableValueCurrentStock =
          Number(item.current_stock) *
          Number(item.purchase_cost_per_unit_ex_gst || 0);
        const cgstCurrentStock =
          taxableValueCurrentStock *
          (Number(item.purchase_gst_percentage || 0) / 200);
        const sgstCurrentStock =
          taxableValueCurrentStock *
          (Number(item.purchase_gst_percentage || 0) / 200);
        const igstCurrentStock =
          item.purchase_igst > 0
            ? taxableValueCurrentStock *
              (Number(item.purchase_gst_percentage || 0) / 100)
            : 0;
        const totalValueCurrentStock =
          taxableValueCurrentStock +
          cgstCurrentStock +
          sgstCurrentStock +
          igstCurrentStock;

        const rowData = {
          'Serial No': safeString(
            (item as any).serial_no ||
              `SALON-${sortedSalonConsumptionForExport.length - index}`
          ),
          Date: safeDate(item.date),
          'Voucher No': safeString(item.requisition_voucher_no),
          'Order ID': safeString(item.order_id),
          'Product Name': safeString(item.product_name),
          'HSN Code': safeString(item.hsn_code),
          'Product Type': safeString(item.product_type),
          Quantity: safeNumber(item.consumption_qty, 0),
          'Unit Price (Ex. GST)': safeNumber(
            item.purchase_cost_per_unit_ex_gst
          ),
          'GST %': safeNumber(item.purchase_gst_percentage),
          'Taxable Value': safeNumber(item.purchase_taxable_value),
          IGST: safeNumber(item.purchase_igst),
          CGST: safeNumber(item.purchase_cgst),
          SGST: safeNumber(item.purchase_sgst),
          'Total Cost': safeNumber(item.total_purchase_cost),
          'Discounted Rate': safeNumber(item.discounted_sales_rate),
          'Current Stock': safeNumber(item.current_stock, 0),
          'Taxable Value (Current Stock Rs.)': safeNumber(
            taxableValueCurrentStock
          ),
          'IGST (Current Stock Rs.)': safeNumber(igstCurrentStock),
          'CGST (Current Stock Rs.)': safeNumber(cgstCurrentStock),
          'SGST (Current Stock Rs.)': safeNumber(sgstCurrentStock),
          'Total Value (Current Stock Rs.)': safeNumber(totalValueCurrentStock),
        };

        // Log first row for validation
        if (index === 0) {
          console.log('📊 Salon consumption data first row:', rowData);
        }

        return rowData;
      });

      if (salonData.length) {
        console.log(
          `✅ Creating Salon Consumption sheet with ${salonData.length} rows`
        );
        const ws = XLSX.utils.json_to_sheet(salonData);
        XLSX.utils.book_append_sheet(workbook, ws, 'Salon Consumption');
      }

      // Sort balance stock in ascending order (oldest first) for export
      const sortedBalanceStockForExport = [...sortedBalanceStock].sort(
        (a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        }
      );

      // Balance Stock sheet - All columns as in frontend with validation
      const balanceData = sortedBalanceStockForExport.map((item, index) => {
        const rowData = {
          'Serial No': safeString(
            item.serial_no ||
              `STOCK-${sortedBalanceStockForExport.length - index}`
          ),
          Date: safeDate(item.date),
          'Product Name': safeString(item.product_name),
          'HSN Code': safeString(item.hsn_code),
          Units: safeString(item.units),
          'Change Type':
            item.change_type === 'addition' ? 'Addition' : 'Reduction',
          Source: safeString(item.source),
          'Reference ID': safeString(item.reference_id),
          'Quantity Change':
            item.change_type === 'addition'
              ? safeNumber(Math.abs(Number(item.quantity_change)), 0)
              : safeNumber(-Math.abs(Number(item.quantity_change)), 0),
          'Quantity After': safeNumber(item.quantity_after_change, 0),
        };

        // Log first row for validation
        if (index === 0) {
          console.log('📊 Balance stock data first row:', rowData);
        }

        return rowData;
      });

      if (balanceData.length) {
        console.log(
          `✅ Creating Balance Stock sheet with ${balanceData.length} rows`
        );
        const ws = XLSX.utils.json_to_sheet(balanceData);
        XLSX.utils.book_append_sheet(workbook, ws, 'Balance Stock');
      }

      // Generate and save workbook
      console.log('📁 Generating Excel workbook...');
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      const fileName = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

      console.log('✅ Excel export completed successfully:', {
        fileName,
        sheetsCreated: [
          purchaseData.length > 0 ? 'Purchase History' : null,
          salesData.length > 0 ? 'Sales History' : null,
          salonData.length > 0 ? 'Salon Consumption' : null,
          balanceData.length > 0 ? 'Balance Stock' : null,
        ].filter(Boolean),
      });

      toast.success(
        `Exported all tables successfully with all columns! File: ${fileName}`
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value: any): string => {
    return value ? Number(value).toLocaleString('en-IN') : '0';
  };

  const handleTabChange = (event: ChangeEvent<{}>, newValue: string) => {
    setActiveTab(
      newValue as 'purchaseHistory' | 'salesHistory' | 'salonConsumption'
    );
    setPage(0); // Reset pagination when changing tabs

    // Fetch data based on new tab
    if (newValue === 'purchaseHistory') {
      fetchPurchasesData();
    } else if (newValue === 'salesHistory') {
      fetchSalesHistory();
    } else if (newValue === 'salonConsumption') {
      fetchSalonConsumption();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setPurchaseFormData(extendedInitialFormData);
    setDialogMode('purchase');
    // Reset summary when closing dialog
    setAddedProductsSummary([]);
    setCurrentSessionTotal({
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
    });
    // Reset summary editing state
    setEditingSummaryIndex(null);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleOpenOpeningBalance = () => {
    setDialogMode('inventory');
    setEditingId(null);
    setPurchaseFormData(extendedInitialFormData);
    // Reset summary when opening for opening balance
    setAddedProductsSummary([]);
    setCurrentSessionTotal({
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
    });
    setEditingSummaryIndex(null);
    handleOpen();
  };

  const handleEdit = (purchase: PurchaseTransaction) => {
    console.log('Editing purchase:', purchase);
    // Set both editingPurchaseId (legacy) and editingId (used by handleSubmit) to ensure correct edit behavior
    setEditingPurchaseId(purchase.purchase_id);
    setEditingId(purchase.purchase_id || null);
    setIsEditing(true);

    // Ensure the date has proper time component in India timezone
    let dateToUse = purchase.date;
    if (dateToUse) {
      const date = new Date(dateToUse);
      // If the date is exactly midnight (00:00:00), it probably lost its time component
      if (
        date.getHours() === 0 &&
        date.getMinutes() === 0 &&
        date.getSeconds() === 0
      ) {
        // Use current time in India timezone but keep the original date
        const now = new Date();
        const indiaOffset = 5.5 * 60; // India is UTC+5:30
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const indiaTime = new Date(utcTime + indiaOffset * 60000);

        date.setHours(indiaTime.getHours());
        date.setMinutes(indiaTime.getMinutes());
        date.setSeconds(indiaTime.getSeconds());
        date.setMilliseconds(indiaTime.getMilliseconds());

        dateToUse = date.toISOString();
        console.log(
          'Updated midnight timestamp to include current India time:',
          dateToUse
        );
      }
    }

    const formData: ExtendedProductFormData = {
      product_id: purchase.product_id,
      purchase_id: purchase.purchase_id,
      date:
        dateToUse ||
        (() => {
          // Create current time in India timezone
          const now = new Date();
          const indiaOffset = 5.5 * 60;
          const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
          const indiaTime = new Date(utcTime + indiaOffset * 60000);
          return indiaTime.toISOString();
        })(),
      product_name: purchase.product_name || '',
      hsn_code: purchase.hsn_code || '',
      units: purchase.units || '',
      unit_type: purchase.units || '',
      purchase_invoice_number: purchase.purchase_invoice_number || '',
      purchase_qty: purchase.purchase_qty || 0,
      mrp_incl_gst: purchase.mrp_incl_gst || 0,
      mrp_excl_gst: purchase.mrp_excl_gst || 0,
      discount_on_purchase_percentage:
        purchase.discount_on_purchase_percentage || 0,
      gst_percentage: purchase.gst_percentage || 18,
      purchase_cost_taxable_value: purchase.purchase_taxable_value || 0,
      purchase_igst: purchase.purchase_igst || 0,
      purchase_cgst: purchase.purchase_cgst || 0,
      purchase_sgst: purchase.purchase_sgst || 0,
      purchase_invoice_value: purchase.purchase_invoice_value_rs || 0,
      vendor: purchase.supplier || '',
      supplier: purchase.supplier || '',
      is_interstate: (purchase.purchase_igst || 0) > 0,
      mrp_per_unit_excl_gst: purchase.mrp_excl_gst || 0,
      purchase_cost_per_unit_ex_gst:
        purchase.purchase_cost_per_unit_ex_gst || 0,
      purchase_excl_gst: purchase.purchase_cost_per_unit_ex_gst || 0,
      purchase_price: purchase.purchase_cost_per_unit_ex_gst || 0,
      total_amount: purchase.purchase_invoice_value_rs || 0,
      supplier_name: purchase.supplier || '',
      purchase_date: purchase.date
        ? new Date(purchase.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      notes: '',
    };

    console.log('Form data for editing:', formData);
    setPurchaseFormData(formData);
    setDialogMode('purchase');
    setOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (editingId) {
      try {
        console.log('Updating purchase with ID:', editingId);
        console.log('Full form data for edit:', purchaseFormData);

        // Validate the form first
        if (!validateForm()) {
          setIsSubmitting(false);
          return;
        }

        // Use the comprehensive editPurchaseTransaction function from inventoryUtils
        // This will handle all fields including quantity, prices, GST, etc.
        const result = await editPurchaseTransaction(
          editingId,
          purchaseFormData
        );
        console.log('Edit result:', result);

        if (result && result.success) {
          toast.success('Purchase updated successfully!');
          handleClose();
          await fetchPurchasesData();
          await fetchProducts(); // Refresh products to reflect stock changes
        } else {
          console.error('Failed to update purchase:', result?.error);
          toast.error(result?.error?.message || 'Failed to update purchase.');
        }
      } catch (error) {
        console.error('Error updating purchase:', error);
        toast.error(
          `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingSummaryIndex !== null) {
        // Handle updating summary item (not saving to database yet)
        saveSummaryItemChanges();
      } else {
        // Handle adding new purchase or inventory update
        if (dialogMode === 'inventory') {
          // Handle opening balance entry
          const openingBalanceData: OpeningBalanceData = {
            product_id: purchaseFormData.product_id,
            date: purchaseFormData.date,
            product_name: purchaseFormData.product_name,
            hsn_code: purchaseFormData.hsn_code,
            units: purchaseFormData.unit_type,
            opening_qty: purchaseFormData.purchase_qty,
            mrp_incl_gst: purchaseFormData.mrp_incl_gst,
            mrp_excl_gst: purchaseFormData.mrp_excl_gst,
            discount_on_purchase_percentage:
              purchaseFormData.discount_on_purchase_percentage,
            gst_percentage: purchaseFormData.gst_percentage,
            purchase_cost_per_unit_ex_gst: purchaseFormData.purchase_excl_gst,
            purchase_taxable_value:
              purchaseFormData.purchase_cost_taxable_value,
            purchase_igst: purchaseFormData.purchase_igst,
            purchase_cgst: purchaseFormData.purchase_cgst,
            purchase_sgst: purchaseFormData.purchase_sgst,
            purchase_invoice_value_rs: purchaseFormData.purchase_invoice_value,
            is_interstate: purchaseFormData.is_interstate,
          };

          const result = await addOpeningBalance(openingBalanceData);

          if (result.success) {
            // Add to summary instead of closing dialog
            const currentProduct = { ...purchaseFormData };
            setAddedProductsSummary(prev => [...prev, currentProduct]);

            // Update session totals
            const newTotalProducts = addedProductsSummary.length + 1;
            const newTotalQuantity =
              addedProductsSummary.reduce(
                (acc, prod) => acc + prod.purchase_qty,
                0
              ) + purchaseFormData.purchase_qty;
            const newTotalValue =
              addedProductsSummary.reduce(
                (acc, prod) => acc + prod.purchase_invoice_value,
                0
              ) + purchaseFormData.purchase_invoice_value;

            setCurrentSessionTotal({
              totalProducts: newTotalProducts,
              totalQuantity: newTotalQuantity,
              totalValue: newTotalValue,
            });

            toast.success(
              'Opening balance added! Add another product or close to finish.'
            );

            // Reset form for next product but keep date
            const resetFormData = {
              ...extendedInitialFormData,
              date: purchaseFormData.date,
              is_interstate: purchaseFormData.is_interstate,
            };
            setPurchaseFormData(resetFormData);

            await fetchPurchasesData();
            await fetchProducts();
          } else {
            console.error('Failed to add opening balance:', result.error);
            toast.error(
              `Error: ${result.error?.message || 'Failed to add opening balance.'}`
            );
          }
        } else {
          // Handle purchase
          const result = await addPurchaseTransaction(purchaseFormData);

          if (result.success) {
            // Add to summary instead of closing dialog
            const currentProduct = { ...purchaseFormData };
            setAddedProductsSummary(prev => [...prev, currentProduct]);

            // Update session totals
            const newTotalProducts = addedProductsSummary.length + 1;
            const newTotalQuantity =
              addedProductsSummary.reduce(
                (acc, prod) => acc + prod.purchase_qty,
                0
              ) + purchaseFormData.purchase_qty;
            const newTotalValue =
              addedProductsSummary.reduce(
                (acc, prod) => acc + prod.purchase_invoice_value,
                0
              ) + purchaseFormData.purchase_invoice_value;

            setCurrentSessionTotal({
              totalProducts: newTotalProducts,
              totalQuantity: newTotalQuantity,
              totalValue: newTotalValue,
            });

            toast.success(
              'Product added to purchase! Add another product or close to finish.'
            );

            // Reset form for next product but keep vendor, date and invoice number
            const resetFormData = {
              ...extendedInitialFormData,
              date: purchaseFormData.date,
              vendor: purchaseFormData.vendor,
              purchase_invoice_number: purchaseFormData.purchase_invoice_number,
              is_interstate: purchaseFormData.is_interstate,
            };
            setPurchaseFormData(resetFormData);

            await fetchPurchasesData();
            await fetchProducts();
          } else {
            console.error('Failed to add purchase transaction:', result.error);
            toast.error(
              `Error: ${result.error?.message || 'Failed to save purchase.'}`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error(
        `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!purchaseFormData.product_name.trim()) {
      alert('Product name is required');
      return false;
    }
    if (!purchaseFormData.hsn_code?.trim()) {
      alert('HSN code is required');
      return false;
    }
    if (!purchaseFormData.unit_type?.trim()) {
      alert('Unit type (Units) is required');
      return false;
    }

    // Only validate vendor and invoice for purchases, not opening balance
    if (dialogMode === 'purchase') {
      if (!purchaseFormData.vendor?.trim()) {
        alert('Vendor name is required');
        return false;
      }
      if (!purchaseFormData.purchase_invoice_number?.trim()) {
        alert('Purchase Invoice Number is required');
        return false;
      }
    }

    if (purchaseFormData.purchase_qty <= 0) {
      alert(
        dialogMode === 'inventory'
          ? 'Opening Balance Quantity must be greater than 0'
          : 'Purchase Quantity must be greater than 0'
      );
      return false;
    }
    if (!purchaseFormData.mrp_incl_gst || purchaseFormData.mrp_incl_gst <= 0) {
      alert('MRP Incl. GST must be greater than 0');
      return false;
    }
    return true;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = async () => {
    await fetchPurchasesData();
    await fetchSalesHistory();
    await fetchSalonConsumption();
    // await fetchBalanceStock();
  };

  const calculatePrices = (price: number, gstPercentage: number) => {
    const priceExcl = calculatePriceExcludingGST(price, gstPercentage);
    return {
      mrp_incl_gst: price,
      mrp_excl_gst: priceExcl,
    };
  };

  const getGSTBreakdown = () => {
    const price = purchaseFormData.mrp_incl_gst;
    const gst = purchaseFormData.gst_percentage;
    return calculatePriceBreakdown(price, gst);
  };

  const getExclusivePrice = () => {
    const breakdown = getGSTBreakdown();
    return breakdown.priceExclGst.toFixed(2);
  };

  const getGSTAmount = () => {
    const breakdown = getGSTBreakdown();
    return breakdown.gstAmount.toFixed(2);
  };

  const calculateGST = (price: number, gstPercentage: number) => {
    const basePrice = price / (1 + gstPercentage / 100);
    const gstAmount = price - basePrice;
    const halfGST = gstAmount / 2;

    return {
      basePrice: parseFloat(basePrice.toFixed(2)),
      igst: 0,
      cgst: parseFloat(halfGST.toFixed(2)),
      sgst: parseFloat(halfGST.toFixed(2)),
    };
  };

  const parseNumericInput = (
    value: string | number | undefined | null
  ): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const calculateGSTAmounts = (
    taxableValue: number,
    gst_percentage: number,
    is_interstate: boolean
  ) => {
    const totalGST = taxableValue * (gst_percentage / 100);
    if (is_interstate) {
      return { igst: totalGST, cgst: 0, sgst: 0 };
    } else {
      return { igst: 0, cgst: totalGST / 2, sgst: totalGST / 2 };
    }
  };

  const calculateInvoiceValue = () => {
    // This function can be expanded if needed, but for now, calculation is in handleInputChange
  };

  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    console.log(`Input change: ${name} = ${value}`);

    setPurchaseFormData(prev => {
      const updated = { ...prev };

      if (name === 'date') {
        // Fix timezone issue: Create date in India timezone (Asia/Kolkata)
        const dateValue = typeof value === 'string' ? value : String(value);
        if (dateValue) {
          const localDate = new Date(dateValue);
          const now = new Date();
          const indiaOffset = 5.5 * 60; // India is UTC+5:30
          const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
          const indiaTime = new Date(utcTime + indiaOffset * 60000);

          localDate.setHours(indiaTime.getHours());
          localDate.setMinutes(indiaTime.getMinutes());
          localDate.setSeconds(indiaTime.getSeconds());
          localDate.setMilliseconds(indiaTime.getMilliseconds());

          updated.date = localDate.toISOString();
        }
      } else {
        // Use type assertion to handle the dynamic property assignment
        (updated as any)[name] = value;
      }

      // Define which fields trigger auto-calculation
      const calculationTriggerFields = [
        'mrp_incl_gst',
        'mrp_excl_gst',
        'gst_percentage',
        'purchase_qty',
        'discount_on_purchase_percentage',
        'is_interstate',
        'purchase_excl_gst',
        'purchase_cost_per_unit_ex_gst',
      ];

      // Only auto-calculate if a trigger field was changed
      if (calculationTriggerFields.includes(name)) {
        let {
          mrp_incl_gst,
          mrp_excl_gst,
          gst_percentage,
          discount_on_purchase_percentage,
          purchase_qty,
          is_interstate,
        } = updated;

        mrp_incl_gst = parseNumericInput(mrp_incl_gst);
        mrp_excl_gst = parseNumericInput(mrp_excl_gst);
        gst_percentage = parseNumericInput(gst_percentage);
        discount_on_purchase_percentage = parseNumericInput(
          discount_on_purchase_percentage
        );
        purchase_qty = parseNumericInput(purchase_qty);

        // Recalculate prices based on which one was changed
        if (name === 'mrp_incl_gst' || name === 'gst_percentage') {
          updated.mrp_excl_gst = calculatePriceExcludingGST(
            mrp_incl_gst,
            gst_percentage
          );
        } else if (name === 'mrp_excl_gst') {
          updated.mrp_incl_gst = mrp_excl_gst * (1 + gst_percentage / 100);
        }

        const final_mrp_excl_gst = parseNumericInput(updated.mrp_excl_gst);

        // Handle purchase cost changes
        let purchase_excl_gst = updated.purchase_excl_gst;

        if (name === 'purchase_cost_per_unit_ex_gst') {
          // If purchase cost per unit was changed directly
          purchase_excl_gst =
            typeof value === 'boolean'
              ? value
                ? 1
                : 0
              : parseNumericInput(value);
          updated.purchase_excl_gst = purchase_excl_gst;

          // Update MRP and discount based on the new purchase cost
          if (purchase_excl_gst > 0) {
            const implied_discount = 1 - purchase_excl_gst / final_mrp_excl_gst;
            updated.discount_on_purchase_percentage =
              Math.round(implied_discount * 100 * 100) / 100; // Round to 2 decimals
          }
        } else if (!['purchase_excl_gst'].includes(name)) {
          // Normal calculation from MRP and discount
          const discount = discount_on_purchase_percentage / 100;
          purchase_excl_gst = final_mrp_excl_gst * (1 - discount);
          updated.purchase_excl_gst = purchase_excl_gst;
        }

        // Recalculate taxable value
        const taxableValue = purchase_excl_gst * purchase_qty;
        updated.purchase_cost_taxable_value = taxableValue;
        updated.purchase_cost_per_unit_ex_gst = purchase_excl_gst;

        // Recalculate GST amounts
        const gstAmounts = calculateGSTAmounts(
          taxableValue,
          gst_percentage,
          is_interstate
        );
        updated.purchase_igst = gstAmounts.igst;
        updated.purchase_cgst = gstAmounts.cgst;
        updated.purchase_sgst = gstAmounts.sgst;

        // Calculate final invoice value
        updated.purchase_invoice_value =
          taxableValue + gstAmounts.igst + gstAmounts.cgst + gstAmounts.sgst;

        // Calculate per unit values
        if (purchase_qty > 0) {
          updated.mrp_per_unit_excl_gst = final_mrp_excl_gst;
          updated.purchase_cost_per_unit_ex_gst = purchase_excl_gst;
        }
      }

      return updated;
    });
  };

  const handleProductSelect = (product: Product | null) => {
    if (product) {
      // Get all values from product master
      const mrp = product.mrp_incl_gst || 0;
      const gst = product.gst_percentage || 18;
      const hsnCode = product.hsn_code || '';
      const productType =
        (product as any).product_type || product.units || 'pcs'; // First try product_type, fallback to units

      setPurchaseFormData(prev => ({
        ...prev,
        product_id: product.id || '',
        product_name: product.name,
        hsn_code: hsnCode,
        unit_type: productType, // Set unit_type from product_type
        units: productType, // Also set units to maintain consistency
        gst_percentage: gst,
        mrp_incl_gst: mrp,
        mrp_excl_gst: calculatePriceExcludingGST(mrp, gst),
        purchase_cost_per_unit_ex_gst: calculatePriceExcludingGST(mrp, gst),
        purchase_excl_gst: calculatePriceExcludingGST(mrp, gst),
        mrp_per_unit_excl_gst: calculatePriceExcludingGST(mrp, gst),
      }));

      // Trigger calculations for GST and other dependent fields
      handleInputChange('mrp_incl_gst', mrp);
      handleInputChange('gst_percentage', gst);
    }
  };

  // New handler for the Select component in the dialog
  const handleDialogSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    // Use the existing handleInputChange logic if it can handle generic name/value pairs
    // or update purchaseFormData directly for 'unit_type'.
    // For consistency, let's use handleInputChange if it's general enough.
    // The 'name' prop on Select should be 'unit_type'.
    handleInputChange(name as string, value);
  };

  // Function to toggle date filter
  const toggleDateFilter = () => {
    setDateFilter(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));

    // Reset to page 1 when toggling filter
    setPage(0);

    // Refresh data when filter is toggled
    handleRefresh();
  };

  // Function to handle date filter changes
  const handleDateFilterChange = (startDate: Date, endDate: Date) => {
    setDateFilter(prev => ({
      ...prev,
      startDate,
      endDate,
    }));

    // Reset to page 1 when changing dates
    setPage(0);
  };

  // Function to handle opening the date range calendar
  const handleOpenDateRangeCalendar = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setDateRangeAnchorEl(event.currentTarget);
  };

  // Function to handle closing the date range calendar
  const handleCloseDateRangeCalendar = () => {
    setDateRangeAnchorEl(null);
  };

  // Fix the calculatePriceBreakdown function to match expected property names
  const calculatePriceBreakdown = (price: number, gstPercentage: number) => {
    // Calculate price excluding GST and GST amount
    const priceExclGst = calculatePriceExcludingGST(price, gstPercentage);
    const gstAmount = calculateGSTAmount(priceExclGst, gstPercentage);

    return {
      priceExclGst,
      gstAmount,
      totalPrice: priceExclGst + gstAmount,
    };
  };

  // Function to handle sales history filter change
  const handleSalesHistoryFilterChange = (field: string, value: string) => {
    setSalesHistoryFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to clear all sales history filters
  const clearSalesHistoryFilters = () => {
    setSalesHistoryFilter({
      productName: '',
      hsnCode: '',
      productType: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  // Function to handle salon consumption filter change
  const handleSalonConsumptionFilterChange = (field: string, value: string) => {
    setSalonConsumptionFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to clear all salon consumption filters
  const clearSalonConsumptionFilters = () => {
    setSalonConsumptionFilter({
      productName: '',
      voucherNo: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  // Function to handle balance stock filter change
  const handleBalanceStockFilterChange = (field: string, value: string) => {
    setBalanceStockFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to clear all balance stock filters
  const clearBalanceStockFilters = () => {
    setBalanceStockFilter({
      productName: '',
      changeType: '',
      source: '',
      hsn: '',
      minQuantity: '',
      maxQuantity: '',
    });
  };

  // Function to handle purchase history filter change
  const handlePurchaseHistoryFilterChange = (field: string, value: string) => {
    setPurchaseHistoryFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to clear all purchase history filters
  const clearPurchaseHistoryFilters = () => {
    setPurchaseHistoryFilter({
      productName: '',
      hsnCode: '',
      vendor: '',
      invoiceNumber: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  // Apply sorting to purchase history data
  const handlePurchaseRequestSort = (property: keyof PurchaseTransaction) => {
    const isAsc =
      purchaseSortConfig.key === property &&
      purchaseSortConfig.direction === 'asc';
    setPurchaseSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc',
    });
  };

  // Helper function for purchase history table column sorting
  const SortablePurchaseTableCell = ({
    label,
    property,
    align = 'left',
  }: {
    label: string;
    property: keyof PurchaseTransaction;
    align?: 'left' | 'right' | 'center';
  }) => {
    const isActive = purchaseSortConfig.key === property;

    return (
      <StyledTableCell
        align={align}
        sortDirection={isActive ? purchaseSortConfig.direction : false}
        onClick={() => handlePurchaseRequestSort(property)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              align === 'left'
                ? 'flex-start'
                : align === 'right'
                  ? 'flex-end'
                  : 'center',
          }}
        >
          {label}
          {isActive && (
            <Box component='span' sx={{ ml: 0.5 }}>
              {purchaseSortConfig.direction === 'asc' ? '▲' : '▼'}
            </Box>
          )}
        </Box>
      </StyledTableCell>
    );
  };

  // Helper function for sales history table column sorting
  const SortableTableCell = ({
    label,
    property,
    align = 'left',
  }: {
    label: string;
    property: keyof SalesHistoryItem;
    align?: 'left' | 'right' | 'center';
  }) => {
    const isActive = sortConfig.key === property;

    return (
      <StyledTableCell
        align={align}
        sortDirection={isActive ? sortConfig.direction : false}
        onClick={() => handleRequestSort(property)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              align === 'left'
                ? 'flex-start'
                : align === 'right'
                  ? 'flex-end'
                  : 'center',
          }}
        >
          {label}
          {isActive && (
            <Box component='span' sx={{ ml: 0.5 }}>
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </Box>
          )}
        </Box>
      </StyledTableCell>
    );
  };

  // Helper function for salon consumption table column sorting
  const SortableSalonTableCell = ({
    label,
    property,
    align = 'left',
  }: {
    label: string;
    property: keyof SalonConsumptionItem;
    align?: 'left' | 'right' | 'center';
  }) => {
    const isActive = salonSortConfig.key === property;

    return (
      <StyledTableCell
        align={align}
        sortDirection={isActive ? salonSortConfig.direction : false}
        onClick={() => handleSalonRequestSort(property)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              align === 'left'
                ? 'flex-start'
                : align === 'right'
                  ? 'flex-end'
                  : 'center',
          }}
        >
          {label}
          {isActive && (
            <Box component='span' sx={{ ml: 0.5 }}>
              {salonSortConfig.direction === 'asc' ? '▲' : '▼'}
            </Box>
          )}
        </Box>
      </StyledTableCell>
    );
  };

  // Helper function for balance stock table column sorting
  const SortableBalanceStockTableCell = ({
    label,
    property,
    align = 'left',
  }: {
    label: string;
    property: keyof BalanceStockItem;
    align?: 'left' | 'right' | 'center';
  }) => {
    const isActive = balanceStockSortConfig.key === property;

    return (
      <StyledTableCell
        align={align}
        sortDirection={isActive ? balanceStockSortConfig.direction : false}
        onClick={() => handleBalanceStockRequestSort(property)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              align === 'left'
                ? 'flex-start'
                : align === 'right'
                  ? 'flex-end'
                  : 'center',
          }}
        >
          {label}
          {isActive && (
            <Box component='span' sx={{ ml: 0.5 }}>
              {balanceStockSortConfig.direction === 'asc' ? '▲' : '▼'}
            </Box>
          )}
        </Box>
      </StyledTableCell>
    );
  };

  // Apply sorting to balance stock data
  const handleBalanceStockRequestSort = (property: keyof BalanceStockItem) => {
    const isAsc =
      balanceStockSortConfig.key === property &&
      balanceStockSortConfig.direction === 'asc';
    setBalanceStockSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc',
    });
  };

  // Force assign serial numbers in the sortedBalanceStock calculation
  const sortedBalanceStock = useMemo(() => {
    if (!balanceStockSortConfig.key) {
      // Default sort by date, newest first
      const sorted = [...filteredBalanceStock].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      // Explicitly assign serial numbers in sorted data
      const withSerialNos = sorted.map((item, index) => ({
        ...item,
        serial_no: `STOCK-${filteredBalanceStock.length - index}`,
      }));

      console.log(
        'Sorted balance stock with explicit serial nos:',
        withSerialNos
      );
      return withSerialNos;
    }

    // Rest of the sorting logic
    const sorted = [...filteredBalanceStock].sort((a, b) => {
      if (
        a[balanceStockSortConfig.key!] === null ||
        a[balanceStockSortConfig.key!] === undefined
      )
        return 1;
      if (
        b[balanceStockSortConfig.key!] === null ||
        b[balanceStockSortConfig.key!] === undefined
      )
        return -1;

      const valueA = a[balanceStockSortConfig.key!];
      const valueB = b[balanceStockSortConfig.key!];

      if (balanceStockSortConfig.key === 'date') {
        // Special handling for dates
        const dateA = new Date(valueA as string).getTime();
        const dateB = new Date(valueB as string).getTime();
        return balanceStockSortConfig.direction === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return balanceStockSortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (valueA < valueB) {
        return balanceStockSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return balanceStockSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Explicitly assign serial numbers in sorted data for this case too
    const withSerialNos = sorted.map((item, index) => ({
      ...item,
      serial_no: `STOCK-${filteredBalanceStock.length - index}`,
    }));

    console.log(
      'Sorted balance stock with explicit serial nos (with sort config):',
      withSerialNos
    );
    return withSerialNos;
  }, [filteredBalanceStock, balanceStockSortConfig]);

  // Calculate totals for balance stock
  const balanceStockTotals = useMemo(() => {
    return filteredBalanceStock.reduce(
      (totals, item) => {
        const quantityChange = Number(item.quantity_change || 0);

        // Only count additions for additions total
        const additions =
          item.change_type.toLowerCase() === 'addition' ? quantityChange : 0;

        // Only count reductions for reductions total (as positive number)
        const reductions =
          item.change_type.toLowerCase() === 'reduction'
            ? Math.abs(quantityChange)
            : 0;

        return {
          additions: totals.additions + additions,
          reductions: totals.reductions + reductions,
          totalChanges: totals.totalChanges + Math.abs(quantityChange),
        };
      },
      {
        additions: 0,
        reductions: 0,
        totalChanges: 0,
      }
    );
  }, [filteredBalanceStock]);

  // Add the getPurchaseSerialNo function
  const getPurchaseSerialNo = (item: PurchaseTransaction, index: number) => {
    if ((item as any).serial_no) {
      return (item as any).serial_no;
    }

    if (
      item.transaction_type === 'opening_balance' &&
      item.supplier === 'OPENING BALANCE'
    ) {
      return 'OPENING BALANCE';
    }

    // Count only regular purchases (not opening balance)
    const regularPurchases = purchases.filter(
      p =>
        !(
          p.transaction_type === 'opening_balance' &&
          p.supplier === 'OPENING BALANCE'
        )
    );

    // Sort regular purchases by date, newest first
    const sortedRegularPurchases = [...regularPurchases].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Ascending order (oldest first)
    });

    // Find the position of this item in regular purchases
    const purchaseIndex = sortedRegularPurchases.findIndex(
      p => p.purchase_id === item.purchase_id
    );
    if (purchaseIndex !== -1) {
      // Reverse the numbering - highest number for newest purchases
      return `PURCHASE-${sortedRegularPurchases.length - purchaseIndex}`;
    }

    // Fallback if purchase not found in filtered list
    return `PURCHASE-${regularPurchases.length}`;
  };

  // Function to check if an order is a salon consumption order
  const isSalonConsumptionOrder = (order: any) => {
    return (
      order.is_salon_consumption === true ||
      order.type === 'salon_consumption' ||
      order.type === 'salon-consumption' ||
      order.consumption_purpose ||
      order.client_name === 'Salon Consumption'
    );
  };

  // Function to format order ID consistently with Orders page
  const formatOrderId = (order: any) => {
    if (!order.id) return 'Unknown';

    // If order already has a formatted order_id, use it
    if (
      order.order_id &&
      (order.order_id.startsWith('RNG') || order.order_id.startsWith('SC'))
    ) {
      return order.order_id;
    }

    // Check if this is a salon consumption order
    const isSalonOrder = isSalonConsumptionOrder(order);

    if (!allOrdersForContext || allOrdersForContext.length === 0) {
      return order.id.substring(0, 8); // Return shortened ID if no context
    }

    // Sort orders by creation date to maintain consistent numbering
    const sortedOrders = [...allOrdersForContext].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateA - dateB;
    });

    // Find the index of the current order in the sorted list
    const orderIndex = sortedOrders.findIndex(o => o.id === order.id);

    if (orderIndex === -1) {
      return order.id.substring(0, 8);
    }

    // Get all orders of the same type (salon or sales) that come before this one
    const sameTypeOrders = sortedOrders
      .slice(0, orderIndex + 1)
      .filter(o => isSalonConsumptionOrder(o) === isSalonOrder);

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
    return isSalonOrder
      ? `SC${formattedNumber}/${yearFormat}`
      : `RNG${formattedNumber}/${yearFormat}`;
  };

  // Add a function to get serial number for salon consumption
  const getSalonConsumptionSerialNo = (
    item: SalonConsumptionItem,
    index: number
  ) => {
    if ((item as any).serial_no) {
      return (item as any).serial_no;
    }
    return `SALON-${salonConsumption.length - index}`;
  };

  const removeFromSummary = (index: number) => {
    const newSummary = addedProductsSummary.filter((_, i) => i !== index);
    setAddedProductsSummary(newSummary);

    // Recalculate totals
    const newTotalProducts = newSummary.length;
    const newTotalQuantity = newSummary.reduce(
      (acc, prod) => acc + prod.purchase_qty,
      0
    );
    const newTotalValue = newSummary.reduce(
      (acc, prod) => acc + prod.purchase_invoice_value,
      0
    );

    setCurrentSessionTotal({
      totalProducts: newTotalProducts,
      totalQuantity: newTotalQuantity,
      totalValue: newTotalValue,
    });
  };

  // Add function to edit summary item
  const editSummaryItem = (index: number) => {
    const productToEdit = addedProductsSummary[index];
    setEditingSummaryIndex(index);

    // Load the product data back into the form
    setPurchaseFormData({
      ...productToEdit,
      // Ensure all required fields are properly set
      product_id: productToEdit.product_id,
      date: productToEdit.date,
      product_name: productToEdit.product_name,
      hsn_code: productToEdit.hsn_code,
      unit_type: productToEdit.unit_type,
      purchase_invoice_number: productToEdit.purchase_invoice_number,
      purchase_qty: productToEdit.purchase_qty,
      mrp_incl_gst: productToEdit.mrp_incl_gst,
      mrp_excl_gst: productToEdit.mrp_excl_gst,
      discount_on_purchase_percentage:
        productToEdit.discount_on_purchase_percentage,
      gst_percentage: productToEdit.gst_percentage,
      purchase_cost_taxable_value: productToEdit.purchase_cost_taxable_value,
      purchase_igst: productToEdit.purchase_igst,
      purchase_cgst: productToEdit.purchase_cgst,
      purchase_sgst: productToEdit.purchase_sgst,
      purchase_invoice_value: productToEdit.purchase_invoice_value,
      vendor: productToEdit.vendor,
      purchase_excl_gst: productToEdit.purchase_excl_gst,
      mrp_per_unit_excl_gst: productToEdit.mrp_per_unit_excl_gst,
      is_interstate: productToEdit.is_interstate,
    });
  };

  // Add function to save summary item changes
  const saveSummaryItemChanges = () => {
    if (editingSummaryIndex === null) return;

    const updatedSummary = [...addedProductsSummary];
    updatedSummary[editingSummaryIndex] = { ...purchaseFormData };
    setAddedProductsSummary(updatedSummary);

    // Recalculate totals
    const newTotalProducts = updatedSummary.length;
    const newTotalQuantity = updatedSummary.reduce(
      (acc, prod) => acc + prod.purchase_qty,
      0
    );
    const newTotalValue = updatedSummary.reduce(
      (acc, prod) => acc + prod.purchase_invoice_value,
      0
    );

    setCurrentSessionTotal({
      totalProducts: newTotalProducts,
      totalQuantity: newTotalQuantity,
      totalValue: newTotalValue,
    });

    // Reset form and editing state
    setEditingSummaryIndex(null);
    const resetFormData = {
      ...extendedInitialFormData,
      date: purchaseFormData.date,
      vendor: purchaseFormData.vendor,
      purchase_invoice_number: purchaseFormData.purchase_invoice_number,
      is_interstate: purchaseFormData.is_interstate,
    };
    setPurchaseFormData(resetFormData);

    toast.success('Product updated in session!');
  };

  // Add function to cancel summary item editing
  const cancelSummaryItemEdit = () => {
    setEditingSummaryIndex(null);
    // Reset form to initial state but keep common fields
    const resetFormData = {
      ...extendedInitialFormData,
      date:
        addedProductsSummary.length > 0
          ? addedProductsSummary[0].date
          : extendedInitialFormData.date,
      vendor:
        addedProductsSummary.length > 0
          ? addedProductsSummary[0].vendor
          : extendedInitialFormData.vendor,
      purchase_invoice_number:
        addedProductsSummary.length > 0
          ? addedProductsSummary[0].purchase_invoice_number
          : extendedInitialFormData.purchase_invoice_number,
      is_interstate:
        addedProductsSummary.length > 0
          ? addedProductsSummary[0].is_interstate
          : extendedInitialFormData.is_interstate,
    };
    setPurchaseFormData(resetFormData);
  };

  const formatDateTimeForDisplay = (
    dateTimeString: string | null | undefined
  ): string => {
    if (!dateTimeString) return 'Unknown';

    try {
      return formatDateKolkata(dateTimeString); // Use Asia/Kolkata timezone without time
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return dateTimeString;
    }
  };

  // Add delete handler function
  const handleDelete = async (purchase: PurchaseTransaction) => {
    if (!purchase.purchase_id) {
      toast.error('Cannot delete: Invalid purchase ID');
      return;
    }

    // Add special handling for opening balance entries
    if (
      purchase.transaction_type === 'opening_balance' ||
      purchase.transaction_type === 'stock_increment'
    ) {
      const confirmed = window.confirm(
        `⚠️ WARNING: You are about to delete an Opening Balance entry!\n\n` +
          `Product: ${purchase.product_name}\n` +
          `Date: ${formatDateTimeForDisplay(purchase.date)}\n` +
          `Quantity: ${purchase.purchase_qty}\n` +
          `Invoice Value: ₹${purchase.purchase_invoice_value_rs?.toFixed(2) || '0.00'}\n\n` +
          `Deleting opening balance entries may affect stock calculations and reports.\n` +
          `This action cannot be undone.\n\n` +
          `Are you absolutely sure you want to proceed?`
      );

      if (!confirmed) {
        return;
      }
    } else {
      // Show confirmation dialog for regular purchases
      const confirmed = window.confirm(
        `Are you sure you want to delete this purchase record?\n\n` +
          `Product: ${purchase.product_name}\n` +
          `Date: ${formatDateTimeForDisplay(purchase.date)}\n` +
          `Quantity: ${purchase.purchase_qty}\n` +
          `Invoice Value: ₹${purchase.purchase_invoice_value_rs?.toFixed(2) || '0.00'}\n\n` +
          `This action cannot be undone.`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const result = await deletePurchaseTransaction(purchase.purchase_id);

      if (result) {
        toast.success('Purchase record deleted successfully');
        // Refresh the data to reflect the deletion
        await fetchPurchasesData();
      } else {
        toast.error('Failed to delete purchase record');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error(
        `Failed to delete purchase: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Typography
          variant='h4'
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          Inventory
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeTab === 'purchaseHistory' && (
            <>
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddIcon />}
                onClick={handleOpen}
              >
                Add Purchase
              </Button>
              <Button
                variant='contained'
                color='warning'
                startIcon={<SpeedIcon />}
                onClick={handleOpenOpeningBalance}
              >
                Add Opening Balance
              </Button>
            </>
          )}
          <Button
            variant='outlined'
            color='primary'
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={activeTab === 'purchaseHistory' && isLoadingPurchases}
          >
            Refresh
          </Button>

          <Button
            variant='contained'
            color='success'
            startIcon={
              isExporting ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Inventory'}
          </Button>
        </Box>
      </Box>

      {/* Add Date Filter Controls */}
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: dateFilter.isActive ? '4px solid #4caf50' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon
            sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }}
          />
          <Typography
            variant='body1'
            fontWeight='600'
            sx={{ fontSize: '0.95rem', color: 'primary.main' }}
          >
            Date Filter
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant='outlined'
            color='primary'
            onClick={handleOpenDateRangeCalendar}
            startIcon={<DateRangeIcon />}
            size='small'
          >
            {dateFilter.isActive
              ? `${dateFilter.startDate.toLocaleDateString('en-IN')} - ${dateFilter.endDate.toLocaleDateString('en-IN')}`
              : 'Select Date Range'}
          </Button>

          <Button
            variant={dateFilter.isActive ? 'contained' : 'outlined'}
            color={dateFilter.isActive ? 'success' : 'primary'}
            onClick={toggleDateFilter}
            startIcon={dateFilter.isActive ? <FilterOffIcon /> : <FilterIcon />}
            size='small'
          >
            {dateFilter.isActive ? 'Disable Filter' : 'Enable Filter'}
          </Button>

          <DateRangeCalendar
            startDate={dateFilter.startDate}
            endDate={dateFilter.endDate}
            onDateRangeChange={handleDateFilterChange}
            onClose={handleCloseDateRangeCalendar}
            anchorEl={dateRangeAnchorEl}
          />
        </Box>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor='primary'
        textColor='primary'
        variant='scrollable'
        scrollButtons='auto'
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 1.5,
          '& .MuiTab-root': {
            minHeight: '40px',
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            px: 2,
            py: 1,
          },
        }}
      >
        <Tab label='Purchase History' value='purchaseHistory' />
        <Tab label='Sales History' value='salesHistory' />
        <Tab label='Salon Consumption' value='salonConsumption' />
        {/* <Tab label="Balance Stock" value="balanceStock" /> */}
      </Tabs>

      {activeTab === 'purchaseHistory' && errorPurchases && (
        <Alert severity='error' sx={{ mb: 1.5 }}>
          {errorPurchases}
        </Alert>
      )}

      {activeTab === 'salesHistory' && salesHistoryError && (
        <Alert severity='error' sx={{ mb: 1.5 }}>
          {salesHistoryError}
        </Alert>
      )}

      {activeTab === 'salonConsumption' && salonConsumptionError && (
        <Alert severity='error' sx={{ mb: 1.5 }}>
          {salonConsumptionError}
        </Alert>
      )}

      {/* Purchase History Tab */}
      {activeTab === 'purchaseHistory' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {/* Purchase History Filters */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12}>
                <Typography
                  variant='body1'
                  fontWeight='600'
                  sx={{ fontSize: '0.95rem', color: 'primary.main' }}
                >
                  Filter Purchase Data
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Product Name'
                  size='small'
                  fullWidth
                  value={purchaseHistoryFilter.productName}
                  onChange={e =>
                    handlePurchaseHistoryFilterChange(
                      'productName',
                      e.target.value
                    )
                  }
                  placeholder='Filter by product name'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='HSN Code'
                  size='small'
                  fullWidth
                  value={purchaseHistoryFilter.hsnCode}
                  onChange={e =>
                    handlePurchaseHistoryFilterChange('hsnCode', e.target.value)
                  }
                  placeholder='Filter by HSN code'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Vendor'
                  size='small'
                  fullWidth
                  value={purchaseHistoryFilter.vendor}
                  onChange={e =>
                    handlePurchaseHistoryFilterChange('vendor', e.target.value)
                  }
                  placeholder='Filter by vendor'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Invoice Number'
                  size='small'
                  fullWidth
                  value={purchaseHistoryFilter.invoiceNumber}
                  onChange={e =>
                    handlePurchaseHistoryFilterChange(
                      'invoiceNumber',
                      e.target.value
                    )
                  }
                  placeholder='Filter by invoice number'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Min Amount (₹)'
                  size='small'
                  fullWidth
                  type='number'
                  value={purchaseHistoryFilter.minAmount}
                  onChange={e =>
                    handlePurchaseHistoryFilterChange(
                      'minAmount',
                      e.target.value
                    )
                  }
                  placeholder='Min invoice value'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Max Amount (₹)'
                  size='small'
                  fullWidth
                  type='number'
                  value={purchaseHistoryFilter.maxAmount}
                  onChange={e =>
                    handlePurchaseHistoryFilterChange(
                      'maxAmount',
                      e.target.value
                    )
                  }
                  placeholder='Max invoice value'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={clearPurchaseHistoryFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  color='textSecondary'
                  sx={{ fontWeight: 500 }}
                >
                  Showing {filteredPurchases.length} of {purchases.length}{' '}
                  records
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TableContainer
            sx={{
              maxHeight: 'calc(100vh - 250px)',
              overflow: 'auto',
              overflowX: 'scroll', // Force horizontal scrollbar to always show
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
              // Enhanced scrollbar styling for better visibility
              '&::-webkit-scrollbar': {
                height: '12px',
                width: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(45deg, #8baf3f 30%, #7da237 90%)',
                borderRadius: '6px',
                border: '1px solid #6d8c30',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #7da237 30%, #6d8c30 90%)',
                  transform: 'scale(1.1)',
                },
              },
              '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1',
              },
              // For Firefox
              scrollbarWidth: 'thin',
              scrollbarColor: '#8baf3f #f1f1f1',
            }}
            onWheel={e => {
              // Enable horizontal scrolling with mouse wheel when shift is held
              if (e.shiftKey) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <Table
              stickyHeader
              aria-label='products purchase history table'
              sx={{ minWidth: 2200 }}
              size='small'
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Serial No</StyledTableCell>
                  <SortablePurchaseTableCell label='Date' property='date' />
                  <SortablePurchaseTableCell
                    label='Product Name'
                    property='product_name'
                  />
                  <SortablePurchaseTableCell
                    label='HSN Code'
                    property='hsn_code'
                  />
                  <SortablePurchaseTableCell label='UNITS' property='units' />
                  <SortablePurchaseTableCell
                    label='Vendor'
                    property='supplier'
                  />
                  <SortablePurchaseTableCell
                    label='Purchase Invoice No.'
                    property='purchase_invoice_number'
                  />
                  <SortablePurchaseTableCell
                    label='Purchase Qty.'
                    property='purchase_qty'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='MRP Incl. GST (Rs.)'
                    property='mrp_incl_gst'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='MRP Ex. GST (Rs.)'
                    property='purchase_id'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='Discount %'
                    property='discount_on_purchase_percentage'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='Purchase Cost/Unit (Ex.GST)'
                    property='purchase_cost_per_unit_ex_gst'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='GST %'
                    property='gst_percentage'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='Taxable Value (Transaction Rs.)'
                    property='purchase_taxable_value'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='IGST (Transaction Rs.)'
                    property='purchase_igst'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='CGST (Transaction Rs.)'
                    property='purchase_cgst'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='SGST (Transaction Rs.)'
                    property='purchase_sgst'
                    align='right'
                  />
                  <SortablePurchaseTableCell
                    label='Invoice Value (Transaction Rs.)'
                    property='purchase_invoice_value_rs'
                    align='right'
                  />
                  <StyledTableCell align='right'>
                    Current Stock After Purchase
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    Total Taxable Value (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    Total CGST (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    Total SGST (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    Total IGST (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    Total Amount (Incl. GST Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='center'>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingPurchases ? (
                  <TableRow>
                    <TableCell colSpan={23} align='center' sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingPurchases && sortedPurchases.length > 0
                  ? sortedPurchases
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((purchase, index) => {
                        // Use the stock_after_purchase directly from the purchase record
                        const stockAfterPurchaseDisplay =
                          typeof purchase.stock_after_purchase === 'number'
                            ? purchase.stock_after_purchase
                            : '-'; // Display '-' if null or undefined

                        // Calculations for new columns (can remain largely the same, but should use data directly from purchase if possible)
                        let totalValueMRP = 0;
                        let totalCGST = 0;
                        let totalSGST = 0;
                        let totalIGST = 0;
                        const gstRate = purchase.gst_percentage ?? 18;

                        // Calculate totals based on discounted cost per unit (Ex. GST)
                        if (
                          typeof purchase.stock_after_purchase === 'number' &&
                          purchase.stock_after_purchase > 0
                        ) {
                          // Calculate discounted purchase cost per unit
                          const mrpExGst = calculatePriceExcludingGST(
                            purchase.mrp_incl_gst ?? 0,
                            purchase.gst_percentage ?? 0
                          );
                          const discountPercentage =
                            purchase.discount_on_purchase_percentage ?? 0;
                          const discountedPurchaseCostPerUnit =
                            mrpExGst * (1 - discountPercentage / 100);

                          // Total taxable value = Current Stock × Discounted Purchase Cost Per Unit
                          totalValueMRP =
                            purchase.stock_after_purchase *
                            discountedPurchaseCostPerUnit;

                          // Calculate GST amounts based on the new total taxable value
                          if (
                            purchase.purchase_igst &&
                            purchase.purchase_igst > 0
                          ) {
                            totalIGST = totalValueMRP * (gstRate / 100);
                          } else {
                            totalCGST = totalValueMRP * (gstRate / 200);
                            totalSGST = totalValueMRP * (gstRate / 200);
                          }
                        }

                        return (
                          <TableRow
                            key={purchase.purchase_id || index}
                            hover
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              // Add highlight style for inventory updates
                              ...(purchase.transaction_type ===
                                'stock_increment' && {
                                backgroundColor: '#fff3e0', // Light orange color
                                '&:hover': {
                                  backgroundColor: '#ffe0b2', // Slightly darker orange on hover
                                },
                              }),
                            }}
                          >
                            <TableCell>
                              <div
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#8baf3f', // Direct color instead of theme reference
                                  color: 'white',
                                  display: 'inline-block',
                                  fontWeight: 'bold',
                                }}
                              >
                                {getPurchaseSerialNo(purchase, index)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDateTimeForDisplay(purchase.date)}
                            </TableCell>
                            <TableCell>
                              {purchase.product_name}
                              {purchase.transaction_type ===
                                'stock_increment' && (
                                <Chip
                                  label='Opening Balance'
                                  size='small'
                                  sx={{
                                    ml: 1,
                                    backgroundColor: '#ff6b00',
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    '& .MuiChip-label': {
                                      px: 1,
                                    },
                                  }}
                                />
                              )}
                              {purchase.transaction_type ===
                                'opening_balance' && (
                                <Chip
                                  label='Opening Balance'
                                  size='small'
                                  sx={{
                                    ml: 1,
                                    backgroundColor: '#ff6b00',
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: '24px',
                                    '& .MuiChip-label': {
                                      px: 1,
                                    },
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>{purchase.hsn_code || '-'}</TableCell>
                            <TableCell>{purchase.units || '-'}</TableCell>
                            <TableCell>
                              {purchase.transaction_type === 'opening_balance'
                                ? 'OPENING BALANCE'
                                : purchase.supplier || '-'}
                            </TableCell>
                            <TableCell>
                              {purchase.transaction_type === 'opening_balance'
                                ? 'OPENING BALANCE'
                                : purchase.purchase_invoice_number || '-'}
                            </TableCell>
                            <TableCell align='right'>
                              {purchase.purchase_qty ?? '-'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{purchase.mrp_incl_gst?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {calculatePriceExcludingGST(
                                purchase.mrp_incl_gst ?? 0,
                                purchase.gst_percentage ?? 0
                              ).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              {purchase.discount_on_purchase_percentage?.toFixed(
                                2
                              ) || '0.00'}
                              %
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {(() => {
                                const mrpExGst = calculatePriceExcludingGST(
                                  purchase.mrp_incl_gst ?? 0,
                                  purchase.gst_percentage ?? 0
                                );
                                const discountPercentage =
                                  purchase.discount_on_purchase_percentage ?? 0;
                                const priceAfterDiscount =
                                  mrpExGst * (1 - discountPercentage / 100);
                                return priceAfterDiscount.toFixed(2);
                              })() || '0.00'}
                            </TableCell>
                            <TableCell align='right'>
                              {purchase.gst_percentage?.toFixed(2) || '0.00'}%
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {purchase.purchase_taxable_value?.toFixed(2) ||
                                '0.00'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {(purchase.purchase_igst ?? 0) > 0
                                ? (purchase.purchase_igst ?? 0).toFixed(2)
                                : '-'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{purchase.purchase_cgst?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{purchase.purchase_sgst?.toFixed(2) || '0.00'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {purchase.purchase_invoice_value_rs?.toFixed(2) ||
                                '0.00'}
                            </TableCell>
                            <TableCell align='right'>
                              {/* Display the stock level AFTER this purchase */}
                              {stockAfterPurchaseDisplay}
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {totalValueMRP > 0
                                ? totalValueMRP.toFixed(2)
                                : '-'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{totalCGST > 0 ? totalCGST.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{totalSGST > 0 ? totalSGST.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{totalIGST > 0 ? totalIGST.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {totalValueMRP +
                                totalCGST +
                                totalSGST +
                                totalIGST >
                              0
                                ? (
                                    totalValueMRP +
                                    totalCGST +
                                    totalSGST +
                                    totalIGST
                                  ).toFixed(2)
                                : '-'}
                            </TableCell>
                            <TableCell align='center'>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 1,
                                  alignItems: 'center',
                                }}
                              >
                                <Tooltip title='Edit Purchase'>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleEdit(purchase)}
                                    sx={{
                                      color: '#8baf3f',
                                      '&:hover': {
                                        backgroundColor:
                                          'rgba(139, 175, 63, 0.1)',
                                        color: '#7a9e36',
                                      },
                                    }}
                                  >
                                    <EditIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>

                                {purchase.transaction_type ===
                                  'opening_balance' && (
                                  <Chip
                                    label='Opening'
                                    size='small'
                                    sx={{
                                      backgroundColor: '#17a2b8',
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: '20px',
                                    }}
                                  />
                                )}
                                <Tooltip title='Delete Purchase'>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => handleDelete(purchase)}
                                    sx={{ padding: '4px' }}
                                  >
                                    <DeleteIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  : null}
                {!isLoadingPurchases && sortedPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={23} align='center' sx={{ py: 3 }}>
                      No purchase history found{' '}
                      {dateFilter.isActive ? 'for the selected dates' : ''}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component='div'
            count={filteredPurchases.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Qty: `}
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  {totalPurchaseQty.toLocaleString()}
                </Box>
              </>
            )}
          />
        </Paper>
      )}

      {/* Sales History Tab */}
      {activeTab === 'salesHistory' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {/* Sales History Filters */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12}>
                <Typography
                  variant='body1'
                  fontWeight='600'
                  sx={{ fontSize: '0.95rem', color: 'primary.main' }}
                >
                  Filter Sales Data
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Product Name'
                  size='small'
                  fullWidth
                  value={salesHistoryFilter.productName}
                  onChange={e =>
                    handleSalesHistoryFilterChange(
                      'productName',
                      e.target.value
                    )
                  }
                  placeholder='Filter by product name'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='HSN Code'
                  size='small'
                  fullWidth
                  value={salesHistoryFilter.hsnCode}
                  onChange={e =>
                    handleSalesHistoryFilterChange('hsnCode', e.target.value)
                  }
                  placeholder='Filter by HSN code'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Product Type'
                  size='small'
                  fullWidth
                  value={salesHistoryFilter.productType}
                  onChange={e =>
                    handleSalesHistoryFilterChange(
                      'productType',
                      e.target.value
                    )
                  }
                  placeholder='Filter by product type'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Min Amount (₹)'
                  size='small'
                  fullWidth
                  type='number'
                  value={salesHistoryFilter.minAmount}
                  onChange={e =>
                    handleSalesHistoryFilterChange('minAmount', e.target.value)
                  }
                  placeholder='Min invoice value'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Max Amount (₹)'
                  size='small'
                  fullWidth
                  type='number'
                  value={salesHistoryFilter.maxAmount}
                  onChange={e =>
                    handleSalesHistoryFilterChange('maxAmount', e.target.value)
                  }
                  placeholder='Max invoice value'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={clearSalesHistoryFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  color='textSecondary'
                  sx={{ fontWeight: 500 }}
                >
                  Showing {filteredSalesHistory.length} of {salesHistory.length}{' '}
                  records
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TableContainer
            sx={{
              maxHeight: 'calc(100vh - 320px)',
              overflow: 'auto',
              overflowX: 'scroll', // Force horizontal scrollbar to always show
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
              // Enhanced scrollbar styling for better visibility
              '&::-webkit-scrollbar': {
                height: '12px',
                width: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(45deg, #8baf3f 30%, #7da237 90%)',
                borderRadius: '6px',
                border: '1px solid #6d8c30',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #7da237 30%, #6d8c30 90%)',
                  transform: 'scale(1.1)',
                },
              },
              '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1',
              },
              // For Firefox
              scrollbarWidth: 'thin',
              scrollbarColor: '#8baf3f #f1f1f1',
            }}
            onWheel={e => {
              // Enable horizontal scrolling with mouse wheel when shift is held
              if (e.shiftKey) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <Table
              stickyHeader
              aria-label='sales history table'
              sx={{ minWidth: 2200 }}
              size='small'
            >
              <TableHead>
                <TableRow>
                  <SortableTableCell label='S.No' property='serial_no' />
                  <SortableTableCell label='Date' property='date' />
                  <SortableTableCell
                    label='Product Name'
                    property='product_name'
                  />
                  <SortableTableCell label='HSN Code' property='hsn_code' />
                  <SortableTableCell
                    label='Product Type'
                    property='product_type'
                  />
                  <SortableTableCell
                    label='Qty.'
                    property='quantity'
                    align='right'
                  />
                  <SortableTableCell
                    label='Unit Price (Ex. GST)'
                    property='unit_price_ex_gst'
                    align='right'
                  />
                  <SortableTableCell
                    label='Unit Price (Incl. GST)'
                    property='unit_price_incl_gst'
                    align='right'
                  />
                  <SortableTableCell
                    label='Taxable Value'
                    property='taxable_value'
                    align='right'
                  />
                  <SortableTableCell
                    label='GST %'
                    property='gst_percentage'
                    align='right'
                  />
                  <SortableTableCell
                    label='Discount %'
                    property='discount_percentage'
                    align='right'
                  />
                  <SortableTableCell
                    label='Taxable After Discount'
                    property='taxable_after_discount'
                    align='right'
                  />
                  <SortableTableCell
                    label='CGST'
                    property='cgst_amount'
                    align='right'
                  />
                  <SortableTableCell
                    label='SGST'
                    property='sgst_amount'
                    align='right'
                  />
                  <SortableTableCell
                    label='IGST'
                    property='igst_amount'
                    align='right'
                  />
                  <SortableTableCell
                    label='Discount'
                    property='discount'
                    align='right'
                  />
                  <SortableTableCell label='Tax' property='tax' align='right' />
                  <SortableTableCell
                    label='Invoice Value'
                    property='invoice_value'
                    align='right'
                  />
                  <SortableTableCell
                    label='MRP (Incl. GST)'
                    property='mrp_incl_gst'
                    align='right'
                  />
                  <SortableTableCell
                    label='Discounted Rate'
                    property='discounted_sales_rate_ex_gst'
                    align='right'
                  />
                  <SortableTableCell
                    label='Stock'
                    property='stock'
                    align='right'
                  />
                  <SortableTableCell
                    label='Stock Taxable Value'
                    property='stock_taxable_value'
                    align='right'
                  />
                  <SortableTableCell
                    label='Stock CGST'
                    property='stock_cgst'
                    align='right'
                  />
                  <SortableTableCell
                    label='Stock SGST'
                    property='stock_sgst'
                    align='right'
                  />
                  <SortableTableCell
                    label='Stock Total Value'
                    property='stock_total_value'
                    align='right'
                  />
                  <SortableTableCell label='Order ID' property='order_id' />
                  <SortableTableCell
                    label='Invoice Number'
                    property='invoice_number'
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingSalesHistory ? (
                  <TableRow>
                    <TableCell colSpan={27} align='center' sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingSalesHistory && sortedSalesHistory.length > 0
                  ? sortedSalesHistory
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((sale, index) => {
                        // Calculate any missing values to ensure all data is populated
                        const unitPriceInclGst =
                          sale.unit_price_incl_gst ||
                          sale.unit_price_ex_gst *
                            (1 + sale.gst_percentage / 100);
                        const discountPercentage =
                          sale.discount_percentage || 0;
                        const taxableAfterDiscount =
                          sale.taxable_after_discount ||
                          sale.taxable_value * (1 - discountPercentage / 100);
                        const mrpInclGst =
                          sale.mrp_incl_gst || unitPriceInclGst;
                        const discountedRate =
                          sale.discounted_sales_rate_ex_gst ||
                          sale.unit_price_ex_gst;

                        // Calculate stock values if missing
                        const stockTaxableValue =
                          sale.stock_taxable_value ||
                          sale.stock * sale.unit_price_ex_gst;
                        const stockCgst =
                          sale.stock_cgst ||
                          stockTaxableValue * (sale.gst_percentage / 200);
                        const stockSgst =
                          sale.stock_sgst ||
                          stockTaxableValue * (sale.gst_percentage / 200);
                        const stockTotalValue =
                          sale.stock_total_value ||
                          stockTaxableValue + stockCgst + stockSgst;

                        return (
                          <TableRow key={sale.id || index} hover>
                            <TableCell>{sale.serial_no}</TableCell>
                            <TableCell>
                              {formatDateTimeForDisplay(sale.date)}
                            </TableCell>
                            <TableCell>{sale.product_name}</TableCell>
                            <TableCell>{sale.hsn_code || '-'}</TableCell>
                            <TableCell>{sale.product_type}</TableCell>
                            <TableCell align='right'>
                              {Number(sale.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.unit_price_ex_gst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(unitPriceInclGst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.taxable_value).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              {Number(sale.gst_percentage).toFixed(2)}%
                            </TableCell>
                            <TableCell align='right'>
                              {Number(discountPercentage).toFixed(2)}%
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(taxableAfterDiscount).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.cgst_amount).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.sgst_amount).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.igst_amount).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.discount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.tax || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(sale.invoice_value).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(mrpInclGst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(discountedRate).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              {Number(sale.stock).toLocaleString()}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(stockTaxableValue).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(stockCgst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(stockSgst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(stockTotalValue).toFixed(2)}
                            </TableCell>
                            <TableCell>{sale.order_id}</TableCell>
                            <TableCell>
                              {sale.invoice_number || sale.invoice_no || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  : null}
                {!isLoadingSalesHistory && sortedSalesHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={26} align='center' sx={{ py: 3 }}>
                      No sales history found{' '}
                      {dateFilter.isActive ? 'for the selected dates' : ''}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align='right'
                    sx={{ fontWeight: 'bold' }}
                  >
                    Totals:
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {salesHistoryTotals.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell align='right'></TableCell>
                  <TableCell align='right'></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salesHistoryTotals.taxableValue.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salesHistoryTotals.cgstAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salesHistoryTotals.sgstAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salesHistoryTotals.igstAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align='right'></TableCell>
                  <TableCell align='right'></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salesHistoryTotals.invoiceValue.toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component='div'
            count={filteredSalesHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Sales: `}
                <Box component='span' sx={{ fontWeight: 'bold', ml: 1 }}>
                  ₹
                  {salesHistoryTotals.invoiceValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Box>
              </>
            )}
          />
        </Paper>
      )}

      {/* Salon Consumption Tab */}
      {activeTab === 'salonConsumption' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {salonConsumptionError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {salonConsumptionError}
            </Alert>
          )}

          {/* Salon Consumption Filters */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12}>
                <Typography
                  variant='body1'
                  fontWeight='600'
                  sx={{ fontSize: '0.95rem', color: 'primary.main' }}
                >
                  Filter Salon Consumption Data
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label='Product Name'
                  size='small'
                  fullWidth
                  value={salonConsumptionFilter.productName}
                  onChange={e =>
                    handleSalonConsumptionFilterChange(
                      'productName',
                      e.target.value
                    )
                  }
                  placeholder='Filter by product name'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label='Voucher Number'
                  size='small'
                  fullWidth
                  value={salonConsumptionFilter.voucherNo}
                  onChange={e =>
                    handleSalonConsumptionFilterChange(
                      'voucherNo',
                      e.target.value
                    )
                  }
                  placeholder='Filter by voucher number'
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Min Amount (₹)'
                  size='small'
                  fullWidth
                  type='number'
                  value={salonConsumptionFilter.minAmount}
                  onChange={e =>
                    handleSalonConsumptionFilterChange(
                      'minAmount',
                      e.target.value
                    )
                  }
                  placeholder='Min amount'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label='Max Amount (₹)'
                  size='small'
                  fullWidth
                  type='number'
                  value={salonConsumptionFilter.maxAmount}
                  onChange={e =>
                    handleSalonConsumptionFilterChange(
                      'maxAmount',
                      e.target.value
                    )
                  }
                  placeholder='Max amount'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={clearSalonConsumptionFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  color='textSecondary'
                  sx={{ fontWeight: 500 }}
                >
                  Showing {filteredSalonConsumption.length} of{' '}
                  {salonConsumption.length} records
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TableContainer
            sx={{
              maxHeight: 'calc(100vh - 320px)',
              overflow: 'auto',
              overflowX: 'scroll', // Force horizontal scrollbar to always show
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing',
              },
              // Enhanced scrollbar styling for better visibility
              '&::-webkit-scrollbar': {
                height: '12px',
                width: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(45deg, #8baf3f 30%, #7da237 90%)',
                borderRadius: '6px',
                border: '1px solid #6d8c30',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #7da237 30%, #6d8c30 90%)',
                  transform: 'scale(1.1)',
                },
              },
              '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1',
              },
              // For Firefox
              scrollbarWidth: 'thin',
              scrollbarColor: '#8baf3f #f1f1f1',
            }}
            onWheel={e => {
              // Enable horizontal scrolling with mouse wheel when shift is held
              if (e.shiftKey) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <Table
              stickyHeader
              aria-label='salon consumption table'
              sx={{ minWidth: 2200 }}
              size='small'
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell>Serial No</StyledTableCell>
                  <SortableSalonTableCell label='S.No' property='id' />
                  <SortableSalonTableCell label='Date' property='date' />
                  <SortableSalonTableCell
                    label='Voucher No'
                    property='requisition_voucher_no'
                  />
                  <SortableSalonTableCell
                    label='Order ID'
                    property='order_id'
                  />
                  <SortableSalonTableCell
                    label='Invoice Number'
                    property='invoice_number'
                  />
                  <SortableSalonTableCell
                    label='Product Name'
                    property='product_name'
                  />
                  <SortableSalonTableCell
                    label='HSN Code'
                    property='hsn_code'
                  />
                  <SortableSalonTableCell
                    label='Product Type'
                    property='product_type'
                  />
                  <SortableSalonTableCell
                    label='Quantity'
                    property='consumption_qty'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='Unit Price (Ex. GST)'
                    property='purchase_cost_per_unit_ex_gst'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='GST %'
                    property='purchase_gst_percentage'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='Taxable Value'
                    property='purchase_taxable_value'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='IGST'
                    property='purchase_igst'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='CGST'
                    property='purchase_cgst'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='SGST'
                    property='purchase_sgst'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='Total Cost'
                    property='total_purchase_cost'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='Discounted Rate'
                    property='discounted_sales_rate'
                    align='right'
                  />
                  <SortableSalonTableCell
                    label='Current Stock'
                    property='current_stock'
                    align='right'
                  />
                  <StyledTableCell align='right'>
                    Taxable Value (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    IGST (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    CGST (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    SGST (Current Stock Rs.)
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    Total Value (Current Stock Rs.)
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingSalonConsumption ? (
                  <TableRow>
                    <TableCell colSpan={25} align='center' sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingSalonConsumption && sortedSalonConsumption.length > 0
                  ? sortedSalonConsumption
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((item, index) => {
                        // Calculate current stock values
                        const taxableValueCurrentStock =
                          Number(item.current_stock) *
                          Number(item.purchase_cost_per_unit_ex_gst || 0);
                        const cgstCurrentStock =
                          taxableValueCurrentStock *
                          (Number(item.purchase_gst_percentage || 0) / 200);
                        const sgstCurrentStock =
                          taxableValueCurrentStock *
                          (Number(item.purchase_gst_percentage || 0) / 200);
                        const igstCurrentStock =
                          item.purchase_igst > 0
                            ? taxableValueCurrentStock *
                              (Number(item.purchase_gst_percentage || 0) / 100)
                            : 0;
                        const totalValueCurrentStock =
                          taxableValueCurrentStock +
                          cgstCurrentStock +
                          sgstCurrentStock +
                          igstCurrentStock;

                        return (
                          <TableRow key={item.id || index} hover>
                            <TableCell>
                              <div
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#8baf3f', // Direct color instead of theme reference
                                  color: 'white',
                                  display: 'inline-block',
                                  fontWeight: 'bold',
                                }}
                              >
                                {(item as any).serial_no ||
                                  `SALON-${sortedSalonConsumption.length - (page * rowsPerPage + index)}`}
                              </div>
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              {formatDateTimeForDisplay(item.date)}
                            </TableCell>
                            <TableCell>{item.requisition_voucher_no}</TableCell>
                            <TableCell>{item.order_id}</TableCell>
                            <TableCell>
                              {item.invoice_number || item.invoice_no || '-'}
                            </TableCell>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.hsn_code || '-'}</TableCell>
                            <TableCell>{item.product_type || '-'}</TableCell>
                            <TableCell align='right'>
                              {Number(item.consumption_qty).toLocaleString()}
                            </TableCell>
                            <TableCell align='right'>
                              ₹
                              {Number(
                                item.purchase_cost_per_unit_ex_gst
                              ).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              {Number(item.purchase_gst_percentage).toFixed(2)}%
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(item.purchase_taxable_value).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(item.purchase_igst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(item.purchase_cgst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(item.purchase_sgst).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(item.total_purchase_cost).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{Number(item.discounted_sales_rate).toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              {Number(item.current_stock).toLocaleString()}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{taxableValueCurrentStock.toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{igstCurrentStock.toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{cgstCurrentStock.toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{sgstCurrentStock.toFixed(2)}
                            </TableCell>
                            <TableCell align='right'>
                              ₹{totalValueCurrentStock.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  : null}
                {!isLoadingSalonConsumption &&
                sortedSalonConsumption.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={24} align='center' sx={{ py: 3 }}>
                      No salon consumption data found{' '}
                      {dateFilter.isActive ? 'for the selected dates' : ''}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align='right'
                    sx={{ fontWeight: 'bold' }}
                  >
                    Totals:
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {salonConsumptionTotals.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell align='right'></TableCell>
                  <TableCell align='right'></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.taxableValue.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.igstAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.cgstAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.sgstAmount.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.totalValue.toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹
                    {salonConsumptionTotals.taxableValueCurrentStock.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.igstCurrentStock.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.cgstCurrentStock.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.sgstCurrentStock.toFixed(2)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    ₹{salonConsumptionTotals.totalValueCurrentStock.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component='div'
            count={filteredSalonConsumption.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Consumption: `}
                <Box component='span' sx={{ fontWeight: 'bold', ml: 1 }}>
                  ₹
                  {salonConsumptionTotals.totalValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Box>
              </>
            )}
          />
        </Paper>
      )}

      {/* Balance Stock Tab */}
      {/* <div role="tabpanel" hidden={activeTab !== 'balanceStock'}>
        {isLoadingBalanceStock ? (
          <CircularProgress />
        ) : balanceStockError ? (
          <Alert severity="error">{balanceStockError}</Alert>
        ) : (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" gutterBottom>Balance Stock</Typography>
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />} 
                onClick={() => {
                  console.log("Force refreshing balance stock data");
                  fetchBalanceStock();
                }}
              >
                Refresh Balance Stock Data
              </Button>
            </Box>

            {/* Balance Stock Summary Cards * /}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{formatNumber(balanceStockTotals.additions)}</Typography>
                  <Typography variant="body2">Total Additions</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{formatNumber(balanceStockTotals.reductions)}</Typography>
                  <Typography variant="body2">Total Reductions</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{formatNumber(balanceStockTotals.additions - balanceStockTotals.reductions)}</Typography>
                  <Typography variant="body2">Net Change</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />

            {/* Existing Balance Stock Filters * /}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Filter Balance Stock Data</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Product Name"
                    value={balanceStockFilter.productName}
                    onChange={(e) => handleBalanceStockFilterChange('productName', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Change Type</InputLabel>
                    <Select
                      value={balanceStockFilter.changeType}
                      onChange={(e) => handleBalanceStockFilterChange('changeType', e.target.value)}
                      label="Change Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="addition">Addition</MenuItem>
                      <MenuItem value="reduction">Reduction</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Source"
                    value={balanceStockFilter.source}
                    onChange={(e) => handleBalanceStockFilterChange('source', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    label="HSN Code"
                    value={balanceStockFilter.hsn}
                    onChange={(e) => handleBalanceStockFilterChange('hsn', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={3} sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<FilterIcon />}
                    variant="outlined"
                    onClick={() => {
                      // Trigger re-render to apply filters from state
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    startIcon={<FilterOffIcon />}
                    variant="outlined"
                    onClick={clearBalanceStockFilters}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <TableContainer>
              <Table stickyHeader aria-label="balance stock table" sx={{ minWidth: 1200 }} size="small">
                <TableHead>
                  <TableRow>
                    <SortableBalanceStockTableCell label="Serial No" property="serial_no" />
                    <SortableBalanceStockTableCell label="Date" property="date" />
                    <SortableBalanceStockTableCell label="Product Name" property="product_name" />
                    <SortableBalanceStockTableCell label="HSN Code" property="hsn_code" />
                    <SortableBalanceStockTableCell label="Units" property="units" />
                    <SortableBalanceStockTableCell label="Change Type" property="change_type" />
                    <SortableBalanceStockTableCell label="Source" property="source" />
                    <SortableBalanceStockTableCell label="Reference ID" property="reference_id" />
                    <SortableBalanceStockTableCell label="Quantity Change" property="quantity_change" align="right" />
                    <SortableBalanceStockTableCell label="Quantity After" property="quantity_after_change" align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedBalanceStock
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.serial_no || getBalanceStockSerialNo(item, index)}</TableCell>
                        <TableCell>{formatDateTimeForDisplay(item.date)}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.hsn_code}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.change_type} 
                            color={item.change_type === 'addition' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell>{item.reference_id}</TableCell>
                        <TableCell align="right">{item.quantity_change}</TableCell>
                        <TableCell align="right">{item.quantity_after_change}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={8} align="right"><strong>Totals:</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="body2"><strong>Additions:</strong> {formatNumber(balanceStockTotals.additions)}</Typography>
                      <Typography variant="body2"><strong>Reductions:</strong> {formatNumber(balanceStockTotals.reductions)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2"><strong>Net:</strong> {formatNumber(balanceStockTotals.additions - balanceStockTotals.reductions)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            {sortedBalanceStock.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography>No balance stock data found {dateFilter.isActive ? 'for the selected dates' : ''}.</Typography>
              </Box>
            )}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100, 200]}
              component="div"
              count={sortedBalanceStock.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {/* Add a TableFooter for balance stock to show totals * /}
          </Paper>
        )}
      </div> */}

      {/* Dialog for adding/editing purchases */}
      <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            variant='h6'
            component='div'
            sx={{ fontWeight: 600, fontSize: '1.1rem' }}
          >
            {editingId
              ? 'Edit Purchase Details'
              : dialogMode === 'inventory'
                ? 'Add Opening Balance'
                : 'Add New Product Purchase'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'inventory' && !editingId && (
            <Alert severity='info' sx={{ mb: 2 }}>
              <Typography variant='body2'>
                <strong>Opening Balance Mode:</strong> You are adding inventory
                as opening balance. This will increase stock levels and will be
                marked as "OPENING BALANCE" in reports.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Always show the date field at the top */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='Date *'
                type='date'
                value={purchaseFormData.date?.split('T')[0] || ''}
                onChange={e => handleInputChange('date', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={8}>
              <Autocomplete
                options={productMasterList}
                getOptionLabel={option => option?.name || ''}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Select Product from Product Master *'
                    fullWidth
                    required
                    error={!purchaseFormData.product_name}
                    helperText={
                      !purchaseFormData.product_name
                        ? 'Product selection is required'
                        : ''
                    }
                  />
                )}
                onChange={(event, newValue) => handleProductSelect(newValue)}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                value={
                  productMasterList.find(
                    p => p.name === purchaseFormData.product_name
                  ) || null
                }
              />
            </Grid>

            {/* Product Summary Section */}
            {addedProductsSummary.length > 0 && !editingId && (
              <Grid item xs={12}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{ color: '#495057', fontWeight: 600 }}
                    >
                      Products Added in This Session
                    </Typography>
                    <Chip
                      label={`${currentSessionTotal.totalProducts} Products`}
                      color='primary'
                      variant='outlined'
                      size='small'
                    />
                  </Box>

                  {editingSummaryIndex !== null && (
                    <Alert severity='info' sx={{ mb: 2 }}>
                      <Typography variant='body2'>
                        You are currently editing product #
                        {editingSummaryIndex + 1} from the session. Make your
                        changes below and click "Save Changes" or "Cancel Edit".
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2 }}>
                    {addedProductsSummary.map((product, index) => (
                      <Paper
                        key={index}
                        elevation={editingSummaryIndex === index ? 3 : 1}
                        sx={{
                          p: 2,
                          mb: 1,
                          backgroundColor:
                            editingSummaryIndex === index ? '#fff3cd' : 'white',
                          border:
                            editingSummaryIndex === index
                              ? '2px solid #ffc107'
                              : '1px solid #e0e0e0',
                        }}
                      >
                        <Grid container spacing={2} alignItems='center'>
                          <Grid item xs={3}>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 600 }}
                            >
                              {product.product_name}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              HSN: {product.hsn_code}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant='body2'>
                              Qty: {product.purchase_qty} {product.unit_type}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant='body2'>
                              ₹
                              {typeof product.mrp_incl_gst === 'number'
                                ? product.mrp_incl_gst.toFixed(2)
                                : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 600 }}
                            >
                              ₹
                              {typeof product.purchase_invoice_value ===
                              'number'
                                ? product.purchase_invoice_value.toFixed(2)
                                : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 0.5,
                                justifyContent: 'flex-end',
                              }}
                            >
                              {editingSummaryIndex === index ? (
                                <Chip
                                  label='Editing...'
                                  color='warning'
                                  size='small'
                                  sx={{ fontWeight: 'bold' }}
                                />
                              ) : (
                                <>
                                  <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={() => editSummaryItem(index)}
                                    sx={{ padding: '4px' }}
                                    title='Edit this product'
                                    disabled={editingSummaryIndex !== null}
                                  >
                                    <EditIcon fontSize='small' />
                                  </IconButton>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => removeFromSummary(index)}
                                    sx={{ padding: '4px' }}
                                    title='Remove this product'
                                    disabled={editingSummaryIndex !== null}
                                  >
                                    <DeleteIcon fontSize='small' />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Session Summary:
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant='body2'>
                        Total Qty: {currentSessionTotal.totalQuantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant='body2'>
                        Products: {currentSessionTotal.totalProducts}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Total: ₹{currentSessionTotal.totalValue.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {dialogMode === 'purchase' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='Vendor Name *'
                    value={purchaseFormData.vendor}
                    onChange={e => handleInputChange('vendor', e.target.value)}
                    fullWidth
                    required
                    placeholder='Enter supplier name'
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='Purchase Invoice No. *'
                    value={purchaseFormData.purchase_invoice_number}
                    onChange={e =>
                      handleInputChange(
                        'purchase_invoice_number',
                        e.target.value
                      )
                    }
                    fullWidth
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name='product_name'
                label='Product Name'
                value={purchaseFormData.product_name}
                onChange={e =>
                  handleInputChange('product_name', e.target.value)
                }
                fullWidth
                helperText='Enter product name or select from Product Master'
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontStyle: 'italic' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name='hsn_code'
                label='HSN Code'
                value={purchaseFormData.hsn_code}
                onChange={e => handleInputChange('hsn_code', e.target.value)}
                fullWidth
                helperText='Enter HSN code or select from Product Master'
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontStyle: 'italic' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name='unit_type'
                label='Units'
                value={purchaseFormData.unit_type}
                onChange={e => handleInputChange('unit_type', e.target.value)}
                fullWidth
                helperText='Enter unit type or select from Product Master'
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontStyle: 'italic' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name='gst_percentage'
                label='GST %'
                value={purchaseFormData.gst_percentage}
                onChange={e =>
                  handleInputChange(
                    'gst_percentage',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                type='number'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>%</InputAdornment>
                  ),
                  inputProps: { min: 0, max: 100, step: 0.01 },
                }}
                helperText='Enter GST percentage'
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontStyle: 'italic' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name='mrp_incl_gst'
                label='MRP (Incl. GST)'
                type='number'
                value={purchaseFormData.mrp_incl_gst}
                onChange={e =>
                  handleInputChange(
                    'mrp_incl_gst',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter MRP including GST'
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontStyle: 'italic' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name='mrp_excl_gst'
                label='MRP (Excl. GST)'
                type='number'
                value={purchaseFormData.mrp_excl_gst}
                onChange={e =>
                  handleInputChange(
                    'mrp_excl_gst',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter MRP excluding GST'
                FormHelperTextProps={{
                  sx: { color: 'text.secondary', fontStyle: 'italic' },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label={
                  dialogMode === 'inventory'
                    ? 'Opening Balance Qty. *'
                    : 'Purchase Qty. *'
                }
                type='number'
                value={purchaseFormData.purchase_qty}
                onChange={e =>
                  handleInputChange(
                    'purchase_qty',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>#</InputAdornment>
                  ),
                  inputProps: { min: 1, step: 1 },
                }}
                helperText={
                  dialogMode === 'inventory'
                    ? 'Quantity to add to inventory'
                    : 'Quantity purchased'
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={purchaseFormData.is_interstate || false}
                    onChange={e =>
                      handleInputChange('is_interstate', e.target.checked)
                    }
                    color='primary'
                  />
                }
                label='Inter-State Purchase (IGST)'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='Discount on Purchase Percentage *'
                type='number'
                value={purchaseFormData.discount_on_purchase_percentage || 0}
                onChange={e =>
                  handleInputChange(
                    'discount_on_purchase_percentage',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>%</InputAdornment>
                  ),
                  inputProps: { min: 0, max: 100, step: 0.01 },
                }}
                helperText='Enter discount percentage'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='Purchase Cost per Unit (Ex. GST)'
                type='number'
                value={purchaseFormData.purchase_excl_gst || 0}
                onChange={e =>
                  handleInputChange(
                    'purchase_excl_gst',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter purchase cost excluding GST'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='Purchase Taxable Value (Rs.)'
                type='number'
                value={purchaseFormData.purchase_cost_taxable_value || 0}
                onChange={e =>
                  handleInputChange(
                    'purchase_cost_taxable_value',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter purchase taxable value'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='IGST Amount (Rs.)'
                type='number'
                value={purchaseFormData.purchase_igst || 0}
                onChange={e =>
                  handleInputChange(
                    'purchase_igst',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter IGST amount'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='CGST Amount (Rs.)'
                type='number'
                value={purchaseFormData.purchase_cgst || 0}
                onChange={e =>
                  handleInputChange(
                    'purchase_cgst',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter CGST amount'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='SGST Amount (Rs.)'
                type='number'
                value={purchaseFormData.purchase_sgst || 0}
                onChange={e =>
                  handleInputChange(
                    'purchase_sgst',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter SGST amount'
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label='Total Invoice Value (Rs.)'
                type='number'
                value={purchaseFormData.purchase_invoice_value || 0}
                onChange={e =>
                  handleInputChange(
                    'purchase_invoice_value',
                    parseFloat(e.target.value) || 0
                  )
                }
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>₹</InputAdornment>
                  ),
                }}
                helperText='Enter total invoice value'
              />
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #c7e1fd',
                  borderRadius: 1,
                }}
              >
                <Typography variant='subtitle2' gutterBottom>
                  GST Breakdown (based on entered values)
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant='body2'>
                      Purchase Cost/Unit (Ex.GST):
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign='right'>
                    <Typography variant='body2'>
                      ₹{purchaseFormData.purchase_excl_gst.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body2'>GST Rate:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign='right'>
                    <Typography variant='body2'>
                      {purchaseFormData.gst_percentage.toFixed(2)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body2'>
                      {purchaseFormData.is_interstate
                        ? 'IGST Amount/Unit:'
                        : 'CGST Amount/Unit:'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign='right'>
                    <Typography variant='body2'>
                      {purchaseFormData.purchase_qty > 0
                        ? `₹${((purchaseFormData.is_interstate ? purchaseFormData.purchase_igst : purchaseFormData.purchase_cgst) / purchaseFormData.purchase_qty).toFixed(2)}`
                        : '0.00'}
                    </Typography>
                  </Grid>
                  {!purchaseFormData.is_interstate && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant='body2'>
                          SGST Amount/Unit:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} textAlign='right'>
                        <Typography variant='body2'>
                          {purchaseFormData.purchase_qty > 0
                            ? `₹${(purchaseFormData.purchase_sgst / purchaseFormData.purchase_qty).toFixed(2)}`
                            : '0.00'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle2'>
                      Purchase Price/Unit (Incl. GST):
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign='right'>
                    <Typography variant='subtitle2'>
                      ₹
                      {(
                        purchaseFormData.purchase_excl_gst *
                        (1 + purchaseFormData.gst_percentage / 100)
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box>
            <Button onClick={handleClose} color='secondary'>
              Cancel
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Special button just for date editing */}
            {editingId && (
              <>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmit}
                  disabled={isSubmitting || !purchaseFormData.date}
                >
                  Update Purchase
                </Button>
                {/* Alternative direct update button */}
                <Button
                  variant='outlined'
                  color='warning'
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      console.log('Direct update for:', editingId);

                      if (!purchaseFormData.date) {
                        toast.error('Please select a valid date');
                        return;
                      }

                      // Format date with time component to match database format
                      const dateObj = new Date(purchaseFormData.date);
                      // Keep the original time component if possible
                      const formattedDate = `${dateObj.toISOString().split('T')[0]} 00:00:00.000`;
                      console.log(
                        'Formatted date for direct update:',
                        formattedDate
                      );

                      // Try updating both tables to ensure consistency
                      console.log('Updating inventory_purchases table...');
                      const { error: error1 } = await supabase
                        .from('inventory_purchases')
                        .update({
                          date: formattedDate,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('purchase_id', editingId);

                      if (error1) {
                        console.error(
                          'Error updating inventory_purchases:',
                          error1
                        );
                      } else {
                        console.log('inventory_purchases update successful');
                      }

                      // Also try updating the purchase_history_with_stock table directly
                      console.log(
                        'Updating purchase_history_with_stock table...'
                      );
                      const { error: error2 } = await supabase
                        .from('purchase_history_with_stock')
                        .update({
                          date: formattedDate,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('purchase_id', editingId);

                      if (error2) {
                        console.error(
                          'Error updating purchase_history_with_stock:',
                          error2
                        );
                        // If both updates failed, show error
                        if (error1) {
                          toast.error(`Update failed: ${error1.message}`);
                        } else {
                          // At least one update succeeded
                          toast.success('Partial update successful!');
                          handleClose();
                          fetchPurchasesData();
                        }
                      } else {
                        console.log(
                          'purchase_history_with_stock update successful'
                        );
                        toast.success('Date updated successfully!');
                        handleClose();
                        fetchPurchasesData();
                      }
                    } catch (err) {
                      console.error('Direct update error:', err);
                      toast.error('Update failed');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Direct Date Update
                </Button>
              </>
            )}

            {/* Regular buttons for normal operations */}
            {!editingId && (
              <>
                {editingSummaryIndex !== null && (
                  <>
                    <Button
                      variant='outlined'
                      color='secondary'
                      onClick={cancelSummaryItemEdit}
                    >
                      Cancel Edit
                    </Button>
                    <Button
                      variant='contained'
                      color='warning'
                      onClick={handleSubmit}
                      disabled={
                        !purchaseFormData.product_name ||
                        (dialogMode === 'purchase' &&
                          !purchaseFormData.vendor) ||
                        !purchaseFormData.purchase_invoice_number
                      }
                    >
                      Save Changes
                    </Button>
                  </>
                )}
                {editingSummaryIndex === null && (
                  <>
                    {addedProductsSummary.length > 0 && (
                      <Button
                        variant='outlined'
                        color='success'
                        onClick={handleClose}
                        startIcon={<CheckIcon />}
                      >
                        Finish & Close ({addedProductsSummary.length} products
                        added)
                      </Button>
                    )}
                    <Button
                      variant='contained'
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting ||
                        (!editingId &&
                          (!purchaseFormData.product_name ||
                            (dialogMode === 'purchase' &&
                              (!purchaseFormData.vendor ||
                                !purchaseFormData.purchase_invoice_number))))
                      }
                    >
                      {editingId
                        ? 'Update Purchase'
                        : addedProductsSummary.length > 0
                          ? dialogMode === 'inventory'
                            ? 'Add Another Opening Balance'
                            : 'Add Another Product'
                          : dialogMode === 'inventory'
                            ? 'Add Opening Balance'
                            : 'Save Purchase'}
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
