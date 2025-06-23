// Offline Status Bar Component
import React, { useState } from 'react';
import { useNetworkStatus } from '../utils/networkService';
import { useSyncStatus } from '../utils/syncService';
import { useOrderSyncStatus } from '../hooks/useOfflinePOS';
import { offlineStorage } from '../utils/offlineStorage';
import { toast } from 'react-toastify';

interface OfflineStatusBarProps {
  className?: string;
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

export function OfflineStatusBar({ 
  className = '', 
  position = 'bottom',
  showDetails = false 
}: OfflineStatusBarProps) {
  const { isOnline, isSlowConnection, connectionType, lastOfflineTime } = useNetworkStatus();
  const { status: syncStatus, startSync, forcePull } = useSyncStatus();
  const { unsyncedCount, hasUnsyncedData } = useOrderSyncStatus();
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [showStorageDetails, setShowStorageDetails] = useState(false);

  // Get storage info on mount
  React.useEffect(() => {
    const getStorageInfo = async () => {
      try {
        const info = await offlineStorage.getStorageSize();
        setStorageInfo(info);
      } catch (error) {
        console.error('Failed to get storage info:', error);
      }
    };

    getStorageInfo();
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('❌ Cannot sync: device is offline');
      return;
    }

    try {
      await startSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('❌ Sync failed');
    }
  };

  const handleForcePull = async () => {
    if (!isOnline) {
      toast.error('❌ Cannot pull data: device is offline');
      return;
    }

    if (window.confirm('This will overwrite local changes with server data. Continue?')) {
      try {
        await forcePull();
      } catch (error) {
        console.error('Force pull failed:', error);
        toast.error('❌ Failed to pull data from server');
      }
    }
  };

  const handleClearOfflineData = async () => {
    if (window.confirm('This will delete all offline data. This cannot be undone. Continue?')) {
      try {
        await offlineStorage.clearAllData();
        toast.success('🧹 Offline data cleared');
        window.location.reload(); // Refresh to reflect changes
      } catch (error) {
        console.error('Failed to clear offline data:', error);
        toast.error('❌ Failed to clear offline data');
      }
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncStatus === 'syncing') return 'bg-yellow-500';
    if (syncStatus === 'error') return 'bg-orange-500';
    if (hasUnsyncedData) return 'bg-blue-500';
    if (isSlowConnection) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) {
      const offlineTime = lastOfflineTime ? new Date(lastOfflineTime).toLocaleTimeString() : 'Unknown';
      return `Offline since ${offlineTime}`;
    }
    if (syncStatus === 'syncing') return 'Syncing data...';
    if (syncStatus === 'error') return 'Sync error';
    if (hasUnsyncedData) return `${unsyncedCount} items pending sync`;
    if (isSlowConnection) return `Online (${connectionType} - slow)`;
    return `Online (${connectionType})`;
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📡';
    if (syncStatus === 'syncing') return '🔄';
    if (syncStatus === 'error') return '⚠️';
    if (hasUnsyncedData) return '📦';
    if (isSlowConnection) return '🐌';
    return '✅';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div className={`fixed left-0 right-0 ${positionClasses} z-50 ${className}`}>
      <div className={`${getStatusColor()} text-white px-4 py-2 shadow-lg`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Status indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon()}</span>
              <span className="font-medium">{getStatusText()}</span>
            </div>

            {/* Sync indicator */}
            {syncStatus === 'syncing' && (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {showDetails && storageInfo && (
              <button
                onClick={() => setShowStorageDetails(!showStorageDetails)}
                className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                title="Storage usage"
              >
                💾 {formatBytes(storageInfo.usage)}
              </button>
            )}

            {hasUnsyncedData && isOnline && (
              <button
                onClick={handleManualSync}
                disabled={syncStatus === 'syncing'}
                className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 disabled:opacity-50 transition-colors"
                title="Sync pending data"
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            )}

            {isOnline && showDetails && (
              <>
                <button
                  onClick={handleForcePull}
                  disabled={syncStatus === 'syncing'}
                  className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 disabled:opacity-50 transition-colors"
                  title="Pull latest data from server"
                >
                  📥 Pull
                </button>

                <button
                  onClick={handleClearOfflineData}
                  className="text-xs px-2 py-1 bg-red-600 bg-opacity-80 rounded hover:bg-opacity-100 transition-colors"
                  title="Clear all offline data"
                >
                  🗑️ Clear
                </button>
              </>
            )}

            {/* Toggle details button */}
            <button
              onClick={() => setShowStorageDetails(!showStorageDetails)}
              className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
            >
              {showStorageDetails ? '▼' : '▲'}
            </button>
          </div>
        </div>

        {/* Extended details panel */}
        {showStorageDetails && (
          <div className="mt-2 pt-2 border-t border-white border-opacity-30">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Network info */}
                <div>
                  <div className="font-semibold mb-1">Network</div>
                  <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
                  <div>Type: {connectionType}</div>
                  {isSlowConnection && <div>⚠️ Slow connection detected</div>}
                </div>

                {/* Sync info */}
                <div>
                  <div className="font-semibold mb-1">Sync Status</div>
                  <div>Status: {syncStatus}</div>
                  <div>Pending: {unsyncedCount} items</div>
                  <div>Last sync: {syncStatus === 'completed' ? 'Just now' : 'Unknown'}</div>
                </div>

                {/* Storage info */}
                <div>
                  <div className="font-semibold mb-1">Storage</div>
                  {storageInfo && (
                    <>
                      <div>Used: {formatBytes(storageInfo.usage)}</div>
                      <div>Available: {formatBytes(storageInfo.quota - storageInfo.usage)}</div>
                      <div>
                        Usage: {((storageInfo.usage / storageInfo.quota) * 100).toFixed(1)}%
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons in details */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncStatus === 'syncing'}
                  className="text-xs px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 disabled:opacity-50 transition-colors"
                >
                  🔄 Manual Sync
                </button>

                <button
                  onClick={handleForcePull}
                  disabled={!isOnline || syncStatus === 'syncing'}
                  className="text-xs px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 disabled:opacity-50 transition-colors"
                >
                  📥 Force Pull
                </button>

                <button
                  onClick={handleClearOfflineData}
                  className="text-xs px-3 py-1 bg-red-600 bg-opacity-80 rounded hover:bg-opacity-100 transition-colors"
                >
                  🗑️ Clear Offline Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for mobile
export function CompactOfflineStatus() {
  const { isOnline } = useNetworkStatus();
  const { status: syncStatus } = useSyncStatus();
  const { unsyncedCount } = useOrderSyncStatus();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncStatus === 'syncing') return 'bg-yellow-500';
    if (unsyncedCount > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📡';
    if (syncStatus === 'syncing') return '🔄';
    if (unsyncedCount > 0) return '📦';
    return '✅';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${getStatusColor()} text-white px-3 py-1 rounded-full shadow-lg`}>
      <div className="flex items-center space-x-1 text-sm">
        <span>{getStatusIcon()}</span>
        {unsyncedCount > 0 && <span className="text-xs">{unsyncedCount}</span>}
      </div>
    </div>
  );
}

export default OfflineStatusBar; 