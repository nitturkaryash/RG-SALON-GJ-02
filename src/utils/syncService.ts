// Data synchronization service
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { offlineStorage } from './offlineStorage';
import { networkService } from './networkService';
import { toast } from 'react-toastify';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'completed';

type SyncResult = {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
};

type ConflictResolution = 'server' | 'local' | 'merge' | 'skip';

interface SyncConflict {
  id: string;
  table: string;
  localData: any;
  serverData: any;
  lastModified: {
    local: number;
    server: string;
  };
}

class SyncService {
  private isActive = false;
  private syncStatus: SyncStatus = 'idle';
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private conflicts: SyncConflict[] = [];
  private maxRetries = 3;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for network status changes
    networkService.addListener((status) => {
      if (status.isOnline && !this.isActive) {
        console.log('🔄 Network back online, starting sync...');
        this.startSync();
      }
    });

    // Start periodic sync when online
    this.startPeriodicSync();
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (networkService.isOnline() && !this.isActive) {
        this.startSync();
      }
    }, 5 * 60 * 1000);
  }

  private notifyListeners(status: SyncStatus): void {
    this.syncStatus = status;
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('❌ Error notifying sync listener:', error);
      }
    });
  }

  public addListener(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public getStatus(): SyncStatus {
    return this.syncStatus;
  }

  public getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  public async startSync(): Promise<SyncResult> {
    if (this.isActive) {
      console.log('⚠️ Sync already in progress');
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Sync already in progress'] };
    }

    if (!networkService.isOnline()) {
      console.log('📡 Cannot sync: offline');
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Device is offline'] };
    }

    this.isActive = true;
    this.notifyListeners('syncing');

    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      console.log('🔄 Starting data synchronization...');

      // First, download server data to detect conflicts
      await this.downloadServerData();

      // Then sync local changes to server
      const tables = ['orders', 'appointments', 'inventory', 'clients', 'services'] as const;

      for (const table of tables) {
        try {
          const tableResult = await this.syncTable(table);
          result.syncedCount += tableResult.syncedCount;
          result.failedCount += tableResult.failedCount;
          result.errors.push(...tableResult.errors);
        } catch (error) {
          console.error(`❌ Failed to sync table ${table}:`, error);
          result.failedCount++;
          result.errors.push(`Failed to sync ${table}: ${error}`);
        }
      }

      // Clean up successfully synced items from sync queue
      await this.cleanupSyncQueue();

      if (result.failedCount === 0) {
        this.notifyListeners('completed');
        toast.success(`✅ Sync completed: ${result.syncedCount} items synced`);
      } else {
        this.notifyListeners('error');
        toast.error(`⚠️ Sync completed with errors: ${result.failedCount} failed`);
      }

      console.log('✅ Sync completed:', result);
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
      this.notifyListeners('error');
      toast.error('❌ Data synchronization failed');
    } finally {
      this.isActive = false;
      setTimeout(() => {
        if (this.syncStatus !== 'syncing') {
          this.notifyListeners('idle');
        }
      }, 2000);
    }

    return result;
  }

  private async downloadServerData(): Promise<void> {
    const tables = ['orders', 'appointments', 'inventory', 'clients', 'services'];
    
    for (const table of tables) {
      try {
        const { data: serverData, error } = await supabase
          .from(this.getSupabaseTableName(table))
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000); // Limit to recent data

        if (error) {
          console.error(`❌ Failed to download ${table} data:`, error);
          continue;
        }

        if (serverData && serverData.length > 0) {
          // Store server data for conflict detection
          await offlineStorage.setAppData(`server_${table}`, serverData);
          console.log(`📥 Downloaded ${serverData.length} ${table} records`);
        }
      } catch (error) {
        console.error(`❌ Error downloading ${table} data:`, error);
      }
    }
  }

  private async syncTable(table: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      // Get unsynced data from offline storage
      const unsyncedData = await offlineStorage.getUnsyncedData(table as any);
      
      if (unsyncedData.length === 0) {
        console.log(`✅ No unsynced data for ${table}`);
        return result;
      }

      console.log(`🔄 Syncing ${unsyncedData.length} ${table} records...`);

      for (const record of unsyncedData) {
        try {
          const syncSuccess = await this.syncRecord(table, record);
          if (syncSuccess) {
            result.syncedCount++;
            await offlineStorage.markAsSynced(table as any, record.id);
          } else {
            result.failedCount++;
          }
        } catch (error) {
          console.error(`❌ Failed to sync ${table} record ${record.id}:`, error);
          result.failedCount++;
          result.errors.push(`${table}/${record.id}: ${error}`);
        }
      }

    } catch (error) {
      console.error(`❌ Error syncing table ${table}:`, error);
      result.success = false;
      result.errors.push(`Table sync error: ${error}`);
    }

    return result;
  }

  private async syncRecord(table: string, record: any): Promise<boolean> {
    const supabaseTable = this.getSupabaseTableName(table);
    
    try {
      switch (record.operation) {
        case 'create':
          const { error: createError } = await supabase
            .from(supabaseTable)
            .insert(record.data);
          
          if (createError) {
            console.error(`❌ Failed to create ${table} record:`, createError);
            return false;
          }
          break;

        case 'update':
          const { error: updateError } = await supabase
            .from(supabaseTable)
            .update(record.data)
            .eq('id', record.data.id);
          
          if (updateError) {
            console.error(`❌ Failed to update ${table} record:`, updateError);
            return false;
          }
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from(supabaseTable)
            .delete()
            .eq('id', record.data.id);
          
          if (deleteError) {
            console.error(`❌ Failed to delete ${table} record:`, deleteError);
            return false;
          }
          break;

        default:
          console.error(`❌ Unknown operation: ${record.operation}`);
          return false;
      }

      console.log(`✅ Synced ${table} record: ${record.id}`);
      return true;

    } catch (error) {
      console.error(`❌ Error syncing ${table} record:`, error);
      return false;
    }
  }

  private getSupabaseTableName(table: string): string {
    // Map offline storage table names to Supabase table names
    const tableMap: Record<string, string> = {
      orders: 'pos_orders',
      appointments: 'appointments',
      inventory: 'inventory',
      clients: 'clients',
      services: 'services',
    };

    return tableMap[table] || table;
  }

  private async cleanupSyncQueue(): Promise<void> {
    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      const successfulItems = syncQueue.filter(item => item.retries === 0);

      for (const item of successfulItems) {
        await offlineStorage.removeFromSyncQueue(item.id);
      }

      console.log(`🧹 Cleaned up ${successfulItems.length} synced items from queue`);
    } catch (error) {
      console.error('❌ Failed to cleanup sync queue:', error);
    }
  }

  public async resolveConflict(
    conflictId: string, 
    resolution: ConflictResolution
  ): Promise<boolean> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      console.error(`❌ Conflict not found: ${conflictId}`);
      return false;
    }

    try {
      let resolvedData: any;

      switch (resolution) {
        case 'server':
          resolvedData = conflict.serverData;
          break;
        case 'local':
          resolvedData = conflict.localData;
          break;
        case 'merge':
          resolvedData = this.mergeData(conflict.localData, conflict.serverData);
          break;
        case 'skip':
          // Remove from conflicts without syncing
          this.conflicts = this.conflicts.filter(c => c.id !== conflictId);
          return true;
        default:
          console.error(`❌ Unknown resolution: ${resolution}`);
          return false;
      }

      // Update server with resolved data
      const { error } = await supabase
        .from(this.getSupabaseTableName(conflict.table))
        .update(resolvedData)
        .eq('id', conflict.id);

      if (error) {
        console.error(`❌ Failed to resolve conflict:`, error);
        return false;
      }

      // Update local storage
      await offlineStorage.storeOffline(
        conflict.table as any,
        conflict.id,
        resolvedData,
        'update'
      );

      // Mark as synced
      await offlineStorage.markAsSynced(conflict.table as any, conflict.id);

      // Remove from conflicts
      this.conflicts = this.conflicts.filter(c => c.id !== conflictId);

      console.log(`✅ Resolved conflict for ${conflict.table}/${conflict.id}`);
      return true;

    } catch (error) {
      console.error(`❌ Error resolving conflict:`, error);
      return false;
    }
  }

  private mergeData(localData: any, serverData: any): any {
    // Simple merge strategy - prefer local data for user-modified fields
    // and server data for system fields
    return {
      ...serverData,
      ...localData,
      // Always use server timestamps for consistency
      created_at: serverData.created_at,
      updated_at: new Date().toISOString(),
    };
  }

  public async forcePullFromServer(): Promise<boolean> {
    if (!networkService.isOnline()) {
      toast.error('❌ Cannot pull data: device is offline');
      return false;
    }

    try {
      this.notifyListeners('syncing');
      
      const tables = ['orders', 'appointments', 'inventory', 'clients', 'services'];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(this.getSupabaseTableName(table))
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`❌ Failed to pull ${table} data:`, error);
          continue;
        }

        if (data) {
          // Clear existing data and replace with server data
          for (const item of data) {
            await offlineStorage.storeOffline(
              table as any,
              item.id,
              item,
              'update'
            );
            await offlineStorage.markAsSynced(table as any, item.id);
          }
        }
      }

      this.notifyListeners('completed');
      toast.success('✅ Successfully pulled latest data from server');
      return true;

    } catch (error) {
      console.error('❌ Failed to pull from server:', error);
      this.notifyListeners('error');
      toast.error('❌ Failed to pull data from server');
      return false;
    }
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
    this.isActive = false;
  }
}

// Export singleton instance
export const syncService = new SyncService();

// React hook for sync status
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());

  useEffect(() => {
    const unsubscribe = syncService.addListener(setStatus);
    return unsubscribe;
  }, []);

  return {
    status,
    conflicts: syncService.getConflicts(),
    startSync: () => syncService.startSync(),
    resolveConflict: (id: string, resolution: ConflictResolution) => 
      syncService.resolveConflict(id, resolution),
    forcePull: () => syncService.forcePullFromServer(),
  };
}

// Export types
export type { SyncStatus, SyncResult, ConflictResolution, SyncConflict };
export { SyncService }; 