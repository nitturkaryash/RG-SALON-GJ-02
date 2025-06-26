import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GlobeAltIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface ClientSession {
  id: string
  client_id: string
  user_name: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  operating_system: string
  ip_address: string
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
  }
  login_time: string
  logout_time?: string
  session_duration: number
  is_active: boolean
  actions_count: number
  last_activity: string
}

interface Props {
  sessions: ClientSession[]
  isLoading: boolean
}

export default function SessionTrackingManagement({ sessions, isLoading }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedSession, setSelectedSession] = useState<ClientSession | null>(null)

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && session.is_active) ||
                         (statusFilter === 'inactive' && !session.is_active)

    return matchesSearch && matchesStatus
  })

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return ComputerDesktopIcon
      case 'mobile': return DevicePhoneMobileIcon
      case 'tablet': return DevicePhoneMobileIcon
      default: return ComputerDesktopIcon
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) return `${diffHours}h ago`
    return `${diffMinutes}m ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Active Sessions</p>
              <p className="text-2xl font-bold text-green-400">
                {sessions.filter(s => s.is_active).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Sessions Today</p>
              <p className="text-2xl font-bold text-blue-400">{sessions.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/20">
              <GlobeAltIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Avg Session Duration</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatDuration(sessions.reduce((acc, s) => acc + s.session_duration, 0) / sessions.length || 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-500/20">
              <ClockIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Suspicious Activity</p>
              <p className="text-2xl font-bold text-yellow-400">
                {sessions.filter(s => s.actions_count > 100).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500/20">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  User & Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Device & Browser
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Session Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.device_type)
                return (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {session.user_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{session.user_name}</p>
                          <div className="flex items-center space-x-1 text-sm text-white/60">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{session.location.city}, {session.location.country}</span>
                          </div>
                          <p className="text-xs text-white/50">{session.ip_address}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <DeviceIcon className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white text-sm">{session.device_type}</p>
                          <p className="text-xs text-white/60">{session.browser}</p>
                          <p className="text-xs text-white/50">{session.operating_system}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">Login: {getTimeAgo(session.login_time)}</p>
                        {session.logout_time ? (
                          <p className="text-white/60">Logout: {getTimeAgo(session.logout_time)}</p>
                        ) : (
                          <p className="text-green-400">Currently active</p>
                        )}
                        <p className="text-white/60">Duration: {formatDuration(session.session_duration)}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{session.actions_count} actions</p>
                        <p className="text-white/60">Last: {getTimeAgo(session.last_activity)}</p>
                        {session.actions_count > 100 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            High Activity
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.is_active ? 'Active' : 'Ended'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSession(session)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </motion.button>
                        {session.is_active && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              console.log('Terminate session:', session.id)
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                            title="Terminate Session"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Session Details</h2>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedSession.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedSession.user_name}</p>
                      <p className="text-white/60 text-sm">Session ID: {selectedSession.id}</p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <h4 className="text-md font-semibold text-white">Location Details</h4>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">City</span>
                    <span className="text-white">{selectedSession.location.city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Country</span>
                    <span className="text-white">{selectedSession.location.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">IP Address</span>
                    <span className="text-white font-mono">{selectedSession.ip_address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Coordinates</span>
                    <span className="text-white font-mono">
                      {selectedSession.location.latitude.toFixed(4)}, {selectedSession.location.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Technical Information</h3>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Device Type</span>
                    <span className="text-white capitalize">{selectedSession.device_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Browser</span>
                    <span className="text-white">{selectedSession.browser}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Operating System</span>
                    <span className="text-white">{selectedSession.operating_system}</span>
                  </div>
                </div>

                {/* Session Activity */}
                <h4 className="text-md font-semibold text-white">Session Activity</h4>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Login Time</span>
                    <span className="text-white">{new Date(selectedSession.login_time).toLocaleString()}</span>
                  </div>
                  {selectedSession.logout_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Logout Time</span>
                      <span className="text-white">{new Date(selectedSession.logout_time).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Duration</span>
                    <span className="text-white">{Math.floor(selectedSession.session_duration / 3600)}h {Math.floor((selectedSession.session_duration % 3600) / 60)}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Actions Count</span>
                    <span className="text-white">{selectedSession.actions_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Last Activity</span>
                    <span className="text-white">{new Date(selectedSession.last_activity).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Status</span>
                    <span className={selectedSession.is_active ? 'text-green-400' : 'text-gray-400'}>
                      {selectedSession.is_active ? 'Active' : 'Ended'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-white/20">
              {selectedSession.is_active && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                >
                  Terminate Session
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSession(null)}
                className="px-6 py-2 glass-button hover-glow"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 