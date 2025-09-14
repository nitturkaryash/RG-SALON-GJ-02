// Enhanced hook for hybrid data operations with Supabase fallback
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  hybridDataService,
  DataOperation,
  SyncDirection,
} from '../utils/hybridDataService';
import { networkService, useNetworkStatus } from '../utils/networkService';

interface UseHybridDataOptions {
  table: string;
  autoSync?: boolean;
  syncInterval?: number;
  conflictResolution?: 'local-wins' | 'remote-wins' | 'latest-wins' | 'manual';
  enableCache?: boolean;
}

interface HybridDataResult<T = any> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  source: 'cache' | 'local' | 'remote' | 'hybrid';
  lastSync: number | null;
  isSupabaseDown: boolean;

  // Operations
  create: (
    data: Partial<T>
  ) => Promise<{ success: boolean; source: string; id?: string }>;
  update: (
    id: string,
    data: Partial<T>
  ) => Promise<{ success: boolean; source: string }>;
  remove: (id: string) => Promise<{ success: boolean; source: string }>;

  // Sync operations
  syncNow: (direction?: SyncDirection) => Promise<void>;
  getSyncStatus: () => { pending: number; conflicts: number };

  // Utility
  refresh: () => Promise<void>;
  clearCache: () => void;
  retryWithLocalData: () => Promise<void>;
}

export function useHybridData<T = any>(
  options: UseHybridDataOptions
): HybridDataResult<T> {
  const {
    table,
    autoSync = true,
    syncInterval = 30000,
    conflictResolution = 'latest-wins',
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'cache' | 'local' | 'remote' | 'hybrid'>(
    'cache'
  );
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [isSupabaseDown, setIsSupabaseDown] = useState(false);

  const networkStatus = useNetworkStatus();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data with hybrid approach
  const loadData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        const result = await hybridDataService.retrieve(table);

        setData(result.data);
        setSource(result.source);
        setLastSync(result.timestamp);

        // Check if we're using local data due to Supabase being down
        setIsSupabaseDown(result.source === 'local' && networkStatus.isOnline);

        console.log(
          `📊 Loaded ${result.data.length} records from ${result.source} for table: ${table}`
        );
      } catch (err) {
        console.error(`❌ Failed to load data for table: ${table}`, err);
        setError(err instanceof Error ? err.message : 'Failed to load data');

        // Try to fall back to local data only
        try {
          const fallbackResult = await hybridDataService.retrieve(table);
          if (fallbackResult.data.length > 0) {
            setData(fallbackResult.data);
            setSource('local');
            setIsSupabaseDown(true);
            console.log(
              `🔄 Fell back to local data: ${fallbackResult.data.length} records`
            );
          }
        } catch (fallbackErr) {
          console.error('❌ Fallback to local data also failed:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [table, networkStatus.isOnline]
  );

  // Create operation
  const create = useCallback(
    async (newData: Partial<T>) => {
      const id = crypto.randomUUID();
      const dataWithId = { ...newData, id } as T;

      try {
        const result = await hybridDataService.store(
          table,
          id,
          dataWithId,
          'create'
        );

        if (result.success) {
          // Optimistically update local state
          setData(prev => [...prev, dataWithId]);

          return {
            success: true,
            source: result.source,
            id,
          };
        } else {
          throw new Error(result.error || 'Failed to create record');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Create operation failed';
        setError(errorMessage);
        return {
          success: false,
          source: 'failed',
        };
      }
    },
    [table]
  );

  // Update operation
  const update = useCallback(
    async (id: string, updateData: Partial<T>) => {
      try {
        // Get current data for optimistic update
        const currentRecord = data.find(item => (item as any).id === id);
        if (!currentRecord) {
          throw new Error('Record not found');
        }

        const updatedRecord = { ...currentRecord, ...updateData } as T;

        const result = await hybridDataService.store(
          table,
          id,
          updatedRecord,
          'update'
        );

        if (result.success) {
          // Optimistically update local state
          setData(prev =>
            prev.map(item => ((item as any).id === id ? updatedRecord : item))
          );

          return {
            success: true,
            source: result.source,
          };
        } else {
          throw new Error(result.error || 'Failed to update record');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Update operation failed';
        setError(errorMessage);
        return {
          success: false,
          source: 'failed',
        };
      }
    },
    [table, data]
  );

  // Delete operation
  const remove = useCallback(
    async (id: string) => {
      try {
        const result = await hybridDataService.store(
          table,
          id,
          { deleted: true },
          'delete'
        );

        if (result.success) {
          // Optimistically update local state
          setData(prev => prev.filter(item => (item as any).id !== id));

          return {
            success: true,
            source: result.source,
          };
        } else {
          throw new Error(result.error || 'Failed to delete record');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Delete operation failed';
        setError(errorMessage);
        return {
          success: false,
          source: 'failed',
        };
      }
    },
    [table]
  );

  // Manual sync
  const syncNow = useCallback(
    async (direction: SyncDirection = 'bidirectional') => {
      try {
        setError(null);
        console.log(`🔄 Starting manual sync for table: ${table}`);

        const result = await hybridDataService.syncBidirectional(
          table,
          direction
        );

        if (result.success) {
          console.log(
            `✅ Sync completed: ${result.localToRemote} to remote, ${result.remoteToLocal} from remote`
          );
          setLastSync(Date.now());
          setIsSupabaseDown(false);

          // Refresh data after sync
          await loadData(false);
        } else {
          console.warn('⚠️ Sync had issues:', result.errors);
          setError(`Sync issues: ${result.errors.join(', ')}`);
          setIsSupabaseDown(true);
        }
      } catch (err) {
        console.error('❌ Manual sync failed:', err);
        setError(err instanceof Error ? err.message : 'Sync failed');
        setIsSupabaseDown(true);
      }
    },
    [table, loadData]
  );

  // Get sync status
  const getSyncStatus = useCallback(() => {
    return hybridDataService.getSyncQueueStatus();
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Clear cache
  const clearCache = useCallback(() => {
    hybridDataService.clearCache();
  }, []);

  // Retry with local data only
  const retryWithLocalData = useCallback(async () => {
    console.log('🔄 Retrying with local data only...');
    setIsLoading(true);
    setError(null);

    try {
      // Force local-only retrieval by temporarily bypassing network check
      const result = await hybridDataService.retrieve(table);
      setData(result.data);
      setSource('local');
      setIsSupabaseDown(true);
      console.log(`📱 Using local data: ${result.data.length} records`);
    } catch (err) {
      console.error('❌ Local data retrieval failed:', err);
      setError('No local data available');
    } finally {
      setIsLoading(false);
    }
  }, [table]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-sync when network status changes
  useEffect(() => {
    if (networkStatus.isOnline && autoSync) {
      // Delay sync to avoid immediate retries
      retryTimeoutRef.current = setTimeout(() => {
        syncNow('bidirectional').catch(err => {
          console.warn('⚠️ Auto-sync failed:', err);
        });
      }, 2000);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [networkStatus.isOnline, autoSync, syncNow]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSync && networkStatus.isOnline) {
      syncIntervalRef.current = setInterval(() => {
        syncNow('bidirectional').catch(err => {
          console.warn('⚠️ Scheduled sync failed:', err);
        });
      }, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, networkStatus.isOnline, syncInterval, syncNow]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    source,
    lastSync,
    isSupabaseDown,
    create,
    update,
    remove,
    syncNow,
    getSyncStatus,
    refresh,
    clearCache,
    retryWithLocalData,
  };
}

// Hook for specific table types
export function useHybridOrders() {
  return useHybridData({
    table: 'orders',
    autoSync: true,
    syncInterval: 15000,
  });
}

export function useHybridClients() {
  return useHybridData({
    table: 'clients',
    autoSync: true,
    syncInterval: 30000,
  });
}

export function useHybridAppointments() {
  return useHybridData({
    table: 'appointments',
    autoSync: true,
    syncInterval: 10000,
  });
}

export function useHybridInventory() {
  return useHybridData({
    table: 'products',
    autoSync: true,
    syncInterval: 60000,
  });
}

export function useHybridServices() {
  return useHybridData({
    table: 'services',
    autoSync: true,
    syncInterval: 300000,
  }); // 5 minutes
}
