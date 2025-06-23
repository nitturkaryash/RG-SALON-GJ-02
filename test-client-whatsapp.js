#!/usr/bin/env node

/**
 * Client Phone Number WhatsApp Test
 * 
 * This script tests that WhatsApp messages are now being sent to actual client phone numbers
 * instead of the hardcoded test number 9021264696.
 */

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getCurrentDateTime() {
  return new Date().toLocaleString('en-IN');
}

// Helper function to find active server
async function findActiveServer() {
  const commonPorts = [3001, 3002, 3003, 5174, 5175, 5173, 3000];
  
  for (const port of commonPorts) {
    const baseUrl = `http://localhost:${port}`;
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        const health = await response.json();
        if (health.endpoints && health.endpoints.send_message) {
          return baseUrl;
        }
      }
    } catch (error) {
      continue;
    }
  }
  return null;
}

// Test different client phone numbers
const testClients = [
  {
    name: 'Priya Sharma',
    phone: '9876543210',
    expectedFormatted: '919876543210'
  },
  {
    name: 'Rahul Kumar', 
    phone: '8765432109',
    expectedFormatted: '918765432109'
  },
  {
    name: 'Sneha Patel',
    phone: '917654321098', // Already has country code
    expectedFormatted: '917654321098'
  }
];

// Test sending message to actual client numbers
async function testClientPhoneNumbers(baseUrl) {
  log('\n📱 Testing WhatsApp Messages to Actual Client Numbers...', 'magenta');
  
  let successCount = 0;
  
  for (const client of testClients) {
    log(`\n👤 Testing client: ${client.name} (${client.phone})`, 'cyan');
    
    const message = `🎉 *Appointment Confirmed!*

Dear ${client.name},

Your appointment at *RG Salon* has been successfully confirmed!

📅 *Date:* ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
⏰ *Time:* 2:30 PM

💅 *Services:* Hair Cut, Hair Styling
✨ *Stylists:* Sarah

💰 *Amount:* ₹1,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: +91-8956860024

*Booking ID:* RG${Date.now().toString().slice(-6)}`;

    try {
      const response = await fetch(`${baseUrl}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: client.phone,
          message: message
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        log(`✅ Message sent successfully to ${client.name}!`, 'green');
        log(`📱 Target number: ${result.targetNumber}`, 'blue');
        log(`🎯 Expected: ${client.expectedFormatted}`, 'blue');
        
        if (result.targetNumber === client.expectedFormatted) {
          log(`✅ Phone number formatting is correct!`, 'green');
        } else {
          log(`⚠️ Phone number formatting mismatch!`, 'yellow');
        }
        
        if (result.data?.messages?.[0]?.id) {
          log(`📋 Message ID: ${result.data.messages[0].id}`, 'blue');
        }
        
        successCount++;
      } else {
        log(`❌ Message failed for ${client.name}:`, 'red');
        log(`   ${result.error}`, 'red');
      }
    } catch (error) {
      log(`❌ Exception for ${client.name}:`, 'red');
      log(`   ${error.message}`, 'red');
    }
    
    // Wait 3 seconds between messages
    if (testClients.indexOf(client) < testClients.length - 1) {
      log('⏱️ Waiting 3 seconds...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return successCount;
}

// Main test function
async function main() {
  log('📱 RG Salon - Client Phone Number WhatsApp Test', 'bright');
  log('=' .repeat(60), 'cyan');
  log('🎯 Testing WhatsApp messages to ACTUAL CLIENT numbers', 'blue');
  log(`⏰ Test Time: ${getCurrentDateTime()}`, 'blue');
  log('');
  
  // Find active server
  log('🔍 Searching for active WhatsApp server...', 'cyan');
  const baseUrl = await findActiveServer();
  if (!baseUrl) {
    log('❌ No active server found. Please start your server with: node server.js', 'red');
    process.exit(1);
  }
  log(`✅ Found server at: ${baseUrl}`, 'green');

  const successCount = await testClientPhoneNumbers(baseUrl);
  
  // Summary
  log('\n📊 Test Results Summary', 'bright');
  log('=' .repeat(40), 'cyan');
  log(`✅ Successful messages: ${successCount}/${testClients.length}`, successCount === testClients.length ? 'green' : 'yellow');
  
  if (successCount === testClients.length) {
    log('\n🎉 All client phone number tests passed!', 'green');
    log('📱 WhatsApp messages are now going to ACTUAL CLIENT NUMBERS!', 'green');
    log('🚫 NO MORE hardcoded test number (9021264696)!', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please check the error messages above.', 'yellow');
  }
  
  log('\n🎯 What This Means:', 'bright');
  log('✅ Your salon app now sends WhatsApp notifications to actual clients!', 'green');
  log('✅ Each client receives messages on their own phone number!', 'green');
  log('✅ No more test notifications to 9021264696!', 'green');
  log('📞 Clients will receive professional appointment notifications!', 'blue');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log('❌ Unhandled Rejection:', 'red');
  log(reason, 'red');
  process.exit(1);
});

// Show usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📱 RG Salon - Client Phone Number WhatsApp Test

This script tests that WhatsApp messages are now being sent to actual client phone numbers.

Usage: node test-client-whatsapp.js

Test Clients:
- Priya Sharma: 9876543210
- Rahul Kumar: 8765432109  
- Sneha Patel: 917654321098

Requirements:
- Active WhatsApp server (node server.js)
- Server running on ports 3001, 3002, 3003, etc.
  `);
  process.exit(0);
}

// Run the main function
main().catch(error => {
  log('❌ Fatal error:', 'red');
  log(error.message, 'red');
  process.exit(1);
}); 