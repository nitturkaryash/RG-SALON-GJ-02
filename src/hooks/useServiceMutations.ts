import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../utils/supabase/supabaseClient';

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  type?: string;
  active?: boolean;
  collection_id?: string;
  subcollection_id?: string;
  gender?: string;
  membership_eligible?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useServiceMutations() {
  const queryClient = useQueryClient();

  const createService = useMutation({
    mutationFn: async (newService: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
      const serviceId = uuidv4();
      const service = {
        id: serviceId,
        ...newService,
        active: newService.active ?? true,
        membership_eligible: newService.membership_eligible ?? true,
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
      queryClient.invalidateQueries({ queryKey: ['subCollectionServices'] });
      toast.success('Service created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create service');
      console.error('Error creating service:', error);
    },
  });

  const updateService = useMutation({
    mutationFn: async (updates: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', updates.id)
        .select();
      
      if (error) throw error;
      return data[0] as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['subCollectionServices'] });
      toast.success('Service updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update service');
      console.error('Error updating service:', error);
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['subCollectionServices'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete service');
      console.error('Error deleting service:', error);
    },
  });

  return {
    createService: createService.mutate,
    updateService: updateService.mutate,
    deleteService: deleteService.mutate,
  };
} 