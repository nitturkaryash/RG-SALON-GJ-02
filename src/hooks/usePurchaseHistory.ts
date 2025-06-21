import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError, TABLES } from '../utils/supabase/supabaseClient';
import { 
  addPurchaseTransaction, 
  editPurchaseTransaction, 
  deletePurchaseTransaction as deleteTransaction,
  PurchaseFormData 
} from '../utils/inventoryUtils';

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
  // New field to distinguish opening balance from purchases
  is_opening_balance?: boolean;
  transaction_type?: 'purchase' | 'opening_balance' | 'stock_increment' | 'stock_decrement' | 'pos_sale';
}

// Interface for updating purchase transactions
export interface UpdatePurchaseTransactionData {
  date?: string;
  product_name?: string;
  Vendor?: string;
  supplier?: string;
  purchase_invoice_number?: string;
  hsn_code?: string;
  units?: string;
  purchase_qty?: number;
  gst_percentage?: number;
  mrp_incl_gst?: number;
  mrp_excl_gst?: number;
  discount_on_purchase_percentage?: number;
  purchase_igst?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  purchase_cost_per_unit_ex_gst?: number;
  purchase_taxable_value?: number;
  purchase_invoice_value_rs?: number;
  // Add fields for stock calculations
  current_stock_at_purchase?: number;
  computed_stock_taxable_value?: number;
  computed_stock_cgst?: number;
  computed_stock_sgst?: number;
  computed_stock_igst?: number;
  computed_stock_total_value?: number;
  "Purchase_Cost/Unit(Ex.GST)"?: number;
  price_inlcuding_disc?: number;
  transaction_type?: 'purchase' | 'opening_balance' | 'stock_increment' | 'stock_decrement' | 'pos_sale';
  updated_at?: string;
}

// New interface for opening balance data (renamed from InventoryUpdateData)
export interface OpeningBalanceData {
  product_id: string;
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  opening_qty: number; // renamed from update_qty
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
      // Fetch enriched purchase history from purchase_history_with_stock table with precomputed stock values
      const { data: purchaseRecords, error: fetchError } = await supabase
        .from(TABLES.PURCHASE_HISTORY_WITH_STOCK)
        .select(
          'purchase_id,product_id,date,product_name,hsn_code,units,purchase_invoice_number,' +
          'purchase_qty,mrp_incl_gst,mrp_excl_gst,discount_on_purchase_percentage,gst_percentage,' +
          'purchase_taxable_value,purchase_igst,purchase_cgst,purchase_sgst,purchase_invoice_value_rs,' +
          'supplier,current_stock_at_purchase,computed_stock_taxable_value,computed_stock_cgst,' +
          'computed_stock_sgst,computed_stock_igst,computed_stock_total_value,"Purchase_Cost/Unit(Ex.GST)",created_at,updated_at,transaction_type'
        )
        .order('created_at', { ascending: false });

      if (fetchError) throw handleSupabaseError(fetchError);

      // Transform data from purchase_history_with_stock table
      const transformedData: PurchaseTransaction[] = (purchaseRecords as any[]).map(item => {
        // Map fields from purchase_history_with_stock
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
          purchase_qty: Number(item.purchase_qty || 0),
          mrp_incl_gst: Number(item.mrp_incl_gst || 0),
          mrp_excl_gst: Number(item.mrp_excl_gst || 0),
          purchase_cost_per_unit_ex_gst: Number(item["Purchase_Cost/Unit(Ex.GST)"] || 0),
          discount_on_purchase_percentage: Number(item.discount_on_purchase_percentage || 0),
          gst_percentage: Number(item.gst_percentage || 0),
          purchase_taxable_value: Number(item.purchase_taxable_value || 0),
          purchase_igst: Number(item.purchase_igst || 0),
          purchase_cgst: Number(item.purchase_cgst || 0),
          purchase_sgst: Number(item.purchase_sgst || 0),
          purchase_invoice_value_rs: Number(item.purchase_invoice_value_rs || 0),
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
          // Add transaction type to distinguish opening balance
          transaction_type: item.transaction_type || 'purchase',
          is_opening_balance: item.transaction_type === 'opening_balance' && item.supplier === 'OPENING BALANCE'
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

  // Delete a purchase transaction using the enhanced function
  const deletePurchaseTransaction = useCallback(async (purchaseId: string): Promise<boolean> => {
    try {
      // Use the enhanced deletePurchaseTransaction function
      const result = await deleteTransaction(purchaseId);
      
      if (!result.success) {
        console.error('Error from enhanced delete function:', result.error);
        return false;
      }
      
      console.log('Purchase transaction deleted successfully with enhanced tracking');
      
      // Update local state to reflect deletion
      setPurchases(prev => prev.filter(p => p.purchase_id !== purchaseId));
      
      // Refresh the data
      await fetchPurchases();
      
      return true;
    } catch (err) {
      console.error('Unexpected error deleting purchase:', err);
      return false;
    }
  }, [setPurchases, fetchPurchases]);

  // Update a purchase transaction using the enhanced function
  const updatePurchaseTransaction = useCallback(async (
    purchaseId: string, 
    updateData: UpdatePurchaseTransactionData
  ) => {
    try {
      console.log('Updating purchase transaction with ID:', purchaseId);
      console.log('Updates to apply:', JSON.stringify(updateData));
      
      // First, get the existing purchase to get product_id and other required fields
      const existingPurchase = purchases.find(p => p.purchase_id === purchaseId);
      if (!existingPurchase) {
        console.error('Purchase not found in local state:', purchaseId);
        return { 
          success: false, 
          error: { message: 'Purchase transaction not found' }
        };
      }
      
      // Transform the update data to match PurchaseFormData interface
      const purchaseFormData: PurchaseFormData = {
        id: purchaseId,
        product_id: existingPurchase.product_id, // Required field from existing purchase
        date: updateData.date || existingPurchase.date,
        product_name: updateData.product_name || existingPurchase.product_name,
        vendor: updateData.supplier || updateData.Vendor || existingPurchase.supplier || '',
        invoice_number: updateData.purchase_invoice_number || existingPurchase.purchase_invoice_number || '',
        hsn_code: updateData.hsn_code || existingPurchase.hsn_code || '',
        unit_type: updateData.units || existingPurchase.units || '',
        purchase_qty: updateData.purchase_qty ?? existingPurchase.purchase_qty,
        gst_percentage: updateData.gst_percentage ?? existingPurchase.gst_percentage ?? 18,
        mrp_incl_gst: updateData.mrp_incl_gst ?? existingPurchase.mrp_incl_gst ?? 0,
        mrp_excl_gst: updateData.mrp_excl_gst ?? existingPurchase.mrp_excl_gst ?? 0,
        mrp_per_unit_excl_gst: updateData.mrp_excl_gst ?? existingPurchase.mrp_excl_gst ?? 0,
        discount_on_purchase_percentage: updateData.discount_on_purchase_percentage ?? existingPurchase.discount_on_purchase_percentage ?? 0,
        purchase_cost_taxable_value: updateData.purchase_taxable_value ?? existingPurchase.purchase_taxable_value ?? 0,
        purchase_invoice_value: updateData.purchase_invoice_value_rs ?? existingPurchase.purchase_invoice_value_rs ?? 0,
        is_interstate: (updateData.purchase_igst ?? existingPurchase.purchase_igst ?? 0) > 0
      };
      
      // Use the enhanced editPurchaseTransaction function
      const result = await editPurchaseTransaction(purchaseId, purchaseFormData);
      
      if (!result.success) {
        console.error('Error from enhanced edit function:', result.error);
        return { 
          success: false, 
          error: { message: result.error?.message || 'Failed to update purchase transaction' }
        };
      }
      
      console.log('Purchase transaction updated successfully with enhanced tracking');

      // Refresh the data to get updated values
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
  }, [fetchPurchases, purchases]);

  // Add a new purchase transaction using the enhanced function
  const addPurchaseTransactionEnhanced = useCallback(async (purchaseData: PurchaseFormData) => {
    try {
      console.log('Adding new purchase transaction:', purchaseData);
      
      // Use the enhanced addPurchaseTransaction function
      const result = await addPurchaseTransaction(purchaseData);
      
      if (!result.success) {
        console.error('Error from enhanced add function:', result.error);
        return { 
          success: false, 
          error: { message: result.error?.message || 'Failed to add purchase transaction' }
        };
      }
      
      console.log('Purchase transaction added successfully with enhanced tracking');

      // Refresh the data to get updated values
      console.log('Refreshing purchase data...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms for database to update
      await fetchPurchases();
      console.log('Purchase data refreshed');

      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error adding purchase transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add purchase transaction';
      setError(errorMessage);
      return { 
        success: false, 
        error: { message: errorMessage }
      };
    }
  }, [fetchPurchases]);

  // New function to add opening balance - Insert directly into purchase_history_with_stock
  const addOpeningBalance = useCallback(async (openingData: OpeningBalanceData): Promise<{ success: boolean; error?: any }> => {
    try {
      console.log('Adding opening balance:', openingData);

      // Generate a UUID for the purchase_id
      const purchaseId = crypto.randomUUID();

      // First get current stock to calculate the correct current_stock_at_purchase
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', openingData.product_id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching current product stock:', fetchError);
        throw handleSupabaseError(fetchError);
      }

      // Calculate the total stock after adding opening balance
      const currentStock = currentProduct?.stock_quantity || 0;
      const totalStockAfterOpening = currentStock + openingData.opening_qty;

      console.log(`Current stock: ${currentStock}, Opening balance: ${openingData.opening_qty}, Total after opening: ${totalStockAfterOpening}`);

      // Insert directly into purchase_history_with_stock table
      const openingBalancePayload = {
        purchase_id: purchaseId,
        product_id: openingData.product_id,
        date: new Date(openingData.date).toISOString(),
        product_name: openingData.product_name,
        hsn_code: openingData.hsn_code,
        units: openingData.units,
        purchase_invoice_number: "OPENING BALANCE",
        purchase_qty: openingData.opening_qty,
        mrp_incl_gst: openingData.mrp_incl_gst,
        mrp_excl_gst: openingData.mrp_excl_gst,
        discount_on_purchase_percentage: openingData.discount_on_purchase_percentage,
        gst_percentage: openingData.gst_percentage,
        purchase_taxable_value: openingData.purchase_taxable_value,
        purchase_igst: openingData.purchase_igst,
        purchase_cgst: openingData.purchase_cgst,
        purchase_sgst: openingData.purchase_sgst,
        purchase_invoice_value_rs: openingData.purchase_invoice_value_rs,
        supplier: 'OPENING BALANCE',
        current_stock_at_purchase: totalStockAfterOpening, // Use total stock, not just opening qty
        computed_stock_taxable_value: 0,
        computed_stock_cgst: 0,
        computed_stock_sgst: 0,
        computed_stock_igst: 0,
        computed_stock_total_value: 0,
        "Purchase_Cost/Unit(Ex.GST)": openingData.purchase_cost_per_unit_ex_gst,
        price_inlcuding_disc: openingData.purchase_cost_per_unit_ex_gst,
        transaction_type: 'opening_balance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Opening balance payload for purchase_history_with_stock:', openingBalancePayload);

      // Insert directly into purchase_history_with_stock table
      const { data: insertedData, error: insertError } = await supabase
        .from('purchase_history_with_stock')
        .insert([openingBalancePayload])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting opening balance into purchase_history_with_stock:', insertError);
        throw handleSupabaseError(insertError);
      }

      console.log('Opening balance inserted into purchase_history_with_stock:', insertedData);

      // Update the product stock directly in the products table
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: totalStockAfterOpening,
          updated_at: new Date().toISOString()
        })
        .eq('id', openingData.product_id);
        
      if (updateError) {
        console.error('Error updating product stock:', updateError);
        // Don't throw here, just log the error as the opening balance record is already created
      } else {
        console.log(`Product stock updated: ${currentStock} -> ${totalStockAfterOpening}`);
      }

      return { success: true };
    } catch (err) {
      console.error('Error adding opening balance:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to add opening balance')
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
    addOpeningBalance,
    addPurchaseTransactionEnhanced
  };
}; 