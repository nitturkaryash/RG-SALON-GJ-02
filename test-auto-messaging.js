/**
 * Test Script for WhatsApp Auto-Messaging
 * 
 * This script demonstrates how to use the new auto-messaging APIs
 * Run with: node test-auto-messaging.js
 */

const API_BASE = 'http://localhost:3000'; // Adjust to your deployment URL

// Test data
const testClient = {
  full_name: "John Doe",
  phone: "+919876543210",
  email: "john@example.com"
};

const testOrder = {
  client_name: "John Doe",
  client_phone: "+919876543210",
  items: [
    {
      name: "Hair Cut & Style",
      quantity: 1,
      price: 800,
      type: "service"
    },
    {
      name: "Hair Shampoo",
      quantity: 1,
      price: 200,
      type: "product"
    }
  ],
  total: 1000,
  payment_method: "cash",
  stylist: "Jane Smith"
};

const testAppointment = {
  client: {
    id: "test-client-id",
    full_name: "John Doe",
    phone: "+919876543210"
  },
  start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
  services: [
    {
      name: "Hair Cut & Style",
      duration: 60,
      price: 800
    }
  ],
  stylists: [{ name: "Jane Smith" }],
  status: "scheduled",
  total_amount: 800
};

// Utility function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`\n📡 ${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error.message);
    return null;
  }
}

// Test functions
async function testConfiguration() {
  console.log('\n🔧 Testing Configuration Management...');
  
  // Get current config
  await apiCall('/api/whatsapp/config');
  
  // Update config to enable all message types
  await apiCall('/api/whatsapp/config', 'POST', {
    enabled: true,
    messageTypes: {
      orderCreated: true,
      appointmentCreated: true,
      clientWelcome: true
    }
  });
}

async function testClientOperations() {
  console.log('\n👤 Testing Client Operations...');
  
  // Create client (should send welcome message)
  const clientResult = await apiCall('/api/clients', 'POST', testClient);
  
  if (clientResult && clientResult.success) {
    console.log(`✅ Client created. WhatsApp welcome sent: ${clientResult.whatsapp_welcome_sent}`);
    return clientResult.client.id;
  }
  
  return null;
}

async function testOrderOperations() {
  console.log('\n🛒 Testing Order Operations...');
  
  // Create order (should send confirmation message)
  const orderResult = await apiCall('/api/orders', 'POST', testOrder);
  
  if (orderResult && orderResult.success) {
    console.log(`✅ Order created. WhatsApp sent: ${orderResult.whatsapp_sent}`);
    
    // Update order
    await apiCall('/api/orders', 'PUT', {
      id: orderResult.order.id,
      status: "completed",
      client_phone: testOrder.client_phone
    });
    
    // Note: Uncomment to test order deletion
    // await apiCall(`/api/orders?id=${orderResult.order.id}&reason=Test deletion`, 'DELETE');
    
    return orderResult.order.id;
  }
  
  return null;
}

async function testAppointmentOperations() {
  console.log('\n📅 Testing Appointment Operations...');
  
  // Create appointment (should send confirmation message)
  const appointmentResult = await apiCall('/api/appointments', 'POST', testAppointment);
  
  if (appointmentResult && appointmentResult.success) {
    console.log(`✅ Appointment created. WhatsApp sent: ${appointmentResult.notifications.whatsapp}`);
    
    // Update appointment
    await apiCall('/api/appointments', 'PUT', {
      id: appointmentResult.appointment.id,
      start_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // Different time
      status: "rescheduled"
    });
    
    // Note: Uncomment to test appointment cancellation
    // await apiCall(`/api/appointments?id=${appointmentResult.appointment.id}&reason=Test cancellation`, 'DELETE');
    
    return appointmentResult.appointment.id;
  }
  
  return null;
}

async function testInventoryAlerts() {
  console.log('\n📦 Testing Inventory Alerts...');
  
  // Manual inventory alert
  await apiCall('/api/inventory/alerts', 'POST', {
    product_name: "Hair Shampoo",
    current_stock: 5,
    min_threshold: 10,
    manager_phone: "+919876543210"
  });
  
  // Check for low stock items (without sending alerts)
  await apiCall('/api/inventory/alerts?threshold=10&send_alerts=false');
}

async function testCustomMessage() {
  console.log('\n💬 Testing Custom Message...');
  
  // This would require implementing a custom message endpoint
  // For now, we'll use the test-whatsapp endpoint
  await apiCall('/api/test-whatsapp', 'POST', {
    phoneNumber: "+919876543210",
    clientName: "John Doe",
    appointmentDate: new Date().toISOString(),
    services: [{ name: "Custom Test Service", price: 500, duration: 30 }],
    stylist: "Test Stylist",
    messageType: "confirmation"
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting WhatsApp Auto-Messaging Tests...');
  console.log('='.repeat(50));
  
  try {
    // Test configuration
    await testConfiguration();
    
    // Test client operations
    const clientId = await testClientOperations();
    
    // Test order operations
    const orderId = await testOrderOperations();
    
    // Test appointment operations
    const appointmentId = await testAppointmentOperations();
    
    // Test inventory alerts
    await testInventoryAlerts();
    
    // Test custom message
    await testCustomMessage();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('\nCreated test data:');
    console.log(`📋 Client ID: ${clientId || 'Failed to create'}`);
    console.log(`🛒 Order ID: ${orderId || 'Failed to create'}`);
    console.log(`📅 Appointment ID: ${appointmentId || 'Failed to create'}`);
    
    console.log('\n💡 Check your WhatsApp messages to verify auto-messaging is working!');
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
  }
}

// Helper function to test just messaging without creating data
async function testMessagingOnly() {
  console.log('📱 Testing WhatsApp Messaging Only...');
  
  // Just test the WhatsApp service directly
  await apiCall('/api/test-whatsapp', 'POST', {
    phoneNumber: "+919876543210", // Replace with your test number
    clientName: "Test User",
    appointmentDate: new Date().toISOString(),
    services: [{ name: "Test Service", price: 100, duration: 30 }],
    stylist: "Test Stylist",
    messageType: "confirmation"
  });
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testMessagingOnly,
    testConfiguration,
    testClientOperations,
    testOrderOperations,
    testAppointmentOperations,
    testInventoryAlerts
  };
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  // Check if fetch is available (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
    console.log('💡 Run: npm install node-fetch');
    console.log('💡 Or use: node --experimental-fetch test-auto-messaging.js');
    process.exit(1);
  }
  
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--messaging-only')) {
    testMessagingOnly();
  } else {
    runAllTests();
  }
} 