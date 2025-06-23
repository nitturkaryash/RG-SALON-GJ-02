// Offline-aware inventory hook
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { offlineStorage } from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkService';
import { syncService } from '../utils/syncService';
import { supabase } from '../supabaseClient';
import { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  category?: string;
  hsn_code?: string;
  units?: string;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
  isOffline?: boolean;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'error';
  lastModified?: number;
}

interface InventoryUpdate {
  id: string;
  quantity?: number;
  unit_price?: number;
  product_name?: string;
  category?: string;
  stock_quantity?: number;
}

export function useOfflineInventory() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const [offlineItems, setOfflineItems] = useState<InventoryItem[]>([]);

  // Load offline inventory on mount
  useEffect(() => {
    loadOfflineInventory();
  }, []);

  // Watch for network status changes
  useEffect(() => {
    if (isOnline) {
      syncOfflineInventory();
    }
  }, [isOnline]);

  const loadOfflineInventory = async () => {
    try {
      const items = await offlineStorage.getOfflineData('inventory');
      setOfflineItems(items || []);
    } catch (error) {
      console.error('❌ Failed to load offline inventory:', error);
    }
  };

  const syncOfflineInventory = async () => {
    try {
      const result = await syncService.startSync();
      if (result.success) {
        await loadOfflineInventory();
      }
    } catch (error) {
      console.error('❌ Failed to sync offline inventory:', error);
    }
  };

  // Update inventory item (offline-aware)
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      updates 
    }: { 
      itemId: string; 
      updates: InventoryUpdate 
    }): Promise<InventoryItem> => {
      
      const existingItem = offlineItems.find(item => item.id === itemId);
      const updatedItem: InventoryItem = {
        id: itemId,
        product_name: '',
        quantity: 0,
        unit_price: 0,
        ...existingItem,
        ...updates,
        lastModified: Date.now(),
        syncStatus: isOnline ? 'syncing' : 'pending',
        isOffline: !isOnline,
      };

      if (isOnline) {
        try {
          const { error } = await supabase
            .from('inventory')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', itemId);

          if (error) throw error;

          updatedItem.syncStatus = 'synced';
          updatedItem.isOffline = false;
          await offlineStorage.storeOffline('inventory', itemId, updatedItem, 'update');
          await offlineStorage.markAsSynced('inventory', itemId);

          toast.success('✅ Inventory updated online');

        } catch (error) {
          console.error('❌ Failed to update inventory online, storing offline:', error);
          
          updatedItem.syncStatus = 'pending';
          await offlineStorage.storeOffline('inventory', itemId, updatedItem, 'update');
          
          toast.warn('⚠️ Inventory updated offline - will sync when connection is restored');
        }
      } else {
        await offlineStorage.storeOffline('inventory', itemId, updatedItem, 'update');
        toast.info('📱 Inventory updated offline - will sync when online');
      }

      return updatedItem;
    },
    onSuccess: (updatedItem) => {
      setOfflineItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('❌ Failed to update inventory:', error);
      toast.error('❌ Failed to update inventory');
    },
  });

  // Create inventory item (offline-aware)
  const createInventoryMutation = useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
      const itemId = uuidv4();
      
      const item: InventoryItem = {
        ...itemData,
        id: itemId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOffline: !isOnline,
        syncStatus: isOnline ? 'syncing' : 'pending',
        lastModified: Date.now(),
      };

      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('inventory')
            .insert({
              id: item.id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              category: item.category,
              hsn_code: item.hsn_code,
              units: item.units,
              stock_quantity: item.stock_quantity,
              created_at: item.created_at,
              updated_at: item.updated_at,
            })
            .select()
            .single();

          if (error) throw error;

          item.syncStatus = 'synced';
          item.isOffline = false;
          await offlineStorage.storeOffline('inventory', item.id, item, 'create');
          await offlineStorage.markAsSynced('inventory', item.id);

          toast.success('✅ Inventory item created and saved online');
          
        } catch (error) {
          console.error('❌ Failed to save inventory online, storing offline:', error);
          
          item.isOffline = true;
          item.syncStatus = 'pending';
          await offlineStorage.storeOffline('inventory', item.id, item, 'create');
          
          toast.warn('⚠️ Inventory item saved offline - will sync when connection is restored');
        }
      } else {
        await offlineStorage.storeOffline('inventory', item.id, item, 'create');
        toast.info('📱 Inventory item saved offline - will sync when online');
      }

      return item;
    },
    onSuccess: (item) => {
      setOfflineItems(prev => [...prev, item]);
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('❌ Failed to create inventory item:', error);
      toast.error('❌ Failed to create inventory item');
    },
  });

  // Delete inventory item (offline-aware)
  const deleteInventoryMutation = useMutation({
    mutationFn: async (itemId: string): Promise<void> => {
      if (isOnline) {
        try {
          const { error } = await supabase
            .from('inventory')
            .delete()
            .eq('id', itemId);

          if (error) throw error;

          await offlineStorage.storeOffline('inventory', itemId, { id: itemId }, 'delete');
          toast.success('✅ Inventory item deleted');

        } catch (error) {
          console.error('❌ Failed to delete inventory item online:', error);
          
          await offlineStorage.storeOffline('inventory', itemId, { id: itemId }, 'delete');
          toast.warn('⚠️ Inventory item marked for deletion - will sync when connection is restored');
        }
      } else {
        await offlineStorage.storeOffline('inventory', itemId, { id: itemId }, 'delete');
        toast.info('📱 Inventory item marked for deletion - will sync when online');
      }
    },
    onSuccess: (_, itemId) => {
      setOfflineItems(prev => prev.filter(item => item.id !== itemId));
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('❌ Failed to delete inventory item:', error);
      toast.error('❌ Failed to delete inventory item');
    },
  });

  // Get inventory items (combines online and offline)
  const inventoryQuery = useQuery({
    queryKey: ['inventory', 'offline-aware'],
    queryFn: async (): Promise<InventoryItem[]> => {
      let allItems: InventoryItem[] = [];

      // Get offline items
      const offlineData = await offlineStorage.getOfflineData('inventory');
      allItems = offlineData || [];

      // If online, also get fresh data from server
      if (isOnline) {
        try {
          const { data: serverItems, error } = await supabase
            .from('inventory')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && serverItems) {
            const serverItemsWithFlags = serverItems.map(item => ({
              ...item,
              isOffline: false,
              syncStatus: 'synced' as const,
              lastModified: Date.now(),
            }));

            // Create a map of existing offline items by ID
            const offlineItemMap = new Map(allItems.map(item => [item.id, item]));

            // Add server items that aren't already in offline storage
            serverItemsWithFlags.forEach(serverItem => {
              if (!offlineItemMap.has(serverItem.id)) {
                allItems.push(serverItem);
              }
            });
          }
        } catch (error) {
          console.error('❌ Failed to fetch server inventory:', error);
        }
      }

      return allItems.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    },
    refetchInterval: isOnline ? 30000 : false,
    staleTime: 10000,
  });

  // Manual sync function
  const manualSync = async (): Promise<void> => {
    if (!isOnline) {
      toast.error('❌ Cannot sync: device is offline');
      return;
    }

    try {
      const result = await syncService.startSync();
      await loadOfflineInventory();
      
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
    createInventoryItem: createInventoryMutation.mutate,
    updateInventoryItem: updateInventoryMutation.mutate,
    deleteInventoryItem: deleteInventoryMutation.mutate,
    
    // Query
    inventoryItems: inventoryQuery.data || [],
    isLoading: inventoryQuery.isLoading,
    error: inventoryQuery.error,
    
    // Offline-specific data
    offlineItems,
    isOnline,
    
    // Sync functions
    syncInventory: manualSync,
    
    // Status
    isCreating: createInventoryMutation.isPending,
    isUpdating: updateInventoryMutation.isPending,
    isDeleting: deleteInventoryMutation.isPending,
    
    // Refresh
    refetch: inventoryQuery.refetch,
  };
}

export type { InventoryItem, InventoryUpdate }; 