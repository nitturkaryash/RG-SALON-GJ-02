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
  Stack
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  CreditCard as CreditCardIcon,
  Search as SearchIcon,
  CalendarToday as CalendarTodayIcon,
  Event as EventIcon,
  Wc as WcIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material'
import * as XLSX from 'xlsx'
import { useClients, Client } from '../hooks/useClients'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/format'
import { toast } from 'react-hot-toast'
import { isValidPhoneNumber, isValidEmail } from '../utils/validation'
import ScrollIndicator from '../components/ScrollIndicator'

export default function Clients() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 50

  const { 
    clients, 
    totalClientsCount, 
    allClients, 
    isLoading, 
    refetchAllClients,
    createClient, 
    updateClient, 
    processPendingPayment, 
    deleteClient 
  } = useClients(page, pageSize, searchQuery)
  const { orders, isLoading: isLoadingOrders } = useOrders()
  
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  
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
      const clientsToExport = data?.clients || allClients

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
      amount: paymentAmount
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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h1">Clients</Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {clients?.length || 0} of {totalClientsCount} total clients
            {searchQuery && ` (filtered by "${searchQuery}")`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages} • {pageSize} clients per page
          </Typography>
          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
            ✨ Serial numbers are based on current page (page {page}: {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalClientsCount)})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title={`Export all ${totalClientsCount} clients to Excel`}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              sx={{ height: 'fit-content' }}
              disabled={totalClientsCount === 0}
            >
              Export All ({totalClientsCount})
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ height: 'fit-content' }}
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
        }}
        sx={{ mb: 3 }}
      />
      
      {/* Clients Table */}
      <Paper sx={{ p: 3 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading all clients...</Typography>
          </Box>
        )}
        {clients && clients.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Last Visit</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Birth Date</TableCell>
                  <TableCell>Anniversary</TableCell>
                  <TableCell>Lifetime Visits</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Pending Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client, index) => {
                  // Calculate lifetime visits dynamically
                  const lifetimeVisits = orders?.filter(
                    order => 
                      ((order as any).client_name === client.full_name || (order as any).customer_name === client.full_name) && 
                      (order as any).status !== 'cancelled' && 
                      !(order as any).consumption_purpose && 
                      (order as any).client_name !== 'Salon Consumption'
                  ).length || 0

                  // Calculate serial number based on current page
                  const serialNumber = ((page - 1) * pageSize) + index + 1

                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{client.full_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.phone}</Typography>
                        <Typography variant="body2" color="text.secondary">{client.email}</Typography>
                      </TableCell>
                      <TableCell>
                        {client.last_visit ? new Date(client.last_visit).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>{client.gender || '-'}</TableCell>
                      <TableCell>
                        {client.birth_date ? new Date(client.birth_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {client.anniversary_date ? new Date(client.anniversary_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>{lifetimeVisits}</TableCell>
                      <TableCell>
                        <Typography color="success.main" fontWeight="bold">
                          {formatCurrency(client.total_spent)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {client.pending_payment > 0 ? (
                          <Chip 
                            label={formatCurrency(client.pending_payment)} 
                            color="warning"
                            onClick={() => handleOpenPaymentDialog(client)}
                          />
                        ) : (
                          <Typography color="text.secondary">No pending amount</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Tooltip title="Edit Client">
                            <IconButton onClick={() => handleOpenEditDialog(client)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {client.pending_payment > 0 && (
                            <Tooltip title="Process Payment">
                              <IconButton 
                                color="primary"
                                onClick={() => handleOpenPaymentDialog(client)}
                              >
                                <CreditCardIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Delete Client">
                            <IconButton onClick={() => handleOpenDeleteDialog(client)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
      

    </Box>
  )
} 