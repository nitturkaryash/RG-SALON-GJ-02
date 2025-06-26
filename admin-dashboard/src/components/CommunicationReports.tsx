import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, BarChart as BarChartIcon, Users, Clock, 
  TrendingUp, X, Filter, Calendar
} from 'lucide-react';

interface CommunicationReportsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunicationReports: React.FC<CommunicationReportsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'clients'>('overview');
  const [dateRange, setDateRange] = useState('month');

  // Mock data for demonstration
  const meetingData = [
    { date: '2024-01-01', meetings: 12, duration: 720, resolved: 8 },
    { date: '2024-01-02', meetings: 15, duration: 900, resolved: 11 },
    { date: '2024-01-03', meetings: 8, duration: 480, resolved: 6 },
    { date: '2024-01-04', meetings: 18, duration: 1080, resolved: 14 },
    { date: '2024-01-05', meetings: 10, duration: 600, resolved: 7 },
    { date: '2024-01-06', meetings: 14, duration: 840, resolved: 10 },
    { date: '2024-01-07', meetings: 16, duration: 960, resolved: 12 }
  ];

  const clientActivity = [
    { clientName: 'Glamour Salon', meetings: 25, duration: 1500, satisfaction: 4.8, issues: 5 },
    { clientName: 'Elite Beauty', meetings: 18, duration: 1080, satisfaction: 4.6, issues: 3 },
    { clientName: 'Style Studio', meetings: 22, duration: 1320, satisfaction: 4.9, issues: 2 },
    { clientName: 'Beauty Hub', meetings: 15, duration: 900, satisfaction: 4.5, issues: 4 },
    { clientName: 'Salon Pro', meetings: 12, duration: 720, satisfaction: 4.7, issues: 1 }
  ];

  const meetingTypes = [
    { name: 'Support', value: 45, color: '#8B5CF6' },
    { name: 'Training', value: 25, color: '#06B6D4' },
    { name: 'Consultation', value: 20, color: '#10B981' },
    { name: 'Demo', value: 10, color: '#F59E0B' }
  ];

  const exportReport = () => {
    const csvData = [
      ['Communication Report'],
      [`Period: Last ${dateRange}`],
      [''],
      ['Summary'],
      ['Total Meetings', '103'],
      ['Total Duration (hours)', '103'],
      ['Average Meeting Duration', '60 minutes'],
      [''],
      ['Meeting Types'],
      ...meetingTypes.map(type => [type.name, type.value]),
      [''],
      ['Client Activity'],
      ['Client', 'Meetings', 'Duration (hours)', 'Satisfaction', 'Open Issues'],
      ...clientActivity.map(client => [
        client.clientName,
        client.meetings,
        Math.round(client.duration / 60),
        client.satisfaction,
        client.issues
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChartIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Communication Reports & Analytics
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChartIcon },
              { id: 'meetings', label: 'Meeting Analytics', icon: Calendar },
              { id: 'clients', label: 'Client Insights', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <span className="text-sm text-gray-500">
              Showing data for the last {dateRange}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Meetings</p>
                      <p className="text-3xl font-bold">103</p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Duration</p>
                      <p className="text-3xl font-bold">103h</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Issues Resolved</p>
                      <p className="text-3xl font-bold">87</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Avg Satisfaction</p>
                      <p className="text-3xl font-bold">4.7</p>
                    </div>
                    <Users className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Types Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={meetingTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {meetingTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Meeting Activity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={meetingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="meetings" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Duration Trends</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={meetingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="duration" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="meetings" stroke="#06B6D4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={meetingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="resolved" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Activity Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Meetings</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Satisfaction</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Open Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientActivity.map((client, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{client.clientName}</td>
                          <td className="py-3 px-4">{client.meetings}</td>
                          <td className="py-3 px-4">{Math.round(client.duration / 60)}h</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <span>⭐</span>
                              <span>{client.satisfaction}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              client.issues === 0 ? 'bg-green-100 text-green-800' :
                              client.issues <= 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {client.issues}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Engagement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="clientName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="meetings" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationReports; 