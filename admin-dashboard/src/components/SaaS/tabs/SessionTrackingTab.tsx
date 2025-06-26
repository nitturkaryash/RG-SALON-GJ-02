import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  WifiIcon,
  GlobeAltIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { ClientSession } from '../../../types/saas'

interface SessionTrackingTabProps {
  sessions: ClientSession[]
  isLoading: boolean
}

export function SessionTrackingTab({ sessions, isLoading }: SessionTrackingTabProps) {
  const [selectedSession, setSelectedSession] = useState<ClientSession | null>(null)
  
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
  
  return (
    <div className="space-y-6">
      {/* Enhanced Session Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
              <p className="text-2xl font-bold text-green-400">{sessions.filter(s => s.is_active).length}</p>
              <p className="text-sm text-white/60">Currently online</p>
            </div>
            <div className="p-3 rounded-full bg-green-500/20">
              <WifiIcon className="w-6 h-6 text-green-400" />
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
              <h3 className="text-lg font-semibold text-white">Total Sessions</h3>
              <p className="text-2xl font-bold text-blue-400">{sessions.length}</p>
              <p className="text-sm text-white/60">Today</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/20">
              <GlobeAltIcon className="w-6 h-6 text-blue-400" />
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
              <h3 className="text-lg font-semibold text-white">Unique Locations</h3>
              <p className="text-2xl font-bold text-purple-400">{new Set(sessions.map(s => s.location?.city)).size}</p>
              <p className="text-sm text-white/60">Cities</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500/20">
              <MapPinIcon className="w-6 h-6 text-purple-400" />
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
              <h3 className="text-lg font-semibold text-white">High Activity</h3>
              <p className="text-2xl font-bold text-yellow-400">{sessions.filter(s => s.actions_count > 100).length}</p>
              <p className="text-sm text-white/60">Suspicious behavior</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500/20">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Session Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Live Session Monitor</h3>
          <p className="text-white/60">Real-time tracking of all user sessions with location detection</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white/60 font-medium">User & Location</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Device & Browser</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">IP Address</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Status & Duration</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Activity</th>
                <th className="px-6 py-4 text-left text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sessions.slice(0, 15).map((session, index) => (
                <motion.tr
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {session.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{session.user_name}</p>
                        <div className="flex items-center space-x-1 text-sm text-white/60">
                          <MapPinIcon className="w-3 h-3" />
                          <span>{session.location?.city}, {session.location?.country}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {session.device_type === 'desktop' ? (
                        <ComputerDesktopIcon className="w-4 h-4 text-blue-400" />
                      ) : (
                        <DevicePhoneMobileIcon className="w-4 h-4 text-green-400" />
                      )}
                      <div>
                        <p className="text-white text-sm capitalize">{session.device_type}</p>
                        <p className="text-white/60 text-xs">{session.browser}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-white font-mono text-sm">{session.ip_address}</span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        session.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {session.is_active ? 'Active' : 'Ended'}
                      </span>
                      <p className="text-white/60 text-xs">{Math.floor(session.session_duration / 60)}m duration</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-white text-sm">{session.actions_count} actions</p>
                      {session.actions_count > 100 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                          High Activity
                        </span>
                      )}
                    </div>
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
                            toast.success(`Terminating session for ${session.user_name}`)
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                          title="Terminate Session"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <SessionDetailsModal 
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

interface SessionDetailsModalProps {
  session: ClientSession
  onClose: () => void
}

function SessionDetailsModal({ session, onClose }: SessionDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Session Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">User Information</h3>
            <div className="glass-card p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">User:</span>
                <span className="text-white">{session.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Device:</span>
                <span className="text-white capitalize">{session.device_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Browser:</span>
                <span className="text-white">{session.browser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">IP Address:</span>
                <span className="text-white font-mono">{session.ip_address}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Location & Activity</h3>
            <div className="glass-card p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">City:</span>
                <span className="text-white">{session.location?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Country:</span>
                <span className="text-white">{session.location?.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Actions:</span>
                <span className="text-white">{session.actions_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Duration:</span>
                <span className="text-white">{Math.floor(session.session_duration / 60)}m</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          {session.is_active && (
            <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30">
              Terminate Session
            </button>
          )}
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