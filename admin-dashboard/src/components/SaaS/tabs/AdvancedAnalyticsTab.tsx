import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  PresentationChartLineIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'
import { SalonClient, ClientAnalytics } from '../../../types/saas'

interface AdvancedAnalyticsTabProps {
  clients: SalonClient[]
  analytics: Record<string, ClientAnalytics>
  isLoading: boolean
}

export function AdvancedAnalyticsTab({ clients, analytics, isLoading }: AdvancedAnalyticsTabProps) {
  const [selectedClient, setSelectedClient] = useState<SalonClient | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const totalRevenue = clients.reduce((sum, client) => sum + client.monthly_revenue, 0)
  const totalUsers = clients.reduce((sum, client) => sum + client.users_count, 0)
  const avgSessionDuration = 45 // Calculate from analytics
  const conversionRate = 78.5 // Calculate from analytics

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-white/60">Comprehensive insights across all salon clients</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-500/30 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-blue-500/30 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change={12.5}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <MetricCard
          title="Active Users"
          value={totalUsers.toLocaleString()}
          change={8.2}
          icon={UsersIcon}
          color="blue"
        />
        <MetricCard
          title="Avg Session Duration"
          value={`${avgSessionDuration}m`}
          change={-2.1}
          icon={ClockIcon}
          color="purple"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          change={5.7}
          icon={ArrowTrendingUpIcon}
          color="orange"
        />
      </div>

      {viewMode === 'overview' ? (
        <OverviewAnalytics clients={clients} analytics={analytics} />
      ) : (
        <DetailedAnalytics 
          clients={clients} 
          analytics={analytics}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      )}

      {/* Client Analytics Modal */}
      {selectedClient && (
        <ClientAnalyticsModal
          client={selectedClient}
          analytics={analytics[selectedClient.id]}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: any
  color: 'green' | 'blue' | 'purple' | 'orange'
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-violet-500/20 text-purple-400',
    orange: 'from-orange-500/20 to-amber-500/20 text-orange-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/60">{title}</h3>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={`text-sm font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-white/60 text-sm ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}

function OverviewAnalytics({ clients, analytics }: { clients: SalonClient[]; analytics: Record<string, ClientAnalytics> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
          <DocumentChartBarIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="h-64 flex items-end justify-between space-x-2">
          {[2200, 2800, 2500, 3200, 2900, 3800, 4300].map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(value / 4300) * 100}%` }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-t from-blue-500/30 to-blue-400/60 rounded-t-lg flex-1 min-h-[20px] relative group"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                ${value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-white/60 text-sm">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>

      {/* User Engagement */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">User Engagement</h3>
          <UsersIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          <EngagementMetric label="Daily Active Users" value="1,234" percentage={85} color="green" />
          <EngagementMetric label="Weekly Active Users" value="4,567" percentage={92} color="blue" />
          <EngagementMetric label="Monthly Active Users" value="12,890" percentage={78} color="purple" />
          <EngagementMetric label="Session Duration" value="45m avg" percentage={65} color="orange" />
        </div>
      </div>

      {/* Device Distribution */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Device Distribution</h3>
          <DevicePhoneMobileIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          <DeviceMetric icon={ComputerDesktopIcon} label="Desktop" value="65%" color="blue" />
          <DeviceMetric icon={DevicePhoneMobileIcon} label="Mobile" value="32%" color="green" />
          <DeviceMetric icon={GlobeAltIcon} label="Tablet" value="3%" color="purple" />
        </div>
      </div>

      {/* Top Performing Clients */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Performing Clients</h3>
          <ChartBarIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-3">
          {clients
            .sort((a, b) => b.monthly_revenue - a.monthly_revenue)
            .slice(0, 5)
            .map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {client.salon_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.salon_name}</p>
                    <p className="text-white/60 text-sm">{client.users_count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${client.monthly_revenue.toLocaleString()}</p>
                  <p className="text-green-400 text-sm">+12% growth</p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  )
}

function DetailedAnalytics({ 
  clients, 
  analytics, 
  selectedClient, 
  setSelectedClient 
}: { 
  clients: SalonClient[]
  analytics: Record<string, ClientAnalytics>
  selectedClient: SalonClient | null
  setSelectedClient: (client: SalonClient) => void
}) {
  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Client for Detailed Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clients.map((client) => (
            <motion.button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedClient?.id === client.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {client.salon_name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{client.salon_name}</p>
                  <p className="text-white/60 text-sm">${client.monthly_revenue.toLocaleString()}/mo</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detailed Client Analytics */}
      {selectedClient && (
        <ClientDetailedAnalytics 
          client={selectedClient} 
          analytics={analytics[selectedClient.id]} 
        />
      )}
    </div>
  )
}

function ClientDetailedAnalytics({ client, analytics }: { client: SalonClient; analytics?: ClientAnalytics }) {
  if (!analytics) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/60">No analytics data available for {client.salon_name}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Metrics */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Daily Active Users</span>
            <span className="text-white font-semibold">{analytics.daily_active_users}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Monthly Active Users</span>
            <span className="text-white font-semibold">{analytics.monthly_active_users}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Avg Session Duration</span>
            <span className="text-white font-semibold">{analytics.user_engagement.avg_session_duration}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Bounce Rate</span>
            <span className="text-white font-semibold">{analytics.user_engagement.bounce_rate}%</span>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Feature Usage</h3>
        <div className="space-y-3">
          <FeatureUsageBar label="Appointments" value={analytics.feature_usage.appointments} />
          <FeatureUsageBar label="Inventory" value={analytics.feature_usage.inventory} />
          <FeatureUsageBar label="Payments" value={analytics.feature_usage.payments} />
          <FeatureUsageBar label="Reports" value={analytics.feature_usage.reports} />
        </div>
      </div>

      {/* System Performance */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Uptime</span>
            <span className="text-green-400 font-semibold">{analytics.system_performance.uptime}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Response Time</span>
            <span className="text-white font-semibold">{analytics.system_performance.response_time}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Error Rate</span>
            <span className="text-yellow-400 font-semibold">{analytics.system_performance.error_rate}%</span>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
        <div className="h-32 flex items-end justify-between space-x-2">
          {analytics.revenue_trend.map((point, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-green-500/30 to-green-400/60 rounded-t-lg flex-1 relative group"
              style={{ height: `${(point.amount / Math.max(...analytics.revenue_trend.map(p => p.amount))) * 100}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                ${point.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EngagementMetric({ label, value, percentage, color }: { label: string; value: string; percentage: number; color: string }) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
        />
      </div>
    </div>
  )
}

function DeviceMetric({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-4 h-4 text-${color}-400`} />
        </div>
        <span className="text-white">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}

function FeatureUsageBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>
    </div>
  )
}

function ClientAnalyticsModal({ client, analytics, onClose }: { client: SalonClient; analytics?: ClientAnalytics; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{client.salon_name} - Analytics Deep Dive</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            ×
          </button>
        </div>

        {analytics ? (
          <ClientDetailedAnalytics client={client} analytics={analytics} />
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No detailed analytics available for this client</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 glass-button hover-glow"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
} 