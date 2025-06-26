import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  TrashIcon,
  EyeIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { NotificationCenter } from '../../../types/saas'

interface NotificationCenterTabProps {
  notifications: NotificationCenter[]
  isLoading: boolean
}

export function NotificationCenterTab({ notifications, isLoading }: NotificationCenterTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<NotificationCenter | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

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

  const unreadCount = notifications.filter(n => n.status === 'unread').length
  const criticalCount = notifications.filter(n => n.priority === 'critical').length
  const todayCount = notifications.filter(n => {
    const today = new Date().toDateString()
    return new Date(n.created_at).toDateString() === today
  }).length

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority
    const matchesType = filterType === 'all' || notification.type === filterType
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const handleMarkAsRead = (id: string) => {
    toast.success('Notification marked as read')
  }

  const handleArchive = (id: string) => {
    toast.success('Notification archived')
  }

  const handleDelete = (id: string) => {
    toast.success('Notification deleted')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return ExclamationTriangleIcon
      case 'warning': return ExclamationTriangleIcon
      case 'success': return CheckCircleIcon
      case 'info':
      default: return InformationCircleIcon
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'success': return 'text-green-400 bg-green-500/20'
      case 'info':
      default: return 'text-blue-400 bg-blue-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low':
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Notification Center</h2>
          <p className="text-white/60">Real-time system notifications and alerts</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
            <CogIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Unread</h3>
              <p className="text-2xl font-bold text-white mt-1">{unreadCount}</p>
              <p className="text-xs text-white/40 mt-1">Require attention</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
              <BellIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Critical</h3>
              <p className="text-2xl font-bold text-white mt-1">{criticalCount}</p>
              <p className="text-xs text-white/40 mt-1">High priority</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400">
              <ExclamationTriangleIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Today</h3>
              <p className="text-2xl font-bold text-white mt-1">{todayCount}</p>
              <p className="text-xs text-white/40 mt-1">New notifications</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400">
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
              <h3 className="text-sm font-medium text-white/60">Total</h3>
              <p className="text-2xl font-bold text-white mt-1">{notifications.length}</p>
              <p className="text-xs text-white/40 mt-1">All notifications</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400">
              <InformationCircleIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Notifications ({filteredNotifications.length})
        </h3>
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type)
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:bg-white/5 cursor-pointer ${
                  notification.status === 'unread' 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/5 border-white/10'
                }`}
                onClick={() => {
                  setSelectedNotification(notification)
                  setShowNotificationModal(true)
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium truncate">{notification.title}</h4>
                      <div className="flex items-center space-x-2 ml-4">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                        <span className="text-white/60 text-sm whitespace-nowrap">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{notification.message}</p>
                    {notification.client_id && (
                      <div className="flex items-center space-x-1 mt-2">
                        <UserIcon className="w-4 h-4 text-white/40" />
                        <span className="text-white/40 text-xs">Client: {notification.client_id}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.status === 'unread' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        className="p-2 text-white/60 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchive(notification.id)
                      }}
                      className="p-2 text-white/60 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <ArchiveBoxIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                      className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {showNotificationModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => {
            setShowNotificationModal(false)
            setSelectedNotification(null)
          }}
          onMarkAsRead={handleMarkAsRead}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function NotificationDetailModal({ 
  notification, 
  onClose, 
  onMarkAsRead, 
  onArchive, 
  onDelete 
}: {
  notification: NotificationCenter
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  const Icon = notification.type === 'error' ? ExclamationTriangleIcon :
              notification.type === 'warning' ? ExclamationTriangleIcon :
              notification.type === 'success' ? CheckCircleIcon :
              InformationCircleIcon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
              notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
              notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{notification.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {notification.priority.toUpperCase()}
                </span>
                <span className="text-white/60 text-sm">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white font-medium mb-2">Message</h3>
            <p className="text-white/80 leading-relaxed">{notification.message}</p>
          </div>

          {notification.client_id && (
            <div>
              <h3 className="text-white font-medium mb-2">Related Client</h3>
              <p className="text-white/60">{notification.client_id}</p>
            </div>
          )}

          {notification.action_url && (
            <div>
              <h3 className="text-white font-medium mb-2">Action Required</h3>
              <a
                href={notification.action_url}
                className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Take Action
              </a>
            </div>
          )}

          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-2">Additional Details</h3>
              <div className="bg-white/5 rounded-lg p-4">
                <pre className="text-white/60 text-sm overflow-x-auto">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <div className="flex space-x-3">
            {notification.status === 'unread' && (
              <button
                onClick={() => {
                  onMarkAsRead(notification.id)
                  onClose()
                }}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Mark as Read
              </button>
            )}
            <button
              onClick={() => {
                onArchive(notification.id)
                onClose()
              }}
              className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
            >
              Archive
            </button>
          </div>
          <button
            onClick={() => {
              onDelete(notification.id)
              onClose()
            }}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
} 