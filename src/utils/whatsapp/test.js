import axios from 'axios';

// WhatsApp API Configuration
const WHATSAPP_CONFIG = {
  token: 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD',
  phoneNumberId: '649515451575660',
  version: 'v17.0'
};

async function sendTestMessage(phoneNumber) {
  try {
    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    // Prepare message payload
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: "test_message",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { 
                type: "text", 
                text: "🎉 Hello! This is a test message from RG Salon's WhatsApp integration. If you receive this, our messaging system is working correctly! 💈" 
              }
            ]
          }
        ]
      }
    };

    console.log('Sending message with payload:', JSON.stringify(payload, null, 2));

    // Send message
    const response = await axios.post(
      `https://graph.facebook.com/${WHATSAPP_CONFIG.version}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Message sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send message:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    };
  }
}

// Test the function
const testPhone = '9021264696';
console.log(`Testing WhatsApp message to ${testPhone}...`);

sendTestMessage(testPhone)
  .then(result => {
    console.log('Test completed:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 