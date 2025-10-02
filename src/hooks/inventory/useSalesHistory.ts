import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../../lib/supabase';
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
  serial_no: number;
  product_type: string;
}

// Define the type for the sales_history_final view
interface SalesHistoryFinal {
  serial_no: string;
  order_id: string;
  date: string; // Sale date
  created_at: string; // Timestamp for proper ordering
  product_name: string;
  quantity: number;
  unit_price_ex_gst: number;
  gst_percentage: number | null;
  taxable_value: number;
  cgst_amount: number | null;
  sgst_amount: number | null;
  total_purchase_cost: number | null;
  discount_percentage: number | null;
  tax: number | null;
  hsn_code: string | null;
  product_type: string | null;
  mrp_incl_gst: number | null;
  discounted_sales_rate_ex_gst: number | null;
  invoice_value: number | null;
  igst_amount: number | null;
  stock: number | null;
  stock_taxable_value: number | null;
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
    console.log('[useSalesHistory] Starting fetchSalesHistory...');
    setIsLoading(true);
    setError(null);

    try {
      // Fetch from the sales_history_final view which includes product_type from product_master
      console.log(
        '[useSalesHistory] Fetching from sales_history_final view...'
      );
      const { data: salesProductData, error: salesProductError } =
        await supabase
          .from('sales_history_final')
          .select('*')
          .order('created_at', { ascending: false }); // Order by timestamp (DESC: latest first)

      if (salesProductError) {
        console.error(
          '[useSalesHistory] Error fetching from sales_history_final view:',
          salesProductError
        );
        setError(
          'Failed to fetch sales history. Please check if the view exists.'
        );
        showNotification({
          title: 'Error',
          message: 'Failed to load sales history from the final view.',
          color: 'red',
        });
        setSalesHistory([]);
        setIsLoading(false);
        return;
      }

      if (!salesProductData || salesProductData.length === 0) {
        console.log(
          '[useSalesHistory] No data found in sales_history_final view.'
        );
        setSalesHistory([]);
        setIsLoading(false);
        return;
      }

      console.log(
        '[useSalesHistory] Fetched from sales_history_final view:',
        salesProductData.length
      );

      // The sales_history_final view already includes product_type and hsn_code from product_master
      console.log(
        '[useSalesHistory] Using product_type and hsn_code from sales_history_final view'
      );

      // Sort data by created_at timestamp (newest first) to ensure proper order
      const sortedData = salesProductData.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Process data and assign sequential serial numbers starting from 1
      const processedData: SalesHistoryItem[] = sortedData.map(
        (item: SalesHistoryFinal, index: number) => {
          // Calculate tax amount from cgst and sgst, falling back to tax field if needed
          const taxAmount =
            item.cgst_amount !== null && item.sgst_amount !== null
              ? item.cgst_amount + item.sgst_amount
              : item.tax || 0;

          // Calculate total amount if total_purchase_cost is null
          const totalAmount =
            item.total_purchase_cost !== null
              ? item.total_purchase_cost
              : item.taxable_value + taxAmount;

          // Get product information directly from the view
          const productName = item.product_name || 'Unknown Product';
          const productType = item.product_type || 'Unknown'; // Default to Unknown if not set
          const hsnCode = item.hsn_code || '-';

          console.log(
            `[useSalesHistory] Processing product: "${productName}" with type: ${productType}`
          );

          const salesItem = {
            id: item.order_id,
            created_at: item.date,
            product_name: productName,
            hsn_code: hsnCode,
            unit: productType || '-', // Use product_type as unit
            quantity: item.quantity,
            price_excl_gst: item.unit_price_ex_gst,
            gst_percentage: item.gst_percentage || 0,
            discount_percentage: item.discount_percentage || 0,
            taxable_value: item.taxable_value,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            customer_name: 'Customer',
            stylist_name: '-',
            payment_method: 'N/A',
            invoice_number: item.serial_no,
            serial_no: index + 1,
            product_type: productType, // Use the product_type directly from the view
          };

          // Log every few items to verify product type assignment
          if (index < 3) {
            console.log(`[useSalesHistory] Sample item ${index + 1}:`, {
              product_name: salesItem.product_name,
              product_type: salesItem.product_type,
              hsn_code: salesItem.hsn_code,
            });
          }

          return salesItem;
        }
      );

      setSalesHistory(processedData);
      // Dispatch event with fetched data
      window.dispatchEvent(
        new CustomEvent('sales-history-loaded', { detail: processedData })
      );
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

  // Update the delete function to use the correct table and primary key
  const deleteSalesEntry = useCallback(
    async (itemPk: string) => {
      try {
        // Delete from pos_order_items using its primary key (id)
        const { error } = await supabase
          .from('pos_order_items')
          .delete()
          .eq('id', itemPk);

        if (error) throw error;

        // Refresh list after delete
        fetchSalesHistory();
        showNotification({
          title: 'Deleted',
          message: 'Sales entry deleted successfully',
          color: 'green',
        });
      } catch (err: any) {
        console.error('[useSalesHistory] Error deleting sales entry:', err);
        showNotification({
          title: 'Error',
          message: err.message || 'Failed to delete sales entry',
          color: 'red',
        });
      }
    },
    [fetchSalesHistory]
  );

  return {
    salesHistory,
    isLoading,
    error,
    fetchSalesHistory,
    deleteSalesEntry,
  };
};
