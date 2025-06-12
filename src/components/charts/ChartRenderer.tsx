import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import DoughnutChart from './DoughnutChart';
import GaugeChart from './GaugeChart';

interface ChartRendererProps {
  chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'radar';
  data: any;
  height?: number;
  title?: string;
  options?: any;
  currencyFormat?: boolean;
  showPercentage?: boolean;
  horizontal?: boolean;
}

const ChartRenderer = memo(({
  chartType,
  data,
  height = 330,
  title,
  options = {},
  currencyFormat = true,
  showPercentage = true,
  horizontal = false,
}: ChartRendererProps) => {
  // Check if data is valid
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        height={height}
        sx={{ 
          border: '1px dashed', 
          borderColor: 'grey.300',
          borderRadius: 1,
          backgroundColor: 'grey.50'
        }}
      >
        <Typography color="text.secondary" variant="body2">
          No data available for this chart
        </Typography>
      </Box>
    );
  }

  const chartProps = {
    data,
    height,
    title,
    ...options,
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart 
            {...chartProps}
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                ...options.plugins,
                legend: {
                  position: 'top' as const,
                  ...options.plugins?.legend,
                },
              },
              scales: {
                ...options.scales,
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value: any) {
                      if (currencyFormat) {
                        return '₹' + value.toLocaleString('en-IN');
                      }
                      return value;
                    },
                    ...options.scales?.y?.ticks,
                  },
                  ...options.scales?.y,
                },
              },
            }}
          />
        );

      case 'bar':
        return (
          <BarChart 
            {...chartProps}
            horizontal={horizontal}
            currencyFormat={currencyFormat}
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: horizontal ? 'y' as const : 'x' as const,
            }}
          />
        );

      case 'pie':
        return (
          <PieChart 
            {...chartProps}
            showPercentage={showPercentage}
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                ...options.plugins,
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    padding: 20,
                    boxWidth: 12,
                    ...options.plugins?.legend?.labels,
                  },
                  ...options.plugins?.legend,
                },
              },
            }}
          />
        );

      case 'doughnut':
        return (
          <DoughnutChart 
            data={data}
            height={height}
            showLegend={true}
            centerText={title}
          />
        );

      case 'area':
        // Area chart is essentially a line chart with filled area
        const areaData = {
          ...data,
          datasets: data.datasets.map((dataset: any) => ({
            ...dataset,
            fill: true,
            backgroundColor: dataset.backgroundColor || 'rgba(107, 142, 35, 0.2)',
          })),
        };
        return (
          <LineChart 
            data={areaData}
            height={height}
            title={title}
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
              elements: {
                line: {
                  tension: 0.4,
                },
              },
            }}
          />
        );

      case 'radar':
        // For now, fall back to bar chart for radar (would need Chart.js radar plugin)
        return (
          <BarChart 
            {...chartProps}
            currencyFormat={currencyFormat}
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        );

      default:
        return (
          <BarChart 
            {...chartProps}
            currencyFormat={currencyFormat}
            horizontal={horizontal}
          />
        );
    }
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      {renderChart()}
    </Box>
  );
});

ChartRenderer.displayName = 'ChartRenderer';

export default ChartRenderer; 