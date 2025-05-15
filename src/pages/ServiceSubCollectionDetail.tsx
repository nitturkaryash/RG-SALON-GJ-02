import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
  Breadcrumbs,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useServiceCollections } from '../hooks/useServiceCollections'
import { useSubCollections } from '../hooks/useSubCollections'
import { useSubCollectionServices } from '../hooks/useSubCollectionServices'
import { formatCurrency } from '../utils/format'
import type { ServiceItem } from '../models/serviceTypes'

// Initial form data for services
const initialFormData = {
  name: '',
  description: '',
  price: 0,
  duration: 30,
  active: true,
}

export default function ServiceSubCollectionDetail() {
  const { collectionId, subCollectionId } = useParams<{ collectionId: string; subCollectionId: string }>()
  const navigate = useNavigate()

  const { getServiceCollection, isLoading: loadingCollection } = useServiceCollections()
  const collection = getServiceCollection(collectionId || '')

  const { subCollections, isLoading: loadingSubs } = useSubCollections(collectionId)
  const subCollection = subCollections.find(sc => sc.id === subCollectionId)

  const {
    services,
    isLoading: loadingServices,
    createService,
    updateService,
    deleteService,
    refetch: refetchServices,
  } = useSubCollectionServices(collectionId, subCollectionId)

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loadingCollection && !collection) {
      navigate('/services')
    }
  }, [collection, loadingCollection, navigate])

  useEffect(() => {
    if (!loadingSubs && !subCollection) {
      navigate(`/services/${collectionId}`)
    }
  }, [subCollection, loadingSubs, navigate, collectionId])

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setFormData(initialFormData)
    setEditingId(null)
  }

  const handleEdit = (service: ServiceItem) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      active: service.active,
    })
    setEditingId(service.id)
    setOpen(true)
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setFormData({ ...formData, duration: 0 })
      return
    }
    const parsedValue = parseInt(value, 10)
    if (!isNaN(parsedValue)) {
      setFormData({ ...formData, duration: parsedValue })
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setFormData({ ...formData, price: 0 })
      return
    }
    const parsedValue = parseFloat(value)
    if (!isNaN(parsedValue)) {
      setFormData({ ...formData, price: parsedValue })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.price < 0 || formData.duration <= 0) {
      console.error('Form validation failed', formData)
      return
    }
    try {
      const serviceData = { ...formData, collection_id: collectionId!, subcollection_id: subCollectionId! }
      if (editingId) {
        await updateService({ ...serviceData, id: editingId })
      } else {
        await createService(serviceData)
      }
      await refetchServices()
      handleClose()
    } catch (error) {
      console.error('Failed to save service:', error)
      alert(`Error saving service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id)
    }
  }

  if (loadingCollection || loadingSubs || loadingServices) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/services" style={{ textDecoration: 'none', color: 'inherit' }}>
            Services
          </Link>
          <Link to={`/services/${collectionId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {collection?.name}
          </Link>
          <Typography color="text.primary">{subCollection?.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1">{subCollection?.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {subCollection?.description}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ height: 'fit-content' }}>
          Add Service
        </Button>
      </Box>

      {loadingServices ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : services && services.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service: ServiceItem) => (
                <TableRow key={service.id} sx={{ opacity: service.active ? 1 : 0.6 }}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                      {service.duration} min
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(service.price)}</TableCell>
                  <TableCell>
                    <Chip label={service.active ? 'Active' : 'Inactive'} color={service.active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(service)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(service.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No services found in this sub-collection. Click "Add Service" to create your first one.
          </Typography>
          <Button variant="outlined" color="primary" onClick={() => refetchServices()} sx={{ mt: 2 }} startIcon={<RefreshIcon />}>
            Refresh List
          </Button>
        </Paper>
      )}

      {/* Add/Edit Service Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingId ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required fullWidth />
              <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth />
              <TextField label="Duration (minutes)" type="number" value={formData.duration} onChange={handleDurationChange} required fullWidth InputProps={{ inputProps: { min: 5 } }} />
              <TextField label="Price (₹)" type="number" value={formData.price} onChange={handlePriceChange} required fullWidth InputProps={{ inputProps: { min: 0, step: 0.01 } }} />
              <FormControlLabel control={<Switch checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} color="primary" />} label="Active" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editingId ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}