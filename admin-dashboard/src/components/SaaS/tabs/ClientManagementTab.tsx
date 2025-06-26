import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  KeyIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { SalonClient } from '../../../types/saas'

interface ClientManagementTabProps {
  clients: SalonClient[]
  isLoading: boolean
  onClientAction: (action: string, client: SalonClient) => void
  onCreateClient: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export function ClientManagementTab({ 
  clients, 
  isLoading, 
  onClientAction, 
  onCreateClient, 
  searchTerm, 
  setSearchTerm 
}: ClientManagementTabProps) {
  if (isLoading) return <div className="text-white">Loading clients...</div>
  
  const filteredClients = clients.filter((client) => 
    client.salon_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onCreateClient}
          className="glass-button px-4 py-2 hover-glow flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <motion.div 
            key={client.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{client.salon_name}</h3>
                <p className="text-white/60">{client.owner_name}</p>
                <p className="text-white/50 text-sm">{client.email}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                client.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' :
                client.subscription_status === 'trial' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {client.subscription_status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-white/60">Revenue:</span>
                <span className="text-white">${client.monthly_revenue.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Users:</span>
                <span className="text-white">{client.users_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Plan:</span>
                <span className="text-white capitalize">{client.subscription_plan}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onClientAction('view', client)}
                className="flex-1 glass-button py-2 text-sm flex items-center justify-center space-x-2"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => onClientAction('reset-password', client)}
                className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded"
                title="Reset Password"
              >
                <KeyIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 