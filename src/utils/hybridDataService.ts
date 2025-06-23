// Hybrid Data Service - Stores data both locally and in Supabase
import { supabase } from '../supabaseClient';
import { offlineStorage } from './offlineStorage';
import { networkService } from './networkService';
import { toast } from 'react-toastify';

export type DataOperation = 'create' | 'update' | 'delete';
export type SyncDirection = 'local-to-remote' | 'remote-to-local' | 'bidirectional';

interface DataRecord {
  id: string;
  data: any;
  table: string;
  lastModified: number;
  version: number;
  checksum: string;
  source: 'local' | 'remote' | 'synced';
  operation?: DataOperation;
  synced?: boolean;
}

interface SyncConflict {
  id: string;
  table: string;
  localData: DataRecord;
  remoteData: DataRecord;
  conflictType: 'timestamp' | 'version' | 'content';
}

interface HybridDataOptions {
  maxRetries: number;
  syncTimeout: number;
  conflictResolution: 'local-wins' | 'remote-wins' | 'latest-wins' | 'manual';
  enableCache: boolean;
  cacheTimeout: number;
  offlineFirst: boolean;
}

class HybridDataService {
  private cache: Map<string, DataRecord> = new Map();
  private syncQueue: Map<string, DataRecord> = new Map();
  private conflicts: SyncConflict[] = [];
  private options: HybridDataOptions;

  constructor(options: Partial<HybridDataOptions> = {}) {
    this.options = {
      maxRetries: 3,
      syncTimeout: 10000, // 10 seconds
      conflictResolution: 'latest-wins',
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      offlineFirst: true, // Always prioritize local operations
      ...options,
    };
  }

  // Generate checksum for data integrity
  private generateChecksum(data: any): string {
    try {
      return btoa(JSON.stringify(data)).slice(0, 16);
    } catch (error) {
      return 'invalid-checksum';
    }
  }

  // Check if Supabase is responsive (with timeout and error handling)
  private async isSupabaseResponsive(): Promise<boolean> {
    if (!networkService.isOnline()) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 seconds

      // Use a simple query that should work on any table
      const { error } = await supabase
        .from('clients') // Use a table that likely exists
        .select('count', { count: 'exact', head: true })
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);
      
      // If no error or just a permission error, Supabase is responsive
      if (!error || error.message.includes('permission') || error.message.includes('policy')) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn('⚠️ Supabase connectivity check failed:', error);
      return false;
    }
  }

  // Store data with offline-first approach
  async store(table: string, id: string, data: any, operation: DataOperation = 'create'): Promise<{
    success: boolean;
    source: 'both' | 'local-only' | 'failed';
    error?: string;
  }> {
    const timestamp = Date.now();
    const checksum = this.generateChecksum(data);
    
    const record: DataRecord = {
      id,
      data: { ...data, id },
      table,
      lastModified: timestamp,
      version: 1,
      checksum,
      source: 'local',
      operation,
      synced: false,
    };

    // ALWAYS store locally first - this should NEVER fail
    try {
      await offlineStorage.storeOffline(table, id, record, operation);
      console.log(`📱 Stored locally: ${table}/${id} (${operation})`);

      // Update cache
      if (this.options.enableCache) {
        this.cache.set(`${table}:${id}`, record);
      }

      // Add to sync queue for later synchronization
      this.syncQueue.set(`${table}:${id}`, record);

      // Try to sync to remote if possible (but don't let it fail the operation)
      this.tryRemoteSync(table, id, data, operation, record).catch(error => {
        console.warn(`⚠️ Background sync failed for ${table}/${id}:`, error);
      });

      // Always return success for local storage
      toast.success(`✅ ${operation} operation completed successfully`);
      return {
        success: true,
        source: 'local-only', // We'll update this when remote sync succeeds
        error: undefined,
      };

    } catch (error) {
      console.error(`❌ Failed to store locally: ${table}/${id}`, error);
      toast.error(`❌ Failed to ${operation} data locally`);
      return {
        success: false,
        source: 'failed',
        error: `Local storage failed: ${error}`,
      };
    }
  }

  // Background remote sync (non-blocking)
  private async tryRemoteSync(
    table: string, 
    id: string, 
    data: any, 
    operation: DataOperation,
    record: DataRecord
  ): Promise<void> {
    if (!this.options.offlineFirst && !networkService.isOnline()) {
      return;
    }

    try {
      const isResponsive = await this.isSupabaseResponsive();
      
      if (!isResponsive) {
        console.info(`📡 Supabase not responsive, keeping ${table}/${id} in sync queue`);
        return;
      }

      let supabaseResult;
      
      switch (operation) {
        case 'create':
          supabaseResult = await supabase
            .from(table)
            .insert({ ...data, id, last_modified: new Date().toISOString() });
          break;
        
        case 'update':
          supabaseResult = await supabase
            .from(table)
            .update({ ...data, last_modified: new Date().toISOString() })
            .eq('id', id);
          break;
        
        case 'delete':
          supabaseResult = await supabase
            .from(table)
            .delete()
            .eq('id', id);
          break;
      }

      if (supabaseResult.error) {
        throw supabaseResult.error;
      }

      // Mark as synced
      record.source = 'synced';
      record.synced = true;
      await offlineStorage.markAsSynced(table, id);
      this.syncQueue.delete(`${table}:${id}`);
      
      console.log(`☁️ Synced to remote: ${table}/${id}`);
      
    } catch (error) {
      console.warn(`⚠️ Remote sync failed for ${table}/${id}:`, error);
      // Keep in sync queue for retry later
    }
  }

  // Retrieve data with intelligent fallback
  async retrieve(table: string, id?: string): Promise<{
    data: any[];
    source: 'cache' | 'local' | 'remote' | 'hybrid';
    timestamp: number;
  }> {
    const cacheKey = id ? `${table}:${id}` : `${table}:all`;
    
    // Check cache first
    if (this.options.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.lastModified < this.options.cacheTimeout) {
        return {
          data: [cached.data],
          source: 'cache',
          timestamp: cached.lastModified,
        };
      }
    }

    let remoteData: any[] = [];
    let localData: any[] = [];
    let remoteSuccess = false;
    let localSuccess = false;

    // ALWAYS get local data first (offline-first approach)
    try {
      const data = await offlineStorage.getOfflineData(table, id);
      if (data) {
        localData = Array.isArray(data) ? data : [data];
        localSuccess = true;
        console.log(`📱 Retrieved from local storage: ${table} (${localData.length} records)`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to retrieve from local storage: ${table}`, error);
    }

    // Try remote only if we have network and it's responsive
    if (networkService.isOnline()) {
      try {
        const isResponsive = await this.isSupabaseResponsive();
        
        if (isResponsive) {
          let query = supabase.from(table).select('*');
          
          if (id) {
            query = query.eq('id', id);
          }

          const { data, error } = await query.order('last_modified', { ascending: false });

          if (!error && data) {
            remoteData = data;
            remoteSuccess = true;
            console.log(`☁️ Retrieved from Supabase: ${table} (${data.length} records)`);

            // Update cache and local storage with remote data
            if (this.options.enableCache) {
              data.forEach(item => {
                const record: DataRecord = {
                  id: item.id,
                  data: item,
                  table,
                  lastModified: Date.now(),
                  version: 1,
                  checksum: this.generateChecksum(item),
                  source: 'remote',
                  synced: true,
                };
                this.cache.set(`${table}:${item.id}`, record);
              });
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to retrieve from Supabase: ${table}`, error);
        // Continue with local data
      }
    }

    // Determine best data source
    let finalData: any[] = [];
    let source: 'cache' | 'local' | 'remote' | 'hybrid';

    if (localSuccess && remoteSuccess) {
      // Merge and resolve conflicts
      finalData = this.mergeData(remoteData, localData);
      source = 'hybrid';
    } else if (localSuccess) {
      finalData = localData;
      source = 'local';
      if (networkService.isOnline()) {
        toast.info(`📱 Using offline data - Supabase unavailable`);
      }
    } else if (remoteSuccess) {
      finalData = remoteData;
      source = 'remote';
    } else {
      finalData = [];
      source = 'local';
      console.warn(`⚠️ No data available for table: ${table}`);
    }

    return {
      data: finalData,
      source,
      timestamp: Date.now(),
    };
  }

  // Merge remote and local data intelligently
  private mergeData(remoteData: any[], localData: any[]): any[] {
    const merged = new Map<string, any>();
    
    // Add remote data first
    remoteData.forEach(item => {
      merged.set(item.id, { ...item, _source: 'remote' });
    });

    // Merge local data, handling conflicts
    localData.forEach(localItem => {
      const remoteItem = merged.get(localItem.id);
      
      if (!remoteItem) {
        // Local-only item (pending sync)
        merged.set(localItem.id, { ...localItem, _source: 'local-pending' });
      } else {
        // Conflict resolution based on timestamps
        const localTime = new Date(localItem.last_modified || localItem.lastModified || 0).getTime();
        const remoteTime = new Date(remoteItem.last_modified || remoteItem.lastModified || 0).getTime();

        switch (this.options.conflictResolution) {
          case 'latest-wins':
            if (localTime > remoteTime) {
              merged.set(localItem.id, { ...localItem, _source: 'local-latest' });
            }
            break;
          
          case 'local-wins':
            merged.set(localItem.id, { ...localItem, _source: 'local-priority' });
            break;
          
          case 'remote-wins':
            // Keep remote data (already set)
            break;
          
          case 'manual':
            // Store conflict for manual resolution
            this.conflicts.push({
              id: localItem.id,
              table: localItem.table || 'unknown',
              localData: localItem as DataRecord,
              remoteData: remoteItem as DataRecord,
              conflictType: 'timestamp',
            });
            break;
        }
      }
    });

    return Array.from(merged.values());
  }

  // Bidirectional sync (non-blocking for UI)
  async syncBidirectional(table: string, direction: SyncDirection = 'bidirectional'): Promise<{
    success: boolean;
    localToRemote: number;
    remoteToLocal: number;
    conflicts: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      localToRemote: 0,
      remoteToLocal: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    if (!networkService.isOnline()) {
      result.errors.push('Device is offline');
      result.success = false;
      return result;
    }

    try {
      const isResponsive = await this.isSupabaseResponsive();
      if (!isResponsive) {
        result.errors.push('Supabase is not responsive');
        result.success = false;
        return result;
      }

      // Sync local to remote
      if (direction === 'local-to-remote' || direction === 'bidirectional') {
        const unsyncedLocal = await offlineStorage.getUnsyncedData(table);
        
        for (const record of unsyncedLocal) {
          try {
            let supabaseResult;

            switch (record.operation) {
              case 'create':
                supabaseResult = await supabase
                  .from(table)
                  .insert({ ...record.data, last_modified: new Date().toISOString() });
                break;
              
              case 'update':
                supabaseResult = await supabase
                  .from(table)
                  .upsert({ ...record.data, last_modified: new Date().toISOString() });
                break;
              
              case 'delete':
                supabaseResult = await supabase
                  .from(table)
                  .delete()
                  .eq('id', record.id);
                break;
              
              default:
                supabaseResult = await supabase
                  .from(table)
                  .upsert({ ...record.data, last_modified: new Date().toISOString() });
            }

            if (!supabaseResult.error) {
              await offlineStorage.markAsSynced(table, record.id);
              this.syncQueue.delete(`${table}:${record.id}`);
              result.localToRemote++;
            } else {
              result.errors.push(`Failed to sync ${record.id}: ${supabaseResult.error.message}`);
            }
          } catch (error) {
            result.errors.push(`Error syncing ${record.id}: ${error}`);
          }
        }
      }

      // Sync remote to local
      if (direction === 'remote-to-local' || direction === 'bidirectional') {
        try {
          const { data: remoteData, error } = await supabase
            .from(table)
            .select('*')
            .order('last_modified', { ascending: false });

          if (!error && remoteData) {
            for (const item of remoteData) {
              try {
                const record: DataRecord = {
                  id: item.id,
                  data: item,
                  table,
                  lastModified: Date.now(),
                  version: 1,
                  checksum: this.generateChecksum(item),
                  source: 'remote',
                  synced: true,
                };
                
                await offlineStorage.storeOffline(table, item.id, record, 'update');
                await offlineStorage.markAsSynced(table, item.id);
                result.remoteToLocal++;
              } catch (error) {
                result.errors.push(`Failed to store locally ${item.id}: ${error}`);
              }
            }
          }
        } catch (error) {
          result.errors.push(`Failed to retrieve remote data: ${error}`);
        }
      }

      result.conflicts = this.conflicts.length;

    } catch (error) {
      result.errors.push(`Sync failed: ${error}`);
      result.success = false;
    }

    return result;
  }

  // Get sync queue status
  getSyncQueueStatus(): {
    pending: number;
    conflicts: number;
    lastSync: number | null;
  } {
    return {
      pending: this.syncQueue.size,
      conflicts: this.conflicts.length,
      lastSync: null, // TODO: Implement last sync tracking
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  // Get conflicts for manual resolution
  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  // Resolve conflict manually
  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<boolean> {
    const conflictIndex = this.conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex === -1) return false;

    const conflict = this.conflicts[conflictIndex];
    
    try {
      let resolvedData: any;
      
      switch (resolution) {
        case 'local':
          resolvedData = conflict.localData.data;
          break;
        case 'remote':
          resolvedData = conflict.remoteData.data;
          break;
        case 'merge':
          resolvedData = { ...conflict.remoteData.data, ...conflict.localData.data };
          break;
      }

      // Store resolved data
      await this.store(conflict.table, conflict.id, resolvedData, 'update');
      
      // Remove conflict
      this.conflicts.splice(conflictIndex, 1);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to resolve conflict:', error);
      return false;
    }
  }

  // Force offline mode (for testing or when Supabase is known to be down)
  setOfflineMode(offline: boolean): void {
    this.options.offlineFirst = offline;
    if (offline) {
      console.log('📱 Forced offline mode enabled');
      toast.info('📱 Switched to offline mode');
    } else {
      console.log('☁️ Online mode enabled');
      toast.info('☁️ Switched to online mode');
    }
  }
}

// Export singleton instance
export const hybridDataService = new HybridDataService();

// Export types
export type { DataRecord, SyncConflict, HybridDataOptions };
export { HybridDataService }; 