import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { StylistBreak } from '../useStylists';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  sendAppointmentNotification,
  testWhatsAppIntegration,
  AppointmentNotificationData,
} from '../../utils/whatsapp';
import { integrateWithAppointmentHooks } from '../../utils/professionalWhatsApp';
import { useAppointmentNotifications } from './useAppointmentNotifications';

// Import from useClients
// import { useClients } from './useClients'

// Data types
interface Client {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  collection_id?: string;
}

interface Stylist {
  id: string;
  name: string;
  breaks?: StylistBreak[];
}

export interface Appointment {
  id: string;
  client_id: string;
  stylist_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  paid: boolean;
  created_at?: string;
  updated_at?: string;
  billed?: boolean;
  stylist_ids?: string[];
  service_ids?: string[];
  is_for_someone_else?: boolean;
  booker_name?: string;
  booker_phone?: string;
  booker_email?: string;
  booking_id?: string | null;
  checked_in?: boolean;
  tenant_id?: string;
}

export interface MergedAppointment extends Appointment {
  clientDetails: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
    created_at?: string;
    services: Service[];
    stylists: Pick<Stylist, 'id' | 'name'>[];
    selectedCollectionId: string | null;
  }[];
  booking_id?: string | null;
  clientName?: string;
  phone?: string;
}

// Enhanced WhatsApp notification functions
const sendProfessionalWhatsAppNotification = async (
  type: 'confirmation' | 'rescheduling' | 'cancellation' | 'reminder',
  appointmentData: {
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
) => {
  const businessPhone = '+91-8956860024'; // RG Salon contact number

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');

    // Ensure it has the country code for India (91)
    if (!cleaned.startsWith('91') && cleaned.length >= 10) {
      cleaned = `91${cleaned}`;
    }

    // Final validation - should be 12 digits for Indian numbers (91 + 10 digits)
    if (cleaned.length !== 12 || !cleaned.startsWith('91')) {
      console.warn(`Invalid phone number format: ${phone} -> ${cleaned}`);
      return '';
    }

    return cleaned;
  };

  const targetPhone = formatPhoneNumber(appointmentData.clientPhone || '');

  if (!targetPhone) {
    console.warn('❌ No valid client phone number provided');
    return { success: false, error: 'No valid client phone number' };
  }

  // Generate messages
  const messages = {
    confirmation: `🎉 *Appointment Confirmed!*

Dear ${appointmentData.clientName},

Your appointment at *RG Salon* has been successfully confirmed!

📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

${appointmentData.notes ? `📝 *Notes:* ${appointmentData.notes}\n` : ''}*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: ${businessPhone}

*Booking ID:* ${appointmentData.bookingId}`,

    rescheduling: `📅 *Appointment Rescheduled*

Dear ${appointmentData.clientName},

Your appointment at *RG Salon* has been successfully rescheduled.

*Previous Appointment:*
📅 Date: ${appointmentData.oldDate}
⏰ Time: ${appointmentData.oldTime}

*New Appointment:*
📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

${appointmentData.notes ? `📝 *Notes:* ${appointmentData.notes}\n` : ''}Thank you for your flexibility! 💖

For any queries, call us at: ${businessPhone}

*Booking ID:* ${appointmentData.bookingId}`,

    cancellation: `❌ *Appointment Cancelled*

Dear ${appointmentData.clientName},

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* ${appointmentData.date}
⏰ *Cancelled Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

*Reason:* ${appointmentData.reason || 'Scheduling conflict'}

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: ${businessPhone}

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖

*Booking ID:* ${appointmentData.bookingId}`,

    reminder: `⏰ *Appointment Reminder*

Dear ${appointmentData.clientName},

This is a friendly reminder that you have an appointment at *RG Salon* ${appointmentData.reminderType === '24h' ? 'tomorrow' : 'in 2 hours'}.

📅 *Date:* ${appointmentData.date}
⏰ *Time:* ${appointmentData.time}
💅 *Services:* ${appointmentData.services.join(', ')}
✨ *Stylists:* ${appointmentData.stylists.join(', ')}
💰 *Amount:* ₹${appointmentData.amount.toFixed(2)}

${appointmentData.notes ? `📝 *Notes:* ${appointmentData.notes}\n` : ''}*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

${appointmentData.reminderType === '2h' ? '🚨 *Final Reminder* - Please confirm your attendance by replying YES\n\n' : ''}📞 Contact us: ${businessPhone}

Thank you for choosing RG Salon! 💖

*Booking ID:* ${appointmentData.bookingId}`,
  };

  try {
    console.log(
      `📱 [Professional WhatsApp] Sending ${type} notification to client: ${targetPhone}`
    );

    // Use relative URL - Vite proxy will forward to backend server
    const response = await fetch('/api/whatsapp/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: targetPhone,
        message: messages[type],
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`✅ Professional ${type} notification sent successfully!`);
      console.log(`📱 Message sent to client: ${targetPhone}`);
      if (result.data?.messages?.[0]?.id) {
        console.log(`📋 Message ID: ${result.data.messages[0].id}`);
      }
      return { success: true, messageId: result.data?.messages?.[0]?.id };
    } else {
      console.error(
        `❌ Professional ${type} notification failed:`,
        result.error
      );
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error(`❌ Professional ${type} notification exception:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Add a function to check if an appointment conflicts with a stylist's break
const checkBreakConflict = (
  stylistId: string,
  startTime: string,
  endTime: string,
  stylists: Stylist[]
): boolean => {
  // Find the stylist
  const stylist = stylists.find(s => s.id === stylistId);
  if (!stylist || !stylist.breaks || stylist.breaks.length === 0) {
    return false; // No conflicts if stylist has no breaks
  }

  const appointmentStart = new Date(startTime).getTime();
  const appointmentEnd = new Date(endTime).getTime();

  // Check if any break overlaps with the appointment time
  return stylist.breaks.some((breakItem: StylistBreak) => {
    const breakStart = new Date(breakItem.startTime).getTime();
    const breakEnd = new Date(breakItem.endTime).getTime();

    // Check for overlap
    return (
      (appointmentStart >= breakStart && appointmentStart < breakEnd) || // Appointment starts during break
      (appointmentEnd > breakStart && appointmentEnd <= breakEnd) || // Appointment ends during break
      (appointmentStart <= breakStart && appointmentEnd >= breakEnd) // Break is within appointment
    );
  });
};

// Add a helper function to ensure consistent date-time formatting
const formatAppointmentTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  // Ensure the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateTimeString);
    throw new Error('Invalid appointment time');
  }

  // Preserve the exact time components without any rounding
  // This ensures appointments are positioned exactly at their scheduled time
  const formattedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    0,
    0
  );

  // Return ISO string for consistent formatting
  return formattedDate.toISOString();
};

// Helper function to fetch stylists from Supabase
const fetchStylists = async (): Promise<Stylist[]> => {
  try {
    const { data, error } = await supabase.from('stylists').select('*');

    if (error) {
      console.error('Error fetching stylists:', error);
      return []; // Return empty array instead of mock data
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchStylists:', error);
    return []; // Return empty array instead of mock data
  }
};

interface CreateAppointmentData {
  stylist_id: string;
  stylist_ids?: string[];
  service_id: string;
  client_name: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  client_id?: string;
  phone?: string;
  email?: string;
  is_for_someone_else?: boolean;
  booker_name?: string;
  booker_phone?: string;
  booker_email?: string;
  booking_id?: string | null;
}

// Define the expected input type for the update mutation
interface UpdateAppointmentData {
  id: string;
  clientDetails?: {
    clientId: string;
    serviceIds: string[];
    stylistIds: string[];
  }[];
  start_time?: string;
  end_time?: string;
  notes?: string;
  status?: Appointment['status'];
  paid?: boolean;
  billed?: boolean;
  is_for_someone_else?: boolean;
  booker_name?: string;
  booker_phone?: string;
  booker_email?: string;
  client_id?: string;
  stylist_id?: string;
  service_id?: string;
  booking_id?: string | null;
  checked_in?: boolean;
}

interface ServiceResponse {
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

interface StylistResponse {
  stylists: {
    name: string;
  };
}

const prepareNotificationData = async (
  appointmentId: string
): Promise<AppointmentNotificationData | null> => {
  try {
    // Fetch all necessary data for the appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, client_id, start_time, end_time, status, notes, booking_id')
      .eq('id', appointmentId)
      .single();

    if (appointmentError) {
      console.error('Error fetching appointment:', appointmentError);
      return null;
    }

    if (!appointment) {
      console.warn('Appointment not found:', appointmentId);
      return null;
    }

    // Fetch client details
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('full_name, phone')
      .eq('id', appointment.client_id)
      .single();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return null;
    }

    if (!clientData) {
      console.warn('Client not found for appointment:', appointmentId);
      return null;
    }

    // Fetch services using appointment_services join table WITH additional service details
    const { data: appointmentServices, error: servicesError } = await supabase
      .from('appointment_services')
      .select(
        `
        services (
          id, 
          name,
          duration,
          price
        )
      `
      )
      .eq('appointment_id', appointmentId);

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
    }

    console.log(
      'DEBUG - Raw appointmentServices data structure:',
      JSON.stringify(appointmentServices, null, 2)
    );

    // Extract service names - fixing TypeScript errors
    const services: string[] = [];
    const serviceDetails: Array<{
      name: string;
      duration: number;
      price: number;
    }> = [];

    // Safely extract service information with proper type handling
    if (appointmentServices && appointmentServices.length > 0) {
      appointmentServices.forEach((item: any) => {
        try {
          // Handle potential nested structure based on what the console shows
          const serviceData = item.services;

          if (serviceData) {
            console.log('DEBUG - Processing service:', serviceData);

            // Add to service names array
            if (typeof serviceData.name === 'string') {
              services.push(serviceData.name);
            }

            // Add to service details array with proper type conversion
            serviceDetails.push({
              name: String(serviceData.name || 'Unnamed Service'),
              duration: parseInt(String(serviceData.duration || '60'), 10),
              price: parseFloat(String(serviceData.price || '0')),
            });
          }
        } catch (err) {
          console.error('DEBUG - Error processing service:', err);
        }
      });
    }

    console.log('DEBUG - Extracted service names:', services);
    console.log('DEBUG - Extracted service details:', serviceDetails);

    // Calculate total amount
    const totalAmount = serviceDetails.reduce(
      (sum, service) => sum + service.price,
      0
    );

    // Fetch stylists using appointment_stylists join table
    const { data: appointmentStylists, error: stylistsError } = (await supabase
      .from('appointment_stylists')
      .select('stylists (name)')
      .eq('appointment_id', appointmentId)) as {
      data: StylistResponse[] | null;
      error: any;
    };

    if (stylistsError) {
      console.error('Error fetching stylists:', stylistsError);
    }

    // Extract stylist names
    const stylists = (appointmentStylists || [])
      .map(ast => ast.stylists?.name)
      .filter((name): name is string => name !== undefined && name !== null);

    return {
      clientName: clientData.full_name,
      clientPhone: clientData.phone || '',
      services,
      stylists,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes || '',
      id: appointmentId, // Include the appointment ID
      serviceDetails,
      totalAmount,
    };
  } catch (error) {
    console.error('Error preparing notification data:', error);
    return null;
  }
};

// Function to check if client has interacted before and use template if needed
const sendNotificationWithTemplateCheck = async (
  action: 'created' | 'updated' | 'cancelled',
  data: AppointmentNotificationData
) => {
  try {
    // Always use template for first contact
    const shouldUseTemplate = true; // In a real implementation, you'd check if this is first contact

    console.log(
      `DEBUG - Client phone: ${data.clientPhone}, Using template: ${shouldUseTemplate}`
    );

    // For now always use regular message for debugging
    const result = await sendAppointmentNotification(action, data);
    console.log('DEBUG - Notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('DEBUG - Error in sendNotificationWithTemplateCheck:', error);
    throw error;
  }
};

export function useAppointments() {
  const queryClient = useQueryClient();
  const { session, user, loading } = useAuthContext();
  const {
    sendConfirmationMessage,
    sendRescheduleMessage,
    sendCancellationMessage,
  } = useAppointmentNotifications();

  // Only fetch data if user is authenticated and auth is not loading
  const isAuthenticated = !!(session || user);
  const shouldFetch = isAuthenticated && !loading;

  const { data: appointments, isLoading } = useQuery<
    MergedAppointment[],
    Error
  >({
    queryKey: ['appointments'],
    queryFn: async (): Promise<MergedAppointment[]> => {
      if (import.meta.env.DEV) {
        console.log('Fetching appointments...');
      }
      try {
        // Step 1: Fetch base appointments
        const { data: baseAppointments, error: baseError } = await supabase
          .from('appointments')
          .select('*, booker_name, booker_phone, booker_email, tenant_id')
          .order('start_time', { ascending: true });

        if (baseError)
          throw new Error(
            `Failed to fetch base appointments: ${baseError.message}`
          );
        if (!baseAppointments || baseAppointments.length === 0) {
          if (import.meta.env.DEV) {
            console.log('Fetched 0 base appointments.');
          }
          return [];
        }
        if (import.meta.env.DEV) {
          console.log(
            `Fetched ${baseAppointments.length} base appointments:`,
            baseAppointments
          );
        }

        const appointmentIds = baseAppointments.map((a: any) => a.id);
        if (appointmentIds.length === 0) return []; // No appointments, no need to fetch details

        // Step 2: Fetch all related data from join tables IN PARALLEL
        const [
          { data: appointmentClientsData, error: acError },
          { data: appointmentServicesData, error: asError },
          { data: appointmentStylistsData, error: astError },
        ] = await Promise.all([
          supabase
            .from('appointment_clients')
            .select('appointment_id, client_id')
            .in('appointment_id', appointmentIds),
          supabase
            .from('appointment_services')
            .select('appointment_id, client_id, service_id, stylist_id')
            .in('appointment_id', appointmentIds),
          supabase
            .from('appointment_stylists')
            .select('appointment_id, client_id, stylist_id')
            .in('appointment_id', appointmentIds),
        ]);

        // Error handling for join table fetches
        if (acError)
          throw new Error(
            `Failed to fetch appointment_clients: ${acError.message}`
          );
        if (asError)
          throw new Error(
            `Failed to fetch appointment_services: ${asError.message}`
          );
        if (astError)
          throw new Error(
            `Failed to fetch appointment_stylists: ${astError.message}`
          );

        // Step 3: Get all unique IDs for fetching details
        const allClientIds = Array.from(
          new Set(appointmentClientsData?.map(ac => ac.client_id) || [])
        );
        const allServiceIds = Array.from(
          new Set(appointmentServicesData?.map(as => as.service_id) || [])
        );
        const allStylistIds = Array.from(
          new Set(appointmentStylistsData?.map(ast => ast.stylist_id) || [])
        );

        // Step 4: Fetch details for clients, services, stylists IN PARALLEL (handle empty ID arrays)
        const [
          { data: clientsData, error: clientsError },
          { data: servicesData, error: servicesError },
          { data: stylistsData, error: stylistsError },
        ] = await Promise.all([
          allClientIds.length > 0
            ? supabase
                .from('clients')
                .select('id, full_name, phone, email, created_at')
                .in('id', allClientIds)
            : Promise.resolve({ data: [], error: null }),
          allServiceIds.length > 0
            ? supabase
                .from('services')
                .select('id, name, price, duration, collection_id')
                .in('id', allServiceIds)
            : Promise.resolve({ data: [], error: null }),
          allStylistIds.length > 0
            ? supabase
                .from('stylists')
                .select('id, name')
                .in('id', allStylistIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        // Error handling for detail fetches
        if (clientsError)
          throw new Error(`Failed to fetch clients: ${clientsError.message}`);
        if (servicesError)
          throw new Error(`Failed to fetch services: ${servicesError.message}`);
        if (stylistsError)
          throw new Error(`Failed to fetch stylists: ${stylistsError.message}`);

        // Step 5: Create maps for easy lookup
        const clientsMap = new Map(clientsData?.map(c => [c.id, c]));
        const servicesMap = new Map(
          servicesData?.map(s => [s.id, s as Service])
        ); // Assert type if necessary
        const stylistsMap = new Map(
          stylistsData?.map(st => [st.id, st as Pick<Stylist, 'id' | 'name'>])
        ); // Use Pick

        // Step 6: Merge the data into the MergedAppointment structure
        const mergedAppointments: MergedAppointment[] = baseAppointments.map(
          appointment => {
            // Find client IDs associated with this appointment from the join table data
            const clientLinks =
              appointmentClientsData?.filter(
                ac => ac.appointment_id === appointment.id
              ) || [];

            const clientDetailsForThisAppointment = clientLinks
              .map(link => {
                const client = clientsMap.get(link.client_id);
                if (!client) {
                  console.warn(
                    `Client data not found for ID: ${link.client_id} in appointment ${appointment.id}`
                  );
                  return null; // Skip if client data wasn't found
                }

                // Find services for this specific client in this appointment
                const servicesForThisClient = (appointmentServicesData || [])
                  .filter(
                    as =>
                      as.appointment_id === appointment.id &&
                      as.client_id === link.client_id
                  )
                  .map(as => servicesMap.get(as.service_id))
                  .filter((service): service is Service => !!service); // Type guard to filter out nulls and assert type

                // Find stylists for this specific client in this appointment
                // Combine stylists from both appointment_services (new way) and appointment_stylists (old way)
                const stylistsFromServices = (appointmentServicesData || [])
                  .filter(
                    as =>
                      as.appointment_id === appointment.id &&
                      as.client_id === link.client_id &&
                      as.stylist_id
                  )
                  .map(as => stylistsMap.get(as.stylist_id))
                  .filter(
                    (stylist): stylist is Pick<Stylist, 'id' | 'name'> =>
                      !!stylist
                  );

                const stylistsFromStylistsTable = (
                  appointmentStylistsData || []
                )
                  .filter(
                    ast =>
                      ast.appointment_id === appointment.id &&
                      ast.client_id === link.client_id
                  )
                  .map(ast => stylistsMap.get(ast.stylist_id))
                  .filter(
                    (stylist): stylist is Pick<Stylist, 'id' | 'name'> =>
                      !!stylist
                  );

                // Combine and deduplicate stylists by ID
                const allStylists = [
                  ...stylistsFromServices,
                  ...stylistsFromStylistsTable,
                ];
                const stylistsForThisClient = Array.from(
                  new Map(allStylists.map(s => [s.id, s])).values()
                );

                return {
                  // Spread the client details (id, full_name, phone, etc.)
                  ...client,
                  // Nest the associated services and stylists
                  services: servicesForThisClient,
                  stylists: stylistsForThisClient,
                  // Optionally derive collection ID for UI convenience, defaulting undefined to null
                  selectedCollectionId:
                    servicesForThisClient[0]?.collection_id ?? null,
                };
              })
              .filter(details => !!details);

            // Combine base appointment data with the structured client details
            return {
              ...appointment, // Spread base appointment fields
              clientDetails: clientDetailsForThisAppointment, // Add the structured array
              booking_id: appointment.booking_id,
              clientName: appointment.booker_name,
              phone: appointment.booker_phone,
            };
          }
        );
        if (import.meta.env.DEV) {
          console.log('Finished merging appointment data:', mergedAppointments);
        }
        return mergedAppointments;
      } catch (error) {
        console.error('Error in queryFn fetching appointments:', error);
        toast.error(
          `Failed to fetch appointments: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        return []; // Return empty array on error to prevent breaking UI
      }
    },
    enabled: shouldFetch, // Only run when authenticated and not loading
  });

  const createAppointment = useMutation({
    mutationFn: async (data: {
      start_time: string;
      end_time: string;
      notes?: string;
      status: Appointment['status'];
      // Include primary keys if needed by 'appointments' table schema
      client_id: string;
      stylist_id: string;
      service_id: string;
      // The structured details array
      clientDetails: {
        clientId: string;
        serviceIds: string[];
        stylistIds: string[];
      }[];
      booking_id?: string | null;
      is_for_someone_else?: boolean;
      booker_name?: string;
      booker_phone?: string;
      booker_email?: string;
    }) => {
      const { clientDetails, ...appointmentBaseData } = data;
      // --- Step 0: Get tenant_id from the authenticated user ---
      if (!user || !user.id) {
        throw new Error(
          'User is not authenticated. Cannot create appointment.'
        );
      }
      const tenant_id = user.id;
      console.log('Using tenant_id:', tenant_id);

      // Ensure times are correctly formatted (should already be ISO strings from handleBookingSubmit)
      const formattedStartTime = formatAppointmentTime(
        appointmentBaseData.start_time
      );
      const formattedEndTime = formatAppointmentTime(
        appointmentBaseData.end_time
      );

      console.log('Attempting to create appointment with base data:', {
        ...appointmentBaseData,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });

      // --- Step 1: Insert into main appointments table ---
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          ...appointmentBaseData,
          tenant_id: tenant_id,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          paid: false,
          booking_id: appointmentBaseData.booking_id,
          is_for_someone_else: appointmentBaseData.is_for_someone_else,
          booker_name: appointmentBaseData.booker_name,
          booker_phone: appointmentBaseData.booker_phone,
          booker_email: appointmentBaseData.booker_email,
        })
        .select()
        .single();

      if (appointmentError)
        throw new Error(
          `Error inserting appointment: ${appointmentError.message}`
        );
      if (!newAppointment)
        throw new Error('Failed to create appointment (no data returned).');

      const newAppointmentId = newAppointment.id;
      console.log('Created base appointment with ID:', newAppointmentId);

      // --- Step 2: Insert into join tables ---
      try {
        // Process inserts for all clients concurrently
        await Promise.all(
          clientDetails.map(async detail => {
            const { clientId, serviceIds, stylistIds } = detail;
            console.log(`Processing joins for client ${clientId}...`);

            // Fetch client details to store in the appointment record
            const { data: clientData, error: clientFetchError } = await supabase
              .from('clients')
              .select('full_name, phone, email')
              .eq('id', clientId)
              .single();

            if (clientFetchError) {
              console.warn(
                `Could not fetch client details for ID ${clientId}: ${clientFetchError.message}`
              );
            }

            // 2a: Insert into appointment_clients (Appointment <-> Client link)
            const { error: acError } = await supabase
              .from('appointment_clients')
              .insert({
                appointment_id: newAppointmentId,
                client_id: clientId,
              });
            if (acError)
              throw new Error(
                `Failed to link client ${clientId}: ${acError.message}`
              );
            console.log(` -> Linked client ${clientId}`);

            // 2b: Insert into appointment_services (Appt+Client <-> Service link)
            // For multi-expert appointments, we need to create appointment_services records
            // for each expert assigned to each service
            const serviceInserts: Array<{
              appointment_id: string;
              client_id: string;
              service_id: string;
              stylist_id: string;
            }> = [];

            // Create service-expert combinations
            serviceIds.forEach(serviceId => {
              stylistIds.forEach(stylistId => {
                serviceInserts.push({
                  appointment_id: newAppointmentId,
                  client_id: clientId,
                  service_id: serviceId,
                  stylist_id: stylistId,
                });
              });
            });
            if (serviceInserts.length > 0) {
              console.log(
                ` -> Linking ${serviceInserts.length} services for client ${clientId}`
              );
              const { error: asError } = await supabase
                .from('appointment_services')
                .insert(serviceInserts);
              // Handle potential duplicate key error specifically (e.g., PKey violation)
              if (
                asError &&
                (asError.code === '23505' ||
                  asError.message.includes('appointment_services_pkey'))
              ) {
                // Check code or message
                console.warn(
                  `Ignoring duplicate service(s) for client ${clientId}: ${asError.message}`
                );
                // Continue if duplicates are acceptable or expected in some edge cases
              } else if (asError) {
                // Throw other errors
                throw new Error(
                  `Failed to link services for client ${clientId}: ${asError.message}`
                );
              }
            }

            // 2c: Insert into appointment_stylists (Appt+Client <-> Stylist link)
            const stylistInserts = stylistIds.map(stylistId => ({
              appointment_id: newAppointmentId,
              client_id: clientId, // Include client_id
              stylist_id: stylistId,
            }));
            if (stylistInserts.length > 0) {
              console.log(
                ` -> Linking ${stylistInserts.length} stylists for client ${clientId}`
              );
              const { error: astError } = await supabase
                .from('appointment_stylists')
                .insert(stylistInserts);
              // Handle potential duplicate key error specifically (e.g., PKey violation)
              if (
                astError &&
                (astError.code === '23505' ||
                  astError.message.includes('appointment_stylists_pkey'))
              ) {
                // Adjust constraint name if needed
                console.warn(
                  `Ignoring duplicate stylist(s) for client ${clientId}: ${astError.message}`
                );
                // Continue if duplicates are acceptable
              } else if (astError) {
                // Throw other errors
                throw new Error(
                  `Failed to link stylists for client ${clientId}: ${astError.message}`
                );
              }
            }
          })
        );
      } catch (error) {
        console.error('Error in join table inserts:', error);
        throw error;
      }

      // --- Step 3: Send automatic WhatsApp notification ---
      try {
        console.log(
          '📱 Starting professional WhatsApp notification for new appointment...'
        );

        // Fetch notification data
        const notificationData =
          await prepareNotificationData(newAppointmentId);

        if (notificationData) {
          console.log(
            `📱 Sending professional appointment confirmation to: ${notificationData.clientName}`
          );

          // Use the new professional integration
          const whatsappResult =
            await integrateWithAppointmentHooks.onAppointmentCreated({
              clientName: notificationData.clientName,
              clientPhone: notificationData.clientPhone,
              services: notificationData.services,
              stylists: notificationData.stylists,
              startTime: notificationData.startTime,
              totalAmount: notificationData.totalAmount || 0,
              notes: notificationData.notes,
            });

          if (whatsappResult.success) {
            console.log(
              '✅ Professional WhatsApp confirmation sent successfully'
            );
            console.log(`📋 Message ID: ${whatsappResult.messageId}`);
            toast.success(
              '✅ Appointment booked and professional WhatsApp confirmation sent!'
            );
          } else {
            console.warn(
              '⚠️ Professional WhatsApp notification failed:',
              whatsappResult.error
            );
            toast.warning(
              '⚠️ Appointment booked successfully, but WhatsApp notification failed. Please contact the client manually.'
            );
          }
        } else {
          console.warn(
            '⚠️ Cannot send WhatsApp notification: Missing notification data'
          );
          toast.warning(
            '⚠️ Appointment booked, but notification data is incomplete.'
          );
        }
      } catch (notificationError) {
        console.error(
          '❌ Error sending professional WhatsApp notification:',
          notificationError
        );
        // Don't throw error here as appointment was created successfully
        toast.warning(
          '⚠️ Appointment booked successfully, but WhatsApp notification could not be sent.'
        );
      }

      // After successful creation, send WhatsApp confirmation
      try {
        const appointmentData = await prepareNotificationData(newAppointmentId);
        if (appointmentData) {
          await sendConfirmationMessage({
            client: {
              name: appointmentData.clientName,
              phone: appointmentData.clientPhone,
            },
            datetime: new Date(appointmentData.startTime),
            stylist: {
              name: appointmentData.stylists[0], // Primary stylist
            },
            services: appointmentData.services.map(service => ({
              name: service,
              price:
                (appointmentData.totalAmount || 0) /
                appointmentData.services.length, // Approximate price per service
              duration: 60, // Default duration, update if you have actual duration data
            })),
          });
        }
      } catch (error) {
        console.error('Failed to send confirmation message:', error);
        // Don't throw error here, as appointment was created successfully
      }

      return newAppointment;
    },
    onSuccess: data => {
      console.log('Appointment updated successfully in DB:', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully!');
    },
    onError: error => {
      console.error('Error creating appointment:', error);
      toast.error(
        `Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    },
  });

  const updateAppointment = useMutation({
    // Use the new interface for the input data type
    mutationFn: async (data: UpdateAppointmentData) => {
      const {
        id: appointmentId,
        clientDetails,
        ...appointmentBaseUpdates
      } = data;

      console.log(`Starting update for appointment ${appointmentId}`);

      // Only clear and re-link join tables when new clientDetails are provided
      const hasClientDetails = Array.isArray(data.clientDetails);
      if (hasClientDetails) {
        console.log(
          ` -> Deleting existing joins for appointment ${appointmentId}...`
        );
        try {
          const { error: deleteClientsError } = await supabase
            .from('appointment_clients')
            .delete()
            .eq('appointment_id', appointmentId);
          if (deleteClientsError)
            throw new Error(
              `Failed to delete appointment_clients: ${deleteClientsError.message}`
            );

          const { error: deleteServicesError } = await supabase
            .from('appointment_services')
            .delete()
            .eq('appointment_id', appointmentId);
          if (deleteServicesError)
            throw new Error(
              `Failed to delete appointment_services: ${deleteServicesError.message}`
            );

          const { error: deleteStylistsError } = await supabase
            .from('appointment_stylists')
            .delete()
            .eq('appointment_id', appointmentId);
          if (deleteStylistsError)
            throw new Error(
              `Failed to delete appointment_stylists: ${deleteStylistsError.message}`
            );
          console.log(` -> Successfully deleted existing joins.`);
        } catch (error) {
          console.error('Error deleting existing join table records:', error);
          throw new Error(
            `Failed to clear existing appointment links: ${error instanceof Error ? error.message : error}`
          );
        }
      }

      // --- Step 2: Update the base appointments table ---
      // Construct the update object carefully, only including valid fields
      const {
        start_time,
        end_time,
        notes,
        status,
        paid,
        billed,
        client_id,
        stylist_id,
        service_id,
        booking_id,
        checked_in,
      } = appointmentBaseUpdates;

      const validBaseUpdateData: Partial<Appointment> & {
        updated_at?: string;
      } = {
        ...(start_time && { start_time: formatAppointmentTime(start_time) }), // Format time on update too
        ...(end_time && { end_time: formatAppointmentTime(end_time) }),
        ...(notes !== undefined && { notes }), // Allow empty string for notes
        ...(status && { status }),
        ...(client_id && { client_id }), // Keep if appointments table needs primary keys
        ...(stylist_id && { stylist_id }),
        ...(service_id && { service_id }),
        ...(paid !== undefined && { paid }),
        ...(billed !== undefined && { billed }),
        ...(booking_id !== undefined && { booking_id }),
        ...(checked_in !== undefined && { checked_in }),
        updated_at: new Date().toISOString(),
      };

      // Remove undefined keys to prevent sending them in the update payload
      Object.keys(validBaseUpdateData).forEach(key => {
        const typedKey = key as keyof typeof validBaseUpdateData;
        if (validBaseUpdateData[typedKey] === undefined) {
          delete validBaseUpdateData[typedKey];
        }
      });

      console.log(
        ` -> Updating base appointment ${appointmentId} with:`,
        validBaseUpdateData
      );
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({
          ...validBaseUpdateData,
          is_for_someone_else: data.is_for_someone_else,
          booker_name: data.booker_name,
          booker_phone: data.booker_phone,
          booker_email: data.booker_email,
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (updateError)
        throw new Error(
          `Error updating base appointment ${appointmentId}: ${updateError.message}`
        );
      if (!updatedAppointment)
        throw new Error(
          `Failed to update base appointment ${appointmentId} (no data returned).`
        );
      console.log(` -> Successfully updated base appointment.`);

      // Only insert new join records when clientDetails provided
      if (hasClientDetails) {
        console.log(
          ` -> Inserting new joins for appointment ${appointmentId}...`
        );
        try {
          // Process inserts for all clients concurrently
          await Promise.all(
            (data.clientDetails || []).map(async detail => {
              const { clientId, serviceIds, stylistIds } = detail;
              console.log(`  -> Processing joins for client ${clientId}`);

              // 3a: Insert into appointment_clients
              const { error: acError } = await supabase
                .from('appointment_clients')
                .insert({ appointment_id: appointmentId, client_id: clientId });
              if (acError)
                throw new Error(
                  `Failed to link client ${clientId}: ${acError.message}`
                );
              console.log(`    - Linked client ${clientId}`);

              // 3b: Insert into appointment_services
              // For multi-expert appointments, create service-expert combinations
              const serviceInserts: Array<{
                appointment_id: string;
                client_id: string;
                service_id: string;
                stylist_id: string;
              }> = [];

              serviceIds.forEach(serviceId => {
                stylistIds.forEach(stylistId => {
                  serviceInserts.push({
                    appointment_id: appointmentId,
                    client_id: clientId,
                    service_id: serviceId,
                    stylist_id: stylistId,
                  });
                });
              });
              if (serviceInserts.length > 0) {
                const { error: asError } = await supabase
                  .from('appointment_services')
                  .insert(serviceInserts);
                // Handle potential duplicate key error if constraints were not properly handled by delete
                if (asError && asError.code === '23505') {
                  console.warn(
                    `Ignoring duplicate service(s) on update for client ${clientId}: ${asError.message}`
                  );
                } else if (asError) {
                  throw new Error(
                    `Failed to link services for client ${clientId} on update: ${asError.message}`
                  );
                }
                console.log(
                  `    - Linked ${serviceInserts.length} services for client ${clientId}`
                );
              }

              // 3c: Insert into appointment_stylists
              const stylistInserts = stylistIds.map(stylistId => ({
                appointment_id: appointmentId,
                client_id: clientId,
                stylist_id: stylistId,
              }));
              if (stylistInserts.length > 0) {
                const { error: astError } = await supabase
                  .from('appointment_stylists')
                  .insert(stylistInserts);
                if (astError && astError.code === '23505') {
                  console.warn(
                    `Ignoring duplicate stylist(s) on update for client ${clientId}: ${astError.message}`
                  );
                } else if (astError) {
                  throw new Error(
                    `Failed to link stylists for client ${clientId} on update: ${astError.message}`
                  );
                }
                console.log(
                  `    - Linked ${stylistInserts.length} stylists for client ${clientId}`
                );
              }
            })
          ); // End of Promise.all for client details

          console.log(
            ` -> Successfully inserted new joins for appointment ${appointmentId}.`
          );

          // --- Step 4: Send WhatsApp update/reschedule notification ---
          try {
            console.log(
              '📱 Starting WhatsApp notification for appointment update...'
            );
            const notificationData =
              await prepareNotificationData(appointmentId);

            if (notificationData && notificationData.clientPhone) {
              console.log(
                `📱 Sending appointment update notification to: ${notificationData.clientPhone}`
              );

              // Format phone number for WhatsApp
              let phoneNumber = notificationData.clientPhone.replace(/\D/g, '');
              if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
                phoneNumber = '91' + phoneNumber;
              }

              // Determine if this is a reschedule (time change) or just an update
              const isReschedule = start_time || end_time;
              const appointmentDate = new Date(notificationData.startTime);

              let updateMessage = '';

              if (isReschedule) {
                // This is a reschedule - show new timing
                updateMessage = `🔄 *Appointment Rescheduled!*

Hello ${notificationData.clientName},

Your appointment at *RG Salon* has been rescheduled.

📅 *New Date:* ${appointmentDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
⏰ *New Time:* ${appointmentDate.toLocaleTimeString('en-IN', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}

💅 *Services:* ${notificationData.services.join(', ')}
✨ *Stylists:* ${notificationData.stylists.join(', ')}

${notificationData.notes ? `📝 *Updated Notes:* ${notificationData.notes}\n` : ''}
💰 *Total Amount:* ₹${(notificationData.totalAmount || 0).toFixed(2)}

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Contact us immediately if this timing doesn't work

Thank you for your understanding! 💖

For any queries, call us at: ${import.meta.env.VITE_SALON_PHONE || '+91-XXXXXXXXXX'}`;
              } else {
                // This is a general update (status, notes, etc.)
                updateMessage = `📝 *Appointment Updated!*

Hello ${notificationData.clientName},

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

💅 *Services:* ${notificationData.services.join(', ')}
✨ *Stylists:* ${notificationData.stylists.join(', ')}

${notificationData.notes ? `📝 *Notes:* ${notificationData.notes}\n` : ''}
💰 *Total Amount:* ₹${(notificationData.totalAmount || 0).toFixed(2)}

${status ? `📊 *Status:* ${status.toUpperCase()}\n` : ''}

We look forward to serving you! 💖

For any queries, call us at: ${import.meta.env.VITE_SALON_PHONE || '+91-XXXXXXXXXX'}`;
              }

              // Send WhatsApp notification
              try {
                const updateNotificationData: AppointmentNotificationData = {
                  clientName: notificationData.clientName,
                  clientPhone: phoneNumber,
                  services: notificationData.services,
                  stylists: notificationData.stylists,
                  startTime: notificationData.startTime,
                  endTime: notificationData.endTime,
                  status: 'updated',
                  notes: notificationData.notes,
                  id: notificationData.id,
                  serviceDetails: notificationData.serviceDetails,
                  totalAmount: notificationData.totalAmount,
                };

                const whatsappResult = await sendAppointmentNotification(
                  'updated',
                  updateNotificationData
                );

                if (whatsappResult.success) {
                  console.log(
                    '✅ WhatsApp update notification sent successfully'
                  );
                  toast.success(
                    isReschedule
                      ? '✅ Appointment rescheduled and notification sent via WhatsApp!'
                      : '✅ Appointment updated and notification sent via WhatsApp!'
                  );
                } else {
                  console.warn(
                    '⚠️ WhatsApp notification failed:',
                    whatsappResult.error
                  );
                  toast.warning(
                    '⚠️ Appointment updated successfully, but WhatsApp notification failed. Please contact the client manually.'
                  );
                }
              } catch (whatsappError) {
                console.error('❌ WhatsApp API error:', whatsappError);
                toast.warning(
                  '⚠️ Appointment updated successfully, but WhatsApp notification could not be sent.'
                );
              }
            } else {
              console.warn(
                '⚠️ Cannot send WhatsApp notification: Missing client phone number'
              );
              toast.warning(
                '⚠️ Appointment updated, but client phone number is missing for notification.'
              );
            }
          } catch (notificationError) {
            console.error(
              '❌ Error preparing update notification:',
              notificationError
            );
            // Don't throw error here as appointment was updated successfully
          }

          // WhatsApp notification is already handled above in the notification section
        } catch (joinError) {
          // If inserting new joins fails, the base appointment is already updated.
          console.error(
            `Error inserting new join table records for appointment ${appointmentId}:`,
            joinError
          );
          // We should probably throw here to indicate the update wasn't fully successful
          throw new Error(
            `Update partially failed: Could not insert new links. ${joinError instanceof Error ? joinError.message : joinError}`
          );
        }
      }

      // Return the updated base appointment record
      return updatedAppointment;
    },
    onSuccess: data => {
      console.log('Appointment updated successfully in DB:', data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated successfully!');
    },
    onError: error => {
      console.error('Mutation error in updateAppointment:', error);
      toast.error(
        `Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      try {
        if (import.meta.env.DEV) {
          console.log(
            '📱 Preparing to delete appointment and send cancellation notification...'
          );
        }

        // Get appointment details before deletion for notification
        const notificationData = await prepareNotificationData(id);

        // Delete the appointment
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

        if (error)
          throw new Error(`Error deleting appointment ${id}: ${error.message}`);

        // --- Send WhatsApp cancellation notification ---
        if (notificationData && notificationData.clientPhone) {
          if (import.meta.env.DEV) {
            console.log(
              `📱 Sending cancellation notification to: ${notificationData.clientPhone}`
            );
          }

          // Format phone number for WhatsApp
          let phoneNumber = notificationData.clientPhone.replace(/\D/g, '');
          if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
            phoneNumber = '91' + phoneNumber;
          }

          // Create cancellation message
          const appointmentDate = new Date(notificationData.startTime);
          const cancellationMessage = `❌ *Appointment Cancelled*

Hello ${notificationData.clientName},

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

💅 *Services:* ${notificationData.services.join(', ')}
✨ *Stylists:* ${notificationData.stylists.join(', ')}

💰 *Amount:* ₹${(notificationData.totalAmount || 0).toFixed(2)}

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: ${import.meta.env.VITE_SALON_PHONE || '+91-XXXXXXXXXX'}

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖`;

          // Send WhatsApp notification
          try {
            const cancellationNotificationData: AppointmentNotificationData = {
              clientName: notificationData.clientName,
              clientPhone: phoneNumber,
              services: notificationData.services,
              stylists: notificationData.stylists,
              startTime: notificationData.startTime,
              endTime: notificationData.endTime,
              status: 'cancelled',
              notes: notificationData.notes,
              id: notificationData.id,
              serviceDetails: notificationData.serviceDetails,
              totalAmount: notificationData.totalAmount,
            };

            const whatsappResult = await sendAppointmentNotification(
              'cancelled',
              cancellationNotificationData
            );

            if (whatsappResult.success) {
              console.log(
                '✅ WhatsApp cancellation notification sent successfully'
              );
              toast.success(
                '✅ Appointment cancelled and notification sent via WhatsApp!'
              );
            } else {
              console.warn(
                '⚠️ WhatsApp notification failed:',
                whatsappResult.error
              );
              toast.warning(
                '⚠️ Appointment cancelled successfully, but WhatsApp notification failed. Please contact the client manually.'
              );
            }
          } catch (whatsappError) {
            console.error('❌ WhatsApp API error:', whatsappError);
            toast.warning(
              '⚠️ Appointment cancelled successfully, but WhatsApp notification could not be sent.'
            );
          }
        } else {
          console.warn(
            '⚠️ Cannot send WhatsApp notification: Missing client phone number'
          );
          toast.warning(
            '⚠️ Appointment cancelled, but client phone number is missing for notification.'
          );
        }

        // Send WhatsApp cancellation notification
        if (notificationData) {
          try {
            await sendCancellationMessage({
              client: {
                name: notificationData.clientName,
                phone: notificationData.clientPhone,
              },
              datetime: new Date(notificationData.startTime),
              stylist: {
                name: notificationData.stylists[0],
              },
              services: notificationData.services.map(service => ({
                name: service,
                price:
                  (notificationData.totalAmount || 0) /
                  notificationData.services.length,
                duration: 60,
              })),
            });
          } catch (error) {
            console.error('Failed to send cancellation message:', error);
          }
        }

        return { id, success: true };
      } catch (error) {
        console.error('❌ Error in deleteAppointment:', error);
        throw error;
      }
    },
    onSuccess: data => {
      if (import.meta.env.DEV) {
        console.log('✅ Appointment deleted successfully:', data);
      }
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: error => {
      console.error('❌ Error deleting appointment:', error);
      toast.error(
        `Failed to delete appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    },
  });

  return {
    appointments: appointments || [],
    isLoading,
    createAppointment: createAppointment.mutate,
    updateAppointment: updateAppointment.mutate,
    deleteAppointment: deleteAppointment.mutate,
  };
}

/**
 * Test function to send a manual notification directly via WhatsApp
 * This bypasses all the template mechanisms for direct testing
 */
export async function sendManualNotification(
  appointmentId: string
): Promise<void> {
  try {
    console.log(
      'Attempting to send manual notification for appointment:',
      appointmentId
    );

    // Prepare notification data
    const notificationData = await prepareNotificationData(appointmentId);

    if (notificationData && notificationData.clientPhone) {
      console.log(
        'Sending manual notification to:',
        notificationData.clientPhone
      );

      const response = await sendAppointmentNotification(
        'created',
        notificationData
      );
      console.log('Manual notification sent successfully:', response);

      toast.success('Test notification sent successfully!');
    } else {
      console.error('Failed to prepare notification data');
      toast.error('Could not send test notification: Missing client data');
    }
  } catch (error) {
    console.error('Error sending manual notification:', error);
    toast.error(
      'Failed to send test notification: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
  }
}
