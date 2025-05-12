import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  Chip,
  Stack,
  Drawer,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import { useAppointments, Appointment, MergedAppointment } from '../hooks/useAppointments'
import { useStylists, Stylist, StylistBreak } from '../hooks/useStylists'
import { useServices, Service } from '../hooks/useServices'
import { useClients, Client } from '../hooks/useClients'
import { format, addDays, subDays } from 'date-fns'
import { useServiceCollections } from '../hooks/useServiceCollections';
import StylistDayView, { Break } from '../components/StylistDayView'
import { Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon, Receipt as ReceiptIcon } from '@mui/icons-material'
import { formatCurrency } from '../utils/format'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { DateSelectArg } from '@fullcalendar/core'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { useNavigate } from 'react-router-dom'

// Define Drawer width as a constant
const drawerWidth = 500;

interface BookingFormData {
  clientNames: string[];
  clientIds: string[];
  serviceIds: string[];
  stylistIds: string[];
  startTime: string;
  endTime: string;
  notes?: string;
  width?: string;
}

// Generate time options for select dropdown
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 8; hour <= 22; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);

    options.push({
      value: `${hour}:00`,
      label: `${hour12}:00 ${period}`
    });
    options.push({
      value: `${hour}:30`,
      label: `${hour12}:30 ${period}`
    });
  }
  return options;
};

// Define Collection type
interface ServiceCollection {
  id: string;
  name: string;
  service_ids: string[];
}

// Interface for a single client entry in the new state
interface ClientAppointmentEntry {
  id: string;
  client: (Client & { inputValue?: string }) | null; // Allow storing inputValue for new clients
  services: Service[];
  stylists: Pick<Stylist, 'id' | 'name'>[];
}

// Define filter for freeSolo client options
const filterClients = createFilterOptions<{ id: string; full_name: string; phone?: string; email?: string; created_at?: string; inputValue?: string }>();

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [clientEntries, setClientEntries] = useState<ClientAppointmentEntry[]>([
    { id: uuidv4(), client: null, services: [], stylists: [] }
  ]);
  const [appointmentTime, setAppointmentTime] = useState({ startTime: '', endTime: '' });
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('error');
  const [editingAppointment, setEditingAppointment] = useState<MergedAppointment | null>(null);
  const [isBilling, setIsBilling] = useState(false); // Kept for potential future use with button disabling
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const timeOptions = generateTimeOptions();
  const navigate = useNavigate();

  const { appointments = [], isLoading: loadingAppointments, updateAppointment, createAppointment, deleteAppointment } = useAppointments();
  const { services: allServices = [], isLoading: loadingServices } = useServices();
  const { stylists: allStylists = [], isLoading: loadingStylists, updateStylist } = useStylists();
  const { clients: allClients = [], isLoading: loadingClients, updateClientFromAppointment } = useClients();
  const { serviceCollections = [], isLoading: loadingCollections } = useServiceCollections();

  // --- Moved Helper Function BEFORE its use in useMemo ---
  const convertStylists = (stylists: Stylist[]): any[] => {
    return stylists.map(stylist => ({
      ...stylist,
      breaks: (stylist.breaks || []).map((breakItem: StylistBreak) => ({
        ...breakItem,
        id: breakItem.id,
        startTime: breakItem.startTime,
        endTime: breakItem.endTime,
        reason: breakItem.reason || ''
      }))
    }));
  };

  // --- Hooks Using Helper Functions ---
  const processedStylists = useMemo(() => convertStylists(allStylists || []), [allStylists]);

  // --- Other Helper Functions ---
  const addBlankEntry = () => {
    setClientEntries(prev => [...prev, { id: uuidv4(), client: null, services: [], stylists: [] }]);
  };

  const removeEntry = (id: string) => {
    setClientEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, changes: Partial<ClientAppointmentEntry>) => {
    setClientEntries(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updatedEntry = { ...e, ...changes };
          return updatedEntry;
        }
        return e;
      })
    );
  };

  const handleSelect = (selectInfo: DateSelectArg) => {
    setSelectedSlot(selectInfo);
    setEditingAppointment(null);
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    setAppointmentTime({
      startTime: `${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${endDate.getHours()}:${String(endDate.getMinutes()).padStart(2, '0')}`,
    });
    setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [] }]);
    setAppointmentNotes('');
  };

  const handleAppointmentClick = (appointment: MergedAppointment) => {
    setEditingAppointment(appointment);
    setSelectedSlot(null);

    const clientEntriesToSet = (appointment.clientDetails || []).map((clientDetail): ClientAppointmentEntry | null => {
      const client: Client | null = (allClients || []).find(c => c.id === clientDetail.id) || null;
      if (!client) {
        console.warn(`Client data not found locally for ID: ${clientDetail.id}`);
        // Optionally fetch if missing, or handle gracefully
        // return null;
      }

      return {
        id: uuidv4(),
        client: client ? { ...client } : null, // Ensure client exists before spreading
        services: clientDetail.services || [], 
        stylists: clientDetail.stylists || [], 
      };
    }).filter((entry): entry is ClientAppointmentEntry => entry !== null);

    if (clientEntriesToSet.length === 0 && appointment.clientDetails?.length > 0) {
      console.warn("Appointment data missing nested client details after filtering. Check data consistency.");
      setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [] }]);
    } else if (clientEntriesToSet.length === 0) {
       console.log("Setting default blank entry as clientDetails was empty.")
       setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [] }]);
    } else {
      setClientEntries(clientEntriesToSet);
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    setAppointmentTime({
      startTime: `${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${endDate.getHours()}:${String(endDate.getMinutes()).padStart(2, '0')}`
    });
    setAppointmentNotes(appointment.notes || '');
  };

  const handleDayViewSelect = (stylistId: string, time: Date) => {
    const defaultEndTime = new Date(time.getTime() + 60 * 60 * 1000);
    setSelectedSlot({
      start: time,
      end: defaultEndTime,
      startStr: time.toISOString(),
      endStr: defaultEndTime.toISOString(),
      allDay: false,
      jsEvent: new MouseEvent('click'),
      view: {} as any
    });
    setSelectedStylistId(stylistId);
    setEditingAppointment(null);
    setAppointmentTime({
      startTime: `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`,
      endTime: `${defaultEndTime.getHours()}:${String(defaultEndTime.getMinutes()).padStart(2, '0')}`
    });
    const preSelectedStylist = (allStylists || []).find(s => s.id === stylistId);
    setClientEntries([{ 
      id: uuidv4(), 
      client: null, 
      services: [], 
      stylists: preSelectedStylist ? [{ id: preSelectedStylist.id, name: preSelectedStylist.name }] : []
    }]);
    setAppointmentNotes('');
  };

  const handleTimeChange = (event: SelectChangeEvent, field: 'startTime' | 'endTime') => {
    setAppointmentTime(prev => ({ ...prev, [field]: event.target.value }));
  };

  // Combined function for booking or updating
  const handleSaveAppointment = async () => {
    // --- Validation ---
    let isValid = true;
    clientEntries.forEach((entry, idx) => {
      const clientName = entry.client?.full_name?.trim() || entry.client?.inputValue?.trim();
      const isNewClient = !entry.client?.id;
      const clientPhone = entry.client?.phone?.trim();

      if (!clientName) {
        console.error(`Validation Error: Client name missing for entry ${idx + 1}`);
        isValid = false;
      }
      if (isNewClient && !clientPhone) {
        console.error(`Validation Error: Phone number required for new client in entry ${idx + 1}`);
          isValid = false;
      }
      if (entry.services.length === 0) {
        console.error(`Validation Error: No services selected for entry ${idx + 1}`);
        isValid = false;
      }
      if (entry.stylists.length === 0) {
        console.error(`Validation Error: No stylists selected for entry ${idx + 1}`);
        isValid = false;
      }
    });
    if (!appointmentTime.startTime || !appointmentTime.endTime) {
      console.error("Validation Error: Start or End time missing.");
      isValid = false;
    }
    
    // Validate that start time is before end time
    if (appointmentTime.startTime && appointmentTime.endTime) {
      const [startHour, startMinute] = appointmentTime.startTime.split(':').map(Number);
      const [endHour, endMinute] = appointmentTime.endTime.split(':').map(Number);
      
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        console.error("Validation Error: End time must be after start time");
        setSnackbarMessage('End time must be after start time');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }
    
    if (!isValid) {
      setSnackbarMessage('Validation failed. Ensure all required fields are filled correctly.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    // --- End Validation ---

    // --- Time Calculation ---
    const baseDate = editingAppointment ? new Date(editingAppointment.start_time) : (selectedSlot ? new Date(selectedSlot.start) : new Date(selectedDate));
    baseDate.setHours(0, 0, 0, 0);
    const [startHour, startMinute] = appointmentTime.startTime.split(':').map(Number);
    const [endHour, endMinute] = appointmentTime.endTime.split(':').map(Number);
    const startTime = new Date(baseDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(baseDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);
    // --- End Time Calculation ---
    
    // --- Check for break conflicts ---
    try {
      for (const entry of clientEntries) {
        for (const stylist of entry.stylists) {
          // Find the stylist's breaks
          const stylistData = allStylists.find(s => s.id === stylist.id);
          if (!stylistData) continue;
          
          // Check for break conflicts
          const hasBreakConflict = (stylistData.breaks || []).some(breakItem => {
            const breakStart = new Date(breakItem.startTime);
            const breakEnd = new Date(breakItem.endTime);
            
            // Only check breaks on the same day
            if (breakStart.getDate() !== startTime.getDate() ||
                breakStart.getMonth() !== startTime.getMonth() ||
                breakStart.getFullYear() !== startTime.getFullYear()) {
              return false;
            }
            
            // Check for overlap
            return (
              (startTime >= breakStart && startTime < breakEnd) || // Start during break
              (endTime > breakStart && endTime <= breakEnd) || // End during break
              (startTime <= breakStart && endTime >= breakEnd) // Break is within appointment
            );
          });
          
          if (hasBreakConflict) {
            console.error(`Break conflict detected for stylist: ${stylist.name}`);
            setSnackbarMessage(`Cannot book appointment: ${stylist.name} has a break scheduled during this time.`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
          }
        }
      }
      
      // Check for overlapping appointments
      const conflictingAppointments = appointments.filter(app => {
        // Skip the current appointment being edited
        if (editingAppointment && app.id === editingAppointment.id) return false;
        
        // Convert to Date objects
        const appStart = new Date(app.start_time);
        const appEnd = new Date(app.end_time);
        
        // Only check appointments on the same day
        if (appStart.getDate() !== startTime.getDate() ||
            appStart.getMonth() !== startTime.getMonth() ||
            appStart.getFullYear() !== startTime.getFullYear()) {
          return false;
        }
        
        // Check if the appointment overlaps with the time range
        return (
          (startTime >= appStart && startTime < appEnd) || // Start during another appointment
          (endTime > appStart && endTime <= appEnd) || // End during another appointment
          (startTime <= appStart && endTime >= appEnd) // Another appointment is within this one
        );
      });
      
      // Filter for conflicting stylists
      for (const entry of clientEntries) {
        const selectedStylistIds = entry.stylists.map(s => s.id);
        
        const stylistConflicts = conflictingAppointments.filter(app => {
          // Check if any of the selected stylists are already booked
          return selectedStylistIds.includes(app.stylist_id);
        });
        
        if (stylistConflicts.length > 0) {
          const conflictingStylist = allStylists.find(s => s.id === stylistConflicts[0].stylist_id);
          setSnackbarMessage(`Scheduling conflict: ${conflictingStylist ? conflictingStylist.name : 'A stylist'} is already booked during this time.`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
      }

      // --- Create/Update Clients ---
      const processedClientDetails = await Promise.all(
        clientEntries.map(async (entry, idx) => {
          let finalClientId = entry.client?.id || '';
          const clientName = entry.client?.full_name?.trim() || entry.client?.inputValue?.trim();
          const clientPhone = entry.client?.phone?.trim();
          const clientEmail = entry.client?.email?.trim();

          if (!finalClientId && clientName && clientPhone) { // Create new client
            try {
              const newClient = await updateClientFromAppointment(
                clientName,
                clientPhone,
                clientEmail || '',
                editingAppointment ? 'Created during appointment edit' : 'Created from appointment booking'
              );
              finalClientId = newClient.id;
            } catch (clientError) {
              console.error(`Error creating new client for entry ${idx + 1}:`, clientError);
              throw new Error(`Failed to create new client: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
            }
          } else if (!finalClientId) {
              throw new Error(`Could not determine Client ID for entry ${idx + 1}. Name: ${clientName}, Phone: ${clientPhone}`);
          }

          return {
            clientId: finalClientId,
            serviceIds: entry.services.map(s => s.id),
            stylistIds: entry.stylists.map(st => st.id),
          };
        })
      );
      // --- End Create/Update Clients ---

      if (processedClientDetails.some(d => !d.clientId)) {
        throw new Error("Could not resolve client ID for one or more entries.");
      }

      // --- Prepare Data for Backend ---
      const baseAppointmentData = {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: appointmentNotes,
        status: editingAppointment ? editingAppointment.status : 'scheduled' as Appointment['status'],
        client_id: processedClientDetails[0].clientId,
        stylist_id: processedClientDetails[0].stylistIds[0],
        service_id: processedClientDetails[0].serviceIds[0],
      };

      // The detailed structure expected by the backend hook { clientId, serviceIds, stylistIds }[]
      // We already have this structure in processedClientDetails from the client creation step
      const clientDetailsForHook = processedClientDetails; 

      if (editingAppointment) {
        // --- Update Appointment ---
        const updateData = {
          id: editingAppointment.id,
          ...baseAppointmentData,
          // Make sure updateAppointment also expects this structure for clientDetails
          // If not, it needs modification in useAppointments.ts
          clientDetails: clientDetailsForHook 
        };
        console.log("Sending update data:", updateData);
        await updateAppointment(updateData);
        toast.success('Appointment updated successfully!');
      } else {
        // --- Create Appointment ---
        const createData = {
          ...baseAppointmentData,
          // Ensure createAppointment expects this structure
          clientDetails: clientDetailsForHook 
        };
        console.log("Sending create data:", createData);
        await createAppointment(createData);
        toast.success('Appointment booked successfully!');
      }

      handleCloseDrawer();

    } catch (error) {
      const action = editingAppointment ? 'Update' : 'Booking';
      console.error(`Error during appointment ${action.toLowerCase()}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`${action} failed: ${errorMessage}`);
      setSnackbarMessage(`${action} failed: ${errorMessage}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAddBreak = async (stylistId: string, breakData: Omit<Break, 'id'>) => {
      try {
      const stylist = (allStylists || []).find(s => s.id === stylistId);
      if (!stylist) throw new Error("Stylist not found");
      const newBreak = { ...breakData, id: uuidv4() };
      const currentBreaks = Array.isArray(stylist.breaks) ? stylist.breaks : [];
      const updatedBreaks = [...currentBreaks, newBreak];
      await updateStylist({ id: stylistId, breaks: updatedBreaks });
      toast.success('Break added successfully');
    } catch (error) {
      console.error('Error adding break:', error);
      toast.error(`Failed to add break: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteBreak = async (stylistId: string, breakId: string) => {
    try {
      console.log('Deleting break:', { stylistId, breakId });
      const stylist = (allStylists || []).find(s => s.id === stylistId);
      if (!stylist || !stylist.breaks) throw new Error("Stylist or breaks not found");
      
      // Confirm stylist has this break in their array
      const breakExists = stylist.breaks.some(b => b.id === breakId);
      if (!breakExists) {
        console.error('Break not found in stylist breaks array:', { breakId, stylistBreaks: stylist.breaks });
        throw new Error(`Break with ID ${breakId} not found for stylist`);
      }
      
      const updatedBreaks = stylist.breaks.filter(b => b.id !== breakId);
      console.log('Updated breaks array:', updatedBreaks);
      
      // Update the stylist with the new breaks array
      await updateStylist({ id: stylistId, breaks: updatedBreaks });
      toast.success('Break deleted successfully');
    } catch (error) {
      console.error('Error deleting break:', error);
      toast.error(`Failed to delete break: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateBreak = async (stylistId: string, breakId: string, breakData: Omit<Break, 'id'>) => {
    try {
      console.log('Updating break:', { stylistId, breakId, breakData });
      const stylist = (allStylists || []).find(s => s.id === stylistId);
      if (!stylist || !stylist.breaks) throw new Error("Stylist or breaks not found");
      
      // Confirm stylist has this break in their array
      const breakIndex = stylist.breaks.findIndex(b => b.id === breakId);
      if (breakIndex === -1) {
        console.error('Break not found in stylist breaks array:', { breakId, stylistBreaks: stylist.breaks });
        throw new Error(`Break with ID ${breakId} not found for stylist`);
      }
      
      const updatedBreaks = stylist.breaks.map(b => 
        b.id === breakId ? { ...breakData, id: breakId } : b
      );
      
      console.log('Updated breaks array:', updatedBreaks);
      
      // Update the stylist with the new breaks array
      await updateStylist({ id: stylistId, breaks: updatedBreaks });
      toast.success('Break updated successfully');
    } catch (error) {
      console.error('Error updating break:', error);
      toast.error(`Failed to update break: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedSlot(null);
    setEditingAppointment(null);
    setIsBilling(false);
    setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [] }]);
    setAppointmentTime({ startTime: '', endTime: '' });
    setAppointmentNotes('');
  };

  // ============================================
  // Rendering Logic
  // ============================================

  if (loadingAppointments || loadingServices || loadingStylists || loadingClients || loadingCollections) {
    return <CircularProgress />;
  }

  const showDrawer = !!selectedSlot || !!editingAppointment;

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 64px)', 
      width: '100%',
      position: 'relative', 
      overflow: 'hidden'
    }}>
      {/* Main Content Area - Calendar */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: showDrawer ? drawerWidth : 0,
          bottom: 0,
          overflowY: 'auto',
          transition: 'right 0.3s ease',
        }}
      >
        <StylistDayView
          key={selectedDate.toISOString()}
          stylists={processedStylists}
          appointments={appointments}
          services={allServices}
          selectedDate={selectedDate}
          onSelectTimeSlot={handleDayViewSelect}
          onAppointmentClick={handleAppointmentClick}
          onAddBreak={handleAddBreak}
          onDeleteBreak={handleDeleteBreak}
          onUpdateBreak={handleUpdateBreak}
          onDateChange={setSelectedDate}
        />
      </Box>

      {/* Right Side: Booking/Editing Drawer */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={showDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: showDrawer ? 10 : -1,
          position: 'absolute',
          right: 0,
          height: '100%',
          visibility: showDrawer ? 'visible' : 'hidden',
          pointerEvents: showDrawer ? 'auto' : 'none',
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            position: 'absolute',
            height: '100%',
            borderLeft: '1px solid',
            borderColor: 'divider',
            boxShadow: showDrawer ? '0px 0px 15px rgba(0, 0, 0, 0.1)' : 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </Typography>
          <Box>
            {editingAppointment && (
              <Tooltip title="Delete Appointment">
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                  sx={{ mr: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Form Content Area - Allow Scrolling */}
        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Time: {selectedSlot ? format(selectedSlot.start, 'PP p') : editingAppointment ? format(new Date(editingAppointment.start_time), 'PP p') : 'Select slot'}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="start-time-label">Start Time</InputLabel>
                <Select
                  labelId="start-time-label"
                  value={appointmentTime.startTime}
                  label="Start Time"
                  onChange={(e) => handleTimeChange(e, 'startTime')}
                >
                  {timeOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="end-time-label">End Time</InputLabel>
                <Select
                  labelId="end-time-label"
                  value={appointmentTime.endTime}
                  label="End Time"
                  onChange={(e) => handleTimeChange(e, 'endTime')}
                >
                  {timeOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {clientEntries.map((entry, index) => (
            <Paper key={entry.id} elevation={2} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">Client {index + 1}</Typography>
                {clientEntries.length > 1 && (
                  <Tooltip title="Remove Client">
                    <IconButton size="small" onClick={() => removeEntry(entry.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </Tooltip>
                )}
              </Box>

              <Autocomplete
                sx={{ mb: 2 }}
                options={allClients}
                getOptionLabel={(option) => typeof option === 'string' ? option : `${option.full_name}${option.phone ? ` (${option.phone})` : ''}`}
                value={entry.client}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    // Ensure phone is initialized as empty string for new client object literal
                    const currentPhone = entry.client?.phone || ''; 
                    const currentEmail = entry.client?.email || ''; // Also handle email
                    updateEntry(entry.id, { 
                      client: { 
                        // ...(entry.client || {}), // Avoid spreading potentially incompatible partial types
                        id: '', 
                        full_name: newValue, 
                        inputValue: newValue, 
                        phone: currentPhone, // Provide string default
                        email: currentEmail,  // Provide string default
                        // Ensure all other required fields from Client type have defaults if needed
                        created_at: '' // Example default if needed by Client type
                      } 
                    });
                  } else {
                    // newValue is a Client object or null
                    updateEntry(entry.id, { client: newValue ? { ...newValue } : null });
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filterClients(options, params);
                  if (params.inputValue !== '' && !options.some(option => option.full_name === params.inputValue)) {
                    filtered.push({
                      inputValue: params.inputValue,
                      full_name: `Add "${params.inputValue}"`,
                      id: '',
                      phone: ''
                    });
                  }
                  return filtered;
                }}
                renderInput={(params) => <TextField {...params} label="Select or Add Client" variant="outlined" />}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                freeSolo
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
              />

              {/* Phone and Email for New Client (only show if client exists and has no ID) */}
              {(entry.client && !entry.client.id) && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Phone (Required for New)"
                      fullWidth
                      required // Mark as required visually
                      value={entry.client.phone || ''}
                      onChange={(e) => updateEntry(entry.id, { client: { ...entry.client!, phone: e.target.value } })}
                    />
                 </Grid>
                  <Grid item xs={6}>
                     <TextField
                      label="Email (Optional)"
                       fullWidth
                      value={entry.client.email || ''}
                      onChange={(e) => updateEntry(entry.id, { client: { ...entry.client!, email: e.target.value } })}
                    />
                  </Grid>
                </Grid>
              )}

              <Autocomplete
                sx={{ mb: 2 }}
                multiple
                options={allServices || []}
                getOptionLabel={(option) => `${option.name} (${formatCurrency(option.price)})`}
                value={entry.services}
                onChange={(event, newValue) => updateEntry(entry.id, { services: newValue })}
                renderInput={(params) => <TextField {...params} label="Select Services" variant="outlined" />}
                renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              <Autocomplete
                sx={{ mb: 2 }}
                multiple
                options={(allStylists || []).map(st => ({ id: st.id, name: st.name }))}
                getOptionLabel={(option) => option.name}
                value={entry.stylists}
                onChange={(event, newValue) => updateEntry(entry.id, { stylists: newValue })}
                renderInput={(params) => <TextField {...params} label="Select Stylists" variant="outlined" />}
                renderTags={(value, getTagProps) => value.map((option, index) => <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              {/* Add per-client Create Bill button when editing an existing appointment */}
              {editingAppointment && entry.client && entry.services.length > 0 && entry.stylists.length > 0 && (
                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    disabled={isBilling}
                    onClick={() => {
                      setIsBilling(true);
                      const clientName = entry.client?.full_name || entry.client?.inputValue || '';
                      const stylistId = entry.stylists[0].id;
                      const servicesForPOS = entry.services.map(s => ({
                        id: s.id,
                        name: s.name,
                        price: s.price,
                        type: 'service'
                      }));

                      navigate('/pos', {
                        state: {
                          appointmentData: {
                            id: editingAppointment.id,
                            clientName,
                            stylistId,
                            services: servicesForPOS,
                            type: 'service_collection',
                            step: 2
                          }
                        }
                      });
                      handleCloseDrawer();
                    }}
                  >
                    Create Bill for Client {index + 1}
                  </Button>
                </Box>
              )}
            </Paper>
          ))}

          <Button startIcon={<AddIcon />} onClick={addBlankEntry} sx={{ mb: 3 }}>Add Another Client</Button>

          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            value={appointmentNotes}
            onChange={(e) => setAppointmentNotes(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />
        </Box>

        {/* Footer with action buttons */}
        <Box sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {editingAppointment && (() => {
            // Footer Create Bill: pass POS the exact shape it needs
            const primaryClientDetail = editingAppointment.clientDetails?.[0];
            if (!primaryClientDetail) return null;
            const servicesForPOS = primaryClientDetail.services.map(s => ({
              id: s.id,
              name: s.name,
              price: s.price,
              type: 'service'
            }));

            return (
              <Button
                variant="contained"
                color="success"
                startIcon={<ReceiptIcon />}
                fullWidth
                disabled={isBilling}
                onClick={() => {
                  setIsBilling(true);
                  const clientName = primaryClientDetail.full_name;
                  const stylistId = editingAppointment.stylist_id;
                  navigate('/pos', {
                    state: {
                      appointmentData: {
                        id: editingAppointment.id,
                        clientName,
                        stylistId,
                        services: servicesForPOS,
                        type: 'service_collection',
                        step: 2
                      }
                    }
                  });
                  handleCloseDrawer();
                }}
                sx={{ mb: 1 }}
              >
                Create Bill
              </Button>
            );
          })()}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseDrawer} variant="outlined">Cancel</Button>
            <Button onClick={handleSaveAppointment} variant="contained" color="primary">
              {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelid="delete-appointment-title"
        aria-describedby="delete-appointment-description"
      >
        <DialogTitle id="delete-appointment-title">Delete Appointment?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-appointment-description">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (editingAppointment) {
                await deleteAppointment(editingAppointment.id);
                setDeleteDialogOpen(false);
                handleCloseDrawer();
                toast.success('Appointment deleted successfully');
              }
            }}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 