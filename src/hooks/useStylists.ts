import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../utils/supabase/supabaseClient.js'

// Define break interface
export interface StylistBreak {
  id: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  reason?: string;
}

// Define holiday interface
export interface StylistHoliday {
  id: string;
  date: string;      // ISO date string (just the date part)
  reason?: string;   // Reason for holiday
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
  holidays?: StylistHoliday[]; // Add holidays array to stylist
}

export function useStylists() {
  const queryClient = useQueryClient()

  const { data: stylists = [], isLoading } = useQuery({
    queryKey: ['stylists'],
    queryFn: async () => {
      // Fetch stylists
      const { data: stylistsData, error: stylistsError } = await supabase
        .from('stylists')
        .select('*');

      if (stylistsError) {
        throw stylistsError;
      }

      // Fetch breaks for all stylists
      const { data: breaksData, error: breaksError } = await supabase
        .from('breaks')
        .select('*');

      if (breaksError) {
        throw breaksError;
      }

      // Group breaks by stylist_id
      const breaksByStyleId = breaksData.reduce((acc: Record<string, any[]>, breakItem: any) => {
        if (!acc[breakItem.stylist_id]) {
          acc[breakItem.stylist_id] = [];
        }
        acc[breakItem.stylist_id].push({
          id: breakItem.id,
          startTime: breakItem.start_time,
          endTime: breakItem.end_time,
          reason: breakItem.description
        });
        return acc;
      }, {});

      // Combine stylists with their breaks
      return stylistsData.map((stylist: any) => ({
        ...stylist,
        imageUrl: stylist.image_url,
        breaks: breaksByStyleId[stylist.id] || []
      }));
    }
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
        holidays: newStylist.holidays || [],
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
      
      // If breaks are provided, update them in the breaks table
      if (updates.breaks) {
        // First, get existing breaks for this stylist
        const { data: existingBreaks, error: breaksError } = await supabase
          .from('breaks')
          .select('id')
          .eq('stylist_id', updates.id);
          
        if (breaksError) {
          throw new Error(`Failed to fetch existing breaks: ${breaksError.message}`);
        }
        
        // Delete all existing breaks for this stylist
        if (existingBreaks.length > 0) {
          const { error: deleteError } = await supabase
            .from('breaks')
            .delete()
            .eq('stylist_id', updates.id);
            
          if (deleteError) {
            throw new Error(`Failed to delete existing breaks: ${deleteError.message}`);
          }
        }
        
        // Insert new breaks
        if (updates.breaks.length > 0) {
          const { error: insertError } = await supabase
            .from('breaks')
            .insert(updates.breaks.map(breakItem => ({
              stylist_id: updates.id,
              start_time: breakItem.startTime,
              end_time: breakItem.endTime,
              description: breakItem.reason
            })));
            
          if (insertError) {
            throw new Error(`Failed to insert new breaks: ${insertError.message}`);
          }
        }
      }
      
      // Update the stylist record
      const { data, error } = await supabase
        .from('stylists')
        .update(processedUpdates)
        .eq('id', updates.id)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Fetch the updated breaks for this stylist
      const { data: updatedBreaks, error: breaksError } = await supabase
        .from('breaks')
        .select('*')
        .eq('stylist_id', updates.id);
        
      if (breaksError) {
        throw new Error(`Failed to fetch updated breaks: ${breaksError.message}`);
      }
      
      // Return the stylist with the updated breaks
      return {
        ...data[0],
        breaks: updatedBreaks.map(breakItem => ({
          id: breakItem.id,
          startTime: breakItem.start_time,
          endTime: breakItem.end_time,
          reason: breakItem.description
        }))
      };
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
      try {
        // First, check if stylist has any appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id')
          .eq('stylist_id', id);
          
        if (appointmentsError) {
          console.error('Error checking stylist appointments:', appointmentsError);
          throw appointmentsError;
        }
        
        // Check appointment_stylists table as well
        const { data: appointmentStylistsData, error: appointmentStylistsError } = await supabase
          .from('appointment_stylists')
          .select('id')
          .eq('stylist_id', id);
          
        if (appointmentStylistsError) {
          console.error('Error checking appointment_stylists:', appointmentStylistsError);
          throw appointmentStylistsError;
        }
        
        // If stylist has appointments, update them to set stylist_id to null
        if (appointmentsData && appointmentsData.length > 0) {
          const { error: updateError } = await supabase
            .from('appointments')
            .update({ stylist_id: null })
            .eq('stylist_id', id);
            
          if (updateError) {
            console.error('Error updating appointments:', updateError);
            throw updateError;
          }
        }
        
        // Delete entries from appointment_stylists
        if (appointmentStylistsData && appointmentStylistsData.length > 0) {
          const { error: deleteJoinError } = await supabase
            .from('appointment_stylists')
            .delete()
            .eq('stylist_id', id);
            
          if (deleteJoinError) {
            console.error('Error deleting from appointment_stylists:', deleteJoinError);
            throw deleteJoinError;
          }
        }
        
        // Finally delete the stylist
        const { error } = await supabase
          .from('stylists')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error in deleteStylist:', error);
        throw error;
      }
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