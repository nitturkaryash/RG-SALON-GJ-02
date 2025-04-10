import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabase/supabaseClient';

const ProductItem = ({ product, onUpdate, inventoryStatus = false, onAddToInventory }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const previousFocusRef = React.useRef(null);
  const editButtonRef = React.useRef(null);
  const deleteButtonRef = React.useRef(null);
  const safeContainerRef = React.useRef(null);
  
  const [editedProduct, setEditedProduct] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price || '',
    stock_quantity: product.stock_quantity || ''
  });

  const handleOpenEditDialog = () => {
    previousFocusRef.current = document.activeElement;
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = () => {
    previousFocusRef.current = document.activeElement;
    setOpenDeleteDialog(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const updatedData = {
        ...editedProduct,
        price: parseFloat(editedProduct.price) || 0,
        stock_quantity: parseInt(editedProduct.stock_quantity) || 0
      };

      const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', product.id);

      if (error) throw error;
      
      handleCloseEditDialog();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      
      handleCloseDeleteDialog();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCloseEditDialog = () => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    setOpenEditDialog(false);
    
    setTimeout(() => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      } else if (editButtonRef.current) {
        editButtonRef.current.focus();
      } else if (safeContainerRef.current) {
        safeContainerRef.current.focus();
      }
    }, 10);
  };

  const handleCloseDeleteDialog = () => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    setOpenDeleteDialog(false);
    
    setTimeout(() => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      } else if (deleteButtonRef.current) {
        deleteButtonRef.current.focus();
      } else if (safeContainerRef.current) {
        safeContainerRef.current.focus();
      }
    }, 10);
  };

  const handleAddToInventory = () => {
    if (onAddToInventory) {
      onAddToInventory(product);
    }
    handleCloseEditDialog();
  };

  return (
    <>
      <Card 
        ref={safeContainerRef}
        tabIndex={-1}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          '&:hover .actions': { opacity: 1 }
        }}
      >
        <Box 
          className="actions" 
          sx={{ 
            position: 'absolute', 
            top: 5, 
            right: 5, 
            opacity: 0, 
            transition: 'opacity 0.3s',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 1,
            padding: '2px'
          }}
        >
          <IconButton size="small" onClick={handleOpenEditDialog} ref={editButtonRef}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={handleOpenDeleteDialog} ref={deleteButtonRef}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <CardContent sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2
        }}>
          <Typography variant="h6" component="div" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: '40px' }}>
            {product.description || 'No description'}
          </Typography>
          
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              ₹{product.price || 0}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1.5,
              width: '100%'
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: '500' }}>
                Stock: {product.stock_quantity || 0}
              </Typography>
              
              {inventoryStatus && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.8,
                  backgroundColor: 'rgba(123, 154, 71, 0.12)',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.05)'
                }}>
                  <InventoryIcon color="success" fontSize="small" sx={{ fontSize: '1.1rem' }} />
                  <Typography 
                    variant="body2" 
                    color="success.main" 
                    sx={{ 
                      fontSize: '0.85rem', 
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em'
                    }}
                  >
                    In Inventory
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        fullWidth
        aria-labelledby="edit-product-title"
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <DialogTitle id="edit-product-title">Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            type="text"
            fullWidth
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={editedProduct.description}
            onChange={(e) => setEditedProduct({...editedProduct, description: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={editedProduct.price}
            onChange={(e) => setEditedProduct({...editedProduct, price: e.target.value})}
            InputProps={{
              startAdornment: "₹"
            }}
          />
          <TextField
            margin="dense"
            label="Stock Quantity"
            type="number"
            fullWidth
            value={editedProduct.stock_quantity}
            onChange={(e) => setEditedProduct({...editedProduct, stock_quantity: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          
          {!inventoryStatus && (
            <Button 
              startIcon={<InventoryIcon />}
              onClick={handleAddToInventory}
              sx={{ 
                borderColor: '#7b9a47', 
                color: '#7b9a47',
                '&:hover': { color: '#6a8639' }
              }}
            >
              Add to Inventory
            </Button>
          )}
          
          <Button 
            onClick={handleUpdateProduct} 
            variant="contained"
            sx={{ backgroundColor: '#7b9a47', '&:hover': { backgroundColor: '#6a8639' } }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog} 
        fullWidth
        aria-labelledby="delete-product-title"
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <DialogTitle id="delete-product-title">Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{product.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDeleteProduct} 
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductItem; 