import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RocketLaunchIcon,
  DocumentTextIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BellIcon,
  CodeBracketIcon,
  BugAntIcon,
  StarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { VersionRelease, FeedbackItem, ClientUpdateNotification, DocumentationSection } from '../../../types/saas'

interface VersionReleaseTabProps {
  versionReleases: VersionRelease[]
  feedbackItems: FeedbackItem[]
  clientNotifications: ClientUpdateNotification[]
  documentationSections: DocumentationSection[]
}

export function VersionReleaseTab({
  versionReleases,
  feedbackItems,
  clientNotifications,
  documentationSections
}: VersionReleaseTabProps) {
  const [activeTab, setActiveTab] = useState<'releases' | 'roadmap' | 'documentation' | 'notifications'>('releases')
  const [selectedRelease, setSelectedRelease] = useState<VersionRelease | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredReleases = versionReleases.filter(release => 
    filterStatus === 'all' || release.status === filterStatus
  )

  const pendingFeatures = feedbackItems.filter(item => 
    item.status === 'planned' || item.status === 'in_development'
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'text-green-400 bg-green-400/10'
      case 'staging': return 'text-blue-400 bg-blue-400/10'
      case 'testing': return 'text-yellow-400 bg-yellow-400/10'
      case 'development': return 'text-purple-400 bg-purple-400/10'
      case 'planned': return 'text-gray-400 bg-gray-400/10'
      case 'rollback': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getReleaseTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'text-red-400 bg-red-400/10'
      case 'minor': return 'text-blue-400 bg-blue-400/10'
      case 'patch': return 'text-green-400 bg-green-400/10'
      case 'hotfix': return 'text-orange-400 bg-orange-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getFeatureImpact = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Version Release Management</h2>
          <p className="text-gray-300">Track releases, manage documentation, and notify clients automatically</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {['releases', 'roadmap', 'documentation', 'notifications'].map((tab) => (
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            New Release
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-gradient-to-br from-green-600/20 to-blue-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Released Versions</p>
              <p className="text-2xl font-bold text-white">
                {versionReleases.filter(r => r.status === 'released').length}
              </p>
            </div>
            <RocketLaunchIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">In Development</p>
              <p className="text-2xl font-bold text-white">
                {versionReleases.filter(r => r.status === 'development').length}
              </p>
            </div>
            <CodeBracketIcon className="w-8 h-8 text-blue-400" />
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
              <p className="text-gray-300 text-sm">Pending Features</p>
              <p className="text-2xl font-bold text-white">{pendingFeatures.length}</p>
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
              <p className="text-gray-300 text-sm">Documentation Pages</p>
              <p className="text-2xl font-bold text-white">{documentationSections.length}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'releases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Release List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filter Releases</h3>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="released">Released</option>
                <option value="staging">Staging</option>
                <option value="testing">Testing</option>
                <option value="development">Development</option>
                <option value="planned">Planned</option>
              </select>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Version Releases</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredReleases.map((release) => (
                  <motion.div
                    key={release.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedRelease(release)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedRelease?.id === release.id
                        ? 'bg-purple-600/30 border border-purple-500'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">v{release.version}</h4>
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 rounded text-xs ${getReleaseTypeColor(release.release_type)}`}>
                          {release.release_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${getStatusColor(release.status)}`}>
                        {release.status}
                      </span>
                      <span className="text-gray-400">
                        {new Date(release.release_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      <span>{release.features.length} features</span>
                      <span className="mx-1">•</span>
                      <span>{release.bug_fixes.length} fixes</span>
                      {release.breaking_changes.length > 0 && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-orange-400">{release.breaking_changes.length} breaking</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Release Details */}
          <div className="lg:col-span-2 glass-card p-6">
            {selectedRelease ? (
              <div>
                <div className="border-b border-white/20 pb-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Version {selectedRelease.version}</h3>
                      <p className="text-gray-300 mt-1">Released on {new Date(selectedRelease.release_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getReleaseTypeColor(selectedRelease.release_type)}`}>
                        {selectedRelease.release_type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedRelease.status)}`}>
                        {selectedRelease.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-4 space-x-6 text-sm text-gray-400">
                    <span>Rollout: {selectedRelease.rollout_percentage}%</span>
                    <span>Affected Clients: {selectedRelease.affected_clients.length}</span>
                  </div>
                </div>

                {/* Release Notes */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Release Notes</h4>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-300">{selectedRelease.release_notes}</p>
                  </div>
                </div>

                {/* Features */}
                {selectedRelease.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <StarIcon className="w-5 h-5 mr-2 text-green-400" />
                      New Features ({selectedRelease.features.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedRelease.features.map((feature) => (
                        <div key={feature.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-white">{feature.title}</h5>
                              <p className="text-gray-300 text-sm mt-1">{feature.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs">
                                <span className={`px-2 py-1 rounded ${getStatusColor(feature.feature_type)}`}>
                                  {feature.feature_type}
                                </span>
                                <span className={`${getFeatureImpact(feature.impact)}`}>
                                  {feature.impact} impact
                                </span>
                                {feature.user_facing && (
                                  <span className="text-blue-400">User Facing</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bug Fixes */}
                {selectedRelease.bug_fixes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BugAntIcon className="w-5 h-5 mr-2 text-orange-400" />
                      Bug Fixes ({selectedRelease.bug_fixes.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedRelease.bug_fixes.map((fix) => (
                        <div key={fix.id} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-white text-sm">{fix.title}</h5>
                              <p className="text-gray-300 text-xs mt-1">{fix.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(fix.severity)}`}>
                              {fix.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Breaking Changes */}
                {selectedRelease.breaking_changes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-400" />
                      Breaking Changes ({selectedRelease.breaking_changes.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedRelease.breaking_changes.map((change) => (
                        <div key={change.id} className="p-4 bg-red-600/10 border border-red-500/20 rounded-lg">
                          <h5 className="font-medium text-red-400">{change.title}</h5>
                          <p className="text-gray-300 text-sm mt-1">{change.description}</p>
                          {change.migration_steps.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-white mb-2">Migration Steps:</p>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                                {change.migration_steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-white/20">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Documentation
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Notify Clients
                  </button>
                  {selectedRelease.status !== 'released' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Mark as Released
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a release to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Feature Roadmap</h3>
            <div className="space-y-4">
              {pendingFeatures.map((feature) => (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-white">{feature.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(feature.status)}`}>
                          {feature.status}
                        </span>
                        {feature.target_version && (
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            v{feature.target_version}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{feature.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Category: {feature.category}</span>
                        <span>Effort: {feature.estimated_effort}</span>
                        <span>Votes: {feature.votes}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documentation' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Auto-Generated Documentation</h3>
            <div className="grid gap-4">
              {documentationSections.map((section) => (
                <motion.div
                  key={section.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{section.title}</h4>
                      <p className="text-gray-300 text-sm mt-1">{section.content.substring(0, 200)}...</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>Type: {section.section_type}</span>
                        <span>Version: {section.version_introduced}</span>
                        <span>Updated: {new Date(section.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm">
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Client Update Notifications</h3>
            <div className="space-y-4">
              {clientNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-white">{notification.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(notification.delivery_status)}`}>
                          {notification.delivery_status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Type: {notification.notification_type}</span>
                        <span>Channels: {notification.channels.join(', ')}</span>
                        <span>Clients: {notification.client_ids.length}</span>
                        {notification.sent_at && (
                          <span>Sent: {new Date(notification.sent_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 