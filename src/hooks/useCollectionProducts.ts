import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import type { Product } from '../models/productTypes'
import { supabase } from '../utils/supabase/supabaseClient.js'

export function useCollectionProducts(collectionId?: string) {
  const queryClient = useQueryClient()

  const { data: collectionProducts, isLoading } = useQuery({
    queryKey: ['collectionProducts', collectionId],
    queryFn: async () => {
      try {
        if (!collectionId) {
          console.log('No collection ID provided, fetching all products');
          const { data: productsData, error } = await supabase
            .from('collection_products')
            .select('*')
            .order('name', { ascending: true });

          if (error) {
            console.error('Error fetching all products:', error);
            throw error;
          }

          return productsData as Product[];
        } 
        
        console.log(`Fetching products for collection ID: ${collectionId}`);
        const { data: productsData, error } = await supabase
          .from('collection_products')
          .select('*')
          .eq('collection_id', collectionId)
          .order('name', { ascending: true });

        if (error) {
          console.error(`Error fetching products for collection ${collectionId}:`, error);
          throw error;
        }

        if (productsData && productsData.length > 0) {
          console.log(`Found ${productsData.length} products for collection ${collectionId}`);
          return productsData as Product[];
        } else {
          console.warn(`No products found for collection ${collectionId}`);
          return [] as Product[];
        }
      } catch (error) {
        console.error('Error in collection products hook:', error);
        return [] as Product[];
      }
    },
    enabled: !!collectionId,
  });

  const createProduct = useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id' | 'created_at'>) => {
      const productId = uuidv4();
      const product = {
        id: productId,
        created_at: new Date().toISOString(),
        ...newProduct
      };
      
      const { data, error } = await supabase
        .from('collection_products')
        .insert(product)
        .select();
      
      if (error) throw error;
      return data[0] as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionProducts', collectionId] });
      toast.success('Product added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add product');
      console.error('Error adding product:', error);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (updates: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('collection_products')
        .update(updates)
        .eq('id', updates.id)
        .select();
      
      if (error) throw error;
      return data[0] as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionProducts', collectionId] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collection_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionProducts', collectionId] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    },
  });

  const deleteAllProductsInCollection = useMutation({
    mutationFn: async () => {
      if (!collectionId) throw new Error('No collection ID provided');
      
      const { error } = await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', collectionId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionProducts', collectionId] });
      toast.success('All products in collection deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete products in collection');
      console.error('Error deleting products in collection:', error);
    },
  });

  const getProduct = (id: string) => {
    return collectionProducts?.find(p => p.id === id);
  };

  return {
    collectionProducts,
    isLoading,
    getProduct,
    createProduct: createProduct.mutate,
    updateProduct: updateProduct.mutate,
    deleteProduct: deleteProduct.mutate,
    deleteAllProductsInCollection: deleteAllProductsInCollection.mutate,
  };
} 