import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  UserIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { DataChangeLog, ClientDataBackup, SalonClient } from '../../../types/saas'

interface DataAuditTabProps {
  dataChangeLogs: DataChangeLog[]
  clientBackups: ClientDataBackup[]
  clients: SalonClient[]
}

export function DataAuditTab({ dataChangeLogs, clientBackups, clients }: DataAuditTabProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'backups' | 'recovery' | 'analytics'>('changes')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedTable, setSelectedTable] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7days')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<DataChangeLog | null>(null)

  // Filter change logs
  const filteredChangeLogs = dataChangeLogs.filter(log => {
    const matchesClient = selectedClient === 'all' || log.client_id === selectedClient
    const matchesTable = selectedTable === 'all' || log.table_name === selectedTable
    const matchesSearch = searchTerm === '' || 
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.changed_by.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Date filtering
    const logDate = new Date(log.changed_at)
    const now = new Date()
    let dateMatch = true
    
    switch (dateRange) {
      case '24hours':
        dateMatch = now.getTime() - logDate.getTime() <= 24 * 60 * 60 * 1000
        break
      case '7days':
        dateMatch = now.getTime() - logDate.getTime() <= 7 * 24 * 60 * 60 * 1000
        break
      case '30days':
        dateMatch = now.getTime() - logDate.getTime() <= 30 * 24 * 60 * 60 * 1000
        break
    }
    
    return matchesClient && matchesTable && matchesSearch && dateMatch
  })

  // Filter backups
  const filteredBackups = clientBackups.filter(backup => 
    selectedClient === 'all' || backup.client_id === selectedClient
  )

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-green-400 bg-green-400/10'
      case 'update': return 'text-blue-400 bg-blue-400/10'
      case 'delete': return 'text-red-400 bg-red-400/10'
      case 'backup': return 'text-purple-400 bg-purple-400/10'
      case 'restore': return 'text-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10'
      case 'in_progress': return 'text-blue-400 bg-blue-400/10'
      case 'failed': return 'text-red-400 bg-red-400/10'
      case 'corrupted': return 'text-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTables = () => {
    const tables = new Set(dataChangeLogs.map(log => log.table_name))
    return Array.from(tables)
  }

  const getChangeLogStats = () => {
    const total = filteredChangeLogs.length
    const creates = filteredChangeLogs.filter(log => log.change_type === 'create').length
    const updates = filteredChangeLogs.filter(log => log.change_type === 'update').length
    const deletes = filteredChangeLogs.filter(log => log.change_type === 'delete').length
    const rollbackAvailable = filteredChangeLogs.filter(log => log.rollback_available).length
    
    return { total, creates, updates, deletes, rollbackAvailable }
  }

  const getBackupStats = () => {
    const total = filteredBackups.length
    const completed = filteredBackups.filter(b => b.status === 'completed').length
    const failed = filteredBackups.filter(b => b.status === 'failed').length
    const totalSize = filteredBackups.reduce((sum, b) => sum + b.file_size, 0)
    const totalRecords = filteredBackups.reduce((sum, b) => sum + b.records_count, 0)
    
    return { total, completed, failed, totalSize, totalRecords }
  }

  const stats = getChangeLogStats()
  const backupStats = getBackupStats()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Data Audit & Protection</h2>
          <p className="text-gray-300">Complete tracking of all data changes to ensure zero data loss</p>
        </div>
        
        <div className="flex space-x-4">
          {['changes', 'backups', 'recovery', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Changes</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <DocumentDuplicateIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 bg-gradient-to-br from-green-600/20 to-blue-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Completed Backups</p>
              <p className="text-2xl font-bold text-white">{backupStats.completed}</p>
            </div>
            <CloudArrowUpIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Rollback Available</p>
              <p className="text-2xl font-bold text-white">{stats.rollbackAvailable}</p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 bg-gradient-to-br from-orange-600/20 to-red-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-white">{backupStats.totalRecords.toLocaleString()}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search changes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.salon_name}</option>
            ))}
          </select>

          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Tables</option>
            {getTables().map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'changes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Change Log List */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Change Log</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredChangeLogs.map((log) => (
                <motion.div
                  key={log.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedLog(log)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedLog?.id === log.id
                      ? 'bg-purple-600/30 border border-purple-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${getChangeTypeColor(log.change_type)}`}>
                          {log.change_type}
                        </span>
                        <span className="text-white font-medium">{log.table_name}</span>
                        {log.rollback_available && (
                          <ArrowPathIcon className="w-4 h-4 text-green-400" title="Rollback Available" />
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{log.reason}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>By: {log.changed_by}</span>
                        <span>{new Date(log.changed_at).toLocaleString()}</span>
                        <span>Record: {log.record_id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Change Details */}
          <div className="lg:col-span-1 glass-card p-6">
            {selectedLog ? (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Change Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Change Type</label>
                    <div className={`px-3 py-1 rounded text-sm w-fit ${getChangeTypeColor(selectedLog.change_type)}`}>
                      {selectedLog.change_type}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Table</label>
                    <p className="text-white">{selectedLog.table_name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Record ID</label>
                    <p className="text-white font-mono text-sm">{selectedLog.record_id}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Changed By</label>
                    <p className="text-white">{selectedLog.changed_by}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Timestamp</label>
                    <p className="text-white">{new Date(selectedLog.changed_at).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">IP Address</label>
                    <p className="text-white">{selectedLog.ip_address}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Reason</label>
                    <p className="text-white">{selectedLog.reason}</p>
                  </div>

                  {/* Old Values */}
                  {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400">Previous Values</label>
                      <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-lg">
                        <pre className="text-xs text-gray-300 overflow-auto">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* New Values */}
                  {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                    <div>
                      <label className="text-sm text-gray-400">New Values</label>
                      <div className="p-3 bg-green-600/10 border border-green-500/20 rounded-lg">
                        <pre className="text-xs text-gray-300 overflow-auto">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/20">
                    {selectedLog.rollback_available && (
                      <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors mb-2">
                        Rollback Change
                      </button>
                    )}
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      View Full History
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <DocumentDuplicateIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a change log to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Client Data Backups</h3>
          <div className="grid gap-4">
            {filteredBackups.map((backup) => (
              <motion.div
                key={backup.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-white">
                        {clients.find(c => c.id === backup.client_id)?.salon_name || 'Unknown Client'}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs ${getBackupStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getChangeTypeColor(backup.backup_type)}`}>
                        {backup.backup_type}
                      </span>
                      {backup.encryption_status === 'encrypted' && (
                        <LockClosedIcon className="w-4 h-4 text-green-400" title="Encrypted" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="text-gray-300">Size:</span> {formatBytes(backup.file_size)}
                      </div>
                      <div>
                        <span className="text-gray-300">Records:</span> {backup.records_count.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-300">Created:</span> {new Date(backup.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-300">Retention:</span> {new Date(backup.retention_until).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Tables: {backup.tables_included.join(', ')}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {backup.status === 'completed' && (
                      <>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                          Download
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                          Test Restore
                        </button>
                        <button className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm">
                          Restore
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recovery' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Recovery Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Point-in-Time Recovery</h4>
                <p className="text-gray-300 text-sm mb-4">Restore data to any specific point in time using change logs.</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  Start Recovery
                </button>
              </div>
              
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-medium text-blue-400 mb-2">Backup Restoration</h4>
                <p className="text-gray-300 text-sm mb-4">Restore from complete backup files with data validation.</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Browse Backups
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recovery Test Results</h3>
            <div className="space-y-3">
              {filteredBackups.filter(b => b.restore_tested).map((backup) => (
                <div key={backup.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">
                        {clients.find(c => c.id === backup.client_id)?.salon_name}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Backup tested successfully - Estimated restore time: {backup.restore_time_estimate} minutes
                      </p>
                    </div>
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Change Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-400">Creates</span>
                  <span className="text-white font-medium">{stats.creates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">Updates</span>
                  <span className="text-white font-medium">{stats.updates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400">Deletes</span>
                  <span className="text-white font-medium">{stats.deletes}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Backup Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-400">Completed</span>
                  <span className="text-white font-medium">{backupStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-400">Failed</span>
                  <span className="text-white font-medium">{backupStats.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400">Total Size</span>
                  <span className="text-white font-medium">{formatBytes(backupStats.totalSize)}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Data Protection Score</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
                <p className="text-gray-300 text-sm">Excellent data protection coverage</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 