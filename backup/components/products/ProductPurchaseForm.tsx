import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  InputAdornment,
  Autocomplete,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useInventory } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import { cn } from '../../lib/utils';
import { DatePicker } from '@mui/x-date-pickers';

// Define form state interface
interface PurchaseFormState {
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  invoice_number: string;
  purchase_qty: number;
  mrp_incl_gst: number;
  mrp_excl_gst?: number;
  discount_on_purchase_percentage: number;
  gst_percentage: number;
  purchase_cost_per_unit_ex_gst?: number;
  taxable_value?: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  invoice_value?: number;
  vendor_name?: string;
}

interface ProductOption {
  id: string;
  name: string;
  hsn_code: string;
  units: string;
  price: number;
  gst_percentage: number;
}

const initialFormState: PurchaseFormState = {
  date: new Date().toISOString().split('T')[0],
  product_name: '',
  hsn_code: '',
  units: '',
  invoice_number: '',
  purchase_qty: 1,
  mrp_incl_gst: 0,
  discount_on_purchase_percentage: 0,
  gst_percentage: 18,
};

const ProductPurchaseForm: React.FC = () => {
  const { createPurchase } = useInventory();
  const { products } = useProducts();
  const [formState, setFormState] = useState<PurchaseFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PurchaseFormState, string>>>({});
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    mrp_excl_gst: 0,
    taxable_value: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    invoice_value: 0,
  });

  // Load product options when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const options = products.map(product => ({
        id: product.id,
        name: product.product_name,
        hsn_code: product.hsn_code || '',
        units: product.unit_type || '',
        price: product.mrp_incl_gst || 0,
        gst_percentage: product.gst_percentage || 18
      }));
      setProductOptions(options);
    }
  }, [products]);

  // Calculate values when form changes
  useEffect(() => {
    calculateValues();
  }, [
    formState.mrp_incl_gst,
    formState.gst_percentage,
    formState.purchase_qty,
    formState.discount_on_purchase_percentage
  ]);

  const calculateValues = () => {
    setIsCalculating(true);
    try {
      const { mrp_incl_gst, gst_percentage, purchase_qty, discount_on_purchase_percentage } = formState;
      
      // Calculate MRP excluding GST
      const mrp_excl_gst = mrp_incl_gst / (1 + (gst_percentage / 100));
      
      // Calculate purchase cost after discount
      const discountMultiplier = 1 - (discount_on_purchase_percentage / 100);
      const purchase_cost_per_unit_ex_gst = mrp_excl_gst * discountMultiplier;
      
      // Calculate taxable value (purchase cost * quantity)
      const taxable_value = purchase_cost_per_unit_ex_gst * purchase_qty;
      
      // Calculate GST amounts
      const gst_amount = taxable_value * (gst_percentage / 100);
      const cgst = gst_amount / 2;
      const sgst = gst_amount / 2;
      
      // Calculate invoice value
      const invoice_value = taxable_value + gst_amount;
      
      setCalculatedValues({
        mrp_excl_gst,
        taxable_value,
        igst: gst_amount,
        cgst,
        sgst,
        invoice_value,
      });
      
      // Update form state with calculated values
      setFormState(prev => ({
        ...prev,
        mrp_excl_gst,
        purchase_cost_per_unit_ex_gst,
        taxable_value,
        igst: gst_amount,
        cgst,
        sgst,
        invoice_value,
      }));
    } catch (error) {
      console.error('Error calculating values:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear any error for this field
    if (formErrors[name as keyof PurchaseFormState]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormState(prev => ({ ...prev, [name]: numValue }));
    
    // Clear any error for this field
    if (formErrors[name as keyof PurchaseFormState]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProductChange = (event: React.SyntheticEvent, product: ProductOption | null) => {
    if (product) {
      setFormState(prev => ({
        ...prev,
        product_name: product.name,
        hsn_code: product.hsn_code,
        units: product.units,
        mrp_incl_gst: product.price,
        gst_percentage: product.gst_percentage,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PurchaseFormState, string>> = {};
    
    if (!formState.date) errors.date = 'Date is required';
    if (!formState.product_name) errors.product_name = 'Product name is required';
    if (!formState.hsn_code) errors.hsn_code = 'HSN code is required';
    if (!formState.units) errors.units = 'Units is required';
    if (!formState.invoice_number) errors.invoice_number = 'Invoice number is required';
    if (!formState.purchase_qty || formState.purchase_qty <= 0) {
      errors.purchase_qty = 'Quantity must be greater than 0';
    }
    if (!formState.mrp_incl_gst || formState.mrp_incl_gst <= 0) {
      errors.mrp_incl_gst = 'MRP must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Call createPurchase function from useInventory hook
      const result = await createPurchase({
        date: formState.date,
        product_name: formState.product_name,
        hsn_code: formState.hsn_code,
        units: formState.units,
        purchase_invoice_number: formState.invoice_number,
        purchase_qty: formState.purchase_qty,
        mrp_incl_gst: formState.mrp_incl_gst,
        discount_on_purchase_percentage: formState.discount_on_purchase_percentage,
        gst_percentage: formState.gst_percentage,
        purchase_cost_per_unit_ex_gst: formState.purchase_cost_per_unit_ex_gst,
        purchase_taxable_value: formState.taxable_value,
        purchase_igst: formState.igst,
        purchase_cgst: formState.cgst,
        purchase_sgst: formState.sgst,
        purchase_invoice_value_rs: formState.invoice_value,
        vendor_name: formState.vendor_name || '',
      });
      
      if (result.success) {
        // Reset form after successful submission
        setFormState(initialFormState);
        setFormErrors({});
      } else {
        console.error('Failed to add purchase:', result.error);
        // Optionally set form-level error
      }
    } catch (error) {
      console.error('Error adding purchase:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Purchase
      </Typography>
      <Grid container spacing={2}>
        {/* Date Field */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Date *"
            name="date"
            type="date"
            value={formState.date}
            onChange={handleInputChange}
            error={!!formErrors.date}
            helperText={formErrors.date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        
        {/* Product Selection */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={productOptions}
            getOptionLabel={(option) => option.name}
            onChange={handleProductChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product Name *"
                error={!!formErrors.product_name}
                helperText={formErrors.product_name}
                required
              />
            )}
          />
        </Grid>
        
        {/* HSN Code */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="HSN Code *"
            name="hsn_code"
            value={formState.hsn_code}
            onChange={handleInputChange}
            error={!!formErrors.hsn_code}
            helperText={formErrors.hsn_code}
            required
          />
        </Grid>
        
        {/* Units */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Units"
            name="units"
            value={formState.units}
            onChange={handleInputChange}
            error={!!formErrors.units}
            helperText={formErrors.units}
          />
        </Grid>
        
        {/* Invoice Number */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Invoice Number *"
            name="invoice_number"
            value={formState.invoice_number}
            onChange={handleInputChange}
            error={!!formErrors.invoice_number}
            helperText={formErrors.invoice_number}
            required
          />
        </Grid>
        
        {/* Purchase Quantity */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Purchase Quantity *"
            name="purchase_qty"
            type="number"
            value={formState.purchase_qty}
            onChange={handleNumberInputChange}
            error={!!formErrors.purchase_qty}
            helperText={formErrors.purchase_qty}
            InputProps={{
              startAdornment: <InputAdornment position="start">#</InputAdornment>,
              inputProps: { min: 1 }
            }}
            required
          />
        </Grid>
        
        {/* MRP (Incl. GST) */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="MRP (Incl. GST) *"
            name="mrp_incl_gst"
            type="number"
            value={formState.mrp_incl_gst}
            onChange={handleNumberInputChange}
            error={!!formErrors.mrp_incl_gst}
            helperText={formErrors.mrp_incl_gst}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              inputProps: { min: 0, step: 0.01 }
            }}
            required
          />
        </Grid>
        
        {/* MRP (Excl. GST) - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="MRP (Excl. GST)"
            type="number"
            value={calculatedValues.mrp_excl_gst.toFixed(2)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* Discount on Purchase */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Discount on Purchase (%)"
            name="discount_on_purchase_percentage"
            type="number"
            value={formState.discount_on_purchase_percentage}
            onChange={handleNumberInputChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 100, step: 0.01 }
            }}
          />
        </Grid>
        
        {/* Purchase Cost per Unit (Ex.GST) - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Purchase Cost per Unit (Ex.GST)"
            type="number"
            value={formState.purchase_cost_per_unit_ex_gst?.toFixed(2) || 0}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* GST Percentage */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="GST Percentage *"
            name="gst_percentage"
            type="number"
            value={formState.gst_percentage}
            onChange={handleNumberInputChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              inputProps: { min: 0, max: 28, step: 0.01 }
            }}
            required
          />
        </Grid>
        
        {/* Taxable Value - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Taxable Value (Rs.)"
            type="number"
            value={calculatedValues.taxable_value.toFixed(2)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* IGST Amount - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Purchase IGST (Rs.)"
            type="number"
            value={calculatedValues.igst.toFixed(2)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* CGST Amount - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Purchase CGST (Rs.)"
            type="number"
            value={calculatedValues.cgst.toFixed(2)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* SGST Amount - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Purchase SGST (Rs.)"
            type="number"
            value={calculatedValues.sgst.toFixed(2)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* Invoice Value - Calculated */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Purchase Invoice Value (Rs.)"
            type="number"
            value={calculatedValues.invoice_value.toFixed(2)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              readOnly: true
            }}
            disabled
          />
        </Grid>
        
        {/* Vendor Name - Optional */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Vendor Name"
            name="vendor_name"
            value={formState.vendor_name || ''}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          startIcon={<AddIcon />}
          disabled={isCalculating}
        >
          Add Purchase
        </Button>
      </Box>
    </Paper>
  );
};

const AddProductDialog = ({ open, onClose, onSave }) => {
  const [product, setProduct] = useState({
    date: new Date(),
    productName: '',
    hsnCode: '',
    units: '',
    invoiceNumber: '',
    purchaseQuantity: 1,
    mrpIncGST: 0,
    mrpExclGST: 0,
    discountPercentage: 0,
    purchaseCostPerUnit: 0,
    gstPercentage: 18,
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    invoiceValue: 0,
    initialStock: 0,
    balanceStock: 0
  });

  const handleChange = (field) => (event) => {
    setProduct({ ...product, [field]: event.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}>
            <DatePicker 
              label="Date *"
              value={product.date}
              onChange={(newDate) => setProduct({...product, date: newDate})}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Product Name *"
              value={product.productName}
              onChange={handleChange('productName')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="HSN Code"
              value={product.hsnCode}
              onChange={handleChange('hsnCode')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Units"
              value={product.units}
              onChange={handleChange('units')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Invoice Number *"
              value={product.invoiceNumber}
              onChange={handleChange('invoiceNumber')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Purchase Quantity *"
              value={product.purchaseQuantity}
              onChange={handleChange('purchaseQuantity')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">#</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="MRP (Incl. GST) *"
              value={product.mrpIncGST}
              onChange={handleChange('mrpIncGST')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="MRP (Excl. GST)"
              value={product.mrpExclGST}
              onChange={handleChange('mrpExclGST')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Discount on Purchase (%)"
              value={product.discountPercentage}
              onChange={handleChange('discountPercentage')}
              fullWidth
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Purchase Cost per Unit (Ex.GST)"
              value={product.purchaseCostPerUnit}
              onChange={handleChange('purchaseCostPerUnit')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="GST Percentage *"
              value={product.gstPercentage}
              onChange={handleChange('gstPercentage')}
              fullWidth
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Taxable Value (Rs.)"
              value={product.taxableValue}
              onChange={handleChange('taxableValue')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Purchase IGST (Rs.)"
              value={product.igst}
              onChange={handleChange('igst')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Purchase CGST (Rs.)"
              value={product.cgst}
              onChange={handleChange('cgst')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Purchase SGST (Rs.)"
              value={product.sgst}
              onChange={handleChange('sgst')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Purchase Invoice Value (Rs.)"
              value={product.invoiceValue}
              onChange={handleChange('invoiceValue')}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Initial Stock"
              value={product.initialStock || product.purchaseQuantity}
              onChange={handleChange('initialStock')}
              fullWidth
              type="number"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => onSave(product)}
        >
          Add Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductPurchaseForm; 