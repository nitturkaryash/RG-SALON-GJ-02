import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
  Alert,
  DialogContentText,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip as MuiTooltip
} from '@mui/material'
import {
  CalendarToday as CalendarTodayIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Wc as WcIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx'
import { useClients, Client } from '../hooks/useClients'
import { useOrders } from '../hooks/useOrders'
import { useClientPayments, ClientPayment } from '../hooks/useClientPayments'; // Import the new hook
import { formatCurrency } from '../utils/format'
import { toast } from 'react-hot-toast'
import { isValidPhoneNumber, isValidEmail } from '../utils/validation'
import ScrollIndicator from '../components/ScrollIndicator'
import { useEffect } from 'react'

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function Clients() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 50

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 350)
  const {
    clients,
    totalClientsCount,
    isLoading,
    refetchAllClients,
    createClient,
    updateClient,
    processPendingPayment,
    deleteClient
  } = useClients(page, pageSize, debouncedSearchQuery)
  const { orders, isLoading: isLoadingOrders } = useOrders()
  
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false); // State for history dialog
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    notes: '',
    gender: '',
    birth_date: '',
    anniversary_date: ''
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    full_name: '',
    phone: '',
    email: ''
  })
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Clear error when field is being edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  // Validate form fields
  const validateForm = () => {
    const errors = {
      full_name: '',
      phone: '',
      email: ''
    }
    let isValid = true

    // Validate full name
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required'
      isValid = false
    }

    // Validate phone
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
      isValid = false
    } else if (!isValidPhoneNumber(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
      isValid = false
    }

    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }
  
  // Handle search with debouncing to reset to page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page when searching
  }

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage)
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalClientsCount / pageSize)

  // Export clients to Excel
  const exportToExcel = async () => {
    try {
      // First fetch all clients for export
      const { data } = await refetchAllClients()
      const clientsToExport = data?.clients || clients // Use 'clients' from the hook

      if (!clientsToExport || clientsToExport.length === 0) {
        toast.error('No client data to export')
        return
      }

      // Prepare data for Excel export
      const exportData = clientsToExport.map((client, index) => {
      // Calculate lifetime visits for each client
      const lifetimeVisits = orders?.filter(
        order => 
          ((order as any).client_name === client.full_name || (order as any).customer_name === client.full_name) && 
          (order as any).status !== 'cancelled' && 
          !(order as any).consumption_purpose && 
          (order as any).client_name !== 'Salon Consumption'
      ).length || 0

      return {
        'S.No.': index + 1,
        'Name': client.full_name,
        'Phone': client.phone,
        'Email': client.email || '',
        'Gender': client.gender || '',
        'Birth Date': client.birth_date ? new Date(client.birth_date).toLocaleDateString() : '',
        'Anniversary Date': client.anniversary_date ? new Date(client.anniversary_date).toLocaleDateString() : '',
        'Last Visit': client.last_visit ? new Date(client.last_visit).toLocaleDateString() : 'Never',
        'Lifetime Visits': lifetimeVisits,
        'Total Spent (₹)': client.total_spent,
        'Pending Payment (₹)': client.pending_payment || 0,
        'Notes': client.notes || ''
      }
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // S.No.
      { wch: 20 },  // Name
      { wch: 15 },  // Phone
      { wch: 25 },  // Email
      { wch: 10 },  // Gender
      { wch: 12 },  // Birth Date
      { wch: 15 },  // Anniversary Date
      { wch: 12 },  // Last Visit
      { wch: 15 },  // Lifetime Visits
      { wch: 15 },  // Total Spent
      { wch: 18 },  // Pending Payment
      { wch: 30 }   // Notes
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients')

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `Clients_Export_${currentDate}.xlsx`

      // Save file
      XLSX.writeFile(workbook, filename)
      toast.success(`Client data exported successfully as ${filename}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export client data')
    }
  }
  
  // Handle add client
  const handleAddClient = async () => {
    if (!validateForm()) {
      return
    }

    await createClient({
      ...formData,
      birth_date: formData.birth_date || null,
      anniversary_date: formData.anniversary_date || null
    })
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      notes: '',
      gender: '',
      birth_date: '',
      anniversary_date: ''
    })
    setOpenAddDialog(false)
  }
  
  // Handle edit client
  const handleEditClient = async () => {
    if (!selectedClient) return
    
    if (!validateForm()) {
      return
    }
    
    await updateClient({
      id: selectedClient.id,
      ...formData
    })
    
    setSelectedClient(null)
    setOpenEditDialog(false)
  }
  
  // Open edit dialog with client data
  const handleOpenEditDialog = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      full_name: client.full_name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
      gender: client.gender || '',
      birth_date: client.birth_date || '',
      anniversary_date: client.anniversary_date || ''
    })
    // Clear any previous errors
    setFormErrors({
      full_name: '',
      phone: '',
      email: ''
    })
    setOpenEditDialog(true)
  }

  // Reset form and errors when opening add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      notes: '',
      gender: '',
      birth_date: '',
      anniversary_date: ''
    })
    setFormErrors({
      full_name: '',
      phone: '',
      email: ''
    })
    setOpenAddDialog(true)
  }
  
  // Open payment dialog for BNPL
  const handleOpenPaymentDialog = (client: Client) => {
    setSelectedClient(client)
    setPaymentAmount(client.pending_payment || 0)
    setOpenPaymentDialog(true)
  }
  
  // Process pending payment
  const handleProcessPayment = async () => {
    if (!selectedClient) return
    
    await processPendingPayment({
      clientId: selectedClient.id,
      amount: paymentAmount,
      paymentMethod: paymentMethod as any
    })
    
    setSelectedClient(null)
    setPaymentAmount(0)
    setOpenPaymentDialog(false)
  }
  
  // Open delete dialog
  const handleOpenDeleteDialog = (client: Client) => {
    setSelectedClient(client)
    setOpenDeleteDialog(true)
  }
  
  // Open payment history dialog
  const handleOpenHistoryDialog = (client: Client) => {
    setSelectedClient(client);
    setOpenHistoryDialog(true);
  };

  // Handle delete client
  const handleDeleteClient = async () => {
    if (!selectedClient) {
      console.error('No client selected for deletion');
      return;
    }
    
    try {
      console.log('Attempting to delete client:', selectedClient.id, selectedClient.full_name);
      
      // Call the deleteClient function from the hook
      await deleteClient(selectedClient.id);
      
      console.log('Client deletion successful');
      setSelectedClient(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error in handleDeleteClient:', error);
      // Keep the dialog open so user can see the error
      toast.error(`Failed to delete client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  

  
  if (isLoading || isLoadingOrders) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }
  
  return (
    <Box>
      {/* Scroll Indicator - tracks window scroll progress */}
      <ScrollIndicator 
        showScrollToTop={true}
        color="primary"
        height={4}
        position="top"
        showPercentage={true}
      />
      
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        background: theme => theme.palette.background.paper,
      }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}>Clients</Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {clients?.length || 0} of {totalClientsCount} total clients
            {searchQuery && ` (filtered by "${searchQuery}")`}
          </Typography>
          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
            ✨ Serial numbers are based on current page (page {page}: {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalClientsCount)})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <MuiTooltip title={`Export all ${totalClientsCount} clients to Excel`}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              sx={{ height: 'fit-content', borderRadius: 2, boxShadow: 1 }}
              disabled={totalClientsCount === 0}
            >
              Export All ({totalClientsCount})
            </Button>
          </MuiTooltip>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              height: 'fit-content',
              borderRadius: 2,
              boxShadow: 2,
              fontWeight: 700,
              background: theme => theme.palette.primary.main,
              color: '#fff',
              '&:hover': { background: theme => theme.palette.primary.dark }
            }}
          >
            Add Client
          </Button>
        </Box>
      </Box>
      
      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search clients by name, phone, or email..."
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: {
            background: theme => theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: 1,
            fontSize: 15,
            py: 1,
          }
        }}
        sx={{ mb: 3 }}
      />
      
      {/* Clients Table */}
      <Paper sx={{
        p: 1,
        overflowX: 'auto',
        borderRadius: 3,
        boxShadow: 3,
        background: theme => theme.palette.background.paper,
      }}>
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading all clients...</Typography>
          </Box>
        )}
        {clients && clients.length > 0 ? (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ background: theme => theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>S.No.</TableCell>
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Contact</TableCell>
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Last Visit</TableCell>}
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Gender</TableCell>}
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Birth Date</TableCell>}
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Anniversary</TableCell>}
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Lifetime Visits</TableCell>
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Total Spent</TableCell>
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Pending Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', px: 1, background: theme => theme.palette.background.paper, top: 0, zIndex: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client, index) => {
                const lifetimeVisits = orders?.filter(
                  order =>
                    ((order as any).client_name === client.full_name || (order as any).customer_name === client.full_name) &&
                    (order as any).status !== 'cancelled' &&
                    !(order as any).consumption_purpose &&
                    (order as any).client_name !== 'Salon Consumption'
                ).length || 0
                const serialNumber = ((page - 1) * pageSize) + index + 1
                return (
                  <TableRow
                    key={client.id}
                    sx={{
                      '&:nth-of-type(odd)': { background: theme => theme.palette.action.hover },
                      '&:hover': { background: theme => theme.palette.action.selected },
                      '& td': { px: 1, py: 0.5, fontSize: 13, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <TableCell>
                      <MuiTooltip title={serialNumber} arrow>
                        <span>{serialNumber}</span>
                      </MuiTooltip>
                    </TableCell>
                    <TableCell>
                      <MuiTooltip title={client.full_name} arrow>
                        <span>{client.full_name}</span>
                      </MuiTooltip>
                    </TableCell>
                    <TableCell>
                      <MuiTooltip title={client.phone} arrow>
                        <Typography variant="body2" sx={{ fontSize: 13 }}>{client.phone}</Typography>
                      </MuiTooltip>
                      {client.email && (
                        <MuiTooltip title={client.email} arrow>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, wordBreak: 'break-all' }}>
                            {client.email}
                          </Typography>
                        </MuiTooltip>
                      )}
                    </TableCell>
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip title={client.last_visit ? new Date(client.last_visit).toLocaleDateString() : 'Never'} arrow>
                          <span>{client.last_visit ? new Date(client.last_visit).toLocaleDateString() : 'Never'}</span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip title={client.gender || '-'} arrow>
                          <span>{client.gender || '-'}</span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip title={client.birth_date ? new Date(client.birth_date).toLocaleDateString() : '-'} arrow>
                          <span>{client.birth_date ? new Date(client.birth_date).toLocaleDateString() : '-'}</span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip title={client.anniversary_date ? new Date(client.anniversary_date).toLocaleDateString() : '-'} arrow>
                          <span>{client.anniversary_date ? new Date(client.anniversary_date).toLocaleDateString() : '-'}</span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    <TableCell>
                      <MuiTooltip title={lifetimeVisits} arrow>
                        <span>{lifetimeVisits}</span>
                      </MuiTooltip>
                    </TableCell>
                    <TableCell>
                      <Typography color="success.main" fontWeight="bold" sx={{ fontSize: 13 }}>
                        {formatCurrency(client.total_spent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {client.pending_payment > 0 ? (
                        <Chip
                          label={formatCurrency(client.pending_payment)}
                          color="warning"
                          size="small"
                          onClick={() => handleOpenPaymentDialog(client)}
                        />
                      ) : (
                        <Typography color="text.secondary" sx={{ fontSize: 12 }}>No pending</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <MuiTooltip title="Edit Client">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(client)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </MuiTooltip>
                        {client.pending_payment > 0 && (
                          <MuiTooltip title="Clear Pending">
                            <IconButton size="small" color="primary" onClick={() => handleOpenPaymentDialog(client)}>
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                        )}
                        <MuiTooltip title="Payment History">
                          <IconButton size="small" color="info" onClick={() => handleOpenHistoryDialog(client)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </MuiTooltip>
                        <MuiTooltip title="Delete Client">
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(client)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </MuiTooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? `No clients found matching "${searchQuery}"` : 'No clients in the database. Add a client to get started.'}
          </Typography>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
          <Typography variant="body2" color="text.secondary">
            {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalClientsCount)} of {totalClientsCount}
          </Typography>
        </Stack>
      )}
      
      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="full_name"
                label="Full Name *"
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.full_name}
                helperText={formErrors.full_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number *"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="birth_date"
                label="Birth Date"
                type="date"
                value={formData.birth_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="anniversary_date"
                label="Anniversary Date"
                type="date"
                value={formData.anniversary_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained" color="primary">Add Client</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Client Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="full_name"
                label="Full Name *"
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.full_name}
                helperText={formErrors.full_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number *"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="birth_date"
                label="Birth Date"
                type="date"
                value={formData.birth_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="anniversary_date"
                label="Anniversary Date"
                type="date"
                value={formData.anniversary_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            
            {selectedClient && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Total Spent</Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(selectedClient.total_spent)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Pending Payment</Typography>
                  <Typography variant="h6" color={(selectedClient.pending_payment || 0) > 0 ? "warning.main" : "text.secondary"}>
                    {(selectedClient.pending_payment || 0) > 0 
                      ? formatCurrency(selectedClient.pending_payment || 0)
                      : "No pending amount"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Last Visit</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                    {selectedClient.last_visit 
                      ? new Date(selectedClient.last_visit).toLocaleDateString()
                      : "Never visited"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Lifetime Visits</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ConfirmationNumberIcon fontSize="small" sx={{ mr: 1 }} />
                    {/* Calculate for selected client in dialog */}
                    {selectedClient && (orders?.filter( 
                      order => 
                        ((order as any).client_name === selectedClient.full_name || (order as any).customer_name === selectedClient.full_name) && 
                        (order as any).status !== 'cancelled' && 
                        !(order as any).consumption_purpose && 
                        (order as any).client_name !== 'Salon Consumption'
                    ).length || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Gender</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <WcIcon fontSize="small" sx={{ mr: 1 }} />
                    {selectedClient.gender || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Birth Date</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                    {selectedClient.birth_date ? new Date(selectedClient.birth_date).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Anniversary Date</Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    {selectedClient.anniversary_date ? new Date(selectedClient.anniversary_date).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditClient} 
            variant="contained"
            disabled={!formData.full_name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Process Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Pending Payment</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Processing payment for {selectedClient.full_name}
                </Alert>
                
                <Typography variant="subtitle1" gutterBottom>
                  Total Pending Amount: {formatCurrency(selectedClient.pending_payment)}
                </Typography>
                
                <TextField
                  label="Payment Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  fullWidth
                  InputProps={{
                    inputProps: { min: 0, max: selectedClient.pending_payment || 0 },
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  error={paymentAmount > (selectedClient.pending_payment || 0)}
                  helperText={paymentAmount > (selectedClient.pending_payment || 0) ? "Amount exceeds pending payment" : ""}
                  sx={{ mt: 2 }}
                />

                <TextField
                  select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleProcessPayment} 
            variant="contained"
            disabled={!selectedClient || paymentAmount <= 0 || paymentAmount > (selectedClient?.pending_payment || 0)}
            startIcon={<CreditCardIcon />}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Client Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this client? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteClient} 
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment History Dialog */}
      {selectedClient && (
        <PaymentHistoryDialog
          open={openHistoryDialog}
          onClose={() => setOpenHistoryDialog(false)}
          client={selectedClient}
        />
      )}

    </Box>
  )
} 

// New component for Payment History Dialog
function PaymentHistoryDialog({ open, onClose, client }: { open: boolean, onClose: () => void, client: Client }) {
  const { payments, isLoading, error } = useClientPayments(client.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Payment History for {client.full_name}</DialogTitle>
      <DialogContent>
        {isLoading && <CircularProgress />}
        {error && <Alert severity="error">{error.message}</Alert>}
        
        {payments && payments.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Items</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.payment_method === 'pending_payment' ? 'Pending Clearance' : 'Sale'} 
                        color={payment.payment_method === 'pending_payment' ? 'info' : 'success'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(payment.total)}</TableCell>
                    <TableCell>
                      {payment.payments.map(p => `${p.method}: ${formatCurrency(p.amount)}`).join(', ')}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(payment.services) ? payment.services.map(s => `${s.name || s.service_name} (x${s.quantity || 1})`).join(', ') : 'No item details'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 2 }}>No payment history found for this client.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 