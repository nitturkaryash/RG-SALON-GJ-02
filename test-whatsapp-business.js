// WhatsApp Business API Test Script
// Tests all notification types on phone number: 9021264696

const testPhoneNumber = '9021264696';
const commonPorts = [3001, 3002, 3003, 5174, 5175, 5173, 3000];

async function findActivePort() {
  console.log('🔍 Searching for active server with WhatsApp API...');
  
  for (const port of commonPorts) {
    const url = `http://localhost:${port}/api/whatsapp/send-business-message`;
    try {
      console.log(`   Checking port ${port}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: '1234567890', message: 'Port check' })
      });
      
      // If we get any response (even error), the port is active with our endpoint
      console.log(`✅ Found active server with WhatsApp API on port ${port}`);
      return url;
    } catch (error) {
      // Port not active, try next one
      continue;
    }
  }
  
  console.log(`❌ No active server found on ports: ${commonPorts.join(', ')}`);
  console.log('💡 Please start your servers:');
  console.log('   - Express server: node server.js');
  console.log('   - Vite dev server: npm run dev');
  return null;
}

async function testNotifications(apiUrl) {
  console.log(`📱 Testing WhatsApp Business API notifications on ${testPhoneNumber}\n`);
  
  const notifications = [
    {
      type: 'System Test',
      message: `🧪 *WhatsApp Business API Test*

Hello! This is a test message from RG Salon's appointment notification system.

📱 Phone: ${testPhoneNumber}
⏰ Time: ${new Date().toLocaleString('en-IN')}

If you received this message, the WhatsApp Business API integration is working correctly! 🎉

All appointment notifications will be sent using this professional service.

Best regards,
RG Salon Team 💖`
    },
    {
      type: 'Booking Confirmation',
      message: `🎉 *Appointment Confirmed!*

Hello Test Client,

Your appointment at *RG Salon* has been successfully booked!

📅 *Date:* Friday, December 15, 2024
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Total Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: +91-8956860024`
    },
    {
      type: 'Update Notification',
      message: `📝 *Appointment Updated!*

Hello Test Client,

Your appointment details at *RG Salon* have been updated.

📅 *Date:* Saturday, December 16, 2024
⏰ *Time:* 2:00 PM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Total Amount:* ₹2,500.00

📊 *Status:* CONFIRMED

We look forward to serving you! 💖

For any queries, call us at: +91-8956860024`
    },
    {
      type: 'Cancellation',
      message: `❌ *Appointment Cancelled*

Hello Test Client,

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* Friday, December 15, 2024
⏰ *Cancelled Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Amount:* ₹2,500.00

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: +91-8956860024

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖`
    },
    {
      type: '24h Reminder',
      message: `⏰ *Appointment Reminder*

Hello Test Client,

This is a friendly reminder that you have an appointment at *RG Salon* in 24 hours.

📅 *Date:* Friday, December 15, 2024
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

📞 Contact us: +91-8956860024

Thank you for choosing RG Salon! 💖`
    },
    {
      type: '2h Final Reminder',
      message: `🚨 *Final Reminder*

Hello Test Client,

This is a friendly reminder that you have an appointment at *RG Salon* in 2 hours.

📅 *Date:* Friday, December 15, 2024
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

🚨 *Final Reminder* - Please confirm your attendance by replying YES

📞 Contact us: +91-8956860024

Thank you for choosing RG Salon! 💖`
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < notifications.length; i++) {
    const notification = notifications[i];
    console.log(`📱 [${i + 1}/${notifications.length}] Sending ${notification.type}...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testPhoneNumber,
          message: notification.message
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${notification.type} sent successfully`);
        console.log(`   Message ID: ${result.data?.messages?.[0]?.id || 'Unknown'}`);
        successCount++;
      } else {
        console.log(`❌ ${notification.type} failed:`, result.error);
        failureCount++;
      }
    } catch (error) {
      console.log(`❌ ${notification.type} error:`, error.message);
      failureCount++;
    }
    
    // Wait 3 seconds between messages to avoid rate limiting
    if (i < notifications.length - 1) {
      console.log('   ⏳ Waiting 3 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📱 Total Messages: ${notifications.length}`);
  
  if (successCount === notifications.length) {
    console.log('\n🎉 All tests passed! WhatsApp Business API is working perfectly! 🎉');
    console.log(`📱 Check WhatsApp on ${testPhoneNumber} for all ${notifications.length} messages.`);
  } else if (successCount > 0) {
    console.log(`\n⚠️  Some tests failed. Check WhatsApp on ${testPhoneNumber} for ${successCount} messages.`);
  } else {
    console.log('\n❌ All tests failed. Check your WhatsApp Business API configuration.');
  }
}

// Check if API endpoint is reachable and properly configured
async function checkAPIHealth(apiUrl) {
  console.log('🔍 Checking API health and configuration...');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '1234567890',
        message: 'Health check'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API returned status ${response.status}:`, errorText);
      return false;
    }
    
    const result = await response.json();
    
    if (result.error && result.error.includes('not configured')) {
      console.log('⚠️  WhatsApp Business API not configured yet.');
      console.log('📋 Please set up your environment variables first:');
      console.log('   WHATSAPP_ACCESS_TOKEN=your_token');
      console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_id');
      console.log('\n📖 See WHATSAPP_BUSINESS_API_SETUP.md for complete setup guide.');
      return false;
    } else {
      console.log('✅ API endpoint is reachable and responding\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Cannot reach API endpoint:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting WhatsApp Business API Test Suite\n');
  
  const apiUrl = await findActivePort();
  
  if (!apiUrl) {
    console.log('\n❌ Cannot proceed with tests due to server issues.');
    return;
  }
  
  const isHealthy = await checkAPIHealth(apiUrl);
  
  if (isHealthy) {
    await testNotifications(apiUrl);
  } else {
    console.log('\n❌ Cannot proceed with tests due to API configuration issues.');
    console.log('\n💡 To set up WhatsApp Business API:');
    console.log('1. Follow the guide in WHATSAPP_BUSINESS_API_SETUP.md');
    console.log('2. Get your credentials from Facebook Business Manager');
    console.log('3. Create .env.local file with your tokens');
    console.log('4. Restart both servers (node server.js and npm run dev)');
  }
}

main().catch(console.error); 