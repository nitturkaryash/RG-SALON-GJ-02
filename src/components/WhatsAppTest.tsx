import { useState, useEffect } from 'react';
import { checkWhatsAppConfig, testWhatsAppIntegration } from '../utils/whatsapp';

export default function WhatsAppTest() {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<any>(null);
  const [testPhone, setTestPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [envStatus, setEnvStatus] = useState<{ [key: string]: boolean }>({});

  // Check environment variables on mount
  useEffect(() => {
    const env = (window as any).ENV || {};
    setEnvStatus({
      token: !!env.NEXT_PUBLIC_WHATSAPP_TOKEN,
      phoneNumberId: !!env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: !!env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID,
    });
  }, []);

  const handleCheckConfig = async () => {
    setLoading(true);
    try {
      const result = await checkWhatsAppConfig();
      setConfigStatus(result);
    } catch (error) {
      console.error('Config check error:', error);
      setConfigStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    setLoading(false);
  };

  const handleTestMessage = async () => {
    if (!testPhone) {
      alert('Please enter a phone number');
      return;
    }
    
    setLoading(true);
    try {
      const result = await testWhatsAppIntegration(testPhone);
      setTestStatus(result);
    } catch (error) {
      console.error('Test message error:', error);
      setTestStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Integration Test</h1>
      
      {/* Environment Variables Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment Variables Status</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">WhatsApp Token: </span>
            {envStatus.token ? '✅ Present' : '❌ Missing'}
          </div>
          <div>
            <span className="font-medium">Phone Number ID: </span>
            {envStatus.phoneNumberId ? '✅ Present' : '❌ Missing'}
          </div>
          <div>
            <span className="font-medium">Business Account ID: </span>
            {envStatus.businessAccountId ? '✅ Present' : '❌ Missing'}
          </div>
        </div>
      </div>
      
      {/* Config Check Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">API Configuration Check</h2>
        <button
          onClick={handleCheckConfig}
          disabled={loading || !Object.values(envStatus).every(Boolean)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Configuration'}
        </button>
        
        {configStatus && (
          <div className={`mt-4 p-4 rounded ${configStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className="font-semibold">
              Status: {configStatus.success ? '✅ Success' : '❌ Failed'}
            </h3>
            <pre className="mt-2 whitespace-pre-wrap text-sm">
              {JSON.stringify(configStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Test Message Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Send Test Message</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Enter phone number (e.g., 919876543210)"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleTestMessage}
            disabled={loading || !testPhone || !Object.values(envStatus).every(Boolean)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Test Message'}
          </button>
        </div>

        {testStatus && (
          <div className={`mt-4 p-4 rounded ${testStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className="font-semibold">
              Status: {testStatus.success ? '✅ Message Sent' : '❌ Failed'}
            </h3>
            <pre className="mt-2 whitespace-pre-wrap text-sm">
              {JSON.stringify(testStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 