import { WhatsAppService } from './utils/whatsappService.js';

async function testUtilityTemplates() {
  const testNumber = '+91 80071 20161';
  
  try {
    // Test Timing Update
    console.log('\nTesting Timing Update template...');
    const timingResult = await WhatsAppService.sendTimingUpdate(
      testNumber,
      "Test Client",
      "Regular Hours:\nMonday - Saturday: 9:00 AM - 9:00 PM\nSunday: 10:00 AM - 7:00 PM\n\nPeak Hours:\nFriday & Saturday: Extended till 10:00 PM",
      new Date(),
      "Early morning appointments available on request"
    );
    console.log('Timing update sent successfully:', timingResult);

    // Test Safety Update
    console.log('\nTesting Safety Update template...');
    const safetyResult = await WhatsAppService.sendSafetyUpdate(
      testNumber,
      "Test Client",
      "1. Regular sanitization of equipment\n2. Mandatory temperature checks\n3. Air purifiers installed\n4. Staff fully vaccinated\n5. Appointment-only service",
      new Date(),
      "Masks are mandatory for all clients"
    );
    console.log('Safety update sent successfully:', safetyResult);

    // Test New Service Update
    console.log('\nTesting New Service Update template...');
    const serviceResult = await WhatsAppService.sendNewServiceUpdate(
      testNumber,
      "Test Client",
      "Advanced Hair Spa Treatment",
      "60 minutes",
      "- Deep conditioning treatment\n- Scalp massage\n- Steam therapy\n- Premium hair products\n- Complimentary head massage"
    );
    console.log('New service update sent successfully:', serviceResult);

  } catch (error) {
    console.error('Error sending test messages:', error.message);
    if (error.response?.data) {
      console.error('Detailed error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testUtilityTemplates(); 