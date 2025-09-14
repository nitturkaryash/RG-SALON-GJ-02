import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES } from '../../lib/supabase';
import {
  handleSalesDeletion,
  handleConsumptionDeletion,
  recalculateAllStockLevels,
} from '../../utils/stockRecalculation';
import { showToast, handleError, withToast } from '../../utils/toastUtils';
import {
  Purchase,
  Sale,
  BalanceStock,
  Consumption,
  ProcessingStats,
} from '../models/inventoryTypes';

// Query keys for consistent cache management
export const QUERY_KEYS = {
  PURCHASES: 'purchases',
  SALES: 'sales',
  BALANCE_STOCK: 'balance-stock',
  CUSTOMER_SALES: 'customer-sales',
  CONSUMPTION: 'consumption',
};

// Export interface for external use
export interface SalonConsumptionItem {
  id: string;
  'Requisition Voucher No.': string;
  order_id?: string;
  Date: string;
  'Product Name': string;
  'Consumption Qty.': number;
  'Purchase Cost per Unit (Ex. GST) (Rs.)': number;
  'Purchase GST Percentage': number;
  'Purchase Taxable Value (Rs.)': number;
  'Purchase IGST (Rs.)': number;
  'Purchase CGST (Rs.)': number;
  'Purchase SGST (Rs.)': number;
  'Total Purchase Cost (Rs.)': number;
  created_at?: string;
  updated_at?: string;
}

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Loading states
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingSales, setIsSyncingSales] = useState(false);
  const [isSyncingConsumption, setIsSyncingConsumption] = useState(false);
  const [processingStats, setProcessingStats] =
    useState<ProcessingStats | null>(null);

  // Query to fetch purchases
  const purchasesQuery = useQuery<Purchase[], Error>({
    queryKey: [QUERY_KEYS.PURCHASES],
    queryFn: async (): Promise<Purchase[]> => {
      try {
        console.log('Fetching purchases data...');

        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching purchases:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch sales
  const salesQuery = useQuery<Sale[], Error>({
    queryKey: [QUERY_KEYS.SALES],
    queryFn: async (): Promise<Sale[]> => {
      try {
        console.log('Fetching sales data...');

        const { data, error } = await supabase
          .from(TABLES.SALES)
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching sales:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch balance stock
  const balanceStockQuery = useQuery<BalanceStock[], Error>({
    queryKey: [QUERY_KEYS.BALANCE_STOCK],
    queryFn: async (): Promise<BalanceStock[]> => {
      try {
        console.log('Querying balance stock table:', TABLES.BALANCE_STOCK);

        const { data, error } = await supabase
          .from(TABLES.BALANCE_STOCK)
          .select('*')
          .order('product_name', { ascending: true });

        if (error) {
          console.error('Balance stock query error:', error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} balance stock records`);
        return data || [];
      } catch (error) {
        console.error('Error fetching balance stock:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch customer sales
  const customerSalesQuery = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_SALES],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.SALES_CONSUMER)
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching customer sales:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch consumption
  const consumptionQuery = useQuery<Consumption[], Error>({
    queryKey: [QUERY_KEYS.CONSUMPTION],
    queryFn: async (): Promise<Consumption[]> => {
      try {
        console.log('Fetching consumption data...');

        const { data, error } = await supabase
          .from(TABLES.CONSUMPTION)
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching consumption:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Function to recalculate balance stock
  const recalculateBalanceStock = async () => {
    try {
      console.log('Recalculating balance stock...');

      const [purchases, sales, consumption] = await Promise.all([
        purchasesQuery.refetch().then(res => res.data || []),
        salesQuery.refetch().then(res => res.data || []),
        consumptionQuery.refetch().then(res => res.data || []),
      ]);

      // Create a map to store aggregated product information
      const productMap = new Map();

      // Process purchases (add to stock)
      purchases.forEach((purchase: Purchase) => {
        const key = purchase.product_name;
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_name: key,
            hsn_code: purchase.hsn_code || '',
            units: purchase.units || '',
            balance_qty: 0,
            purchase_qty: 0,
            sales_qty: 0,
            consumption_qty: 0,
          });
        }

        const product = productMap.get(key);
        const qty = parseFloat(String(purchase.purchase_qty || 0));
        product.purchase_qty += qty;
        product.balance_qty += qty;
      });

      // Process sales (subtract from stock)
      sales.forEach((sale: Sale) => {
        const key = sale.product_name;
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_name: key,
            hsn_code: sale.hsn_code || '',
            units: sale.units || sale.unit || '',
            balance_qty: 0,
            purchase_qty: 0,
            sales_qty: 0,
            consumption_qty: 0,
          });
        }

        const product = productMap.get(key);
        const qty = parseFloat(String(sale.quantity || sale.sales_qty || 0));
        product.sales_qty += qty;
        product.balance_qty -= qty;
      });

      // Process consumption (subtract from stock)
      consumption.forEach((item: Consumption) => {
        const key = item.product_name;
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_name: key,
            hsn_code: item.hsn_code || '',
            units: item.units || '',
            balance_qty: 0,
            purchase_qty: 0,
            sales_qty: 0,
            consumption_qty: 0,
          });
        }

        const product = productMap.get(key);
        const qty = parseFloat(
          String(item.quantity || item.consumption_qty || 0)
        );
        product.consumption_qty += qty;
        product.balance_qty -= qty;
      });

      // Convert map to array
      const balanceStockData = Array.from(productMap.values());

      console.log(
        `Calculated balance stock for ${balanceStockData.length} products`
      );

      // Update the balance stock query cache
      queryClient.setQueryData([QUERY_KEYS.BALANCE_STOCK], balanceStockData);

      return balanceStockData;
    } catch (error) {
      console.error('Error recalculating balance stock:', error);
      throw error;
    }
  };

  // Simplified consumption sync function
  const syncConsumptionFromPos = async (
    startDate?: string,
    endDate?: string
  ) => {
    try {
      console.log('Starting sync salon consumption from POS...');
      setIsSyncingConsumption(true);
      setProcessingStats({
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
      });

      // Load orders from localStorage
      const storedOrders = localStorage.getItem('pos_orders');
      if (!storedOrders) {
        console.log('No orders found in localStorage');
        return { success: true, message: 'No orders to sync' };
      }

      const allOrders = JSON.parse(storedOrders);
      const salonOrders = allOrders.filter(
        (order: any) =>
          order.customer_name === 'Salon Consumption' ||
          order.purchase_type === 'salon_consumption'
      );

      console.log(`Found ${salonOrders.length} salon consumption orders`);

      setProcessingStats(prev => ({ ...prev!, total: salonOrders.length }));

      let succeeded = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const order of salonOrders) {
        try {
          // Process each item in the order
          for (const item of order.items || []) {
            const consumptionRecord = {
              order_id: order.id,
              product_name: item.product_name || item.name,
              date: new Date(order.created_at).toISOString().split('T')[0],
              quantity: parseFloat(item.quantity || 1),
              purpose: 'Salon Use',
              hsn_code: item.hsn_code || '',
              units: item.units || 'pcs',
              cost_per_unit: parseFloat(item.price || 0),
              gst_percentage: parseFloat(item.gst_percentage || 18),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
              .from(TABLES.CONSUMPTION)
              .upsert([consumptionRecord], {
                onConflict: 'order_id,product_name',
              });

            if (error) {
              console.error('Error inserting consumption record:', error);
              errors.push(`${item.product_name}: ${error.message}`);
              failed++;
            } else {
              succeeded++;
            }
          }

          setProcessingStats(prev => ({
            ...prev!,
            processed: prev!.processed + 1,
            succeeded,
            failed,
            errors,
          }));
        } catch (error) {
          console.error('Error processing order:', error);
          failed++;
          errors.push(`Order ${order.id}: ${error}`);
        }
      }

      // Refresh consumption data
      await consumptionQuery.refetch();

      console.log(`Sync completed: ${succeeded} succeeded, ${failed} failed`);

      return {
        success: true,
        message: `Synced ${succeeded} consumption records`,
        stats: { succeeded, failed, errors },
      };
    } catch (error) {
      console.error('Error syncing consumption from POS:', error);
      return {
        success: false,
        message: 'Failed to sync consumption data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsSyncingConsumption(false);
      setProcessingStats(null);
    }
  };

  // Function to handle sales deletion with stock recalculation
  const deleteSaleWithStockRecalc = async (saleId: string) => {
    try {
      await handleSalesDeletion(saleId);
      // Refresh queries after deletion
      await Promise.all([salesQuery.refetch(), balanceStockQuery.refetch()]);
      return { success: true, message: 'Sale deleted and stock recalculated' };
    } catch (error) {
      console.error('Error deleting sale:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // Function to handle consumption deletion with stock recalculation
  const deleteConsumptionWithStockRecalc = async (consumptionId: string) => {
    try {
      await handleConsumptionDeletion(consumptionId);
      // Refresh queries after deletion
      await Promise.all([
        consumptionQuery.refetch(),
        balanceStockQuery.refetch(),
      ]);
      return {
        success: true,
        message: 'Consumption deleted and stock recalculated',
      };
    } catch (error) {
      console.error('Error deleting consumption:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // Function to recalculate all stock levels
  const recalculateAllStock = async () => {
    try {
      await recalculateAllStockLevels();
      // Refresh all queries after recalculation
      await Promise.all([
        purchasesQuery.refetch(),
        salesQuery.refetch(),
        consumptionQuery.refetch(),
        balanceStockQuery.refetch(),
      ]);
      return { success: true, message: 'All stock levels recalculated' };
    } catch (error) {
      console.error('Error recalculating all stock:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return {
    // Queries
    purchasesQuery,
    salesQuery,
    balanceStockQuery,
    customerSalesQuery,
    consumptionQuery,

    // Loading states
    isExporting,
    isSyncingSales,
    isSyncingConsumption,
    processingStats,

    // Functions
    recalculateBalanceStock,
    syncConsumptionFromPos,
    deleteSaleWithStockRecalc,
    deleteConsumptionWithStockRecalc,
    recalculateAllStock,
  };
};
