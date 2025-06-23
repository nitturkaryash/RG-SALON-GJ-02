#!/usr/bin/env node

/**
 * Professional WhatsApp Integration for RG Salon
 * 
 * This module integrates the professional WhatsApp notification system
 * with the actual appointment management functionality.
 * 
 * Messages are now sent to actual client phone numbers.
 */

export interface AppointmentData {
  clientName: string;
  clientPhone?: string;
  date: string;
  time: string;
  services: string[];
  stylists: string[];
  amount: number;
  bookingId: string;
  notes?: string;
  oldDate?: string;
  oldTime?: string;
  reason?: string;
  reminderType?: '24h' | '2h';
}

// Business phone for contact
const BUSINESS_PHONE = '+91-8956860024';

// Helper function to format phone number for WhatsApp
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it's a 10-digit Indian number, add country code
  if (cleaned.length === 10 && !cleaned.startsWith('91')) {
    cleaned = '91' + cleaned;
  }
  
  // If it already has country code, ensure it's properly formatted
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  
  // If it's 13 digits and starts with 91, remove extra digit
  if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return cleaned.substring(1);
  }
  
  return cleaned;
};

// Generate professional message templates
const generateMessage = (type: 'confirmation' | 'rescheduling' | 'cancellation' | 'reminder', data: AppointmentData): string => {
  const messages = {
    confirmation: `🎉 *Appointment Confirmed!*

Dear ${data.clientName},

Your appointment at *RG Salon* has been successfully confirmed!

📅 *Date:* ${data.date}
⏰ *Time:* ${data.time}
💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}
💰 *Amount:* ₹${data.amount.toFixed(2)}

${data.notes ? `📝 *Notes:* ${data.notes}\n` : ''}*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: ${BUSINESS_PHONE}

*Booking ID:* ${data.bookingId}`,

    rescheduling: `📅 *Appointment Rescheduled*

Dear ${data.clientName},

Your appointment at *RG Salon* has been successfully rescheduled.

*Previous Appointment:*
📅 Date: ${data.oldDate}
⏰ Time: ${data.oldTime}

*New Appointment:*
📅 *Date:* ${data.date}
⏰ *Time:* ${data.time}
💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}
💰 *Amount:* ₹${data.amount.toFixed(2)}

${data.notes ? `📝 *Notes:* ${data.notes}\n` : ''}Thank you for your flexibility! 💖

For any queries, call us at: ${BUSINESS_PHONE}

*Booking ID:* ${data.bookingId}`,

    cancellation: `❌ *Appointment Cancelled*

Dear ${data.clientName},

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* ${data.date}
⏰ *Cancelled Time:* ${data.time}
💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}
💰 *Amount:* ₹${data.amount.toFixed(2)}

*Reason:* ${data.reason || 'Scheduling conflict'}

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: ${BUSINESS_PHONE}

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖

*Booking ID:* ${data.bookingId}`,

    reminder: `⏰ *Appointment Reminder*

Dear ${data.clientName},

This is a friendly reminder that you have an appointment at *RG Salon* ${data.reminderType === '24h' ? 'tomorrow' : 'in 2 hours'}.

📅 *Date:* ${data.date}
⏰ *Time:* ${data.time}
💅 *Services:* ${data.services.join(', ')}
✨ *Stylists:* ${data.stylists.join(', ')}
💰 *Amount:* ₹${data.amount.toFixed(2)}

${data.notes ? `📝 *Notes:* ${data.notes}\n` : ''}*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

${data.reminderType === '2h' ? '🚨 *Final Reminder* - Please confirm your attendance by replying YES\n\n' : ''}📞 Contact us: ${BUSINESS_PHONE}

Thank you for choosing RG Salon! 💖

*Booking ID:* ${data.bookingId}`
  };

  return messages[type];
};

// Main function to send professional WhatsApp notifications
export const sendProfessionalWhatsAppNotification = async (
  type: 'confirmation' | 'rescheduling' | 'cancellation' | 'reminder',
  appointmentData: AppointmentData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    console.log(`🔍 [DEBUG] Starting ${type} notification process...`);
    console.log('🔍 [DEBUG] Input data:', JSON.stringify(appointmentData, null, 2));
    
    // Use actual client phone number
    const targetPhone = formatPhoneNumber(appointmentData.clientPhone || '');
    
    console.log(`🔍 [DEBUG] Original phone: ${appointmentData.clientPhone}`);
    console.log(`🔍 [DEBUG] Formatted phone: ${targetPhone}`);
    
    if (!targetPhone) {
      console.warn('❌ No valid client phone number provided');
      return { success: false, error: 'No valid client phone number' };
    }

    console.log(`📱 [Professional WhatsApp] Sending ${type} notification to client: ${targetPhone}`);
    console.log(`📋 Client: ${appointmentData.clientName}, Booking: ${appointmentData.bookingId}`);
    
    const message = generateMessage(type, appointmentData);
    console.log(`🔍 [DEBUG] Generated message length: ${message.length} characters`);
    
    const requestPayload = {
      phone: targetPhone,
      message: message
    };
    
    // Use relative URL - Vite proxy will forward to backend server
    const apiUrl = '/api/whatsapp/send-message';
    console.log(`🔍 [DEBUG] Sending request to: ${apiUrl}`);
    console.log(`🔍 [DEBUG] Request payload:`, JSON.stringify(requestPayload, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });
    
    console.log(`🔍 [DEBUG] Response status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log(`🔍 [DEBUG] Response data:`, JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log(`✅ Professional ${type} notification sent successfully!`);
      console.log(`📱 Message sent to client: ${targetPhone}`);
      if (result.data?.messages?.[0]?.id) {
        console.log(`📋 Message ID: ${result.data.messages[0].id}`);
      }
      return { success: true, messageId: result.data?.messages?.[0]?.id };
    } else {
      console.error(`❌ Professional ${type} notification failed:`, result.error);
      console.error(`🔍 [DEBUG] Full error response:`, result);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Professional ${type} notification exception:`, error);
    console.error(`🔍 [DEBUG] Exception details:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to format appointment data from the database
export const formatAppointmentDataForWhatsApp = (
  appointmentData: {
    clientName: string;
    clientPhone?: string;
    startTime: string;
    endTime?: string;
    services: string[];
    stylists: string[];
    totalAmount: number;
    booking_id?: string | null;
    notes?: string;
  },
  options?: {
    oldDate?: string;
    oldTime?: string;
    reason?: string;
    reminderType?: '24h' | '2h';
  }
): AppointmentData => {
  const appointmentDate = new Date(appointmentData.startTime);
  
  return {
    clientName: appointmentData.clientName,
    clientPhone: appointmentData.clientPhone,
    date: appointmentDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: appointmentDate.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }),
    services: appointmentData.services,
    stylists: appointmentData.stylists,
    amount: appointmentData.totalAmount || 0,
    bookingId: appointmentData.booking_id || `RG${Date.now().toString().slice(-6)}`,
    notes: appointmentData.notes,
    oldDate: options?.oldDate,
    oldTime: options?.oldTime,
    reason: options?.reason,
    reminderType: options?.reminderType
  };
};

// Utility function to send appointment confirmation
export const sendAppointmentConfirmation = async (appointmentData: {
  clientName: string;
  clientPhone?: string;
  startTime: string;
  services: string[];
  stylists: string[];
  totalAmount: number;
  booking_id?: string | null;
  notes?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const formattedData = formatAppointmentDataForWhatsApp(appointmentData);
  return await sendProfessionalWhatsAppNotification('confirmation', formattedData);
};

// Utility function to send appointment rescheduling notification
export const sendAppointmentRescheduling = async (
  appointmentData: {
    clientName: string;
    clientPhone?: string;
    startTime: string;
    services: string[];
    stylists: string[];
    totalAmount: number;
    booking_id?: string | null;
    notes?: string;
  },
  oldDate: string,
  oldTime: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const formattedData = formatAppointmentDataForWhatsApp(appointmentData, { oldDate, oldTime });
  return await sendProfessionalWhatsAppNotification('rescheduling', formattedData);
};

// Utility function to send appointment cancellation notification
export const sendAppointmentCancellation = async (
  appointmentData: {
    clientName: string;
    clientPhone?: string;
    startTime: string;
    services: string[];
    stylists: string[];
    totalAmount: number;
    booking_id?: string | null;
    notes?: string;
  },
  reason?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const formattedData = formatAppointmentDataForWhatsApp(appointmentData, { reason });
  return await sendProfessionalWhatsAppNotification('cancellation', formattedData);
};

// Utility function to send appointment reminder
export const sendAppointmentReminder = async (
  appointmentData: {
    clientName: string;
    clientPhone?: string;
    startTime: string;
    services: string[];
    stylists: string[];
    totalAmount: number;
    booking_id?: string | null;
    notes?: string;
  },
  reminderType: '24h' | '2h' = '24h'
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const formattedData = formatAppointmentDataForWhatsApp(appointmentData, { reminderType });
  return await sendProfessionalWhatsAppNotification('reminder', formattedData);
};

// Integration helper for appointment hooks
export const integrateWithAppointmentHooks = {
  // For use in createAppointment mutation
  onAppointmentCreated: async (notificationData: {
    clientName: string;
    clientPhone: string;
    services: string[];
    stylists: string[];
    startTime: string;
    totalAmount: number;
    booking_id?: string | null;
    notes?: string;
  }) => {
    console.log('📱 [Integration] Sending appointment confirmation via professional WhatsApp...');
    return await sendAppointmentConfirmation(notificationData);
  },

  // For use in updateAppointment mutation
  onAppointmentUpdated: async (
    notificationData: {
      clientName: string;
      clientPhone: string;
      services: string[];
      stylists: string[];
      startTime: string;
      totalAmount: number;
      booking_id?: string | null;
      notes?: string;
    },
    isReschedule: boolean = false,
    oldDate?: string,
    oldTime?: string
  ) => {
    console.log('📱 [Integration] Sending appointment update via professional WhatsApp...');
    if (isReschedule && oldDate && oldTime) {
      return await sendAppointmentRescheduling(notificationData, oldDate, oldTime);
    } else {
      // For general updates, use confirmation message with updated info
      return await sendAppointmentConfirmation(notificationData);
    }
  },

  // For use in deleteAppointment mutation
  onAppointmentCancelled: async (
    notificationData: {
      clientName: string;
      clientPhone: string;
      services: string[];
      stylists: string[];
      startTime: string;
      totalAmount: number;
      booking_id?: string | null;
      notes?: string;
    },
    reason?: string
  ) => {
    console.log('📱 [Integration] Sending appointment cancellation via professional WhatsApp...');
    return await sendAppointmentCancellation(notificationData, reason);
  },

  // For scheduled reminders
  onReminderScheduled: async (
    notificationData: {
      clientName: string;
      clientPhone: string;
      services: string[];
      stylists: string[];
      startTime: string;
      totalAmount: number;
      booking_id?: string | null;
      notes?: string;
    },
    reminderType: '24h' | '2h' = '24h'
  ) => {
    console.log(`📱 [Integration] Sending ${reminderType} reminder via professional WhatsApp...`);
    return await sendAppointmentReminder(notificationData, reminderType);
  }
};

// Export configuration
export const PROFESSIONAL_WHATSAPP_CONFIG = {
  businessPhone: BUSINESS_PHONE,
  serverPorts: [3004, 3003, 3002, 3001, 5174, 5175, 5173, 3000, 3005, 3006],
  enabled: true
};

console.log('💅 Professional WhatsApp Integration initialized');
console.log(`📞 Business Phone: ${BUSINESS_PHONE}`); 