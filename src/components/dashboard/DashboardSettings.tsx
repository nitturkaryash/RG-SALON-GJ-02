import {
  Drawer,
  Box,
  Typography,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  ClickAwayListener,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { useState, useRef } from 'react';
import { DashboardSettings as DashboardSettingsType } from '../../hooks/useDashboardAnalytics';

interface DashboardSettingsProps {
  settings: DashboardSettingsType;
  onSettingsChange: (newSettings: Partial<DashboardSettingsType>) => void;
  onRefresh: () => void;
}

const CHART_TYPE_OPTIONS = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'radar', label: 'Radar Chart' },
];

const REFRESH_INTERVALS = [
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
  { value: 600000, label: '10 minutes' },
];

export default function DashboardSettings({
  settings,
  onSettingsChange,
  onRefresh 
}: DashboardSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Count enabled metrics for badge
  const enabledMetricsCount = Object.values(settings.visibleMetrics).filter(Boolean).length;

  const handleOpenSettings = () => {
    setIsOpen(true);
  };

  const handleCloseSettings = () => {
    if (hasUnsavedChanges) {
      showNotification('Settings saved automatically', 'success');
    }
    setIsOpen(false);
    setHasUnsavedChanges(false);
  };

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

  const handleMetricToggle = (metric: keyof typeof settings.visibleMetrics) => {
    onSettingsChange({
      visibleMetrics: {
        ...settings.visibleMetrics,
        [metric]: !settings.visibleMetrics[metric],
      },
    });
    setHasUnsavedChanges(true);
    
    const action = !settings.visibleMetrics[metric] ? 'enabled' : 'disabled';
    const metricName = metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    showNotification(`${metricName} ${action}`, 'info');
  };

  const handleChartTypeChange = (
    chart: keyof typeof settings.chartTypes,
    event: SelectChangeEvent<string>
  ) => {
    onSettingsChange({
      chartTypes: {
        ...settings.chartTypes,
        [chart]: event.target.value as any,
      },
    });
    setHasUnsavedChanges(true);
    
    const chartName = chart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    showNotification(`${chartName} chart type updated`, 'info');
  };

  const handleRefreshIntervalChange = (event: SelectChangeEvent<number>) => {
    onSettingsChange({
      refreshInterval: Number(event.target.value),
    });
    setHasUnsavedChanges(true);
    
    const intervalLabel = REFRESH_INTERVALS.find(i => i.value === Number(event.target.value))?.label;
    showNotification(`Refresh interval set to ${intervalLabel}`, 'success');
  };

  const handleThresholdChange = (
    threshold: keyof typeof settings.alertThresholds,
    value: number
  ) => {
    onSettingsChange({
      alertThresholds: {
        ...settings.alertThresholds,
        [threshold]: value,
      },
    });
    setHasUnsavedChanges(true);
    
    const thresholdName = threshold.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    showNotification(`${thresholdName} threshold updated`, 'info');
  };

  const handleIncentiveSettingChange = (
    field: keyof typeof settings.incentiveSettings,
    value: any
  ) => {
    onSettingsChange({
      incentiveSettings: {
        ...settings.incentiveSettings,
        [field]: value,
      },
    });
    setHasUnsavedChanges(true);
    
    const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    showNotification(`${fieldName} updated`, 'info');
  };

  const handleIncentiveMetricChange = (
    metric: keyof typeof settings.incentiveSettings.performanceMetrics,
    value: number
  ) => {
    onSettingsChange({
      incentiveSettings: {
        ...settings.incentiveSettings,
        performanceMetrics: {
          ...settings.incentiveSettings.performanceMetrics,
          [metric]: value,
        },
      },
    });
    setHasUnsavedChanges(true);
    showNotification(`Performance metric updated`, 'info');
  };

  const handleIncentiveStandardChange = (
    standard: keyof typeof settings.incentiveSettings.industryStandards,
    value: number
  ) => {
    onSettingsChange({
      incentiveSettings: {
        ...settings.incentiveSettings,
        industryStandards: {
          ...settings.incentiveSettings.industryStandards,
          [standard]: value,
        },
      },
    });
    setHasUnsavedChanges(true);
    showNotification(`Industry standard updated`, 'info');
  };

  const enableAllMetrics = () => {
    const allEnabled = Object.keys(settings.visibleMetrics).reduce((acc, key) => {
      acc[key as keyof typeof settings.visibleMetrics] = true;
      return acc;
    }, {} as typeof settings.visibleMetrics);
    
    onSettingsChange({ visibleMetrics: allEnabled });
    setHasUnsavedChanges(true);
    showNotification('All metrics enabled', 'success');
  };

  const disableAllMetrics = () => {
    const allDisabled = Object.keys(settings.visibleMetrics).reduce((acc, key) => {
      acc[key as keyof typeof settings.visibleMetrics] = false;
      return acc;
    }, {} as typeof settings.visibleMetrics);
    
    onSettingsChange({ visibleMetrics: allDisabled });
    setHasUnsavedChanges(true);
    showNotification('All metrics disabled', 'warning');
  };

  const resetToDefaults = () => {
    const defaultSettings: DashboardSettingsType = {
      visibleMetrics: {
        dailySales: true,
        topServices: true,
        appointments: true,
        retentionRate: true,
        averageTicket: true,
        staffUtilization: true,
        stylistRevenue: true,
        paymentMethods: true,
        splitPayments: true,
        paymentTrends: false,
        peakHours: true,
        appointmentStatus: true,
        serviceCategories: true,
        monthlyComparison: false,
        stockLevels: true,
        lowStockAlerts: true,
        inventoryValue: false,
        topSellingProducts: true,
        customerBehavior: true,
        customerRetention: true,
        customerLifetimeValue: false,
        visitFrequency: false,
        staffPerformance: true,
        revenuePerStaff: true,
        staffEfficiency: false,
        revenueBreakdown: true,
        operationalInsights: true,
        realTimeMetrics: true,
        todaysSummary: true,
        upcomingAppointments: true,
        appointmentReminders: true,
        criticalAlerts: true,
        stockShortageAnalysis: true,
        negativeStockPrevention: true,
      },
      chartTypes: {
        salesTrend: 'line',
        topServices: 'bar',
        customerRetention: 'pie',
        stylistRevenue: 'bar',
        paymentMethods: 'pie',
        peakHours: 'bar',
        appointmentStatus: 'doughnut',
        serviceCategories: 'pie',
        stockLevels: 'bar',
        customerBehavior: 'line',
        staffPerformance: 'bar',
        revenueBreakdown: 'doughnut',
      },
      refreshInterval: 30000,
      alertThresholds: {
        lowStock: 5,
        lowRevenue: 1000,
        highCancellation: 20,
        lowUtilization: 60,
      },
    };
    
    onSettingsChange(defaultSettings);
    setHasUnsavedChanges(true);
    showNotification('Settings reset to defaults', 'success');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      showNotification('Dashboard data refreshed successfully', 'success');
    } catch (error) {
      showNotification('Failed to refresh dashboard data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAvailableChartTypes = (chartKey: keyof typeof settings.chartTypes) => {
    switch (chartKey) {
      case 'salesTrend':
      case 'peakHours':
      case 'customerBehavior':
        return CHART_TYPE_OPTIONS.filter(option => 
          ['line', 'bar', 'area'].includes(option.value)
        );
      case 'topServices':
      case 'paymentMethods':
      case 'serviceCategories':
      case 'revenueBreakdown':
      case 'appointmentStatus':
        return CHART_TYPE_OPTIONS.filter(option => 
          ['bar', 'pie', 'doughnut'].includes(option.value)
        );
      case 'stockLevels':
        return CHART_TYPE_OPTIONS.filter(option => 
          ['bar', 'pie', 'line'].includes(option.value)
        );
      case 'staffPerformance':
        return CHART_TYPE_OPTIONS.filter(option => 
          ['bar', 'radar', 'line'].includes(option.value)
        );
      case 'customerRetention':
      case 'stylistRevenue':
        return CHART_TYPE_OPTIONS.filter(option => 
          ['pie', 'doughnut', 'bar', 'line'].includes(option.value)
        );
      default:
        return CHART_TYPE_OPTIONS;
    }
  };

  return (
    <>
      {/* Settings Toggle Button */}
      <Tooltip title="Dashboard Settings" placement="left">
        <Box
        sx={{
          position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
          }}
        >
          <Badge 
            badgeContent={enabledMetricsCount} 
            color="secondary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                minWidth: '20px',
                height: '20px',
              }
            }}
          >
            <IconButton
              onClick={handleOpenSettings}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: 3,
                transition: 'all 0.3s ease',
          '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 6,
                  transform: 'scale(1.05)',
          },
        }}
      >
        <SettingsIcon />
      </IconButton>
          </Badge>
        </Box>
      </Tooltip>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleCloseSettings}
        variant="temporary"
        sx={{
          '& .MuiDrawer-paper': {
            width: 450,
            padding: 0,
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'primary.main',
              color: 'white',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dashboard Settings
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {enabledMetricsCount} metrics enabled
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Refresh Dashboard">
                <IconButton
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  sx={{ color: 'white', mr: 1 }}
                  size="small"
                >
                  <RefreshIcon 
                    sx={{ 
                      animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      }
                    }} 
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close Settings">
              <IconButton 
                  onClick={handleCloseSettings}
                  sx={{ color: 'white' }}
                  size="small"
              >
                <CloseIcon />
              </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {/* Global Controls */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Global Controls
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Refresh Interval</InputLabel>
                  <Select
                    value={settings.refreshInterval}
                    label="Refresh Interval"
                    onChange={handleRefreshIntervalChange}
                  >
                    {REFRESH_INTERVALS.map((interval) => (
                      <MenuItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={enableAllMetrics}
                    startIcon={<CheckIcon />}
                    fullWidth
                  >
                    Enable All
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={disableAllMetrics}
                    color="warning"
                    fullWidth
                  >
                    Disable All
                  </Button>
                </Stack>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetToDefaults}
                  startIcon={<RestoreIcon />}
                  color="secondary"
                  fullWidth
                >
                  Reset to Defaults
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Alert Thresholds */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Alert Thresholds
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <Box>
                    <Typography gutterBottom>Low Stock Alert</Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.alertThresholds.lowStock}
                      onChange={(e) => handleThresholdChange('lowStock', Number(e.target.value))}
                      inputProps={{ min: 0, max: 100 }}
                      helperText="Alert when stock falls below this number"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Low Revenue Alert (₹)</Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.alertThresholds.lowRevenue}
                      onChange={(e) => handleThresholdChange('lowRevenue', Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      helperText="Alert when daily revenue falls below this amount"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>High Cancellation Rate (%)</Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.alertThresholds.highCancellation}
                      onChange={(e) => handleThresholdChange('highCancellation', Number(e.target.value))}
                      inputProps={{ min: 0, max: 100 }}
                      helperText="Alert when cancellation rate exceeds this percentage"
                    />
                  </Box>
                  <Box>
                    <Typography gutterBottom>Low Staff Utilization (%)</Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={settings.alertThresholds.lowUtilization}
                      onChange={(e) => handleThresholdChange('lowUtilization', Number(e.target.value))}
                      inputProps={{ min: 0, max: 100 }}
                      helperText="Alert when staff utilization falls below this percentage"
                    />
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Core Business Metrics */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Core Business Metrics
            </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.visibleMetrics.dailySales}
                        onChange={() => handleMetricToggle('dailySales')}
                  />
                }
                label="Daily Sales"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.visibleMetrics.topServices}
                        onChange={() => handleMetricToggle('topServices')}
                  />
                }
                label="Top Services"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.visibleMetrics.appointments}
                        onChange={() => handleMetricToggle('appointments')}
                  />
                }
                label="Appointments"
              />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.averageTicket}
                        onChange={() => handleMetricToggle('averageTicket')}
                      />
                    }
                    label="Average Ticket"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.visibleMetrics.retentionRate}
                        onChange={() => handleMetricToggle('retentionRate')}
                      />
                    }
                    label="Customer Retention"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.revenueBreakdown}
                        onChange={() => handleMetricToggle('revenueBreakdown')}
                      />
                    }
                    label="Revenue Breakdown"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.todaysSummary}
                        onChange={() => handleMetricToggle('todaysSummary')}
                      />
                    }
                    label="Today's Summary"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.realTimeMetrics}
                        onChange={() => handleMetricToggle('realTimeMetrics')}
                      />
                    }
                    label="Real-time Metrics"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Payment Analytics */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Payment Analytics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.paymentMethods}
                        onChange={() => handleMetricToggle('paymentMethods')}
                      />
                    }
                    label="Payment Methods Breakdown"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.splitPayments}
                        onChange={() => handleMetricToggle('splitPayments')}
                      />
                    }
                    label="Split Payment Details"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.paymentTrends}
                        onChange={() => handleMetricToggle('paymentTrends')}
                      />
                    }
                    label="Payment Trends"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Inventory Analytics */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InventoryIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Inventory Analytics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.stockLevels}
                        onChange={() => handleMetricToggle('stockLevels')}
                      />
                    }
                    label="Stock Levels"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.lowStockAlerts}
                        onChange={() => handleMetricToggle('lowStockAlerts')}
                      />
                    }
                    label="Low Stock Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.inventoryValue}
                        onChange={() => handleMetricToggle('inventoryValue')}
                      />
                    }
                    label="Inventory Value"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.topSellingProducts}
                        onChange={() => handleMetricToggle('topSellingProducts')}
                      />
                    }
                    label="Top Selling Products"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Customer Analytics */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Customer Analytics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.customerBehavior}
                        onChange={() => handleMetricToggle('customerBehavior')}
                      />
                    }
                    label="Customer Behavior"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.customerRetention}
                        onChange={() => handleMetricToggle('customerRetention')}
                  />
                }
                label="Customer Retention"
              />
              <FormControlLabel
                control={
                  <Switch
                        checked={settings.visibleMetrics.customerLifetimeValue}
                        onChange={() => handleMetricToggle('customerLifetimeValue')}
                      />
                    }
                    label="Customer Lifetime Value"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.visitFrequency}
                        onChange={() => handleMetricToggle('visitFrequency')}
                      />
                    }
                    label="Visit Frequency"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Staff Analytics */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Staff Analytics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.staffPerformance}
                        onChange={() => handleMetricToggle('staffPerformance')}
                  />
                }
                    label="Staff Performance"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.revenuePerStaff}
                        onChange={() => handleMetricToggle('revenuePerStaff')}
                      />
                    }
                    label="Revenue per Staff"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.visibleMetrics.staffUtilization}
                        onChange={() => handleMetricToggle('staffUtilization')}
                  />
                }
                label="Staff Utilization"
              />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.staffEfficiency}
                        onChange={() => handleMetricToggle('staffEfficiency')}
                      />
                    }
                    label="Staff Efficiency"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.visibleMetrics.stylistRevenue}
                        onChange={() => handleMetricToggle('stylistRevenue')}
                      />
                    }
                    label="Stylist Revenue"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Operational Analytics */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Operational Analytics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.peakHours}
                        onChange={() => handleMetricToggle('peakHours')}
                      />
                    }
                    label="Peak Hours"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.appointmentStatus}
                        onChange={() => handleMetricToggle('appointmentStatus')}
                      />
                    }
                    label="Appointment Status"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.serviceCategories}
                        onChange={() => handleMetricToggle('serviceCategories')}
                      />
                    }
                    label="Service Categories"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.monthlyComparison}
                        onChange={() => handleMetricToggle('monthlyComparison')}
                      />
                    }
                    label="Monthly Comparison"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.operationalInsights}
                        onChange={() => handleMetricToggle('operationalInsights')}
                      />
                    }
                    label="Operational Insights"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Enhanced Features */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Enhanced Features
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.upcomingAppointments}
                        onChange={() => handleMetricToggle('upcomingAppointments')}
                  />
                }
                    label="Upcoming Appointments"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.appointmentReminders}
                        onChange={() => handleMetricToggle('appointmentReminders')}
                      />
                    }
                    label="Appointment Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.criticalAlerts}
                        onChange={() => handleMetricToggle('criticalAlerts')}
                      />
                    }
                    label="Critical Business Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.stockShortageAnalysis}
                        onChange={() => handleMetricToggle('stockShortageAnalysis')}
                      />
                    }
                    label="Stock Shortage Analysis"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.visibleMetrics.negativeStockPrevention}
                        onChange={() => handleMetricToggle('negativeStockPrevention')}
                      />
                    }
                    label="Negative Stock Prevention"
              />
            </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Incentive Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaymentIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Staff Incentive Settings
                  </Typography>
                  <Chip
                    label={settings.incentiveSettings.enabled ? 'Enabled' : 'Disabled'}
                    size="small"
                    color={settings.incentiveSettings.enabled ? 'success' : 'default'}
                    sx={{ ml: 2, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  {/* Enable/Disable Toggle */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.incentiveSettings.enabled}
                        onChange={(e) => handleIncentiveSettingChange('enabled', e.target.checked)}
                        color="success"
                      />
                    }
                    label="Enable Staff Incentive System"
                  />

                  {settings.incentiveSettings.enabled && (
                    <>
                      {/* Basic Settings */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Basic Settings
                        </Typography>
                        
                        <Stack spacing={2}>
                          <TextField
                            label="Minimum Revenue Threshold (₹)"
                            type="number"
                            value={settings.incentiveSettings.minimumRevenue}
                            onChange={(e) => handleIncentiveSettingChange('minimumRevenue', Number(e.target.value))}
                            size="small"
                            fullWidth
                            helperText="Minimum monthly revenue required for incentive eligibility"
                            InputProps={{
                              startAdornment: '₹',
                            }}
                          />
                          
                          <TextField
                            label="Incentive Rate (%)"
                            type="number"
                            value={settings.incentiveSettings.incentiveRate}
                            onChange={(e) => handleIncentiveSettingChange('incentiveRate', Number(e.target.value))}
                            size="small"
                            fullWidth
                            helperText="Percentage of revenue as incentive"
                            InputProps={{
                              endAdornment: '%',
                              inputProps: { min: 0, max: 50, step: 0.5 }
                            }}
                          />
                          
                          <FormControl fullWidth size="small">
                            <InputLabel>Evaluation Period</InputLabel>
              <Select
                              value={settings.incentiveSettings.evaluationPeriod}
                              label="Evaluation Period"
                              onChange={(e) => handleIncentiveSettingChange('evaluationPeriod', e.target.value)}
                            >
                              <MenuItem value="weekly">Weekly</MenuItem>
                              <MenuItem value="monthly">Monthly</MenuItem>
                              <MenuItem value="quarterly">Quarterly</MenuItem>
              </Select>
            </FormControl>
                        </Stack>
                      </Box>

                      {/* Performance Metrics Weights */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Performance Metrics Weights
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Adjust how different metrics contribute to performance score (total should equal 1.0)
                        </Typography>
                        
                        <Stack spacing={2}>
                          <Box>
                            <TextField
                              label="Revenue Weight"
                              type="number"
                              value={settings.incentiveSettings.performanceMetrics.revenueWeight}
                              onChange={(e) => handleIncentiveMetricChange('revenueWeight', Number(e.target.value))}
                              size="small"
                              fullWidth
                              InputProps={{
                                inputProps: { min: 0, max: 1, step: 0.1 }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Currently: {(settings.incentiveSettings.performanceMetrics.revenueWeight * 100).toFixed(0)}%
            </Typography>
                          </Box>
                          
                          <Box>
                            <TextField
                              label="Appointment Weight"
                              type="number"
                              value={settings.incentiveSettings.performanceMetrics.appointmentWeight}
                              onChange={(e) => handleIncentiveMetricChange('appointmentWeight', Number(e.target.value))}
                              size="small"
                              fullWidth
                              InputProps={{
                                inputProps: { min: 0, max: 1, step: 0.1 }
                              }}
              />
                            <Typography variant="caption" color="text.secondary">
                              Currently: {(settings.incentiveSettings.performanceMetrics.appointmentWeight * 100).toFixed(0)}%
              </Typography>
            </Box>

                          <Box>
                            <TextField
                              label="Efficiency Weight"
                              type="number"
                              value={settings.incentiveSettings.performanceMetrics.efficiencyWeight}
                              onChange={(e) => handleIncentiveMetricChange('efficiencyWeight', Number(e.target.value))}
                              size="small"
                              fullWidth
                              InputProps={{
                                inputProps: { min: 0, max: 1, step: 0.1 }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Currently: {(settings.incentiveSettings.performanceMetrics.efficiencyWeight * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Industry Standards */}
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Industry Performance Standards
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Set performance score thresholds based on industry standards
                        </Typography>
                        
                        <Stack spacing={2}>
                          <TextField
                            label="Excellent Performance Threshold"
                            type="number"
                            value={settings.incentiveSettings.industryStandards.excellent}
                            onChange={(e) => handleIncentiveStandardChange('excellent', Number(e.target.value))}
                            size="small"
                            fullWidth
                            InputProps={{
                              inputProps: { min: 0, max: 100 }
                            }}
                            helperText="Score above this = Excellent rating"
                          />
                          
                          <TextField
                            label="Good Performance Threshold"
                            type="number"
                            value={settings.incentiveSettings.industryStandards.good}
                            onChange={(e) => handleIncentiveStandardChange('good', Number(e.target.value))}
                            size="small"
                fullWidth
                            InputProps={{
                              inputProps: { min: 0, max: 100 }
                            }}
                            helperText="Score above this = Good rating"
                          />
                          
                          <TextField
                            label="Average Performance Threshold"
                            type="number"
                            value={settings.incentiveSettings.industryStandards.average}
                            onChange={(e) => handleIncentiveStandardChange('average', Number(e.target.value))}
                            size="small"
                fullWidth
                            InputProps={{
                              inputProps: { min: 0, max: 100 }
                            }}
                            helperText="Minimum score for incentive eligibility"
                          />
                        </Stack>
                      </Box>

                      {/* Incentive Preview */}
                      <Box>
                        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                          <Typography variant="body2">
                            <strong>Current Settings Preview:</strong><br/>
                            • Minimum Revenue: ₹{settings.incentiveSettings.minimumRevenue.toLocaleString()}<br/>
                            • Incentive Rate: {settings.incentiveSettings.incentiveRate}% of revenue<br/>
                            • Example: ₹50,000 revenue = ₹{(50000 * settings.incentiveSettings.incentiveRate / 100).toLocaleString()} incentive
                          </Typography>
                        </Alert>
                      </Box>
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Chart Type Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Chart Types
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {Object.entries(settings.chartTypes).map(([chartKey, chartValue]) => (
                    <FormControl key={chartKey} fullWidth size="small">
                      <InputLabel>
                        {chartKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </InputLabel>
                      <Select
                        value={chartValue}
                        label={chartKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        onChange={(e) => handleChartTypeChange(chartKey as keyof typeof settings.chartTypes, e)}
                      >
                        {getAvailableChartTypes(chartKey as keyof typeof settings.chartTypes).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
            </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Info */}
            <Box mt={3}>
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <Typography variant="body2">
                  Dashboard updates automatically every {settings.refreshInterval / 1000} seconds. 
                  All data is real-time and reflects actual business operations.
                </Typography>
              </Alert>
              
              {hasUnsavedChanges && (
                <Alert severity="warning" sx={{ fontSize: '0.875rem', mt: 2 }}>
                  <Typography variant="body2">
                    Settings will be saved automatically when you close this panel.
                  </Typography>
                </Alert>
              )}

              {/* Status Section */}
              <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  System Status
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated:
                  </Typography>
                  <Typography variant="caption">
                    {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip 
                    label={isRefreshing ? "Updating..." : "Active"} 
                    size="small" 
                    color={isRefreshing ? "warning" : "success"}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Next Refresh:
                  </Typography>
                  <Typography variant="caption">
                    {Math.round(settings.refreshInterval / 1000)}s
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
    </>
  );
} 