import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';
import { usePurchaseHistory } from '../hooks/usePurchaseHistory';

// Define unit options for dropdown
const unitOptions = [
  'pcs', 'bottles', 'boxes', 'packets', 'grams', 'ml', 'liters', 'kgs'
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

// Product interface - matches your database
interface Product {
  id: string;
  name: string;
  hsn_code: string;
  gst_percentage: number;
  units: string;
  price: number; // Sales price excluding GST
  mrp_excl_gst: number;
  mrp_incl_gst: number;
  active: boolean;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
  category?: string;
  product_type?: string;
}

// New product form state
interface ProductFormState {
  id?: string;
  name: string;
  hsn_code: string;
  gst_percentage: number;
  units: string;
  mrp_excl_gst: number;
  mrp_incl_gst: number;
  active: boolean;
  description?: string;
  category?: string;
  product_type?: string;
  fromPurchaseHistory?: boolean;
}

// Initial form state
const initialFormState: ProductFormState = {
  name: '',
  hsn_code: '',
  gst_percentage: 18, // Default 18%
  units: 'pcs', // Default unit
  mrp_excl_gst: 0,
  mrp_incl_gst: 0,
  active: true,
  description: '',
  category: 'General', // Default category
  product_type: '',
  fromPurchaseHistory: false,
};

export default function ProductMaster() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Fetch purchase history data
  const { purchases, isLoading: isLoadingPurchases } = usePurchaseHistory();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw handleSupabaseError(error);

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // If GST percentage or MRP including GST changes, recalculate MRP excluding GST
      if (name === 'gst_percentage' || name === 'mrp_incl_gst') {
        const gstPercentage = name === 'gst_percentage' ? Number(value) : prev.gst_percentage;
        const mrpInclGst = name === 'mrp_incl_gst' ? Number(value) : prev.mrp_incl_gst;
        
        // Calculate price excluding GST: price = mrp_incl_gst / (1 + gst_percentage/100)
        if (gstPercentage >= 0 && mrpInclGst >= 0) {
          const mrpExclGst = mrpInclGst / (1 + gstPercentage / 100);
          newData.mrp_excl_gst = parseFloat(mrpExclGst.toFixed(2));
        }
      }
      
      // If MRP excluding GST changes, recalculate MRP including GST
      if (name === 'mrp_excl_gst') {
        const mrpExclGst = Number(value);
        const gstPercentage = prev.gst_percentage;
        
        if (gstPercentage >= 0 && mrpExclGst >= 0) {
          const mrpInclGst = mrpExclGst * (1 + gstPercentage / 100);
          newData.mrp_incl_gst = parseFloat(mrpInclGst.toFixed(2));
        }
      }
      
      return newData;
    });
  };

  // Handle checkbox changes for boolean fields
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle product selection from purchase history autocomplete
  const handleProductFromPurchaseHistorySelect = (selectedProduct: any | null) => {
    if (!selectedProduct) {
      setFormData(initialFormState);
      return;
    }

    setFormData({
      name: selectedProduct.product_name,
      hsn_code: selectedProduct.hsn_code || '',
      gst_percentage: selectedProduct.gst_percentage || 18,
      units: selectedProduct.units || 'pcs',
      mrp_excl_gst: selectedProduct.mrp_excl_gst || 0,
      mrp_incl_gst: selectedProduct.mrp_incl_gst || 0,
      active: true,
      description: '',
      category: 'General',
      product_type: selectedProduct.product_type || '',
      fromPurchaseHistory: true,
    });
  };

  // Handle manual product name input in autocomplete
  const handleProductNameInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      name: value,
      fromPurchaseHistory: false
    }));
  };

  // Open dialog for adding a new product
  const handleOpenAddDialog = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setOpen(true);
  };

  // Open dialog for editing an existing product
  const handleOpenEditDialog = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      hsn_code: product.hsn_code || '',
      gst_percentage: product.gst_percentage || 18,
      units: product.units || 'pcs',
      mrp_excl_gst: product.mrp_excl_gst || 0,
      mrp_incl_gst: product.mrp_incl_gst || 0,
      active: product.active,
      description: product.description || '',
      category: product.category || 'General',
      product_type: product.product_type || '',
    });
    setIsEditing(true);
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'Product name is required', severity: 'error' });
      return false;
    }
    
    if (!formData.hsn_code.trim()) {
      setSnackbar({ open: true, message: 'HSN code is required', severity: 'error' });
      return false;
    }
    
    if (formData.gst_percentage < 0 || formData.gst_percentage > 100) {
      setSnackbar({ open: true, message: 'GST percentage must be between 0 and 100', severity: 'error' });
      return false;
    }
    
    if (!formData.units.trim()) {
      setSnackbar({ open: true, message: 'Unit of measure is required', severity: 'error' });
      return false;
    }
    
    if (formData.mrp_incl_gst < 0) {
      setSnackbar({ open: true, message: 'MRP cannot be negative', severity: 'error' });
      return false;
    }
    
    // Check for duplicate product name (only when adding a new product)
    if (!isEditing && products.some(p => p.name.toLowerCase() === formData.name.toLowerCase())) {
      setSnackbar({ open: true, message: 'A product with this name already exists', severity: 'error' });
      return false;
    }
    
    // Check for duplicate HSN code (only if strict HSN validation is required)
    // Uncomment if you want to enforce unique HSN codes
    /*
    if (!isEditing && products.some(p => p.hsn_code === formData.hsn_code)) {
      setSnackbar({ open: true, message: 'A product with this HSN code already exists', severity: 'error' });
      return false;
    }
    */
    
    return true;
  };

  // Submit the form to add/update a product
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare data to insert/update
      const productData = {
        name: formData.name,
        hsn_code: formData.hsn_code,
        gst_percentage: formData.gst_percentage,
        units: formData.units,
        price: formData.mrp_excl_gst, // Using mrp_excl_gst as the base price
        mrp_excl_gst: formData.mrp_excl_gst,
        mrp_incl_gst: formData.mrp_incl_gst,
        active: formData.active,
        description: formData.description,
        category: formData.category,
        product_type: formData.product_type,
        updated_at: new Date().toISOString(),
      };
      
      let result;
      
      if (isEditing && formData.id) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', formData.id);
          
        if (result.error) throw handleSupabaseError(result.error);
        
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        // Add new product
        result = await supabase
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
            stock_quantity: 0, // Initialize stock to 0 for new products
          });
          
        if (result.error) throw handleSupabaseError(result.error);
        
        setSnackbar({ open: true, message: 'Product added successfully', severity: 'success' });
      }
      
      // Refresh product list and close dialog
      await fetchProducts();
      handleClose();
      
    } catch (err) {
      console.error('Error saving product:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err instanceof Error ? err.message : 'Failed to save product'}`, 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle product active status
  const handleToggleActive = async (product: Product) => {
    const updatedProduct = { ...product, active: !product.active };

    try {
      const { error } = await supabase
        .from('products')
        .update({ active: updatedProduct.active })
        .eq('id', product.id);

      if (error) throw handleSupabaseError(error);

      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === product.id ? updatedProduct : p))
      );
      setSnackbar({
        open: true,
        message: `Product ${updatedProduct.active ? 'activated' : 'deactivated'} successfully!`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error toggling product active state:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product status');
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Failed to update product status'}`,
        severity: 'error',
      });
    }
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw handleSupabaseError(error);

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productToDelete.id)
      );
      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Failed to delete product'}`,
        severity: 'error',
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">
          Product Master
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProducts}
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            disabled={isLoading}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table stickyHeader aria-label="products table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>HSN Code</StyledTableCell>
                <StyledTableCell>Unit</StyledTableCell>
                <StyledTableCell align="right">GST %</StyledTableCell>
                <StyledTableCell align="right">Price (Excl. GST)</StyledTableCell>
                <StyledTableCell align="right">MRP (Incl. GST)</StyledTableCell>
                <StyledTableCell align="right">Stock Quantity</StyledTableCell>
                <StyledTableCell>Product Type</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell align="center">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow 
                      key={product.id} 
                      hover
                      sx={{ 
                        backgroundColor: !product.active ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                        opacity: !product.active ? 0.7 : 1
                      }}
                    >
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.hsn_code || '-'}</TableCell>
                      <TableCell>{product.units || '-'}</TableCell>
                      <TableCell align="right">{product.gst_percentage || 0}%</TableCell>
                      <TableCell align="right">₹{product.mrp_excl_gst?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">₹{product.mrp_incl_gst?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">{product.stock_quantity || 0}</TableCell>
                      <TableCell>{product.product_type || '-'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: product.active ? 'success.light' : 'error.light',
                            color: 'white',
                          }}
                        >
                          {product.active ? 'Active' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(product)}
                          title="Edit Product"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color={product.active ? "error" : "success"} 
                          onClick={() => handleToggleActive(product)}
                          title={product.active ? "Deactivate Product" : "Activate Product"}
                        >
                          {product.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(product)}
                          title="Delete Product"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                    No products found. Click "Add Product" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <TextField
                  name="name"
                  label="Product Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              ) : (
                <Autocomplete
                  options={purchases}
                  getOptionLabel={(option) => option.product_name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="name"
                      label="Product Name *"
                      fullWidth
                      required
                      error={!formData.name}
                      helperText={!formData.name ? "Product name is required" : "Select from purchase history or enter new"}
                      onChange={handleProductNameInput}
                      value={formData.name}
                    />
                  )}
                  onChange={(event, newValue) => handleProductFromPurchaseHistorySelect(newValue)}
                  isOptionEqualToValue={(option, value) => option.product_name === value.product_name}
                  loading={isLoadingPurchases}
                  freeSolo
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="hsn_code"
                label="HSN Code *"
                value={formData.hsn_code}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  readOnly: formData.fromPurchaseHistory
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={unitOptions}
                value={formData.units}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    units: typeof newValue === 'string' ? newValue : '',
                  }));
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'input') {
                    setFormData((prev) => ({
                      ...prev,
                      units: newInputValue,
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Unit of Measure *"
                    required
                  />
                )}
                disabled={formData.fromPurchaseHistory}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gst_percentage"
                label="GST Percentage *"
                type="number"
                value={formData.gst_percentage}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.01 },
                  readOnly: formData.fromPurchaseHistory
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mrp_excl_gst"
                label="Price (Excl. GST) *"
                type="number"
                value={formData.mrp_excl_gst}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mrp_incl_gst"
                label="MRP (Incl. GST) *"
                type="number"
                value={formData.mrp_incl_gst}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="product_type"
                label="Product Type"
                value={formData.product_type || ''}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="active"
                    checked={formData.active}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label="Active"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 