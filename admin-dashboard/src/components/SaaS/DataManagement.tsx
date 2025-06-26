import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ServerIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ClientData {
  id: string
  client_id: string
  table_name: string
  record_count: number
  data_size: string
  last_updated: string
  sync_status: 'synced' | 'pending' | 'error'
  backup_status: 'backed_up' | 'pending' | 'failed'
}

interface Props {
  clientData: ClientData[]
  isLoading: boolean
}

export default function DataManagement({ clientData, isLoading }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'pending' | 'error'>('all')
  const [selectedData, setSelectedData] = useState<ClientData | null>(null)

  const filteredData = clientData.filter(data => {
    const matchesSearch = data.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.client_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || data.sync_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return CheckCircleIcon
      case 'pending': return ExclamationTriangleIcon
      case 'error': return XCircleIcon
      default: return CheckCircleIcon
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'backed_up': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-white'
    }
  }

  const handleSync = (data: ClientData) => {
    toast.success(`Syncing ${data.table_name} data...`)
  }

  const handleBackup = (data: ClientData) => {
    toast.success(`Creating backup for ${data.table_name}...`)
  }

  const handleExport = (data: ClientData) => {
    toast.success(`Exporting ${data.table_name} data...`)
  }

  const formatFileSize = (size: string) => {
    return size
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
      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Tables</p>
              <p className="text-2xl font-bold text-blue-400">{clientData.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/20">
              <TableCellsIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-green-400">
                {clientData.reduce((acc, data) => acc + data.record_count, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500/20">
              <DocumentTextIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Synced Tables</p>
              <p className="text-2xl font-bold text-purple-400">
                {clientData.filter(d => d.sync_status === 'synced').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-500/20">
              <CheckCircleIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Pending Syncs</p>
              <p className="text-2xl font-bold text-yellow-400">
                {clientData.filter(d => d.sync_status === 'pending').length}
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
                placeholder="Search tables..."
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
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success('Syncing all tables...')}
              className="glass-button px-4 py-2 hover-glow flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Sync All</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Table Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Data Metrics
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Sync Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Backup Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredData.map((data, index) => {
                const SyncIcon = getSyncStatusIcon(data.sync_status)
                return (
                  <motion.tr
                    key={data.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <TableCellsIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{data.table_name}</p>
                          <p className="text-white/60 text-sm">Client: {data.client_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{data.record_count.toLocaleString()} records</p>
                        <p className="text-white/60">{formatFileSize(data.data_size)}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{getTimeAgo(data.last_updated)}</p>
                        <p className="text-white/60">{new Date(data.last_updated).toLocaleDateString()}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <SyncIcon className={`w-5 h-5 ${getSyncStatusColor(data.sync_status)}`} />
                        <span className={`text-sm font-medium capitalize ${getSyncStatusColor(data.sync_status)}`}>
                          {data.sync_status}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        data.backup_status === 'backed_up' 
                          ? 'bg-green-100 text-green-800' 
                          : data.backup_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {data.backup_status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedData(data)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                          title="View Data"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSync(data)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors duration-200"
                          title="Sync Now"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBackup(data)}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors duration-200"
                          title="Create Backup"
                        >
                          <CloudArrowUpIcon className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExport(data)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors duration-200"
                          title="Export Data"
                        >
                          <CloudArrowDownIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Details Modal */}
      {selectedData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Data Table Details</h2>
              <button
                onClick={() => setSelectedData(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Table Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Table Information</h3>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Table Name</span>
                    <span className="text-white font-mono">{selectedData.table_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Client ID</span>
                    <span className="text-white font-mono">{selectedData.client_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Record Count</span>
                    <span className="text-white">{selectedData.record_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Data Size</span>
                    <span className="text-white">{selectedData.data_size}</span>
                  </div>
                </div>

                {/* Sample Data Preview */}
                <h4 className="text-md font-semibold text-white">Sample Data</h4>
                <div className="glass-card p-4">
                  <div className="text-sm text-white/60 mb-3">
                    Showing sample records from {selectedData.table_name}
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 font-mono text-sm text-green-400">
                    <div className="space-y-1">
                      <div>id | name | created_at | status</div>
                      <div className="text-white/40">--- | ---- | ---------- | ------</div>
                      <div>001 | John Doe | 2024-01-20 | active</div>
                      <div>002 | Jane Smith | 2024-01-19 | active</div>
                      <div>003 | Mike Johnson | 2024-01-18 | inactive</div>
                      <div className="text-white/40">... +{(selectedData.record_count - 3).toLocaleString()} more records</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Operations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Status & Operations</h3>
                <div className="glass-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Last Updated</span>
                    <span className="text-white">{new Date(selectedData.last_updated).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Sync Status</span>
                    <span className={`font-medium capitalize ${getSyncStatusColor(selectedData.sync_status)}`}>
                      {selectedData.sync_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Backup Status</span>
                    <span className={`font-medium capitalize ${getBackupStatusColor(selectedData.backup_status)}`}>
                      {selectedData.backup_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Operations */}
                <h4 className="text-md font-semibold text-white">Available Operations</h4>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSync(selectedData)}
                    className="w-full glass-button p-3 flex items-center space-x-3"
                  >
                    <ArrowPathIcon className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Sync Data</div>
                      <div className="text-white/60 text-sm">Update table with latest changes</div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBackup(selectedData)}
                    className="w-full glass-button p-3 flex items-center space-x-3"
                  >
                    <CloudArrowUpIcon className="w-5 h-5 text-purple-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Create Backup</div>
                      <div className="text-white/60 text-sm">Generate backup copy of table</div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport(selectedData)}
                    className="w-full glass-button p-3 flex items-center space-x-3"
                  >
                    <CloudArrowDownIcon className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="text-white font-medium">Export Data</div>
                      <div className="text-white/60 text-sm">Download table as CSV/JSON</div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-white/20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedData(null)}
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