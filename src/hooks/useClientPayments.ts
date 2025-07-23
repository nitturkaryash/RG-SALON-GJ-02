
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase/supabaseClient';

export interface ClientPayment {
  id: string;
  created_at: string;
  total: number;
  payment_method: 'sale' | 'pending_payment';
  payments: { method: string; amount: number }[];
  services: { name: string; price: number; quantity: number }[];
  products: { name: string; price: number; quantity: number }[];
  notes?: string;
}

export function useClientPayments(clientId: string | null) {
  const { data, isLoading, error } = useQuery<ClientPayment[], Error>({
    queryKey: ['clientPayments', clientId],
    queryFn: async () => {
      if (!clientId) {
        return [];
      }
      const { data, error } = await supabase
        .from('pos_orders')
        .select(`
          id,
          created_at,
          total,
          payment_method,
          payments,
          services
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ClientPayment[];
    },
  });
  return { data, isLoading, error };
}