import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { StylistBreak } from './useStylists'
import { supabase } from '../utils/supabase/supabaseClient'

// Import from useClients
import { useClients } from './useClients'

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
}

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
    const { data, error } = await supabase
      .from('stylists')
      .select('*');
    
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
  client_id?: string; // Optional client_id
  phone?: string;     // Optional phone
  email?: string;     // Optional email
}

// Define the expected input type for the update mutation
interface UpdateAppointmentData {
  id: string; // Appointment ID
  // Simplified clientDetails structure
  clientDetails: {
    clientId: string;
    serviceIds: string[];
    stylistIds: string[];
  }[];
  // Other updatable fields for the base 'appointments' table
  start_time?: string;
  end_time?: string;
  notes?: string;
  status?: Appointment['status'];
  paid?: boolean;
  billed?: boolean;
  // Primary keys if required by base table schema (might be redundant if clientDetails covers all)
  client_id?: string; 
  stylist_id?: string;
  service_id?: string;
}

export function useAppointments() {
  const queryClient = useQueryClient()
  const { updateClientFromAppointment } = useClients()

  const { data: appointments, isLoading } = useQuery<MergedAppointment[], Error>({
    queryKey: ['appointments'],
    queryFn: async (): Promise<MergedAppointment[]> => {
      console.log("Fetching appointments...");
      try {
        // Step 1: Fetch base appointments
        const { data: baseAppointments, error: baseError } = await supabase
          .from('appointments')
          .select('*')
          .order('start_time', { ascending: true });

        if (baseError) throw new Error(`Failed to fetch base appointments: ${baseError.message}`);
        if (!baseAppointments || baseAppointments.length === 0) return [];
        console.log(`Fetched ${baseAppointments.length} base appointments.`);

        const appointmentIds = baseAppointments.map(a => a.id);
        if (appointmentIds.length === 0) return []; // No appointments, no need to fetch details

        // Step 2: Fetch all related data from join tables IN PARALLEL
        const [
          { data: appointmentClientsData, error: acError },
          { data: appointmentServicesData, error: asError },
          { data: appointmentStylistsData, error: astError }
        ] = await Promise.all([
          supabase.from('appointment_clients').select('appointment_id, client_id').in('appointment_id', appointmentIds),
          supabase.from('appointment_services').select('appointment_id, client_id, service_id').in('appointment_id', appointmentIds),
          supabase.from('appointment_stylists').select('appointment_id, client_id, stylist_id').in('appointment_id', appointmentIds)
        ]);

        // Error handling for join table fetches
        if (acError) throw new Error(`Failed to fetch appointment_clients: ${acError.message}`);
        if (asError) throw new Error(`Failed to fetch appointment_services: ${asError.message}`);
        if (astError) throw new Error(`Failed to fetch appointment_stylists: ${astError.message}`);

        // Step 3: Get all unique IDs for fetching details
        const allClientIds = Array.from(new Set(appointmentClientsData?.map(ac => ac.client_id) || []));
        const allServiceIds = Array.from(new Set(appointmentServicesData?.map(as => as.service_id) || []));
        const allStylistIds = Array.from(new Set(appointmentStylistsData?.map(ast => ast.stylist_id) || []));

        // Step 4: Fetch details for clients, services, stylists IN PARALLEL (handle empty ID arrays)
         const [
           { data: clientsData, error: clientsError },
           { data: servicesData, error: servicesError },
           { data: stylistsData, error: stylistsError }
         ] = await Promise.all([
           allClientIds.length > 0 ? supabase.from('clients').select('id, full_name, phone, email, created_at').in('id', allClientIds) : Promise.resolve({ data: [], error: null }),
           allServiceIds.length > 0 ? supabase.from('services').select('id, name, price, duration, collection_id').in('id', allServiceIds) : Promise.resolve({ data: [], error: null }),
           allStylistIds.length > 0 ? supabase.from('stylists').select('id, name').in('id', allStylistIds) : Promise.resolve({ data: [], error: null })
         ]);

        // Error handling for detail fetches
        if (clientsError) throw new Error(`Failed to fetch clients: ${clientsError.message}`);
        if (servicesError) throw new Error(`Failed to fetch services: ${servicesError.message}`);
        if (stylistsError) throw new Error(`Failed to fetch stylists: ${stylistsError.message}`);

        // Step 5: Create maps for easy lookup
        const clientsMap = new Map(clientsData?.map(c => [c.id, c]));
        const servicesMap = new Map(servicesData?.map(s => [s.id, s as Service])); // Assert type if necessary
        const stylistsMap = new Map(stylistsData?.map(st => [st.id, st as Pick<Stylist, 'id' | 'name'>])); // Use Pick

        // Step 6: Merge the data into the MergedAppointment structure
        const mergedAppointments: MergedAppointment[] = baseAppointments.map(appointment => {
          // Find client IDs associated with this appointment from the join table data
          const clientLinks = appointmentClientsData?.filter(ac => ac.appointment_id === appointment.id) || [];

          const clientDetailsForThisAppointment = clientLinks.map(link => {
            const client = clientsMap.get(link.client_id);
            if (!client) {
              console.warn(`Client data not found for ID: ${link.client_id} in appointment ${appointment.id}`);
              return null; // Skip if client data wasn't found
            }

            // Find services for this specific client in this appointment
            const servicesForThisClient = (appointmentServicesData || [])
              .filter(as => as.appointment_id === appointment.id && as.client_id === link.client_id)
              .map(as => servicesMap.get(as.service_id))
              .filter((service): service is Service => !!service); // Type guard to filter out nulls and assert type

            // Find stylists for this specific client in this appointment
            const stylistsForThisClient = (appointmentStylistsData || [])
              .filter(ast => ast.appointment_id === appointment.id && ast.client_id === link.client_id)
              .map(ast => stylistsMap.get(ast.stylist_id))
              .filter((stylist): stylist is Pick<Stylist, 'id' | 'name'> => !!stylist); // Type guard

            return {
              // Spread the client details (id, full_name, phone, etc.)
              ...client,
              // Nest the associated services and stylists
              services: servicesForThisClient,
              stylists: stylistsForThisClient,
              // Optionally derive collection ID for UI convenience, defaulting undefined to null
              selectedCollectionId: servicesForThisClient[0]?.collection_id ?? null 
            };
          }).filter(details => !!details);

          // Combine base appointment data with the structured client details
          return {
            ...appointment, // Spread base appointment fields
            clientDetails: clientDetailsForThisAppointment // Add the structured array
          };
        });
        console.log("Finished merging appointment data.");
        return mergedAppointments;

      } catch (error) {
        console.error('Error in queryFn fetching appointments:', error);
        toast.error(`Failed to fetch appointments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return []; // Return empty array on error to prevent breaking UI
      }
    },
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
    }) => {
      const { clientDetails, ...appointmentBaseData } = data;

       // Ensure times are correctly formatted (should already be ISO strings from handleBookingSubmit)
       const formattedStartTime = formatAppointmentTime(appointmentBaseData.start_time);
       const formattedEndTime = formatAppointmentTime(appointmentBaseData.end_time);

      console.log("Attempting to create appointment with base data:", { ...appointmentBaseData, start_time: formattedStartTime, end_time: formattedEndTime });

      // --- Step 1: Insert into main appointments table ---
      const { data: newAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          ...appointmentBaseData,
          start_time: formattedStartTime, // Use formatted times
          end_time: formattedEndTime,
          paid: false // Default paid status
        })
        .select() // Select the newly created appointment record
        .single();

      if (appointmentError) throw new Error(`Error inserting appointment: ${appointmentError.message}`);
      if (!newAppointment) throw new Error("Failed to create appointment (no data returned).");

      const newAppointmentId = newAppointment.id;
      console.log("Created base appointment with ID:", newAppointmentId);

      // --- Step 2: Insert into join tables ---
      try {
        // Process inserts for all clients concurrently
        await Promise.all(clientDetails.map(async (detail) => {
          const { clientId, serviceIds, stylistIds } = detail;
          console.log(`Processing joins for client ${clientId}...`);

          // 2a: Insert into appointment_clients (Appointment <-> Client link)
          const { error: acError } = await supabase
            .from('appointment_clients')
            .insert({ appointment_id: newAppointmentId, client_id: clientId });
          // If this fails, the rest for this client might not make sense
          if (acError) throw new Error(`Failed to link client ${clientId}: ${acError.message}`);
          console.log(` -> Linked client ${clientId}`);

          // 2b: Insert into appointment_services (Appt+Client <-> Service link)
          const serviceInserts = serviceIds.map(serviceId => ({
            appointment_id: newAppointmentId,
            client_id: clientId, // Include client_id
            service_id: serviceId
          }));
          if (serviceInserts.length > 0) {
            console.log(` -> Linking ${serviceInserts.length} services for client ${clientId}`);
            const { error: asError } = await supabase.from('appointment_services').insert(serviceInserts);
            // Handle potential duplicate key error specifically (e.g., PKey violation)
             if (asError && (asError.code === '23505' || asError.message.includes('appointment_services_pkey'))) { // Check code or message
                 console.warn(`Ignoring duplicate service(s) for client ${clientId}: ${asError.message}`);
                 // Continue if duplicates are acceptable or expected in some edge cases
             } else if (asError) {
                // Throw other errors
                throw new Error(`Failed to link services for client ${clientId}: ${asError.message}`);
             }
          }

          // 2c: Insert into appointment_stylists (Appt+Client <-> Stylist link)
          const stylistInserts = stylistIds.map(stylistId => ({
            appointment_id: newAppointmentId,
            client_id: clientId, // Include client_id
            stylist_id: stylistId
          }));
           if (stylistInserts.length > 0) {
             console.log(` -> Linking ${stylistInserts.length} stylists for client ${clientId}`);
             const { error: astError } = await supabase.from('appointment_stylists').insert(stylistInserts);
             // Handle potential duplicate key error specifically (e.g., PKey violation)
             if (astError && (astError.code === '23505' || astError.message.includes('appointment_stylists_pkey'))) { // Adjust constraint name if needed
                 console.warn(`Ignoring duplicate stylist(s) for client ${clientId}: ${astError.message}`);
                 // Continue if duplicates are acceptable
             } else if (astError) {
                 // Throw other errors
                throw new Error(`Failed to link stylists for client ${clientId}: ${astError.message}`);
             }
           }
          console.log(` -> Finished joins for client ${clientId}`);
        })); // End of Promise.all for client details

        console.log("Successfully inserted all join table records for appointment:", newAppointmentId);
        return newAppointment; // Return the created base appointment object

      } catch (joinError) {
         // If any join table insertion fails...
         console.error("Error inserting into join tables:", joinError);
         // Attempt to clean up: Delete the base appointment record
         console.warn("Attempting to delete partially created appointment:", newAppointmentId);
         await supabase.from('appointments').delete().match({ id: newAppointmentId });
         console.log("Deleted base appointment due to join error.");
         // Re-throw the error so the mutation fails
         throw joinError;
      }
    },
    onSuccess: (data) => {
      console.log("Appointment created successfully in DB:", data);
      // Invalidate the 'appointments' query cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully!');
    },
    onError: (error) => {
      console.error('Mutation error in createAppointment:', error);
      toast.error(`Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updateAppointment = useMutation({
    // Use the new interface for the input data type
    mutationFn: async (data: UpdateAppointmentData) => {
      const { id: appointmentId, clientDetails, ...appointmentBaseUpdates } = data;

      console.log(`Starting update for appointment ${appointmentId}`);

      // --- Step 1: Delete existing join table entries --- 
      // We should ideally wrap these in a transaction if possible, 
      // but Supabase client might require RPC for transactions.
      // Doing sequentially for now.
      console.log(` -> Deleting existing joins for appointment ${appointmentId}...`);
      try {
        const { error: deleteClientsError } = await supabase
          .from('appointment_clients')
          .delete()
          .eq('appointment_id', appointmentId);
        if (deleteClientsError) throw new Error(`Failed to delete appointment_clients: ${deleteClientsError.message}`);

        const { error: deleteServicesError } = await supabase
          .from('appointment_services')
          .delete()
          .eq('appointment_id', appointmentId);
        if (deleteServicesError) throw new Error(`Failed to delete appointment_services: ${deleteServicesError.message}`);

        const { error: deleteStylistsError } = await supabase
          .from('appointment_stylists')
          .delete()
          .eq('appointment_id', appointmentId);
        if (deleteStylistsError) throw new Error(`Failed to delete appointment_stylists: ${deleteStylistsError.message}`);
        console.log(` -> Successfully deleted existing joins.`);
      } catch (error) {
         console.error("Error deleting existing join table records:", error);
         // Decide if we should proceed or throw. Let's throw for now.
         throw new Error(`Failed to clear existing appointment links: ${error instanceof Error ? error.message : error}`);
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
        // Include primary keys if they are part of the update data and exist on the table
        client_id, 
        stylist_id, 
        service_id 
      } = appointmentBaseUpdates;

      const validBaseUpdateData: Partial<Appointment> & { updated_at?: string } = {
        ...(start_time && { start_time: formatAppointmentTime(start_time) }), // Format time on update too
        ...(end_time && { end_time: formatAppointmentTime(end_time) }),
        ...(notes !== undefined && { notes }), // Allow empty string for notes
        ...(status && { status }),
        ...(client_id && { client_id }), // Keep if appointments table needs primary keys
        ...(stylist_id && { stylist_id }),
        ...(service_id && { service_id }),
        ...(paid !== undefined && { paid }),
        ...(billed !== undefined && { billed }),
        updated_at: new Date().toISOString()
      };
      
      // Remove undefined keys to prevent sending them in the update payload
      Object.keys(validBaseUpdateData).forEach(key => {
        // Explicitly type key or cast object to allow indexing
        const typedKey = key as keyof typeof validBaseUpdateData;
        if (validBaseUpdateData[typedKey] === undefined) {
          delete validBaseUpdateData[typedKey];
        }
      });

      console.log(` -> Updating base appointment ${appointmentId} with:`, validBaseUpdateData);
      const { data: updatedAppointment, error: updateError } = await supabase
          .from('appointments')
          .update(validBaseUpdateData)
          .eq('id', appointmentId)
          .select()
          .single();

      if (updateError) throw new Error(`Error updating base appointment ${appointmentId}: ${updateError.message}`);
      if (!updatedAppointment) throw new Error(`Failed to update base appointment ${appointmentId} (no data returned).`);
      console.log(` -> Successfully updated base appointment.`);

      // --- Step 3: Insert new join table entries --- 
      // This logic is very similar to the createAppointment mutation
      console.log(` -> Inserting new joins for appointment ${appointmentId}...`);
      try {
        // Process inserts for all clients concurrently
        await Promise.all(clientDetails.map(async (detail) => {
          const { clientId, serviceIds, stylistIds } = detail;
          console.log(`  -> Processing joins for client ${clientId}`);

          // 3a: Insert into appointment_clients
          const { error: acError } = await supabase
            .from('appointment_clients')
            .insert({ appointment_id: appointmentId, client_id: clientId });
          if (acError) throw new Error(`Failed to link client ${clientId}: ${acError.message}`);
          console.log(`    - Linked client ${clientId}`);

          // 3b: Insert into appointment_services
          const serviceInserts = serviceIds.map(serviceId => ({ appointment_id: appointmentId, client_id: clientId, service_id: serviceId }));
          if (serviceInserts.length > 0) {
            const { error: asError } = await supabase.from('appointment_services').insert(serviceInserts);
            // Handle potential duplicate key error if constraints were not properly handled by delete
            if (asError && asError.code === '23505') { 
                console.warn(`Ignoring duplicate service(s) on update for client ${clientId}: ${asError.message}`);
            } else if (asError) {
                throw new Error(`Failed to link services for client ${clientId} on update: ${asError.message}`);
            }
             console.log(`    - Linked ${serviceInserts.length} services for client ${clientId}`);
          }

          // 3c: Insert into appointment_stylists
          const stylistInserts = stylistIds.map(stylistId => ({ appointment_id: appointmentId, client_id: clientId, stylist_id: stylistId }));
           if (stylistInserts.length > 0) {
             const { error: astError } = await supabase.from('appointment_stylists').insert(stylistInserts);
             if (astError && astError.code === '23505') { 
                 console.warn(`Ignoring duplicate stylist(s) on update for client ${clientId}: ${astError.message}`);
             } else if (astError) {
                throw new Error(`Failed to link stylists for client ${clientId} on update: ${astError.message}`);
             }
             console.log(`    - Linked ${stylistInserts.length} stylists for client ${clientId}`);
           }
        })); // End of Promise.all for client details

        console.log(` -> Successfully inserted new joins for appointment ${appointmentId}.`);
      } catch (joinError) {
        // If inserting new joins fails, the base appointment is already updated.
        // This leaves the data potentially inconsistent. Transactional logic would be better.
        console.error(`Error inserting new join table records for appointment ${appointmentId}:`, joinError);
        // We should probably throw here to indicate the update wasn't fully successful
        throw new Error(`Update partially failed: Could not insert new links. ${joinError instanceof Error ? joinError.message : joinError}`);
      }

      // Return the updated base appointment record
      return updatedAppointment;
    },
    onSuccess: (data) => {
      console.log("Appointment updated successfully in DB:", data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated successfully!');
    },
    onError: (error) => {
      console.error('Mutation error in updateAppointment:', error);
      toast.error(`Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Attempting to delete appointment ${id}`);
      // Assumes ON DELETE CASCADE is set up for foreign keys in Supabase.
      // If not, you MUST manually delete from appointment_clients, _services, _stylists first.
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Error deleting appointment ${id}: ${error.message}`);
      console.log(`Successfully deleted appointment ${id}`);
      return { id }; // Return deleted ID
    },
    onSuccess: (data) => {
      console.log("Appointment deleted successfully from DB:", data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment deleted successfully');
    },
    onError: (error) => {
      console.error('Mutation error in deleteAppointment:', error);
      toast.error(`Failed to delete appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

// Remove unused type export for non-existent module
// export type { BillingResult } from './createBillsForAppointment'; 