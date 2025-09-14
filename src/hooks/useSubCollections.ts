import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import type { ServiceSubCollection } from '../models/serviceTypes';
import { supabase } from '../lib/supabase';

export function useSubCollections(collectionId?: string) {
  const queryClient = useQueryClient();

  // Get current user's profile ID
  const getProfileId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (error || !profile) throw new Error('Could not get profile ID');
    return profile.id;
  };

  const { data: subCollections, isLoading } = useQuery({
    queryKey: ['subCollections', { collectionId }],
    queryFn: async () => {
      if (!collectionId) return [];
      const { data, error } = await supabase
        .from('service_subcollections')
        .select('*')
        .eq('collection_id', collectionId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ServiceSubCollection[];
    },
    enabled: !!collectionId,
  });

  const createSubCollection = useMutation({
    mutationFn: async (
      newSub: Omit<ServiceSubCollection, 'id' | 'created_at'>
    ) => {
      const profileId = await getProfileId();
      const subCollection = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        user_id: profileId,
        ...newSub,
      };
      const { data, error } = await supabase
        .from('service_subcollections')
        .insert(subCollection)
        .select();

      if (error) throw error;
      return data[0] as ServiceSubCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subCollections', { collectionId }],
      });
      toast.success('Sub-collection added successfully');
    },
    onError: error => {
      console.error('Error adding sub-collection:', error);
      toast.error('Failed to add sub-collection');
    },
  });

  const updateSubCollection = useMutation({
    mutationFn: async (
      updates: Partial<ServiceSubCollection> & { id: string }
    ) => {
      const { id, ...fields } = updates;
      const { data, error } = await supabase
        .from('service_subcollections')
        .update(fields)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as ServiceSubCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subCollections', { collectionId }],
      });
      toast.success('Sub-collection updated successfully');
    },
    onError: error => {
      console.error('Error updating sub-collection:', error);
      toast.error('Failed to update sub-collection');
    },
  });

  const deleteSubCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_subcollections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subCollections', { collectionId }],
      });
      toast.success('Sub-collection deleted successfully');
    },
    onError: error => {
      console.error('Error deleting sub-collection:', error);
      toast.error('Failed to delete sub-collection');
    },
  });

  return {
    subCollections: subCollections || [],
    isLoading,
    createSubCollection: createSubCollection.mutate,
    updateSubCollection: updateSubCollection.mutate,
    deleteSubCollection: deleteSubCollection.mutate,
  };
}
