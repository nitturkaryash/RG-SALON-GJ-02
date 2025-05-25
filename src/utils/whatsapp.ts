import { format } from 'date-fns';

// Helper function to safely access environment variables in both server and client contexts
const getEnvVariable = (key: string, fallback: string): string => {
  // Use hardcoded tokens to ensure they're always available
  const hardcodedValues: Record<string, string> = {
    'NEXT_PUBLIC_WHATSAPP_TOKEN': 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD',
    'NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID': '649515451575660',
    'NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID': '593695986423772',
    'NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE': '+918956860024'
  };

  // Always prioritize the hardcoded values for critical WhatsApp tokens
  if (hardcodedValues[key]) {
    console.log(`DEBUG - Using hardcoded value for ${key}`);
    return hardcodedValues[key];
  }

  // Otherwise try normal env methods
  if (typeof window !== 'undefined') {
    // Client-side
    return (window as any).__ENV__?.[key] || 
           (typeof process !== 'undefined' && process.env ? process.env[key] : undefined) || 
           fallback;
  }
  // Server-side
  return typeof process !== 'undefined' && process.env ? (process.env[key] || fallback) : fallback;
};

// WhatsApp Cloud API Configuration
const WHATSAPP_CONFIG = {
  token: getEnvVariable('NEXT_PUBLIC_WHATSAPP_TOKEN', 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD'),
  phoneNumberId: getEnvVariable('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID', '649515451575660'),
  businessAccountId: getEnvVariable('NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID', '593695986423772'),
  businessPhone: getEnvVariable('NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE', '+918956860024') // Your salon's contact phone
};

// Validate configuration
const validateConfig = () => {
  const missingVars = [];
  if (!WHATSAPP_CONFIG.token) missingVars.push('WhatsApp Token');
  if (!WHATSAPP_CONFIG.phoneNumberId) missingVars.push('Phone Number ID');
  if (!WHATSAPP_CONFIG.businessAccountId) missingVars.push('Business Account ID');

  if (missingVars.length > 0) {
    console.error(`Missing WhatsApp configuration: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

// Function to check WhatsApp configuration
export async function checkWhatsAppConfig() {
  console.log('Checking WhatsApp Configuration...');
  
  // Check if environment variables are set
  const configStatus = {
    token: {
      exists: !!WHATSAPP_CONFIG.token,
      value: WHATSAPP_CONFIG.token ? `${WHATSAPP_CONFIG.token.substring(0, 10)}...` : 'Missing',
    },
    phoneNumberId: {
      exists: !!WHATSAPP_CONFIG.phoneNumberId,
      value: WHATSAPP_CONFIG.phoneNumberId || 'Missing',
    },
    businessAccountId: {
      exists: !!WHATSAPP_CONFIG.businessAccountId,
      value: WHATSAPP_CONFIG.businessAccountId || 'Missing',
    },
  };

  console.log('Configuration Status:');
  console.log('- WhatsApp Token:', configStatus.token.exists ? 'Present' : 'Missing');
  console.log('- Phone Number ID:', configStatus.phoneNumberId.value);
  console.log('- Business Account ID:', configStatus.businessAccountId.value);

  // Test API connection if all configs are present
  if (configStatus.token.exists && configStatus.phoneNumberId.exists) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${WHATSAPP_CONFIG.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ WhatsApp API Connection Test: Successful');
        console.log('API Response:', data);
        return { success: true, config: configStatus, apiTest: data };
      } else {
        console.error('❌ WhatsApp API Connection Test Failed:', data);
        return { success: false, config: configStatus, error: data };
      }
    } catch (error) {
      console.error('❌ WhatsApp API Connection Test Failed:', error);
      return { success: false, config: configStatus, error };
    }
  } else {
    console.error('❌ Cannot test API connection: Missing configuration');
    return { success: false, config: configStatus, error: 'Missing configuration' };
  }
}

// Function to get the WhatsApp Phone Number ID
export async function getWhatsAppPhoneNumberId() {
  try {
    const response = await fetch(
      'https://graph.facebook.com/v17.0/me/phone_numbers',
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get phone numbers: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Available WhatsApp phone numbers:', data);
    
    // Find the phone number ID that matches our business number
    const phoneNumber = data.data?.find(
      (phone: any) => phone.display_phone_number?.includes(WHATSAPP_CONFIG.phoneNumberId)
    );

    if (!phoneNumber) {
      throw new Error('Phone number not found in WhatsApp Business Account');
    }

    return phoneNumber.id;
  } catch (error) {
    console.error('Error getting WhatsApp phone number ID:', error);
    throw error;
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
  id?: string; // Appointment ID for reference
  // Optional header override for testing
  _headerOverride?: {
    type: 'image' | 'text' | 'document' | 'video';
    value: string;
  };
  // Add service details for dynamic content
  serviceDetails?: Array<{
    name: string;
    duration: number; // Duration in minutes
    price: number;    // Price in rupees
  }>;
  totalAmount?: number; // Total price of all services
}

// Template types and names
const TEMPLATES = {
  CONFIRMATION: 'appointment_confirmation',
  REMINDER: 'appointment_reminder',
  UPDATE: 'appointment_change',
  CANCELLATION: 'appointment_cancellation'  // Use the correct template name from Facebook Manager
};

// Text headers for different templates
const TEXT_HEADERS = {
  CONFIRMATION: "APPOINTMENT CONFIRMED",
  REMINDER: "UPCOMING APPOINTMENT",
  UPDATE: "APPOINTMENT UPDATED",
  CANCELLATION: "APPOINTMENT CANCELLED"
};

/**
 * Send a template message via WhatsApp
 */
export async function sendTemplateMessage(
  data: AppointmentNotificationData,
  templateName: string,
  language: string = 'en_US'
): Promise<any> {
  console.log('DEBUG - Sending template message:', templateName);
  
  try {
    if (!validateConfig()) {
      throw new Error('Invalid WhatsApp configuration');
    }
    
    // Format the phone number
    const to = formatPhoneNumber(data.clientPhone);
    
    // Prepare components based on template type
    let components = [];
    
    if (templateName === 'appointment_confirmation') {
      // Format date and time for template
      const formattedDate = formatDateForTemplate(data.startTime);
      const formattedTime = formatTimeForTemplate(data.startTime);
      
      components = [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.clientName },
            { type: "text", text: formattedDate },
            { type: "text", text: formattedTime },
            { type: "text", text: data.services.join(', ') },
            { type: "text", text: data.stylists.join(', ') },
          ]
        }
      ];
    } else {
      // For other templates, implement as needed
      components = [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.clientName }
          ]
        }
      ];
    }
    
    console.log('DEBUG - Template components:', JSON.stringify(components));
    
    // Make API request to send template
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components: components
          }
        }),
      }
    );
    
    console.log('DEBUG - Template response status:', response.status);
    const responseData = await response.json();
    console.log('DEBUG - Template response data:', JSON.stringify(responseData));
    
    if (!response.ok) {
      throw new Error(`Template message failed: ${JSON.stringify(responseData)}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('DEBUG - Error sending template message:', error);
    throw error;
  }
}

/**
 * Format a date string to a readable date format
 */
function formatDateForTemplate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format a time string to a readable time format
 */
function formatTimeForTemplate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'h:mm a');
  } catch {
    return dateStr;
  }
}

/**
 * Generate a user-friendly reference ID
 * Format: SALON-YYYYMMDD-XXXX where XXXX is a short unique identifier
 */
function generateReferenceId(appointmentId: string, date: Date): string {
  const datePart = format(date, 'yyyyMMdd');
  const shortId = appointmentId.substring(0, 4).toUpperCase();
  return `SALON-${datePart}-${shortId}`;
}

/**
 * Send appointment confirmation using the approved template
 */
export async function sendAppointmentConfirmationTemplate(data: AppointmentNotificationData): Promise<any> {
  console.log('DEBUG - Sending appointment confirmation template message');
  
  try {
    // Format the phone number
    const formattedPhone = formatPhoneNumber(data.clientPhone);
    
    // Format date parts - extract from the startTime
    const date = new Date(data.startTime);
    const formattedDate = date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '-');  // Convert to DD-MM-YYYY format
    
    const formattedTime = date.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
    
    // Get first service and first stylist
    const service = data.services[0] || 'Salon Service';
    const stylist = data.stylists[0] || 'Our Stylist';
    
    // Create template message request body
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
                text: data.clientName
              },
              {
                type: "text",
                text: formattedDate
              },
              {
                type: "text",
                text: formattedTime
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
    
    console.log('DEBUG - Sending template request for appointment confirmation');
    
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
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('DEBUG - Template message error:', responseData);
      throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('DEBUG - Template message sent successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('DEBUG - Error sending appointment confirmation template:', error);
    throw error;
  }
}

/**
 * Send notification based on appointment action
 */
export async function sendAppointmentNotification(action: 'created' | 'updated' | 'cancelled' | 'template', data: AppointmentNotificationData): Promise<any> {
  console.log(`DEBUG - sendAppointmentNotification called with action: ${action}`);
  console.log(`DEBUG - Client phone: "${data.clientPhone}", Name: "${data.clientName}"`);
  
  try {
    // Validate WhatsApp configuration
    if (!validateConfig()) {
      console.error('WhatsApp configuration is invalid. Check your environment variables.');
      throw new Error('Invalid WhatsApp configuration');
    }

    // Validate critical data
    if (!data.clientPhone) {
      throw new Error('Missing client phone number');
    }
    
    // First, validate and format the phone number
    const formattedPhone = formatPhoneNumber(data.clientPhone);
    if (!formattedPhone) {
      throw new Error(`Invalid phone number format: ${data.clientPhone}`);
    }
    
    console.log(`DEBUG - Using formatted phone: ${formattedPhone}`);
    
    // IMPORTANT UPDATE: Use template for all first contacts to comply with WhatsApp policies
    if (action === 'created') {
      // Always use template for appointment confirmation
      console.log('DEBUG - Using template for appointment confirmation');
      return await sendAppointmentConfirmationTemplate(data);
    }
    
    // For regular notifications
    switch (action) {
      case 'updated':
        console.log('DEBUG - Sending appointment update');
        return sendAppointmentUpdate(data);
      case 'cancelled':
        console.log('DEBUG - Sending appointment cancellation');
        return sendAppointmentCancellation(data);
      default:
        throw new Error(`Unknown notification action: ${action}`);
    }
  } catch (error) {
    console.error(`DEBUG - Error in sendAppointmentNotification (${action}):`, error);
    if (error instanceof Error) {
      console.error('DEBUG - Error message:', error.message);
      console.error('DEBUG - Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Send appointment update notification with header
 */
export async function sendAppointmentUpdate(data: AppointmentNotificationData): Promise<any> {
  const formattedDate = formatDateForTemplate(data.startTime);
  const formattedTime = formatTimeForTemplate(data.startTime);
  const servicesList = data.services.join(', ');
  const stylistsList = data.stylists.join(', ');
  const contactPhone = WHATSAPP_CONFIG.businessPhone;
  
  // Use header override if provided, otherwise use default text header
  const headerParam = data._headerOverride || { 
    type: 'text' as const, 
    value: TEXT_HEADERS.UPDATE
  };
  
  try {
    return await sendTemplateMessage(
      data,
      TEMPLATES.UPDATE,
      'en_US'
    );
  } catch (error) {
    console.error('Failed to send appointment update:', error);
    throw error;
  }
}

/**
 * Send appointment cancellation notification with header
 */
export async function sendAppointmentCancellation(data: AppointmentNotificationData): Promise<any> {
  console.log('DEBUG - Sending appointment cancellation template message');
  
  try {
    if (!validateConfig()) {
      throw new Error('Invalid WhatsApp configuration');
    }
    
    // Format the phone number
    const formattedPhone = formatPhoneNumber(data.clientPhone);
    
    // Format date and time for template
    const date = new Date(data.startTime);
    const formattedDate = date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '-');  // Convert to DD-MM-YYYY format
    
    const formattedTime = date.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
    
    // Create template message request body for cancellation
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "appointment_cancellation",
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: data.clientName
              },
              {
                type: "text",
                text: formattedDate
              },
              {
                type: "text",
                text: formattedTime
              }
            ]
          }
        ]
      }
    };
    
    console.log('DEBUG - Sending cancellation template request');
    
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
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('DEBUG - Cancellation template message error:', responseData);
      throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('DEBUG - Cancellation template message sent successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Failed to send appointment cancellation:', error);
    throw error;
  }
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
  data: AppointmentNotificationData,
  reminderType: '24h' | '2h' = '24h'
): Promise<any> {
  console.log(`DEBUG - Sending ${reminderType} appointment reminder`);
  
  try {
    if (!validateConfig()) {
      throw new Error('Invalid WhatsApp configuration');
    }
    
    // Format the phone number
    const formattedPhone = formatPhoneNumber(data.clientPhone);
    
    // Format date and time for template
    const date = new Date(data.startTime);
    const formattedDate = date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '-');
    
    const formattedTime = date.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
    
    // Get first service and first stylist
    const service = data.services[0] || 'Salon Service';
    const stylist = data.stylists[0] || 'Our Stylist';
    
    // Create different reminder messages based on timing
    let reminderMessage = '';
    if (reminderType === '24h') {
      reminderMessage = `🔔 APPOINTMENT REMINDER - TOMORROW\n\nHi ${data.clientName}!\n\nThis is a friendly reminder about your appointment tomorrow:\n\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n💇 Service: ${service}\n👨‍💼 Stylist: ${stylist}\n\n📍 Location: RG Salon\n\nPlease arrive 10 minutes early. Looking forward to seeing you!\n\nNeed to reschedule? Please call us at least 2 hours before your appointment.`;
    } else {
      reminderMessage = `⏰ APPOINTMENT REMINDER - IN 2 HOURS\n\nHi ${data.clientName}!\n\nYour appointment is coming up soon:\n\n📅 Today: ${formattedDate}\n⏰ Time: ${formattedTime}\n💇 Service: ${service}\n👨‍💼 Stylist: ${stylist}\n\n📍 Location: RG Salon\n\nPlease arrive 10 minutes early. We're excited to see you!\n\nRunning late? Please give us a call.`;
    }
    
    // Try to use template first, fallback to direct message
    try {
      // Use the appointment confirmation template but with reminder context
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
                  text: data.clientName
                },
                {
                  type: "text",
                  text: formattedDate
                },
                {
                  type: "text",
                  text: formattedTime
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
      
      console.log(`DEBUG - Sending ${reminderType} reminder template`);
      
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
      
      if (!response.ok) {
        console.error(`DEBUG - ${reminderType} reminder template error:`, responseData);
        throw new Error(`WhatsApp template API error: ${JSON.stringify(responseData)}`);
      }
      
      console.log(`DEBUG - ${reminderType} reminder template sent successfully:`, responseData);
      return responseData;
      
    } catch (templateError) {
      console.warn(`DEBUG - Template failed for ${reminderType} reminder, trying direct message:`, templateError);
      
      // Fallback to direct text message
      return await sendDirectTextMessage(formattedPhone, reminderMessage);
    }
    
  } catch (error) {
    console.error(`DEBUG - Error sending ${reminderType} appointment reminder:`, error);
    throw error;
  }
}

/**
 * Format a phone number to include country code
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Debug original phone format
  console.log('DEBUG - Original phone format:', phone);
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  console.log('DEBUG - Cleaned phone number:', cleaned);
  
  // Add country code if not present (default to 91 for India)
  let formattedPhone = cleaned;
  if (!cleaned.startsWith('91') && cleaned.length > 6) {
    formattedPhone = `91${cleaned}`;
  }
  
  console.log('DEBUG - Final formatted phone:', formattedPhone);
  return formattedPhone;
}

// Legacy function for backward compatibility
export async function sendWhatsAppMessage(to: string, message: string, clientName?: string): Promise<any> {
  console.warn('sendWhatsAppMessage is deprecated. Use sendAppointmentNotification instead.');
  // This is just for backward compatibility
  try {
    const data = {
      clientName: clientName || 'Customer',
      clientPhone: to,
      services: ['Your booked service'],
      stylists: ['Your stylist'],
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      status: 'scheduled',
      notes: message
    };
    
    return await sendAppointmentConfirmationTemplate(data);
  } catch (error) {
    console.error('Error in legacy sendWhatsAppMessage:', error);
    throw error;
  }
}

export function formatAppointmentMessage(action: 'created' | 'updated' | 'deleted', data: AppointmentNotificationData): string {
  console.warn('formatAppointmentMessage is deprecated. WhatsApp now uses templates.');
  return `Appointment ${action}: ${data.clientName}, ${formatDateForTemplate(data.startTime)}`;
}

export async function testWhatsAppIntegration(testPhoneNumber: string) {
  try {
    const message = "🔔 Test Message\n\nThis is a test message from your salon appointment system.\n\nIf you received this message, the WhatsApp integration is working correctly! 🎉";
    
    console.log('Testing WhatsApp integration...');
    console.log('Sending test message to:', testPhoneNumber);
    
    const result = await sendWhatsAppMessage(formatPhoneNumber(testPhoneNumber), message);
    console.log('Test message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('WhatsApp integration test failed:', error);
    throw error;
  }
}

/**
 * Send a direct text message to a phone number without template requirements
 * This is primarily for testing purposes
 */
export async function sendDirectTextMessage(phoneNumber: string, messageText: string): Promise<any> {
  console.log('DEBUG - Sending direct text message to:', phoneNumber);
  
  try {
    if (!validateConfig()) {
      throw new Error('Invalid WhatsApp configuration');
    }
    
    // Ensure phone number is properly formatted
    let formattedPhone = phoneNumber;
    
    // Strip any non-numeric characters
    formattedPhone = formattedPhone.replace(/\D/g, '');
    
    // Ensure it has country code (91 for India)
    if (!formattedPhone.startsWith('91') && formattedPhone.length >= 10) {
      formattedPhone = `91${formattedPhone}`;
    }
    
    console.log('DEBUG - Using phone number for WhatsApp API:', formattedPhone);
    
    // Ensure token is available
    const token = WHATSAPP_CONFIG.token;
    const phoneNumberId = WHATSAPP_CONFIG.phoneNumberId;
    
    if (!token || !phoneNumberId) {
      throw new Error(`Missing required WhatsApp config: token=${!!token}, phoneNumberId=${phoneNumberId}`);
    }
    
    // Build the request body
    const requestBody = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText
      }
    });
    
    console.log('DEBUG - WhatsApp API request body:', requestBody);
    console.log('DEBUG - WhatsApp API endpoint:', `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`);
    console.log('DEBUG - WhatsApp token (first 10 chars):', token.substring(0, 10) + '...');
    
    // Make API request
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      }
    );
    
    console.log('DEBUG - Direct message response status:', response.status, response.statusText);
    
    // Get response data
    const responseData = await response.json();
    console.log('DEBUG - Direct message response data:', JSON.stringify(responseData));
    
    // Check for error response
    if (!response.ok) {
      console.error('WhatsApp API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      
      throw new Error(`WhatsApp API error (${response.status}): ${JSON.stringify(responseData)}`);
    }
    
    console.log('✅ Direct message sent successfully');
    return responseData;
  } catch (error) {
    console.error('ERROR: Failed to send WhatsApp message:', error);
    throw error;
  }
} 