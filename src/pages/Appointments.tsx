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
  Divider
} from '@mui/material'
import { useAppointments, Appointment, MergedAppointment } from '../hooks/useAppointments'
import { useStylists, Stylist, StylistBreak } from '../hooks/useStylists'
import { useServices, Service } from '../hooks/useServices'
import { useClients, Client } from '../hooks/useClients'
import { ServiceItem } from '../models/serviceTypes'
import { format, addDays, subDays } from 'date-fns'
import { useServiceCollections } from '../hooks/useServiceCollections';
import StylistDayView, { Break } from '../components/StylistDayView'
import { Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material'
import { formatCurrency } from '../utils/format'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { Product } from '../types'; // Revert to ../types
import { TimeGridViewWrapper } from '../components/TimeGridViewWrapper'; // Revert to ../components/

// Define Drawer width as a constant
const drawerWidth = 500; // Or use the width from formData if it needs to be dynamic

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

// Define Collection type (adjust based on your actual data)
interface ServiceCollection {
  id: string;
  name: string;
  service_ids: string[]; // Assuming services are linked this way
}

// Interface for a single client entry in the new state
interface ClientAppointmentEntry {
  id: string;
  client: Client | null;
  selectedCollectionId: string | null; // Added
  services: Service[];
  stylists: Pick<Stylist, 'id' | 'name'>[]; // Use Pick or full Stylist type
  products: Product[]; // Add product array
}

// Define filter for freeSolo client options
const filterClients = createFilterOptions<{ id: string; full_name: string; phone?: string; inputValue?: string }>()

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);

  // --- New State for Per-Client Entries ---
  const [clientEntries, setClientEntries] = useState<ClientAppointmentEntry[]>([
    { id: uuidv4(), client: null, selectedCollectionId: null, services: [], stylists: [], products: [] } // Updated initial state
  ]);
  // --- End New State ---

  // Remove old formData state related to clients/services/stylists
  // Keep time and notes if they are still global
  const [appointmentTime, setAppointmentTime] = useState({
    startTime: '',
    endTime: '',
  });
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Restore Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('error');

  // State for tracking the appointment being edited (if any)
  const [editingAppointment, setEditingAppointment] = useState<MergedAppointment | null>(null);

  const timeOptions = generateTimeOptions();

  const { appointments, isLoading: loadingAppointments, updateAppointment, createAppointment, deleteAppointment } = useAppointments()
  const { services: allServices, isLoading: loadingServices } = useServices()
  const { stylists: allStylists, isLoading: loadingStylists, updateStylist } = useStylists()
  const { clients: allClients, isLoading: loadingClients, updateClientFromAppointment } = useClients()
  const { serviceCollections, isLoading: loadingCollections } = useServiceCollections();

  // Remove old service collection/search state
  // const { serviceCollections } = useServiceCollections();
  // const [selectedServiceCollection, setSelectedServiceCollection] = useState<string>('');
  // const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');

  // Remove old useEffect for duration calculation

  // --- Helper Functions for Client Entries ---
  const addBlankEntry = () => {
    const newId = uuidv4();
    setClientEntries(prev => [...prev, {
      id: newId,
      client: null,
      selectedCollectionId: null,
      services: [],
      stylists: [],
      products: [], // Initialize products
    }]);
  };

  const removeEntry = (id: string) => {
    setClientEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, changes: Partial<ClientAppointmentEntry>) => {
    setClientEntries(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updatedEntry = { ...e, ...changes };
          // If collection is changed, reset services
          if (changes.selectedCollectionId !== undefined && changes.selectedCollectionId !== e.selectedCollectionId) {
             updatedEntry.services = [];
          }
          return updatedEntry;
        }
        return e;
      })
    );
  };
  // --- End Helper Functions ---

  // Restore convertStylists function
  const convertStylists = (stylists: Stylist[]): any[] => {
    return stylists.map(stylist => ({
      ...stylist,
      breaks: (stylist.breaks || []).map(breakItem => ({
        ...breakItem,
        // Ensure all required properties for Break type are present
        id: breakItem.id,
        startTime: breakItem.startTime,
        endTime: breakItem.endTime,
        reason: breakItem.reason || ''
      }))
    }));
  };

  const handleSelect = (selectInfo: DateSelectArg) => {
    console.log('Selected slot:', selectInfo);
    setSelectedSlot(selectInfo);
    setEditingAppointment(null); // Clear editing state when selecting a new slot
    // Reset stylist ID when selecting from calendar view
    // setSelectedStylistId(null); // Keep or remove based on desired interaction

    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);

    // Update global time state
    setAppointmentTime({
        startTime: `${startDate.getHours()}:${startDate.getMinutes() === 0 ? '00' : startDate.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${endDate.getHours()}:${endDate.getMinutes() === 0 ? '00' : endDate.getMinutes().toString().padStart(2, '0')}`,
    });

    // Reset client entries and notes for a new slot selection
    setClientEntries([{ id: uuidv4(), client: null, selectedCollectionId: null, services: [], stylists: [], products: [] }]);
    setAppointmentNotes('');
  };

  // Handler when clicking an existing appointment in the day view
  const handleAppointmentClick = (appointment: any) => { // Adjust type as needed, now includes nested data
    console.log('Clicked appointment:', appointment); // <--- ADDED CONSOLE LOG
    console.log('appointment.clientDetails:', appointment.clientDetails); // <--- ADDED CONSOLE LOG
    console.log("Clicked appointment RAW data:", appointment); // <--- ADDED CONSOLE LOG
    setEditingAppointment(appointment);
    setSelectedSlot(null); // Clear any selected new slot

    // **MODIFIED:** Prefill client entries using the structured `clientDetails`
    const clientEntriesToSet = (appointment.clientDetails || []).map((clientDetail: any) => { 
      // Log the structure of each clientDetail entry
      console.log("Processing clientDetail entry:", clientDetail);
      
      // The clientDetail structure is assumed to be: { id, full_name, phone, services: [...], stylists: [...] }
      // We need to adapt it to the ClientAppointmentEntry structure
      return {
          id: uuidv4(), // Generate a new UUID for the UI state entry
          // The base client info (id, full_name, phone) is directly on clientDetail
          client: { 
            id: clientDetail.id, 
            full_name: clientDetail.full_name, 
            phone: clientDetail.phone,
            // Add other client fields if they exist on clientDetail and are needed by Client type
            email: clientDetail.email || '',
            created_at: clientDetail.created_at || '' 
          },
          // Derive selectedCollectionId from the first service if available
          selectedCollectionId: clientDetail.services?.[0]?.collection_id || null, 
          // Services and Stylists are nested arrays within clientDetail
          services: clientDetail.services || [], 
          stylists: clientDetail.stylists || [], 
          products: clientDetail.products || [], // Add products
      };
    });

    console.log("Generated clientEntriesToSet:", clientEntriesToSet); // <--- ADDED CONSOLE LOG

    // Handle case where clientDetails might be missing or empty
    if (clientEntriesToSet.length === 0) {
      console.warn("Appointment data missing nested client details (clientDetails array empty or missing). Check fetched data.");
      // You might want a fallback here, but it indicates a data fetching issue
      // Clear existing entries or show an error
      setClientEntries([{ id: uuidv4(), client: null, selectedCollectionId: null, services: [], stylists: [], products: [] }]);
    } else {
      setClientEntries(clientEntriesToSet);
    }

    // Prefill times
    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    setAppointmentTime({
      startTime: `${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2, '0')}`,
      endTime: `${endDate.getHours()}:${String(endDate.getMinutes()).padStart(2, '0')}`
    });
    setAppointmentNotes(appointment.notes || '');
  };

  const handleDayViewSelect = (stylistId: string, time: Date) => {
    setEditingAppointment(null); // Clear editing state
    // This interaction might need rethinking. Does selecting a slot on a specific
    // stylist's column pre-fill that stylist for ALL client entries, or just the first?
    // For simplicity, let's just open the drawer with the time pre-filled.
    const selectInfo = {
      start: time,
      end: new Date(time.getTime() + 30 * 60000), // Default 30 min
      allDay: false,
    } as DateSelectArg;

    setSelectedSlot(selectInfo);
    // Maybe pre-fill the time
    setAppointmentTime({
        startTime: `${time.getHours()}:${time.getMinutes() === 0 ? '00' : time.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${new Date(time.getTime() + 30 * 60000).getHours()}:${new Date(time.getTime() + 30 * 60000).getMinutes() === 0 ? '00' : new Date(time.getTime() + 30 * 60000).getMinutes().toString().padStart(2, '0')}`,
    });
    // Reset entries and notes
    setClientEntries([{ id: uuidv4(), client: null, selectedCollectionId: null, services: [], stylists: [], products: [] }]);
    setAppointmentNotes('');
  };

  const handleTimeChange = (event: SelectChangeEvent, field: 'startTime' | 'endTime') => {
    setAppointmentTime(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
  };

  // Remove old add/remove service handlers

  // --- Booking Submit Logic (Needs Adaptation) ---
  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      setSnackbarMessage('Please select a time slot on the calendar.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // --- NEW: Check for duplicate client IDs --- 
    const clientIdsInEntries = clientEntries
      .map(entry => entry.client?.id)
      .filter(id => id); // Filter out null/undefined/empty string IDs (for new clients)
    const uniqueClientIds = new Set(clientIdsInEntries);
    if (clientIdsInEntries.length !== uniqueClientIds.size) {
       setSnackbarMessage('The same client cannot be selected more than once in a single appointment.');
       setSnackbarSeverity('error');
       setSnackbarOpen(true);
       return; // Stop submission
    }
    // --- END Duplicate Check ---

    // --- Start Validation ---
    // Ensure at least one client section exists:
    if (clientEntries.length === 0) {
      setSnackbarMessage('Please add at least one client section.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // PRE-CHECK: Validate all client names thoroughly before proceeding
    for (const entry of clientEntries) {
      if (!entry.client) {
        console.error('Pre-check: Client object is missing');
        setSnackbarMessage('A client entry is missing client information. Please check all entries.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      if (typeof entry.client.full_name !== 'string') {
        console.error(`Pre-check: Client name is not a string: ${typeof entry.client.full_name}`);
        setSnackbarMessage('A client name is invalid. Please check all client names.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      const trimmedName = entry.client.full_name.trim();
      if (!trimmedName) {
        console.error('Pre-check: Client name is empty after trimming');
        setSnackbarMessage('A client name is empty. Please provide valid names for all clients.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Update the entry with the trimmed name to ensure consistency
      entry.client.full_name = trimmedName;
    }

    // Validate each client entry more explicitly (allow new entries with full_name)
    let isValid = true;
    clientEntries.forEach((entry, idx) => {
      // Require either existing client id or free-solo full_name
      if (!entry.client || !entry.client.full_name || entry.client.full_name.trim() === '') {
        console.error(`Validation Error: Client name missing or empty for entry ${idx + 1}`);
        isValid = false;
      }
      // Check if it's a new client and requires phone
      if (entry.client && !entry.client.id && !entry.client.phone) {
          console.error(`Validation Error: Phone number missing for new client in entry ${idx + 1}`);
          isValid = false;
      }
      if (!entry.selectedCollectionId) {
        console.error(`Validation Error: Collection not selected for entry ${idx + 1}`);
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

    if (!isValid) {
      setSnackbarMessage('Please ensure every client entry has a client (with phone if new), collection, service(s), and stylist(s) selected.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    // --- End Client Entry Validation ---

    // Validate time
    const [startHour, startMinute] = appointmentTime.startTime.split(':').map(Number);
    const [endHour, endMinute] = appointmentTime.endTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute) || !appointmentTime.startTime || !appointmentTime.endTime) {
        setSnackbarMessage('Please select valid start and end times.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    const startTime = new Date(selectedSlot.start);
    startTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(selectedSlot.start); // Use start date as base
    endTime.setHours(endHour, endMinute, 0, 0);

    // Handle overnight case simply
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Double check after potential day change
    if (endTime <= startTime) {
      setSnackbarMessage('End time must be after start time.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    // --- End Time Validation ---

    try {
      // Create any new clients first
      const processedClientDetails = await Promise.all(
        clientEntries.map(async (entry, idx) => {
          let finalClientId = entry.client?.id || '';
          // Failsafe: do not proceed if client or full_name is missing
          if (!entry.client || !entry.client.full_name || entry.client.full_name.trim() === '') {
            throw new Error(`Client entry ${idx + 1} is missing a name or has an empty name. This should have been caught by validation.`);
          }
          if (!finalClientId) {
            // Client doesn't exist, create it
            try {
              // Ensure client name is trimmed to prevent whitespace issues
              const clientName = entry.client.full_name.trim();
              console.log(`Attempting to create client with name: '${clientName}', phone: '${entry.client.phone || ''}'`);
              
              if (clientName === '') {
                throw new Error(`Cannot create client with empty name for entry ${idx + 1}`);
              }
              
              // Additional validation to ensure clientName is defined and a non-empty string
              if (typeof clientName !== 'string' || clientName === undefined || clientName === null) {
                throw new Error(`Client name for entry ${idx + 1} must be a valid string, received: ${typeof clientName}`);
              }
              
              const newClient = await updateClientFromAppointment(
                clientName,
                entry.client.phone || '', // Pass phone with empty string fallback
                entry.client.email || '',  // Add email if available
                '' // No notes for now
              );
              finalClientId = newClient.id;
            } catch (clientError) {
              console.error("Error creating new client:", clientError);
              // Throw with more details to help debugging
              throw new Error(`Failed to create client for entry ${idx + 1}: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
            }
          }
          // Return details needed for the main appointment booking
          return {
            clientId: finalClientId,
            serviceIds: entry.services.map(s => s.id),
            stylistIds: entry.stylists.map(st => st.id),
          };
        })
      );

      // Ensure all clients were processed successfully
      if (processedClientDetails.some(d => !d.clientId)) {
        throw new Error("Could not resolve client ID for one or more entries.");
      }

      // ***************************************************************
      
      // Get the primary client details for the first entry
      const primaryClient = clientEntries[0].client;
      if (!primaryClient || !primaryClient.full_name) {
        throw new Error("Primary client is missing or has no name");
      }
      
      // **MODIFIED:** Prepare data including the structured client details
      const createData = {
        // clientIds: processedClientDetails.map(d => d.clientId), // Keep if needed for direct appointment links, but structure below is key
        // client_name: primaryClient.full_name.trim(), // Keep if legacy needed
        // serviceIds: Array.from(new Set(processedClientDetails.flatMap(d => d.serviceIds))), // Keep if legacy needed
        // stylistIds: Array.from(new Set(processedClientDetails.flatMap(d => d.stylistIds))), // Keep if legacy needed
        
        // Main appointment details
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: appointmentNotes,
        status: 'scheduled' as Appointment['status'], // Default status
        // Add any other direct appointment fields needed (e.g., maybe primary stylist/service if required by table)
        stylist_id: processedClientDetails[0].stylistIds[0], // Example: If appointments table needs a primary stylist
        service_id: processedClientDetails[0].serviceIds[0], // Example: If appointments table needs a primary service
        client_id: processedClientDetails[0].clientId,      // Example: If appointments table needs a primary client

        // **NEW:** Pass the detailed structure for join table creation
        clientDetails: processedClientDetails 
      };

      console.log("Data being sent to createAppointment:", createData);

      // Call the hook
      await createAppointment(createData); // Pass the modified createData object

      // Reset state after successful booking
      setSelectedSlot(null);
      setClientEntries([{ id: uuidv4(), client: null, selectedCollectionId: null, services: [], stylists: [], products: [] }]);
      setAppointmentTime({ startTime: '', endTime: '' });
      setAppointmentNotes('');
      handleCloseDrawer(); // Close the drawer on success

    } catch (error) {
      console.error('Failed to book appointment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSnackbarMessage(`Booking failed: ${errorMsg}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };


  // Restore Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // updateStylist and handleAddBreak likely remain the same
  // Update the handleAddBreak function
  const handleAddBreak = async (stylistId: string, breakData: Omit<Break, 'id'>) => {
      try {
        // Find the stylist to update
        const stylist = allStylists?.find(s => s.id === stylistId);
        if (!stylist) {
          throw new Error('Stylist not found');
        }

        // Create the new break with a unique ID
        const newBreak: StylistBreak = {
          id: uuidv4(),
          startTime: breakData.startTime,
          endTime: breakData.endTime,
          reason: breakData.reason,
        };

        // Update the stylist's breaks array
        const updatedBreaks = [...(stylist.breaks || []), newBreak];
        const updatedStylist = { ...stylist, breaks: updatedBreaks };

        // Call the hook to update the stylist in the backend
        await updateStylist(updatedStylist);

        toast.success('Break added successfully');
      } catch (error) {
        console.error('Failed to add break:', error);
        toast.error(`Failed to add break: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    // Convert stylists to the expected format for StylistDayView
    // const convertStylists = (stylists: Stylist[]): any[] => { // This line was moved/restored above
    //   return stylists.map(stylist => ({
    //     ...stylist,
    //     breaks: (stylist.breaks || []).map(breakItem => ({
    //       ...breakItem,
    //       // Ensure all required properties for Break type are present
    //       id: breakItem.id,
    //       startTime: breakItem.startTime,
    //       endTime: breakItem.endTime,
    //       reason: breakItem.reason || ''
    //     }))
    //   }));
    // };
   // ... (convertStylists) ...

  const handleCloseDrawer = () => {
    setSelectedSlot(null);
    setEditingAppointment(null);
    // Reset state when closing manually
    setClientEntries([{ id: uuidv4(), client: null, selectedCollectionId: null, services: [], stylists: [], products: [] }]);
    setAppointmentTime({ startTime: '', endTime: '' });
    setAppointmentNotes('');
  };

  // Determine whether drawer is open for create or edit
  const drawerOpen = Boolean(selectedSlot) || Boolean(editingAppointment);

  // Type guard for ClientAppointmentEntry
  function isClientEntry(e: any): e is ClientAppointmentEntry {
    return 'client' in e;
  }

  if (loadingAppointments || loadingServices || loadingStylists || loadingClients || loadingCollections) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'row' }}>
      {/* Wrap StylistDayView in a Box for styling and transition */}
      <Box
        component="main" // Use main semantic element
        sx={theme => ({
          flexGrow: 1,
          overflow: 'auto',
          padding: 2,
          transition: theme.transitions.create(['margin', 'width'], { // Transition both margin and width
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && { // Apply transition adjustments when drawer is open
            marginRight: `${drawerWidth}px`, // Shift content left
            width: `calc(100% - ${drawerWidth}px)`, // Reduce width
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          })
        })}
      >
        <StylistDayView
          stylists={convertStylists(allStylists || [])}
          appointments={appointments || []}
          services={allServices || []}
          selectedDate={selectedDate}
          onSelectTimeSlot={handleDayViewSelect}
          onAppointmentClick={handleAppointmentClick} // Pass the handler
          onUpdateAppointment={async (appointmentId, updates) => {
            try {
              // Ensure stylist_ids is correctly formatted if present in updates
              if (updates.stylist_ids && !Array.isArray(updates.stylist_ids)) {
                  updates.stylist_ids = [updates.stylist_ids];
              }
              await updateAppointment({
                id: appointmentId,
                ...updates
              });
              toast.success('Appointment updated successfully');
            } catch (error) {
              console.error('Failed to update appointment:', error);
              toast.error(`Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          onDeleteAppointment={async (appointmentId) => {
            try {
              await deleteAppointment(appointmentId);
              toast.success('Appointment deleted successfully');
            } catch (error) {
              console.error('Failed to delete appointment:', error);
              toast.error(`Failed to delete appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          onAddBreak={handleAddBreak}
          onDateChange={(date) => {
            setSelectedDate(date);
          }}
        />
      </Box>

      {/* Booking/Edit Drawer - Content heavily modified */}
      <Drawer anchor="right" variant="persistent" open={drawerOpen} onClose={handleCloseDrawer}
              PaperProps={{ sx: { width: drawerWidth, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' } }}>

        {/* Header */}
        <Box sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">{editingAppointment ? 'Edit Appointment' : 'Book Appointment'}</Typography>
          <IconButton onClick={handleCloseDrawer}><CloseIcon /></IconButton>
        </Box>

        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>

          {/* --- Appointment Summary (Sticky & Always Visible) --- */}
          {(clientEntries.length > 0 || (editingAppointment && editingAppointment.clientDetails && editingAppointment.clientDetails.length > 0)) && (
            <Paper
              elevation={2}
              sx={{
                mb: 3,
                p: 2.5,
                borderColor: 'divider',
                borderRadius: 2,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: '#FFFFFF'
              }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Appointment Summary
              </Typography>
              {(clientEntries.length > 0 ? clientEntries : (editingAppointment?.clientDetails || [])).map((entry, index) => {
                const clientName = isClientEntry(entry)
                  ? entry.client?.full_name || 'Unknown'
                  : entry.full_name || 'Unknown';
                const clientPhone = isClientEntry(entry)
                  ? entry.client?.phone
                  : entry.phone;
                const services = entry.services?.map?.(s => s.name).join(', ') || 'N/A';
                const stylists = entry.stylists?.map?.(s => s.name).join(', ') || 'N/A';
                const total = clientEntries.length > 0 ? clientEntries.length : (editingAppointment?.clientDetails?.length || 0);
                return (
                  <Box key={isClientEntry(entry) ? entry.id : entry.id || index} sx={{ mb: index < total - 1 ? 2 : 0, pb: index < total - 1 ? 2 : 0, borderBottom: index < total - 1 ? '1px dashed' : 'none', borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight="500">
                      Client: {clientName}{clientPhone ? ` (${clientPhone})` : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2, mt: 0.5 }}>
                      Services: {services}
                    </Typography>
                    <Typography variant="body2" sx={{ pl: 2, mt: 0.5 }}>
                      Stylists: {stylists}
                    </Typography>
                  </Box>
                );
              })}
            </Paper>
          )}
          {/* --- END Appointment Summary --- */}

          {/* --- Render Dynamic Client Sections --- */}
          {clientEntries.map((entry, idx) => (
            <Paper key={entry.id} elevation={2} sx={{ mb: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" component="div" fontWeight="medium">Client {idx + 1}</Typography>
                {clientEntries.length > 1 && (
                  <Tooltip title="Remove Client Entry">
                     <IconButton
                        onClick={() => removeEntry(entry.id)}
                        size="small"
                        color="error"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                     >
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Grid container spacing={2}> {/* Reduced spacing slightly */}
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
                      value={entry.client} // This should hold the selected Client object or null
                      onChange={(_, newValue) => {
                        if (typeof newValue === 'string') {
                          // Handle case where user types and hits Enter without selecting "Add..."
                          // Check if it matches an existing client first
                          const trimmedValue = newValue.trim();
                          console.log(`Autocomplete string input: '${trimmedValue}'`);
                          
                          if (!trimmedValue) {
                            // Don't allow empty strings
                            console.warn('Preventing empty client name from being set');
                            return;
                          }
                          
                          const existing = allClients?.find(c => c.full_name.toLowerCase() === trimmedValue.toLowerCase());
                          if (existing) {
                             updateEntry(entry.id, { client: existing });
                          } else {
                             // Treat as new client intent
                             updateEntry(entry.id, { client: { id: '', full_name: trimmedValue, phone: '', email: '', created_at: '' } });
                          }
                        } else if (newValue && (newValue as any).inputValue) {
                           // User selected the "Add..." option
                           const trimmedName = newValue.full_name.trim();
                           console.log(`Autocomplete "Add" option selected: '${trimmedName}'`);
                           
                           if (!trimmedName) {
                             console.warn('Preventing empty client name from being set via Add option');
                             return;
                           }
                           
                           updateEntry(entry.id, { client: { id: '', full_name: trimmedName, phone: '', email: '', created_at: '' } });
                        } else {
                           // User selected a regular client from the list
                           console.log(`Autocomplete existing client selected:`, newValue);
                           updateEntry(entry.id, { client: newValue as Client | null });
                        }
                        
                        // Check what was set after the update
                        setTimeout(() => {
                          const currentEntry = clientEntries.find(e => e.id === entry.id);
                          console.log(`Client after update for entry ${entry.id}:`, currentEntry?.client);
                        }, 0);
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value?.id} // Ensure value is not null
                      renderOption={(props, option) => {
                        // Distinguish between regular options and the "Add..." option
                        if ((option as any).inputValue) {
                            return <li {...props} key={(option as any).inputValue}>{ (option as any).inputValue }</li>;
                        }
                        return <li {...props} key={option.id}>{`${option.full_name}${option.phone ? ` (${option.phone})` : ''}`}</li>;
                      }}
                      renderInput={params =>
                        <TextField {...params}
                           label="Client *"
                           required
                           error={!entry.client || !entry.client.full_name}
                           helperText={!entry.client || !entry.client.full_name ? "Client name required" : ""}
                           InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
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

                 {/* Mobile field for new client */}
                 {entry.client && !entry.client.id && (
                   <Grid item xs={12}>
                     <TextField
                       label="Mobile Number *"
                       value={entry.client.phone || ''}
                       onChange={e => {
                         updateEntry(entry.id, { client: { ...entry.client!, phone: e.target.value } })
                       }}
                       fullWidth
                       size="small"
                       required // Make required for new clients
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
                      onChange={(_, collection) => {
                        updateEntry(entry.id, { selectedCollectionId: collection?.id || null });
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      renderOption={(props, option) => ( // Simpler renderOption
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
                                {loadingCollections ? <CircularProgress color="inherit" size={20} /> : null}
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

                 {/* 2b. Services multi-select (modified) */}
                 <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={allServices?.filter(s => (s as any).collection_id === entry.selectedCollectionId) || []} // Adjust property if needed
                      getOptionLabel={s => `${s.name} (${s.duration} min)`}
                      value={entry.services}
                      onChange={(_, services) => updateEntry(entry.id, { services })}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      disabled={!entry.selectedCollectionId}
                      renderOption={(props, option) => ( // Simpler renderOption
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
                            error={!!entry.selectedCollectionId && entry.services.length === 0} // Error if collection selected but no services
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
                                  {loadingServices && entry.selectedCollectionId ? <CircularProgress color="inherit" size={20} /> : null}
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
                      multiple
                      options={allStylists || []}
                      getOptionLabel={st => st.name}
                      value={entry.stylists} // Should store array of Stylist objects {id, name}
                      onChange={(_, stylists) => updateEntry(entry.id, { stylists: stylists.map(st => ({ id: st.id, name: st.name })) })} // Store only id and name
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderOption={(props, option) => ( // Simpler renderOption
                        <li {...props} key={option.id}>
                          {option.name}
                        </li>
                       )}
                      renderTags={(value, getTagProps) =>
                        value.map((st, i) =>
                           <Chip {...getTagProps({ index: i })} key={st.id} label={st.name} size="small" variant="outlined" />
                        )
                      }
                      renderInput={params =>
                         <TextField {...params}
                            label="Stylist(s) *"
                            required
                            error={entry.stylists.length === 0}
                            helperText={entry.stylists.length === 0 ? "Select at least one stylist" : ""}
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
          ))}

          <Button
             variant="outlined"
             onClick={addBlankEntry}
             startIcon={<AddIcon />}
             fullWidth
             sx={{ mb: 3, mt: 1, py: 1.5, borderColor: 'primary.light', color: 'primary.main', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }} // Styling
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
                  value={appointmentTime.startTime}
                  onChange={(e) => handleTimeChange(e, 'startTime')}
                  label="Start Time"
                  error={!appointmentTime.startTime}
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={`start-${option.value}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                 {!appointmentTime.startTime && <Typography variant="caption" color="error" sx={{mt: 0.5}}>Start time required</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required size="small">
                <InputLabel>End Time</InputLabel>
                <Select
                  value={appointmentTime.endTime}
                  onChange={(e) => handleTimeChange(e, 'endTime')}
                  label="End Time"
                  error={!appointmentTime.endTime}
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={`end-${option.value}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                 {!appointmentTime.endTime && <Typography variant="caption" color="error" sx={{mt: 0.5}}>End time required</Typography>}
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Step 5: Notes & Book (Now Global) */}
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">Notes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Appointment Notes (Optional)"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
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
          <Button onClick={handleCloseDrawer} variant="outlined">Cancel</Button>
          {editingAppointment ? (
            <Button onClick={async () => {
                // --- Start Edit Validation ---
                let editIsValid = true;
                 clientEntries.forEach((entry, idx) => {
                    // Update validation to allow new clients (no ID but with name)
                    if (!entry.client || !entry.client.full_name || entry.client.full_name.trim() === '') {
                      console.error(`Validation Error (Edit): Client missing or has empty name for entry ${idx + 1}`);
                      editIsValid = false;
                    }
                    // Check if it's a new client and requires phone
                    if (entry.client && !entry.client.id && !entry.client.phone) {
                      console.error(`Validation Error (Edit): Phone number missing for new client in entry ${idx + 1}`);
                      editIsValid = false;
                    }
                    if (!entry.selectedCollectionId) {
                      console.error(`Validation Error (Edit): Collection not selected for entry ${idx + 1}`);
                      editIsValid = false;
                    }
                    if (entry.services.length === 0) {
                      console.error(`Validation Error (Edit): No services selected for entry ${idx + 1}`);
                      editIsValid = false;
                    }
                    if (entry.stylists.length === 0) {
                      console.error(`Validation Error (Edit): No stylists selected for entry ${idx + 1}`);
                      editIsValid = false;
                    }
                 });

                if (!appointmentTime.startTime || !appointmentTime.endTime) {
                   console.error("Validation Error (Edit): Start or End time missing.");
                   editIsValid = false;
                }

                 if (!editIsValid) {
                    setSnackbarMessage('Validation failed. Ensure all fields are filled correctly for editing.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    return;
                 }
                // --- End Edit Validation ---

                // Construct ISO times from appointmentTime state
                const [startHour, startMinute] = appointmentTime.startTime.split(':').map(Number);
                const [endHour, endMinute] = appointmentTime.endTime.split(':').map(Number);

                // Base the date part on the original appointment's start time to keep it on the same day
                const baseDate = new Date(editingAppointment.start_time);
                const start = new Date(baseDate);
                start.setHours(startHour, startMinute, 0, 0);
                const end = new Date(baseDate);
                end.setHours(endHour, endMinute, 0, 0);

                // Handle potential overnight case for end time during edit
                 if (end <= start) {
                   end.setDate(end.getDate() + 1);
                 }

                try {
                  // Create any new clients first, same as in booking flow
                  const processedClientDetails = await Promise.all(
                    clientEntries.map(async (entry, idx) => {
                      let finalClientId = entry.client?.id || '';
                      // Create new clients if needed
                      if (!finalClientId) {
                        try {
                          // Ensure client name is trimmed to prevent whitespace issues
                          const clientName = entry.client!.full_name.trim();
                          console.log(`Attempting to create client with name: '${clientName}', phone: '${entry.client!.phone || ''}'`);
                          
                          if (clientName === '') {
                            throw new Error(`Cannot create client with empty name for entry ${idx + 1}`);
                          }
                          
                          // Additional validation to ensure clientName is defined and a non-empty string
                          if (typeof clientName !== 'string' || clientName === undefined || clientName === null) {
                            throw new Error(`Client name for entry ${idx + 1} must be a valid string, received: ${typeof clientName}`);
                          }
                          
                          const newClient = await updateClientFromAppointment(
                            clientName,
                            entry.client!.phone || '', // Pass phone with empty string fallback
                            entry.client!.email || '',  // Add email if available
                            '' // No notes for now
                          );
                          finalClientId = newClient.id;
                        } catch (clientError) {
                          console.error("Error creating new client:", clientError);
                          // Throw with more details to help debugging
                          throw new Error(`Failed to create client for entry ${idx + 1}: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
                        }
                      }
                      // Return details needed for the appointment update
                      return {
                        clientId: finalClientId,
                        serviceIds: entry.services.map(s => s.id),
                        stylistIds: entry.stylists.map(st => st.id),
                      };
                    })
                  );

                  // Ensure all clients were processed successfully
                  if (processedClientDetails.some(d => !d.clientId)) {
                    throw new Error("Could not resolve client ID for one or more entries.");
                  }

                  // **MODIFIED:** Now construct update data including the structured clientDetails
                  const updateData = {
                     id: editingAppointment.id,
                     // Base appointment fields being updated
                     start_time: start.toISOString(),
                     end_time: end.toISOString(),
                     notes: appointmentNotes,
                     status: editingAppointment.status, // Keep original status unless changed explicitly
                     // Include primary keys if they exist on the base appointment table and are needed by the hook
                     client_id: processedClientDetails[0].clientId,      
                     stylist_id: processedClientDetails[0].stylistIds[0], 
                     service_id: processedClientDetails[0].serviceIds[0], 

                     // Pass the detailed structure for updating join tables
                     clientDetails: processedClientDetails
                       .map(detail => {
                         const entry = clientEntries.find(e => e.client?.id === detail.clientId);
                         const clientInfo = entry?.client;
                         
                         if (!clientInfo || !clientInfo.full_name) {
                           console.warn(`Skipping client detail for ID ${detail.clientId} due to missing info in update.`);
                           return null; // Return null for invalid entries
                         }
                         
                         // Construct the valid client detail object
                         return {
                           id: detail.clientId,
                           full_name: clientInfo.full_name, // Guaranteed non-nullable
                           phone: clientInfo.phone || '',
                           email: clientInfo.email || '',
                           created_at: clientInfo.created_at || '',
                           services: entry?.services || [],
                           stylists: entry?.stylists || [],
                           selectedCollectionId: entry?.selectedCollectionId || null,
                         };
                       })
                       // Filter out the null entries returned for invalid data
                       .filter((detail): detail is Exclude<typeof detail, null> => detail !== null),
                       
                     // Include other fields your update hook might need explicitly
                  };

                  console.log("Data being sent to updateAppointment:", updateData);
                  await updateAppointment(updateData); // Pass the structured updateData
                  setEditingAppointment(null); // Clear editing state on success
                  handleCloseDrawer(); // Close drawer on success
                } catch (error) {
                   console.error("Update failed from component:", error);
                   const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                   setSnackbarMessage(`Update failed: ${errorMsg}`);
                   setSnackbarSeverity('error');
                   setSnackbarOpen(true);
                }
              }} variant="contained" color="primary">
                Update Appointment
              </Button>
          ) : (
            <Button onClick={handleBookingSubmit} variant="contained" color="primary">
              Book Appointment
            </Button>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
} 