import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip as MuiTooltip,
  useTheme,
  useMediaQuery,
  Card,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  GetApp as GetAppIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useServiceCollections } from '../hooks/useServiceCollections';
import { useSubCollections } from '../hooks/useSubCollections';
import { useSubCollectionServices } from '../hooks/useSubCollectionServices';
import { useServiceMutations } from '../hooks/useServiceMutations';
import type {
  ServiceCollection,
  ServiceSubCollection,
  ServiceItem,
} from '../models/serviceTypes';
import { formatCurrency } from '../utils/formatting/format';
import { AccessibleDialog } from '../components/modals/AccessibleDialog';
import { exportToExcel } from '../utils/export/excelExporter';

const initialColForm = { name: '', description: '' };
const initialSubForm = { name: '', description: '' };
const initialServForm = {
  name: '',
  description: '',
  price: 0,
  duration: 30,
  active: true,
  gender: '',
  membership_eligible: true,
};

export default function ServiceOverview() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const {
    serviceCollections,
    isLoading: loadingCols,
    createServiceCollection,
    updateServiceCollection,
    deleteServiceCollection,
  } = useServiceCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >('');

  const {
    subCollections,
    isLoading: loadingSubs,
    createSubCollection,
    updateSubCollection,
    deleteSubCollection,
  } = useSubCollections(selectedCollectionId || undefined);
  const [selectedSubCollectionId, setSelectedSubCollectionId] = useState<
    string | null
  >('');

  const { data: services, isLoading: loadingServices } =
    useSubCollectionServices(
      selectedCollectionId || undefined,
      selectedSubCollectionId === 'all' ? undefined : selectedSubCollectionId
    );

  const { createService, updateService, deleteService } = useServiceMutations();

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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Default selections
  useEffect(() => {
    if (
      !loadingCols &&
      (serviceCollections ?? []).length > 0 &&
      !selectedCollectionId
    ) {
      setSelectedCollectionId((serviceCollections ?? [])[0].id);
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
    setSelectedSubCollectionId('all'); // Default to all sub-collections
  };
  const handleSubClick = (id: string) => {
    setSelectedSubCollectionId(id);
  };

  // Collection dialog handlers
  const handleColOpenAdd = () => {
    setColFormData(initialColForm);
    setColEditingId(null);
    setColDialogOpen(true);
  };
  const handleColEdit = (col: ServiceCollection) => {
    setColFormData({ name: col.name, description: col.description });
    setColEditingId(col.id);
    setColDialogOpen(true);
  };
  const handleColClose = () => {
    setColDialogOpen(false);
    setColFormData(initialColForm);
    setColEditingId(null);
  };
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
  const handleSubOpenAdd = () => {
    setSubFormData(initialSubForm);
    setSubEditingId(null);
    setSubDialogOpen(true);
  };
  const handleSubEdit = (sub: ServiceSubCollection) => {
    setSubFormData({ name: sub.name, description: sub.description });
    setSubEditingId(sub.id);
    setSubDialogOpen(true);
  };
  const handleSubClose = () => {
    setSubDialogOpen(false);
    setSubFormData(initialSubForm);
    setSubEditingId(null);
  };
  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim() || !selectedCollectionId) return;
    if (subEditingId) {
      updateSubCollection({
        id: subEditingId,
        name: subFormData.name,
        description: subFormData.description,
        collection_id: selectedCollectionId,
      });
    } else {
      createSubCollection({
        name: subFormData.name,
        description: subFormData.description,
        collection_id: selectedCollectionId,
      });
    }
    handleSubClose();
  };

  // Service dialog handlers
  const handleServOpenAdd = () => {
    setServFormData(initialServForm);
    setServEditingId(null);
    setServDialogOpen(true);
  };
  const handleServEdit = (serv: ServiceItem) => {
    setServFormData({
      name: serv.name,
      description: serv.description,
      price: serv.price,
      duration: serv.duration,
      active: serv.active,
      gender: serv.gender || '',
      membership_eligible: serv.membership_eligible ?? true,
    });
    setServEditingId(serv.id);
    setServDialogOpen(true);
  };
  const handleServClose = () => {
    setServDialogOpen(false);
    setServFormData(initialServForm);
    setServEditingId(null);
  };
  const handleServSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !servFormData.name.trim() ||
      servFormData.price < 0 ||
      servFormData.duration <= 0 ||
      !selectedCollectionId ||
      !selectedSubCollectionId
    )
      return;
    const genderValue =
      servFormData.gender === ''
        ? null
        : (servFormData.gender as 'male' | 'female' | null | undefined);
    const serviceData = {
      ...servFormData,
      gender: genderValue,
      collection_id: selectedCollectionId,
      subcollection_id:
        selectedSubCollectionId === 'all' ? null : selectedSubCollectionId,
    };
    if (servEditingId) {
      updateService({ id: servEditingId, ...serviceData });
    } else {
      createService(serviceData);
    }
    handleServClose();
  };

  // Delete handlers
  const handleColDelete = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this collection? All subcollections and services will be deleted.'
      )
    ) {
      deleteServiceCollection(id);
    }
  };
  const handleSubDelete = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this sub-collection? All services will be deleted.'
      )
    ) {
      deleteSubCollection(id);
    }
  };
  const handleServDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'table' | 'card' | null
  ) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const [managementDialog, setManagementDialog] = useState({
    open: false,
    type: null as 'collections' | 'sub-collections' | null,
    anchorEl: null as HTMLElement | null,
  });

  const handleOpenManagementDialog = (
    event: React.MouseEvent<HTMLElement>,
    type: 'collections' | 'sub-collections'
  ) => {
    setManagementDialog({ open: true, type, anchorEl: event.currentTarget });
  };
  const handleCloseManagementDialog = () => {
    setManagementDialog({ open: false, type: null, anchorEl: null });
  };

  const handleExport = () => {
    const dataToExport = services?.map((service: ServiceItem) => {
      const collection = serviceCollections?.find(
        c => c.id === service.collection_id
      );
      const subCollection = subCollections?.find(
        s => s.id === service.subcollection_id
      );
      return {
        Collection: collection?.name,
        'Sub-Collection': subCollection?.name,
        'Service Name': service.name,
        Description: service.description,
        Price: service.price,
        'Duration (min)': service.duration,
        Active: service.active ? 'Yes' : 'No',
        Gender: service.gender || 'All',
        'Membership Eligible': service.membership_eligible ? 'Yes' : 'No',
      };
    });

    if (dataToExport) {
      exportToExcel(dataToExport, 'Services');
    }
  };

  const filteredServices =
    services?.filter((service: ServiceItem) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Loading
  if (loadingCols) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='calc(100vh - 120px)'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#FAFBFD' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant='h4'
          sx={{ fontWeight: 'bold', color: 'text.primary' }}
        >
          Service Master
        </Typography>
        <Box>
          <Button
            variant='outlined'
            startIcon={<GetAppIcon />}
            onClick={handleExport}
            sx={{ mr: 2 }}
          >
            Export
          </Button>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleServOpenAdd}
            disabled={!selectedSubCollectionId}
            sx={{
              bgcolor: '#6B8E23',
              '&:hover': { bgcolor: '#556B2F' },
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label='Collection'
              value={selectedCollectionId || ''}
              onChange={e => handleCollectionClick(e.target.value as string)}
              fullWidth
              size='small'
              variant='outlined'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={e =>
                        handleOpenManagementDialog(e, 'collections')
                      }
                      size='small'
                      edge='end'
                    >
                      <SettingsIcon fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value='all'>
                <em>All Collections</em>
              </MenuItem>
              {serviceCollections?.map(col => (
                <MenuItem key={col.id} value={col.id}>
                  {col.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label='Sub-Collection'
              value={selectedSubCollectionId || ''}
              onChange={e => handleSubClick(e.target.value as string)}
              fullWidth
              disabled={
                !selectedCollectionId ||
                loadingSubs ||
                selectedCollectionId === 'all'
              }
              size='small'
              variant='outlined'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={e =>
                        handleOpenManagementDialog(e, 'sub-collections')
                      }
                      disabled={!selectedCollectionId}
                      size='small'
                      edge='end'
                    >
                      <SettingsIcon fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value='all'>
                <em>All Sub-Collections</em>
              </MenuItem>
              {subCollections?.map(sub => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label='Search Services'
              variant='outlined'
              size='small'
              fullWidth
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setSearchTerm('')}
                      edge='end'
                      size='small'
                      style={{ visibility: searchTerm ? 'visible' : 'hidden' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              aria-label='view mode'
              size='small'
            >
              <ToggleButton value='table' aria-label='table view'>
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value='card' aria-label='card view'>
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {viewMode === 'table' ? (
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'rgba(107, 142, 35, 0.1)' }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                  >
                    Service Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                    align='center'
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                    align='right'
                  >
                    Price
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                    align='center'
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                    align='center'
                  >
                    Membership
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: '600', color: 'text.secondary' }}
                    align='center'
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingServices ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center' sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !selectedCollectionId || selectedCollectionId === '' ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center' sx={{ py: 5 }}>
                      Please select a collection to see the services.
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center' sx={{ py: 5 }}>
                      <Typography variant='h6' gutterBottom>
                        No Services Found
                      </Typography>
                      <Typography color='text.secondary'>
                        {searchTerm
                          ? `No services match your search for "${searchTerm}".`
                          : 'This category is empty. Try adding a new service.'}
                      </Typography>
                      {searchTerm && (
                        <Button
                          onClick={() => setSearchTerm('')}
                          sx={{ mt: 2 }}
                        >
                          Clear Search
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((serv: ServiceItem, index: number) => (
                    <TableRow
                      key={serv.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor:
                          index % 2 !== 0
                            ? theme.palette.action.hover
                            : 'transparent',
                      }}
                    >
                      <TableCell
                        component='th'
                        scope='row'
                        sx={{ fontWeight: '500' }}
                      >
                        {serv.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 250,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <MuiTooltip title={serv.description} arrow>
                          <Typography variant='body2' color='text.secondary'>
                            {serv.description}
                          </Typography>
                        </MuiTooltip>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={`${serv.duration} min`}
                          variant='outlined'
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='right' sx={{ fontWeight: '500' }}>
                        {formatCurrency(serv.price)}
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={serv.active ? 'Active' : 'Inactive'}
                          color={serv.active ? 'success' : 'default'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={
                            serv.membership_eligible !== false
                              ? 'Eligible'
                              : 'Premium'
                          }
                          color={
                            serv.membership_eligible !== false
                              ? 'primary'
                              : 'warning'
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <MuiTooltip title='Edit Service'>
                          <IconButton
                            onClick={() => handleServEdit(serv)}
                            size='small'
                          >
                            <EditIcon />
                          </IconButton>
                        </MuiTooltip>
                        <MuiTooltip title='Delete Service'>
                          <IconButton
                            onClick={() => handleServDelete(serv.id)}
                            size='small'
                            color='error'
                          >
                            <DeleteIcon />
                          </IconButton>
                        </MuiTooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredServices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.map((service: ServiceItem) => (
            <Grid item key={service.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant='h6' component='div' gutterBottom>
                    {service.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2, height: 40, overflow: 'hidden' }}
                  >
                    {service.description}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={`${service.duration} min`}
                      variant='outlined'
                      size='small'
                    />
                    <Typography variant='h6' color='primary'>
                      {formatCurrency(service.price)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.active}
                        onChange={e =>
                          updateService({
                            ...service,
                            active: e.target.checked,
                          })
                        }
                      />
                    }
                    label={service.active ? 'Active' : 'Inactive'}
                  />
                  <Box>
                    <IconButton
                      onClick={() => handleServEdit(service)}
                      size='small'
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleServDelete(service.id)}
                      size='small'
                    >
                      <DeleteIcon color='error' />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs remain the same but will be triggered by new buttons */}
      <AccessibleDialog
        open={colDialogOpen}
        onClose={handleColClose}
        title={colEditingId ? 'Edit Collection' : 'New Collection'}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10],
          },
        }}
        actions={
          <Box sx={{ display: 'flex', gap: 2, p: 3, pt: 0 }}>
            <Button
              onClick={handleColClose}
              variant='outlined'
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleColSubmit}
              variant='contained'
              sx={{ borderRadius: 2, px: 3 }}
            >
              {colEditingId ? 'Update' : 'Create'}
            </Button>
          </Box>
        }
      >
        <Box
          component='form'
          onSubmit={handleColSubmit}
          sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label='Collection Name'
            value={colFormData.name}
            onChange={e =>
              setColFormData({ ...colFormData, name: e.target.value })
            }
            required
            fullWidth
            variant='outlined'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            label='Description'
            value={colFormData.description}
            onChange={e =>
              setColFormData({ ...colFormData, description: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </AccessibleDialog>

      {/* Sub-Collection Dialog */}
      <AccessibleDialog
        open={subDialogOpen}
        onClose={handleSubClose}
        title={subEditingId ? 'Edit Sub-Collection' : 'New Sub-Collection'}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10],
          },
        }}
        actions={
          <Box sx={{ display: 'flex', gap: 2, p: 3, pt: 0 }}>
            <Button
              onClick={handleSubClose}
              variant='outlined'
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubSubmit}
              variant='contained'
              sx={{ borderRadius: 2, px: 3 }}
            >
              {subEditingId ? 'Update' : 'Create'}
            </Button>
          </Box>
        }
      >
        <Box
          component='form'
          onSubmit={handleSubSubmit}
          sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label='Sub-Collection Name'
            value={subFormData.name}
            onChange={e =>
              setSubFormData({ ...subFormData, name: e.target.value })
            }
            required
            fullWidth
            variant='outlined'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            label='Description'
            value={subFormData.description}
            onChange={e =>
              setSubFormData({ ...subFormData, description: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </AccessibleDialog>

      {/* Service Dialog */}
      <AccessibleDialog
        open={servDialogOpen}
        onClose={handleServClose}
        title={servEditingId ? 'Edit Service' : 'New Service'}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10],
          },
        }}
        actions={
          <Box sx={{ display: 'flex', gap: 2, p: 3, pt: 0 }}>
            <Button
              onClick={handleServClose}
              variant='outlined'
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleServSubmit}
              variant='contained'
              sx={{ borderRadius: 2, px: 3 }}
            >
              {servEditingId ? 'Update' : 'Create'}
            </Button>
          </Box>
        }
      >
        <Box component='form' onSubmit={handleServSubmit} sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            <TextField
              label='Service Name'
              value={servFormData.name}
              onChange={e =>
                setServFormData({ ...servFormData, name: e.target.value })
              }
              required
              fullWidth
              variant='outlined'
              sx={{
                gridColumn: { xs: '1', sm: '1 / -1' },
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <TextField
              label='Description'
              value={servFormData.description}
              onChange={e =>
                setServFormData({
                  ...servFormData,
                  description: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={3}
              variant='outlined'
              sx={{
                gridColumn: { xs: '1', sm: '1 / -1' },
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <TextField
              label='Price (₹)'
              type='number'
              value={servFormData.price}
              onChange={e =>
                setServFormData({
                  ...servFormData,
                  price: parseFloat(e.target.value),
                })
              }
              required
              fullWidth
              variant='outlined'
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <TextField
              label='Duration (minutes)'
              type='number'
              value={servFormData.duration}
              onChange={e =>
                setServFormData({
                  ...servFormData,
                  duration: parseInt(e.target.value),
                })
              }
              required
              fullWidth
              variant='outlined'
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            />
            <TextField
              select
              label='Gender Preference'
              value={servFormData.gender}
              onChange={e =>
                setServFormData({ ...servFormData, gender: e.target.value })
              }
              fullWidth
              variant='outlined'
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
              }}
            >
              <MenuItem value=''>All Genders</MenuItem>
              <MenuItem value='male'>Male Only</MenuItem>
              <MenuItem value='female'>Female Only</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={servFormData.active}
                    onChange={e =>
                      setServFormData({
                        ...servFormData,
                        active: e.target.checked,
                      })
                    }
                    color='primary'
                  />
                }
                label='Active Service'
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={servFormData.membership_eligible}
                    onChange={e =>
                      setServFormData({
                        ...servFormData,
                        membership_eligible: e.target.checked,
                      })
                    }
                    color='primary'
                  />
                }
                label='Membership Eligible'
              />
            </Box>
          </Box>
        </Box>
      </AccessibleDialog>
      {/* Management Dialog for Collections and Sub-collections */}
      <AccessibleDialog
        open={managementDialog.open}
        onClose={handleCloseManagementDialog}
        title={`Manage ${managementDialog.type === 'collections' ? 'Collections' : 'Sub-Collections'}`}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <List sx={{ p: 2 }}>
          <Button
            variant='contained'
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => {
              if (managementDialog.type === 'collections') handleColOpenAdd();
              else handleSubOpenAdd();
              handleCloseManagementDialog();
            }}
            sx={{ mb: 2 }}
          >
            Add New{' '}
            {managementDialog.type === 'collections'
              ? 'Collection'
              : 'Sub-Collection'}
          </Button>
          {(managementDialog.type === 'collections'
            ? serviceCollections
            : subCollections
          )?.map((item: ServiceCollection | ServiceSubCollection) => (
            <Paper
              key={item.id}
              variant='outlined'
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                borderRadius: 2,
              }}
            >
              <ListItemText
                primary={item.name}
                secondary={item.description}
                sx={{ flexGrow: 1, ml: 1 }}
              />
              <IconButton
                edge='end'
                aria-label='edit'
                onClick={() => {
                  if (managementDialog.type === 'collections')
                    handleColEdit(item as ServiceCollection);
                  else handleSubEdit(item as ServiceSubCollection);
                  handleCloseManagementDialog();
                }}
              >
                <EditIcon fontSize='small' />
              </IconButton>
              <IconButton
                edge='end'
                aria-label='delete'
                onClick={() => {
                  if (managementDialog.type === 'collections')
                    handleColDelete(item.id);
                  else handleSubDelete(item.id);
                }}
                sx={{ ml: 1 }}
              >
                <DeleteIcon color='error' fontSize='small' />
              </IconButton>
            </Paper>
          ))}
        </List>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            pt: 0,
            borderTop: '1px solid ' + theme.palette.divider,
          }}
        >
          <Button onClick={handleCloseManagementDialog} variant='outlined'>
            Close
          </Button>
        </Box>
      </AccessibleDialog>
    </Box>
  );
}
