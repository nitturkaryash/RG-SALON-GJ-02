import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  TablePagination,
  Tooltip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Refresh as RefreshIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Purchase, PurchaseFormState, Product } from '../../models/inventoryTypes';
import { useInventory } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import { toast } from 'react-toastify';
import { formatCurrency, formatDateKolkata, formatAsiaKolkataTime } from '../../utils/formatters';
import { downloadCsv } from '../../utils/csvExporter';
import { fetchProductsWithStock } from '../../utils/inventoryHelpers';
import { supabase, handleSupabaseError } from '../../utils/supabase/supabaseClient';

interface PurchaseTabProps {
  purchases: Purchase[];
  isLoading: boolean;
  error: Error | null;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

const PurchaseTab: React.FC<PurchaseTabProps> = ({ purchases, isLoading, error }) => {
  const { createPurchase, isCreatingPurchase, deletePurchase } = useInventory();
  const { fetchProducts, addProduct } = useProducts();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [existingProducts, setExistingProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [formState, setFormState] = useState<PurchaseFormState>({
    date: new Date().toISOString().split('T')[0],
    product_name: '',
    hsn_code: '',
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
    purchase_excl_gst: 0,
    vendor: '',
    is_interstate: false
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PurchaseFormState, string>>>({});
  const [exportingCSV, setExportingCSV] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingProducts(true);
      setIsLoadingProductTypes(true);

      try {
        const productsData = await fetchProductsWithStock();
        if (productsData && Array.isArray(productsData)) {
          console.log(`Loaded ${productsData.length} products for product name dropdown`);
          setExistingProducts(productsData.map((p) => ({
            id: p.id,
            name: p.name,
            hsn_code: p.hsn_code || '',
            units: p.units || '',
            mrp: p.price || 0,
            gst: p.gst_percentage || 18
          })));
        } else {
          console.warn('No products returned from fetchProductsWithStock for product name dropdown');
          setExistingProducts([]);
        }
      } catch (error) {
        console.error('Error loading existing products:', error);
        toast.error('Failed to load existing products for dropdown.');
        setExistingProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }

      try {
        const { data: productTypeData, error: productTypeError } = await supabase
          .from('products')
          .select('product_type');

        if (productTypeError) {
          throw handleSupabaseError(productTypeError, 'fetching product types');
        }

        if (productTypeData) {
          const distinctTypes = Array.from(new Set(productTypeData.map(item => item.product_type).filter(pt => pt && pt.trim() !== '')))
            .sort();
          console.log(`Loaded ${distinctTypes.length} distinct product types for units dropdown:`, distinctTypes);
          setProductTypes(distinctTypes.length > 0 ? distinctTypes : ['pcs', 'bottles', 'units']);
        } else {
          setProductTypes(['pcs', 'bottles', 'units']);
        }
      } catch (error) {
        console.error('Error fetching product types:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load product types for units dropdown.');
        setProductTypes(['pcs', 'bottles', 'units']);
      } finally {
        setIsLoadingProductTypes(false);
      }
    };

    loadInitialData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const numericFields = ['purchase_qty', 'mrp_incl_gst', 'discount_on_purchase_percentage', 'gst_percentage'];
    let newValue: string | number = value;

    if (numericFields.includes(name)) {
      newValue = parseFloat(value);
      if (isNaN(newValue as number)) {
        newValue = 0;
      }
    }
    
    setFormState(prevState => ({
      ...prevState,
      [name]: newValue
    }));
    
    if (formErrors[name as keyof PurchaseFormState]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name as string]: value
    }));
    if (formErrors[name as keyof PurchaseFormState]) {
      setFormErrors(prev => ({
        ...prev,
        [name as string]: undefined
      }));
    }
  };

  const handleProductChange = (event: React.SyntheticEvent, product: any | null) => {
    if (product) {
      setFormState(prevState => ({
        ...prevState,
        product_name: product.name,
        hsn_code: product.hsn_code || '',
        unit_type: product.unit_type || '',
        mrp_incl_gst: product.mrp || 0,
        gst_percentage: product.gst || 18
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PurchaseFormState, string>> = {};
    
    if (!formState.product_name) errors.product_name = 'Product name is required';
    if (!formState.hsn_code) errors.hsn_code = 'HSN code is required';
    if (!formState.unit_type) errors.unit_type = 'Unit type is required';
    if (!formState.purchase_invoice_number) errors.purchase_invoice_number = 'Invoice number is required';
    if (!formState.purchase_qty || formState.purchase_qty <= 0) errors.purchase_qty = 'Quantity must be greater than 0';
    if (!formState.mrp_incl_gst || formState.mrp_incl_gst <= 0) errors.mrp_incl_gst = 'MRP must be greater than 0';
    if (formState.gst_percentage < 0) errors.gst_percentage = 'GST percentage cannot be negative';
    if (formState.discount_on_purchase_percentage < 0 || formState.discount_on_purchase_percentage > 100) {
      errors.discount_on_purchase_percentage = 'Discount must be between 0 and 100%';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const productExists = (productName: string): boolean => {
    if (!productName) return false;
    
    const normalizedName = productName.trim().toLowerCase();
    const exists = existingProducts.some(p => 
      p.name.toLowerCase() === normalizedName
    );
    
    console.log(`Checking if product "${productName}" exists:`, exists);
    return exists;
  };

  const addProductToCatalog = async (productData: {
    name: string;
    hsn_code: string;
    units: string;
    price: number;
  }) => {
    try {
      console.log('Adding product to catalog:', productData);
      
      const gstPercentage = formState.gst_percentage || 18;
      const mrp_excl_gst = productData.price / (1 + (gstPercentage / 100));
      
      const result = await addProduct({
        product_name: productData.name,
        hsn_code: productData.hsn_code,
        unit_type: productData.units,
        mrp_incl_gst: productData.price,
        gst_percentage: gstPercentage,
        discount_on_purchase_percentage: formState.discount_on_purchase_percentage || 0,
        status: 'active',
        stock_quantity: formState.purchase_qty || 0,
      });
      
      if (!result.success) {
        console.error('Failed to add product to catalog:', result.error);
        toast.error('Failed to add product to catalog');
        return false;
      }
      
      toast.success('New product added to catalog');
      
      const updatedProducts = await fetchProductsWithStock();
      
      if (updatedProducts && Array.isArray(updatedProducts)) {
        setExistingProducts(updatedProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          hsn_code: p.hsn_code || '',
          units: p.units || '',
          mrp: p.price || 0,
          gst: p.gst_percentage || 18
        })));
      } else {
        console.log('No products returned from fetchProductsWithStock');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding product to catalog:', error);
      toast.error('Failed to add product to catalog');
      return false;
    }
  };

  const createProductManually = async () => {
    try {
      if (!formState.product_name || !formState.hsn_code || !formState.unit_type) {
        toast.error('Please fill in Product Name, HSN Code, and Units');
        return null;
      }
      
      const newProduct = {
        id: `manual-${Date.now()}`,
        name: formState.product_name,
        hsn_code: formState.hsn_code,
        units: formState.unit_type,
        mrp: formState.mrp_incl_gst,
        gst: formState.gst_percentage,
        stock: formState.purchase_qty
      };
      
      setExistingProducts(prev => [newProduct, ...prev]);
      
      toast.success('Product added locally. Database will be updated when connection is restored.');
      return newProduct;
    } catch (error) {
      console.error('Error creating product manually:', error);
      toast.error('Failed to create product');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Calculate taxable value and Purchase Cost/Unit (Ex.GST) first
      const taxableValue = 
        (formState.mrp_incl_gst * formState.purchase_qty) / 
        (1 + (formState.gst_percentage / 100)) * 
        (1 - (formState.discount_on_purchase_percentage / 100));
      
      const purchaseCostPerUnitExGst = formState.purchase_qty > 0 ? taxableValue / formState.purchase_qty : 0;
      
      let existingProduct = existingProducts.find(p => 
        p.name.toLowerCase() === formState.product_name.toLowerCase()
      );
      
      if (!existingProduct) {
        console.log('Product does not exist, adding to catalog:', formState.product_name);
        
        let addSuccess = false;
        try {
          addSuccess = await addProductToCatalog({
            name: formState.product_name,
            hsn_code: formState.hsn_code,
            units: formState.unit_type,
            price: formState.mrp_incl_gst,
          });
        } catch (error) {
          console.error('Error adding product to catalog:', error);
          addSuccess = false;
        }
        
        if (!addSuccess) {
          console.log('Failed to add to catalog, creating manually');
          existingProduct = await createProductManually();
          if (!existingProduct) {
            toast.error('Failed to create product. Please try again.');
            return;
          }
        }
      } else {
        console.log('Product already exists in catalog:', formState.product_name);
        
        try {
          const { data, error } = await supabase
            .from('inventory_products')
            .select('product_id, stock_quantity')
            .eq('product_name', formState.product_name)
            .single();
          
          if (!error && data) {
            console.log('Updating product stock:', data.product_id, 'Current stock:', data.stock_quantity);
            
            const newStockQty = (data.stock_quantity || 0) + formState.purchase_qty;
            
            // Update inventory products
            const { error: updateError } = await supabase
              .from('inventory_products')
              .update({ 
                stock_quantity: newStockQty,
                updated_at: new Date().toISOString()
              })
              .eq('product_id', data.product_id);
              
            if (updateError) {
              console.error('Error updating product stock:', updateError);
            } else {
              console.log('Product stock updated to:', newStockQty);
              
              // Update purchase history with stock
              const { error: historyUpdateError } = await supabase
                .from('purchase_history_with_stock')
                .update({
                  purchase_qty: formState.purchase_qty,
                  mrp_incl_gst: formState.mrp_incl_gst,
                  mrp_excl_gst: formState.mrp_excl_gst,
                  discount_on_purchase_percentage: formState.discount_on_purchase_percentage,
                  gst_percentage: formState.gst_percentage,
                  purchase_taxable_value: formState.purchase_cost_taxable_value,
                  purchase_igst: formState.purchase_igst,
                  purchase_cgst: formState.purchase_cgst,
                  purchase_sgst: formState.purchase_sgst,
                  purchase_invoice_value_rs: formState.purchase_invoice_value,
                  tax_inlcuding_disc: parseFloat(purchaseCostPerUnitExGst.toFixed(2)),
                  updated_at: new Date().toISOString()
                })
                .eq('product_id', data.product_id)
                .eq('purchase_invoice_number', formState.purchase_invoice_number);
                
              if (historyUpdateError) {
                console.error('Error updating purchase history:', historyUpdateError);
              } else {
                console.log('Purchase history updated successfully');
              }
            }
          }
        } catch (err) {
          console.error('Error checking/updating product stock:', err);
        }
      }
      
      const totalGstAmount = taxableValue * (formState.gst_percentage / 100);
      const cgstAmount = totalGstAmount / 2;
      const sgstAmount = totalGstAmount / 2;
      
      const updatedFormState = {
        ...formState,
        purchase_cost_taxable_value: parseFloat(taxableValue.toFixed(2)),
        purchase_cgst: parseFloat(cgstAmount.toFixed(2)),
        purchase_sgst: parseFloat(sgstAmount.toFixed(2)),
        purchase_invoice_value: parseFloat((taxableValue + totalGstAmount).toFixed(2)),
        tax_inlcuding_disc: parseFloat(purchaseCostPerUnitExGst.toFixed(2)),
        invoice_no: formState.purchase_invoice_number
      };
      
      console.log('Creating purchase record with data:', updatedFormState);
      
      await createPurchase(updatedFormState);
      
      toast.success('Purchase added successfully');
      
      // Refresh the purchases data
      await fetchPurchases();
      
      setFormState({
        date: new Date().toISOString().split('T')[0],
        product_name: '',
        hsn_code: '',
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
        purchase_excl_gst: 0,
        vendor: '',
        is_interstate: false
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error('Failed to add purchase. Please try again.');
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      return formatDateKolkata(dateStr);
    } catch (e) {
      return dateStr;
    }
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        name: '',
        quantity: 1,
        price: 0,
        units: 'pcs',
        hsn_code: '',
        gst: 0,
        mrp: 0,
        amount: 0
      }
    ]);
  };

  const handleProductChangeInTable = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };

    if (field === 'quantity' || field === 'price') {
      updatedProducts[index].amount =
        updatedProducts[index].quantity * updatedProducts[index].price;
    }

    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.amount, 0);
  };

  const handleSubmitTable = async (productData: any) => {
    try {
      await addProduct({
        product_name: productData.name,
        hsn_code: productData.hsn_code || '',
        unit_type: productData.units || '',
        mrp_incl_gst: productData.mrp || 0,
        gst_percentage: productData.gst || 0,
        discount_on_purchase_percentage: 0
      });

      toast.success('Product added to inventory successfully');
      
      const updatedProductsData = await fetchProducts();
      if (updatedProductsData && Array.isArray(updatedProductsData)) {
        setExistingProducts(updatedProductsData.map((p) => ({
          id: p.id,
          name: p.product_name || '',
          hsn: p.hsn_code || '',
          units: p.unit_type || '',
          mrp: p.mrp_incl_gst || 0,
          gst: p.gst_percentage || 0
        })));
      }
      
      handleClose();
    } catch (error) {
      console.error('Error adding product to inventory:', error);
      toast.error('Failed to add product to inventory');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const exportToCSV = () => {
    try {
      setExportingCSV(true);
      
      const csvData = purchases.map(purchase => ({
        'Date': formatDateKolkata(purchase.date, false),
        'Product Name': purchase.product_name || '',
        'HSN Code': purchase.hsn_code || '',
        'Units': purchase.units || '',
        'Invoice Number': purchase.invoice_no || '',
        'Quantity': purchase.purchase_qty || 0,
        'MRP (Incl. GST)': purchase.mrp_incl_gst || 0,
        'MRP (Excl. GST)': purchase.mrp_excl_gst || 0,
        'Discount %': purchase.discount_on_purchase_percentage || 0,
        'Cost/Unit (Excl. GST)': purchase.purchase_cost_per_unit_ex_gst || 0,
        'GST %': purchase.gst_percentage || 0,
        'Total': purchase.total_cost || 0,
        'Vendor': purchase.vendor_name || ''
      }));
      
      const csvString = convertToCSV(csvData);
      downloadCSV(csvString, `Purchases_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting purchases to CSV:', error);
      alert('Failed to export purchases to CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  const renderPurchaseTable = () => {
    const groupedByInvoice = purchases.reduce((acc, item) => {
      const invoiceId = item.purchase_invoice_number || item.invoice_no || 'Unknown Invoice';
      if (!acc[invoiceId]) {
        acc[invoiceId] = {
          date: item.date,
          products: {}
        };
      }
      
      const productKey = item.product_name || 'Unknown Product';
      if (!acc[invoiceId].products[productKey]) {
        acc[invoiceId].products[productKey] = {
          ...item,
          purchase_qty: 0,
          purchase_taxable_value: 0,
          purchase_igst: 0,
          purchase_cgst: 0,
          purchase_sgst: 0,
          purchase_invoice_value_rs: 0,
          discount_on_purchase_percentage: item.discount_on_purchase_percentage || 0
        };
      }
      
      const record = acc[invoiceId].products[productKey];
      record.purchase_qty += parseFloat(item.purchase_qty || '0');
      record.purchase_taxable_value += parseFloat(item.purchase_taxable_value || '0');
      record.purchase_igst += parseFloat(item.purchase_igst || '0');
      record.purchase_cgst += parseFloat(item.purchase_cgst || '0');
      record.purchase_sgst += parseFloat(item.purchase_sgst || '0');
      record.purchase_invoice_value_rs += parseFloat(item.purchase_invoice_value_rs || '0');
      if (record.discount_on_purchase_percentage === 0) {
        record.discount_on_purchase_percentage = item.discount_on_purchase_percentage || 0;
      }
      
      return acc;
    }, {});

    const aggregatedRecords = Object.entries(groupedByInvoice)
      .sort(([, a], [, b]) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (aggregatedRecords.length === 0) {
      return (
        <Alert severity="info">No purchase records found.</Alert>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="purchases table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Invoice Details</StyledTableCell>
              <StyledTableCell>Product Name</StyledTableCell>
              <StyledTableCell>HSN Code</StyledTableCell>
              <StyledTableCell>Units</StyledTableCell>
              <StyledTableCell align="right">Qty</StyledTableCell>
              <StyledTableCell align="right">MRP (Incl. GST)</StyledTableCell>
              <StyledTableCell align="right">Discount %</StyledTableCell>
              <StyledTableCell align="right">GST %</StyledTableCell>
              <StyledTableCell align="right">Taxable Value</StyledTableCell>
              <StyledTableCell align="right">IGST</StyledTableCell>
              <StyledTableCell align="right">CGST</StyledTableCell>
              <StyledTableCell align="right">SGST</StyledTableCell>
              <StyledTableCell align="right">Invoice Value</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aggregatedRecords.map(([invoiceId, invoiceData]) => {
              const productEntries = Object.entries(invoiceData.products);
              return productEntries.map(([productName, item]: [string, any], index) => (
                <TableRow 
                  key={`${invoiceId}-${productName}`}
                  sx={index === 0 ? { borderTop: 2, borderColor: 'divider' } : {}}
                >
                  {index === 0 && (
                    <TableCell 
                      sx={{ 
                        whiteSpace: 'nowrap',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        borderRight: 1,
                        borderColor: 'divider'
                      }}
                      rowSpan={productEntries.length}
                    >
                      <Box>
                        <Typography variant="subtitle2" color="primary">
                          Invoice: {invoiceId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Date: {formatDate(invoiceData.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Products: {productEntries.length}
                        </Typography>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AddIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="body2">
                        {productName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.hsn_code}</TableCell>
                  <TableCell>{item.units}</TableCell>
                  <TableCell align="right">{item.purchase_qty.toFixed(2)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.mrp_incl_gst || 0)}</TableCell>
                  <TableCell align="right">{(item.discount_on_purchase_percentage || 0).toFixed(2)}%</TableCell>
                  <TableCell align="right">{(item.gst_percentage || 18).toFixed(2)}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.purchase_taxable_value)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.purchase_igst)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.purchase_cgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.purchase_sgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.purchase_invoice_value_rs)}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={Object.keys(groupedByInvoice).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    );
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this purchase record?')) {
        return;
      }
      
      await deletePurchase(id);
      toast.success('Purchase record deleted successfully');
      
      fetchPurchases();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Failed to delete purchase record');
    }
  };

  const fetchPurchases = async () => {
    try {
      await purchasesQuery.refetch();
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('inventory_products')
        .select('product_id')
        .limit(1);
        
      if (error) {
        console.error('Database connectivity test failed:', error);
        toast.error(`Connection Error: ${error.message}`);
        return false;
      }
      
      console.log('Database connectivity test succeeded!', data);
      toast.success('Successfully connected to Supabase!');
      
      const productsData = await fetchProductsWithStock();
      if (productsData && Array.isArray(productsData)) {
        console.log(`Loaded ${productsData.length} products for dropdown`);
        setExistingProducts(productsData.map((p) => ({
          id: p.id,
          name: p.name,
          hsn_code: p.hsn_code || '',
          units: p.units || '',
          mrp: p.price || 0,
          gst: p.gst_percentage || 18
        })));
      }
      
      return true;
    } catch (err) {
      console.error('Error testing database connection:', err);
      toast.error('Failed to connect to database');
      return false;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 2 }}>
        <Typography variant="h6">Purchases</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={testDatabaseConnection}
            color="primary"
          >
            Test Connection
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isLoading}
          >
            Sync from POS
          </Button>
          <Button
            variant="contained"
            startIcon={exportingCSV ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
            onClick={exportToCSV}
            disabled={isLoading || exportingCSV || purchases.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Add New Purchase / Product
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Date"
                type="date"
                name="date"
                value={formState.date}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={existingProducts}
                getOptionLabel={(option) => option.name}
                loading={isLoadingProducts}
                onChange={handleProductChange}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <strong>{option.name}</strong>
                      {option.hsn_code && <div style={{ fontSize: '0.8rem' }}>HSN: {option.hsn_code}</div>}
                      {option.units && <div style={{ fontSize: '0.8rem' }}>Unit: {option.units}</div>}
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product Name"
                    name="product_name"
                    value={formState.product_name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!formErrors.product_name}
                    helperText={formErrors.product_name || (existingProducts.length === 0 && !isLoadingProducts ? "No products available. Please add products first." : "")}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="HSN Code"
                name="hsn_code"
                value={formState.hsn_code}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.hsn_code}
                helperText={formErrors.hsn_code}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth error={!!formErrors.unit_type} required>
                <InputLabel id="units-select-label">Units *</InputLabel>
                <Select
                  labelId="units-select-label"
                  id="units-select"
                  name="unit_type"
                  value={formState.unit_type}
                  label="Units *"
                  onChange={handleSelectChange}
                  disabled={!!formState.product_name && existingProducts.some(p => p.name === formState.product_name && p.units)}
                >
                  {isLoadingProductTypes ? (
                    <MenuItem value="" disabled><em>Loading...</em></MenuItem>
                  ) : productTypes.length > 0 ? (
                    productTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled><em>Setup in Product Master</em></MenuItem>
                  )}
                </Select>
                {(formErrors.unit_type || (!!formState.product_name && existingProducts.some(p => p.name === formState.product_name && p.units) && "Auto-filled")) &&
                  <FormHelperText>{formErrors.unit_type || "Auto-filled from selected product"}</FormHelperText>
                }
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Purchase Invoice Number"
                name="purchase_invoice_number"
                value={formState.purchase_invoice_number}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_invoice_number}
                helperText={formErrors.purchase_invoice_number}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Purchase Quantity"
                name="purchase_qty"
                type="number"
                value={formState.purchase_qty}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_qty}
                helperText={formErrors.purchase_qty}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="MRP (Incl. GST)"
                name="mrp_incl_gst"
                type="number"
                value={formState.mrp_incl_gst}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.mrp_incl_gst}
                helperText={formErrors.mrp_incl_gst}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Discount on Purchase (%)"
                name="discount_on_purchase_percentage"
                type="number"
                value={formState.discount_on_purchase_percentage}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.discount_on_purchase_percentage}
                helperText={formErrors.discount_on_purchase_percentage}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="GST Percentage"
                name="gst_percentage"
                type="number"
                value={formState.gst_percentage}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.gst_percentage}
                helperText={formErrors.gst_percentage}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Taxable Value (Rs.)"
                name="purchase_cost_taxable_value"
                type="number"
                value={formState.purchase_cost_taxable_value}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_cost_taxable_value}
                helperText={formErrors.purchase_cost_taxable_value}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Purchase IGST (Rs.)"
                name="purchase_igst"
                type="number"
                value={formState.purchase_igst}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_igst}
                helperText={formErrors.purchase_igst}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Purchase CGST (Rs.)"
                name="purchase_cgst"
                type="number"
                value={formState.purchase_cgst}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_cgst}
                helperText={formErrors.purchase_cgst}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Purchase SGST (Rs.)"
                name="purchase_sgst"
                type="number"
                value={formState.purchase_sgst}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_sgst}
                helperText={formErrors.purchase_sgst}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Purchase Invoice Value (Rs.)"
                name="purchase_invoice_value"
                type="number"
                value={formState.purchase_invoice_value}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={!!formErrors.purchase_invoice_value}
                helperText={formErrors.purchase_invoice_value}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isCreatingPurchase}
                startIcon={isCreatingPurchase ? <CircularProgress size={20} /> : <AddIcon />}
                sx={{ mt: 2 }}
              >
                {isCreatingPurchase ? 'Adding...' : 'Add Purchase / Product'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Recent Purchases
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}
      
      {renderPurchaseTable()}
    </Box>
  );
};

export default PurchaseTab; 