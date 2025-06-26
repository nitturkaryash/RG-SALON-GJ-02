import React, { useState } from 'react';
import { 
  Calendar, Clock, Users, Video, Plus, X, 
  FileText, AlertCircle, CheckCircle
} from 'lucide-react';

interface MeetingSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
}

interface MeetingData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  meetingType: 'support' | 'training' | 'consultation' | 'demo';
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  clientEmail
}) => {
  const [meetingData, setMeetingData] = useState<MeetingData>({
    title: 'Technical Support Session',
    description: 'Scheduled meeting for client support',
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    attendees: clientEmail ? [clientEmail] : [],
    priority: 'medium',
    meetingType: 'support'
  });
  
  const [agenda, setAgenda] = useState<string[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleScheduleMeeting = async () => {
    setIsScheduling(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with Google Meet API and JIRA
      console.log('Meeting scheduled:', {
        ...meetingData,
        agenda,
        clientId,
        meetLink: `https://meet.google.com/abc-defg-hij`
      });
      
      alert('Meeting scheduled successfully! Google Meet link created and JIRA issue tracked.');
      onClose();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const addAgendaItem = () => {
    if (newAgendaItem.trim()) {
      setAgenda([...agenda, newAgendaItem.trim()]);
      setNewAgendaItem('');
    }
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Schedule Google Meet
            </h2>
            {clientName && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {clientName}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <select
              value={meetingData.meetingType}
              onChange={(e) => setMeetingData(prev => ({ ...prev, meetingType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="support">Technical Support</option>
              <option value="training">Training Session</option>
              <option value="consultation">Business Consultation</option>
              <option value="demo">Product Demo</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter meeting title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={meetingData.description}
              onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Meeting description and objectives"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={meetingData.startTime}
                onChange={(e) => setMeetingData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={meetingData.endTime}
                onChange={(e) => setMeetingData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={meetingData.priority}
              onChange={(e) => setMeetingData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Agenda
            </label>
            <div className="space-y-2">
              {agenda.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => removeAgendaItem(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAgendaItem}
                  onChange={(e) => setNewAgendaItem(e.target.value)}
                  placeholder="Add agenda item"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addAgendaItem()}
                />
                <button
                  onClick={addAgendaItem}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Integration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Integrations</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Google Meet link will be automatically created</li>
                  <li>• JIRA issue will be created for meeting tracking</li>
                  <li>• Calendar invites will be sent to all attendees</li>
                  <li>• Meeting notes will be tracked for reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {clientId ? `Client: ${clientId}` : 'No client selected'}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleScheduleMeeting}
              disabled={isScheduling}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Schedule Meet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler; 