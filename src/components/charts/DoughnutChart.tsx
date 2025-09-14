import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor?: string[];
      borderWidth?: number;
    }>;
  };
  height?: number;
  showLegend?: boolean;
  centerText?: string;
  centerSubText?: string;
}

export default function DoughnutChart({
  data,
  height = 300,
  showLegend = true,
  centerText,
  centerSubText,
}: DoughnutChartProps) {
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset.data;
            const total = dataset.reduce((sum, val) => sum + val, 0);
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%', // This creates the doughnut hole
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  // Plugin to add center text
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: any) => {
      if (!centerText) return;

      const { ctx, width, height } = chart;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Main center text
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(centerText, centerX, centerY - 10);

      // Sub text
      if (centerSubText) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(centerSubText, centerX, centerY + 15);
      }

      ctx.restore();
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut
        data={data}
        options={options}
        plugins={centerText ? [centerTextPlugin] : []}
      />
    </div>
  );
}
