import React from 'react';
import WhatsAppManager from '@/components/whatsapp/WhatsAppManager';

export default function WhatsAppTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            WhatsApp MCP Integration Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the WhatsApp MCP integration for your salon management system
          </p>
        </div>
        
        <WhatsAppManager />
      </div>
    </div>
  );
} 