import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError, TABLES } from '../utils/supabase/supabaseClient';

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
        .from(TABLES.PURCHASES)
        .select(`
          purchase_id,
          product_id,
          date,
          purchase_invoice_number,
          purchase_qty,
          mrp_incl_gst,
          mrp_excl_gst,
          purchase_taxable_value,
          purchase_igst,
          purchase_cgst,
          purchase_sgst,
          purchase_invoice_value_rs,
          discount_on_purchase_percentage,
          created_at,
          updated_at,
          stock_balance_after_purchase:current_stock,
          product_master(name,hsn_code,units,gst_percentage)
        `)
        .order('date', { ascending: true });

      if (fetchError) {
        throw handleSupabaseError(fetchError);
      }

      type FetchedPurchaseItem = {
        purchase_id: string;
        product_id: string;
        date: string;
        purchase_invoice_number?: string;
        purchase_qty: number;
        mrp_incl_gst?: number;
        mrp_excl_gst?: number;
        purchase_taxable_value?: number;
        purchase_igst?: number;
        purchase_cgst?: number;
        purchase_sgst?: number;
        purchase_invoice_value_rs?: number;
        discount_on_purchase_percentage?: number;
        created_at?: string;
        updated_at?: string;
        stock_balance_after_purchase?: number | null;
        product_master: { name: string | null; hsn_code: string | null; units: string | null; gst_percentage: number | null; } | null;
      };

      const transformedData: PurchaseTransaction[] = ((data as unknown) as FetchedPurchaseItem[]).map(item => {
        const product = item.product_master;
        let calculatedGstPercentage = 0;
        const taxableValue = item.purchase_taxable_value ?? 0;
        if (taxableValue > 0) {
          if (item.purchase_cgst != null && item.purchase_sgst != null) {
            calculatedGstPercentage = ((item.purchase_cgst + item.purchase_sgst) / taxableValue) * 100;
          } else if (item.purchase_igst != null) {
            calculatedGstPercentage = (item.purchase_igst / taxableValue) * 100;
          }
        }
        return {
          purchase_id: item.purchase_id,
          product_id: item.product_id,
          date: item.date,
          product_name: product?.name || 'Unknown Product',
          hsn_code: product?.hsn_code ?? undefined,
          units: product?.units ?? undefined,
          purchase_invoice_number: item.purchase_invoice_number,
          purchase_qty: Number(item.purchase_qty),
          mrp_incl_gst: item.mrp_incl_gst,
          mrp_excl_gst: item.mrp_excl_gst,
          discount_on_purchase_percentage: item.discount_on_purchase_percentage || 0,
          gst_percentage: parseFloat(calculatedGstPercentage.toFixed(2)) || product?.gst_percentage || 18,
          purchase_taxable_value: item.purchase_taxable_value,
          purchase_igst: item.purchase_igst,
          purchase_cgst: item.purchase_cgst,
          purchase_sgst: item.purchase_sgst,
          purchase_invoice_value_rs: item.purchase_invoice_value_rs,
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