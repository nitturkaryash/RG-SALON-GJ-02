const { sendDirectTextMessage } = require('../../whatsapp/open-source/services/whatsappWebService');

async function sendTestMessage() {
  try {
    const phoneNumber = '9021264696';
    const message = "🎉 Hello! This is a test message from RG Salon's WhatsApp integration. If you receive this, our messaging system is working correctly! 💈";
    
    console.log('Sending test message to:', phoneNumber);
    const result = await sendDirectTextMessage(phoneNumber, message);
    
    console.log('Test message result:', result);
    return result;
  } catch (error) {
    console.error('Failed to send test message:', error);
    throw error;
  }
}

// Execute the test
sendTestMessage()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 