import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import RevenueChart from '../components/Dashboard/RevenueChart'
import RecentActivity from '../components/Dashboard/RecentActivity'
import StatsCard from '../components/Dashboard/StatsCard'
import DateRangePicker from '../components/ui/DateRangePicker'
import { useState } from 'react'

// Mock data fetching function
const fetchDashboardData = async (dateRange: { start: string; end: string }) => {
  return {
    stats: {
      totalRevenue: 156789.45,
      revenueGrowth: 23.5,
      totalClients: 1234,
      clientGrowth: 15.8,
      totalAppointments: 789,
      appointmentGrowth: 8.9,
      totalSales: 456,
      salesGrowth: 12.4,
    },
    recentActivity: [
      {
        id: 1,
        type: 'appointment',
        title: 'New Appointment Booked',
        description: 'Sarah Johnson booked a haircut',
        timestamp: '2024-01-20T14:30:00Z',
      },
      {
        id: 2,
        type: 'sale',
        title: 'Product Sale',
        description: 'Hair care package purchased',
        timestamp: '2024-01-20T13:45:00Z',
      },
      {
        id: 3,
        type: 'client',
        title: 'New Client Registration',
        description: 'Michael Smith joined',
        timestamp: '2024-01-20T12:15:00Z',
      },
    ],
    revenueData: [
      { date: '2024-01-14', revenue: 12500 },
      { date: '2024-01-15', revenue: 14200 },
      { date: '2024-01-16', revenue: 13800 },
      { date: '2024-01-17', revenue: 15600 },
      { date: '2024-01-18', revenue: 16200 },
      { date: '2024-01-19', revenue: 15900 },
      { date: '2024-01-20', revenue: 17400 },
    ],
  }
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: '2024-01-14',
    end: '2024-01-20',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardData', dateRange],
    queryFn: () => fetchDashboardData(dateRange),
  })

  const statsCards = [
    {
      title: 'Total Revenue',
      value: data?.stats.totalRevenue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      change: data?.stats.revenueGrowth,
      icon: CurrencyDollarIcon,
      color: 'green',
    },
    {
      title: 'Total Clients',
      value: data?.stats.totalClients.toLocaleString(),
      change: data?.stats.clientGrowth,
      icon: UsersIcon,
      color: 'blue',
    },
    {
      title: 'Appointments',
      value: data?.stats.totalAppointments.toLocaleString(),
      change: data?.stats.appointmentGrowth,
      icon: CalendarIcon,
      color: 'purple',
    },
    {
      title: 'Total Sales',
      value: data?.stats.totalSales.toLocaleString(),
      change: data?.stats.salesGrowth,
      icon: ShoppingCartIcon,
      color: 'orange',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Dashboard Overview
          </h1>
          <p className="text-white/60">
            Monitor your salon's performance and key metrics
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 sm:mt-0"
        >
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </motion.div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((card, index) => (
          <StatsCard
            key={card.title}
            {...card}
            isLoading={isLoading}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Revenue Overview</h2>
            <RevenueChart
              data={data?.revenueData}
              isLoading={isLoading}
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <RecentActivity
              activities={data?.recentActivity}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 