import { WhatsAppService } from './utils/whatsappService.js';

async function testWhatsAppTemplates() {
  const testNumber = '+91 80071 20161';
  
  try {
    // Test Appointment Confirmation
    console.log('\nTesting Appointment Confirmation template...');
    const confirmResult = await WhatsAppService.sendAppointmentConfirmation(
      testNumber,
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
    console.log('Confirmation message sent successfully:', confirmResult);

    // Test Service Update
    console.log('\nTesting Service Update template...');
    const serviceUpdate = await WhatsAppService.sendSpecialOffer(
      testNumber,
      "Test Client",
      "Important service updates:\n- Enhanced safety protocols\n- New express services available\n- Updated timing: 9 AM to 9 PM\n- Weekend appointments available",
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Valid for 30 days
    );
    console.log('Service update sent successfully:', serviceUpdate);

  } catch (error) {
    console.error('Error sending test messages:', error.message);
    if (error.response?.data) {
      console.error('Detailed error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWhatsAppTemplates(); 