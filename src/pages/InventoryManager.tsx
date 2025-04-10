import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
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
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProducts, Product } from '../hooks/useProducts';
import { usePurchaseHistory, PurchaseTransaction } from '../hooks/usePurchaseHistory';
import { addPurchaseTransaction } from '../utils/inventoryUtils';
import { calculatePriceExcludingGST, calculatePriceBreakdown } from '../utils/gstCalculations';
import { initialFormData, ProductFormData } from '../data/formData';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';
import * as XLSX from 'xlsx';
import SalonConsumptionTab from './Inventory/SalonConsumptionTab';
import SalesHistoryTab from './Inventory/SalesHistoryTab';
import { toast } from 'react-hot-toast';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

// Define interfaces and initial data locally
interface BalanceStockItem {
  id: string;
  product_name: string;
  hsn_code: string;
  unit_type: string;
  units: string;
  balance_qty: number;
  mrp_per_unit_excl_gst: number;
  mrp_incl_gst: number;
  gst_percentage: number;
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

// Extend ProductFormData interface to include vendor
interface ExtendedProductFormData extends ProductFormData {
  // No additional fields needed anymore as they've been added to the base interface
}

// Extend initialFormData with new fields - no changes needed now
const extendedInitialFormData: ExtendedProductFormData = {
  ...initialFormData,
  // No need to override values as they're already in initialFormData
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
  const [activeTab, setActiveTab] = useState<'purchaseHistory' | 'balanceStock' | 'salonConsumption' | 'salesHistory'>('purchaseHistory');

  const [balanceStock, setBalanceStock] = useState<BalanceStockItem[]>([]);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);

  // State for directly fetched salon consumption data
  const [salonConsumptionData, setSalonConsumptionData] = useState<SalonConsumptionItem[]>([]);
  const [isLoadingConsumption, setIsLoadingConsumption] = useState<boolean>(true);
  const [errorConsumption, setErrorConsumption] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  // Function to initialize database tables
  const initializeDatabaseTables = useCallback(async () => {
    try {
      console.log('Initializing database tables...');
      // Remove the sales products table initialization since we're removing the sales history tab
      // const salesTableCreated = await createSalesProductsTable();
      // console.log(`Sales products table initialization: ${salesTableCreated ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }, []);

  // Initialize tables when component loads
  useEffect(() => {
    initializeDatabaseTables();
  }, [initializeDatabaseTables]);

  // Function to handle exporting data based on the active tab
  const handleExport = async () => {
    try {
      setIsExporting(true);
      let dataToExport: Array<PurchaseTransaction | BalanceStockItem | SalonConsumptionItem> = [];
      let fileName = "inventory_export";

      // Export different data based on active tab
      if (activeTab === 'purchaseHistory') {
        dataToExport = purchases;
        fileName = "purchase_history";
      } else if (activeTab === 'balanceStock') {
        dataToExport = balanceStock.map(item => {
          const values = calculateBalanceValues(item);
          return {
            ...item,
            taxable_value: values.taxableValue,
            igst: values.igst,
            cgst: values.cgst,
            sgst: values.sgst,
            total_value: values.invoiceValue
          };
        });
        fileName = "balance_stock";
      } else if (activeTab === 'salonConsumption') {
        dataToExport = salonConsumptionData;
        fileName = "salon_consumption";
      } else if (activeTab === 'salesHistory') {
        // Sales History export is handled by the SalesHistoryTab component directly
        toast.info('Please use the Export button in the Sales History tab');
        setIsExporting(false);
        return;
      }

      // Create worksheet from json data
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      
      // Generate xlsx file
      XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data. Please try again.");
    } finally {
      setIsExporting(false);
    }
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

  // Fetch consumption data when the tab is active or component mounts
  useEffect(() => {
    if (activeTab === 'salonConsumption') {
      fetchSalonConsumptionDirect();
      
      // Debug: Check if inventory_salon_consumption table exists
      const checkTable = async () => {
        try {
          // Check table existence using information_schema
          const { data: tableData, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public') 
            .eq('table_name', 'inventory_salon_consumption');
            
            console.log('🔍 DEBUG: inventory_salon_consumption table check:', { 
              success: !tableError,
              exists: tableData && tableData.length > 0,
              error: tableError ? tableError.message : null
            });

            // Check columns in the inventory_salon_consumption table
            if (tableData && tableData.length > 0) {
              const { data: columnData, error: columnError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type')
                .eq('table_schema', 'public')
                .eq('table_name', 'inventory_salon_consumption');
                
                console.log('🔍 DEBUG: inventory_salon_consumption columns:', { 
                  success: !columnError,
                  columns: columnData,
                  error: columnError ? columnError.message : null
                });
            }
        } catch (err) {
          console.error('Error in table check:', err);
        }
      };
      
      checkTable();
    }
  }, [activeTab, fetchSalonConsumptionDirect]);

  const handleTabChange = (event: ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue as 'purchaseHistory' | 'balanceStock' | 'salonConsumption' | 'salesHistory');
    setPage(0); // Reset to first page when changing tabs
    
    // Reset any form data if open
    if (open) {
      handleClose();
    }
    
    // Fetch data based on selected tab
    if (newValue === 'purchaseHistory') {
      fetchPurchases();
    } else if (newValue === 'balanceStock') {
      fetchBalanceStock();
    } else if (newValue === 'salonConsumption') {
      fetchSalonConsumptionDirect();
    }
  };

  // Fetch/Calculate Balance Stock derived from Product Master List
  const fetchBalanceStock = useCallback(() => {
    try {
      setBalanceLoading(true);
      const balanceItems: BalanceStockItem[] = productMasterList.map((product: Product) => ({
        id: product.id,
        product_name: product.name,
        hsn_code: product.hsn_code || '',
        units: product.units || '',
        unit_type: product.units || '',
        balance_qty: product.stock_quantity || 0,
        mrp_per_unit_excl_gst: calculatePriceExcludingGST(product.mrp_incl_gst || 0, product.gst_percentage || 0),
        mrp_incl_gst: product.mrp_incl_gst || 0,
        gst_percentage: product.gst_percentage || 0,
      }));

      setBalanceStock(balanceItems);
    } catch (error) {
      console.error("Error calculating balance stock:", error);
    } finally {
      setBalanceLoading(false);
    }
  }, [productMasterList]);

  useEffect(() => {
    // Initial fetch for balance stock derived from product master list
    if (productMasterList.length > 0) {
       fetchBalanceStock();
    }
  }, [productMasterList, fetchBalanceStock]);

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
    } else if (activeTab === 'balanceStock') {
      fetchBalanceStock();
    } else if (activeTab === 'salonConsumption') {
      fetchSalonConsumptionDirect();
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

  const calculateBalanceValues = (item: BalanceStockItem) => {
    const taxableValue = parseFloat(((item.balance_qty || 0) * (item.mrp_per_unit_excl_gst || 0)).toFixed(2));
    const gstRate = (item.gst_percentage || 0) / 100;
    const totalGST = parseFloat((taxableValue * gstRate).toFixed(2));
    const halfGST = parseFloat((totalGST / 2).toFixed(2));
    const invoiceValue = parseFloat((taxableValue + totalGST).toFixed(2));

    return {
      taxableValue,
      igst: 0,
      cgst: halfGST,
      sgst: halfGST,
      invoiceValue
    };
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h1">
          Inventory Manager
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={
              (activeTab === 'purchaseHistory' && isLoadingPurchases) || 
              (activeTab === 'balanceStock' && balanceLoading) || 
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
              (activeTab === 'purchaseHistory' && (!purchases.length || isLoadingPurchases)) || 
              (activeTab === 'balanceStock' && (!balanceStock.length || balanceLoading)) || 
              (activeTab === 'salonConsumption' && (!salonConsumptionData.length || isLoadingConsumption)) ||
              activeTab === 'salesHistory'
            }
          >
            Export All (.xlsx)
          </Button>
        </Box>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        indicatorColor="primary"
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Purchase History" value="purchaseHistory" />
        <Tab label="Balance Stock" value="balanceStock" />
        <Tab label="Sales History" value="salesHistory" />
        <Tab label="Salon Consumption" value="salonConsumption" />
      </Tabs>

      {activeTab === 'purchaseHistory' && errorPurchases && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorPurchases}</Alert>
      )}
      {activeTab === 'balanceStock' && errorProducts && (
        <Alert severity="error" sx={{ mb: 2 }}>{`Error loading product master: ${errorProducts}`}</Alert>
      )}
      {activeTab === 'salonConsumption' && errorConsumption && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorConsumption}</Alert>
      )}

      {activeTab === 'purchaseHistory' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <Table stickyHeader aria-label="products purchase history table" sx={{ minWidth: 1600 }}>
              <TableHead>
                 <TableRow>
                   <StyledTableCell>Date</StyledTableCell>
                   <StyledTableCell>Product Name</StyledTableCell>
                   <StyledTableCell>HSN Code</StyledTableCell>
                   <StyledTableCell>UNITS</StyledTableCell>
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
                   <StyledTableCell align="center">Actions</StyledTableCell>
                 </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingPurchases ? (
                  <TableRow>
                    <TableCell colSpan={17} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : purchases.length > 0 ? (
                  purchases
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((purchase) => (
                      <TableRow key={purchase.purchase_id} hover>
                        <TableCell>{new Date(purchase.date).toLocaleDateString() || '-'}</TableCell>
                        <TableCell>{purchase.product_name}</TableCell>
                        <TableCell>{purchase.hsn_code || '-'}</TableCell>
                        <TableCell>{purchase.units || '-'}</TableCell>
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
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleEdit(purchase)} title="Edit Purchase">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={17} align="center" sx={{ py: 3 }}>
                      No product purchases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={purchases.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {activeTab === 'balanceStock' && (
         <Paper sx={{ width: '100%', overflow: 'hidden' }}>
           <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
             <Table stickyHeader aria-label="balance stock table">
               <TableHead>
                 <TableRow>
                   <StyledTableCell>Serial No.</StyledTableCell>
                   <StyledTableCell>Product Name</StyledTableCell>
                   <StyledTableCell>HSN Code</StyledTableCell>
                   <StyledTableCell>UNITS</StyledTableCell>
                   <StyledTableCell align="right">Balance Qty.</StyledTableCell>
                   <StyledTableCell align="right">GST %</StyledTableCell>
                   <StyledTableCell align="right">Taxable Value (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">IGST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">CGST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">SGST (Rs.)</StyledTableCell>
                   <StyledTableCell align="right">Stock Value (Incl. GST) (Rs.)</StyledTableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {isLoadingProducts || balanceLoading ? (
                   <TableRow>
                     <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                       <CircularProgress size={40} />
                     </TableCell>
                   </TableRow>
                 ) : balanceStock.length > 0 ? (
                   <>
                     {balanceStock
                       .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                       .map((item, index) => {
                          const values = calculateBalanceValues(item);
                          return (
                             <TableRow key={item.id} hover>
                               <TableCell>{`BS-${String(index + 1 + page * rowsPerPage).padStart(4, '0')}`}</TableCell>
                               <TableCell>{item.product_name}</TableCell>
                               <TableCell>{item.hsn_code}</TableCell>
                               <TableCell>{item.units}</TableCell>
                               <TableCell align="right">{item.balance_qty}</TableCell>
                               <TableCell align="right">{item.gst_percentage.toFixed(2)}%</TableCell>
                               <TableCell align="right">₹{values.taxableValue.toFixed(2)}</TableCell>
                               <TableCell align="right">{values.igst > 0 ? `₹${values.igst.toFixed(2)}` : "-"}</TableCell>
                               <TableCell align="right">₹{values.cgst.toFixed(2)}</TableCell>
                               <TableCell align="right">₹{values.sgst.toFixed(2)}</TableCell>
                               <TableCell align="right">₹{values.invoiceValue.toFixed(2)}</TableCell>
                             </TableRow>
                          );
                       })}
                       {balanceStock.length > 0 && (
                           <TableRow sx={{
                               backgroundColor: 'rgba(76, 175, 80, 0.08)',
                               '& > td': { borderTop: '1px solid rgba(224, 224, 224, 1)', fontWeight: 'bold' }
                           }}>
                               <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>Total (Current Page)</TableCell>
                               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                   {balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + (item.balance_qty || 0), 0)}
                               </TableCell>
                               <TableCell sx={{ fontWeight: 'bold' }}>{/* GST % Total Empty */}</TableCell>
                               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                   ₹{balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + calculateBalanceValues(item).taxableValue, 0).toFixed(2)}
                               </TableCell>
                               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                   {balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + calculateBalanceValues(item).igst, 0) > 0 ? `₹${balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + calculateBalanceValues(item).igst, 0).toFixed(2)}` : '-'}
                               </TableCell>
                               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                   ₹{balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + calculateBalanceValues(item).cgst, 0).toFixed(2)}
                               </TableCell>
                               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                   ₹{balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + calculateBalanceValues(item).sgst, 0).toFixed(2)}
                               </TableCell>
                               <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                   ₹{balanceStock.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).reduce((sum, item) => sum + calculateBalanceValues(item).invoiceValue, 0).toFixed(2)}
                               </TableCell>
                           </TableRow>
                       )}
                   </>
                 ) : (
                   <TableRow>
                     <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                       No balance stock data available.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
           </TableContainer>
           <TablePagination
             rowsPerPageOptions={[5, 10, 25]}
             component="div"
             count={balanceStock.length}
             rowsPerPage={rowsPerPage}
             page={page}
             onPageChange={handleChangePage}
             onRowsPerPageChange={handleChangeRowsPerPage}
           />
         </Paper>
      )}

      {activeTab === 'salesHistory' && (
        <SalesHistoryTab />
      )}

      {activeTab === 'salonConsumption' && (
        <SalonConsumptionTab />
      )}

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