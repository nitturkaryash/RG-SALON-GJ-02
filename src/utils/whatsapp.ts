import { format } from 'date-fns';
import { sendAppointmentWhatsAppNotification as sendViaSeleniumAPI } from '../utils/whatsappNotifications';

// Helper function to safely access environment variables (can be simplified if only used for Selenium)
const getEnvVariable = (key: string, fallback: string): string => {
  // For Selenium setup, we might not need these Facebook-specific tokens here anymore.
  // However, keeping the function structure for now in case other parts of the app use it.
  const hardcodedValues: Record<string, string> = {
    // These are Facebook API specific, likely not needed if only using Selenium
    // 'NEXT_PUBLIC_WHATSAPP_TOKEN': 'YOUR_FB_TOKEN_IF_YOU_HAD_ONE',
    // 'NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID': 'YOUR_FB_PHONE_ID_IF_YOU_HAD_ONE',
  };

  if (hardcodedValues[key]) {
    console.log(`DEBUG - Using hardcoded value for ${key}`);
    return hardcodedValues[key];
  }

  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key] || 
           (typeof process !== 'undefined' && process.env ? process.env[key] : undefined) || 
           fallback;
  }
  return typeof process !== 'undefined' && process.env ? (process.env[key] || fallback) : fallback;
};

// This WHATSAPP_CONFIG is for Facebook API, can be largely removed or ignored if only using Selenium.
const WHATSAPP_CONFIG = {
  token: getEnvVariable('NEXT_PUBLIC_WHATSAPP_TOKEN', ''), // No longer primary
  phoneNumberId: getEnvVariable('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID', ''), // No longer primary
  businessAccountId: getEnvVariable('NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID', ''), // No longer primary
  businessPhone: getEnvVariable('NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE', '+918956860024') // Still useful for display
};

// This validation is for Facebook API, can be simplified.
const validateConfig = () => {
  // For Selenium, we don't need to validate Facebook tokens here.
  // We might need other validations if your Selenium script requires specific env vars.
  console.log('DEBUG - Skipping Facebook API config validation as Selenium is used.');
  return true;
};

// This function is Facebook API specific and can be removed or heavily modified.
export async function checkWhatsAppConfig() {
  console.log('DEBUG - checkWhatsAppConfig called, but using Selenium. No Facebook API check performed.');
  return { success: true, message: 'Using Selenium-based WhatsApp. No Facebook API configuration to check.', config: {}, apiTest: null };
}

// This function is Facebook API specific and can be removed.
export async function getWhatsAppPhoneNumberId() {
  console.warn('DEBUG - getWhatsAppPhoneNumberId called, but is Facebook API specific and not used with Selenium.');
  throw new Error('Facebook API specific function, not applicable for Selenium setup.');
}

export interface AppointmentNotificationData {
  clientName: string;
  clientPhone: string;
  services: string[];
  stylists: string[];
  startTime: string;
  endTime: string;
  status: string; // Example: 'scheduled', 'confirmed', 'cancelled', 'updated'
  notes?: string;
  id?: string;
  serviceDetails?: Array<{
    name: string;
    duration: number;
    price: number;
  }>;
  totalAmount?: number;
}

// TEMPLATES and TEXT_HEADERS are Facebook API specific and can be removed or ignored.
// const TEMPLATES = { ... };
// const TEXT_HEADERS = { ... };

// This function was for Facebook API templates and can be removed.
// export async function sendTemplateMessage(...) { ... }

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

// This was for Facebook API.
// function generateReferenceId(...) { ... }

// CORE NOTIFICATION FUNCTION - THIS WILL NOW CALL THE SELENIUM API HANDLER
/**
 * Send notification based on appointment action using the Selenium-based API endpoint.
 */
export async function sendAppointmentNotification(
  action: 'created' | 'updated' | 'cancelled',
  data: AppointmentNotificationData
): Promise<any> {
  console.log(`DEBUG - [Selenium] sendAppointmentNotification called with action: ${action}`);
  console.log(`DEBUG - [Selenium] Client phone: "${data.clientPhone}", Name: "${data.clientName}"`);
  
  try {
    if (!data.clientPhone) {
      console.error('[Selenium] Missing client phone number for notification.');
      throw new Error('Missing client phone number');
    }

    const client = {
      id: data.id || 'unknown-client-id', // Assuming data.id might be client_id or appointment_id related
      full_name: data.clientName,
      phone: data.clientPhone,
    };

    const appointmentForSelenium = {
      id: data.id || 'unknown-appointment-id',
      client_id: client.id, // Or however you get this
      stylist_id: data.stylists.join(',') || 'unknown-stylist', // Simplification
      service_id: data.services.join(',') || 'unknown-service', // Simplification
      start_time: data.startTime,
      end_time: data.endTime,
      status: data.status, // Pass the action directly as status, or map it
      notes: data.notes,
    };

    const servicesForSelenium = data.serviceDetails || data.services.map(s_name => ({ name: s_name, duration: 60, price: 0 }));
    const stylistsForSelenium = data.stylists.map(s_name => ({ id: s_name, name: s_name }));

    console.log(`[Selenium] Calling sendViaSeleniumAPI for action: ${action}`);
    // The sendViaSeleniumAPI (imported from whatsappNotifications.ts) is expected
    // to hit your /api/whatsapp/appointment-notification endpoint.
    return await sendViaSeleniumAPI(
      action, 
      appointmentForSelenium, 
      client, 
      servicesForSelenium, 
      stylistsForSelenium
    );

  } catch (error) {
    console.error(`DEBUG - [Selenium] Error in sendAppointmentNotification (${action}):`, error);
    if (error instanceof Error) {
      console.error('DEBUG - [Selenium] Error message:', error.message);
      // console.error('DEBUG - [Selenium] Error stack:', error.stack);
    }
    throw error; // Re-throw the error so the caller (e.g., useAppointments) can handle it
  }
}

// The following functions were specific to Facebook API templates and are now effectively bypassed
// or will not be called if sendAppointmentNotification is the main entry point.
// They can be removed if not called from elsewhere.

export async function sendAppointmentConfirmationTemplate(data: AppointmentNotificationData): Promise<any> {
  console.warn('Deprecated: sendAppointmentConfirmationTemplate. Using generic sendAppointmentNotification for Selenium.');
  return sendAppointmentNotification('created', data);
}

export async function sendAppointmentUpdate(data: AppointmentNotificationData): Promise<any> {
  console.warn('Deprecated: sendAppointmentUpdate. Using generic sendAppointmentNotification for Selenium.');
  return sendAppointmentNotification('updated', data);
}

export async function sendAppointmentCancellation(data: AppointmentNotificationData): Promise<any> {
  console.warn('Deprecated: sendAppointmentCancellation. Using generic sendAppointmentNotification for Selenium.');
  return sendAppointmentNotification('cancelled', data);
}

export async function sendAppointmentReminder(
  data: AppointmentNotificationData,
  reminderType: '24h' | '2h' = '24h'
): Promise<any> {
  console.warn(`Deprecated: sendAppointmentReminder (${reminderType}). Using generic sendAppointmentNotification for Selenium if needed, or implement specific Selenium logic.`);
  // You might want to map reminderType to a specific 'action' or handle it differently
  // For now, treating it as an 'updated' type action for demonstration
  const reminderAction = 'updated'; // Or a new action type like 'reminder_24h'
  return sendAppointmentNotification(reminderAction, { ...data, notes: `Reminder: ${reminderType} for your appointment.` });
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  let formattedPhone = cleaned;
  if (!cleaned.startsWith('91') && cleaned.length > 6) {
    formattedPhone = `91${cleaned}`;
  }
  return formattedPhone;
}

// Legacy function - ensure it also uses the Selenium path
export async function sendWhatsAppMessage(to: string, message: string, clientName?: string): Promise<any> {
  console.warn('sendWhatsAppMessage is deprecated. Routing to Selenium-based notification.');
  const now = new Date().toISOString();
  const dummyData: AppointmentNotificationData = {
    clientName: clientName || 'Customer',
    clientPhone: to,
    services: ['General Message'], // Placeholder
    stylists: ['Salon'], // Placeholder
    startTime: now,
    endTime: now,
    status: 'created', // Or a more generic status like 'message'
    notes: message,
    id: 'legacy-' + Date.now().toString()
  };
  return sendAppointmentNotification('created', dummyData);
}

export function formatAppointmentMessage(action: 'created' | 'updated' | 'deleted', data: AppointmentNotificationData): string {
  console.warn('formatAppointmentMessage is deprecated. Selenium script will handle message formatting.');
  return `Appointment ${action}: ${data.clientName}, ${formatDateForTemplate(data.startTime)}`;
}

export async function testWhatsAppIntegration(testPhoneNumber: string) {
  console.log('[Selenium] Testing WhatsApp integration...');
  const now = new Date().toISOString();
  const testData: AppointmentNotificationData = {
    clientName: 'Test Client',
    clientPhone: testPhoneNumber,
    services: ['Test Service'],
    stylists: ['Test Stylist'],
    startTime: now,
    endTime: now,
    status: 'created', // Using 'created' as the action for the test
    notes: 'This is a test message from your salon appointment system (Selenium).',
    id: 'test-' + Date.now().toString()
  };
  try {
    const result = await sendAppointmentNotification('created', testData);
    console.log('[Selenium] Test message attempt result:', result);
    return result;
  } catch (error) {
    console.error('[Selenium] WhatsApp integration test failed:', error);
    throw error;
  }
}

// This function was for direct Facebook API text messages. Can be removed.
// export async function sendDirectTextMessage(...) { ... } 