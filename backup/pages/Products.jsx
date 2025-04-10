import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, BugReport as BugReportIcon } from '@mui/icons-material';
import { supabase } from '../utils/supabase/supabaseClient';
import { debugSupabaseConnection } from '../utils/supabase/debugConnection';
import ProductCollection from '../components/products/ProductCollection';
import { toast } from 'react-toastify';

// Log Supabase connection details
console.log('Products page - Supabase URL:', supabase.supabaseUrl);
console.log('Products page - Supabase key length:', supabase.supabaseKey?.length || 0);

const Products = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_collections')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching collections:', error);
        toast.error(`Failed to load collections: ${error.message}`);
        throw error;
      }
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching product collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('product_collections')
        .insert([{ name: newCollectionName.trim() }])
        .select();

      if (error) {
        console.error('Error creating collection:', error);
        toast.error(`Failed to create collection: ${error.message}`);
        throw error;
      }
      
      toast.success('Collection created successfully');
      setCollections([...collections, ...data]);
      setNewCollectionName('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating product collection:', error);
    }
  };

  // Add function to test Supabase connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      toast.info('Testing Supabase connection...');
      
      // Run comprehensive debug tests
      await debugSupabaseConnection();
      
      // Try a simple query to test direct connection
      const { data, error } = await supabase
        .from('product_collections')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Database connectivity test failed:', error);
        toast.error(`Connection Error: ${error.message}`);
        return false;
      }
      
      console.log('Database connectivity test succeeded!', data);
      toast.success('Successfully connected to Supabase!');
      
      // Refresh collections
      fetchCollections();
      
      return true;
    } catch (err) {
      console.error('Error testing database connection:', err);
      toast.error('Failed to connect to database');
      return false;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" color="primary">
          Product Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<BugReportIcon />}
            onClick={testDatabaseConnection}
          >
            Test Connection
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ backgroundColor: '#7b9a47', '&:hover': { backgroundColor: '#6a8639' } }}
          >
            New Collection
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : collections.length === 0 ? (
        <Card sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa' }}>
          <CardContent>
            No collections found.
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {collections.map((collection) => (
            <Grid item xs={12} md={6} key={collection.id}>
              <ProductCollection collection={collection} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add New Collection Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCollection} 
            variant="contained"
            sx={{ backgroundColor: '#7b9a47', '&:hover': { backgroundColor: '#6a8639' } }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products; 