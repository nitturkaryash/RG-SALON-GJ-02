import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { SalonClient, BillingRecord } from '../../../types/saas'

interface BillingManagementTabProps {
  clients: SalonClient[]
  billingRecords: BillingRecord[]
  isLoading: boolean
}

export function BillingManagementTab({ clients, billingRecords, isLoading }: BillingManagementTabProps) {
  const [selectedClient, setSelectedClient] = useState<SalonClient | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState('30d')

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

  const totalRevenue = billingRecords.reduce((sum, record) => sum + record.amount, 0)
  const pendingAmount = billingRecords.filter(r => r.status === 'pending').reduce((sum, record) => sum + record.amount, 0)
  const overdueAmount = billingRecords.filter(r => r.status === 'overdue').reduce((sum, record) => sum + record.amount, 0)
  const paidRecords = billingRecords.filter(r => r.status === 'paid').length

  const filteredRecords = billingRecords.filter(record => {
    const client = clients.find(c => c.id === record.client_id)
    const matchesSearch = client?.salon_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Billing Management</h2>
          <p className="text-white/60">Track revenue, invoices, and payment processing</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
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
              Detailed
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
              <h3 className="text-sm font-medium text-white/60">Total Revenue</h3>
              <p className="text-2xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400">
              <CurrencyDollarIcon className="w-6 h-6" />
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
              <h3 className="text-sm font-medium text-white/60">Pending</h3>
              <p className="text-2xl font-bold text-white mt-1">${pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-1">Awaiting payment</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400">
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
              <h3 className="text-sm font-medium text-white/60">Overdue</h3>
              <p className="text-2xl font-bold text-white mt-1">${overdueAmount.toLocaleString()}</p>
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
              <h3 className="text-sm font-medium text-white/60">Paid Invoices</h3>
              <p className="text-2xl font-bold text-white mt-1">{paidRecords}</p>
              <p className="text-xs text-white/40 mt-1">This month</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {viewMode === 'overview' ? (
        <BillingOverview 
          clients={clients}
          billingRecords={billingRecords}
        />
      ) : (
        <DetailedBillingManagement
          clients={clients}
          billingRecords={filteredRecords}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
    </div>
  )
}

function BillingOverview({ 
  clients, 
  billingRecords 
}: {
  clients: SalonClient[]
  billingRecords: BillingRecord[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
          <ChartBarIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="h-64 flex items-end justify-between space-x-2">
          {[8500, 12300, 9800, 15600, 11200, 18900, 22100].map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${(value / 22100) * 100}%` }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-t from-green-500/30 to-green-400/60 rounded-t-lg flex-1 min-h-[20px] relative group"
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                ${value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-white/60 text-sm">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>

      {/* Subscription Distribution */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
          <CreditCardIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          <SubscriptionPlanBar 
            plan="Enterprise" 
            count={clients.filter(c => c.subscription_plan === 'enterprise').length}
            revenue={45000}
            color="purple"
          />
          <SubscriptionPlanBar 
            plan="Premium" 
            count={clients.filter(c => c.subscription_plan === 'premium').length}
            revenue={28000}
            color="blue"
          />
          <SubscriptionPlanBar 
            plan="Pro" 
            count={clients.filter(c => c.subscription_plan === 'pro').length}
            revenue={18000}
            color="green"
          />
          <SubscriptionPlanBar 
            plan="Basic" 
            count={clients.filter(c => c.subscription_plan === 'basic').length}
            revenue={8000}
            color="orange"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <DocumentTextIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-3">
          {billingRecords.slice(0, 6).map((record, index) => {
            const client = clients.find(c => c.id === record.client_id)
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    record.status === 'paid' ? 'bg-green-500/20' :
                    record.status === 'pending' ? 'bg-yellow-500/20' :
                    record.status === 'overdue' ? 'bg-red-500/20' : 'bg-gray-500/20'
                  }`}>
                    <CreditCardIcon className={`w-4 h-4 ${
                      record.status === 'paid' ? 'text-green-400' :
                      record.status === 'pending' ? 'text-yellow-400' :
                      record.status === 'overdue' ? 'text-red-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{client?.salon_name || 'Unknown Client'}</p>
                    <p className="text-white/60 text-sm">{record.billing_period}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${record.amount.toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                    record.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    record.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {record.status}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
          <CreditCardIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          <PaymentMethodItem method="Credit Card" count={35} percentage={70} color="blue" />
          <PaymentMethodItem method="Bank Transfer" count={12} percentage={24} color="green" />
          <PaymentMethodItem method="PayPal" count={3} percentage={6} color="purple" />
        </div>
      </div>
    </div>
  )
}

function DetailedBillingManagement({
  clients,
  billingRecords,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter
}: {
  clients: SalonClient[]
  billingRecords: BillingRecord[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (filter: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search by client name..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={() => toast.success('Billing report exported')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Billing Records Table */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Records ({billingRecords.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Client</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Period</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Payment Method</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Invoice Date</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Due Date</th>
                <th className="px-4 py-3 text-left text-white/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {billingRecords.map((record, index) => {
                const client = clients.find(c => c.id === record.client_id)
                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {client?.salon_name || 'Unknown Client'}
                    </td>
                    <td className="px-4 py-3 text-white">
                      ${record.amount.toLocaleString()} {record.currency}
                    </td>
                    <td className="px-4 py-3 text-white">{record.billing_period}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        record.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        record.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{record.payment_method}</td>
                    <td className="px-4 py-3 text-white/60">
                      {new Date(record.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {new Date(record.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toast.success('Invoice downloaded')}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                          title="Download Invoice"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        {record.status === 'overdue' && (
                          <button
                            onClick={() => toast.success('Payment reminder sent')}
                            className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded"
                            title="Send Reminder"
                          >
                            <ClockIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SubscriptionPlanBar({ plan, count, revenue, color }: any) {
  const maxRevenue = 45000
  const percentage = (revenue / maxRevenue) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{plan}</span>
        <div className="text-right">
          <span className="text-white font-semibold">${revenue.toLocaleString()}</span>
          <span className="text-white/60 text-sm ml-2">({count} clients)</span>
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={`h-2 rounded-full bg-${color}-500`}
        />
      </div>
    </div>
  )
}

function PaymentMethodItem({ method, count, percentage, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <CreditCardIcon className={`w-4 h-4 text-${color}-400`} />
        </div>
        <span className="text-white">{method}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-white/60 text-sm">{count} clients</span>
        <div className="w-16 bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-${color}-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-white font-medium w-8">{percentage}%</span>
      </div>
    </div>
  )
} 