import { SaaSOverviewData } from '../types/saas'

// Mock API service for SaaS Admin Dashboard
export const fetchEnhancedClientsData = async (): Promise<SaaSOverviewData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    systemOverview: {
      totalClients: 3,
      monthlyRevenue: 4300,
      activeSessions: 156,
      openTickets: 1,
    },
    clients: [
      {
        id: 'client-001',
        salon_name: 'Glamour Studio',
        owner_name: 'Sarah Johnson',
        email: 'sarah@glamourstudio.com',
        phone: '+1-555-0123',
        address: '123 Beauty Lane',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        subscription_plan: 'premium',
        subscription_status: 'active',
        created_at: '2024-01-15',
        last_login: '2024-01-20T14:30:00Z',
        monthly_revenue: 2500,
        total_revenue: 15000,
        support_tickets: 2,
        users_count: 8,
        appointments_count: 156,
        status: 'active',
        password_last_changed: '2024-01-10',
        mfa_enabled: true,
        api_key: 'gls_live_4f6h8k2m9n1p3q5r7s9t',
        database_size: '2.4 GB',
        backup_frequency: 'daily',
        last_backup: '2024-01-20T02:00:00Z',
        data_retention_days: 365,
        custom_domain: 'booking.glamourstudio.com',
        branding_enabled: true,
        sso_enabled: false,
        webhook_url: 'https://glamourstudio.com/webhook',
        timezone: 'America/New_York',
        billing_address: '123 Beauty Lane, New York, NY 10001',
        payment_method: 'Credit Card (**** 4242)',
        contract_start: '2024-01-15',
        contract_end: '2025-01-15',
        auto_renewal: true,
        security_score: 85,
        ip_restrictions: false,
        session_monitoring: true,
      },
      {
        id: 'client-002',
        salon_name: 'Elite Cuts',
        owner_name: 'Mike Chen',
        email: 'mike@elitecuts.com',
        phone: '+1-555-0456',
        address: '456 Style Street',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        subscription_plan: 'enterprise',
        subscription_status: 'active',
        created_at: '2024-02-01',
        last_login: '2024-01-19T16:45:00Z',
        monthly_revenue: 1800,
        total_revenue: 9000,
        support_tickets: 0,
        users_count: 12,
        appointments_count: 89,
        status: 'active',
        password_last_changed: '2024-01-18',
        mfa_enabled: true,
        api_key: 'ec_live_9k8j7h6g5f4d3s2a1',
        database_size: '1.8 GB',
        backup_frequency: 'daily',
        last_backup: '2024-01-20T02:00:00Z',
        data_retention_days: 730,
        custom_domain: 'app.elitecuts.com',
        branding_enabled: true,
        sso_enabled: true,
        webhook_url: 'https://elitecuts.com/api/webhook',
        timezone: 'America/Los_Angeles',
        billing_address: '456 Style Street, Los Angeles, CA 90210',
        payment_method: 'Credit Card (**** 1234)',
        contract_start: '2024-02-01',
        contract_end: '2025-02-01',
        auto_renewal: true,
        security_score: 92,
        ip_restrictions: true,
        session_monitoring: true,
      },
      {
        id: 'client-003',
        salon_name: 'Beauty Bliss',
        owner_name: 'Emma Wilson',
        email: 'emma@beautybliss.com',
        phone: '+1-555-0789',
        address: '789 Glamour Ave',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        subscription_plan: 'basic',
        subscription_status: 'trial',
        created_at: '2024-01-25',
        last_login: '2024-01-18T12:20:00Z',
        monthly_revenue: 0,
        total_revenue: 0,
        support_tickets: 1,
        users_count: 3,
        appointments_count: 45,
        status: 'active',
        trial_ends_at: '2024-02-25',
        password_last_changed: '2024-01-25',
        mfa_enabled: false,
        api_key: 'bb_trial_3x4y5z6a7b8c9d0e',
        database_size: '0.5 GB',
        backup_frequency: 'weekly',
        last_backup: '2024-01-19T02:00:00Z',
        data_retention_days: 90,
        branding_enabled: false,
        sso_enabled: false,
        timezone: 'America/New_York',
        billing_address: '789 Glamour Ave, Miami, FL 33101',
        payment_method: 'Trial (No Payment)',
        contract_start: '2024-01-25',
        contract_end: '2024-02-25',
        auto_renewal: false,
        security_score: 68,
        ip_restrictions: false,
        session_monitoring: false,
      },
    ],
    sessions: generateMockSessions(),
    clientData: generateMockClientData(),
    analytics: generateMockAnalytics(),
    backups: generateMockBackups(),
    supportTickets: generateMockSupportTickets(),
    securityIncidents: generateMockSecurityIncidents(),
    securitySettings: generateMockSecuritySettings(),
    billingRecords: generateMockBillingRecords(),
    platformSettings: generateMockPlatformSettings(),
    
    // New advanced features
    notifications: generateMockNotifications(),
    apiUsage: generateMockAPIUsage(),
    brandingSettings: [],
    automationWorkflows: generateMockAutomationWorkflows(),
    clientHealth: generateMockClientHealth(),
    resourceUsage: generateMockResourceUsage(),
    auditLogs: generateMockAuditLogs(),
    communications: generateMockCommunications(),
    features: generateMockFeatures(),
  }
}

// Helper functions to generate mock data
function generateMockSessions() {
  return [
    {
      id: 'session-001',
      client_id: 'client-001',
      user_name: 'Sarah Johnson',
      device_type: 'desktop' as const,
      browser: 'Chrome 120',
      operating_system: 'Windows 11',
      ip_address: '192.168.1.100',
      location: {
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      login_time: '2024-01-20T14:30:00Z',
      session_duration: 7200,
      is_active: true,
      actions_count: 45,
      last_activity: '2024-01-20T16:15:00Z',
    },
    {
      id: 'session-002',
      client_id: 'client-002',
      user_name: 'Mike Chen',
      device_type: 'mobile' as const,
      browser: 'Safari 17',
      operating_system: 'iOS 17',
      ip_address: '10.0.0.155',
      location: {
        city: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
      login_time: '2024-01-20T13:45:00Z',
      session_duration: 5400,
      is_active: true,
      actions_count: 123,
      last_activity: '2024-01-20T15:15:00Z',
    },
  ]
}

function generateMockClientData() {
  return [
    {
      id: 'data-001',
      client_id: 'client-001',
      table_name: 'appointments',
      record_count: 1245,
      data_size: '125 MB',
      last_updated: '2024-01-20T14:30:00Z',
      sync_status: 'synced' as const,
      backup_status: 'backed_up' as const,
    },
    {
      id: 'data-002',
      client_id: 'client-001',
      table_name: 'clients',
      record_count: 456,
      data_size: '45 MB',
      last_updated: '2024-01-20T12:15:00Z',
      sync_status: 'synced' as const,
      backup_status: 'backed_up' as const,
    },
  ]
}

function generateMockAnalytics() {
  return {
    'client-001': {
      client_id: 'client-001',
      daily_active_users: 25,
      monthly_active_users: 180,
      feature_usage: {
        appointments: 85,
        inventory: 60,
        payments: 90,
        reports: 45,
      },
      revenue_trend: [
        { date: '2024-01-01', amount: 2200 },
        { date: '2024-01-15', amount: 2500 },
      ],
      user_engagement: {
        avg_session_duration: 45,
        pages_per_session: 8.5,
        bounce_rate: 15,
      },
      system_performance: {
        uptime: 99.9,
        response_time: 250,
        error_rate: 0.1,
      },
    },
  }
}

function generateMockBackups() {
  return [
    {
      id: 'backup-001',
      client_id: 'client-001',
      backup_type: 'full' as const,
      file_size: '2.4 GB',
      created_at: '2024-01-20T02:00:00Z',
      status: 'completed' as const,
      retention_until: '2024-07-20T02:00:00Z',
      download_url: 'https://backups.saas.com/client-001/full-20240120.zip',
    },
    {
      id: 'backup-002',
      client_id: 'client-002',
      backup_type: 'incremental' as const,
      file_size: '0.8 GB',
      created_at: '2024-01-19T02:00:00Z',
      status: 'completed' as const,
      retention_until: '2024-07-19T02:00:00Z',
      download_url: 'https://backups.saas.com/client-002/incr-20240119.zip',
    },
    {
      id: 'backup-003',
      client_id: 'client-003',
      backup_type: 'full' as const,
      file_size: '0.5 GB',
      created_at: '2024-01-18T02:00:00Z',
      status: 'failed' as const,
      retention_until: '2024-07-18T02:00:00Z',
    },
  ]
}

function generateMockSupportTickets() {
  return [
    {
      id: 'ticket-001',
      client_id: 'client-003',
      client_name: 'Beauty Bliss',
      title: 'Payment Integration Issue',
      description: 'Unable to process credit card payments through Stripe integration',
      priority: 'high' as const,
      status: 'open' as const,
      created_at: '2024-01-19T15:30:00Z',
      updated_at: '2024-01-19T15:30:00Z',
      assigned_to: 'Tech Support Team',
      category: 'Payment Processing',
    },
    {
      id: 'ticket-002',
      client_id: 'client-001',
      client_name: 'Glamour Studio',
      title: 'Feature Request: Advanced Reporting',
      description: 'Request for custom analytics dashboard with advanced filtering options',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      created_at: '2024-01-18T10:15:00Z',
      updated_at: '2024-01-19T14:30:00Z',
      assigned_to: 'Product Team',
      category: 'Feature Request',
    },
  ]
}

function generateMockSecurityIncidents() {
  return [
    {
      id: 'sec-001',
      client_id: 'client-001',
      title: 'Suspicious Login Attempt',
      description: 'Multiple failed login attempts detected from unusual IP address',
      severity: 'medium' as const,
      status: 'investigating' as const,
      detected_at: '2024-01-20T08:15:00Z',
      affected_users: 1,
      source_ip: '192.168.1.55',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      id: 'sec-002',
      client_id: 'client-002',
      title: 'Data Export Anomaly',
      description: 'Unusual data export pattern detected during off-hours',
      severity: 'high' as const,
      status: 'resolved' as const,
      detected_at: '2024-01-18T23:45:00Z',
      affected_users: 0,
      source_ip: '10.0.0.155',
      user_agent: 'Custom Script v1.2',
    },
  ]
}

function generateMockSecuritySettings() {
  return {
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
}

function generateMockBillingRecords() {
  return [
    {
      id: 'bill-001',
      client_id: 'client-001',
      amount: 2500,
      currency: 'USD',
      billing_period: 'January 2024',
      status: 'paid' as const,
      invoice_date: '2024-01-01T00:00:00Z',
      due_date: '2024-01-15T00:00:00Z',
      payment_method: 'Credit Card',
      transaction_id: 'txn_1234567890',
    },
    {
      id: 'bill-002',
      client_id: 'client-002',
      amount: 1800,
      currency: 'USD',
      billing_period: 'January 2024',
      status: 'paid' as const,
      invoice_date: '2024-01-01T00:00:00Z',
      due_date: '2024-01-15T00:00:00Z',
      payment_method: 'Bank Transfer',
      transaction_id: 'txn_0987654321',
    },
    {
      id: 'bill-003',
      client_id: 'client-001',
      amount: 2500,
      currency: 'USD',
      billing_period: 'February 2024',
      status: 'pending' as const,
      invoice_date: '2024-02-01T00:00:00Z',
      due_date: '2024-02-15T00:00:00Z',
      payment_method: 'Credit Card',
    },
  ]
}

function generateMockPlatformSettings() {
  return {
    trial_period_days: 30,
    default_subscription_plan: 'basic',
    max_users_per_client: 50,
    storage_limit_gb: 100,
    api_rate_limit: 1000,
    backup_retention_days: 90,
    session_timeout_minutes: 60,
    password_reset_expiry_hours: 24,
    support_email: 'support@saas-platform.com',
    maintenance_mode: false,
  }
}

function generateMockNotifications() {
  return [
    {
      id: 'notif-001',
      type: 'warning' as const,
      title: 'High API Usage Detected',
      message: 'Client "Glamour Studio" has exceeded 80% of their API rate limit for this hour.',
      client_id: 'client-001',
      priority: 'high' as const,
      status: 'unread' as const,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      action_url: '/clients/client-001/api-usage',
      metadata: { usage_percentage: 82, limit: 10000 }
    },
    {
      id: 'notif-002',
      type: 'error' as const,
      title: 'Backup Failed',
      message: 'Scheduled backup for Urban Cuts failed due to insufficient storage space.',
      client_id: 'client-002',
      priority: 'critical' as const,
      status: 'unread' as const,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      action_url: '/clients/client-002/backups',
    },
    {
      id: 'notif-003',
      type: 'success' as const,
      title: 'New Client Onboarded',
      message: 'Elite Hair Salon has successfully completed their setup and is now live.',
      client_id: 'client-003',
      priority: 'medium' as const,
      status: 'read' as const,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
      id: 'notif-004',
      type: 'info' as const,
      title: 'System Maintenance Scheduled',
      message: 'Routine maintenance scheduled for tonight at 2:00 AM EST. Expected downtime: 30 minutes.',
      priority: 'low' as const,
      status: 'unread' as const,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // expires in 2 days
    },
    {
      id: 'notif-005',
      type: 'warning' as const,
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected from unusual IP address for client "Glamour Studio".',
      client_id: 'client-001',
      priority: 'high' as const,
      status: 'read' as const,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      metadata: { ip_address: '192.168.1.100', attempts: 7 }
    }
  ]
}

function generateMockAPIUsage() {
  return [
    {
      client_id: 'client-001',
      date: '2024-01-20',
      total_requests: 8240,
      successful_requests: 8156,
      failed_requests: 84,
      rate_limit_hits: 12,
      avg_response_time: 245,
      peak_requests_per_minute: 68,
      data_transfer_mb: 156.7,
      endpoints_used: [
        { endpoint: '/api/v1/appointments', requests: 3240, avg_response_time: 180 },
        { endpoint: '/api/v1/clients', requests: 2180, avg_response_time: 220 },
        { endpoint: '/api/v1/services', requests: 1890, avg_response_time: 160 },
        { endpoint: '/api/v1/payments', requests: 930, avg_response_time: 340 }
      ]
    },
    {
      client_id: 'client-002',
      date: '2024-01-20',
      total_requests: 5640,
      successful_requests: 5580,
      failed_requests: 60,
      rate_limit_hits: 3,
      avg_response_time: 198,
      peak_requests_per_minute: 42,
      data_transfer_mb: 98.3,
      endpoints_used: [
        { endpoint: '/api/v1/appointments', requests: 2340, avg_response_time: 175 },
        { endpoint: '/api/v1/clients', requests: 1560, avg_response_time: 205 },
        { endpoint: '/api/v1/inventory', requests: 1140, avg_response_time: 190 },
        { endpoint: '/api/v1/reports', requests: 600, avg_response_time: 280 }
      ]
    },
    {
      client_id: 'client-003',
      date: '2024-01-20',
      total_requests: 2840,
      successful_requests: 2820,
      failed_requests: 20,
      rate_limit_hits: 0,
      avg_response_time: 165,
      peak_requests_per_minute: 28,
      data_transfer_mb: 45.2,
      endpoints_used: [
        { endpoint: '/api/v1/appointments', requests: 1240, avg_response_time: 150 },
        { endpoint: '/api/v1/clients', requests: 890, avg_response_time: 170 },
        { endpoint: '/api/v1/services', requests: 710, avg_response_time: 180 }
      ]
    }
  ]
}

function generateMockAutomationWorkflows() {
  return [
    {
      id: 'workflow-001',
      name: 'Welcome Email Series',
      description: 'Send a series of welcome emails to newly onboarded clients',
      trigger_type: 'event' as const,
      trigger_config: { event: 'client_created', delay: 0 },
      actions: [
        { type: 'email' as const, config: { template: 'welcome', delay: 0 } },
        { type: 'email' as const, config: { template: 'getting_started', delay: '24h' } },
        { type: 'email' as const, config: { template: 'resources', delay: '7d' } }
      ],
      is_active: true,
      created_at: '2024-01-10T08:00:00Z',
      last_executed: '2024-01-20T14:30:00Z',
      execution_count: 127,
      success_rate: 96.8
    },
    {
      id: 'workflow-002',
      name: 'Daily System Backup',
      description: 'Perform automated daily backups for all client databases',
      trigger_type: 'schedule' as const,
      trigger_config: { cron: '0 2 * * *', timezone: 'UTC' },
      actions: [
        { type: 'backup' as const, config: { type: 'full', retention_days: 30 } },
        { type: 'notification' as const, config: { success_only: false } }
      ],
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      last_executed: '2024-01-20T02:00:00Z',
      execution_count: 20,
      success_rate: 100.0
    },
    {
      id: 'workflow-003',
      name: 'High Error Rate Alert',
      description: 'Send alerts when client error rate exceeds threshold',
      trigger_type: 'condition' as const,
      trigger_config: { condition: 'error_rate > 5%', evaluation_interval: '5m' },
      actions: [
        { type: 'notification' as const, config: { severity: 'high', channels: ['email', 'slack'] } },
        { type: 'webhook' as const, config: { url: 'https://hooks.slack.com/...' } }
      ],
      is_active: true,
      created_at: '2024-01-15T12:00:00Z',
      last_executed: '2024-01-19T16:45:00Z',
      execution_count: 8,
      success_rate: 87.5
    },
    {
      id: 'workflow-004',
      name: 'Client Health Check',
      description: 'Weekly health assessment and reporting for all clients',
      trigger_type: 'schedule' as const,
      trigger_config: { cron: '0 9 * * 1', timezone: 'UTC' }, // Every Monday at 9 AM
      actions: [
        { type: 'update_client' as const, config: { field: 'health_score' } },
        { type: 'email' as const, config: { template: 'health_report', recipients: ['admin'] } }
      ],
      is_active: false,
      created_at: '2024-01-08T10:00:00Z',
      last_executed: '2024-01-15T09:00:00Z',
      execution_count: 2,
      success_rate: 100.0
    }
  ]
}

function generateMockClientHealth() {
  return [
    {
      client_id: 'client-001',
      health_score: 85,
      uptime_percentage: 99.8,
      avg_response_time: 245,
      error_rate: 1.02,
      active_users: 25,
      storage_usage_percentage: 68,
      backup_health: 'good' as const,
      last_activity: '2024-01-20T14:30:00Z',
      alerts: [
        {
          type: 'performance',
          severity: 'medium' as const,
          message: 'Response time slightly elevated during peak hours',
          detected_at: '2024-01-20T13:15:00Z'
        }
      ]
    },
    {
      client_id: 'client-002',
      health_score: 92,
      uptime_percentage: 99.9,
      avg_response_time: 198,
      error_rate: 1.06,
      active_users: 18,
      storage_usage_percentage: 42,
      backup_health: 'good' as const,
      last_activity: '2024-01-20T14:28:00Z',
      alerts: []
    },
    {
      client_id: 'client-003',
      health_score: 78,
      uptime_percentage: 98.5,
      avg_response_time: 165,
      error_rate: 0.70,
      active_users: 12,
      storage_usage_percentage: 89,
      backup_health: 'warning' as const,
      last_activity: '2024-01-20T14:25:00Z',
      alerts: [
        {
          type: 'storage',
          severity: 'high' as const,
          message: 'Storage usage approaching limit (89% used)',
          detected_at: '2024-01-20T10:30:00Z'
        },
        {
          type: 'connectivity',
          severity: 'low' as const,
          message: 'Brief connectivity issues detected this morning',
          detected_at: '2024-01-20T08:45:00Z'
        }
      ]
    }
  ]
}

function generateMockResourceUsage() {
  return [
    {
      client_id: 'client-001',
      date: '2024-01-20',
      cpu_usage_avg: 45.2,
      memory_usage_avg: 62.8,
      storage_used_gb: 15.4,
      bandwidth_used_gb: 8.9,
      database_queries: 45280,
      concurrent_users_peak: 28,
      costs: {
        compute: 45.60,
        storage: 12.30,
        bandwidth: 8.90,
        total: 66.80
      }
    },
    {
      client_id: 'client-002',
      date: '2024-01-20',
      cpu_usage_avg: 38.6,
      memory_usage_avg: 55.2,
      storage_used_gb: 9.8,
      bandwidth_used_gb: 6.2,
      database_queries: 32150,
      concurrent_users_peak: 22,
      costs: {
        compute: 32.40,
        storage: 7.80,
        bandwidth: 6.20,
        total: 46.40
      }
    },
    {
      client_id: 'client-003',
      date: '2024-01-20',
      cpu_usage_avg: 28.4,
      memory_usage_avg: 41.6,
      storage_used_gb: 4.2,
      bandwidth_used_gb: 3.1,
      database_queries: 18920,
      concurrent_users_peak: 15,
      costs: {
        compute: 18.90,
        storage: 3.36,
        bandwidth: 3.10,
        total: 25.36
      }
    }
  ]
}

function generateMockAuditLogs() {
  return [
    {
      id: 'audit-001',
      timestamp: '2024-01-20T14:30:00Z',
      user_id: 'admin-001',
      user_email: 'admin@salonsaas.com',
      action: 'client_created',
      resource_type: 'client',
      resource_id: 'client-004',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { salon_name: 'New Salon', subscription_plan: 'basic' },
      risk_level: 'low' as const
    },
    {
      id: 'audit-002',
      timestamp: '2024-01-20T13:45:00Z',
      user_id: 'support-001',
      user_email: 'support@salonsaas.com',
      action: 'client_settings_updated',
      resource_type: 'client',
      resource_id: 'client-001',
      client_id: 'client-001',
      ip_address: '10.0.0.50',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: { field: 'subscription_plan', old_value: 'basic', new_value: 'premium' },
      risk_level: 'medium' as const
    },
    {
      id: 'audit-003',
      timestamp: '2024-01-20T12:15:00Z',
      user_id: 'system',
      user_email: 'system@salonsaas.com',
      action: 'backup_completed',
      resource_type: 'backup',
      resource_id: 'backup-20240120',
      client_id: 'client-002',
      ip_address: '127.0.0.1',
      user_agent: 'SaaSSystem/1.0',
      details: { backup_size: '1.2GB', duration: '45s' },
      risk_level: 'low' as const
    }
  ]
}

function generateMockCommunications() {
  return [
    {
      id: 'comm-001',
      type: 'announcement' as const,
      title: 'New Feature: Advanced Analytics Dashboard',
      content: 'We\'re excited to announce our new advanced analytics dashboard with real-time insights and custom reporting capabilities.',
      target_audience: 'all' as const,
      status: 'sent' as const,
      send_via: ['email', 'in_app'] as Array<'email' | 'in_app' | 'sms' | 'webhook'>,
      sent_at: '2024-01-18T10:00:00Z',
      open_rate: 84.2,
      click_rate: 32.6,
      response_rate: 8.4
    },
    {
      id: 'comm-002',
      type: 'maintenance' as const,
      title: 'Scheduled Maintenance - January 21st',
      content: 'We will be performing routine maintenance on our servers. Expected downtime: 30 minutes starting at 2:00 AM EST.',
      target_audience: 'all' as const,
      status: 'scheduled' as const,
      send_via: ['email', 'in_app', 'sms'] as Array<'email' | 'in_app' | 'sms' | 'webhook'>,
      scheduled_at: '2024-01-21T01:00:00Z',
    },
    {
      id: 'comm-003',
      type: 'update' as const,
      title: 'Security Enhancement for Premium Clients',
      content: 'Enhanced security features including advanced MFA and IP restrictions are now available for Premium subscribers.',
      target_audience: 'subscription_plan' as const,
      target_criteria: { subscription_plans: ['premium', 'enterprise'] },
      status: 'draft' as const,
      send_via: ['email'] as Array<'email' | 'in_app' | 'sms' | 'webhook'>,
    }
  ]
}

function generateMockFeatures() {
  return [
    {
      id: 'feature-001',
      name: 'Advanced Analytics',
      description: 'Comprehensive analytics dashboard with custom reporting',
      category: 'Analytics',
      is_enabled: true,
      subscription_plans: ['premium', 'enterprise'],
      usage_limits: { reports_per_month: 50 } as Record<string, number>,
      beta: false
    },
    {
      id: 'feature-002',
      name: 'White Label Branding',
      description: 'Custom branding and white-label solutions',
      category: 'Branding',
      is_enabled: true,
      subscription_plans: ['enterprise'],
      beta: false
    },
    {
      id: 'feature-003',
      name: 'AI-Powered Insights',
      description: 'Machine learning powered business insights and recommendations',
      category: 'AI/ML',
      is_enabled: false,
      subscription_plans: ['enterprise'],
      beta: true
    },
    {
      id: 'feature-004',
      name: 'Multi-Location Management',
      description: 'Manage multiple salon locations from a single dashboard',
      category: 'Management',
      is_enabled: true,
      subscription_plans: ['pro', 'premium', 'enterprise'],
      usage_limits: { max_locations: 10 } as Record<string, number>,
      beta: false
    }
  ]
} 