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
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import { useAppointments, Appointment, MergedAppointment } from '../hooks/useAppointments'
import { useStylists, Stylist, StylistBreak } from '../hooks/useStylists'
import { useServices, Service as BaseService } from '../hooks/useServices'
import { useClients, Client } from '../hooks/useClients'
import { format, addDays, subDays } from 'date-fns'
import { useServiceCollections } from '../hooks/useServiceCollections';
import StylistDayView, { Break } from '../components/StylistDayView'
import FutureAppointmentsList from '../components/FutureAppointmentsList'
import { Search as SearchIcon, Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon, Receipt as ReceiptIcon, CalendarMonth as CalendarIcon, ViewList as ListIcon } from '@mui/icons-material'
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
import { useCallback } from 'react'

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
interface ServiceEntry {
  id: string;
  name: string;
  price: number;
  stylistId: string;
  stylistName: string;
  fromTime: string; 
  toTime: string;
}

interface ClientAppointmentEntry {
  id: string;
  client: (Client & { inputValue?: string }) | null;
  services: ServiceEntry[];
  stylists: Pick<Stylist, 'id' | 'name'>[];
}

// Define filter for freeSolo client options
const filterClients = createFilterOptions<{ id: string; full_name: string; phone?: string; email?: string; created_at?: string; inputValue?: string }>();

// Extend the Service interface to include gender property
interface ServiceWithGender extends BaseService {
  gender?: 'male' | 'female' | null;
}

// Clean up service types
interface ExtendedClientAppointmentEntry extends Omit<ClientAppointmentEntry, 'services'> {
  services: ServiceEntry[];
}

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [clientEntries, setClientEntries] = useState<ExtendedClientAppointmentEntry[]>([{ 
    id: uuidv4(), 
    client: null, 
    services: [], 
    stylists: [] 
  }]);
  const [appointmentTime, setAppointmentTime] = useState({ startTime: '', endTime: '' });
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'warning' | 'info' | 'success'>('error');
  const [editingAppointment, setEditingAppointment] = useState<MergedAppointment | null>(null);
  const [isBilling, setIsBilling] = useState(false); // Kept for potential future use with button disabling
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // Add state for view mode
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [serviceGenderFilter, setServiceGenderFilter] = useState<'male' | 'female' | null>('male');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  // Add state for service dialog
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [serviceSelectedMessage, setServiceSelectedMessage] = useState<string>('');
  // Add client history state and function
  const [showingClientHistory, setShowingClientHistory] = useState(false);
  const [clientHistory, setClientHistory] = useState<MergedAppointment[]>([]);

  // Timesoptions initialization
  const timeOptions = generateTimeOptions();
  const navigate = useNavigate();

  // Hook calls
  const { appointments = [], isLoading: loadingAppointments, updateAppointment, createAppointment, deleteAppointment } = useAppointments();
  const { services: allServices = [], isLoading: loadingServices } = useServices();
  const { stylists: allStylists = [], isLoading: loadingStylists, updateStylist } = useStylists();
  const { clients: allClients = [], isLoading: loadingClients, updateClientFromAppointment } = useClients();
  const { serviceCollections = [], isLoading: loadingCollections } = useServiceCollections();

  // Frontend filtering of services to use
  const activeServices = useMemo(() => {
    return (allServices || []).filter(service => service.active !== false);
  }, [allServices]);

  // --- Moved Helper Function BEFORE its use in useMemo ---
  const convertStylists = (stylists: Stylist[]): any[] => {
    // Filter out stylists where available is false
    return stylists
      .filter(stylist => stylist.available !== false) // Only include available stylists
      .map(stylist => ({
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
    setClientEntries(prev => [...prev, {
      id: uuidv4(),
      client: null,
      services: [],
      stylists: []
    }]);
  };

  const removeEntry = (id: string) => {
    setClientEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<ExtendedClientAppointmentEntry>) => {
    setClientEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        // Handle conversion from Service[] to ServiceEntry[] if needed
        if (updates.services && Array.isArray(updates.services)) {
          const services = updates.services as unknown as (ServiceWithGender[] | ServiceEntry[]);
          // Check if the first item is a Service by seeing if it lacks ServiceEntry properties
          if (services.length > 0 && !('stylistId' in services[0]) && !('fromTime' in services[0])) {
            // Convert Service objects to ServiceEntry objects
            const convertedServices: ServiceEntry[] = (services as ServiceWithGender[]).map(service => ({
              id: service.id,
              name: service.name,
              price: service.price || 0,
              stylistId: '',
              stylistName: '',
              fromTime: appointmentTime.startTime || '10:00',
              toTime: appointmentTime.endTime || '11:00'
            }));
            return { ...entry, ...updates, services: convertedServices };
          }
        }
        return { ...entry, ...updates };
      }
      return entry;
    }));
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

    const clientEntriesToSet = (appointment.clientDetails || []).map((clientDetail): ExtendedClientAppointmentEntry | null => {
      const client: Client | null = (allClients || []).find(c => c.id === clientDetail.id) || null;
      if (!client) {
        console.warn(`Client data not found locally for ID: ${clientDetail.id}`);
        // Optionally fetch if missing, or handle gracefully
        // return null;
      }

      // Convert Service array to ServiceEntry array
      const serviceEntries: ServiceEntry[] = (clientDetail.services || []).map(service => {
        // Create a date object for start and end times
        const startDate = new Date(appointment.start_time);
        const endDate = new Date(appointment.end_time);
        
        // Format times in HH:MM format
        const startHour = startDate.getHours();
        const startMinute = startDate.getMinutes();
        const endHour = endDate.getHours();
        const endMinute = endDate.getMinutes();
        
        const fromTime = `${startHour}:${startMinute.toString().padStart(2, '0')}`;
        const toTime = `${endHour}:${endMinute.toString().padStart(2, '0')}`;
        
        // Find the stylist for this service
        const stylist = allStylists.find(s => s.id === appointment.stylist_id) || { id: '', name: 'Unknown' };

        // Return a properly formatted ServiceEntry
        return {
          id: service.id,
          name: service.name,
          price: service.price || 0,
          stylistId: stylist.id,
          stylistName: stylist.name,
          fromTime,
          toTime
        };
      });

      return {
        id: uuidv4(),
        client: client ? { ...client } : null, // Ensure client exists before spreading
        services: serviceEntries,
        stylists: clientDetail.stylists || [], 
      };
    }).filter((entry): entry is ExtendedClientAppointmentEntry => entry !== null);

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

  // Fix addServiceToEntry function to properly assign service and calculate times
  const addServiceToEntry = (entryId: string, service: BaseService) => {
    // Find the entry
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;

    // Calculate default from/to times
    const lastService = entry.services[entry.services.length - 1];
    
    // Default times if no previous service exists
    let fromTime = appointmentTime.startTime || '10:00';
    
    // If appointment time is set, use that
    if (appointmentTime.startTime) {
      fromTime = appointmentTime.startTime;
    }
    
    // Get current time if neither is set
    if (!appointmentTime.startTime && !lastService) {
      const now = new Date();
      const hour = now.getHours();
      const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
      fromTime = `${hour}:${roundedMinutes === 60 ? '00' : roundedMinutes.toString().padStart(2, '0')}`;
    }
    
    if (lastService) {
      // If there's a previous service, set start time as the end time of the last service
      fromTime = lastService.toTime;
    }
    
    // Calculate the end time by adding the service duration to the start time
    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const serviceDuration = service.duration || 60; // Default to 60 minutes if not specified
    
    // Calculate new end time in minutes
    let totalMinutes = (fromHour * 60) + fromMinute + serviceDuration;
    const toHour = Math.floor(totalMinutes / 60);
    const toMinute = totalMinutes % 60;
    
    // Format end time
    const toTime = `${toHour}:${toMinute.toString().padStart(2, '0')}`;
    
    // Try to use the same stylist from previous service as default, if available
    let stylistId = '';
    let stylistName = '';
    
    if (lastService && lastService.stylistId) {
      stylistId = lastService.stylistId;
      stylistName = lastService.stylistName;
    } else if (entry.stylists && entry.stylists.length > 0) {
      stylistId = entry.stylists[0].id;
      stylistName = entry.stylists[0].name;
    }

    // Create new service entry
    const newService: ServiceEntry = {
      id: service.id,
      name: service.name,
      price: service.price || 0,
      stylistId, 
      stylistName,
      fromTime,
      toTime
    };

    // Update the entry with the new service
    updateEntry(entryId, {
      services: [...entry.services, newService]
    });
  };

  // Update handleServiceSelection function to simply call addServiceToEntry
  const handleServiceSelection = (service: BaseService) => {
    addServiceToEntry(selectedEntryId, service);
    setServiceSelectedMessage(`${service.name} selected!`);
    setTimeout(() => setServiceSelectedMessage(''), 2000);
    setServiceDialogOpen(false);
  };

  // Add function to handle checking for existing service selection
  const handleCheckServiceSelectionBeforeDialog = (entryId: string) => {
    const entry = clientEntries.find(e => e.id === entryId);
    
    // Check if any service has missing stylist
    const hasMissingStylist = entry?.services.some(service => !service.stylistId);
    
    if (hasMissingStylist) {
      toast.warn("Please assign an expert to all services before adding a new one");
      return;
    }
    
    // Open service selection dialog
    handleOpenServiceDialog(entryId);
  };

  // Add a function to handle removing a service
  const removeServiceFromEntry = (entryId: string, serviceIndex: number) => {
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const updatedServices = [...entry.services];
    updatedServices.splice(serviceIndex, 1);
    
    // Recalculate times for services after the removed one
    for (let i = serviceIndex; i < updatedServices.length; i++) {
      if (i === 0) {
        updatedServices[i].fromTime = appointmentTime.startTime;
      } else {
        updatedServices[i].fromTime = updatedServices[i-1].toTime;
      }
      
      // Calculate end time based on service duration
      const [fromHour, fromMinute] = updatedServices[i].fromTime.split(':').map(Number);
      const service = activeServices.find(s => s.id === updatedServices[i].id);
      const serviceDuration = service?.duration || 60;
      
      let totalMinutes = (fromHour * 60) + fromMinute + serviceDuration;
      const toHour = Math.floor(totalMinutes / 60);
      const toMinute = totalMinutes % 60;
      
      updatedServices[i].toTime = `${toHour}:${toMinute.toString().padStart(2, '0')}`;
    }
    
    updateEntry(entryId, { services: updatedServices });
  };

  // Add function to handle stylist selection for a specific service
  const updateServiceStylist = (entryId: string, serviceIndex: number, stylist: Stylist) => {
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const updatedServices = [...entry.services];
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      stylistId: stylist.id,
      stylistName: stylist.name
    };
    
    updateEntry(entryId, { services: updatedServices });
  };

  // Add function to update service times
  const updateServiceTime = (entryId: string, serviceIndex: number, field: 'fromTime' | 'toTime', value: string) => {
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const updatedServices = [...entry.services];
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      [field]: value
    };
    
    // If changing start time and there are following services, recalculate their times
    if (field === 'fromTime' && serviceIndex < updatedServices.length - 1) {
      // Calculate duration of current service
      const [fromHour, fromMinute] = value.split(':').map(Number);
      const [toHour, toMinute] = updatedServices[serviceIndex].toTime.split(':').map(Number);
      const durationMinutes = ((toHour * 60) + toMinute) - ((fromHour * 60) + fromMinute);
      
      // Update end time of current service based on new start time and duration
      let totalMinutes = (fromHour * 60) + fromMinute + durationMinutes;
      const newToHour = Math.floor(totalMinutes / 60);
      const newToMinute = totalMinutes % 60;
      updatedServices[serviceIndex].toTime = `${newToHour}:${newToMinute.toString().padStart(2, '0')}`;
      
      // Update all subsequent services
      for (let i = serviceIndex + 1; i < updatedServices.length; i++) {
        updatedServices[i].fromTime = updatedServices[i-1].toTime;
        
        // Calculate new end time
        const [nextFromHour, nextFromMinute] = updatedServices[i].fromTime.split(':').map(Number);
        const service = activeServices.find(s => s.id === updatedServices[i].id);
        const serviceDuration = service?.duration || 60;
        
        totalMinutes = (nextFromHour * 60) + nextFromMinute + serviceDuration;
        const nextToHour = Math.floor(totalMinutes / 60);
        const nextToMinute = totalMinutes % 60;
        
        updatedServices[i].toTime = `${nextToHour}:${nextToMinute.toString().padStart(2, '0')}`;
      }
    }
    
    // If changing end time and there are following services, recalculate their times
    if (field === 'toTime' && serviceIndex < updatedServices.length - 1) {
      // Update all subsequent services
      for (let i = serviceIndex + 1; i < updatedServices.length; i++) {
        if (i === serviceIndex + 1) {
          updatedServices[i].fromTime = value;
        } else {
          updatedServices[i].fromTime = updatedServices[i-1].toTime;
        }
        
        // Calculate new end time
        const [nextFromHour, nextFromMinute] = updatedServices[i].fromTime.split(':').map(Number);
        const service = activeServices.find(s => s.id === updatedServices[i].id);
        const serviceDuration = service?.duration || 60;
        
        const totalMinutes = (nextFromHour * 60) + nextFromMinute + serviceDuration;
        const nextToHour = Math.floor(totalMinutes / 60);
        const nextToMinute = totalMinutes % 60;
        
        updatedServices[i].toTime = `${nextToHour}:${nextToMinute.toString().padStart(2, '0')}`;
      }
    }
    
    updateEntry(entryId, { services: updatedServices });
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
    });
    
    if (!isValid) {
      setSnackbarMessage('Validation failed. Ensure all required fields are filled correctly.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    // --- End Validation ---

    // --- Process client entries and create appointments ---
    try {
      // Process each client entry to create appointments
      for (const entry of clientEntries) {
        // Process client - create if new
        let clientId = entry.client?.id;
        const clientName = entry.client?.full_name?.trim() || entry.client?.inputValue?.trim();
        const clientPhone = entry.client?.phone?.trim();
        const clientEmail = entry.client?.email?.trim();

        if (!clientId && clientName && clientPhone) {
          try {
            const newClient = await updateClientFromAppointment(
              clientName,
              clientPhone,
              clientEmail || '',
              editingAppointment ? 'Created during appointment edit' : 'Created from appointment booking'
            );
            clientId = newClient.id;
          } catch (clientError) {
            console.error('Error creating new client:', clientError);
            throw new Error(`Failed to create client: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
          }
        }

        // Generate clientDetails for the API
        const clientDetails = entry.services.map(service => ({
          clientId: clientId!,
          serviceIds: [service.id],
          stylistIds: [service.stylistId]
        }));

        // If editing an existing appointment
        if (editingAppointment) {
          // Create update data for the first service
          // Using the first service as the primary one in the appointment table
          const firstService = entry.services[0];
          if (!firstService) continue;

          // Parse times
          const [startHour, startMinute] = firstService.fromTime.split(':').map(Number);
          const [endHour, endMinute] = firstService.toTime.split(':').map(Number);
          
          // Create date objects
          const baseDate = new Date(editingAppointment.start_time);
          baseDate.setHours(0, 0, 0, 0);
          
          const startTime = new Date(baseDate);
          startTime.setHours(startHour, startMinute, 0, 0);
          
          const endTime = new Date(baseDate);
          endTime.setHours(endHour, endMinute, 0, 0);
          if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

          // Update the appointment
          const updateData = {
            id: editingAppointment.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            notes: appointmentNotes,
            status: editingAppointment.status,
            client_id: clientId!,
            stylist_id: firstService.stylistId,
            service_id: firstService.id,
            clientDetails
          };
          
          await updateAppointment(updateData);
          
          // If there are multiple services, create separate appointments for each additional service
          for (let i = 1; i < entry.services.length; i++) {
            const service = entry.services[i];
            
            // Parse times for this service
            const [svcStartHour, svcStartMinute] = service.fromTime.split(':').map(Number);
            const [svcEndHour, svcEndMinute] = service.toTime.split(':').map(Number);
            
            // Create date objects
            const serviceStartTime = new Date(baseDate);
            serviceStartTime.setHours(svcStartHour, svcStartMinute, 0, 0);
            
            const serviceEndTime = new Date(baseDate);
            serviceEndTime.setHours(svcEndHour, svcEndMinute, 0, 0);
            if (serviceEndTime <= serviceStartTime) serviceEndTime.setDate(serviceEndTime.getDate() + 1);
            
            // Create a new appointment for this service
            const serviceAppData = {
              start_time: serviceStartTime.toISOString(),
              end_time: serviceEndTime.toISOString(),
              notes: appointmentNotes,
              status: 'scheduled' as const,
              client_id: clientId!,
              stylist_id: service.stylistId,
              service_id: service.id,
              clientDetails: [{
                clientId: clientId!,
                serviceIds: [service.id],
                stylistIds: [service.stylistId]
              }]
            };
            
            await createAppointment(serviceAppData);
          }
        } 
        // Creating new appointments
        else {
          // Create separate appointments for each service
          for (const service of entry.services) {
            // Parse times
            const [startHour, startMinute] = service.fromTime.split(':').map(Number);
            const [endHour, endMinute] = service.toTime.split(':').map(Number);
            
            // Create date objects  
            const baseDate = selectedSlot ? new Date(selectedSlot.start) : new Date(selectedDate);
            baseDate.setHours(0, 0, 0, 0);
            
            const startTime = new Date(baseDate);
            startTime.setHours(startHour, startMinute, 0, 0);
            
            const endTime = new Date(baseDate);
            endTime.setHours(endHour, endMinute, 0, 0);
            if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);
            
            // Create the appointment
            const appointmentData = {
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              notes: appointmentNotes,
              status: 'scheduled' as const,
              client_id: clientId!,
              stylist_id: service.stylistId,
              service_id: service.id,
              clientDetails: [{
                clientId: clientId!,
                serviceIds: [service.id],
                stylistIds: [service.stylistId]
              }]
            };
            
            await createAppointment(appointmentData);
          }
        }
      }
      
      toast.success(editingAppointment ? 'Appointment updated successfully!' : 'Appointment booked successfully!');
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
    setServiceSearchTerm('');
    setServiceGenderFilter('male');
  };

  // Add handler for view mode toggle
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'calendar' | 'list' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Add function to handle opening service dialog
  const handleOpenServiceDialog = (entryId: string) => {
    setSelectedEntryId(entryId);
    setServiceDialogOpen(true);
    setServiceSearchTerm('');
  };

  // Update handleDeleteAppointment function
  const handleDeleteAppointment = () => {
    if (!editingAppointment) return;
    
    setDeleteDialogOpen(true);
  };
  
  // Function to confirm and execute appointment deletion
  const confirmDeleteAppointment = async () => {
    if (!editingAppointment) return;
    
    try {
      await deleteAppointment(editingAppointment.id);
      toast.success('Appointment deleted successfully');
      setDeleteDialogOpen(false);
      handleCloseDrawer();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Delete failed: ${errorMessage}`);
    }
  };

  // Function to add a new client
  const handleAddNewClient = async (name: string, phone: string, email: string = '') => {
    try {
      const newClient = await updateClientFromAppointment(
        name,
        phone,
        email,
        'Created from appointment booking'
      );
      
      // Update entry with the new client
      updateEntry(clientEntries[0].id, { client: { ...newClient } });
      
      // Close client dialog
      setClientDialogOpen(false);
      
      // Show success notification
      toast.success(`Client ${name} created successfully!`);
      return newClient;
    } catch (error) {
      console.error('Error creating new client:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create client: ${errorMessage}`);
      return null;
    }
  };

  // Function to view client history
  const handleViewClientHistory = useCallback(async () => {
    // Only proceed if we have a selected client with ID
    const selectedClient = clientEntries[0]?.client;
    if (!selectedClient?.id) return;
    
    try {
      // Filter appointments for this client
      const clientAppointments = appointments.filter(
        appointment => appointment.client_id === selectedClient.id
      );
      
      // Sort by date (newest first)
      clientAppointments.sort((a, b) => 
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      
      // Set client history
      setClientHistory(clientAppointments);
      setShowingClientHistory(true);
    } catch (error) {
      console.error('Error fetching client history:', error);
      toast.error('Could not load client history');
    }
  }, [clientEntries, appointments]);

  // Close client history panel
  const handleCloseClientHistory = () => {
    setShowingClientHistory(false);
  };

  // ============================================
  // Rendering Logic
  // ============================================

  if (loadingAppointments || loadingServices || loadingStylists || loadingClients || loadingCollections) {
    return <CircularProgress />;
  }

  const showDrawer = !!selectedSlot || !!editingAppointment;

  // Replace the handleOpenClientsList function to show a dialog instead of trying to use the hidden autocomplete
  const handleOpenClientsList = () => {
    setClientDialogOpen(true);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 64px)', 
      width: '100%',
      position: 'relative', 
      overflow: 'hidden',
      flexDirection: 'column'
    }}>
      {/* Header with view toggle */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" component="h1">
          {viewMode === 'calendar' ? 'Appointments Calendar' : 'Upcoming Appointments'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-appointment')}
          >
            Create Appointment
          </Button>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarIcon sx={{ mr: 1 }} />
              Calendar View
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListIcon sx={{ mr: 1 }} />
              List View
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      {/* Main Content Area - Calendar or List View */}
      <Box 
        sx={{ 
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
        }}
      >
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
          {viewMode === 'calendar' ? (
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
          ) : (
            <FutureAppointmentsList
              appointments={appointments || []}
              stylists={allStylists || []}
              services={allServices || []}
              onDeleteAppointment={deleteAppointment}
              onEditAppointment={handleAppointmentClick}
            />
          )}
        </Box>
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
        {/* Header with back button and title */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider', 
            position: 'relative'
          }}
        >
          <IconButton 
            onClick={handleCloseDrawer} 
            sx={{ position: 'absolute', left: 8 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#E91E63',
              flex: 1,
              textAlign: 'center'
            }}
          >
            Create Appointment
          </Typography>
        </Box>

        {/* Form Content Area - Allow Scrolling */}
        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, bgcolor: '#F5F5F5' }}>
          {/* Guest Details Section */}
          <Box sx={{ mb: 3, bgcolor: 'white', p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                <span style={{ marginRight: '8px' }}>1.</span> Guest Details
              </Typography>
              {clientEntries[0]?.client?.id ? (
                <Button 
                  sx={{ 
                    color: '#E91E63', 
                    textTransform: 'none' 
                  }}
                  size="small"
                  onClick={handleViewClientHistory}
                >
                  Client History
                </Button>
              ) : (
                <Button 
                  sx={{ 
                    color: '#E91E63', 
                    textTransform: 'none' 
                  }}
                  size="small"
                  onClick={() => setClientDialogOpen(true)}
                >
                  Add Guest +
                </Button>
              )}
            </Box>
            
            {/* Client search field */}
            <TextField
              fullWidth
              placeholder="Search By Name Or No."
              value={clientEntries[0]?.client?.full_name || ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setClientDialogOpen(true)}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0'
                  }
                }
              }}
              onClick={() => setClientDialogOpen(true)}
              sx={{ cursor: 'pointer' }}
            />

            <Dialog 
              open={clientDialogOpen} 
              onClose={() => setClientDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Select Client
                <IconButton
                  aria-label="close"
                  onClick={() => setClientDialogOpen(false)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Search Clients"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  <List>
                    {allClients.map(client => (
                      <ListItem 
                        button 
                        key={client.id}
                        onClick={() => {
                          updateEntry(clientEntries[0].id, { client: { ...client } });
                          setClientDialogOpen(false);
                        }}
                      >
                        <ListItemText 
                          primary={client.full_name} 
                          secondary={client.phone || 'No phone'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={() => {
                      // Show new client form instead of just setting an empty client
                      const newClient = {
                        id: '',
                        full_name: '',
                        phone: '',
                        email: '',
                        created_at: ''
                      };
                      updateEntry(clientEntries[0].id, { client: newClient });
                      setClientDialogOpen(false);
                    }}
                    color="primary"
                    startIcon={<AddIcon />}
                  >
                    Add New Client
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>

            {/* New Client Form (only show if client exists and has no ID) */}
            {(clientEntries[0].client && !clientEntries[0].client.id) && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1, bgcolor: '#FAFAFA' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#E91E63' }}>
                  New Client Details
                </Typography>
                <TextField
                  label="Client Name"
                  fullWidth
                  required
                  value={clientEntries[0].client.full_name || ''}
                  onChange={(e) => updateEntry(clientEntries[0].id, { 
                    client: { ...clientEntries[0].client!, full_name: e.target.value }
                  })}
                  margin="dense"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Phone (Required)"
                      fullWidth
                      required
                      value={clientEntries[0].client.phone || ''}
                      onChange={(e) => updateEntry(clientEntries[0].id, { 
                        client: { ...clientEntries[0].client!, phone: e.target.value }
                      })}
                      margin="dense"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Email (Optional)"
                      fullWidth
                      value={clientEntries[0].client.email || ''}
                      onChange={(e) => updateEntry(clientEntries[0].id, { 
                        client: { ...clientEntries[0].client!, email: e.target.value }
                      })}
                      margin="dense"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const { client } = clientEntries[0];
                      if (client && client.full_name && client.phone) {
                        handleAddNewClient(client.full_name, client.phone, client.email || '');
                      } else {
                        toast.error('Please fill required fields (name and phone)');
                      }
                    }}
                    sx={{ 
                      bgcolor: '#E91E63',
                      '&:hover': { bgcolor: '#C2185B' }
                    }}
                  >
                    Save Client
                  </Button>
                </Box>
              </Box>
            )}

            {/* No client selected message */}
            {!clientEntries[0]?.client && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Select guest details
              </Typography>
            )}

            {/* Client History Dialog */}
            <Dialog
              open={showingClientHistory}
              onClose={handleCloseClientHistory}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle sx={{ bgcolor: '#E91E63', color: 'white' }}>
                Client History: {clientEntries[0]?.client?.full_name}
                <IconButton
                  aria-label="close"
                  onClick={handleCloseClientHistory}
                  sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                {clientHistory.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                    No previous appointments found for this client
                  </Typography>
                ) : (
                  <List>
                    {clientHistory.map(appointment => {
                      // Find service details
                      const service = allServices.find(s => s.id === appointment.service_id);
                      // Find stylist details
                      const stylist = allStylists.find(s => s.id === appointment.stylist_id);
                      
                      return (
                        <ListItem
                          key={appointment.id}
                          divider
                          sx={{ 
                            borderLeft: '4px solid #E91E63',
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: '#F9F9F9'
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2">Date & Time</Typography>
                              <Typography variant="body2">
                                {format(new Date(appointment.start_time), 'MMM dd, yyyy')}
                              </Typography>
                              <Typography variant="body2">
                                {format(new Date(appointment.start_time), 'hh:mm a')} - 
                                {format(new Date(appointment.end_time), 'hh:mm a')}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2">Service</Typography>
                              <Typography variant="body2">{service?.name || 'Unknown Service'}</Typography>
                              <Typography variant="body2">₹{service?.price || 0}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2">Expert</Typography>
                              <Typography variant="body2">{stylist?.name || 'Unknown Expert'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="subtitle2">Status</Typography>
                              <Chip 
                                label={appointment.status} 
                                size="small"
                                color={
                                  appointment.status === 'completed' 
                                    ? 'success' 
                                    : appointment.status === 'cancelled' 
                                      ? 'error' 
                                      : 'primary'
                                }
                              />
                              {appointment.notes && (
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
                                  Note: {appointment.notes}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </DialogContent>
            </Dialog>
          </Box>

          {/* Service Details Section */}
          <Box sx={{ mb: 3, bgcolor: 'white', p: 3, borderRadius: 2 }}>
            <Typography variant="body1" fontWeight="medium" mb={2}>
              <span style={{ marginRight: '8px' }}>2.</span> Service Details
            </Typography>
            
            {/* Service search field (keep in the UI for quick selection) */}
            <TextField
              fullWidth
              placeholder="Search Service By Name"
              value={serviceSearchTerm}
              onChange={(e) => setServiceSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '8px',
                  mb: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0'
                  }
                }
              }}
              onClick={() => handleCheckServiceSelectionBeforeDialog(clientEntries[0].id)}
              sx={{ cursor: 'pointer' }}
            />
            
            {/* Gender Filter Tabs */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <Button
                variant={serviceGenderFilter === 'female' ? 'contained' : 'outlined'}
                onClick={() => setServiceGenderFilter('female')}
                sx={{ 
                  borderRadius: '20px', 
                  textTransform: 'none',
                  bgcolor: serviceGenderFilter === 'female' ? '#E91E63' : 'transparent',
                  color: serviceGenderFilter === 'female' ? 'white' : '#757575',
                  borderColor: '#E0E0E0',
                  '&:hover': {
                    bgcolor: serviceGenderFilter === 'female' ? '#D81B60' : 'rgba(0,0,0,0.04)'
                  },
                }}
              >
                female
              </Button>
              <Button
                variant={serviceGenderFilter === 'male' ? 'contained' : 'outlined'}
                onClick={() => setServiceGenderFilter('male')}
                sx={{ 
                  borderRadius: '20px', 
                  textTransform: 'none',
                  bgcolor: serviceGenderFilter === 'male' ? '#2196F3' : 'transparent',
                  color: serviceGenderFilter === 'male' ? 'white' : '#757575',
                  borderColor: '#E0E0E0',
                  '&:hover': {
                    bgcolor: serviceGenderFilter === 'male' ? '#1E88E5' : 'rgba(0,0,0,0.04)'
                  },
                }}
              >
                male
              </Button>
            </Box>

            {/* Service categories and items */}
            <Box sx={{ mb: 2, borderRadius: 1, border: '1px solid #E0E0E0', bgcolor: 'white', maxHeight: '300px', overflow: 'auto' }}>
              {(() => {
                // Get all categories
                const categories = Array.from(new Set(activeServices
                  .filter(service => 
                    (!serviceGenderFilter || (service as ServiceWithGender).gender === serviceGenderFilter || !(service as ServiceWithGender).gender) && 
                    (!serviceSearchTerm || service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                  )
                  .map(service => service.category || 'HAIR')
                ));

                return categories.map(category => (
                  <Box key={category} sx={{ m: 2 }}>
                    {/* Category Header */}
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 1, 
                        textTransform: 'uppercase',
                        color: '#424242',
                        borderBottom: '1px solid #E0E0E0',
                        pb: 0.5
                      }}
                    >
                      {category}
                    </Typography>
                    
                    {/* Services in this category */}
                    {activeServices
                      .filter(service => 
                        (service.category || 'HAIR') === category && 
                        (!serviceGenderFilter || (service as ServiceWithGender).gender === serviceGenderFilter || !(service as ServiceWithGender).gender) &&
                        (!serviceSearchTerm || service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                      )
                      .map(service => (
                        <Box 
                          key={service.id} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            p: 1.5,
                            borderRadius: 1,
                            mb: 1,
                            border: '1px solid transparent',
                            '&:hover': { 
                              bgcolor: '#f5f5f5', 
                              cursor: 'pointer',
                              border: '1px solid #E0E0E0'
                            }
                          }}
                          onClick={() => handleServiceSelection(service as BaseService)}
                        >
                          <Typography variant="body2">{service.name}</Typography>
                          <Typography variant="body2" fontWeight="medium">₹{service.price}</Typography>
                        </Box>
                      ))
                    }
                  </Box>
                ));
              })()}
            </Box>

            {/* Selected Services */}
            {clientEntries[0].services.map((service, serviceIndex) => (
              <Box key={serviceIndex} sx={{ mb: 3, border: '1px solid', borderColor: '#E0E0E0', borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#F5F5F5',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">{service.name}</Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    color="default"
                    onClick={() => removeServiceFromEntry(clientEntries[0].id, serviceIndex)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {/* Expert selection */}
                <Box sx={{ p: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Expert</InputLabel>
                    <Select
                      value={service.stylistId}
                      label="Expert"
                      onChange={(e) => {
                        const stylist = allStylists.find(s => s.id === e.target.value);
                        if (stylist) {
                          updateServiceStylist(clientEntries[0].id, serviceIndex, stylist);
                        }
                      }}
                      endAdornment={
                        <Box component="span" sx={{ display: 'flex', marginRight: 1, pointerEvents: 'none' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Box>
                      }
                    >
                      {allStylists
                        .filter(stylist => stylist.available !== false)
                        .map(stylist => (
                          <MenuItem key={stylist.id} value={stylist.id}>{stylist.name}</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                  
                  {/* From/To Time Selection */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>From Time</InputLabel>
                        <Select
                          value={service.fromTime}
                          label="From Time"
                          onChange={(e) => updateServiceTime(clientEntries[0].id, serviceIndex, 'fromTime', e.target.value)}
                          endAdornment={
                            <Box component="span" sx={{ display: 'flex', marginRight: 1, pointerEvents: 'none' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Box>
                          }
                        >
                          {timeOptions.map(option => (
                            <MenuItem key={`from-${option.value}`} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>To Time</InputLabel>
                        <Select
                          value={service.toTime}
                          label="To Time"
                          onChange={(e) => updateServiceTime(clientEntries[0].id, serviceIndex, 'toTime', e.target.value)}
                          endAdornment={
                            <Box component="span" sx={{ display: 'flex', marginRight: 1, pointerEvents: 'none' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Box>
                          }
                        >
                          {timeOptions.map(option => (
                            <MenuItem key={`to-${option.value}`} value={option.value}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ))}
            
            {/* Add New Service Button - Only show if at least one service is already selected */}
            {clientEntries[0].services.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<AddIcon />}
                  onClick={() => handleCheckServiceSelectionBeforeDialog(clientEntries[0].id)}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: '20px',
                    bgcolor: 'white',
                    borderColor: '#E91E63',
                    color: '#E91E63',
                    '&:hover': {
                      borderColor: '#C2185B',
                      bgcolor: 'rgba(233, 30, 99, 0.04)'
                    }
                  }}
                >
                  Add New Service
                </Button>
              </Box>
            )}

            {/* Service Selected Message */}
            {serviceSelectedMessage && (
              <Box sx={{ 
                mt: 2, 
                p: 1, 
                bgcolor: '#E8F5E9', 
                color: '#2E7D32', 
                borderRadius: 1, 
                textAlign: 'center',
                fontWeight: 'medium'
              }}>
                {serviceSelectedMessage}
              </Box>
            )}
            
            {/* Service Selection Dialog */}
            <Dialog
              open={serviceDialogOpen}
              onClose={() => setServiceDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                Select Service
                <IconButton
                  aria-label="close"
                  onClick={() => setServiceDialogOpen(false)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                {/* Service search field */}
                <TextField
                  autoFocus
                  fullWidth
                  placeholder="Search Service By Name"
                  value={serviceSearchTerm}
                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '8px',
                      mb: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0'
                      }
                    }
                  }}
                  sx={{ mb: 2 }}
                />
                
                {/* Gender Filter Tabs */}
                <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
                  <Button
                    variant={serviceGenderFilter === 'female' ? 'contained' : 'outlined'}
                    onClick={() => setServiceGenderFilter('female')}
                    sx={{ 
                      borderRadius: '20px', 
                      textTransform: 'none',
                      bgcolor: serviceGenderFilter === 'female' ? '#E91E63' : 'transparent',
                      color: serviceGenderFilter === 'female' ? 'white' : '#757575',
                      borderColor: '#E0E0E0',
                      '&:hover': {
                        bgcolor: serviceGenderFilter === 'female' ? '#D81B60' : 'rgba(0,0,0,0.04)'
                      },
                    }}
                  >
                    female
                  </Button>
                  <Button
                    variant={serviceGenderFilter === 'male' ? 'contained' : 'outlined'}
                    onClick={() => setServiceGenderFilter('male')}
                    sx={{ 
                      borderRadius: '20px', 
                      textTransform: 'none',
                      bgcolor: serviceGenderFilter === 'male' ? '#2196F3' : 'transparent',
                      color: serviceGenderFilter === 'male' ? 'white' : '#757575',
                      borderColor: '#E0E0E0',
                      '&:hover': {
                        bgcolor: serviceGenderFilter === 'male' ? '#1E88E5' : 'rgba(0,0,0,0.04)'
                      },
                    }}
                  >
                    male
                  </Button>
                </Box>
                
                {/* Service categories and items */}
                <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  {(() => {
                    // Get all categories
                    const categories = Array.from(new Set(activeServices
                      .filter(service => 
                        (!serviceGenderFilter || (service as ServiceWithGender).gender === serviceGenderFilter || !(service as ServiceWithGender).gender) && 
                        (!serviceSearchTerm || service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                      )
                      .map(service => service.category || 'HAIR')
                    ));

                    return categories.map(category => (
                      <Box key={category} sx={{ m: 2 }}>
                        {/* Category Header */}
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 'bold', 
                            mb: 1, 
                            textTransform: 'uppercase',
                            color: '#424242',
                            borderBottom: '1px solid #E0E0E0',
                            pb: 0.5
                          }}
                        >
                          {category}
                        </Typography>
                        
                        {/* Services in this category */}
                        {activeServices
                          .filter(service => 
                            (service.category || 'HAIR') === category && 
                            (!serviceGenderFilter || (service as ServiceWithGender).gender === serviceGenderFilter || !(service as ServiceWithGender).gender) &&
                            (!serviceSearchTerm || service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                          )
                          .map(service => (
                            <Box 
                              key={service.id} 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                p: 1.5,
                                borderRadius: 1,
                                mb: 1,
                                border: '1px solid transparent',
                                '&:hover': { 
                                  bgcolor: '#f5f5f5', 
                                  cursor: 'pointer',
                                  border: '1px solid #E0E0E0'
                                }
                              }}
                              onClick={() => handleServiceSelection(service as BaseService)}
                            >
                              <Typography variant="body2">{service.name}</Typography>
                              <Typography variant="body2" fontWeight="medium">₹{service.price}</Typography>
                            </Box>
                          ))
                        }
                      </Box>
                    ));
                  })()}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
              </DialogActions>
            </Dialog>
          </Box>
          
          {/* Instruction Details Section */}
          <Box sx={{ mb: 3, bgcolor: 'white', p: 3, borderRadius: 2 }}>
            <Typography variant="body1" fontWeight="medium" mb={2}>
              <span style={{ marginRight: '8px' }}>3.</span> Instruction Details
            </Typography>
            
            <TextField
              placeholder="Enter Appointment Instruction"
              multiline
              fullWidth
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0'
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Footer with action buttons */}
        <Box sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleSaveAppointment} 
            variant="contained" 
            sx={{ 
              bgcolor: '#E91E63', // Use theme's primary color
              '&:hover': {
                bgcolor: '#C2185B' // Darker shade for hover
              },
              borderRadius: '8px',
              textTransform: 'none',
              py: 1.5
            }}
          >
            {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
          </Button>
          
          {/* Only show delete button when editing an existing appointment */}
          {editingAppointment && (
            <Button 
              onClick={handleDeleteAppointment} 
              variant="outlined" 
              color="error"
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                py: 1.5
              }}
            >
              Delete Appointment
            </Button>
          )}
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
        <DialogTitle id="delete-appointment-title" sx={{ color: '#E91E63' }}>Delete Appointment?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-appointment-description">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAppointment}
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