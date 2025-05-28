import { AppointmentNotificationData } from '../whatsapp/open-source/services/whatsappWebService';

export interface AppointmentData {
  id: string;
  client_id: string;
  stylist_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
}

export interface Client {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration?: number;
}

export interface Stylist {
  id: string;
  name: string;
}

/**
 * Send WhatsApp notification for appointment actions
 */
export async function sendAppointmentWhatsAppNotification(
  action: 'created' | 'updated' | 'cancelled',
  appointment: AppointmentData,
  client: Client,
  services: Service[],
  stylists: Stylist[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate required data
    if (!client.phone) {
      console.warn('[WhatsApp] No phone number for client, skipping notification');
      return { success: false, error: 'No phone number provided' };
    }

    // Format phone number (ensure it has country code)
    let formattedPhone = client.phone.replace(/\D/g, ''); // Remove non-digits
    if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone; // Add India country code
    }

    // Construct the message for Selenium script
    let messageBody = `Appointment ${action}:\nClient: ${client.full_name}\nServices: ${services.map(s => s.name).join(', ')}\nStylists: ${stylists.map(s => s.name).join(', ')}\nDate: ${new Date(appointment.start_time).toLocaleDateString()}\nTime: ${new Date(appointment.start_time).toLocaleTimeString()}`;
    if (appointment.notes) {
      messageBody += `\nNotes: ${appointment.notes}`;
    }

    console.log(`[WhatsApp] Preparing to send to Selenium API. Phone: ${formattedPhone}, Action: ${action}`);

    // Call the API endpoint for Selenium
    const response = await fetch('/api/whatsapp/send-selenium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        message: messageBody
      })
    });

    // const result = await response.json(); // This line might error if response is not JSON (e.g. on 500 without JSON body)
    // Let's try to get text first for better error diagnosis from server
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText); 
    } catch (e) {
      // If parsing failed, the response was not JSON. This might happen with some 500 errors.
      console.error('[WhatsApp] Response from /api/whatsapp/send-selenium was not valid JSON:', responseText);
      // If response was not ok and not JSON, use the text as error message
      if (!response.ok) {
        return { success: false, error: `Server Error: ${response.status} - ${responseText || 'No additional error message from server.'}` };
      }
      // If response was ok but not JSON (shouldn't happen with current send-selenium logic but good to handle)
      result = { success: false, error: 'Received non-JSON success response from server.' }; 
    }

    if (response.ok && result.success) {
      console.log(`[WhatsApp] ${action} notification sent successfully`);
      return { success: true };
    } else {
      console.error(`[WhatsApp] Failed to send ${action} notification:`, result.error);
      return { success: false, error: result.error || 'Selenium script reported failure.' };
    }

  } catch (error) {
    console.error(`[WhatsApp] Error sending ${action} notification via Selenium:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Helper function to check if WhatsApp notifications are enabled
 */
export function isWhatsAppEnabled(): boolean {
  // You can add environment variable checks here
  return true; // For now, always enabled for open-source implementation
}

/**
 * Helper function to validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number (10 digits) or with country code (12 digits starting with 91)
  return (cleaned.length === 10 && /^[6-9]/.test(cleaned)) || 
         (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]/.test(cleaned));
} 