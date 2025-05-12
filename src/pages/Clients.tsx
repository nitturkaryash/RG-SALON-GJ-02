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
  DialogContentText
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
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useClients, Client } from '../hooks/useClients'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/format'

export default function Clients() {
  const { clients, isLoading, createClient, updateClient, processPendingPayment, deleteClient, deleteAllClients } = useClients()
  const { orders, isLoading: isLoadingOrders } = useOrders()
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  // Filter clients based on search query
  const filteredClients = clients?.filter(client => 
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  // Handle add client
  const handleAddClient = async () => {
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
      email: client.email,
      notes: client.notes || '',
      gender: client.gender || '',
      birth_date: client.birth_date || '',
      anniversary_date: client.anniversary_date || ''
    })
    setOpenEditDialog(true)
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
    if (!selectedClient) return
    
    await deleteClient(selectedClient.id)
    
    setSelectedClient(null)
    setOpenDeleteDialog(false)
  }
  
  // Open delete all clients dialog
  const handleOpenDeleteAllDialog = () => {
    setOpenDeleteAllDialog(true)
  }
  
  // Handle delete all clients
  const handleDeleteAllClients = async () => {
    await deleteAllClients()
    setOpenDeleteAllDialog(false)
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1">Clients</Typography>
        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteAllDialog}
            sx={{ height: 'fit-content', mr: 2 }}
          >
            Delete All Clients
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddDialog(true)}
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
        onChange={(e) => setSearchQuery(e.target.value)}
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
        {clients && clients.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                {filteredClients.map((client) => {
                  // Calculate lifetime visits dynamically
                  const lifetimeVisits = orders?.filter(
                    order => 
                      ((order as any).client_name === client.full_name || (order as any).customer_name === client.full_name) && 
                      (order as any).status !== 'cancelled' && 
                      !(order as any).consumption_purpose && 
                      (order as any).client_name !== 'Salon Consumption'
                  ).length || 0

                  return (
                    <TableRow key={client.id}>
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
            No clients in the database. Add a client to get started.
          </Typography>
        )}
      </Paper>
      
      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="full_name"
                label="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
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
          <Button 
            onClick={handleAddClient} 
            variant="contained"
            disabled={!formData.full_name}
          >
            Add Client
          </Button>
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
                label="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
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
      
      {/* Delete All Clients Dialog */}
      <Dialog
        open={openDeleteAllDialog}
        onClose={() => setOpenDeleteAllDialog(false)}
        aria-labelledby="delete-all-dialog-title"
        aria-describedby="delete-all-dialog-description"
      >
        <DialogTitle id="delete-all-dialog-title">{"Delete All Clients"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-all-dialog-description">
            Warning: This will permanently delete ALL clients in the system. This action cannot be undone. 
            Are you absolutely sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAllDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAllClients} 
            variant="contained"
            color="error"
            autoFocus
          >
            Yes, Delete All Clients
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 