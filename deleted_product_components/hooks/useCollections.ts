import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '../models/inventoryTypes'
import { supabase } from '../lib/supabase'

export function useCollections() {
  const queryClient = useQueryClient()

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        console.log('Fetching collections from database...');
        // Fetch collections from Supabase
        const { data: collectionsData, error } = await supabase
          .from('collections')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching collections:', error);
          throw error;
        }

        if (collectionsData && collectionsData.length > 0) {
          console.log('Collections data fetched successfully:', collectionsData.length);
          return collectionsData as Collection[];
        } else {
          console.warn('No collections found in the database.');
          return [] as Collection[];
        }
      } catch (error) {
        console.error('Error in collections hook:', error);
        return [] as Collection[];
      }
    },
  });

  const createCollection = useMutation({
    mutationFn: async (newCollection: Omit<Collection, 'id' | 'created_at'>) => {
      const collectionId = uuidv4();
      const collection = {
        id: collectionId,
        created_at: new Date().toISOString(),
        ...newCollection
      };
      
      const { data, error } = await supabase
        .from('collections')
        .insert(collection)
        .select();
      
      if (error) throw error;
      return data[0] as Collection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add collection');
      console.error('Error adding collection:', error);
    },
  });

  const updateCollection = useMutation({
    mutationFn: async (updates: Partial<Collection> & { id: string }) => {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', updates.id)
        .select();
      
      if (error) throw error;
      return data[0] as Collection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update collection');
      console.error('Error updating collection:', error);
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete collection');
      console.error('Error deleting collection:', error);
    },
  });

  const getCollection = (id: string) => {
    return collections?.find(c => c.id === id);
  };

  return {
    collections,
    isLoading,
    getCollection,
    createCollection: createCollection.mutate,
    updateCollection: updateCollection.mutate,
    deleteCollection: deleteCollection.mutate,
  };
} 