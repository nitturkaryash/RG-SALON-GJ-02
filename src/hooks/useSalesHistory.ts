import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '../utils/supabase/supabaseClient';
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
  discount_percentage: number | null;
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
    console.log('[useSalesHistory] Starting fetchSalesHistory...');
    setIsLoading(true);
    setError(null);

    try {
      // Only fetch from the sales_product_new view - no fallbacks
      console.log('[useSalesHistory] Fetching from sales_product_new view...');
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

      // Fetch product master data to get product types and HSN codes
      console.log('[useSalesHistory] Fetching product master data for product types...');
      const { data: productMasterData, error: productError } = await supabase
        .from('products')
        .select('*'); // Get all fields to help with debugging

      if (productError) {
        console.error('[useSalesHistory] Error fetching product master data:', productError);
        // Continue without product types rather than failing completely
      }

      // Log sample of product master data
      if (productMasterData && productMasterData.length > 0) {
        console.log(`[useSalesHistory] Fetched ${productMasterData.length} products from product master`);
        console.log('[useSalesHistory] Sample product:', productMasterData[0]);
        
        // Check field names and values availability
        const productTypeCount = productMasterData.filter(p => p.product_type).length;
        const hsnCodeCount = productMasterData.filter(p => p.hsn_code).length;
        console.log(`[useSalesHistory] Products with product_type: ${productTypeCount}/${productMasterData.length}`);
        console.log(`[useSalesHistory] Products with hsn_code: ${hsnCodeCount}/${productMasterData.length}`);
      } else {
        console.warn('[useSalesHistory] No products found in product master!');
      }

      // Create lookup maps for product types and HSN codes
      const productTypeByName: Record<string, string> = {};
      const hsnCodeByName: Record<string, string> = {};
      const productTypeByHsn: Record<string, string> = {};
      
      if (productMasterData) {
        productMasterData.forEach((product: any) => {
          if (product.name && product.product_type) {
            const normalizedName = product.name.toLowerCase().trim();
            productTypeByName[normalizedName] = product.product_type;
          }
          if (product.name && product.hsn_code) {
            const normalizedName = product.name.toLowerCase().trim();
            hsnCodeByName[normalizedName] = product.hsn_code;
          }
          if (product.hsn_code && product.product_type) {
            productTypeByHsn[product.hsn_code] = product.product_type;
          }
        });
      }

      console.log(`[useSalesHistory] Created lookup maps with ${Object.keys(productTypeByName).length} names and ${Object.keys(productTypeByHsn).length} HSN codes`);
      
      // Log a few examples from each map for debugging
      if (Object.keys(productTypeByName).length > 0) {
        const sampleKeys = Object.keys(productTypeByName).slice(0, 3);
        console.log('[useSalesHistory] Sample product_type mappings:');
        sampleKeys.forEach(key => {
          console.log(`  "${key}" => "${productTypeByName[key]}"`);
        });
      }
      
      if (Object.keys(hsnCodeByName).length > 0) {
        const sampleKeys = Object.keys(hsnCodeByName).slice(0, 3);
        console.log('[useSalesHistory] Sample hsn_code mappings:');
        sampleKeys.forEach(key => {
          console.log(`  "${key}" => "${hsnCodeByName[key]}"`);
        });
      }

      // Process data and assign sequential serial numbers starting from 1
      const processedData: SalesHistoryItem[] = salesProductData.map((item: SalesProductNew, index: number) => {
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
        
        // Get product type and HSN code by matching with product master data
        const productName = item.product_name || 'Unknown Product';
        const productNameLower = productName.toLowerCase().trim();
        
        // Debug log for product matching
        console.log(`[useSalesHistory] Matching product: "${productName}" (${item.order_id})`);
        
        // Try to get HSN code from product master
        // First check exact match, then try normalized match
        let hsnCode = '-';
        if (hsnCodeByName[productNameLower]) {
          hsnCode = hsnCodeByName[productNameLower];
          console.log(`[useSalesHistory] Found HSN code by exact name match: ${hsnCode}`);
        } else {
          // Try matching with various normalizations of the product name
          const productMasterKeys = Object.keys(hsnCodeByName);
          const matchingKey = productMasterKeys.find(key => 
            // Try removing spaces, special chars, etc.
            productNameLower.includes(key) || key.includes(productNameLower)
          );
          
          if (matchingKey) {
            hsnCode = hsnCodeByName[matchingKey];
            console.log(`[useSalesHistory] Found HSN code by fuzzy name match: ${hsnCode} (${matchingKey})`);
          }
        }
        
        // Try to get product type by product name first, then by HSN code
        let productType = 'Unknown';
        
        // First try exact match by name
        if (productTypeByName[productNameLower]) {
          productType = productTypeByName[productNameLower];
          console.log(`[useSalesHistory] Found product type by exact name match: ${productType}`);
        } 
        // Then try fuzzy match by name
        else {
          const productMasterKeys = Object.keys(productTypeByName);
          const matchingKey = productMasterKeys.find(key => 
            productNameLower.includes(key) || key.includes(productNameLower)
          );
          
          if (matchingKey) {
            productType = productTypeByName[matchingKey];
            console.log(`[useSalesHistory] Found product type by fuzzy name match: ${productType} (${matchingKey})`);
          }
          // Finally try by HSN code
          else if (hsnCode !== '-' && productTypeByHsn[hsnCode]) {
            productType = productTypeByHsn[hsnCode];
            console.log(`[useSalesHistory] Found product type by HSN code: ${productType}`);
          } else {
            console.log(`[useSalesHistory] Could not find product type for "${productName}"`);
          }
        }

        const salesItem = {
          id: item.order_id,
          created_at: item.date,
          product_name: productName,
          hsn_code: hsnCode,
          unit: '-', // Not available in the new view
          quantity: item.quantity,
          price_excl_gst: item.unit_price_ex_gst,
          gst_percentage: item.gst_percentage || 0,
          discount_percentage: item.discount_percentage || item.discount || 0,
          taxable_value: item.taxable_value,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          customer_name: 'Customer', // Not available directly in the view
          stylist_name: '-', // Not available directly in the view
          payment_method: item.payment_method || 'N/A',
          invoice_number: item.serial_no, // Use the original serial_no as the invoice number
          serial_no: index + 1, // Assign new sequential serial number starting from 1
          product_type: productType,
        };
        
        // Log every few items to verify product type assignment
        if (index < 3) {
          console.log(`[useSalesHistory] Sample item ${index + 1}:`, {
            product_name: salesItem.product_name,
            product_type: salesItem.product_type,
            hsn_code: salesItem.hsn_code
          });
        }
        
        return salesItem;
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

  // Update the delete function to use the correct table and primary key
  const deleteSalesEntry = useCallback(async (itemPk: string) => {
    try {
      // Delete from pos_order_items using its primary key (id)
      const { error } = await supabase
        .from('pos_order_items')
        .delete()
        .eq('id', itemPk);
      
      if (error) throw error;
      
      // Refresh list after delete
      fetchSalesHistory();
      showNotification({ title: 'Deleted', message: 'Sales entry deleted successfully', color: 'green' });
    } catch (err: any) {
      console.error('[useSalesHistory] Error deleting sales entry:', err);
      showNotification({ title: 'Error', message: err.message || 'Failed to delete sales entry', color: 'red' });
    }
  }, [fetchSalesHistory]);

  return { salesHistory, isLoading, error, fetchSalesHistory, deleteSalesEntry };
};