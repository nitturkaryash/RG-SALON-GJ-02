import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CogIcon,
  ClockIcon,
  UserGroupIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { PlatformSettings } from '../../../types/saas'

interface PlatformSettingsTabProps {
  platformSettings: PlatformSettings
  isLoading: boolean
}

export function PlatformSettingsTab({ platformSettings, isLoading }: PlatformSettingsTabProps) {
  const [settings, setSettings] = useState(platformSettings)
  const [activeSection, setActiveSection] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    toast.success('Platform settings updated successfully')
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(platformSettings)
    setHasChanges(false)
    toast.success('Settings reset to original values')
  }

  const sections = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'users', name: 'User Management', icon: UserGroupIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'maintenance', name: 'Maintenance', icon: ServerIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
          <p className="text-white/60">Configure global platform settings and policies</p>
        </div>
        {hasChanges && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-white/20 rounded-lg text-white/80 hover:bg-white/5 transition-colors"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-l-4 border-orange-500"
        >
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
            <p className="text-orange-400 font-medium">You have unsaved changes</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Settings Categories</h3>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 glass-card p-6">
          {activeSection === 'general' && (
            <GeneralSettings settings={settings} updateSetting={updateSetting} />
          )}
          {activeSection === 'users' && (
            <UserManagementSettings settings={settings} updateSetting={updateSetting} />
          )}
          {activeSection === 'security' && (
            <SecuritySettings settings={settings} updateSetting={updateSetting} />
          )}
          {activeSection === 'notifications' && (
            <NotificationSettings settings={settings} updateSetting={updateSetting} />
          )}
          {activeSection === 'maintenance' && (
            <MaintenanceSettings settings={settings} updateSetting={updateSetting} />
          )}
        </div>
      </div>
    </div>
  )
}

function GeneralSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">General Platform Settings</h3>
        <p className="text-white/60 mb-6">Configure basic platform behavior and defaults</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Default Subscription Plan
          </label>
          <select
            value={settings.default_subscription_plan}
            onChange={(e) => updateSetting('default_subscription_plan', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <p className="text-white/40 text-xs mt-1">Plan assigned to new clients by default</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Trial Period (Days)
          </label>
          <input
            type="number"
            value={settings.trial_period_days}
            onChange={(e) => updateSetting('trial_period_days', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="90"
          />
          <p className="text-white/40 text-xs mt-1">Length of free trial for new clients</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Storage Limit (GB)
          </label>
          <input
            type="number"
            value={settings.storage_limit_gb}
            onChange={(e) => updateSetting('storage_limit_gb', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
          <p className="text-white/40 text-xs mt-1">Default storage limit per client</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={settings.support_email}
            onChange={(e) => updateSetting('support_email', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-white/40 text-xs mt-1">Primary contact for customer support</p>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-white font-medium">Maintenance Mode</label>
            <p className="text-white/60 text-sm">Temporarily disable access to all client systems</p>
          </div>
          <button
            onClick={() => updateSetting('maintenance_mode', !settings.maintenance_mode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.maintenance_mode ? 'bg-red-500' : 'bg-white/20'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        {settings.maintenance_mode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-medium">Maintenance mode is enabled</p>
            </div>
            <p className="text-red-300 text-sm mt-1">
              All client systems are currently unavailable. Users will see a maintenance message.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function UserManagementSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">User Management</h3>
        <p className="text-white/60 mb-6">Configure user limits and session management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Max Users Per Client
          </label>
          <input
            type="number"
            value={settings.max_users_per_client}
            onChange={(e) => updateSetting('max_users_per_client', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
          <p className="text-white/40 text-xs mt-1">Maximum number of users each client can have</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Session Timeout (Minutes)
          </label>
          <input
            type="number"
            value={settings.session_timeout_minutes}
            onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="5"
            max="1440"
          />
          <p className="text-white/40 text-xs mt-1">Auto-logout inactive users after this time</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Password Reset Expiry (Hours)
          </label>
          <input
            type="number"
            value={settings.password_reset_expiry_hours}
            onChange={(e) => updateSetting('password_reset_expiry_hours', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="72"
          />
          <p className="text-white/40 text-xs mt-1">Password reset links expire after this time</p>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            API Rate Limit (Requests/Min)
          </label>
          <input
            type="number"
            value={settings.api_rate_limit}
            onChange={(e) => updateSetting('api_rate_limit', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="10"
          />
          <p className="text-white/40 text-xs mt-1">Maximum API requests per minute per client</p>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Security & Compliance</h3>
        <p className="text-white/60 mb-6">Configure security policies and compliance settings</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Backup Retention (Days)
            </label>
            <input
              type="number"
              value={settings.backup_retention_days}
              onChange={(e) => updateSetting('backup_retention_days', parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="7"
            />
            <p className="text-white/40 text-xs mt-1">How long to keep backup files</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Security Policies</h4>
          
          <div className="space-y-4">
            <SecurityToggle
              title="Enforce Strong Passwords"
              description="Require complex passwords with mixed characters"
              enabled={true}
              onChange={() => {}}
            />
            
            <SecurityToggle
              title="Two-Factor Authentication"
              description="Require 2FA for all admin accounts"
              enabled={true}
              onChange={() => {}}
            />
            
            <SecurityToggle
              title="IP Allowlisting"
              description="Restrict admin access to specific IP ranges"
              enabled={false}
              onChange={() => {}}
            />
            
            <SecurityToggle
              title="Audit Logging"
              description="Log all administrative actions"
              enabled={true}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Notification Settings</h3>
        <p className="text-white/60 mb-6">Configure system-wide notification preferences</p>
      </div>

      <div className="space-y-6">
        <h4 className="text-lg font-medium text-white">Email Notifications</h4>
        
        <div className="space-y-4">
          <NotificationToggle
            title="New Client Registration"
            description="Get notified when new clients sign up"
            enabled={true}
            onChange={() => {}}
          />
          
          <NotificationToggle
            title="Payment Failures"
            description="Alerts for failed payment attempts"
            enabled={true}
            onChange={() => {}}
          />
          
          <NotificationToggle
            title="System Errors"
            description="Critical system error notifications"
            enabled={true}
            onChange={() => {}}
          />
          
          <NotificationToggle
            title="Security Incidents"
            description="Security breach or threat alerts"
            enabled={true}
            onChange={() => {}}
          />
          
          <NotificationToggle
            title="Weekly Reports"
            description="Automated weekly platform reports"
            enabled={false}
            onChange={() => {}}
          />
        </div>

        <div className="pt-6 border-t border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Slack Integration</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Slack Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-white/40 text-xs mt-1">Send notifications to Slack channel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MaintenanceSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Maintenance & Monitoring</h3>
        <p className="text-white/60 mb-6">System maintenance and monitoring configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-4 bg-white/5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="text-white font-medium">System Health</h4>
          </div>
          <div className="space-y-2">
            <HealthItem label="Database" status="healthy" />
            <HealthItem label="API Services" status="healthy" />
            <HealthItem label="File Storage" status="healthy" />
            <HealthItem label="Email Service" status="warning" />
          </div>
        </div>

        <div className="glass-card p-4 bg-white/5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ServerIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-white font-medium">Quick Actions</h4>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => toast.success('Cache cleared successfully')}
              className="w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Clear System Cache
            </button>
            <button
              onClick={() => toast.success('Database optimization started')}
              className="w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Optimize Database
            </button>
            <button
              onClick={() => toast.success('System restart scheduled')}
              className="w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Schedule Restart
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Automated Maintenance</h4>
        
        <MaintenanceToggle
          title="Auto Database Cleanup"
          description="Automatically clean up old logs and temporary data"
          enabled={true}
          onChange={() => {}}
        />
        
        <MaintenanceToggle
          title="Auto Backup Verification"
          description="Verify backup integrity automatically"
          enabled={true}
          onChange={() => {}}
        />
        
        <MaintenanceToggle
          title="Performance Monitoring"
          description="Monitor system performance and alert on issues"
          enabled={true}
          onChange={() => {}}
        />
      </div>
    </div>
  )
}

function SecurityToggle({ title, description, enabled, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div>
        <h5 className="text-white font-medium">{title}</h5>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-green-500' : 'bg-white/20'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

function NotificationToggle({ title, description, enabled, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div>
        <h5 className="text-white font-medium">{title}</h5>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-white/20'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

function MaintenanceToggle({ title, description, enabled, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div>
        <h5 className="text-white font-medium">{title}</h5>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-purple-500' : 'bg-white/20'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}

function HealthItem({ label, status }: any) {
  const statusColors = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-white/80 text-sm">{label}</span>
      <span className={`text-sm font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status}
      </span>
    </div>
  )
} 