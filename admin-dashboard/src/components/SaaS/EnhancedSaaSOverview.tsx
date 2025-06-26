import { motion } from 'framer-motion'
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ServerIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  WifiIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

interface Props {
  data: any
  isLoading: boolean
}

export default function EnhancedSaaSOverview({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-2"></div>
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const overviewCards = [
    {
      title: 'Total Clients',
      value: data?.systemOverview?.totalClients?.toString() || '0',
      change: '+12%',
      icon: UsersIcon,
      color: 'blue',
      subtitle: `${data?.systemOverview?.activeClients || 0} active`,
    },
    {
      title: 'Monthly Revenue',
      value: `$${data?.systemOverview?.monthlyRevenue?.toLocaleString() || '0'}`,
      change: '+23%',
      icon: CurrencyDollarIcon,
      color: 'green',
      subtitle: `$${data?.systemOverview?.totalRevenue?.toLocaleString() || '0'} total`,
    },
    {
      title: 'Live Sessions',
      value: data?.systemOverview?.activeSessions?.toString() || '0',
      change: '+8%',
      icon: WifiIcon,
      color: 'purple',
      subtitle: `${data?.systemOverview?.totalSessions || 0} today`,
    },
    {
      title: 'Support Tickets',
      value: data?.systemOverview?.openTickets?.toString() || '0',
      change: '-15%',
      icon: ExclamationTriangleIcon,
      color: 'orange',
      subtitle: `${data?.systemOverview?.totalTickets || 0} total`,
    },
    {
      title: 'System Uptime',
      value: `${data?.systemOverview?.systemUptime || 99.9}%`,
      change: '+0.1%',
      icon: ServerIcon,
      color: 'green',
      subtitle: 'Last 30 days',
    },
    {
      title: 'Data Storage',
      value: data?.systemOverview?.totalDataSize || '0 GB',
      change: '+5.2%',
      icon: DocumentTextIcon,
      color: 'blue',
      subtitle: `${data?.systemOverview?.totalBackups || 0} backups`,
    },
    {
      title: 'Trial Clients',
      value: data?.systemOverview?.trialClients?.toString() || '0',
      change: '+45%',
      icon: ClockIcon,
      color: 'yellow',
      subtitle: 'Converting leads',
    },
    {
      title: 'Security Score',
      value: '98.5%',
      change: '+2.1%',
      icon: ShieldCheckIcon,
      color: 'green',
      subtitle: 'All systems secure',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-card p-6 hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-white/50 mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-full bg-${card.color}-500/20`}>
                <card.icon className={`w-6 h-6 text-${card.color}-400`} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${card.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {card.change}
              </span>
              <span className="text-xs text-white/60">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Real-Time Activity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeActivity data={data} />
        <SystemHealthMonitor data={data} />
      </div>

      {/* Geographic Distribution & Client Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GeographicDistribution clients={data?.clients || []} />
        <ClientStatusBreakdown data={data} />
        <RevenueBreakdown data={data} />
      </div>
    </div>
  )
}

// Real-Time Activity Component
function RealTimeActivity({ data }: { data: any }) {
  const recentActivities = [
    { type: 'login', user: 'Sarah Johnson', action: 'Logged in from New York', time: '2 minutes ago', status: 'success' },
    { type: 'payment', user: 'Elite Cuts', action: 'Payment processed - $1,800', time: '5 minutes ago', status: 'success' },
    { type: 'backup', user: 'System', action: 'Automated backup completed', time: '15 minutes ago', status: 'success' },
    { type: 'ticket', user: 'Beauty Spot', action: 'Support ticket created', time: '23 minutes ago', status: 'warning' },
    { type: 'signup', user: 'Luxury Spa', action: 'New trial signup', time: '1 hour ago', status: 'info' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return GlobeAltIcon
      case 'payment': return CurrencyDollarIcon
      case 'backup': return CloudArrowUpIcon
      case 'ticket': return ExclamationTriangleIcon
      case 'signup': return UsersIcon
      default: return CheckCircleIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      case 'info': return 'text-blue-400'
      default: return 'text-white'
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Real-Time Activity</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Live</span>
        </div>
      </div>
      <div className="space-y-4">
        {recentActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 glass rounded-lg"
            >
              <div className={`p-2 rounded-full bg-white/10`}>
                <Icon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white text-sm">{activity.user}</div>
                <div className="text-xs text-white/60">{activity.action}</div>
              </div>
              <div className="text-xs text-white/50">{activity.time}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// System Health Monitor Component
function SystemHealthMonitor({ data }: { data: any }) {
  const healthMetrics = [
    { name: 'API Response Time', value: '245ms', status: 'good', target: '< 500ms' },
    { name: 'Database Performance', value: '98.7%', status: 'excellent', target: '> 95%' },
    { name: 'Error Rate', value: '0.02%', status: 'excellent', target: '< 1%' },
    { name: 'Memory Usage', value: '67%', status: 'good', target: '< 80%' },
    { name: 'CPU Usage', value: '43%', status: 'excellent', target: '< 70%' },
    { name: 'Disk Usage', value: '78%', status: 'warning', target: '< 85%' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/20'
      case 'good': return 'bg-blue-500/20'
      case 'warning': return 'bg-yellow-500/20'
      case 'critical': return 'bg-red-500/20'
      default: return 'bg-white/20'
    }
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">System Health Monitor</h3>
      <div className="space-y-4">
        {healthMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-3 glass rounded-lg"
          >
            <div>
              <div className="font-medium text-white text-sm">{metric.name}</div>
              <div className="text-xs text-white/60">Target: {metric.target}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${getStatusColor(metric.status)}`}>
                {metric.value}
              </span>
              <div className={`px-2 py-1 rounded-full ${getStatusBg(metric.status)}`}>
                <span className={`text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Geographic Distribution Component
function GeographicDistribution({ clients }: { clients: any[] }) {
  const countryStats = clients.reduce((acc, client) => {
    acc[client.country] = (acc[client.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCountries = Object.entries(countryStats)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Geographic Distribution</h3>
      <div className="space-y-4">
        {topCountries.map((item, index) => (
          <motion.div
            key={item.country}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-blue-400" />
              <span className="text-white">{item.country}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">{item.count}</span>
              <div className="w-16 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: `${(item.count / Math.max(...topCountries.map(c => c.count))) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Client Status Breakdown Component
function ClientStatusBreakdown({ data }: { data: any }) {
  const statusData = [
    { status: 'Active', count: data?.systemOverview?.activeClients || 0, color: 'green' },
    { status: 'Trial', count: data?.systemOverview?.trialClients || 0, color: 'yellow' },
    { status: 'Suspended', count: data?.systemOverview?.suspendedClients || 0, color: 'red' },
    { status: 'Inactive', count: (data?.systemOverview?.totalClients || 0) - (data?.systemOverview?.activeClients || 0) - (data?.systemOverview?.trialClients || 0) - (data?.systemOverview?.suspendedClients || 0), color: 'gray' },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Client Status</h3>
      <div className="space-y-4">
        {statusData.map((item, index) => (
          <motion.div
            key={item.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-${item.color}-400`}></div>
              <span className="text-white">{item.status}</span>
            </div>
            <span className="text-white font-semibold">{item.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Revenue Breakdown Component
function RevenueBreakdown({ data }: { data: any }) {
  const revenueData = [
    { plan: 'Enterprise', revenue: 15000, percentage: 62.5 },
    { plan: 'Premium', revenue: 7200, percentage: 30.0 },
    { plan: 'Pro', revenue: 1800, percentage: 7.5 },
    { plan: 'Basic', revenue: 0, percentage: 0 },
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Revenue by Plan</h3>
      <div className="space-y-4">
        {revenueData.map((item, index) => (
          <motion.div
            key={item.plan}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-white">{item.plan}</span>
              <span className="text-white font-semibold">${item.revenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full" 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/60">{item.percentage}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 