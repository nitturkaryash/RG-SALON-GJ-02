import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Divider,
  Collapse,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabase/supabaseClient';
import AddProduct from './AddProduct';
import ProductItem from './ProductItem';
import { toast } from 'react-toastify';

const ProductCollection = ({ collection }) => {
  const [products, setProducts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [collectionName, setCollectionName] = useState(collection.name);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [inventoryStatusMap, setInventoryStatusMap] = useState({});

  useEffect(() => {
    if (expanded) {
      fetchProducts();
    }
  }, [expanded, collection.id]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products for collection:', collection.id);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("collection_id", collection.id);

      if (error) {
        console.error('Error fetching products:', error);
        toast.error(`Failed to load products: ${error.message}`);
        throw error;
      }
      
      setProducts(data || []);
      
      // Check inventory status for each product
      const statusMap = {};
      
      for (const product of data || []) {
        try {
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory_products')
            .select('*')
            .eq('product_id', product.id)
            .single();
          
          if (inventoryError && inventoryError.code !== 'PGRST116') { // Not found is expected
            console.warn(`Error checking inventory for product ${product.id}:`, inventoryError);
          }
          
          statusMap[product.id] = inventoryData ? true : false;
        } catch (err) {
          console.error(`Error checking inventory for product ${product.id}:`, err);
          statusMap[product.id] = false;
        }
      }
      
      setInventoryStatusMap(statusMap);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(`Failed to load products: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleUpdateCollection = async () => {
    if (!collectionName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('product_collections')
        .update({ name: collectionName.trim() })
        .eq('id', collection.id);

      if (error) throw error;
      
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  const handleDeleteCollection = async () => {
    if (window.confirm(`Are you sure you want to delete the "${collection.name}" collection?`)) {
      try {
        const { error } = await supabase
          .from('product_collections')
          .delete()
          .eq('id', collection.id);
          
        if (error) throw error;
        
        // Refresh the page
        window.location.reload();
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
  };

  const handleAddToInventory = async (product) => {
    try {
      const { data, error } = await supabase
        .from('inventory_products')
        .insert([
          {
            product_id: product.id,
            product_name: product.name,
            quantity: product.stock_quantity || 0,
            hsn_code: product.hsn_code || '',
            units: product.units || '',
            mrp_incl_gst: product.mrp_incl_gst || product.price || 0,
            gst_percentage: product.gst_percentage || 18,
            stock_quantity: product.stock_quantity || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ]);

      if (error) throw error;
      
      // Update inventory status map
      setInventoryStatusMap(prev => ({
        ...prev,
        [product.id]: true
      }));
      
      toast.success("Product added to inventory successfully");
      
    } catch (error) {
      console.error('Error adding to inventory:', error.message || error);
      toast.error("Failed to add product to inventory");
    }
  };

  const handleProductAdded = (newProduct) => {
    // Refresh the products list
    fetchProducts();
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="primary">
              {collection.name}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => setOpenEditDialog(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleDeleteCollection}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleToggleExpand}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>
        }
      />
      
      <Collapse in={expanded}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setAddProductOpen(true)}
              sx={{ backgroundColor: '#7b9a47', '&:hover': { backgroundColor: '#6a8639' } }}
            >
              Add Product
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              No products in this collection.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductItem 
                    product={product} 
                    onUpdate={fetchProducts}
                    inventoryStatus={inventoryStatusMap[product.id]}
                    onAddToInventory={handleAddToInventory}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Collapse>
      
      {/* Edit Collection Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateCollection} 
            variant="contained"
            sx={{ backgroundColor: '#7b9a47', '&:hover': { backgroundColor: '#6a8639' } }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Product Dialog */}
      <AddProduct 
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        collectionId={collection.id}
        onProductAdded={handleProductAdded}
      />
    </Card>
  );
};

export default ProductCollection; 