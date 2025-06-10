import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { Delete as DeleteIcon, Edit as EditIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { getClientName } from '../pages/Appointments';

interface AppointmentsListProps {
  appointments: any[];
  onDeleteAppointment?: (id: string) => Promise<void>;
  onEditAppointment?: (appointment: any) => void;
  clients?: any[];
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  onDeleteAppointment,
  onEditAppointment,
  clients = []
}) => {
  const navigate = useNavigate();

  const handlePosClick = (appointment: any) => {
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

    // Get client name with all fallbacks
    const clientName = getDisplayClientName(appointment);

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

  // Helper function to handle client name display with fallbacks
  const getDisplayClientName = (appointment: any): string => {
    // Use the imported getClientName if available
    if (typeof getClientName === 'function') {
      return getClientName(appointment, clients);
    }
    
    // Fallback to direct implementation if import fails
    // First try clientDetails array
    if (appointment.clientDetails && 
        appointment.clientDetails.length > 0 && 
        appointment.clientDetails[0]?.full_name) {
      return appointment.clientDetails[0].full_name;
    }
    
    // Then try direct fields on the appointment
    if (appointment.clientName) {
      return appointment.clientName;
    }

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
    
    // Then try looking up from client object
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

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Stylist</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id} hover>
                <TableCell>
                  <Typography variant="body1">
                    {getDisplayClientName(appointment)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {appointment.clientDetails?.[0]?.phone || appointment.phone || appointment.booker_phone || 'No phone'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {appointment.serviceName || 
                   appointment.clientDetails?.[0]?.services?.[0]?.name || 
                   'Unknown Service'}
                </TableCell>
                <TableCell>
                  {appointment.stylist?.name || 'Not assigned'}
                </TableCell>
                <TableCell>
                  {format(new Date(appointment.start_time), 'MMM dd, yyyy h:mm a')}
                </TableCell>
                <TableCell>
                  {appointment.paid ? (
                    <Chip size="small" color="success" label="Paid" />
                  ) : (
                    <Chip size="small" color="primary" label="Not Paid" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {!appointment.paid && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handlePosClick(appointment)}
                        sx={{ mr: 1 }}
                      >
                        POS
                      </Button>
                    )}
                    {onEditAppointment && (
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => onEditAppointment(appointment)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDeleteAppointment && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => onDeleteAppointment(appointment.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No appointments found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AppointmentsList; 