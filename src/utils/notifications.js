import { toast } from 'react-toastify';

/**
 * Send a WhatsApp notification to a client
 * 
 * @param {string} clientPhone - Client phone number (with or without country code)
 * @param {string} message - Message content
 * @returns {Promise<boolean>} - Success status
 */
export const sendWhatsAppNotification = async (clientPhone, message) => {
  console.log(`📱 Attempting to send WhatsApp notification to ${clientPhone}`);
  
  try {
    // Format phone number if needed (ensure it has country code)
    const formattedPhone = clientPhone.startsWith('+') ? clientPhone : `+91${clientPhone}`;
    
    // Construct the request to Twilio API
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send WhatsApp notification');
    }
    
    console.log('📱 WhatsApp notification sent successfully', data);
    return true;
  } catch (error) {
    console.error('📱 WhatsApp notification failed:', error);
    return false;
  }
};

/**
 * Test WhatsApp notification function
 * 
 * @param {string} phone - Phone number to test
 * @returns {Promise<boolean>} - Success status
 */
export const testWhatsAppNotification = async (phone) => {
  console.log(`🧪 Testing WhatsApp notification to ${phone}`);
  
  const message = `🔔 TEST MESSAGE from Salon POS\n\nThis is a test notification from RG Salon to verify WhatsApp integration.\n\nTime: ${new Date().toLocaleString()}`;
  
  const result = await sendWhatsAppNotification(phone, message);
  
  if (result) {
    console.log('🧪 Test notification sent successfully!');
    toast.success('WhatsApp test message sent successfully!');
    return true;
  } else {
    console.error('🧪 Test notification failed!');
    toast.error('Failed to send WhatsApp test message');
    return false;
  }
};

/**
 * Create appointment notification message
 * 
 * @param {object} params - Message parameters
 * @param {string} params.clientName - Client name
 * @param {string} params.stylistName - Stylist name
 * @param {string} params.date - Appointment date
 * @param {string} params.time - Appointment time
 * @param {string[]} params.services - List of services
 * @returns {string} - Formatted message
 */
export const createAppointmentNotification = ({
  clientName,
  stylistName,
  date,
  time,
  services = []
}) => {
  return `
Hello ${clientName},

Your appointment has been confirmed at RG Salon:

📅 Date: ${date}
⏰ Time: ${time}
💇 Stylist: ${stylistName}
✂️ Services: ${services.join(', ')}

We look forward to seeing you!
`;
}; 