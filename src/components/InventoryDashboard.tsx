import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import { supabase } from '../lib/supabase';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshInventoryButton from './RefreshInventoryButton';
import { useNavigate } from 'react-router-dom';

interface StockSummary {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  inStockCount: number;
  lowStockItems: LowStockItem[];
}

interface LowStockItem {
  product_name: string;
  balance_qty: number;
  hsn_code?: string;
}

/**
 * Dashboard component that provides an overview of inventory status
 * Shows counts of total products, out of stock, low stock, and in stock
 * Also displays a list of products that are low on stock or out of stock
 */
const InventoryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalProducts: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    inStockCount: 0,
    lowStockItems: [],
  });
  const navigate = useNavigate();

  // Function to fetch stock data and calculate summary
  const fetchStockSummary = async () => {
    setLoading(true);
    try {
      const { data: balanceStock, error } = await supabase
        .from('inventory_balance_stock')
        .select('*');

      if (error) throw error;

      if (balanceStock) {
        // Calculate counts
        const outOfStock = balanceStock.filter(
          item => typeof item.balance_qty === 'number' && item.balance_qty <= 0
        );

        const lowStock = balanceStock.filter(
          item =>
            typeof item.balance_qty === 'number' &&
            item.balance_qty > 0 &&
            item.balance_qty <= 3
        );

        const inStock = balanceStock.filter(
          item => typeof item.balance_qty === 'number' && item.balance_qty > 3
        );

        // Get low and out of stock items for display
        const criticalItems = [...outOfStock, ...lowStock].sort(
          (a, b) => (a.balance_qty || 0) - (b.balance_qty || 0)
        );

        setStockSummary({
          totalProducts: balanceStock.length,
          outOfStockCount: outOfStock.length,
          lowStockCount: lowStock.length,
          inStockCount: inStock.length,
          lowStockItems: criticalItems,
        });
      }
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStockSummary();

    // Listen for inventory updates
    const handleInventoryUpdate = () => {
      fetchStockSummary();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener(
      'inventory-refresh-requested',
      handleInventoryUpdate
    );

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener(
        'inventory-refresh-requested',
        handleInventoryUpdate
      );
    };
  }, []);

  // Navigate to products page when add products button is clicked
  const handleAddProducts = () => {
    navigate('/products');
  };

  // Navigate to inventory page when view inventory button is clicked
  const handleViewInventory = () => {
    navigate('/inventory');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6'>Inventory Overview</Typography>
        <RefreshInventoryButton onRefresh={fetchStockSummary} />
      </Box>

      <Grid container spacing={2}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Total Products
              </Typography>
              <Typography variant='h4'>{stockSummary.totalProducts}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Typography color='error.dark' gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant='h4' color='error.dark'>
                {stockSummary.outOfStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography color='warning.dark' gutterBottom>
                Low Stock
              </Typography>
              <Typography variant='h4' color='warning.dark'>
                {stockSummary.lowStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography color='success.dark' gutterBottom>
                In Stock
              </Typography>
              <Typography variant='h4' color='success.dark'>
                {stockSummary.inStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Critical Stock Items
              </Typography>

              {stockSummary.lowStockItems.length > 0 ? (
                <Grid container spacing={1}>
                  {stockSummary.lowStockItems.map(item => (
                    <Grid item key={item.product_name}>
                      <Chip
                        icon={
                          item.balance_qty <= 0 ? (
                            <ErrorIcon />
                          ) : (
                            <WarningIcon />
                          )
                        }
                        label={`${item.product_name}: ${item.balance_qty <= 0 ? 'Out of Stock' : `${item.balance_qty} left`}`}
                        color={item.balance_qty <= 0 ? 'error' : 'warning'}
                        variant='outlined'
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <CheckCircleIcon color='success' sx={{ mr: 1 }} />
                  <Typography>All products are well-stocked!</Typography>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleAddProducts}
                >
                  Add New Products
                </Button>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={handleViewInventory}
                >
                  View Full Inventory
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryDashboard;
