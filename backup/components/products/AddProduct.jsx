import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { supabase } from '../../utils/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const AddProduct = ({ open, onClose, collectionId, onProductAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    name: '',
    hsn_code: '',
    units: '',
    invoice_number: '',
    purchase_quantity: 1,
    purchase_incl_gst: 0,
    purchase_excl_gst: 0,
    mrp_percentage: 0,
    mrp_per_unit_excl_gst: 0,
    discount_percentage: 0,
    purchase_cost_taxable_value: 0,
    gst_percentage: 18,
    igst: 0,
    cgst: 0,
    sgst: 0,
    invoice_value: 0,
    description: '',
    stock_quantity: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if ([
      'purchase_quantity',
      'purchase_incl_gst',
      'purchase_excl_gst',
      'mrp_percentage',
      'mrp_per_unit_excl_gst',
      'discount_percentage',
      'purchase_cost_taxable_value',
      'gst_percentage',
      'igst',
      'cgst',
      'sgst',
      'invoice_value',
      'stock_quantity'
    ].includes(name)) {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Adding new product with data:', formData);
      const productId = uuidv4();
      
      // Add to products table for collection
      const { error: productsError } = await supabase
        .from('products')
        .insert({
          id: productId,
          collection_id: collectionId,
          name: formData.name,
          description: formData.description,
          price: formData.purchase_incl_gst, // Use purchase price as product price
          stock_quantity: formData.stock_quantity || formData.purchase_quantity,
          hsn_code: formData.hsn_code,
          units: formData.units,
          mrp_percentage: formData.mrp_percentage,
          mrp_per_unit_excl_gst: formData.mrp_per_unit_excl_gst,
          gst_percentage: formData.gst_percentage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (productsError) {
        console.error('Error adding product to products table:', productsError);
        setError(`Failed to add product: ${productsError.message}`);
        throw productsError;
      }
      
      console.log('Product added successfully, now adding to inventory');
      
      // Also add to inventory_products table
      const { error: inventoryError } = await supabase
        .from('inventory_products')
        .insert({
          product_id: productId,
          product_name: formData.name,
          hsn_code: formData.hsn_code,
          units: formData.units,
          purchase_date: formData.date,
          invoice_number: formData.invoice_number,
          purchase_quantity: formData.purchase_quantity,
          purchase_incl_gst: formData.purchase_incl_gst,
          purchase_excl_gst: formData.purchase_excl_gst,
          mrp_percentage: formData.mrp_percentage,
          mrp_per_unit_excl_gst: formData.mrp_per_unit_excl_gst,
          discount_percentage: formData.discount_percentage,
          purchase_cost_taxable_value: formData.purchase_cost_taxable_value,
          gst_percentage: formData.gst_percentage,
          igst: formData.igst,
          cgst: formData.cgst,
          sgst: formData.sgst,
          invoice_value: formData.invoice_value,
          stock_quantity: formData.stock_quantity || formData.purchase_quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (inventoryError) {
        console.error('Failed to add to inventory, but product was created:', inventoryError);
        setError(`Product created but failed to add to inventory: ${inventoryError.message}`);
      } else {
        console.log('Product successfully added to inventory');
        setSuccess(true);
      }
      
      // If callback provided, pass the new product data back
      if (onProductAdded) {
        onProductAdded({
          id: productId,
          ...formData
        });
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          date: new Date(),
          name: '',
          hsn_code: '',
          units: '',
          invoice_number: '',
          purchase_quantity: 1,
          purchase_incl_gst: 0,
          purchase_excl_gst: 0,
          mrp_percentage: 0,
          mrp_per_unit_excl_gst: 0,
          discount_percentage: 0,
          purchase_cost_taxable_value: 0,
          gst_percentage: 18,
          igst: 0,
          cgst: 0,
          sgst: 0,
          invoice_value: 0,
          description: '',
          stock_quantity: 0
        });
        onClose();
        setSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Product successfully added to both collection and inventory!
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {/* First row */}
            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date *"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="name"
                label="Product Name *"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="hsn_code"
                label="HSN Code"
                value={formData.hsn_code}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            {/* Second row */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="units"
                label="UNITS"
                value={formData.units}
                onChange={handleInputChange}
                fullWidth
                placeholder="pcs, kg, ml, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="invoice_number"
                label="Purchase Invoice No. *"
                value={formData.invoice_number}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="purchase_quantity"
                label="Purchase Qty. *"
                type="number"
                value={formData.purchase_quantity}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Third row */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="purchase_incl_gst"
                label="Purchase Incl. GST (Rs.) *"
                type="number"
                value={formData.purchase_incl_gst}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="purchase_excl_gst"
                label="Purchase Ex. GST (Rs.)"
                type="number"
                value={formData.purchase_excl_gst}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="mrp_percentage"
                label="MRP Percentage"
                type="number"
                value={formData.mrp_percentage}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Fourth row */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="mrp_per_unit_excl_gst"
                label="MRP per Unit (Ex.GST) (Rs.)"
                type="number"
                value={formData.mrp_per_unit_excl_gst}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="discount_percentage"
                label="Discount on Purchase Percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="purchase_cost_taxable_value"
                label="Purchase Cost Taxable Value (Rs.)"
                type="number"
                value={formData.purchase_cost_taxable_value}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Fifth row */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="gst_percentage"
                label="Purchase GST Percentage *"
                type="number"
                value={formData.gst_percentage}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="igst"
                label="Purchase IGST (Rs.)"
                type="number"
                value={formData.igst}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="cgst"
                label="Purchase CGST (Rs.)"
                type="number"
                value={formData.cgst}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            {/* Sixth row */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="sgst"
                label="Purchase SGST (Rs.)"
                type="number"
                value={formData.sgst}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="invoice_value"
                label="Purchase Invoice Value (Rs.)"
                type="number"
                value={formData.invoice_value}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                name="stock_quantity"
                label="Initial Stock"
                type="number"
                value={formData.stock_quantity || formData.purchase_quantity}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            {/* Additional information */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{ backgroundColor: '#7b9a47', '&:hover': { backgroundColor: '#6a8639' } }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddProduct; 