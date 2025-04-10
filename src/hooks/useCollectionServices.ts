import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import type { ServiceItem } from '../models/serviceTypes'
import { supabase } from '../lib/supabase'

export function useCollectionServices(collectionId?: string) {
  const queryClient = useQueryClient()

  const { data: collectionServices, isLoading, refetch } = useQuery({
    queryKey: ['collectionServices', collectionId],
    queryFn: async () => {
      try {
        if (!collectionId) {
          console.log('No collection ID provided, fetching all services');
          const { data: servicesData, error } = await supabase
            .from('collection_services')
            .select('*')
            .order('name', { ascending: true });

          if (error) {
            console.error('Error fetching all services:', error);
            throw error;
          }

          return servicesData as ServiceItem[];
        } 
        
        console.log(`Fetching services for collection ID: ${collectionId}`);
        
        // First, get services from collection_services table
        const { data: collectionServicesData, error: collectionError } = await supabase
          .from('collection_services')
          .select('*')
          .eq('collection_id', collectionId)
          .order('name', { ascending: true });

        if (collectionError) {
          console.error(`Error fetching services for collection ${collectionId}:`, collectionError);
          throw collectionError;
        }
        
        // Then, also get services from the main services table where category matches collection_id
        const { data: mainServicesData, error: mainError } = await supabase
          .from('services')
          .select('*')
          .eq('category', collectionId)
          .order('name', { ascending: true });
          
        if (mainError) {
          console.error(`Error fetching main services for collection ${collectionId}:`, mainError);
          // Don't throw here, we still want to return collection_services data
        }
        
        // Combine results, ensuring no duplicates (using id as key)
        const servicesMap = new Map();
        
        // Add collection services first
        if (collectionServicesData && collectionServicesData.length > 0) {
          collectionServicesData.forEach(service => {
            servicesMap.set(service.id, service);
          });
        }
        
        // Add main services, but transform them to match ServiceItem interface
        if (mainServicesData && mainServicesData.length > 0) {
          mainServicesData.forEach(service => {
            // Only add if not already in the map
            if (!servicesMap.has(service.id)) {
              // Convert to ServiceItem structure, ensuring all required fields are present
              const serviceItem: ServiceItem = {
                id: service.id,
                name: service.name || 'Unnamed Service',
                description: service.description || '',
                price: typeof service.price === 'number' ? service.price : 0,
                duration: typeof service.duration === 'number' ? service.duration : 30,
                active: service.active === true, // Ensure boolean
                collection_id: collectionId, // IMPORTANT: Must set collection_id explicitly
                created_at: service.created_at || new Date().toISOString()
              };
              
              // Add to map
              servicesMap.set(service.id, serviceItem);
              
              // Also sync back to collection_services if not already there
              try {
                console.log('Syncing service to collection_services table:', serviceItem);
                supabase
                  .from('collection_services')
                  .upsert([serviceItem], { onConflict: 'id' })
                  .then(({ error }) => {
                    if (error) {
                      console.error('Error syncing service to collection_services:', error);
                    } else {
                      console.log(`Service ${service.id} synced to collection_services`);
                    }
                  });
              } catch (syncError) {
                console.error('Error syncing to collection_services:', syncError);
              }
            }
          });
        }
        
        // Convert map values to array
        const combinedServices = Array.from(servicesMap.values());
        
        if (combinedServices.length > 0) {
          console.log(`Found ${combinedServices.length} total services for collection ${collectionId}`);
          console.log('Services data:', JSON.stringify(combinedServices));
          
          // Force update the cache directly with the services we found
          queryClient.setQueryData(['collectionServices', collectionId], combinedServices);
          
          return combinedServices as ServiceItem[];
        } else {
          console.warn(`No services found for collection ${collectionId}`);
          return [] as ServiceItem[];
        }
      } catch (error) {
        console.error('Error in collection services hook:', error);
        return [] as ServiceItem[];
      }
    },
    staleTime: 0,
    cacheTime: 0, // Don't cache the data between component unmounts
    refetchInterval: 1000, // Refetch every second to ensure we get the latest data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!collectionId,
  });

  const createService = useMutation({
    mutationFn: async (newService: Omit<ServiceItem, 'id' | 'created_at'>) => {
      const serviceId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Ensure all required fields have proper values
      const service: ServiceItem = {
        id: serviceId,
        collection_id: newService.collection_id,
        name: newService.name || 'Unnamed Service',
        description: newService.description || '',
        price: typeof newService.price === 'number' ? newService.price : 0,
        duration: typeof newService.duration === 'number' ? newService.duration : 30,
        active: newService.active === true, // Ensure boolean
        created_at: timestamp
      };
      
      console.log('Creating new service:', service);
      
      // First insert into collection_services
      const { data, error } = await supabase
        .from('collection_services')
        .insert(service)
        .select();
      
      if (error) {
        console.error('Error inserting into collection_services:', error);
        throw error;
      }
      
      console.log('Service added to collection_services:', data);
      
      // Then also insert into the main services table
      try {
        // Map the fields appropriately for the services table
        const mainService = {
          id: serviceId,
          name: service.name,
          description: service.description || '',
          price: service.price,
          duration: service.duration || 30,
          category: service.collection_id, // Use collection_id as category
          active: service.active,
          created_at: timestamp
        };
        
        console.log('Adding service to main services table:', mainService);
        
        const { error: mainError } = await supabase
          .from('services')
          .insert(mainService);
          
        if (mainError) {
          console.error('Error adding to main services table:', mainError);
        } else {
          console.log('Service successfully added to main services table');
        }
      } catch (mainError) {
        console.error('Failed to add service to main services table:', mainError);
        // Don't throw here, we still want to return the collection service
      }
      
      return data?.[0] as ServiceItem;
    },
    onSuccess: (data) => {
      console.log('Service creation successful, invalidating queries', data);
      queryClient.invalidateQueries({ queryKey: ['collectionServices', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Also invalidate the services query
      queryClient.refetchQueries({ queryKey: ['collectionServices', collectionId] });
      toast.success('Service added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add service');
      console.error('Error adding service:', error);
    },
  });

  const updateService = useMutation({
    mutationFn: async (updates: Partial<ServiceItem> & { id: string }) => {
      // First update the collection_services
      const { data, error } = await supabase
        .from('collection_services')
        .update(updates)
        .eq('id', updates.id)
        .select();
      
      if (error) throw error;
      
      // Then also update the main services table
      try {
        // Map the fields appropriately for the services table
        const mainServiceUpdates: any = {};
        
        if (updates.name !== undefined) mainServiceUpdates.name = updates.name;
        if (updates.description !== undefined) mainServiceUpdates.description = updates.description;
        if (updates.price !== undefined) mainServiceUpdates.price = updates.price;
        if (updates.duration !== undefined) mainServiceUpdates.duration = updates.duration;
        if (updates.active !== undefined) mainServiceUpdates.active = updates.active;
        // Don't update category/collection_id as that's the fixed relationship
        
        if (Object.keys(mainServiceUpdates).length > 0) {
          console.log('Updating service in main services table:', mainServiceUpdates);
          
          const { error: mainError } = await supabase
            .from('services')
            .update(mainServiceUpdates)
            .eq('id', updates.id);
            
          if (mainError) {
            console.error('Error updating main services table:', mainError);
          } else {
            console.log('Service successfully updated in main services table');
          }
        }
      } catch (mainError) {
        console.error('Failed to update service in main services table:', mainError);
        // Don't throw here, we still want to return the updated collection service
      }
      
      return data[0] as ServiceItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionServices', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Also invalidate the services query
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update service');
      console.error('Error updating service:', error);
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting service with ID: ${id} from collection: ${collectionId}`);
      
      // First delete from collection_services table
      const { error: collectionError } = await supabase
        .from('collection_services')
        .delete()
        .eq('id', id);
      
      if (collectionError) {
        console.error(`Error deleting from collection_services:`, collectionError);
        throw collectionError;
      }
      
      // Then check if the service should also be deleted from the main services table
      // We'll delete it from there only if it has category = this collection and not used elsewhere
      try {
        // First check if it exists in other collections
        const { data: otherCollections, error: countError } = await supabase
          .from('collection_services')
          .select('id')
          .eq('id', id);
          
        if (countError) {
          console.error('Error checking service usage in other collections:', countError);
        } else {
          // If not used in other collections, delete from main services table too
          if (!otherCollections || otherCollections.length === 0) {
            console.log(`Service ${id} not used in other collections, deleting from main services table`);
            
            const { error: mainError } = await supabase
              .from('services')
              .delete()
              .eq('id', id);
              
            if (mainError) {
              console.error('Error deleting from main services table:', mainError);
            } else {
              console.log(`Successfully deleted service ${id} from main services table`);
            }
          } else {
            console.log(`Service ${id} used in other collections, keeping in main services table`);
          }
        }
      } catch (error) {
        console.error('Error handling main services deletion:', error);
        // Don't throw, we completed the collection_services deletion
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionServices', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // Also invalidate the services query
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    },
  });

  const deleteAllServicesInCollection = useMutation({
    mutationFn: async () => {
      if (!collectionId) throw new Error('No collection ID provided');
      
      const { error } = await supabase
        .from('collection_services')
        .delete()
        .eq('collection_id', collectionId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionServices', collectionId] });
      toast.success('All services in collection deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete services in collection');
      console.error('Error deleting services in collection:', error);
    },
  });

  const getService = (id: string) => {
    return collectionServices?.find(s => s.id === id);
  };

  return {
    collectionServices,
    isLoading,
    refetch,
    getService,
    createService: createService.mutate,
    updateService: updateService.mutate,
    deleteService: deleteService.mutate,
    deleteAllServicesInCollection: deleteAllServicesInCollection.mutate,
  };
} 