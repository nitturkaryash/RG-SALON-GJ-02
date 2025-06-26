import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Download, FileText, Calendar, CheckCircle, AlertCircle,
  Filter, Search, Users, Clock, Tag, ExternalLink,
  BarChart3, TrendingUp, Activity, Zap, Settings,
  FileSpreadsheet, FilePdf, FileImage, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetingReportData {
  id: string;
  title: string;
  clientName: string;
  salonName: string;
  meetingType: 'support' | 'training' | 'consultation' | 'demo';
  scheduledDate: Date;
  completedDate: Date;
  duration: number;
  status: 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attendees: string[];
  issuesFixed: IssueFixed[];
  jiraTickets: JiraTicketStatus[];
  clientSatisfaction: number;
  followUpRequired: boolean;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  resolutionSummary: string;
  nextSteps: string[];
}

interface IssueFixed {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixedDateTime: Date;
  timeTakenHours: number;
  jiraTicket?: string;
  beforeState: string;
  afterState: string;
  technicalDetails: string;
}

interface JiraTicketStatus {
  ticketKey: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Cancelled';
  priority: 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest';
  assignee: string;
  createdDate: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours?: number;
  meetingId: string;
  url: string;
  lastUpdated: Date;
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeJiraDetails: boolean;
  includeClientFeedback: boolean;
  includeTechnicalDetails: boolean;
  includeTimeline: boolean;
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  clientFilter: string;
  statusFilter: string;
}

interface MeetingReportExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingReportExporter: React.FC<MeetingReportExporterProps> = ({ isOpen, onClose }) => {
  const [meetings, setMeetings] = useState<MeetingReportData[]>([]);
  const [jiraTickets, setJiraTickets] = useState<JiraTicketStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeJiraDetails: true,
    includeClientFeedback: true,
    includeTechnicalDetails: true,
    includeTimeline: true,
    dateRange: 'month',
    clientFilter: 'all',
    statusFilter: 'completed'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMeetings: MeetingReportData[] = [
        {
          id: 'meeting-1',
          title: 'POS System Critical Bug Fix',
          clientName: 'Sarah Johnson',
          salonName: 'Glamour Salon',
          meetingType: 'support',
          scheduledDate: new Date('2024-01-15T10:00:00'),
          completedDate: new Date('2024-01-15T11:30:00'),
          duration: 90,
          status: 'completed',
          priority: 'urgent',
          attendees: ['Sarah Johnson', 'Tech Lead', 'Support Engineer'],
          issuesFixed: [
            {
              id: 'issue-1',
              description: 'Payment gateway timeout causing transaction failures',
              severity: 'critical',
              fixedDateTime: new Date('2024-01-15T11:15:00'),
              timeTakenHours: 2.5,
              jiraTicket: 'SALON-123',
              beforeState: 'Payment gateway timing out after 30 seconds, causing 15% transaction failures',
              afterState: 'Payment gateway timeout increased to 60 seconds, transaction success rate 99.8%',
              technicalDetails: 'Updated gateway configuration, implemented retry logic, added connection pooling'
            },
            {
              id: 'issue-2',
              description: 'Inventory sync not updating in real-time',
              severity: 'high',
              fixedDateTime: new Date('2024-01-15T11:25:00'),
              timeTakenHours: 1.0,
              jiraTicket: 'SALON-124',
              beforeState: 'Inventory updates delayed by 10-15 minutes',
              afterState: 'Real-time inventory sync with 2-second update frequency',
              technicalDetails: 'Implemented WebSocket connection for real-time updates'
            }
          ],
          jiraTickets: ['SALON-123', 'SALON-124'],
          clientSatisfaction: 5,
          followUpRequired: false,
          businessImpact: 'critical',
          resolutionSummary: 'Successfully resolved critical payment gateway issues and inventory sync problems. Client operations back to normal with improved performance.',
          nextSteps: [
            'Monitor system performance for 48 hours',
            'Schedule follow-up call in 1 week',
            'Implement additional monitoring alerts'
          ]
        },
        {
          id: 'meeting-2',
          title: 'Monthly Platform Training & Feature Updates',
          clientName: 'Mike Chen',
          salonName: 'Elite Beauty Lounge',
          meetingType: 'training',
          scheduledDate: new Date('2024-01-10T14:00:00'),
          completedDate: new Date('2024-01-10T15:30:00'),
          duration: 90,
          status: 'completed',
          priority: 'medium',
          attendees: ['Mike Chen', 'Staff Team (3)', 'Product Trainer'],
          issuesFixed: [
            {
              id: 'issue-3',
              description: 'Staff confusion with new reporting interface',
              severity: 'medium',
              fixedDateTime: new Date('2024-01-10T15:00:00'),
              timeTakenHours: 0.5,
              jiraTicket: 'SALON-125',
              beforeState: 'Staff unable to generate weekly reports effectively',
              afterState: 'Staff trained on new interface, custom templates created',
              technicalDetails: 'Created simplified report templates, added guided tour feature'
            }
          ],
          jiraTickets: ['SALON-125', 'SALON-126'],
          clientSatisfaction: 4,
          followUpRequired: true,
          businessImpact: 'medium',
          resolutionSummary: 'Training completed successfully. Staff now proficient with new features. Custom report templates implemented.',
          nextSteps: [
            'Send training materials and recordings',
            'Schedule next month training session',
            'Implement additional dashboard widgets'
          ]
        }
      ];

      const mockJiraTickets: JiraTicketStatus[] = [
        {
          ticketKey: 'SALON-123',
          title: 'Fix payment gateway timeout configuration',
          status: 'Done',
          priority: 'Highest',
          assignee: 'Tech Lead',
          createdDate: new Date('2024-01-15T10:30:00'),
          completedDate: new Date('2024-01-15T11:15:00'),
          estimatedHours: 3,
          actualHours: 2.5,
          meetingId: 'meeting-1',
          url: 'https://yourdomain.atlassian.net/browse/SALON-123',
          lastUpdated: new Date('2024-01-15T11:15:00')
        },
        {
          ticketKey: 'SALON-124',
          title: 'Implement real-time inventory sync',
          status: 'Done',
          priority: 'High',
          assignee: 'Backend Developer',
          createdDate: new Date('2024-01-15T10:35:00'),
          completedDate: new Date('2024-01-15T11:25:00'),
          estimatedHours: 2,
          actualHours: 1.0,
          meetingId: 'meeting-1',
          url: 'https://yourdomain.atlassian.net/browse/SALON-124',
          lastUpdated: new Date('2024-01-15T11:25:00')
        },
        {
          ticketKey: 'SALON-125',
          title: 'Create simplified reporting templates',
          status: 'Done',
          priority: 'Medium',
          assignee: 'Frontend Developer',
          createdDate: new Date('2024-01-10T14:30:00'),
          completedDate: new Date('2024-01-10T15:00:00'),
          estimatedHours: 1,
          actualHours: 0.5,
          meetingId: 'meeting-2',
          url: 'https://yourdomain.atlassian.net/browse/SALON-125',
          lastUpdated: new Date('2024-01-10T15:00:00')
        },
        {
          ticketKey: 'SALON-126',
          title: 'Add guided tour for new dashboard features',
          status: 'In Progress',
          priority: 'Low',
          assignee: 'UX Designer',
          createdDate: new Date('2024-01-10T15:00:00'),
          estimatedHours: 4,
          actualHours: 2,
          meetingId: 'meeting-2',
          url: 'https://yourdomain.atlassian.net/browse/SALON-126',
          lastUpdated: new Date('2024-01-12T16:00:00')
        }
      ];

      setMeetings(mockMeetings);
      setJiraTickets(mockJiraTickets);
      setIsLoading(false);
    };

    if (isOpen) {
      loadReportData();
    }
  }, [isOpen]);

  // Filter meetings based on search and options
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    // Date range filter
    const now = new Date();
    const filterDate = new Date();
    switch (exportOptions.dateRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setFullYear(2020);
    }

    filtered = filtered.filter(meeting => meeting.completedDate >= filterDate);

    // Status filter
    if (exportOptions.statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === exportOptions.statusFilter);
    }

    // Client filter
    if (exportOptions.clientFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.clientName === exportOptions.clientFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.clientName.toLowerCase().includes(query) ||
        meeting.salonName.toLowerCase().includes(query) ||
        meeting.resolutionSummary.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.completedDate.getTime() - a.completedDate.getTime());
  }, [meetings, exportOptions, searchQuery]);

  // Generate comprehensive report
  const generateReport = useCallback(async () => {
    setIsLoading(true);
    
    const reportData = {
      metadata: {
        generatedDate: new Date().toISOString(),
        totalMeetings: filteredMeetings.length,
        dateRange: exportOptions.dateRange,
        filters: exportOptions
      },
      summary: {
        totalIssuesFixed: filteredMeetings.reduce((sum, meeting) => sum + meeting.issuesFixed.length, 0),
        totalJiraTickets: jiraTickets.length,
        completedTickets: jiraTickets.filter(ticket => ticket.status === 'Done').length,
        averageSatisfaction: filteredMeetings.reduce((sum, meeting) => sum + meeting.clientSatisfaction, 0) / filteredMeetings.length,
        totalTimeSpent: filteredMeetings.reduce((sum, meeting) => sum + meeting.duration, 0),
        businessImpactBreakdown: {
          critical: filteredMeetings.filter(m => m.businessImpact === 'critical').length,
          high: filteredMeetings.filter(m => m.businessImpact === 'high').length,
          medium: filteredMeetings.filter(m => m.businessImpact === 'medium').length,
          low: filteredMeetings.filter(m => m.businessImpact === 'low').length
        }
      },
      meetings: filteredMeetings.map(meeting => ({
        ...meeting,
        jiraDetails: exportOptions.includeJiraDetails ? 
          jiraTickets.filter(ticket => meeting.jiraTickets.includes(ticket.ticketKey)) : [],
        technicalDetails: exportOptions.includeTechnicalDetails ? meeting.issuesFixed : [],
        clientFeedback: exportOptions.includeClientFeedback ? {
          satisfaction: meeting.clientSatisfaction,
          followUpRequired: meeting.followUpRequired
        } : null
      })),
      jiraAnalysis: exportOptions.includeJiraDetails ? {
        totalTickets: jiraTickets.length,
        completionRate: (jiraTickets.filter(t => t.status === 'Done').length / jiraTickets.length) * 100,
        averageCompletionTime: jiraTickets
          .filter(t => t.completedDate)
          .reduce((sum, t) => sum + (t.completedDate!.getTime() - t.createdDate.getTime()), 0) / 
          jiraTickets.filter(t => t.completedDate).length,
        estimationAccuracy: jiraTickets
          .filter(t => t.actualHours && t.estimatedHours)
          .reduce((sum, t) => sum + Math.abs(t.estimatedHours - t.actualHours!), 0) / 
          jiraTickets.filter(t => t.actualHours).length
      } : null
    };

    // Generate different formats
    switch (exportOptions.format) {
      case 'excel':
        generateExcelReport(reportData);
        break;
      case 'csv':
        generateCSVReport(reportData);
        break;
      case 'pdf':
        generatePDFReport(reportData);
        break;
      case 'json':
        generateJSONReport(reportData);
        break;
    }

    setIsLoading(false);
  }, [filteredMeetings, jiraTickets, exportOptions]);

  const generateExcelReport = (data: any) => {
    // Create comprehensive Excel with multiple sheets
    const excelData = [
      // Summary Sheet
      ['MEETING REPORT SUMMARY'],
      ['Generated:', data.metadata.generatedDate],
      ['Date Range:', data.metadata.dateRange],
      ['Total Meetings:', data.summary.totalMeetings],
      [''],
      ['PERFORMANCE METRICS'],
      ['Total Issues Fixed:', data.summary.totalIssuesFixed],
      ['Total JIRA Tickets:', data.summary.totalJiraTickets],
      ['Completed Tickets:', data.summary.completedTickets],
      ['Average Satisfaction:', data.summary.averageSatisfaction.toFixed(2)],
      ['Total Time Spent (mins):', data.summary.totalTimeSpent],
      [''],
      ['BUSINESS IMPACT BREAKDOWN'],
      ['Critical:', data.summary.businessImpactBreakdown.critical],
      ['High:', data.summary.businessImpactBreakdown.high],
      ['Medium:', data.summary.businessImpactBreakdown.medium],
      ['Low:', data.summary.businessImpactBreakdown.low],
      [''],
      ['DETAILED MEETINGS'],
      ['Meeting ID', 'Title', 'Client', 'Salon', 'Date', 'Duration', 'Issues Fixed', 'JIRA Tickets', 'Satisfaction', 'Business Impact', 'Resolution Summary'],
      ...data.meetings.map((meeting: any) => [
        meeting.id,
        meeting.title,
        meeting.clientName,
        meeting.salonName,
        meeting.completedDate,
        meeting.duration,
        meeting.issuesFixed.length,
        meeting.jiraTickets.length,
        meeting.clientSatisfaction,
        meeting.businessImpact,
        meeting.resolutionSummary
      ]),
      [''],
      ['ISSUES FIXED DETAILS'],
      ['Meeting ID', 'Issue Description', 'Severity', 'Fixed Date', 'Time Taken (hrs)', 'JIRA Ticket', 'Before State', 'After State', 'Technical Details'],
      ...data.meetings.flatMap((meeting: any) => 
        meeting.issuesFixed.map((issue: any) => [
          meeting.id,
          issue.description,
          issue.severity,
          issue.fixedDateTime,
          issue.timeTakenHours,
          issue.jiraTicket || 'N/A',
          issue.beforeState,
          issue.afterState,
          issue.technicalDetails
        ])
      ),
      [''],
      ['JIRA TICKETS DETAILS'],
      ['Ticket Key', 'Title', 'Status', 'Priority', 'Assignee', 'Created', 'Completed', 'Estimated Hours', 'Actual Hours', 'Meeting ID'],
      ...data.meetings.flatMap((meeting: any) => 
        meeting.jiraDetails?.map((ticket: any) => [
          ticket.ticketKey,
          ticket.title,
          ticket.status,
          ticket.priority,
          ticket.assignee,
          ticket.createdDate,
          ticket.completedDate || 'Not Completed',
          ticket.estimatedHours,
          ticket.actualHours || 'N/A',
          ticket.meetingId
        ]) || []
      )
    ];

    const csvContent = excelData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meeting-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateCSVReport = (data: any) => {
    const csvData = [
      ['Meeting Report - ' + new Date().toLocaleDateString()],
      ['Meeting ID', 'Title', 'Client', 'Salon', 'Date', 'Duration', 'Status', 'Issues Fixed', 'JIRA Tickets', 'Satisfaction'],
      ...data.meetings.map((meeting: any) => [
        meeting.id,
        meeting.title,
        meeting.clientName,
        meeting.salonName,
        meeting.completedDate.toLocaleDateString(),
        meeting.duration,
        meeting.status,
        meeting.issuesFixed.length,
        meeting.jiraTickets.length,
        meeting.clientSatisfaction
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meeting-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generatePDFReport = (data: any) => {
    // For PDF, create a formatted HTML content that can be printed
    const htmlContent = `
      <html>
        <head>
          <title>Meeting Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; color: #333; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
            .meeting { border: 1px solid #ddd; margin: 15px 0; padding: 15px; }
            .issue { background: #fff3cd; padding: 10px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Meeting & JIRA Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Meetings:</strong> ${data.summary.totalMeetings}</p>
            <p><strong>Issues Fixed:</strong> ${data.summary.totalIssuesFixed}</p>
            <p><strong>JIRA Tickets:</strong> ${data.summary.totalJiraTickets}</p>
            <p><strong>Average Satisfaction:</strong> ${data.summary.averageSatisfaction.toFixed(2)}/5</p>
          </div>
          
          ${data.meetings.map((meeting: any) => `
            <div class="meeting">
              <h3>${meeting.title}</h3>
              <p><strong>Client:</strong> ${meeting.clientName} (${meeting.salonName})</p>
              <p><strong>Date:</strong> ${meeting.completedDate.toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
              <p><strong>Satisfaction:</strong> ${meeting.clientSatisfaction}/5</p>
              <p><strong>Resolution:</strong> ${meeting.resolutionSummary}</p>
              
              <h4>Issues Fixed:</h4>
              ${meeting.issuesFixed.map((issue: any) => `
                <div class="issue">
                  <p><strong>${issue.description}</strong></p>
                  <p>Severity: ${issue.severity} | Time: ${issue.timeTakenHours}h | JIRA: ${issue.jiraTicket || 'N/A'}</p>
                  <p><strong>Before:</strong> ${issue.beforeState}</p>
                  <p><strong>After:</strong> ${issue.afterState}</p>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meeting-report-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
  };

  const generateJSONReport = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meeting-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Update JIRA ticket status
  const updateJiraTicketStatus = useCallback(async (ticketKey: string, newStatus: string) => {
    setIsLoading(true);
    
    // Simulate API call to update JIRA
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setJiraTickets(prev => prev.map(ticket => 
      ticket.ticketKey === ticketKey 
        ? { 
            ...ticket, 
            status: newStatus as any,
            completedDate: newStatus === 'Done' ? new Date() : undefined,
            lastUpdated: new Date()
          }
        : ticket
    ));
    
    setIsLoading(false);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Meeting & JIRA Report Exporter</h2>
                <p className="text-sm text-gray-600">Export detailed meeting reports with JIRA integration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Export Options */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50/50 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
              
              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'excel', icon: FileSpreadsheet, label: 'Excel' },
                    { value: 'csv', icon: FileText, label: 'CSV' },
                    { value: 'pdf', icon: FilePdf, label: 'PDF' },
                    { value: 'json', icon: FileImage, label: 'JSON' }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: value as any }))}
                      className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                        exportOptions.format === value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Include in Report</label>
                <div className="space-y-3">
                  {[
                    { key: 'includeJiraDetails', label: 'JIRA Ticket Details' },
                    { key: 'includeClientFeedback', label: 'Client Feedback & Satisfaction' },
                    { key: 'includeTechnicalDetails', label: 'Technical Fix Details' },
                    { key: 'includeTimeline', label: 'Timeline & Duration Analysis' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportOptions[key as keyof ExportOptions] as boolean}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Filters</label>
                <div className="space-y-3">
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                  
                  <select
                    value={exportOptions.statusFilter}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, statusFilter: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed Only</option>
                    <option value="cancelled">Cancelled Only</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateReport}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Right Panel - Preview & JIRA Management */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search meetings, clients, issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Total Meetings</p>
                            <p className="text-2xl font-bold">{filteredMeetings.length}</p>
                          </div>
                          <Calendar className="w-6 h-6 text-blue-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Issues Fixed</p>
                            <p className="text-2xl font-bold">
                              {filteredMeetings.reduce((sum, meeting) => sum + meeting.issuesFixed.length, 0)}
                            </p>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">JIRA Tickets</p>
                            <p className="text-2xl font-bold">{jiraTickets.length}</p>
                          </div>
                          <Tag className="w-6 h-6 text-purple-200" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm">Avg Satisfaction</p>
                            <p className="text-2xl font-bold">
                              {filteredMeetings.length > 0 
                                ? (filteredMeetings.reduce((sum, meeting) => sum + meeting.clientSatisfaction, 0) / filteredMeetings.length).toFixed(1)
                                : '0'}
                            </p>
                          </div>
                          <TrendingUp className="w-6 h-6 text-orange-200" />
                        </div>
                      </div>
                    </div>

                    {/* JIRA Tickets Management */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <span>JIRA Tickets Management</span>
                      </h3>
                      
                      <div className="space-y-3">
                        {jiraTickets.map((ticket) => (
                          <div key={ticket.ticketKey} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <a
                                  href={ticket.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 hover:text-blue-800 underline"
                                >
                                  {ticket.ticketKey}
                                </a>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  ticket.status === 'Done' ? 'bg-green-100 text-green-800' :
                                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {ticket.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  ticket.priority === 'Highest' || ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                                  ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {ticket.priority}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-1">{ticket.title}</p>
                              <p className="text-sm text-gray-500">
                                Assignee: {ticket.assignee} | 
                                Created: {ticket.createdDate.toLocaleDateString()} |
                                {ticket.completedDate && ` Completed: ${ticket.completedDate.toLocaleDateString()}`}
                              </p>
                            </div>
                            
                            {ticket.status !== 'Done' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateJiraTicketStatus(ticket.ticketKey, 'Done')}
                                className="ml-4 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Mark Done
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meetings Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-green-600" />
                        <span>Meetings Preview ({filteredMeetings.length})</span>
                      </h3>
                      
                      <div className="space-y-4">
                        {filteredMeetings.slice(0, 5).map((meeting) => (
                          <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                meeting.businessImpact === 'critical' ? 'bg-red-100 text-red-800' :
                                meeting.businessImpact === 'high' ? 'bg-orange-100 text-orange-800' :
                                meeting.businessImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {meeting.businessImpact} impact
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {meeting.clientName} ({meeting.salonName}) • {meeting.completedDate.toLocaleDateString()} • {meeting.duration}min
                            </p>
                            <p className="text-sm text-gray-700 mb-2">{meeting.resolutionSummary}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{meeting.issuesFixed.length} issues fixed</span>
                              <span>{meeting.jiraTickets.length} JIRA tickets</span>
                              <span>Satisfaction: {meeting.clientSatisfaction}/5</span>
                            </div>
                          </div>
                        ))}
                        
                        {filteredMeetings.length > 5 && (
                          <p className="text-sm text-gray-500 text-center">
                            And {filteredMeetings.length - 5} more meetings...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MeetingReportExporter; 