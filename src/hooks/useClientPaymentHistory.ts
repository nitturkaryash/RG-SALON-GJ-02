import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase/supabaseClient';

// Combined type for a unified history view
export interface PaymentHistoryEntry {
  id: string;
  created_at: string;
  type: 'Order' | 'Pending Payment';
  amount: number;
  payment_method: string;
  details: string; // A summary of the transaction
}

export function useClientPaymentHistory(clientId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clientPaymentHistory', clientId],
    queryFn: async (): Promise<PaymentHistoryEntry[]> => {
      if (!clientId) {
        return [];
      }

      // Fetch regular orders
      const { data: orders, error: ordersError } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw new Error('Failed to fetch order history');
      }

      // Fetch pending payment clearances
      const { data: pendingPayments, error: pendingPaymentsError } = await supabase
        .from('pending_payment_history')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (pendingPaymentsError) {
        console.error('Error fetching pending payments history:', pendingPaymentsError);
        throw new Error('Failed to fetch pending payment history');
      }
      
      // Combine and transform the data into a unified format
      const combinedHistory: PaymentHistoryEntry[] = [];

      if (orders) {
        orders.forEach(order => {
          // Check if services is an array before mapping
          const items = Array.isArray(order.services) 
            ? order.services.map(s => `${s.name || s.service_name} (x${s.quantity || 1})`).join(', ') 
            : 'N/A';
          
          const paymentMethods = Array.isArray(order.payments)
            ? order.payments.map(p => `${p.method}: ${p.amount}`).join(', ')
            : 'N/A';

          combinedHistory.push({
            id: order.id,
            created_at: order.created_at,
            type: order.payment_method === 'pending_payment' ? 'Pending Payment' : 'Order',
            amount: order.total,
            payment_method: paymentMethods,
            details: items
          });
        });
      }

      if (pendingPayments) {
        pendingPayments.forEach(payment => {
          combinedHistory.push({
            id: payment.id,
            created_at: payment.created_at,
            type: 'Pending Payment',
            amount: payment.amount_paid,
            payment_method: payment.payment_method,
            details: 'Clearance of pending balance'
          });
        });
      }

      // Sort by date, most recent first
      return combinedHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!clientId, // Only run the query if a clientId is provided
  });

  return {
    history: data || [],
    isLoading,
    error: error as Error | null,
  };
}
