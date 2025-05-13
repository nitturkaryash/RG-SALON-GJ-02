// Script to send WhatsApp template messages for first-time contact

// WhatsApp Config
const WHATSAPP_CONFIG = {
  token: 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD',
  phoneNumberId: '649515451575660',
  businessAccountId: '593695986423772',
  businessPhone: '+918956860024'
};

// Phone number to send to (change this to the desired recipient)
const phoneNumber = '9021264696'; 

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

// Use a template message for first contact
async function sendTemplateMessage() {
  console.log('Sending WhatsApp template message...');
  console.log(`To: ${phoneNumber}`);
  
  try {
    // Format the phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`Formatted phone: ${formattedPhone}`);
    
    // Using the appointment_confirmation template that's already approved
    const templateName = "appointment_confirmation";
    
    // Create template message request body with parameters matching the template structure
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en"  // Standard English code
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                text: "APPOINTMENT CONFIRMED"
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: "John" // Client name
              },
              {
                type: "text",
                text: "12-05-2023" // Date
              },
              {
                type: "text",
                text: "3:00 PM" // Time
              },
              {
                type: "text",
                text: "Hair Cut & Styling" // Service
              },
              {
                type: "text",
                text: "Raja" // Stylist
              }
            ]
          }
        ]
      }
    };
    
    console.log('Sending template request to WhatsApp API...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
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
      console.log('✅ SUCCESS! Template message sent successfully');
      console.log('Response:', JSON.stringify(responseData, null, 2));
    } else {
      console.error('❌ ERROR! Failed to send template message');
      console.error('Status:', response.status, response.statusText);
      console.error('Error data:', JSON.stringify(responseData, null, 2));
      
      // Check if error is about template not being found
      if (responseData.error && responseData.error.message && responseData.error.message.includes('template not found')) {
        console.error('\n🔴 TEMPLATE ERROR: You need to create and approve the template named "appointment_confirmation" in Meta Business Manager');
        console.error('Available templates can be seen at: https://business.facebook.com/wa/manage/message-templates/');
      }
    }
    
    return { success: response.ok, data: responseData };
  } catch (error) {
    console.error('❌ EXCEPTION! Error sending template message:', error.message);
    return { success: false, error: error.message };
  }
}

// Send a test message using the Hello World template (which usually exists by default)
// This is a fallback attempt if a custom template is not available
async function sendHelloWorldTemplate() {
  console.log('\nTrying fallback with hello_world template...');
  
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "hello_world",
        language: {
          code: "en_US"
        }
      }
    };
    
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
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! Hello world template sent successfully');
    } else {
      console.error('❌ ERROR! Failed to send hello world template');
      console.error('Error data:', JSON.stringify(responseData, null, 2));
    }
  } catch (error) {
    console.error('Error with hello world template:', error.message);
  }
}

// Add a new function to test appointment confirmation with custom values
async function testAppointmentConfirmation(
  recipientPhone = '9021264696',
  customerName = 'John',
  appointmentDate = '12-05-2023',
  appointmentTime = '3:00 PM',
  service = 'Hair Cut & Styling',
  stylist = 'Raja'
) {
  console.log('Testing appointment confirmation template...');
  console.log(`To: ${recipientPhone}`);
  
  try {
    // Format the phone number
    const formattedPhone = formatPhoneNumber(recipientPhone);
    console.log(`Formatted phone: ${formattedPhone}`);
    
    // Create template message request body with parameters matching the template structure
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "appointment_confirmation",
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: customerName 
              },
              {
                type: "text",
                text: appointmentDate
              },
              {
                type: "text",
                text: appointmentTime
              },
              {
                type: "text",
                text: service
              },
              {
                type: "text",
                text: stylist
              }
            ]
          }
        ]
      }
    };
    
    console.log('Sending appointment confirmation template...');
    
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
      console.log('✅ SUCCESS! Appointment confirmation sent successfully');
      console.log('Response:', JSON.stringify(responseData, null, 2));
      return { success: true, data: responseData };
    } else {
      console.error('❌ ERROR! Failed to send appointment confirmation');
      console.error('Status:', response.status, response.statusText);
      console.error('Error data:', JSON.stringify(responseData, null, 2));
      return { success: false, data: responseData };
    }
  } catch (error) {
    console.error('❌ EXCEPTION! Error sending appointment confirmation:', error.message);
    return { success: false, error: error.message };
  }
}

// Update the runTest function to use the new testAppointmentConfirmation function
async function runTest() {
  try {
    // Test with the appointment confirmation template
    console.log("\n--- TESTING APPOINTMENT CONFIRMATION TEMPLATE ---\n");
    const result = await testAppointmentConfirmation(
      phoneNumber,  // Use the phone number defined at the top
      'Raj',        // Customer name
      '05-12-2004', // Date
      '2:00',       // Time
      'test',       // Service
      'Raja'        // Stylist
    );
    
    if (!result.success) {
      // Fall back to the original template test if confirmation fails
      console.log("\n--- TRYING ORIGINAL TEMPLATE TEST ---\n");
      await sendTemplateMessage();
    }
    
    console.log('\n🔍 IMPORTANT NOTE:');
    console.log('1. WhatsApp Business API requires using approved templates for first contact');
    console.log('2. If messages aren\'t arriving, make sure you have an approved template');
    console.log('3. Check your Meta Business Manager to create and manage templates');
    console.log('4. Only after the customer responds can you send free-form messages');
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

runTest(); 