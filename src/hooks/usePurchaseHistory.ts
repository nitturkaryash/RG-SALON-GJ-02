import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';

// Interface based on existing purchases table in Supabase
export interface PurchaseTransaction {
  purchase_id: string;
  date: string;
  product_name: string;
  hsn_code?: string;
  units?: string;
  purchase_invoice_number?: string;
  purchase_qty: number;
  mrp_incl_gst?: number;
  mrp_excl_gst?: number;
  discount_on_purchase_percentage?: number;
  gst_percentage?: number;
  purchase_taxable_value?: number;
  purchase_igst?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  purchase_invoice_value_rs?: number;
  created_at?: string;
  updated_at?: string;
  supplier?: string;
}

export const usePurchaseHistory = () => {
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select(`
          *,
          products (
            name,
            hsn_code,
            units
          )
        `)
        .order('date', { ascending: false });

      if (fetchError) {
        throw handleSupabaseError(fetchError);
      }

      // Transform data from 'purchases' table to match our PurchaseTransaction interface
      const transformedData: PurchaseTransaction[] = (data || []).map(item => {
        // Calculate gst_percentage from CGST & SGST if available
        let calculatedGstPercentage = 0;
        if (item.taxable_value && item.taxable_value > 0) {
          if (item.cgst && item.sgst) {
            // If both CGST and SGST are available, they are each half of the total GST
            calculatedGstPercentage = ((item.cgst + item.sgst) / item.taxable_value) * 100;
          } else if (item.igst) {
            calculatedGstPercentage = (item.igst / item.taxable_value) * 100;
          }
        }
        
        return {
          purchase_id: item.id,
          date: item.date,
          product_name: item.products?.name || 'Unknown Product', // Get name from joined products table
          hsn_code: item.products?.hsn_code, // Get hsn_code from joined products table
          units: item.products?.units, // Get units from joined products table
          purchase_invoice_number: item.invoice_no,
          purchase_qty: item.qty,
          mrp_incl_gst: item.incl_gst,
          mrp_excl_gst: item.ex_gst,
          discount_on_purchase_percentage: item.discount_percentage || 0, // Use the stored discount_percentage
          gst_percentage: calculatedGstPercentage,
          purchase_taxable_value: item.taxable_value,
          purchase_igst: item.igst,
          purchase_cgst: item.cgst,
          purchase_sgst: item.sgst,
          purchase_invoice_value_rs: item.invoice_value,
          created_at: item.created_at,
          supplier: item.supplier || 'Direct Entry', // Include supplier
        };
      });

      setPurchases(transformedData);
      return transformedData;

    } catch (err) {
      console.error('Error fetching purchase history:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load purchase history. Please try again.';
      setError(errorMessage);
      setPurchases([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch purchases on hook initialization
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  // Function to add a purchase (will be handled by a separate utility function for atomicity)
  // We might add functions here later to delete or update purchase records if needed

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
  };
}; 