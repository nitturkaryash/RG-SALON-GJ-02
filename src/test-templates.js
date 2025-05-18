import { WhatsAppService } from './utils/whatsappService.js';

async function testTemplates() {
  const testNumber = '+91 80071 20161';
  const services = [
    { name: "Haircut" },
    { name: "Hair Spa" }
  ];
  
  try {
    // Test Appointment Confirmation
    console.log('\nTesting Appointment Confirmation...');
    await WhatsAppService.sendAppointmentConfirmation(
      testNumber,
      "Test Client",
      new Date(),
      services,
      "Raj Kumar"
    );

    // Test Appointment Reminder
    console.log('\nTesting Appointment Reminder...');
    await WhatsAppService.sendAppointmentReminder(
      testNumber,
      "Test Client",
      new Date(),
      services
    );

    // Test Appointment Reschedule
    console.log('\nTesting Appointment Reschedule...');
    const oldDate = new Date();
    const newDate = new Date(oldDate.getTime() + 24 * 60 * 60 * 1000); // Next day
    await WhatsAppService.sendAppointmentReschedule(
      testNumber,
      "Test Client",
      oldDate,
      newDate,
      services
    );

    // Test Appointment Cancellation
    console.log('\nTesting Appointment Cancellation...');
    await WhatsAppService.sendAppointmentCancellation(
      testNumber,
      "Test Client",
      new Date(),
      services
    );

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('API Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testTemplates(); 