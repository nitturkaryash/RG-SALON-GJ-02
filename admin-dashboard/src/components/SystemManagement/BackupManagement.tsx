import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CloudArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface BackupData {
  lastBackup: string
  nextBackup: string
  backupSize: string
  retentionPeriod: string
  totalBackups: number
  failedBackups: number
}

interface Props {
  data: BackupData
  isLoading: boolean
}

export default function BackupManagement({ data, isLoading }: Props) {
  const [isBackupRunning, setIsBackupRunning] = useState(false)
  const [selectedBackupType, setSelectedBackupType] = useState('full')

  const backupTypes = [
    { id: 'full', name: 'Full Backup', description: 'Complete system backup' },
    { id: 'incremental', name: 'Incremental', description: 'Changes since last backup' },
    { id: 'differential', name: 'Differential', description: 'Changes since last full backup' },
  ]

  const recentBackups = [
    {
      id: 1,
      type: 'Full Backup',
      timestamp: '2024-01-20T06:00:00Z',
      size: '15.7 GB',
      duration: '45 minutes',
      status: 'completed',
    },
    {
      id: 2,
      type: 'Incremental',
      timestamp: '2024-01-19T18:00:00Z',
      size: '2.3 GB',
      duration: '8 minutes',
      status: 'completed',
    },
    {
      id: 3,
      type: 'Full Backup',
      timestamp: '2024-01-19T06:00:00Z',
      size: '15.2 GB',
      duration: '43 minutes',
      status: 'completed',
    },
  ]

  const handleBackupNow = () => {
    setIsBackupRunning(true)
    // Simulate backup process
    setTimeout(() => {
      setIsBackupRunning(false)
    }, 5000)
  }

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
      {/* Backup Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Backup Status</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackupNow}
            disabled={isBackupRunning}
            className={`glass-button px-4 py-2 flex items-center space-x-2 ${
              isBackupRunning ? 'opacity-50 cursor-not-allowed' : 'hover-glow'
            }`}
          >
            {isBackupRunning ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            <span>{isBackupRunning ? 'Backing up...' : 'Backup Now'}</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 glass rounded-lg">
            <ClockIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-lg font-semibold text-white">
              {data?.lastBackup ? new Date(data.lastBackup).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-white/60 text-sm">Last Backup</div>
          </div>

          <div className="text-center p-4 glass rounded-lg">
            <ClockIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-semibold text-white">
              {data?.nextBackup ? new Date(data.nextBackup).toLocaleDateString() : 'Not scheduled'}
            </div>
            <div className="text-white/60 text-sm">Next Backup</div>
          </div>

          <div className="text-center p-4 glass rounded-lg">
            <CloudArrowUpIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-semibold text-white">
              {data?.backupSize || '0 GB'}
            </div>
            <div className="text-white/60 text-sm">Latest Size</div>
          </div>

          <div className="text-center p-4 glass rounded-lg">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-semibold text-white">
              {((data?.totalBackups - data?.failedBackups) / data?.totalBackups * 100).toFixed(1)}%
            </div>
            <div className="text-white/60 text-sm">Success Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Backup Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Backup Configuration</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Backup Type
            </label>
            <div className="space-y-2">
              {backupTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="backupType"
                    value={type.id}
                    checked={selectedBackupType === type.id}
                    onChange={(e) => setSelectedBackupType(e.target.value)}
                    className="w-4 h-4 text-purple-600 bg-transparent border-gray-300 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-white font-medium">{type.name}</div>
                    <div className="text-white/60 text-sm">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Schedule Settings
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-1">Frequency</label>
                <select className="glass-input w-full">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Time</label>
                <input type="time" defaultValue="06:00" className="glass-input w-full" />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1">Retention Period</label>
                <select className="glass-input w-full">
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button px-6 py-2 hover-glow"
          >
            Save Configuration
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Backups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Recent Backups</h3>
        
        <div className="space-y-3">
          {recentBackups.map((backup) => (
            <div key={backup.id} className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{backup.type}</h4>
                  <p className="text-white/60 text-sm">
                    {new Date(backup.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{backup.size}</div>
                <div className="text-white/60 text-sm">{backup.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
} 