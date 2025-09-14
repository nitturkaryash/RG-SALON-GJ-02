import { Box, Typography, Grid, Chip, Divider } from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatting/format';
import ChartRenderer from '../charts/ChartRenderer';

interface OrdersVsProductsChartProps {
  serviceRevenue: number;
  productRevenue: number;
  serviceCount: number;
  productCount: number;
  serviceGrowth: number;
  productGrowth: number;
  period: string;
  chartType?: 'bar' | 'pie' | 'doughnut';
  height?: number;
}

export default function OrdersVsProductsChart({
  serviceRevenue,
  productRevenue,
  serviceCount,
  productCount,
  serviceGrowth,
  productGrowth,
  period,
  chartType = 'bar',
  height = 300,
}: OrdersVsProductsChartProps) {
  const totalRevenue = serviceRevenue + productRevenue;
  const servicePercentage =
    totalRevenue > 0 ? (serviceRevenue / totalRevenue) * 100 : 0;
  const productPercentage =
    totalRevenue > 0 ? (productRevenue / totalRevenue) * 100 : 0;

  // Chart data
  const chartData = {
    labels: ['Services', 'Products'],
    datasets: [
      {
        label: 'Revenue',
        data: [serviceRevenue, productRevenue],
        backgroundColor: ['#6B8E23', '#4A90E2'],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              const value =
                chartType === 'bar' ? context.parsed.y : context.parsed;
              label += formatCurrency(value);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant='subtitle2' color='text.secondary'>
          Revenue comparison for {period}
        </Typography>
        <Typography variant='h6' color='primary.main' fontWeight='bold'>
          {formatCurrency(totalRevenue)}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', height: '40%', mb: 1 }}>
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              mr: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'rgba(107, 142, 35, 0.05)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ShoppingCartIcon fontSize='small' color='success' />
                <Typography variant='body2' fontWeight='medium'>
                  Services
                </Typography>
              </Box>
              <Chip
                label={`${servicePercentage.toFixed(1)}%`}
                size='small'
                color='success'
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold', color: 'success.main' }}
            >
              {formatCurrency(serviceRevenue)}
            </Typography>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}
            >
              <Typography variant='caption' color='text.secondary'>
                {serviceCount} services
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {serviceGrowth > 0 ? (
                  <TrendingUpIcon
                    fontSize='small'
                    color='success'
                    sx={{ fontSize: 16 }}
                  />
                ) : (
                  <TrendingDownIcon
                    fontSize='small'
                    color='error'
                    sx={{ fontSize: 16 }}
                  />
                )}
                <Typography
                  variant='caption'
                  color={serviceGrowth >= 0 ? 'success.main' : 'error.main'}
                >
                  {serviceGrowth > 0 ? '+' : ''}
                  {serviceGrowth.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'rgba(74, 144, 226, 0.05)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StoreIcon fontSize='small' color='primary' />
                <Typography variant='body2' fontWeight='medium'>
                  Products
                </Typography>
              </Box>
              <Chip
                label={`${productPercentage.toFixed(1)}%`}
                size='small'
                color='primary'
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
            <Typography
              variant='h6'
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              {formatCurrency(productRevenue)}
            </Typography>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}
            >
              <Typography variant='caption' color='text.secondary'>
                {productCount} products
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {productGrowth > 0 ? (
                  <TrendingUpIcon
                    fontSize='small'
                    color='success'
                    sx={{ fontSize: 16 }}
                  />
                ) : (
                  <TrendingDownIcon
                    fontSize='small'
                    color='error'
                    sx={{ fontSize: 16 }}
                  />
                )}
                <Typography
                  variant='caption'
                  color={productGrowth >= 0 ? 'success.main' : 'error.main'}
                >
                  {productGrowth > 0 ? '+' : ''}
                  {productGrowth.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 180 }}>
          <ChartRenderer
            chartType={chartType}
            data={chartData}
            options={chartOptions}
            height='100%'
            currencyFormat={true}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Typography variant='caption' align='center' color='text.secondary'>
            Services {servicePercentage.toFixed(1)}% :{' '}
            {productPercentage.toFixed(1)}% Products
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
