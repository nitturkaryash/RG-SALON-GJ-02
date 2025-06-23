// Offline-aware POS hook
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { offlineStorage } from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkService';
import { syncService } from '../utils/syncService';
import { supabase } from '../supabaseClient';
import { generateInvoiceNumber } from '../lib/invoice';
import { useState, useEffect } from 'react';

// Import existing types from usePOS
import type { 
  Order, 
  CreateOrderData, 
  PaymentMethod, 
  PaymentDetail 
} from './usePOS';

interface OfflineOrder extends Order {
  isOffline?: boolean;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'error';
  lastModified?: number;
}

export function useOfflinePOS() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>([]);

  // Load offline orders on mount
  useEffect(() => {
    loadOfflineOrders();
  }, []);

  // Watch for network status changes
  useEffect(() => {
    if (isOnline) {
      // Attempt to sync when coming back online
      syncOfflineOrders();
    }
  }, [isOnline]);

  const loadOfflineOrders = async () => {
    try {
      const orders = await offlineStorage.getOfflineData('orders');
      setOfflineOrders(orders || []);
    } catch (error) {
      console.error('❌ Failed to load offline orders:', error);
    }
  };

  const syncOfflineOrders = async () => {
    try {
      const result = await syncService.startSync();
      if (result.success) {
        await loadOfflineOrders(); // Reload to reflect sync status
        toast.success(`✅ Synced ${result.syncedCount} orders`);
      }
    } catch (error) {
      console.error('❌ Failed to sync offline orders:', error);
    }
  };

  // Create order (offline-aware)
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData): Promise<OfflineOrder> => {
      const orderId = orderData.order_id || uuidv4();
      const invoiceNumber = orderData.invoice_number || generateInvoiceNumber();
      
      const order: OfflineOrder = {
        id: orderId,
        client_id: orderData.client_id,
        client_name: orderData.client_name,
        customer_name: orderData.client_name,
        stylist_id: orderData.stylist_id,
        stylist_name: orderData.stylist_name,
        services: orderData.services || [],
        total: orderData.total,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        discount: orderData.discount || 0,
        payment_method: orderData.payment_method,
        status: orderData.status,
        created_at: orderData.order_date,
        appointment_id: orderData.appointment_id,
        is_walk_in: orderData.is_walk_in,
        payments: orderData.payments || [],
        pending_amount: orderData.pending_amount || 0,
        is_split_payment: orderData.payment_method === 'split',
        invoice_number: invoiceNumber,
        is_salon_consumption: orderData.is_salon_consumption || false,
        isOffline: !isOnline,
        syncStatus: isOnline ? 'syncing' : 'pending',
        lastModified: Date.now(),
      };

      if (isOnline) {
        // Try to save to server first
        try {
          const { data, error } = await supabase
            .from('pos_orders')
            .insert({
              id: order.id,
              client_name: order.client_name,
              stylist_id: order.stylist_id,
              stylist_name: order.stylist_name,
              services: order.services,
              total: order.total,
              subtotal: order.subtotal,
              tax: order.tax,
              discount: order.discount,
              payment_method: order.payment_method,
              status: order.status,
              is_walk_in: order.is_walk_in,
              payments: order.payments,
              pending_amount: order.pending_amount,
              is_split_payment: order.is_split_payment,
              invoice_number: order.invoice_number,
              is_salon_consumption: order.is_salon_consumption,
              created_at: order.created_at,
            })
            .select()
            .single();

          if (error) throw error;

          // Save to offline storage as synced
          order.syncStatus = 'synced';
          order.isOffline = false;
          await offlineStorage.storeOffline('orders', order.id, order, 'create');
          await offlineStorage.markAsSynced('orders', order.id);

          toast.success('✅ Order created and saved online');
          
        } catch (error) {
          console.error('❌ Failed to save order online, storing offline:', error);
          
          // Store offline if server fails
          order.isOffline = true;
          order.syncStatus = 'pending';
          await offlineStorage.storeOffline('orders', order.id, order, 'create');
          
          toast.warn('⚠️ Order saved offline - will sync when connection is restored');
        }
      } else {
        // Store offline
        await offlineStorage.storeOffline('orders', order.id, order, 'create');
        toast.info('📱 Order saved offline - will sync when online');
      }

      return order;
    },
    onSuccess: (order) => {
      // Update local state
      setOfflineOrders(prev => [...prev, order]);
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (error) => {
      console.error('❌ Failed to create order:', error);
      toast.error('❌ Failed to create order');
    },
  });

  // Update order (offline-aware)
  const updateOrderMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      updates 
    }: { 
      orderId: string; 
      updates: Partial<OfflineOrder> 
    }): Promise<OfflineOrder> => {
      
      const existingOrder = offlineOrders.find(o => o.id === orderId);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      const updatedOrder: OfflineOrder = {
        ...existingOrder,
        ...updates,
        lastModified: Date.now(),
        syncStatus: isOnline ? 'syncing' : 'pending',
        isOffline: !isOnline,
      };

      if (isOnline) {
        try {
          const { error } = await supabase
            .from('pos_orders')
            .update(updates)
            .eq('id', orderId);

          if (error) throw error;

          updatedOrder.syncStatus = 'synced';
          updatedOrder.isOffline = false;
          await offlineStorage.storeOffline('orders', orderId, updatedOrder, 'update');
          await offlineStorage.markAsSynced('orders', orderId);

          toast.success('✅ Order updated online');

        } catch (error) {
          console.error('❌ Failed to update order online, storing offline:', error);
          
          updatedOrder.syncStatus = 'pending';
          await offlineStorage.storeOffline('orders', orderId, updatedOrder, 'update');
          
          toast.warn('⚠️ Order updated offline - will sync when connection is restored');
        }
      } else {
        await offlineStorage.storeOffline('orders', orderId, updatedOrder, 'update');
        toast.info('📱 Order updated offline - will sync when online');
      }

      return updatedOrder;
    },
    onSuccess: (updatedOrder) => {
      setOfflineOrders(prev => 
        prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (error) => {
      console.error('❌ Failed to update order:', error);
      toast.error('❌ Failed to update order');
    },
  });

  // Delete order (offline-aware)
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string): Promise<void> => {
      if (isOnline) {
        try {
          const { error } = await supabase
            .from('pos_orders')
            .delete()
            .eq('id', orderId);

          if (error) throw error;

          await offlineStorage.storeOffline('orders', orderId, { id: orderId }, 'delete');
          toast.success('✅ Order deleted');

        } catch (error) {
          console.error('❌ Failed to delete order online:', error);
          
          // Mark for deletion offline
          await offlineStorage.storeOffline('orders', orderId, { id: orderId }, 'delete');
          toast.warn('⚠️ Order marked for deletion - will sync when connection is restored');
        }
      } else {
        // Mark for deletion offline
        await offlineStorage.storeOffline('orders', orderId, { id: orderId }, 'delete');
        toast.info('📱 Order marked for deletion - will sync when online');
      }
    },
    onSuccess: (_, orderId) => {
      setOfflineOrders(prev => prev.filter(order => order.id !== orderId));
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
    },
    onError: (error) => {
      console.error('❌ Failed to delete order:', error);
      toast.error('❌ Failed to delete order');
    },
  });

  // Get orders (combines online and offline)
  const ordersQuery = useQuery({
    queryKey: ['orders', 'offline-aware'],
    queryFn: async (): Promise<OfflineOrder[]> => {
      let allOrders: OfflineOrder[] = [];

      // Get offline orders
      const offlineData = await offlineStorage.getOfflineData('orders');
      allOrders = offlineData || [];

      // If online, also get fresh data from server
      if (isOnline) {
        try {
          const { data: serverOrders, error } = await supabase
            .from('pos_orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (!error && serverOrders) {
            // Merge server orders with offline orders, avoiding duplicates
            const serverOrdersWithFlags = serverOrders.map(order => ({
              ...order,
              isOffline: false,
              syncStatus: 'synced' as const,
              lastModified: Date.now(),
            }));

            // Create a map of existing offline orders by ID
            const offlineOrderMap = new Map(allOrders.map(order => [order.id, order]));

            // Add server orders that aren't already in offline storage
            serverOrdersWithFlags.forEach(serverOrder => {
              if (!offlineOrderMap.has(serverOrder.id)) {
                allOrders.push(serverOrder);
              }
            });
          }
        } catch (error) {
          console.error('❌ Failed to fetch server orders:', error);
        }
      }

      // Sort by creation date (newest first)
      return allOrders.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    },
    refetchInterval: isOnline ? 30000 : false, // Refetch every 30 seconds when online
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Get unsynced orders count
  const getUnsyncedCount = async (): Promise<number> => {
    try {
      const unsyncedOrders = await offlineStorage.getUnsyncedData('orders');
      return unsyncedOrders.length;
    } catch (error) {
      console.error('❌ Failed to get unsynced count:', error);
      return 0;
    }
  };

  // Manual sync function
  const manualSync = async (): Promise<void> => {
    if (!isOnline) {
      toast.error('❌ Cannot sync: device is offline');
      return;
    }

    try {
      const result = await syncService.startSync();
      await loadOfflineOrders();
      
      if (result.success) {
        toast.success(`✅ Sync completed: ${result.syncedCount} items synced`);
      } else {
        toast.error(`⚠️ Sync failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      toast.error('❌ Synchronization failed');
    }
  };

  return {
    // Mutations
    createOrder: createOrderMutation.mutate,
    updateOrder: updateOrderMutation.mutate,
    deleteOrder: deleteOrderMutation.mutate,
    
    // Query
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    
    // Offline-specific data
    offlineOrders,
    isOnline,
    
    // Sync functions
    syncOrders: manualSync,
    getUnsyncedCount,
    
    // Status
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
    
    // Refresh
    refetch: ordersQuery.refetch,
  };
}

// Hook to get sync status for orders
export function useOrderSyncStatus() {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const updateCount = async () => {
      try {
        const unsynced = await offlineStorage.getUnsyncedData('orders');
        setUnsyncedCount(unsynced.length);
      } catch (error) {
        console.error('❌ Failed to update unsynced count:', error);
      }
    };

    updateCount();
    
    // Update count every 30 seconds
    const interval = setInterval(updateCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    unsyncedCount,
    isOnline,
    hasUnsyncedData: unsyncedCount > 0,
  };
}

export type { OfflineOrder }; 