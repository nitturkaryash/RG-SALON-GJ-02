import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Badge,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabase/supabaseClient';
import { formatCurrency, formatDate } from '../../utils/format';
import { useInventory } from '../../hooks/useInventory';
import { toast } from 'react-toastify';

const ProductItem = ({ product, onUpdate, inventoryStatus = false, onAddToInventory }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [stockBalance, setStockBalance] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [openPurchaseHistory, setOpenPurchaseHistory] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
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

  // Fetch inventory data when component mounts
  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!product.id) return;
      
      setLoadingInventory(true);
      try {
        // Get stock balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('inventory_products')
          .select('stock_quantity')
          .eq('product_id', product.id)
          .single();
          
        if (balanceError && balanceError.code !== 'PGRST116') { // Not found is expected
          console.warn(`Error fetching balance for ${product.name}:`, balanceError);
        } else if (balanceData) {
          setStockBalance(balanceData.stock_quantity);
        }
        
        // Get purchase history
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('inventory_purchases')
          .select('*')
          .eq('product_name', product.name)
          .order('date', { ascending: false })
          .limit(3);
          
        if (purchaseError) {
          console.warn(`Error fetching purchases for ${product.name}:`, purchaseError);
        } else if (purchaseData) {
          setPurchaseHistory(purchaseData);
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoadingInventory(false);
      }
    };
    
    fetchInventoryData();
  }, [product.id, product.name]);

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

  // Get available stock
  const getCurrentStock = () => {
    if (stockBalance && typeof stockBalance.current_stock === 'number') {
      return stockBalance.current_stock;
    }
    return product.stock_quantity || 0;
  };

  // Prepare tooltip content for inventory info
  const getInventoryTooltipContent = () => {
    const currentStock = getCurrentStock();
    
    if (loadingInventory) {
      return 'Loading inventory data...';
    }
    
    let content = `Current Stock: ${currentStock}\n`;
    
    if (stockBalance) {
      content += `Total Purchased: ${stockBalance.total_purchased || 0}\n`;
      content += `Total Sold: ${stockBalance.total_sold || 0}\n`;
      content += `Total Consumed: ${stockBalance.total_consumed || 0}\n`;
    }
    
    if (purchaseHistory && purchaseHistory.length > 0) {
      content += '\nRecent Purchases:\n';
      purchaseHistory.forEach((purchase, index) => {
        const date = new Date(purchase.date).toLocaleDateString();
        content += `${date}: ${purchase.purchase_qty} units at ${formatCurrency(purchase.mrp_incl_gst)}\n`;
      });
    }
    
    return content;
  };

  // Format the stock status label
  const getStockStatusLabel = () => {
    const currentStock = getCurrentStock();
    
    if (currentStock <= 0) {
      return { label: 'Out of Stock', color: 'error.main' };
    } else if (currentStock <= 5) {
      return { label: 'Low Stock', color: 'warning.main' };
    } else {
      return { label: 'In Stock', color: 'success.main' };
    }
  };

  const stockStatus = getStockStatusLabel();

  const fetchAllPurchaseHistory = async () => {
    setLoadingPurchases(true);
    try {
      const { data, error } = await supabase
        .from('inventory_purchases')
        .select('*')
        .eq('product_name', product.name)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching purchase history:', error);
        toast.error(`Failed to load purchase history: ${error.message}`);
        throw error;
      }
      
      setPurchaseHistory(data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      toast.error(`Failed to load purchase history: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingPurchases(false);
    }
  };
  
  const handleViewPurchaseHistory = () => {
    setOpenPurchaseHistory(true);
    fetchAllPurchaseHistory();
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" noWrap title={product.name}>
              {product.name}
            </Typography>
            <Box>
              <Tooltip title="View Purchase History">
                <IconButton size="small" onClick={handleViewPurchaseHistory} sx={{ mr: 0.5 }}>
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setOpenEditDialog(true)} sx={{ mr: 0.5 }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleDeleteProduct}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: '40px' }}>
            {product.description || 'No description'}
          </Typography>
          
          <Box sx={{ mt: 'auto' }}>
            <Tooltip 
              title={<Typography style={{ whiteSpace: 'pre-line' }}>{getInventoryTooltipContent()}</Typography>}
              placement="top"
              arrow
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {formatCurrency(product.price || 0)}
                {purchaseHistory.length > 0 && (
                  <HistoryIcon 
                    fontSize="small" 
                    sx={{ ml: 1, fontSize: '1rem', color: 'primary.light', verticalAlign: 'middle' }} 
                  />
                )}
              </Typography>
            </Tooltip>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1.5,
              width: '100%'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  color: stockStatus.color
                }}
              >
                Stock: {getCurrentStock()}
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

      {/* Purchase History Dialog */}
      <Dialog 
        open={openPurchaseHistory} 
        onClose={() => setOpenPurchaseHistory(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Purchase History - {product.name}
        </DialogTitle>
        <DialogContent>
          {loadingPurchases ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : purchaseHistory.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
              No purchase history found for this product.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>HSN Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="right">Qty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="right">MRP (Incl. GST)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="right">Invoice Value</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Vendor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseHistory.map((purchase) => (
                    <TableRow key={purchase.id || purchase.purchase_id} hover>
                      <TableCell>{formatDate(purchase.date)}</TableCell>
                      <TableCell>{purchase.hsn_code}</TableCell>
                      <TableCell align="right">{purchase.purchase_qty}</TableCell>
                      <TableCell align="right">{formatCurrency(purchase.mrp_incl_gst)}</TableCell>
                      <TableCell align="right">{formatCurrency(purchase.purchase_invoice_value_rs)}</TableCell>
                      <TableCell>{purchase.purchase_invoice_number}</TableCell>
                      <TableCell>{purchase.vendor_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurchaseHistory(false)}>Close</Button>
          <Button 
            onClick={fetchAllPurchaseHistory} 
            variant="outlined" 
            color="primary"
            disabled={loadingPurchases}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductItem; 