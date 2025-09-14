import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import type { ServiceItem } from '../models/serviceTypes';
import { supabase } from '../lib/supabase';

const fetchServices = async (
  collectionId?: string | null,
  subCollectionId?: string | null
): Promise<ServiceItem[]> => {
  // If no collection is selected yet, don't fetch anything.
  if (!collectionId) {
    return [];
  }

  let query = supabase.from('services').select('*');

  // Case 1: Fetch ALL services if 'All Collections' is selected.
  if (collectionId === 'all') {
    // The initial query is already correct, no extra filter needed.
  }
  // Case 2: A specific collection is selected.
  else {
    // Sub-case 2a: Fetch all services for the specific collection.
    if (subCollectionId === 'all') {
      query = query.eq('collection_id', collectionId);
    }
    // Sub-case 2b: Fetch services for a specific sub-collection.
    else if (subCollectionId) {
      query = query.eq('subcollection_id', subCollectionId);
    }
    // Sub-case 2c: A collection is selected, but no sub-collection yet. Return nothing.
    else {
      return [];
    }
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export function useSubCollectionServices(
  collectionId?: string,
  subCollectionId?: string
) {
  const queryClient = useQueryClient();

  return useQuery<ServiceItem[]>({
    queryKey: ['services', collectionId, subCollectionId],
    queryFn: () => fetchServices(collectionId, subCollectionId),
    enabled: !!collectionId, // Only run the query if a collectionId is present
    keepPreviousData: true,
  });
}
