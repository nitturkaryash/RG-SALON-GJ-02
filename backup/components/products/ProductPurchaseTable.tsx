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
  IconButton,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
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

interface ProductPurchaseTableProps {
  productFilter?: string; // Optional product name filter
}

const ProductPurchaseTable: React.FC<ProductPurchaseTableProps> = ({ productFilter }) => {
  const { purchasesQuery, deletePurchase } = useInventory();
  const [search, setSearch] = useState('');
  const [filteredPurchases, setFilteredPurchases] = useState<any[]>([]);
  
  const purchases = purchasesQuery.data || [];
  const isLoading = purchasesQuery.isLoading;
  const error = purchasesQuery.error;

  // Filter purchases based on productFilter and search
  useEffect(() => {
    let filtered = [...purchases];
    
    // Apply product filter if provided
    if (productFilter) {
      filtered = filtered.filter(purchase => 
        purchase.product_name.toLowerCase() === productFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(purchase => 
        purchase.product_name.toLowerCase().includes(searchLower) ||
        purchase.hsn_code?.toLowerCase().includes(searchLower) ||
        purchase.units?.toLowerCase().includes(searchLower) ||
        purchase.purchase_invoice_number?.toLowerCase().includes(searchLower) ||
        purchase.vendor_name?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredPurchases(filtered);
  }, [purchases, productFilter, search]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle purchase deletion
  const handleDelete = async (purchaseId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase record?')) {
      try {
        await deletePurchase(purchaseId);
        purchasesQuery.refetch();
      } catch (error) {
        console.error('Error deleting purchase:', error);
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    purchasesQuery.refetch();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Purchase History {productFilter && `for "${productFilter}"`}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Search */}
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        placeholder="Search purchases..."
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
          {error instanceof Error ? error.message : 'Error loading purchases'}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="purchases table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Product Name</StyledTableCell>
                <StyledTableCell>HSN Code</StyledTableCell>
                <StyledTableCell align="right">Quantity</StyledTableCell>
                <StyledTableCell align="right">MRP (Incl. GST)</StyledTableCell>
                <StyledTableCell align="right">Invoice Value</StyledTableCell>
                <StyledTableCell>Invoice #</StyledTableCell>
                <StyledTableCell align="center">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id || purchase.purchase_id} hover>
                    <TableCell>{formatDate(purchase.date)}</TableCell>
                    <TableCell>{purchase.product_name}</TableCell>
                    <TableCell>{purchase.hsn_code}</TableCell>
                    <TableCell align="right">{purchase.purchase_qty}</TableCell>
                    <TableCell align="right">{formatCurrency(purchase.mrp_incl_gst)}</TableCell>
                    <TableCell align="right">{formatCurrency(purchase.purchase_invoice_value_rs)}</TableCell>
                    <TableCell>{purchase.purchase_invoice_number}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(purchase.id || purchase.purchase_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    {productFilter 
                      ? `No purchase records found for "${productFilter}"`
                      : 'No purchase records found'}
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

export default ProductPurchaseTable; 