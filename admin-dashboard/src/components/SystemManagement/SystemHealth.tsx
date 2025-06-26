import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface SystemHealthData {
  status: string
  uptime: string
  systemLoad: number
  memoryUsage: number
  diskUsage: number
  activeUsers: number
}

interface Props {
  data: SystemHealthData
}

export default function SystemHealth({ data }: Props) {
  const systemMetrics = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: [15, 25, 35, 45, 40, 30, 25],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Memory Usage (%)',
        data: [45, 55, 65, 70, 68, 60, 55],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Disk Usage (%)',
        data: [40, 42, 44, 45, 46, 47, 45],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Inter',
          },
        },
      },
      title: {
        display: true,
        text: 'System Performance (24h)',
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          family: 'Inter',
          size: 16,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
        beginAtZero: true,
        max: 100,
      },
    },
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-400'
      case 'warning':
        return 'text-orange-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-400'
    if (usage < 80) return 'text-orange-400'
    return 'text-red-400'
  }

  const getUsageBarColor = (usage: number) => {
    if (usage < 50) return 'from-green-500 to-green-600'
    if (usage < 80) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">System Health Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(data?.status || 'unknown')}`}>
              {data?.status?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="text-white/60 text-sm">System Status</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {data?.uptime || '0%'}
            </div>
            <div className="text-white/60 text-sm">Uptime</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {data?.activeUsers?.toLocaleString() || '0'}
            </div>
            <div className="text-white/60 text-sm">Active Users</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getUsageColor(data?.systemLoad || 0)}`}>
              {data?.systemLoad || 0}%
            </div>
            <div className="text-white/60 text-sm">System Load</div>
          </div>
        </div>

        {/* Resource Usage Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/80 text-sm">Memory Usage</span>
              <span className={`text-sm font-medium ${getUsageColor(data?.memoryUsage || 0)}`}>
                {data?.memoryUsage || 0}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data?.memoryUsage || 0}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-2 rounded-full bg-gradient-to-r ${getUsageBarColor(data?.memoryUsage || 0)}`}
              ></motion.div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/80 text-sm">Disk Usage</span>
              <span className={`text-sm font-medium ${getUsageColor(data?.diskUsage || 0)}`}>
                {data?.diskUsage || 0}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data?.diskUsage || 0}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className={`h-2 rounded-full bg-gradient-to-r ${getUsageBarColor(data?.diskUsage || 0)}`}
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="h-80">
          <Line data={systemMetrics} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  )
} 