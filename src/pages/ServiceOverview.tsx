import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Divider,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useServiceCollections } from '../hooks/useServiceCollections';
import { useSubCollections } from '../hooks/useSubCollections';
import { useSubCollectionServices } from '../hooks/useSubCollectionServices';
import type { ServiceCollection, ServiceSubCollection, ServiceItem } from '../models/serviceTypes';
import { formatCurrency } from '../utils/format';
import { AccessibleDialog } from '../components/AccessibleDialog';

const initialColForm = { name: '', description: '' };
const initialSubForm = { name: '', description: '' };
const initialServForm = { name: '', description: '', price: 0, duration: 30, active: true, gender: '', membership_eligible: true };

export default function ServiceOverview() {
  const navigate = useNavigate();

  const {
    serviceCollections,
    isLoading: loadingCols,
    createServiceCollection,
    updateServiceCollection,
    deleteServiceCollection,
  } = useServiceCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const {
    subCollections,
    isLoading: loadingSubs,
    createSubCollection,
    updateSubCollection,
    deleteSubCollection,
  } = useSubCollections(selectedCollectionId || undefined);
  const [selectedSubCollectionId, setSelectedSubCollectionId] = useState<string | null>(null);

  const {
    services,
    isLoading: loadingServices,
    createService,
    updateService,
    deleteService,
  } = useSubCollectionServices(selectedCollectionId || undefined, selectedSubCollectionId || undefined);

  // Dialog state and form data
  const [colDialogOpen, setColDialogOpen] = useState(false);
  const [colFormData, setColFormData] = useState(initialColForm);
  const [colEditingId, setColEditingId] = useState<string | null>(null);

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subFormData, setSubFormData] = useState(initialSubForm);
  const [subEditingId, setSubEditingId] = useState<string | null>(null);

  const [servDialogOpen, setServDialogOpen] = useState(false);
  const [servFormData, setServFormData] = useState(initialServForm);
  const [servEditingId, setServEditingId] = useState<string | null>(null);

  // Default selections
  useEffect(() => {
    if (!loadingCols && serviceCollections.length > 0 && !selectedCollectionId) {
      setSelectedCollectionId(serviceCollections[0].id);
    }
  }, [loadingCols, serviceCollections, selectedCollectionId]);

  useEffect(() => {
    if (!loadingSubs && subCollections.length > 0 && !selectedSubCollectionId) {
      setSelectedSubCollectionId(subCollections[0].id);
    }
  }, [loadingSubs, subCollections, selectedSubCollectionId]);

  // Selection handlers
  const handleCollectionClick = (id: string) => {
    setSelectedCollectionId(id);
    setSelectedSubCollectionId(null);
  };
  const handleSubClick = (id: string) => {
    setSelectedSubCollectionId(id);
  };

  // Collection dialog handlers
  const handleColOpenAdd = () => { setColFormData(initialColForm); setColEditingId(null); setColDialogOpen(true); };
  const handleColEdit = (col: ServiceCollection) => { setColFormData({ name: col.name, description: col.description }); setColEditingId(col.id); setColDialogOpen(true); };
  const handleColClose = () => { setColDialogOpen(false); setColFormData(initialColForm); setColEditingId(null); };
  const handleColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colFormData.name.trim()) return;
    if (colEditingId) {
      updateServiceCollection({ id: colEditingId, ...colFormData });
    } else {
      createServiceCollection(colFormData);
    }
    handleColClose();
  };

  // Subcollection dialog handlers
  const handleSubOpenAdd = () => { setSubFormData(initialSubForm); setSubEditingId(null); setSubDialogOpen(true); };
  const handleSubEdit = (sub: ServiceSubCollection) => { setSubFormData({ name: sub.name, description: sub.description }); setSubEditingId(sub.id); setSubDialogOpen(true); };
  const handleSubClose = () => { setSubDialogOpen(false); setSubFormData(initialSubForm); setSubEditingId(null); };
  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim() || !selectedCollectionId) return;
    if (subEditingId) {
      updateSubCollection({ id: subEditingId, name: subFormData.name, description: subFormData.description, collection_id: selectedCollectionId });
    } else {
      createSubCollection({ name: subFormData.name, description: subFormData.description, collection_id: selectedCollectionId });
    }
    handleSubClose();
  };

  // Service dialog handlers
  const handleServOpenAdd = () => { setServFormData(initialServForm); setServEditingId(null); setServDialogOpen(true); };
  const handleServEdit = (serv: ServiceItem) => { 
    setServFormData({ 
      name: serv.name, 
      description: serv.description, 
      price: serv.price, 
      duration: serv.duration, 
      active: serv.active, 
      gender: serv.gender || '',
      membership_eligible: serv.membership_eligible ?? true
    }); 
    setServEditingId(serv.id); 
    setServDialogOpen(true); 
  };
  const handleServClose = () => { setServDialogOpen(false); setServFormData(initialServForm); setServEditingId(null); };
  const handleServSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servFormData.name.trim() || servFormData.price < 0 || servFormData.duration <= 0 || !selectedCollectionId || !selectedSubCollectionId) return;
    const serviceData = { ...servFormData, collection_id: selectedCollectionId, subcollection_id: selectedSubCollectionId };
    if (servEditingId) {
      updateService({ id: servEditingId, ...serviceData });
    } else {
      createService(serviceData);
    }
    handleServClose();
  };

  // Delete handlers
  const handleColDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection? All subcollections and services will be deleted.')) {
      deleteServiceCollection(id);
    }
  };
  const handleSubDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub-collection? All services will be deleted.')) {
      deleteSubCollection(id);
    }
  };
  const handleServDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  // Loading
  if (loadingCols || loadingSubs || (selectedSubCollectionId && loadingServices)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', width: '100%', p: 2, boxSizing: 'border-box' }}>
      {/* Collections Column */}
      <Paper sx={{ flex: '1 1 0', mr: 2, p: 2, height: 'calc(100vh - 32px)', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Collections</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleColOpenAdd}>New</Button>
        </Box>
        <Divider />
        <List>
          {serviceCollections.map(col => (
            <ListItemButton key={col.id} selected={col.id === selectedCollectionId} onClick={() => handleCollectionClick(col.id)}>
              <ListItemText primary={col.name} secondary={col.description} />
              <IconButton onClick={(e) => { e.stopPropagation(); handleColEdit(col); }} size="small"><EditIcon /></IconButton>
              <IconButton onClick={(e) => { e.stopPropagation(); handleColDelete(col.id); }} size="small" color="error"><DeleteIcon /></IconButton>
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Subcollections Column */}
      <Paper sx={{ flex: '1 1 0', mr: 2, p: 2, height: 'calc(100vh - 32px)', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Sub-Collections</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleSubOpenAdd} disabled={!selectedCollectionId}>New</Button>
        </Box>
        <Divider />
        <List>
          {subCollections.map(sub => (
            <ListItemButton key={sub.id} selected={sub.id === selectedSubCollectionId} onClick={() => handleSubClick(sub.id)}>
              <ListItemText primary={sub.name} secondary={sub.description} />
              <IconButton onClick={(e) => { e.stopPropagation(); handleSubEdit(sub); }} size="small"><EditIcon /></IconButton>
              <IconButton onClick={(e) => { e.stopPropagation(); handleSubDelete(sub.id); }} size="small" color="error"><DeleteIcon /></IconButton>
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Services Column */}
      <Paper sx={{ flex: '2 1 0', p: 2, height: 'calc(100vh - 32px)', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Services</Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleServOpenAdd} disabled={!selectedSubCollectionId}>New</Button>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Membership</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map(serv => (
                <TableRow key={serv.id} sx={{ opacity: serv.active ? 1 : 0.5 }}>
                  <TableCell>{serv.name}</TableCell>
                  <TableCell>{serv.description}</TableCell>
                  <TableCell align="right">{serv.duration} min</TableCell>
                  <TableCell align="right">{formatCurrency(serv.price)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={serv.active ? 'Active' : 'Inactive'} 
                      color={serv.active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={serv.membership_eligible !== false ? 'Eligible' : 'Premium Only'} 
                      color={serv.membership_eligible !== false ? 'primary' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleServEdit(serv)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleServDelete(serv.id)} size="small" color="error"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Collection Dialog */}
      <AccessibleDialog
        open={colDialogOpen}
        onClose={handleColClose}
        title={colEditingId ? 'Edit Collection' : 'New Collection'}
        actions={
          <>
            <Button onClick={handleColClose}>Cancel</Button>
            <Button onClick={handleColSubmit} variant="contained">{colEditingId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleColSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={colFormData.name}
            onChange={e => setColFormData({ ...colFormData, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={colFormData.description}
            onChange={e => setColFormData({ ...colFormData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </AccessibleDialog>

      {/* Subcollection Dialog */}
      <AccessibleDialog
        open={subDialogOpen}
        onClose={handleSubClose}
        title={subEditingId ? 'Edit Sub-Collection' : 'New Sub-Collection'}
        actions={
          <>
            <Button onClick={handleSubClose}>Cancel</Button>
            <Button onClick={handleSubSubmit} variant="contained">{subEditingId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleSubSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={subFormData.name}
            onChange={e => setSubFormData({ ...subFormData, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={subFormData.description}
            onChange={e => setSubFormData({ ...subFormData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </AccessibleDialog>

      {/* Service Dialog */}
      <AccessibleDialog
        open={servDialogOpen}
        onClose={handleServClose}
        title={servEditingId ? 'Edit Service' : 'New Service'}
        actions={
          <>
            <Button onClick={handleServClose}>Cancel</Button>
            <Button onClick={handleServSubmit} variant="contained">{servEditingId ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleServSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={servFormData.name}
            onChange={e => setServFormData({ ...servFormData, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={servFormData.description}
            onChange={e => setServFormData({ ...servFormData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Price"
            type="number"
            value={servFormData.price}
            onChange={e => setServFormData({ ...servFormData, price: parseFloat(e.target.value) })}
            required
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            value={servFormData.duration}
            onChange={e => setServFormData({ ...servFormData, duration: parseInt(e.target.value) })}
            required
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />
          <TextField
            select
            label="Gender"
            value={servFormData.gender}
            onChange={e => setServFormData({ ...servFormData, gender: e.target.value })}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={servFormData.active}
                onChange={e => setServFormData({ ...servFormData, active: e.target.checked })}
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Switch
                checked={servFormData.membership_eligible}
                onChange={e => setServFormData({ ...servFormData, membership_eligible: e.target.checked })}
              />
            }
            label="Membership Eligible"
          />
        </Box>
      </AccessibleDialog>
    </Box>
  );
} 