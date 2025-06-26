import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  InboxIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  LinkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { CommunicationThread, FeedbackItem, CommunicationMetrics, ThreadMessage } from '../../../types/saas'

interface CommunicationCenterTabProps {
  communicationThreads: CommunicationThread[]
  feedbackItems: FeedbackItem[]
  communicationMetrics: CommunicationMetrics
}

export function CommunicationCenterTab({ 
  communicationThreads, 
  feedbackItems, 
  communicationMetrics 
}: CommunicationCenterTabProps) {
  const [activeTab, setActiveTab] = useState<'threads' | 'feedback' | 'metrics'>('threads')
  const [selectedThread, setSelectedThread] = useState<CommunicationThread | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const filteredThreads = communicationThreads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.messages.some(msg => msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || thread.status === filterStatus
    const matchesPriority = filterPriority === 'all' || thread.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedThread) {
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10'
      case 'high': return 'text-orange-400 bg-orange-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-400/10'
      case 'in_progress': return 'text-yellow-400 bg-yellow-400/10'
      case 'resolved': return 'text-green-400 bg-green-400/10'
      case 'closed': return 'text-gray-400 bg-gray-400/10'
      case 'escalated': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Communication Center</h2>
          <p className="text-gray-300">Manage all client communications, feedback, and support interactions</p>
        </div>
        
        <div className="flex space-x-4">
          {['threads', 'feedback', 'metrics'].map((tab) => (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Open Threads</p>
              <p className="text-2xl font-bold text-white">{communicationMetrics.open_threads}</p>
            </div>
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400" />
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
              <p className="text-gray-300 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-white">{communicationMetrics.avg_response_time}h</p>
            </div>
            <ClockIcon className="w-8 h-8 text-green-400" />
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
              <p className="text-gray-300 text-sm">Satisfaction Score</p>
              <p className="text-2xl font-bold text-white">{communicationMetrics.satisfaction_score}/5</p>
            </div>
            <StarIcon className="w-8 h-8 text-purple-400" />
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
              <p className="text-gray-300 text-sm">Total Threads</p>
              <p className="text-2xl font-bold text-white">{communicationMetrics.total_threads}</p>
            </div>
            <InboxIcon className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            New Thread
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'threads' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-1 glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Communication Threads</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredThreads.map((thread) => (
                <motion.div
                  key={thread.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedThread?.id === thread.id
                      ? 'bg-purple-600/30 border border-purple-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white text-sm truncate">{thread.subject}</h4>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(thread.priority)}`}>
                        {thread.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{thread.messages.length} messages</span>
                    <span className={`px-2 py-1 rounded ${getStatusColor(thread.status)}`}>
                      {thread.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>Client: {thread.client_id}</span>
                    <span>{new Date(thread.updated_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Thread Detail */}
          <div className="lg:col-span-2 glass-card p-6">
            {selectedThread ? (
              <div className="h-full flex flex-col">
                <div className="border-b border-white/20 pb-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedThread.subject}</h3>
                      <p className="text-gray-300 text-sm mt-1">Thread #{selectedThread.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedThread.priority)}`}>
                        {selectedThread.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedThread.status)}`}>
                        {selectedThread.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>Type: {selectedThread.thread_type}</span>
                    <span>Created: {new Date(selectedThread.created_at).toLocaleDateString()}</span>
                    {selectedThread.assigned_to && <span>Assigned: {selectedThread.assigned_to}</span>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.sender_type === 'client'
                          ? 'bg-blue-600/20 ml-8'
                          : message.sender_type === 'admin'
                          ? 'bg-purple-600/20 mr-8'
                          : 'bg-gray-600/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{message.sender_name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{message.message}</p>
                      {message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 text-sm text-blue-400">
                              <LinkIcon className="w-4 h-4" />
                              <span>{attachment.filename}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a thread to view conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Feedback Items */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Feedback Items</h3>
            <div className="grid gap-4">
              {filteredFeedback.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Type: {item.feedback_type}</span>
                        <span>Category: {item.category}</span>
                        <span>Votes: {item.votes}</span>
                        <span>Effort: {item.estimated_effort}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      {item.target_version && (
                        <div className="text-xs text-purple-400 mt-1">
                          Target: v{item.target_version}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Communication Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Thread Distribution</h3>
              <div className="space-y-3">
                {Object.entries(communicationMetrics.threads_by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {Object.entries(communicationMetrics.threads_by_priority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className={`capitalize ${getPriorityColor(priority).split(' ')[0]}`}>
                      {priority}
                    </span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Message Volume Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Message Volume</h3>
            <div className="h-64 flex items-end space-x-2">
              {communicationMetrics.daily_message_volume.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t"
                    style={{ height: `${(day.count / Math.max(...communicationMetrics.daily_message_volume.map(d => d.count))) * 200}px` }}
                  />
                  <span className="text-xs text-gray-400 mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 