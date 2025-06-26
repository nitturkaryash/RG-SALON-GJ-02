import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  DocumentArrowDownIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline'
import SystemHealth from '../components/SystemManagement/SystemHealth'
import BackupManagement from '../components/SystemManagement/BackupManagement'
import DataRecovery from '../components/SystemManagement/DataRecovery'
import IssueResolution from '../components/SystemManagement/IssueResolution'
// SystemLogs and AlertsManagement components will be added later

// Mock data for system management
const fetchSystemData = async () => {
  return {
    systemHealth: {
      status: 'healthy',
      uptime: '99.9%',
      lastIncident: '2024-01-15',
      activeUsers: 1247,
      systemLoad: 23.5,
      memoryUsage: 67.8,
      diskUsage: 45.2,
    },
    backups: {
      lastBackup: '2024-01-20T06:00:00Z',
      nextBackup: '2024-01-21T06:00:00Z',
      backupSize: '15.7 GB',
      retentionPeriod: '30 days',
      totalBackups: 30,
      failedBackups: 0,
    },
    activeIssues: [
      {
        id: 1,
        title: 'High Memory Usage - Server 3',
        severity: 'warning',
        affectedUsers: 45,
        reportedAt: '2024-01-20T14:30:00Z',
        status: 'investigating',
      },
      {
        id: 2,
        title: 'Slow API Response - Payment Gateway',
        severity: 'critical',
        affectedUsers: 120,
        reportedAt: '2024-01-20T13:15:00Z',
        status: 'resolving',
      },
    ],
    recentRecoveries: [
      {
        id: 1,
        clientName: 'Glamour Studio',
        dataType: 'Client Database',
        recoveredAt: '2024-01-20T10:30:00Z',
        status: 'completed',
        recoveredSize: '2.3 GB',
      },
      {
        id: 2,
        clientName: 'Elite Cuts',
        dataType: 'Appointment History',
        recoveredAt: '2024-01-19T16:45:00Z',
        status: 'completed',
        recoveredSize: '450 MB',
      },
    ],
  }
}

export default function SystemManagement() {
  const [activeTab, setActiveTab] = useState('overview')

  const { data, isLoading } = useQuery({
    queryKey: ['systemManagement'],
    queryFn: fetchSystemData,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const managementTabs = [
    {
      id: 'overview',
      name: 'System Overview',
      icon: ServerIcon,
      description: 'Overall system health and status',
    },
    {
      id: 'backup',
      name: 'Backup Management',
      icon: CloudArrowUpIcon,
      description: 'Data backup scheduling and monitoring',
    },
    {
      id: 'recovery',
      name: 'Data Recovery',
      icon: CloudArrowDownIcon,
      description: 'Restore lost or corrupted data',
    },
    {
      id: 'issues',
      name: 'Issue Resolution',
      icon: WrenchScrewdriverIcon,
      description: 'Track and resolve system issues',
    },
    {
      id: 'logs',
      name: 'System Logs',
      icon: DocumentArrowDownIcon,
      description: 'View detailed system activity',
    },
    {
      id: 'alerts',
      name: 'Alerts & Monitoring',
      icon: BellAlertIcon,
      description: 'Configure system alerts and monitoring',
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemOverview data={data} isLoading={isLoading} />
      case 'backup':
        return <BackupManagement data={data?.backups || {}} isLoading={isLoading} />
      case 'recovery':
        return <DataRecovery data={data?.recentRecoveries || []} isLoading={isLoading} />
      case 'issues':
        return <IssueResolution data={data?.activeIssues || []} isLoading={isLoading} />
      case 'logs':
        return <div className="glass-card p-6"><h3 className="text-white">System Logs Coming Soon</h3></div>
      case 'alerts':
        return <div className="glass-card p-6"><h3 className="text-white">Alerts Management Coming Soon</h3></div>
      default:
        return <SystemOverview data={data} isLoading={isLoading} />
    }
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
            System Management
          </h1>
          <p className="text-white/60">
            Comprehensive platform management and issue resolution
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">System Healthy</span>
          </div>
        </div>
      </motion.div>

      {/* Critical Alerts Bar */}
      {(data?.activeIssues?.filter(issue => issue.severity === 'critical').length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-red-500/30 bg-red-500/10"
        >
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Critical Issues Detected</h3>
              <p className="text-white/80 text-sm">
                {data?.activeIssues?.filter(issue => issue.severity === 'critical').length} critical issues requiring immediate attention
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('issues')}
              className="glass-button px-4 py-2 hover-glow ml-auto"
            >
              View Issues
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Management Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-4 space-y-2">
            {managementTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'glass-button text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">{tab.name}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Management Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}

// System Overview Component
function SystemOverview({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="h-32 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemHealthCard
          title="System Status"
          value={data?.systemHealth?.status || 'Unknown'}
          icon={CheckCircleIcon}
          color="green"
        />
        <SystemHealthCard
          title="Uptime"
          value={data?.systemHealth?.uptime || '0%'}
          icon={ClockIcon}
          color="blue"
        />
        <SystemHealthCard
          title="Active Users"
          value={data?.systemHealth?.activeUsers?.toLocaleString() || '0'}
          icon={ServerIcon}
          color="purple"
        />
        <SystemHealthCard
          title="System Load"
          value={`${data?.systemHealth?.systemLoad || 0}%`}
          icon={ServerIcon}
          color="orange"
        />
      </div>

      {/* System Health Details */}
      <SystemHealth data={data?.systemHealth} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBackups data={data?.backups} />
        <RecentIssues data={data?.activeIssues} />
      </div>
    </div>
  )
}

// System Health Card Component
function SystemHealthCard({ title, value, icon: Icon, color }: any) {
  const colorVariants = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass-card p-4 bg-gradient-to-br ${colorVariants[color]} border hover-glow`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
        <Icon className={`w-5 h-5 ${colorVariants[color].split(' ').pop()}`} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </motion.div>
  )
}

// Recent Backups Component
function RecentBackups({ data }: { data: any }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Backup Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Last Backup</span>
          <span className="text-white">
            {data?.lastBackup ? new Date(data.lastBackup).toLocaleString() : 'Never'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Next Backup</span>
          <span className="text-white">
            {data?.nextBackup ? new Date(data.nextBackup).toLocaleString() : 'Not scheduled'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Backup Size</span>
          <span className="text-white">{data?.backupSize || '0 GB'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">Success Rate</span>
          <span className="text-green-400">100%</span>
        </div>
      </div>
    </div>
  )
}

// Recent Issues Component
function RecentIssues({ data }: { data: any }) {
  const severityColors = {
    critical: 'text-red-400 bg-red-500/20',
    warning: 'text-orange-400 bg-orange-500/20',
    info: 'text-blue-400 bg-blue-500/20',
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Active Issues</h3>
      <div className="space-y-3">
        {data?.length > 0 ? (
          data.map((issue: any) => (
            <div key={issue.id} className="p-3 glass rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{issue.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${severityColors[issue.severity as keyof typeof severityColors]}`}>
                      {issue.severity}
                    </span>
                    <span className="text-white/60 text-xs">
                      {issue.affectedUsers} users affected
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  {new Date(issue.reportedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-white/60">
            <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <p>No active issues</p>
          </div>
        )}
      </div>
    </div>
  )
} 