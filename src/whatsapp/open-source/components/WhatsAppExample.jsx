import React, { useState } from 'react';
import { useWhatsAppNotifications } from '../../hooks/useWhatsAppNotifications';

const WhatsAppExample = () => {
  const {
    loading,
    error,
    sendOrderCreatedNotification,
    sendOrderUpdateNotification,
    sendOrderDeletedNotification,
    sendAppointmentReminder,
    sendInventoryAlert,
    sendClientWelcome,
    sendCustomMessage,
    initializeWhatsApp,
    testWhatsApp,
    clearError
  } = useWhatsAppNotifications();

  const [phone, setPhone] = useState('+919876543210');
  const [message, setMessage] = useState('Hello from Salon Management System!');
  const [lastResult, setLastResult] = useState(null);

  const handleTest = async () => {
    const result = await testWhatsApp();
    setLastResult(result);
  };

  const handleInitialize = async () => {
    const result = await initializeWhatsApp();
    setLastResult(result);
  };

  const handleSendCustomMessage = async () => {
    if (!phone || !message) {
      alert('Please enter both phone number and message');
      return;
    }

    const result = await sendCustomMessage({
      phone: phone,
      message: message
    });
    setLastResult(result);
  };

  const handleSendOrderNotification = async () => {
    const sampleOrder = {
      clientName: 'John Doe',
      clientPhone: phone,
      orderId: 'ORD-' + Date.now(),
      items: [
        { name: 'Hair Cut', quantity: 1 },
        { name: 'Hair Color', quantity: 1 }
      ],
      totalAmount: 2500.00
    };

    const result = await sendOrderCreatedNotification(sampleOrder);
    setLastResult(result);
  };

  const handleSendAppointmentReminder = async () => {
    const sampleAppointment = {
      clientName: 'John Doe',
      clientPhone: phone,
      serviceName: 'Hair Cut & Style',
      date: '15/12/2024',
      time: '2:30 PM'
    };

    const result = await sendAppointmentReminder(sampleAppointment);
    setLastResult(result);
  };

  const handleSendWelcomeMessage = async () => {
    const clientData = {
      clientName: 'John Doe',
      clientPhone: phone
    };

    const result = await sendClientWelcome(clientData);
    setLastResult(result);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        WhatsApp Automation Demo
      </h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Sending WhatsApp message...
          </div>
        </div>
      )}

      {/* Last Result Display */}
      {lastResult && (
        <div className={`border px-4 py-3 rounded mb-4 ${
          lastResult.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <h3 className="font-semibold mb-2">Last Result:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Setup Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Setup & Testing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleTest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded"
          >
            Test Service
          </button>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded"
          >
            Initialize WhatsApp
          </button>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (with country code)
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+919876543210"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Custom Message Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Send Custom Message</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your message here..."
            />
          </div>
          <button
            onClick={handleSendCustomMessage}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-medium py-2 px-4 rounded"
          >
            Send Custom Message
          </button>
        </div>
      </div>

      {/* Template Messages Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Template Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleSendOrderNotification}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded"
          >
            Send Order Created
          </button>
          <button
            onClick={handleSendAppointmentReminder}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-medium py-2 px-4 rounded"
          >
            Send Appointment Reminder
          </button>
          <button
            onClick={handleSendWelcomeMessage}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-medium py-2 px-4 rounded"
          >
            Send Welcome Message
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Make sure Chrome browser is open with WhatsApp Web logged in</li>
          <li>Click "Initialize WhatsApp" to setup the browser automation</li>
          <li>Scan the QR code if prompted</li>
          <li>Enter your phone number (with country code)</li>
          <li>Test with custom messages or use template messages</li>
          <li>Check your WhatsApp for the messages</li>
        </ol>
      </div>
    </div>
  );
};

export default WhatsAppExample; 