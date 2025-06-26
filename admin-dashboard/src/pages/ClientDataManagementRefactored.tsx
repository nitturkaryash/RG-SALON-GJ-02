import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  XCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ServerIcon,
  UserPlusIcon,
  BanknotesIcon,
  BellIcon,
  CpuChipIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Import types and hooks
import { SalonClient, SaaSOverviewData } from '../types/saas'
import { useSaaSData } from '../hooks/useSaaSData'

// Import tab components
import {
  SessionTrackingTab,
  ClientManagementTab,
  SaaSOverviewTab,
  DataManagementTab,
  AdvancedAnalyticsTab,
  BackupManagementTab,
  SecurityCenterTab,
  SupportTicketsTab,
  BillingManagementTab,
  PlatformSettingsTab,
  NotificationCenterTab,
  APIUsageTab,
  AutomationTab
} from '../components/SaaS/tabs'

export default function ClientDataManagementRefactored() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<SalonClient | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)

  // Use the custom hook for data fetching
  const { data, isLoading, error } = useSaaSData()

  const handleClientAction = (action: string, client: SalonClient) => {
    setSelectedClient(client)
    
    switch (action) {
      case 'view':
        // Handle view client details
        toast.success(`Viewing details for ${client.salon_name}`)
        break
      case 'reset-password':
        setShowPasswordModal(true)
        toast.success(`Password reset initiated for ${client.salon_name}`)
        break
      case 'view-sessions':
        setShowSessionModal(true)
        break
      case 'view-data':
        setShowDataModal(true)
        break
      case 'view-analytics':
        setShowAnalyticsModal(true)
        break
      case 'view-backups':
        setShowBackupModal(true)
        break
      default:
        break
    }
  }

  // Default values for type safety
  const defaultSecuritySettings = {
    mfa_enabled: true,
    sso_enabled: true,
    password_policy_enabled: true,
    ip_whitelist_enabled: false,
    rate_limiting_enabled: true,
    ddos_protection: true,
    session_monitoring: true,
    anomaly_detection: true,
    realtime_alerts: true,
    audit_logging: true,
    gdpr_compliance: true,
    soc2_compliance: true,
  }

  const defaultPlatformSettings = {
    trial_period_days: 30,
    default_subscription_plan: 'basic' as const,
    max_users_per_client: 50,
    storage_limit_gb: 100,
    api_rate_limit: 1000,
    backup_retention_days: 90,
    session_timeout_minutes: 60,
    password_reset_expiry_hours: 24,
    support_email: 'support@saas-platform.com',
    maintenance_mode: false,
  }

  const tabs = [
    { id: 'overview', name: 'Overview Dashboard', icon: ChartBarIcon },
    { id: 'clients', name: 'Client Management', icon: UsersIcon },
    { id: 'sessions', name: 'Session Tracking', icon: GlobeAltIcon },
    { id: 'data', name: 'Data Management', icon: ServerIcon },
    { id: 'analytics', name: 'Advanced Analytics', icon: ChartBarIcon },
    { id: 'backups', name: 'Backup Management', icon: DocumentArrowDownIcon },
    { id: 'security', name: 'Security Center', icon: ShieldCheckIcon },
    { id: 'support', name: 'Support Tickets', icon: UserPlusIcon },
    { id: 'billing', name: 'Billing Management', icon: BanknotesIcon },
    { id: 'settings', name: 'Platform Settings', icon: CogIcon },
    { id: 'notifications', name: 'Notification Center', icon: BellIcon },
    { id: 'api', name: 'API Usage Analytics', icon: CpuChipIcon },
    { id: 'automation', name: 'Automation Center', icon: BoltIcon },
  ]

  const renderTabContent = () => {
    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400">Error loading data: {error.message}</p>
        </div>
      )
    }

         switch (activeTab) {
       case 'overview':
         return <SaaSOverviewTab data={data} isLoading={isLoading} />
         
       case 'clients':
         return (
           <ClientManagementTab
             clients={data?.clients || []}
             isLoading={isLoading}
             onClientAction={handleClientAction}
             onCreateClient={() => setShowCreateModal(true)}
             searchTerm={searchTerm}
             setSearchTerm={setSearchTerm}
           />
         )
         
       case 'sessions':
         return (
           <SessionTrackingTab 
             sessions={data?.sessions || []} 
             isLoading={isLoading} 
           />
         )
         
                case 'data':
         return <DataManagementTab clientData={data?.clientData || []} isLoading={isLoading} />
        
      case 'analytics':
        return <AdvancedAnalyticsTab 
          clients={data?.clients || []} 
          analytics={data?.analytics || {}}
          isLoading={isLoading} 
        />
        
      case 'backups':
        return <BackupManagementTab 
          clients={data?.clients || []} 
          backups={data?.backups || []}
          isLoading={isLoading} 
        />
        
      case 'security':
        return <SecurityCenterTab 
          clients={data?.clients || []} 
          securityIncidents={data?.securityIncidents || []}
          securitySettings={data?.securitySettings || defaultSecuritySettings}
          isLoading={isLoading} 
        />
        
      case 'support':
        return <SupportTicketsTab 
          clients={data?.clients || []}
          supportTickets={data?.supportTickets || []}
          isLoading={isLoading} 
        />
        
      case 'billing':
        return <BillingManagementTab 
          clients={data?.clients || []}
          billingRecords={data?.billingRecords || []}
          isLoading={isLoading} 
        />
        
      case 'settings':
        return <PlatformSettingsTab 
          platformSettings={data?.platformSettings || defaultPlatformSettings}
          isLoading={isLoading} 
        />
        
      case 'notifications':
        return <NotificationCenterTab 
          notifications={data?.notifications || []}
          isLoading={isLoading} 
        />
        
      case 'api':
        return <APIUsageTab 
          clients={data?.clients || []}
          apiUsage={data?.apiUsage || []}
          isLoading={isLoading} 
        />
        
      case 'automation':
        return <AutomationTab 
          workflows={data?.automationWorkflows || []}
          isLoading={isLoading} 
        />
        
             default:
         return <SaaSOverviewTab data={data} isLoading={isLoading} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Enterprise SaaS Management Center
              </h1>
              <p className="text-white/60 mt-2">
                Complete multi-tenant platform with advanced analytics, security, and automation
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{data?.systemOverview?.totalClients || 0} Active Clients</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{data?.systemOverview?.activeSessions || 0} Live Sessions</span>
              </div>
              <button className="glass-button px-4 py-2 hover-glow flex items-center space-x-2">
                <UserPlusIcon className="w-4 h-4" />
                <span>Add New Client</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-card overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b-2 border-blue-400'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Modals */}
        {showPasswordModal && selectedClient && (
          <PasswordResetModal
            client={selectedClient}
            onClose={() => {
              setShowPasswordModal(false)
              setSelectedClient(null)
            }}
            onSuccess={() => {
              toast.success('Password reset successfully!')
              setShowPasswordModal(false)
              setSelectedClient(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Simple modal components - these would also be moved to separate files in a real app
function PasswordResetModal({ client, onClose, onSuccess }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Reset Password</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white/80 mb-4">
            Reset password for <span className="font-semibold text-white">{client.salon_name}</span>?
          </p>
          <p className="text-white/60 text-sm">
            A new temporary password will be sent to {client.email}
          </p>
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
            className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30"
          >
            Reset Password
          </button>
        </div>
      </motion.div>
    </div>
  )
} 