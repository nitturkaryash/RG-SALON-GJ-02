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
      const { data, error: fetchError } = await supabase
        .from(TABLES.PURCHASES)
        .select(
          'purchase_id,product_id,date,purchase_invoice_number,purchase_qty,' +
          'mrp_incl_gst,mrp_excl_gst,purchase_taxable_value,purchase_igst,purchase_cgst,' +
          'purchase_sgst,purchase_invoice_value_rs,discount_on_purchase_percentage,' +
          'created_at,updated_at,units,stock_balance_after_purchase:current_stock,Vendor,' +
          'product_master(name,hsn_code,units,gst_percentage)'
        )
        .order('date', { ascending: true });

      if (fetchError) throw handleSupabaseError(fetchError);

      const transformedData: PurchaseTransaction[] = (data as any[]).map(item => {
        const product = item.product_master;
        let calculatedGstPercentage = 0;
        const origTaxableValue = item.purchase_taxable_value ?? 0;
        if (origTaxableValue > 0) {
          if (item.purchase_cgst != null && item.purchase_sgst != null) {
            calculatedGstPercentage = ((item.purchase_cgst + item.purchase_sgst) / origTaxableValue) * 100;
          } else if (item.purchase_igst != null) {
            calculatedGstPercentage = (item.purchase_igst / origTaxableValue) * 100;
          }
        }

        // Determine the final GST percentage for this transaction
        const finalGstPct = parseFloat(calculatedGstPercentage.toFixed(2)) || product?.gst_percentage || 18;
        // Calculate MRP Excluding GST based on MRP Inclusive from transaction and GST percentage
        const mrpIncl = item.mrp_incl_gst ?? 0;
        const calculatedMrpExcl = mrpIncl / (1 + finalGstPct / 100);

        // Calculate purchase cost per unit excluding GST minus discount
        const purchaseQty = Number(item.purchase_qty) || 0;
        const discountPct = item.discount_on_purchase_percentage ?? 0;
        const costPerUnitExGst = calculatedMrpExcl * (1 - (discountPct / 100));
        // Calculate taxable value based on discounted cost per unit
        const computedTaxableValue = costPerUnitExGst * purchaseQty;
        // Recalculate tax amounts based on the new taxable value
        let purchaseCgst: number;
        let purchaseSgst: number;
        let purchaseIgst: number;
        // Determine tax split: CGST/SGST for local, IGST for interstate
        if (item.purchase_igst != null && item.purchase_igst > 0) {
          // Interstate purchase: full GST charged as IGST
          purchaseIgst = computedTaxableValue * (finalGstPct / 100);
          purchaseCgst = 0;
          purchaseSgst = 0;
        } else {
          // Local purchase: split GST equally into CGST and SGST
          const halfGstRate = finalGstPct / 2 / 100; // half percentage as decimal
          purchaseCgst = computedTaxableValue * halfGstRate;
          purchaseSgst = computedTaxableValue * halfGstRate;
          purchaseIgst = 0;
        }
        // Calculate total invoice value including GST
        const purchaseInvoiceValue = computedTaxableValue + purchaseCgst + purchaseSgst + purchaseIgst;

        // Calculate current stock valuation
        const currentStockQty = item.stock_balance_after_purchase ?? 0;
        const currentStockTaxableValue = currentStockQty * calculatedMrpExcl;
        let currentStockCgst = 0;
        let currentStockSgst = 0;
        let currentStockIgst = 0;

        if (item.purchase_igst != null && item.purchase_igst > 0) {
          // Interstate purchase: full GST charged as IGST for current stock
          currentStockIgst = currentStockTaxableValue * (finalGstPct / 100);
        } else {
          // Local purchase: split GST equally into CGST and SGST for current stock
          const halfGstRate = finalGstPct / 2 / 100;
          currentStockCgst = currentStockTaxableValue * halfGstRate;
          currentStockSgst = currentStockTaxableValue * halfGstRate;
        }
        const currentStockTotalAmountInclGst = currentStockTaxableValue + currentStockCgst + currentStockSgst + currentStockIgst;

        return {
          purchase_id: item.purchase_id,
          product_id: item.product_id,
          date: item.date,
          product_name: product?.name || 'Unknown Product',
          hsn_code: product?.hsn_code ?? undefined,
          units: item.units || (product?.units ?? undefined),
          purchase_invoice_number: item.purchase_invoice_number,
          purchase_qty: Number(item.purchase_qty),
          mrp_incl_gst: item.mrp_incl_gst,
          mrp_excl_gst: parseFloat(calculatedMrpExcl.toFixed(2)),
          purchase_cost_per_unit_ex_gst: parseFloat(costPerUnitExGst.toFixed(2)),
          discount_on_purchase_percentage: item.discount_on_purchase_percentage || 0,
          gst_percentage: finalGstPct,
          purchase_taxable_value: parseFloat(computedTaxableValue.toFixed(2)),
          purchase_igst: parseFloat(purchaseIgst.toFixed(2)),
          purchase_cgst: parseFloat(purchaseCgst.toFixed(2)),
          purchase_sgst: parseFloat(purchaseSgst.toFixed(2)),
          purchase_invoice_value_rs: parseFloat(purchaseInvoiceValue.toFixed(2)),
          created_at: item.created_at,
          updated_at: item.updated_at,
          supplier: item.Vendor || 'Direct Entry',
          stock_after_purchase: item.stock_balance_after_purchase ?? null,
          // Add calculated current stock values
          current_stock_taxable_value: parseFloat(currentStockTaxableValue.toFixed(2)),
          current_stock_cgst: parseFloat(currentStockCgst.toFixed(2)),
          current_stock_sgst: parseFloat(currentStockSgst.toFixed(2)),
          current_stock_igst: parseFloat(currentStockIgst.toFixed(2)),
          current_stock_total_amount_incl_gst: parseFloat(currentStockTotalAmountInclGst.toFixed(2))
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

  // Delete a purchase transaction by ID
  const deletePurchaseTransaction = useCallback(async (purchaseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLES.PURCHASES)
        .delete()
        .eq('purchase_id', purchaseId);
      if (error) {
        console.error('Error deleting purchase:', error);
        // Consider setting an error state here for the UI
        return false;
      }
      // Update local state to reflect the deletion
      setPurchases(prevPurchases => prevPurchases.filter(p => p.purchase_id !== purchaseId));
      return true;
    } catch (err) {
      console.error('Unexpected error deleting purchase:', err);
      // Consider setting an error state here for the UI
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