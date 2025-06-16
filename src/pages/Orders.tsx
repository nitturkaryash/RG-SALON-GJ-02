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
  LocalPrintshopOutlined as PrintIcon,
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
  CardMembership as CardMembershipIcon,
  Info as InfoIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/format'
import { AccessibleDialog } from '../components/AccessibleDialog'
import { exportToCSV, exportToPDF, formatOrdersForExport, orderExportHeaders } from '../utils/exportUtils'
import { printBill } from '../utils/printUtils'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PaymentMethod, usePOS, PaymentDetail } from '../hooks/usePOS'
import CompletePaymentDialog from '../components/orders/CompletePaymentDialog'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { toast } from 'react-toastify'
import DateRangeCalendar from '../components/dashboard/DateRangeCalendar'
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
  MEMBERSHIPS = 'memberships',
}

// Interface for date range filter
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export default function Orders() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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
  
  // Date range calendar state
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState<HTMLElement | null>(null)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  
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

  // Aggregate multi-expert orders with same appointment_id
  const aggregatedOrders = useMemo(() => {
    if (!orders) return [];

    const result: ExtendedOrder[] = [];
    
    // Group orders by appointment_id to find potential multi-expert orders
    const ordersByAppointment: Record<string, ExtendedOrder[]> = {};
    const standaloneOrders: ExtendedOrder[] = [];
    
    orders.forEach(raw => {
      const order = normalizeOrder(raw);
      
      if (order.appointment_id) {
        if (!ordersByAppointment[order.appointment_id]) {
          ordersByAppointment[order.appointment_id] = [];
        }
        ordersByAppointment[order.appointment_id].push(order);
      } else {
        standaloneOrders.push(order);
      }
    });

    // Process appointment-based orders
    Object.entries(ordersByAppointment).forEach(([appointmentId, appointmentOrders]) => {
      if (appointmentOrders.length > 1) {
        // This is a multi-expert appointment - aggregate the orders
        
        const baseOrder = appointmentOrders[0];
        
        const totals = appointmentOrders.map(order => order.total || order.total_amount || 0);
        const maxTotal = Math.max(...totals);
        const minTotal = Math.min(...totals);
        const totalSum = totals.reduce((sum, total) => sum + total, 0);
        
        const sameTotalExperts = appointmentOrders.every(o => (o as any).total_experts && (o as any).total_experts === (appointmentOrders[0] as any).total_experts);
        const allHaveMultiExpertFlag = appointmentOrders.every(o => (o as any).multi_expert === true);
        const similarTotals = (maxTotal - minTotal) < (maxTotal * 0.1);
        const isAllSplitOrders = sameTotalExperts || allHaveMultiExpertFlag || similarTotals;
        
        let finalTotal, finalSubtotal, finalTax;
        
        if (isAllSplitOrders) {
          finalTotal = totalSum;
          finalSubtotal = appointmentOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
          finalTax = appointmentOrders.reduce((sum, order) => sum + (order.tax || 0), 0);
        } else {
          const originalOrder = appointmentOrders.find(order => (order.total || order.total_amount || 0) === maxTotal) || baseOrder;
          finalTotal = originalOrder.total || originalOrder.total_amount || 0;
          finalSubtotal = originalOrder.subtotal || 0;
          finalTax = originalOrder.tax || 0;
        }
        
        const aggregatedOrder: ExtendedOrder & { stylist_names: string[] } = {
          ...baseOrder,
          total: finalTotal,
          total_amount: finalTotal,
          subtotal: finalSubtotal,
          tax: finalTax,
          payment_method: baseOrder.payment_method,
          stylist_names: [],
          payments: (() => {
            if (isAllSplitOrders) {
              const combined: any[] = [];
              appointmentOrders.forEach(order => {
                if (order.payments && Array.isArray(order.payments)) {
                  order.payments.forEach(pay => {
                    const existing = combined.find(p => p.payment_method === pay.payment_method);
                    if (existing) {
                      existing.amount = (existing.amount || 0) + (pay.amount || 0);
                    } else {
                      combined.push({ ...pay });
                    }
                  });
                }
              });
              return combined;
            }
            return baseOrder.payments || [];
          })(),
          services: isAllSplitOrders ?
            appointmentOrders.reduce((allServices: any[], order) => {
              if (order.services && Array.isArray(order.services)) {
                order.services.forEach(service => {
                  const existingService = allServices.find(s => {
                    const nameMatch = s.service_name && service.service_name && s.service_name === service.service_name;
                    const sidMatch  = (s as any).service_id && (service as any).service_id && (s as any).service_id === (service as any).service_id;
                    const idMatch   = s.id && service.id && s.id === service.id;
                    return nameMatch || sidMatch || idMatch;
                  });

                  if (!existingService) {
                    // Restore original price by multiplying by the service-specific expert count
                    const serviceMultiplier = (service as any).experts?.length;
                    if (serviceMultiplier && serviceMultiplier > 0) {
                      const originalPrice = service.price * serviceMultiplier;
                      allServices.push({
                        ...service,
                        price: originalPrice,
                      });
                    } else {
                      allServices.push(service);
                    }
                  }
                });
              }
              return allServices;
            }, []) :
            baseOrder.services || [],
          aggregated_multi_expert: true as any
        };

        appointmentOrders.forEach(order => {
          if (order.stylist_name && !aggregatedOrder.stylist_names.includes(order.stylist_name)) {
            aggregatedOrder.stylist_names.push(order.stylist_name);
          }
        });

        aggregatedOrder.stylist_name = aggregatedOrder.stylist_names.filter(Boolean).join(', ');
        
        result.push(aggregatedOrder as ExtendedOrder);
      } else {
        result.push(appointmentOrders[0]);
      }
    });

    standaloneOrders.forEach(order => {
      result.push(order);
    });

    return result.sort((a, b) => {
      const da = new Date(a.created_at || '').getTime();
      const db = new Date(b.created_at || '').getTime();
      return db - da;
    });
  }, [orders]);
  
  // Update order stats when orders change
  useEffect(() => {
    if (aggregatedOrders) {
      const stats = {
        total: aggregatedOrders.length,
        completed: aggregatedOrders.filter(order => normalizeOrder(order).status === 'completed').length,
        pending: aggregatedOrders.filter(order => normalizeOrder(order).status === 'pending').length,
        salonPurchases: aggregatedOrders.filter(order => isSalonConsumptionOrder(normalizeOrder(order))).length,
        services: aggregatedOrders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'service' || type === 'both';
        }).length,
        products: aggregatedOrders.filter(order => {
          const normalized = normalizeOrder(order);
          const type = getPurchaseType(normalized);
          return type === 'product' || type === 'both';
        }).length,
        totalRevenue: aggregatedOrders.reduce((sum, orderRaw) => {
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
  }, [aggregatedOrders]);

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }
  
  const handlePrintBill = (order: any) => {
    printBill(order)
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
        setDeleteConfirmOpen(false)
        setOrderToDelete(null)
        if (filteredOrders.length <= rowsPerPage && page > 0) {
          setPage(0)
        }
        queryClient.invalidateQueries({ queryKey: ['clients'] })
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
      const loadingToast = toast.info('Deleting all orders...', {
        autoClose: false,
        closeButton: false
      });
      
      const deleteAllConfirmButton = document.querySelector('button[color="error"]');
      if (deleteAllConfirmButton) {
        (deleteAllConfirmButton as HTMLButtonElement).disabled = true;
        (deleteAllConfirmButton as HTMLButtonElement).innerHTML = 'Deleting...';
      }
      
      const success = await deleteAllOrders();
      
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success('All orders have been deleted successfully');
        setDeleteAllConfirmOpen(false);
        setPage(0);
      } else {
        toast.error('Failed to delete all orders. Please try again.');
      }
    } catch (error) {
      console.error('Error in confirmDeleteAllOrders:', error);
      toast.error('An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      const deleteAllConfirmButton = document.querySelector('button[color="error"]');
      if (deleteAllConfirmButton) {
        (deleteAllConfirmButton as HTMLButtonElement).disabled = false;
        (deleteAllConfirmButton as HTMLButtonElement).innerHTML = 'Yes, Delete All Orders';
      }
    }
  }

  const handleExportCSV = () => {
    if (!aggregatedOrders || aggregatedOrders.length === 0) {
      toast.warning('No orders available to export');
      return;
    }
    
    if (filteredOrders.length === 0) {
      toast.warning('No orders match the current filters');
      return;
    }
    
    try {
      let formattedOrders = formatOrdersForExport(filteredOrders, aggregatedOrders);
      formattedOrders = formattedOrders.map((item, index) => ({
        ...item,
        id: formatOrderId(filteredOrders[index])
      }));
      exportToCSV(formattedOrders, 'salon-orders-export', orderExportHeaders);
      toast.success(`Successfully exported ${filteredOrders.length} orders to CSV`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export orders to CSV');
    }
  }

  const handleExportPDF = () => {
    if (!aggregatedOrders || aggregatedOrders.length === 0) {
      toast.warning('No orders available to export');
      return;
    }
    
    if (filteredOrders.length === 0) {
      toast.warning('No orders match the current filters');
      return;
    }
    
    try {
      let formattedOrdersPDF = formatOrdersForExport(filteredOrders, aggregatedOrders);
      formattedOrdersPDF = formattedOrdersPDF.map((item, index) => ({
        ...item,
        id: formatOrderId(filteredOrders[index])
      }));
      exportToPDF(
        formattedOrdersPDF, 
        'salon-orders-export', 
        orderExportHeaders, 
        'Salon Orders Report'
      );
      toast.success(`Successfully exported ${filteredOrders.length} orders to PDF`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export orders to PDF');
    }
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
    const hasMemberships = order.services.some((service: any) => 
      service && (service.type === 'membership' || service.category === 'membership')
    );
    
    // Check product, service, and membership subcategories
    const productCategories = new Set();
    const serviceCategories = new Set();
    const membershipCategories = new Set();
    
    order.services.forEach((service: any) => {
      if (service) {
        if (service.type === 'product' && service.category) {
          productCategories.add(service.category.toLowerCase());
        } else if ((!service.type || service.type === 'service') && service.category) {
          serviceCategories.add(service.category.toLowerCase());
        } else if (service.type === 'membership' || service.category === 'membership') {
          membershipCategories.add('membership');
        }
      }
    });
    
    // Store the categories for filtering
    (order as any)._productCategories = Array.from(productCategories);
    (order as any)._serviceCategories = Array.from(serviceCategories);
    (order as any)._membershipCategories = Array.from(membershipCategories);
    
    // Return membership if only memberships are present
    if (hasMemberships && !hasServices && !hasProducts) return 'membership';
    
    // Return combined types if multiple types are present
    const types = [];
    if (hasServices) types.push('service');
    if (hasProducts) types.push('product');
    if (hasMemberships) types.push('membership');
    
    if (types.length > 1) return 'both';
    if (hasProducts) return 'product';
    if (hasMemberships) return 'membership';
    return 'service';
  };

  // Function to detect if an order is a salon consumption order
  const isSalonConsumptionOrder = (order: ExtendedOrder) => {
    return (
      order.is_salon_consumption === true || 
      order.consumption_purpose ||
      order.client_name === 'Salon Consumption' ||
      (order.services && order.services.some((s: any) => s.for_salon_use === true))
    );
  };

  // Function that bridges between the component's expected prop name and our implementation
  const handleCompletePayment = (order: ExtendedOrder) => {
    setSelectedOrder(order)
    setPaymentDialogOpen(true)
  }

  // Handler for processing the payment update
  const handlePaymentUpdate = async (orderId: string, paymentDetails: PaymentDetail) => {
    await updateOrderPayment.mutateAsync({ orderId, paymentDetails }) 
  }
  
  // Function that bridges between CompletePaymentDialog's expected prop and our implementation
  const handleCompletePaymentSubmit = async (orderId: string, paymentDetails: PaymentDetail) => {
    return handlePaymentUpdate(orderId, paymentDetails);
  }
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: OrderTab) => {
    setActiveTab(newValue);
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
      case OrderTab.MEMBERSHIPS:
        setPurchaseTypeFilter('membership');
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
  
  // Handle date range calendar
  const handleDateRangeCalendarChange = (startDate: Date, endDate: Date) => {
    setDateRange({
      startDate,
      endDate,
    });
  };
  
  const handleOpenDateRangeCalendar = (event: React.MouseEvent<HTMLElement>) => {
    setDateRangeAnchorEl(event.currentTarget);
    setIsDateRangeOpen(true);
  };
  
  const handleCloseDateRangeCalendar = () => {
    setIsDateRangeOpen(false);
    setDateRangeAnchorEl(null);
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
    if (!aggregatedOrders) return [];
    
    return aggregatedOrders.map(orderRaw => {
      // Create a copy of the order to modify and normalize it
      const order = normalizeOrder(orderRaw);
      
      // If this is a salon consumption order, always set status to completed
      if (isSalonConsumptionOrder(order)) {
        order.status = 'completed';
      }
      
      return order;
    }).filter((order) => {
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
        (paymentFilter === 'split' && (order.payment_method === 'split' || (Array.isArray(order.payments) && order.payments.length > 0))) ||
        (paymentFilter === 'membership' && (order.payment_method === 'membership' || (Array.isArray(order.payments) && order.payments.some((p: any) => p.payment_method === 'membership'))));
      
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
  }, [aggregatedOrders, searchQuery, paymentFilter, statusFilter, purchaseTypeFilter, isSalonPurchaseFilter, dateRange]);
  
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
      case 'membership':
        return (
          <Chip
            icon={<CardMembershipIcon fontSize="small" />}
            label="Membership"
            size="small"
            color="warning"
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
    
    if (!aggregatedOrders) return order.id;
    
    // Sort orders by creation date to maintain consistent numbering
    const sortedOrders = [...aggregatedOrders].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateA - dateB;
    });

    // Find the index of the current order in the sorted list
    const orderIndex = sortedOrders.findIndex(o => o.id === order.id);
    
    // Get all orders of the same type (salon or sales) that come before this one
    const sameTypeOrders = sortedOrders
      .slice(0, orderIndex + 1)
      .filter(o => isSalonConsumptionOrder(normalizeOrder(o)) === isSalonOrder);
    
    // Get the position of this order among orders of the same type
    const orderNumber = sameTypeOrders.length;
    
    // Format with leading zeros to ensure 4 digits
    const formattedNumber = String(orderNumber).padStart(4, '0');
    
    // Return the formatted ID based on order type
    return isSalonOrder ? `salon-${formattedNumber}` : `sales-${formattedNumber}`;
  };

  // Add this function before the return statement
  const renderPaymentMethods = (order: ExtendedOrder) => {
    // Check if this is an aggregated multi-expert order
    const isAggregatedOrder = (order as any).aggregated_multi_expert;
    
    // Check if this is a split payment order (either has payments array or payment_method is 'split')
    const isSplitPayment = (order.payments && order.payments.length > 0) || order.payment_method === 'split';
    
    if (isSplitPayment && order.payments && order.payments.length > 0) {
      // Group payments by method and sum up the amounts
      const paymentSummary: Record<string, number> = {};
      order.payments.forEach(payment => {
        const method = payment.payment_method;
        paymentSummary[method] = (paymentSummary[method] || 0) + payment.amount;
      });

      return (
        <Box>
          {Object.entries(paymentSummary).map(([method, amount], index) => {
            // Show the actual payment amount, not the full order total
            const displayAmount = amount;
            const isMembership = method === 'membership';
            
            return (
              <Box key={index} sx={{ mb: 0.5 }}>
                <Chip
                  size="small"
                  label={`${PAYMENT_METHOD_LABELS[method as PaymentMethod] || method}: ${formatCurrency(displayAmount)}`}
                  color={isMembership ? 'secondary' : 'default'}
                  variant={isMembership ? 'filled' : 'outlined'}
                  sx={{ 
                    mr: 0.5,
                    ...(isMembership && {
                      backgroundColor: 'secondary.main',
                      color: 'secondary.contrastText',
                      fontWeight: 'medium'
                    })
                  }}
                />
              </Box>
            );
          })}
          {(order.pending_amount || 0) > 0 && order.status !== 'completed' && (
            <Box sx={{ mb: 0.5 }}>
              <Chip
                size="small"
                label={`Pending: ${formatCurrency(order.pending_amount || 0)}`}
                color="warning"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      );
    }
    
    // For orders with payment_method as 'split' but no payments array, show split indicator
    if (order.payment_method === 'split') {
      return (
        <Box>
          <Chip
            size="small"
            label="Split Payment"
            color="info"
            variant="outlined"
            sx={{ mr: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Total: {formatCurrency(order.total || order.total_amount || 0)}
          </Typography>
        </Box>
      );
    }
    
    // For single payment orders, show payment method with total amount
    const paymentMethod = PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || order.payment_method || 'Unknown';
    const totalAmount = order.total || order.total_amount || 0;
    const isMembership = order.payment_method === 'membership';
    
    return (
      <Box>
        <Chip
          size="small"
          label={`${paymentMethod}: ${formatCurrency(totalAmount)}`}
          color={isMembership ? 'secondary' : 'primary'}
          variant={isMembership ? 'filled' : 'outlined'}
          sx={{
            ...(isMembership && {
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
              fontWeight: 'medium'
            })
          }}
        />
                 {(order.pending_amount || 0) > 0 && order.status !== 'completed' && (
           <Box sx={{ mt: 0.5 }}>
             <Chip
               size="small"
               label={`Pending: ${formatCurrency(order.pending_amount || 0)}`}
               color="warning"
               variant="outlined"
             />
           </Box>
         )}
      </Box>
    );
  };

  const handleEditOrder = (order: ExtendedOrder) => {
    // Navigate to POS with order data for editing
    navigate('/pos', {
      state: {
        editOrderData: {
          orderId: order.id,
          clientName: order.client_name || order.customer_name,
          clientId: order.client_id,
          stylistId: order.stylist?.id || order.stylist_id,
          services: order.services || [],
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total || order.total_amount || 0,
          paymentMethod: order.payment_method,
          payments: order.payments || [],
          status: order.status,
          isSalonConsumption: isSalonConsumptionOrder(order),
          consumptionPurpose: order.consumption_purpose,
          notes: order.notes,
          created_at: order.created_at
        }
      }
    });
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`Export ${filteredOrders.length} filtered orders to CSV. Includes: Order details, customer & stylist info, service breakdown, payment details, tax calculations (CGST/SGST), appointment info, multi-expert indicators, and salon consumption data.`}>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<CsvIcon />}
                onClick={handleExportCSV}
                size="small"
                disabled={!orders || orders.length === 0}
              >
                Export CSV
              </Button>
            </Tooltip>
            <Tooltip title={`Export ${filteredOrders.length} filtered orders to PDF. Includes: Order details, customer & stylist info, service breakdown, payment details, tax calculations (CGST/SGST), appointment info, multi-expert indicators, and salon consumption data.`}>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<PdfIcon />}
                onClick={handleExportPDF}
                size="small"
                disabled={!orders || orders.length === 0}
              >
                Export PDF
              </Button>
            </Tooltip>
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
            <Tab 
              icon={<CardMembershipIcon sx={{ fontSize: 22 }} />}
              iconPosition="start"
              label={`Memberships`} 
              value={OrderTab.MEMBERSHIPS}
            />
          </Tabs>
        </Paper>
        
        {/* Export Info Box */}
        {orders && orders.length > 0 && filteredOrders.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
            <Typography variant="body2" color="success.dark" sx={{ display: 'flex', alignItems: 'center' }}>
              <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
              <strong>Ready to Export:</strong> {filteredOrders.length} orders available for export with comprehensive data including customer details, services, payments, tax breakdown (CGST/SGST), appointment information, and salon consumption status.
            </Typography>
          </Box>
        )}

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
                        <MenuItem value="split">Split Payment</MenuItem>
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
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<DateRangeIcon />}
                      onClick={handleOpenDateRangeCalendar}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        color: dateRange.startDate || dateRange.endDate ? 'primary.main' : 'text.secondary',
                        borderColor: dateRange.startDate || dateRange.endDate ? 'primary.main' : 'divider',
                      }}
                    >
                      {dateRange.startDate && dateRange.endDate
                        ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                        : dateRange.startDate
                        ? `${dateRange.startDate.toLocaleDateString()} - Select end date`
                        : dateRange.endDate
                        ? `Select start date - ${dateRange.endDate.toLocaleDateString()}`
                        : 'Select Date Range'}
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setDateRange({ startDate: null, endDate: null })}
                      disabled={!dateRange.startDate && !dateRange.endDate}
                    >
                      Clear Dates
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} md={6} display="flex" alignItems="center">
                    {filteredOrders.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Showing {filteredOrders.length} orders • Export will include all {filteredOrders.length} filtered orders
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
                    const isSalonOrder = isSalonConsumptionOrder(order);
                    const isAggregatedOrder = (order as any).aggregated_multi_expert;
                    
                    return (
                    <TableRow 
                      key={order.id}
                      sx={{
                        backgroundColor: isSalonOrder ? 'rgba(237, 108, 2, 0.05)' : 
                                        isAggregatedOrder ? 'rgba(156, 39, 176, 0.05)' : 'inherit',
                        '&:hover': {
                          backgroundColor: isSalonOrder ? 'rgba(237, 108, 2, 0.12)' : 
                                          isAggregatedOrder ? 'rgba(156, 39, 176, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                        },
                        borderLeft: isAggregatedOrder ? '3px solid #9c27b0' : 'none'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatOrderId(order)}
                          {isAggregatedOrder && (
                            <Chip 
                              size="small" 
                              label="Multi-Expert" 
                              color="secondary" 
                              sx={{ ml: 1, fontSize: '0.7rem' }} 
                            />
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown date'}
                      </TableCell>
                      <TableCell>
                        {order.client_name || 'Unknown client'}
                        {selectedOrder && isSalonConsumptionOrder(selectedOrder) && (
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
                        {(() => {
                          let displayTotal = order.total_amount || order.total || 0;
                          
                          if (!isAggregatedOrder && order.payments && order.payments.length > 0) {
                            const regularPaymentTotal = order.payments
                              .filter((payment: any) => payment.payment_method !== 'membership')
                              .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
                            
                            if (regularPaymentTotal > 0) {
                              displayTotal = regularPaymentTotal;
                            }
                          }
                          
                          return (
                            <Typography 
                              fontWeight="medium" 
                              color={isSalonOrder ? '#FF6B00' : 'text.primary'}
                            >
                              ₹{Math.round(displayTotal)}
                              {isAggregatedOrder && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                  (Aggregated Total)
                                </Typography>
                              )}
                            </Typography>
                          );
                        })()}
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
                          <Tooltip title="Edit Order">
                            <Button
                              color="info"
                              onClick={() => handleEditOrder(order)}
                              startIcon={<EditIcon />}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                          <Tooltip title="Print Bill">
                            <Button
                              color="secondary"
                              onClick={() => handlePrintBill(order)}
                              startIcon={<PrintIcon />}
                            >
                              Print
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
              <>
                <Button 
                  onClick={() => selectedOrder && handlePrintBill(selectedOrder)}
                  variant="contained"
                  color="secondary"
                  startIcon={<ReceiptIcon />}
                  sx={{ mr: 1 }}
                >
                  Print Bill
                </Button>
                <Button 
                  onClick={handleCloseDetails} 
                  color="primary" 
                  variant="contained"
                >
                  Close
                </Button>
              </>
            }
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Order Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Order ID:</strong> {formatOrderId(selectedOrder)}
                    {(selectedOrder as any).aggregated_multi_expert && (
                      <Chip 
                        size="small" 
                        label="Multi-Expert Order" 
                        color="secondary" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Customer:</strong> {selectedOrder.client_name}
                    {selectedOrder && isSalonConsumptionOrder(selectedOrder) && (
                      <Chip 
                        size="small" 
                        label="Salon Use" 
                        color="warning" 
                        sx={{ ml: 1, backgroundColor: '#FF6B00', color: 'white' }} 
                      />
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Stylist{(selectedOrder as any).aggregated_multi_expert ? 's' : ''}:</strong> {selectedOrder.stylist_name}
                    {(selectedOrder as any).aggregated_multi_expert && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Revenue split among all experts
                      </Typography>
                    )}
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
                        selectedOrder.payment_method?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Cash'}
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
                  
                  {(() => {
                    const hasMembershipPayment = selectedOrder.payments && selectedOrder.payments.some((payment: any) => payment.payment_method === 'membership');
                    const membershipAmount = selectedOrder.payments 
                      ? selectedOrder.payments
                          .filter((payment: any) => payment.payment_method === 'membership')
                          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
                      : 0;
                    
                    const regularAmount = selectedOrder.payments 
                      ? selectedOrder.payments
                          .filter((payment: any) => payment.payment_method !== 'membership')
                          .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
                      : (selectedOrder.total_amount || selectedOrder.total || 0);
                    
                    const totalOrderAmount = selectedOrder.total_amount || selectedOrder.total || 0;
                    
                    if (hasMembershipPayment && membershipAmount > 0) {
                      // Calculate estimated GST discount for membership payment (assuming 18% GST)
                      const estimatedMembershipGSTDiscount = membershipAmount * 0.18 / 1.18;
                      
                      return (
                        <>
                          <Divider sx={{ my: 2 }} />
                          
                          {/* Payment Breakdown Section */}
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Payment Breakdown:
                          </Typography>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                            <Typography variant="body2" color="primary.main">Services via Membership (Ex. GST):</Typography>
                            <Typography variant="body2" fontWeight="500" color="primary.main">
                              {formatCurrency(membershipAmount)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                            <Typography variant="body2">Products & Regular Services (Incl. GST):</Typography>
                            <Typography variant="body2" fontWeight="500">
                              {formatCurrency(regularAmount)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2, ml: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              <InfoIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              Membership payments exclude GST • Products cannot be paid with membership balance
                            </Typography>
                          </Box>
                          
                          {/* Total Amount with detailed breakdown */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold">Total Amount (All Items):</Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(totalOrderAmount + membershipAmount)}
                            </Typography>
                          </Box>
                          
                          {/* Show membership GST discount if applicable */}
                          {estimatedMembershipGSTDiscount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                              <Typography variant="body2" color="success.main">Less: Membership GST Discount:</Typography>
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                -{formatCurrency(estimatedMembershipGSTDiscount)}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Show membership payment deduction */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                            <Typography variant="body2" color="primary.main">Less: Membership Payment:</Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="medium">
                              -{formatCurrency(membershipAmount)}
                            </Typography>
                          </Box>
                          
                          {/* Show additional discount if any */}
                          {selectedOrder.discount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                              <Typography variant="body2" color="warning.main">Less: Additional Discount:</Typography>
                              <Typography variant="body2" color="warning.main" fontWeight="medium">
                                -{formatCurrency(selectedOrder.discount)}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Final amount that client paid */}
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, bgcolor: 'success.lighter', p: 1, borderRadius: 1 }}>
                            <Typography variant="h6" fontWeight="bold">Client to Pay:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              {formatCurrency(regularAmount)}
                            </Typography>
                          </Box>
                          
                          {/* Membership discount explanation */}
                          <Box sx={{ mb: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                            <Typography variant="caption" color="info.main" sx={{ display: 'flex', alignItems: 'center' }}>
                              <InfoIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                              Membership Discount Applied: GST is excluded when paying via membership balance. 
                              ₹{formatCurrency(membershipAmount)} was deducted from membership balance.
                            </Typography>
                          </Box>
                        </>
                      );
                    } else {
                      // Standard display when no membership payments
                      return (
                        <>
                          {selectedOrder.discount > 0 && (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatCurrency(totalOrderAmount + selectedOrder.discount)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
                                <Typography variant="body2" color="warning.main">Less: Discount:</Typography>
                                <Typography variant="body2" color="warning.main" fontWeight="medium">
                                  -{formatCurrency(selectedOrder.discount)}
                                </Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                            </>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">Total:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {(() => {
                                // Calculate total from actual payments for accuracy (same logic as table)
                                let displayTotal = selectedOrder.total_amount || selectedOrder.total || 0;
                                if (selectedOrder.payments && selectedOrder.payments.length > 0) {
                                  const paymentTotal = selectedOrder.payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
                                  if (paymentTotal > 0) {
                                    displayTotal = paymentTotal;
                                  }
                                }
                                return formatCurrency(displayTotal);
                              })()}
                            </Typography>
                          </Box>
                        </>
                      );
                    }
                  })()}
                  
                  {/* Show payment details for split payments */}
                  {(selectedOrder.is_split_payment || (selectedOrder as any).aggregated_multi_expert) && selectedOrder.payments && selectedOrder.payments.length > 0 && (
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
                            {selectedOrder.payments.map((payment: PaymentDetail) => {
                              // Show the actual payment amount, not the full order total
                              const displayAmount = payment.amount;
                              
                              return (
                                <TableRow key={payment.id}>
                                  <TableCell>{PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod]}</TableCell>
                                  <TableCell align="right">{formatCurrency(displayAmount)}</TableCell>
                                </TableRow>
                              );
                            })}
                            {selectedOrder.pending_amount > 0 && selectedOrder.status !== 'completed' && (
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
        
        {/* Date Range Calendar */}
        <DateRangeCalendar
          startDate={dateRange.startDate || new Date()}
          endDate={dateRange.endDate || new Date()}
          onDateRangeChange={handleDateRangeCalendarChange}
          onClose={handleCloseDateRangeCalendar}
          anchorEl={dateRangeAnchorEl}
        />
      </Box>
    </Container>
  );
} 