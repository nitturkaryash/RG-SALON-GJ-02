import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  CircleStackIcon,
  UserGroupIcon,
  KeyIcon,
  GlobeAltIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
// Settings components will be added later
import toast from 'react-hot-toast'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  const settingsTabs = [
    {
      id: 'general',
      name: 'General',
      icon: Cog6ToothIcon,
      description: 'Platform configuration and preferences',
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Authentication and access control',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Email and system notifications',
    },
    {
      id: 'database',
      name: 'Database',
      icon: CircleStackIcon,
      description: 'Database configuration and backups',
    },
    {
      id: 'users',
      name: 'User Management',
      icon: UserGroupIcon,
      description: 'Default user settings and permissions',
    },
    {
      id: 'api',
      name: 'API Settings',
      icon: KeyIcon,
      description: 'API keys and external integrations',
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />
      case 'security':
        return <div className="glass-card p-6"><h3 className="text-white">Security Settings Coming Soon</h3></div>
      case 'notifications':
        return <div className="glass-card p-6"><h3 className="text-white">Notification Settings Coming Soon</h3></div>
      case 'database':
        return <div className="glass-card p-6"><h3 className="text-white">Database Settings Coming Soon</h3></div>
      case 'users':
        return <div className="glass-card p-6"><h3 className="text-white">User Management Settings Coming Soon</h3></div>
      case 'api':
        return <div className="glass-card p-6"><h3 className="text-white">API Settings Coming Soon</h3></div>
      default:
        return <GeneralSettings />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">
          Admin Settings
        </h1>
        <p className="text-white/60">
          Configure your salon SaaS platform settings and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-4 space-y-2">
            {settingsTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'glass-button text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}

// General Settings Component
function GeneralSettings() {
  const [settings, setSettings] = useState({
    platformName: 'Salon SaaS',
    supportEmail: 'support@salonsaas.com',
    maintenanceMode: false,
    allowRegistration: true,
    defaultPlan: 'Basic',
    sessionTimeout: 60,
  })

  const handleSave = () => {
    toast.success('General settings saved successfully!')
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Platform Name
          </label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
            className="glass-input w-full px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
            className="glass-input w-full px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Default Plan
          </label>
          <select
            value={settings.defaultPlan}
            onChange={(e) => setSettings(prev => ({ ...prev, defaultPlan: e.target.value }))}
            className="glass-input w-full px-4 py-3"
          >
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
            className="glass-input w-full px-4 py-3"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 glass rounded-lg">
          <div>
            <h4 className="text-white font-medium">Maintenance Mode</h4>
            <p className="text-white/60 text-sm">Temporarily disable access to the platform</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 glass rounded-lg">
          <div>
            <h4 className="text-white font-medium">Allow Registration</h4>
            <p className="text-white/60 text-sm">Allow new users to register accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) => setSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="glass-button px-6 py-3 hover-glow"
        >
          Save Changes
        </motion.button>
      </div>
    </div>
  )
}

// User Management Settings Component
function UserManagementSettings() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-white mb-4">User Management Settings</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Default User Role
            </label>
            <select className="glass-input w-full px-4 py-3">
              <option value="salon_owner">Salon Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Trial Period (days)
            </label>
            <input
              type="number"
              defaultValue={14}
              className="glass-input w-full px-4 py-3"
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h4 className="text-lg font-medium text-white mb-4">User Limits</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Basic Plan Users
              </label>
              <input
                type="number"
                defaultValue={5}
                className="glass-input w-full px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Pro Plan Users
              </label>
              <input
                type="number"
                defaultValue={15}
                className="glass-input w-full px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Premium Plan Users
              </label>
              <input
                type="number"
                defaultValue={-1}
                placeholder="Unlimited"
                className="glass-input w-full px-4 py-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// API Settings Component
function APISettings() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-white mb-4">API Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            API Rate Limit (requests per minute)
          </label>
          <input
            type="number"
            defaultValue={100}
            className="glass-input w-full px-4 py-3"
          />
        </div>

        <div className="border-t border-white/10 pt-6">
          <h4 className="text-lg font-medium text-white mb-4">External Integrations</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <h5 className="text-white font-medium">WhatsApp Business API</h5>
                <p className="text-white/60 text-sm">Enable WhatsApp notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div>
                <h5 className="text-white font-medium">Email Service</h5>
                <p className="text-white/60 text-sm">Configure email notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 