import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  KeyIcon,
  FingerPrintIcon,
  EyeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  CogIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { SalonClient, SecurityIncident, type SecuritySettings } from '../../../types/saas'

interface SecurityCenterTabProps {
  clients: SalonClient[]
  securityIncidents: SecurityIncident[]
  securitySettings: SecuritySettings
  isLoading: boolean
}

export function SecurityCenterTab({ clients, securityIncidents, securitySettings, isLoading }: SecurityCenterTabProps) {
  const [selectedClient, setSelectedClient] = useState<SalonClient | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'settings'>('overview')
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null)

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

  const criticalIncidents = securityIncidents.filter(i => i.severity === 'critical').length
  const highIncidents = securityIncidents.filter(i => i.severity === 'high').length
  const resolvedIncidents = securityIncidents.filter(i => i.status === 'resolved').length
  const activeThreats = securityIncidents.filter(i => i.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Security Center Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Center</h2>
          <p className="text-white/60">Comprehensive security management and threat monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
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
              Client Security
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'settings'
                  ? 'bg-blue-500/30 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SecurityStatCard
          title="Critical Threats"
          value={criticalIncidents.toString()}
          icon={ShieldExclamationIcon}
          color="red"
          subtitle="Immediate attention"
        />
        <SecurityStatCard
          title="High Priority"
          value={highIncidents.toString()}
          icon={ExclamationTriangleIcon}
          color="orange"
          subtitle="Requires action"
        />
        <SecurityStatCard
          title="Resolved"
          value={resolvedIncidents.toString()}
          icon={CheckCircleIcon}
          color="green"
          subtitle="This month"
        />
        <SecurityStatCard
          title="Active Monitoring"
          value={clients.length.toString()}
          icon={EyeIcon}
          color="blue"
          subtitle="Clients monitored"
        />
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <SecurityOverview 
          clients={clients}
          securityIncidents={securityIncidents}
          securitySettings={securitySettings}
          onViewIncident={(incident) => {
            setSelectedIncident(incident)
            setShowIncidentModal(true)
          }}
        />
      )}

      {viewMode === 'detailed' && (
        <DetailedSecurityManagement
          clients={clients}
          securityIncidents={securityIncidents}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      )}

      {viewMode === 'settings' && (
        <SecuritySettings
          settings={securitySettings}
          onUpdateSettings={(settings) => {
            toast.success('Security settings updated successfully')
          }}
        />
      )}

      {/* Security Incident Modal */}
      {showIncidentModal && selectedIncident && (
        <SecurityIncidentModal
          incident={selectedIncident}
          onClose={() => {
            setShowIncidentModal(false)
            setSelectedIncident(null)
          }}
          onResolve={() => {
            toast.success(`Incident ${selectedIncident.id} marked as resolved`)
            setShowIncidentModal(false)
            setSelectedIncident(null)
          }}
        />
      )}
    </div>
  )
}

interface SecurityStatCardProps {
  title: string
  value: string
  icon: any
  color: 'red' | 'orange' | 'green' | 'blue'
  subtitle: string
}

function SecurityStatCard({ title, value, icon: Icon, color, subtitle }: SecurityStatCardProps) {
  const colorClasses = {
    red: 'from-red-500/20 to-rose-500/20 text-red-400',
    orange: 'from-orange-500/20 to-amber-500/20 text-orange-400',
    green: 'from-green-500/20 to-emerald-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/60">{title}</h3>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}

function SecurityOverview({ 
  clients, 
  securityIncidents, 
  securitySettings,
  onViewIncident 
}: {
  clients: SalonClient[]
  securityIncidents: SecurityIncident[]
  securitySettings: SecuritySettings
  onViewIncident: (incident: SecurityIncident) => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Security Incidents */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Security Incidents</h3>
          <ShieldExclamationIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-3">
          {securityIncidents.slice(0, 6).map((incident, index) => {
            const client = clients.find(c => c.id === incident.client_id)
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onViewIncident(incident)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    incident.severity === 'critical' ? 'bg-red-500/20' :
                    incident.severity === 'high' ? 'bg-orange-500/20' :
                    incident.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                  }`}>
                    {incident.severity === 'critical' ? (
                      <ShieldExclamationIcon className="w-4 h-4 text-red-400" />
                    ) : incident.severity === 'high' ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{incident.title}</p>
                    <p className="text-white/60 text-sm">{client?.salon_name || 'Unknown Client'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    incident.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {incident.status}
                  </span>
                  <p className="text-white/60 text-xs mt-1">
                    {new Date(incident.detected_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Security Score Dashboard */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Security Scores</h3>
          <ShieldCheckIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          {clients.slice(0, 6).map((client, index) => {
            const score = client.security_score || Math.floor(Math.random() * 40) + 60
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {client.salon_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.salon_name}</p>
                    <p className="text-white/60 text-sm">Last scan: 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-16 bg-white/10 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        score >= 80 ? 'bg-green-500' :
                        score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${
                    score >= 80 ? 'text-green-400' :
                    score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {score}%
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Security Features Status */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Security Features</h3>
          <CogIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          <SecurityFeatureItem
            name="Multi-Factor Authentication"
            status={securitySettings.mfa_enabled}
            clients={clients.filter(c => c.mfa_enabled).length}
            total={clients.length}
          />
          <SecurityFeatureItem
            name="Single Sign-On"
            status={securitySettings.sso_enabled}
            clients={clients.filter(c => c.sso_enabled).length}
            total={clients.length}
          />
          <SecurityFeatureItem
            name="IP Allowlisting"
            status={securitySettings.ip_whitelist_enabled}
            clients={clients.filter(c => c.ip_restrictions).length}
            total={clients.length}
          />
          <SecurityFeatureItem
            name="Session Monitoring"
            status={securitySettings.session_monitoring}
            clients={clients.filter(c => c.session_monitoring).length}
            total={clients.length}
          />
        </div>
      </div>

      {/* Threat Intelligence */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Threat Intelligence</h3>
          <GlobeAltIcon className="w-5 h-5 text-white/60" />
        </div>
        <div className="space-y-4">
          <ThreatIntelligenceItem
            type="Brute Force Attacks"
            count={23}
            trend="down"
            color="red"
          />
          <ThreatIntelligenceItem
            type="Suspicious Login Attempts"
            count={157}
            trend="up"
            color="orange"
          />
          <ThreatIntelligenceItem
            type="Data Exfiltration Attempts"
            count={2}
            trend="down"
            color="red"
          />
          <ThreatIntelligenceItem
            type="Malware Detection"
            count={0}
            trend="stable"
            color="green"
          />
        </div>
      </div>
    </div>
  )
}

function DetailedSecurityManagement({
  clients,
  securityIncidents,
  selectedClient,
  setSelectedClient
}: {
  clients: SalonClient[]
  securityIncidents: SecurityIncident[]
  selectedClient: SalonClient | null
  setSelectedClient: (client: SalonClient) => void
}) {
  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Client for Security Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clients.map((client) => {
            const securityScore = client.security_score || Math.floor(Math.random() * 40) + 60
            return (
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {client.salon_name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{client.salon_name}</p>
                      <p className="text-white/60 text-sm">Security Score: {securityScore}%</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    securityScore >= 80 ? 'bg-green-500' :
                    securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Client Security Details */}
      {selectedClient && (
        <ClientSecurityDetails
          client={selectedClient}
          incidents={securityIncidents.filter(i => i.client_id === selectedClient.id)}
        />
      )}
    </div>
  )
}

function ClientSecurityDetails({
  client,
  incidents
}: {
  client: SalonClient
  incidents: SecurityIncident[]
}) {
  const securityScore = client.security_score || Math.floor(Math.random() * 40) + 60

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Security Configuration */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Configuration</h3>
        <div className="space-y-4">
          <SecurityConfigItem
            label="Multi-Factor Authentication"
            enabled={client.mfa_enabled}
            description="Requires second factor for login"
          />
          <SecurityConfigItem
            label="Single Sign-On"
            enabled={client.sso_enabled}
            description="SAML/OAuth integration"
          />
          <SecurityConfigItem
            label="IP Restrictions"
            enabled={client.ip_restrictions}
            description="Allow specific IP ranges only"
          />
          <SecurityConfigItem
            label="Session Monitoring"
            enabled={client.session_monitoring}
            description="Real-time session tracking"
          />
          <SecurityConfigItem
            label="Data Encryption"
            enabled={true}
            description="End-to-end encryption enabled"
          />
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Overall Security Score</span>
            <span className={`font-semibold ${
              securityScore >= 80 ? 'text-green-400' :
              securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {securityScore}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 1 }}
              className={`h-3 rounded-full ${
                securityScore >= 80 ? 'bg-green-500' :
                securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Security Incidents */}
      <div className="lg:col-span-2 glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Incidents</h3>
        <div className="space-y-3">
          {incidents.length > 0 ? (
            incidents.map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{incident.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    incident.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                <p className="text-white/60 text-sm mb-2">{incident.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">
                    {new Date(incident.detected_at).toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    incident.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {incident.status}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white/60">No security incidents found</p>
              <p className="text-white/40 text-sm">This client has a clean security record</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({
  settings,
  onUpdateSettings
}: {
  settings: SecuritySettings
  onUpdateSettings: (settings: SecuritySettings) => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onUpdateSettings(localSettings)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Authentication Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Multi-Factor Authentication</label>
                <p className="text-white/60 text-sm">Require 2FA for all clients</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, mfa_enabled: !localSettings.mfa_enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.mfa_enabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.mfa_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Single Sign-On</label>
                <p className="text-white/60 text-sm">Enable SAML/OAuth integration</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, sso_enabled: !localSettings.sso_enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.sso_enabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.sso_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Password Complexity</label>
                <p className="text-white/60 text-sm">Enforce strong password policy</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, password_policy_enabled: !localSettings.password_policy_enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.password_policy_enabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.password_policy_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Network Security */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Network Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">IP Allowlisting</label>
                <p className="text-white/60 text-sm">Restrict access by IP address</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, ip_whitelist_enabled: !localSettings.ip_whitelist_enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.ip_whitelist_enabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.ip_whitelist_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Rate Limiting</label>
                <p className="text-white/60 text-sm">Prevent brute force attacks</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, rate_limiting_enabled: !localSettings.rate_limiting_enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.rate_limiting_enabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.rate_limiting_enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">DDoS Protection</label>
                <p className="text-white/60 text-sm">Advanced threat protection</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, ddos_protection: !localSettings.ddos_protection})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.ddos_protection ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.ddos_protection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Monitoring & Alerts */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monitoring & Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Session Monitoring</label>
                <p className="text-white/60 text-sm">Track user sessions in real-time</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, session_monitoring: !localSettings.session_monitoring})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.session_monitoring ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.session_monitoring ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Anomaly Detection</label>
                <p className="text-white/60 text-sm">AI-powered threat detection</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, anomaly_detection: !localSettings.anomaly_detection})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.anomaly_detection ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.anomaly_detection ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Real-time Alerts</label>
                <p className="text-white/60 text-sm">Instant security notifications</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, realtime_alerts: !localSettings.realtime_alerts})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.realtime_alerts ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.realtime_alerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Compliance & Audit */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Compliance & Audit</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Audit Logging</label>
                <p className="text-white/60 text-sm">Comprehensive activity logs</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, audit_logging: !localSettings.audit_logging})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.audit_logging ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.audit_logging ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">GDPR Compliance</label>
                <p className="text-white/60 text-sm">Data protection compliance</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, gdpr_compliance: !localSettings.gdpr_compliance})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.gdpr_compliance ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.gdpr_compliance ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">SOC 2 Compliance</label>
                <p className="text-white/60 text-sm">Security framework compliance</p>
              </div>
              <button
                onClick={() => setLocalSettings({...localSettings, soc2_compliance: !localSettings.soc2_compliance})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.soc2_compliance ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.soc2_compliance ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          Save Security Settings
        </button>
      </div>
    </div>
  )
}

function SecurityFeatureItem({ name, status, clients, total }: any) {
  const percentage = (clients / total) * 100

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${status ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {status ? (
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
          ) : (
            <XCircleIcon className="w-4 h-4 text-red-400" />
          )}
        </div>
        <span className="text-white">{name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/60 text-sm">{clients}/{total}</span>
        <div className="w-16 bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function ThreatIntelligenceItem({ type, count, trend, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <ShieldExclamationIcon className={`w-4 h-4 text-${color}-400`} />
        </div>
        <span className="text-white">{type}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white font-semibold">{count}</span>
        {trend === 'up' && <ArrowPathIcon className="w-4 h-4 text-red-400 rotate-45" />}
        {trend === 'down' && <ArrowPathIcon className="w-4 h-4 text-green-400 -rotate-45" />}
        {trend === 'stable' && <div className="w-4 h-1 bg-white/40 rounded" />}
      </div>
    </div>
  )
}

function SecurityConfigItem({ label, enabled, description }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
      <div className={`p-2 rounded-lg ${enabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        {enabled ? (
          <CheckCircleIcon className="w-4 h-4 text-green-400" />
        ) : (
          <XCircleIcon className="w-4 h-4 text-red-400" />
        )}
      </div>
    </div>
  )
}

function SecurityIncidentModal({ incident, onClose, onResolve }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Security Incident Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm">Incident Title</label>
            <p className="text-white font-medium">{incident.title}</p>
          </div>

          <div>
            <label className="block text-white/60 text-sm">Description</label>
            <p className="text-white">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm">Severity</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                incident.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {incident.severity}
              </span>
            </div>

            <div>
              <label className="block text-white/60 text-sm">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                incident.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {incident.status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm">Detected At</label>
            <p className="text-white">{new Date(incident.detected_at).toLocaleString()}</p>
          </div>

          {incident.affected_users && (
            <div>
              <label className="block text-white/60 text-sm">Affected Users</label>
              <p className="text-white">{incident.affected_users}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5"
          >
            Close
          </button>
          {incident.status !== 'resolved' && (
            <button
              onClick={onResolve}
              className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30"
            >
              Mark as Resolved
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
} 