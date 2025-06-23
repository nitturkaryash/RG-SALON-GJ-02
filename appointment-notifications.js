#!/usr/bin/env node

/**
 * RG Salon Appointment Notification System
 * 
 * Sends professional appointment notifications to 9021264696:
 * 1. Appointment Confirmation
 * 2. Appointment Rescheduling 
 * 3. Appointment Cancellation
 * 4. Appointment Reminder
 */

const TARGET_PHONE = '9021264696';
const BUSINESS_PHONE = '+91-8956860024';

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

function getAppointmentDate(daysFromNow = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString('en-IN');
}

function getAppointmentTime(hour = 10, minute = 30) {
  return `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

async function findActiveServer() {
  const commonPorts = [3001, 3002, 3003, 5174, 5175, 5173, 3000];
  
  for (const port of commonPorts) {
    const baseUrl = `http://localhost:${port}`;
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        const health = await response.json();
        if (health.endpoints && health.endpoints.send_single_notification) {
          return baseUrl;
        }
      }
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function sendAppointmentNotification(baseUrl, type, appointmentData) {
  const messages = {
    confirmation: `🎉 *Appointment Confirmed!*

Dear ${appointmentData.clientName},

Your appointment at *RG Salon* has been successfully confirmed!

📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services}
✨ *Stylist:* ${appointmentData.stylist}
💰 *Amount:* ₹${appointmentData.amount}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: ${BUSINESS_PHONE}

*Booking ID:* ${appointmentData.bookingId}`,

    rescheduling: `📅 *Appointment Rescheduled*

Dear ${appointmentData.clientName},

Your appointment at *RG Salon* has been successfully rescheduled.

*Previous Appointment:*
📅 Date: ${appointmentData.oldDate}
⏰ Time: ${appointmentData.oldTime}

*New Appointment:*
📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services}
✨ *Stylist:* ${appointmentData.stylist}
💰 *Amount:* ₹${appointmentData.amount}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for your flexibility! 💖

For any queries, call us at: ${BUSINESS_PHONE}

*Booking ID:* ${appointmentData.bookingId}`,

    cancellation: `❌ *Appointment Cancelled*

Dear ${appointmentData.clientName},

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* ${appointmentData.date}
⏰ *Cancelled Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services}
✨ *Stylist:* ${appointmentData.stylist}
💰 *Amount:* ₹${appointmentData.amount}

*Reason:* ${appointmentData.reason || 'Scheduling conflict'}

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: ${BUSINESS_PHONE}

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖

*Booking ID:* ${appointmentData.bookingId}`,

    reminder: `⏰ *Appointment Reminder*

Dear ${appointmentData.clientName},

This is a friendly reminder that you have an appointment at *RG Salon* ${appointmentData.reminderType === '24h' ? 'tomorrow' : 'in 2 hours'}.

📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services}
✨ *Stylist:* ${appointmentData.stylist}
💰 *Amount:* ₹${appointmentData.amount}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

${appointmentData.reminderType === '2h' ? '🚨 *Final Reminder* - Please confirm your attendance by replying YES\n\n' : ''}📞 Contact us: ${BUSINESS_PHONE}

Thank you for choosing RG Salon! 💖

*Booking ID:* ${appointmentData.bookingId}`
  };

  const endpoint = `${baseUrl}/api/whatsapp/send-custom-notification`;
  
  try {
    log(`📤 Sending ${type} notification...`, 'blue');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messages[type],
        notificationType: `Appointment ${type.charAt(0).toUpperCase() + type.slice(1)}`
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      log(`✅ ${type.toUpperCase()} notification sent successfully!`, 'green');
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

function showMenu() {
  log('\n💅 RG Salon Appointment Notification System', 'bright');
  log('=' .repeat(50), 'cyan');
  log('📱 Target Number: 9021264696', 'blue');
  log(`⏰ Current Time: ${getCurrentDateTime()}`, 'blue');
  log('', 'reset');
  log('Choose notification type:', 'yellow');
  log('1. 🎉 Appointment Confirmation', 'blue');
  log('2. 📅 Appointment Rescheduling', 'blue');
  log('3. ❌ Appointment Cancellation', 'blue');
  log('4. ⏰ 24-Hour Reminder', 'blue');
  log('5. 🚨 2-Hour Final Reminder', 'blue');
  log('6. 📋 Send All Test Notifications', 'magenta');
  log('7. 🔧 Custom Appointment Message', 'yellow');
  log('8. 🚪 Exit', 'red');
  log('');
}

function getDefaultAppointmentData(type = 'general') {
  const baseData = {
    clientName: 'Valued Client',
    date: getAppointmentDate(1),
    time: getAppointmentTime(10, 30),
    services: 'Hair Cut, Hair Styling, Manicure',
    stylist: 'Sarah',
    amount: '2,500.00',
    bookingId: `RG${Date.now().toString().slice(-6)}`
  };

  if (type === 'rescheduling') {
    baseData.oldDate = getAppointmentDate(0);
    baseData.oldTime = getAppointmentTime(2, 0);
  }

  if (type === 'cancellation') {
    baseData.reason = 'Stylist unavailability due to emergency';
  }

  if (type === 'reminder') {
    baseData.reminderType = '24h';
  }

  if (type === 'final_reminder') {
    baseData.reminderType = '2h';
    baseData.date = getAppointmentDate(0);
    baseData.time = getAppointmentTime(new Date().getHours() + 2, 0);
  }

  return baseData;
}

async function main() {
  log('💅 RG Salon Appointment Notification System', 'bright');
  log('=' .repeat(50), 'cyan');
  
  // Find active server
  log('🔍 Searching for active server...', 'cyan');
  const baseUrl = await findActiveServer();
  if (!baseUrl) {
    log('❌ No active server found. Please start your server with: node server.js', 'red');
    process.exit(1);
  }
  log(`✅ Found server at: ${baseUrl}`, 'green');

  const choice = process.argv[2] || '1';
  
  showMenu();
  
  let success = false;
  
  switch (choice) {
    case '1':
      log('🎉 Sending Appointment Confirmation...', 'magenta');
      success = await sendAppointmentNotification(baseUrl, 'confirmation', getDefaultAppointmentData());
      break;
      
    case '2':
      log('📅 Sending Appointment Rescheduling...', 'magenta');
      success = await sendAppointmentNotification(baseUrl, 'rescheduling', getDefaultAppointmentData('rescheduling'));
      break;
      
    case '3':
      log('❌ Sending Appointment Cancellation...', 'magenta');
      success = await sendAppointmentNotification(baseUrl, 'cancellation', getDefaultAppointmentData('cancellation'));
      break;
      
    case '4':
      log('⏰ Sending 24-Hour Reminder...', 'magenta');
      success = await sendAppointmentNotification(baseUrl, 'reminder', getDefaultAppointmentData('reminder'));
      break;
      
    case '5':
      log('🚨 Sending 2-Hour Final Reminder...', 'magenta');
      const finalReminderData = getDefaultAppointmentData('final_reminder');
      success = await sendAppointmentNotification(baseUrl, 'reminder', finalReminderData);
      break;
      
    case '6':
      log('📋 Sending ALL Test Notifications...', 'magenta');
      log('⏳ This will take about 15 seconds (3s delay between messages)', 'yellow');
      
      const notifications = [
        ['confirmation', getDefaultAppointmentData()],
        ['rescheduling', getDefaultAppointmentData('rescheduling')],
        ['cancellation', getDefaultAppointmentData('cancellation')],
        ['reminder', getDefaultAppointmentData('reminder')],
        ['reminder', getDefaultAppointmentData('final_reminder')]
      ];
      
      let successCount = 0;
      for (const [type, data] of notifications) {
        const result = await sendAppointmentNotification(baseUrl, type, data);
        if (result) successCount++;
        
        // Wait 3 seconds between messages
        if (notifications.indexOf([type, data]) < notifications.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      log(`\n📊 Results: ${successCount}/${notifications.length} notifications sent successfully`, successCount === notifications.length ? 'green' : 'yellow');
      success = successCount > 0;
      break;
      
    case '7':
      const customMessage = process.argv[3] || `📱 Custom Appointment Message

Dear Valued Client,

This is a custom appointment-related message from RG Salon.

Sent at: ${getCurrentDateTime()}

For any queries, please contact us at: ${BUSINESS_PHONE}

Best regards,
RG Salon Team 💖`;

      log('🔧 Sending Custom Appointment Message...', 'magenta');
      
      try {
        const response = await fetch(`${baseUrl}/api/whatsapp/send-custom-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: customMessage,
            notificationType: 'Custom Appointment Message'
          })
        });
        
        const result = await response.json();
        success = response.ok && result.success;
        
        if (success) {
          log('✅ Custom message sent successfully!', 'green');
        } else {
          log('❌ Custom message failed:', 'red');
          log(`   ${result.error}`, 'red');
        }
      } catch (error) {
        log('❌ Custom message exception:', 'red');
        log(`   ${error.message}`, 'red');
      }
      break;
      
    case '8':
      log('👋 Goodbye!', 'yellow');
      process.exit(0);
      
    default:
      log('❌ Invalid choice. Sending confirmation by default...', 'yellow');
      success = await sendAppointmentNotification(baseUrl, 'confirmation', getDefaultAppointmentData());
  }
  
  if (success) {
    log('\n🎉 Notification sent successfully!', 'green');
    log('📱 Check WhatsApp on 9021264696 for the message.', 'green');
  } else {
    log('\n❌ Notification failed to send.', 'red');
    log('Please check the error messages above.', 'red');
  }
  
  log(`\n📞 Business Contact: ${BUSINESS_PHONE}`, 'blue');
  log('🏢 RG Salon - Professional Beauty Services', 'blue');
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
📱 RG Salon Appointment Notification System

Usage: node appointment-notifications.js [option] [custom_message]

Options:
  1 - Appointment Confirmation
  2 - Appointment Rescheduling  
  3 - Appointment Cancellation
  4 - 24-Hour Reminder
  5 - 2-Hour Final Reminder
  6 - Send All Test Notifications
  7 - Custom Message (provide message as second argument)
  8 - Exit

Examples:
  node appointment-notifications.js 1                    # Send confirmation
  node appointment-notifications.js 6                    # Send all notifications
  node appointment-notifications.js 7 "Custom message"   # Send custom message

📞 Business Phone: ${BUSINESS_PHONE}
📱 Target Number: ${TARGET_PHONE}
  `);
  process.exit(0);
}

// Run the main function
main().catch(error => {
  log('❌ Fatal error:', 'red');
  log(error.message, 'red');
  process.exit(1);
}); 