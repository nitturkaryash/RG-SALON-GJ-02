import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import type { ServiceItem } from '../models/serviceTypes'
import { supabase } from '../utils/supabase/supabaseClient.js'

export function useCollectionServices(collectionId?: string) {
  const queryClient = useQueryClient()

  // Fetch services from the 'services' table, optionally filtered by collectionId
  const { data: services, isLoading, refetch } = useQuery({
    // Use collectionId in the queryKey to differentiate between queries for different collections
    queryKey: ['services', { collectionId: collectionId }],
    queryFn: async () => {
      try {
        let query = supabase
          .from('services') // Query the main 'services' table
          .select('*')
          .order('name', { ascending: true });

        // Apply filter if collectionId is provided
        if (collectionId) {
          console.log(`Fetching services for collection ID: ${collectionId}`);
          query = query.eq('collection_id', collectionId); // Filter by the renamed collection_id column
        } else {
          console.log('No collection ID provided, fetching all services from services table');
          // If no collectionId, fetch all services (adjust if you want different behavior)
        }

        const { data: servicesData, error } = await query;

        if (error) {
          console.error('Error fetching services:', error);
          throw error;
        }
        
        console.log(`Found ${servicesData?.length || 0} services`);
        // Ensure the data conforms to ServiceItem, handle potential nulls/defaults
        return (servicesData || []).map(service => ({
          id: service.id,
          name: service.name || 'Unnamed Service',
          description: service.description || '',
          price: typeof service.price === 'number' ? service.price : 0,
          duration: typeof service.duration === 'number' ? service.duration : 30,
          active: service.active === true, // Ensure boolean
          collection_id: service.collection_id, // Keep collection_id
          created_at: service.created_at || new Date().toISOString(),
          // Add any other fields from the 'services' table that ServiceItem requires
        })) as ServiceItem[];

      } catch (error) {
        console.error('Error in useCollectionServices hook queryFn:', error);
        return [] as ServiceItem[]; // Return empty array on error
      }
    },
    // Consider adjusting staleTime, cacheTime, refetchInterval based on needs
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    // refetchInterval: false,
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true,
    enabled: true, // Always enabled, but queryFn handles the collectionId filter
  });

  // Mutation to create a new service in the 'services' table
  const createService = useMutation({
    mutationFn: async (newService: Omit<ServiceItem, 'id' | 'created_at'>) => {
      const serviceId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Prepare data for the 'services' table
      const serviceToInsert = {
        id: serviceId,
        collection_id: newService.collection_id, // Make sure this is provided
        name: newService.name || 'Unnamed Service',
        description: newService.description || '',
        price: typeof newService.price === 'number' ? newService.price : 0,
        duration: typeof newService.duration === 'number' ? newService.duration : 30,
        active: newService.active === true, // Ensure boolean
        created_at: timestamp,
        updated_at: timestamp // Set updated_at on creation
        // Add any other required fields for the 'services' table
      };
      
      console.log('Creating new service in services table:', serviceToInsert);
      
      // Insert directly into the 'services' table
      const { data, error } = await supabase
        .from('services')
        .insert(serviceToInsert)
        .select();
      
      if (error) {
        console.error('Error inserting into services table:', error);
        throw error;
      }
      
      console.log('Service added to services table:', data);
      return data?.[0] as ServiceItem;
    },
    onSuccess: (data) => {
      console.log('Service creation successful, invalidating queries', data);
      // Invalidate queries for the specific collection and the general services query
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId: data.collection_id }] });
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId: undefined }] }); // Invalidate the "all services" query if used
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Invalidate the general useServices query if needed
      toast.success('Service added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add service');
      console.error('Error adding service:', error);
    },
  });

  // Mutation to update an existing service in the 'services' table
  const updateService = useMutation({
    mutationFn: async (updates: Partial<ServiceItem> & { id: string }) => {
      const { id, ...serviceUpdates } = updates; // Separate id from the rest of the updates
      
      // Add updated_at timestamp
      serviceUpdates.updated_at = new Date().toISOString();
      
      console.log(`Updating service ${id} in services table:`, serviceUpdates);

      // Update directly in the 'services' table
      const { data, error } = await supabase
        .from('services')
        .update(serviceUpdates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating service in services table:', error);
        throw error;
      }
      
      console.log('Service updated in services table:', data);
      return data?.[0] as ServiceItem;
    },
    onSuccess: (data) => {
      console.log('Service update successful, invalidating queries', data);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId: data.collection_id }] });
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId: undefined }] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update service');
      console.error('Error updating service:', error);
    },
  });

  // Mutation to delete a service from the 'services' table
  const deleteService = useMutation({
    mutationFn: async (serviceToDelete: ServiceItem) => {
      const { id, collection_id } = serviceToDelete; // Get id and collection_id for invalidation
      console.log(`Deleting service ${id} from services table`);

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting service from services table:', error);
        throw error;
      }
      
      console.log(`Service ${id} deleted from services table`);
      // Return the collection_id to use in onSuccess for invalidation
      return { success: true, collection_id }; 
    },
    onSuccess: (data) => {
      console.log('Service deletion successful, invalidating queries');
      // Invalidate relevant queries using the collection_id from the mutation result
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId: data.collection_id }] });
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId: undefined }] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    },
  });

  // Function to get a single service (useful if needed)
  const getService = (id: string) => {
    return services?.find(s => s.id === id);
  };

  return {
    // Rename data to 'services' for clarity, as it now directly reflects the services table
    services: services || [], 
    isLoading,
    refetch, // Expose refetch if needed
    createService: createService.mutate,
    updateService: updateService.mutate,
    // Pass the full service object to deleteService mutation if possible,
    // otherwise, you might need to fetch it first to get collection_id for invalidation
    deleteService: deleteService.mutate, 
    getService, // Expose getService if needed
  }
} 