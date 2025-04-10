import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useCollections } from '../hooks/useCollections'
import { useProducts } from '../hooks/useProducts'
import { calculateProfit, calculateProfitMargin } from '../models/inventoryTypes'
import { formatCurrency, formatPercentage } from '../utils/format'
import type { Product } from '../models/inventoryTypes'

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>()
  const collectionId = id || ''
  const navigate = useNavigate()
  
  // Move formData state inside the component
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    mrp_incl_gst: 0,
    hsn_code: '',
    unit_type: '',
    gst_percentage: 0,
    stock_quantity: 0
  })
  
  const { getCollection, isLoading: loadingCollection } = useCollections()
  const { products, isLoading: loadingProducts, addProduct, updateProduct, deleteProduct } = useProducts()
  
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [profit, setProfit] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)
  const [errors, setErrors] = useState({})
  
  const collection = getCollection(collectionId)
  
  useEffect(() => {
    // Redirect if collection doesn't exist
    if (!loadingCollection && !collection) {
      navigate('/inventory')
    }
  }, [collection, loadingCollection, navigate])
  
  useEffect(() => {
    // Calculate profit and margin when price or cost changes
    const calculatedProfit = calculateProfit(formData.mrp_incl_gst, formData.gst_percentage)
    setProfit(calculatedProfit)
    
    const calculatedMargin = calculateProfitMargin(formData.mrp_incl_gst, formData.gst_percentage)
    setProfitMargin(calculatedMargin)
  }, [formData.mrp_incl_gst, formData.gst_percentage])
  
  const handleOpen = () => setOpen(true)
  
  const handleClose = () => {
    setOpen(false)
    resetForm()
  }
  
  const handleEdit = (product: any) => {
    setFormData({
      product_name: product.product_name || '',
      description: product.description || '',
      mrp_incl_gst: product.mrp_incl_gst || 0,
      hsn_code: product.hsn_code || '',
      unit_type: product.unit_type || '',
      gst_percentage: product.gst_percentage || 0,
      stock_quantity: product.stock_quantity || 0
    })
    setEditingId(product.id)
    setOpen(true)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Validate form
    const errors: Record<string, string> = {}
    if (!formData.product_name.trim()) errors.product_name = 'Product name is required'
    if (formData.mrp_incl_gst <= 0) errors.mrp_incl_gst = 'Price must be greater than 0'
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }
    
    try {
      // Create or update product
      if (editingId) {
        updateProduct(editingId, { 
          product_name: formData.product_name,
          name: formData.product_name,
          description: formData.description,
          mrp_incl_gst: formData.mrp_incl_gst,
          price: formData.mrp_incl_gst,
          hsn_code: formData.hsn_code,
          unit_type: formData.unit_type,
          gst_percentage: formData.gst_percentage,
          stock_quantity: formData.stock_quantity
        })
      } else {
        addProduct({ 
          product_name: formData.product_name,
          name: formData.product_name,
          description: formData.description,
          mrp_incl_gst: formData.mrp_incl_gst,
          price: formData.mrp_incl_gst,
          hsn_code: formData.hsn_code,
          unit_type: formData.unit_type,
          gst_percentage: formData.gst_percentage,
          stock_quantity: formData.stock_quantity,
          active: true,
          collection_id: collectionId,
          discount_on_purchase_percentage: 0
        })
      }
      
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting product form:', error);
      // You could add a toast notification here for better user feedback
    }
  }
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id)
    }
  }
  
  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      mrp_incl_gst: 0,
      hsn_code: '',
      unit_type: '',
      gst_percentage: 0,
      stock_quantity: 0
    })
    setEditingId(null)
    setErrors({})
  }
  
  // Products Table rendered inside the component with access to state variables
  const renderProductsTable = () => {
    if (loadingProducts) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
    }
    
    if (!products || products.length === 0) {
      return <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>No products in this collection yet.</Typography>
    }
    
    return (
      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.light' }}>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">HSN Code</TableCell>
              <TableCell align="right">GST %</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              return (
                <TableRow key={product.id} hover>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell align="right">{formatCurrency(product.mrp_incl_gst)}</TableCell>
                  <TableCell align="right">{product.stock_quantity || 0} units</TableCell>
                  <TableCell align="right">{product.hsn_code || 'N/A'}</TableCell>
                  <TableCell align="right">{product.gst_percentage || 0}%</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEdit(product)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
  
  if (loadingCollection || loadingProducts) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }
  
  if (!collection) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Collection not found.
        </Typography>
        <Button
          component={Link}
          to="/inventory"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Collections
        </Button>
      </Paper>
    )
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
            Inventory
          </Link>
          <Typography color="text.primary">{collection.name}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1">{collection.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {collection.description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ height: 'fit-content' }}
        >
          Add Product
        </Button>
      </Box>
      
      {renderProductsTable()}
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Product Name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
                fullWidth
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
              />
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Price (₹)"
                  type="number"
                  value={formData.mrp_incl_gst}
                  onChange={(e) => setFormData({ ...formData, mrp_incl_gst: parseFloat(e.target.value) || 0 })}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={formData.mrp_incl_gst <= 0}
                  helperText={formData.mrp_incl_gst <= 0 ? "Price must be greater than 0" : ""}
                />
                
                <TextField
                  label="GST %"
                  type="number"
                  value={formData.gst_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_percentage: parseFloat(e.target.value) || 0 })}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={formData.gst_percentage < 0}
                  helperText={formData.gst_percentage < 0 ? "GST percentage cannot be negative" : ""}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Stock (Units)"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
                  error={formData.stock_quantity < 0}
                  helperText={formData.stock_quantity < 0 ? "Stock cannot be negative" : ""}
                />
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Profit (₹)"
                  value={formatCurrency(profit)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      color: profit >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    },
                  }}
                />
                
                <TextField
                  label="Margin (%)"
                  value={formatPercentage(profitMargin)}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      color: profitMargin >= 20 ? 'success.main' : profitMargin >= 0 ? 'warning.main' : 'error.main',
                      fontWeight: 'bold',
                    },
                  }}
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!formData.product_name.trim() || formData.mrp_incl_gst <= 0}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
} 