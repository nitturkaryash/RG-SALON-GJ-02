// Example component showing how to use hybrid data hooks
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
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
import {
  Add,
  Edit,
  Delete,
  Sync,
  CloudOff,
  CloudDone,
  Storage,
} from '@mui/icons-material';
import { useHybridData } from '../hooks/useHybridData';

interface ExampleData {
  id: string;
  name: string;
  description: string;
  created_at: string;
  last_modified: string;
}

export default function HybridDataExample() {
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
  } = useHybridData<ExampleData>({ 
    table: 'example_data',
    autoSync: true,
    syncInterval: 30000 
  });

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isOperating, setIsOperating] = useState(false);

  const syncStatus = getSyncStatus();

  // Create new item
  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsOperating(true);
    try {
      const result = await create({
        name: newName.trim(),
        description: newDescription.trim(),
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
      });

      if (result.success) {
        setNewName('');
        setNewDescription('');
        console.log(`✅ Created item successfully via ${result.source}`);
      }
    } catch (error) {
      console.error('❌ Failed to create item:', error);
    } finally {
      setIsOperating(false);
    }
  };

  // Start editing
  const handleStartEdit = (item: ExampleData) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    setIsOperating(true);
    try {
      const result = await update(editingId, {
        name: editName.trim(),
        description: editDescription.trim(),
        last_modified: new Date().toISOString(),
      });

      if (result.success) {
        setEditingId(null);
        setEditName('');
        setEditDescription('');
        console.log(`✅ Updated item successfully via ${result.source}`);
      }
    } catch (error) {
      console.error('❌ Failed to update item:', error);
    } finally {
      setIsOperating(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  // Delete item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsOperating(true);
    try {
      const result = await remove(id);
      if (result.success) {
        console.log(`✅ Deleted item successfully via ${result.source}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete item:', error);
    } finally {
      setIsOperating(false);
    }
  };

  // Manual sync
  const handleManualSync = async () => {
    setIsOperating(true);
    try {
      await syncNow();
      console.log('✅ Manual sync completed');
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
    } finally {
      setIsOperating(false);
    }
  };

  // Retry with local data only
  const handleRetryLocal = async () => {
    setIsOperating(true);
    try {
      await retryWithLocalData();
      console.log('✅ Using local data only');
    } catch (error) {
      console.error('❌ Failed to load local data:', error);
    } finally {
      setIsOperating(false);
    }
  };

  // Get status icon
  const getSourceIcon = () => {
    switch (source) {
      case 'remote':
        return <CloudDone color="success" />;
      case 'local':
        return <Storage color="warning" />;
      case 'hybrid':
        return <Sync color="info" />;
      case 'cache':
        return <CloudDone color="primary" />;
      default:
        return <CloudOff color="error" />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Hybrid Data System Example
      </Typography>

      {/* Status Information */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Chip
          icon={getSourceIcon()}
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={handleRetryLocal} sx={{ ml: 2 }}>
            Retry with Local Data
          </Button>
        </Alert>
      )}

      {/* Supabase Down Alert */}
      {isSupabaseDown && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Supabase is not responding. Using local backup data. All operations will be synced when connection is restored.
          <Button size="small" onClick={handleManualSync} sx={{ ml: 2 }}>
            Retry Connection
          </Button>
        </Alert>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<Sync />}
          onClick={handleManualSync}
          disabled={isOperating}
          variant="outlined"
        >
          Manual Sync
        </Button>
        <Button
          startIcon={<Storage />}
          onClick={handleRetryLocal}
          disabled={isOperating}
          variant="outlined"
          color="warning"
        >
          Local Data Only
        </Button>
        <Button
          onClick={refresh}
          disabled={isOperating}
          variant="outlined"
        >
          Refresh
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Create New Item */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Item (Works Offline)
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            size="small"
            disabled={isOperating}
          />
          <TextField
            label="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            size="small"
            disabled={isOperating}
          />
          <Button
            startIcon={isOperating ? <CircularProgress size={20} /> : <Add />}
            onClick={handleCreate}
            disabled={isOperating || !newName.trim()}
            variant="contained"
          >
            Create
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Data List */}
      <Typography variant="h6" gutterBottom>
        Items ({data.length})
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && data.length === 0 && (
        <Alert severity="info">
          No items found. Create some items to test the offline functionality.
        </Alert>
      )}

      <List>
        {data.map((item) => (
          <ListItem key={item.id} divider>
            {editingId === item.id ? (
              // Edit mode
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                    label="Name"
                    disabled={isOperating}
                  />
                  <TextField
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    size="small"
                    label="Description"
                    disabled={isOperating}
                  />
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isOperating || !editName.trim()}
                    variant="contained"
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={isOperating}
                    variant="outlined"
                    size="small"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              // View mode
              <>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Box>
                      <Typography variant="body2">{item.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Modified: {new Date(item.last_modified).toLocaleString()}
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
                    onClick={() => handleStartEdit(item)}
                    disabled={isOperating}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    disabled={isOperating}
                    size="small"
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </>
            )}
          </ListItem>
        ))}
      </List>

      {/* Debug Information */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Debug Information
        </Typography>
        <Typography variant="caption" component="div">
          • Data Source: {source}
        </Typography>
        <Typography variant="caption" component="div">
          • Items Count: {data.length}
        </Typography>
        <Typography variant="caption" component="div">
          • Pending Sync: {syncStatus.pending}
        </Typography>
        <Typography variant="caption" component="div">
          • Conflicts: {syncStatus.conflicts}
        </Typography>
        <Typography variant="caption" component="div">
          • Supabase Status: {isSupabaseDown ? 'Down' : 'Available'}
        </Typography>
        <Typography variant="caption" component="div">
          • Last Sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
        </Typography>
      </Box>
    </Paper>
  );
} 