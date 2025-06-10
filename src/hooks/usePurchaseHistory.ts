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
  price_inlcuding_disc?: number;
  // Fields for current stock valuation
  current_stock_taxable_value?: number;
  current_stock_cgst?: number;
  current_stock_sgst?: number;
  current_stock_igst?: number;
  current_stock_total_amount_incl_gst?: number;
  // New field to distinguish inventory updates from purchases
  is_inventory_update?: boolean;
  transaction_type?: 'purchase' | 'inventory_update';
}

// Interface for updating purchase transactions
export interface UpdatePurchaseTransactionData {
  date?: string;
  Vendor?: string;
  purchase_invoice_number?: string;
  hsn_code?: string;
  units?: string;
  purchase_qty?: number;
  gst_percentage?: number;
  mrp_incl_gst?: number;
  mrp_excl_gst?: number;
  discount_on_purchase_percentage?: number;
  purchase_igst?: number;
  purchase_cost_per_unit_ex_gst?: number;
  purchase_taxable_value?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  purchase_invoice_value_rs?: number;
}

// New interface for inventory update data
export interface InventoryUpdateData {
  product_id: string;
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  update_qty: number;
  mrp_incl_gst: number;
  mrp_excl_gst: number;
  discount_on_purchase_percentage: number;
  gst_percentage: number;
  purchase_cost_per_unit_ex_gst: number;
  purchase_taxable_value: number;
  purchase_igst: number;
  purchase_cgst: number;
  purchase_sgst: number;
  purchase_invoice_value_rs: number;
  is_interstate: boolean;
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
          'computed_stock_sgst,computed_stock_igst,computed_stock_total_value,"Purchase_Cost/Unit(Ex.GST)",created_at,updated_at,transaction_type'
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
          purchase_cost_per_unit_ex_gst: item["Purchase_Cost/Unit(Ex.GST)"],
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
          price_inlcuding_disc: item["Purchase_Cost/Unit(Ex.GST)"],
          // Add calculated current stock values
          current_stock_taxable_value: currentTaxable,
          current_stock_cgst: currentCgst,
          current_stock_sgst: currentSgst,
          current_stock_igst: currentIgst,
          current_stock_total_amount_incl_gst: currentTotal,
          // Add transaction type to distinguish inventory updates
          transaction_type: item.transaction_type || 'purchase',
          is_inventory_update: item.transaction_type === 'inventory_update'
        };
      });

      console.log('Fetched purchase records:', transformedData.map(p => ({ id: p.purchase_id, date: p.date, product: p.product_name, type: p.transaction_type })));

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
        .from('inventory_purchases')
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

  // Update a purchase transaction
  const updatePurchaseTransaction = useCallback(async (
    purchaseId: string, 
    updateData: UpdatePurchaseTransactionData
  ) => {
    try {
      console.log('Updating purchase transaction with ID:', purchaseId);
      console.log('Updates to apply:', JSON.stringify(updateData));
      
      // Log the exact SQL query we're about to execute (for debugging)
      console.log(`SQL (equivalent): UPDATE inventory_purchases SET date='${updateData.date}', updated_at='${updateData.updated_at}' WHERE purchase_id='${purchaseId}'`);
      
      // Update the purchase in inventory_purchases table
      const { data, error: updateError } = await supabase
        .from('inventory_purchases')
        .update(updateData)
        .eq('purchase_id', purchaseId)
        .select(); // Add select to get the returned data
      
      if (updateError) {
        console.error('Error updating purchase transaction:', updateError);
        console.error('Error details:', JSON.stringify(updateError));
        return { 
          success: false, 
          error: { message: updateError.message || 'Failed to update purchase' }
        };
      }
      
      console.log('Purchase transaction updated successfully');
      console.log('Updated record:', data);

      // Update local state to reflect the changes
      setPurchases(prev => prev.map(purchase => 
        purchase.purchase_id === purchaseId 
          ? { ...purchase, ...updateData, updated_at: new Date().toISOString() }
          : purchase
      ));

      // Refresh the data to get updated computed values from the view
      console.log('Refreshing purchase data...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms for database to update
      await fetchPurchases();
      console.log('Purchase data refreshed');

      return { success: true };
    } catch (err) {
      console.error('Error updating purchase transaction:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      const errorMessage = err instanceof Error ? err.message : 'Failed to update purchase transaction';
      setError(errorMessage);
      return { 
        success: false, 
        error: { message: errorMessage }
      };
    }
  }, [setPurchases, fetchPurchases]);

  // New function to add inventory update
  const addInventoryUpdate = useCallback(async (inventoryData: InventoryUpdateData): Promise<{ success: boolean; error?: any }> => {
    try {
      console.log('Adding inventory update:', inventoryData);

      // Prepare the inventory update data for insertion
      // Note: purchase_id will be auto-generated by the database as UUID
      const inventoryUpdatePayload = {
        // purchase_id: auto-generated by database
        product_id: inventoryData.product_id,
        date: new Date(inventoryData.date).toISOString(),
        product_name: inventoryData.product_name,
        hsn_code: inventoryData.hsn_code,
        units: inventoryData.units,
        purchase_invoice_number: "OPENING BALANCE", // Changed to just OPENING BALANCE without timestamp
        purchase_qty: inventoryData.update_qty,
        mrp_incl_gst: inventoryData.mrp_incl_gst,
        mrp_excl_gst: inventoryData.mrp_excl_gst,
        discount_on_purchase_percentage: inventoryData.discount_on_purchase_percentage,
        gst_percentage: inventoryData.gst_percentage,
        purchase_cost_per_unit_ex_gst: inventoryData.purchase_cost_per_unit_ex_gst,
        purchase_taxable_value: inventoryData.purchase_taxable_value,
        purchase_igst: inventoryData.purchase_igst,
        purchase_cgst: inventoryData.purchase_cgst,
        purchase_sgst: inventoryData.purchase_sgst,
        purchase_invoice_value_rs: inventoryData.purchase_invoice_value_rs,
        "Vendor": 'OPENING BALANCE', // Changed to OPENING BALANCE
        transaction_type: 'stock_increment', // Changed from 'inventory_update' to 'stock_increment'
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inventory update payload:', inventoryUpdatePayload);

      // Insert into inventory_purchases table with transaction_type = 'inventory_update'
      const { data: insertedData, error: insertError } = await supabase
        .from('inventory_purchases')
        .insert([inventoryUpdatePayload])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting inventory update:', insertError);
        throw handleSupabaseError(insertError);
      }

      console.log('Inventory update inserted successfully:', insertedData);

      // Update the product stock in the products table
      const { error: stockUpdateError } = await supabase.rpc('increment_product_stock', {
        p_product_id: inventoryData.product_id,
        p_increment_quantity: inventoryData.update_qty
      });
      
      // If RPC doesn't exist, update manually by fetching current stock first
      if (stockUpdateError && stockUpdateError.message?.includes('function')) {
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', inventoryData.product_id)
          .single();
          
        if (!fetchError && currentProduct) {
          const newStock = (currentProduct.stock_quantity || 0) + inventoryData.update_qty;
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock_quantity: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', inventoryData.product_id);
            
          if (updateError) {
            console.error('Error updating product stock manually:', updateError);
          }
        }
      }

      if (stockUpdateError) {
        console.error('Error updating product stock:', stockUpdateError);
        // Don't throw here, just log the error as the inventory record is already created
      }

      return { success: true };
    } catch (err) {
      console.error('Error adding inventory update:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to add inventory update')
      };
    }
  }, []);

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
    deletePurchaseTransaction,
    updatePurchaseTransaction,
    addInventoryUpdate
  };
}; 