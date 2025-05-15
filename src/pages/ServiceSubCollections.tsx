import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  CircularProgress,
  Paper,
  Breadcrumbs,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useServiceCollections } from '../hooks/useServiceCollections'
import { useSubCollections } from '../hooks/useSubCollections'
import type { ServiceSubCollection } from '../models/serviceTypes'

// Initial form data for sub-collections
const initialFormData = {
  name: '',
  description: '',
}

export default function ServiceSubCollections() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const { getServiceCollection, isLoading: loadingCollection } = useServiceCollections()
  const collection = getServiceCollection(collectionId || '')

  const {
    subCollections,
    isLoading: loadingSubs,
    createSubCollection,
    updateSubCollection,
    deleteSubCollection,
  } = useSubCollections(collectionId)

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loadingCollection && !collection) {
      navigate('/services')
    }
  }, [collection, loadingCollection, navigate])

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setFormData(initialFormData)
    setEditingId(null)
  }

  const handleEdit = (sub: ServiceSubCollection) => {
    setFormData({ name: sub.name, description: sub.description })
    setEditingId(sub.id)
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      updateSubCollection({ id: editingId, name: formData.name, description: formData.description, collection_id: collectionId! })
    } else {
      createSubCollection({ name: formData.name, description: formData.description, collection_id: collectionId! })
    }

    handleClose()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub-collection? All services within will also be affected.')) {
      deleteSubCollection(id)
    }
  }

  const handleSubCollectionClick = (id: string) => {
    navigate(`/services/${collectionId}/${id}`)
  }

  if (loadingCollection || loadingSubs) {
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
          <Typography color="text.primary">{collection?.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1">{collection?.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {collection?.description}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ height: 'fit-content' }}>
          Add Sub-Collection
        </Button>
      </Box>

      {subCollections.length ? (
        <Grid container spacing={3}>
          {subCollections.map((sub) => (
            <Grid item xs={12} sm={6} md={4} key={sub.id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  cursor: 'pointer',
                },
              }} onClick={() => handleSubCollectionClick(sub.id)}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {sub.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sub.description}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); handleEdit(sub) }}
                      color="primary" size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => { e.stopPropagation(); handleDelete(sub.id) }}
                      color="error" size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <IconButton
                    color="primary"
                    component={Link}
                    to={`/services/${collectionId}/${sub.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No sub-collections found. Click "Add Sub-Collection" to create your first one.
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Sub-Collection Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Edit Sub-Collection' : 'Add New Sub-Collection'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline rows={3} fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
} 