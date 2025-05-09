import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabase/supabaseClient';
import { MembershipTier } from '../types/membershipTier';

export function useMembershipTiersSupabase() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all membership tiers from Supabase
  const fetchTiers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .order('price', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setTiers(data as MembershipTier[]);
    } catch (err) {
      console.error('Error fetching membership tiers:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to load membership tiers');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tiers on initialization
  useEffect(() => {
    fetchTiers();
  }, []);

  // Create a new membership tier
  const createTier = async (newTier: Omit<MembershipTier, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('membership_tiers')
        .insert([newTier])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTiers(prevTiers => [...prevTiers, data as MembershipTier]);
      toast.success('Membership tier added successfully');
      return data as MembershipTier;
    } catch (err) {
      console.error('Error creating membership tier:', err);
      toast.error('Failed to create membership tier');
      return null;
    }
  };

  // Update an existing membership tier
  const updateTier = async (tierId: string, updates: Partial<Omit<MembershipTier, 'id'>>) => {
    try {
      const { data, error } = await supabase
        .from('membership_tiers')
        .update(updates)
        .eq('id', tierId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setTiers(prevTiers => 
        prevTiers.map(tier => 
          tier.id === tierId ? { ...tier, ...data } as MembershipTier : tier
        )
      );
      
      toast.success('Membership tier updated successfully');
      return data as MembershipTier;
    } catch (err) {
      console.error('Error updating membership tier:', err);
      toast.error('Failed to update membership tier');
      return null;
    }
  };

  // Delete a membership tier
  const deleteTier = async (tierId: string) => {
    try {
      const { error } = await supabase
        .from('membership_tiers')
        .delete()
        .eq('id', tierId);
      
      if (error) {
        throw error;
      }
      
      setTiers(prevTiers => prevTiers.filter(tier => tier.id !== tierId));
      toast.success('Membership tier deleted successfully');
    } catch (err) {
      console.error('Error deleting membership tier:', err);
      toast.error('Failed to delete membership tier');
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return {
    tiers,
    isLoading,
    error,
    fetchTiers,
    createTier,
    updateTier,
    deleteTier,
    formatCurrency
  };
} 