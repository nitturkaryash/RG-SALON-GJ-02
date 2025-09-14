import { useEffect, useRef, useState } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Divider,
  Fade,
  Alert,
  Stack,
  Chip,
  Container,
  IconButton,
  Tooltip,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from '@mui/material'
import { 
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon,
  ShoppingCart as ShoppingCartIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Star,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  CloudDownload as CloudDownloadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics'
import { formatCurrency } from '../utils/format'
import { formatAmount, roundForDisplay } from '../utils/formatAmount'
import KPICard from '../components/dashboard/KPICard'
import DashboardSettings from '../components/dashboard/DashboardSettings'
import DownloadableCard from '../components/dashboard/DownloadableCard'
import ChartRenderer from '../components/charts/ChartRenderer'
import DateRangePicker from '../components/dashboard/DateRangePicker'
import OrdersVsProductsChart from '../components/dashboard/OrdersVsProductsChart'

// Enhanced payment method labels for display
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  upi: "UPI",
  bnpl: "Pay Later",
  membership: "Membership Balance",
  split: "Split Payment",
};

// SECTION WRAPPER COMPONENT
const SectionWrapper = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <>
    <Grid item xs={12}>
      <Typography variant="h5" gutterBottom sx={{ 
        mb: 2, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 1
      }}>
        {icon}
        {title}
      </Typography>
    </Grid>
    {children}
  </>
);

// CARD WRAPPER COMPONENT
const CardWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ 
    height: '100%', 
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column'
  }}>
    {children}
  </Box>
);

export default function Dashboard() {
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });

  const [isGlobalFullscreen, setIsGlobalFullscreen] = useState(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { 
    analyticsSummary, 
    isLoading, 
    refetchAnalytics,
    settings,
    updateSettings
  } = useDashboardAnalytics({ startDate, endDate });
  
  const isMounted = useRef(true);
  
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleGlobalFullscreen = () => {
    if (!isGlobalFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        setIsGlobalFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsGlobalFullscreen(false);
      }
    }
  };

  // Keyboard shortcuts for global fullscreen
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        handleGlobalFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      setIsGlobalFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isGlobalFullscreen]);
  
  // Auto-refresh analytics data
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isMounted.current) {
        console.log('Auto-refreshing comprehensive dashboard data...');
        refetchAnalytics();
      }
    }, settings.refreshInterval);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [refetchAnalytics, settings.refreshInterval]);
  
  // Prepare chart data
  const salesTrendData = analyticsSummary ? {
    labels: analyticsSummary.dailySalesTrend.map(day => day.date),
    datasets: [
      {
        label: 'Daily Sales',
        data: analyticsSummary.dailySalesTrend.map(day => day.sales),
        borderColor: '#6B8E23',
        backgroundColor: 'rgba(107, 142, 35, 0.1)',
        tension: 0.3
      },
    ],
  } : { labels: [], datasets: [] };
  
  const topServicesData = analyticsSummary ? {
    labels: analyticsSummary.topServices.map(service => service.serviceName),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsSummary.topServices.map(service => service.revenue),
        backgroundColor: [
          '#6B8E23',
          '#92AF42',
          '#B8D058',
          '#D6E8A0',
          '#F0F7D4',
        ],
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
      },
    ],
  } : { labels: [], datasets: [] };
  
  // Enhanced payment method breakdown data
  const paymentMethodData = analyticsSummary ? {
    labels: analyticsSummary.paymentMethodBreakdown.map(payment => 
      PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod
    ),
    datasets: [
      {
        label: 'Payment Amount',
        data: analyticsSummary.paymentMethodBreakdown.map(payment => payment.amount),
        backgroundColor: [
          '#6B8E23', // Cash
          '#4A90E2', // Credit Card
          '#7ED321', // Debit Card
          '#F5A623', // UPI
          '#BD10E0', // BNPL
          '#50E3C2', // Membership
          '#FF6B6B', // Split
        ],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Stock levels data
  const stockLevelsData = analyticsSummary ? {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        label: 'Product Count',
        data: [
          analyticsSummary.stockAnalytics.inStock,
          analyticsSummary.stockAnalytics.lowStock,
          analyticsSummary.stockAnalytics.outOfStock,
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Customer behavior data
  const customerBehaviorData = analyticsSummary ? {
    labels: analyticsSummary.customerBehavior.visitFrequencyDistribution.map(item => item.range),
    datasets: [
      {
        label: 'Customer Count',
        data: analyticsSummary.customerBehavior.visitFrequencyDistribution.map(item => item.customerCount),
        backgroundColor: 'rgba(107, 142, 35, 0.7)',
        borderColor: '#6B8E23',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Staff performance data
  const staffPerformanceData = analyticsSummary ? {
    labels: analyticsSummary.staffPerformance.topPerformers.map(staff => staff.stylistName),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsSummary.staffPerformance.topPerformers.map(staff => staff.revenue),
        backgroundColor: 'rgba(107, 142, 35, 0.7)',
        borderColor: '#6B8E23',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Revenue breakdown data
  const revenueBreakdownData = analyticsSummary ? {
    labels: ['Services', 'Products'],
    datasets: [
      {
        label: 'Revenue Breakdown',
        data: [
          analyticsSummary.revenueAnalytics.serviceRevenue,
          analyticsSummary.revenueAnalytics.productRevenue,
        ],
        backgroundColor: ['#6B8E23', '#8FBC8F'],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Peak hours data
  const peakHoursData = analyticsSummary ? {
    labels: analyticsSummary.peakHours.map(hour => hour.hour),
    datasets: [
      {
        label: 'Appointments',
        data: analyticsSummary.peakHours.map(hour => hour.appointments),
        backgroundColor: 'rgba(107, 142, 35, 0.7)',
        borderColor: '#6B8E23',
        borderWidth: 2,
        tension: 0.3
      },
    ],
  } : { labels: [], datasets: [] };

  // Service categories data
  const serviceCategoriesData = analyticsSummary ? {
    labels: analyticsSummary.serviceCategoryBreakdown.map(category => category.category),
    datasets: [
      {
        label: 'Revenue by Category',
        data: analyticsSummary.serviceCategoryBreakdown.map(category => category.revenue),
        backgroundColor: [
          '#6B8E23',
          '#8FBC8F',
          '#9ACD32',
          '#32CD32',
          '#228B22',
          '#90EE90',
        ],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Appointment status data
  const appointmentStatusData = analyticsSummary ? {
    labels: analyticsSummary.appointmentStatusBreakdown.map(status => 
      status.status.charAt(0).toUpperCase() + status.status.slice(1)
    ),
    datasets: [
      {
        label: 'Appointment Status',
        data: analyticsSummary.appointmentStatusBreakdown.map(status => status.count),
        backgroundColor: [
          '#6B8E23', // Completed
          '#F5A623', // Scheduled
          '#E74C3C', // Cancelled
          '#3498DB', // Rescheduled
        ],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  } : { labels: [], datasets: [] };

  // Function to render charts based on type and settings - FIXED VERSION
  const renderChart = (chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'radar', data: any, height: number = 330, options?: any) => {
    console.log('Rendering chart:', chartType, 'with data:', data?.datasets?.length || 0, 'datasets');
    
    return (
      <ChartRenderer
        chartType={chartType}
        data={data}
        height={height}
        options={options}
        currencyFormat={true}
        showPercentage={true}
      />
    );
  };
  
  // Handle manual refresh
  const handleRefresh = async () => {
    console.log('Manual comprehensive dashboard refresh triggered');
    try {
      await refetchAnalytics();
      showNotification('Dashboard data refreshed successfully', 'success');
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      showNotification('Failed to refresh dashboard data', 'error');
    }
  };
  
  // Handle date changes
  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate.toISOString().split('T')[0]);
    setEndDate(newEndDate.toISOString().split('T')[0]);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={3} px={2}>
          <Box>
            <Typography variant="h1" gutterBottom sx={{ mb: 0.5 }}>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Real-time insights for your salon business
            </Typography>
            {isLoading && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Loading analytics data...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DateRangePicker
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              onDateRangeChange={handleDateRangeChange}
            />
            <Tooltip title={isGlobalFullscreen ? "Exit Fullscreen (Ctrl+Alt+A)" : "Fullscreen Mode (Ctrl+Alt+A)"}>
              <IconButton 
                onClick={handleGlobalFullscreen} 
                color="primary" 
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  }
                }}
              >
                {isGlobalFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh all data">
              <IconButton 
                onClick={handleRefresh} 
                color="primary" 
                size="small"
                disabled={isLoading}
              >
                <RefreshIcon 
                  sx={{ 
                    animation: isLoading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    }
                  }} 
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {isLoading && !analyticsSummary ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh" width="100%">
            <CircularProgress />
          </Box>
        ) : !analyticsSummary ? (
          <Box width="100%" px={2}>
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <IconButton
                  aria-label="refresh"
                  color="inherit"
                  size="small"
                  onClick={handleRefresh}
                >
                  <RefreshIcon fontSize="inherit" />
                </IconButton>
              }
            >
              Failed to load analytics data. Please try refreshing the dashboard.
            </Alert>
          </Box>
        ) : (
          <Fade in={!!analyticsSummary}>
            <Box width="100%">


              {/* CORE METRICS & REVENUE */}
              {(settings.visibleMetrics.dailySales || settings.visibleMetrics.appointments || 
                settings.visibleMetrics.averageTicket || settings.visibleMetrics.retentionRate || 
                settings.visibleMetrics.revenueBreakdown) && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Business Performance" 
                    icon={<TrendingUpIcon sx={{ color: 'primary.main' }} />}
                  >
                    {/* Core KPIs */}
                    {settings.visibleMetrics.dailySales && (
                      <Grid item xs={12} md={3}>
                        <KPICard
                          title="Period Sales"
                          value={formatAmount(analyticsSummary.periodSales)}
                          icon={<MoneyIcon />}
                          color="success"
                          subtitle={`${analyticsSummary.salesChangePercentage >= 0 ? '+' : ''}${analyticsSummary.salesChangePercentage.toFixed(1)}% vs previous`}
                          trend={analyticsSummary.salesChangePercentage >= 0 ? 'up' : 'down'}
                        />
                      </Grid>
                    )}
                    {settings.visibleMetrics.appointments && (
                      <Grid item xs={12} md={3}>
                        <KPICard
                          title="Total Appointments"
                          value={analyticsSummary.periodAppointments.toString()}
                          icon={<CalendarIcon />}
                          color="primary"
                          subtitle={`${analyticsSummary.appointmentAnalytics.completionRate.toFixed(1)}% completion rate`}
                        />
                      </Grid>
                    )}
                    {settings.visibleMetrics.averageTicket && (
                      <Grid item xs={12} md={3}>
                        <KPICard
                          title="Average Ticket"
                          value={formatAmount(analyticsSummary.averageTicketPrice)}
                          icon={<ReceiptIcon />}
                          color="warning"
                          subtitle={`${analyticsSummary.averageTicketChangePercentage >= 0 ? '+' : ''}${analyticsSummary.averageTicketChangePercentage.toFixed(1)}% vs previous`}
                          trend={analyticsSummary.averageTicketChangePercentage >= 0 ? 'up' : 'down'}
                        />
                      </Grid>
                    )}
                    {settings.visibleMetrics.retentionRate && (
                      <Grid item xs={12} md={3}>
                        <KPICard
                          title="Customer Retention"
                          value={`${analyticsSummary.retentionRate.toFixed(1)}%`}
                          icon={<GroupIcon />}
                          color="info"
                          subtitle={`${analyticsSummary.repeatCustomers} returning customers`}
                        />
                      </Grid>
                    )}

                    {/* Sales Trend Chart */}
                    {settings.visibleMetrics.revenueBreakdown && (
                      <Grid item xs={12}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Sales Trend"
                            subtitle={`${startDate ? format(new Date(startDate), 'MMM d') : '...'} - ${endDate ? format(new Date(endDate), 'MMM d, yyyy') : '...'}`}
                            data={analyticsSummary.dailySalesTrend}
                            downloadType="sales-trend"
                            icon={<ShowChartIcon color="primary" />}
                          >
                            {renderChart(settings.chartTypes.salesTrend, salesTrendData)}
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* Revenue Breakdown - Half Width, Left Aligned */}
                    {settings.visibleMetrics.revenueBreakdown && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Revenue Breakdown"
                            subtitle={`Total: ${formatAmount(analyticsSummary.revenueAnalytics.totalRevenue)}`}
                            data={[
                              { category: 'Services', amount: analyticsSummary.revenueAnalytics.serviceRevenue },
                              { category: 'Products', amount: analyticsSummary.revenueAnalytics.productRevenue }
                            ]}
                            downloadType="sales-trend"
                            icon={<AccountBalanceIcon color="primary" />}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 370,
                              px: 4,
                              py: 3,
                              pb: 4,
                              gap: 2
                            }}>
                              <OrdersVsProductsChart
                                serviceRevenue={analyticsSummary.revenueAnalytics.serviceRevenue}
                                productRevenue={analyticsSummary.revenueAnalytics.productRevenue}
                                serviceCount={analyticsSummary.appointmentAnalytics.totalAppointments}
                                productCount={analyticsSummary.stockAnalytics.totalProducts}
                                serviceGrowth={analyticsSummary.revenueAnalytics.revenueGrowthRate}
                                productGrowth={analyticsSummary.revenueAnalytics.revenueGrowthRate}
                                period={`${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d, yyyy')}`}
                                chartType="doughnut"
                                height={320}
                              />
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* Staff Utilization Meter - Half Width, Right Aligned */}
                    {settings.visibleMetrics.revenueBreakdown && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Staff Performance & Utilization"
                            subtitle="Individual staff revenue and performance metrics"
                            data={analyticsSummary.staffPerformance.topPerformers}
                            downloadType="staff-revenue"
                            icon={<PeopleIcon color="primary" />}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: 370,
                              px: 3,
                              py: 2,
                              gap: 1
                            }}>
                              {/* Staff Performance Overview */}
                              <Box textAlign="center" mb={2}>
                                <Grid container spacing={2}>
                                  <Grid item xs={4}>
                                    <Typography variant="h6" sx={{ 
                                      color: 'primary.main',
                                      fontWeight: 'bold'
                                    }}>
                                      {analyticsSummary.staffPerformance.totalStaff || 0}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}>
                                      Total Staff
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="h6" sx={{ 
                                      color: 'success.main',
                                      fontWeight: 'bold'
                                    }}>
                                      {formatAmount(analyticsSummary.staffPerformance.averageRevenue || 0)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}>
                                      Avg Revenue
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography variant="h6" sx={{ 
                                      color: analyticsSummary.staffPerformance.topPerformers.length >= 3 ? 'success.main' : 
                                             analyticsSummary.staffPerformance.topPerformers.length >= 1 ? 'warning.main' : 'error.main',
                                      fontWeight: 'bold'
                                    }}>
                                      {(() => {
                                        const avgRevenue = analyticsSummary.staffPerformance.averageRevenue || 0;
                                        const highPerformers = analyticsSummary.staffPerformance.topPerformers.filter(
                                          staff => staff.revenue >= avgRevenue * 1.2
                                        ).length;
                                        const totalStaff = analyticsSummary.staffPerformance.totalStaff || 1;
                                        return Math.round((highPerformers / totalStaff) * 100);
                                      })()}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary',
                                      display: 'block'
                                    }}>
                                      High Performers
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>

                              <Divider sx={{ my: 1 }} />

                              {/* Individual Staff Performance List */}
                              <Box sx={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="subtitle1" sx={{ 
                                  color: 'text.primary',
                                  fontWeight: 600,
                                  mb: 1
                                }}>
                                  Individual Performance
                                </Typography>
                                
                                <Box sx={{ 
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.5,
                                  maxHeight: 220,
                                  overflowY: 'auto',
                                  overflowX: 'hidden',
                                  pr: 1,
                                  '&::-webkit-scrollbar': {
                                    width: '4px',
                                  },
                                  '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '4px',
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    background: '#6B8E23',
                                    borderRadius: '4px',
                                  },
                                  '&::-webkit-scrollbar-thumb:hover': {
                                    background: '#5a7a1e',
                                  },
                                }}>
                                  {analyticsSummary.staffPerformance.topPerformers.length > 0 ? (
                                    analyticsSummary.staffPerformance.topPerformers.slice(0, 6).map((staff, index) => {
                                      const averageRevenue = analyticsSummary.staffPerformance.averageRevenue || 1;
                                      const performancePercentage = Math.min((staff.revenue / Math.max(averageRevenue, 1)) * 100, 150);
                                      const isHighPerformer = staff.revenue >= averageRevenue * 1.2;
                                      
                                      return (
                                        <Box 
                                          key={staff.stylistId || index} 
                                          sx={{ 
                                            width: '100%',
                                            p: 2,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: isHighPerformer ? 'success.light' : 'divider',
                                            backgroundColor: isHighPerformer ? 'success.lighter' : 'background.paper'
                                          }}
                                        >
                                          <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mb: 1
                                          }}>
                                            <Typography variant="body2" sx={{ 
                                              fontWeight: 600,
                                              color: 'text.primary'
                                            }}>
                                              {staff.stylistName || `Staff ${index + 1}`}
                                            </Typography>
                                            <Chip
                                              label={`${formatAmount(staff.revenue)}`}
                                              size="small"
                                              color={isHighPerformer ? 'success' : 'default'}
                                              sx={{
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem'
                                              }}
                                            />
                                          </Box>
                                          
                                          <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mb: 0.5
                                          }}>
                                            <Typography variant="caption" sx={{ 
                                              color: 'text.secondary'
                                            }}>
                                              Performance vs Average
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                              fontWeight: 'bold',
                                              color: performancePercentage >= 120 ? 'success.main' :
                                                     performancePercentage >= 80 ? 'warning.main' : 'error.main'
                                            }}>
                                              {performancePercentage.toFixed(0)}%
                                            </Typography>
                                          </Box>
                                          
                                          <LinearProgress
                                            variant="determinate"
                                            value={Math.min(performancePercentage, 100)}
                                            sx={{
                                              height: 6,
                                              borderRadius: 3,
                                              backgroundColor: '#f0f0f0',
                                              '& .MuiLinearProgress-bar': {
                                                borderRadius: 3,
                                                backgroundColor: performancePercentage >= 120 ? '#4caf50' :
                                                               performancePercentage >= 80 ? '#ff9800' : '#e74c3c'
                                              }
                                            }}
                                          />
                                          
                                          <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            mt: 0.5
                                          }}>
                                            <Typography variant="caption" sx={{ 
                                              color: 'text.secondary'
                                            }}>
                                              {staff.appointmentCount || 0} appointments
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                              color: 'text.secondary'
                                            }}>
                                              {staff.efficiency ? `${staff.efficiency.toFixed(1)}% efficient` : 'Calculating...'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      );
                                    })
                                  ) : (
                                    <Box sx={{ 
                                      textAlign: 'center',
                                      py: 4,
                                      color: 'text.secondary'
                                    }}>
                                      <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                      <Typography variant="body2">
                                        No staff performance data available
                                      </Typography>
                                      <Typography variant="caption">
                                        Data will appear once appointments are completed
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}
                  </SectionWrapper>
                </Grid>
              )}

              {/* CUSTOMER & APPOINTMENT ANALYTICS */}
              {(settings.visibleMetrics.customerBehavior || settings.visibleMetrics.customerRetention || 
                settings.visibleMetrics.customerLifetimeValue || settings.visibleMetrics.visitFrequency || 
                settings.visibleMetrics.upcomingAppointments) && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Customer & Appointment Analytics" 
                    icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
                  >
                    {/* Customer Behavior */}
                    {settings.visibleMetrics.customerBehavior && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Customer Behavior Trends"
                            subtitle={`${analyticsSummary.totalCustomers} total customers analyzed`}
                            data={analyticsSummary.customerBehavior.topCustomers}
                            downloadType="customer-analytics"
                            icon={<PeopleIcon color="primary" />}
                          >
                            <Grid container spacing={2} mb={2}>
                              <Grid item xs={6}>
                                <Box textAlign="center">
                                  <Typography variant="h4" color="success.main">
                                    {analyticsSummary.customerBehavior.newCustomers}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    New Customers
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box textAlign="center">
                                  <Typography variant="h4" color="primary.main">
                                    {analyticsSummary.customerBehavior.returningCustomers}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Returning Customers
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                            {renderChart(settings.chartTypes.customerBehavior, customerBehaviorData, 180)}
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {settings.visibleMetrics.customerRetention && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Customer Retention Analysis"
                            subtitle={`${analyticsSummary.customerBehavior.customerRetentionRate.toFixed(1)}% retention rate`}
                            data={[
                              { category: 'Retained', count: analyticsSummary.customerBehavior.returningCustomers },
                              { category: 'New', count: analyticsSummary.customerBehavior.newCustomers }
                            ]}
                            downloadType="customer-analytics"
                            icon={<GroupIcon color="primary" />}
                          >
                            <Box textAlign="center" mb={2}>
                              <Typography variant="h3" color="primary.main">
                                {analyticsSummary.customerBehavior.customerRetentionRate.toFixed(1)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Customer Retention Rate
                              </Typography>
                            </Box>
                            {renderChart(settings.chartTypes.customerRetention, {
                              labels: ['Returning Customers', 'New Customers'],
                              datasets: [{
                                data: [analyticsSummary.customerBehavior.returningCustomers, analyticsSummary.customerBehavior.newCustomers],
                                backgroundColor: ['#4caf50', '#2196f3'],
                              }]
                            }, 200)}
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {settings.visibleMetrics.customerLifetimeValue && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Customer Lifetime Value"
                            subtitle="Top spending customers"
                            data={analyticsSummary.customerBehavior.topCustomers}
                            downloadType="customer-analytics"
                            icon={<MoneyIcon color="success" />}
                          >
                            <Box textAlign="center" mb={2}>
                              <Typography variant="h4" color="success.main">
                                {formatCurrency(analyticsSummary.customerBehavior.customerLifetimeValue)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Average Customer Lifetime Value
                              </Typography>
                            </Box>
                            <Box sx={{ height: 200, overflowY: 'auto' }}>
                              <List dense>
                                {analyticsSummary.customerBehavior.topCustomers.slice(0, 5).map((customer, index) => (
                                  <ListItem key={index}>
                                    <ListItemText
                                      primary={customer.customerName}
                                      secondary={`${formatCurrency(customer.totalSpent)} • ${customer.visitCount} visits`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {settings.visibleMetrics.visitFrequency && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Visit Frequency Distribution"
                            subtitle="Customer visit patterns"
                            data={analyticsSummary.customerBehavior.visitFrequencyDistribution}
                            downloadType="customer-analytics"
                            icon={<TimelineIcon color="info" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              <List>
                                {analyticsSummary.customerBehavior.visitFrequencyDistribution.map((freq, index) => (
                                  <ListItem key={index} divider>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle2">{freq.range}</Typography>
                                          <Chip 
                                            label={freq.customerCount}
                                            size="small"
                                            color="primary"
                                          />
                                        </Box>
                                      }
                                      secondary={`${freq.customerCount} customers in this frequency range`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {settings.visibleMetrics.upcomingAppointments && analyticsSummary.upcomingAppointments.length > 0 && (
                      <Grid item xs={12}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Upcoming Appointments"
                            subtitle={`${analyticsSummary.upcomingAppointments.length} appointments scheduled in next 7 days`}
                            data={analyticsSummary.upcomingAppointments}
                            downloadType="appointments"
                            showDataCount={false}
                            icon={<ScheduleIcon color="primary" />}
                          >
                            <Box sx={{ 
                              height: 370,
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              pb: 3,
                              pr: 1,
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: '6px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: '#6B8E23',
                                borderRadius: '6px',
                              },
                              '&::-webkit-scrollbar-thumb:hover': {
                                background: '#5a7a1e',
                              },
                            }}>
                              <List sx={{ p: 0 }}>
                                {analyticsSummary.upcomingAppointments.slice(0, 10).map((appointment, index) => {
                                  // Enhanced client name display with better fallback logic
                                  const getDisplayClientName = (appointment: any) => {
                                    // Try multiple fallback sources for client name
                                    if (appointment.clientName && appointment.clientName !== 'Walk-in Customer') {
                                      return appointment.clientName;
                                    }
                                    if (appointment.client_name && appointment.client_name !== 'Walk-in Customer') {
                                      return appointment.client_name;
                                    }
                                    if (appointment.booker_name && appointment.is_for_someone_else) {
                                      return `${appointment.booker_name} (Booking for someone else)`;
                                    }
                                    // If still no valid name, show a more descriptive fallback
                                    return 'Walk-in Customer';
                                  };

                                  const clientName = getDisplayClientName(appointment);
                                  const isValidClient = clientName !== 'Walk-in Customer';

                                  return (
                                    <ListItem key={appointment.id} divider sx={{ py: 2, px: 2 }}>
                                      <ListItemIcon sx={{ minWidth: 48 }}>
                                        {appointment.isToday ? (
                                          <Badge badgeContent="Today" color="error" variant="standard">
                                            <CalendarIcon color="primary" />
                                          </Badge>
                                        ) : appointment.isTomorrow ? (
                                          <Badge badgeContent="Tomorrow" color="warning" variant="standard">
                                            <CalendarIcon color="secondary" />
                                          </Badge>
                                        ) : (
                                          <CalendarIcon color="action" />
                                        )}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                            <Typography 
                                              variant="subtitle1" 
                                              sx={{ 
                                                fontWeight: 600,
                                                color: isValidClient ? 'text.primary' : 'text.secondary'
                                              }}
                                            >
                                              {clientName}
                                              {!isValidClient && (
                                                <Chip 
                                                  label="Walk-in" 
                                                  size="small" 
                                                  color="default" 
                                                  sx={{ ml: 1, fontSize: '0.7rem' }}
                                                />
                                              )}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ 
                                              backgroundColor: appointment.isToday ? 'error.light' : 
                                                              appointment.isTomorrow ? 'warning.light' : 'primary.light',
                                              color: appointment.isToday ? 'error.contrastText' : 
                                                     appointment.isTomorrow ? 'warning.contrastText' : 'primary.contrastText',
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 1,
                                              fontWeight: 500
                                            }}>
                                              {appointment.timeUntilAppointment}
                                            </Typography>
                                          </Box>
                                        }
                                        secondary={
                                          <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" display="block" sx={{ mb: 0.5 }}>
                                              <strong>Service:</strong> {appointment.serviceName || 'Service Consultation'} | 
                                              <strong> Stylist:</strong> {appointment.stylistName || 'Staff Member'}
                                            </Typography>
                                            <Typography variant="body2" display="block" color="text.secondary">
                                              <strong>Time:</strong> {format(new Date(appointment.appointmentTime), 'MMM dd, yyyy - hh:mm a')} | 
                                              <strong> Duration:</strong> {appointment.duration || 60}min | 
                                              <strong> Price:</strong> {formatCurrency(appointment.price || 0)}
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ 
                                              mt: 0.5,
                                              color: appointment.status === 'scheduled' ? 'success.main' : 
                                                     appointment.status === 'confirmed' ? 'primary.main' : 'text.secondary'
                                            }}>
                                              Status: {appointment.status?.charAt(0).toUpperCase() + (appointment.status?.slice(1) || '')}
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                              
                              {analyticsSummary.upcomingAppointments.length > 10 && (
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  pt: 2, 
                                  borderTop: '1px solid',
                                  borderColor: 'divider',
                                  mt: 2
                                }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Showing 10 of {analyticsSummary.upcomingAppointments.length} upcoming appointments
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}
                  </SectionWrapper>
                </Grid>
              )}

              {/* PAYMENT ANALYTICS */}
              {settings.visibleMetrics.paymentMethods && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Payment & Financial Analytics" 
                    icon={<PaymentIcon sx={{ color: 'primary.main' }} />}
                  >
                    {/* Payment Methods */}
                    <Grid item xs={12} md={6}>
                      <CardWrapper>
                        <DownloadableCard
                          title="Payment Methods"
                          subtitle={`Total: ${formatCurrency(analyticsSummary.paymentMethodBreakdown.reduce((sum, p) => sum + p.amount, 0))}`}
                          data={analyticsSummary.paymentMethodBreakdown}
                          downloadType="payment-methods"
                          icon={<PaymentIcon color="primary" />}
                        >
                          <Box textAlign="center" mb={2}>
                            <Typography variant="h4" component="div" color="primary.main">
                              {formatCurrency(analyticsSummary.paymentMethodBreakdown.reduce((sum, p) => sum + p.amount, 0))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Processed
                            </Typography>
                            {analyticsSummary?.paymentMethodBreakdown && analyticsSummary.paymentMethodBreakdown.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word', px: 1 }}>
                                ({analyticsSummary.paymentMethodBreakdown
                                  .sort((a, b) => b.amount - a.amount)
                                  .map(p => `${(PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod).toLowerCase()} ${Math.round(p.amount)}`)
                                  .join(' ')})
                              </Typography>
                            )}
                          </Box>
                          {renderChart(settings.chartTypes.paymentMethods, paymentMethodData, 200)}
                        </DownloadableCard>
                      </CardWrapper>
                    </Grid>

                    {/* SPLIT PAYMENTS - NEW */}
                    {settings.visibleMetrics.splitPayments && analyticsSummary.splitPaymentDetails.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Split Payment Details"
                            subtitle={`${analyticsSummary.splitPaymentDetails.length} split payment transactions`}
                            data={analyticsSummary.splitPaymentDetails}
                            downloadType="payment-methods"
                            showDataCount={false}
                            icon={<ShoppingCartIcon color="info" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              <List>
                                {analyticsSummary.splitPaymentDetails.slice(0, 8).map((payment, index) => (
                                  <ListItem key={payment.orderId} divider>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle2">
                                            {payment.customerName || 'Anonymous Customer'}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {payment.date}
                                          </Typography>
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography variant="caption" display="block" fontWeight="bold">
                                            Total: {formatCurrency(payment.totalAmount)}
                                          </Typography>
                                          <Typography variant="caption" display="block" color="text.secondary">
                                            Order #{payment.orderId.substring(0, 8)}...
                                          </Typography>
                                          {payment.paymentMethods.map((method, idx) => (
                                            <Typography key={idx} variant="caption" display="block">
                                              {PAYMENT_METHOD_LABELS[method.method] || method.method}: {formatCurrency(method.amount)} ({method.percentage.toFixed(1)}%)
                                            </Typography>
                                          ))}
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* CUSTOMER ANALYTICS or PAYMENT TRENDS */}
                    {(!settings.visibleMetrics.splitPayments || analyticsSummary.splitPaymentDetails.length === 0) && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Customer Analytics"
                            data={analyticsSummary.customerBehavior.topCustomers}
                            downloadType="customer-analytics"
                            icon={<GroupIcon color="primary" />}
                          >
                            {renderChart(settings.chartTypes.customerBehavior, customerBehaviorData, 330)}
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* PAYMENT TRENDS - NEW */}
                    {settings.visibleMetrics.paymentTrends && (
                      <Grid item xs={12}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Payment Method Trends"
                            subtitle="Payment method usage over time"
                            data={analyticsSummary.paymentMethodBreakdown}
                            downloadType="payment-methods"
                            icon={<TimelineIcon color="info" />}
                          >
                            <Grid container spacing={2}>
                              {analyticsSummary.paymentMethodBreakdown.map((method, index) => (
                                <Grid item xs={12} md={4} key={method.paymentMethod}>
                                  <Box textAlign="center" p={2} border="1px solid #e0e0e0" borderRadius={2}>
                                    <Typography variant="h6" color="primary.main">
                                      {method.percentage.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {PAYMENT_METHOD_LABELS[method.paymentMethod] || method.paymentMethod}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      {formatCurrency(method.amount)} • {method.count} transactions
                                    </Typography>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}
                  </SectionWrapper>
                </Grid>
              )}

              {/* MONTHLY COMPARISON */}
              {settings.visibleMetrics.monthlyComparison && analyticsSummary.monthlyComparison.length > 0 && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Monthly Performance Analysis" 
                    icon={<TimelineIcon sx={{ color: 'primary.main' }} />}
                  >
                    <Grid item xs={12}>
                      <CardWrapper>
                        <DownloadableCard
                          title="Month-over-Month Analysis"
                          subtitle="Key metrics comparison with previous month"
                          data={analyticsSummary.monthlyComparison}
                          downloadType="monthly-comparison"
                          icon={<TimelineIcon color="primary" />}
                        >
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Metric</strong></TableCell>
                                  <TableCell align="right"><strong>Current Month</strong></TableCell>
                                  <TableCell align="right"><strong>Previous Month</strong></TableCell>
                                  <TableCell align="right"><strong>Change</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {analyticsSummary.monthlyComparison.map((comparison, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{comparison.metric}</TableCell>
                                    <TableCell align="right">
                                      {comparison.metric.toLowerCase().includes('revenue') || comparison.metric.toLowerCase().includes('sales') ? 
                                        formatCurrency(comparison.currentMonth) : 
                                        comparison.currentMonth.toLocaleString()
                                      }
                                    </TableCell>
                                    <TableCell align="right">
                                      {comparison.metric.toLowerCase().includes('revenue') || comparison.metric.toLowerCase().includes('sales') ? 
                                        formatCurrency(comparison.previousMonth) : 
                                        comparison.previousMonth.toLocaleString()
                                      }
                                    </TableCell>
                                    <TableCell align="right">
                                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                                        <Typography 
                                          variant="body2" 
                                          color={comparison.changePercentage >= 0 ? "success.main" : "error.main"}
                                          sx={{ fontWeight: 'bold' }}
                                        >
                                          {comparison.changePercentage >= 0 ? '+' : ''}{comparison.changePercentage.toFixed(1)}%
                                        </Typography>
                                        {comparison.changePercentage >= 0 ? (
                                          <TrendingUpIcon color="success" sx={{ ml: 0.5, fontSize: 16 }} />
                                        ) : (
                                          <TrendingDownIcon color="error" sx={{ ml: 0.5, fontSize: 16 }} />
                                        )}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </DownloadableCard>
                      </CardWrapper>
                    </Grid>
                  </SectionWrapper>
                </Grid>
              )}
            </Box>
          </Fade>
        )}
        
        {/* Dashboard Settings Component */}
        <DashboardSettings 
          settings={settings}
          onSettingsChange={updateSettings}
          onRefresh={refetchAnalytics}
        />
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
} 