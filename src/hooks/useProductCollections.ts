import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import type { ProductCollection } from '../models/productTypes';
import { supabase } from '../lib/supabase';

export function useProductCollections() {
  const queryClient = useQueryClient();

  const { data: productCollections, isLoading } = useQuery({
    queryKey: ['productCollections'],
    queryFn: async () => {
      try {
        console.log('Fetching product collections from database...');
        // Fetch product collections from Supabase
        const { data: collectionsData, error } = await supabase
          .from('product_collections')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching product collections:', error);
          throw error;
        }

        if (collectionsData && collectionsData.length > 0) {
          console.log(
            'Product collections data fetched successfully:',
            collectionsData.length
          );
          return collectionsData as ProductCollection[];
        } else {
          console.warn('No product collections found in the database.');
          return [] as ProductCollection[];
        }
      } catch (error) {
        console.error('Error in product collections hook:', error);
        return [] as ProductCollection[];
      }
    },
  });

  const createProductCollection = useMutation({
    mutationFn: async (
      newCollection: Omit<ProductCollection, 'id' | 'created_at'>
    ) => {
      const collectionId = uuidv4();
      const collection = {
        id: collectionId,
        created_at: new Date().toISOString(),
        ...newCollection,
      };

      const { data, error } = await supabase
        .from('product_collections')
        .insert(collection)
        .select();

      if (error) throw error;
      return data[0] as ProductCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCollections'] });
      toast.success('Product collection added successfully');
    },
    onError: error => {
      toast.error('Failed to add product collection');
      console.error('Error adding product collection:', error);
    },
  });

  const updateProductCollection = useMutation({
    mutationFn: async (
      updates: Partial<ProductCollection> & { id: string }
    ) => {
      const { data, error } = await supabase
        .from('product_collections')
        .update(updates)
        .eq('id', updates.id)
        .select();

      if (error) throw error;
      return data[0] as ProductCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCollections'] });
      toast.success('Product collection updated successfully');
    },
    onError: error => {
      toast.error('Failed to update product collection');
      console.error('Error updating product collection:', error);
    },
  });

  const deleteProductCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCollections'] });
      queryClient.invalidateQueries({ queryKey: ['collectionProducts'] });
      toast.success('Product collection deleted successfully');
    },
    onError: error => {
      toast.error('Failed to delete product collection');
      console.error('Error deleting product collection:', error);
    },
  });

  const getProductCollection = (id: string) => {
    return productCollections?.find(c => c.id === id);
  };

  return {
    productCollections,
    isLoading,
    getProductCollection,
    createProductCollection: createProductCollection.mutate,
    updateProductCollection: updateProductCollection.mutate,
    deleteProductCollection: deleteProductCollection.mutate,
  };
}
