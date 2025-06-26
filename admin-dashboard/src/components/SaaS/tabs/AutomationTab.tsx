import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CogIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { AutomationWorkflow } from '../../../types/saas'

interface AutomationTabProps {
  workflows: AutomationWorkflow[]
  isLoading: boolean
}

export function AutomationTab({ workflows, isLoading }: AutomationTabProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

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

  const activeWorkflows = workflows.filter(w => w.is_active).length
  const totalExecutions = workflows.reduce((sum, w) => sum + w.execution_count, 0)
  const avgSuccessRate = workflows.length > 0 
    ? workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length
    : 0

  const filteredWorkflows = workflows.filter(workflow => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'active') return workflow.is_active
    if (filterStatus === 'inactive') return !workflow.is_active
    return true
  })

  const handleToggleWorkflow = () => {
    toast.success('Workflow status updated')
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'schedule': return ClockIcon
      case 'event': return BoltIcon
      case 'condition': return AdjustmentsHorizontalIcon
      case 'webhook': return CogIcon
      default: return CogIcon
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'email': return EnvelopeIcon
      case 'webhook': return CogIcon
      case 'backup': return DocumentTextIcon
      case 'notification': return BoltIcon
      default: return CogIcon
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Automation Center</h2>
          <p className="text-white/60">Create and manage automated workflows and processes</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Workflows</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Workflow</span>
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
              <h3 className="text-sm font-medium text-white/60">Total Workflows</h3>
              <p className="text-2xl font-bold text-white mt-1">{workflows.length}</p>
              <p className="text-xs text-white/40 mt-1">{activeWorkflows} active</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
              <CogIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Total Executions</h3>
              <p className="text-2xl font-bold text-white mt-1">{totalExecutions.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400">
              <PlayIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Success Rate</h3>
              <p className="text-2xl font-bold text-white mt-1">{avgSuccessRate.toFixed(1)}%</p>
              <p className="text-xs text-white/40 mt-1">Average across all workflows</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400">
              <CheckCircleIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Active Now</h3>
              <p className="text-2xl font-bold text-white mt-1">{activeWorkflows}</p>
              <p className="text-xs text-white/40 mt-1">Running workflows</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400">
              <BoltIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Workflow Templates */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <h4 className="text-white font-medium">Welcome Email Series</h4>
            </div>
            <p className="text-white/60 text-sm">Automatically send welcome emails to new clients</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
              <h4 className="text-white font-medium">Daily Backup</h4>
            </div>
            <p className="text-white/60 text-sm">Schedule automatic daily backups for all clients</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
              <h4 className="text-white font-medium">Alert on Errors</h4>
            </div>
            <p className="text-white/60 text-sm">Get notified when client systems have issues</p>
          </motion.div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          All Workflows ({filteredWorkflows.length})
        </h3>
        <div className="space-y-4">
          {filteredWorkflows.map((workflow, index) => {
            const TriggerIcon = getTriggerIcon(workflow.trigger_type)
            const primaryAction = workflow.actions[0]
            const ActionIcon = primaryAction ? getActionIcon(primaryAction.type) : CogIcon

            return (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${workflow.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        <TriggerIcon className="w-5 h-5" />
                      </div>
                      <div className="text-white/60">→</div>
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <ActionIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{workflow.name}</h4>
                      <p className="text-white/60 text-sm mt-1">{workflow.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-white/40 text-xs">
                          {workflow.execution_count} executions
                        </span>
                        <span className="text-white/40 text-xs">
                          {workflow.success_rate.toFixed(1)}% success rate
                        </span>
                        {workflow.last_executed && (
                          <span className="text-white/40 text-xs">
                            Last run: {new Date(workflow.last_executed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </div>
                    <button
                      onClick={() => handleToggleWorkflow()}
                      className={`p-2 rounded-lg transition-colors ${
                        workflow.is_active
                          ? 'text-white/60 hover:text-orange-400 hover:bg-white/10'
                          : 'text-white/60 hover:text-green-400 hover:bg-white/10'
                      }`}
                      title={workflow.is_active ? 'Pause workflow' : 'Start workflow'}
                    >
                      {workflow.is_active ? (
                        <PauseIcon className="w-4 h-4" />
                      ) : (
                        <PlayIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Execution History */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Executions</h3>
          <ChartBarIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-3">
          {[
            { workflow: 'Welcome Email Series', status: 'success', time: '2 minutes ago', duration: '1.2s' },
            { workflow: 'Daily Backup', status: 'success', time: '1 hour ago', duration: '45.6s' },
            { workflow: 'Alert on Errors', status: 'failed', time: '3 hours ago', duration: '0.8s' },
            { workflow: 'Client Sync', status: 'success', time: '6 hours ago', duration: '12.3s' },
            { workflow: 'Weekly Report', status: 'success', time: '1 day ago', duration: '8.7s' },
          ].map((execution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  execution.status === 'success' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {execution.status === 'success' ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-white font-medium">{execution.workflow}</span>
                  <p className="text-white/60 text-sm">Completed in {execution.duration}</p>
                </div>
              </div>
              <span className="text-white/60 text-sm">{execution.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 