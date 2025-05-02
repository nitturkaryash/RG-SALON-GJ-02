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
  TableFooter
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
import SalonConsumptionTab from './Inventory/SalonConsumptionTab';
import SalesHistoryTab from './Inventory/SalesHistoryTab';
import { toast } from 'react-hot-toast';
import { calculatePriceExcludingGST, calculateGSTAmount } from '../utils/gstCalculations';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

// Define interface for Stock History items
interface StockHistoryItem {
  id: string;
  date: string; // timestamp with time zone
  product_id: string;
  product_name: string;
  hsn_code: string;
  units: string;
  change_qty: number; // Use qty_change if available, otherwise change_qty
  stock_after: number; // Use stock_after if available, otherwise current_qty
  change_type: string; // e.g., 'purchase', 'sale', 'consumption', 'adjustment'
  source?: string; // e.g., 'Purchase Invoice', 'Order', 'Consumption Voucher'
  reference_id?: string; // e.g., Invoice No, Order ID, Voucher No
  created_at: string; // timestamp with time zone
}

// Define salon consumption interface (used for direct fetching)
interface SalonConsumptionItem {
  id: string;
  created_at: string;
  product_id: string;
  product_name: string;
  requisition_voucher_no: string;
  consumption_qty: number;
  purchase_cost_per_unit: number;
  purchase_gst_percentage: number;
  purchase_taxable_value: number;
  purchase_igst: number;
  purchase_cgst: number;
  purchase_sgst: number;
  total_purchase_cost: number;
}

// Update the ExtendedProductFormData to include all necessary fields
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
    fetchPurchases
  } = usePurchaseHistory();

  const [open, setOpen] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState<ExtendedProductFormData>(extendedInitialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'purchaseHistory' | 'stockHistory' | 'salonConsumption' | 'salesHistory'>('purchaseHistory');

  // Add state for Stock History
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [stockHistoryLoading, setStockHistoryLoading] = useState<boolean>(false);
  const [stockHistoryError, setStockHistoryError] = useState<string | null>(null);

  // State for directly fetched salon consumption data
  const [salonConsumptionData, setSalonConsumptionData] = useState<SalonConsumptionItem[]>([]);
  const [isLoadingConsumption, setIsLoadingConsumption] = useState<boolean>(true);
  const [errorConsumption, setErrorConsumption] = useState<string | null>(null);

  // State for consumption data
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  
  // Add date filter state
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
    isActive: false
  });

  // State for export functionality
  const [isExporting, setIsExporting] = useState(false);

  // Function to initialize database tables
  const initializeDatabaseTables = useCallback(async () => {
    try {
      console.log('Initializing database tables...');
      // Database initialization tasks could go here if needed
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }, []);

  // Initialize tables when component loads
  useEffect(() => {
    // Initialize database tables
    initializeDatabaseTables();
    
    // Fetch all data regardless of active tab
    fetchPurchases();
    fetchStockHistory();
    fetchSalonConsumptionDirect();
  }, []);  // Empty dependency array since these functions don't change

  // Function to handle exporting data based on the active tab
  const handleExport = async () => {
    try {
      setIsExporting(true);
      console.log('Exporting data to Excel file...');

      // Fetch Sales History data specifically for the export
      console.log('Fetching Sales History data for export...');
      const { data: salesData, error: salesError } = await supabase
        .from('sales_products_new') // Use the correct view name (plural) matching SalesHistoryTab
        .select('*');
        
      console.log('Raw salesData for export:', salesData);
      console.log('Raw salesError for export:', salesError);

      // Declare filteredSalesData here to be accessible later
      let filteredSalesData: any[] = []; // Initialize with explicit type or leave as any[] for now

      if (salesError) {
        console.error("❌ Error fetching Sales History data for export:", salesError);
        toast.error(`Failed to fetch Sales History: ${salesError.message}`);
        // Sales data fetch failed, filteredSalesData remains empty
      } else {
        console.log(`✅ Fetched ${salesData?.length || 0} sales history records for export.`);
        // Filter to products only
        if (salesData) {
          filteredSalesData = salesData.filter(item => item.product_type === 'product'); // Assign filtered data
          console.log(`ℹ️ Filtered sales data to ${filteredSalesData.length} product records for export.`);
        }
      }

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Adjusted check to include salesData possibility
      if (
        (!purchases || purchases.length === 0) &&
        (!stockHistory || stockHistory.length === 0) &&
        (!consumptionData || consumptionData.length === 0) &&
        (!salonConsumptionData || salonConsumptionData.length === 0) &&
        (!filteredSalesData || filteredSalesData.length === 0) // Check fetched salesData
      ) {
        toast.error('No data available across any tabs to export.');
        console.error('No data to export.');
        setIsExporting(false); // Stop export if absolutely nothing loaded
        return;
      }

      // Purchases Sheet (Existing logic)
      if (purchases && purchases.length > 0) {
        console.log(`Using ${purchases.length} purchase records from state`);
        // Format data for Purchase History
        const formattedPurchaseData = purchases.map(purchase => {
          const purchaseCostPerUnitExGst = (purchase.purchase_taxable_value && purchase.purchase_qty)
            ? purchase.purchase_taxable_value / purchase.purchase_qty
            : ((purchase.mrp_excl_gst ?? 0) * (1 - (purchase.discount_on_purchase_percentage || 0) / 100)); // Fallback calculation + null check
          
          return {
            'Date': purchase.date ? new Date(purchase.date).toLocaleDateString() : '',
            'Product Name': purchase.product_name || '',
            'HSN Code': purchase.hsn_code || '',
            'Units': purchase.units || '',
            'Vendor': purchase.supplier || '',
            'Purchase Invoice No.': purchase.purchase_invoice_number || '',
            'Purchase Qty.': purchase.purchase_qty || 0,
            'MRP Incl. GST (Rs.)': purchase.mrp_incl_gst || 0,
            'MRP Ex. GST (Rs.)': purchase.mrp_excl_gst || 0,
            'Discount %': purchase.discount_on_purchase_percentage || 0,
            'Purchase Cost/Unit (Ex.GST)': parseFloat(purchaseCostPerUnitExGst.toFixed(2)),
            'GST %': purchase.gst_percentage || 0,
            'Taxable Value (Rs.)': purchase.purchase_taxable_value || 0,
            'IGST (Rs.)': purchase.purchase_igst || 0,
            'CGST (Rs.)': purchase.purchase_cgst || 0,
            'SGST (Rs.)': purchase.purchase_sgst || 0,
            'Invoice Value (Rs.)': purchase.purchase_invoice_value_rs || 0,
          }
        });

        // Convert to worksheet and add to workbook
        const purchaseSheet = XLSX.utils.json_to_sheet(formattedPurchaseData);
        XLSX.utils.book_append_sheet(wb, purchaseSheet, 'Purchase History');
        console.log("✅ Added Purchase History sheet with", formattedPurchaseData.length, "rows");
      } else {
         console.log("⚠️ No purchase history data available to add to the export");
      }

      // Salon Consumption Sheet
      console.log('Fetching Salon Consumption data for export...');
      try {
        // @ts-ignore: override table type for dynamic mapping
        const { data, error: salonError } = await supabase
          .from<any, any>('salon_consumption_products')
          .select('*');
        if (salonError) {
          console.error('❌ Error fetching Salon Consumption data for export:', salonError);
          toast.error(`Failed to fetch Salon Consumption: ${salonError.message}`);
        } else {
          const rows = data as any[] || [];
          if (rows.length > 0) {
            console.log(`✅ Fetched ${rows.length} salon consumption records for export.`);
            const formattedSalonData = rows.map((item: any) => ({
              'Requisition Voucher No.': item['Requisition Voucher No.'],
              'Order ID': item['order_id'],
              'Date': item['Date'] ? new Date(item['Date']).toLocaleDateString() : '',
              'Product Name': item['Product Name'],
              'Product Type': item['Product Type'],
              'Consumption Qty.': item['Consumption Qty.'],
              'HSN Code': item['HSN_Code'],
              'MRP Inclusive GST (Rs.)': item['MRP_Inclusive_GST_Rs'],
              'Purchase Cost/Unit Ex. GST (Rs.)': item['Purchase_Cost_per_Unit_Ex_GST_Rs'],
              'GST %': item['Purchase_GST_Percentage'],
              'Purchase Taxable Value (Rs.)': item['Purchase_Taxable_Value_Rs'],
              'IGST (Rs.)': item['Purchase_IGST_Rs'],
              'CGST (Rs.)': item['Purchase_CGST_Rs'],
              'SGST (Rs.)': item['Purchase_SGST_Rs'],
              'Total Purchase Cost (Rs.)': item['Total_Purchase_Cost_Rs'],
              'Discounted Sales Rate (Rs.)': item['Discounted_Sales_Rate_Rs'],
              'Initial Stock': item['Initial_Stock'],
              'Current Stock': item['Current_Stock'],
              'Remaining Stock': item['Remaining_Stock'],
              'Remaining Stock CGST (Rs.)': item['Remaining_Stock_CGST_Rs'],
              'Remaining Stock SGST (Rs.)': item['Remaining_Stock_SGST_Rs'],
              'Remaining Stock IGST (Rs.)': item['Remaining_Stock_IGST_Rs'],
              'Total Remaining Stock Value (Rs.)': item['Total_Remaining_Stock_Value_Rs']
            }));
            const salonSheet = XLSX.utils.json_to_sheet(formattedSalonData);
            XLSX.utils.book_append_sheet(wb, salonSheet, 'Salon Consumption');
            console.log('✅ Added Salon Consumption sheet with', formattedSalonData.length, 'rows');
          } else {
            console.log('⚠️ No salon consumption records to export');
          }
        }
      } catch (err) {
        console.error('❌ Exception while exporting Salon Consumption data:', err);
        toast.error('Error exporting Salon Consumption.');
      }

      // *** START: Add Sales History Sheet ***
      if (filteredSalesData && filteredSalesData.length > 0) {
          console.log(`Formatting ${filteredSalesData.length} sales history records for export.`);
          // Build header and row arrays so Excel columns exactly match the UI table
          const headers = [
            'Serial No.', 'Date', 'Product Name', 'HSN Code', 'Units', 'Qty.',
            'Unit Price (Inc. GST)', 'Unit Price (Ex.GST)', 'Taxable Value', 'GST %',
            'Discount %', 'Taxable After Discount', 'CGST', 'SGST', 'Total Value',
            'Initial Stock', 'Remaining Stock', 'Current Stock', 'Taxable Value',
            'IGST (Rs.)', 'CGST (Rs.)', 'SGST (Rs.)', 'Total Value (Rs.)'
          ];
          const dataRows = filteredSalesData.map(item => [
            item.serial_no,
            item.date ? new Date(item.date).toLocaleDateString() : '',
            item.product_name,
            item.hsn_code || 'N/A',
            item.product_type || 'N/A',
            item.quantity,
            item.unit_price_inc_gst ?? (item.unit_price_ex_gst * (1 + (item.gst_percentage ?? 0)/100)),
            item.unit_price_ex_gst,
            item.taxable_value,
            item.gst_percentage,
            typeof item.discount_percentage === 'number' ? `${item.discount_percentage.toFixed(2)}%` : '0.00%',
            parseFloat(((item.taxable_value ?? 0) * (1 - (item.discount_percentage ?? 0) / 100)).toFixed(2)),
            item.cgst_amount,
            item.sgst_amount,
            item.invoice_value,
            item.initial_stock,
            item.remaining_stock,
            item.current_stock,
            item.current_stock_taxable_value ?? 0,
            item.current_stock_igst ?? 0,
            item.current_stock_cgst ?? 0,
            item.current_stock_sgst ?? 0,
            item.current_stock_total_value ?? 0
          ]);
          const salesSheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
          XLSX.utils.book_append_sheet(wb, salesSheet, 'Sales History');
          console.log(`✅ Added Sales History sheet with ${filteredSalesData.length} rows`);
      } else {
          console.log("⚠️ No sales history data available to add to the export");
      }
      // *** END: Add Sales History Sheet ***

      // Stock History Sheet (Existing logic)
      if (stockHistory && stockHistory.length > 0) {
        console.log(`Using ${stockHistory.length} stock history records from state`);
        // ... (rest of existing stock history formatting)
        const formattedStockHistoryData = stockHistory.map((item, index) => ({
          'Serial No.': `SH-${(index + 1).toString().padStart(5, '0')}`,
          'Date': item.date ? new Date(item.date).toLocaleString() : '',
          'Product Name': item.product_name || '',
          'HSN Code': item.hsn_code || '',
          'Units': item.units || '',
          'Change Type': item.change_type || 'Unknown',
          'Source': item.source || '-',
          'Reference ID': item.reference_id || '-',
          'Quantity Change': item.change_qty || 0,
          'Quantity After Change': item.stock_after || 0,
        }));

        const historySheet = XLSX.utils.json_to_sheet(formattedStockHistoryData);
        XLSX.utils.book_append_sheet(wb, historySheet, 'Stock History');
        console.log("✅ Added Stock History sheet with", formattedStockHistoryData.length, "rows");
      } else {
        console.log("⚠️ No stock history data available to add to the export");
      }

      // Check if any sheet was actually added before writing the file
       if (wb.SheetNames.length === 0) {
         toast.error('No data found in any tab to export.');
         console.log("❌ No sheets were added to the workbook. Aborting export.");
       } else {
         // Generate filename with date
         const filename = `RG_Salon_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

         // Write file
         XLSX.writeFile(wb, filename);
         console.log(`✅ Successfully exported to ${filename}`);
         toast.success(`Exported ${wb.SheetNames.length} sheet(s) successfully!`);
       }

    } catch (error) {
      console.error("❌ Error exporting data:", error);
      toast.error("Error exporting data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Helper function to safely format numbers
  const formatNumber = (value: any): string => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(2) : '0.00';
  };

  // Function to fetch salon consumption data directly
  const fetchSalonConsumptionDirect = useCallback(async () => {
    setIsLoadingConsumption(true);
    setErrorConsumption(null);
    console.log('🔍 DEBUG: Fetching salon consumption data...');
    try {
      // Query from inventory_salon_consumption table instead of sales table
      const { data, error } = await supabase
        .from('inventory_salon_consumption')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Direct inventory_salon_consumption query:', { count: data?.length, records: data });

      if (data && data.length > 0) {
        const transformedData: SalonConsumptionItem[] = data.map(item => ({
          id: item.id,
          created_at: item.created_at || item.date,
          product_id: item.product_id || '',
          product_name: item.product_name || 'Unknown Product',
          requisition_voucher_no: item.requisition_voucher_no || 'N/A',
          consumption_qty: item.quantity || 0,
          purchase_cost_per_unit: item.price_per_unit || 0,
          purchase_gst_percentage: item.gst_percentage || 0,
          purchase_taxable_value: (item.price_per_unit || 0) * (item.quantity || 0), // Calculate taxable value
          purchase_igst: 0, // Typically 0 for local transactions
          purchase_cgst: (((item.price_per_unit || 0) * (item.quantity || 0)) * (item.gst_percentage || 0) / 200), // Half of GST
          purchase_sgst: (((item.price_per_unit || 0) * (item.quantity || 0)) * (item.gst_percentage || 0) / 200), // Half of GST
          total_purchase_cost: (item.price_per_unit || 0) * (item.quantity || 0) * (1 + (item.gst_percentage || 0) / 100), // Total with GST
        }));

        setSalonConsumptionData(transformedData);
        console.log('🔍 DEBUG: Transformed consumption data:', { count: transformedData.length, sample: transformedData[0] });
      } else {
        setSalonConsumptionData([]);
        console.log('🔍 DEBUG: No consumption data found in inventory_salon_consumption table');
      }
    } catch (err) {
      console.error('Error fetching salon consumption data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load salon consumption data.';
      setErrorConsumption(errorMessage);
      setSalonConsumptionData([]);
    } finally {
      setIsLoadingConsumption(false);
    }
  }, []);

  // Fetch Stock History data
  const fetchStockHistory = useCallback(async () => {
    setStockHistoryLoading(true);
    setStockHistoryError(null);
    console.log('Fetching stock history...');
    try {
      const { data, error } = await supabase
        .from('stock_history')
        .select('*')
        .order('date', { ascending: false }) // Order by date descending
        .order('created_at', { ascending: false }); // Secondary sort for same-timestamp events

      // ** Corrected Error Handling **
      // Check if there was an error from Supabase first
      if (error) {
        console.error("Supabase error fetching stock history:", error);
        // Use the helper function correctly
        const handledError = handleSupabaseError(error); 
        setStockHistoryError(handledError.message); 
        setStockHistory([]); // Clear data on error
        setStockHistoryLoading(false); // Ensure loading stops
        return; // Stop execution
      }
      
      if (data) {
         const transformedData: StockHistoryItem[] = data.map(item => ({
           id: item.id,
           date: item.date || item.created_at,
           product_id: item.product_id,
           product_name: item.product_name,
           hsn_code: item.hsn_code || '',
           units: item.units || '',
           // Use specific qty columns if they exist, otherwise fallback
           change_qty: item.qty_change ?? item.change_qty ?? 0,
           stock_after: item.stock_after ?? item.current_qty ?? 0,
           change_type: item.type || item.change_type || 'Unknown', // Prefer 'type' if it exists
           source: item.source || '-',
           reference_id: item.invoice_id || item.reference_id || '-', // Prefer specific IDs if available
           created_at: item.created_at,
         }));
         setStockHistory(transformedData);
         console.log(`Fetched ${transformedData.length} stock history records.`);
      } else {
        setStockHistory([]);
        console.log('No stock history data found.');
      }
    } catch (err) {
      console.error("Error fetching stock history:", err);
      // Safer catch block error message handling
      const message = (err instanceof Error && err.message) 
        ? err.message 
        : 'An unexpected error occurred while fetching stock history.';
      setStockHistoryError(message);
      setStockHistory([]);
    } finally {
      setStockHistoryLoading(false);
    }
  }, []);

  const handleTabChange = (event: ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue as 'purchaseHistory' | 'stockHistory' | 'salonConsumption' | 'salesHistory');
    setPage(0); // Reset pagination when changing tabs
    
    // Fetch data based on new tab
    if (newValue === 'purchaseHistory') {
      fetchPurchases();
    } else if (newValue === 'stockHistory') {
      fetchStockHistory();
    } else if (newValue === 'salonConsumption') {
      fetchSalonConsumptionDirect();
    }
    // No need to add a fetch for salesHistory as it handles its own data fetching
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
            await fetchPurchases();
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
    console.warn("Deleting purchase transactions not yet implemented.", purchaseId);
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
      fetchPurchases();
    } else if (activeTab === 'stockHistory') {
      fetchStockHistory();
    } else if (activeTab === 'salonConsumption') {
      fetchSalonConsumptionDirect();
    }
    // No need to add a refresh for salesHistory as it handles its own refresh
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

    setPurchaseFormData(prev => ({
      ...prev,
      product_name: product.name,
      hsn_code: product.hsn_code || '',
      unit_type: product.units || 'pcs',
      gst_percentage: gst,
      mrp_incl_gst: mrp,
      ...(handleInputChange('mrp_incl_gst', mrp), {})
    }));
    handleInputChange('gst_percentage', gst);

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
  
  // Function to apply date filter to data
  const applyDateFilter = (data: any[]): any[] => {
    if (!dateFilter.isActive) return data;
    
    const startDate = new Date(dateFilter.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateFilter.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    return data.filter((item: any) => {
      // Try to get a date from various date fields
      let itemDate: Date | null = null;
      
      if (item.date) {
        itemDate = new Date(item.date);
      } else if (item.created_at) {
        itemDate = new Date(item.created_at);
      } else if (item.payment_date) {
        itemDate = new Date(item.payment_date);
      }
      
      // If no date field found or invalid date, skip filtering this item
      if (!itemDate || isNaN(itemDate.getTime())) return true;
      
      // Check if date is within range
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calculate filtered data using useMemo for efficiency
  const filteredPurchases = useMemo(() => applyDateFilter(purchases), [purchases, dateFilter]);
  const filteredStockHistory = useMemo(() => applyDateFilter(stockHistory), [stockHistory, dateFilter]);

  // Calculate totals using useMemo
  const totalPurchaseQty = useMemo(() => 
    filteredPurchases.reduce((sum, item) => sum + (item.purchase_qty || 0), 0), 
    [filteredPurchases]
  );

  const totalStockChangeQty = useMemo(() => 
    filteredStockHistory.reduce((sum, item) => sum + (item.change_qty || 0), 0), 
    [filteredStockHistory]
  );

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
              (activeTab === 'purchaseHistory' && isLoadingPurchases) || 
              (activeTab === 'stockHistory' && stockHistoryLoading) || 
              (activeTab === 'salonConsumption' && isLoadingConsumption)
            }
          >
            Refresh
          </Button>
          
          <Button 
            variant="contained" 
            color="success" 
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={isExporting || 
              (!purchases.length && !stockHistory.length && !consumptionData.length && !salonConsumptionData.length)
            }
          >
            {isExporting ? 'Exporting...' : 'Export All Tables (Combined)'}
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
        <Tab label="Salon Consumption" value="salonConsumption" />
        <Tab label="Sales History" value="salesHistory" />
        <Tab label="Balance Stock" value="stockHistory" />
      </Tabs>

      {activeTab === 'purchaseHistory' && errorPurchases && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorPurchases}</Alert>
      )}
      {activeTab === 'stockHistory' && stockHistoryError && (
        <Alert severity="error" sx={{ mb: 2 }}>{`Error loading stock history: ${stockHistoryError}`}</Alert>
      )}
      {activeTab === 'salonConsumption' && errorConsumption && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorConsumption}</Alert>
      )}

      {activeTab === 'purchaseHistory' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <Table stickyHeader aria-label="products purchase history table" sx={{ minWidth: 2200 }}>
              <TableHead>
                 <TableRow>
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
                   <StyledTableCell align="right">Taxable Value (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">IGST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">CGST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">SGST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Invoice Value (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Current Stock</StyledTableCell>
                   <StyledTableCell align="right">Total Taxable Value</StyledTableCell>
                   <StyledTableCell align="right">Total CGST</StyledTableCell>
                   <StyledTableCell align="right">Total SGST</StyledTableCell>
                   <StyledTableCell align="right">Total IGST</StyledTableCell>
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
                      // Use the stock_after_purchase directly from the purchase record
                      const stockAfterPurchaseDisplay = typeof purchase.stock_after_purchase === 'number' 
                        ? purchase.stock_after_purchase 
                        : '-'; // Display '-' if null or undefined

                      // Calculations for new columns (can remain largely the same, but should use data directly from purchase if possible)
                      let totalValueMRP = 0;
                      let totalCGST = 0;
                      let totalSGST = 0;
                      let totalIGST = 0; // Assuming local by default
                      const gstRate = purchase.gst_percentage ?? 18; // Default to 18% if not available

                      if (typeof purchase.stock_after_purchase === 'number' && purchase.stock_after_purchase > 0 && purchase.mrp_incl_gst && purchase.mrp_incl_gst > 0) {
                        totalValueMRP = purchase.stock_after_purchase * purchase.mrp_incl_gst;
                        // Calculate base value before GST
                        const baseValue = totalValueMRP / (1 + gstRate / 100);
                        // Calculate taxes based on purchase type (assuming purchase.purchase_igst indicates interstate)
                        if (purchase.purchase_igst && purchase.purchase_igst > 0) {
                           totalIGST = baseValue * (gstRate / 100);
                        } else {
                           totalCGST = baseValue * (gstRate / 200); // Half of GST rate
                           totalSGST = baseValue * (gstRate / 200); // Half of GST rate
                        }
                      }

                      return (
                        <TableRow key={purchase.purchase_id} hover>
                          <TableCell>{new Date(purchase.date).toLocaleDateString() || '-'}</TableCell>
                          <TableCell>{purchase.product_name}</TableCell>
                          <TableCell>{purchase.hsn_code || '-'}</TableCell>
                          <TableCell>{purchase.units || '-'}</TableCell>
                          <TableCell>{purchase.supplier || '-'}</TableCell>
                          <TableCell>{purchase.purchase_invoice_number || '-'}</TableCell>
                          <TableCell align="right">{purchase.purchase_qty ?? '-'}</TableCell>
                          <TableCell align="right">₹{purchase.mrp_incl_gst?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">₹{purchase.mrp_excl_gst?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="right">{purchase.discount_on_purchase_percentage?.toFixed(2) || '0.00'}%</TableCell>
                          <TableCell align="right">₹{(purchase.purchase_taxable_value && purchase.purchase_qty) ? (purchase.purchase_taxable_value / purchase.purchase_qty).toFixed(2) : '0.00'}</TableCell>
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
                          <TableCell align="center">
                            <IconButton color="primary" onClick={() => handleEdit(purchase)} title="Edit Purchase">
                              <EditIcon />
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

      {activeTab === 'stockHistory' && (
         <Paper sx={{ width: '100%', overflow: 'hidden' }}>
           <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
             <Table stickyHeader aria-label="stock history table" sx={{ minWidth: 1000 }}>
               <TableHead>
                 <TableRow>
                   <StyledTableCell>Serial No.</StyledTableCell>
                   <StyledTableCell>Date</StyledTableCell>
                   <StyledTableCell>Product Name</StyledTableCell>
                   <StyledTableCell>HSN Code</StyledTableCell>
                   <StyledTableCell>Units</StyledTableCell>
                   <StyledTableCell>Change Type</StyledTableCell>
                   <StyledTableCell>Source</StyledTableCell>
                   <StyledTableCell>Reference ID</StyledTableCell>
                   <StyledTableCell align="right">Quantity Change</StyledTableCell>
                   <StyledTableCell align="right">Quantity After Change</StyledTableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {stockHistoryLoading && (
                   <TableRow>
                     <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                       <CircularProgress size={40} />
                     </TableCell>
                   </TableRow>
                 )}
                 {!stockHistoryLoading && filteredStockHistory.length > 0 && (
                   filteredStockHistory
                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                     .map((item, index) => (
                       <TableRow key={item.id} hover>
                         <TableCell>{`SH-${(page * rowsPerPage + index + 1).toString().padStart(5, '0')}`}</TableCell>
                         <TableCell>{item.date ? new Date(item.date).toLocaleString() : '-'}</TableCell>
                         <TableCell>{item.product_name || '-'}</TableCell>
                         <TableCell>{item.hsn_code || '-'}</TableCell>
                         <TableCell>{item.units || '-'}</TableCell>
                         <TableCell>{item.change_type || '-'}</TableCell>
                         <TableCell>{item.source || '-'}</TableCell>
                         <TableCell>{item.reference_id || '-'}</TableCell>
                         <TableCell align="right">{item.change_qty ?? '-'}</TableCell>
                         <TableCell align="right">{item.stock_after ?? '-'}</TableCell>
                       </TableRow>
                     ))
                 )}
                 {!stockHistoryLoading && filteredStockHistory.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                       No stock history found {dateFilter.isActive ? 'for the selected dates' : ''}.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
           </TableContainer>
           <TablePagination
             rowsPerPageOptions={[10, 25, 100]}
             component="div"
             count={filteredStockHistory.length}
             rowsPerPage={rowsPerPage}
             page={page}
             onPageChange={handleChangePage}
             onRowsPerPageChange={handleChangeRowsPerPage}
             labelDisplayedRows={({ from, to, count }) => (
                <>
                  {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`} | Total Change Qty: `}
                  <Box component="span" sx={{ fontWeight: 'bold' }}>
                    {totalStockChangeQty.toLocaleString()}
                  </Box>
                </>
             )}
           />
         </Paper>
      )}

      {/* Sales History Tab */}
      {activeTab === 'salesHistory' && (
        <div style={{ display: activeTab === 'salesHistory' ? 'block' : 'none' }}>
          <SalesHistoryTab />
        </div>
      )}

      {/* Always render SalonConsumptionTab (but hide it) to ensure data is loaded */}
      <div style={{ display: activeTab === 'salonConsumption' ? 'block' : 'none' }}>
        <SalonConsumptionTab
          dateFilter={dateFilter}
          applyDateFilter={applyDateFilter}
        />
      </div>

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
              <TextField
                label="UNITS *"
                value={purchaseFormData.unit_type}
                fullWidth
                required
                InputProps={{ readOnly: true }}
                helperText="Auto-filled from Product Master"
              />
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