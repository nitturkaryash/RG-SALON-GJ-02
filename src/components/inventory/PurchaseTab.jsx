import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
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
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useInventory } from '../../hooks/useInventory';
import { cleanPurchaseData } from './cleanMockData';
import DatabaseSaveIndicator from './DatabaseSaveIndicator';

// Function to get all products from localStorage
const getAllProducts = () => {
  // No more dummy data, returning empty array
  // This will be populated from the props which come from Supabase via parent component
  return [];
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

// Update the form layout for better spacing
function PurchaseForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product_name: '',
    hsn_code: '',
    units: '',
    invoice_no: '',
    purchase_qty: 1,
    mrp_incl_gst: 0,
    mrp_excl_gst: 0,
    discount_on_purchase_percentage: 0,
    purchase_cost_per_unit_ex_gst: 0,
    gst_percentage: 18,
    purchase_taxable_value: 0,
    purchase_igst: 0,
    purchase_cgst: 0,
    purchase_sgst: 0,
    purchase_invoice_value_rs: 0,
    vendor_name: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [productOptions, setProductOptions] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Reset form when the reset-purchase-form event is triggered
  useEffect(() => {
    const resetForm = () => {
      console.log('Resetting purchase form');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        product_name: '',
        hsn_code: '',
        units: '',
        invoice_no: '',
        purchase_qty: 1,
        mrp_incl_gst: 0,
        mrp_excl_gst: 0,
        discount_on_purchase_percentage: 0,
        purchase_cost_per_unit_ex_gst: 0,
        gst_percentage: 18,
        purchase_taxable_value: 0,
        purchase_igst: 0,
        purchase_cgst: 0,
        purchase_sgst: 0,
        purchase_invoice_value_rs: 0,
        vendor_name: '',
      });
      setFormErrors({});
    };

    // Add event listener
    window.addEventListener('reset-purchase-form', resetForm);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('reset-purchase-form', resetForm);
    };
  }, []);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Loading products from Supabase');
        setIsLoadingProducts(true);

        // Import supabase client
        const { supabase } = await import(
          '../../utils/supabase/supabaseClient'
        );

        // Debug which tables exist
        try {
          const { data: tables, error: tablesError } = await supabase
            .from('product_collections')
            .select('id')
            .limit(1);

          if (!tablesError && tables) {
            console.log('Connected to database successfully');
          }
        } catch (e) {
          console.warn('Could not check database connection:', e);
        }

        // Try to fetch from both product tables with explicit debugging
        console.log('Fetching from inventory_products and products tables...');
        const [inventoryProductsResult, productCollectionsResult] =
          await Promise.all([
            // 1. Fetch from inventory_products table
            supabase
              .from('inventory_products')
              .select('*')
              .order('product_name', { ascending: true }),

            // 2. Fetch from the product collections table
            supabase
              .from('products')
              .select('*')
              .order('name', { ascending: true }),
          ]);

        console.log(
          'inventory_products result:',
          inventoryProductsResult.error
            ? 'Error: ' + JSON.stringify(inventoryProductsResult.error)
            : `Success: ${inventoryProductsResult.data?.length || 0} products`
        );

        console.log(
          'products result:',
          productCollectionsResult.error
            ? 'Error: ' + JSON.stringify(productCollectionsResult.error)
            : `Success: ${productCollectionsResult.data?.length || 0} products`
        );

        // Process results from both queries
        let allProducts = [];

        // Process inventory products
        if (!inventoryProductsResult.error && inventoryProductsResult.data) {
          const inventoryProducts = inventoryProductsResult.data.map(
            product => ({
              label: product.product_name,
              value: product.product_id,
              product: {
                product_name: product.product_name,
                hsn_code: product.hsn_code || '',
                unit_type: product.units || '',
                mrp_incl_gst: product.mrp_incl_gst || 0,
                gst_percentage: product.gst_percentage || 18,
                discount_on_purchase_percentage: 0,
              },
            })
          );
          allProducts = [...allProducts, ...inventoryProducts];
        } else if (inventoryProductsResult.error) {
          console.warn(
            'Error fetching inventory products:',
            inventoryProductsResult.error
          );
        }

        // Process product collections
        if (!productCollectionsResult.error && productCollectionsResult.data) {
          const collectionProducts = productCollectionsResult.data.map(
            product => ({
              label: product.name || product.product_name,
              value: product.id || product.product_id,
              product: {
                product_name: product.name || product.product_name,
                hsn_code: product.hsn_code || '',
                unit_type: product.unit_type || product.units || 'pcs',
                mrp_incl_gst: product.price || product.mrp_incl_gst || 0,
                gst_percentage: product.gst_percentage || 18,
                discount_on_purchase_percentage: 0,
              },
            })
          );
          allProducts = [...allProducts, ...collectionProducts];
        } else if (productCollectionsResult.error) {
          console.warn(
            'Error fetching product collections:',
            productCollectionsResult.error
          );
        }

        // If no products found in either table, try one more approach
        if (allProducts.length === 0) {
          console.log('Trying to fetch from all tables...');
          // Query all tables to find product tables
          const { data: tables, error: tablesError } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .ilike('tablename', '%product%');

          if (!tablesError && tables && tables.length > 0) {
            console.log('Found potential product tables:', tables);

            // Try each product-related table
            for (const tableInfo of tables) {
              const tableName = tableInfo.tablename;
              try {
                const { data, error } = await supabase
                  .from(tableName)
                  .select('*')
                  .limit(100);

                if (!error && data && data.length > 0) {
                  console.log(
                    `Found products in table ${tableName}:`,
                    data.length
                  );

                  // Try to extract product information from this table
                  const tableProducts = data
                    .map(item => {
                      // Try to determine product name field
                      const productName =
                        item.product_name || item.name || item.title || '';
                      if (!productName) return null;

                      return {
                        label: productName,
                        value: item.id || item.product_id || '',
                        product: {
                          product_name: productName,
                          hsn_code: item.hsn_code || '',
                          unit_type: item.units || item.unit_type || 'pcs',
                          mrp_incl_gst: parseFloat(
                            item.price || item.mrp_incl_gst || 0
                          ),
                          gst_percentage: parseFloat(item.gst_percentage || 18),
                          discount_on_purchase_percentage: 0,
                        },
                      };
                    })
                    .filter(Boolean);

                  allProducts = [...allProducts, ...tableProducts];
                }
              } catch (err) {
                console.warn('Error querying table ' + tableName + ':', err);
              }
            }
          }
        }

        // Remove duplicates based on product name
        const uniqueProducts = [];
        const productNames = new Set();

        for (const product of allProducts) {
          if (!productNames.has(product.label)) {
            productNames.add(product.label);
            uniqueProducts.push(product);
          }
        }

        if (uniqueProducts.length > 0) {
          console.log('Loaded products:', uniqueProducts.length);
          setProductOptions(uniqueProducts);
        } else {
          console.log('No products found in any table');
          setProductOptions([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductSelect = (value, option) => {
    if (!option?.product) return;

    const product = option.product;

    // Update form with product data
    const updatedFormData = {
      ...formData,
      product_name: product.product_name,
      hsn_code: product.hsn_code,
      units: product.unit_type,
      mrp_incl_gst: product.mrp_incl_gst,
      gst_percentage: product.gst_percentage,
      discount_on_purchase_percentage: product.discount_on_purchase_percentage,
    };

    // Recalculate derived values
    handleCalculatedValues(updatedFormData);
  };

  const handleCalculatedValues = updatedData => {
    // Calculate MRP excluding GST
    const gstPercentage = updatedData.gst_percentage;
    const mrpInclGst = updatedData.mrp_incl_gst;

    // Calculate MRP excluding GST = MRP including GST / (1 + GST%)
    updatedData.mrp_excl_gst =
      gstPercentage > 0
        ? parseFloat((mrpInclGst / (1 + gstPercentage / 100)).toFixed(2))
        : mrpInclGst;

    // Calculate purchase cost per unit after discount
    const discountPercentage = updatedData.discount_on_purchase_percentage;
    // This is the price after applying discount to MRP excluding GST
    updatedData.purchase_cost_per_unit_ex_gst = parseFloat(
      (updatedData.mrp_excl_gst * (1 - discountPercentage / 100)).toFixed(2)
    );

    // Calculate taxable value = purchase cost per unit * quantity
    updatedData.purchase_taxable_value = parseFloat(
      (
        updatedData.purchase_cost_per_unit_ex_gst * updatedData.purchase_qty
      ).toFixed(2)
    );

    // Calculate GST components
    const gstAmount = parseFloat(
      (updatedData.purchase_taxable_value * (gstPercentage / 100)).toFixed(2)
    );

    // For simplicity, split between CGST and SGST evenly if not IGST
    // In a real application, this logic would depend on whether it's inter-state (IGST) or intra-state (CGST+SGST)
    updatedData.purchase_igst = 0; // Default to 0, would be set based on state-to-state transaction
    updatedData.purchase_cgst = parseFloat((gstAmount / 2).toFixed(2));
    updatedData.purchase_sgst = parseFloat((gstAmount / 2).toFixed(2));

    // Calculate invoice value = taxable value + IGST + CGST + SGST
    updatedData.purchase_invoice_value_rs = parseFloat(
      (
        updatedData.purchase_taxable_value +
        updatedData.purchase_igst +
        updatedData.purchase_cgst +
        updatedData.purchase_sgst
      ).toFixed(2)
    );

    setFormData(updatedData);
  };

  const handleInputChange = (name, value) => {
    const newValue = typeof value === 'string' ? value : parseFloat(value) || 0;

    // Create updated form data with the new field value
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    // Default GST percentage to 18% if it's empty
    if (name === 'gst_percentage' && newValue === 0) {
      updatedFormData.gst_percentage = 18;
    }

    // Initialize GST to 18% by default if it hasn't been set
    if (updatedFormData.gst_percentage === 0) {
      updatedFormData.gst_percentage = 18;
    }

    // Perform calculations when relevant fields change
    if (
      [
        'mrp_incl_gst',
        'gst_percentage',
        'purchase_qty',
        'discount_on_purchase_percentage',
      ].includes(name)
    ) {
      handleCalculatedValues(updatedFormData);
    } else {
      setFormData(updatedFormData);
    }

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Form submission triggered with data:', formData);

    // Log important missing fields for debugging
    const missingFields = [];
    if (!formData.product_name) missingFields.push('product_name');
    if (!formData.hsn_code) missingFields.push('hsn_code');
    if (!formData.units) missingFields.push('units');
    if (!formData.invoice_no) missingFields.push('invoice_no');
    if (!formData.purchase_qty || formData.purchase_qty <= 0)
      missingFields.push('purchase_qty');
    if (!formData.mrp_incl_gst || formData.mrp_incl_gst <= 0)
      missingFields.push('mrp_incl_gst');

    if (missingFields.length > 0) {
      console.warn(
        'Missing or invalid fields before validation:',
        missingFields
      );
    }

    if (!validateForm()) {
      console.error('Form validation failed. Errors:', formErrors);

      // Find first field with error and scroll to it
      const errorFields = Object.keys(formErrors);
      if (errorFields.length > 0) {
        const firstErrorField = document.querySelector(
          `[name="${errorFields[0]}"]`
        );
        if (firstErrorField) {
          firstErrorField.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          firstErrorField.focus();
        }
      }

      // Show alert with missing fields
      alert(`Please complete all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      console.log('PurchaseForm is calling onSubmit with validated data');
      // Call the parent's onSubmit handler
      onSubmit(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
      alert(`Error adding purchase: ${error?.message || 'Unknown error'}`);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.product_name)
      errors.product_name = 'Product name is required';
    if (!formData.hsn_code) errors.hsn_code = 'HSN code is required';
    if (!formData.units) errors.units = 'Units is required';
    if (!formData.invoice_no) errors.invoice_no = 'Invoice number is required';
    if (!formData.purchase_qty || formData.purchase_qty <= 0)
      errors.purchase_qty = 'Quantity must be greater than 0';
    if (!formData.mrp_incl_gst || formData.mrp_incl_gst <= 0)
      errors.mrp_incl_gst = 'MRP must be greater than 0';
    if (formData.gst_percentage < 0)
      errors.gst_percentage = 'GST percentage cannot be negative';
    if (
      formData.discount_on_purchase_percentage < 0 ||
      formData.discount_on_purchase_percentage > 100
    ) {
      errors.discount_on_purchase_percentage =
        'Discount must be between 0 and 100%';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.error('Form validation errors:', errors);
      return false;
    }
    return true;
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant='h6' component='h3' sx={{ mb: 2 }}>
        Add New Purchase
      </Typography>

      <Grid container spacing={2} sx={{ width: '100%' }}>
        {/* Row 1 */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Date'
            type='date'
            value={formData.date}
            onChange={e => handleInputChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            sx={{ '& .MuiInputBase-input': { textAlign: 'left' } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <Autocomplete
            options={productOptions}
            getOptionLabel={option => option.label || ''}
            onChange={(e, option) => handleProductSelect(option?.value, option)}
            loading={isLoadingProducts}
            loadingText='Loading products...'
            noOptionsText='No products found. Please add products in the Products section first.'
            renderInput={params => (
              <TextField
                {...params}
                label='Product Name'
                value={formData.product_name}
                onChange={e =>
                  handleInputChange('product_name', e.target.value)
                }
                fullWidth
                required
                error={!!formErrors.product_name}
                helperText={
                  formErrors.product_name ||
                  (productOptions.length === 0 && !isLoadingProducts
                    ? 'No products available. Please add products first.'
                    : '')
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingProducts ? (
                        <CircularProgress color='inherit' size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='HSN Code'
            value={formData.hsn_code}
            onChange={e => handleInputChange('hsn_code', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Units'
            value={formData.units}
            onChange={e => handleInputChange('units', e.target.value)}
            fullWidth
            placeholder='e.g., pcs, boxes'
          />
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Invoice Number'
            name='invoice_no'
            value={formData.invoice_no}
            onChange={e => handleInputChange('invoice_no', e.target.value)}
            fullWidth
            required
            error={!!formErrors.invoice_no}
            helperText={formErrors.invoice_no}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Purchase Quantity'
            name='purchase_qty'
            type='number'
            value={formData.purchase_qty}
            onChange={e => handleInputChange('purchase_qty', e.target.value)}
            fullWidth
            required
            error={!!formErrors.purchase_qty}
            helperText={formErrors.purchase_qty}
            InputProps={{
              inputProps: { min: 1 },
              startAdornment: (
                <InputAdornment position='start'>#</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='MRP (Incl. GST)'
            type='number'
            value={formData.mrp_incl_gst}
            onChange={e => handleInputChange('mrp_incl_gst', e.target.value)}
            fullWidth
            required
            InputProps={{
              inputProps: { min: 0, step: 0.01 },
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='MRP (Excl. GST)'
            type='number'
            value={formData.mrp_excl_gst}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Discount on Purchase (%)'
            type='number'
            value={formData.discount_on_purchase_percentage}
            onChange={e =>
              handleInputChange(
                'discount_on_purchase_percentage',
                e.target.value
              )
            }
            fullWidth
            InputProps={{
              inputProps: { min: 0, max: 100, step: 0.01 },
              endAdornment: <InputAdornment position='end'>%</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Purchase Cost per Unit (Ex.GST)'
            type='number'
            value={formData.purchase_cost_per_unit_ex_gst}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='GST Percentage'
            type='number'
            value={formData.gst_percentage}
            onChange={e => handleInputChange('gst_percentage', e.target.value)}
            fullWidth
            required
            InputProps={{
              inputProps: { min: 0, max: 100, step: 0.01 },
              endAdornment: <InputAdornment position='end'>%</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Taxable Value (Rs.)'
            type='number'
            value={formData.purchase_taxable_value}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Added GST breakdown fields */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Purchase IGST (Rs.)'
            type='number'
            value={formData.purchase_igst}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Purchase CGST (Rs.)'
            type='number'
            value={formData.purchase_cgst}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Purchase SGST (Rs.)'
            type='number'
            value={formData.purchase_sgst}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Added Purchase Invoice Value field */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <TextField
            label='Purchase Invoice Value (Rs.)'
            type='number'
            value={formData.purchase_invoice_value_rs}
            fullWidth
            disabled
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position='start'>₹</InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* Button Row */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3, mb: 2 }}>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          startIcon={<AddIcon />}
          disabled={isSubmitting}
          sx={{ px: 3 }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Add Purchase'}
        </Button>
      </Box>
    </Box>
  );
}

const PurchaseTab = ({
  purchases: initialPurchases,
  isLoading,
  error,
  purchasesQuery,
}) => {
  const { createPurchase, isCreatingPurchase, fetchInventoryData } =
    useInventory();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [products, setProducts] = useState([]);
  const [newPurchaseId, setNewPurchaseId] = useState(null);
  const [localPurchases, setLocalPurchases] = useState([]);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [cleanedPurchases, setCleanedPurchases] = useState([]);
  const [formState, setFormState] = useState({
    date: new Date().toISOString().split('T')[0],
    product_name: '',
    hsn_code: '',
    units: '',
    invoice_no: '',
    purchase_qty: 1,
    mrp_incl_gst: 0,
    mrp_excl_gst: 0,
    discount_on_purchase_percentage: 0,
    purchase_cost_per_unit_ex_gst: 0,
    gst_percentage: 18,
    purchase_taxable_value: 0,
    purchase_igst: 0,
    purchase_cgst: 0,
    purchase_sgst: 0,
    purchase_invoice_value_rs: 0,
    vendor_name: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [dbSaveStatus, setDbSaveStatus] = useState(null); // 'saving', 'success', 'error', or null

  useEffect(() => {
    const loadedProducts = getAllProducts();
    setProducts(loadedProducts);

    // Clean any mock data
    const cleaned = cleanPurchaseData(initialPurchases);
    setCleanedPurchases(cleaned);

    console.log(
      'PurchaseTab received purchases:',
      initialPurchases?.length || 0
    );
    console.log('PurchaseTab cleaned purchases:', cleaned?.length || 0);

    // Also update localPurchases when purchases prop changes
    if (initialPurchases && initialPurchases.length > 0) {
      setLocalPurchases(prev => {
        // Merge existing local purchases with new ones from props,
        // preventing duplicates based on purchase_id
        const existingIds = new Set(prev.map(p => p.purchase_id || p.id));
        const newPurchases = initialPurchases.filter(
          p => !existingIds.has(p.purchase_id || p.id)
        );

        if (newPurchases.length > 0) {
          console.log('Adding new purchases from props:', newPurchases.length);
          return [...newPurchases, ...prev];
        }

        return prev;
      });
    }

    // Check database connectivity
    const checkDatabaseConnection = async () => {
      try {
        console.log('Checking database connectivity...');
        const { supabase } = await import(
          '../../utils/supabase/supabaseClient'
        );

        // Simple health check query - use a table we know exists instead of pg_tables
        const startTime = Date.now();
        const { data, error } = await supabase
          .from('product_collections')
          .select('id')
          .limit(1);
        const endTime = Date.now();

        if (error) {
          console.error('Database connectivity test failed:', error);
          setDbSaveStatus('error');
        } else {
          console.log(
            `Database is connected and responding (${endTime - startTime}ms)`,
            data
          );
          // Don't set success status here to avoid confusing the user
        }

        // Also check if we can access the purchases table specifically
        const { data: purchasesTest, error: purchasesError } = await supabase
          .from('inventory_purchases')
          .select('id')
          .limit(1);

        if (purchasesError) {
          console.error(
            'Cannot access inventory_purchases table:',
            purchasesError
          );
        } else {
          console.log(
            'Successfully accessed inventory_purchases table',
            purchasesTest
          );
        }
      } catch (err) {
        console.error('Error checking database connectivity:', err);
      }
    };

    checkDatabaseConnection();
  }, [initialPurchases]);

  // Add visibility change listener to refresh data when user comes back to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('User returned to the page - refreshing data');

        // First try the queryClient refetch if available
        if (purchasesQuery && typeof purchasesQuery.refetch === 'function') {
          console.log('Auto-refreshing via queryClient.refetch()');
          purchasesQuery.refetch().catch(err => {
            console.error('Error auto-refreshing via query:', err);
          });
        } else {
          // As a fallback, try to dispatch the refresh event
          console.log('Dispatching refresh-inventory-data event');
          window.dispatchEvent(new CustomEvent('refresh-inventory-data'));
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Remove listener on cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [purchasesQuery]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleInputChange = (name, value) => {
    const newValue = typeof value === 'string' ? value : parseFloat(value) || 0;

    // Create updated form state with the new field value
    const updatedFormState = {
      ...formState,
      [name]: newValue,
    };

    // Default GST percentage to 18% if it's empty
    if (name === 'gst_percentage' && newValue === 0) {
      updatedFormState.gst_percentage = 18;
    }

    // Initialize GST to 18% by default if it hasn't been set
    if (updatedFormState.gst_percentage === 0) {
      updatedFormState.gst_percentage = 18;
    }

    // Perform calculations when relevant fields change
    if (
      [
        'mrp_incl_gst',
        'gst_percentage',
        'purchase_qty',
        'discount_on_purchase_percentage',
      ].includes(name)
    ) {
      // Calculate MRP excluding GST
      const gstPercentage = updatedFormState.gst_percentage;
      const mrpInclGst = updatedFormState.mrp_incl_gst;

      // Calculate MRP excluding GST = MRP including GST / (1 + GST%)
      updatedFormState.mrp_excl_gst =
        gstPercentage > 0
          ? parseFloat((mrpInclGst / (1 + gstPercentage / 100)).toFixed(2))
          : mrpInclGst;

      // Calculate purchase cost per unit after discount
      const discountPercentage =
        updatedFormState.discount_on_purchase_percentage;
      // This is the price after applying discount to MRP excluding GST
      updatedFormState.purchase_cost_per_unit_ex_gst = parseFloat(
        (
          updatedFormState.mrp_excl_gst *
          (1 - discountPercentage / 100)
        ).toFixed(2)
      );

      // Calculate taxable value = purchase cost per unit * quantity
      updatedFormState.purchase_taxable_value = parseFloat(
        (
          updatedFormState.purchase_cost_per_unit_ex_gst *
          updatedFormState.purchase_qty
        ).toFixed(2)
      );

      // Calculate GST components
      const gstAmount = parseFloat(
        (
          updatedFormState.purchase_taxable_value *
          (gstPercentage / 100)
        ).toFixed(2)
      );

      // For simplicity, split between CGST and SGST evenly if not IGST
      // In a real application, this logic would depend on whether it's inter-state (IGST) or intra-state (CGST+SGST)
      updatedFormState.purchase_igst = 0; // Default to 0, would be set based on state-to-state transaction
      updatedFormState.purchase_cgst = parseFloat((gstAmount / 2).toFixed(2));
      updatedFormState.purchase_sgst = parseFloat((gstAmount / 2).toFixed(2));

      // Calculate invoice value = taxable value + IGST + CGST + SGST
      updatedFormState.purchase_invoice_value_rs = parseFloat(
        (
          updatedFormState.purchase_taxable_value +
          updatedFormState.purchase_igst +
          updatedFormState.purchase_cgst +
          updatedFormState.purchase_sgst
        ).toFixed(2)
      );
    }

    setFormState(updatedFormState);

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle input change specifically for the Product Name autocomplete when typing
  const handleProductInputChange = (event, newInputValue) => {
    setFormState(prevState => ({
      ...prevState,
      product_name: newInputValue,
    }));

    // Clear error when field is updated
    if (formErrors.product_name) {
      setFormErrors(prev => ({
        ...prev,
        product_name: undefined,
      }));
    }
  };

  // Handle autocomplete product selection
  const handleProductSelect = (event, newValue) => {
    if (newValue) {
      const updatedFormState = {
        ...formState,
        product_name: newValue.name,
        // Also update HSN code and units if available
        ...(newValue.hsn_code && { hsn_code: newValue.hsn_code }),
        ...(newValue.units && { units: newValue.units }),
        // Set MRP from product price if available
        ...(newValue.price && {
          mrp_incl_gst: newValue.price,
          // Recalculate MRP excluding GST based on current GST percentage
          mrp_excl_gst: parseFloat(
            (newValue.price / (1 + formState.gst_percentage / 100)).toFixed(2)
          ),
        }),
      };

      // Ensure GST percentage is set to 18% by default if not already set
      if (updatedFormState.gst_percentage === 0) {
        updatedFormState.gst_percentage = 18;
      }

      // Calculate other values based on updated MRP
      if (newValue.price) {
        const gstPercentage = updatedFormState.gst_percentage;
        const discountPercentage =
          updatedFormState.discount_on_purchase_percentage;

        // Calculate purchase cost per unit after discount
        // This is the price after applying discount to MRP excluding GST
        updatedFormState.purchase_cost_per_unit_ex_gst = parseFloat(
          (
            updatedFormState.mrp_excl_gst *
            (1 - discountPercentage / 100)
          ).toFixed(2)
        );

        // Calculate taxable value
        updatedFormState.purchase_taxable_value = parseFloat(
          (
            updatedFormState.purchase_cost_per_unit_ex_gst *
            updatedFormState.purchase_qty
          ).toFixed(2)
        );

        // Calculate GST components
        const gstAmount = parseFloat(
          (
            updatedFormState.purchase_taxable_value *
            (gstPercentage / 100)
          ).toFixed(2)
        );

        updatedFormState.purchase_igst = 0; // Default to 0
        updatedFormState.purchase_cgst = parseFloat((gstAmount / 2).toFixed(2));
        updatedFormState.purchase_sgst = parseFloat((gstAmount / 2).toFixed(2));

        // Calculate invoice value
        updatedFormState.purchase_invoice_value_rs = parseFloat(
          (
            updatedFormState.purchase_taxable_value +
            updatedFormState.purchase_igst +
            updatedFormState.purchase_cgst +
            updatedFormState.purchase_sgst
          ).toFixed(2)
        );
      }

      setFormState(updatedFormState);

      // Clear errors when fields are updated
      const clearedErrors = { ...formErrors };
      if (clearedErrors.product_name) delete clearedErrors.product_name;
      if (newValue.hsn_code && clearedErrors.hsn_code)
        delete clearedErrors.hsn_code;
      if (newValue.units && clearedErrors.units) delete clearedErrors.units;
      setFormErrors(clearedErrors);
    }
  };

  const handleSubmit = async formData => {
    console.log('PurchaseTab received form submission:', formData);

    if (!validateFormData(formData)) {
      console.error('Invalid form data');
      alert('Please fill out all required fields correctly');
      return;
    }

    try {
      console.log('Submitting purchase form with data:', formData);

      // Show saving indicator
      setDbSaveStatus('saving');

      // First check if createPurchase function exists
      if (typeof createPurchase !== 'function') {
        console.error('createPurchase is not a function:', createPurchase);
        setDbSaveStatus('error');
        throw new Error(
          'Internal error: Purchase creation function not available'
        );
      }

      // Create the purchase with thorough error handling
      let newPurchase;
      try {
        newPurchase = await createPurchase(formData);
        console.log('Purchase created successfully:', newPurchase);

        if (!newPurchase) {
          setDbSaveStatus('error');
          throw new Error('No purchase data returned after creation');
        }

        // Verify the data was actually saved to the database
        try {
          const { supabase, TABLES } = await import(
            '../../utils/supabase/supabaseClient'
          );

          // If we have an ID, verify it exists in the database
          if (newPurchase.id) {
            console.log(
              'Verifying purchase was saved with ID:',
              newPurchase.id
            );
            const { data: verificationData, error: verificationError } =
              await supabase
                .from(TABLES.PURCHASES)
                .select('*')
                .eq('id', newPurchase.id)
                .single();

            if (verificationError) {
              console.error('Verification failed:', verificationError);
              alert(
                'Purchase may not have been saved properly. Please check the database.'
              );
            } else if (!verificationData) {
              console.error(
                'Verification found no record with ID:',
                newPurchase.id
              );
              alert(
                'Purchase was not found in database after creation. Please try again.'
              );
            } else {
              console.log(
                'Verified purchase exists in database:',
                verificationData
              );
            }
          }
        } catch (verifyError) {
          console.error('Error verifying purchase in database:', verifyError);
        }

        // Set success status
        setDbSaveStatus('success');
      } catch (purchaseError) {
        console.error('Error during purchase creation:', purchaseError);
        setDbSaveStatus('error');
        throw purchaseError;
      }

      // Store the ID of the new purchase for highlighting
      if (newPurchase && newPurchase.purchase_id) {
        setNewPurchaseId(newPurchase.purchase_id);

        // Clear the highlight after 5 seconds
        setTimeout(() => {
          setNewPurchaseId(null);
        }, 5000);
      } else {
        console.warn('Created purchase does not have an ID:', newPurchase);
      }

      // Show success message with alert
      alert('Purchase added successfully!');

      // Try multiple approaches to refresh the data
      let refreshed = false;

      // Approach 1: Use the query refetch if available
      if (purchasesQuery && typeof purchasesQuery.refetch === 'function') {
        console.log('Refreshing data via purchasesQuery.refetch()');
        try {
          await purchasesQuery.refetch();
          refreshed = true;
        } catch (err) {
          console.error('Error refreshing via query:', err);
        }
      }

      // Approach 2: Use direct fetchInventoryData
      if (!refreshed && fetchInventoryData) {
        console.log('Refreshing data via fetchInventoryData()');
        try {
          await fetchInventoryData();
          refreshed = true;
        } catch (err) {
          console.error('Error refreshing via fetchInventoryData:', err);
        }
      }

      // Approach 3: Add to local state and dispatch event
      if (newPurchase) {
        console.log('Adding purchase to local state:', newPurchase);
        // Keep a local copy of the new purchase
        setLocalPurchases(prev => {
          // Avoid duplicate entries
          const purchaseId = newPurchase.purchase_id || newPurchase.id;
          const filteredPrev = prev.filter(
            p => (p.purchase_id || p.id) !== purchaseId
          );
          return [newPurchase, ...filteredPrev];
        });

        // Also update the cleanedPurchases array directly
        setCleanedPurchases(prev => {
          // Avoid duplicate entries
          const purchaseId = newPurchase.purchase_id || newPurchase.id;
          const filteredPrev = prev.filter(
            p => (p.purchase_id || p.id) !== purchaseId
          );
          return [newPurchase, ...filteredPrev];
        });

        // Try the event-based approach as fallback
        window.dispatchEvent(new CustomEvent('refresh-inventory-data'));
        setShowRefreshAlert(true);
        setTimeout(() => setShowRefreshAlert(false), 5000);
      }

      // Reset to first page
      setPage(0);

      // Reset form on success (by creating an event)
      const resetEvent = new CustomEvent('reset-purchase-form');
      window.dispatchEvent(resetEvent);

      // Scroll to the table to show the new entry
      const purchasesTable = document.querySelector('.purchase-records-table');
      if (purchasesTable) {
        purchasesTable.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      setDbSaveStatus('error');
      alert(`Error creating purchase: ${error?.message || 'Unknown error'}`);
    }
  };

  // Separate validation function for checking form data
  const validateFormData = data => {
    const errors = {};
    if (!data.product_name) errors.product_name = 'Product name is required';
    if (!data.hsn_code) errors.hsn_code = 'HSN code is required';
    if (!data.units) errors.units = 'Units is required';
    if (!data.invoice_no) errors.invoice_no = 'Invoice number is required';
    if (!data.purchase_qty || data.purchase_qty <= 0)
      errors.purchase_qty = 'Quantity must be greater than 0';
    if (!data.mrp_incl_gst || data.mrp_incl_gst <= 0)
      errors.mrp_incl_gst = 'MRP must be greater than 0';
    if (data.gst_percentage < 0)
      errors.gst_percentage = 'GST percentage cannot be negative';
    if (
      data.discount_on_purchase_percentage < 0 ||
      data.discount_on_purchase_percentage > 100
    ) {
      errors.discount_on_purchase_percentage =
        'Discount must be between 0 and 100%';
    }

    if (Object.keys(errors).length > 0) {
      console.error('Form validation errors:', errors);
      return false;
    }
    return true;
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        margin: '0 auto',
        maxWidth: '100%',
        overflow: 'visible',
      }}
    >
      {/* Debug table removed */}

      <Paper
        sx={{
          p: 3,
          width: '100%',
          mb: 3,
          borderRadius: '8px',
          boxSizing: 'border-box',
        }}
      >
        <PurchaseForm
          onSubmit={handleSubmit}
          isSubmitting={isCreatingPurchase}
        />
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Typography variant='h6' component='h3' sx={{ mb: 2 }}>
          Purchase Records
        </Typography>

        {showRefreshAlert && (
          <Alert severity='info' sx={{ mb: 2 }}>
            New purchase added! If you don't see it in the table, try using the
            Force Refresh button.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant='outlined'
            color='primary'
            size='small'
            startIcon={<RefreshIcon />}
            onClick={async () => {
              console.log('Force refresh clicked');

              // First try the queryClient refetch if available
              let refreshed = false;
              if (
                purchasesQuery &&
                typeof purchasesQuery.refetch === 'function'
              ) {
                console.log('Refreshing via queryClient.refetch()');
                try {
                  const result = await purchasesQuery.refetch();
                  console.log('Refetch result:', result);
                  refreshed = true;
                } catch (err) {
                  console.error('Error refreshing via query:', err);
                }
              }

              // If that didn't work, try fetchInventoryData
              if (!refreshed && fetchInventoryData) {
                console.log('Refreshing via fetchInventoryData()');
                try {
                  await fetchInventoryData();
                  refreshed = true;
                } catch (err) {
                  console.error(
                    'Error refreshing via fetchInventoryData:',
                    err
                  );
                }
              }

              // As a fallback, try to dispatch the refresh event
              if (!refreshed) {
                console.log('Dispatching refresh-inventory-data event');
                window.dispatchEvent(new CustomEvent('refresh-inventory-data'));
              }

              // Show feedback to the user
              alert('Data refresh requested. The table will update shortly.');
            }}
            sx={{ borderRadius: 4 }}
          >
            Force Refresh
          </Button>
        </Box>

        {/* Add database save indicator */}
        {dbSaveStatus && (
          <DatabaseSaveIndicator
            status={dbSaveStatus}
            duration={5000}
            message={
              dbSaveStatus === 'saving'
                ? 'Saving purchase to database...'
                : dbSaveStatus === 'success'
                  ? 'Purchase saved to database successfully!'
                  : dbSaveStatus === 'error'
                    ? 'Failed to save purchase to database. Check console for details.'
                    : null
            }
          />
        )}

        <TableContainer
          component={Paper}
          sx={{
            width: '100%',
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '500px',
          }}
          className='purchase-records-table'
        >
          <Table
            aria-label='purchase records table'
            size='small'
            stickyHeader
            sx={{ tableLayout: 'auto', minWidth: '100%' }}
          >
            <TableHead>
              <TableRow>
                <StyledTableCell>S.No</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Product Name</StyledTableCell>
                <StyledTableCell>HSN Code</StyledTableCell>
                <StyledTableCell>UNITS</StyledTableCell>
                <StyledTableCell>Invoice Number</StyledTableCell>
                <StyledTableCell>Qty</StyledTableCell>
                <StyledTableCell>MRP (Incl. GST)</StyledTableCell>
                <StyledTableCell>MRP (Excl. GST)</StyledTableCell>
                <StyledTableCell>Discount</StyledTableCell>
                <StyledTableCell>Cost/Unit</StyledTableCell>
                <StyledTableCell>GST %</StyledTableCell>
                <StyledTableCell>Taxable Value</StyledTableCell>
                <StyledTableCell>IGST</StyledTableCell>
                <StyledTableCell>CGST</StyledTableCell>
                <StyledTableCell>SGST</StyledTableCell>
                <StyledTableCell>Invoice Value</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Combine cleaned purchases with local purchases to show the most up-to-date data */}
              {(() => {
                const allPurchases = [...localPurchases];
                // Add cleaned purchases that aren't already in the local state
                const localIds = new Set(
                  localPurchases.map(p => p.purchase_id || p.id)
                );
                for (const purchase of cleanedPurchases || []) {
                  const purchaseId = purchase.purchase_id || purchase.id;
                  if (!localIds.has(purchaseId)) {
                    allPurchases.push(purchase);
                  }
                }

                console.log('Displaying purchases:', allPurchases.length);

                return allPurchases
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((purchase, idx) => {
                    const serial = page * rowsPerPage + idx + 1;
                    // Check if this is the newly added purchase
                    const isNewPurchase =
                      newPurchaseId &&
                      (purchase.purchase_id === newPurchaseId ||
                        purchase.id === newPurchaseId);

                    // Generate a unique key based on available ID fields
                    const purchaseKey =
                      purchase.purchase_id ||
                      purchase.id ||
                      `purchase-${purchase.product_name}-${purchase.date}-${Math.random()}`;

                    return (
                      <TableRow
                        key={purchaseKey}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          // Add highlight style for new purchases
                          ...(isNewPurchase && {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            transition: 'background-color 1s ease-in-out',
                          }),
                        }}
                      >
                        <TableCell align='left'>{serial}</TableCell>
                        <TableCell align='left'>
                          {formatDate(purchase.date)}
                        </TableCell>
                        <TableCell align='left'>
                          {purchase.product_name}
                        </TableCell>
                        <TableCell align='left'>{purchase.hsn_code}</TableCell>
                        <TableCell align='left'>{purchase.units}</TableCell>
                        <TableCell align='left'>
                          {purchase.invoice_no}
                        </TableCell>
                        <TableCell align='left'>
                          {purchase.purchase_qty}
                        </TableCell>
                        <TableCell align='left'>
                          ₹{parseFloat(purchase.mrp_incl_gst || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          ₹{parseFloat(purchase.mrp_excl_gst || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          {parseFloat(
                            purchase.discount_on_purchase_percentage || 0
                          ).toFixed(2)}
                          %
                        </TableCell>
                        <TableCell align='left'>
                          ₹
                          {parseFloat(
                            purchase.purchase_cost_per_unit_ex_gst || 0
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          {parseFloat(purchase.gst_percentage || 0).toFixed(2)}%
                        </TableCell>
                        <TableCell align='left'>
                          ₹
                          {parseFloat(
                            purchase.purchase_taxable_value || 0
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          ₹{parseFloat(purchase.purchase_igst || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          ₹{parseFloat(purchase.purchase_cgst || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          ₹{parseFloat(purchase.purchase_sgst || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align='left'>
                          ₹
                          {parseFloat(
                            purchase.purchase_invoice_value_rs || 0
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  });
              })()}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={
              localPurchases.length +
              (cleanedPurchases?.filter(
                p =>
                  !localPurchases.some(
                    lp => (lp.purchase_id || lp.id) === (p.purchase_id || p.id)
                  )
              ).length || 0)
            }
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Box>
  );
};

export default PurchaseTab;
