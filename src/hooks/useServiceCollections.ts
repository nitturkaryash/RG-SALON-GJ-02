import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import type { ServiceCollection } from '../models/serviceTypes';
import { supabase } from '../lib/supabase';

export function useServiceCollections() {
  const queryClient = useQueryClient();

  const { data: serviceCollections, isLoading } = useQuery({
    queryKey: ['serviceCollections'],
    queryFn: async () => {
      try {
        console.log('Fetching service collections from Supabase...');
        const { data, error } = await supabase
          .from('service_collections')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          console.log('No service collections found in Supabase');
          return [];
        }

        console.log(`Found ${data.length} service collections`);
        return data as ServiceCollection[];
      } catch (error) {
        console.error('Error fetching service collections:', error);
        throw error;
      }
    },
  });

  const createServiceCollection = useMutation({
    mutationFn: async (
      newCollection: Omit<ServiceCollection, 'id' | 'created_at'>
    ) => {
      const collection = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        ...newCollection,
      };

      const { data, error } = await supabase
        .from('service_collections')
        .insert(collection)
        .select();

      if (error) {
        throw error;
      }

      return data[0] as ServiceCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCollections'] });
      toast.success('Service collection added successfully');
    },
    onError: error => {
      toast.error('Failed to add service collection');
      console.error('Error adding service collection:', error);
    },
  });

  const updateServiceCollection = useMutation({
    mutationFn: async (
      updates: Partial<ServiceCollection> & { id: string }
    ) => {
      const { id, ...collectionData } = updates;

      const { data, error } = await supabase
        .from('service_collections')
        .update(collectionData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Service collection not found');
      }

      return data[0] as ServiceCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCollections'] });
      toast.success('Service collection updated successfully');
    },
    onError: error => {
      toast.error('Failed to update service collection');
      console.error('Error updating service collection:', error);
    },
  });

  const deleteServiceCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_collections')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCollections'] });
      queryClient.invalidateQueries({ queryKey: ['collectionServices'] });
      toast.success('Service collection deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete service collection');
      console.error('Error deleting service collection:', error);
    },
  });

  const getServiceCollection = (id: string) => {
    return serviceCollections?.find(c => c.id === id);
  };

  return {
    serviceCollections,
    isLoading,
    getServiceCollection,
    createServiceCollection: createServiceCollection.mutate,
    updateServiceCollection: updateServiceCollection.mutate,
    deleteServiceCollection: deleteServiceCollection.mutate,
  };
}
