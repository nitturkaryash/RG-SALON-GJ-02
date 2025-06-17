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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Phone as PhoneIcon, CalendarMonth as CalendarIcon, Receipt as ReceiptIcon, Person as PersonIcon, ViewList as ViewListIcon, ViewModule as ViewModuleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay, isSameDay, isWithinInterval } from 'date-fns';
import { formatCurrency } from '../utils/format';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DateRangePicker from './dashboard/DateRangePicker';

interface AppointmentCardProps {
  appointment: any;
  onDeleteClick: (id: string) => void;
  onEditClick: (appointment: any) => void;
  onUpdateAppointment?: (appointment: any) => void;
  clients?: any[];
  allAppointments?: any[];
}

const AppointmentCard = ({ 
  appointment, 
  onDeleteClick, 
  onEditClick, 
  onUpdateAppointment,
  clients = [],
  allAppointments = []
}: AppointmentCardProps) => {
  const navigate = useNavigate();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(appointment.start_time));
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Dynamic tooltip placement calculation
  React.useEffect(() => {
    const calculatePlacement = () => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate available space in each direction
      const spaceTop = rect.top;
      const spaceBottom = viewportHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;
      
      // Minimum space required for tooltip (estimated)
      const minSpaceRequired = 200;
      
      // Determine best placement based on available space
      if (spaceRight >= minSpaceRequired && rect.left < viewportWidth / 3) {
        // Card is on the left side, show tooltip on right
        setTooltipPlacement('right');
      } else if (spaceLeft >= minSpaceRequired && rect.right > (viewportWidth * 2) / 3) {
        // Card is on the right side, show tooltip on left
        setTooltipPlacement('left');
      } else if (spaceBottom >= minSpaceRequired && rect.top < viewportHeight / 3) {
        // Card is at the top, show tooltip below
        setTooltipPlacement('bottom');
      } else if (spaceTop >= minSpaceRequired && rect.bottom > (viewportHeight * 2) / 3) {
        // Card is at the bottom, show tooltip above
        setTooltipPlacement('top');
      } else {
        // Default to the side with most space
        const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        if (maxSpace === spaceRight) setTooltipPlacement('right');
        else if (maxSpace === spaceLeft) setTooltipPlacement('left');
        else if (maxSpace === spaceBottom) setTooltipPlacement('bottom');
        else setTooltipPlacement('top');
      }
    };

    // Calculate on mount and when window resizes or scrolls
    calculatePlacement();
    
    const handleResize = () => calculatePlacement();
    const handleScroll = () => calculatePlacement();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

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
    // Enhanced client name resolution with better fallback logic
    
    // First try clientDetails array
    if (appointment.clientDetails && appointment.clientDetails.length > 0 && appointment.clientDetails[0]?.full_name) {
      return appointment.clientDetails[0].full_name;
    }
    
    // Then try the direct clientName property (already processed)
    if (appointment.clientName && appointment.clientName !== 'Walk-in Customer') {
      return appointment.clientName;
    }
    
    // Then try client_name property
    if (appointment.client_name && appointment.client_name !== 'Walk-in Customer') {
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
      return `${appointment.booker_name} (Booking for someone else)`;
    }
    
    // If all else fails, show "Walk-in Customer"
    return 'Walk-in Customer';
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

  // Enhanced function to get comprehensive service and stylist information
  const getAppointmentServicesAndStylists = (appointment: any, allAppointments: any[] = []) => {
    const services: Array<{
      id: string;
      name: string;
      price: number;
      stylists: string[];
      startTime: string;
      endTime: string;
    }> = [];

    // Check if this is a multi-expert appointment
    const isMultiExpert = appointment.booking_id && allAppointments.filter(app => 
      app.booking_id === appointment.booking_id && app.booking_id
    ).length > 1;

    if (isMultiExpert) {
      // Find all related appointments with the same booking_id
      const relatedAppointments = allAppointments.filter(app => 
        app.booking_id === appointment.booking_id && app.booking_id
      );
      
      // Create a comprehensive service-expert map using clientDetails
      const serviceExpertMap = new Map<string, {
        serviceName: string;
        price: number;
        experts: Set<string>;
        startTime: string;
        endTime: string;
      }>();
      
      // Process each related appointment to extract service and expert information
      relatedAppointments.forEach(relApp => {
        // First, try to get comprehensive data from clientDetails
        if (relApp.clientDetails && relApp.clientDetails.length > 0) {
          relApp.clientDetails.forEach((clientDetail: any) => {
            // Process each service in clientDetails
            if (clientDetail.services && clientDetail.services.length > 0) {
              clientDetail.services.forEach((service: any) => {
                const serviceId = service.id;
                const serviceName = service.name || 'Unknown Service';
                const servicePrice = service.price || 0;
                
                if (!serviceExpertMap.has(serviceId)) {
                  serviceExpertMap.set(serviceId, {
                    serviceName,
                    price: servicePrice,
                    experts: new Set(),
                    startTime: relApp.start_time,
                    endTime: relApp.end_time
                  });
                }
                
                const serviceData = serviceExpertMap.get(serviceId)!;
                
                // Add all experts from clientDetails.stylists for this service
                if (clientDetail.stylists && clientDetail.stylists.length > 0) {
                  clientDetail.stylists.forEach((stylist: any) => {
                    if (stylist && stylist.name) {
                      serviceData.experts.add(stylist.name);
                    }
                  });
                }
              });
            }
          });
        }
        
        // Fallback: if no clientDetails or incomplete data, use appointment level data
        if (!relApp.clientDetails || relApp.clientDetails.length === 0) {
          const serviceId = relApp.service_id;
          const serviceName = relApp.service_name || relApp.serviceName || 'Unknown Service';
          const servicePrice = relApp.servicePrice || 0;
          const expertName = relApp.stylist?.name || 'Unknown Expert';
          
          if (!serviceExpertMap.has(serviceId)) {
            serviceExpertMap.set(serviceId, {
              serviceName,
              price: servicePrice,
              experts: new Set(),
              startTime: relApp.start_time,
              endTime: relApp.end_time
            });
          }
          
          const serviceData = serviceExpertMap.get(serviceId)!;
          serviceData.experts.add(expertName);
        }
      });
      
      // Convert map to array format
      serviceExpertMap.forEach((serviceData, serviceId) => {
        services.push({
          id: serviceId,
          name: serviceData.serviceName,
          price: serviceData.price,
          stylists: Array.from(serviceData.experts),
          startTime: serviceData.startTime,
          endTime: serviceData.endTime
        });
      });
    } else {
      // Single appointment - check for multiple services in clientDetails
      if (appointment.clientDetails && appointment.clientDetails.length > 0) {
        const clientDetail = appointment.clientDetails[0];
        if (clientDetail.services && clientDetail.services.length > 0) {
          // Multiple services case
          clientDetail.services.forEach((service: any) => {
            const stylists: string[] = [];
            
            // Get stylists for this service
            if (clientDetail.stylists && clientDetail.stylists.length > 0) {
              clientDetail.stylists.forEach((stylist: any) => {
                if (stylist && stylist.name) {
                  stylists.push(stylist.name);
                }
              });
            } else if (appointment.stylist?.name) {
              stylists.push(appointment.stylist.name);
            }
            
            services.push({
              id: service.id,
              name: service.name || 'Unknown Service',
              price: service.price || 0,
              stylists: stylists,
              startTime: appointment.start_time,
              endTime: appointment.end_time
            });
          });
        } else {
          // Fallback to single service from appointment
          services.push({
            id: appointment.service_id || 'unknown',
            name: appointment.serviceName || appointment.service_name || 'Unknown Service',
            price: appointment.servicePrice || 0,
            stylists: [appointment.stylist?.name || 'Unknown Stylist'],
            startTime: appointment.start_time,
            endTime: appointment.end_time
          });
        }
      } else {
        // Fallback to single service from appointment
        services.push({
          id: appointment.service_id || 'unknown',
          name: appointment.serviceName || appointment.service_name || 'Unknown Service',
          price: appointment.servicePrice || 0,
          stylists: [appointment.stylist?.name || 'Unknown Stylist'],
          startTime: appointment.start_time,
          endTime: appointment.end_time
        });
      }
    }

    return {
      services,
      isMultiExpert,
      totalPrice: services.reduce((sum, service) => sum + service.price, 0),
      allStylists: [...new Set(services.flatMap(service => service.stylists))],
      totalDuration: appointment.duration || 60
    };
  };

  // Format date to display like "25-May-2025, 03:00 PM"
  const formattedDateTime = format(new Date(appointment.start_time), 'dd-MMM-yyyy, hh:mm a');

  // Get comprehensive service and stylist data
  const serviceData = getAppointmentServicesAndStylists(appointment, allAppointments);

  // Create comprehensive tooltip content
  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 380, fontSize: '0.875rem' }}>
      {/* Client Information - Compact */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.9rem' }}>
          👤 {getClientName(appointment)}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>
          📞 {getClientPhone(appointment)}
        </Typography>
        {appointment.is_for_someone_else && appointment.booker_name && (
          <Typography variant="body2" sx={{ color: 'warning.main', fontSize: '0.75rem', mt: 0.5 }}>
            Booked by: {appointment.booker_name}
            {appointment.booker_phone && ` (${appointment.booker_phone})`}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Service Information - Compact */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '0.9rem' }}>
          💇 {serviceData.isMultiExpert ? 'Multi-Expert Services' : 'Service'}
        </Typography>
        
        {serviceData.services.length > 1 ? (
          // Multiple services - Better spacing with individual timings
          <>
            {serviceData.services.map((s: any) => (
              <Box key={s.id} sx={{ ml: 1.5, mb: 0.8, mt: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: '500' }}>
                  • {s.name} - {formatCurrency(s.price)} 
                  <span style={{ color: '#666', marginLeft: '8px' }}>
                    ({s.stylists.join(', ')})
                  </span>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 1 }}>
                  ⏰ {format(new Date(s.startTime), 'hh:mm a')} - {format(new Date(s.endTime), 'hh:mm a')}
                </Typography>
              </Box>
            ))}
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '0.8rem', ml: 1.5, mt: 0.5 }}>
              Total: {formatCurrency(serviceData.totalPrice)}
            </Typography>
          </>
        ) : (
          // Single service - Better spacing with timing
          <>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
              {serviceData.services[0]?.name} - {formatCurrency(serviceData.services[0]?.price || 0)} 
              <span style={{ color: '#666', marginLeft: '8px' }}>
                ({serviceData.allStylists.join(', ')})
              </span>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
              ⏰ {format(new Date(serviceData.services[0]?.startTime || appointment.start_time), 'hh:mm a')} - {format(new Date(serviceData.services[0]?.endTime || appointment.end_time), 'hh:mm a')}
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Overall Schedule - Only show if different from individual service times */}
      {serviceData.services.length > 1 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'info.main', fontSize: '0.85rem' }}>
            📅 Overall: {format(new Date(appointment.start_time), 'MMM dd, hh:mm a')} - {format(new Date(appointment.end_time), 'hh:mm a')}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
            {format(new Date(appointment.start_time), 'EEEE')} • Total Duration: {serviceData.totalDuration}min
          </Typography>
        </Box>
      )}

      {/* Single service schedule */}
      {serviceData.services.length === 1 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
            {format(new Date(appointment.start_time), 'EEEE, MMM dd')} • Duration: {serviceData.totalDuration}min
          </Typography>
        </Box>
      )}

      {/* Payment Status - Inline with status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Chip 
          label={appointment.status?.charAt(0).toUpperCase() + (appointment.status?.slice(1) || '')} 
          size="small" 
          color={appointment.status === 'completed' ? 'success' : 
                 appointment.status === 'cancelled' ? 'error' : 'primary'}
          sx={{ fontSize: '0.7rem', height: '22px' }}
        />
        <Chip 
          label={appointment.paid ? "✅ Paid" : "⏳ Pending"} 
          size="small" 
          color={appointment.paid ? 'success' : 'warning'}
          sx={{ fontSize: '0.7rem', height: '22px' }}
        />
      </Box>

      {/* Notes - Only if exists, compact */}
      {appointment.notes && (
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
          📝 {appointment.notes.length > 60 ? `${appointment.notes.substring(0, 60)}...` : appointment.notes}
        </Typography>
      )}

      {/* Quick tip - Compact */}
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontStyle: 'italic', display: 'block', mt: 1, opacity: 0.8 }}>
        Click to edit • Calendar icon to reschedule
      </Typography>
    </Box>
  );

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
    <Tooltip
      title={tooltipContent}
      arrow
      placement={tooltipPlacement}
      enterDelay={500}
      leaveDelay={200}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            maxWidth: 380,
            padding: '8px 12px',
            fontSize: '0.875rem',
            '& .MuiTooltip-arrow': {
              color: 'white',
              '&::before': {
                border: '1px solid',
                borderColor: 'divider',
              }
            }
          }
        }
      }}
    >
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
            transform: 'translateY(-2px)', // Add subtle lift effect on hover
            transition: 'all 0.2s ease-in-out'
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease-in-out' // Smooth transition for hover effects
        }}
        ref={cardRef}
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
              {serviceData.services.length > 1 ? (
                `${serviceData.services.length} Services` + (serviceData.isMultiExpert ? ' 👥' : '')
              ) : (
                serviceData.services[0]?.name || 'Unknown Service'
              )}
              {appointment.is_for_someone_else && ' 👤'}
            </Typography>
            
            {serviceData.services.length > 1 ? (
              <>
                {/* Show individual service timings for multi-service appointments */}
                <Box sx={{ mt: 1.5 }}>
                  {serviceData.services.map((s: any, index: number) => (
                    <Typography key={s.id} variant="body2" sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                      <strong>{s.name}:</strong> {format(new Date(s.startTime), 'hh:mm a')} - {format(new Date(s.endTime), 'hh:mm a')}
                      <span style={{ color: '#666', marginLeft: '8px' }}>
                        ({s.stylists.join(', ')})
                      </span>
                    </Typography>
                  ))}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Expert(s): {serviceData.allStylists.join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 'medium' }}>
                  {format(new Date(serviceData.services[0]?.startTime || appointment.start_time), 'dd-MMM-yyyy, hh:mm a')} - {format(new Date(serviceData.services[0]?.endTime || appointment.end_time), 'hh:mm a')}
                </Typography>
              </>
            )}
            
            {/* Show overall timing only for multi-service appointments */}
            {serviceData.services.length > 1 && (
              <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'medium', fontSize: '0.9rem' }}>
                Overall: {formattedDateTime} - {format(new Date(appointment.end_time), 'hh:mm a')}
              </Typography>
            )}
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
    </Tooltip>
  );
};

interface AppointmentRowProps {
  appointment: any;
  onDeleteClick: (id: string) => void;
  onEditClick: (appointment: any) => void;
  onUpdateAppointment?: (appointment: any) => void;
  clients?: any[];
  stylists?: any[];
  services?: any[];
  allAppointments?: any[];
}

const AppointmentRow = ({ 
  appointment, 
  onDeleteClick, 
  onEditClick, 
  onUpdateAppointment,
  clients = [],
  stylists = [],
  services = [],
  allAppointments = []
}: AppointmentRowProps) => {
  const navigate = useNavigate();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(appointment.start_time));
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const rowRef = React.useRef<HTMLTableRowElement>(null);

  // Dynamic tooltip placement calculation
  React.useEffect(() => {
    const calculatePlacement = () => {
      if (!rowRef.current) return;

      const rect = rowRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate available space in each direction
      const spaceTop = rect.top;
      const spaceBottom = viewportHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;
      
      // Minimum space required for tooltip (estimated)
      const minSpaceRequired = 200;
      
      // For table rows, prefer top/bottom placement first, then left/right
      if (spaceBottom >= minSpaceRequired && rect.top < viewportHeight / 2) {
        // Row is in upper half, show tooltip below
        setTooltipPlacement('bottom');
      } else if (spaceTop >= minSpaceRequired && rect.bottom > viewportHeight / 2) {
        // Row is in lower half, show tooltip above
        setTooltipPlacement('top');
      } else if (spaceRight >= minSpaceRequired && rect.left < viewportWidth / 3) {
        // Row is on the left side, show tooltip on right
        setTooltipPlacement('right');
      } else if (spaceLeft >= minSpaceRequired && rect.right > (viewportWidth * 2) / 3) {
        // Row is on the right side, show tooltip on left
        setTooltipPlacement('left');
      } else {
        // Default to the side with most space
        const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        if (maxSpace === spaceBottom) setTooltipPlacement('bottom');
        else if (maxSpace === spaceTop) setTooltipPlacement('top');
        else if (maxSpace === spaceRight) setTooltipPlacement('right');
        else setTooltipPlacement('left');
      }
    };

    // Calculate on mount and when window resizes or scrolls
    calculatePlacement();
    
    const handleResize = () => calculatePlacement();
    const handleScroll = () => calculatePlacement();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

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
    // Enhanced client name resolution with better fallback logic
    
    // First try clientDetails array
    if (appointment.clientDetails && appointment.clientDetails.length > 0 && appointment.clientDetails[0]?.full_name) {
      return appointment.clientDetails[0].full_name;
    }
    
    // Then try the direct clientName property (already processed)
    if (appointment.clientName && appointment.clientName !== 'Walk-in Customer') {
      return appointment.clientName;
    }
    
    // Then try client_name property
    if (appointment.client_name && appointment.client_name !== 'Walk-in Customer') {
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
      return `${appointment.booker_name} (Booking for someone else)`;
    }
    
    // If all else fails, show "Walk-in Customer"
    return 'Walk-in Customer';
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

  // Enhanced function to get comprehensive service and stylist information
  const getAppointmentServicesAndStylists = (appointment: any, allAppointments: any[] = []) => {
    const services: Array<{
      id: string;
      name: string;
      price: number;
      stylists: string[];
      startTime: string;
      endTime: string;
    }> = [];

    // Check if this is a multi-expert appointment
    const isMultiExpert = appointment.booking_id && allAppointments.filter(app => 
      app.booking_id === appointment.booking_id && app.booking_id
    ).length > 1;

    if (isMultiExpert) {
      // Find all related appointments with the same booking_id
      const relatedAppointments = allAppointments.filter(app => 
        app.booking_id === appointment.booking_id && app.booking_id
      );
      
      // Create a comprehensive service-expert map using clientDetails
      const serviceExpertMap = new Map<string, {
        serviceName: string;
        price: number;
        experts: Set<string>;
        startTime: string;
        endTime: string;
      }>();
      
      // Process each related appointment to extract service and expert information
      relatedAppointments.forEach(relApp => {
        // First, try to get comprehensive data from clientDetails
        if (relApp.clientDetails && relApp.clientDetails.length > 0) {
          relApp.clientDetails.forEach((clientDetail: any) => {
            // Process each service in clientDetails
            if (clientDetail.services && clientDetail.services.length > 0) {
              clientDetail.services.forEach((service: any) => {
                const serviceId = service.id;
                const serviceName = service.name || 'Unknown Service';
                const servicePrice = service.price || 0;
                
                if (!serviceExpertMap.has(serviceId)) {
                  serviceExpertMap.set(serviceId, {
                    serviceName,
                    price: servicePrice,
                    experts: new Set(),
                    startTime: relApp.start_time,
                    endTime: relApp.end_time
                  });
                }
                
                const serviceData = serviceExpertMap.get(serviceId)!;
                
                // Add all experts from clientDetails.stylists for this service
                if (clientDetail.stylists && clientDetail.stylists.length > 0) {
                  clientDetail.stylists.forEach((stylist: any) => {
                    if (stylist && stylist.name) {
                      serviceData.experts.add(stylist.name);
                    }
                  });
                }
              });
            }
          });
        }
        
        // Fallback: if no clientDetails or incomplete data, use appointment level data
        if (!relApp.clientDetails || relApp.clientDetails.length === 0) {
          const serviceId = relApp.service_id;
          const serviceName = relApp.service_name || relApp.serviceName || 'Unknown Service';
          const servicePrice = relApp.servicePrice || 0;
          const expertName = relApp.stylist?.name || 'Unknown Expert';
          
          if (!serviceExpertMap.has(serviceId)) {
            serviceExpertMap.set(serviceId, {
              serviceName,
              price: servicePrice,
              experts: new Set(),
              startTime: relApp.start_time,
              endTime: relApp.end_time
            });
          }
          
          const serviceData = serviceExpertMap.get(serviceId)!;
          serviceData.experts.add(expertName);
        }
      });
      
      // Convert map to array format
      serviceExpertMap.forEach((serviceData, serviceId) => {
        services.push({
          id: serviceId,
          name: serviceData.serviceName,
          price: serviceData.price,
          stylists: Array.from(serviceData.experts),
          startTime: serviceData.startTime,
          endTime: serviceData.endTime
        });
      });
    } else {
      // Single appointment - check for multiple services in clientDetails
      if (appointment.clientDetails && appointment.clientDetails.length > 0) {
        const clientDetail = appointment.clientDetails[0];
        if (clientDetail.services && clientDetail.services.length > 0) {
          // Multiple services case
          clientDetail.services.forEach((service: any) => {
            const stylists: string[] = [];
            
            // Get stylists for this service
            if (clientDetail.stylists && clientDetail.stylists.length > 0) {
              clientDetail.stylists.forEach((stylist: any) => {
                if (stylist && stylist.name) {
                  stylists.push(stylist.name);
                }
              });
            } else if (appointment.stylist?.name) {
              stylists.push(appointment.stylist.name);
            }
            
            services.push({
              id: service.id,
              name: service.name || 'Unknown Service',
              price: service.price || 0,
              stylists: stylists,
              startTime: appointment.start_time,
              endTime: appointment.end_time
            });
          });
        } else {
          // Fallback to single service from appointment
          services.push({
            id: appointment.service_id || 'unknown',
            name: appointment.serviceName || appointment.service_name || 'Unknown Service',
            price: appointment.servicePrice || 0,
            stylists: [appointment.stylist?.name || 'Unknown Stylist'],
            startTime: appointment.start_time,
            endTime: appointment.end_time
          });
        }
      } else {
        // Fallback to single service from appointment
        services.push({
          id: appointment.service_id || 'unknown',
          name: appointment.serviceName || appointment.service_name || 'Unknown Service',
          price: appointment.servicePrice || 0,
          stylists: [appointment.stylist?.name || 'Unknown Stylist'],
          startTime: appointment.start_time,
          endTime: appointment.end_time
        });
      }
    }

    return {
      services,
      isMultiExpert,
      totalPrice: services.reduce((sum, service) => sum + service.price, 0),
      allStylists: [...new Set(services.flatMap(service => service.stylists))],
      totalDuration: appointment.duration || 60
    };
  };

  const handleDateChange = (newDate: Date | null) => {
    if (!newDate) return;
    setSelectedDate(newDate);
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

  // Get stylist name
  const stylistName = appointment.stylist?.name || 
    stylists.find(s => s.id === appointment.stylist_id)?.name || 
    'Unknown Stylist';

  // Get service name and price
  const serviceName = appointment.serviceName || 
    services.find(s => s.id === appointment.service_id)?.name || 
    'Unknown Service';
  
  const servicePrice = appointment.servicePrice || 
    services.find(s => s.id === appointment.service_id)?.price || 
    0;

  // Format time
  const startTime = format(new Date(appointment.start_time), 'hh:mm a');
  const endTime = format(new Date(appointment.end_time), 'hh:mm a');
  const date = format(new Date(appointment.start_time), 'MMM dd, yyyy');

  // Get client initials for avatar
  const clientName = getClientName(appointment);
  const clientInitials = clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Get comprehensive service and stylist data
  const serviceData = getAppointmentServicesAndStylists(appointment, allAppointments);

  return (
    <>
      <TableRow 
        hover 
        sx={{ 
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(107, 142, 35, 0.04)',
            transform: 'scale(1.001)', // Subtle scale effect on hover
            transition: 'all 0.2s ease-in-out'
          },
          transition: 'all 0.2s ease-in-out'
        }}
        ref={rowRef}
        onClick={() => onEditClick(appointment)}
      >
        {/* Client Info */}
        <TableCell>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: '#6B8E23', width: 40, height: 40 }}>
              {clientInitials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {clientName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon fontSize="small" />
                {getClientPhone(appointment)}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        {/* Service Info */}
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {serviceData.services.length > 1 ? (
              `${serviceData.services.length} Services` + (serviceData.isMultiExpert ? ' 👥' : '')
            ) : (
              serviceData.services[0]?.name || 'Unknown Service'
            )}
            {appointment.is_for_someone_else && ' 👤'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {serviceData.services.length > 1 ? (
              `₹${serviceData.totalPrice} (Total)`
            ) : (
              `₹${serviceData.services[0]?.price || 0}`
            )}
          </Typography>
        </TableCell>

        {/* Stylist */}
        <TableCell>
          <Typography variant="body2">
            {serviceData.allStylists.length > 1 ? (
              `${serviceData.allStylists.length} Experts`
            ) : (
              serviceData.allStylists[0] || 'Unknown Expert'
            )}
          </Typography>
          {serviceData.allStylists.length > 1 && (
            <Typography variant="caption" color="text.secondary" display="block">
              {serviceData.allStylists.slice(0, 2).join(', ')}
              {serviceData.allStylists.length > 2 && ` +${serviceData.allStylists.length - 2} more`}
            </Typography>
          )}
        </TableCell>

        {/* Date & Time */}
        <TableCell>
          {serviceData.services.length > 1 ? (
            <>
              <Typography variant="body2" fontWeight="medium">
                {date}
              </Typography>
              {/* Show individual service timings */}
              {serviceData.services.map((s: any, index: number) => (
                <Typography key={s.id} variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {s.name}: {format(new Date(s.startTime), 'hh:mm a')} - {format(new Date(s.endTime), 'hh:mm a')}
                </Typography>
              ))}
              <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                Overall: {startTime} - {endTime}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" fontWeight="medium">
                {date}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(serviceData.services[0]?.startTime || appointment.start_time), 'hh:mm a')} - {format(new Date(serviceData.services[0]?.endTime || appointment.end_time), 'hh:mm a')}
              </Typography>
            </>
          )}
        </TableCell>

        {/* Status */}
        <TableCell>
          {appointment.paid ? (
            <Chip size="small" color="success" label="Paid" />
          ) : appointment.status === 'completed' ? (
            <Chip size="small" color="default" label="Completed" />
          ) : appointment.status === 'cancelled' ? (
            <Chip size="small" color="error" label="Cancelled" />
          ) : (
            <Chip size="small" color="primary" label="Scheduled" />
          )}
        </TableCell>

        {/* Actions */}
        <TableCell align="right">
          <Stack direction="row" spacing={1}>
            {!appointment.paid && (
              <Tooltip title="Create Bill">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePosClick();
                  }}
                >
                  <ReceiptIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Change Date">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setDatePickerOpen(true);
                }}
              >
                <CalendarIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(appointment.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Date Picker Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={datePickerOpen}
          onClose={handleDateCancel}
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
    </>
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards'); // Default to cards view
  
  // Date range state for filtering
  const [dateRangeStart, setDateRangeStart] = useState<Date>(startOfDay(new Date()));
  const [dateRangeEnd, setDateRangeEnd] = useState<Date>(endOfDay(addDays(new Date(), 30))); // Default to next 30 days
  const [useDateRangeFilter, setUseDateRangeFilter] = useState(false);
  
  // Categories for tabs
  const categories = [
    { label: 'Past', value: 'past' },
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'Future', value: 'future' }
  ];
  
  useEffect(() => {
    filterAppointments(tabValue);
  }, [appointments, tabValue, dateRangeStart, dateRangeEnd, useDateRangeFilter]);
  
  const filterAppointments = (tabIndex: number) => {
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(today, 1));
    
    let filtered = [];
    
    // First filter by tab category
    switch (tabIndex) {
      case 0: // Past
        filtered = appointments.filter(app => 
          isBefore(new Date(app.start_time), today)
        );
        break;
      case 1: // Today
        filtered = appointments.filter(app => 
          isSameDay(new Date(app.start_time), today)
        );
        break;
      case 2: // Tomorrow
        filtered = appointments.filter(app => 
          isSameDay(new Date(app.start_time), tomorrow)
        );
        break;
      case 3: // Future
        filtered = appointments.filter(app => 
          isAfter(new Date(app.start_time), tomorrow)
        );
        break;
      default:
        filtered = appointments;
    }
    
    // Then apply date range filter if enabled
    if (useDateRangeFilter) {
      filtered = filtered.filter(app => 
        isWithinInterval(new Date(app.start_time), {
          start: dateRangeStart,
          end: dateRangeEnd
        })
      );
    }
    
    // Group multi-expert appointments by booking_id to avoid duplicates
    const groupedAppointments = new Map();
    
    filtered.forEach(appointment => {
      if (appointment.booking_id) {
        // This is a multi-expert appointment
        if (!groupedAppointments.has(appointment.booking_id)) {
          // First appointment with this booking_id becomes the primary
          groupedAppointments.set(appointment.booking_id, appointment);
        }
        // We don't add duplicates - the getAppointmentServicesAndStylists function
        // will handle extracting all expert info from the full appointments array
      } else {
        // Single appointment or appointment without booking_id
        groupedAppointments.set(appointment.id, appointment);
      }
    });
    
    // Convert back to array
    filtered = Array.from(groupedAppointments.values());
    
    // Sort by start time
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
    // Keep date range filter active when switching tabs for better user experience
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRangeStart(startDate);
    setDateRangeEnd(endDate);
    setUseDateRangeFilter(true);
    // Don't automatically switch tabs - let user stay on current tab with date filter
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'cards' | 'table' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
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
        minHeight: '600px', // Ensure minimum height for consistency
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white'
      }}
    >
      {/* Header with Tabs and View Toggle */}
      <Box 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minHeight: '120px' // Fixed header height for consistency
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              indicatorColor="primary"
              sx={{
                minHeight: '60px', // Fixed tab height
                '& .MuiTab-root': {
                  fontWeight: 'medium',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 2,
                  minHeight: '60px',
                  '&.Mui-selected': {
                    color: '#6B8E23',
                    fontWeight: 'bold',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6B8E23'
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
          
          {/* Date Range Picker - Show on all tabs */}
          <Box sx={{ mx: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateRangePicker
              startDate={dateRangeStart}
              endDate={dateRangeEnd}
              onDateRangeChange={handleDateRangeChange}
            />
            {useDateRangeFilter && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setUseDateRangeFilter(false)}
                sx={{ 
                  minWidth: 'auto',
                  px: 1,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  borderColor: 'divider'
                }}
              >
                Clear
              </Button>
            )}
          </Box>
          
          {/* View Mode Toggle */}
          <Box sx={{ minWidth: 140, display: 'flex', justifyContent: 'flex-end', ml: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="medium"
              sx={{
                '& .MuiToggleButton-root': {
                  border: '2px solid #6B8E23',
                  color: '#6B8E23',
                  bgcolor: 'white',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  '&.Mui-selected': {
                    backgroundColor: '#6B8E23',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#566E1C',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(107, 142, 35, 0.04)'
                  }
                }
              }}
            >
              <ToggleButton value="cards" aria-label="cards view">
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} />
                Cards
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <ViewListIcon fontSize="small" sx={{ mr: 1 }} />
                Table
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box 
        flex={1} 
        sx={{ 
          overflow: 'auto',
          p: { xs: 2, md: 3 },
          bgcolor: 'white',
          minHeight: '480px' // Ensure consistent content area height
        }}
      >
        {/* Show filter status when date range is active */}
        {useDateRangeFilter && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'primary.contrastText' }}>
            <Typography variant="body2">
              📅 Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} 
              from {format(dateRangeStart, 'MMM dd, yyyy')} to {format(dateRangeEnd, 'MMM dd, yyyy')}
            </Typography>
          </Box>
        )}
        
        {filteredAppointments.length > 0 ? (
          viewMode === 'cards' ? (
            // Card View (Default) - Responsive grid with consistent sizing
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(320px, 380px))', // Changed from auto-fit to auto-fill with max width
                md: 'repeat(auto-fill, minmax(300px, 360px))', // Changed from auto-fit to auto-fill with max width
                lg: 'repeat(auto-fill, minmax(320px, 380px))'  // Changed from auto-fit to auto-fill with max width
              },
              gap: 3,
              width: '100%',
              justifyContent: filteredAppointments.length === 1 ? 'flex-start' : 'start', // Align single card to left
              maxWidth: filteredAppointments.length === 1 ? '400px' : '100%' // Limit width for single card
            }}>
              {filteredAppointments.map((appointment) => (
                <Box 
                  key={appointment.id}
                  sx={{ 
                    minHeight: '280px', // Consistent card height
                    maxHeight: '320px', // Maximum height to prevent oversized cards
                    maxWidth: '400px',  // Maximum width to prevent overly wide cards
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onDeleteClick={handleDeleteClick}
                    onEditClick={() => handleEditClick(appointment)}
                    onUpdateAppointment={handleUpdateAppointment}
                    clients={clients}
                    allAppointments={appointments}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            // Table View - Always take full width and height
            <Box sx={{ width: '100%', height: '100%', minHeight: '480px' }}>
              <TableContainer 
                component={Paper} 
                elevation={1} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  minHeight: '480px',
                  '& .MuiTable-root': {
                    minWidth: 800 // Ensure table doesn't get too narrow
                  }
                }}
              >
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: '#6B8E23', 
                        color: 'white',
                        fontSize: '0.9rem',
                        minWidth: '180px'
                      }}>
                        Client
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: '#6B8E23', 
                        color: 'white',
                        fontSize: '0.9rem',
                        minWidth: '150px'
                      }}>
                        Service
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: '#6B8E23', 
                        color: 'white',
                        fontSize: '0.9rem',
                        minWidth: '120px'
                      }}>
                        Stylist
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: '#6B8E23', 
                        color: 'white',
                        fontSize: '0.9rem',
                        minWidth: '180px'
                      }}>
                        Date & Time
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: '#6B8E23', 
                        color: 'white',
                        fontSize: '0.9rem',
                        minWidth: '100px'
                      }}>
                        Status
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: '#6B8E23', 
                        color: 'white',
                        fontSize: '0.9rem',
                        minWidth: '120px'
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <AppointmentRow
                        key={appointment.id}
                        appointment={appointment}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                        onUpdateAppointment={handleUpdateAppointment}
                        clients={clients}
                        stylists={stylists}
                        services={services}
                        allAppointments={appointments}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )
        ) : (
          <Box sx={{ 
            p: 8, 
            textAlign: 'center',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 1,
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              No {categories[tabValue].label.toLowerCase()} appointments
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: '400px' }}>
              {tabValue === 1 ? 'No appointments scheduled for today. Your calendar is clear!' : 
               tabValue === 2 ? 'No appointments scheduled for tomorrow. Time to book more clients!' :
               tabValue === 0 ? 'No past appointments found in your records.' :
               'No future appointments scheduled. Start booking to grow your business!'}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FutureAppointmentsList; 