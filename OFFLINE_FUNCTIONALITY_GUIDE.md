# Offline Functionality Guide

This salon management application now includes comprehensive offline functionality to ensure data is never lost, even when internet connectivity is unstable or unavailable.

## 🚀 Features

### 1. Offline Data Storage
- **IndexedDB Integration**: Uses browser's IndexedDB for robust local data storage
- **Automatic Fallback**: When offline, all operations are automatically saved locally
- **Data Persistence**: Data remains available across browser sessions
- **Cross-tab Sync**: Data syncs across multiple browser tabs

### 2. Network Detection
- **Real-time Monitoring**: Continuously monitors internet connectivity
- **Connection Quality**: Detects slow connections and adjusts behavior
- **Smart Retry**: Automatically attempts sync when connection is restored
- **Visual Indicators**: Clear status indicators for network state

### 3. Data Synchronization
- **Automatic Sync**: When online, automatically syncs pending changes
- **Manual Sync**: Option to manually trigger synchronization
- **Conflict Resolution**: Handles data conflicts intelligently
- **Queue Management**: Manages sync queue with retry mechanisms

### 4. Offline-First Design
- **Seamless Experience**: Users can work normally whether online or offline
- **Background Sync**: Syncs in background without interrupting workflow
- **Progressive Enhancement**: Online features enhance offline capabilities

## 📦 Implementation Details

### Core Services

#### 1. OfflineStorageService (`src/utils/offlineStorage.ts`)
```typescript
// Store data offline
await offlineStorage.storeOffline('orders', orderId, orderData, 'create');

// Retrieve offline data
const orders = await offlineStorage.getOfflineData('orders');

// Mark data as synced
await offlineStorage.markAsSynced('orders', orderId);
```

#### 2. NetworkService (`src/utils/networkService.ts`)
```typescript
// Get network status
const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();

// Test connectivity
const isConnected = await networkService.testConnectivity();
```

#### 3. SyncService (`src/utils/syncService.ts`)
```typescript
// Start synchronization
const result = await syncService.startSync();

// Force pull from server
await syncService.forcePullFromServer();
```

### Offline-Aware Hooks

#### 1. useOfflinePOS (`src/hooks/useOfflinePOS.ts`)
Handles Point of Sale operations with offline support:
```typescript
const {
  createOrder,
  updateOrder,
  deleteOrder,
  orders,
  isOnline,
  syncOrders,
  unsyncedCount
} = useOfflinePOS();
```

#### 2. useOfflineInventory (`src/hooks/useOfflineInventory.ts`)
Manages inventory with offline capabilities:
```typescript
const {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  inventoryItems,
  syncInventory
} = useOfflineInventory();
```

### UI Components

#### OfflineStatusBar (`src/components/OfflineStatusBar.tsx`)
- Shows current network status
- Displays sync progress
- Provides manual sync controls
- Shows storage usage information

## 🔧 Usage Guide

### For Developers

#### 1. Adding Offline Support to New Features
```typescript
// 1. Import required utilities
import { offlineStorage } from '../utils/offlineStorage';
import { useNetworkStatus } from '../utils/networkService';
import { syncService } from '../utils/syncService';

// 2. Check network status
const { isOnline } = useNetworkStatus();

// 3. Store data conditionally
if (isOnline) {
  // Try online operation
  try {
    await supabase.from('table').insert(data);
    // Mark as synced
    await offlineStorage.markAsSynced('table', id);
  } catch (error) {
    // Fallback to offline storage
    await offlineStorage.storeOffline('table', id, data, 'create');
  }
} else {
  // Store offline directly
  await offlineStorage.storeOffline('table', id, data, 'create');
}
```

#### 2. Creating Offline-Aware Mutations
```typescript
const createItemMutation = useMutation({
  mutationFn: async (itemData) => {
    const item = { ...itemData, id: uuidv4() };
    
    if (isOnline) {
      try {
        await saveToServer(item);
        await offlineStorage.markAsSynced('items', item.id);
        toast.success('✅ Item saved online');
      } catch (error) {
        await offlineStorage.storeOffline('items', item.id, item, 'create');
        toast.warn('⚠️ Item saved offline');
      }
    } else {
      await offlineStorage.storeOffline('items', item.id, item, 'create');
      toast.info('📱 Item saved offline');
    }
    
    return item;
  }
});
```

### For Users

#### 1. Understanding Status Indicators
- **🟢 Green**: Online and synced
- **🟡 Yellow**: Online but syncing or slow connection
- **🔵 Blue**: Online with pending data to sync
- **🔴 Red**: Offline
- **⚠️ Orange**: Sync errors

#### 2. Working Offline
1. **Normal Operation**: Continue using the app as usual
2. **Visual Feedback**: Notice offline indicators and toast messages
3. **Data Safety**: All changes are automatically saved locally
4. **Automatic Sync**: Data syncs automatically when connection returns

#### 3. Manual Sync Options
- **Sync Button**: Click sync in the status bar when online
- **Force Pull**: Overwrite local changes with server data
- **Clear Data**: Remove all offline data (use carefully)

## 🛠️ Configuration

### Database Schema
Ensure your Supabase tables support the offline functionality:

```sql
-- Add sync-related columns (optional, for advanced conflict resolution)
ALTER TABLE your_table ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP DEFAULT NOW();
ALTER TABLE your_table ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;
```

### Environment Setup
No additional environment variables needed - the offline functionality works out of the box with your existing Supabase configuration.

## 📊 Monitoring and Debugging

### Browser DevTools
1. **Application Tab**: Check IndexedDB data under "Storage"
2. **Console**: Monitor sync operations and errors
3. **Network Tab**: Simulate offline/online states

### Status Information
The OfflineStatusBar component provides:
- Current network status
- Pending sync count
- Storage usage
- Sync history

## 🔄 Data Flow

### Offline → Online Transition
1. **Detection**: Network service detects connectivity
2. **Sync Start**: Automatic sync process begins
3. **Queue Processing**: Processes offline changes in order
4. **Conflict Resolution**: Handles any data conflicts
5. **Cleanup**: Removes successfully synced items from queue

### Operation Types
- **Create**: New records created offline
- **Update**: Existing records modified offline
- **Delete**: Records marked for deletion offline

## 🚨 Error Handling

### Sync Failures
- **Retry Logic**: Automatic retries with exponential backoff
- **Error Logging**: Detailed error information stored
- **User Notification**: Clear error messages and suggestions
- **Manual Recovery**: Options to resolve conflicts manually

### Storage Limits
- **Quota Monitoring**: Tracks storage usage
- **Cleanup Options**: Manual and automatic cleanup
- **Fallback Strategies**: Graceful degradation when storage is full

## 📱 Best Practices

### For Development
1. **Test Offline Scenarios**: Regularly test with poor/no connectivity
2. **Handle Conflicts**: Implement proper conflict resolution strategies
3. **Optimize Storage**: Store only essential data offline
4. **Monitor Performance**: Watch for storage and sync performance

### For Users
1. **Regular Sync**: Sync regularly when online
2. **Monitor Status**: Keep an eye on the status bar
3. **Stable Connection**: Sync during stable internet periods
4. **Data Backup**: Regularly backup important data online

## 🔮 Future Enhancements

Planned improvements:
- **Background Sync**: Service worker for background synchronization
- **Compression**: Data compression for storage efficiency
- **Advanced Conflicts**: More sophisticated conflict resolution
- **Selective Sync**: Choose what data to sync
- **Offline Analytics**: Track offline usage patterns

## 📞 Support

If you encounter issues with offline functionality:
1. Check the browser console for errors
2. Verify IndexedDB support in your browser
3. Clear browser data if needed
4. Contact the development team with specific error details

---

This offline functionality ensures your salon management operations continue smoothly regardless of internet connectivity, providing a reliable and professional experience for your staff and customers. 