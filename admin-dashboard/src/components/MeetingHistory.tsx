import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Calendar, Clock, Users, Video, FileText, ExternalLink,
  Filter, Search, Eye, Download, Tag, CheckCircle,
  AlertCircle, XCircle, PlayCircle, User, Building,
  ChevronDown, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetingHistoryItem {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  salonName: string;
  meetingType: 'support' | 'training' | 'consultation' | 'demo';
  scheduledDate: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attendees: string[];
  agenda: string[];
  discussionPoints: string[];
  actionItems: ActionItem[];
  decisions: string[];
  nextSteps: string[];
  jiraIssues: JiraIssueLink[];
  recordingUrl?: string;
  notes: string;
  satisfaction?: number; // 1-5 rating
  followUpRequired: boolean;
  followUpDate?: Date;
}

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jiraTicket?: string;
}

interface JiraIssueLink {
  issueKey: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  createdDate: Date;
  url: string;
}

interface MeetingHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClientId?: string;
}

// Memoized Meeting List Item Component
const MeetingListItem = memo(({ meeting, isSelected, onClick }: {
  meeting: MeetingHistoryItem;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const statusConfig = useMemo(() => ({
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    'no-show': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle }
  }), []);

  const StatusIcon = statusConfig[meeting.status]?.icon || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-sm' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{meeting.title}</h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <Building className="w-4 h-4" />
              <span className="truncate">{meeting.salonName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="truncate">{meeting.clientName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{meeting.scheduledDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{meeting.duration}m</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[meeting.status]?.bg} ${statusConfig[meeting.status]?.text}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{meeting.status}</span>
          </div>
          {meeting.satisfaction && (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < meeting.satisfaction! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span>{meeting.actionItems.length} action items</span>
          <span>{meeting.jiraIssues.length} JIRA issues</span>
        </div>
        {meeting.followUpRequired && (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Follow-up</span>
        )}
      </div>
    </motion.div>
  );
});

// Memoized Detail Section Component
const DetailSection = memo(({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const MeetingHistory: React.FC<MeetingHistoryProps> = ({ isOpen, onClose, selectedClientId }) => {
  const [meetings, setMeetings] = useState<MeetingHistoryItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>(selectedClientId || 'all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data loading with loading state
  useEffect(() => {
    const loadMeetings = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockMeetings: MeetingHistoryItem[] = [
        {
          id: '1',
          title: 'POS System Integration Support',
          clientId: 'client-1',
          clientName: 'Sarah Johnson',
          salonName: 'Glamour Salon',
          meetingType: 'support',
          scheduledDate: new Date('2024-01-15T10:00:00'),
          actualStartTime: new Date('2024-01-15T10:05:00'),
          actualEndTime: new Date('2024-01-15T11:15:00'),
          duration: 70,
          status: 'completed',
          priority: 'urgent',
          attendees: ['Sarah Johnson', 'Admin Support', 'Tech Team Lead'],
          agenda: [
            'Review POS integration issues',
            'Test payment gateway connection',
            'Configure inventory sync',
            'Train staff on new features'
          ],
          discussionPoints: [
            'Payment gateway was misconfigured',
            'Inventory sync requires manual trigger',
            'Staff needs training on new interface',
            'Client wants automated daily reports'
          ],
          actionItems: [
            {
              id: 'ai-1',
              description: 'Fix payment gateway configuration',
              assignee: 'Tech Team Lead',
              dueDate: new Date('2024-01-16T17:00:00'),
              status: 'completed',
              priority: 'urgent',
              jiraTicket: 'SALON-123'
            },
            {
              id: 'ai-2',
              description: 'Set up automated inventory sync',
              assignee: 'Backend Developer',
              dueDate: new Date('2024-01-18T17:00:00'),
              status: 'in-progress',
              priority: 'high',
              jiraTicket: 'SALON-124'
            }
          ],
          decisions: [
            'Implement automated daily reports feature',
            'Schedule weekly check-ins for first month',
            'Provide 24/7 support for first week'
          ],
          nextSteps: [
            'Follow up on action items completion',
            'Schedule staff training',
            'Monitor system performance for 1 week'
          ],
          jiraIssues: [
            {
              issueKey: 'SALON-123',
              title: 'Fix payment gateway configuration',
              status: 'Done',
              priority: 'Urgent',
              assignee: 'Tech Team Lead',
              createdDate: new Date('2024-01-15T11:20:00'),
              url: 'https://yourdomain.atlassian.net/browse/SALON-123'
            }
          ],
          recordingUrl: 'https://meet.google.com/recording/abc123',
          notes: 'Client was very satisfied with the quick resolution. Payment gateway issue was critical for their business operations.',
          satisfaction: 5,
          followUpRequired: true,
          followUpDate: new Date('2024-01-22T10:00:00')
        },
        {
          id: '2',
          title: 'Monthly Platform Training',
          clientId: 'client-2',
          clientName: 'Mike Chen',
          salonName: 'Elite Beauty Lounge',
          meetingType: 'training',
          scheduledDate: new Date('2024-01-10T14:00:00'),
          actualStartTime: new Date('2024-01-10T14:00:00'),
          actualEndTime: new Date('2024-01-10T15:30:00'),
          duration: 90,
          status: 'completed',
          priority: 'medium',
          attendees: ['Mike Chen', 'Staff Member 1', 'Staff Member 2', 'Trainer'],
          agenda: [
            'New feature overview',
            'Inventory management training',
            'Customer management best practices'
          ],
          discussionPoints: [
            'Staff found new features intuitive',
            'Inventory management workflow improved',
            'Need more advanced reporting features'
          ],
          actionItems: [
            {
              id: 'ai-4',
              description: 'Create advanced reporting documentation',
              assignee: 'Documentation Team',
              dueDate: new Date('2024-01-15T17:00:00'),
              status: 'completed',
              priority: 'medium',
              jiraTicket: 'SALON-126'
            }
          ],
          decisions: [
            'Schedule monthly training sessions',
            'Provide video tutorials for new features'
          ],
          nextSteps: [
            'Send training materials to client',
            'Schedule next month training'
          ],
          jiraIssues: [
            {
              issueKey: 'SALON-126',
              title: 'Advanced reporting documentation',
              status: 'Done',
              priority: 'Medium',
              assignee: 'Documentation Team',
              createdDate: new Date('2024-01-10T15:35:00'),
              url: 'https://yourdomain.atlassian.net/browse/SALON-126'
            }
          ],
          notes: 'Great training session. Staff was engaged and asked good questions.',
          satisfaction: 4,
          followUpRequired: true,
          followUpDate: new Date('2024-02-10T14:00:00')
        }
      ];

      setMeetings(mockMeetings);
      setIsLoading(false);
    };

    loadMeetings();
  }, []);

  // Optimized filtering with useMemo
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    if (clientFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.clientId === clientFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.clientName.toLowerCase().includes(query) ||
        meeting.salonName.toLowerCase().includes(query) ||
        meeting.notes.toLowerCase().includes(query)
      );
    }

    // Date range filter
    const now = new Date();
    const filterDate = new Date();
    switch (dateRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        filterDate.setFullYear(2020);
    }

    filtered = filtered.filter(meeting => meeting.scheduledDate >= filterDate);
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }, [meetings, clientFilter, statusFilter, searchQuery, dateRange]);

  const handleMeetingSelect = useCallback((meeting: MeetingHistoryItem) => {
    setSelectedMeeting(meeting);
  }, []);

  const exportMeetingHistory = useCallback(() => {
    const csvData = [
      ['Meeting History Report'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Meeting ID', 'Title', 'Client', 'Salon', 'Date', 'Duration', 'Status', 'Priority', 'Satisfaction'],
      ...filteredMeetings.map(meeting => [
        meeting.id,
        meeting.title,
        meeting.clientName,
        meeting.salonName,
        meeting.scheduledDate.toLocaleDateString(),
        `${meeting.duration} mins`,
        meeting.status,
        meeting.priority,
        meeting.satisfaction || 'N/A'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredMeetings]);

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
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Meeting History & Tracking</h2>
                <p className="text-sm text-gray-600">Complete meeting records with JIRA integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportMeetingHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Enhanced Sidebar - Meeting List */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col bg-gray-50/50">
              {/* Enhanced Filters */}
              <div className="p-4 border-b border-gray-200 space-y-4 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search meetings, clients, salons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                  
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="all">All Time</option>
                  </select>
                  
                  <select
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/80"
                  >
                    <option value="all">All Clients</option>
                    <option value="client-1">Glamour Salon</option>
                    <option value="client-2">Elite Beauty</option>
                  </select>
                </div>
              </div>

              {/* Meeting List with Loading State */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading meeting history...</p>
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No meetings found</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredMeetings.map((meeting) => (
                      <MeetingListItem
                        key={meeting.id}
                        meeting={meeting}
                        isSelected={selectedMeeting?.id === meeting.id}
                        onClick={() => handleMeetingSelect(meeting)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Enhanced Main Content - Meeting Details */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedMeeting ? (
                <>
                  {/* Meeting Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{selectedMeeting.title}</h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4 text-purple-500" />
                            <span>{selectedMeeting.salonName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-blue-500" />
                            <span>{selectedMeeting.clientName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span>{selectedMeeting.scheduledDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span>{selectedMeeting.duration} minutes</span>
                          </div>
                        </div>
                        
                        {selectedMeeting.satisfaction && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Satisfaction:</span>
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < selectedMeeting.satisfaction! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({selectedMeeting.satisfaction}/5)</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {selectedMeeting.recordingUrl && (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            href={selectedMeeting.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                          >
                            <Video className="w-4 h-4" />
                            <span>Recording</span>
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Meeting Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                    {/* Discussion Points */}
                    {selectedMeeting.discussionPoints.length > 0 && (
                      <DetailSection title="What We Discussed" icon={Users}>
                        <ul className="space-y-3">
                          {selectedMeeting.discussionPoints.map((point, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <span className="text-gray-700 flex-1">{point}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </DetailSection>
                    )}

                    {/* Action Items */}
                    {selectedMeeting.actionItems.length > 0 && (
                      <DetailSection title="Action Items" icon={CheckCircle}>
                        <div className="space-y-4">
                          {selectedMeeting.actionItems.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-medium text-gray-900 flex-1">{item.description}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Assignee:</span> {item.assignee}
                                </div>
                                <div>
                                  <span className="font-medium">Due:</span> {item.dueDate.toLocaleDateString()}
                                </div>
                                {item.jiraTicket && (
                                  <div className="col-span-2 flex items-center space-x-1">
                                    <span className="font-medium">JIRA:</span>
                                    <a
                                      href={`https://yourdomain.atlassian.net/browse/${item.jiraTicket}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                                    >
                                      <span>{item.jiraTicket}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </DetailSection>
                    )}

                    {/* JIRA Issues */}
                    {selectedMeeting.jiraIssues.length > 0 && (
                      <DetailSection title="JIRA Issues" icon={Tag}>
                        <div className="space-y-3">
                          {selectedMeeting.jiraIssues.map((issue, index) => (
                            <motion.div
                              key={issue.issueKey}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Tag className="w-4 h-4 text-gray-500" />
                                  <a
                                    href={issue.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {issue.issueKey}
                                  </a>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  {issue.status}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">{issue.title}</h4>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Assignee:</span> {issue.assignee}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </DetailSection>
                    )}

                    {/* Meeting Notes */}
                    {selectedMeeting.notes && (
                      <DetailSection title="Meeting Notes" icon={FileText}>
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedMeeting.notes}
                          </p>
                        </div>
                      </DetailSection>
                    )}

                    {/* Follow-up */}
                    {selectedMeeting.followUpRequired && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-orange-900">Follow-up Required</h3>
                        </div>
                        {selectedMeeting.followUpDate && (
                          <p className="text-orange-800">
                            Scheduled for: {selectedMeeting.followUpDate.toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50/30">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-12 h-12 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a meeting
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                      Choose a meeting from the list to view detailed information, action items, and JIRA integration
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(MeetingHistory); 