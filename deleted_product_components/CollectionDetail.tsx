import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
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
  CircularProgress,
  Breadcrumbs,
  Stack
} from '@mui/material'
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useCollections } from '../hooks/useCollections'
import { calculateProfit, calculateProfitMargin } from '../models/inventoryTypes'
import { formatCurrency, formatPercentage } from '../utils/format'
import CollectionProductsTable from '../components/CollectionProductsTable'

// Initial form data
const initialFormData = {
  product_name: '',
  description: '',
  mrp_incl_gst: 0,
  hsn_code: '',
  unit_type: '',
  gst_percentage: 0,
  stock_quantity: 0
}

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>()
  const collectionId = id || ''
  const navigate = useNavigate()
  
  const { getCollection, isLoading: loadingCollection } = useCollections()
  
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [profit, setProfit] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)
  const [errors, setErrors] = useState({})
  
  const collection = getCollection(collectionId)
  
  useEffect(() => {
    // Redirect if collection doesn't exist
    if (!loadingCollection && !collection) {
      navigate('/products')
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
  
  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
    setErrors({})
  }
  
  if (loadingCollection) {
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
          to="/products"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Collections
        </Button>
      </Paper>
    )
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
          Products
        </Link>
        <Typography color="text.primary">{collection.name}</Typography>
      </Breadcrumbs>
      
      {/* Use the CollectionProductsTable component here */}
      <CollectionProductsTable 
        collectionId={collectionId} 
        collectionName={collection.name}
      />
    </Box>
  )
} 