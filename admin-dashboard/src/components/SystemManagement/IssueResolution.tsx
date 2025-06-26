import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

interface Issue {
  id: number
  title: string
  severity: 'critical' | 'warning' | 'info'
  affectedUsers: number
  reportedAt: string
  status: 'open' | 'investigating' | 'resolving' | 'resolved'
}

interface Props {
  data: Issue[]
  isLoading: boolean
}

export default function IssueResolution({ data, isLoading }: Props) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const severityColors = {
    critical: 'text-red-400 bg-red-500/20 border-red-500/30',
    warning: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    info: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  }

  const statusColors = {
    open: 'text-red-400 bg-red-500/20',
    investigating: 'text-orange-400 bg-orange-500/20',
    resolving: 'text-blue-400 bg-blue-500/20',
    resolved: 'text-green-400 bg-green-500/20',
  }

  const filteredIssues = data?.filter(issue => 
    filterStatus === 'all' || issue.status === filterStatus
  ) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
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
      {/* Issue Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4"
      >
        <div className="flex flex-wrap gap-2">
          {['all', 'open', 'investigating', 'resolving', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'glass-button text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Issues List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Active Issues</h3>
        
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedIssue(issue)}
                className="p-4 glass rounded-lg cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-medium">{issue.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${severityColors[issue.severity]}`}>
                        {issue.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{issue.affectedUsers} users affected</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(issue.reportedAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                  <WrenchScrewdriverIcon className="w-5 h-5 text-white/60" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-white/60">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>No issues found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedIssue(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Issue Details</h3>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">{selectedIssue.title}</h4>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 text-sm rounded-full border ${severityColors[selectedIssue.severity]}`}>
                    {selectedIssue.severity}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${statusColors[selectedIssue.status]}`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Affected Users</label>
                  <div className="text-white font-medium">{selectedIssue.affectedUsers}</div>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-1">Reported At</label>
                  <div className="text-white font-medium">
                    {new Date(selectedIssue.reportedAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="glass-button px-4 py-2 hover-glow">
                  Mark as Resolved
                </button>
                <button className="glass px-4 py-2 text-white/80 hover:text-white">
                  Escalate
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 