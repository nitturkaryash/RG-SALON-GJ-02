import { useRef, useEffect } from 'react';
import { Chart, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required Chart.js components
Chart.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  height?: number;
  title?: string;
  options?: any;
  horizontal?: boolean;
  currencyFormat?: boolean;
}

export default function BarChart({ 
  data, 
  height = 300, 
  title, 
  options = {},
  horizontal = false,
  currencyFormat = true
}: BarChartProps) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Clean up chart instance on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 35, // Extra padding for rotated labels
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: !!title,
        text: title,
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null && context.parsed.x !== null) {
              const value = horizontal ? context.parsed.x : context.parsed.y;
              if (currencyFormat) {
                label += new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              } else {
                label += value.toLocaleString('en-IN');
              }
            }
            return label;
          },
          title: function(context: any) {
            // Show full label on hover
            return context[0]?.label || '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (currencyFormat && !horizontal) {
              return '₹' + value.toLocaleString('en-IN');
            }
            return value;
          },
          font: {
            size: 10
          },
          padding: 10,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: {
          callback: function(value: any, index: any, values: any) {
            if (currencyFormat && horizontal) {
              return '₹' + value.toLocaleString('en-IN');
            }
            // For non-horizontal charts, handle long labels (staff names, etc.)
            if (!horizontal) {
              const label = this.getLabelForValue(value);
              if (label) {
                // Smart truncation for different label types
                if (label.includes(' ')) {
                  // Likely a full name, show first name + last initial
                  const parts = label.split(' ');
                  if (parts.length > 1) {
                    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
                  }
                }
                // Other labels, truncate at 12 characters
                return label.length > 12 ? label.substring(0, 12) + '...' : label;
              }
            }
            return value;
          },
          maxRotation: 45,
          minRotation: 30,
          maxTicksLimit: 8, // Reduced for better spacing
          font: {
            size: 10
          },
          padding: 8,
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeOutQuart',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div style={{ height }}>
      <Bar 
        data={data} 
        options={mergedOptions}
        ref={chartRef}
      />
    </div>
  );
} 