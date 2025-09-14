import { format } from 'date-fns';

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
  businessPhone:
    import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE || '+91-8956860024',
  apiEndpoint: '/api/whatsapp/send-business-message',
};

export async function checkWhatsAppConfig() {
  try {
    // Test API endpoint availability
    const response = await fetch(WHATSAPP_CONFIG.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '1234567890',
        message: 'Test configuration',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `API endpoint returned status ${response.status}`,
        error: errorText,
        config: {
          businessPhone: WHATSAPP_CONFIG.businessPhone,
        },
      };
    }

    const result = await response.json();

    if (result.error?.includes('not configured')) {
      return {
        success: false,
        message:
          'WhatsApp Business API not configured. Please set environment variables.',
        error: result.error,
        config: {
          businessPhone: WHATSAPP_CONFIG.businessPhone,
        },
      };
    }

    return {
      success: true,
      message: 'WhatsApp Business API endpoint available',
      config: {
        businessPhone: WHATSAPP_CONFIG.businessPhone,
        endpoint: WHATSAPP_CONFIG.apiEndpoint,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'WhatsApp configuration validation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export interface AppointmentNotificationData {
  clientName: string;
  clientPhone: string;
  services: string[];
  stylists: string[];
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  id?: string;
  serviceDetails?: Array<{
    name: string;
    duration: number;
    price: number;
  }>;
  totalAmount?: number;
}

function formatDateForTemplate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function formatTimeForTemplate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'h:mm a');
  } catch {
    return dateStr;
  }
}

/**
 * Send WhatsApp message using Business API via our endpoint
 */
async function sendWhatsAppBusinessMessage(
  to: string,
  message: string
): Promise<any> {
  try {
    if (import.meta.env.DEV) {
      console.log('📱 Sending WhatsApp Business API message to:', to);
    }

    // Use relative URL - Vite proxy will forward to backend server
    const response = await fetch('/api/whatsapp/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: to,
        message: message,
      }),
    });

    const result = await response.json();

    if (result.success) {
      if (import.meta.env.DEV) {
        console.log('✅ WhatsApp message sent successfully:', result);
      }
      return { success: true, data: result.data };
    } else {
      console.error('❌ WhatsApp API error:', result);
      return { success: false, error: result.error || result.details };
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send appointment notification using WhatsApp Business API
 */
export async function sendAppointmentNotification(
  action: 'created' | 'updated' | 'cancelled',
  data: AppointmentNotificationData
): Promise<any> {
  if (import.meta.env.DEV) {
    console.log(`📱 [WhatsApp Business API] Sending ${action} notification`);
    console.log(`📱 Client: ${data.clientName}, Phone: ${data.clientPhone}`);
  }

  try {
    if (!data.clientPhone) {
      throw new Error('Missing client phone number');
    }

    let message = '';

    switch (action) {
      case 'created':
        message = createBookingConfirmationMessage(data);
        break;
      case 'updated':
        message = createUpdateMessage(data);
        break;
      case 'cancelled':
        message = createCancellationMessage(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return await sendWhatsAppBusinessMessage(data.clientPhone, message);
  } catch (error) {
    console.error(
      `❌ Error in sendAppointmentNotification (${action}):`,
      error
    );
    throw error;
  }
}

// Message creation functions
function createBookingConfirmationMessage(
  data: AppointmentNotificationData
): string {
  const appointmentDate = new Date(data.startTime);

  return `🎉 *Appointment Confirmed!*

Hello ${data.clientName},

Your appointment at *RG Salon* has been successfully booked!

📅 *Date:* ${appointmentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
⏰ *Time:* ${appointmentDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}

💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}

${data.notes ? `📝 *Notes:* ${data.notes}\n` : ''}
💰 *Total Amount:* ₹${(data.totalAmount || 0).toFixed(2)}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: ${WHATSAPP_CONFIG.businessPhone}`;
}

function createUpdateMessage(data: AppointmentNotificationData): string {
  const appointmentDate = new Date(data.startTime);

  return `📝 *Appointment Updated!*

Hello ${data.clientName},

Your appointment details at *RG Salon* have been updated.

📅 *Date:* ${appointmentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
⏰ *Time:* ${appointmentDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}

💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}

${data.notes ? `📝 *Notes:* ${data.notes}\n` : ''}
💰 *Total Amount:* ₹${(data.totalAmount || 0).toFixed(2)}

📊 *Status:* ${data.status.toUpperCase()}

We look forward to serving you! 💖

For any queries, call us at: ${WHATSAPP_CONFIG.businessPhone}`;
}

function createCancellationMessage(data: AppointmentNotificationData): string {
  const appointmentDate = new Date(data.startTime);

  return `❌ *Appointment Cancelled*

Hello ${data.clientName},

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* ${appointmentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
⏰ *Cancelled Time:* ${appointmentDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}

💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}

💰 *Amount:* ₹${(data.totalAmount || 0).toFixed(2)}

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: ${WHATSAPP_CONFIG.businessPhone}

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖`;
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
  data: AppointmentNotificationData,
  reminderType: '24h' | '2h' = '24h'
): Promise<any> {
  const appointmentDate = new Date(data.startTime);
  const timeUntilAppointment = reminderType === '24h' ? '24 hours' : '2 hours';
  const urgencyEmoji = reminderType === '24h' ? '⏰' : '🚨';

  const reminderMessage = `${urgencyEmoji} *Appointment Reminder*

Hello ${data.clientName},

This is a friendly reminder that you have an appointment at *RG Salon* in ${timeUntilAppointment}.

📅 *Date:* ${appointmentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
⏰ *Time:* ${appointmentDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}

💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}

${data.notes ? `📝 *Notes:* ${data.notes}\n` : ''}
💰 *Amount:* ₹${(data.totalAmount || 0).toFixed(2)}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

${reminderType === '2h' ? '🚨 *Final Reminder* - Please confirm your attendance by replying YES\n' : ''}

📞 Contact us: ${WHATSAPP_CONFIG.businessPhone}

Thank you for choosing RG Salon! 💖`;

  return await sendWhatsAppBusinessMessage(data.clientPhone, reminderMessage);
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle Indian numbers
  if (cleaned.length === 10) {
    return `91${cleaned}`; // Add India country code
  }

  // If already has country code
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }

  // Return as-is for other formats
  return cleaned;
}

// Legacy compatibility functions
export async function sendAppointmentConfirmationTemplate(
  data: AppointmentNotificationData
): Promise<any> {
  return sendAppointmentNotification('created', data);
}

export async function sendAppointmentUpdate(
  data: AppointmentNotificationData
): Promise<any> {
  return sendAppointmentNotification('updated', data);
}

export async function sendAppointmentCancellation(
  data: AppointmentNotificationData
): Promise<any> {
  return sendAppointmentNotification('cancelled', data);
}

export async function sendWhatsAppMessage(
  to: string,
  message: string,
  clientName?: string
): Promise<any> {
  return await sendWhatsAppBusinessMessage(to, message);
}

export async function testWhatsAppIntegration(testPhoneNumber: string) {
  try {
    const result = await sendWhatsAppBusinessMessage(
      testPhoneNumber,
      '🧪 WhatsApp integration test from RG Salon'
    );
    return result;
  } catch (error) {
    console.error('WhatsApp test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if WhatsApp is enabled and configured
 */
export function isWhatsAppEnabled(): boolean {
  try {
    // Check if we have basic configuration
    return !!(WHATSAPP_CONFIG.businessPhone && WHATSAPP_CONFIG.apiEndpoint);
  } catch (error) {
    console.error('Error checking WhatsApp configuration:', error);
    return false;
  }
}

/**
 * Send WhatsApp notification for appointments (compatibility function)
 */
export async function sendAppointmentWhatsAppNotification(
  action: 'created' | 'updated' | 'cancelled',
  appointmentData: any,
  clientData: any,
  servicesData: any[],
  stylistsData: any[]
): Promise<any> {
  try {
    console.log('📱 [WhatsApp Business API] Sending', action, 'notification');
    console.log(
      '📱 Client:',
      clientData.full_name,
      ', Phone:',
      clientData.phone
    );

    // Use actual client phone number - this is the key fix!
    const clientPhoneNumber = clientData.phone;

    if (!clientPhoneNumber) {
      console.warn('❌ No client phone number provided');
      return { success: false, error: 'No client phone number provided' };
    }

    // Transform the data to our expected format
    const notificationData: AppointmentNotificationData = {
      clientName: clientData.full_name,
      clientPhone: clientPhoneNumber, // Use actual client phone
      services: servicesData.map(s => s.name),
      stylists: stylistsData.map(s => s.name),
      startTime: appointmentData.start_time,
      endTime: appointmentData.end_time,
      status: appointmentData.status,
      notes: appointmentData.notes,
      id: appointmentData.id,
      serviceDetails: servicesData.map(s => ({
        name: s.name,
        duration: s.duration || 60,
        price: s.price,
      })),
      totalAmount: servicesData.reduce((sum, s) => sum + (s.price || 0), 0),
    };

    // Use our existing notification function
    return await sendAppointmentNotification(action, notificationData);
  } catch (error) {
    console.error(
      `Error in sendAppointmentWhatsAppNotification (${action}):`,
      error
    );
    throw error;
  }
}
