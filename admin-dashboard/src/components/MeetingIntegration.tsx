import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Calendar, Clock, Video, Users, FileText, Plus,
  Search, Filter, Download, Settings, ExternalLink,
  PlayCircle, Edit, CheckCircle, AlertCircle, User, 
  Building, Tag, Zap, TrendingUp, Activity, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MeetingScheduler from './MeetingScheduler';
import MeetingHistory from './MeetingHistory';
import MeetingReportExporter from './MeetingReportExporter';

interface Client {
  id: string;
  name: string;
  salonName: string;
  email: string;
  phone: string;
  timezone: string;
  subscriptionPlan: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface MeetingStats {
  totalMeetings: number;
  completedMeetings: number;
  upcomingMeetings: number;
  averageDuration: number;
  averageSatisfaction: number;
  totalJiraIssues: number;
  pendingActionItems: number;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  clientName: string;
  salonName: string;
  scheduledTime: Date;
  duration: number;
  meetingType: 'support' | 'training' | 'consultation' | 'demo';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  meetingUrl?: string;
  attendees: string[];
  agenda: string[];
  preparationNotes: string;
}

// Memoized Stats Card Component
const StatsCard = memo(({ title, value, subtitle, icon: Icon, gradient, textColor = "text-white" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  gradient: string;
  textColor?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    className={`${gradient} rounded-xl p-6 ${textColor} shadow-lg backdrop-blur-sm border border-white/20`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-80 mb-1">{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
      </div>
      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
));

// Memoized Meeting Card Component
const MeetingCard = memo(({ meeting, onJoinMeeting }: {
  meeting: UpcomingMeeting;
  onJoinMeeting: (url: string) => void;
}) => {
  const timeUntilMeeting = useMemo(() => {
    const now = new Date();
    const diff = meeting.scheduledTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return { text: 'Overdue', urgent: true };
    if (hours < 1) return { text: `${minutes}m`, urgent: minutes < 30 };
    if (hours < 24) return { text: `${hours}h ${minutes}m`, urgent: hours < 2 };
    const days = Math.floor(hours / 24);
    return { text: `${days}d ${hours % 24}h`, urgent: false };
  }, [meeting.scheduledTime]);

  const priorityConfig = useMemo(() => ({
    urgent: { bg: 'bg-red-500', text: 'text-red-100', glow: 'shadow-red-500/30' },
    high: { bg: 'bg-orange-500', text: 'text-orange-100', glow: 'shadow-orange-500/30' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-100', glow: 'shadow-yellow-500/30' },
    low: { bg: 'bg-green-500', text: 'text-green-100', glow: 'shadow-green-500/30' }
  }), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityConfig[meeting.priority].bg} ${priorityConfig[meeting.priority].text} shadow-lg ${priorityConfig[meeting.priority].glow}`}>
              {meeting.priority}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
              {meeting.meetingType}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-500" />
              <span>{meeting.salonName}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>{meeting.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{meeting.scheduledTime.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className={`font-bold ${timeUntilMeeting.urgent ? 'text-red-600' : 'text-blue-600'}`}>
                In: {timeUntilMeeting.text}
              </span>
            </div>
          </div>
          
          {meeting.preparationNotes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-3"
            >
              <p className="text-sm font-medium text-yellow-800 mb-1">📝 Preparation Notes:</p>
              <p className="text-sm text-yellow-700">{meeting.preparationNotes}</p>
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {meeting.meetingUrl && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onJoinMeeting(meeting.meetingUrl!)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-green-500/30"
            >
              <Video className="w-4 h-4" />
              <span>Join</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const MeetingIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'history' | 'reports' | 'settings'>('dashboard');
  const [showScheduler, setShowScheduler] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReportExporter, setShowReportExporter] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [meetingStats, setMeetingStats] = useState<MeetingStats | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Optimized data loading with loading state
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: MeetingStats = {
        totalMeetings: 156,
        completedMeetings: 142,
        upcomingMeetings: 14,
        averageDuration: 65,
        averageSatisfaction: 4.3,
        totalJiraIssues: 89,
        pendingActionItems: 23
      };

      const mockUpcomingMeetings: UpcomingMeeting[] = [
        {
          id: '1',
          title: 'Weekly Check-in & Support',
          clientName: 'Sarah Johnson',
          salonName: 'Glamour Salon',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          duration: 30,
          meetingType: 'support',
          priority: 'high',
          meetingUrl: 'https://meet.google.com/abc-123',
          attendees: ['Sarah Johnson', 'Support Team'],
          agenda: ['Review weekly metrics', 'Address technical issues'],
          preparationNotes: 'Client mentioned POS integration issues last week. Check SALON-156 status.'
        },
        {
          id: '2',
          title: 'Platform Training Session',
          clientName: 'Mike Chen',
          salonName: 'Elite Beauty Lounge',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 60,
          meetingType: 'training',
          priority: 'medium',
          meetingUrl: 'https://meet.google.com/def-456',
          attendees: ['Mike Chen', 'Staff Team', 'Trainer'],
          agenda: ['New inventory features', 'Advanced reporting'],
          preparationNotes: 'Prepare demo environment with latest features.'
        },
        {
          id: '3',
          title: 'Emergency Support Call',
          clientName: 'Lisa Rodriguez',
          salonName: 'Bella Vista Spa',
          scheduledTime: new Date(Date.now() + 30 * 60 * 1000),
          duration: 45,
          meetingType: 'support',
          priority: 'urgent',
          meetingUrl: 'https://meet.google.com/ghi-789',
          attendees: ['Lisa Rodriguez', 'Emergency Support'],
          agenda: ['Resolve payment issue', 'Check connectivity'],
          preparationNotes: 'CRITICAL: Payment gateway down. SALON-201 created.'
        }
      ];

      const mockClients: Client[] = [
        {
          id: 'client-1',
          name: 'Sarah Johnson',
          salonName: 'Glamour Salon',
          email: 'sarah@glamoursalon.com',
          phone: '+1 (555) 123-4567',
          timezone: 'EST',
          subscriptionPlan: 'Professional',
          status: 'active'
        },
        {
          id: 'client-2',
          name: 'Mike Chen',
          salonName: 'Elite Beauty Lounge',
          email: 'mike@elitebeauty.com',
          phone: '+1 (555) 234-5678',
          timezone: 'PST',
          subscriptionPlan: 'Enterprise',
          status: 'active'
        },
        {
          id: 'client-3',
          name: 'Lisa Rodriguez',
          salonName: 'Bella Vista Spa',
          email: 'lisa@bellavista.com',
          phone: '+1 (555) 345-6789',
          timezone: 'CST',
          subscriptionPlan: 'Professional',
          status: 'active'
        }
      ];

      setMeetingStats(mockStats);
      setUpcomingMeetings(mockUpcomingMeetings);
      setClients(mockClients);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Memoized filtered meetings
  const filteredMeetings = useMemo(() => {
    if (filterType === 'all') return upcomingMeetings;
    return upcomingMeetings.filter(meeting => meeting.meetingType === filterType);
  }, [upcomingMeetings, filterType]);

  // Memoized callbacks
  const joinMeeting = useCallback((meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  }, []);

  const handleSchedulerOpen = useCallback(() => setShowScheduler(true), []);
  const handleSchedulerClose = useCallback(() => setShowScheduler(false), []);
  const handleHistoryOpen = useCallback(() => setShowHistory(true), []);
  const handleHistoryClose = useCallback(() => setShowHistory(false), []);
  const handleReportExporterOpen = useCallback(() => setShowReportExporter(true), []);
  const handleReportExporterClose = useCallback(() => setShowReportExporter(false), []);

  const exportMeetingData = useCallback(() => {
    setShowReportExporter(true);
  }, []);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Enhanced Stats Cards */}
      {meetingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Meetings"
            value={meetingStats.totalMeetings}
            icon={Calendar}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Completed"
            value={meetingStats.completedMeetings}
            subtitle={`${Math.round((meetingStats.completedMeetings / meetingStats.totalMeetings) * 100)}% success rate`}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Avg Duration"
            value={`${meetingStats.averageDuration}m`}
            subtitle="per meeting"
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
          />
          <StatsCard
            title="Satisfaction"
            value={`${meetingStats.averageSatisfaction}/5`}
            subtitle="⭐⭐⭐⭐⭐"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />
        </div>
      )}

      {/* Enhanced Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSchedulerOpen}
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Schedule Meeting</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleHistoryOpen}
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">View History</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReportExporterOpen}
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Export Reports</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportMeetingData}
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Quick Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Upcoming Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30"
      >
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Upcoming Meetings
            </h2>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
            >
              <option value="all">All Types</option>
              <option value="support">Support</option>
              <option value="training">Training</option>
              <option value="consultation">Consultation</option>
              <option value="demo">Demo</option>
            </select>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <AnimatePresence>
            {filteredMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoinMeeting={joinMeeting}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced Integration Cards */}
      {meetingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">JIRA Integration</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Issues</span>
                <span className="font-semibold text-gray-900">{meetingStats.totalJiraIssues}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">From Meetings</span>
                <span className="font-semibold text-gray-900">{Math.floor(meetingStats.totalJiraIssues * 0.7)}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Items</span>
                <span className="font-semibold text-red-600">{meetingStats.pendingActionItems}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Meeting Management Center
            </h1>
            <p className="text-gray-600 mt-1">
              Centralized meeting scheduling, history tracking, JIRA integration & detailed reporting
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSchedulerOpen}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Meeting</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReportExporterOpen}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2 border border-white/30 inline-flex">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: Calendar },
              { key: 'schedule', label: 'Schedule', icon: Plus },
              { key: 'history', label: 'History', icon: Clock },
              { key: 'reports', label: 'Reports', icon: BarChart3 },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[600px]"
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'schedule' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <MeetingScheduler isOpen={true} onClose={() => setActiveTab('dashboard')} />
              </div>
            )}
            {activeTab === 'history' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <MeetingHistory isOpen={true} onClose={() => setActiveTab('dashboard')} />
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <MeetingReportExporter isOpen={true} onClose={() => setActiveTab('dashboard')} />
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Meeting & JIRA Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Meeting Duration
                    </label>
                    <select className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm">
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      JIRA Integration & Reporting
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Auto-create JIRA issues from action items</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Include JIRA details in meeting reports</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Auto-mark JIRA tickets as done when meeting completed</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Send automated reports to clients after meetings</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Report Export Settings
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Include technical fix details in reports</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Include client satisfaction scores</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="ml-3 text-sm text-gray-600">Auto-generate weekly summary reports</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {showScheduler && (
            <MeetingScheduler isOpen={showScheduler} onClose={handleSchedulerClose} />
          )}
          {showHistory && (
            <MeetingHistory isOpen={showHistory} onClose={handleHistoryClose} />
          )}
          {showReportExporter && (
            <MeetingReportExporter isOpen={showReportExporter} onClose={handleReportExporterClose} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default memo(MeetingIntegration); 