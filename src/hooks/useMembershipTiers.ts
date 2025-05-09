import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { MembershipTier } from '../types/membershipTier';

// Initial demo data for membership tiers
const initialTiers: MembershipTier[] = [
  {
    id: '1',
    name: 'Gold',
    price: 2999,
    duration_months: 12,
    benefits: ['Priority booking', 'Exclusive workshops', '20% off all services'],
    description: 'Our premium Gold membership plan.'
  },
  {
    id: '2',
    name: 'Silver',
    price: 1999,
    duration_months: 12,
    benefits: ['Access to all standard services', 'Monthly newsletter', '10% off products'],
    description: 'Our popular Silver membership plan.'
  },
  {
    id: '3',
    name: 'Platinum',
    price: 4999,
    duration_months: 12,
    benefits: ['All Gold benefits', 'Personalized consultations', 'Free monthly premium service', 'Dedicated support line'],
    description: 'The ultimate Platinum experience with unparalleled benefits.'
  }
];

// Load tiers from localStorage (temporary until Supabase integration)
const loadTiersFromStorage = (): MembershipTier[] => {
  try {
    const storedTiers = localStorage.getItem('membershipTiers');
    
    if (storedTiers) {
      return JSON.parse(storedTiers);
    }
    
    // If no tiers found in localStorage, save the initial ones
    localStorage.setItem('membershipTiers', JSON.stringify(initialTiers));
    return initialTiers;
  } catch (error) {
    console.error('Error loading membership tiers from localStorage:', error);
    return initialTiers;
  }
};

// Save tiers to localStorage (temporary until Supabase integration)
const saveTiersToStorage = (tiers: MembershipTier[]) => {
  try {
    localStorage.setItem('membershipTiers', JSON.stringify(tiers));
  } catch (error) {
    console.error('Error saving membership tiers to localStorage:', error);
  }
};

export function useMembershipTiers() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tiers on init
  useEffect(() => {
    const loadedTiers = loadTiersFromStorage();
    setTiers(loadedTiers);
    setIsLoading(false);
  }, []);

  // Create a new membership tier
  const createTier = (newTier: Omit<MembershipTier, 'id'>) => {
    const tier: MembershipTier = {
      id: uuidv4(),
      ...newTier
    };

    const updatedTiers = [...tiers, tier];
    setTiers(updatedTiers);
    saveTiersToStorage(updatedTiers);
    toast.success('Membership tier added successfully');
    return tier;
  };

  // Update a membership tier
  const updateTier = (tierId: string, updates: Partial<Omit<MembershipTier, 'id'>>) => {
    const index = tiers.findIndex(t => t.id === tierId);
    
    if (index === -1) {
      toast.error('Membership tier not found');
      return null;
    }
    
    const updatedTiers = [...tiers];
    const updatedTier = {
      ...updatedTiers[index],
      ...updates
    };

    updatedTiers[index] = updatedTier;
    setTiers(updatedTiers);
    saveTiersToStorage(updatedTiers);
    toast.success('Membership tier updated successfully');
    return updatedTier;
  };

  // Delete a membership tier
  const deleteTier = (tierId: string) => {
    const updatedTiers = tiers.filter(t => t.id !== tierId);
    setTiers(updatedTiers);
    saveTiersToStorage(updatedTiers);
    toast.success('Membership tier deleted successfully');
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
    createTier,
    updateTier,
    deleteTier,
    formatCurrency
  };
} 