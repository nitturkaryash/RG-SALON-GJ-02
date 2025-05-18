import { WhatsAppService } from './utils/whatsappService';

async function testWhatsAppMessage() {
  try {
    console.log('Testing message to number: +91 80806 90168');
    const result = await WhatsAppService.sendAppointmentConfirmation(
      '+91 80806 90168',
      "Test Client",
      new Date(),
      [
        {
          name: "Haircut",
          duration: 30,
          price: 500
        }
      ],
      "Raj Kumar",
      500
    );
    console.log('Message sent successfully:', result);
  } catch (error) {
    console.error('Error sending message:', error);
    // Log detailed error if available
    if (error.response?.data) {
      console.error('Detailed error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWhatsAppMessage(); 