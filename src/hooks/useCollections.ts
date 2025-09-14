import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

// Define collection type
interface Collection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export function useCollections() {
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        console.log('Fetching collections from Supabase...');
        const { data, error } = await supabase
          .from('product_collections')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          console.log('No collections found in Supabase');
          return [];
        }

        console.log(`Found ${data.length} collections`);
        return data as Collection[];
      } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
      }
    },
  });

  const getCollection = (id: string) => {
    return collections?.find(c => c.id === id);
  };

  return {
    collections,
    isLoading,
    getCollection,
  };
}
