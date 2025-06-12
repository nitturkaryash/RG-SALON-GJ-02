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
    minHeight: 330,
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
              Comprehensive Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Real-time insights for your salon business • Press Ctrl+Alt+A for fullscreen
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
              {/* TODAY'S SUMMARY DASHBOARD & REAL-TIME METRICS */}
              {(settings.visibleMetrics.todaysSummary || settings.visibleMetrics.realTimeMetrics) && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Today's Overview & Real-Time Metrics" 
                    icon={<AssessmentIcon sx={{ color: 'primary.main' }} />}
                  >
                    {/* Today's Summary Cards */}
                    {settings.visibleMetrics.todaysSummary && (
                      <>
                        <Grid item xs={12} md={2.4}>
                          <KPICard
                            title="Today's Revenue"
                            value={formatCurrency(analyticsSummary.todaysMetrics.revenue)}
                            icon={<MoneyIcon />}
                            color="success"
                            subtitle="Current day total"
                          />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                          <KPICard
                            title="Today's Appointments"
                            value={analyticsSummary.todaysMetrics.appointments.toString()}
                            icon={<CalendarIcon />}
                            color="primary"
                            subtitle="Scheduled today"
                          />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                          <KPICard
                            title="Walk-ins"
                            value={analyticsSummary.todaysMetrics.walkIns.toString()}
                            icon={<PersonAddIcon />}
                            color="info"
                            subtitle="Unscheduled visits"
                          />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                          <KPICard
                            title="Average Ticket"
                            value={formatCurrency(analyticsSummary.todaysMetrics.averageTicket)}
                            icon={<ReceiptIcon />}
                            color="warning"
                            subtitle="Today's average"
                          />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                          <KPICard
                            title="Busiest Hour"
                            value={analyticsSummary.todaysMetrics.busyHour || 'N/A'}
                            icon={<AccessTimeIcon />}
                            color="secondary"
                            subtitle="Peak activity"
                          />
                        </Grid>
                      </>
                    )}

                    {/* Real-Time Metrics */}
                    {settings.visibleMetrics.realTimeMetrics && (
                      <>
                        <Grid item xs={12} md={3}>
                          <CardWrapper>
                            <DownloadableCard
                              title="Today's Performance"
                              subtitle="Current day metrics"
                              data={[analyticsSummary.todaysMetrics]}
                              downloadType="real-time"
                              showDataCount={false}
                              icon={<TrendingUpIcon color="success" />}
                            >
                              <Box textAlign="center">
                                <Typography variant="h4" color="success.main" gutterBottom>
                                  {formatCurrency(analyticsSummary.todaysMetrics.revenue)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Today's Revenue
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" color="primary.main">
                                  {analyticsSummary.todaysMetrics.appointments}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Appointments Today
                                </Typography>
                              </Box>
                            </DownloadableCard>
                          </CardWrapper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <CardWrapper>
                            <DownloadableCard
                              title="Revenue Goal Progress"
                              subtitle="Daily target tracking"
                              data={[{
                                current: analyticsSummary.todaysMetrics.revenue,
                                target: analyticsSummary.revenueAnalytics.dailyRevenueGoal,
                                percentage: (analyticsSummary.todaysMetrics.revenue / Math.max(analyticsSummary.revenueAnalytics.dailyRevenueGoal, 1)) * 100
                              }]}
                              downloadType="real-time"
                              showDataCount={false}
                              icon={<TrendingUpIcon color="warning" />}
                            >
                              <Box textAlign="center">
                                <Typography variant="h4" color="warning.main" gutterBottom>
                                  {((analyticsSummary.todaysMetrics.revenue / Math.max(analyticsSummary.revenueAnalytics.dailyRevenueGoal, 1)) * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Goal Achievement
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min((analyticsSummary.todaysMetrics.revenue / Math.max(analyticsSummary.revenueAnalytics.dailyRevenueGoal, 1)) * 100, 100)} 
                                  sx={{ my: 2 }}
                                  color={
                                    (analyticsSummary.todaysMetrics.revenue / Math.max(analyticsSummary.revenueAnalytics.dailyRevenueGoal, 1)) * 100 >= 100 ? "success" :
                                    (analyticsSummary.todaysMetrics.revenue / Math.max(analyticsSummary.revenueAnalytics.dailyRevenueGoal, 1)) * 100 >= 75 ? "primary" : "warning"
                                  }
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Target: {formatCurrency(analyticsSummary.revenueAnalytics.dailyRevenueGoal)}
                                </Typography>
                              </Box>
                            </DownloadableCard>
                          </CardWrapper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <CardWrapper>
                            <DownloadableCard
                              title="Monthly Projection"
                              subtitle="Based on current trends"
                              data={[{
                                projection: analyticsSummary.revenueAnalytics.monthlyProjection,
                                current: analyticsSummary.revenueAnalytics.totalRevenue
                              }]}
                              downloadType="real-time"
                              showDataCount={false}
                              icon={<TimelineIcon color="info" />}
                            >
                              <Box textAlign="center">
                                <Typography variant="h4" color="info.main" gutterBottom>
                                  {formatCurrency(analyticsSummary.revenueAnalytics.monthlyProjection)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Projected Monthly Revenue
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                  Growth Rate: {analyticsSummary.revenueAnalytics.revenueGrowthRate.toFixed(1)}%
                                </Typography>
                              </Box>
                            </DownloadableCard>
                          </CardWrapper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <CardWrapper>
                            <DownloadableCard
                              title="Live Activity"
                              subtitle="Current business status"
                              data={[{
                                busyHour: analyticsSummary.todaysMetrics.busyHour,
                                topService: analyticsSummary.todaysMetrics.topService,
                                walkIns: analyticsSummary.todaysMetrics.walkIns
                              }]}
                              downloadType="real-time"
                              showDataCount={false}
                              icon={<AccessTimeIcon color="secondary" />}
                            >
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Busiest Hour Today
                                </Typography>
                                <Typography variant="h6" color="secondary.main" gutterBottom>
                                  {analyticsSummary.todaysMetrics.busyHour || 'N/A'}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Top Service Today
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                  {analyticsSummary.todaysMetrics.topService || 'N/A'}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary">
                                  Walk-ins: {analyticsSummary.todaysMetrics.walkIns}
                                </Typography>
                              </Box>
                            </DownloadableCard>
                          </CardWrapper>
                        </Grid>
                      </>
                    )}
                  </SectionWrapper>
                </Grid>
              )}

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
                          value={formatCurrency(analyticsSummary.periodSales)}
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
                          value={formatCurrency(analyticsSummary.averageTicketPrice)}
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

                    {/* Revenue Charts */}
                    {settings.visibleMetrics.revenueBreakdown && (
                      <>
                        <Grid item xs={12} md={8}>
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
                        <Grid item xs={12} md={4}>
                          <CardWrapper>
                            <DownloadableCard
                              title="Revenue Breakdown"
                              subtitle={`Total: ${formatCurrency(analyticsSummary.revenueAnalytics.totalRevenue)}`}
                              data={[
                                { category: 'Services', amount: analyticsSummary.revenueAnalytics.serviceRevenue },
                                { category: 'Products', amount: analyticsSummary.revenueAnalytics.productRevenue }
                              ]}
                              downloadType="sales-trend"
                              icon={<AccountBalanceIcon color="primary" />}
                            >
                              <OrdersVsProductsChart
                                serviceRevenue={analyticsSummary.revenueAnalytics.serviceRevenue}
                                productRevenue={analyticsSummary.revenueAnalytics.productRevenue}
                                serviceCount={analyticsSummary.appointmentAnalytics.totalAppointments}
                                productCount={analyticsSummary.stockAnalytics.totalProducts}
                                serviceGrowth={analyticsSummary.revenueAnalytics.revenueGrowthRate}
                                productGrowth={analyticsSummary.revenueAnalytics.revenueGrowthRate}
                                period={`${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d, yyyy')}`}
                                chartType="doughnut"
                                height={220}
                              />
                            </DownloadableCard>
                          </CardWrapper>
                        </Grid>
                      </>
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
                            subtitle={`${analyticsSummary.upcomingAppointments.length} appointments scheduled`}
                            data={analyticsSummary.upcomingAppointments}
                            downloadType="appointments"
                            showDataCount={false}
                            icon={<ScheduleIcon color="primary" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              <List>
                                {analyticsSummary.upcomingAppointments.slice(0, 10).map((appointment, index) => (
                                  <ListItem key={appointment.id} divider>
                                    <ListItemIcon>
                                      {appointment.isToday ? (
                                        <Badge badgeContent="Today" color="error">
                                          <CalendarIcon color="primary" />
                                        </Badge>
                                      ) : appointment.isTomorrow ? (
                                        <Badge badgeContent="Tomorrow" color="warning">
                                          <CalendarIcon color="secondary" />
                                        </Badge>
                                      ) : (
                                        <CalendarIcon color="action" />
                                      )}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle2">{appointment.clientName}</Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {appointment.timeUntilAppointment}
                                          </Typography>
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography variant="caption" display="block">
                                            Service: {appointment.serviceName} | Stylist: {appointment.stylistName}
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            Time: {appointment.appointmentTime} | Duration: {appointment.duration}min | {formatCurrency(appointment.price)}
                                          </Typography>
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
                  </SectionWrapper>
                </Grid>
              )}

              {/* STAFF ANALYTICS */}
              {(settings.visibleMetrics.staffUtilization || settings.visibleMetrics.revenuePerStaff || 
                settings.visibleMetrics.staffEfficiency || settings.visibleMetrics.stylistRevenue) && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Staff Performance & Utilization" 
                    icon={<BusinessIcon sx={{ color: 'primary.main' }} />}
                  >
                    {/* Staff Utilization */}
                    {settings.visibleMetrics.staffUtilization && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Staff Utilization Rates"
                            subtitle={`${analyticsSummary.staffUtilization.average.toFixed(1)}% average utilization`}
                            data={analyticsSummary.staffUtilization.byStaff}
                            downloadType="staff-utilization"
                            icon={<BusinessIcon color="primary" />}
                            height={350}
                          >
                            <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
                              <List>
                                {analyticsSummary.staffUtilization.byStaff.map((staff, index) => (
                                  <ListItem 
                                    key={staff.stylistId} 
                                    divider 
                                    sx={{ 
                                      py: 1,
                                      px: 1
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography 
                                            variant="subtitle2" 
                                            noWrap 
                                            sx={{ 
                                              maxWidth: '70%',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {staff.stylistName}
                                          </Typography>
                                          <Chip 
                                            label={`${staff.rate.toFixed(1)}%`}
                                            size="small"
                                            color={staff.rate >= 80 ? "success" : staff.rate >= 60 ? "warning" : "error"}
                                            sx={{ minWidth: 60 }}
                                          />
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={Math.min(staff.rate, 100)} 
                                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                            color={staff.rate >= 80 ? "success" : staff.rate >= 60 ? "warning" : "error"}
                                          />
                                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {staff.hoursBooked} hrs booked / {staff.hoursAvailable} hrs available
                                          </Typography>
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

                    {settings.visibleMetrics.stylistRevenue && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Individual Stylist Revenue"
                            subtitle="Revenue breakdown by stylist"
                            data={analyticsSummary.stylistRevenue}
                            downloadType="staff-revenue"
                            icon={<MoneyIcon color="success" />}
                            height={350}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ height: '60%', mb: 2 }}>
                                {renderChart(settings.chartTypes.stylistRevenue, {
                                  labels: analyticsSummary.stylistRevenue.slice(0, 5).map(s => s.stylistName.split(' ')[0]),
                                  datasets: [{
                                    label: 'Revenue',
                                    data: analyticsSummary.stylistRevenue.slice(0, 5).map(s => s.revenue),
                                    backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336'],
                                  }]
                                })}
                              </Box>
                              <Box sx={{ height: '40%', overflowY: 'auto', pr: 1 }}>
                                <List dense>
                                  {analyticsSummary.stylistRevenue.map((stylist, index) => (
                                    <ListItem 
                                      key={stylist.stylistId} 
                                      divider
                                      sx={{ 
                                        py: 0.5,
                                        px: 1,
                                        backgroundColor: index < 3 ? 'rgba(107, 142, 35, 0.05)' : 'transparent'
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center">
                                              <Typography 
                                                variant="body2" 
                                                fontWeight="medium" 
                                                sx={{ 
                                                  maxWidth: '150px',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap'
                                                }}
                                              >
                                                {index + 1}. {stylist.stylistName}
                                              </Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                              {formatCurrency(stylist.revenue)}
                                            </Typography>
                                          </Box>
                                        }
                                        secondary={
                                          <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" color="text.secondary">
                                              {stylist.appointmentCount} appointments
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Avg: {formatCurrency(stylist.revenue / Math.max(stylist.appointmentCount, 1))}
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* REVENUE PER STAFF - NEW */}
                    {settings.visibleMetrics.revenuePerStaff && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Revenue per Staff Member"
                            subtitle={`Average: ${formatCurrency(analyticsSummary.staffPerformance.averageRevenue)} per staff`}
                            data={analyticsSummary.staffPerformance.topPerformers}
                            downloadType="staff-revenue"
                            icon={<AccountBalanceIcon color="success" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              <List>
                                {analyticsSummary.staffPerformance.topPerformers.map((staff, index) => (
                                  <ListItem key={staff.stylistId} divider>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle2">{staff.stylistName}</Typography>
                                          <Typography variant="h6" color="success.main">
                                            {formatCurrency(staff.revenue)}
                                          </Typography>
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography variant="caption" display="block">
                                            Appointments: {staff.appointmentCount} | Services: {staff.serviceCount}
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            Avg per Appointment: {formatCurrency(staff.revenue / Math.max(staff.appointmentCount, 1))}
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            Efficiency: {staff.efficiency.toFixed(1)}%
                                          </Typography>
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

                    {/* STAFF EFFICIENCY - NEW */}
                    {settings.visibleMetrics.staffEfficiency && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Staff Efficiency Metrics"
                            subtitle="Performance efficiency analysis"
                            data={analyticsSummary.staffPerformance.topPerformers}
                            downloadType="staff-efficiency"
                            icon={<AssessmentIcon color="info" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              <List>
                                {analyticsSummary.staffPerformance.topPerformers
                                  .sort((a, b) => b.efficiency - a.efficiency)
                                  .map((staff, index) => (
                                  <ListItem key={staff.stylistId} divider>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle2">{staff.stylistName}</Typography>
                                          <Chip 
                                            label={`${staff.efficiency.toFixed(1)}%`}
                                            size="small"
                                            color={staff.efficiency >= 90 ? "success" : staff.efficiency >= 75 ? "primary" : staff.efficiency >= 60 ? "warning" : "error"}
                                          />
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={Math.min(staff.efficiency, 100)} 
                                            sx={{ mt: 1, mb: 1 }}
                                            color={staff.efficiency >= 90 ? "success" : staff.efficiency >= 75 ? "primary" : staff.efficiency >= 60 ? "warning" : "error"}
                                          />
                                          <Typography variant="caption" display="block">
                                            Performance Score: {staff.performanceScore}/100
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            Rating: {staff.performanceRating}
                                          </Typography>
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
                  </SectionWrapper>
                </Grid>
              )}

              {/* INVENTORY ANALYTICS */}
              {settings.visibleMetrics.stockLevels && (
                <Grid container spacing={3} mb={4}>
                  <SectionWrapper 
                    title="Inventory Management" 
                    icon={<InventoryIcon sx={{ color: 'primary.main' }} />}
                  >
                    {/* Stock Levels */}
                    <Grid item xs={12} md={8}>
                      <CardWrapper>
                        <DownloadableCard
                          title="Stock Level Overview"
                          data={analyticsSummary.stockAnalytics.criticalItems}
                          downloadType="inventory"
                          icon={<InventoryIcon color="primary" />}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h3" color="success.main">
                                  {analyticsSummary.stockAnalytics.inStock}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  In Stock
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h3" color="warning.main">
                                  {analyticsSummary.stockAnalytics.lowStock}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Low Stock
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h3" color="error.main">
                                  {analyticsSummary.stockAnalytics.outOfStock}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Out of Stock
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h3" color="primary.main">
                                  {analyticsSummary.stockAnalytics.totalProducts}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total Products
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          <Box mt={3}>
                            {renderChart(settings.chartTypes.stockLevels, stockLevelsData, 180)}
                          </Box>
                        </DownloadableCard>
                      </CardWrapper>
                    </Grid>

                    {/* INVENTORY VALUE - NEW */}
                    {settings.visibleMetrics.inventoryValue && (
                      <Grid item xs={12} md={4}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Inventory Value Analysis"
                            subtitle={`Total inventory worth ${formatCurrency(analyticsSummary.stockAnalytics.inventoryValue)}`}
                            data={[
                              { category: 'In Stock Value', value: analyticsSummary.stockAnalytics.inventoryValue },
                              { category: 'Products', value: analyticsSummary.stockAnalytics.totalProducts }
                            ]}
                            downloadType="inventory"
                            showDataCount={false}
                            icon={<MoneyIcon color="success" />}
                          >
                            <Box textAlign="center" mb={2}>
                              <Typography variant="h3" color="success.main">
                                {formatCurrency(analyticsSummary.stockAnalytics.inventoryValue)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Inventory Value
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Average Product Value: {formatCurrency(analyticsSummary.stockAnalytics.inventoryValue / Math.max(analyticsSummary.stockAnalytics.totalProducts, 1))}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                In Stock: {analyticsSummary.stockAnalytics.inStock} items
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Need Attention: {analyticsSummary.stockAnalytics.lowStock + analyticsSummary.stockAnalytics.outOfStock} items
                              </Typography>
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* Regular Critical Stock Items or Inventory Value */}
                    {!settings.visibleMetrics.inventoryValue && (
                      <Grid item xs={12} md={4}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Critical Stock Items"
                            data={analyticsSummary.stockAnalytics.criticalItems}
                            downloadType="inventory"
                            showDataCount={false}
                            icon={<WarningIcon color="warning" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              {analyticsSummary.stockAnalytics.criticalItems.length > 0 ? (
                                <List>
                                  {analyticsSummary.stockAnalytics.criticalItems
                                    .sort((a, b) => a.currentStock - b.currentStock) // Show most critical first
                                    .map((item, index) => (
                                    <ListItem key={index} divider>
                                      <ListItemIcon>
                                        {item.status === 'out_of_stock' || item.currentStock < 0 ? (
                                          <ErrorIcon color="error" />
                                        ) : (
                                          <WarningIcon color="warning" />
                                        )}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                              <Typography variant="subtitle2">{item.productName}</Typography>
                                              {item.category && item.category !== 'Uncategorized' && (
                                                <Typography variant="caption" color="text.secondary">
                                                  {item.category}
                                                </Typography>
                                              )}
                                            </Box>
                                            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                                              <Chip 
                                                label={item.currentStock < 0 ? "NEGATIVE" : item.currentStock === 0 ? "OUT" : "LOW"}
                                                size="small"
                                                color={item.currentStock < 0 ? "error" : item.currentStock === 0 ? "error" : "warning"}
                                              />
                                              {item.value > 0 && (
                                                <Typography variant="caption" color="primary.main">
                                                  Value: {formatCurrency(item.value)}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        }
                                        secondary={
                                          <Box>
                                            <Typography variant="caption" display="block">
                                              Current: {item.currentStock} | Reorder at: {item.reorderLevel}
                                            </Typography>
                                            {item.description && (
                                              <Typography variant="caption" display="block" color="text.secondary">
                                                {item.description.substring(0, 60)}{item.description.length > 60 ? '...' : ''}
                                              </Typography>
                                            )}
                                            {item.mrp > 0 && (
                                              <Typography variant="caption" display="block">
                                                MRP: {formatCurrency(item.mrp)} | ID: {item.productId}
                                              </Typography>
                                            )}
                                            {item.currentStock < 0 && (
                                              <Typography variant="caption" color="error.main" fontWeight="bold">
                                                ⚠️ NEGATIVE STOCK - IMMEDIATE ACTION REQUIRED
                                              </Typography>
                                            )}
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                                  <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                                  <Typography variant="h6" color="success.main">
                                    All Stock Levels Good!
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </DownloadableCard>
                        </CardWrapper>
                      </Grid>
                    )}

                    {/* TOP SELLING PRODUCTS - NEW */}
                    {settings.visibleMetrics.topSellingProducts && analyticsSummary.stockAnalytics.topSellingProducts.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Top Selling Products"
                            subtitle={`${analyticsSummary.stockAnalytics.topSellingProducts.length} products analyzed`}
                            data={analyticsSummary.stockAnalytics.topSellingProducts}
                            downloadType="inventory"
                            icon={<TrendingUpIcon color="success" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              <List>
                                {analyticsSummary.stockAnalytics.topSellingProducts.map((product, index) => (
                                  <ListItem key={index} divider>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle2">{product.productName}</Typography>
                                          <Chip 
                                            label={`#${index + 1}`}
                                            size="small"
                                            color={index < 3 ? "success" : "primary"}
                                          />
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography variant="caption" display="block">
                                            Revenue: {formatCurrency(product.revenue)}
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            Quantity Sold: {product.quantitySold} | Avg Price: {formatCurrency(product.revenue / product.quantitySold)}
                                          </Typography>
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

                    {/* LOW STOCK ALERTS - NEW */}
                    {settings.visibleMetrics.lowStockAlerts && (
                      <Grid item xs={12} md={6}>
                        <CardWrapper>
                          <DownloadableCard
                            title="Low Stock Alerts"
                            subtitle="Products requiring immediate attention"
                            data={analyticsSummary.stockAnalytics.criticalItems.filter(item => item.status === 'low_stock')}
                            downloadType="inventory"
                            showDataCount={false}
                            icon={<WarningIcon color="warning" />}
                          >
                            <Box sx={{ height: 330, overflowY: 'auto' }}>
                              {analyticsSummary.stockAnalytics.criticalItems.filter(item => item.status === 'low_stock').length > 0 ? (
                                <List>
                                  {analyticsSummary.stockAnalytics.criticalItems
                                    .filter(item => item.status === 'low_stock')
                                    .slice(0, 10)
                                    .map((item, index) => (
                                    <ListItem key={index} divider>
                                      <ListItemIcon>
                                        <WarningIcon color="warning" />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={item.productName}
                                        secondary={
                                          <Box>
                                            <Typography variant="caption" display="block">
                                              Stock: {item.currentStock} (Reorder at: {item.reorderLevel})
                                            </Typography>
                                            <Typography variant="caption" display="block" color="warning.main">
                                              Action Required: Order more stock soon
                                            </Typography>
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                                  <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                                  <Typography variant="h6" color="success.main">
                                    No Low Stock Issues!
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
                                          <Typography variant="subtitle2">Order #{payment.orderId}</Typography>
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