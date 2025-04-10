import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useInventory } from '../../hooks/useInventory';
import { formatCurrency } from '../../utils/format';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

interface ProductBalanceTableProps {
  productFilter?: string; // Optional product name filter
}

const ProductBalanceTable: React.FC<ProductBalanceTableProps> = ({ productFilter }) => {
  const { balanceStockQuery, recalculateBalanceStock } = useInventory();
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  const balanceStock = balanceStockQuery.data || [];
  const isLoading = balanceStockQuery.isLoading;
  const error = balanceStockQuery.error;

  // Filter products based on productFilter and search
  useEffect(() => {
    let filtered = [...balanceStock];
    
    // Apply product filter if provided
    if (productFilter) {
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase() === productFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase().includes(searchLower) ||
        product.hsn_code?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredProducts(filtered);
  }, [balanceStock, productFilter, search]);

  // Handle refresh
  const handleRefresh = () => {
    recalculateBalanceStock().then(() => {
      balanceStockQuery.refetch();
    });
  };

  // Get stock status
  const getStockStatus = (currentStock: number) => {
    if (currentStock <= 0) {
      return { label: 'Out of Stock', color: 'error' };
    } else if (currentStock <= 5) {
      return { label: 'Low Stock', color: 'warning' };
    } else {
      return { label: 'In Stock', color: 'success' };
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Stock Balance {productFilter && `for "${productFilter}"`}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh Balance
        </Button>
      </Box>
      
      {/* Search */}
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Error loading stock balances'}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="balance stock table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Product Name</StyledTableCell>
                <StyledTableCell>HSN Code</StyledTableCell>
                <StyledTableCell align="right">Total Purchases</StyledTableCell>
                <StyledTableCell align="right">Sales</StyledTableCell>
                <StyledTableCell align="right">Salon Consumption</StyledTableCell>
                <StyledTableCell align="right">Current Balance</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="right">Value (₹)</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.current_stock);
                  return (
                    <TableRow key={product.id || product.product_name} hover>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>{product.hsn_code}</TableCell>
                      <TableCell align="right">{product.total_purchased || 0}</TableCell>
                      <TableCell align="right">{product.total_sold || 0}</TableCell>
                      <TableCell align="right">{product.total_consumed || 0}</TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            color: stockStatus.color === 'error' ? 'error.main' : 
                                   stockStatus.color === 'warning' ? 'warning.main' : 'success.main',
                          }}
                        >
                          {product.current_stock || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={stockStatus.label} 
                          color={stockStatus.color as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency((product.current_stock || 0) * (product.purchase_cost_per_unit_ex_gst || 0))}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    {productFilter 
                      ? `No stock balance found for "${productFilter}"`
                      : 'No stock balance data found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ProductBalanceTable; 