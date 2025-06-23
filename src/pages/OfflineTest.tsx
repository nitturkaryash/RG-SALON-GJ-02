// Simple test page to demonstrate offline functionality
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import { Delete, Add, Sync, CloudOff, CloudDone, Storage } from '@mui/icons-material';
import { useHybridData } from '../hooks/useHybridData';
import { toast } from 'react-toastify';

interface TestData {
  id: string;
  name: string;
  description: string;
  created_at: string;
  last_modified: string;
}

export default function OfflineTest() {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isOperating, setIsOperating] = useState(false);

  // Use hybrid data hook for testing
  const {
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
    retryWithLocalData,
  } = useHybridData<TestData>({ 
    table: 'test_offline_data',
    autoSync: true,
    syncInterval: 30000 
  });

  const syncStatus = getSyncStatus();

  // Create test item
  const handleCreate = async () => {
    if (!itemName.trim()) return;

    setIsOperating(true);
    try {
      const result = await create({
        name: itemName.trim(),
        description: itemDescription.trim(),
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      });

      if (result.success) {
        setItemName('');
        setItemDescription('');
        
        if (result.source === 'local-only') {
          toast.success('✅ Item saved offline - will sync when online!');
        } else {
          toast.success('✅ Item created successfully!');
        }
      }
    } catch (error) {
      toast.error('❌ Failed to create item');
    } finally {
      setIsOperating(false);
    }
  };

  // Delete test item
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    setIsOperating(true);
    try {
      const result = await remove(id);
      if (result.success) {
        if (result.source === 'local-only') {
          toast.success('✅ Item deleted offline - will sync when online!');
        } else {
          toast.success('✅ Item deleted successfully!');
        }
      }
    } catch (error) {
      toast.error('❌ Failed to delete item');
    } finally {
      setIsOperating(false);
    }
  };

  // Manual sync
  const handleSync = async () => {
    setIsOperating(true);
    try {
      await syncNow();
      toast.success('🔄 Sync completed!');
    } catch (error) {
      toast.error('❌ Sync failed');
    } finally {
      setIsOperating(false);
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isSupabaseDown) return <CloudOff color="error" />;
    if (source === 'local') return <Storage color="warning" />;
    if (source === 'remote') return <CloudDone color="success" />;
    return <Sync color="info" />;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Offline Functionality Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Test Instructions:</strong><br />
          1. Try creating items with your internet ON<br />
          2. Turn OFF your internet (or disable in DevTools)<br />
          3. Create more items - they should save offline<br />
          4. Turn internet back ON and watch them sync!
        </Typography>
      </Alert>

      {/* Status Information */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Chip
            icon={getStatusIcon()}
            label={`Data Source: ${source}`}
            color={source === 'remote' ? 'success' : source === 'local' ? 'warning' : 'info'}
            variant="outlined"
          />
          
          {isSupabaseDown && (
            <Chip
              icon={<CloudOff />}
              label="Supabase Down"
              color="error"
              variant="outlined"
            />
          )}
          
          {syncStatus.pending > 0 && (
            <Chip
              label={`${syncStatus.pending} pending sync`}
              color="warning"
              size="small"
            />
          )}
          
          {lastSync && (
            <Typography variant="caption" color="text.secondary">
              Last sync: {new Date(lastSync).toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={retryWithLocalData} sx={{ ml: 2 }}>
            Use Local Data Only
          </Button>
        </Alert>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<Sync />}
          onClick={handleSync}
          disabled={isOperating}
          variant="outlined"
        >
          Manual Sync
        </Button>
        <Button
          startIcon={<Storage />}
          onClick={retryWithLocalData}
          disabled={isOperating}
          variant="outlined"
          color="warning"
        >
          Local Mode Only
        </Button>
        <Button
          onClick={refresh}
          disabled={isOperating}
          variant="outlined"
        >
          Refresh Data
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Create Form */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create Test Item (Works Offline! 📱)
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={isOperating}
            fullWidth
          />
          <TextField
            label="Description"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            disabled={isOperating}
            fullWidth
            multiline
            rows={2}
          />
          <Button
            startIcon={isOperating ? <CircularProgress size={20} /> : <Add />}
            onClick={handleCreate}
            disabled={isOperating || !itemName.trim()}
            variant="contained"
            fullWidth
          >
            Create Item
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Data List */}
      <Typography variant="h6" gutterBottom>
        Test Items ({data.length})
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && data.length === 0 && (
        <Alert severity="info">
          No items found. Create some items to test the offline functionality!
        </Alert>
      )}

      <List>
        {data.map((item) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={item.name}
              secondary={
                <Box>
                  <Typography variant="body2">{item.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(item.created_at).toLocaleString()}
                  </Typography>
                  {(item as any)._source && (
                    <Chip
                      label={(item as any)._source}
                      size="small"
                      sx={{ ml: 1 }}
                      color={
                        (item as any)._source === 'local-pending' ? 'warning' :
                        (item as any)._source === 'remote' ? 'success' : 'default'
                      }
                    />
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                onClick={() => handleDelete(item.id, item.name)}
                disabled={isOperating}
                color="error"
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Debug Info */}
      <Paper elevation={1} sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          🔍 Debug Information
        </Typography>
        <Typography variant="caption" component="div">• Data Source: {source}</Typography>
        <Typography variant="caption" component="div">• Items Count: {data.length}</Typography>
        <Typography variant="caption" component="div">• Pending Sync: {syncStatus.pending}</Typography>
        <Typography variant="caption" component="div">• Conflicts: {syncStatus.conflicts}</Typography>
        <Typography variant="caption" component="div">• Supabase Status: {isSupabaseDown ? 'Down' : 'Available'}</Typography>
        <Typography variant="caption" component="div">• Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}</Typography>
      </Paper>
    </Container>
  );
} 