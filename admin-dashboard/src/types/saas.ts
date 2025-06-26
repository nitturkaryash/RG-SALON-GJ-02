// SaaS Admin Dashboard Types
export interface SalonClient {
  id: string
  salon_name: string
  owner_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  subscription_plan: 'basic' | 'pro' | 'premium' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'suspended' | 'trial' | 'expired'
  created_at: string
  last_login: string
  monthly_revenue: number
  total_revenue: number
  support_tickets: number
  users_count: number
  appointments_count: number
  status: 'active' | 'inactive' | 'suspended'
  trial_ends_at?: string
  // Enhanced fields
  password_last_changed: string
  mfa_enabled: boolean
  api_key: string
  database_size: string
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  last_backup: string
  data_retention_days: number
  custom_domain?: string
  branding_enabled: boolean
  sso_enabled: boolean
  webhook_url?: string
  timezone: string
  billing_address: string
  payment_method: string
  contract_start: string
  contract_end: string
  auto_renewal: boolean
  // Security fields
  security_score?: number
  ip_restrictions: boolean
  session_monitoring: boolean
}

export interface ClientSession {
  id: string
  client_id: string
  user_name: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  operating_system: string
  ip_address: string
  location: {
    city: string
    country: string
    latitude: number
    longitude: number
  }
  login_time: string
  logout_time?: string
  session_duration: number
  is_active: boolean
  actions_count: number
  last_activity: string
}

export interface ClientData {
  id: string
  client_id: string
  table_name: string
  record_count: number
  data_size: string
  last_updated: string
  sync_status: 'synced' | 'pending' | 'error'
  backup_status: 'backed_up' | 'pending' | 'failed'
}

export interface ClientAnalytics {
  client_id: string
  daily_active_users: number
  monthly_active_users: number
  feature_usage: {
    appointments: number
    inventory: number
    payments: number
    reports: number
  }
  revenue_trend: Array<{ date: string; amount: number }>
  user_engagement: {
    avg_session_duration: number
    pages_per_session: number
    bounce_rate: number
  }
  system_performance: {
    uptime: number
    response_time: number
    error_rate: number
  }
}

export interface BackupRecord {
  id: string
  client_id: string
  backup_type: 'full' | 'incremental' | 'differential'
  file_size: string
  created_at: string
  status: 'completed' | 'in_progress' | 'failed'
  retention_until: string
  download_url?: string
}

export interface SupportTicket {
  id: string
  client_id: string
  client_name: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  assigned_to: string
  category: string
}

export interface SecurityIncident {
  id: string
  client_id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'investigating' | 'resolved'
  detected_at: string
  affected_users?: number
  source_ip?: string
  user_agent?: string
}

export interface SecuritySettings {
  mfa_enabled: boolean
  sso_enabled: boolean
  password_policy_enabled: boolean
  ip_whitelist_enabled: boolean
  rate_limiting_enabled: boolean
  ddos_protection: boolean
  session_monitoring: boolean
  anomaly_detection: boolean
  realtime_alerts: boolean
  audit_logging: boolean
  gdpr_compliance: boolean
  soc2_compliance: boolean
}

export interface BillingRecord {
  id: string
  client_id: string
  amount: number
  currency: string
  billing_period: string
  status: 'pending' | 'paid' | 'overdue' | 'failed'
  invoice_date: string
  due_date: string
  payment_method: string
  transaction_id?: string
}

export interface PlatformSettings {
  trial_period_days: number
  default_subscription_plan: string
  max_users_per_client: number
  storage_limit_gb: number
  api_rate_limit: number
  backup_retention_days: number
  session_timeout_minutes: number
  password_reset_expiry_hours: number
  support_email: string
  maintenance_mode: boolean
}

// New Advanced Features Types

export interface NotificationCenter {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  client_id?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'unread' | 'read' | 'archived'
  created_at: string
  expires_at?: string
  action_url?: string
  metadata?: Record<string, any>
}

export interface APIUsageMetrics {
  client_id: string
  date: string
  total_requests: number
  successful_requests: number
  failed_requests: number
  rate_limit_hits: number
  avg_response_time: number
  peak_requests_per_minute: number
  data_transfer_mb: number
  endpoints_used: Array<{
    endpoint: string
    requests: number
    avg_response_time: number
  }>
}

export interface BrandingSettings {
  client_id: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  font_family: string
  custom_css?: string
  white_label_enabled: boolean
  custom_domain?: string
  favicon_url?: string
  email_template_customization: boolean
  login_page_customization: boolean
}

export interface AutomationWorkflow {
  id: string
  name: string
  description: string
  trigger_type: 'schedule' | 'event' | 'condition' | 'webhook'
  trigger_config: Record<string, any>
  actions: Array<{
    type: 'email' | 'webhook' | 'update_client' | 'backup' | 'notification'
    config: Record<string, any>
  }>
  is_active: boolean
  created_at: string
  last_executed?: string
  execution_count: number
  success_rate: number
}

export interface ClientHealthMetrics {
  client_id: string
  health_score: number // 0-100
  uptime_percentage: number
  avg_response_time: number
  error_rate: number
  active_users: number
  storage_usage_percentage: number
  backup_health: 'good' | 'warning' | 'critical'
  last_activity: string
  alerts: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
    detected_at: string
  }>
}

export interface ResourceUsage {
  client_id: string
  date: string
  cpu_usage_avg: number
  memory_usage_avg: number
  storage_used_gb: number
  bandwidth_used_gb: number
  database_queries: number
  concurrent_users_peak: number
  costs: {
    compute: number
    storage: number
    bandwidth: number
    total: number
  }
}

export interface AuditLog {
  id: string
  timestamp: string
  user_id: string
  user_email: string
  action: string
  resource_type: string
  resource_id: string
  client_id?: string
  ip_address: string
  user_agent: string
  details: Record<string, any>
  risk_level: 'low' | 'medium' | 'high'
}

export interface CommunicationMessage {
  id: string
  type: 'announcement' | 'maintenance' | 'update' | 'alert'
  title: string
  content: string
  target_audience: 'all' | 'specific_clients' | 'subscription_plan'
  target_criteria?: {
    client_ids?: string[]
    subscription_plans?: string[]
    tags?: string[]
  }
  status: 'draft' | 'scheduled' | 'sent'
  send_via: Array<'email' | 'in_app' | 'sms' | 'webhook'>
  scheduled_at?: string
  sent_at?: string
  open_rate?: number
  click_rate?: number
  response_rate?: number
}

export interface Feature {
  id: string
  name: string
  description: string
  category: string
  is_enabled: boolean
  subscription_plans: string[]
  usage_limits?: Record<string, number>
  beta: boolean
}

// Communication & Feedback Management System
export interface ThreadMessage {
  id: string
  thread_id: string
  sender_type: 'client' | 'admin' | 'system'
  sender_id: string
  sender_name: string
  message: string
  attachments: MessageAttachment[]
  timestamp: string
  is_internal: boolean
  message_type: 'text' | 'file' | 'system_notification' | 'status_update'
  read_by: string[]
}

export interface CommunicationThread {
  id: string
  client_id: string
  thread_type: 'support' | 'feedback' | 'feature_request' | 'bug_report' | 'general'
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'critical'
  messages: ThreadMessage[]
  created_at: string
  updated_at: string
  assigned_to?: string
  tags: string[]
  resolution_time?: number
  satisfaction_rating?: number
  follow_up_required: boolean
}

export interface MessageAttachment {
  id: string
  filename: string
  file_type: string
  file_size: number
  url: string
  uploaded_at: string
}

// Feedback Collection System
export interface FeedbackItem {
  id: string
  client_id: string
  feedback_type: 'feature_request' | 'bug_report' | 'improvement' | 'complaint' | 'praise'
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'submitted' | 'under_review' | 'planned' | 'in_development' | 'testing' | 'released' | 'rejected'
  votes: number
  estimated_effort: 'small' | 'medium' | 'large' | 'epic'
  target_version?: string
  created_at: string
  updated_at: string
  implemented_in_version?: string
  admin_notes: string
  public_roadmap: boolean
}

// Version & Release Management
export interface VersionRelease {
  id: string
  version: string
  release_type: 'major' | 'minor' | 'patch' | 'hotfix'
  status: 'planned' | 'development' | 'testing' | 'staging' | 'released' | 'rollback'
  release_date: string
  features: ReleaseFeature[]
  bug_fixes: BugFix[]
  breaking_changes: BreakingChange[]
  documentation_url: string
  rollout_percentage: number
  affected_clients: string[]
  release_notes: string
  migration_guide?: string
}

export interface ReleaseFeature {
  id: string
  title: string
  description: string
  feature_type: 'new' | 'enhancement' | 'improvement'
  impact: 'low' | 'medium' | 'high'
  user_facing: boolean
  documentation_sections: string[]
  feedback_item_ids: string[]
}

export interface BugFix {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affected_versions: string[]
  reporter_client_ids: string[]
}

export interface BreakingChange {
  id: string
  title: string
  description: string
  migration_steps: string[]
  deprecation_date?: string
  affected_endpoints: string[]
}

// Documentation Management
export interface DocumentationSection {
  id: string
  title: string
  content: string
  section_type: 'feature' | 'api' | 'integration' | 'troubleshooting' | 'migration'
  version_introduced: string
  last_updated: string
  related_features: string[]
  screenshots: DocumentationScreenshot[]
  code_examples: CodeExample[]
  faq_items: FAQItem[]
}

export interface DocumentationScreenshot {
  id: string
  url: string
  caption: string
  version: string
}

export interface CodeExample {
  id: string
  language: string
  code: string
  description: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful_votes: number
}

// Client Update Notifications
export interface ClientUpdateNotification {
  id: string
  client_ids: string[]
  notification_type: 'feature_release' | 'bug_fix' | 'maintenance' | 'breaking_change' | 'security_update'
  title: string
  message: string
  priority: 'info' | 'warning' | 'critical'
  scheduled_send_time: string
  sent_at?: string
  delivery_status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  channels: ('email' | 'in_app' | 'sms' | 'webhook')[]
  read_by: string[]
  action_required: boolean
  deadline?: string
  related_version?: string
  documentation_links: string[]
}

// Data Tracking & Audit System
export interface DataChangeLog {
  id: string
  client_id: string
  table_name: string
  record_id: string
  change_type: 'create' | 'update' | 'delete' | 'backup' | 'restore'
  old_values: Record<string, any>
  new_values: Record<string, any>
  changed_by: string
  changed_at: string
  reason: string
  ip_address: string
  user_agent: string
  rollback_available: boolean
}

export interface ClientDataBackup {
  id: string
  client_id: string
  backup_type: 'full' | 'incremental' | 'differential'
  status: 'in_progress' | 'completed' | 'failed' | 'corrupted'
  file_size: number
  records_count: number
  tables_included: string[]
  created_at: string
  retention_until: string
  checksum: string
  encryption_status: 'encrypted' | 'unencrypted'
  restore_tested: boolean
  restore_time_estimate: number
}

// Real-time Communication Dashboard
export interface CommunicationMetrics {
  total_threads: number
  open_threads: number
  avg_response_time: number
  avg_resolution_time: number
  satisfaction_score: number
  threads_by_type: Record<string, number>
  threads_by_priority: Record<string, number>
  daily_message_volume: { date: string; count: number }[]
  top_feedback_categories: { category: string; count: number }[]
  version_adoption_rate: { version: string; adoption_percentage: number }[]
}

// Enhanced SaaSOverviewData with new communication features
export interface SaaSOverviewData {
  systemOverview: {
    totalClients: number
    monthlyRevenue: number
    activeSessions: number
    openTickets: number
    systemUptime?: number
    totalAPIRequests?: number
    avgResponseTime?: number
  }
  clients: SalonClient[]
  sessions: ClientSession[]
  clientData: ClientData[]
  analytics: Record<string, ClientAnalytics>
  backups: BackupRecord[]
  supportTickets: SupportTicket[]
  securityIncidents: SecurityIncident[]
  securitySettings: SecuritySettings
  billingRecords: BillingRecord[]
  platformSettings: PlatformSettings
  
  // New advanced features
  notifications: NotificationCenter[]
  apiUsage: APIUsageMetrics[]
  brandingSettings: BrandingSettings[]
  automationWorkflows: AutomationWorkflow[]
  clientHealth: ClientHealthMetrics[]
  resourceUsage: ResourceUsage[]
  auditLogs: AuditLog[]
  communications: CommunicationMessage[]
  features: Feature[]
  // New communication & feedback features
  communicationThreads: CommunicationThread[]
  feedbackItems: FeedbackItem[]
  versionReleases: VersionRelease[]
  documentationSections: DocumentationSection[]
  clientNotifications: ClientUpdateNotification[]
  dataChangeLogs: DataChangeLog[]
  clientBackups: ClientDataBackup[]
  communicationMetrics: CommunicationMetrics
} 