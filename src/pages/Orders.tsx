import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Grid,
  Divider,
  ButtonGroup,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardHeader,
  TablePagination,
  Container,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Spa as SpaIcon,
  Inventory as InventoryIcon,
  ShoppingBag as ShoppingBagIcon,
  PaymentRounded as PaymentIcon,
  DateRange as DateRangeIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  LocalMall as LocalMallIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  ContentCut as ContentCutIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/format'
import { AccessibleDialog } from '../components/AccessibleDialog'
import { exportToCSV, exportToPDF, formatOrdersForExport, orderExportHeaders } from '../utils/exportUtils'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PaymentMethod, usePOS, PaymentDetail } from '../hooks/usePOS'
import CompletePaymentDialog from '../components/orders/CompletePaymentDialog'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { toast } from 'react-toastify'
import ErrorBoundary from '../components/ErrorBoundary'
import { useNavigate } from 'react-router-dom'
import { Order as BaseOrder } from '../models/orderTypes'
import { useServiceCollections } from '../hooks/useServiceCollections'
import { supabase, TABLES } from '../utils/supabase/supabaseClient'
import { useQueryClient } from '@tanstack/react-query'

// Extended Order interface that encapsulates all the properties we need
type ExtendedOrder = {
  id: string;
  created_at?: string;
  date?: string;
  client_name?: string; 
  customer_name?: string;
  stylist_name?: string;
  stylist?: { name?: string; id?: string };
  status: 'pending' | 'completed' | 'cancelled' | string;
  total?: number;
  total_amount?: number;
  pending_amount?: number;
  payment_method?: string;
  payments?: any[];
  services?: any[];
  consumption_purpose?: string;
  _productCategories?: string[];
  _serviceCategories?: string[];
  // Required for type assertion compatibility
  [key: string]: any;
};

// Tab values for order categories
enum OrderTab {
  ALL = 'all',
  COMPLETED = 'completed',
  PENDING = 'pending',
  SALON_CONSUMPTION = 'salon_consumption',
  SERVICES = 'services',
  PRODUCTS = 'products',
}

// Interface for date range filter
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export default function Orders() {
  const queryClient = useQueryClient()
  const { orders, isLoading, refreshOrders, deleteOrderById, deleteAllOrders } = useOrders()
  const { updateOrderPayment } = usePOS()
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<OrderTab>(OrderTab.ALL)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  })
  const [isSalonPurchaseFilter, setIsSalonPurchaseFilter] = useState<string>('all')
  
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null)
  
  // Delete all orders confirmation
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Order stats
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    salonPurchases: 0,
    services: 0,
    products: 0,
    totalRevenue: 0,
  })
  
  // Update order stats when orders change
  useEffect(() => {
    if (orders) {
      const stats = {
        total: orders.length,
        completed: orders.filter(order => normalizeOrder(order).status === 'completed').length,
        pending: orders.filter(order => normalizeOrder(order).status === 'pending').length,
        salonPurchases: orders.filter(order => isSalonConsumptionOrder(normalizeOrder(order))).length,
        services: orders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'service' || type === 'both';
        }).length,
        products: orders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'product' || type === 'both';
        }).length,
        totalRevenue: orders.reduce((sum, orderRaw) => {
          const order = normalizeOrder(orderRaw);
          // Only count completed orders or the paid portion of pending orders
          if (order.status === 'completed') {
            return sum + (order.total || 0);
          } else if (order.status === 'pending' && (order.pending_amount || 0) < (order.total || 0)) {
            return sum + ((order.total || 0) - (order.pending_amount || 0));
          }
          return sum;
        }, 0),
      };
      setOrderStats(stats);
    }
  }, [orders]);

  // Convert any order to our ExtendedOrder type
  const normalizeOrder = (order: any): ExtendedOrder => {
    return {
      ...order,
      status: order.status || 'pending',
      client_name: order.client_name || order.customer_name,
      customer_name: order.customer_name || order.client_name,
      total: order.total || order.total_amount || 0,
      total_amount: order.total_amount || order.total || 0,
    } as ExtendedOrder;
  };

  // When orders are loaded from the API, normalize them (commented out to prevent recursion)
  /*
  useEffect(() => {
    if (rawOrders?.length) {
      setOrders(rawOrders.map(normalizeOrder));
    }
  }, [rawOrders]);
  */

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    // Clear the selected order after dialog closes
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const handleDeleteOrder = async (order: any) => {
    setOrderToDelete(order)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return
    
    try {
      const orderId = orderToDelete.order_id || orderToDelete.id
      
      if (!orderId) {
        toast.error('Order ID not found')
        return
      }
      
      toast.info('Deleting order...')
      
      const success = await deleteOrderById(orderId)
      
      if (success) {
        // The secondary delete for salon_consumption_products is assumed to be handled by the backend
        // or within deleteOrderById. Removing the explicit client-side attempt.
        
        setDeleteConfirmOpen(false)
        setOrderToDelete(null)
        if (filteredOrders.length <= rowsPerPage && page > 0) {
          setPage(0)
        }
        // Invalidate clients query to refetch client data
        queryClient.invalidateQueries({ queryKey: ['clients'] })
        // Ensure a success toast for the primary deletion is shown if not handled by deleteOrderById.
        // For example: toast.success('Order deleted successfully');
      }
    } catch (error) {
      console.error('Error in confirmDeleteOrder:', error)
      toast.error('Failed to delete order')
    }
  }

  const handleDeleteAllOrders = () => {
    setDeleteAllConfirmOpen(true)
  }

  const confirmDeleteAllOrders = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.info('Deleting all orders...', {
        autoClose: false,
        closeButton: false
      });
      
      // Disable the dialog buttons
      const deleteAllConfirmButton = document.querySelector('button[color="error"]');
      if (deleteAllConfirmButton) {
        (deleteAllConfirmButton as HTMLButtonElement).disabled = true;
        (deleteAllConfirmButton as HTMLButtonElement).innerHTML = 'Deleting...';
      }
      
      // Attempt to delete all orders
      const success = await deleteAllOrders();
      
      // Close the loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success('All orders have been deleted successfully');
        // Close the dialog
        setDeleteAllConfirmOpen(false);
        // Reset to first page
        setPage(0);
      } else {
        toast.error('Failed to delete all orders. Please try again.');
      }
    } catch (error) {
      console.error('Error in confirmDeleteAllOrders:', error);
      toast.error('An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Re-enable the dialog buttons if needed
      const deleteAllConfirmButton = document.querySelector('button[color="error"]');
      if (deleteAllConfirmButton) {
        (deleteAllConfirmButton as HTMLButtonElement).disabled = false;
        (deleteAllConfirmButton as HTMLButtonElement).innerHTML = 'Yes, Delete All Orders';
      }
    }
  }

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    
    const formattedOrders = formatOrdersForExport(filteredOrders);
    exportToCSV(formattedOrders, 'salon-orders-export', orderExportHeaders);
  }

  const handleExportPDF = () => {
    if (!orders || orders.length === 0) return;
    
    const formattedOrders = formatOrdersForExport(filteredOrders);
    exportToPDF(
      formattedOrders, 
      'salon-orders-export', 
      orderExportHeaders, 
      'Salon Orders Report'
    );
  }

  // Determine purchase type for an order
  const getPurchaseType = (order: ExtendedOrder) => {
    if (!order || !order.services || !Array.isArray(order.services) || order.services.length === 0) {
      return 'unknown';
    }
    
    const hasServices = order.services.some((service: any) => 
      service && (!service.type || service.type === 'service')
    );
    const hasProducts = order.services.some((service: any) => 
      service && service.type === 'product'
    );
    
    // Check product and service subcategories
    const productCategories = new Set();
    const serviceCategories = new Set();
    
    order.services.forEach((service: any) => {
      if (service) {
        if (service.type === 'product' && service.category) {
          productCategories.add(service.category.toLowerCase());
        } else if ((!service.type || service.type === 'service') && service.category) {
          serviceCategories.add(service.category.toLowerCase());
        }
      }
    });
    
    // Store the categories for filtering
    (order as any)._productCategories = Array.from(productCategories);
    (order as any)._serviceCategories = Array.from(serviceCategories);
    
    if (hasServices && hasProducts) return 'both';
    if (hasProducts) return 'product';
    return 'service';
  };

  // Function to detect if an order is a salon consumption order
  const isSalonConsumptionOrder = (order: ExtendedOrder) => {
    // Check all possible ways an order can be marked as salon consumption
    return (
      order.is_salon_consumption === true || 
      order.consumption_purpose || // Check for consumption_purpose field we added
      order.client_name === 'Salon Consumption' || // Match the client_name we set in handleCreateSalonConsumption
      (order.services && order.services.some((s: any) => s.for_salon_use === true)) // Check if any service is marked for salon use
    );
  };

  // Function that bridges between the component's expected prop name and our implementation
  const handleCompletePayment = (order: ExtendedOrder) => {
    setSelectedOrder(order)
    setPaymentDialogOpen(true)
  }

  // Handler for processing the payment update
  const handlePaymentUpdate = async (orderId: string, paymentDetails: PaymentDetail) => {
    // Assuming updateOrderPayment is a react-query mutation object
    await updateOrderPayment.mutateAsync({ orderId, paymentDetails }) 
  }
  
  // Function that bridges between CompletePaymentDialog's expected prop and our implementation
  const handleCompletePaymentSubmit = async (orderId: string, paymentDetails: PaymentDetail) => {
    return handlePaymentUpdate(orderId, paymentDetails);
  }
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: OrderTab) => {
    setActiveTab(newValue);
    
    // Reset pagination when changing tabs
    setPage(0);
    
    // Apply appropriate filters based on the selected tab
    switch (newValue) {
      case OrderTab.COMPLETED:
        setStatusFilter('completed');
        break;
      case OrderTab.PENDING:
        setStatusFilter('pending');
        break;
      case OrderTab.SALON_CONSUMPTION:
        setIsSalonPurchaseFilter('true');
        break;
      case OrderTab.SERVICES:
        setPurchaseTypeFilter('service');
        break;
      case OrderTab.PRODUCTS:
        setPurchaseTypeFilter('product');
        break;
      default:
        // Reset all filters when going to "All" tab
        setStatusFilter('all');
        setPurchaseTypeFilter('all');
        setIsSalonPurchaseFilter('all');
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (field: keyof DateRange, value: Date | null) => {
    setDateRange({
      ...dateRange,
      [field]: value,
    });
  };
  
  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter orders based on all filters
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.map(orderRaw => {
      // Create a copy of the order to modify and normalize it
      const order = normalizeOrder(orderRaw);
      
      // If this is a salon consumption order, always set status to completed
      if (isSalonConsumptionOrder(order)) {
        order.status = 'completed';
      }
      
      return order; // order is now ExtendedOrder
    }).filter((order) => { // order here is ExtendedOrder
      // Text search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        (order.id && order.id.toLowerCase().includes(searchLower)) ||
        ((order.client_name || order.customer_name) && 
         (order.client_name || order.customer_name || '').toLowerCase().includes(searchLower)) ||
        (order.stylist && order.stylist.name && order.stylist.name.toLowerCase().includes(searchLower)) ||
        (order.created_at && new Date(order.created_at).toLocaleDateString().includes(searchLower));
        
      // Payment method filter
      const matchesPayment = 
        paymentFilter === 'all' || 
        order.payment_method === paymentFilter ||
        (paymentFilter === 'split' && Array.isArray(order.payments) && order.payments.length > 0);
      
      // Status filter  
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Salon consumption filter
      const matchesSalonConsumption = 
        isSalonPurchaseFilter === 'all' || 
        (isSalonPurchaseFilter === 'true' && isSalonConsumptionOrder(order)) ||
        (isSalonPurchaseFilter === 'false' && !isSalonConsumptionOrder(order));
      
      // Purchase type filter - enhanced with categories
      const orderType = getPurchaseType(order);
      let matchesPurchaseType = false;
      
      if (purchaseTypeFilter === 'all') {
        matchesPurchaseType = true;
      } else if (purchaseTypeFilter === orderType || 
                (purchaseTypeFilter === 'both' && (orderType === 'service' || orderType === 'product')) ||
                (purchaseTypeFilter === 'service' && orderType === 'both') ||
                (purchaseTypeFilter === 'product' && orderType === 'both')) {
        matchesPurchaseType = true;
      } else if (purchaseTypeFilter.startsWith('product:')) {
        // Product category filtering
        const category = purchaseTypeFilter.split(':')[1];
        matchesPurchaseType = (orderType === 'product' || orderType === 'both') && 
                            (order as any)._productCategories && 
                            (order as any)._productCategories.some((cat: string) => cat.includes(category));
      } else if (purchaseTypeFilter.startsWith('service:')) {
        // Service category filtering
        const category = purchaseTypeFilter.split(':')[1];
        matchesPurchaseType = (orderType === 'service' || orderType === 'both') && 
                            (order as any)._serviceCategories && 
                            (order as any)._serviceCategories.some((cat: string) => cat.includes(category));
      }
        
      // Date range filter
      let matchesDateRange = true;
      if (dateRange.startDate) {
        const orderDate = new Date(order.created_at || '');
        const startOfDay = new Date(dateRange.startDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        if (orderDate < startOfDay) {
          matchesDateRange = false;
        }
      }
      
      if (dateRange.endDate && matchesDateRange) {
        const orderDate = new Date(order.created_at || '');
        const endOfDay = new Date(dateRange.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (orderDate > endOfDay) {
          matchesDateRange = false;
        }
      }
      
      return matchesSearch && matchesPayment && matchesStatus && matchesSalonConsumption && matchesPurchaseType && matchesDateRange;
    });
  }, [orders, searchQuery, paymentFilter, statusFilter, purchaseTypeFilter, isSalonPurchaseFilter, dateRange]);
  
  // Apply pagination
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  // Render purchase type chip with icon
  const renderPurchaseTypeChip = (type: string, order?: ExtendedOrder) => {
    // Check if this is a salon consumption order
    const isSalonConsumption = order ? isSalonConsumptionOrder(order) : false;
    
    if (isSalonConsumption) {
      return (
        <Chip
          icon={<InventoryIcon fontSize="small" />}
          label="Salon Consumption"
          size="small"
          color="secondary"
          sx={{ fontWeight: 500 }}
        />
      );
    }
    
    switch (type) {
      case 'service':
        return (
          <Chip
            icon={<SpaIcon fontSize="small" />}
            label="Service"
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      case 'product':
        return (
          <Chip
            icon={<ShoppingBagIcon fontSize="small" />}
            label="Product"
            size="small"
            color="info"
            variant="outlined"
          />
        );
      case 'both':
        return (
          <Chip
            icon={<StoreIcon fontSize="small" />}
            label="Service & Product"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            label="Unknown"
            size="small"
            color="default"
            variant="outlined"
          />
        );
    }
  };

  // Format the current time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true
    });
  };

  const [lastRefreshTime, setLastRefreshTime] = useState(formatTime(new Date()));

  // Force refresh function
  const handleForceRefresh = async () => {
    try {
      // Directly use the refresh function from the hook
      refreshOrders();
      
      // Update last refresh time and show success message
      setLastRefreshTime(formatTime(new Date()));
      toast.success("Orders refreshed successfully");
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Failed to refresh orders");
    }
  };

  // Show active filter chips below the filter controls
  const renderActiveFilters = () => {
    const filters = [];
    
    // Purchase type filter
    if (purchaseTypeFilter !== 'all') {
      let label = '';
      if (purchaseTypeFilter === 'service') label = 'Services Only';
      else if (purchaseTypeFilter === 'product') label = 'Products Only';
      else if (purchaseTypeFilter === 'both') label = 'Services & Products';
      else if (purchaseTypeFilter.startsWith('product:')) {
        const category = purchaseTypeFilter.split(':')[1];
        label = `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
      }
      else if (purchaseTypeFilter.startsWith('service:')) {
        const category = purchaseTypeFilter.split(':')[1];
        label = `${category.charAt(0).toUpperCase() + category.slice(1)} Services`;
      }
      
      filters.push(
        <Chip 
          key="purchaseType"
          label={label}
          size="small"
          color="primary"
          onDelete={() => setPurchaseTypeFilter('all')}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    
    // Date range filter
    if (dateRange.startDate || dateRange.endDate) {
      const label = `Date: ${dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString() : 'Any'} - ${dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString() : 'Any'}`;
      
      filters.push(
        <Chip 
          key="dateRange"
          label={label}
          size="small"
          color="primary"
          onDelete={() => setDateRange({ startDate: null, endDate: null })}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filters.push(
        <Chip 
          key="status"
          label={`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
          size="small"
          color="primary"
          onDelete={() => setStatusFilter('all')}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    
    // Only render if there are active filters
    if (filters.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          Active Filters:
        </Typography>
        {filters}
      </Box>
    );
  };

  const { serviceCollections, isLoading: isLoadingServiceCollections } = useServiceCollections();

  // Add this function before the return statement
  const formatOrderId = (order: ExtendedOrder) => {
    if (!order.id) return 'Unknown';
    
    // Check if this is a salon consumption order
    const isSalonOrder = isSalonConsumptionOrder(order);
    
    if (!orders) return order.id;
    
    // Sort orders by creation date to maintain consistent numbering
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateA - dateB;
    });

    // Find the index of the current order in the sorted list
    const orderIndex = sortedOrders.findIndex(o => o.id === order.id);
    
    // Get all orders of the same type (salon or sales) that come before this one
    const sameTypeOrders = sortedOrders
      .slice(0, orderIndex + 1)
      .filter(o => isSalonConsumptionOrder(o) === isSalonOrder);
    
    // Get the position of this order among orders of the same type
    const orderNumber = sameTypeOrders.length;
    
    // Format with leading zeros to ensure 4 digits
    const formattedNumber = String(orderNumber).padStart(4, '0');
    
    // Return the formatted ID based on order type
    return isSalonOrder ? `salon-${formattedNumber}` : `sales-${formattedNumber}`;
  };

  // Add this function before the return statement
  const renderPaymentMethods = (order: ExtendedOrder) => {
    if (order.payments && order.payments.length > 0) {
      return (
        <Box>
          {order.payments.map((payment, index) => (
            <Chip
              key={index}
              size="small"
              label={PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] || payment.payment_method}
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      );
    }
    return PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || order.payment_method || 'Unknown';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h1">Orders</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAllOrders}
              size="small"
            >
              Delete All Orders
            </Button>
          </Box>
        </Box>
        
        {orders && orders.length > 0 && (
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Export to CSV">
              <Button
                onClick={handleExportCSV}
                startIcon={<CsvIcon />}
                aria-label="Export to CSV"
              >
                CSV
              </Button>
            </Tooltip>
            <Tooltip title="Export to PDF">
              <Button
                onClick={handleExportPDF}
                startIcon={<PdfIcon />}
                aria-label="Export to PDF"
              >
                PDF
              </Button>
            </Tooltip>
          </ButtonGroup>
        )}
      </Box>
      
      {/* Order Analytics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised={false} variant="outlined" sx={{ p: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                {orderStats.total}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ height: 6, borderRadius: 3 }} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Salon Consumption Orders - Highlighted specialty stat */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            raised={false}
            variant="outlined"
            sx={{
              p: 2,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="subtitle2">
                  Salon Consumption
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                {orderStats.salonPurchases}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress
                  variant="determinate"
                  value={orderStats.total ? (orderStats.salonPurchases / orderStats.total) * 100 : 0}
                  color="info"
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    flexGrow: 1,
                  }}
                />
                <Typography variant="caption" sx={{ ml: 1 }} color="text.secondary">
                  {orderStats.total ? Math.round((orderStats.salonPurchases / orderStats.total) * 100) : 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised={false} variant="outlined" sx={{ p: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                {orderStats.completed}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={orderStats.total ? (orderStats.completed / orderStats.total) * 100 : 0} 
                  color="success"
                  sx={{ height: 6, borderRadius: 3, flexGrow: 1 }} 
                />
                <Typography variant="caption" sx={{ ml: 1 }} color="text.secondary">
                  {orderStats.total ? Math.round((orderStats.completed / orderStats.total) * 100) : 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card raised={false} variant="outlined" sx={{ p: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                {formatCurrency(orderStats.totalRevenue)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                color="primary"
                sx={{ height: 6, borderRadius: 3 }} 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Order Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="order filter tabs"
        >
          <Tab 
            icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
            iconPosition="start"
            label={`All (${orderStats.total})`} 
            value={OrderTab.ALL}
          />
          <Tab 
            icon={<CheckIcon sx={{ fontSize: 22 }} />} 
            iconPosition="start"
            label={`Completed (${orderStats.completed})`} 
            value={OrderTab.COMPLETED}
          />
          <Tab 
            icon={<PaymentIcon sx={{ fontSize: 22 }} />}
            iconPosition="start"
            label={`Pending (${orderStats.pending})`} 
            value={OrderTab.PENDING}
          />
          <Tab 
            icon={<InventoryIcon sx={{ fontSize: 22 }} color="secondary" />}
            iconPosition="start"
            label={`Salon Consumption (${orderStats.salonPurchases})`} 
            value={OrderTab.SALON_CONSUMPTION}
            sx={{ 
              "& .MuiTab-iconWrapper": { color: "secondary.main" },
              fontWeight: activeTab === OrderTab.SALON_CONSUMPTION ? 600 : 400
            }} 
          />
          <Tab 
            icon={<ContentCutIcon sx={{ fontSize: 22 }} />}
            iconPosition="start"
            label={`Services (${orderStats.services})`} 
            value={OrderTab.SERVICES}
          />
          <Tab 
            icon={<LocalMallIcon sx={{ fontSize: 22 }} />}
            iconPosition="start"
            label={`Products (${orderStats.products})`} 
            value={OrderTab.PRODUCTS}
          />
        </Tabs>
      </Paper>
      
      {/* Search and filter controls */}
      {orders && orders.length > 0 && (
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="payment-filter-label">Payment Method</InputLabel>
                    <Select
                      labelId="payment-filter-label"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      label="Payment Method"
                    >
                      <MenuItem value="all">All Payment Methods</MenuItem>
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>
                          {PAYMENT_METHOD_LABELS[method]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="purchase-type-filter-label">Purchase Type</InputLabel>
                    <Select
                      labelId="purchase-type-filter-label"
                      value={purchaseTypeFilter}
                      onChange={(e) => setPurchaseTypeFilter(e.target.value)}
                      label="Purchase Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="service">Services Only</MenuItem>
                      <MenuItem value="product">Products Only</MenuItem>
                      <MenuItem value="both">Services & Products</MenuItem>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                        Product Categories
                      </Typography>
                      <MenuItem value="product:retail">Retail Products</MenuItem>
                      <MenuItem value="product:salon">Salon Products</MenuItem>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
                        Service Categories
                      </Typography>
                      {serviceCollections?.map(collection => (
                        <MenuItem 
                          key={collection.id} 
                          value={`service:${collection.id}`}
                        >
                          {collection.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="salon-purchase-filter-label">Salon Consumption</InputLabel>
                    <Select
                      labelId="salon-purchase-filter-label"
                      value={isSalonPurchaseFilter}
                      onChange={(e) => setIsSalonPurchaseFilter(e.target.value)}
                      label="Salon Consumption"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="true">Salon Consumption</MenuItem>
                      <MenuItem value="false">Customer Purchases</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Date Range Filter */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <ErrorBoundary>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={dateRange.startDate}
                        onChange={(newValue) => handleDateRangeChange('startDate', newValue)}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </ErrorBoundary>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <ErrorBoundary>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={dateRange.endDate}
                        onChange={(newValue) => handleDateRangeChange('endDate', newValue)}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                        minDate={dateRange.startDate || undefined}
                      />
                    </LocalizationProvider>
                  </ErrorBoundary>
                </Grid>
                
                <Grid item xs={12} md={6} display="flex" alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setDateRange({ startDate: null, endDate: null })}
                    disabled={!dateRange.startDate && !dateRange.endDate}
                  >
                    Clear Dates
                  </Button>
                  
                  {filteredOrders.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Showing {filteredOrders.length} orders
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Render active filters */}
      {renderActiveFilters()}
      
      {filteredOrders.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Stylist</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => {
                  // Check if this is a salon consumption order
                  const isSalonOrder = isSalonConsumptionOrder(order);
                  
                  return (
                  <TableRow 
                    key={order.id}
                    sx={{
                      backgroundColor: isSalonOrder ? 'rgba(237, 108, 2, 0.05)' : 'inherit',
                      '&:hover': {
                        backgroundColor: isSalonOrder ? 'rgba(237, 108, 2, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {formatOrderId(order)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown date'}
                    </TableCell>
                    <TableCell>
                      {order.client_name || 'Unknown client'}
                      {isSalonOrder && (
                        <Chip 
                          size="small" 
                          label="Salon Use" 
                          color="warning" 
                          sx={{ ml: 1, backgroundColor: '#FF6B00', color: 'white' }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {order.stylist_name || 'No stylist'}
                    </TableCell>
                    <TableCell>{order.services?.length || 0}</TableCell>
                    <TableCell>
                      {renderPurchaseTypeChip(getPurchaseType(order), order)}
                    </TableCell>
                    <TableCell>{renderPaymentMethods(order)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={order.status || 'unknown'}
                        color={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        fontWeight="medium" 
                        color={isSalonOrder ? '#FF6B00' : 'text.primary'}
                      >
                        ₹{order.total_amount || order.total || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <ButtonGroup size="small" variant="outlined">
                        <Tooltip title="View Details">
                          <Button
                            color="primary"
                            onClick={() => handleViewDetails(order)}
                            startIcon={<VisibilityIcon />}
                          >
                            View
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete Order">
                          <Button
                            color="error"
                            onClick={() => handleDeleteOrder(order)}
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {orders && orders.length > 0 
              ? 'No orders match your search criteria. Try adjusting your filters.'
              : 'No orders found. Orders from the POS system will appear here.'}
          </Typography>
        </Paper>
      )}

      {/* Order Details Dialog - Using the accessible dialog component */}
      {selectedOrder && (
        <AccessibleDialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          title={(
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              <span>Order Details</span>
            </Box>
          )}
          actions={
            <Button 
              onClick={handleCloseDetails} 
              color="primary" 
              variant="contained"
            >
              Close
            </Button>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Order Information</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Order ID:</strong> {formatOrderId(selectedOrder)}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Customer:</strong> {selectedOrder.client_name}
                  {isSalonConsumptionOrder(selectedOrder) && (
                    <Chip 
                      size="small" 
                      label="Salon Consumption" 
                      color="warning" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Stylist:</strong> {selectedOrder.stylist_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Purchase Type:</strong> <Box component="span" sx={{ ml: 1 }}>{renderPurchaseTypeChip(getPurchaseType(selectedOrder), selectedOrder)}</Box>
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedOrder.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Payment Method:</strong>{" "}
                  {Array.isArray(selectedOrder.payments) && selectedOrder.payments.length > 0
                    ? selectedOrder.payments.map((p: PaymentDetail) =>
                        PAYMENT_METHOD_LABELS[p.payment_method as PaymentMethod] ||
                        p.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                      ).join(', ')
                    : PAYMENT_METHOD_LABELS[selectedOrder.payment_method as PaymentMethod] ||
                      selectedOrder.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Typography>
                {selectedOrder.appointment_time && (
                  <Typography variant="body2">
                    <strong>Appointment Time:</strong> {new Date(selectedOrder.appointment_time).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Payment Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(selectedOrder.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">GST (18%):</Typography>
                  <Typography variant="body2">{formatCurrency(selectedOrder.tax)}</Typography>
                </Box>
                {selectedOrder.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Discount:</Typography>
                    <Typography variant="body2" color="error">-{formatCurrency(selectedOrder.discount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Total:</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatCurrency(selectedOrder.total)}</Typography>
                </Box>
                
                {/* Show payment details for split payments */}
                {selectedOrder.is_split_payment && selectedOrder.payments && selectedOrder.payments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Payment Details</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Method</TableCell>
                            <TableCell align="right">Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.payments.map((payment: PaymentDetail) => (
                            <TableRow key={payment.id}>
                              <TableCell>{PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod]}</TableCell>
                              <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                            </TableRow>
                          ))}
                          {selectedOrder.pending_amount > 0 && (
                            <TableRow>
                              <TableCell>
                                <Typography color="error">Pending Payment:</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography color="error">{formatCurrency(selectedOrder.pending_amount)}</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Price</TableCell>
                      {/* Add more columns if needed */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.services.map((service: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{service.service_name}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={service.type || 'Service'} 
                            color={service.type === 'product' ? 'secondary' : 'primary'}
                          />
                          {service.forSalonUse && (
                            <Chip size="small" label="Salon Use" color="warning" sx={{ ml: 0.5 }} />
                          )}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(service.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </AccessibleDialog>
      )}
      
      {/* Payment Completion Dialog */}
      {selectedOrder && (
        <CompletePaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          order={selectedOrder}
          onCompletePayment={handleCompletePaymentSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteOrder} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete All Orders Confirmation Dialog */}
      <Dialog
        open={deleteAllConfirmOpen}
        onClose={() => setDeleteAllConfirmOpen(false)}
        aria-labelledby="alert-dialog-title-all"
        aria-describedby="alert-dialog-description-all"
      >
        <DialogTitle id="alert-dialog-title-all">{"Delete All Orders"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description-all">
            Warning: This will permanently delete ALL orders in the system. This action cannot be undone. 
            Are you absolutely sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteAllOrders} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Yes, Delete All Orders
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 