import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  ServerIcon,
  BoltIcon,
  ShieldExclamationIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { APIUsageMetrics, SalonClient } from '../../../types/saas'

interface APIUsageTabProps {
  clients: SalonClient[]
  apiUsage: APIUsageMetrics[]
  isLoading: boolean
}

export function APIUsageTab({ clients, apiUsage, isLoading }: APIUsageTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [selectedClient, setSelectedClient] = useState<string>('all')

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

  const filteredUsage = selectedClient === 'all' 
    ? apiUsage 
    : apiUsage.filter(usage => usage.client_id === selectedClient)

  // Calculate aggregate metrics
  const totalRequests = filteredUsage.reduce((sum, usage) => sum + usage.total_requests, 0)
  const totalFailures = filteredUsage.reduce((sum, usage) => sum + usage.failed_requests, 0)
  const totalRateLimitHits = filteredUsage.reduce((sum, usage) => sum + usage.rate_limit_hits, 0)
  const avgResponseTime = filteredUsage.length > 0 
    ? filteredUsage.reduce((sum, usage) => sum + usage.avg_response_time, 0) / filteredUsage.length
    : 0

  const successRate = totalRequests > 0 ? ((totalRequests - totalFailures) / totalRequests) * 100 : 0

  // Get top endpoints across all clients
  const endpointStats = new Map<string, { requests: number, response_time: number, count: number }>()
  
  filteredUsage.forEach(usage => {
    usage.endpoints_used.forEach(endpoint => {
      const existing = endpointStats.get(endpoint.endpoint) || { requests: 0, response_time: 0, count: 0 }
      endpointStats.set(endpoint.endpoint, {
        requests: existing.requests + endpoint.requests,
        response_time: existing.response_time + endpoint.avg_response_time,
        count: existing.count + 1
      })
    })
  })

  const topEndpoints = Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      requests: stats.requests,
      avg_response_time: stats.response_time / stats.count
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">API Usage Analytics</h2>
          <p className="text-white/60">Monitor API performance, rate limits, and usage patterns</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.salon_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Total Requests</h3>
              <p className="text-2xl font-bold text-white mt-1">{totalRequests.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">+12.5%</span>
                <span className="text-white/60 text-sm ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
              <GlobeAltIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Success Rate</h3>
              <p className="text-2xl font-bold text-white mt-1">{successRate.toFixed(1)}%</p>
              <div className="flex items-center mt-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">Healthy</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Avg Response Time</h3>
              <p className="text-2xl font-bold text-white mt-1">{avgResponseTime.toFixed(0)}ms</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">-8ms</span>
                <span className="text-white/60 text-sm ml-1">improvement</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400">
              <ClockIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Rate Limit Hits</h3>
              <p className="text-2xl font-bold text-white mt-1">{totalRateLimitHits}</p>
              <div className="flex items-center mt-2">
                {totalRateLimitHits > 0 ? (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 text-sm font-medium">Needs attention</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm font-medium">All good</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400">
              <ShieldExclamationIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">API Performance Trends</h3>
            <ChartBarIcon className="w-5 h-5 text-white/60" />
          </div>
          <div className="h-64">
            {/* Mock chart visualization */}
            <div className="flex items-end justify-between h-full space-x-2">
              {[65, 78, 85, 82, 90, 88, 95, 92, 87, 94, 96, 89].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-400/60 rounded-t-sm"
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-white/60 text-sm mt-4">
            <span>Response Time</span>
            <span>Request Volume</span>
            <span>Success Rate</span>
          </div>
        </div>

        {/* Top Endpoints */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top API Endpoints</h3>
            <DocumentMagnifyingGlassIcon className="w-5 h-5 text-white/60" />
          </div>
          <div className="space-y-3">
            {topEndpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.endpoint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <span className="text-white font-mono text-sm">{endpoint.endpoint}</span>
                  <p className="text-white/60 text-xs mt-1">{endpoint.avg_response_time.toFixed(0)}ms avg</p>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium">{endpoint.requests.toLocaleString()}</span>
                  <p className="text-white/60 text-xs">requests</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 