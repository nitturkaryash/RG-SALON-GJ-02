import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { SalonClient, SupportTicket } from '../../../types/saas'

interface SupportTicketsTabProps {
  clients: SalonClient[]
  supportTickets: SupportTicket[]
  isLoading: boolean
}

export function SupportTicketsTab({ clients, supportTickets, isLoading }: SupportTicketsTabProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

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

  const openTickets = supportTickets.filter(t => t.status === 'open').length
  const inProgressTickets = supportTickets.filter(t => t.status === 'in_progress').length
  const resolvedTickets = supportTickets.filter(t => t.status === 'resolved').length
  const criticalTickets = supportTickets.filter(t => t.priority === 'critical').length

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
          <p className="text-white/60">Manage and track customer support requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Ticket</span>
        </button>
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
              <h3 className="text-sm font-medium text-white/60">Open Tickets</h3>
              <p className="text-2xl font-bold text-white mt-1">{openTickets}</p>
              <p className="text-xs text-white/40 mt-1">Awaiting response</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400">
              <TicketIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">In Progress</h3>
              <p className="text-2xl font-bold text-white mt-1">{inProgressTickets}</p>
              <p className="text-xs text-white/40 mt-1">Being worked on</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
              <ClockIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Resolved</h3>
              <p className="text-2xl font-bold text-white mt-1">{resolvedTickets}</p>
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
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Critical</h3>
              <p className="text-2xl font-bold text-white mt-1">{criticalTickets}</p>
              <p className="text-xs text-white/40 mt-1">High priority</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400">
              <ExclamationTriangleIcon className="w-6 h-6" />
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
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Support Tickets ({filteredTickets.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Ticket</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Client</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Priority</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Assigned To</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Created</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTickets.map((ticket, index) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{ticket.title}</p>
                      <p className="text-white/60 text-sm">{ticket.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{ticket.client_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      ticket.status === 'open' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{ticket.assigned_to}</td>
                  <td className="px-4 py-3 text-white/60">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket)
                        setShowTicketModal(true)
                      }}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1 rounded"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => {
            setShowTicketModal(false)
            setSelectedTicket(null)
          }}
          onUpdate={(updatedTicket) => {
            toast.success('Ticket updated successfully')
            setShowTicketModal(false)
            setSelectedTicket(null)
          }}
        />
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onCreate={(newTicket) => {
            toast.success('Support ticket created successfully')
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function TicketDetailsModal({ ticket, onClose, onUpdate }: any) {
  const [status, setStatus] = useState(ticket.status)
  const [priority, setPriority] = useState(ticket.priority)
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to)
  const [response, setResponse] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Ticket Details - #{ticket.id}</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{ticket.title}</h3>
              <p className="text-white/60">{ticket.description}</p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Add Response</h4>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Ticket Properties */}
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Assigned To</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm mb-1">Client: {ticket.client_name}</p>
              <p className="text-white/60 text-sm mb-1">Category: {ticket.category}</p>
              <p className="text-white/60 text-sm mb-1">Created: {new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
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
            onClick={() => onUpdate({ ...ticket, status, priority, assigned_to: assignedTo })}
            className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30"
          >
            Update Ticket
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function CreateTicketModal({ clients, onClose, onCreate }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('general')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Support Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a client</option>
              {clients.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.salon_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Detailed description of the issue or request"
            />
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
            onClick={() => onCreate({ title, description, client_id: clientId, priority, category })}
            disabled={!title || !clientId || !description}
            className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Ticket
          </button>
        </div>
      </motion.div>
    </div>
  )
} 