// Enhanced offline status bar with Supabase fallback indicators
import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Collapse,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Tooltip,
  Badge,
  Stack,
  Paper,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  CloudDone,
  CloudOff,
  Sync,
  SyncProblem,
  Warning,
  Storage,
  Refresh,
  ExpandMore,
  ExpandLess,
  Settings,
} from '@mui/icons-material';
import { useNetworkStatus } from '../utils/networkService';
import { hybridDataService } from '../utils/hybridDataService';
import { toast } from 'react-toastify';

interface EnhancedOfflineStatusBarProps {
  position?: 'top' | 'bottom';
  compact?: boolean;
}

export default function EnhancedOfflineStatusBar({ 
  position = 'bottom',
  compact = false 
}: EnhancedOfflineStatusBarProps) {
  const networkStatus = useNetworkStatus();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSupabaseDown, setIsSupabaseDown] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, conflicts: 0 });
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [lastSupabaseCheck, setLastSupabaseCheck] = useState<number | null>(null);

  // Check Supabase connectivity periodically
  useEffect(() => {
    const checkSupabaseHealth = async () => {
      try {
        // Use the hybrid service to check connectivity
        const testResult = await hybridDataService.store('health_check', 'test', { test: true }, 'create');
        setIsSupabaseDown(testResult.source === 'local-only');
        setLastSupabaseCheck(Date.now());
      } catch (error) {
        setIsSupabaseDown(true);
        setLastSupabaseCheck(Date.now());
      }
    };

    // Check immediately
    if (networkStatus.isOnline) {
      checkSupabaseHealth();
    }

    // Check every 30 seconds when online
    const interval = setInterval(() => {
      if (networkStatus.isOnline) {
        checkSupabaseHealth();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [networkStatus.isOnline]);

  // Update sync status
  useEffect(() => {
    const updateSyncStatus = () => {
      const status = hybridDataService.getSyncQueueStatus();
      setSyncStatus(status);
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Manual sync operation
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      toast.info('🔄 Starting manual sync...');
      
      // Sync all main tables
      const tables = ['orders', 'clients', 'appointments', 'products', 'services'];
      let totalSynced = 0;
      
      for (const table of tables) {
        try {
          const result = await hybridDataService.syncBidirectional(table, 'bidirectional');
          totalSynced += result.localToRemote + result.remoteToLocal;
        } catch (error) {
          console.warn(`⚠️ Sync failed for table ${table}:`, error);
        }
      }
      
      toast.success(`✅ Sync completed! ${totalSynced} records synchronized`);
      setIsSupabaseDown(false);
      
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      toast.error('❌ Manual sync failed');
      setIsSupabaseDown(true);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Force local data mode
  const handleForceLocalMode = () => {
    toast.info('📱 Switching to local data mode...');
    hybridDataService.clearCache();
    window.location.reload(); // Simple way to refresh all components
  };

  // Determine status color and icon
  const getStatusInfo = () => {
    if (!networkStatus.isOnline) {
      return {
        color: 'warning' as const,
        icon: <WifiOff />,
        label: 'Offline Mode',
        description: 'Using local data only',
      };
    }
    
    if (isSupabaseDown) {
      return {
        color: 'error' as const,
        icon: <CloudOff />,
        label: 'Supabase Down',
        description: 'Using local backup data',
      };
    }
    
    if (syncStatus.pending > 0) {
      return {
        color: 'info' as const,
        icon: <SyncProblem />,
        label: 'Sync Pending',
        description: `${syncStatus.pending} items to sync`,
      };
    }
    
    return {
      color: 'success' as const,
      icon: <CloudDone />,
      label: 'Online & Synced',
      description: 'All data synchronized',
    };
  };

  const statusInfo = getStatusInfo();

  // Compact view for mobile
  if (compact) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          top: position === 'top' ? 16 : 'auto',
          bottom: position === 'bottom' ? 16 : 'auto',
          right: 16,
          p: 1,
          zIndex: 1300,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={statusInfo.description}>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              size="small"
              variant="outlined"
            />
          </Tooltip>
          
          {syncStatus.pending > 0 && (
            <Badge badgeContent={syncStatus.pending} color="warning">
              <IconButton
                size="small"
                onClick={handleManualSync}
                disabled={isManualSyncing}
              >
                <Sync />
              </IconButton>
            </Badge>
          )}
        </Stack>
      </Paper>
    );
  }

  // Full status bar
  return (
    <Paper
      elevation={2}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: position === 'top' ? 0 : 'auto',
        bottom: position === 'bottom' ? 0 : 'auto',
        zIndex: 1200,
        borderRadius: 0,
      }}
    >
      {/* Progress bar for sync operations */}
      {isManualSyncing && (
        <LinearProgress color="info" />
      )}
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          minHeight: 48,
        }}
      >
        {/* Status indicator */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            color={statusInfo.color}
            variant="outlined"
          />
          
          <Typography variant="body2" color="text.secondary">
            {statusInfo.description}
          </Typography>
          
          {/* Network info */}
          <Chip
            icon={networkStatus.isOnline ? <Wifi /> : <WifiOff />}
            label={networkStatus.isOnline ? 'Online' : 'Offline'}
            color={networkStatus.isOnline ? 'success' : 'warning'}
            size="small"
            variant="outlined"
          />
          
          {/* Sync status */}
          {syncStatus.pending > 0 && (
            <Chip
              icon={<Storage />}
              label={`${syncStatus.pending} pending`}
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
          
          {syncStatus.conflicts > 0 && (
            <Chip
              icon={<Warning />}
              label={`${syncStatus.conflicts} conflicts`}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Manual sync */}
          <Tooltip title="Sync now">
            <IconButton
              onClick={handleManualSync}
              disabled={isManualSyncing || !networkStatus.isOnline}
              color="primary"
            >
              <Sync />
            </IconButton>
          </Tooltip>
          
          {/* Force local mode */}
          {isSupabaseDown && (
            <Tooltip title="Use local data only">
              <IconButton
                onClick={handleForceLocalMode}
                color="warning"
              >
                <Storage />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Expand/collapse */}
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Box>

      {/* Expanded details */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          {/* Status details */}
          <Stack spacing={2}>
            {/* Connection details */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Connection Status
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={`Network: ${networkStatus.connectionType}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Slow Connection: ${networkStatus.isSlowConnection ? 'Yes' : 'No'}`}
                  size="small"
                  variant="outlined"
                  color={networkStatus.isSlowConnection ? 'warning' : 'default'}
                />
                {lastSupabaseCheck && (
                  <Chip
                    label={`Last Check: ${new Date(lastSupabaseCheck).toLocaleTimeString()}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            {/* Warnings and alerts */}
            {isSupabaseDown && networkStatus.isOnline && (
              <Alert severity="warning" variant="outlined">
                <Typography variant="body2">
                  Supabase is not responding. The app is using local backup data. 
                  Your data is safe and will sync when the connection is restored.
                </Typography>
                <Button
                  size="small"
                  onClick={handleManualSync}
                  disabled={isManualSyncing}
                  sx={{ mt: 1 }}
                >
                  Retry Connection
                </Button>
              </Alert>
            )}

            {!networkStatus.isOnline && (
              <Alert severity="info" variant="outlined">
                <Typography variant="body2">
                  You're offline. All changes are saved locally and will sync when you're back online.
                </Typography>
              </Alert>
            )}

            {syncStatus.conflicts > 0 && (
              <Alert severity="error" variant="outlined">
                <Typography variant="body2">
                  {syncStatus.conflicts} data conflicts detected. Please review and resolve them.
                </Typography>
                <Button size="small" sx={{ mt: 1 }}>
                  Resolve Conflicts
                </Button>
              </Alert>
            )}

            {/* Quick actions */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Quick Actions
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  variant="outlined"
                >
                  Refresh App
                </Button>
                <Button
                  size="small"
                  startIcon={<Storage />}
                  onClick={handleForceLocalMode}
                  variant="outlined"
                  color="warning"
                >
                  Local Mode
                </Button>
                <Button
                  size="small"
                  startIcon={<Settings />}
                  variant="outlined"
                  onClick={() => {
                    // Open diagnostics
                    (window as any).runOfflineDiagnostics?.();
                  }}
                >
                  Diagnostics
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
} 