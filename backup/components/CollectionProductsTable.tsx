import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBackIosNew as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/supabaseClient';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate, formatPercentage } from '../utils/format';
import { useCollectionProducts } from '../hooks/useCollectionProducts';
import { useProducts } from '../hooks/useProducts';
import { useInventory } from '../hooks/useInventory';
import { calculateProfit, calculateProfitMargin } from '../models/inventoryTypes';
import { styled } from '@mui/material/styles';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

interface CollectionProductsTableProps {
  collectionId: string;
  collectionName: string;
}

const CollectionProductsTable: React.FC<CollectionProductsTableProps> = ({ collectionId, collectionName }) => {
  const navigate = useNavigate();
  const { collectionProducts, isLoading } = useCollectionProducts(collectionId);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Product detail dialog
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [productPurchases, setProductPurchases] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Add/Edit product dialog
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    mrp_incl_gst: 0,
    hsn_code: '',
    unit_type: '',
    gst_percentage: 0,
    stock_quantity: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profit, setProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({});
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Hooks
  const { products, isLoading: isLoadingProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const { addToInventory, isAddingToInventory } = useInventory();

  useEffect(() => {
    if (collectionProducts) {
      let filtered = [...collectionProducts];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(product => 
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply stock filter
      if (stockFilter === 'In Stock') {
        filtered = filtered.filter(product => product.stock_quantity > 0);
      } else if (stockFilter === 'Out of Stock') {
        filtered = filtered.filter(product => !product.stock_quantity || product.stock_quantity <= 0);
      } else if (stockFilter === 'Low Stock') {
        filtered = filtered.filter(product => product.stock_quantity > 0 && product.stock_quantity <= 5);
      }
      
      setFilteredProducts(filtered);
    }
  }, [collectionProducts, searchTerm, stockFilter]);
  
  useEffect(() => {
    if (products) {
      const collectionProducts = products.filter(product => 
        product.collection_id === collectionId
      );
      
      // Apply search filter if provided
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = collectionProducts.filter(product => 
          (product.product_name?.toLowerCase().includes(searchLower)) ||
          (product.description?.toLowerCase().includes(searchLower)) ||
          (product.hsn_code?.toLowerCase().includes(searchLower))
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(collectionProducts);
      }
    }
  }, [products, collectionId, searchTerm]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      fetchInventoryData();
    }
  }, [filteredProducts]);

  useEffect(() => {
    const calculatedProfit = calculateProfit(formData.mrp_incl_gst, formData.gst_percentage);
    setProfit(calculatedProfit);
    
    const calculatedMargin = calculateProfitMargin(formData.mrp_incl_gst, formData.gst_percentage);
    setProfitMargin(calculatedMargin);
  }, [formData.mrp_incl_gst, formData.gst_percentage]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleStockFilterChange = (event) => {
    setStockFilter(event.target.value);
    setPage(0);
  };
  
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleView = async (product) => {
    setSelectedProduct(product);
    setOpenProductDialog(true);
    setLoadingDetails(true);
    
    try {
      // Fetch purchase history for this product
      const { data, error } = await supabase
        .from('inventory_purchases')
        .select('*')
        .eq('product_name', product.name)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      setProductPurchases(data || []);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setSelectedProduct(null);
    setProductPurchases([]);
  };
  
  const handleForceRefresh = () => {
    window.location.reload();
  };
  
  const getStockStatusChip = (stock) => {
    if (!stock || stock <= 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (stock <= 5) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };
  
  const fetchInventoryData = async () => {
    setLoadingInventory(true);
    try {
      const productIds = filteredProducts.map(p => p.id);
      
      const { data, error } = await supabase
        .from('inventory_products')
        .select('*')
        .in('product_id', productIds);
        
      if (error) {
        console.error('Error fetching inventory data:', error);
        return;
      }
      
      // Create a map of product_id to inventory data
      const inventoryData: Record<string, any> = {};
      if (data) {
        data.forEach(item => {
          inventoryData[item.product_id] = item;
        });
      }
      
      setInventoryMap(inventoryData);
    } catch (error) {
      console.error('Error in fetchInventoryData:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleAddToInventory = async (product: any) => {
    try {
      await addToInventory({
        product_id: product.id,
        product_name: product.product_name || product.name,
        hsn_code: product.hsn_code,
        unit_type: product.unit_type || 'pcs',
        mrp_incl_gst: product.mrp_incl_gst || product.price,
        gst_percentage: product.gst_percentage || 18
      });
      
      toast.success('Product added to inventory');
      fetchInventoryData(); // Refresh inventory data
    } catch (error: any) {
      toast.error(`Failed to add product to inventory: ${error.message || 'Unknown error'}`);
    }
  };

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      mrp_incl_gst: 0,
      hsn_code: '',
      unit_type: '',
      gst_percentage: 0,
      stock_quantity: 0
    });
    setEditingId(null);
    setErrors({});
  };
  
  const handleEdit = (product: any) => {
    setFormData({
      product_name: product.product_name || '',
      description: product.description || '',
      mrp_incl_gst: product.mrp_incl_gst || product.price || 0,
      hsn_code: product.hsn_code || '',
      unit_type: product.unit_type || '',
      gst_percentage: product.gst_percentage || 0,
      stock_quantity: product.stock_quantity || 0
    });
    setEditingId(product.id);
    setOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };
  
  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.product_name.trim()) newErrors.product_name = 'Product name is required';
    if (formData.mrp_incl_gst <= 0) newErrors.mrp_incl_gst = 'Price must be greater than 0';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create or update product
    const productData = {
      product_name: formData.product_name,
      name: formData.product_name,
      description: formData.description,
      mrp_incl_gst: formData.mrp_incl_gst,
      price: formData.mrp_incl_gst,
      hsn_code: formData.hsn_code,
      unit_type: formData.unit_type,
      gst_percentage: formData.gst_percentage,
      stock_quantity: formData.stock_quantity
    };
    
    if (editingId) {
      updateProduct(editingId, productData);
    } else {
      addProduct({ 
        ...productData,
        active: true,
        collection_id: collectionId,
        discount_on_purchase_percentage: 0
      });
    }
    
    setOpen(false);
    resetForm();
  };
  
  // Pagination calculations
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/products')} 
            sx={{ mr: 1 }}
            aria-label="Back to collections"
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="primary">
            {collectionName}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
            sx={{ height: 40 }}
          >
            Add Product
          </Button>
        </Box>
      </Box>
      
      {/* Search and Filters */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={stockFilter}
              onChange={handleStockFilterChange}
              label="Stock Status"
            >
              <MenuItem value="All">All Stock Status</MenuItem>
              <MenuItem value="In Stock">In Stock</MenuItem>
              <MenuItem value="Low Stock">Low Stock</MenuItem>
              <MenuItem value="Out of Stock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ flex: 1 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Showing {filteredProducts.length} products
          </Typography>
        </Box>
      </Box>
      
      {/* Products Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>HSN Code</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const isInInventory = inventoryMap[product.id] !== undefined;
                  
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id?.slice(0, 10)}...</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.hsn_code || '-'}</TableCell>
                      <TableCell align="center">{product.stock_quantity || 0}</TableCell>
                      <TableCell align="right">{formatCurrency(product.mrp_incl_gst || product.price)}</TableCell>
                      <TableCell align="center">
                        {getStockStatusChip(product.stock_quantity)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
            
            <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
              {filteredProducts.length > 0 
                ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredProducts.length)} of ${filteredProducts.length}`
                : '0-0 of 0'
              }
            </Typography>
            
            <IconButton 
              disabled={page === 0} 
              onClick={() => handleChangePage(page - 1)}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton 
              disabled={page >= Math.ceil(filteredProducts.length / rowsPerPage) - 1} 
              onClick={() => handleChangePage(page + 1)}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchInventoryData}
            disabled={loadingInventory}
          >
            Refresh
          </Button>
        </Box>
      </Paper>
      
      {/* Product Detail Dialog */}
      <Dialog open={openProductDialog} onClose={handleCloseProductDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct?.name}
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Product ID</Typography>
                  <Typography variant="body1">{selectedProduct?.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">HSN Code</Typography>
                  <Typography variant="body1">{selectedProduct?.hsn_code || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                  <Typography variant="body1">{formatCurrency(selectedProduct?.mrp_incl_gst || selectedProduct?.price || 0)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">MRP (Incl. GST)</Typography>
                  <Typography variant="body1">{formatCurrency(selectedProduct?.mrp_incl_gst || selectedProduct?.price || 0)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">GST %</Typography>
                  <Typography variant="body1">{selectedProduct?.gst_percentage || 18}%</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Current Stock</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      {selectedProduct?.stock_quantity || 0} {selectedProduct?.units || 'units'}
                    </Typography>
                    {getStockStatusChip(selectedProduct?.stock_quantity)}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedProduct?.description || 'No description available'}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mb: 2 }}>Purchase History</Typography>
              
              {productPurchases.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No purchase history found for this product.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell align="right">Invoice Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productPurchases.map(purchase => (
                        <TableRow key={purchase.id} hover>
                          <TableCell>{formatDate(purchase.date)}</TableCell>
                          <TableCell align="right">{purchase.purchase_qty} {purchase.units}</TableCell>
                          <TableCell>{purchase.purchase_invoice_number}</TableCell>
                          <TableCell>{purchase.vendor_name}</TableCell>
                          <TableCell align="right">{formatCurrency(purchase.purchase_invoice_value_rs)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>Close</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              handleCloseProductDialog();
              // Redirect to edit page
              navigate(`/products/${collectionId}/edit/${selectedProduct?.id}`);
            }}
          >
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <DialogTitle>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Product Name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
                fullWidth
                error={!!errors.product_name}
                helperText={errors.product_name}
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
              />
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Price (₹)"
                  type="number"
                  value={formData.mrp_incl_gst}
                  onChange={(e) => setFormData({ ...formData, mrp_incl_gst: parseFloat(e.target.value) || 0 })}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!errors.mrp_incl_gst}
                  helperText={errors.mrp_incl_gst}
                />
                
                <TextField
                  label="GST %"
                  type="number"
                  value={formData.gst_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_percentage: parseFloat(e.target.value) || 0 })}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="HSN Code"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                  fullWidth
                />
                
                <TextField
                  label="Unit Type"
                  value={formData.unit_type}
                  onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                  fullWidth
                  placeholder="e.g., pcs, bottle, ml"
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Profit (₹)"
                  value={formatCurrency(profit)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      color: profit >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    },
                  }}
                />
                
                <TextField
                  label="Margin (%)"
                  value={formatPercentage(profitMargin)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      color: profitMargin >= 20 ? 'success.main' : profitMargin >= 0 ? 'warning.main' : 'error.main',
                      fontWeight: 'bold',
                    },
                  }}
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!formData.product_name.trim() || formData.mrp_incl_gst <= 0}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CollectionProductsTable; 