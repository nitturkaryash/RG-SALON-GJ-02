import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { MembershipTier } from '../types/membershipTier';
import { supabase } from '../utils/supabase/supabaseClient';

export function useMembershipTiers() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiersFromSupabase = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('membership_tiers')
          .select('*');

        if (supabaseError) {
          console.error('Error fetching membership tiers from Supabase:', supabaseError);
          toast.error(`Failed to load membership tiers: ${supabaseError.message}`);
          setError(supabaseError.message);
          setTiers([]);
        } else if (data) {
          const fetchedTiers: MembershipTier[] = data.map(tier => ({
            id: tier.id,
            name: tier.name,
            price: tier.price,
            duration_months: tier.duration_months,
            benefits: tier.benefits || [],
            description: tier.description || ''
          }));
          setTiers(fetchedTiers);
          console.log('Fetched membership tiers from Supabase:', fetchedTiers);
        } else {
          setTiers([]);
        }
      } catch (e) {
        console.error('Unexpected error fetching membership tiers:', e);
        toast.error('An unexpected error occurred while loading membership tiers.');
        setError(e instanceof Error ? e.message : 'Unknown error');
        setTiers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiersFromSupabase();
  }, []);

  const createTier = async (newTierData: Omit<MembershipTier, 'id'>) => {
    const newTierRecord = { ...newTierData, id: uuidv4() };
    
    setIsLoading(true);
    const { data, error: supabaseError } = await supabase
      .from('membership_tiers')
      .insert(newTierRecord)
      .select()
      .single();

    setIsLoading(false);

    if (supabaseError) {
      console.error('Error creating membership tier in Supabase:', supabaseError);
      toast.error(`Failed to create membership tier: ${supabaseError.message}`);
      return null;
    }

    if (data) {
      const createdTier: MembershipTier = {
        id: data.id,
        name: data.name,
        price: data.price,
        duration_months: data.duration_months,
        benefits: data.benefits || [],
        description: data.description || ''
      };
      setTiers(prevTiers => [...prevTiers, createdTier]);
      toast.success('Membership tier added successfully');
      return createdTier;
    }
    return null;
  };

  const updateTier = async (tierId: string, updates: Partial<Omit<MembershipTier, 'id'>>) => {
    setIsLoading(true);
    const { data, error: supabaseError } = await supabase
      .from('membership_tiers')
      .update(updates)
      .eq('id', tierId)
      .select()
      .single();
    
    setIsLoading(false);

    if (supabaseError) {
      console.error('Error updating membership tier in Supabase:', supabaseError);
      toast.error(`Failed to update membership tier: ${supabaseError.message}`);
      return null;
    }
    
    if (data) {
      const updatedTier: MembershipTier = {
        id: data.id,
        name: data.name,
        price: data.price,
        duration_months: data.duration_months,
        benefits: data.benefits || [],
        description: data.description || ''
      };
      setTiers(prevTiers => prevTiers.map(t => t.id === tierId ? updatedTier : t));
      toast.success('Membership tier updated successfully');
      return updatedTier;
    }
    return null;
  };

  const deleteTier = async (tierId: string) => {
    setIsLoading(true);
    const { error: supabaseError } = await supabase
      .from('membership_tiers')
      .delete()
      .eq('id', tierId);
    
    setIsLoading(false);

    if (supabaseError) {
      console.error('Error deleting membership tier in Supabase:', supabaseError);
      toast.error(`Failed to delete membership tier: ${supabaseError.message}`);
      return false;
    }

    setTiers(prevTiers => prevTiers.filter(t => t.id !== tierId));
    toast.success('Membership tier deleted successfully');
    return true;
  };

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
    createTier,
    updateTier,
    deleteTier,
    formatCurrency
  };
} 