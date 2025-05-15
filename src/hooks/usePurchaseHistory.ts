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
  purchase_cost_per_unit_ex_gst?: number;
  purchase_taxable_value?: number;
  purchase_igst?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  purchase_invoice_value_rs?: number;
  created_at?: string;
  updated_at?: string;
  supplier?: string;
  stock_after_purchase?: number | null;
  // Fields for current stock valuation
  current_stock_taxable_value?: number;
  current_stock_cgst?: number;
  current_stock_sgst?: number;
  current_stock_igst?: number;
  current_stock_total_amount_incl_gst?: number;
}

export const usePurchaseHistory = () => {
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch enriched purchase history from backend table with precomputed stock values
      const { data: purchaseRecords, error: fetchError } = await supabase
        .from(TABLES.PURCHASE_HISTORY_WITH_STOCK)
        .select(
          'purchase_id,product_id,date,product_name,hsn_code,units,purchase_invoice_number,' +
          'purchase_qty,mrp_incl_gst,mrp_excl_gst,discount_on_purchase_percentage,gst_percentage,' +
          'purchase_taxable_value,purchase_igst,purchase_cgst,purchase_sgst,purchase_invoice_value_rs,' +
          'supplier,current_stock_at_purchase,computed_stock_taxable_value,computed_stock_cgst,' +
          'computed_stock_sgst,computed_stock_igst,computed_stock_total_value,created_at,updated_at'
        )
        .order('date', { ascending: true });

      if (fetchError) throw handleSupabaseError(fetchError);

      // We no longer need separate stock fetch; backend table includes current_stock_at_purchase and computed_* values

      const transformedData: PurchaseTransaction[] = (purchaseRecords as any[]).map(item => {
        // Map directly from stored fields in purchase_history_with_stock
        const currentStockQty = item.current_stock_at_purchase;
        const currentTaxable = item.computed_stock_taxable_value;
        const currentCgst = item.computed_stock_cgst;
        const currentSgst = item.computed_stock_sgst;
        const currentIgst = item.computed_stock_igst;
        const currentTotal = item.computed_stock_total_value;

        return {
          purchase_id: item.purchase_id,
          product_id: item.product_id,
          date: item.date,
          product_name: item.product_name,
          hsn_code: item.hsn_code,
          units: item.units,
          purchase_invoice_number: item.purchase_invoice_number,
          purchase_qty: Number(item.purchase_qty),
          mrp_incl_gst: item.mrp_incl_gst,
          mrp_excl_gst: item.mrp_excl_gst,
          purchase_cost_per_unit_ex_gst: item.mrp_excl_gst,
          discount_on_purchase_percentage: item.discount_on_purchase_percentage,
          gst_percentage: item.gst_percentage,
          purchase_taxable_value: item.purchase_taxable_value,
          purchase_igst: item.purchase_igst,
          purchase_cgst: item.purchase_cgst,
          purchase_sgst: item.purchase_sgst,
          purchase_invoice_value_rs: item.purchase_invoice_value_rs,
          created_at: item.created_at,
          updated_at: item.updated_at,
          supplier: item.supplier,
          stock_after_purchase: currentStockQty,
          // Add calculated current stock values
          current_stock_taxable_value: currentTaxable,
          current_stock_cgst: currentCgst,
          current_stock_sgst: currentSgst,
          current_stock_igst: currentIgst,
          current_stock_total_amount_incl_gst: currentTotal
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

  // Delete a purchase transaction by ID from both history and purchases tables
  const deletePurchaseTransaction = useCallback(async (purchaseId: string): Promise<boolean> => {
    try {
      // Remove from history table
      const { error: histError } = await supabase
        .from(TABLES.PURCHASE_HISTORY_WITH_STOCK)
        .delete()
        .eq('purchase_id', purchaseId);
      if (histError) {
        console.error('Error deleting purchase history record:', histError);
        return false;
      }
      // Remove original purchase
      const { error: purchaseError } = await supabase
        .from(TABLES.PURCHASES)
        .delete()
        .eq('purchase_id', purchaseId);
      if (purchaseError) {
        console.error('Error deleting purchase record:', purchaseError);
        return false;
      }
      // Update local state to reflect deletion
      setPurchases(prev => prev.filter(p => p.purchase_id !== purchaseId));
      return true;
    } catch (err) {
      console.error('Unexpected error deleting purchase:', err);
      return false;
    }
  }, [setPurchases]);

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
    deletePurchaseTransaction
  };
}; 