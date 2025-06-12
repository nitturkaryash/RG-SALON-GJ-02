import { useRef, useEffect } from 'react';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register required Chart.js components
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number;
    }>;
  };
  height?: number;
  title?: string;
  options?: any;
}

export default function LineChart({ data, height = 300, title, options = {} }: LineChartProps) {
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
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 30, // Extra padding for rotated labels
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
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
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
      x: {
        beginAtZero: true,
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          maxTicksLimit: 8, // Reduced from 10 for better spacing
          font: {
            size: 10
          },
          padding: 5,
          callback: function(value: any, index: any, values: any) {
            const label = this.getLabelForValue(value);
            // Smart truncation based on label type
            if (label.includes('/')) {
              // Likely a date, keep as is or shorten
              return label.length > 6 ? label.substring(0, 6) : label;
            } else {
              // Likely a name, truncate and add ellipsis
              return label.length > 10 ? label.substring(0, 10) + '...' : label;
            }
          }
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
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString('en-IN');
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
      }
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
        borderWidth: 2,
      },
      line: {
        borderWidth: 2
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    animation: {
      duration: 750,
      easing: 'easeOutQuart',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div style={{ height }}>
      <Line 
        data={data} 
        options={mergedOptions}
        ref={chartRef}
      />
    </div>
  );
} 