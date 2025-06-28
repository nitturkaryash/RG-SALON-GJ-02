import { supabase } from './supabase/supabaseClient';
import { sendAppointmentNotification, AppointmentNotificationData } from './whatsapp';

interface AppointmentReminderData {
  id: string;
  clientName: string;
  clientPhone: string;
  startTime: string;
  endTime: string;
  services: string[];
  stylists: string[];
  totalAmount: number;
  notes?: string;
}

/**
 * Get appointments that need reminders
 * @param hoursBeforeAppointment - Number of hours before appointment to send reminder
 * @returns Array of appointments needing reminders
 */
export async function getAppointmentsNeedingReminders(hoursBeforeAppointment: number = 24): Promise<AppointmentReminderData[]> {
  try {
    // Calculate the time window for reminders
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursBeforeAppointment * 60 * 60 * 1000);
    const windowStart = new Date(reminderTime.getTime() - 30 * 60 * 1000); // 30 minutes window
    const windowEnd = new Date(reminderTime.getTime() + 30 * 60 * 1000);

    console.log(`🔍 Checking for appointments needing ${hoursBeforeAppointment}h reminders between:`, {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString()
    });

    // Query appointments in the reminder window
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        notes,
        status,
        clients (
          full_name,
          phone
        ),
        appointment_services (
          services (
            name,
            price
          )
        ),
        appointment_stylists (
          stylists (
            name
          )
        )
      `)
      .eq('status', 'scheduled')
      .gte('start_time', windowStart.toISOString())
      .lte('start_time', windowEnd.toISOString());

    if (error) {
      console.error('❌ Error fetching appointments for reminders:', error);
      return [];
    }

    if (!appointments || appointments.length === 0) {
      console.log(`ℹ️ No appointments found needing ${hoursBeforeAppointment}h reminders`);
      return [];
    }

    console.log(`📅 Found ${appointments.length} appointments needing ${hoursBeforeAppointment}h reminders`);

    // Transform data for reminder processing
    const reminderData: AppointmentReminderData[] = appointments.map(appointment => ({
      id: appointment.id,
      clientName: appointment.clients?.full_name || 'Unknown Client',
      clientPhone: appointment.clients?.phone || '',
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      services: appointment.appointment_services?.map(as => as.services?.name).filter(Boolean) || [],
      stylists: appointment.appointment_stylists?.map(ast => ast.stylists?.name).filter(Boolean) || [],
      totalAmount: appointment.appointment_services?.reduce((total, as) => total + (as.services?.price || 0), 0) || 0,
      notes: appointment.notes
    }));

    return reminderData.filter(data => data.clientPhone); // Only return appointments with phone numbers
  } catch (error) {
    console.error('❌ Error in getAppointmentsNeedingReminders:', error);
    return [];
  }
}

/**
 * Send appointment reminder via WhatsApp
 * @param appointmentData - Appointment data for reminder
 * @param reminderType - Type of reminder (24h or 2h)
 * @returns Promise<boolean> - Success status
 */
export async function sendAppointmentReminder(
  appointmentData: AppointmentReminderData,
  reminderType: '24h' | '2h' = '24h'
): Promise<boolean> {
  try {
    console.log(`📱 Sending ${reminderType} reminder to: ${appointmentData.clientPhone}`);

    // Format phone number for WhatsApp
    let phoneNumber = appointmentData.clientPhone.replace(/\D/g, '');
    if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
      phoneNumber = '91' + phoneNumber;
    }

    const appointmentDate = new Date(appointmentData.startTime);
    const timeUntilAppointment = reminderType === '24h' ? '24 hours' : '2 hours';
    const urgencyEmoji = reminderType === '24h' ? '⏰' : '🚨';

    // Create reminder message based on timing
    const reminderMessage = `${urgencyEmoji} *Appointment Reminder*

Hello ${appointmentData.clientName},

This is a friendly reminder that you have an appointment at *RG Salon* in ${timeUntilAppointment}.

📅 *Date:* ${appointmentDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
⏰ *Time:* ${appointmentDate.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })}

💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}

${appointmentData.notes ? `📝 *Notes:* ${appointmentData.notes}\n` : ''}
💰 *Amount:* ₹${appointmentData.totalAmount.toFixed(2)}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

${reminderType === '2h' ? '🚨 *Final Reminder* - Please confirm your attendance by replying YES\n' : ''}

📞 Contact us: ${import.meta.env.VITE_SALON_PHONE || '+91-XXXXXXXXXX'}
📍 Address: ${import.meta.env.VITE_SALON_ADDRESS || 'RG Salon Location'}

Thank you for choosing RG Salon! 💖`;

    // Send WhatsApp reminder using proper server detection
    try {
      const reminderNotificationData: AppointmentNotificationData = {
        clientName: appointmentData.clientName,
        clientPhone: phoneNumber,
        services: appointmentData.services,
        stylists: appointmentData.stylists,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: 'scheduled',
        notes: appointmentData.notes,
        id: appointmentData.id,
        serviceDetails: appointmentData.services.map(name => ({
          name,
          duration: 60, // Default duration
          price: 0     // Will be calculated properly in actual implementation
        })),
        totalAmount: appointmentData.totalAmount
      };

      const whatsappResult = await sendAppointmentNotification('created', reminderNotificationData);
      
      if (whatsappResult.success) {
        console.log(`✅ ${reminderType} reminder sent successfully to ${appointmentData.clientName}`);
        
        // Log the reminder in the database for tracking
        await logReminderSent(appointmentData.id, reminderType);
        
        return true;
      } else {
        console.warn(`⚠️ ${reminderType} reminder failed for ${appointmentData.clientName}:`, whatsappResult.error);
        return false;
      }
    } catch (whatsappError) {
      console.error(`❌ Error sending ${reminderType} reminder via WhatsApp:`, whatsappError);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error sending ${reminderType} reminder:`, error);
    return false;
  }
}

/**
 * Log that a reminder was sent (to avoid duplicates)
 * @param appointmentId - ID of the appointment
 * @param reminderType - Type of reminder sent
 */
async function logReminderSent(appointmentId: string, reminderType: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('appointment_reminders')
      .insert({
        appointment_id: appointmentId,
        reminder_type: reminderType,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });

    if (error) {
      console.warn('⚠️ Could not log reminder in database:', error);
    }
  } catch (error) {
    console.warn('⚠️ Error logging reminder:', error);
  }
}

/**
 * Check if reminder was already sent for an appointment
 * @param appointmentId - ID of the appointment
 * @param reminderType - Type of reminder to check
 * @returns Promise<boolean> - Whether reminder was already sent
 */
export async function wasReminderAlreadySent(appointmentId: string, reminderType: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('appointment_reminders')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('reminder_type', reminderType)
      .eq('status', 'sent')
      .limit(1);

    if (error) {
      console.warn('⚠️ Error checking reminder history:', error);
      return false; // If we can't check, assume not sent to avoid missing reminders
    }

    return data && data.length > 0;
  } catch (error) {
    console.warn('⚠️ Error in wasReminderAlreadySent:', error);
    return false;
  }
}

/**
 * Process all appointment reminders
 * Call this function periodically (e.g., every hour) to send reminders
 */
export async function processAppointmentReminders(): Promise<void> {
  console.log('🔄 Starting appointment reminder processing...');

  try {
    // Process 24-hour reminders
    const appointments24h = await getAppointmentsNeedingReminders(24);
    console.log(`📅 Processing ${appointments24h.length} appointments for 24h reminders`);

    for (const appointment of appointments24h) {
      // Check if reminder was already sent
      const alreadySent = await wasReminderAlreadySent(appointment.id, '24h');
      if (!alreadySent) {
        await sendAppointmentReminder(appointment, '24h');
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`ℹ️ 24h reminder already sent for ${appointment.clientName}`);
      }
    }

    // Process 2-hour reminders
    const appointments2h = await getAppointmentsNeedingReminders(2);
    console.log(`📅 Processing ${appointments2h.length} appointments for 2h reminders`);

    for (const appointment of appointments2h) {
      // Check if reminder was already sent
      const alreadySent = await wasReminderAlreadySent(appointment.id, '2h');
      if (!alreadySent) {
        await sendAppointmentReminder(appointment, '2h');
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`ℹ️ 2h reminder already sent for ${appointment.clientName}`);
      }
    }

    console.log('✅ Appointment reminder processing completed');
  } catch (error) {
    console.error('❌ Error in processAppointmentReminders:', error);
  }
}

/**
 * Start automatic reminder processing
 * Call this once when the application starts
 */
export function startAutomaticReminders(): void {
  console.log('🚀 Starting automatic appointment reminder system...');
  
  // Check if we're in a client environment
  if (typeof window === 'undefined') {
    console.log('⚠️ Server environment detected, skipping automatic reminders');
    return;
  }

  // Function to check authentication and run reminders
  const runRemindersIfAuthenticated = async () => {
    try {
      // Check auth state using the static import
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('⚠️ Auth check error, skipping reminders:', error.message);
        return;
      }
      
      if (!session) {
        console.log('⚠️ No authenticated user, skipping reminders');
        return;
      }
      
      // User is authenticated, run reminders
      await processAppointmentReminders();
    } catch (error) {
      console.error('❌ Error checking auth for reminders:', error);
    }
  };

  // Initial run after a short delay to allow auth to initialize
  setTimeout(() => {
    runRemindersIfAuthenticated().catch(error => {
      console.error('❌ Error in initial reminder processing:', error);
    });
  }, 5000); // Wait 5 seconds for auth to initialize

  // Set up interval to process reminders every hour
  setInterval(() => {
    runRemindersIfAuthenticated().catch(error => {
      console.error('❌ Error in scheduled reminder processing:', error);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log('✅ Automatic reminder system started (will check every hour)');
}

/**
 * Manual function to send a specific reminder
 * @param appointmentId - ID of the appointment
 * @param reminderType - Type of reminder to send
 * @returns Promise<boolean> - Success status
 */
export async function sendManualReminder(appointmentId: string, reminderType: '24h' | '2h' = '24h'): Promise<boolean> {
  try {
    console.log(`📱 Manually sending ${reminderType} reminder for appointment: ${appointmentId}`);

    // Get appointment data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        notes,
        clients (
          full_name,
          phone
        ),
        appointment_services (
          services (
            name,
            price
          )
        ),
        appointment_stylists (
          stylists (
            name
          )
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      console.error('❌ Error fetching appointment for manual reminder:', error);
      return false;
    }

    const reminderData: AppointmentReminderData = {
      id: appointment.id,
      clientName: appointment.clients?.full_name || 'Unknown Client',
      clientPhone: appointment.clients?.phone || '',
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      services: appointment.appointment_services?.map(as => as.services?.name).filter(Boolean) || [],
      stylists: appointment.appointment_stylists?.map(ast => ast.stylists?.name).filter(Boolean) || [],
      totalAmount: appointment.appointment_services?.reduce((total, as) => total + (as.services?.price || 0), 0) || 0,
      notes: appointment.notes
    };

    if (!reminderData.clientPhone) {
      console.warn('⚠️ Cannot send manual reminder: Missing client phone number');
      return false;
    }

    return await sendAppointmentReminder(reminderData, reminderType);
  } catch (error) {
    console.error('❌ Error sending manual reminder:', error);
    return false;
  }
} 