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
import { Delete as DeleteIcon, Edit as EditIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { formatCurrency } from '../utils/format';

interface AppointmentCardProps {
  appointment: any;
  onDeleteClick: (id: string) => void;
  onEditClick: (appointment: any) => void;
}

const AppointmentCard = ({ appointment, onDeleteClick, onEditClick }: AppointmentCardProps) => {
  const navigate = useNavigate();

  const handlePosClick = () => {
    navigate('/pos', {
      state: {
        appointmentData: {
          id: appointment.id,
          clientName: appointment.clientDetails?.[0]?.full_name || '',
          stylistId: appointment.stylist_id,
          serviceId: appointment.service_id,
          serviceName: appointment.serviceName || '',
          servicePrice: appointment.servicePrice || 0,
          appointmentTime: appointment.start_time,
          type: 'service'
        }
      }
    });
  };

  // Format date to display like "25-May-2025, 03:00 PM"
  const formattedDateTime = format(new Date(appointment.start_time), 'dd-MMM-yyyy, hh:mm a');

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
      <IconButton
        size="small"
        color="error"
        onClick={() => onDeleteClick(appointment.id)}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 2
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>

      <CardContent sx={{ pt: 2, pb: 2, px: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium', mb: 0.5 }}>
            {appointment.clientDetails?.[0]?.full_name || 'Unknown Client'}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <PhoneIcon fontSize="small" />
            {appointment.clientDetails?.[0]?.phone || appointment.phone || 'No phone'}
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
              onClick={handlePosClick}
              sx={{ fontSize: '0.8rem', py: 0.5, minWidth: 60 }}
            >
              POS
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

interface FutureAppointmentsListProps {
  appointments: any[];
  onDeleteAppointment?: (id: string) => Promise<void>;
  onEditAppointment?: (appointment: any) => void;
  stylists?: any[];
  services?: any[];
}

const FutureAppointmentsList: React.FC<FutureAppointmentsListProps> = ({
  appointments,
  onDeleteAppointment,
  onEditAppointment,
  stylists = [],
  services = []
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  
  // Categories for tabs
  const categories = [
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
      case 0: // Today
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isSameDay(appDate, today);
        });
        break;
      case 1: // Tomorrow
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isSameDay(appDate, tomorrow);
        });
        break;
      case 2: // Future (beyond tomorrow)
        filtered = appointments.filter(app => {
          const appDate = new Date(app.start_time);
          return isAfter(appDate, endOfDay(tomorrow));
        });
        break;
      default:
        filtered = appointments;
    }
    
    // Sort by date/time
    filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
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
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* No appointments message */}
        {filteredAppointments.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No {tabValue === 0 ? 'today' : tabValue === 1 ? 'tomorrow' : 'future'} appointments
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FutureAppointmentsList; 