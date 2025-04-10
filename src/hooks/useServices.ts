import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  active?: boolean;
}

export function useServices() {
  const queryClient = useQueryClient()

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        console.log('Fetching services from database...');
        // Fetch services from Supabase
        const { data: servicesData, error } = await supabase
          .from('services')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching services:', error);
          throw error;
        }

        if (servicesData && servicesData.length > 0) {
          console.log('Services data fetched successfully:', servicesData.length);
          return servicesData.map(service => ({
            id: service.id || uuidv4(),
            name: service.name,
            description: service.description || '',
            duration: service.duration || 30,
            price: service.price || 0,
            // Only include category if it exists in the database response
            ...(service.hasOwnProperty('category') ? { category: service.category } : {})
          })) as Service[];
        } else {
          console.warn('No services found in the database.');
          // Return an empty array instead of mock data
          return [] as Service[];
        }
      } catch (error) {
        console.error('Error in services hook:', error);
        // Return an empty array instead of mock data
        return [] as Service[];
      }
    },
  })

  const createService = useMutation({
    mutationFn: async (newService: Omit<Service, 'id'>) => {
      const serviceId = uuidv4();
      const service = {
        id: serviceId,
        name: newService.name,
        description: newService.description || '',
        duration: newService.duration,
        price: newService.price,
        category: newService.category || ''
        // Omit active field to avoid schema conflicts
      };
      
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select();
      
      if (error) throw error;
      return data[0] as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create service');
      console.error('Error creating service:', error);
    },
  })

  const updateService = useMutation({
    mutationFn: async (updates: Partial<Service> & { id: string }) => {
      // Create a new object without the active property if it exists
      // to avoid conflicts with the database schema
      const { active, ...serviceUpdates } = updates;
      
      const { data, error } = await supabase
        .from('services')
        .update(serviceUpdates)
        .eq('id', updates.id)
        .select();
      
      if (error) throw error;
      return data[0] as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update service');
      console.error('Error updating service:', error);
    },
  })

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    },
  })

  return {
    services,
    isLoading,
    createService: createService.mutate,
    updateService: updateService.mutate,
    deleteService: deleteService.mutate,
  }
} 