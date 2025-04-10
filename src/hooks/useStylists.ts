import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'

// Define break interface
export interface StylistBreak {
  id: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  reason?: string;
}

export interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  available: boolean;
  imageUrl?: string;
  email?: string;
  phone?: string;
  breaks?: StylistBreak[]; // Add breaks array to stylist
}

export function useStylists() {
  const queryClient = useQueryClient()

  const { data: stylists, isLoading } = useQuery({
    queryKey: ['stylists'],
    queryFn: async () => {
      try {
        console.log('Fetching stylists from database...');
        // Fetch stylists from Supabase
        const { data: stylistsData, error } = await supabase
          .from('stylists')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching stylists:', error);
          throw error;
        }

        if (stylistsData && stylistsData.length > 0) {
          console.log('Stylists data fetched successfully:', stylistsData.length);
          
          // Process the data to ensure it matches our expected format
          // Convert snake_case database fields to camelCase for JavaScript
          return stylistsData.map(stylist => ({
            id: stylist.id,
            name: stylist.name,
            specialties: stylist.specialties || [],
            bio: stylist.bio || '',
            gender: stylist.gender || 'other',
            available: stylist.available !== false, // Default to true if not specified
            imageUrl: stylist.image_url || '', // Convert snake_case to camelCase
            email: stylist.email || '',
            phone: stylist.phone || '',
            breaks: stylist.breaks || []
          })) as Stylist[];
        } else {
          console.warn('No stylists found in the database.');
          return [] as Stylist[];
        }
      } catch (error) {
        console.error('Error in stylists hook:', error);
        return [] as Stylist[];
      }
    },
  });

  const createStylist = useMutation({
    mutationFn: async (newStylist: Omit<Stylist, 'id'>) => {
      const stylistId = uuidv4();
      
      // Ensure specialties is an array
      if (!Array.isArray(newStylist.specialties)) {
        newStylist.specialties = [];
      }
      
      // Create stylist object with snake_case field names for database
      const stylist = {
        id: stylistId,
        name: newStylist.name,
        specialties: newStylist.specialties || [],
        bio: newStylist.bio || '',
        gender: newStylist.gender || 'other',
        available: newStylist.available,
        image_url: newStylist.imageUrl || '', // Convert camelCase to snake_case
        email: newStylist.email || '',
        phone: newStylist.phone || '',
        breaks: newStylist.breaks || [],
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('stylists')
        .insert(stylist)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Convert snake_case back to camelCase for returned data
      if (data && data[0]) {
        return {
          ...data[0],
          imageUrl: data[0].image_url
        } as Stylist;
      }
      
      return stylist as unknown as Stylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast.success('Stylist added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add stylist');
      console.error('Error adding stylist:', error);
    },
  });

  const updateStylist = useMutation({
    mutationFn: async (updates: Partial<Stylist> & { id: string }) => {
      // Convert camelCase to snake_case for database update
      const processedUpdates: any = {
        id: updates.id,
        name: updates.name,
        bio: updates.bio,
        gender: updates.gender,
        available: updates.available,
        email: updates.email,
        phone: updates.phone,
        specialties: updates.specialties,
      };
      
      // Handle camelCase to snake_case conversions
      if (updates.imageUrl !== undefined) {
        processedUpdates.image_url = updates.imageUrl;
      }
      
      // If breaks are provided, ensure they are properly formatted
      if (updates.breaks) {
        // Validate each break to ensure dates are properly formatted
        processedUpdates.breaks = updates.breaks.map(breakItem => {
          // Ensure startTime and endTime are valid ISO strings
          let startTime = breakItem.startTime;
          let endTime = breakItem.endTime;
          
          // If they're not valid ISO strings, try to fix them
          if (!(typeof startTime === 'string' && startTime.includes('T'))) {
            try {
              startTime = new Date(startTime).toISOString();
            } catch (e) {
              console.error('Invalid start time:', startTime, e);
            }
          }
          
          if (!(typeof endTime === 'string' && endTime.includes('T'))) {
            try {
              endTime = new Date(endTime).toISOString();
            } catch (e) {
              console.error('Invalid end time:', endTime, e);
            }
          }
          
          return {
            ...breakItem,
            startTime,
            endTime
          };
        });
      }
      
      const { data, error } = await supabase
        .from('stylists')
        .update(processedUpdates)
        .eq('id', updates.id)
        .select();
      
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Convert snake_case back to camelCase for returned data
      if (data && data[0]) {
        return {
          ...data[0],
          imageUrl: data[0].image_url
        } as Stylist;
      }
      
      return updates as Stylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast.success('Stylist updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update stylist');
      console.error('Error updating stylist:', error);
    },
  });

  const deleteStylist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stylists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast.success('Stylist deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete stylist');
      console.error('Error deleting stylist:', error);
    },
  });

  return {
    stylists,
    isLoading,
    createStylist: createStylist.mutate,
    updateStylist: updateStylist.mutate,
    deleteStylist: deleteStylist.mutate,
  };
} 