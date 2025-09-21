import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// Combined type for a unified history view
export interface PaymentHistoryEntry {
  id: string;
  created_at: string;
  type: 'Bill Paid' | 'Payment Received';
  amount: number;
  payment_method: string;
  details: string; // A summary of the transaction
  payment_received_date?: string; // For pending payments, this shows when payment was actually received
  pending_payment_receiving_date?: string; // Expected date when pending payment will be received
}

export function useClientPaymentHistory(clientId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clientPaymentHistory', clientId],
    queryFn: async (): Promise<PaymentHistoryEntry[]> => {
      if (!clientId) {
        return [];
      }

      // Fetch regular orders with payments data
      const { data: orders, error: ordersError } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      // Fetch client data to get pending payment receiving date
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('pending_payment_receiving_date')
        .eq('id', clientId)
        .single();

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw new Error('Failed to fetch order history');
      }

      // Fetch pending payment clearances
      const { data: pendingPayments, error: pendingPaymentsError } =
        await supabase
          .from('pending_payment_history')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

      if (pendingPaymentsError) {
        console.error(
          'Error fetching pending payments history:',
          pendingPaymentsError
        );
        throw new Error('Failed to fetch pending payment history');
      }

      // Combine and transform the data into a unified format
      const combinedHistory: PaymentHistoryEntry[] = [];

      if (orders) {
        orders.forEach(order => {
          // Only include orders that are NOT pending payments (i.e., already paid)
          if (order.payment_method !== 'pending_payment') {
            // Check if services is an array before mapping
            const items = Array.isArray(order.services)
              ? order.services
                  .map(
                    (s: any) =>
                      `${s.name || s.service_name} (x${s.quantity || 1})`
                  )
                  .join(', ')
              : 'N/A';

            // Handle payment method display
            let paymentMethods = 'cash'; // default

            if (Array.isArray(order.payments) && order.payments.length > 0) {
              // If there are individual payment details, use those
              paymentMethods = order.payments
                .map((p: any) => `${p.payment_method || 'cash'}: ₹${p.amount}`)
                .join(', ');
            } else if (
              order.payment_method &&
              order.payment_method !== 'undefined'
            ) {
              // Use the main payment method from the order
              if (order.payment_method === 'split') {
                paymentMethods = 'Multiple methods';
              } else {
                paymentMethods = order.payment_method;
              }
            } else {
              // Fallback for undefined or null payment methods
              paymentMethods = 'cash';
            }

            combinedHistory.push({
              id: order.id,
              created_at: order.created_at,
              type: 'Bill Paid',
              amount: order.total,
              payment_method: paymentMethods,
              details: items,
              pending_payment_receiving_date:
                clientData?.pending_payment_receiving_date,
            });
          }
        });
      }

      if (pendingPayments) {
        pendingPayments.forEach(payment => {
          combinedHistory.push({
            id: payment.id,
            created_at: payment.created_at,
            type: 'Payment Received',
            amount: payment.amount_paid,
            payment_method: payment.payment_method,
            details: 'Pending payment cleared',
            payment_received_date: payment.created_at, // Use created_at as payment received date
            pending_payment_receiving_date:
              clientData?.pending_payment_receiving_date,
          });
        });
      }

      // Sort by date, most recent first
      return combinedHistory.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!clientId, // Only run the query if a clientId is provided
  });

  return {
    history: data || [],
    isLoading,
    error: error as Error | null,
  };
}
