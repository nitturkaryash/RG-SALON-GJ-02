import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../utils/supabase/supabaseClient.js'

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
            type: service.type,
            active: service.active,
            collection_id: service.collection_id,
            subcollection_id: service.subcollection_id,
            gender: service.gender,
            membership_eligible: service.membership_eligible ?? true,
            created_at: service.created_at,
            updated_at: service.updated_at
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

  return {
    services,
    isLoading,
  }
} 