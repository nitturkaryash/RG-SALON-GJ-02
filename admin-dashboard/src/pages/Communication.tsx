import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, PhoneCall, Video, VideoOff, Mic, MicOff, 
  MessageSquare, Send, Paperclip, Search, Filter, 
  MoreVertical, Users, Settings, Calendar, 
  Download, Upload, Star, Archive, Trash2,
  FileText, Image, Camera, ScreenShare,
  VolumeX, Volume2, Minimize2, Maximize2,
  Play, Pause, Square, BarChart, Clock,
  Plus, ExternalLink, Zap
} from 'lucide-react';
import MeetingScheduler from '../components/MeetingScheduler';
import CommunicationReports from '../components/CommunicationReports';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'audio' | 'video';
  attachments?: any[];
  isOwn: boolean;
}

interface ConversationThread {
  id: string;
  title: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  avatar: string;
  status: 'active' | 'archived' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientInfo?: {
    salonName: string;
    location: string;
    subscription: string;
  };
}

interface VideoCallState {
  isInCall: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  participants: any[];
  callDuration: number;
  isRecording: boolean;
  isMinimized: boolean;
}

const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'calls' | 'clients' | 'settings'>('inbox');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'urgent' | 'archived'>('all');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [videoCall, setVideoCall] = useState<VideoCallState>({
    isInCall: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    participants: [],
    callDuration: 0,
    isRecording: false,
    isMinimized: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimer = useRef<NodeJS.Timeout | null>(null);

  // Mock data
  const conversations: ConversationThread[] = [
    {
      id: '1',
      title: 'Glamour Salon Support',
      participants: ['Sarah Johnson', 'Admin'],
      lastMessage: {
        id: '1',
        content: 'We need help with the inventory sync issue',
        sender: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 30000),
        type: 'text',
        isOwn: false
      },
      unreadCount: 3,
      isOnline: true,
      avatar: 'SJ',
      status: 'active',
      priority: 'urgent',
      clientInfo: {
        salonName: 'Glamour Salon',
        location: 'New York, NY',
        subscription: 'Premium'
      }
    },
    {
      id: '2',
      title: 'Elite Beauty Lounge',
      participants: ['Mike Chen', 'Admin'],
      lastMessage: {
        id: '2',
        content: 'Thank you for the quick response!',
        sender: 'Mike Chen',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        isOwn: false
      },
      unreadCount: 0,
      isOnline: false,
      avatar: 'MC',
      status: 'active',
      priority: 'medium',
      clientInfo: {
        salonName: 'Elite Beauty Lounge',
        location: 'Los Angeles, CA',
        subscription: 'Business'
      }
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      content: 'Hi, we are experiencing issues with the point of sale system.',
      sender: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      isOwn: false
    },
    {
      id: '2',
      content: 'I understand the issue. Let me check the system logs for you.',
      sender: 'Admin Support',
      timestamp: new Date(Date.now() - 3540000),
      type: 'text',
      isOwn: true
    },
    {
      id: '3',
      content: 'I found the issue. It seems to be related to the payment gateway.',
      sender: 'Admin Support',
      timestamp: new Date(Date.now() - 3480000),
      type: 'text',
      isOwn: true
    },
    {
      id: '4',
      content: 'Can we schedule a video call to walk through the fix?',
      sender: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 3420000),
      type: 'text',
      isOwn: false
    }
  ];

  // Initialize media stream
  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access to start video calls.');
      return null;
    }
  };

  // Video call functions
  const startVideoCall = async () => {
    const stream = await initializeMediaStream();
    if (stream) {
      setVideoCall(prev => ({ 
        ...prev, 
        isInCall: true,
        participants: ['Local User'],
        callDuration: 0
      }));
      
      // Start call duration timer
      callTimer.current = setInterval(() => {
        setVideoCall(prev => ({ 
          ...prev, 
          callDuration: prev.callDuration + 1 
        }));
      }, 1000);
    }
  };

  const endVideoCall = () => {
    // Stop media streams
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    
    // Clear timer
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
    
    setVideoCall({
      isInCall: false,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      participants: [],
      callDuration: 0,
      isRecording: false,
      isMinimized: false
    });
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoCall.isVideoEnabled;
        setVideoCall(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !videoCall.isAudioEnabled;
        setVideoCall(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!videoCall.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true, 
          audio: true 
        });
        
        // Replace video track
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setVideoCall(prev => ({ ...prev, isScreenSharing: true }));
        
        // Listen for screen share end
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          setVideoCall(prev => ({ ...prev, isScreenSharing: false }));
          // Restart camera
          initializeMediaStream();
        });
      } else {
        // Stop screen sharing and restart camera
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        
        setVideoCall(prev => ({ ...prev, isScreenSharing: false }));
        await initializeMediaStream();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const toggleRecording = () => {
    setVideoCall(prev => ({ ...prev, isRecording: !prev.isRecording }));
    
    if (!videoCall.isRecording) {
      console.log('Started recording...');
      // Here you would implement actual recording functionality
    } else {
      console.log('Stopped recording...');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    
    switch (filterType) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'urgent':
        return matchesSearch && conv.priority === 'urgent';
      case 'archived':
        return matchesSearch && conv.status === 'archived';
      default:
        return matchesSearch;
    }
  });

  const selectedConversation = conversations.find(conv => conv.id === selectedThread);

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Video Call Overlay */}
      {videoCall.isInCall && (
        <div className={`fixed inset-0 z-50 bg-gray-900 flex flex-col transition-all duration-300 ${
          videoCall.isMinimized ? 'bottom-0 right-4 w-96 h-64' : ''
        }`}>
          {/* Call Header */}
          <div className="bg-black bg-opacity-50 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  videoCall.isRecording ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {videoCall.isRecording ? 'Recording' : 'Live'} • {formatTime(videoCall.callDuration)}
                </span>
              </div>
              <div className="text-sm text-gray-300">
                {selectedConversation?.title || 'Video Call'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setVideoCall(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                {videoCall.isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative">
            {/* Remote Video Placeholder */}
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Waiting for participant...</p>
                <p className="text-sm opacity-75">Share the meeting link to invite others</p>
              </div>
            </div>
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!videoCall.isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Screen Share Indicator */}
            {videoCall.isScreenSharing && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <ScreenShare className="w-4 h-4 inline mr-2" />
                Screen Sharing
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="bg-black bg-opacity-50 p-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-colors ${
                  videoCall.isAudioEnabled 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                title={videoCall.isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {videoCall.isAudioEnabled ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  videoCall.isVideoEnabled 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                title={videoCall.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoCall.isVideoEnabled ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-colors ${
                  videoCall.isScreenSharing 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                title={videoCall.isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <ScreenShare className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={toggleRecording}
                className={`p-4 rounded-full transition-colors ${
                  videoCall.isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                title={videoCall.isRecording ? 'Stop recording' : 'Start recording'}
              >
                {videoCall.isRecording ? (
                  <Square className="w-6 h-6 text-white" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={endVideoCall}
                className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                title="End call"
              >
                <PhoneCall className="w-6 h-6 text-white transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReports(true)}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="View Reports"
              >
                <BarChart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMeetingScheduler(true)}
                className="p-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
                title="Schedule Google Meet"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'inbox', label: 'Inbox', icon: MessageSquare },
              { id: 'calls', label: 'Calls', icon: Phone },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'archived', label: 'Archived' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filterType === filter.id
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => setSelectedThread(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedThread === conversation.id ? 'bg-purple-50 border-purple-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    conversation.priority === 'urgent' ? 'bg-red-500' :
                    conversation.priority === 'high' ? 'bg-orange-500' :
                    conversation.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {conversation.avatar}
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {conversation.clientInfo && (
                    <p className="text-xs text-gray-500 mb-1">
                      {conversation.clientInfo.salonName} • {conversation.clientInfo.subscription}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        conversation.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        conversation.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        conversation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {conversation.priority}
                      </span>
                    </div>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    selectedConversation.priority === 'urgent' ? 'bg-red-500' :
                    selectedConversation.priority === 'high' ? 'bg-orange-500' :
                    selectedConversation.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {selectedConversation.avatar}
                  </div>
                  {selectedConversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.isOnline ? 'Online' : 'Offline'} • 
                    {selectedConversation.clientInfo?.location}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={startVideoCall}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Start video call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Start audio call">
                  <Phone className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowMeetingScheduler(true)}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                  title="Schedule Google Meet"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="More options">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {!message.isOwn && (
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {message.sender}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button
                      onClick={handleFileUpload}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Attach image"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {isTyping && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedConversation.participants[0]} is typing...
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 mb-4">
                Choose a conversation from the sidebar to start messaging
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowMeetingScheduler(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Meeting</span>
                </button>
                <button
                  onClick={() => setShowReports(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart className="w-4 h-4" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Scheduler Modal */}
      <MeetingScheduler
        isOpen={showMeetingScheduler}
        onClose={() => setShowMeetingScheduler(false)}
        clientId={selectedConversation?.id}
        clientName={selectedConversation?.title}
        clientEmail={selectedConversation?.participants[0] + '@salon.com'}
      />

      {/* Communication Reports Modal */}
      <CommunicationReports
        isOpen={showReports}
        onClose={() => setShowReports(false)}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          console.log('Files selected:', e.target.files);
        }}
      />
    </div>
  );
};

export default Communication; 