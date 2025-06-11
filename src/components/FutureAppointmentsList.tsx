import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Button, 
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  DialogActions,
  Tabs,
  Tab,
  Divider,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Phone as PhoneIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { formatCurrency } from '../utils/format';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface AppointmentCardProps {
  appointment: any;
  onDeleteClick: (id: string) => void;
  onEditClick: (appointment: any) => void;
  onUpdateAppointment?: (appointment: any) => void;
  clients?: any[];
}

const AppointmentCard = ({ 
  appointment, 
  onDeleteClick, 
  onEditClick, 
  onUpdateAppointment,
  clients = [] 
}: AppointmentCardProps) => {
  const navigate = useNavigate();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(appointment.start_time));

  const handlePosClick = () => {
    // Get all services for this appointment from clientDetails
    const allServices = appointment.clientDetails?.[0]?.services || [];
    
    // If no services in clientDetails, fall back to single service from appointment
    let servicesForPOS = [];
    
    if (allServices.length > 0) {
      // Map all services with proper structure
      servicesForPOS = allServices.map((service: any) => ({
        id: service.id,
        name: service.name,
        price: service.price || 0,
        type: 'service',
        hsn_code: service.hsn_code,
        gst_percentage: service.gst_percentage,
        category: service.category || 'service',
        quantity: 1
      }));
    } else {
      // Fallback to single service if clientDetails is empty
      servicesForPOS = [{
        id: appointment.service_id,
        name: appointment.serviceName || 'Unknown Service',
        price: appointment.servicePrice || 0,
        type: 'service',
        quantity: 1
      }];
    }

    // Get client name with proper fallbacks
    const clientName = getClientName(appointment);

    const appointmentDataForPOS = {
      id: appointment.id,
      clientName: clientName,
      stylistId: appointment.stylist_id,
      services: servicesForPOS,
      type: servicesForPOS.length > 1 ? 'service_collection' : 'service',
      appointmentTime: appointment.start_time,
      notes: appointment.notes || '',
      // Include additional service details for single service case
      ...(servicesForPOS.length === 1 ? {
        serviceId: servicesForPOS[0].id,
        servicePrice: servicesForPOS[0].price,
        serviceHsnCode: servicesForPOS[0].hsn_code,
        serviceGstPercentage: servicesForPOS[0].gst_percentage
      } : {})
    };

    navigate('/pos', {
      state: {
        appointmentData: appointmentDataForPOS
      }
    });
  };

  // Helper function to get client name with multiple fallbacks
  const getClientName = (appointment: any): string => {
    // First try clientDetails array
    if (appointment.clientDetails && appointment.clientDetails.length > 0 && appointment.clientDetails[0]?.full_name) {
      return appointment.clientDetails[0].full_name;
    }
    
    // Then try the direct clientName property
    if (appointment.clientName) {
      return appointment.clientName;
    }
    
    // Then try client_name property
    if (appointment.client_name) {
      return appointment.client_name;
    }
    
    // Then try looking up from client_id in the clients array
    if (appointment.client_id && clients.length > 0) {
      const matchingClient = clients.find(c => c.id === appointment.client_id);
      if (matchingClient?.full_name) {
        return matchingClient.full_name;
      }
    }
    
    // Then try to fetch from the client object
    if (appointment.client && appointment.client.full_name) {
      return appointment.client.full_name;
    }
    
    // Then try booker_name for appointments booked for someone else
    if (appointment.is_for_someone_else && appointment.booker_name) {
      return `${appointment.booker_name} (Booker)`;
    }
    
    // If all else fails, show "Unknown Client"
    return 'Unknown Client';
  };

  // Helper function to get client phone with multiple fallbacks
  const getClientPhone = (appointment: any): string => {
    // First try clientDetails array
    if (appointment.clientDetails && 
        appointment.clientDetails.length > 0 && 
        appointment.clientDetails[0]?.phone) {
      return appointment.clientDetails[0].phone;
    }
    
    // Then try direct phone property
    if (appointment.phone) {
      return appointment.phone;
    }
    
    // Then try looking up from client_id in the clients array
    if (appointment.client_id && clients.length > 0) {
      const matchingClient = clients.find(c => c.id === appointment.client_id);
      if (matchingClient?.phone) {
        return matchingClient.phone;
      }
    }
    
    // Then try client object
    if (appointment.client && appointment.client.phone) {
      return appointment.client.phone;
    }
    
    // Then try booker phone for appointments booked for someone else
    if (appointment.is_for_someone_else && appointment.booker_phone) {
      return appointment.booker_phone;
    }
    
    // If all else fails
    return 'No phone';
  };

  // Format date to display like "25-May-2025, 03:00 PM"
  const formattedDateTime = format(new Date(appointment.start_time), 'dd-MMM-yyyy, hh:mm a');

  const handleDateChange = (newDate: Date | null) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    // Don't automatically update - wait for user to click Update button
  };

  const handleDateUpdate = () => {
    if (!selectedDate) return;
    
    // Create a copy of the appointment with the new date
    const currentDate = new Date(appointment.start_time);
    const currentEnd = new Date(appointment.end_time);
    const duration = currentEnd.getTime() - currentDate.getTime();
    
    const newStart = new Date(selectedDate);
    newStart.setHours(currentDate.getHours(), currentDate.getMinutes());
    
    const newEnd = new Date(newStart.getTime() + duration);
    
    const updatedAppointment = {
      ...appointment,
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString()
    };
    
    // Use separate update function instead of onEditClick
    if (onUpdateAppointment) {
      onUpdateAppointment(updatedAppointment);
    }
    setDatePickerOpen(false);
  };

  const handleDateCancel = () => {
    // Reset to original date
    setSelectedDate(new Date(appointment.start_time));
    setDatePickerOpen(false);
  };

  return (
    <Card
      elevation={1}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'visible',
        position: 'relative',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: 3,
          bgcolor: 'background.paper',
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box 
        sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2, display: 'flex', gap: 1 }}
      >
        <IconButton
          size="small"
          color="primary"
          onClick={() => setDatePickerOpen(true)}
        >
          <CalendarIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDeleteClick(appointment.id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      <CardContent 
        sx={{ 
          pt: 2, 
          pb: 2, 
          px: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        onClick={() => onEditClick(appointment)}
      >
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium', mb: 0.5 }}>
            {getClientName(appointment)}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <PhoneIcon fontSize="small" />
            {getClientPhone(appointment)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {appointment.serviceName || appointment.services?.[0]?.name || 'Unknown Service'}
          </Typography>
          
          {appointment.stylist && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Stylist: {appointment.stylist.name}
            </Typography>
          )}

          <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 'medium' }}>
            {formattedDateTime}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          {appointment.paid ? (
            <Chip size="small" color="success" label="Paid" />
          ) : (
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handlePosClick();
              }}
              sx={{ fontSize: '0.8rem', py: 0.5, minWidth: 60 }}
            >
              POS
            </Button>
          )}
        </Box>
      </CardContent>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={datePickerOpen}
          onClose={handleDateCancel}
          sx={{ zIndex: (theme) => theme.zIndex.modal }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Appointment Date</DialogTitle>
          <DialogContent>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ width: '100%', mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleDateCancel} variant="outlined">
              Cancel
            </Button>
            <Button 
              onClick={handleDateUpdate} 
              variant="contained" 
              color="primary"
              disabled={!selectedDate}
            >
              Update Date
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </Card>
  );
};

interface FutureAppointmentsListProps {
  appointments: any[];
  onDeleteAppointment?: ((id: string) => Promise<void>) | ((id: string) => void);
  onEditAppointment?: (appointment: any) => void;
  onUpdateAppointment?: (appointmentId: string, updates: any) => Promise<void>;
  stylists?: any[];
  services?: any[];
  clients?: any[];
}

const FutureAppointmentsList: React.FC<FutureAppointmentsListProps> = ({
  appointments,
  onDeleteAppointment,
  onEditAppointment,
  onUpdateAppointment,
  stylists = [],
  services = [],
  clients = []
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  
  // Categories for tabs
  const categories = [
    { label: 'Past', value: 'past' },
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'Future', value: 'future' }
  ];
  
  useEffect(() => {
    filterAppointments(tabValue);
  }, [appointments, tabValue]);
  
  const filterAppointments = (tabIndex: number) => {
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(today, 1));
    
    let filtered = [];
    
    switch (tabIndex) {
      case 0: // Past
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isBefore(appDate, today);
        });
        // Sort past appointments in descending order (most recent first)
        filtered.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        break;
      case 1: // Today
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isSameDay(appDate, today);
        });
        break;
      case 2: // Tomorrow
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isSameDay(appDate, tomorrow);
        });
        break;
      case 3: // Future (beyond tomorrow)
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isAfter(appDate, endOfDay(tomorrow));
        });
        break;
      default:
        filtered = appointments;
    }
    
    // Sort by date/time (ascending for future appointments)
    if (tabIndex !== 0) {
      filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }
    
    // Enrich appointment data with related info
    filtered = filtered.map(appointment => {
      // Find stylist info
      const stylist = stylists.find(s => s.id === appointment.stylist_id);
      
      // Find service info
      const service = services.find(s => s.id === appointment.service_id);
      
      return {
        ...appointment,
        stylist,
        serviceName: service?.name || 'Unknown Service',
        servicePrice: service?.price || 0
      };
    });
    
    setFilteredAppointments(filtered);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      if (onDeleteAppointment) {
        try {
          await onDeleteAppointment(id);
        } catch (error) {
          console.error('Failed to delete appointment:', error);
          alert('Failed to delete appointment');
        }
      }
    }
  };

  const handleEditClick = (appointment: any) => {
    if (onEditAppointment) {
      onEditAppointment(appointment);
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: any) => {
    // Update backend first
    if (onUpdateAppointment) {
      try {
        await onUpdateAppointment(updatedAppointment.id, {
          start_time: updatedAppointment.start_time,
          end_time: updatedAppointment.end_time
        });
      } catch (error) {
        console.error('Failed to update appointment in backend:', error);
        alert('Failed to update appointment. Please try again.');
        return;
      }
    }

    // Then update local state
    const index = filteredAppointments.findIndex(app => app.id === updatedAppointment.id);
    if (index !== -1) {
      const newAppointments = [...filteredAppointments];
      newAppointments[index] = {
        ...newAppointments[index],
        ...updatedAppointment
      };
      setFilteredAppointments(newAppointments);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: '#f9f9f9',
          pt: 1
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'medium',
              textTransform: 'none',
              fontSize: '1rem',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold',
              }
            }
          }}
        >
          {categories.map((category, idx) => (
            <Tab 
              key={idx} 
              label={category.label} 
              id={`appointment-tab-${idx}`}
              aria-controls={`appointment-tabpanel-${idx}`}
            />
          ))}
        </Tabs>
      </Box>

      <Box 
        flex={1} 
        sx={{ 
          p: { xs: 1, md: 2 }, 
          overflow: 'auto'
        }}
      >
        {tabValue === 0 && filteredAppointments.length > 0 && (
          <Grid container spacing={2}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={() => handleEditClick(appointment)}
                  onUpdateAppointment={handleUpdateAppointment}
                  clients={clients}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {tabValue === 1 && filteredAppointments.length > 0 && (
          <Grid container spacing={2}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={() => handleEditClick(appointment)}
                  onUpdateAppointment={handleUpdateAppointment}
                  clients={clients}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {tabValue === 2 && filteredAppointments.length > 0 && (
          <Grid container spacing={2}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={() => handleEditClick(appointment)}
                  onUpdateAppointment={handleUpdateAppointment}
                  clients={clients}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {tabValue === 3 && filteredAppointments.length > 0 && (
          <Grid container spacing={2}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={() => handleEditClick(appointment)}
                  onUpdateAppointment={handleUpdateAppointment}
                  clients={clients}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* No appointments message */}
        {filteredAppointments.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No {tabValue === 0 ? 'past' : tabValue === 1 ? 'today' : tabValue === 2 ? 'tomorrow' : 'future'} appointments
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FutureAppointmentsList; 