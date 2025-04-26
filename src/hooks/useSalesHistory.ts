import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/supabaseClient';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';

interface SalesHistoryItem {
  id: string;
  created_at: string;
  product_name: string;
  hsn_code: string;
  unit: string;
  quantity: number;
  price_excl_gst: number;
  gst_percentage: number;
  discount_percentage: number;
  taxable_value: number;
  tax_amount: number;
  total_amount: number;
  customer_name: string;
  stylist_name: string;
  payment_method: string;
  invoice_number: string;
}

// Define the type for the sales_product_new view
interface SalesProductNew {
  serial_no: string;
  order_id: string;
  date: string;
  product_name: string;
  quantity: number;
  unit_price_ex_gst: number;
  gst_percentage: number | null;
  taxable_value: number;
  cgst_amount: number | null;
  sgst_amount: number | null;
  total_purchase_cost: number | null;
  discount: number | null;
  tax: number | null;
  payment_amount: number | null;
  payment_method: string | null;
  payment_date: string | null;
}

// Define the type for the simplified view
interface SimplifiedSalesHistoryItem {
  order_id: string;
  order_date: string;
  total_amount: number;
  customer_name: string;
  payment_method: string;
  stylist_name: string;
  is_walk_in: boolean;
  consumption_purpose: string | null;
  // Add discount_percentage here if the view includes it
  discount_percentage: number | null;
  // Add item type if the view provides it
  item_type?: string;
  item_name?: string; // Add item_name if view provides it
}

export const useSalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState<SalesHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Only fetch from the sales_product_new view - no fallbacks
      const { data: salesProductData, error: salesProductError } = await supabase
        .from('sales_product_new')
        .select('*')
        .order('date', { ascending: false });

      if (salesProductError) {
        console.error('[useSalesHistory] Error fetching from sales_product_new view:', salesProductError);
        setError('Failed to fetch sales history. Please check if the view exists.');
        showNotification({
          title: 'Error',
          message: 'Failed to load sales history from the new view.',
          color: 'red',
        });
        setSalesHistory([]);
        setIsLoading(false);
        return;
      }

      if (!salesProductData || salesProductData.length === 0) {
        console.log('[useSalesHistory] No data found in sales_product_new view.');
        setSalesHistory([]);
        setIsLoading(false);
        return;
      }

      console.log('[useSalesHistory] Fetched from sales_product_new view:', salesProductData.length);

      const processedData: SalesHistoryItem[] = salesProductData.map((item: SalesProductNew) => {
        // Calculate tax amount from cgst and sgst, falling back to tax field if needed
        const taxAmount = 
          (item.cgst_amount !== null && item.sgst_amount !== null) 
            ? (item.cgst_amount + item.sgst_amount) 
            : item.tax || 0;
        
        // Calculate total amount if total_purchase_cost is null
        const totalAmount = 
          item.total_purchase_cost !== null 
            ? item.total_purchase_cost 
            : item.taxable_value + taxAmount - (item.discount || 0);
        
        return {
          id: item.order_id,
          created_at: item.date,
          product_name: item.product_name || 'Unknown Product',
          hsn_code: '-', // Not available in the new view
          unit: '-', // Not available in the new view
          quantity: item.quantity,
          price_excl_gst: item.unit_price_ex_gst,
          gst_percentage: item.gst_percentage || 0,
          discount_percentage: item.discount || 0,
          taxable_value: item.taxable_value,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          customer_name: 'Customer', // Not available directly in the view
          stylist_name: '-', // Not available directly in the view
          payment_method: item.payment_method || 'N/A',
          invoice_number: item.serial_no, // Use the serial_no as the invoice number
        };
      });

      setSalesHistory(processedData);
      // Dispatch event with fetched data
      window.dispatchEvent(new CustomEvent('sales-history-loaded', { detail: processedData }));
    } catch (err) {
      console.error('[useSalesHistory] Unexpected error during fetch:', err);
      setError('An unexpected error occurred while fetching sales history.');
      showNotification({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        color: 'red',
      });
      setSalesHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesHistory();
    // Listen for custom event to refetch data
    window.addEventListener('refresh-orders', fetchSalesHistory);

    return () => {
      window.removeEventListener('refresh-orders', fetchSalesHistory);
    };
  }, [fetchSalesHistory]);

  return { salesHistory, isLoading, error, fetchSalesHistory };
};