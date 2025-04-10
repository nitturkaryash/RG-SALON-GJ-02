import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { StylistBreak } from './useStylists'
import { supabase } from '../utils/supabase/supabaseClient'

// Import from useClients
import { useClients } from './useClients'

// Data types
interface Client {
  id: string;
  full_name: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Stylist {
  id: string;
  name: string;
  breaks?: StylistBreak[]; // Add breaks property to local Stylist interface
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

export function useAppointments() {
  const queryClient = useQueryClient()
  const { updateClientFromAppointment } = useClients()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      try {
        // Try directly getting appointments without checking schema first
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            client_id,
            stylist_id,
            service_id,
            start_time,
            end_time,
            status,
            notes,
            paid,
            created_at,
            updated_at
          `)
          .order('start_time', { ascending: true });
        
        if (error) {
          console.error('Error fetching appointments:', error);
          toast.error('Failed to fetch appointments');
          return []; // Return empty array instead of throwing
        }
        
        // Separately fetch related data to avoid foreign key issues
        if (data && data.length > 0) {
          const clientIds = [...new Set(data.filter(a => a.client_id).map(a => a.client_id))];
          const stylistIds = [...new Set(data.filter(a => a.stylist_id).map(a => a.stylist_id))];
          const serviceIds = [...new Set(data.filter(a => a.service_id).map(a => a.service_id))];
          
          // Fetch clients
          const { data: clients } = await supabase
            .from('clients')
            .select('id, full_name, phone')
            .in('id', clientIds);
            
          // Fetch stylists
          const { data: stylists } = await supabase
            .from('stylists')
            .select('id, name')
            .in('id', stylistIds);
            
          // Fetch services
          const { data: services } = await supabase
            .from('services')
            .select('id, name, price')
            .in('id', serviceIds);
          
          // Merge the data
          return data.map(appointment => {
            const client = clients?.find(c => c.id === appointment.client_id);
            const stylist = stylists?.find(s => s.id === appointment.stylist_id);
            const service = services?.find(s => s.id === appointment.service_id);
            
            return {
              ...appointment,
              clients: client ? { full_name: client.full_name, phone: client.phone } : null,
              stylists: stylist ? { name: stylist.name } : null,
              services: service ? { name: service.name, price: service.price } : null
            };
          });
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in appointment query:', error);
        toast.error('Failed to load appointments');
        return []; // Return empty array instead of throwing
      }
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      // Format appointment times consistently with exact minutes
      const formattedStartTime = formatAppointmentTime(data.start_time);
      const formattedEndTime = formatAppointmentTime(data.end_time);
      
      // Load stylists data to check breaks
      const stylists = await fetchStylists();
      
      // Check if this appointment conflicts with any stylist breaks
      if (checkBreakConflict(data.stylist_id, formattedStartTime, formattedEndTime, stylists)) {
        throw new Error('This appointment conflicts with a scheduled break for the stylist');
      }
      
      // Find or create client using the updateClientFromAppointment function
      let client;
      let client_id: string | undefined;

      if (data.client_id) {
        client_id = data.client_id;
        // If client_id is provided, the client exists, but we still call updateClientFromAppointment
        // to update appointment count, last_visit, etc.
        client = await updateClientFromAppointment(
          data.client_name,
          data.phone,
          data.email,
          data.notes,
          formattedStartTime
        );
      } else {
        // Create or update client
        client = await updateClientFromAppointment(
          data.client_name,
          data.phone,
          data.email,
          data.notes,
          formattedStartTime
        );
        client_id = client.id;
      }
      
      // Create new appointment
      const newAppointment = {
        client_id,
        stylist_id: data.stylist_id,
        service_id: data.service_id,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        status: data.status,
        notes: data.notes,
        paid: false
      };
      
      // Insert into Supabase - AVOID complex joins by using two steps
      // Step 1: Insert the appointment with a simple returning clause
      const { data: insertedAppointment, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }
      
      // Step 2: Get the full appointment data separately with client, service, and stylist data
      const appointmentId = insertedAppointment.id;
      
      // Fetch appointment
      const { data: fullAppointment } = await supabase
        .from('appointments')
        .select('id, client_id, stylist_id, service_id, start_time, end_time, status, notes, paid, created_at')
        .eq('id', appointmentId)
        .single();
        
      // Fetch client
      const { data: clientData } = await supabase
        .from('clients')
        .select('id, full_name, phone')
        .eq('id', client_id)
        .single();
        
      // Fetch stylist
      const { data: stylistData } = await supabase
        .from('stylists')
        .select('id, name')
        .eq('id', data.stylist_id)
        .single();
        
      // Fetch service
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('id', data.service_id)
        .single();
      
      // Combine the data
      const completeAppointment = {
        ...fullAppointment,
        clients: clientData ? { full_name: clientData.full_name, phone: clientData.phone } : null,
        stylists: stylistData ? { name: stylistData.name } : null,
        services: serviceData ? { name: serviceData.name, price: serviceData.price } : null
      };
      
      return completeAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error creating appointment:', error);
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async (updates: Partial<Appointment> & { id: string }) => {
      console.log('Updating appointment with data:', updates);
      const { id, ...updateData } = updates;
      
      // Format appointment times if they are being updated
      const formattedUpdates: any = { ...updateData };
      if (updates.start_time) {
        formattedUpdates.start_time = formatAppointmentTime(updates.start_time);
      }
      if (updates.end_time) {
        formattedUpdates.end_time = formatAppointmentTime(updates.end_time);
      }
      
      // Add updated_at timestamp
      formattedUpdates.updated_at = new Date().toISOString();
      
      // Remove any properties that shouldn't be sent to the database
      // These fields are used for UI display but aren't part of the schema
      delete formattedUpdates.clients;
      delete formattedUpdates.stylists;
      delete formattedUpdates.services;
      
      console.log('Sending formatted updates to database:', formattedUpdates);
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('appointments')
        .update(formattedUpdates)
        .eq('id', id)
        .select('*');
      
      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }
      
      console.log('Appointment updated successfully:', data);
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from update operation');
      }
      
      // Fetch the updated appointment with all related data
      const updatedAppointment = data[0];
      
      try {
        // Fetch client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, full_name, phone')
          .eq('id', updatedAppointment.client_id)
          .single();
          
        if (clientError) {
          console.warn('Error fetching client data:', clientError);
        }
          
        // Fetch stylist
        const { data: stylistData, error: stylistError } = await supabase
          .from('stylists')
          .select('id, name')
          .eq('id', updatedAppointment.stylist_id)
          .single();
          
        if (stylistError) {
          console.warn('Error fetching stylist data:', stylistError);
        }
          
        // Fetch service
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('id, name, price')
          .eq('id', updatedAppointment.service_id)
          .single();
        
        if (serviceError) {
          console.warn('Error fetching service data:', serviceError);
        }
        
        // Combine the data
        const completeAppointment = {
          ...updatedAppointment,
          clients: clientData ? { full_name: clientData.full_name, phone: clientData.phone } : null,
          stylists: stylistData ? { name: stylistData.name } : null,
          services: serviceData ? { name: serviceData.name, price: serviceData.price } : null
        };
        
        return completeAppointment;
      } catch (fetchError) {
        console.error('Error fetching related data:', fetchError);
        // Return the appointment data without related entities if fetching fails
        return updatedAppointment;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error updating appointment:', error);
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      // First get the appointment details before deletion for later reference if needed
      const { data: appointmentToDelete } = await supabase
        .from('appointments')
        .select('id')
        .eq('id', id)
        .single();
      
      if (!appointmentToDelete) {
        throw new Error('Appointment not found');
      }
      
      // Delete the appointment
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error deleting appointment:', error);
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment: createAppointment.mutate,
    updateAppointment: updateAppointment.mutate,
    deleteAppointment: deleteAppointment.mutate,
  };
} 