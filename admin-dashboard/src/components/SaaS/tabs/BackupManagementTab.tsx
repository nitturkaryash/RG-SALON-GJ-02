import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  CogIcon,
  PlayIcon,
  CalendarIcon,
  ShieldCheckIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { SalonClient, BackupRecord } from '../../../types/saas'

interface BackupManagementTabProps {
  clients: SalonClient[]
  backups: BackupRecord[]
  isLoading: boolean
}

export function BackupManagementTab({ clients, backups, isLoading }: BackupManagementTabProps) {
  const [selectedClient, setSelectedClient] = useState<SalonClient | null>(null)
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'differential'>('full')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null)
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

  const completedBackups = backups.filter(b => b.status === 'completed').length
  const failedBackups = backups.filter(b => b.status === 'failed').length
  const totalBackupSize = backups.reduce((sum, backup) => {
    const size = parseFloat(backup.file_size.replace(/[^0-9.]/g, ''))
    return sum + size
  }, 0)

  const handleCreateBackup = (client: SalonClient) => {
    toast.success(`Starting ${backupType} backup for ${client.salon_name}`)
  }

  const handleRestoreBackup = (backup: BackupRecord) => {
    setSelectedBackup(backup)
    setShowRestoreModal(true)
  }

  const handleScheduleBackup = (client: SalonClient) => {
    setSelectedClient(client)
    setShowScheduleModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Backup Management</h2>
          <p className="text-white/60">Automated backup and restore system for all salon clients</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={backupType}
            onChange={(e) => setBackupType(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full">Full Backup</option>
            <option value="incremental">Incremental</option>
            <option value="differential">Differential</option>
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
              Client Details
            </button>
          </div>
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
              <h3 className="text-sm font-medium text-white/60">Total Backups</h3>
              <p className="text-2xl font-bold text-white mt-1">{backups.length}</p>
              <p className="text-xs text-white/40 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
              <DocumentArrowDownIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Successful</h3>
              <p className="text-2xl font-bold text-white mt-1">{completedBackups}</p>
              <p className="text-xs text-white/40 mt-1">This month</p>
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
              <h3 className="text-sm font-medium text-white/60">Failed</h3>
              <p className="text-2xl font-bold text-white mt-1">{failedBackups}</p>
              <p className="text-xs text-white/40 mt-1">Needs attention</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400">
              <ExclamationTriangleIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Storage Used</h3>
              <p className="text-2xl font-bold text-white mt-1">{totalBackupSize.toFixed(1)} GB</p>
              <p className="text-xs text-white/40 mt-1">Total space</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400">
              <ServerIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {viewMode === 'overview' ? (
        <BackupOverview 
          clients={clients} 
          backups={backups}
          onCreateBackup={handleCreateBackup}
          onScheduleBackup={handleScheduleBackup}
          onRestoreBackup={handleRestoreBackup}
        />
      ) : (
        <DetailedBackupManagement 
          clients={clients}
          backups={backups}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          onCreateBackup={handleCreateBackup}
          onScheduleBackup={handleScheduleBackup}
          onRestoreBackup={handleRestoreBackup}
        />
      )}

      {/* Modals */}
      {showScheduleModal && selectedClient && (
        <ScheduleBackupModal
          client={selectedClient}
          onClose={() => {
            setShowScheduleModal(false)
            setSelectedClient(null)
          }}
          onSuccess={() => {
            toast.success(`Backup schedule updated for ${selectedClient.salon_name}`)
            setShowScheduleModal(false)
            setSelectedClient(null)
          }}
        />
      )}

      {showRestoreModal && selectedBackup && (
        <RestoreBackupModal
          backup={selectedBackup}
          onClose={() => {
            setShowRestoreModal(false)
            setSelectedBackup(null)
          }}
          onSuccess={() => {
            toast.success('Backup restore initiated successfully')
            setShowRestoreModal(false)
            setSelectedBackup(null)
          }}
        />
      )}
    </div>
  )
}

function BackupOverview({ 
  clients, 
  backups, 
  onCreateBackup, 
  onScheduleBackup, 
  onRestoreBackup 
}: {
  clients: SalonClient[]
  backups: BackupRecord[]
  onCreateBackup: (client: SalonClient) => void
  onScheduleBackup: (client: SalonClient) => void
  onRestoreBackup: (backup: BackupRecord) => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Backups */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Backups</h3>
          <DocumentArrowDownIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-3">
          {backups.slice(0, 6).map((backup, index) => {
            const client = clients.find(c => c.id === backup.client_id)
            return (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    backup.status === 'completed' ? 'bg-green-500/20' :
                    backup.status === 'failed' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {backup.status === 'completed' ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    ) : backup.status === 'failed' ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{client?.salon_name || 'Unknown Client'}</p>
                    <p className="text-white/60 text-sm">{backup.backup_type} • {backup.file_size}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">
                    {new Date(backup.created_at).toLocaleDateString()}
                  </p>
                  {backup.status === 'completed' && (
                    <button
                      onClick={() => onRestoreBackup(backup)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <PlayIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Starting backup for all clients')}
            className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-white hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
          >
            <CloudArrowDownIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Backup All</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Backup verification started')}
            className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-white hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
          >
            <ShieldCheckIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Verify All</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Cleanup initiated')}
            className="p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-lg text-white hover:from-orange-500/30 hover:to-amber-500/30 transition-all"
          >
            <ArrowPathIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Cleanup Old</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Generating backup report')}
            className="p-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-lg text-white hover:from-purple-500/30 hover:to-violet-500/30 transition-all"
          >
            <DocumentIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Generate Report</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function DetailedBackupManagement({
  clients,
  backups,
  selectedClient,
  setSelectedClient,
  onCreateBackup,
  onScheduleBackup,
  onRestoreBackup
}: {
  clients: SalonClient[]
  backups: BackupRecord[]
  selectedClient: SalonClient | null
  setSelectedClient: (client: SalonClient) => void
  onCreateBackup: (client: SalonClient) => void
  onScheduleBackup: (client: SalonClient) => void
  onRestoreBackup: (backup: BackupRecord) => void
}) {
  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Client for Detailed Backup Management</h3>
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
                  <p className="text-white/60 text-sm">{client.database_size} • {client.backup_frequency}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detailed Client Backup Info */}
      {selectedClient && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Info */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{selectedClient.salon_name} Backup Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Database Size:</span>
                <span className="text-white">{selectedClient.database_size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Backup Frequency:</span>
                <span className="text-white capitalize">{selectedClient.backup_frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last Backup:</span>
                <span className="text-white">{new Date(selectedClient.last_backup).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Retention:</span>
                <span className="text-white">{selectedClient.data_retention_days} days</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => onCreateBackup(selectedClient)}
                className="w-full glass-button py-2 hover-glow flex items-center justify-center space-x-2"
              >
                <CloudArrowDownIcon className="w-4 h-4" />
                <span>Create Backup Now</span>
              </button>
              <button
                onClick={() => onScheduleBackup(selectedClient)}
                className="w-full glass-button py-2 flex items-center justify-center space-x-2"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Manage Schedule</span>
              </button>
            </div>
          </div>

          {/* Backup History */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Backup History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-white/60 font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-white/60 font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-white/60 font-medium">Size</th>
                    <th className="px-4 py-3 text-left text-white/60 font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {backups.filter(b => b.client_id === selectedClient.id).map((backup, index) => (
                    <motion.tr
                      key={backup.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-white">
                        {new Date(backup.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white capitalize">{backup.backup_type}</td>
                      <td className="px-4 py-3 text-white">{backup.file_size}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          backup.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          backup.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {backup.status === 'completed' && (
                            <>
                              <button
                                onClick={() => onRestoreBackup(backup)}
                                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                                title="Restore"
                              >
                                <CloudArrowUpIcon className="w-4 h-4" />
                              </button>
                              {backup.download_url && (
                                <a
                                  href={backup.download_url}
                                  className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded"
                                  title="Download"
                                >
                                  <DocumentArrowDownIcon className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleBackupModal({ client, onClose, onSuccess }: any) {
  const [frequency, setFrequency] = useState(client.backup_frequency)
  const [retentionDays, setRetentionDays] = useState(client.data_retention_days)
  const [autoBackup, setAutoBackup] = useState(true)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Schedule Backup</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Backup Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Retention Period (days)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoBackup"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoBackup" className="text-white/80 text-sm">
              Enable automatic backups
            </label>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onSuccess}
            className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30"
          >
            Save Schedule
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function RestoreBackupModal({ backup, onClose, onSuccess }: any) {
  const [restoreType, setRestoreType] = useState('full')
  const [confirmRestore, setConfirmRestore] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Restore Backup</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ This will restore data from {new Date(backup.created_at).toLocaleDateString()}. 
              Current data may be overwritten.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Restore Type
              </label>
              <select
                value={restoreType}
                onChange={(e) => setRestoreType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Full Restore</option>
                <option value="selective">Selective Restore</option>
                <option value="point-in-time">Point-in-time Recovery</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="confirmRestore"
                checked={confirmRestore}
                onChange={(e) => setConfirmRestore(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <label htmlFor="confirmRestore" className="text-white/80 text-sm">
                I understand this action cannot be undone
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onSuccess}
            disabled={!confirmRestore}
            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore Now
          </button>
        </div>
      </motion.div>
    </div>
  )
} 