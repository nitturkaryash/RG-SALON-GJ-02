import { toast } from 'react-toastify';

// WhatsApp notification utility function
export const sendWhatsAppNotification = async (
  clientPhone: string,
  message: string
) => {
  console.log(`📱 Attempting to send WhatsApp notification to ${clientPhone}`);

  try {
    // Format phone number if needed (ensure it has country code)
    const formattedPhone = clientPhone.startsWith('+')
      ? clientPhone
      : `+91${clientPhone}`;

    // Construct the request to Twilio API
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
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

// Function to test WhatsApp integration
export const testWhatsAppNotification = async (phone: string) => {
  console.log(`🧪 Testing WhatsApp notification to ${phone}`);

  const message = `🔔 TEST MESSAGE from Salon POS\n\nThis is a test notification to verify WhatsApp integration.\n\nTime: ${new Date().toLocaleString()}`;

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

// Create appointment notification message
export const createAppointmentNotification = (
  clientName: string,
  stylistName: string,
  date: string,
  time: string,
  services: string[]
) => {
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
