import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';

// Interface for sales history data
export interface SalesHistoryItem {
  id: string;
  created_at: string;
  product_id: string;
  product_name: string;
  hsn_code: string;
  unit: string;
  quantity: number;
  price_excl_gst: number;
  gst_percentage: number;
  discount_percentage: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_value: number;
  customer_name: string;
  stylist_name: string;
  payment_method: string;
  invoice_number: string;
  is_salon_consumption: boolean;
  notes?: string;
}

export const useSalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First check if simplified_sales_history exists
      const { count: checkCount, error: checkError } = await supabase
        .from('simplified_sales_history')
        .select('*', { count: 'exact', head: true });

      console.log('[HOOK DEBUG] Table check:', { count: checkCount, error: checkError });

      if (checkError) {
        console.log('[HOOK DEBUG] Falling back to direct sales query');
        // Fallback to sales table
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            products(*)
          `)
          .order('created_at', { ascending: false });

        if (salesError) {
          throw handleSupabaseError(salesError);
        }

        // Transform data to match our SalesHistoryItem interface
        const transformedData: SalesHistoryItem[] = (salesData || []).map(item => {
          return {
            id: item.id,
            created_at: item.created_at,
            product_id: item.product_id,
            product_name: item.products?.name || 'Unknown Product',
            hsn_code: item.products?.hsn_code || '',
            unit: item.products?.units || '',
            quantity: item.quantity || 0,
            price_excl_gst: item.price_excl_gst || 0,
            gst_percentage: item.gst_percentage || 0,
            discount_percentage: item.discount_percentage || 0,
            taxable_value: item.taxable_value || 0,
            cgst: item.cgst || 0,
            sgst: item.sgst || 0,
            igst: item.igst || 0,
            total_value: item.total_value || 0,
            customer_name: item.customer_name || 'Walk-in Customer',
            stylist_name: item.stylist_name || 'Self Service',
            payment_method: item.payment_method || 'Cash',
            invoice_number: item.invoice_number || '',
            is_salon_consumption: item.is_salon_consumption || false,
            notes: item.notes
          };
        });

        setSalesHistory(transformedData);
        return transformedData;
      } else {
        // Use simplified_sales_history table
        const { data, error: fetchError } = await supabase
          .from('simplified_sales_history')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw handleSupabaseError(fetchError);
        }

        // Create event to notify about sales data being loaded
        const dataLoadedEvent = new CustomEvent('sales-history-loaded', { 
          detail: { count: data?.length || 0 } 
        });
        window.dispatchEvent(dataLoadedEvent);

        // Map fields to match our interface
        const transformedData: SalesHistoryItem[] = (data || []).map(item => ({
          id: item.id,
          created_at: item.created_at,
          product_id: item.product_id || '',
          product_name: item.product_name,
          hsn_code: item.hsn_code || '',
          unit: item.unit || '',
          quantity: item.quantity || 0,
          price_excl_gst: item.price || 0,
          gst_percentage: item.gst_percentage || 0,
          discount_percentage: item.discount_percentage || 0,
          taxable_value: item.price || 0,
          cgst: (item.tax_amount || 0) / 2,
          sgst: (item.tax_amount || 0) / 2,
          igst: 0,
          total_value: item.total_amount || 0,
          customer_name: item.customer_name || 'Walk-in Customer',
          stylist_name: item.stylist_name || '',
          payment_method: item.payment_method || 'Cash',
          invoice_number: item.invoice_number || '',
          is_salon_consumption: false,
          notes: item.notes
        }));

        setSalesHistory(transformedData);
        return transformedData;
      }
    } catch (err) {
      console.error('Error fetching sales history:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sales history. Please try again.';
      setError(errorMessage);
      setSalesHistory([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch sales history when the hook is first used
  useEffect(() => {
    fetchSalesHistory();

    // Listen for refresh requests
    const handleRefreshRequest = () => {
      console.log('[HOOK] Received refresh request for sales history');
      fetchSalesHistory();
    };

    window.addEventListener('refresh-sales-history', handleRefreshRequest);
    
    return () => {
      window.removeEventListener('refresh-sales-history', handleRefreshRequest);
    };
  }, [fetchSalesHistory]);

  return {
    salesHistory,
    isLoading,
    error,
    fetchSalesHistory,
  };
}; 