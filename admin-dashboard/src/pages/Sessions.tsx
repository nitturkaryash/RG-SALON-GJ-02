import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
// Icons will be used when components are fully implemented
// Session components will be added later

// Mock data
const fetchSessions = async (filters: any) => {
  return {
    activeSessions: [
      {
        id: '1',
        user_id: 'user1',
        user_name: 'Sarah Johnson',
        salon_name: 'Glamour Studio',
        device: 'desktop',
        browser: 'Chrome',
        location: 'New York, US',
        ip_address: '192.168.1.1',
        started_at: '2024-01-20T10:30:00Z',
        last_activity: '2024-01-20T11:45:00Z',
        duration: 75,
        pages_visited: 12,
      },
      {
        id: '2',
        user_id: 'user2',
        user_name: 'Mike Chen',
        salon_name: 'Elite Cuts',
        device: 'mobile',
        browser: 'Safari',
        location: 'Toronto, CA',
        ip_address: '192.168.1.2',
        started_at: '2024-01-20T09:15:00Z',
        last_activity: '2024-01-20T11:40:00Z',
        duration: 145,
        pages_visited: 8,
      },
    ],
    stats: {
      totalActive: 247,
      avgDuration: 28.5,
      totalToday: 1856,
      bounceRate: 23.4,
    },
    deviceBreakdown: {
      desktop: 156,
      mobile: 78,
      tablet: 13,
    },
    topPages: [
      { page: '/dashboard', visits: 1432 },
      { page: '/appointments', visits: 987 },
      { page: '/clients', visits: 756 },
      { page: '/inventory', visits: 543 },
      { page: '/reports', visits: 321 },
    ],
  }
}

export default function Sessions() {
  const [filters, setFilters] = useState({
    device: '',
    location: '',
    duration: '',
    dateRange: '',
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => fetchSessions(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const handleTerminateSession = (sessionId: string) => {
    console.log('Terminating session:', sessionId)
    // Implement session termination logic
    refetch()
  }

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
            Session Management
          </h1>
          <p className="text-white/60">
            Monitor and manage active user sessions in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Updates</span>
          </div>
        </div>
      </motion.div>

      {/* Session Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-4 text-center">
            <h3 className="text-2xl font-bold text-white">{data?.stats?.totalActive || 0}</h3>
            <p className="text-white/60 text-sm">Active Sessions</p>
          </div>
          <div className="glass-card p-4 text-center">
            <h3 className="text-2xl font-bold text-green-400">{data?.stats?.avgDuration || 0}m</h3>
            <p className="text-white/60 text-sm">Avg Duration</p>
          </div>
          <div className="glass-card p-4 text-center">
            <h3 className="text-2xl font-bold text-blue-400">{data?.stats?.totalToday || 0}</h3>
            <p className="text-white/60 text-sm">Sessions Today</p>
          </div>
          <div className="glass-card p-4 text-center">
            <h3 className="text-2xl font-bold text-purple-400">{data?.stats?.bounceRate || 0}%</h3>
            <p className="text-white/60 text-sm">Bounce Rate</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Session Filters</h3>
          <p className="text-white/60">Advanced filtering options coming soon...</p>
        </div>
      </motion.div>

      {/* Active Sessions Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Sessions Map</h3>
          <p className="text-white/60">Geographic session visualization coming soon...</p>
        </div>
      </motion.div>

      {/* Sessions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Sessions Table</h3>
          <p className="text-white/60">Detailed session management table coming soon...</p>
        </div>
      </motion.div>

      {/* Top Pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Most Visited Pages Today
        </h3>
        <div className="space-y-3">
          {data?.topPages?.map((page, index) => (
            <div key={page.page} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 glass-card flex items-center justify-center text-sm font-medium text-white">
                  {index + 1}
                </div>
                <span className="text-white">{page.page}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60">{page.visits.toLocaleString()}</span>
                <span className="text-sm text-white/40">visits</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 