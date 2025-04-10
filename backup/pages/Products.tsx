import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  TextField,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProducts } from '../hooks/useProducts';
import { cn } from '../lib/utils';
import { formatCurrency } from '../utils/format';
// Import the new components
import ProductPurchaseForm from '../components/products/ProductPurchaseForm';
import ProductPurchaseTable from '../components/products/ProductPurchaseTable';
import ProductBalanceTable from '../components/products/ProductBalanceTable';

// Tab Panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`products-tabpanel-${index}`}
      aria-labelledby={`products-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

// Initial form state
const initialFormData = {
  product_name: '',
  hsn_code: '',
  unit_type: '',
  mrp_incl_gst: 0,
  gst_percentage: 18,
  discount_on_purchase_percentage: 0,
};

export default function Products() {
  const { products, isLoading, error, fetchProducts, addProduct, updateProduct, deleteProduct } = useProducts();
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    priceMin: '',
    priceMax: '',
    category: 'all',
    stockStatus: 'all',
  });
  // Add state for selected product filtering
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);

  // For inventory balance calculation
  const [productBalances, setProductBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fetch product balances from inventory sales and consumption
    const fetchProductBalances = async () => {
      // This would be implemented to fetch real balances
      // For now we'll use mock data
      const mockBalances: Record<string, number> = {};
      products.forEach(product => {
        mockBalances[product.id] = Math.floor(Math.random() * 20); // Mock stock value
      });
      setProductBalances(mockBalances);
    };

    if (products.length > 0) {
      fetchProductBalances();
    }
  }, [products]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    // Validate form
    if (!formData.product_name || !formData.hsn_code || !formData.unit_type) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }

    // Reset form
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleEditProduct = (product: any) => {
    setFormData({
      product_name: product.product_name,
      hsn_code: product.hsn_code,
      unit_type: product.unit_type,
      mrp_incl_gst: product.mrp_incl_gst,
      gst_percentage: product.gst_percentage,
      discount_on_purchase_percentage: product.discount_on_purchase_percentage,
    });
    setEditingId(product.id);
    setTabValue(1); // Switch to the Add Product tab
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  // Add handlers for viewing product purchases and balance
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product.product_name);
    setTabValue(2); // Switch to the Product Purchases tab
  };

  const handleViewBalance = (product: any) => {
    setSelectedProduct(product.product_name);
    setTabValue(3); // Switch to the Stock Balance tab
  };

  const filteredProducts = products.filter(product => {
    // Apply search filter
    if (filters.search && !product.product_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Apply price range filter
    if (filters.priceMin && product.mrp_incl_gst < parseFloat(filters.priceMin)) {
      return false;
    }
    if (filters.priceMax && product.mrp_incl_gst > parseFloat(filters.priceMax)) {
      return false;
    }

    // Apply stock status filter
    const balance = productBalances[product.id] || 0;
    if (filters.stockStatus === 'inStock' && balance <= 0) {
      return false;
    }
    if (filters.stockStatus === 'outOfStock' && balance > 0) {
      return false;
    }
    if (filters.stockStatus === 'lowStock' && (balance > 5 || balance <= 0)) {
      return false;
    }

    return true;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" color="primary">
            Product Management
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="product tabs"
          >
            <Tab label="All Products" id="tab-0" />
            <Tab label="Add New Product" id="tab-1" />
            <Tab label="Product Purchases" id="tab-2" />
            <Tab label="Stock Balance" id="tab-3" />
          </Tabs>
        </Paper>

        {/* Product Add Form */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingId ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="HSN Code *"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Unit Type *"
                  name="unit_type"
                  value={formData.unit_type}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MRP (Incl. GST) *"
                  name="mrp_incl_gst"
                  type="number"
                  value={formData.mrp_incl_gst}
                  onChange={handleNumberInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="GST Percentage *"
                  name="gst_percentage"
                  type="number"
                  value={formData.gst_percentage}
                  onChange={handleNumberInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Discount on Purchase (%)"
                  name="discount_on_purchase_percentage"
                  type="number"
                  value={formData.discount_on_purchase_percentage}
                  onChange={handleNumberInputChange}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddProduct}
                startIcon={<AddIcon />}
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </Button>
              {editingId && (
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => {
                    setFormData(initialFormData);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Paper>
        </TabPanel>

        {/* Product List */}
        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search products..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Min Price"
                  name="priceMin"
                  type="number"
                  value={filters.priceMin}
                  onChange={handleFilterChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Max Price"
                  name="priceMax"
                  type="number"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Stock Status</InputLabel>
                  <Select
                    name="stockStatus"
                    value={filters.stockStatus}
                    onChange={handleSelectChange as any}
                    label="Stock Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="inStock">In Stock</MenuItem>
                    <MenuItem value="outOfStock">Out of Stock</MenuItem>
                    <MenuItem value="lowStock">Low Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setFilters({
                      search: '',
                      priceMin: '',
                      priceMax: '',
                      category: 'all',
                      stockStatus: 'all',
                    })}
                  >
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Products Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader aria-label="products table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product Name</StyledTableCell>
                    <StyledTableCell>HSN Code</StyledTableCell>
                    <StyledTableCell>Unit Type</StyledTableCell>
                    <StyledTableCell align="right">MRP (Incl. GST)</StyledTableCell>
                    <StyledTableCell align="center">GST %</StyledTableCell>
                    <StyledTableCell align="center">Current Stock</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>{product.product_name}</TableCell>
                        <TableCell>{product.hsn_code}</TableCell>
                        <TableCell>{product.unit_type}</TableCell>
                        <TableCell align="right">{formatCurrency(product.mrp_incl_gst)}</TableCell>
                        <TableCell align="center">{product.gst_percentage}%</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography
                              sx={{
                                fontWeight: 'bold',
                                color: 
                                  productBalances[product.id] === 0 ? 'error.main' : 
                                  productBalances[product.id] <= 5 ? 'warning.main' : 'success.main',
                              }}
                            >
                              {productBalances[product.id] || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditProduct(product)}
                            title="Edit Product"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleViewProduct(product)}
                            title="View Purchases"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Purchase History Tab - Updated to use new components */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            {/* Add Purchase Form */}
            <ProductPurchaseForm />
            
            <Divider sx={{ my: 4 }} />
            
            {/* Purchase History Table */}
            <ProductPurchaseTable productFilter={selectedProduct} />
          </Box>
        </TabPanel>

        {/* Stock Balance Tab - Updated to use new component */}
        <TabPanel value={tabValue} index={3}>
          <ProductBalanceTable productFilter={selectedProduct} />
        </TabPanel>
      </Box>
    </Container>
  );
} 