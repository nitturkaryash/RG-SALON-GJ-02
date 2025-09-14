import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useServiceCollections } from '../hooks/useServiceCollections';
import { useCollectionServices } from '../hooks/useCollectionServices';
import { formatCurrency } from '../utils/formatting/format';
import type { ServiceItem } from '../models/serviceTypes';

// Initial form data for services
const initialFormData = {
  name: '',
  description: '',
  price: 0,
  duration: 30,
  active: true,
  membership_eligible: true, // Default to true for backward compatibility
};

export default function ServiceCollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const collectionId = id || '';
  const navigate = useNavigate();

  const { getServiceCollection, isLoading: loadingCollection } =
    useServiceCollections();
  const {
    collectionServices,
    isLoading: loadingServices,
    createService,
    updateService,
    deleteService,
    refetch: refetchServices,
  } = useCollectionServices(collectionId);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  const collection = getServiceCollection(collectionId);

  useEffect(() => {
    // Redirect if collection doesn't exist
    if (!loadingCollection && !collection) {
      navigate('/services');
    }
  }, [collection, loadingCollection, navigate]);

  // Debug output
  useEffect(() => {
    console.log('Collection ID:', collectionId);
    console.log('Collection Services:', collectionServices);
    console.log('Loading state:', { loadingCollection, loadingServices });
  }, [collectionId, collectionServices, loadingCollection, loadingServices]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleEdit = (service: ServiceItem) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      active: service.active,
      membership_eligible: service.membership_eligible ?? true, // Default to true if not set
    });
    setEditingId(service.id);
    setOpen(true);
  };

  // Handler for duration changes with validation
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If empty string, set duration to 0
    if (value === '') {
      setFormData({ ...formData, duration: 0 });
      return;
    }

    // Try to parse as integer
    const parsedValue = parseInt(value, 10);

    // If valid number, update state
    if (!isNaN(parsedValue)) {
      setFormData({ ...formData, duration: parsedValue });
    }
    // If invalid, don't update (keep previous value)
  };

  // Handler for price changes with validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If empty string, set price to 0
    if (value === '') {
      setFormData({ ...formData, price: 0 });
      return;
    }

    // Try to parse as float - store the actual price value without multiplying by 100
    const parsedValue = parseFloat(value);

    // If valid number, update state (store the actual price value)
    if (!isNaN(parsedValue)) {
      setFormData({ ...formData, price: parsedValue });
    }
    // If invalid, don't update (keep previous value)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || formData.price < 0 || formData.duration <= 0) {
      console.error('Form validation failed', formData);
      return;
    }

    try {
      // Create service data with collection_id
      if (editingId) {
        const serviceData = {
          ...formData,
          id: editingId,
          collection_id: collectionId!,
        };
        await updateService(serviceData);
      } else {
        const serviceData = { ...formData, collection_id: collectionId! };
        await createService(serviceData);
      }

      // Manually refetch after successful mutation
      await refetchServices();

      // Close dialog after successful save and refetch
      handleClose();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert(
        `Error saving service: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  if (loadingCollection || loadingServices) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!collection) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='body1' color='text.secondary'>
          Collection not found.
        </Typography>
        <Button
          component={Link}
          to='/services'
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Collections
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link
            to='/services'
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Services
          </Link>
          <Typography color='text.primary'>{collection.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant='h1'>{collection.name}</Typography>
          <Typography variant='subtitle1' color='text.secondary'>
            {collection.description}
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ height: 'fit-content' }}
        >
          Add Service
        </Button>
      </Box>

      {loadingServices ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : collectionServices && collectionServices.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align='right'>Duration</TableCell>
                <TableCell align='right'>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Membership</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collectionServices.map((service: ServiceItem) => (
                <TableRow
                  key={service.id}
                  sx={{
                    opacity: service.active ? 1 : 0.6,
                  }}
                >
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell align='right'>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <AccessTimeIcon
                        fontSize='small'
                        sx={{ mr: 0.5, opacity: 0.6 }}
                      />
                      {service.duration} min
                    </Box>
                  </TableCell>
                  <TableCell align='right'>
                    {formatCurrency(service.price)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.active ? 'Active' : 'Inactive'}
                      color={service.active ? 'success' : 'default'}
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        service.membership_eligible !== false
                          ? 'Eligible'
                          : 'Premium Only'
                      }
                      color={
                        service.membership_eligible !== false
                          ? 'primary'
                          : 'warning'
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      onClick={() => handleEdit(service)}
                      color='primary'
                      size='small'
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(service.id)}
                      color='error'
                      size='small'
                    >
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
          <Typography variant='body1' color='text.secondary'>
            No services found in this collection. Click "Add Service" to create
            your first one.
          </Typography>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => refetchServices()}
            sx={{ mt: 2 }}
            startIcon={<RefreshIcon />}
          >
            Refresh List
          </Button>
        </Paper>
      )}

      {/* Add/Edit Service Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}
            >
              <TextField
                label='Name'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label='Description'
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label='Duration (minutes)'
                type='number'
                value={formData.duration}
                onChange={handleDurationChange}
                required
                fullWidth
                InputProps={{
                  inputProps: { min: 5 },
                }}
              />
              <TextField
                label='Price (₹)'
                type='number'
                // Display price as is - no need to divide by 100
                value={formData.price}
                onChange={handlePriceChange}
                required
                fullWidth
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={e =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    color='primary'
                  />
                }
                label='Active'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.membership_eligible}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        membership_eligible: e.target.checked,
                      })
                    }
                    color='primary'
                  />
                }
                label='Membership Eligible'
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: -1, ml: 4 }}
              >
                {formData.membership_eligible
                  ? 'This service can be purchased using membership balance'
                  : 'This is a premium service - can only be purchased with regular payment methods'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type='submit' variant='contained'>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
