import { motion } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const mockData = [
  { day: 'Mon', active: 245, new: 23 },
  { day: 'Tue', active: 267, new: 31 },
  { day: 'Wed', active: 289, new: 28 },
  { day: 'Thu', active: 301, new: 35 },
  { day: 'Fri', active: 278, new: 29 },
  { day: 'Sat', active: 195, new: 18 },
  { day: 'Sun', active: 167, new: 15 },
]

export default function UserActivityChart() {
  const data = {
    labels: mockData.map(item => item.day),
    datasets: [
      {
        label: 'Active Users',
        data: mockData.map(item => item.active),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'New Users',
        data: mockData.map(item => item.new),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12,
          },
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            User Activity
          </h3>
          <p className="text-sm text-white/60">
            Daily active and new users
          </p>
        </div>
      </div>
      
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 glass rounded-lg">
          <div className="text-lg font-semibold text-blue-400">
            2,156
          </div>
          <div className="text-sm text-white/60">Avg Daily Active</div>
        </div>
        <div className="text-center p-3 glass rounded-lg">
          <div className="text-lg font-semibold text-green-400">
            26
          </div>
          <div className="text-sm text-white/60">Avg Daily New</div>
        </div>
      </div>
    </motion.div>
  )
} 