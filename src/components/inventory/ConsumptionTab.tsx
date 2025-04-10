import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  TablePagination,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Chip,
  Link,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Sync as SyncIcon, 
  Info as InfoIcon, 
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  FileDownload as FileDownloadIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Consumption } from '../../models/inventoryTypes';
import { useInventory } from '../../hooks/useInventory';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { convertToCSV, downloadCSV } from '../../utils/csvExporter';
import { formatCurrency } from '../../utils/format';

interface ConsumptionTabProps {
  consumption: Consumption[];
  isLoading: boolean;
  error: Error | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`consumption-tabpanel-${index}`}
      aria-labelledby={`consumption-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

const StyledTableHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#FFFF88', // Yellow background for table header
  '& .MuiTableCell-root': {
    color: '#000000',
    fontWeight: 'bold',
    border: '1px solid #cccccc',
    textAlign: 'center',
    padding: '8px',
  }
}));

const ConsumptionTab: React.FC<ConsumptionTabProps> = ({ consumption, isLoading, error }) => {
  const navigate = useNavigate();
  const { 
    syncConsumptionFromPos, 
    isSyncingConsumption,
    processingStats,
    consumptionQuery,
    salonConsumptionOrdersQuery,
    combinedConsumptionQuery,
    deleteConsumption
  } = useInventory();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [syncingFromPOS, setSyncingFromPOS] = useState(false);
  const [dataSourceTab, setDataSourceTab] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set initial date range (30 days ago to today) in the correct format
  const getFormattedDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    return {
      startDate: getFormattedDate(thirtyDaysAgo),
      endDate: getFormattedDate(today)
    };
  });

  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());

  // Add state for auto-sync interval
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  
  // Handle tab change
  const handleDataSourceTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setDataSourceTab(newValue);
    setPage(0); // Reset pagination when changing tabs
  };

  // Auto-sync every minute if enabled and tab is visible
  useEffect(() => {
    if (!autoSyncEnabled) return;

    const autoSyncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const now = new Date();
        // Only refresh if it's been more than a minute since last refresh
        if (!lastAutoSync || now.getTime() - lastAutoSync.getTime() > 60 * 1000) {
          console.log('Auto-refreshing salon consumption data');
          consumptionQuery.refetch();
          salonConsumptionOrdersQuery.refetch();
          combinedConsumptionQuery.refetch();
          setLastAutoSync(now);
        }
      }
    }, 15 * 1000); // Check every 15 seconds
    
    return () => clearInterval(autoSyncInterval);
  }, [autoSyncEnabled, lastAutoSync, consumptionQuery, salonConsumptionOrdersQuery, combinedConsumptionQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };salonConsumptionOrdersQuery

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenSyncDialog = () => {
    // Reset to reasonable default dates: 30 days ago to today
    const today = new Date();
    setDateRange({
      startDate: getFormattedDate(new Date(today.setDate(today.getDate() - 30))),
      endDate: getFormattedDate(new Date())
    });
    setSyncDialogOpen(true);
  };

  const handleCloseSyncDialog = () => {
    setSyncDialogOpen(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRefresh = () => {
    consumptionQuery.refetch();
    salonConsumptionOrdersQuery.refetch();
    combinedConsumptionQuery.refetch();
    setLastRefreshed(new Date());
  };
  
  const handleNavigateToPOS = () => {
    navigate('/pos');
  };

  const handleSyncData = async () => {
    try {
      setSyncError(null);
      setSyncingFromPOS(true);
      
      // Validate date range to prevent future dates
      const today = new Date();
      const todayStr = getFormattedDate(today);
      
      let validStartDate = dateRange.startDate;
      let validEndDate = dateRange.endDate;
      
      // If end date is in the future, use today's date
      if (validEndDate > todayStr) {
        validEndDate = todayStr;
        console.log('Adjusted end date to today:', validEndDate);
      }
      
      // If start date is in the future, use 30 days before end date
      if (validStartDate > todayStr) {
        const adjustedStart = new Date(new Date(validEndDate).setDate(new Date(validEndDate).getDate() - 30));
        validStartDate = getFormattedDate(adjustedStart);
        console.log('Adjusted start date:', validStartDate);
      }
      
      console.log('Starting sync of salon consumption records with validated date range:', { start: validStartDate, end: validEndDate });
      
      // Call sync with validated date parameters
      const result = await syncConsumptionFromPos(validStartDate, validEndDate, 'salon');
      
      if (result && result.success) {
        if (result.data && result.data.length > 0) {
          toast.success(`Successfully synced ${result.data.length} salon consumption records from POS`);
        } else {
          toast.info('No new salon consumption records found in date range');
        }
        
        handleCloseSyncDialog();
      } else if (result && result.error) {
        toast.error(`Error syncing salon consumption: ${result.error.message || 'Unknown error'}`);
      }
      
      // Refresh all data sources
      await Promise.all([
        consumptionQuery.refetch(),
        salonConsumptionOrdersQuery.refetch(),
        combinedConsumptionQuery.refetch()
      ]);
      
      setLastRefreshed(new Date());
      setLastAutoSync(new Date());
    } catch (error) {
      console.error('Error syncing consumption data:', error);
      setSyncError(error instanceof Error ? error : new Error('Failed to sync consumption data'));
      toast.error('Failed to sync salon consumption records. Please try again.');
    } finally {
      setSyncingFromPOS(false);
    }
  };
  
  const handleSyncFromPOS = async () => {
    try {
      setSyncingFromPOS(true);
      // Get date range for last 30 days
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
      
      console.log(`Syncing salon consumption with date range: ${startDate} to ${endDate}`);
      
      // Pass the type parameter to ensure we only sync salon consumption data
      const result = await syncConsumptionFromPos(startDate, endDate, 'salon');
      
      if (result && result.success) {
        if (result.data && result.data.length > 0) {
          toast.success(`Successfully synced ${result.data.length} salon consumption records from POS`);
        } else {
          toast.info('No new salon consumption records found in POS');
        }
      } else if (result && result.error) {
        toast.error(`Error syncing salon consumption: ${result.error.message || 'Unknown error'}`);
      }
      
      // Refresh all data sources
      handleRefresh();
    } catch (error) {
      console.error('Error syncing consumption from POS:', error);
      toast.error('Failed to sync salon consumption data');
    } finally {
      setSyncingFromPOS(false);
    }
  };

  const exportToCSV = () => {
    try {
      setExportingCSV(true);
      
      // Get all consumption records and format for CSV
      const csvData = consumption.map(item => ({
        'Product Name': item.product_name || 'Unknown Product',
        'Requisition Voucher No.': item.order_id || item.requisition_voucher_no || 'N/A',
        'Consumption Qty.': item.quantity || item.consumption_qty || 0,
        'Purchase Cost per Unit (Ex.GST) (Rs.)': item.cost_per_unit || item.purchase_cost_per_unit_ex_gst || 0,
        'Purchase GST Percentage': (item.gst_percentage || item.purchase_gst_percentage || 18).toFixed(2) + '%',
        'Purchase Taxable Value (Rs.)': item.taxable_value || item.purchase_taxable_value || 0,
        'Purchase IGST (Rs.)': item.igst || item.purchase_igst || 0,
        'Purchase CGST (Rs.)': item.cgst || item.purchase_cgst || 0,
        'Purchase SGST (Rs.)': item.sgst || item.purchase_sgst || 0,
        'Total Purchase Cost (Rs.)': item.total || item.total_purchase_cost || 0,
      }));
      
      const csvString = convertToCSV(csvData);
      downloadCSV(csvString, `Salon_Consumption_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export data to CSV');
    } finally {
      setExportingCSV(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Calculate progress percentage for sync operation
  const calculateProgress = () => {
    if (!processingStats) return 0;
    return (processingStats.processed / processingStats.total) * 100;
  };

  const renderConsumptionTable = () => {
    // Aggregate consumption records by product
    const aggregatedConsumption = consumption.reduce((acc, item) => {
      const key = item.product_name || 'Unknown Product';
      
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantity: 0,
          taxable_value: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
          orders: [] // Keep track of orders for this product
        };
      }
      
      const record = acc[key];
      record.quantity += parseFloat(item.quantity || item.consumption_qty || '0');
      record.taxable_value += parseFloat(item.taxable_value || '0');
      record.cgst += parseFloat(item.cgst || '0');
      record.sgst += parseFloat(item.sgst || '0');
      record.igst += parseFloat(item.igst || '0');
      record.total += parseFloat(item.total || '0');
      record.orders.push(item.order_id || item.requisition_voucher_no);
      
      return acc;
    }, {});

    // Convert to array and sort by product name
    const aggregatedRecords = Object.values(aggregatedConsumption)
      .sort((a: any, b: any) => a.product_name.localeCompare(b.product_name));

    // Apply pagination
    const paginatedRecords = aggregatedRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <StyledTableHeaderRow>
              <StyledTableCell>Product Name</StyledTableCell>
              <StyledTableCell align="right">Total Consumption Qty.</StyledTableCell>
              <StyledTableCell align="right">Purchase Cost per Unit (Ex.GST) (Rs.)</StyledTableCell>
              <StyledTableCell align="right">Purchase GST Percentage</StyledTableCell>
              <StyledTableCell align="right">Total Purchase Taxable Value (Rs.)</StyledTableCell>
              <StyledTableCell align="right">Total Purchase IGST (Rs.)</StyledTableCell>
              <StyledTableCell align="right">Total Purchase CGST (Rs.)</StyledTableCell>
              <StyledTableCell align="right">Total Purchase SGST (Rs.)</StyledTableCell>
              <StyledTableCell align="right">Total Purchase Cost (Rs.)</StyledTableCell>
              <StyledTableCell>Related Orders</StyledTableCell>
            </StyledTableHeaderRow>
          </TableHead>
          <TableBody>
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((item: any) => (
                <TableRow key={item.product_name}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShoppingBasketIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                      <Typography variant="body2">
                        {item.product_name || 'Unknown product'}
          </Typography>
                    </Box>
                    {item.hsn_code && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        HSN: {item.hsn_code}
              </Typography>
            )}
                  </TableCell>
                  <TableCell align="right">{item.quantity.toFixed(2)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.cost_per_unit || 0, false)}</TableCell>
                  <TableCell align="right">{(item.gst_percentage || 18).toFixed(2)}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.taxable_value)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.igst)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.cgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.sgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200, overflow: 'hidden' }}>
                      <Tooltip title={item.orders.join(', ')}>
                        <Typography variant="caption" noWrap>
                          {item.orders.length} orders
              </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Alert severity="info">No consumption records found.</Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={aggregatedRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    );
  };
  
  const renderSalonConsumptionOrdersTable = () => {
    // Get data from salonConsumptionOrdersQuery
    const salonOrders = salonConsumptionOrdersQuery.data || [];
    
    // Show loading state while fetching
    if (salonConsumptionOrdersQuery.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }
    
    // Show error if any
    if (salonConsumptionOrdersQuery.error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading salon consumption orders: {String(salonConsumptionOrdersQuery.error)}
        </Alert>
      );
    }
    
    // Show empty state if no orders
    if (salonOrders.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No salon consumption orders found. Add salon consumption in the POS system.
        </Alert>
      );
    }
    
    // Prepare orders for pagination
    const paginatedOrders = salonOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Order ID</StyledTableCell>
              <StyledTableCell>Purpose</StyledTableCell>
              <StyledTableCell>Products</StyledTableCell>
              <StyledTableCell>Total Value</StyledTableCell>
              <StyledTableCell>Notes</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map(order => {
              // Calculate total value of products
              const totalValue = order.services?.reduce((sum: number, service: any) => {
                if (service.type === 'product') {
                  return sum + (service.price || 0) * (service.quantity || 1);
                }
                return sum;
              }, 0) || 0;
              
              // Count products
              const productCount = order.services?.filter((service: any) => service.type === 'product').length || 0;
              
              return (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <InventoryIcon fontSize="small" color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontFamily="monospace">
                        {order.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.consumption_purpose || 'Salon Use'} 
                      size="small" 
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {order.services?.filter((service: any) => service.type === 'product').slice(0, 2).map((service: any, idx: number) => (
                        <Chip 
                          key={idx}
                          label={`${service.service_name} (×${service.quantity || 1})`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {productCount > 2 && (
                        <Chip
                          label={`+${productCount - 2} more`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(totalValue)}</TableCell>
                  <TableCell>
                    {order.consumption_notes || 'No notes'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete this consumption order?`)) {
                          // Call delete function
                          handleDeleteConsumption(order.id);
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  const renderConsumptionStats = () => {
    const combinedData = combinedConsumptionQuery.data;
    
    // Show loading state
    if (combinedConsumptionQuery.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }
    
    // Show error if any
    if (combinedConsumptionQuery.error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading consumption statistics: {String(combinedConsumptionQuery.error)}
        </Alert>
      );
    }
    
    if (!combinedData || !combinedData.statsByProduct) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No consumption statistics available.
        </Alert>
      );
    }
    
    // Get products data
    const productStats = combinedData.statsByProduct;
    const productNames = Object.keys(productStats);
    
    if (productNames.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No products have been consumed in the salon.
        </Alert>
      );
    }
    
    // Create stats summary
    const totalProducts = productNames.length;
    const totalQuantityConsumed = productNames.reduce((sum, name) => sum + productStats[name].totalConsumed, 0);
    const totalCost = productNames.reduce((sum, name) => sum + productStats[name].totalCost, 0);
    const lowStockProducts = productNames.filter(name => {
      const stats = productStats[name];
      return stats.totalPurchased > 0 && stats.remainingStock <= 5 && stats.consumptionPercentage >= 70;
    }).length;
    
    // Sort products by consumption percentage (descending)
    const sortedProducts = productNames.sort((a, b) => {
      return productStats[b].consumptionPercentage - productStats[a].consumptionPercentage;
    });
    
    // Pagination for product stats
    const paginatedProducts = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    return (
      <>
        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Products Consumed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                  {totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Quantity Used
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                  {totalQuantityConsumed.toFixed(0)} units
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Consumption Value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500, mt: 1 }}>
                  {formatCurrency(totalCost)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant={lowStockProducts > 0 ? 'elevation' : 'outlined'} 
                  elevation={lowStockProducts > 0 ? 3 : 1}
                  sx={{ 
                    p: 2, 
                    bgcolor: lowStockProducts > 0 ? 'warning.light' : 'inherit',
                    borderColor: lowStockProducts > 0 ? 'warning.main' : 'inherit'
                  }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {lowStockProducts > 0 && <WarningIcon color="warning" sx={{ mr: 1 }} />}
                  <Typography color={lowStockProducts > 0 ? 'warning.main' : 'text.secondary'} variant="body2" gutterBottom>
                    Low Stock Products
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 500, mt: 1, color: lowStockProducts > 0 ? 'warning.main' : 'inherit' }}>
                  {lowStockProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Products table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Product</StyledTableCell>
                <StyledTableCell>Total Purchased</StyledTableCell>
                <StyledTableCell>Total Consumed</StyledTableCell>
                <StyledTableCell>Remaining Stock</StyledTableCell>
                <StyledTableCell>Usage %</StyledTableCell>
                <StyledTableCell>Cost/Unit</StyledTableCell>
                <StyledTableCell>Total Value</StyledTableCell>
                <StyledTableCell>Last Consumption</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map(productName => {
                const stats = productStats[productName];
                const isLowStock = stats.totalPurchased > 0 && stats.remainingStock <= 5 && stats.consumptionPercentage >= 70;
                
                return (
                  <TableRow 
                    key={productName}
                    sx={{ 
                      bgcolor: isLowStock ? 'rgba(255, 152, 0, 0.1)' : 'inherit',
                      '&:hover': { bgcolor: isLowStock ? 'rgba(255, 152, 0, 0.15)' : 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isLowStock && <WarningIcon fontSize="small" color="warning" sx={{ mr: 1 }} />}
                        <Typography variant="body2" fontWeight={isLowStock ? 500 : 400}>
                          {productName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{stats.totalPurchased.toFixed(0)}</TableCell>
                    <TableCell>{stats.totalConsumed.toFixed(0)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={isLowStock ? 600 : 400}
                          color={isLowStock ? 'warning.main' : 'inherit'}
                        >
                          {stats.remainingStock.toFixed(0)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(stats.consumptionPercentage, 100)} 
                          sx={{ 
                            flexGrow: 1, 
                            height: 6, 
                            borderRadius: 3, 
                            mr: 1,
                            backgroundColor: isLowStock ? 'rgba(255, 152, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                            '.MuiLinearProgress-bar': {
                              backgroundColor: isLowStock ? 'warning.main' : 'primary.main'
                            }
                          }} 
                        />
                        <Typography variant="body2">
                          {stats.consumptionPercentage.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(stats.records[0]?.cost_per_unit || 0)}</TableCell>
                    <TableCell>{formatCurrency(stats.totalCost)}</TableCell>
                    <TableCell>{formatDate(stats.lastConsumptionDate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  // Add function to delete consumption record
  const handleDeleteConsumption = async (consumptionId: string) => {
    try {
      setIsDeleting(true);
      
      // Call deletePurchase from useInventory hook
      await deleteConsumption(consumptionId);
      
      // Refresh consumption data
      consumptionQuery.refetch();
      salonConsumptionOrdersQuery.refetch();
      combinedConsumptionQuery.refetch();
      
      // Show success message
      toast.success('Consumption record deleted successfully!');
    } catch (error) {
      console.error('Error deleting consumption record:', error);
      toast.error('Failed to delete consumption record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Salon Consumption Records
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSyncFromPOS}
            disabled={syncingFromPOS || isSyncingConsumption}
            startIcon={
              syncingFromPOS || isSyncingConsumption ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SyncIcon />
              )
            }
          >
            Sync POS Consumption
          </Button>
        </Box>
      </Box>
      
      {lastRefreshed && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </Typography>
      )}
      
      {/* Data source tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={dataSourceTab} 
          onChange={handleDataSourceTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="fullWidth"
        >
          <Tab 
            label="Product Stats" 
            icon={<BarChartIcon />}
            iconPosition="start"
          />
          <Tab 
            label="POS Consumption Orders" 
            icon={<InventoryIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Inventory Consumption Records" 
            icon={<ShoppingBasketIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      {/* Content based on selected tab */}
      <TabPanel value={dataSourceTab} index={0}>
        {renderConsumptionStats()}
      </TabPanel>
      
      <TabPanel value={dataSourceTab} index={1}>
        {renderSalonConsumptionOrdersTable()}
      </TabPanel>
      
      <TabPanel value={dataSourceTab} index={2}>
        {renderConsumptionTable()}
      </TabPanel>
      
      {/* Pagination - works for both tabs */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
        count={dataSourceTab === 0 
          ? (Object.keys(combinedConsumptionQuery.data?.statsByProduct || {}).length)
          : dataSourceTab === 1
          ? (salonConsumptionOrdersQuery.data?.length || 0) 
          : consumption.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
      
      {/* Export and Add buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={exportingCSV ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          onClick={exportToCSV}
          disabled={exportingCSV || (!combinedConsumptionQuery.data?.detailedRecords.length)}
        >
          Export CSV
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleNavigateToPOS}
        >
          Add New Consumption in POS
        </Button>
      </Box>
      
      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onClose={handleCloseSyncDialog}>
        <DialogTitle>Sync Salon Consumption</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose a date range to sync salon consumption records.
          </DialogContentText>
          
          <Box sx={{ my: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              inputProps={{
                max: getFormattedDate(new Date()) // Prevent future dates
              }}
            />
            
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              inputProps={{
                max: getFormattedDate(new Date()) // Prevent future dates
              }}
            />
          </Box>
          
          {syncError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {syncError.message}
            </Alert>
          )}
          
          {processingStats && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Processing: {processingStats.processed} of {processingStats.total}
              </Typography>
              <LinearProgress variant="determinate" value={calculateProgress()} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="success.main">
                  Succeeded: {processingStats.succeeded}
                </Typography>
                <Typography variant="caption" color="error">
                  Failed: {processingStats.failed}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSyncDialog}>Cancel</Button>
          <Button 
            onClick={handleSyncData}
            variant="contained" 
            color="primary"
            disabled={isSyncingConsumption}
          >
            {isSyncingConsumption ? 'Syncing...' : 'Sync Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsumptionTab; 