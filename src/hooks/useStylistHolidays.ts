import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../utils/supabase/supabaseClient.js'
import { format } from 'date-fns'

export interface StylistHoliday {
  id: string;
  stylist_id: string;
  holiday_date: string; // ISO date string (just the date part)
  reason?: string;   // Reason for holiday
}

export function useStylistHolidays() {
  const queryClient = useQueryClient()

  // Create the stylist_holidays table if it doesn't exist
  const createTableIfNotExists = async () => {
    try {
      // Using Supabase SQL to create the table
      const { error } = await supabase.rpc('create_stylist_holidays_table');
      
      if (error) {
        console.error('Error creating stylist_holidays table:', error);
      } else {
        console.log('Stylist holidays table check completed');
      }
    } catch (error) {
      console.error('Error in creating stylist_holidays table:', error);
    }
  };

  // Call this when the hook is first used
  createTableIfNotExists();

  // Fetch all holidays
  const { data: holidays, isLoading } = useQuery({
    queryKey: ['stylist_holidays'],
    queryFn: async () => {
      try {
        console.log('Fetching stylist holidays from database...');
        
        // Fetch holidays from Supabase
        const { data: holidaysData, error } = await supabase
          .from('stylist_holidays')
          .select('*')
          .order('holiday_date', { ascending: true });

        if (error) {
          console.error('Error fetching stylist holidays:', error);
          throw error;
        }

        if (holidaysData && holidaysData.length > 0) {
          console.log('Stylist holidays data fetched successfully:', holidaysData.length);
          return holidaysData as StylistHoliday[];
        } else {
          console.warn('No stylist holidays found in the database.');
          return [] as StylistHoliday[];
        }
      } catch (error) {
        console.error('Error in stylist holidays hook:', error);
        return [] as StylistHoliday[];
      }
    },
  });

  // Fetch holidays for a specific stylist
  const getStylistHolidays = async (stylistId: string) => {
    try {
      const { data, error } = await supabase
        .from('stylist_holidays')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('holiday_date', { ascending: true });

      if (error) {
        console.error('Error fetching holidays for stylist:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStylistHolidays:', error);
      return [];
    }
  };

  // Add a new holiday for a stylist
  const addHoliday = useMutation({
    mutationFn: async ({ 
      stylistId, 
      holidayDate, 
      reason 
    }: { 
      stylistId: string; 
      holidayDate: Date | string; 
      reason?: string;
    }) => {
      try {
        // Format the date to YYYY-MM-DD format
        const formattedDate = typeof holidayDate === 'string' 
          ? holidayDate 
          : format(holidayDate, 'yyyy-MM-dd');
        
        // Create the holiday entry
        const holidayId = uuidv4();
        const holidayEntry = {
          id: holidayId,
          stylist_id: stylistId,
          holiday_date: formattedDate,
          reason: reason || ''
        };
        
        // Insert the holiday
        const { data, error } = await supabase
          .from('stylist_holidays')
          .insert(holidayEntry)
          .select();
          
        if (error) {
          console.error('Error adding stylist holiday:', error);
          throw error;
        }
        
        // Update stylist availability if the holiday is for today
        const today = format(new Date(), 'yyyy-MM-dd');
        if (formattedDate === today) {
          await updateStylistAvailability();
        }
        
        return data ? data[0] : holidayEntry;
      } catch (error) {
        console.error('Error in addHoliday:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] });
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast.success('Holiday added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add holiday');
      console.error('Error adding holiday:', error);
    },
  });

  // Delete a holiday
  const deleteHoliday = useMutation({
    mutationFn: async (holidayId: string) => {
      try {
        // Get the holiday date before deleting
        const { data: holidayData } = await supabase
          .from('stylist_holidays')
          .select('holiday_date')
          .eq('id', holidayId)
          .single();

        // Delete the holiday
        const { error } = await supabase
          .from('stylist_holidays')
          .delete()
          .eq('id', holidayId);
          
        if (error) {
          console.error('Error deleting stylist holiday:', error);
          throw error;
        }
        
        // Update stylist availability if the holiday was for today
        if (holidayData && format(new Date(holidayData.holiday_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
          await updateStylistAvailability();
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error in deleteHoliday:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] });
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast.success('Holiday removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove holiday');
      console.error('Error removing holiday:', error);
    },
  });

  // Update a holiday
  const updateHoliday = useMutation({
    mutationFn: async ({ 
      holidayId, 
      holidayDate, 
      reason 
    }: { 
      holidayId: string; 
      holidayDate?: Date | string; 
      reason?: string;
    }) => {
      try {
        // Get the old holiday data
        const { data: oldHolidayData } = await supabase
          .from('stylist_holidays')
          .select('holiday_date')
          .eq('id', holidayId)
          .single();
        
        const oldDate = oldHolidayData?.holiday_date;
        
        // Prepare updates
        const updates: { holiday_date?: string; reason?: string } = {};
        
        if (holidayDate) {
          updates.holiday_date = typeof holidayDate === 'string' 
            ? holidayDate 
            : format(holidayDate, 'yyyy-MM-dd');
        }
        
        if (reason !== undefined) {
          updates.reason = reason;
        }
        
        // Update the holiday
        const { data, error } = await supabase
          .from('stylist_holidays')
          .update(updates)
          .eq('id', holidayId)
          .select();
          
        if (error) {
          console.error('Error updating stylist holiday:', error);
          throw error;
        }
        
        // Update availability if needed
        const today = format(new Date(), 'yyyy-MM-dd');
        if (oldDate === today || (updates.holiday_date && updates.holiday_date === today)) {
          await updateStylistAvailability();
        }
        
        return data ? data[0] : { id: holidayId, ...updates };
      } catch (error) {
        console.error('Error in updateHoliday:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] });
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast.success('Holiday updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update holiday');
      console.error('Error updating holiday:', error);
    },
  });

  // Update stylist availability based on holidays
  const updateStylistAvailability = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Update stylists who have holidays today to be unavailable
      const { error: errorUnavailable } = await supabase.rpc('update_stylists_on_holiday');
      
      if (errorUnavailable) {
        console.error('Error updating stylists on holiday:', errorUnavailable);
      }
      
      // Optionally, reset stylists who don't have holidays today back to available
      // This is commented out as it might override manual availability settings
      // But you can uncomment it if you want automatic availability resets
      /*
      const { error: errorAvailable } = await supabase.rpc('reset_stylists_not_on_holiday');
      
      if (errorAvailable) {
        console.error('Error resetting stylists not on holiday:', errorAvailable);
      }
      */
      
      // Refresh stylists data
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      
    } catch (error) {
      console.error('Error in updateStylistAvailability:', error);
    }
  };

  // Check if a stylist is on holiday for a specific date
  const isStylistOnHoliday = async (stylistId: string, date?: Date) => {
    try {
      const checkDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('stylist_holidays')
        .select('id')
        .eq('stylist_id', stylistId)
        .eq('holiday_date', checkDate);
        
      if (error) {
        console.error('Error checking if stylist is on holiday:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error in isStylistOnHoliday:', error);
      return false;
    }
  };

  return {
    holidays,
    isLoading,
    getStylistHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    updateStylistAvailability,
    isStylistOnHoliday
  };
} 