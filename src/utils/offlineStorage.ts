// Offline Storage Service using native IndexedDB
type OperationType = 'create' | 'update' | 'delete';

interface StorageRecord {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
  operation: OperationType;
}

interface SyncQueueItem {
  id: string;
  table: string;
  operation: OperationType;
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

interface AppDataRecord {
  key: string;
  value: any;
  timestamp: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'SalonDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Offline storage initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('synced', 'synced', { unique: false });
          orderStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id' });
          appointmentStore.createIndex('synced', 'synced', { unique: false });
          appointmentStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('synced', 'synced', { unique: false });
          inventoryStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('clients')) {
          const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
          clientStore.createIndex('synced', 'synced', { unique: false });
          clientStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('services')) {
          const serviceStore = db.createObjectStore('services', { keyPath: 'id' });
          serviceStore.createIndex('synced', 'synced', { unique: false });
          serviceStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncQueueStore.createIndex('table', 'table', { unique: false });
        }

        if (!db.objectStoreNames.contains('app_data')) {
          db.createObjectStore('app_data', { keyPath: 'key' });
        }
      };
    });
  }

  // Store data offline
  async storeOffline(
    table: string,
    id: string,
    data: any,
    operation: OperationType = 'create'
  ): Promise<void> {
    if (!this.db) await this.init();

    const record: StorageRecord = {
      id,
      data,
      timestamp: Date.now(),
      synced: false,
      operation,
    };

    try {
      if (table === 'sync_queue' || table === 'app_data') {
        throw new Error(`Cannot store ${table} data using this method`);
      }

      const transaction = this.db!.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      await this.promisifyRequest(store.put(record));
      
      // Also add to sync queue
      await this.addToSyncQueue(table, id, data, operation);
      
      console.log(`📦 Stored ${table} data offline:`, id);
    } catch (error) {
      console.error(`❌ Failed to store ${table} data offline:`, error);
      throw error;
    }
  }

  // Retrieve data from offline storage
  async getOfflineData(table: string, id?: string): Promise<any> {
    if (!this.db) await this.init();

    try {
      if (table === 'sync_queue' || table === 'app_data') {
        throw new Error(`Use specific methods for ${table} data`);
      }

      const transaction = this.db!.transaction([table], 'readonly');
      const store = transaction.objectStore(table);

      if (id) {
        const record = await this.promisifyRequest(store.get(id)) as StorageRecord;
        return record ? record.data : null;
      } else {
        const records = await this.promisifyRequest(store.getAll()) as StorageRecord[];
        return records.map(record => record.data);
      }
    } catch (error) {
      console.error(`❌ Failed to get ${table} data:`, error);
      return id ? null : [];
    }
  }

  // Get all unsynced data
  async getUnsyncedData(table: string): Promise<StorageRecord[]> {
    if (!this.db) await this.init();

    try {
      if (table === 'sync_queue' || table === 'app_data') {
        throw new Error(`Cannot get unsynced data for ${table}`);
      }

      const transaction = this.db!.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      const index = store.index('synced');
      
      // Use IDBKeyRange to specify the value false
      const keyRange = IDBKeyRange.only(false);
      const records = await this.promisifyRequest(index.getAll(keyRange)) as StorageRecord[];
      return records;
    } catch (error) {
      console.error(`❌ Failed to get unsynced ${table} data:`, error);
      return [];
    }
  }

  // Mark data as synced
  async markAsSynced(table: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      if (table === 'sync_queue' || table === 'app_data') {
        throw new Error(`Cannot mark ${table} as synced using this method`);
      }

      const transaction = this.db!.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const record = await this.promisifyRequest(store.get(id)) as StorageRecord;
      
      if (record) {
        record.synced = true;
        await this.promisifyRequest(store.put(record));
      }
    } catch (error) {
      console.error(`❌ Failed to mark ${table} data as synced:`, error);
    }
  }

  // Add to sync queue
  async addToSyncQueue(
    table: string,
    id: string,
    data: any,
    operation: OperationType
  ): Promise<void> {
    if (!this.db) await this.init();

    const queueItem: SyncQueueItem = {
      id: `${table}_${id}_${Date.now()}`,
      table,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    try {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      await this.promisifyRequest(store.put(queueItem));
      
      console.log(`📝 Added to sync queue: ${table}/${id}`);
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
    }
  }

  // Get sync queue
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();

    try {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      
      return await this.promisifyRequest(store.getAll()) as SyncQueueItem[];
    } catch (error) {
      console.error('❌ Failed to get sync queue:', error);
      return [];
    }
  }

  // Remove from sync queue
  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      await this.promisifyRequest(store.delete(id));
    } catch (error) {
      console.error('❌ Failed to remove from sync queue:', error);
    }
  }

  // Update sync queue item with error
  async updateSyncQueueError(id: string, error: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const item = await this.promisifyRequest(store.get(id)) as SyncQueueItem;
      
      if (item) {
        item.retries = (item.retries || 0) + 1;
        item.error = error;
        await this.promisifyRequest(store.put(item));
      }
    } catch (err) {
      console.error('❌ Failed to update sync queue error:', err);
    }
  }

  // Store app-specific data
  async setAppData(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();

    try {
      const record: AppDataRecord = {
        key,
        value,
        timestamp: Date.now(),
      };

      const transaction = this.db!.transaction(['app_data'], 'readwrite');
      const store = transaction.objectStore('app_data');
      await this.promisifyRequest(store.put(record));
    } catch (error) {
      console.error('❌ Failed to store app data:', error);
    }
  }

  // Get app-specific data
  async getAppData(key: string): Promise<any> {
    if (!this.db) await this.init();

    try {
      const transaction = this.db!.transaction(['app_data'], 'readonly');
      const store = transaction.objectStore('app_data');
      const record = await this.promisifyRequest(store.get(key)) as AppDataRecord;
      
      return record ? record.value : null;
    } catch (error) {
      console.error('❌ Failed to get app data:', error);
      return null;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    try {
      const stores = ['orders', 'appointments', 'inventory', 'clients', 'services', 'sync_queue', 'app_data'];
      
      for (const storeName of stores) {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await this.promisifyRequest(store.clear());
      }
      
      console.log('🧹 Cleared all offline data');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
    }
  }

  // Get storage size estimate
  async getStorageSize(): Promise<{ quota: number; usage: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota || 0,
          usage: estimate.usage || 0,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get storage estimate:', error);
    }
    
    return { quota: 0, usage: 0 };
  }

  // Helper method to promisify IndexedDB requests
  private promisifyRequest<T = any>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();

// Export types
export type { StorageRecord, SyncQueueItem, AppDataRecord, OperationType };
export { OfflineStorageService }; 