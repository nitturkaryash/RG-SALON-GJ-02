import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../utils/supabase/supabaseClient'

export interface Client {
  id: string;
  full_name: string; // Required field
  phone: string;
  email: string;
  created_at: string;
  total_spent?: number;
  pending_payment?: number;
  last_visit?: string | null;
  notes?: string;
  appointment_count?: number;
  updated_at?: string;
  gender?: string;
  birth_date?: string | null; // Store as string, handle date conversion in UI
  anniversary_date?: string | null; // Store as string, handle date conversion in UI
}

export function useClients() {
  const queryClient = useQueryClient();

  // Query for all clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to fetch clients');
        throw error;
      }
      
      return data || [];
    },
  });

  // Create a new client
  const createClient = useMutation({
    mutationFn: async (data: Omit<Client, 'id' | 'created_at'>) => {
      const newClient = {
        full_name: data.full_name,
        phone: data.phone || '',
        email: data.email || '',
        notes: data.notes || '',
        total_spent: data.total_spent || 0,
        pending_payment: data.pending_payment || 0,
        last_visit: data.last_visit || null,
        gender: data.gender || '',
        birth_date: data.birth_date || null,
        anniversary_date: data.anniversary_date || null
      };
      
      const { data: insertedClient, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }
      
      return insertedClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Error in createClient mutation:', error);
      toast.error(`Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Update client data
  const updateClient = useMutation({
    mutationFn: async (data: Partial<Client> & { id: string }) => {
      const { id, ...updateData } = data;

      // Ensure date fields are null if empty, otherwise keep their value
      const processedUpdateData: Partial<Client> = { ...updateData };
      if (updateData.birth_date === '') {
        processedUpdateData.birth_date = null;
      }
      if (updateData.anniversary_date === '') {
        processedUpdateData.anniversary_date = null;
      }
      
      // Add updated_at timestamp
      const clientData = {
        ...processedUpdateData, // Use processed data here
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }
      
      return updatedClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      console.error('Error in updateClient mutation:', error);
      toast.error(`Failed to update client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Update or create client based on order data
  const updateClientFromOrder = async (
    clientName: string, 
    orderTotal: number, 
    paymentMethod: string,
    orderDate: string
  ) => {
    // Find client by name (case insensitive)
    const { data: existingClients, error: findError } = await supabase
      .from('clients')
      .select('*')
      .ilike('full_name', clientName);
    
    if (findError) {
      console.error('Error finding client:', findError);
      toast.error('Failed to find client');
      throw findError;
    }
    
    if (existingClients && existingClients.length > 0) {
      // Update existing client
      const client = existingClients[0];
      const updatedClientData: Partial<Client> & { updated_at: string } = {
        last_visit: orderDate,
        total_spent: paymentMethod === 'bnpl' ? client.total_spent || 0 : (client.total_spent || 0) + orderTotal,
        pending_payment: paymentMethod === 'bnpl' ? (client.pending_payment || 0) + orderTotal : client.pending_payment || 0,
        updated_at: new Date().toISOString()
      };

      // Only update appointment_count if the column exists to prevent errors
      // and ensure it's treated as a number.
      if (typeof client.appointment_count === 'number' || client.appointment_count === undefined || client.appointment_count === null) {
        updatedClientData.appointment_count = (Number(client.appointment_count) || 0) + 1;
      } else {
        // If appointment_count is some other type, log a warning or handle as needed
        console.warn(`Client ${client.id} has an unexpected type for appointment_count: ${typeof client.appointment_count}`);
        // Optionally, you could decide to initialize it to 1 here if it's an unexpected type
        // updatedClientData.appointment_count = 1;
      }
      
      const { data, error } = await supabase
        .from('clients')
        .update(updatedClientData)
        .eq('id', client.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating client from order:', error);
        toast.error('Failed to update client');
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      return data;
    } else {
      // Create new client
      const newClient = {
        full_name: clientName,
        phone: '',
        email: '',
        notes: 'Created from order',
        total_spent: paymentMethod === 'bnpl' ? 0 : orderTotal,
        pending_payment: paymentMethod === 'bnpl' ? orderTotal : 0,
        last_visit: orderDate,
        appointment_count: 1 // Initialize lifetime visit count to 1 for new clients from orders
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating client from order:', error);
        toast.error('Failed to create client');
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      return data;
    }
  };

  // Update client from appointment booking
  const updateClientFromAppointment = async (
    clientName: string,
    phone?: string,
    email?: string,
    notes?: string,
    appointmentDate: string = new Date().toISOString()
  ) => {
    // Log the exact input received to debug
    console.log(`updateClientFromAppointment input:`, {
      clientName: clientName,
      clientNameType: typeof clientName,
      phone,
      email,
      appointmentDate
    });

    // Validate client name more strictly
    if (!clientName || typeof clientName !== 'string') {
      console.error(`Invalid client name: '${clientName}' (type: ${typeof clientName})`);
      toast.error('Client name is required');
      throw new Error('Client name cannot be empty');
    }

    // Trim the name to remove any leading/trailing whitespace
    const trimmedName = clientName.trim();
    
    // Check again after trimming
    if (trimmedName === '') {
      console.error('Client name is empty after trimming');
      toast.error('Client name cannot be blank');
      throw new Error('Client name cannot be empty after trimming');
    }
    
    // Log received name
    console.log(`updateClientFromAppointment received name: '${trimmedName}'`);

    // Find client by name (case insensitive)
    const { data: existingClients, error: findError } = await supabase
      .from('clients')
      .select('*')
      .ilike('full_name', trimmedName);
    
    if (findError) {
      console.error('Error finding client:', findError);
      toast.error('Failed to find client');
      throw findError;
    }
    
    try {
      if (existingClients && existingClients.length > 0) {
        // Update existing client
        const client = existingClients[0];
        const updatedClient: Partial<Client> = { 
          last_visit: appointmentDate,
          updated_at: new Date().toISOString()
        };
        
        // Only add appointment_count if it already exists in the client record
        // This prevents errors if the column doesn't exist yet
        if ('appointment_count' in client) {
          updatedClient.appointment_count = (client.appointment_count || 0) + 1;
        }
        
        // Update contact info if provided
        if (phone) updatedClient.phone = phone;
        if (email) updatedClient.email = email;
        if (notes) updatedClient.notes = `${client.notes ? client.notes + '\n' : ''}${notes}`;
        
        const { data, error } = await supabase
          .from('clients')
          .update(updatedClient)
          .eq('id', client.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating client from appointment:', error);
          toast.error('Failed to update client');
          throw error;
        }
        
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        return data;
      } else {
        // Create new client - ensure all required fields are present and validated
        if (!trimmedName) {
          throw new Error('Client name is required for new client creation');
        }
        
        // Double check for empty string again, even though we checked above
        if (trimmedName === '') {
          throw new Error('Cannot create client with empty name after trimming');
        }
        
        const newClient = {
          full_name: trimmedName, // Use trimmed name
          phone: phone || '',
          email: email || '',
          notes: notes || 'Created from appointment booking',
          total_spent: 0,
          pending_payment: 0,
          last_visit: appointmentDate
          // We'll omit appointment_count if the column doesn't exist yet
        };
        
        console.log('Attempting to insert new client object:', JSON.stringify(newClient)); // Log before insert

        const { data, error } = await supabase
          .from('clients')
          .insert([newClient])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating client from appointment:', error);
          toast.error(`Failed to create client: ${error.message}`);
          throw error;
        }
        
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        return data;
      }
    } catch (error) {
      console.error('Error in updateClientFromAppointment:', error);
      throw error; // Remove the fallback behavior to prevent creating clients with potential issues
    }
  };

  // Process payment for pending BNPL amount
  const processPendingPayment = useMutation({
    mutationFn: async ({ clientId, amount }: { clientId: string, amount: number }) => {
      // First get the client to check pending amount
      const { data: client, error: getError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (getError) {
        console.error('Error getting client:', getError);
        throw getError;
      }
      
      if (!client) {
        throw new Error('Client not found');
      }
      
      if (amount > (client.pending_payment || 0)) {
        throw new Error('Payment amount exceeds pending amount');
      }
      
      const updatedClient = { 
        pending_payment: (client.pending_payment || 0) - amount,
        total_spent: (client.total_spent || 0) + amount,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', clientId)
        .select()
        .single();
      
      if (error) {
        console.error('Error processing payment:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Payment processed successfully');
    },
    onError: (error) => {
      console.error('Error in processPendingPayment mutation:', error);
      toast.error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Delete a client
  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .select()
        .single();
      
      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Error in deleteClient mutation:', error);
      toast.error(`Failed to delete client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Delete all clients
  const deleteAllClients = useMutation({
    mutationFn: async () => {
      // First count clients to check if there are any
      const { count, error: countError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error counting clients:', countError);
        throw countError;
      }
      
      if (count === 0) {
        throw new Error('No clients to delete');
      }
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        console.error('Error deleting all clients:', error);
        throw error;
      }
      
      return { count };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(`Successfully deleted all ${result.count} clients`);
    },
    onError: (error) => {
      console.error('Error in deleteAllClients mutation:', error);
      toast.error(`Failed to delete all clients: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  return {
    clients,
    isLoading,
    createClient: createClient.mutate,
    createClientAsync: createClient.mutateAsync,
    updateClient: updateClient.mutate,
    updateClientFromOrder,
    updateClientFromAppointment,
    processPendingPayment: processPendingPayment.mutate,
    deleteClient: deleteClient.mutate,
    deleteAllClients: deleteAllClients.mutate
  };
} 