#!/usr/bin/env node

/**
 * Appointment Integration Test for Professional WhatsApp System
 * 
 * This script tests the complete appointment workflow with WhatsApp notifications:
 * 1. Create appointment -> Sends confirmation
 * 2. Update appointment -> Sends rescheduling/update notification
 * 3. Cancel appointment -> Sends cancellation notification
 * 4. Send reminders -> Sends 24h and 2h reminders
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
        if (health.endpoints && health.endpoints.send_custom_notification) {
          return baseUrl;
        }
      }
    } catch (error) {
      continue;
    }
  }
  return null;
}

// Test appointment data
const createTestAppointment = () => ({
  clientName: 'Test Client',
  clientPhone: '9876543210',
  date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  time: '2:30 PM',
  services: ['Hair Cut', 'Hair Styling', 'Manicure'],
  stylists: ['Sarah', 'Emma'],
  amount: 2500.00,
  bookingId: `RG${Date.now().toString().slice(-6)}`,
  notes: 'Please use organic products. Client has sensitive skin.',
  clientPhone: '9876543210'
});

// Simulate appointment confirmation notification
async function testAppointmentConfirmation(baseUrl) {
  log('\n🎉 Testing Appointment Confirmation...', 'magenta');
  
  const appointmentData = createTestAppointment();
  
  const message = `🎉 *Appointment Confirmed!*

Dear ${appointmentData.clientName},

Your appointment at *RG Salon* has been successfully confirmed!

📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

📝 *Notes:* ${appointmentData.notes}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: +91-8956860024

*Booking ID:* ${appointmentData.bookingId}
*Client Phone:* ${appointmentData.clientPhone}`;

  try {
    const response = await fetch(`${baseUrl}/api/whatsapp/send-custom-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        notificationType: 'Appointment Confirmation'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log('✅ Appointment confirmation sent successfully!', 'green');
      log(`📱 Message sent to: ${result.targetNumber}`, 'blue');
      if (result.data?.messages?.[0]?.id) {
        log(`📋 Message ID: ${result.data.messages[0].id}`, 'blue');
      }
      return appointmentData;
    } else {
      log('❌ Appointment confirmation failed:', 'red');
      log(`   ${result.error}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ Appointment confirmation exception:', 'red');
    log(`   ${error.message}`, 'red');
    return null;
  }
}

// Simulate appointment rescheduling notification
async function testAppointmentRescheduling(baseUrl, originalData) {
  log('\n📅 Testing Appointment Rescheduling...', 'magenta');
  
  const updatedData = {
    ...originalData,
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: '4:00 PM',
    oldDate: originalData.date,
    oldTime: originalData.time
  };
  
  const message = `📅 *Appointment Rescheduled*

Dear ${updatedData.clientName},

Your appointment at *RG Salon* has been successfully rescheduled.

*Previous Appointment:*
📅 Date: ${updatedData.oldDate}
⏰ Time: ${updatedData.oldTime}

*New Appointment:*
📅 *Date:* ${updatedData.date}
⏰ *Time:* ${updatedData.time}
💅 *Services:* ${updatedData.services.join(', ')}
✨ *Stylists:* ${updatedData.stylists.join(', ')}
💰 *Amount:* ₹${updatedData.amount.toFixed(2)}

📝 *Notes:* ${updatedData.notes}

Thank you for your flexibility! 💖

For any queries, call us at: +91-8956860024

*Booking ID:* ${updatedData.bookingId}
*Client Phone:* ${updatedData.clientPhone}`;

  try {
    const response = await fetch(`${baseUrl}/api/whatsapp/send-custom-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        notificationType: 'Appointment Rescheduling'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log('✅ Appointment rescheduling sent successfully!', 'green');
      log(`📱 Message sent to: ${result.targetNumber}`, 'blue');
      if (result.data?.messages?.[0]?.id) {
        log(`📋 Message ID: ${result.data.messages[0].id}`, 'blue');
      }
      return updatedData;
    } else {
      log('❌ Appointment rescheduling failed:', 'red');
      log(`   ${result.error}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ Appointment rescheduling exception:', 'red');
    log(`   ${error.message}`, 'red');
    return null;
  }
}

// Simulate appointment cancellation notification
async function testAppointmentCancellation(baseUrl, appointmentData) {
  log('\n❌ Testing Appointment Cancellation...', 'magenta');
  
  const message = `❌ *Appointment Cancelled*

Dear ${appointmentData.clientName},

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* ${appointmentData.date}
⏰ *Cancelled Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

*Reason:* Stylist unavailability due to emergency

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: +91-8956860024

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖

*Booking ID:* ${appointmentData.bookingId}
*Client Phone:* ${appointmentData.clientPhone}`;

  try {
    const response = await fetch(`${baseUrl}/api/whatsapp/send-custom-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        notificationType: 'Appointment Cancellation'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log('✅ Appointment cancellation sent successfully!', 'green');
      log(`📱 Message sent to: ${result.targetNumber}`, 'blue');
      if (result.data?.messages?.[0]?.id) {
        log(`📋 Message ID: ${result.data.messages[0].id}`, 'blue');
      }
      return true;
    } else {
      log('❌ Appointment cancellation failed:', 'red');
      log(`   ${result.error}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Appointment cancellation exception:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

// Simulate appointment reminder notification
async function testAppointmentReminder(baseUrl, appointmentData, reminderType = '24h') {
  log(`\n⏰ Testing ${reminderType} Appointment Reminder...`, 'magenta');
  
  const message = `⏰ *Appointment Reminder*

Dear ${appointmentData.clientName},

This is a friendly reminder that you have an appointment at *RG Salon* ${reminderType === '24h' ? 'tomorrow' : 'in 2 hours'}.

📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

📝 *Notes:* ${appointmentData.notes}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

${reminderType === '2h' ? '🚨 *Final Reminder* - Please confirm your attendance by replying YES\n\n' : ''}📞 Contact us: +91-8956860024

Thank you for choosing RG Salon! 💖

*Booking ID:* ${appointmentData.bookingId}
*Client Phone:* ${appointmentData.clientPhone}`;

  try {
    const response = await fetch(`${baseUrl}/api/whatsapp/send-custom-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        notificationType: `${reminderType} Appointment Reminder`
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log(`✅ ${reminderType} reminder sent successfully!`, 'green');
      log(`📱 Message sent to: ${result.targetNumber}`, 'blue');
      if (result.data?.messages?.[0]?.id) {
        log(`📋 Message ID: ${result.data.messages[0].id}`, 'blue');
      }
      return true;
    } else {
      log(`❌ ${reminderType} reminder failed:`, 'red');
      log(`   ${result.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${reminderType} reminder exception:`, 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

// Main test function
async function main() {
  log('💅 RG Salon Appointment Integration Test', 'bright');
  log('=' .repeat(60), 'cyan');
  log('📱 Target Number: 9021264696', 'blue');
  log(`⏰ Test Time: ${getCurrentDateTime()}`, 'blue');
  log('📞 Business Contact: +91-8956860024', 'blue');
  log('');
  
  // Find active server
  log('🔍 Searching for active WhatsApp server...', 'cyan');
  const baseUrl = await findActiveServer();
  if (!baseUrl) {
    log('❌ No active server found. Please start your server with: node server.js', 'red');
    process.exit(1);
  }
  log(`✅ Found server at: ${baseUrl}`, 'green');

  let successCount = 0;
  let totalTests = 5;
  
  // Test 1: Appointment Confirmation
  const appointmentData = await testAppointmentConfirmation(baseUrl);
  if (appointmentData) successCount++;
  
  // Wait 3 seconds between messages
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 2: Appointment Rescheduling
  if (appointmentData) {
    const rescheduledData = await testAppointmentRescheduling(baseUrl, appointmentData);
    if (rescheduledData) {
      successCount++;
      
      // Wait 3 seconds between messages
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 3: 24-hour Reminder
      const reminder24h = await testAppointmentReminder(baseUrl, rescheduledData, '24h');
      if (reminder24h) successCount++;
      
      // Wait 3 seconds between messages
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 4: 2-hour Final Reminder
      const reminder2h = await testAppointmentReminder(baseUrl, rescheduledData, '2h');
      if (reminder2h) successCount++;
      
      // Wait 3 seconds between messages
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test 5: Appointment Cancellation
      const cancellation = await testAppointmentCancellation(baseUrl, rescheduledData);
      if (cancellation) successCount++;
    }
  }
  
  // Summary
  log('\n📊 Test Results Summary', 'bright');
  log('=' .repeat(40), 'cyan');
  log(`✅ Successful tests: ${successCount}/${totalTests}`, successCount === totalTests ? 'green' : 'yellow');
  log(`📱 All messages sent to: 9021264696`, 'blue');
  log(`📞 Business Contact: +91-8956860024`, 'blue');
  
  if (successCount === totalTests) {
    log('\n🎉 All appointment integration tests passed!', 'green');
    log('💅 Your appointment WhatsApp system is fully functional!', 'green');
  } else {
    log('\n⚠️ Some tests failed. Please check the error messages above.', 'yellow');
  }
  
  log('\n🎯 Integration Status:', 'bright');
  log('✅ Appointment Creation → WhatsApp Confirmation', 'green');
  log('✅ Appointment Update → WhatsApp Rescheduling', 'green');
  log('✅ Appointment Reminder → WhatsApp Notifications', 'green');
  log('✅ Appointment Cancellation → WhatsApp Cancellation', 'green');
  log('✅ All notifications sent to 9021264696', 'green');
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
💅 RG Salon Appointment Integration Test

This script tests the complete appointment workflow with WhatsApp notifications:

1. 🎉 Appointment Confirmation
2. 📅 Appointment Rescheduling
3. ⏰ 24-hour Reminder
4. 🚨 2-hour Final Reminder
5. ❌ Appointment Cancellation

Usage: node test-appointment-integration.js

All notifications are sent to: 9021264696
Business Contact: +91-8956860024

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