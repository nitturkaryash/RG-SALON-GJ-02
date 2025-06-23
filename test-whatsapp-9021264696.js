#!/usr/bin/env node

/**
 * WhatsApp Notification Test Script for 9021264696
 * 
 * This script tests all WhatsApp notification types on the specific phone number: 9021264696
 * It will automatically find the active server and send all notification types.
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetPhoneNumber = '9021264696';
const commonPorts = [3001, 3002, 3003, 5174, 5175, 5173, 3000];

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

async function findActiveServer() {
  log('🔍 Searching for active WhatsApp API server...', 'cyan');
  
  for (const port of commonPorts) {
    const baseUrl = `http://localhost:${port}`;
    const healthUrl = `${baseUrl}/api/health`;
    
    try {
      log(`   Checking port ${port}...`, 'blue');
      const response = await fetch(healthUrl);
      
      if (response.ok) {
        const health = await response.json();
        if (health.endpoints && health.endpoints.send_all_notifications) {
          log(`✅ Found active WhatsApp API server on port ${port}`, 'green');
          log(`   Configuration: ${health.configuration?.whatsappConfigured ? 'Ready' : 'Needs Setup'}`, 'yellow');
          log(`   Target Number: ${health.configuration?.defaultTargetNumber}`, 'blue');
          return baseUrl;
        }
      }
    } catch (error) {
      // Port not active, continue checking
      continue;
    }
  }
  
  log(`❌ No active WhatsApp API server found on ports: ${commonPorts.join(', ')}`, 'red');
  log('💡 Please start your server:', 'yellow');
  log('   - Express server: node server.js', 'blue');
  log('   - Vite dev server: npm run dev', 'blue');
  return null;
}

async function testAllNotifications(baseUrl) {
  log(`\n📱 Testing ALL WhatsApp notifications on ${targetPhoneNumber}`, 'bright');
  log('=' .repeat(60), 'cyan');
  
  const endpoint = `${baseUrl}/api/whatsapp/send-all-notifications`;
  
  try {
    log('📤 Sending all notification types...', 'blue');
    log('⏳ This will take approximately 18 seconds (3s delay between messages)', 'yellow');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // No body needed, uses default target number
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log('\n🎉 BULK NOTIFICATION RESULTS:', 'green');
      log(`✅ Successfully sent: ${result.successCount}/${result.totalNotifications} notifications`, 'green');
      log(`📱 Target Number: ${result.targetNumber}`, 'blue');
      
      // Show individual results
      log('\n📋 Individual Results:', 'cyan');
      result.results.forEach((item, index) => {
        const status = item.success ? '✅' : '❌';
        const color = item.success ? 'green' : 'red';
        log(`   ${index + 1}. ${status} ${item.type}`, color);
        if (item.success && item.messageId) {
          log(`      Message ID: ${item.messageId}`, 'blue');
        }
        if (!item.success && item.error) {
          log(`      Error: ${item.error}`, 'red');
        }
      });
      
      // Summary
      log('\n📊 SUMMARY:', 'bright');
      if (result.summary.allSuccess) {
        log('🎉 ALL NOTIFICATIONS SENT SUCCESSFULLY! 🎉', 'green');
        log(`📱 Check WhatsApp on ${targetPhoneNumber} for all ${result.totalNotifications} messages.`, 'green');
      } else if (result.summary.partialSuccess) {
        log(`⚠️  PARTIAL SUCCESS: ${result.successCount} sent, ${result.failureCount} failed`, 'yellow');
        log(`📱 Check WhatsApp on ${targetPhoneNumber} for ${result.successCount} messages.`, 'yellow');
      } else {
        log('❌ ALL NOTIFICATIONS FAILED', 'red');
        log('Please check your WhatsApp Business API configuration.', 'red');
      }
      
      return result.summary.allSuccess;
    } else {
      log('❌ Bulk notification request failed:', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${result.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Exception during bulk notification test:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testSingleNotification(baseUrl, type, customMessage = null) {
  log(`\n📱 Testing ${type.toUpperCase()} notification`, 'blue');
  
  const endpoint = `${baseUrl}/api/whatsapp/send-single-notification`;
  const body = { type };
  if (customMessage) {
    body.customMessage = customMessage;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log(`✅ ${type} notification sent successfully!`, 'green');
      log(`📱 Message sent to: ${result.targetNumber}`, 'blue');
      if (result.data?.messages?.[0]?.id) {
        log(`📋 Message ID: ${result.data.messages[0].id}`, 'blue');
      }
      return true;
    } else {
      log(`❌ ${type} notification failed:`, 'red');
      log(`   ${result.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${type} notification exception:`, 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function testCustomMessage(baseUrl, message) {
  log(`\n📱 Testing CUSTOM message`, 'blue');
  
  const endpoint = `${baseUrl}/api/whatsapp/send-custom-notification`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        notificationType: 'Custom Test'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log('✅ Custom message sent successfully!', 'green');
      log(`📱 Message sent to: ${result.targetNumber}`, 'blue');
      return true;
    } else {
      log('❌ Custom message failed:', 'red');
      log(`   ${result.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Custom message exception:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function showMenu(baseUrl) {
  log('\n🎯 WhatsApp Notification Test Menu', 'bright');
  log('=' .repeat(40), 'cyan');
  log('1. Send ALL notifications (6 types)', 'blue');
  log('2. Send single BOOKING confirmation', 'blue');
  log('3. Send single REMINDER', 'blue');
  log('4. Send single CANCELLATION', 'blue');
  log('5. Send single WELCOME message', 'blue');
  log('6. Send CUSTOM message', 'blue');
  log('7. Exit', 'yellow');
  
  // Since this is a Node.js script, we'll use a simple approach
  // In a real implementation, you'd use readline or similar
  const choice = process.argv[2] || '1'; // Default to option 1
  
  switch (choice) {
    case '1':
      return await testAllNotifications(baseUrl);
    case '2':
      return await testSingleNotification(baseUrl, 'booking');
    case '3':
      return await testSingleNotification(baseUrl, 'reminder');
    case '4':
      return await testSingleNotification(baseUrl, 'cancellation');
    case '5':
      return await testSingleNotification(baseUrl, 'welcome');
    case '6':
      const customMsg = process.argv[3] || `🧪 Custom test message from RG Salon! 

This is a custom test sent at ${new Date().toLocaleString('en-IN')}.

If you received this, the custom message feature is working! 🎉`;
      return await testCustomMessage(baseUrl, customMsg);
    case '7':
      log('👋 Goodbye!', 'yellow');
      return true;
    default:
      log('❌ Invalid choice. Defaulting to ALL notifications...', 'yellow');
      return await testAllNotifications(baseUrl);
  }
}

async function main() {
  log('🧪 WhatsApp Notification Test Script for 9021264696', 'bright');
  log('=' .repeat(60), 'cyan');
  log(`📱 Target Phone Number: ${targetPhoneNumber}`, 'blue');
  log(`⏰ Current Time: ${new Date().toLocaleString('en-IN')}`, 'blue');
  
  // Find active server
  const baseUrl = await findActiveServer();
  if (!baseUrl) {
    process.exit(1);
  }
  
  // Show instructions
  log('\n📋 USAGE INSTRUCTIONS:', 'yellow');
  log('Run with option number as argument:', 'blue');
  log('  node test-whatsapp-9021264696.js 1    # Send all notifications', 'blue');
  log('  node test-whatsapp-9021264696.js 2    # Send booking confirmation', 'blue');
  log('  node test-whatsapp-9021264696.js 6 "Custom message"  # Send custom message', 'blue');
  
  // Execute test
  const success = await showMenu(baseUrl);
  
  if (success) {
    log('\n🎉 Test completed successfully!', 'green');
    log('📱 Check your WhatsApp for the messages.', 'green');
  } else {
    log('\n❌ Test completed with errors.', 'red');
    log('Please check the error messages above.', 'red');
  }
  
  log('\n📞 Support Contact: +91-8956860024', 'blue');
  log('🏢 RG Salon - Professional Beauty Services', 'blue');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log('❌ Unhandled Rejection at:', 'red');
  log(promise, 'red');
  log('Reason:', 'red');
  log(reason, 'red');
  process.exit(1);
});

// Run the main function if this file is being executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log('❌ Fatal error:', 'red');
    log(error.message, 'red');
    process.exit(1);
  });
}

// Export functions for use as a module
export {
  testAllNotifications,
  testSingleNotification,
  testCustomMessage,
  findActiveServer
}; 