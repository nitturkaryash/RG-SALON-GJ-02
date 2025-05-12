import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  IconButton,
  Tooltip,
  SelectChangeEvent,
  Snackbar,
  Alert,
  useTheme,
  InputAdornment,
  Popover,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Autocomplete,
  CircularProgress,
  Drawer,
  Stack,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, Today, Receipt, CalendarMonth, Delete as DeleteIcon, Close as CloseIcon, Add as AddIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { format, addDays, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useClients, Client } from '../hooks/useClients';
import { StylistBreak, useStylists } from '../hooks/useStylists';
import { useServiceCollections } from '../hooks/useServiceCollections';
import { useCollectionServices } from '../hooks/useCollectionServices';
import { Search as SearchIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/format';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ErrorBoundary from './ErrorBoundary';
import { toast } from 'react-hot-toast';
import { createFilterOptions } from '@mui/material/Autocomplete';

// Custom implementations of date-fns functions
const formatTime = (time: string | Date): string => {
  const date = typeof time === 'string' ? new Date(time) : time;
  const hour = date.getHours();
  const minute = date.getMinutes();
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? 'PM' : 'AM';
  // Format with minutes instead of always showing :00
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Define the time slots for the day (from 8 AM to 10 PM)
const BUSINESS_HOURS = {
  start: 8,  // 8 AM
  end: 22,   // 10 PM
};

// Update the time slot height to make the calendar more readable
const TIME_SLOT_HEIGHT = 30; // Height in pixels for each 15-minute slot

// Styled components
const DayViewContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  border: 'none', // Remove border as the parent container will handle this
  borderRadius: 0, // Remove border radius for full bleed
}));

const DayViewHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper, // White background
  boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
  borderTopLeftRadius: 28, // Match container
  borderTopRightRadius: 28, // Match container
}));

const ScheduleGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  overflow: 'auto',
  position: 'relative',
  width: '100%', // Ensure it takes full width
  '& > *': {  // This affects all direct children
    height: 'fit-content',  // Allow elements to grow beyond viewport
    minHeight: '100%'       // But at minimum be full height
  }
}));

const TimeColumn = styled(Box)(({ theme }) => ({
  width: 100, // Increased from 80px to 100px for better readability
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  left: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 2
}));

const StylistColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 200, // Increased from 180px to 200px for better spacing
  position: 'relative',
  backgroundColor: theme.palette.salon.offWhite,
  // Remove border-right property completely
  // borderRight: `1px solid ${theme.palette.divider}`,
  // "&:last-child": {
  //   borderRight: "none"
  // },
  // Make sure the column always extends to full height of content
  height: '100%',
  paddingBottom: '50vh', // Add extra space at the bottom for scrolling
}));

const StylistHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5), // Increased padding for better visibility
  textAlign: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`, // Add right border to each header
  backgroundColor: theme.palette.salon.oliveLight,
  position: 'sticky',
  top: 0,
  zIndex: 3,
  height: 56, // Increased from 48px to 56px for better visibility
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const TimeSlot = styled(Box)(({ theme }) => ({
  height: TIME_SLOT_HEIGHT,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.75),
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem', // Increased from 0.75rem for better readability
  color: theme.palette.text.secondary,
  width: '100%',
  textAlign: 'center',
}));

// Update the AppointmentSlot component
const AppointmentSlot = styled(Box)(({ theme }) => ({
  height: TIME_SLOT_HEIGHT,
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`, // Add right border to every slot
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.blocked': {
    backgroundColor: 'rgba(211, 47, 47, 0.15)',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'rgba(211, 47, 47, 0.2)',
    },
  },
}));

// Update the AppointmentCard component
const AppointmentCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPaid' && prop !== 'duration' && prop !== 'status',
})<{ duration: number; isPaid: boolean; status: 'scheduled' | 'completed' | 'cancelled' }>(({ theme, duration, isPaid, status }) => ({
  position: 'absolute',
  left: theme.spacing(0.75),
  right: theme.spacing(0.75),
  height: `${duration}px`, // Explicitly set height in pixels
  backgroundColor: 
    status === 'completed' 
      ? theme.palette.grey[400] // Grey background for completed appointments
      : isPaid 
        ? theme.palette.success.light // Green if paid (and not completed)
        : theme.palette.primary.main, // Default olive if scheduled/cancelled and not paid
  color: 
    status === 'completed'
      ? theme.palette.getContrastText(theme.palette.grey[400]) // Contrast text for grey
      : isPaid
        ? theme.palette.success.contrastText // Contrast text for success
        : theme.palette.primary.contrastText, // Contrast text for primary
  borderRadius: 8,
  padding: theme.spacing(1, 1.5),
  overflow: 'hidden',
  boxShadow: status === 'completed' ? '0px 2px 6px rgba(0, 0, 0, 0.15)' : '0px 4px 12px rgba(107, 142, 35, 0.25)', // Different shadow for completed
  zIndex: 1,
  fontSize: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.2s ease-in-out',
  cursor: 'move',
  border: status === 'completed' ? `1px solid ${theme.palette.grey[500]}` : '1px solid rgba(255, 255, 255, 0.25)', // Different border
  opacity: status === 'completed' ? 0.8 : 1, // Slightly faded if completed
  '&:hover': {
    boxShadow: status === 'completed' ? '0px 3px 8px rgba(0, 0, 0, 0.2)' : '0px 6px 16px rgba(107, 142, 35, 0.4)',
    transform: status === 'completed' ? 'none' : 'translateY(-2px)', // No lift on hover if completed
    zIndex: status === 'completed' ? 1 : 2, // Ensure non-completed are slightly above on hover
  },
}));

// Update the BreakCard component to ensure it doesn't capture mouse events
const BreakCard = styled(Box)<{ duration: number }>(({ theme, duration }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  height: (duration / 15) * TIME_SLOT_HEIGHT, // Adjust for 15-minute slots
  backgroundColor: '#d32f2f', // Solid red color
  color: '#ffffff',
  borderRadius: 0,
  padding: theme.spacing(0.75, 1),
  overflow: 'hidden',
  boxShadow: 'none', // Remove the shadow completely
  zIndex: 20, // Very high z-index to ensure it's above everything
  fontSize: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'none', // Remove transitions
  border: 'none', // Remove border
  cursor: 'not-allowed',
  pointerEvents: 'none', // Prevent it from capturing mouse events
  '&:hover': {
    boxShadow: 'none', // No hover effect
  },
}));

// Update the generateTimeSlots function to create precise 15-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = BUSINESS_HOURS.start; hour <= BUSINESS_HOURS.end; hour++) {
    // Add slots for 0, 15, 30, and 45 minutes
    slots.push({ hour, minute: 0 });
    if (hour < BUSINESS_HOURS.end) {
      slots.push({ hour, minute: 15 });
      slots.push({ hour, minute: 30 });
      slots.push({ hour, minute: 45 });
    }
  }
  return slots;
};

// Update the generateTimeOptions function to include 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = BUSINESS_HOURS.start; hour <= BUSINESS_HOURS.end; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    
    // Add options for 0, 15, 30, and 45 minutes
    options.push({ 
      value: `${hour}:00`, 
      label: `${hour12}:00 ${period}` 
    });
    if (hour < BUSINESS_HOURS.end) {
      options.push({ 
        value: `${hour}:15`, 
        label: `${hour12}:15 ${period}` 
      });
      options.push({ 
        value: `${hour}:30`, 
        label: `${hour12}:30 ${period}` 
      });
      options.push({ 
        value: `${hour}:45`, 
        label: `${hour12}:45 ${period}` 
      });
    }
  }
  return options;
};

// Create a helper function to format hour in 12-hour format with AM/PM
const formatHour = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${hour12}:00 ${period}`;
};

// Export the Break interface
export interface Break {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

interface Stylist {
  id: string;
  name: string;
  breaks: Break[];
  // ... other stylist properties ...
}

interface StylistDayViewProps {
  stylists: Stylist[];
  appointments: any[];
  services: any[];
  selectedDate: Date;
  onSelectTimeSlot: (stylistId: string, time: Date) => void;
  onUpdateAppointment?: (appointmentId: string, updates: any) => Promise<void>;
  onDeleteAppointment?: (appointmentId: string) => Promise<void>;
  onAddBreak: (stylistId: string, breakData: Break) => Promise<void>;
  onDeleteBreak?: (stylistId: string, breakId: string) => Promise<void>;
  onUpdateBreak?: (stylistId: string, breakId: string, breakData: Omit<Break, 'id'>) => Promise<void>; // Add this prop
  onDateChange?: (date: Date) => void;
  onStylistsChange?: (updatedStylists: Stylist[]) => void;
  onAppointmentClick?: (appointment: any) => void;
}

// Define filter for freeSolo client options
const filterClients = createFilterOptions<{ id: string; full_name: string; phone?: string; inputValue?: string }>();

const StylistDayView: React.FC<StylistDayViewProps> = ({
  stylists: initialStylists,
  appointments,
  services,
  selectedDate,
  onSelectTimeSlot,
  onUpdateAppointment,
  onDeleteAppointment,
  onAddBreak,
  onDeleteBreak,
  onUpdateBreak,
  onDateChange,
  onStylistsChange,
  onAppointmentClick,
}) => {
  const theme = useTheme();
  const { clients: allClients, isLoading: isLoadingClients } = useClients(); // Add useClients hook

  const [stylists, setStylists] = useState<Stylist[]>(initialStylists);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  // Add break dialog state
  const [breakDialogOpen, setBreakDialogOpen] = useState<boolean>(false);
  const [breakFormData, setBreakFormData] = useState({
    startTime: '',
    endTime: '',
    reason: ''
  });
  // Update the editFormData state type
  const [editFormData, setEditFormData] = useState({
    clientName: '',
    clientId: '',
    serviceId: '',
    stylistId: '',
    startTime: '',
    endTime: '',
    notes: '',
    mobileNumber: '',
    stylistIds: [] as string[],
    isNewClient: false,
    clientEntries: [] as { id: string; client: any; selectedCollectionId: string; services: any[] }
  });
  // State for drag and drop
  const [draggedAppointment, setDraggedAppointment] = useState<any | null>(null);
  
  // Add state for date picker popover
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<HTMLButtonElement | null>(null);
  const datePickerOpen = Boolean(datePickerAnchorEl);
  
  const timeSlots = generateTimeSlots();
  const timeOptions = generateTimeOptions();
  
  const handlePrevDay = () => {
    const newDate = addDays(currentDate, -1);
    setCurrentDate(newDate);
    // Notify parent component if callback is provided
    if (onDateChange) {
      onDateChange(newDate);
    }
  };
  
  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    // Notify parent component if callback is provided
    if (onDateChange) {
      onDateChange(newDate);
    }
  };
  
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    // Notify parent component if callback is provided
    if (onDateChange) {
      onDateChange(today);
    }
  };
  
  const handleSlotClick = (stylistId: string, hour: number, minute: number) => {
    // Check if this time slot is during a break
    if (isBreakTime(stylistId, hour, minute)) {
      return; // Don't allow booking during breaks
    }
    
    // Create a new date object for the selected time with exact minutes
    const selectedTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hour,
      minute,
      0,
      0
    );
    
    // Call the onSelectTimeSlot callback with the stylist ID and formatted time
    onSelectTimeSlot(stylistId, selectedTime);
  };

  const handleAppointmentClick = (appointment: any) => {
    console.log("Internal StylistDayView handleAppointmentClick called", appointment); // Debug log
    // Ensure the prop function is called if it exists
    if (onAppointmentClick) {
      console.log("Calling onAppointmentClick prop..."); // Debug log
      onAppointmentClick(appointment);
    } else {
      console.warn("onAppointmentClick prop is missing in StylistDayView"); // Warning if prop not passed
    }
    // Set state for the internal edit dialog (if this component still uses one)
    // setSelectedAppointment(appointment);
    // setEditDialogOpen(true);
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    // Store the appointment being dragged
    setDraggedAppointment(appointment);
    // Set the drag image and data
    e.dataTransfer.setData('text/plain', appointment.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, stylistId: string, hour: number, minute: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = async (e: React.DragEvent, stylistId: string, hour: number, minute: number) => {
    e.preventDefault();
    
    // Check if this time slot is during a break
    if (isBreakTime(stylistId, hour, minute)) {
      setSnackbarMessage('Cannot move appointment to a break time');
      setSnackbarOpen(true);
      return;
    }
    
    if (draggedAppointment && onUpdateAppointment) {
      console.log('Handling appointment drag and drop');
      
      // Create a new date object for the drop target time with exact minutes
      const dropTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hour,
        minute,
        0,
        0
      );
      
      // Calculate the original duration in minutes
      const originalStart = new Date(draggedAppointment.start_time);
      const originalEnd = new Date(draggedAppointment.end_time);
      const durationMinutes = (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60);
      
      // Calculate the new end time by adding the same duration
      const newEndTime = new Date(dropTime.getTime() + durationMinutes * 60 * 1000);
      
      // Format as ISO strings for consistent storage
      const formattedStartTime = dropTime.toISOString();
      const formattedEndTime = newEndTime.toISOString();
      
      try {
        // Create an update object with only the fields that should be updated
        const appointmentUpdates = {
          id: draggedAppointment.id,
          stylist_id: stylistId,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          // Preserve other important fields
          service_id: draggedAppointment.service_id,
          client_id: draggedAppointment.client_id,
          status: draggedAppointment.status,
          paid: draggedAppointment.paid,
          notes: draggedAppointment.notes || ''
        };
        
        console.log('Updating dragged appointment with:', appointmentUpdates);
        
        await onUpdateAppointment(draggedAppointment.id, appointmentUpdates);
        
        // Clear the dragged appointment reference
        setDraggedAppointment(null);
      } catch (error) {
        console.error('Error updating appointment:', error);
        setSnackbarMessage('Failed to move appointment');
        setSnackbarOpen(true);
      }
    }
  };
  
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedAppointment(null);
    
    // Reset service filters when closing the dialog
    setSelectedServiceCollection('');
    setServiceSearchQuery('');
  };
  
  const handleUpdateAppointment = async () => {
    if (!selectedAppointment || !onUpdateAppointment) return;
    
    // --- Start Edit Validation ---
    let isValid = true;
    
    // Validate client entries
    if (!editFormData.clientEntries || editFormData.clientEntries.length === 0) {
      console.error('Validation Error: No client entries');
      isValid = false;
    } else {
      // Validate each client entry
      editFormData.clientEntries.forEach((entry, idx) => {
        // Validate client info
        if (!entry.client || !entry.client.full_name || entry.client.full_name.trim() === '') {
          console.error(`Validation Error: Client name is missing or empty for entry ${idx + 1}`);
          isValid = false;
        }
        
        // Check if it's a new client and requires phone
        if (entry.client && !entry.client.id && !entry.client.phone) {
          console.error(`Validation Error: Phone number is required for new client in entry ${idx + 1}`);
          isValid = false;
        }
        
        // Validate collection
        if (!entry.selectedCollectionId) {
          console.error(`Validation Error: Service collection not selected for entry ${idx + 1}`);
          isValid = false;
        }
        
        // Validate services
        if (!entry.services || entry.services.length === 0) {
          console.error(`Validation Error: No services selected for entry ${idx + 1}`);
          isValid = false;
        }
        
        // Validate stylists
        if (!entry.stylistList || entry.stylistList.length === 0) {
          console.error(`Validation Error: No stylists selected for entry ${idx + 1}`);
          isValid = false;
        }
      });
    }
    
    // Validate times
    if (!editFormData.startTime || !editFormData.endTime) {
      console.error('Validation Error: Start and end times are required');
      isValid = false;
    }
    
    if (!isValid) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarOpen(true);
      return;
    }
    // --- End Validation ---
    
    try {
      // Process each client entry to create new clients if needed
      const processedClientDetails = await Promise.all(
        editFormData.clientEntries.map(async (entry, idx) => {
          let finalClientId = entry.client?.id || '';
          
          // Handle new client creation
          if (!finalClientId) {
            try {
              const clientName = entry.client.full_name.trim();
              console.log(`Creating new client with name: '${clientName}', phone: '${entry.client.phone || ''}'`);
              
              if (!clientName) {
                throw new Error(`Cannot create client with empty name for entry ${idx + 1}`);
              }
              
              const newClient = await updateClientFromAppointment(
                clientName,
                entry.client.phone || '',
                entry.client.email || '', // Add email if available
                '' // No notes for now
              );
              
              finalClientId = newClient.id;
              console.log('Created new client with ID:', finalClientId);
            } catch (clientError) {
              console.error('Error creating new client:', clientError);
              throw new Error(`Failed to create client for entry ${idx + 1}: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
            }
          }
          
          return {
            clientId: finalClientId,
            serviceIds: entry.services.map(s => s.id),
            stylistIds: entry.stylistList.map(st => st.id),
          };
        })
      );
      
      // Format times for ISO string conversion
      const selectedDay = new Date(currentDate);
      const [startHour, startMinute] = editFormData.startTime.split(':').map(Number);
      const [endHour, endMinute] = editFormData.endTime.split(':').map(Number);
      
      const start = new Date(selectedDay);
      start.setHours(startHour, startMinute, 0, 0);
      
      const end = new Date(selectedDay);
      end.setHours(endHour, endMinute, 0, 0);
      
      // Handle overnight bookings
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }
      
      // Format the start and end times as ISO strings for the database
      const formattedStartTime = start.toISOString();
      const formattedEndTime = end.toISOString();
      
      // Prepare data for the createAppointment hook
      const primaryClient = editFormData.clientEntries[0].client;
      
      // Create an update object with only the fields that should be updated
      const appointmentUpdates = {
        id: selectedAppointment.id,
        // Use the first stylist of the first client as primary (required field)
        stylist_id: processedClientDetails[0].stylistIds[0],
        // Collect all stylist IDs across all client entries
        stylist_ids: Array.from(new Set(processedClientDetails.flatMap(d => d.stylistIds))),
        // Use the first service from first client as primary (required field)
        service_id: processedClientDetails[0].serviceIds[0],
        // Collect all service IDs
        service_ids: Array.from(new Set(processedClientDetails.flatMap(d => d.serviceIds))),
        // Collect all client IDs
        client_ids: processedClientDetails.map(d => d.clientId),
        // Use first client ID as primary (for backward compatibility)
        client_id: processedClientDetails[0].clientId,
        client_name: primaryClient.full_name,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        notes: editFormData.notes || '',
        status: selectedAppointment.status,
        paid: selectedAppointment.paid
      };
      
      console.log('Sending appointment updates:', appointmentUpdates);
      
      // Update the appointment with the new data
      if (onUpdateAppointment) {
        await onUpdateAppointment(selectedAppointment.id, appointmentUpdates);
      }
      
      // Close the dialog and reset state
      setEditDialogOpen(false);
      setSelectedAppointment(null);
      setEditFormData({
        clientName: '',
        clientId: '',
        serviceId: '',
        stylistId: '',
        startTime: '',
        endTime: '',
        notes: '',
        mobileNumber: '',
        stylistIds: [],
        isNewClient: false,
        clientEntries: []
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      setSnackbarMessage(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    }
  };
  
  // Add a helper function to check if an appointment conflicts with breaks
  const checkBreakConflict = (stylistId: string, startTime: string, endTime: string): boolean => {
    const breaks = getStylistBreaks(stylistId);
    if (!breaks || breaks.length === 0) return false;
    
    const appointmentStart = new Date(startTime).getTime();
    const appointmentEnd = new Date(endTime).getTime();
    
    return breaks.some((breakItem: StylistBreak) => {
      const breakStart = new Date(breakItem.startTime).getTime();
      const breakEnd = new Date(breakItem.endTime).getTime();
      
      return (
        (appointmentStart >= breakStart && appointmentStart < breakEnd) || // Appointment starts during break
        (appointmentEnd > breakStart && appointmentEnd <= breakEnd) || // Appointment ends during break
        (appointmentStart <= breakStart && appointmentEnd >= breakEnd) // Break is within appointment
      );
    });
  };
  
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment || !onDeleteAppointment) return;
    
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await onDeleteAppointment(selectedAppointment.id);
        handleEditDialogClose();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        alert('Failed to delete appointment');
      }
    }
  };
  
  const handleTimeChange = (event: SelectChangeEvent, field: 'startTime' | 'endTime') => {
    if (!selectedAppointment) return;
    
    // Get the selected time value (format: "hour:minute")
    const timeValue = event.target.value;
    const [hourStr, minuteStr] = timeValue.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    // Create a new date object with the selected time
    const newTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hour,
      minute,
      0,
      0
    );
    
    // Update the appropriate field in the editFormData state
    setEditFormData(prev => {
      if (!prev) return prev;
      
      // Create a copy of the previous state
      const updated = { ...prev };
      
      // Update the appropriate field
      if (field === 'startTime') {
        updated.startTime = timeValue;
        
        // If the new start time is after the end time, adjust the end time
        const [endHourStr, endMinuteStr] = updated.endTime.split(':');
        const endHour = parseInt(endHourStr, 10);
        const endMinute = parseInt(endMinuteStr, 10);
        
        if (hour > endHour || (hour === endHour && minute >= endMinute)) {
          // Set end time to start time + 15 minutes
          const newEndHour = minute >= 45 ? (hour + 1) % 24 : hour;
          const newEndMinute = (minute + 15) % 60;
          updated.endTime = `${newEndHour}:${newEndMinute.toString().padStart(2, '0')}`;
        }
      } else {
        updated.endTime = timeValue;
        
        // If the new end time is before the start time, adjust the start time
        const [startHourStr, startMinuteStr] = updated.startTime.split(':');
        const startHour = parseInt(startHourStr, 10);
        const startMinute = parseInt(startMinuteStr, 10);
        
        if (hour < startHour || (hour === startHour && minute <= startMinute)) {
          // Set start time to end time - 15 minutes
          const newStartMinute = minute < 15 ? 45 : minute - 15;
          const newStartHour = minute < 15 ? (hour === 0 ? 23 : hour - 1) : hour;
          updated.startTime = `${newStartHour}:${newStartMinute.toString().padStart(2, '0')}`;
        }
      }
      
      return updated;
    });
  };
  
  // Filter appointments for the current day
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start_time);
    return isSameDay(appointmentDate, currentDate);
  });
  
  // Add a helper function to ensure dates are consistently handled
  const normalizeDateTime = (dateTimeString: string) => {
    // Parse the input date string
    const dateTime = new Date(dateTimeString);
    
    // Create a new date object with the current date but time from the appointment
    const normalized = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      dateTime.getHours(),
      dateTime.getMinutes(),
      0,
      0
    );
    
    return normalized;
  };

  // Update the getAppointmentPosition function to ensure precise positioning
  const getAppointmentPosition = (startTime: string) => {
    // Use the normalized date to ensure consistent time interpretation
    const time = normalizeDateTime(startTime);
    
    // Calculate position based on business hours and exact minutes
    const hoursSinceStart = time.getHours() - BUSINESS_HOURS.start;
    const minutesSinceHourStart = time.getMinutes();
    
    // Calculate total minutes since the start of business hours and add 30 minutes
    const totalMinutesSinceStart = (hoursSinceStart * 60) + minutesSinceHourStart + 30;
    
    // Calculate position in pixels based on exact minutes
    // This ensures appointments are positioned exactly at their scheduled time
    const position = (totalMinutesSinceStart / 15) * TIME_SLOT_HEIGHT;
    
    return position;
  };
  
  // Update the getAppointmentDuration function to work with the new time slot height
  const getAppointmentDuration = (startTime: string, endTime: string) => {
    // Use normalized dates to ensure consistent time interpretation
    const start = normalizeDateTime(startTime);
    const end = normalizeDateTime(endTime);
    
    // Calculate duration in minutes
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Calculate height in pixels based on exact minutes (not intervals)
    // This ensures appointments have the exact height for their duration
    const height = (durationInMinutes / 15) * TIME_SLOT_HEIGHT;
    
    return height;
  };

  const navigate = useNavigate();

  // Handle navigation to POS with appointment data
  const handleCreateBill = () => {
    if (!selectedAppointment) return;
    
    const service = services.find(s => s.id === selectedAppointment.service_id);
    
    // Navigate to POS with appointment data
    navigate('/pos', {
      state: {
        appointmentData: {
          id: selectedAppointment.id,
          clientName: selectedAppointment.clients?.full_name || '',
          stylistId: selectedAppointment.stylist_id,
          serviceId: selectedAppointment.service_id,
          serviceName: service?.name || '',
          servicePrice: service?.price || 0,
          appointmentTime: selectedAppointment.start_time,
          type: 'service' // Explicitly set type as service
        }
      }
    });
    
    // Close the edit dialog
    handleEditDialogClose();
  };

  // Get stylist breaks for the current day
  const getStylistBreaks = (stylistId: string) => {
    const stylist = stylists.find(s => s.id === stylistId);
    if (!stylist || !stylist.breaks || stylist.breaks.length === 0) {
      return [];
    }
    
    // Filter breaks for the current day
    return stylist.breaks.filter((breakItem: StylistBreak) => {
      try {
        const breakDate = new Date(breakItem.startTime);
        
        // Debug log to help identify issues
        if (process.env.NODE_ENV === 'development') {
          console.log('Break date comparison:', {
            breakId: breakItem.id,
            breakStartTime: breakItem.startTime,
            breakDate: breakDate.toISOString(),
            currentDate: currentDate.toISOString(),
            isSameDay: isSameDay(breakDate, currentDate)
          });
        }
        
        // Use date-fns isSameDay for reliable date comparison
        return isSameDay(breakDate, currentDate);
      } catch (error) {
        console.error('Error processing break date:', error, breakItem);
        return false;
      }
    });
  };

  // Add state for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add handleSnackbarClose function
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fix the isBreakTime function to correctly detect breaks with 15-minute precision
  const isBreakTime = (stylistId: string, hour: number, minute: number) => {
    const stylist = stylists.find(s => s.id === stylistId);
    if (!stylist || !stylist.breaks || stylist.breaks.length === 0) {
      return false;
    }
    
    try {
      // Create a date object for the slot time
      const slotTime = new Date(currentDate);
      slotTime.setHours(hour, minute, 0, 0);
      const slotTimeValue = slotTime.getTime();
      
      // Create a date object for the end of the slot (add 30 minutes for a full slot)
      const slotEndTime = new Date(currentDate);
      slotEndTime.setHours(hour, minute + 30, 0, 0);
      const slotEndTimeValue = slotEndTime.getTime();
      
      // Get only breaks for the current day to improve performance
      const todayBreaks = stylist.breaks.filter((breakItem: StylistBreak) => {
        const breakDate = new Date(breakItem.startTime);
        return isSameDay(breakDate, currentDate);
      });
      
      // Debug log for specific hour to track issues
      if (hour === 11) {
        console.log('Checking break at 11:00:', {
          stylistId,
          hour,
          minute,
          slotTime: slotTime.toLocaleTimeString(),
          slotEndTime: slotEndTime.toLocaleTimeString(),
          breaks: todayBreaks.map((b: StylistBreak) => ({
            startTime: new Date(b.startTime).toLocaleTimeString(),
            endTime: new Date(b.endTime).toLocaleTimeString(),
            normalizedStart: normalizeDateTime(b.startTime).toLocaleTimeString(),
            normalizedEnd: normalizeDateTime(b.endTime).toLocaleTimeString()
          }))
        });
      }
      
      // Check if the slot time overlaps with any break period
      return todayBreaks.some((breakItem: StylistBreak) => {
        try {
          // Use normalized times for consistent handling
          const breakStart = normalizeDateTime(breakItem.startTime).getTime();
          const breakEnd = normalizeDateTime(breakItem.endTime).getTime();
          
          // Check for any overlap between the slot and the break
          return (
            // Check if the slot starts during a break
            (slotTimeValue >= breakStart && slotTimeValue < breakEnd) ||
            // Check if the slot ends during a break
            (slotEndTimeValue > breakStart && slotEndTimeValue <= breakEnd) ||
            // Check if the slot completely contains a break
            (slotTimeValue <= breakStart && slotEndTimeValue >= breakEnd)
          );
        } catch (error) {
          console.error('Error checking break time:', error, breakItem);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in isBreakTime:', error);
      return false;
    }
  };

  const handleBreakDialogOpen = (stylistId: string) => {
    const foundStylist = stylists.find(s => s.id === stylistId);
    if (foundStylist) {
      setSelectedStylist(foundStylist);
      setBreakFormData({
        startTime: `${BUSINESS_HOURS.start}:00`,
        endTime: `${BUSINESS_HOURS.start + 1}:00`,
        reason: ''
      });
      setBreakDialogOpen(true);
    }
  };

  const handleBreakDialogClose = () => {
    setBreakDialogOpen(false);
    setSelectedStylist(null);
    setBreakFormData({
      startTime: '',
      endTime: '',
      reason: ''
    });
  };

  const handleAddBreak = async () => {
    try {
      if (!selectedStylist) return;

      const { startTime, endTime, reason } = breakFormData;
      if (!startTime || !endTime) {
        setSnackbarMessage('Please select both start and end times');
        setSnackbarOpen(true);
        return;
      }

      // Create dates for validation
      const formattedStartDate = new Date(currentDate);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      formattedStartDate.setHours(startHour, startMinute, 0, 0);

      const formattedEndDate = new Date(currentDate);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      formattedEndDate.setHours(endHour, endMinute, 0, 0);

      if (formattedEndDate <= formattedStartDate) {
        setSnackbarMessage('End time must be after start time');
        setSnackbarOpen(true);
        return;
      }
      
      // Check for conflicts with existing appointments for this stylist
      const stylistAppointments = appointments.filter(app => 
        app.stylist_id === selectedStylist.id && 
        isSameDay(new Date(app.start_time), currentDate)
      );
      
      const hasAppointmentConflict = stylistAppointments.some(appointment => {
        const appStart = new Date(appointment.start_time);
        const appEnd = new Date(appointment.end_time);
        
        return (
          (formattedStartDate >= appStart && formattedStartDate < appEnd) || // Break starts during appointment
          (formattedEndDate > appStart && formattedEndDate <= appEnd) || // Break ends during appointment
          (formattedStartDate <= appStart && formattedEndDate >= appEnd) // Appointment is within break
        );
      });
      
      if (hasAppointmentConflict) {
        setSnackbarMessage('Cannot add break: Conflicts with existing appointments');
        setSnackbarOpen(true);
        return;
      }
      
      // Check for conflicts with existing breaks
      const hasBreakConflict = selectedStylist.breaks.some(breakItem => {
        const existingBreakStart = new Date(breakItem.startTime);
        const existingBreakEnd = new Date(breakItem.endTime);
        
        // Only consider breaks on the same day
        if (!isSameDay(existingBreakStart, currentDate)) {
          return false;
        }
        
        return (
          (formattedStartDate >= existingBreakStart && formattedStartDate < existingBreakEnd) || // New break starts during existing break
          (formattedEndDate > existingBreakStart && formattedEndDate <= existingBreakEnd) || // New break ends during existing break
          (formattedStartDate <= existingBreakStart && formattedEndDate >= existingBreakEnd) // Existing break is within new break
        );
      });
      
      if (hasBreakConflict) {
        setSnackbarMessage('Cannot add break: Conflicts with existing breaks');
        setSnackbarOpen(true);
        return;
      }

      const breakData: Omit<Break, 'id'> = {
        startTime: formattedStartDate.toISOString(),
        endTime: formattedEndDate.toISOString(),
        reason: reason || ''
      };

      await onAddBreak(selectedStylist.id, breakData as Break);
      
      setBreakDialogOpen(false);
      setBreakFormData({
        startTime: '',
        endTime: '',
        reason: ''
      });

      // Update local state
      const newBreak: Break = {
        ...breakData,
        id: `break-${Date.now()}` // Generate a temporary ID
      };

      const updatedStylists = stylists.map(stylist => 
        stylist.id === selectedStylist.id 
          ? { ...stylist, breaks: [...stylist.breaks, newBreak] }
          : stylist
      );
      
      setStylists(updatedStylists);
      setSelectedStylist({ ...selectedStylist, breaks: [...selectedStylist.breaks, newBreak] });
      
      setSnackbarMessage('Break added successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding break:', error);
      setSnackbarMessage('Failed to add break');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteBreak = async (breakId: string) => {
    if (!selectedStylist) return;
    
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this break?')) {
      return;
    }
    
    try {
      console.log('Deleting break with id:', breakId, 'from stylist:', selectedStylist.id);
      
      if (onDeleteBreak) {
        // Call the prop function to update the database
        await onDeleteBreak(selectedStylist.id, breakId);
        
        // After successful server update, update the local state
        const updatedBreaks = selectedStylist.breaks.filter(b => b.id !== breakId);
        
        const updatedStylists = stylists.map(stylist => 
          stylist.id === selectedStylist.id 
            ? { ...stylist, breaks: updatedBreaks }
            : stylist
        );
        
        setStylists(updatedStylists);
        setSelectedStylist({ ...selectedStylist, breaks: updatedBreaks });
        setSnackbarMessage('Break time removed successfully');
        setSnackbarOpen(true);
      } else {
        console.error('onDeleteBreak prop is not provided');
        setSnackbarMessage('Could not delete break: Delete function not available');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting break:', error);
      setSnackbarMessage(`Failed to delete break: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    }
  };

  const BreakBlock = styled(Box)(({ theme }) => ({
    position: 'absolute',
    left: theme.spacing(0.75),
    right: theme.spacing(0.75),
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    padding: theme.spacing(1),
    zIndex: 10,
    borderRadius: theme.shape.borderRadius,
    borderLeft: `4px solid ${theme.palette.error.dark}`,
    boxShadow: theme.shadows[2],
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }));

  // Update the time column rendering
  const renderTimeColumn = () => (
    <TimeColumn>
      <StylistHeader>
        <TimeLabel variant="subtitle2" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
          Time
        </TimeLabel>
      </StylistHeader>
      {timeSlots.map(({ hour, minute }) => (
        <TimeSlot key={`time-${hour}-${minute}`}>
          {/* Only show the hour label for the first slot of each hour */}
          {minute === 0 ? (
            <TimeLabel sx={{ fontWeight: 'medium' }}>
              {format(new Date().setHours(hour, minute), 'h:mm a')}
            </TimeLabel>
          ) : (
            <TimeLabel sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {format(new Date().setHours(hour, minute), 'h:mm a')}
            </TimeLabel>
          )}
        </TimeSlot>
      ))}
    </TimeColumn>
  );

  // Declare state for service filtering *before* using it in the hook
  const [selectedServiceCollection, setSelectedServiceCollection] = useState<string>('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');

  // Fetch collections and services based on the selected collection
  const { serviceCollections } = useServiceCollections();
  const { services: collectionServices, isLoading: isLoadingCollectionServices } = useCollectionServices(selectedServiceCollection);

  const getFilteredServices = () => {
    // Use collectionServices if available, otherwise fall back to services
    const allServices = collectionServices || services || [];
    
    // First filter by active status
    let filteredServices = allServices.filter(service => 
      service.active !== false
    );
    
    // Filter by collection if one is selected
    if (selectedServiceCollection) {
      filteredServices = filteredServices.filter(service => 
        'collection_id' in service && service.collection_id === selectedServiceCollection
      );
    }
    
    // Filter by search query if one is entered
    if (serviceSearchQuery) {
      const query = serviceSearchQuery.toLowerCase();
      filteredServices = filteredServices.filter(service => 
        service.name.toLowerCase().includes(query) || 
        (service.description && service.description.toLowerCase().includes(query))
      );
    }
    
    // Log for debugging
    console.log('Filtered services:', {
      selectedCollection: selectedServiceCollection,
      searchQuery: serviceSearchQuery,
      servicesCount: filteredServices.length,
      services: filteredServices
    });
    
    return filteredServices;
  };

  // Add handler for date picker icon click
  const handleDatePickerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDatePickerAnchorEl(event.currentTarget);
  };
  
  // Add handler for date picker close
  const handleDatePickerClose = () => {
    setDatePickerAnchorEl(null);
  };
  
  // Update the handleDateChange function
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentDate(date);
      // Notify parent component if callback is provided
      if (onDateChange) {
        onDateChange(date);
      }
      handleDatePickerClose();
    }
  };

  const { isLoading: loadingStylists } = useStylists();

  useEffect(() => {
    setStylists(initialStylists);
  }, [initialStylists]);

  useEffect(() => {
    if (onStylistsChange) {
      onStylistsChange(stylists);
    }
  }, [stylists, onStylistsChange]);

  const handleStylistClick = (stylistId: string) => {
    const foundStylist = stylists.find(s => s.id === stylistId);
    if (foundStylist) {
      setSelectedStylist(foundStylist);
      setBreakDialogOpen(true);
    }
  };

  const renderAppointmentsForStylist = (stylistId: string) => {
    const stylistAppointments = appointments
      .filter(app => app.stylist_id === stylistId)
      .filter(app => isSameDay(new Date(app.start_time), selectedDate))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return stylistAppointments.map(appointment => {
      const top = getAppointmentPosition(appointment.start_time);
      const duration = getAppointmentDuration(appointment.start_time, appointment.end_time);

      // Extract client and service info correctly
      const primaryClient = appointment.clientDetails?.[0];
      // Fallback to direct appointment.client_id if no clientDetails
      const fallbackClient = allClients.find(c => c.id === appointment.client_id);
      const clientName = primaryClient?.full_name || fallbackClient?.full_name || 'Unknown Client';

      const primaryServices = primaryClient?.services || [];
      // Fallback to direct appointment.service_id if no services in clientDetails
      const fallbackService = services.find(s => s.id === appointment.service_id);
      const serviceNames = primaryServices.length > 0
        ? primaryServices.map(s => s.name).join(', ')
        : (fallbackService?.name || 'Unknown Service');

      const isPaid = appointment.paid || false;
      const status = appointment.status || 'scheduled';

      return (
        <ErrorBoundary key={appointment.id} fallback={<Typography>Error rendering appointment</Typography>}>
          <AppointmentCard
            style={{ top: `${top}px` }}
            duration={duration}
            isPaid={isPaid}
            status={status}
            onClick={() => handleAppointmentClick(appointment)}
            draggable
            onDragStart={(e) => handleDragStart(e, appointment)}
            title={`Status: ${status}, Paid: ${isPaid ? 'Yes' : 'No'}`}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Tooltip title={clientName}>
                 <Typography variant="body2" fontWeight="bold" noWrap sx={{ flexGrow: 1, pr: 1 }}>
                   {clientName}
                 </Typography>
              </Tooltip>
              {status === 'completed' && (
                <Chip label="Completed" size="small" color="default" sx={{ mr: 0.5 }} />
              )}
              {isPaid && status !== 'completed' && (
                <Chip label="Paid" size="small" color="success" sx={{ mr: 0.5 }} />
              )}
            </Box>
            <Tooltip title={serviceNames}>
              <Typography variant="caption" display="block" noWrap>
                {serviceNames}
              </Typography>
            </Tooltip>
            <Typography variant="caption" display="block">
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </Typography>
          </AppointmentCard>
        </ErrorBoundary>
      );
    });
  };

  const handleAddClientEntry = () => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: [...prev.clientEntries, { 
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        client: null, 
        selectedCollectionId: '', 
        services: [],
        stylistList: [] // Initialize stylistList as empty array
      }]
    }));
  };

  const handleRemoveClientEntry = (id: string) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.filter(entry => entry.id !== id)
    }));
  };

  const handleClientChange = (id: string, newValue: any) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === id ? { ...entry, client: newValue } : entry
      )
    }));
  };

  const handleClientPhoneChange = (id: string, newValue: string) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === id ? { ...entry, client: { ...entry.client, phone: newValue } } : entry
      )
    }));
  };

  const handleCollectionChange = (id: string, newValue: any) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === id ? { ...entry, selectedCollectionId: newValue?.id } : entry
      )
    }));
  };

  const handleServicesChange = (id: string, newValue: any[]) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === id ? { ...entry, services: newValue } : entry
      )
    }));
  };

  const handleStylistsChange = (id: string, newValue: any[]) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === id ? { ...entry, stylistList: newValue.map(s => ({ id: s.id, name: s.name })) } : entry
      )
    }));
  };

  // Add state for break editing
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);
  const [editBreakDialogOpen, setEditBreakDialogOpen] = useState<boolean>(false);
  const [editBreakFormData, setEditBreakFormData] = useState({
    startTime: '',
    endTime: '',
    reason: ''
  });
  
  const handleEditBreakDialogOpen = (breakItem: Break) => {
    setEditingBreak(breakItem);
    
    // Convert ISO times to HH:MM format for the form
    const startDate = new Date(breakItem.startTime);
    const endDate = new Date(breakItem.endTime);
    
    const startHour = startDate.getHours().toString().padStart(2, '0');
    const startMinute = startDate.getMinutes().toString().padStart(2, '0');
    const endHour = endDate.getHours().toString().padStart(2, '0');
    const endMinute = endDate.getMinutes().toString().padStart(2, '0');
    
    setEditBreakFormData({
      startTime: `${startHour}:${startMinute}`,
      endTime: `${endHour}:${endMinute}`,
      reason: breakItem.reason || ''
    });
    
    setEditBreakDialogOpen(true);
  };
  
  const handleEditBreakDialogClose = () => {
    setEditBreakDialogOpen(false);
    setEditingBreak(null);
  };
  
  const handleUpdateBreak = async () => {
    try {
      if (!selectedStylist || !editingBreak) return;
      
      const { startTime, endTime, reason } = editBreakFormData;
      if (!startTime || !endTime) {
        setSnackbarMessage('Please select both start and end times');
        setSnackbarOpen(true);
        return;
      }
      
      // Create dates for validation
      const formattedStartDate = new Date(currentDate);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      formattedStartDate.setHours(startHour, startMinute, 0, 0);
      
      const formattedEndDate = new Date(currentDate);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      formattedEndDate.setHours(endHour, endMinute, 0, 0);
      
      if (formattedEndDate <= formattedStartDate) {
        setSnackbarMessage('End time must be after start time');
        setSnackbarOpen(true);
        return;
      }
      
      // Check for conflicts with existing appointments for this stylist
      const stylistAppointments = appointments.filter(app => 
        app.stylist_id === selectedStylist.id && 
        isSameDay(new Date(app.start_time), currentDate)
      );
      
      const hasAppointmentConflict = stylistAppointments.some(appointment => {
        const appStart = new Date(appointment.start_time);
        const appEnd = new Date(appointment.end_time);
        
        return (
          (formattedStartDate >= appStart && formattedStartDate < appEnd) || // Break starts during appointment
          (formattedEndDate > appStart && formattedEndDate <= appEnd) || // Break ends during appointment
          (formattedStartDate <= appStart && formattedEndDate >= appEnd) // Appointment is within break
        );
      });
      
      if (hasAppointmentConflict) {
        setSnackbarMessage('Cannot update break: Conflicts with existing appointments');
        setSnackbarOpen(true);
        return;
      }
      
      // Check for conflicts with existing breaks (excluding the current break being edited)
      const hasBreakConflict = selectedStylist.breaks.some(breakItem => {
        // Skip the current break being edited
        if (breakItem.id === editingBreak.id) {
          return false;
        }
        
        const existingBreakStart = new Date(breakItem.startTime);
        const existingBreakEnd = new Date(breakItem.endTime);
        
        // Only consider breaks on the same day
        if (!isSameDay(existingBreakStart, currentDate)) {
          return false;
        }
        
        return (
          (formattedStartDate >= existingBreakStart && formattedStartDate < existingBreakEnd) || // Updated break starts during existing break
          (formattedEndDate > existingBreakStart && formattedEndDate <= existingBreakEnd) || // Updated break ends during existing break
          (formattedStartDate <= existingBreakStart && formattedEndDate >= existingBreakEnd) // Existing break is within updated break
        );
      });
      
      if (hasBreakConflict) {
        setSnackbarMessage('Cannot update break: Conflicts with existing breaks');
        setSnackbarOpen(true);
        return;
      }
      
      const breakData: Omit<Break, 'id'> = {
        startTime: formattedStartDate.toISOString(),
        endTime: formattedEndDate.toISOString(),
        reason: reason || ''
      };
      
      console.log('Updating break with data:', {
        stylistId: selectedStylist.id,
        breakId: editingBreak.id,
        breakData
      });

      if (onUpdateBreak) {
        // Call the prop function to update the database
        await onUpdateBreak(selectedStylist.id, editingBreak.id, breakData);
        
        // After successful server update, update the local state
        const updatedBreaks = selectedStylist.breaks.map(b => 
          b.id === editingBreak.id 
            ? { ...breakData, id: editingBreak.id }
            : b
        );
        
        const updatedStylists = stylists.map(stylist => 
          stylist.id === selectedStylist.id 
            ? { ...stylist, breaks: updatedBreaks }
            : stylist
        );
        
        setStylists(updatedStylists);
        setSelectedStylist({ ...selectedStylist, breaks: updatedBreaks });
        setSnackbarMessage('Break time updated successfully');
        setSnackbarOpen(true);
      } else {
        console.error('onUpdateBreak prop is not provided');
        setSnackbarMessage('Could not update break: Update function not available');
        setSnackbarOpen(true);
      }
      
      setEditBreakDialogOpen(false);
      setEditingBreak(null);
      
    } catch (error) {
      console.error('Error updating break:', error);
      setSnackbarMessage(`Failed to update break: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    }
  };

  return (
    <DayViewContainer>
      <DayViewHeader>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handlePrevDay}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextDay}>
            <ChevronRight />
          </IconButton>
          <Tooltip title="Today">
            <IconButton onClick={handleToday} sx={{ ml: 1 }}>
              <Today />
            </IconButton>
          </Tooltip>
          <Tooltip title="Select Date">
            <IconButton 
              onClick={handleDatePickerClick} 
              sx={{ 
                ml: 1,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <CalendarMonth />
            </IconButton>
          </Tooltip>
          <Popover
            open={datePickerOpen}
            anchorEl={datePickerAnchorEl}
            onClose={handleDatePickerClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            PaperProps={{
              sx: {
                p: 2,
                boxShadow: 3,
                borderRadius: 2
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 320 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Select Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <ErrorBoundary>
                  <DatePicker
                    value={currentDate}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                        sx: { mb: 2 }
                      }
                    }}
                  />
                </ErrorBoundary>
              </LocalizationProvider>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button onClick={handleDatePickerClose} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleDateChange(currentDate);
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      </DayViewHeader>
      
      <ScheduleGrid className="schedule-grid">
        {renderTimeColumn()}
        
        {stylists
          .filter(stylist => stylist.available !== false) // Only show available stylists
          .map((stylist, index, filteredStylists) => (
          <StylistColumn 
            key={stylist.id}
            className="stylist-column"
          >
            <StylistHeader
              onClick={() => handleBreakDialogOpen(stylist.id)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.salon.oliveLight,
                  opacity: 0.9
                },
                ...(index === filteredStylists.length - 1 && {
                  borderRight: 'none'
                })
              }}
            >
              <Typography variant="subtitle2">{stylist.name}</Typography>
            </StylistHeader>
            
            {timeSlots.map(slot => (
              <AppointmentSlot
                key={`slot-${stylist.id}-${slot.hour}-${slot.minute}`}
                onClick={() => handleSlotClick(stylist.id, slot.hour, slot.minute)}
                onDragOver={(e) => handleDragOver(e, stylist.id, slot.hour, slot.minute)}
                onDrop={(e) => handleDrop(e, stylist.id, slot.hour, slot.minute)}
                sx={{
                  ...(index === filteredStylists.length - 1 && {
                    borderRight: 'none'
                  }),
                  ...(isBreakTime(stylist.id, slot.hour, slot.minute) && { 
                    backgroundColor: 'transparent', // Completely transparent
                    cursor: 'not-allowed',
                    pointerEvents: 'none', // Prevent mouse events
                    '&:hover': {
                      backgroundColor: 'transparent' // No hover effect
                    }
                  })
                }}
              />
            ))}
            
            {renderAppointmentsForStylist(stylist.id)}
            
            {getStylistBreaks(stylist.id).map((breakItem: StylistBreak) => {
              const breakDate = new Date(breakItem.startTime);
              // Only show breaks for the current day
              if (!isSameDay(breakDate, currentDate)) return null;
              
              // Normalize the break times to ensure consistent handling
              const breakStartTime = normalizeDateTime(breakItem.startTime);
              const breakEndTime = normalizeDateTime(breakItem.endTime);
              
              // Log the break times for debugging
              console.log('Break rendering:', {
                id: breakItem.id,
                startISOString: breakItem.startTime,
                endISOString: breakItem.endTime,
                normalizedStartTime: breakStartTime.toLocaleTimeString(),
                normalizedEndTime: breakEndTime.toLocaleTimeString(),
                startHour: breakStartTime.getHours(),
                startMinute: breakStartTime.getMinutes()
              });

              const top = getAppointmentPosition(breakItem.startTime);
              const height = getAppointmentDuration(breakItem.startTime, breakItem.endTime);

              return (
                <BreakBlock
                  key={breakItem.id}
                  sx={{
                    top: `${top}px`,
                    height: `${height}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: 0.5,
                    cursor: 'pointer', // Add pointer cursor
                    position: 'relative' // Ensure we can position buttons inside
                  }}
                  onClick={() => handleEditBreakDialogOpen(breakItem)} // Add click handler
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    Break Time
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {formatTime(breakStartTime)} - {formatTime(breakEndTime)}
                  </Typography>
                  {breakItem.reason && (
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                      {breakItem.reason}
                    </Typography>
                  )}
                  
                  {/* Add edit and delete buttons directly on the break card */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      display: 'flex', 
                      gap: 0.5,
                      opacity: 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={e => e.stopPropagation()} // Prevent opening edit dialog when clicking buttons
                  >
                    <IconButton 
                      size="small" 
                      sx={{ padding: 0.3, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBreakDialogOpen(breakItem);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      sx={{ padding: 0.3, backgroundColor: 'rgba(255,255,255,0.3)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBreak(breakItem.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </BreakBlock>
              );
            })}
          </StylistColumn>
        ))}
      </ScheduleGrid>
      
      {/* Edit Appointment Drawer */}
      <Drawer anchor="right" variant="persistent" open={editDialogOpen} onClose={handleEditDialogClose}
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: 500, display: 'flex', flexDirection: 'column' } }}>
        
        {/* Header */}
        <Box sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Edit Appointment</Typography>
          <IconButton onClick={handleEditDialogClose}><CloseIcon /></IconButton>
        </Box>
        
        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>

          {/* --- Render Dynamic Client Sections --- */}
          {editFormData.clientEntries ? editFormData.clientEntries.map((entry, idx) => (
            <Paper key={entry.id} elevation={2} sx={{ mb: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" component="div" fontWeight="medium">Client {idx + 1}</Typography>
                {editFormData.clientEntries && editFormData.clientEntries.length > 1 && (
                  <Tooltip title="Remove Client Entry">
                     <IconButton
                        onClick={() => handleRemoveClientEntry(entry.id)}
                        size="small"
                        color="error"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                     >
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Grid container spacing={2}>
                 {/* 1. Client selector */}
                 <Grid item xs={12}>
                    <Autocomplete
                      freeSolo
                      filterOptions={(options, params) => {
                        const filtered = filterClients(options as any, params);
                        // Suggest the creation of a new value
                        const { inputValue } = params;
                        const isExisting = options.some((option) => inputValue === (option as any).full_name);
                        if (inputValue !== '' && !isExisting) {
                          filtered.push({
                            inputValue: `Add "${inputValue}"`, // Presentation for adding new
                            full_name: inputValue, // Actual value to use
                            id: '', // Indicate it's new
                            phone: ''
                          });
                        }
                        return filtered;
                      }}
                      options={allClients || []}
                      loading={isLoadingClients}
                      getOptionLabel={(option) => {
                        // value selected with enter, right from the input
                        if (typeof option === 'string') {
                          return option;
                        }
                        // Add "xxx" option created dynamically
                        if ((option as any).inputValue) {
                          return (option as any).inputValue;
                        }
                        // Regular option from list
                        return `${option.full_name}${option.phone ? ` (${option.phone})` : ''}`;
                      }}
                      value={entry.client}
                      onChange={(_, newValue) => handleClientChange(entry.id, newValue)}
                      isOptionEqualToValue={(option, value) => {
                        if (!value) return false;
                        return option.id === value.id;
                      }}
                      renderOption={(props, option) => {
                        // Distinguish between regular options and the "Add..." option
                        if ((option as any).inputValue) {
                          return <li {...props} key={(option as any).inputValue}>{(option as any).inputValue}</li>;
                        }
                        return <li {...props} key={option.id}>{`${option.full_name}${option.phone ? ` (${option.phone})` : ''}`}</li>;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Client *"
                          required
                          error={!entry.client || !entry.client.full_name}
                          helperText={!entry.client || !entry.client.full_name ? "Client name required" : ""}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                 </Grid>

                 {/* Mobile field for new client */}
                 {entry.client && !entry.client.id && (
                   <Grid item xs={12}>
                     <TextField
                       label="Mobile Number *"
                       value={entry.client.phone || ''}
                       onChange={e => handleClientPhoneChange(entry.id, e.target.value)}
                       fullWidth
                       size="small"
                       required
                       error={!entry.client.phone}
                       helperText={!entry.client.phone ? "Phone required for new client" : ""}
                     />
                   </Grid>
                 )}

                 {/* 2a. Service Collection Selector */}
                 <Grid item xs={12}>
                    <Autocomplete
                      options={serviceCollections || []}
                      getOptionLabel={(collection) => collection.name}
                      value={serviceCollections?.find(c => c.id === entry.selectedCollectionId) || null}
                      onChange={(_, collection) => handleCollectionChange(entry.id, collection)}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                      )}
                      renderInput={params =>
                        <TextField {...params}
                           label="Service Collection *"
                           required
                           error={!entry.selectedCollectionId}
                           helperText={!entry.selectedCollectionId ? "Select a collection" : ""}
                           InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingCollectionServices ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      }
                      fullWidth
                      size="small"
                    />
                 </Grid>

                 {/* 2b. Services multi-select */}
                 <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={services?.filter(s => (s as any).collection_id === entry.selectedCollectionId) || []}
                      getOptionLabel={s => `${s.name} (${s.duration} min)`}
                      value={entry.services}
                      onChange={(_, services) => handleServicesChange(entry.id, services)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      disabled={!entry.selectedCollectionId}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {`${option.name} (${option.duration} min)`}
                        </li>
                       )}
                      renderTags={(value, getTagProps) =>
                        value.map((s, i) =>
                           <Chip {...getTagProps({ index: i })} key={s.id} label={s.name} size="small" variant="outlined" />
                        )
                      }
                      renderInput={params =>
                         <TextField {...params}
                            label="Service(s) *"
                            required
                            error={!!entry.selectedCollectionId && entry.services.length === 0}
                            helperText={
                              !entry.selectedCollectionId
                                ? "Select a collection first"
                                : entry.services.length === 0
                                ? "Select at least one service"
                                : ""
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingCollectionServices && entry.selectedCollectionId ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                         />
                      }
                      fullWidth
                      size="small"
                    />
                 </Grid>

                 {/* 3. Stylists multi-select */}
                 <Grid item xs={12}>
                    <Autocomplete
                      sx={{ mb: 2 }}
                      multiple
                      options={(stylists || [])
                        .filter(st => st.available !== false) // Only show available stylists
                        .map(st => ({ id: st.id, name: st.name }))}
                      getOptionLabel={st => st.name}
                      value={entry.stylistList || []} // Ensure value is always an array
                      onChange={(_, stylists) => handleStylistsChange(entry.id, stylists)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.name}
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((st, i) => {
                          const { key, ...rest } = getTagProps({ index: i });
                          return <Chip key={key} {...rest} label={st.name} size="small" variant="outlined" />;
                        })
                      }
                      renderInput={params =>
                        <TextField {...params}
                          label="Stylist(s) *"
                          required
                          error={!entry.stylistList || entry.stylistList.length === 0} // Added null check
                          helperText={!entry.stylistList || entry.stylistList.length === 0 ? "Select at least one stylist" : ""}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingStylists ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      }
                      fullWidth
                      size="small"
                    />
                 </Grid>
              </Grid>
            </Paper>
          )) : null}

          <Button
             variant="outlined"
             onClick={handleAddClientEntry}
             startIcon={<AddIcon />}
             fullWidth
             sx={{ mb: 3, mt: 1, py: 1.5, borderColor: 'primary.light', color: 'primary.main', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}
          >
             Add Another Client
          </Button>
          {/* --- End Dynamic Client Sections --- */}

          <Divider sx={{ my: 3 }} />

          {/* Step 4: Select Time (Now Global) */}
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">Select Time</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth required size="small">
                <InputLabel>Start Time</InputLabel>
                <Select
                  value={editFormData.startTime}
                  onChange={(e) => handleTimeChange(e, 'startTime')}
                  label="Start Time"
                  error={!editFormData.startTime}
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={`start-${option.value}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {!editFormData.startTime && <Typography variant="caption" color="error" sx={{mt: 0.5}}>Start time required</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required size="small">
                <InputLabel>End Time</InputLabel>
                <Select
                  value={editFormData.endTime}
                  onChange={(e) => handleTimeChange(e, 'endTime')}
                  label="End Time"
                  error={!editFormData.endTime}
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={`end-${option.value}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {!editFormData.endTime && <Typography variant="caption" color="error" sx={{mt: 0.5}}>End time required</Typography>}
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Step 5: Notes */}
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">Notes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Appointment Notes (Optional)"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                multiline
                rows={3}
                fullWidth
                size="small"
                placeholder="Add any relevant notes for the overall appointment..."
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer with action buttons */}
        <Box sx={{ p: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {onDeleteAppointment && (
            <Button onClick={handleDeleteAppointment} color="error" sx={{ mr: 'auto' }}>
              Delete
            </Button>
          )}
          <Button 
            onClick={handleCreateBill}
            color="success"
            startIcon={<Receipt />}
            sx={{ mr: 'auto' }}
          >
            Create Bill
          </Button>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateAppointment} variant="contained" color="primary">
            Update
          </Button>
        </Box>
      </Drawer>

      {/* Break Dialog */}
      <Dialog open={breakDialogOpen} onClose={handleBreakDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Manage Break Time</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Add New Break
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={breakFormData.startTime}
                    onChange={(e) => setBreakFormData({ ...breakFormData, startTime: e.target.value as string })}
                    label="Start Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={`break-start-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>End Time</InputLabel>
                  <Select
                    value={breakFormData.endTime}
                    onChange={(e) => setBreakFormData({ ...breakFormData, endTime: e.target.value as string })}
                    label="End Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={`break-end-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reason"
                  value={breakFormData.reason}
                  onChange={(e) => setBreakFormData({ ...breakFormData, reason: e.target.value })}
                  fullWidth
                  placeholder="Optional: Enter reason for break"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  onClick={handleAddBreak} 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Add Break
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Existing Breaks
            </Typography>
            {selectedStylist && selectedStylist.breaks && selectedStylist.breaks.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStylist.breaks.map((breakItem: Break, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell>{formatTime(breakItem.startTime)}</TableCell>
                        <TableCell>{formatTime(breakItem.endTime)}</TableCell>
                        <TableCell>{breakItem.reason || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditBreakDialogOpen(breakItem)}
                            title="Edit break"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBreak(breakItem.id)}
                            title="Delete break"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  color: 'text.secondary',
                  bgcolor: 'grey.50'
                }}
              >
                <Typography>No breaks scheduled</Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBreakDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Break Dialog */}
      <Dialog open={editBreakDialogOpen} onClose={handleEditBreakDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Break Time</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={editBreakFormData.startTime}
                    onChange={(e) => setEditBreakFormData({ ...editBreakFormData, startTime: e.target.value as string })}
                    label="Start Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={`break-edit-start-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>End Time</InputLabel>
                  <Select
                    value={editBreakFormData.endTime}
                    onChange={(e) => setEditBreakFormData({ ...editBreakFormData, endTime: e.target.value as string })}
                    label="End Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={`break-edit-end-${option.value}`} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  value={editBreakFormData.reason}
                  onChange={(e) => setEditBreakFormData({ ...editBreakFormData, reason: e.target.value })}
                  variant="outlined"
                  placeholder="Lunch, Meeting, etc."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditBreakDialogClose}>Cancel</Button>
          <Button
            onClick={handleUpdateBreak}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Update Break
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="warning">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DayViewContainer>
  );
}

export default StylistDayView; 