import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
// Analytics components will be added later
import DateRangePicker from '../components/ui/DateRangePicker'

// Mock data
const fetchAnalytics = async (dateRange: { start: string; end: string }) => {
  return {
    overview: {
      totalRevenue: 1856432,
      revenueGrowth: 23.4,
      totalUsers: 12847,
      userGrowth: 18.2,
      activeUsers: 9632,
      activeGrowth: 15.8,
      avgSessionDuration: 28.5,
      sessionGrowth: -3.2,
    },
    revenueByMonth: [
      { month: 'Jan', revenue: 145000 },
      { month: 'Feb', revenue: 158000 },
      { month: 'Mar', revenue: 172000 },
      { month: 'Apr', revenue: 168000 },
      { month: 'May', revenue: 185000 },
      { month: 'Jun', revenue: 192000 },
    ],
    userGrowth: [
      { date: '2024-01-01', users: 8450 },
      { date: '2024-01-15', users: 9120 },
      { date: '2024-02-01', users: 9876 },
      { date: '2024-02-15', users: 10432 },
      { date: '2024-03-01', users: 11258 },
      { date: '2024-03-15', users: 12847 },
    ],
    planDistribution: [
      { plan: 'Basic', users: 5432, percentage: 42.3 },
      { plan: 'Pro', users: 4856, percentage: 37.8 },
      { plan: 'Premium', users: 2559, percentage: 19.9 },
    ],
    topCountries: [
      { country: 'United States', users: 4532, percentage: 35.3 },
      { country: 'Canada', users: 2156, percentage: 16.8 },
      { country: 'United Kingdom', users: 1876, percentage: 14.6 },
      { country: 'Australia', users: 1432, percentage: 11.1 },
      { country: 'Germany', users: 1258, percentage: 9.8 },
    ],
  }
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-06-30',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => fetchAnalytics(dateRange),
  })

  const overviewCards = [
    {
      title: 'Total Revenue',
      value: `$${(data?.overview.totalRevenue || 0).toLocaleString()}`,
      change: data?.overview.revenueGrowth || 0,
      icon: CurrencyDollarIcon,
      color: 'green' as const,
    },
    {
      title: 'Total Users',
      value: (data?.overview.totalUsers || 0).toLocaleString(),
      change: data?.overview.userGrowth || 0,
      icon: UserGroupIcon,
      color: 'blue' as const,
    },
    {
      title: 'Active Users',
      value: (data?.overview.activeUsers || 0).toLocaleString(),
      change: data?.overview.activeGrowth || 0,
      icon: ArrowTrendingUpIcon,
      color: 'purple' as const,
    },
    {
      title: 'Avg Session Duration',
      value: `${data?.overview.avgSessionDuration || 0}m`,
      change: data?.overview.sessionGrowth || 0,
      icon: ChartBarIcon,
      color: 'orange' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Analytics & Insights
          </h1>
          <p className="text-white/60">
            Deep dive into your platform's performance metrics
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <div className="glass-card p-4">
              <h3 className="text-white font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
              <p className="text-green-400 text-sm mt-1">+{card.change}%</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h3>
          <p className="text-white/60">Coming Soon - Advanced revenue tracking and analytics</p>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Growth Chart</h3>
            <p className="text-white/60">Coming Soon - User growth visualization</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Plan Distribution</h3>
            <p className="text-white/60">Coming Soon - Plan distribution analytics</p>
          </div>
        </motion.div>
      </div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
          <p className="text-white/60">Coming Soon - Geographic user distribution</p>
        </div>
      </motion.div>
    </div>
  )
} 