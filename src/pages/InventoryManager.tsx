import React, { useState, useEffect, ChangeEvent, useCallback, useMemo } from 'react';
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
  Chip
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
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProducts, Product } from '../hooks/useProducts';
import { usePurchaseHistory, PurchaseTransaction } from '../hooks/usePurchaseHistory';
import { addPurchaseTransaction } from '../utils/inventoryUtils';
import { initialFormData, ProductFormData } from '../data/formData';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import { calculatePriceExcludingGST, calculateGSTAmount } from '../utils/gstCalculations';
import { SelectChangeEvent } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
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
  gst_percentage: number;
  taxable_value: number;
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
  current_stock: number;
}

// Define interface for salon consumption items
interface SalonConsumptionItem {
  id?: string;
  requisition_voucher_no: string;
  order_id: string;
  date: string;
  product_name: string;
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
}

// Update the extendedInitialFormData with all required fields
const extendedInitialFormData: ExtendedProductFormData = {
  ...initialFormData,
  product_id: '',
  purchase_id: '',
  date: new Date().toISOString().split('T')[0],
  product_name: '',
  hsn_code: '',
  units: '',
  purchase_invoice_number: '',
  purchase_qty: 1,
  mrp_incl_gst: 0,
  mrp_excl_gst: 0,
  discount_on_purchase_percentage: 0,
  purchase_excl_gst: 0,
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
  unit_type: ''
};

export default function InventoryManager() {
  const { products: productMasterList, isLoading: isLoadingProducts, error: errorProducts, fetchProducts } = useProducts();
  const {
    purchases,
    isLoading: isLoadingPurchases,
    error: errorPurchases,
    fetchPurchases: fetchPurchasesFromHook,
    deletePurchaseTransaction
  } = usePurchaseHistory();

  const [open, setOpen] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState<ExtendedProductFormData>(extendedInitialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'purchaseHistory' | 'salesHistory' | 'salonConsumption' | 'balanceStock'>('purchaseHistory');

  // Add state for product types for the dialog's unit dropdown
  const [productTypesForDialog, setProductTypesForDialog] = useState<string[]>([]);
  const [isLoadingProductTypesDialog, setIsLoadingProductTypesDialog] = useState<boolean>(false);

  // State for sales history
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
  const [isLoadingSalesHistory, setIsLoadingSalesHistory] = useState<boolean>(false);
  const [salesHistoryError, setSalesHistoryError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: keyof SalesHistoryItem | null, direction: 'asc' | 'desc'}>({
    key: null,
    direction: 'asc'
  });
  
  // State for salon consumption
  const [salonConsumption, setSalonConsumption] = useState<SalonConsumptionItem[]>([]);
  const [isLoadingSalonConsumption, setIsLoadingSalonConsumption] = useState<boolean>(false);
  const [salonConsumptionError, setSalonConsumptionError] = useState<string | null>(null);
  const [salonSortConfig, setSalonSortConfig] = useState<{key: keyof SalonConsumptionItem | null, direction: 'asc' | 'desc'}>({
    key: null,
    direction: 'asc'
  });

  // State for balance stock
  const [balanceStock, setBalanceStock] = useState<BalanceStockItem[]>([]);
  const [isLoadingBalanceStock, setIsLoadingBalanceStock] = useState<boolean>(false);
  const [balanceStockError, setBalanceStockError] = useState<string | null>(null);
  const [balanceStockSortConfig, setBalanceStockSortConfig] = useState<{key: keyof BalanceStockItem | null, direction: 'asc' | 'desc'}>({
    key: null,
    direction: 'asc'
  });

  // Sales history filter state
  const [salesHistoryFilter, setSalesHistoryFilter] = useState({
    productName: '',
    hsnCode: '',
    productType: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Salon consumption filter state
  const [salonConsumptionFilter, setSalonConsumptionFilter] = useState({
    productName: '',
    voucherNo: '',
    minAmount: '',
    maxAmount: ''
  });

  // Balance stock filter state
  const [balanceStockFilter, setBalanceStockFilter] = useState({
    productName: '',
    changeType: '',
    source: '',
    hsn: ''
  });

  // State for export functionality
  const [isExporting, setIsExporting] = useState(false);
  
  // Date filter state - simplified for purchase history only
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
    isActive: false
  });

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
    fetchPurchasesFromHook();
  }, [fetchPurchasesFromHook]);

  // Function to fetch sales history data
  const fetchSalesHistory = useCallback(async () => {
    setIsLoadingSalesHistory(true);
    setSalesHistoryError(null);
    
    try {
      const { data, error } = await supabase
        .from('sales_history_final')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setSalesHistory(data);
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

  // Function to fetch salon consumption data
  const fetchSalonConsumption = useCallback(async () => {
    setIsLoadingSalonConsumption(true);
    setSalonConsumptionError(null);
    
    try {
      console.log('Fetching salon consumption data...');
      const { data, error } = await supabase
        .from('salon_consumption_new')
        .select('*')
        .order('Date', { ascending: false });

      console.log('Salon consumption query result:', { data, error });

      if (error) {
        throw error;
      }
      
      if (data) {
        // Normalize the column names to match our interface
        console.log('Raw data from salon_consumption_new:', data);
        const normalizedData = data.map(item => ({
           id: item.id,
          requisition_voucher_no: item['Requisition Voucher No.'],
          order_id: item.order_id,
          date: item.Date, // Changed from Date to match interface
          product_name: item['Product Name'],
          consumption_qty: Number(item['Consumption Qty.']),
          hsn_code: item.HSN_Code,
          purchase_cost_per_unit_ex_gst: Number(item.Purchase_Cost_per_Unit_Ex_GST_Rs),
          purchase_gst_percentage: Number(item.Purchase_GST_Percentage),
          purchase_taxable_value: Number(item.Purchase_Taxable_Value_Rs),
          purchase_igst: Number(item.Purchase_IGST_Rs),
          purchase_cgst: Number(item.Purchase_CGST_Rs),
          purchase_sgst: Number(item.Purchase_SGST_Rs),
          total_purchase_cost: Number(item.Total_Purchase_Cost_Rs),
          discounted_sales_rate: Number(item.Discounted_Sales_Rate_Rs),
          current_stock: Number(item.Current_Stock),
          created_at: item.created_at
        }));
        console.log('Normalized salon consumption data:', normalizedData);
        setSalonConsumption(normalizedData);
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
        const normalizedData = data.map(item => ({
          id: item.id,
          date: item.Date,
          product_name: item['Product Name'],
          hsn_code: item['HSN Code'],
          units: item.Units,
          change_type: item['Change Type'] as 'reduction' | 'addition',
          source: item.Source,
          reference_id: item['Reference ID'],
          quantity_change: Number(item['Quantity Change']),
          quantity_after_change: Number(item['Quantity After Change'])
        }));
        console.log('Normalized balance stock data:', normalizedData);
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

  useEffect(() => {
    initializeDatabaseTables();
    fetchPurchasesData();
    fetchSalesHistory();
    fetchSalonConsumption();
    fetchBalanceStock();

    const fetchDialogProductTypes = async () => {
      setIsLoadingProductTypesDialog(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_type');
        if (error) {
          console.error('Error context: fetching product types for dialog', error);
          throw handleSupabaseError(error);
        }
        if (data) {
          const distinctTypes = Array.from(new Set(data.map(item => item.product_type).filter(pt => pt && pt.trim() !== '')))
            .sort();
          setProductTypesForDialog(distinctTypes.length > 0 ? distinctTypes : ['pcs', 'units', 'bottles']);
        } else {
          setProductTypesForDialog(['pcs', 'units', 'bottles']);
        }
      } catch (err) {
        console.error('Error fetching product types for dialog:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to load unit types for dialog.');
        setProductTypesForDialog(['pcs', 'units', 'bottles']);
      } finally {
        setIsLoadingProductTypesDialog(false);
      }
    };
    fetchDialogProductTypes();
  }, [initializeDatabaseTables, fetchPurchasesData, fetchSalesHistory, fetchSalonConsumption, fetchBalanceStock, supabase, handleSupabaseError]);

  // Function to apply date filter to data
  const applyDateFilter = (data: any[]): any[] => {
    if (!dateFilter.isActive) {
      return data;
    }
    
    // Parse date strings into Date objects for comparison
    const startDate = new Date(dateFilter.startDate);
    startDate.setHours(0, 0, 0, 0); // Start of day
    
    const endDate = new Date(dateFilter.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    
    // Filter data by date
    const filteredData = data.filter((item) => {
      // Get the date from the item, using different potential date fields
      let itemDate: Date | null = null;
      
      if (item.date) {
        itemDate = new Date(item.date);
      } else if (item.Date) { // Added check for Date field with capital D
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

  // Calculate filtered data using useMemo for efficiency
  const filteredPurchases = useMemo(() => applyDateFilter(purchases), [purchases, dateFilter]);
  
  // Calculate filtered sales history data using useMemo for efficiency
  const filteredSalesHistory = useMemo(() => {
    // First apply date filter
    const dateFiltered = applyDateFilter(salesHistory);
    
    // Then apply other filters
    return dateFiltered.filter(item => {
      // Product name filter
      if (salesHistoryFilter.productName && 
          !item.product_name.toLowerCase().includes(salesHistoryFilter.productName.toLowerCase())) {
        return false;
      }
      
      // HSN code filter
      if (salesHistoryFilter.hsnCode && 
          !item.hsn_code.toLowerCase().includes(salesHistoryFilter.hsnCode.toLowerCase())) {
        return false;
      }
      
      // Product type filter
      if (salesHistoryFilter.productType && 
          !item.product_type.toLowerCase().includes(salesHistoryFilter.productType.toLowerCase())) {
        return false;
      }
      
      // Min amount filter
      if (salesHistoryFilter.minAmount && 
          Number(item.invoice_value) < Number(salesHistoryFilter.minAmount)) {
        return false;
      }
      
      // Max amount filter
      if (salesHistoryFilter.maxAmount && 
          Number(item.invoice_value) > Number(salesHistoryFilter.maxAmount)) {
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
      if (salonConsumptionFilter.productName && 
          !item.product_name.toLowerCase().includes(salonConsumptionFilter.productName.toLowerCase())) {
        return false;
      }
      
      // Voucher number filter
      if (salonConsumptionFilter.voucherNo && 
          !item.requisition_voucher_no.toLowerCase().includes(salonConsumptionFilter.voucherNo.toLowerCase())) {
        return false;
      }
      
      // Min amount filter
      if (salonConsumptionFilter.minAmount && 
          Number(item.total_purchase_cost) < Number(salonConsumptionFilter.minAmount)) {
        return false;
      }
      
      // Max amount filter
      if (salonConsumptionFilter.maxAmount && 
          Number(item.total_purchase_cost) > Number(salonConsumptionFilter.maxAmount)) {
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
      if (balanceStockFilter.productName && 
          !item.product_name.toLowerCase().includes(balanceStockFilter.productName.toLowerCase())) {
        return false;
      }
      
      // Change type filter
      if (balanceStockFilter.changeType && 
          item.change_type !== balanceStockFilter.changeType) {
        return false;
      }
      
      // Source filter
      if (balanceStockFilter.source && 
          !item.source.toLowerCase().includes(balanceStockFilter.source.toLowerCase())) {
        return false;
      }
      
      // HSN filter
      if (balanceStockFilter.hsn && 
          !item.hsn_code.toLowerCase().includes(balanceStockFilter.hsn.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [balanceStock, dateFilter, balanceStockFilter]);

  // Apply sorting to sales history data
  const handleRequestSort = (property: keyof SalesHistoryItem) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc'
    });
  };
  
  // Apply sorting to salon consumption data
  const handleSalonRequestSort = (property: keyof SalonConsumptionItem) => {
    const isAsc = salonSortConfig.key === property && salonSortConfig.direction === 'asc';
    setSalonSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc'
    });
  };

  // Get sorted sales history data
  const sortedSalesHistory = useMemo(() => {
    if (!sortConfig.key) return filteredSalesHistory;
    
    return [...filteredSalesHistory].sort((a, b) => {
      if (a[sortConfig.key!] === null) return 1;
      if (b[sortConfig.key!] === null) return -1;
      
      const valueA = a[sortConfig.key!];
      const valueB = b[sortConfig.key!];
      
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
    if (!salonSortConfig.key) return filteredSalonConsumption;
    
    return [...filteredSalonConsumption].sort((a, b) => {
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
  }, [filteredSalonConsumption, salonSortConfig]);

  // Calculate totals using useMemo
  const totalPurchaseQty = useMemo(() => 
    filteredPurchases.reduce((sum, item) => sum + (item.purchase_qty || 0), 0), 
    [filteredPurchases]
  );
  
  // Calculate totals for sales history
  const salesHistoryTotals = useMemo(() => {
    return filteredSalesHistory.reduce((totals, item) => {
      return {
        quantity: totals.quantity + Number(item.quantity || 0),
        taxableValue: totals.taxableValue + Number(item.taxable_value || 0),
        cgstAmount: totals.cgstAmount + Number(item.cgst_amount || 0),
        sgstAmount: totals.sgstAmount + Number(item.sgst_amount || 0),
        igstAmount: totals.igstAmount + Number(item.igst_amount || 0),
        invoiceValue: totals.invoiceValue + Number(item.invoice_value || 0)
      };
    }, {
      quantity: 0,
      taxableValue: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      invoiceValue: 0
    });
  }, [filteredSalesHistory]);
  
  // Calculate totals for salon consumption
  const salonConsumptionTotals = useMemo(() => {
    return filteredSalonConsumption.reduce((totals, item) => {
      return {
        quantity: totals.quantity + Number(item.consumption_qty || 0),
        taxableValue: totals.taxableValue + Number(item.purchase_taxable_value || 0),
        cgstAmount: totals.cgstAmount + Number(item.purchase_cgst || 0),
        sgstAmount: totals.sgstAmount + Number(item.purchase_sgst || 0),
        igstAmount: totals.igstAmount + Number(item.purchase_igst || 0),
        totalValue: totals.totalValue + Number(item.total_purchase_cost || 0)
      };
    }, {
      quantity: 0,
      taxableValue: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalValue: 0
    });
  }, [filteredSalonConsumption]);

  // Function to handle exporting data based on the active tab
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      let dataToExport: any[] = [];
      let filename = "";
      let worksheetName = "";
      
      if (activeTab === 'purchaseHistory') {
        const purchasesUIData = filteredPurchases.map((purchase, index) => ({
          'S.No': index + 1,
          'Date': purchase.date ? new Date(purchase.date).toLocaleDateString() : '-',
          'Product Name': purchase.product_name || '-',
          'HSN Code': purchase.hsn_code || '-',
          'Units': purchase.units || '-',
          'Vendor': purchase.supplier || '-',
          'Purchase Invoice No.': purchase.purchase_invoice_number || '-',
          'Purchase Qty.': purchase.purchase_qty || 0,
          'MRP Incl. GST (Rs.)': purchase.mrp_incl_gst || 0,
          'MRP Ex. GST (Rs.)': calculatePriceExcludingGST(purchase.mrp_incl_gst || 0, purchase.gst_percentage || 0),
          'Discount %': purchase.discount_on_purchase_percentage || 0,
          'Purchase Cost/Unit (Ex.GST)': purchase.purchase_cost_per_unit_ex_gst || 0,
          'GST %': purchase.gst_percentage || 0,
          'Taxable Value (Transaction Rs.)': purchase.purchase_taxable_value || 0,
          'IGST (Transaction Rs.)': purchase.purchase_igst || 0,
          'CGST (Transaction Rs.)': purchase.purchase_cgst || 0,
          'SGST (Transaction Rs.)': purchase.purchase_sgst || 0,
          'Invoice Value (Transaction Rs.)': purchase.purchase_invoice_value_rs || 0
        }));
        
        dataToExport = purchasesUIData;
        filename = 'purchase_history_export.xlsx';
        worksheetName = 'Purchase History';
      } else if (activeTab === 'salesHistory') {
        const salesHistoryUIData = filteredSalesHistory.map((sale, index) => ({
          'S.No': sale.serial_no,
          'Date': new Date(sale.date).toLocaleDateString(),
          'Order ID': sale.order_id,
          'Product Name': sale.product_name,
          'HSN Code': sale.hsn_code,
          'Product Type': sale.product_type,
          'Quantity': Number(sale.quantity),
          'Unit Price (Ex. GST)': Number(sale.unit_price_ex_gst).toFixed(2),
          'GST %': Number(sale.gst_percentage).toFixed(2),
          'Taxable Value': Number(sale.taxable_value).toFixed(2),
          'CGST': Number(sale.cgst_amount).toFixed(2),
          'SGST': Number(sale.sgst_amount).toFixed(2),
          'IGST': Number(sale.igst_amount).toFixed(2),
          'Discount': Number(sale.discount).toFixed(2),
          'Tax': Number(sale.tax).toFixed(2),
          'Invoice Value': Number(sale.invoice_value).toFixed(2),
          'MRP (Incl. GST)': sale.mrp_incl_gst !== null ? Number(sale.mrp_incl_gst).toFixed(2) : '-',
          'Discounted Rate': sale.discounted_sales_rate_ex_gst !== null ? Number(sale.discounted_sales_rate_ex_gst).toFixed(2) : '-',
          'Current Stock': Number(sale.current_stock)
        }));
        
        dataToExport = salesHistoryUIData;
        filename = 'sales_history_export.xlsx';
        worksheetName = 'Sales History';
      } else if (activeTab === 'salonConsumption') {
        const salonConsumptionUIData = filteredSalonConsumption.map((item, index) => ({
          'S.No': index + 1,
          'Voucher No': item.requisition_voucher_no,
          'Date': new Date(item.date).toLocaleDateString(),
          'Order ID': item.order_id,
          'Product Name': item.product_name,
          'HSN Code': item.hsn_code || '-',
          'Consumption Qty': Number(item.consumption_qty),
          'Unit Price (Ex. GST)': Number(item.purchase_cost_per_unit_ex_gst).toFixed(2),
          'GST %': Number(item.purchase_gst_percentage).toFixed(2),
          'Taxable Value': Number(item.purchase_taxable_value).toFixed(2),
          'IGST': Number(item.purchase_igst).toFixed(2),
          'CGST': Number(item.purchase_cgst).toFixed(2),
          'SGST': Number(item.purchase_sgst).toFixed(2),
          'Total Cost': Number(item.total_purchase_cost).toFixed(2),
          'Discounted Rate': Number(item.discounted_sales_rate).toFixed(2),
          'Current Stock': Number(item.current_stock)
        }));
        
        dataToExport = salonConsumptionUIData;
        filename = 'salon_consumption_export.xlsx';
        worksheetName = 'Salon Consumption';
      } else if (activeTab === 'balanceStock') {
        const balanceStockUIData = filteredBalanceStock.map((item, index) => ({
          'S.No': index + 1,
          'Date': new Date(item.date).toLocaleDateString(),
          'Product Name': item.product_name,
          'HSN Code': item.hsn_code,
          'Units': item.units,
          'Change Type': item.change_type === 'addition' ? 'Addition' : 'Reduction',
          'Source': item.source,
          'Reference ID': item.reference_id,
          'Quantity Change': item.quantity_change,
          'Quantity After Change': item.quantity_after_change
        }));
        
        dataToExport = balanceStockUIData;
        filename = 'balance_stock_export.xlsx';
        worksheetName = 'Balance Stock';
      }
      
      // Only export if we have data
      if (dataToExport.length > 0) {
        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
        
        // Generate buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        // Save file
      saveAs(blob, filename);
        toast.success(`Exported ${worksheetName} successfully!`);
      } else {
        toast.error('No data to export');
      }
    } catch (error) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Helper function to safely format numbers
  const formatNumber = (value: any): string => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  const handleTabChange = (event: ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue as 'purchaseHistory' | 'salesHistory' | 'salonConsumption' | 'balanceStock');
    setPage(0); // Reset pagination when changing tabs
    
    // Fetch data based on new tab
    if (newValue === 'purchaseHistory') {
      fetchPurchasesData();
    } else if (newValue === 'salesHistory') {
      fetchSalesHistory();
    } else if (newValue === 'salonConsumption') {
      fetchSalonConsumption();
    } else if (newValue === 'balanceStock') {
      fetchBalanceStock();
    }
  };

  const handleOpen = () => {
    setPurchaseFormData(extendedInitialFormData);
    setEditingId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPurchaseFormData(extendedInitialFormData);
    setEditingId(null);
  };

  const handleEdit = (purchase: PurchaseTransaction) => {
    setPurchaseFormData({
      ...extendedInitialFormData,
      id: purchase.purchase_id,
      product_name: purchase.product_name,
      hsn_code: purchase.hsn_code || '',
      unit_type: purchase.units || '',
      invoice_number: purchase.purchase_invoice_number || '',
      date: purchase.date ? new Date(purchase.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      purchase_qty: purchase.purchase_qty || 0,
      mrp_incl_gst: purchase.mrp_incl_gst || 0,
      gst_percentage: purchase.gst_percentage || 18,
      discount_on_purchase_percentage: purchase.discount_on_purchase_percentage || 0,
      purchase_excl_gst: (purchase.purchase_taxable_value && purchase.purchase_qty)
        ? purchase.purchase_taxable_value / purchase.purchase_qty
        : 0,
      purchase_cost_taxable_value: purchase.purchase_taxable_value || 0,
      purchase_igst: purchase.purchase_igst || 0,
      purchase_cgst: purchase.purchase_cgst || 0,
      purchase_sgst: purchase.purchase_sgst || 0,
      purchase_invoice_value: purchase.purchase_invoice_value_rs || 0,
      vendor: (purchase as any).supplier || 'Direct Entry',
      is_interstate: (purchase.purchase_igst || 0) > 0
    });
    setEditingId(purchase.purchase_id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
        const formDataToSubmit = editingId
          ? { ...purchaseFormData, id: editingId }
          : purchaseFormData;

        const result = await addPurchaseTransaction(formDataToSubmit);

        if (result.success) {
            handleClose();
            await fetchPurchasesData();
            await fetchProducts();
        } else {
            console.error("Failed to add purchase transaction:", result.error);
            alert(`Error: ${result.error?.message || 'Failed to save purchase.'}`);
        }
    } catch (error) {
        console.error("Error submitting purchase:", error);
        alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (purchaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this purchase record?')) return;
    try {
      const success = await deletePurchaseTransaction(purchaseId);
      if (success) {
        toast.success('Purchase deleted successfully');
        fetchPurchasesData();
      } else {
        toast.error('Failed to delete purchase');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Error deleting purchase');
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
    if (!purchaseFormData.vendor?.trim()) {
      alert('Vendor name is required');
      return false;
    }
    if (purchaseFormData.purchase_qty <= 0) {
      alert('Purchase Quantity must be greater than 0');
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

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = async () => {
    if (activeTab === 'purchaseHistory') {
      fetchPurchasesData();
    } else if (activeTab === 'salesHistory') {
      fetchSalesHistory();
    } else if (activeTab === 'salonConsumption') {
      fetchSalonConsumption();
    } else if (activeTab === 'balanceStock') {
      fetchBalanceStock();
    }
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
      sgst: parseFloat(halfGST.toFixed(2))
    };
  };

  const parseNumericInput = (value: string | number | undefined | null): number => {
    if (typeof value === 'number') {
        return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const calculateGSTAmounts = (taxableValue: number, gst_percentage: number) => {
    const totalGSTRate = gst_percentage / 100;
    const totalGST = parseFloat((taxableValue * totalGSTRate).toFixed(2));
    const halfGST = parseFloat((totalGST / 2).toFixed(2));

    return {
        totalGST,
        cgst: halfGST,
        sgst: halfGST
    };
  };

  const calculateInvoiceValue = () => {
    const { purchase_excl_gst, purchase_qty, gst_percentage } = purchaseFormData;
    const taxableValue = parseFloat((purchase_excl_gst * purchase_qty).toFixed(2));
    const gstAmounts = calculateGSTAmounts(taxableValue, gst_percentage);
    const invoiceValue = parseFloat((taxableValue + gstAmounts.cgst + gstAmounts.sgst).toFixed(2));
    return invoiceValue;
  };

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setPurchaseFormData((prev: ExtendedProductFormData) => {
        const newData = { ...prev };
        const fieldName = name as keyof ExtendedProductFormData;

        if (name === 'is_interstate') {
          newData.is_interstate = value as boolean;
        } else if (fieldName in prev && typeof prev[fieldName] === 'number') {
            (newData[fieldName] as number) = parseNumericInput(value as string | number);
        } else if (fieldName in prev && typeof prev[fieldName] === 'string') {
            (newData[fieldName] as string) = String(value);
        } else {
            (newData as any)[fieldName] = value;
        }

        // Recalculate values when key fields change
        if (['mrp_incl_gst', 'gst_percentage', 'discount_on_purchase_percentage', 'purchase_qty', 'is_interstate'].includes(String(fieldName))) {
            const mrp = parseNumericInput(newData.mrp_incl_gst) || 0;
            const gst = parseNumericInput(newData.gst_percentage) || 0;
            const discount = parseNumericInput(newData.discount_on_purchase_percentage) || 0;
            const qty = parseNumericInput(newData.purchase_qty) || 1;
            const isInterstate = newData.is_interstate || false;

            const mrpExGST = calculatePriceExcludingGST(mrp, gst);
            newData.mrp_per_unit_excl_gst = parseFloat(mrpExGST.toFixed(2));

            const discountFactor = 1 - (discount / 100);
            const purchaseCost = parseFloat((mrpExGST * discountFactor).toFixed(2));
            newData.purchase_excl_gst = purchaseCost;

            const taxableValue = parseFloat((purchaseCost * qty).toFixed(2));
            newData.purchase_cost_taxable_value = taxableValue;

            if (isInterstate) {
              newData.purchase_igst = parseFloat((taxableValue * gst / 100).toFixed(2));
              newData.purchase_cgst = 0;
              newData.purchase_sgst = 0;
            } else {
              newData.purchase_igst = 0;
              const halfGstAmount = parseFloat((taxableValue * gst / 200).toFixed(2));
              newData.purchase_cgst = halfGstAmount;
              newData.purchase_sgst = halfGstAmount;
            }

            const totalGst = newData.purchase_igst + newData.purchase_cgst + newData.purchase_sgst;
            newData.purchase_invoice_value = parseFloat((taxableValue + totalGst).toFixed(2));

        }

        return newData;
    });
  };

  const handleProductSelect = (product: Product | null) => {
    if (!product) {
        setPurchaseFormData(prev => ({ ...prev, product_name: '', hsn_code: '', unit_type: '', gst_percentage: 0, mrp_incl_gst: 0 }));
        return;
    }

    const mrp = product.mrp_incl_gst || 0;
    const gst = product.gst_percentage || 18;
    const unitTypeFromMaster = product.units || 'pcs'; // Use product.units as it seems to be the source in ProductMaster

    setPurchaseFormData(prev => ({
      ...prev,
      product_name: product.name,
      hsn_code: product.hsn_code || '',
      unit_type: unitTypeFromMaster, // Set unit_type from product master
      gst_percentage: gst,
      mrp_incl_gst: mrp,
      // Trigger recalculation for other fields if necessary by spreading the result of handleInputChange
      // This part might need to ensure dependent calculations are correctly triggered
    }));
    
    // Explicitly call handleInputChange for fields that trigger recalculations
    // to ensure dependent fields like mrp_per_unit_excl_gst, purchase_excl_gst, etc., are updated.
    // For now, we directly update and rely on the user to verify calculations after product selection.
    // A more robust way would be to call handleInputChange for mrp_incl_gst and gst_percentage
    // after setting them.
    
    // Simplified: directly set and then manually trigger one of the calculation-driving updates if needed
    // For example, calling handleInputChange for 'mrp_incl_gst' with the new 'mrp'
    // This ensures that the dependent calculations in handleInputChange are triggered.
    handleInputChange('mrp_incl_gst', mrp); // This should trigger calculations
    handleInputChange('gst_percentage', gst); // And this too
    handleInputChange('unit_type', unitTypeFromMaster); // Update unit_type

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
      isActive: !prev.isActive
    }));
    
    // Reset to page 1 when toggling filter
    setPage(0);
    
    // Refresh data when filter is toggled
    handleRefresh();
  };
  
  // Function to handle date filter changes
  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset to page 1 when changing dates
    setPage(0);
  };
  
  // Fix the calculatePriceBreakdown function to match expected property names
  const calculatePriceBreakdown = (price: number, gstPercentage: number) => {
    // Calculate price excluding GST and GST amount
    const priceExclGst = calculatePriceExcludingGST(price, gstPercentage);
    const gstAmount = calculateGSTAmount(priceExclGst, gstPercentage);
    
    return {
      priceExclGst,
      gstAmount,
      totalPrice: priceExclGst + gstAmount
    };
  };

  // Function to handle sales history filter change
  const handleSalesHistoryFilterChange = (field: string, value: string) => {
    setSalesHistoryFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to clear all sales history filters
  const clearSalesHistoryFilters = () => {
    setSalesHistoryFilter({
      productName: '',
      hsnCode: '',
      productType: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Function to handle salon consumption filter change
  const handleSalonConsumptionFilterChange = (field: string, value: string) => {
    setSalonConsumptionFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to clear all salon consumption filters
  const clearSalonConsumptionFilters = () => {
    setSalonConsumptionFilter({
      productName: '',
      voucherNo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Function to handle balance stock filter change
  const handleBalanceStockFilterChange = (field: string, value: string) => {
    setBalanceStockFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Function to clear all balance stock filters
  const clearBalanceStockFilters = () => {
    setBalanceStockFilter({
      productName: '',
      changeType: '',
      source: '',
      hsn: ''
    });
  };

  // Helper function for sales history table column sorting
  const SortableTableCell = ({ 
    label, 
    property, 
    align = 'left'
  }: { 
    label: string, 
    property: keyof SalesHistoryItem, 
    align?: 'left' | 'right' | 'center' 
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
            backgroundColor: 'primary.dark'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
          {label}
          {isActive && (
            <Box component="span" sx={{ ml: 0.5 }}>
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
    align = 'left'
  }: { 
    label: string, 
    property: keyof SalonConsumptionItem, 
    align?: 'left' | 'right' | 'center' 
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
            backgroundColor: 'primary.dark'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
          {label}
          {isActive && (
            <Box component="span" sx={{ ml: 0.5 }}>
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
    align = 'left'
  }: { 
    label: string, 
    property: keyof BalanceStockItem, 
    align?: 'left' | 'right' | 'center' 
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
            backgroundColor: 'primary.dark'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }}>
          {label}
          {isActive && (
            <Box component="span" sx={{ ml: 0.5 }}>
              {balanceStockSortConfig.direction === 'asc' ? '▲' : '▼'}
            </Box>
          )}
        </Box>
      </StyledTableCell>
    );
  };

  // Apply sorting to balance stock data
  const handleBalanceStockRequestSort = (property: keyof BalanceStockItem) => {
    const isAsc = balanceStockSortConfig.key === property && balanceStockSortConfig.direction === 'asc';
    setBalanceStockSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc'
    });
  };

  // Get sorted balance stock data
  const sortedBalanceStock = useMemo(() => {
    if (!balanceStockSortConfig.key) return filteredBalanceStock;
    
    return [...filteredBalanceStock].sort((a, b) => {
      if (a[balanceStockSortConfig.key!] === null) return 1;
      if (b[balanceStockSortConfig.key!] === null) return -1;
      
      const valueA = a[balanceStockSortConfig.key!];
      const valueB = b[balanceStockSortConfig.key!];
      
      if (valueA < valueB) {
        return balanceStockSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return balanceStockSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredBalanceStock, balanceStockSortConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h1">
          Inventory Manager
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeTab === 'purchaseHistory' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add Purchase
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={
              (activeTab === 'purchaseHistory' && isLoadingPurchases)
            }
          >
            Refresh
          </Button>
          
          <Button 
            variant="contained" 
            color="success" 
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export Purchase History'}
          </Button>
        </Box>
        
      </Box>
      
      {/* Add Date Filter Controls */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderLeft: dateFilter.isActive ? '4px solid #4caf50' : 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Date Filter
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={dateFilter.startDate}
            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={!dateFilter.isActive}
            sx={{ minWidth: 170 }}
          />
          
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={dateFilter.endDate}
            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={!dateFilter.isActive}
            sx={{ minWidth: 170 }}
          />
          
          <Button
            variant={dateFilter.isActive ? "contained" : "outlined"}
            color={dateFilter.isActive ? "success" : "primary"}
            onClick={toggleDateFilter}
            startIcon={dateFilter.isActive ? <FilterOffIcon /> : <FilterIcon />}
            size="small"
          >
            {dateFilter.isActive ? 'Disable Filter' : 'Enable Filter'}
          </Button>
        </Box>
      </Paper>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        indicatorColor="primary"
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Purchase History" value="purchaseHistory" />
        <Tab label="Sales History" value="salesHistory" />
        <Tab label="Salon Consumption" value="salonConsumption" />
        <Tab label="Balance Stock" value="balanceStock" />
      </Tabs>

      {activeTab === 'purchaseHistory' && errorPurchases && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorPurchases}</Alert>
      )}

      {activeTab === 'salesHistory' && salesHistoryError && (
        <Alert severity="error" sx={{ mb: 2 }}>{salesHistoryError}</Alert>
      )}

      {activeTab === 'salonConsumption' && salonConsumptionError && (
        <Alert severity="error" sx={{ mb: 2 }}>{salonConsumptionError}</Alert>
      )}

      {activeTab === 'balanceStock' && balanceStockError && (
        <Alert severity="error" sx={{ mb: 2 }}>{balanceStockError}</Alert>
      )}

      {/* Purchase History Tab */}
      {activeTab === 'purchaseHistory' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <Table stickyHeader aria-label="products purchase history table" sx={{ minWidth: 2200 }}>
              <TableHead>
                 <TableRow>
                   <StyledTableCell>S.No</StyledTableCell>
                   <StyledTableCell>Date</StyledTableCell>
                   <StyledTableCell>Product Name</StyledTableCell>
                   <StyledTableCell>HSN Code</StyledTableCell>
                   <StyledTableCell>UNITS</StyledTableCell>
                   <StyledTableCell>Vendor</StyledTableCell>
                   <StyledTableCell>Purchase Invoice No.</StyledTableCell>
                   <StyledTableCell align="right">Purchase Qty.</StyledTableCell>
                   <StyledTableCell align="right">MRP Incl. GST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">MRP Ex. GST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Discount %</StyledTableCell>
                   <StyledTableCell align="right">Purchase Cost/Unit (Ex.GST)</StyledTableCell>
                   <StyledTableCell align="right">GST %</StyledTableCell>
                   <StyledTableCell align="right">Taxable Value (Transaction Rs.)</StyledTableCell>
                   <StyledTableCell align="right">IGST (Transaction Rs.)</StyledTableCell>
                   <StyledTableCell align="right">CGST (Transaction Rs.)</StyledTableCell>
                   <StyledTableCell align="right">SGST (Transaction Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Invoice Value (Transaction Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Current Stock After Purchase</StyledTableCell>
                   <StyledTableCell align="right">Total Taxable Value (Current Stock Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Total CGST (Current Stock Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Total SGST (Current Stock Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Total IGST (Current Stock Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Total Amount (Incl. GST Current Stock Rs.)</StyledTableCell>
                   <StyledTableCell align="center">Actions</StyledTableCell>
                 </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingPurchases ? (
                  <TableRow>
                    <TableCell colSpan={23} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingPurchases && filteredPurchases.length > 0 ? (
                  filteredPurchases
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((purchase, index) => {
                      const serial = page * rowsPerPage + index + 1;
                      // Use the stock_after_purchase directly from the purchase record
                      const stockAfterPurchaseDisplay = typeof purchase.stock_after_purchase === 'number' 
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
                        purchase.stock_after_purchase > 0 &&
                        purchase.purchase_cost_per_unit_ex_gst != null
                      ) {
                        // Total taxable value post-discount
                        totalValueMRP =
                          purchase.stock_after_purchase * purchase.purchase_cost_per_unit_ex_gst;
                        if (purchase.purchase_igst && purchase.purchase_igst > 0) {
                          totalIGST = totalValueMRP * (gstRate / 100);
                        } else {
                          totalCGST = totalValueMRP * (gstRate / 200);
                          totalSGST = totalValueMRP * (gstRate / 200);
                        }
                      }

                      return (
                        <TableRow key={purchase.purchase_id} hover>
                          <TableCell>{serial}</TableCell>
                          <TableCell>{new Date(purchase.date).toLocaleDateString() || '-'}</TableCell>
                          <TableCell>{purchase.product_name}</TableCell>
                          <TableCell>{purchase.hsn_code || '-'}</TableCell>
                          <TableCell>{purchase.units || '-'}</TableCell>
                          <TableCell>{purchase.supplier || '-'}</TableCell>
                          <TableCell>{purchase.purchase_invoice_number || '-'}</TableCell>
                          <TableCell align="right">{purchase.purchase_qty ?? '-'}</TableCell>
                          <TableCell align="right">₹{purchase.mrp_incl_gst?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">
                            ₹{calculatePriceExcludingGST(
                              purchase.mrp_incl_gst ?? 0,
                              purchase.gst_percentage ?? 0
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">{purchase.discount_on_purchase_percentage?.toFixed(2) || '0.00'}%</TableCell>
                          <TableCell align="right">₹{purchase.purchase_cost_per_unit_ex_gst?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">{purchase.gst_percentage?.toFixed(2) || '0.00'}%</TableCell>
                          <TableCell align="right">₹{purchase.purchase_taxable_value?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">₹{(purchase.purchase_igst ?? 0) > 0 ? (purchase.purchase_igst ?? 0).toFixed(2) : "-"}</TableCell>
                          <TableCell align="right">₹{purchase.purchase_cgst?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">₹{purchase.purchase_sgst?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">₹{purchase.purchase_invoice_value_rs?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">
                            {/* Display the stock level AFTER this purchase */}
                            {stockAfterPurchaseDisplay}
                          </TableCell>
                          <TableCell align="right">₹{totalValueMRP > 0 ? totalValueMRP.toFixed(2) : '-'}</TableCell>
                          <TableCell align="right">₹{totalCGST > 0 ? totalCGST.toFixed(2) : '-'}</TableCell>
                          <TableCell align="right">₹{totalSGST > 0 ? totalSGST.toFixed(2) : '-'}</TableCell>
                          <TableCell align="right">₹{totalIGST > 0 ? totalIGST.toFixed(2) : '-'}</TableCell>
                          <TableCell align="right">₹{(totalValueMRP + totalCGST + totalSGST + totalIGST) > 0 ? (totalValueMRP + totalCGST + totalSGST + totalIGST).toFixed(2) : '-'}</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" onClick={() => handleEdit(purchase)} title="Edit Purchase">
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(purchase.purchase_id)} title="Delete Purchase">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : null}
                {!isLoadingPurchases && filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={23} align="center" sx={{ py: 3 }}>
                      No purchase history found {dateFilter.isActive ? 'for the selected dates' : ''}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredPurchases.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Qty: `}
                <Box component="span" sx={{ fontWeight: 'bold' }}>
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
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Filter Sales Data
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Product Name"
                  size="small"
                  fullWidth
                  value={salesHistoryFilter.productName}
                  onChange={(e) => handleSalesHistoryFilterChange('productName', e.target.value)}
                  placeholder="Filter by product name"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="HSN Code"
                  size="small"
                  fullWidth
                  value={salesHistoryFilter.hsnCode}
                  onChange={(e) => handleSalesHistoryFilterChange('hsnCode', e.target.value)}
                  placeholder="Filter by HSN code"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Product Type"
                  size="small"
                  fullWidth
                  value={salesHistoryFilter.productType}
                  onChange={(e) => handleSalesHistoryFilterChange('productType', e.target.value)}
                  placeholder="Filter by product type"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Min Amount (₹)"
                  size="small"
                  fullWidth
                  type="number"
                  value={salesHistoryFilter.minAmount}
                  onChange={(e) => handleSalesHistoryFilterChange('minAmount', e.target.value)}
                  placeholder="Min invoice value"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Max Amount (₹)"
                  size="small"
                  fullWidth
                  type="number"
                  value={salesHistoryFilter.maxAmount}
                  onChange={(e) => handleSalesHistoryFilterChange('maxAmount', e.target.value)}
                  placeholder="Max invoice value"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearSalesHistoryFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  {filteredSalesHistory.length} records found (filtered from {salesHistory.length})
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', overflow: 'auto' }}>
            <Table stickyHeader aria-label="sales history table" sx={{ minWidth: 2200 }}>
               <TableHead>
                 <TableRow>
                  <SortableTableCell label="S.No" property="serial_no" />
                  <SortableTableCell label="Date" property="date" />
                  <SortableTableCell label="Order ID" property="order_id" />
                  <SortableTableCell label="Product Name" property="product_name" />
                  <SortableTableCell label="HSN Code" property="hsn_code" />
                  <SortableTableCell label="Product Type" property="product_type" />
                  <SortableTableCell label="Quantity" property="quantity" align="right" />
                  <SortableTableCell label="Unit Price (Ex. GST)" property="unit_price_ex_gst" align="right" />
                  <SortableTableCell label="GST %" property="gst_percentage" align="right" />
                  <SortableTableCell label="Taxable Value" property="taxable_value" align="right" />
                  <SortableTableCell label="CGST" property="cgst_amount" align="right" />
                  <SortableTableCell label="SGST" property="sgst_amount" align="right" />
                  <SortableTableCell label="IGST" property="igst_amount" align="right" />
                  <SortableTableCell label="Discount" property="discount" align="right" />
                  <SortableTableCell label="Tax" property="tax" align="right" />
                  <SortableTableCell label="Invoice Value" property="invoice_value" align="right" />
                  <SortableTableCell label="MRP (Incl. GST)" property="mrp_incl_gst" align="right" />
                  <SortableTableCell label="Discounted Rate" property="discounted_sales_rate_ex_gst" align="right" />
                  <SortableTableCell label="Current Stock" property="current_stock" align="right" />
                 </TableRow>
               </TableHead>
               <TableBody>
                {isLoadingSalesHistory ? (
                   <TableRow>
                    <TableCell colSpan={19} align="center" sx={{ py: 3 }}>
                       <CircularProgress size={40} />
                     </TableCell>
                   </TableRow>
                ) : null}
                {!isLoadingSalesHistory && sortedSalesHistory.length > 0 ? (
                  sortedSalesHistory
                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale, index) => (
                      <TableRow key={sale.id || index} hover>
                        <TableCell>{sale.serial_no}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.order_id}</TableCell>
                        <TableCell>{sale.product_name}</TableCell>
                        <TableCell>{sale.hsn_code}</TableCell>
                        <TableCell>{sale.product_type}</TableCell>
                        <TableCell align="right">{Number(sale.quantity).toLocaleString()}</TableCell>
                        <TableCell align="right">₹{Number(sale.unit_price_ex_gst).toFixed(2)}</TableCell>
                        <TableCell align="right">{Number(sale.gst_percentage).toFixed(2)}%</TableCell>
                        <TableCell align="right">₹{Number(sale.taxable_value).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(sale.cgst_amount).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(sale.sgst_amount).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(sale.igst_amount).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(sale.discount).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(sale.tax).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(sale.invoice_value).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          {sale.mrp_incl_gst !== null ? `₹${Number(sale.mrp_incl_gst).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {sale.discounted_sales_rate_ex_gst !== null ? `₹${Number(sale.discounted_sales_rate_ex_gst).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell align="right">{Number(sale.current_stock).toLocaleString()}</TableCell>
                         </TableRow>
                    ))
                ) : null}
                {!isLoadingSalesHistory && sortedSalesHistory.length === 0 ? (
                   <TableRow>
                    <TableCell colSpan={19} align="center" sx={{ py: 3 }}>
                      No sales history found {dateFilter.isActive ? 'for the selected dates' : ''}.
                     </TableCell>
                   </TableRow>
                ) : null}
               </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>Totals:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{salesHistoryTotals.quantity.toLocaleString()}</TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salesHistoryTotals.taxableValue.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salesHistoryTotals.cgstAmount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salesHistoryTotals.sgstAmount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salesHistoryTotals.igstAmount.toFixed(2)}</TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salesHistoryTotals.invoiceValue.toFixed(2)}</TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableFooter>
             </Table>
           </TableContainer>
           <TablePagination
             rowsPerPageOptions={[10, 25, 100]}
             component="div"
            count={filteredSalesHistory.length}
             rowsPerPage={rowsPerPage}
             page={page}
             onPageChange={handleChangePage}
             onRowsPerPageChange={handleChangeRowsPerPage}
             labelDisplayedRows={({ from, to, count }) => (
                <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Sales: `}
                <Box component="span" sx={{ fontWeight: 'bold', ml: 1 }}>
                  ₹{salesHistoryTotals.invoiceValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
            <Alert severity="error" sx={{ mb: 2 }}>{salonConsumptionError}</Alert>
          )}
          
          {/* Salon Consumption Filters */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Filter Salon Consumption Data
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Product Name"
                  size="small"
                  fullWidth
                  value={salonConsumptionFilter.productName}
                  onChange={(e) => handleSalonConsumptionFilterChange('productName', e.target.value)}
                  placeholder="Filter by product name"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Voucher Number"
                  size="small"
                  fullWidth
                  value={salonConsumptionFilter.voucherNo}
                  onChange={(e) => handleSalonConsumptionFilterChange('voucherNo', e.target.value)}
                  placeholder="Filter by voucher number"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Min Amount (₹)"
                  size="small"
                  fullWidth
                  type="number"
                  value={salonConsumptionFilter.minAmount}
                  onChange={(e) => handleSalonConsumptionFilterChange('minAmount', e.target.value)}
                  placeholder="Min amount"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Max Amount (₹)"
                  size="small"
                  fullWidth
                  type="number"
                  value={salonConsumptionFilter.maxAmount}
                  onChange={(e) => handleSalonConsumptionFilterChange('maxAmount', e.target.value)}
                  placeholder="Max amount"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearSalonConsumptionFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  {filteredSalonConsumption.length} records found (filtered from {salonConsumption.length})
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', overflow: 'auto' }}>
            <Table stickyHeader aria-label="salon consumption table" sx={{ minWidth: 1800 }}>
              <TableHead>
                <TableRow>
                  <SortableSalonTableCell label="S.No" property="id" />
                  <SortableSalonTableCell label="Date" property="date" />
                  <SortableSalonTableCell label="Voucher No" property="requisition_voucher_no" />
                  <SortableSalonTableCell label="Order ID" property="order_id" />
                  <SortableSalonTableCell label="Product Name" property="product_name" />
                  <SortableSalonTableCell label="HSN Code" property="hsn_code" />
                  <SortableSalonTableCell label="Quantity" property="consumption_qty" align="right" />
                  <SortableSalonTableCell label="Unit Price (Ex. GST)" property="purchase_cost_per_unit_ex_gst" align="right" />
                  <SortableSalonTableCell label="GST %" property="purchase_gst_percentage" align="right" />
                  <SortableSalonTableCell label="Taxable Value" property="purchase_taxable_value" align="right" />
                  <SortableSalonTableCell label="IGST" property="purchase_igst" align="right" />
                  <SortableSalonTableCell label="CGST" property="purchase_cgst" align="right" />
                  <SortableSalonTableCell label="SGST" property="purchase_sgst" align="right" />
                  <SortableSalonTableCell label="Total Cost" property="total_purchase_cost" align="right" />
                  <SortableSalonTableCell label="Discounted Rate" property="discounted_sales_rate" align="right" />
                  <SortableSalonTableCell label="Current Stock" property="current_stock" align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingSalonConsumption ? (
                  <TableRow>
                    <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingSalonConsumption && sortedSalonConsumption.length > 0 ? (
                  sortedSalonConsumption
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow key={item.id || index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>{item.requisition_voucher_no}</TableCell>
                        <TableCell>{item.order_id}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.hsn_code || '-'}</TableCell>
                        <TableCell align="right">{Number(item.consumption_qty).toLocaleString()}</TableCell>
                        <TableCell align="right">₹{Number(item.purchase_cost_per_unit_ex_gst).toFixed(2)}</TableCell>
                        <TableCell align="right">{Number(item.purchase_gst_percentage).toFixed(2)}%</TableCell>
                        <TableCell align="right">₹{Number(item.purchase_taxable_value).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(item.purchase_igst).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(item.purchase_cgst).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(item.purchase_sgst).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(item.total_purchase_cost).toFixed(2)}</TableCell>
                        <TableCell align="right">₹{Number(item.discounted_sales_rate).toFixed(2)}</TableCell>
                        <TableCell align="right">{Number(item.current_stock).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                ) : null}
                {!isLoadingSalonConsumption && sortedSalonConsumption.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                      No salon consumption data found {dateFilter.isActive ? 'for the selected dates' : ''}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>Totals:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{salonConsumptionTotals.quantity.toLocaleString()}</TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salonConsumptionTotals.taxableValue.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salonConsumptionTotals.igstAmount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salonConsumptionTotals.cgstAmount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salonConsumptionTotals.sgstAmount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{salonConsumptionTotals.totalValue.toFixed(2)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredSalonConsumption.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Consumption: `}
                <Box component="span" sx={{ fontWeight: 'bold', ml: 1 }}>
                  ₹{salonConsumptionTotals.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Box>
              </>
            )}
          />
        </Paper>
      )}

      {/* Balance Stock Tab */}
      {activeTab === 'balanceStock' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {/* Balance Stock Filters */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Filter Balance Stock Data
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Product Name"
                  size="small"
                  fullWidth
                  value={balanceStockFilter.productName}
                  onChange={(e) => handleBalanceStockFilterChange('productName', e.target.value)}
                  placeholder="Filter by product name"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="HSN Code"
                  size="small"
                  fullWidth
                  value={balanceStockFilter.hsn}
                  onChange={(e) => handleBalanceStockFilterChange('hsn', e.target.value)}
                  placeholder="Filter by HSN code"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
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
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Source"
                  size="small"
                  fullWidth
                  value={balanceStockFilter.source}
                  onChange={(e) => handleBalanceStockFilterChange('source', e.target.value)}
                  placeholder="Filter by source"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearBalanceStockFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  {filteredBalanceStock.length} records found (filtered from {balanceStock.length})
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', overflow: 'auto' }}>
            <Table stickyHeader aria-label="balance stock table" sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <SortableBalanceStockTableCell label="S.No" property="id" />
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
                {isLoadingBalanceStock ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingBalanceStock && sortedBalanceStock.length > 0 ? (
                  sortedBalanceStock
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item, index) => (
                      <TableRow 
                        key={item.id || index} 
                        hover
                        sx={{
                          backgroundColor: item.change_type === 'reduction' 
                            ? 'rgba(255, 0, 0, 0.05)' 
                            : 'rgba(0, 255, 0, 0.05)'
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.hsn_code}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.change_type === 'addition' ? 'Addition' : 'Reduction'} 
                            color={item.change_type === 'addition' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell>{item.reference_id}</TableCell>
                        <TableCell align="right">
                          {item.change_type === 'addition' ? '+' : '-'}
                          {Math.abs(Number(item.quantity_change))}
                        </TableCell>
                        <TableCell align="right">{Number(item.quantity_after_change)}</TableCell>
                      </TableRow>
                    ))
                ) : null}
                {!isLoadingBalanceStock && sortedBalanceStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      No balance stock data found {dateFilter.isActive ? 'for the selected dates' : ''}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={filteredBalanceStock.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to, count }) => (
              <>
                {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Entries: ${filteredBalanceStock.length}`}
              </>
            )}
          />
        </Paper>
      )}

      {/* Dialog for adding/editing purchases */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Purchase Transaction' : 'Add New Product Purchase'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
             <Grid item xs={12}>
               <Autocomplete
                 options={productMasterList}
                 getOptionLabel={(option) => option?.name || ""}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     label="Select Product from Product Master *"
                     fullWidth
                     required
                     error={!purchaseFormData.product_name}
                     helperText={!purchaseFormData.product_name ? "Product selection is required" : ""}
                   />
                 )}
                 onChange={(event, newValue) => handleProductSelect(newValue)}
                 isOptionEqualToValue={(option, value) => option?.id === value?.id}
                 value={productMasterList.find(p => p.name === purchaseFormData.product_name) || null}
               />
             </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Date *"
                type="date"
                value={purchaseFormData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Vendor Name *"
                value={purchaseFormData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                fullWidth
                required
                placeholder="Enter supplier name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Purchase Invoice No. *"
                value={purchaseFormData.invoice_number}
                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Product Name *"
                value={purchaseFormData.product_name}
                fullWidth
                required
                InputProps={{ readOnly: true }}
                helperText="Auto-filled from Product Master"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="HSN Code *"
                value={purchaseFormData.hsn_code}
                fullWidth
                required
                InputProps={{ readOnly: true }}
                helperText="Auto-filled from Product Master"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth required error={!purchaseFormData.unit_type}>
                <InputLabel id="dialog-units-select-label">UNITS *</InputLabel>
                <Select
                  labelId="dialog-units-select-label"
                  id="dialog-units-select"
                  name="unit_type"
                  value={purchaseFormData.unit_type}
                  label="UNITS *"
                  onChange={handleDialogSelectChange}
                >
                  {isLoadingProductTypesDialog ? (
                    <MenuItem value="" disabled><em>Loading types...</em></MenuItem>
                  ) : productTypesForDialog.length > 0 ? (
                    productTypesForDialog.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled><em>No types found in Product Master</em></MenuItem>
                  )}
                </Select>
                {!purchaseFormData.unit_type && <FormHelperText>Unit type is required</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="GST Percentage *"
                type="number"
                value={purchaseFormData.gst_percentage}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.01 },
                  readOnly: true
                }}
                helperText="Auto-filled from Product Master"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Purchase Qty. *"
                type="number"
                value={purchaseFormData.purchase_qty}
                onChange={(e) => handleInputChange('purchase_qty', parseFloat(e.target.value) || 0)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                  inputProps: { min: 1, step: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={purchaseFormData.is_interstate}
                    onChange={(e) => handleInputChange('is_interstate', e.target.checked)}
                    color="primary"
                  />
                }
                label="Inter-State Purchase (IGST)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="MRP Incl. GST (Rs.) *"
                type="number"
                value={purchaseFormData.mrp_incl_gst || 0}
                onChange={(e) => handleInputChange('mrp_incl_gst', parseFloat(e.target.value) || 0)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="MRP Ex. GST (Rs.)"
                type="number"
                value={purchaseFormData.mrp_per_unit_excl_gst || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Discount on Purchase Percentage *"
                type="number"
                value={purchaseFormData.discount_on_purchase_percentage || 0}
                onChange={(e) => handleInputChange('discount_on_purchase_percentage', parseFloat(e.target.value) || 0)}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.01 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Purchase Cost per Unit (Ex. GST)"
                type="number"
                value={purchaseFormData.purchase_excl_gst || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated (MRP Ex. GST - Discount)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Purchase Taxable Value (Rs.)"
                type="number"
                value={purchaseFormData.purchase_cost_taxable_value || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated (Cost × Quantity)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="IGST Amount (Rs.)"
                type="number"
                value={purchaseFormData.purchase_igst || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="CGST Amount (Rs.)"
                type="number"
                value={purchaseFormData.purchase_cgst || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="SGST Amount (Rs.)"
                type="number"
                value={purchaseFormData.purchase_sgst || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Total Invoice Value (Rs.)"
                type="number"
                value={purchaseFormData.purchase_invoice_value || 0}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                helperText="Auto-calculated (Taxable + GST)"
              />
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f0f7ff', border: '1px solid #c7e1fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>GST Breakdown (based on calculated Purchase Cost/Unit)</Typography>
                <Grid container spacing={1}>
                   <Grid item xs={6}><Typography variant="body2">Purchase Cost/Unit (Ex.GST):</Typography></Grid>
                   <Grid item xs={6} textAlign="right"><Typography variant="body2">₹{purchaseFormData.purchase_excl_gst.toFixed(2)}</Typography></Grid>
                   <Grid item xs={6}><Typography variant="body2">GST Rate:</Typography></Grid>
                   <Grid item xs={6} textAlign="right"><Typography variant="body2">{purchaseFormData.gst_percentage.toFixed(2)}%</Typography></Grid>
                   <Grid item xs={6}>
                     <Typography variant="body2">
                       {purchaseFormData.is_interstate ? 'IGST Amount/Unit:' : 'CGST Amount/Unit:'}
                     </Typography>
                   </Grid>
                   <Grid item xs={6} textAlign="right">
                     <Typography variant="body2">
                       {purchaseFormData.purchase_qty > 0
                         ? `₹${((purchaseFormData.is_interstate ? purchaseFormData.purchase_igst : purchaseFormData.purchase_cgst) / purchaseFormData.purchase_qty).toFixed(2)}`
                         : '0.00'}
                     </Typography>
                   </Grid>
                   {!purchaseFormData.is_interstate && (
                     <>
                       <Grid item xs={6}><Typography variant="body2">SGST Amount/Unit:</Typography></Grid>
                       <Grid item xs={6} textAlign="right">
                         <Typography variant="body2">
                           {purchaseFormData.purchase_qty > 0 ? `₹${(purchaseFormData.purchase_sgst / purchaseFormData.purchase_qty).toFixed(2)}` : '0.00'}
                         </Typography>
                       </Grid>
                     </>
                   )}
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={6}><Typography variant="subtitle2">Purchase Price/Unit (Incl. GST):</Typography></Grid>
                  <Grid item xs={6} textAlign="right">
                     <Typography variant="subtitle2">
                       ₹{(purchaseFormData.purchase_excl_gst * (1 + purchaseFormData.gst_percentage / 100)).toFixed(2)}
                     </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? 'Update Purchase' : 'Save Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 