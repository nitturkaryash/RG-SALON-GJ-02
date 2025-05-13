// Simple script to test WhatsApp integration

// WhatsApp Config
const WHATSAPP_CONFIG = {
  token: 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD',
  phoneNumberId: '649515451575660',
  businessAccountId: '593695986423772',
  businessPhone: '+918956860024'
};

// Phone number to send to
const phoneNumber = '9579419753';

// Message to send
const message = `Hello from RG Salon!

This is a test message sent at ${new Date().toLocaleTimeString()}.

If you received this message, WhatsApp integration is working correctly.`;

// Format the phone number
function formatPhoneNumber(phone) {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (default to 91 for India)
  if (!cleaned.startsWith('91') && cleaned.length > 6) {
    return `91${cleaned}`;
  }
  
  return cleaned;
}

async function sendWhatsAppMessage() {
  console.log('Sending WhatsApp test message...');
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: ${message}`);
  
  try {
    // Format the phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`Formatted phone: ${formattedPhone}`);
    
    // Create request body
    const requestBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };
    
    console.log('Sending request to WhatsApp API...');
    
    // Make the API call
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    // Parse and log response
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Message sent successfully');
      console.log('Response:', JSON.stringify(responseData, null, 2));
    } else {
      console.error('❌ ERROR! Failed to send message');
      console.error('Status:', response.status, response.statusText);
      console.error('Error data:', JSON.stringify(responseData, null, 2));
    }
    
    return { success: response.ok, data: responseData };
  } catch (error) {
    console.error('❌ EXCEPTION! Error sending message:', error.message);
    return { success: false, error: error.message };
  }
}

// Execute the function
sendWhatsAppMessage()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Unhandled error:', err)); 