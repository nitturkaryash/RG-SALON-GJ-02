import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';

// Interface based on existing purchases table in Supabase
export interface PurchaseTransaction {
  purchase_id: string;
  product_id: string;
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
  stock_after_purchase?: number | null;
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
          id,
          product_id,
          date,
          invoice_no,
          qty,
          incl_gst,
          ex_gst,
          taxable_value,
          igst,
          cgst,
          sgst,
          invoice_value,
          supplier,
          discount_percentage,
          created_at,
          updated_at,
          stock_balance_after_purchase,
          products ( name, hsn_code, units, gst_percentage )
        `)
        .order('date', { ascending: true });

      if (fetchError) {
        throw handleSupabaseError(fetchError);
      }

      type FetchedPurchaseItem = {
        id: string;
        product_id: string;
        date: string;
        invoice_no?: string;
        qty: number;
        incl_gst?: number;
        ex_gst?: number;
        taxable_value?: number;
        igst?: number;
        cgst?: number;
        sgst?: number;
        invoice_value?: number;
        supplier?: string;
        discount_percentage?: number;
        created_at?: string;
        updated_at?: string;
        stock_balance_after_purchase?: number | null;
        products: { name: string | null; hsn_code: string | null; units: string | null; gst_percentage: number | null; } | { name: string | null; hsn_code: string | null; units: string | null; gst_percentage: number | null; }[] | null;
      };

      const transformedData: PurchaseTransaction[] = ((data as unknown) as FetchedPurchaseItem[]).map(item => {
        // Handle products as array or object
        let product = null;
        if (Array.isArray(item.products)) {
          product = item.products.length > 0 ? item.products[0] : null;
        } else {
          product = item.products;
        }
        let calculatedGstPercentage = 0;
        const taxableValue = item.taxable_value ?? 0;
        if (taxableValue > 0) {
          if (item.cgst != null && item.sgst != null) {
            calculatedGstPercentage = ((item.cgst + item.sgst) / taxableValue) * 100;
          } else if (item.igst != null) {
            calculatedGstPercentage = (item.igst / taxableValue) * 100;
          }
        }
        return {
          purchase_id: item.id,
          product_id: item.product_id,
          date: item.date,
          product_name: product?.name || 'Unknown Product',
          hsn_code: product?.hsn_code ?? undefined,
          units: product?.units ?? undefined,
          purchase_invoice_number: item.invoice_no,
          purchase_qty: Number(item.qty),
          mrp_incl_gst: item.incl_gst,
          mrp_excl_gst: item.ex_gst,
          discount_on_purchase_percentage: item.discount_percentage || 0,
          gst_percentage: parseFloat(calculatedGstPercentage.toFixed(2)) || product?.gst_percentage || 18,
          purchase_taxable_value: item.taxable_value,
          purchase_igst: item.igst,
          purchase_cgst: item.cgst,
          purchase_sgst: item.sgst,
          purchase_invoice_value_rs: item.invoice_value,
          created_at: item.created_at,
          updated_at: item.updated_at,
          supplier: item.supplier || 'Direct Entry',
          stock_after_purchase: item.stock_balance_after_purchase ?? null
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

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
  };
}; 