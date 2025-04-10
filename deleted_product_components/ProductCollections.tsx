import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { supabase } from '../utils/supabase/supabaseClient';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/format';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const ProductCollections = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Product detail dialog
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [productPurchases, setProductPurchases] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchTerm, categoryFilter, stockFilter, startDate, endDate]);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      if (categoryFilter !== 'All') {
        // Assuming you have a category field, adjust as needed
        query = query.eq('category', categoryFilter);
      }
      
      if (stockFilter === 'In Stock') {
        query = query.gt('stock_quantity', 0);
      } else if (stockFilter === 'Out of Stock') {
        query = query.eq('stock_quantity', 0);
      } else if (stockFilter === 'Low Stock') {
        query = query.lte('stock_quantity', 5).gt('stock_quantity', 0);
      }
      
      // Date filters for created_at field
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        // Add one day to include the end date fully
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }
      
      // Apply pagination
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      
      query = query
        .order('name')
        .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
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
  
  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
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
    fetchProducts();
  };
  
  const getStockStatusChip = (stock) => {
    if (stock <= 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (stock <= 5) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };
  
  const getStockStatusLabel = (stock) => {
    if (stock <= 0) {
      return 'Out of Stock';
    } else if (stock <= 5) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };
  
  const getTotalPages = () => {
    return Math.ceil(totalProducts / rowsPerPage);
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" color="primary">
            Products
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => window.location.href = '/products/add'}
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
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                label="Category"
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Hair Care">Hair Care</MenuItem>
                <MenuItem value="Skin Care">Skin Care</MenuItem>
                <MenuItem value="Makeup">Makeup</MenuItem>
                <MenuItem value="Tools">Tools</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flex: 1 }} />
          </Box>
          
          {/* Date Filter */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', mt: 2, alignItems: 'center', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { sx: { width: 200 } } }}
              />
              
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { sx: { width: 200 } } }}
              />
              
              <Button variant="text" onClick={handleClearDates} sx={{ ml: 1 }}>
                Clear Dates
              </Button>
              
              <Box sx={{ flex: 1 }} />
              
              <Typography variant="body2" color="text.secondary">
                Showing {products.length} products
              </Typography>
            </Box>
          </LocalizationProvider>
        </Box>
        
        {/* Products Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>HSN Code</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id?.slice(0, 10)}...</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category || 'Uncategorized'}</TableCell>
                      <TableCell>{product.hsn_code || '-'}</TableCell>
                      <TableCell align="center">{product.stock_quantity || 0}</TableCell>
                      <TableCell align="right">{formatCurrency(product.price || 0)}</TableCell>
                      <TableCell align="center">
                        {getStockStatusChip(product.stock_quantity || 0)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          size="small"
                          onClick={() => handleView(product)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
                {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalProducts)} of {totalProducts}
              </Typography>
              
              <IconButton 
                disabled={page === 0} 
                onClick={() => handleChangePage(page - 1)}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton 
                disabled={page >= getTotalPages() - 1} 
                onClick={() => handleChangePage(page + 1)}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleForceRefresh}
            >
              Force Refresh
            </Button>
          </Box>
        </Paper>
      </Box>
      
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
                  <Typography variant="body1">{formatCurrency(selectedProduct?.price || 0)}</Typography>
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
                    {getStockStatusChip(selectedProduct?.stock_quantity || 0)}
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
              window.location.href = `/products/edit/${selectedProduct?.id}`;
            }}
          >
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductCollections; 