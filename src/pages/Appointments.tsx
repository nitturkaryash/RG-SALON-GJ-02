import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  ListItemText,
  ListSubheader,
  Checkbox,
  FormControlLabel,
  Popover,
  useTheme
} from '@mui/material'
import { useAppointments, Appointment, MergedAppointment } from '../hooks/useAppointments'
// Import UpdateAppointmentData type for proper typing

// Define CreateAppointmentData type
interface CreateAppointmentData {
  clientDetails: {
    clientId: string;
    serviceIds: string[];
    stylistIds: string[];
  }[];
  start_time: string;
  end_time: string;
  notes?: string;
  status: Appointment['status'];
  paid?: boolean;
  billed?: boolean;
  is_for_someone_else?: boolean;
  client_id: string;
  stylist_id: string;
  service_id: string;
  booking_id: string; // Required for creation
}

type UpdateAppointmentData = {
  id: string;
  clientDetails?: {
    clientId: string;
    serviceIds: string[];
    stylistIds: string[];
  }[];
  start_time?: string;
  end_time?: string;
  notes?: string;
  status?: Appointment['status'];
  paid?: boolean;
  billed?: boolean;
  is_for_someone_else?: boolean;
  client_id?: string;
  stylist_id?: string;
  service_id?: string;
  booking_id?: string | null; // Allow null for updates
}
import { useStylists, Stylist, StylistBreak } from '../hooks/useStylists'
import { useServices, Service as BaseService } from '../hooks/useServices'
import { useClients, Client } from '../hooks/useClients'
import { useStylistHolidays, StylistHoliday } from '../hooks/useStylistHolidays'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { useServiceCollections } from '../hooks/useServiceCollections'
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useAuthContext } from '../contexts/AuthContext'
import { sendAppointmentWhatsAppNotification, isWhatsAppEnabled } from '../utils/whatsappNotifications'
import { isValidPhoneNumber, isValidEmail } from '../utils/validation'

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
const generateTimeOptions = (intervalMinutes: number = 15) => {
  const options = [];
  const startHourOperating = 8;
  const endHourOperating = 22; // Example: salon closes around 10 PM / 22:00

  for (let hour = startHourOperating; hour <= endHourOperating; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const period = hour >= 12 && hour < 24 ? 'PM' : 'AM';
      let hour12 = hour % 12;
      if (hour12 === 0) hour12 = 12;

      const minuteStr = minute.toString().padStart(2, '0');
      // Store in 24-hour format
      const timeValue = `${hour.toString().padStart(2, '0')}:${minuteStr}`;
      // Display in 12-hour format with AM/PM
      const displayValue = `${hour12}:${minuteStr} ${period}`;

      options.push({
        value: timeValue,
        label: displayValue
      });
    }
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
  id: string; // This is the service_definition_id
  name: string;
  price: number;
  stylistId: string;
  stylistName: string;
  fromTime: string; 
  toTime: string;
  appointmentInstanceId?: string; // Unique ID of the appointment record in the DB for this service instance
  isNew?: boolean; // Flag to indicate if this service was newly added in the drawer during an edit session
  hsn_code?: string; // Optional: Harmonized System of Nomenclature code for GST
  gst_percentage?: number; // Optional: GST percentage applicable
  category?: string; // Optional: Category of the service
  experts?: { id?: string; name?: string }[]; // Optional: Experts for the service
}

interface ClientAppointmentEntry {
  id: string;
  client: (Client & { inputValue?: string }) | null;
  services: ServiceEntry[];
  stylists: Pick<Stylist, 'id' | 'name'>[];
  isForSomeoneElse: boolean;
  bookerName?: string;
  bookerPhone?: string;
  bookerEmail?: string;
}

// Define filter for freeSolo client options
// Use the full Client interface plus optional inputValue so filterOptions and Autocomplete share the same type
const filterClients = createFilterOptions<Client & { inputValue?: string }>();

// Extend the Service interface to include gender property
interface ServiceWithGender extends BaseService {
  gender?: string;
  hsn_code?: string;
  gst_percentage?: number;
  category?: string;
}

// Define service option with groupHeader for the Autocomplete component
interface ServiceOption extends BaseService {
  groupHeader?: string;
}

// Clean up service types
interface ExtendedClientAppointmentEntry extends Omit<ClientAppointmentEntry, 'services'> {
  services: ServiceEntry[];
  // Flag to indicate booking on behalf of someone else
  isForSomeoneElse: boolean;
}

// Helper for button styles for CustomAutocompleteListbox
const buttonSx = (type: 'male' | 'female', currentFilter: 'male' | 'female' | null) => ({
  minWidth: '80px',
  borderRadius: '20px',
  textTransform: 'none',
  bgcolor: currentFilter === type ? '#6B8E23' : 'transparent',
  color: currentFilter === type ? 'white' : '#757575',
  borderColor: '#E0E0E0',
  '&:hover': {
    bgcolor: currentFilter === type ? '#566E1C' : 'rgba(0,0,0,0.04)'
  }
});

// Custom ListboxComponent for Autocomplete with ref forwarding
interface CustomListboxProps extends React.HTMLAttributes<HTMLUListElement> {
  serviceGenderFilterState: 'male' | 'female' | null;
  setServiceGenderFilterState: (value: 'male' | 'female' | null) => void;
}

const CustomAutocompleteListbox = React.forwardRef<HTMLUListElement, CustomListboxProps>(
  (props, ref) => {
    const { children, serviceGenderFilterState, setServiceGenderFilterState, ...other } = props;
    return (
      <Box component="ul" {...other} ref={ref}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 2,
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
            </Typography>
            <Button
              size="small"
              variant={serviceGenderFilterState === null ? 'contained' : 'outlined'}
              onClick={() => setServiceGenderFilterState(null)}
              sx={{
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                bgcolor: serviceGenderFilterState === null ? '#6B8E23' : 'transparent',
                color: serviceGenderFilterState === null ? 'white' : '#757575',
                borderColor: '#E0E0E0',
                '&:hover': {
                  bgcolor: serviceGenderFilterState === null ? '#566E1C' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Show All
            </Button>
            <Button
              size="small"
              variant={serviceGenderFilterState === 'female' ? 'contained' : 'outlined'}
              onClick={() => setServiceGenderFilterState(serviceGenderFilterState === 'female' ? null : 'female')}
              sx={buttonSx('female', serviceGenderFilterState)}
            >
              Female
            </Button>
            <Button
              size="small"
              variant={serviceGenderFilterState === 'male' ? 'contained' : 'outlined'}
              onClick={() => setServiceGenderFilterState(serviceGenderFilterState === 'male' ? null : 'male')}
              sx={buttonSx('male', serviceGenderFilterState)}
            >
              Male
            </Button>
          </Box>
        </Box>
        {children}
      </Box>
    );
  }
);
CustomAutocompleteListbox.displayName = 'CustomAutocompleteListbox';

// Add this helper function before the Appointments component declaration
export const getClientName = (appointment: any, allClients?: any[]): string => {
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
  if (appointment.client_id && allClients && allClients.length > 0) {
    const matchingClient = allClients.find(c => c.id === appointment.client_id);
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

export default function Appointments() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [clientEntries, setClientEntries] = useState<ExtendedClientAppointmentEntry[]>([{ 
    id: uuidv4(), 
    client: null, 
    services: [], 
    stylists: [],
    isForSomeoneElse: false
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
  const [serviceGenderFilter, setServiceGenderFilter] = useState<'male' | 'female' | null>(null);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  // Add new state for the inline service selection
  const [showInlineServiceSelection, setShowInlineServiceSelection] = useState(false);
  const [inlineServiceData, setInlineServiceData] = useState<{
    serviceId: string;
    stylistId: string;
    fromTime: string;
    toTime: string;
    additionalExperts?: { id: string; name: string }[];
  }>({ serviceId: '', stylistId: '', fromTime: '', toTime: '', additionalExperts: [] });
  const [isInlineServiceDropdownOpen, setIsInlineServiceDropdownOpen] = useState(false); // New state for inline Autocomplete
  // Removed clientDialogOpen state
  // Removed serviceDialogOpen state
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [serviceSelectedMessage, setServiceSelectedMessage] = useState<string>('');
  // Add client history state and function
  const [showingClientHistory, setShowingClientHistory] = useState(false);
  const [clientHistory, setClientHistory] = useState<MergedAppointment[]>([]);
  // Add date picker state
  const [drawerDatePickerAnchorEl, setDrawerDatePickerAnchorEl] = useState<HTMLElement | null>(null)
  const datePickerOpen = Boolean(drawerDatePickerAnchorEl)
  const [drawerDate, setDrawerDate] = useState<Date>(new Date())
  // Timesoptions initialization (15-minute interval)
  const timeOptions = useMemo(() => generateTimeOptions(15), []); // Generate 15-minute interval options
  const navigate = useNavigate();
  const [lastBookedAppointmentTime, setLastBookedAppointmentTime] = useState<string | undefined>(undefined);
  const { user } = useAuthContext();
  const [holidaysByType, setHolidaysByType] = useState<Record<string, StylistHoliday[]>>({});

  // Hook calls
  const { appointments: allAppointments = [], isLoading: loadingAppointments, updateAppointment, createAppointment, deleteAppointment } = useAppointments();
  const { services = [], isLoading: loadingServices } = useServices();
  const { stylists = [], isLoading: loadingStylists, updateStylist } = useStylists();
  const { clients = [], isLoading: loadingClients, updateClientFromAppointment } = useClients();
  const { serviceCollections: collections = [], isLoading: loadingCollections } = useServiceCollections();
  const { holidays = [], isLoading: loadingHolidays } = useStylistHolidays();

  // ============================================
  // Rendering Logic
  // ============================================

  useEffect(() => {
    if (editingAppointment) {
      setDrawerDate(new Date(editingAppointment.start_time));
    } else if (selectedSlot) {
      setDrawerDate(new Date(selectedSlot.start));
    } else {
      setDrawerDate(selectedDate);
    }
  }, [editingAppointment, selectedSlot, selectedDate]);

  const showDrawer = !!selectedSlot || !!editingAppointment;

  // --- Frontend filtering of services to use
  const activeServices = useMemo(() => {
    return (services || []).filter(service => service.active !== false);
  }, [services]);

  // We will use allStylists directly for stylist day view
  const processedStylists = stylists || [];

  // --- Other Helper Functions ---
  const addBlankEntry = () => {
    setClientEntries(prev => [...prev, {
      id: uuidv4(),
      client: null,
      services: [],
      stylists: [],
      isForSomeoneElse: false
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
              toTime: appointmentTime.endTime || '11:00',
              hsn_code: service.hsn_code,
              gst_percentage: service.gst_percentage,
              category: service.category
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
    // Format times in HH:mm format for new appointments
    const formattedStartTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const formattedEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    
    setAppointmentTime({
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    });
    setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [], isForSomeoneElse: false }]);
    setAppointmentNotes('');
  };

  const handleAppointmentClick = (appointment: MergedAppointment) => {
    console.log("[handleAppointmentClick] Received appointment object:", JSON.parse(JSON.stringify(appointment)));

    setEditingAppointment(appointment);
    setSelectedSlot(null);

    const primaryClientInfo = clients.find(c => c.id === appointment.client_id);

    if (!primaryClientInfo) {
      console.warn(`[handleAppointmentClick] Primary client data not found for ID: ${appointment.client_id}. Cannot populate drawer.`);
      setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [], isForSomeoneElse: false }]);
      setAppointmentTime({ startTime: '', endTime: '' });
      setAppointmentNotes('');
      return;
    }

    console.log("[handleAppointmentClick] Primary client found:", primaryClientInfo);

    // Group all appointments for this client on the same day and consolidate their services
    const clickedDate = new Date(appointment.start_time);
    const groupAppointments = appointment.is_for_someone_else
      ? [appointment]
      : allAppointments.filter((a: MergedAppointment) =>
          a.client_id === appointment.client_id &&
          isSameDay(new Date(a.start_time), clickedDate) &&
          !a.is_for_someone_else
        );
    console.log("[handleAppointmentClick] Found group appointments:", groupAppointments.map(a => a.id));

    const consolidatedServiceEntries: ServiceEntry[] = [];
    const involvedStylistIds = new Set<string>();

    // Group appointments by service and consolidate experts
    const serviceMap = new Map<string, {
      service: any;
      experts: { id: string; name: string }[];
      appointmentIds: string[];
      startTime: string;
      endTime: string;
    }>();

    groupAppointments.forEach((app: MergedAppointment) => {
      let servicesAddedFromDetail = false;
      if (app.clientDetails && Array.isArray(app.clientDetails) && app.clientDetails.length > 0) {
        app.clientDetails.forEach(clientDetailEntry => {
          if (clientDetailEntry.id === primaryClientInfo.id && Array.isArray(clientDetailEntry.services)) {
            clientDetailEntry.services.forEach(serviceFromDetail => {
              const serviceId = serviceFromDetail.id;
              const serviceStylistId = (serviceFromDetail as any).original_stylist_id ||
                                      (serviceFromDetail as any).stylist_id || app.stylist_id;
              const serviceStartTimeStr = (serviceFromDetail as any).original_start_time ||
                                          (serviceFromDetail as any).start_time || app.start_time;
              const serviceEndTimeStr = (serviceFromDetail as any).original_end_time ||
                                        (serviceFromDetail as any).end_time || app.end_time;
              const stylist = stylists.find(s => s.id === serviceStylistId);
              if (stylist) involvedStylistIds.add(stylist.id);

              if (!serviceMap.has(serviceId)) {
                serviceMap.set(serviceId, {
                  service: serviceFromDetail,
                  experts: [],
                  appointmentIds: [],
                  startTime: serviceStartTimeStr,
                  endTime: serviceEndTimeStr
                });
              }

              const serviceEntry = serviceMap.get(serviceId)!;
              // Use stylists array from clientDetailEntry to capture all experts for this service
              if (clientDetailEntry.stylists && clientDetailEntry.stylists.length > 0) {
                clientDetailEntry.stylists.forEach(stylist => {
                  if (stylist && stylist.id && !serviceEntry.experts.find(e => e.id === stylist.id)) {
                    serviceEntry.experts.push({ id: stylist.id, name: stylist.name });
                  }
                });
              } else if (stylist && !serviceEntry.experts.find(e => e.id === stylist.id)) {
                // Fallback to single stylist if stylists array not present
                serviceEntry.experts.push({ id: stylist.id, name: stylist.name });
              }
              serviceEntry.appointmentIds.push(app.id);
              servicesAddedFromDetail = true;
            });
          }
        });
      }
      if (!servicesAddedFromDetail && app.id && app.service_id) {
        const serviceDef = services.find(s => s.id === app.service_id);
        const stylist = stylists.find(s => s.id === app.stylist_id);
        if (serviceDef) {
          const serviceId = serviceDef.id;
          
          if (!serviceMap.has(serviceId)) {
            serviceMap.set(serviceId, {
              service: serviceDef,
              experts: [],
              appointmentIds: [],
              startTime: app.start_time,
              endTime: app.end_time
            });
          }

          const serviceEntry = serviceMap.get(serviceId)!;
          if (stylist && !serviceEntry.experts.find(e => e.id === stylist.id)) {
            serviceEntry.experts.push({ id: stylist.id, name: stylist.name });
          }
          serviceEntry.appointmentIds.push(app.id);
          if (stylist) involvedStylistIds.add(stylist.id);
        }
      }
    });

    // Convert service map to consolidated service entries
    serviceMap.forEach((serviceData, serviceId) => {
      const startDate = new Date(serviceData.startTime);
      const endDate = new Date(serviceData.endTime);
      const primaryStylist = serviceData.experts[0]; // Use first expert as primary
      
      consolidatedServiceEntries.push({
        id: serviceId,
        name: serviceData.service.name,
        price: serviceData.service.price || 0,
        stylistId: primaryStylist?.id || '',
        stylistName: primaryStylist?.name || 'Unknown',
        fromTime: `${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2,'0')}`,
        toTime: `${endDate.getHours()}:${String(endDate.getMinutes()).padStart(2,'0')}`,
        appointmentInstanceId: serviceData.appointmentIds[0], // Use first appointment ID
        isNew: false,
        hsn_code: (serviceData.service as any).hsn_code,
        gst_percentage: (serviceData.service as any).gst_percentage,
        category: (serviceData.service as any).category,
        experts: serviceData.experts // Include all experts for this service
      });
    });

    // Derive stylist order directly from service entries to preserve order
    const seenStylistIds = new Set<string>();
    const finalStylistsForEntry = consolidatedServiceEntries
      .map(entry => entry.stylistId)
      .filter(id => {
        if (seenStylistIds.has(id)) return false;
        seenStylistIds.add(id);
        return true;
      })
      .map(id => {
        const stylist = stylists.find(s => s.id === id);
        return stylist ? { id: stylist.id, name: stylist.name } : null;
      })
      .filter((s): s is Pick<Stylist, 'id' | 'name'> => s !== null);

    setClientEntries([{
      id: uuidv4(), 
      client: primaryClientInfo, 
      services: consolidatedServiceEntries, 
      stylists: finalStylistsForEntry,
      isForSomeoneElse: appointment.is_for_someone_else || false,
      bookerName: appointment.booker_name || undefined,
      bookerPhone: appointment.booker_phone || undefined,
      bookerEmail: appointment.booker_email || undefined,
    }]);

    // Determine overall start/end from the consolidated services if available, otherwise use main appointment times
    let overallStartTimeToSet = appointment.start_time;
    let overallEndTimeToSet = appointment.end_time;

    if (consolidatedServiceEntries.length > 0) {
        const allStartTimes = consolidatedServiceEntries.map(s => {
            const [hr, min] = s.fromTime.split(':').map(Number);
            const d = new Date(appointment.start_time); // Use original appointment date part
            d.setHours(hr, min, 0, 0);
            return d;
        });
        const allEndTimes = consolidatedServiceEntries.map(s => {
            const [hr, min] = s.toTime.split(':').map(Number);
            const d = new Date(appointment.start_time); // Use original appointment date part
            d.setHours(hr, min, 0, 0);
            // Handle services ending past midnight relative to start of day
            const startOfDayForService = new Date(d); startOfDayForService.setHours(0,0,0,0);
            const serviceStartTimeDate = allStartTimes[consolidatedServiceEntries.findIndex(entry => entry.toTime === s.toTime)];
            if (d < serviceStartTimeDate && serviceStartTimeDate) d.setDate(d.getDate() + 1);
            return d;
        });

        const earliestStartTime = new Date(Math.min(...allStartTimes.map(d => d.getTime())));
        const latestEndTime = new Date(Math.max(...allEndTimes.map(d => d.getTime())));
        
        overallStartTimeToSet = earliestStartTime.toISOString();
        overallEndTimeToSet = latestEndTime.toISOString();
    }

    const overallStartDate = new Date(overallStartTimeToSet);
    const overallEndDate = new Date(overallEndTimeToSet);
    
    // Format times in HH:mm format
    const formattedStartTime = `${String(overallStartDate.getHours()).padStart(2, '0')}:${String(overallStartDate.getMinutes()).padStart(2, '0')}`;
    const formattedEndTime = `${String(overallEndDate.getHours()).padStart(2, '0')}:${String(overallEndDate.getMinutes()).padStart(2, '0')}`;

    // Set appointment times
    setAppointmentTime({
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    });
    setAppointmentNotes(appointment.notes || '');
    console.log("[handleAppointmentClick] Drawer populated. Services count:", consolidatedServiceEntries.length, "Overall Times:", { startTime: formattedStartTime, endTime: formattedEndTime });
  };

  const handleDayViewSelect = (stylistId: string, time: Date) => {
    console.log('handleDayViewSelect called:', { 
      stylistId, 
      time: time.toISOString(), 
      currentSelectedStylistId: selectedStylistId,
      isSameStylist: selectedStylistId === stylistId 
    });
    
    const defaultEndTime = new Date(time.getTime() + 60 * 60 * 1000);
    
    // Check if we're selecting a slot for the same stylist to preserve some state
    const isSameStylist = selectedStylistId === stylistId;
    
    setSelectedSlot({
      start: time,
      end: defaultEndTime,
      startStr: time.toISOString(),
      endStr: defaultEndTime.toISOString(),
      allDay: false,
      jsEvent: new MouseEvent('click'),
      view: {} as any
    });
    
    // Only update selectedStylistId if it's different to avoid unnecessary renders
    // This prevents the view from jumping to first stylist when clicking on the same stylist
    if (!isSameStylist) {
      console.log('Updating selectedStylistId from', selectedStylistId, 'to', stylistId);
      setSelectedStylistId(stylistId);
    } else {
      console.log('Keeping selectedStylistId unchanged:', selectedStylistId);
    }
    
    setEditingAppointment(null);
    // Format times in HH:mm format with leading zeros
    const formattedStartTime = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    const formattedEndTime = `${String(defaultEndTime.getHours()).padStart(2, '0')}:${String(defaultEndTime.getMinutes()).padStart(2, '0')}`;
    
    setAppointmentTime({
      startTime: formattedStartTime,
      endTime: formattedEndTime
    });
    
    const preSelectedStylist = (stylists || []).find(s => s.id === stylistId);
    
    // If selecting the same stylist and we have existing entries with services, preserve them
    // Otherwise, reset to a clean state
    if (isSameStylist && clientEntries.length > 0 && clientEntries.some(entry => entry.services.length > 0)) {
      console.log('Preserving existing client entries for same stylist');
      // Keep existing client entries but update their stylist assignment if needed
      const updatedEntries = clientEntries.map(entry => ({
        ...entry,
        stylists: preSelectedStylist ? [{ id: preSelectedStylist.id, name: preSelectedStylist.name }] : entry.stylists
      }));
      setClientEntries(updatedEntries);
    } else {
      console.log('Creating new client entry for', isSameStylist ? 'same stylist (no existing services)' : 'different stylist');
      // Reset to clean state for new stylist or empty entries
      setClientEntries([{ 
        id: uuidv4(), 
        client: null, 
        services: [], 
        stylists: preSelectedStylist ? [{ id: preSelectedStylist.id, name: preSelectedStylist.name }] : [],
        isForSomeoneElse: false
      }]);
      setAppointmentNotes('');
    }
  };

  const handleTimeChange = (event: SelectChangeEvent, field: 'startTime' | 'endTime') => {
    setAppointmentTime(prev => ({ ...prev, [field]: event.target.value }));
  };

  // Fix addServiceToEntry function to properly assign service and calculate times
  const addServiceToEntry = (entryId: string, service: BaseService) => {
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;

    const lastService = entry.services[entry.services.length - 1];
    let fromTime = appointmentTime.startTime || '10:00';
    if (lastService) {
      fromTime = lastService.toTime;
    } else if (entry.services.length === 0 && appointmentTime.startTime) {
        fromTime = appointmentTime.startTime;
    }
    
    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const serviceDuration = service.duration || 60; 
    let totalMinutes = (fromHour * 60) + fromMinute + serviceDuration;
    const toHour = Math.floor(totalMinutes / 60);
    const toMinute = totalMinutes % 60;
    const toTime = `${toHour}:${toMinute.toString().padStart(2, '0')}`;
    
    // Use the initial clicked stylist when no previous service or explicit selection exists
    let stylistId = lastService?.stylistId || selectedStylistId || '';
    let stylistName = lastService?.stylistName
      || (selectedStylistId ? (stylists.find(s => s.id === selectedStylistId)?.name || '') : '')
      || '';

    const newService: ServiceEntry = {
      id: service.id,
      name: service.name,
      price: service.price || 0,
      stylistId, 
      stylistName,
      fromTime,
      toTime,
      isNew: true, // Mark as new when added via UI to an existing or new booking
      appointmentInstanceId: undefined, // No DB ID yet
      experts: stylistId ? [{ id: stylistId, name: stylistName }] : []
    };

    updateEntry(entryId, {
      services: [...entry.services, newService]
    });
  };

  // Update handleServiceSelection function to simply call addServiceToEntry
  const handleServiceSelection = (service: BaseService) => {
    addServiceToEntry(selectedEntryId, service);
    setServiceSelectedMessage(`${service.name} selected!`);
    setTimeout(() => setServiceSelectedMessage(''), 2000);
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
    
    // Set selectedEntryId - we'll use this for adding services directly from the dropdown
    setSelectedEntryId(entryId);
    
    // Focus and open the service search dropdown
    const serviceSearchInput = document.querySelector('input[placeholder="Search Service By Name"]') as HTMLInputElement;
    if (serviceSearchInput) {
      serviceSearchInput.focus();
      serviceSearchInput.click();
    }
  };

  // Add a function to handle opening service dialog
  const handleOpenServiceDialog = (entryId: string) => {
    setSelectedEntryId(entryId);
  };

  // Add function to handle removing a service
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
      stylistName: stylist.name,
      experts: updatedServices[serviceIndex].experts || [{ id: stylist.id, name: stylist.name }]
    };
    
    updateEntry(entryId, { services: updatedServices });
  };

  // Add function to handle adding another expert
  const handleAddExpert = (entryId: string, serviceIndex: number) => {
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const updatedServices = [...entry.services];
    const currentService = updatedServices[serviceIndex];
    
    // Initialize experts array if it doesn't exist
    if (!currentService.experts) {
      currentService.experts = [];
    }
    
    // Add placeholder expert; user must select stylist before saving
    currentService.experts.push({});
    
    updateEntry(entryId, { services: updatedServices });
  };

  // Add function to update service times
  const updateServiceTime = (entryId: string, serviceIndex: number, field: 'fromTime' | 'toTime', value: string) => {
    const entry = clientEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const updatedServices = [...entry.services];
    
    // Store the original values before updating
    const currentFromTime = updatedServices[serviceIndex].fromTime;
    const currentToTime = updatedServices[serviceIndex].toTime;
    
    // Update the selected field with the new value
    updatedServices[serviceIndex] = {
      ...updatedServices[serviceIndex],
      [field]: value
    };
    
    // After updating, get the new from/to times
    const fromTime = field === 'fromTime' ? value : currentFromTime;
    const toTime = field === 'toTime' ? value : currentToTime;
    
    // Parse times to compare them
    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const [toHour, toMinute] = toTime.split(':').map(Number);
    
    // Convert times to minutes for easier comparison
    const fromTimeMinutes = (fromHour * 60) + fromMinute;
    const toTimeMinutes = (toHour * 60) + toMinute;
    
    // If toTime is earlier than or equal to fromTime, adjust toTime
    if (toTimeMinutes <= fromTimeMinutes) {
      // Add at least 15 minutes to the fromTime
      let newToTimeMinutes = fromTimeMinutes + 15;
      const newToHour = Math.floor(newToTimeMinutes / 60) % 24;
      const newToMinute = newToTimeMinutes % 60;
      const newToTime = `${newToHour}:${newToMinute.toString().padStart(2, '0')}`;
      
      // Update the toTime
      updatedServices[serviceIndex].toTime = newToTime;
      
      // Show notification
      toast.info("End time adjusted to be after start time");
    }
    
    // If changing start time and there are following services, recalculate their times
    if (field === 'fromTime' && serviceIndex < updatedServices.length - 1) {
      // Calculate duration of current service
      const [fromHour, fromMinute] = value.split(':').map(Number);
      const [toHour, toMinute] = updatedServices[serviceIndex].toTime.split(':').map(Number);
      
      // Convert to minutes for calculation
      const fromMinutes = (fromHour * 60) + fromMinute;
      const toMinutes = (toHour * 60) + toMinute;
      
      // Handle case where toTime might be next day (e.g., service ends after midnight)
      let durationMinutes = toMinutes - fromMinutes;
      if (durationMinutes <= 0) {
        // Assume service ends next day
        durationMinutes = (toMinutes + 24 * 60) - fromMinutes;
      }
      
      // Update end time of current service based on new start time and duration
      let totalMinutes = (fromHour * 60) + fromMinute + durationMinutes;
      const newToHour = Math.floor(totalMinutes / 60) % 24;
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
        const nextToHour = Math.floor(totalMinutes / 60) % 24; // Use modulo to keep in 24h format
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
        const nextToHour = Math.floor(totalMinutes / 60) % 24; // Use modulo to keep in 24h format
        const nextToMinute = totalMinutes % 60;
        
        updatedServices[i].toTime = `${nextToHour}:${nextToMinute.toString().padStart(2, '0')}`;
      }
    }
    
    updateEntry(entryId, { services: updatedServices });
  };

  // Combined function for booking or updating
  const handleSaveAppointment = async () => {
    console.log('Saving appointment with data:', {
      clientEntries,
      appointmentTime,
      appointmentNotes
    });

    // --- Validation ---
    let isValid = true;
    
    // Validate client entries
    clientEntries.forEach((entry, idx) => {
      const clientName = entry.client?.full_name?.trim() || entry.client?.inputValue?.trim();
      const isNewClient = !entry.client?.id;
      const clientPhone = entry.client?.phone?.trim();
      const clientEmail = entry.client?.email?.trim();

      if (!clientName) {
        console.error(`Validation Error: Client name missing for entry ${idx + 1}`);
        isValid = false;
      }
      
      if (isNewClient && !clientPhone) {
        console.error(`Validation Error: Phone number required for new client in entry ${idx + 1}`);
        isValid = false;
      } else if (isNewClient && clientPhone && !isValidPhoneNumber(clientPhone)) {
        console.error(`Validation Error: Invalid phone number format for client in entry ${idx + 1}`);
        isValid = false;
        toast.error(`Invalid phone number format for client ${clientName}`);
      }
      
      // Validate email if provided
      if (isNewClient && clientEmail && !isValidEmail(clientEmail)) {
        console.error(`Validation Error: Invalid email format for client in entry ${idx + 1}`);
        isValid = false;
        toast.error(`Invalid email format for client ${clientName}`);
      }
      
      // Validate booker information if booking for someone else
      if (entry.isForSomeoneElse) {
        if (!entry.bookerName) {
          console.error(`Validation Error: Booker's name is required when booking for someone else`);
          isValid = false;
          toast.error("Booker's name is required");
        }
        
        if (!entry.bookerPhone) {
          console.error(`Validation Error: Booker's phone is required when booking for someone else`);
          isValid = false;
          toast.error("Booker's phone is required");
        } else if (entry.bookerPhone && !isValidPhoneNumber(entry.bookerPhone)) {
          console.error(`Validation Error: Invalid booker's phone number format`);
          isValid = false;
          toast.error("Invalid booker's phone number format");
        }
        
        // Validate booker email if provided
        if (entry.bookerEmail && !isValidEmail(entry.bookerEmail)) {
          console.error(`Validation Error: Invalid booker's email format`);
          isValid = false;
          toast.error("Invalid booker's email format");
        }
      }
      
      if (entry.services.length === 0) {
        console.error(`Validation Error: No services selected for entry ${idx + 1}`);
        isValid = false;
      }
    });
    
    // Validate experts for each service
    clientEntries.forEach((entry, idx) => {
      entry.services.forEach((service, sIdx) => {
        const expertsArr = service.experts && service.experts.length > 0 ? service.experts : [{ id: service.stylistId, name: service.stylistName }];
        // Only validate experts that have been started (have either id or name), ignore completely empty objects
        const expertsToValidate = expertsArr.filter(exp => exp.id || exp.name);
        const hasInvalid = expertsToValidate.some(exp => !exp.id);
        if (hasInvalid) {
          console.error(`Validation Error: Service ${service.name} in entry ${idx + 1} has unassigned expert(s).`);
          isValid = false;
          toast.error(`Please assign all experts for service ${service.name}`);
        }
      });
    });
    
    if (!isValid) {
      setSnackbarMessage('Validation failed. Ensure all required fields are filled correctly.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // --- Break Conflict Validation ---
    for (const entry of clientEntries) {
      for (const service of entry.services) {
        if (!service.stylistId) continue;
        const [startHour, startMinute] = service.fromTime.split(':').map(Number);
        const [endHour, endMinute] = service.toTime.split(':').map(Number);
        const baseDateForValidation = new Date(drawerDate);
        baseDateForValidation.setHours(0, 0, 0, 0);
        const serviceStartTime = new Date(baseDateForValidation);
        serviceStartTime.setHours(startHour, startMinute, 0, 0);
        const serviceEndTime = new Date(baseDateForValidation);
        serviceEndTime.setHours(endHour, endMinute, 0, 0);
        if (serviceEndTime <= serviceStartTime) {
          serviceEndTime.setDate(serviceEndTime.getDate() + 1);
        }
        const stylist = stylists.find(s => s.id === service.stylistId);
        if (stylist && stylist.breaks && stylist.breaks.length > 0) {
          const hasBreakConflict = stylist.breaks.some((breakItem: StylistBreak) => {
            const breakStartTime = new Date(breakItem.startTime);
            const breakEndTime = new Date(breakItem.endTime);
            
            // Only check breaks on the same day as drawerDate (baseDateForValidation)
            if (!isSameDay(breakStartTime, baseDateForValidation)) {
              return false;
            }

            // Check for overlap between service time and break time
            return (
              (serviceStartTime >= breakStartTime && serviceStartTime < breakEndTime) || // Service starts during break
              (serviceEndTime > breakStartTime && serviceEndTime <= breakEndTime) || // Service ends during break
              (serviceStartTime <= breakStartTime && serviceEndTime >= breakEndTime) // Break is within service time
            );
          });

          if (hasBreakConflict) {
            const stylistName = stylist.name;
            const serviceName = service.name;
            const timeRange = `${service.fromTime} - ${service.toTime}`;
            
            setSnackbarMessage(`Cannot book appointment: ${serviceName} for ${stylistName} (${timeRange}) conflicts with break time.`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
          }
        }
      }
    }
    // --- End Break Conflict Validation ---
    
    // --- End Validation ---

    const newBookingId = uuidv4();

    if (!editingAppointment) {
      // --- CREATE NEW APPOINTMENT(S) ---
      try {
        // Create appointments for each service (one per service, not per expert)
        const appointmentsToCreatePromises = clientEntries.flatMap(async entry => {
          let currentClientId = entry.client?.id;
          if (!currentClientId && entry.client) {
            const newClient = await handleAddNewClient(entry);
            if (newClient) currentClientId = newClient.id;
            else throw new Error('Failed to ensure client exists for new appointment.');
          }
          if (!currentClientId) throw new Error('Client ID is missing for a new appointment entry.');

          return entry.services.map(service => {
            // Get all experts for this service (fallback to primary stylist if no experts)
            const rawExpertsList = (service.experts && service.experts.length > 0)
              ? service.experts
              : [{ id: service.stylistId, name: service.stylistName }];
            const expertsList = rawExpertsList.filter(e => e.id && e.id.trim() !== '');
            
            if (expertsList.length === 0) return null; // skip if no valid expert

            const [startHour, startMinute] = service.fromTime.split(':').map(Number);
            const [endHour, endMinute] = service.toTime.split(':').map(Number);
            const baseDate = new Date(drawerDate);

            const startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMinute);
            const endTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMinute);
            if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

            // Ensure we have a valid primary stylist ID
            const primaryStylistId = expertsList[0].id;
            if (!primaryStylistId) return null;

            return {
              client_id: currentClientId,
              stylist_id: primaryStylistId, // Primary stylist for the appointment record
              service_id: service.id,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              status: 'scheduled' as Appointment['status'],
              notes: appointmentNotes,
              // Store all experts in clientDetails for join table insertion
              clientDetails: [{
                clientId: currentClientId,
                serviceIds: [service.id],
                stylistIds: expertsList.map(e => e.id).filter((id): id is string => Boolean(id)), // ALL experts for this service
              }],
              booking_id: newBookingId,
              is_for_someone_else: entry.isForSomeoneElse,
              booker_name: entry.bookerName,
              booker_phone: entry.bookerPhone,
              booker_email: entry.bookerEmail
            };
          }).filter(Boolean);
        });
        // Flatten nested arrays and remove nulls
        const appointmentsToCreate = (await Promise.all(appointmentsToCreatePromises)).flat().filter((app): app is NonNullable<typeof app> => app !== null);

        if (appointmentsToCreate.length === 0) {
          setSnackbarMessage('No services selected to book.');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          return;
        }

        // Insert appointments sequentially to avoid race conditions
        for (const appData of appointmentsToCreate) {
          await createAppointment(appData);
        }

        // Send WhatsApp notifications for new appointments
        if (isWhatsAppEnabled()) {
          const primaryEntry = clientEntries[0];
          if (primaryEntry.client && primaryEntry.client.phone && isValidPhoneNumber(primaryEntry.client.phone)) {
            try {
              // Get the first created appointment for notification data
              const firstService = primaryEntry.services[0];
              if (firstService) {
                const appointmentBaseDate = new Date(drawerDate); // Fixed variable scope issue
                const appointmentData = {
                  id: newBookingId, // Use booking ID as reference
                  client_id: primaryEntry.client.id || '',
                  stylist_id: firstService.stylistId,
                  service_id: firstService.id,
                  start_time: new Date(appointmentBaseDate.getFullYear(), appointmentBaseDate.getMonth(), appointmentBaseDate.getDate(), 
                    parseInt(firstService.fromTime.split(':')[0]), 
                    parseInt(firstService.fromTime.split(':')[1])
                  ).toISOString(),
                  end_time: new Date(appointmentBaseDate.getFullYear(), appointmentBaseDate.getMonth(), appointmentBaseDate.getDate(), 
                    parseInt(firstService.toTime.split(':')[0]), 
                    parseInt(firstService.toTime.split(':')[1])
                  ).toISOString(),
                  status: 'scheduled' as const,
                  notes: appointmentNotes
                };

                const clientData = {
                  id: primaryEntry.client.id || '',
                  full_name: primaryEntry.client.full_name,
                  phone: primaryEntry.client.phone,
                  email: primaryEntry.client.email || ''
                };

                const servicesData = primaryEntry.services.map(service => ({
                  id: service.id,
                  name: service.name,
                  price: service.price,
                  duration: 60 // Default duration
                }));

                const stylistsData = primaryEntry.services.map(service => {
                  const stylist = stylists.find(s => s.id === service.stylistId);
                  return {
                    id: service.stylistId,
                    name: stylist?.name || 'Unknown'
                  };
                });

                // Send WhatsApp notification
                await sendAppointmentWhatsAppNotification(
                  'created',
                  appointmentData,
                  clientData,
                  servicesData,
                  stylistsData
                );

                console.log('[WhatsApp] Appointment confirmation sent successfully');
              }
            } catch (whatsappError) {
              console.error('[WhatsApp] Failed to send appointment confirmation:', whatsappError);
              // Don't block the appointment creation if WhatsApp fails
              toast.warning('Appointment created successfully, but WhatsApp notification failed to send');
            }
          } else {
            console.log('[WhatsApp] Skipping notification - invalid or missing phone number');
          }
        }

        setSnackbarMessage('Appointment(s) created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleCloseDrawer();
        // fetchHolidays(); // Commented out as fetchHolidays is not defined
        setLastBookedAppointmentTime(new Date().toISOString());

      } catch (error) {
        console.error('Error creating appointment(s):', error);
        setSnackbarMessage(`Error: ${error instanceof Error ? error.message : 'Could not create appointments'}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      // --- UPDATE EXISTING APPOINTMENT ---
      if (!editingAppointment.id) {
        setSnackbarMessage('Error: No appointment selected for update.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const primaryEntry = clientEntries[0]; 
      if (!primaryEntry || !primaryEntry.client?.id || primaryEntry.services.length === 0) {
        setSnackbarMessage('Client and at least one service are required for update.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      try {
        const existingAppointmentDbData = allAppointments.find(app => app.id === editingAppointment.id);
        const bookingId = existingAppointmentDbData?.booking_id || editingAppointment.booking_id || uuidv4();
        
        // First, find all existing appointments with the same booking_id or client_id on the same day
        const clickedDate = new Date(editingAppointment.start_time);
        const relatedAppointments = allAppointments.filter((app: MergedAppointment) =>
          (app.booking_id === bookingId || 
           (app.client_id === primaryEntry.client!.id && 
            isSameDay(new Date(app.start_time), clickedDate) && 
            !app.is_for_someone_else))
        );

        console.log('[UPDATE] Found related appointments to delete:', relatedAppointments.map(a => a.id));

        // Delete all existing related appointments
        await Promise.all(relatedAppointments.map(app => deleteAppointment(app.id)));

        // Create new appointments for each service (one per service, not per expert)
        const appointmentsToCreate = primaryEntry.services.map(service => {
          // Get all experts for this service (fallback to primary stylist if no experts)
          const rawExpertsList = (service.experts && service.experts.length > 0)
            ? service.experts
            : [{ id: service.stylistId, name: service.stylistName }];
          const expertsList = rawExpertsList.filter(e => e.id && e.id.trim() !== '');
          if (expertsList.length === 0) return null; // skip if no valid expert

          const [startHour, startMinute] = service.fromTime.split(':').map(Number);
          const [endHour, endMinute] = service.toTime.split(':').map(Number);
          const baseDate = new Date(drawerDate);

          const startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMinute);
          const endTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMinute);
          if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);

          // Ensure we have a valid primary stylist ID
          const primaryStylistId = expertsList[0].id;
          if (!primaryStylistId) return null;

          return {
            client_id: primaryEntry.client!.id,
            stylist_id: primaryStylistId, // Primary stylist for the appointment record
            service_id: service.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: editingAppointment.status || 'scheduled' as Appointment['status'],
            notes: appointmentNotes,
            paid: editingAppointment.paid || false,
            billed: editingAppointment.billed || false,
            is_for_someone_else: primaryEntry.isForSomeoneElse,
            // Store all experts in clientDetails for join table insertion
            clientDetails: [{
              clientId: primaryEntry.client!.id,
              serviceIds: [service.id],
              stylistIds: expertsList.map(e => e.id).filter((id): id is string => Boolean(id)), // ALL experts for this service
            }],
            booking_id: bookingId,
            booker_name: primaryEntry.bookerName,
            booker_phone: primaryEntry.bookerPhone,
            booker_email: primaryEntry.bookerEmail
          };
        }).filter((app): app is NonNullable<typeof app> => app !== null);

        // Create all new appointments sequentially
        for (const appData of appointmentsToCreate) {
          await createAppointment(appData);
        }

        console.log('[UPDATE] Created new appointments:', appointmentsToCreate.length);
        
        // Send WhatsApp notifications for appointment updates
        if (isWhatsAppEnabled()) {
          const primaryEntry = clientEntries[0];
          if (primaryEntry.client && primaryEntry.client.phone && isValidPhoneNumber(primaryEntry.client.phone)) {
            try {
              const firstService = primaryEntry.services[0];
              if (firstService && editingAppointment) {
                // Calculate the start and end times for the first service
                const [startHour, startMinute] = firstService.fromTime.split(':').map(Number);
                const [endHour, endMinute] = firstService.toTime.split(':').map(Number);
                const baseDate = new Date(drawerDate);
                
                const serviceStartTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMinute);
                const serviceEndTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMinute);
                if (serviceEndTime <= serviceStartTime) serviceEndTime.setDate(serviceEndTime.getDate() + 1);

                const appointmentData = {
                  id: editingAppointment.id,
                  client_id: primaryEntry.client.id,
                  stylist_id: firstService.stylistId,
                  service_id: firstService.id,
                  start_time: serviceStartTime.toISOString(),
                  end_time: serviceEndTime.toISOString(),
                  status: editingAppointment.status || 'scheduled',
                  notes: appointmentNotes
                };

                const clientData = {
                  id: primaryEntry.client.id,
                  full_name: primaryEntry.client.full_name,
                  phone: primaryEntry.client.phone,
                  email: primaryEntry.client.email || ''
                };

                const servicesData = primaryEntry.services.map(service => ({
                  id: service.id,
                  name: service.name,
                  price: service.price,
                  duration: 60 // Default duration
                }));

                const stylistsData = primaryEntry.services.map(service => {
                  const stylist = stylists.find(s => s.id === service.stylistId);
                  return {
                    id: service.stylistId,
                    name: stylist?.name || 'Unknown'
                  };
                });

                // Send WhatsApp notification for update
                await sendAppointmentWhatsAppNotification(
                  'updated',
                  appointmentData,
                  clientData,
                  servicesData,
                  stylistsData
                );

                console.log('[WhatsApp] Appointment update notification sent successfully');
              }
            } catch (whatsappError) {
              console.error('[WhatsApp] Failed to send appointment update notification:', whatsappError);
              // Don't block the appointment update if WhatsApp fails
              toast.warning('Appointment updated successfully, but WhatsApp notification failed to send');
            }
          } else {
            console.log('[WhatsApp] Skipping update notification - invalid or missing phone number');
          }
        }
        
        setSnackbarMessage('Appointment updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleCloseDrawer();
        // fetchHolidays(); // Commented out as fetchHolidays is not defined
      } catch (error) {
        console.error('Error updating appointment:', error);
        setSnackbarMessage(`Error: ${error instanceof Error ? error.message : 'Could not update appointment'}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAddBreak = async (stylistId: string, breakData: Omit<Break, 'id'>) => {
    try {
      const stylist = (stylists || []).find(s => s.id === stylistId);
      if (!stylist) throw new Error("Stylist not found");
      const newBreak = { ...breakData, id: uuidv4() };
      const currentBreaks = Array.isArray(stylist.breaks) ? stylist.breaks : [];
      const updatedBreaks = [...currentBreaks, newBreak];
      await updateStylist({ id: stylistId, breaks: updatedBreaks });
      
      // The cache will be automatically updated by react-query
      toast.success('Break added successfully');
    } catch (error) {
      console.error('Error adding break:', error);
      toast.error(`Failed to add break: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteBreak = async (stylistId: string, breakId: string) => {
    try {
      console.log('Deleting break:', { stylistId, breakId });
      const stylist = (stylists || []).find(s => s.id === stylistId);
      if (!stylist || !stylist.breaks) throw new Error("Stylist or breaks not found");
      
      // Confirm stylist has this break in their array
      const breakExists = stylist.breaks.some((b: any) => b.id === breakId);
      if (!breakExists) {
        console.error('Break not found in stylist breaks array:', { breakId, stylistBreaks: stylist.breaks });
        throw new Error(`Break with ID ${breakId} not found for stylist`);
      }
      
      const updatedBreaks = stylist.breaks.filter((b: any) => b.id !== breakId);
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
      const stylist = (stylists || []).find(s => s.id === stylistId);
      if (!stylist || !stylist.breaks) throw new Error("Stylist or breaks not found");
      
      // Confirm stylist has this break in their array
      const breakIndex = stylist.breaks.findIndex((b: any) => b.id === breakId);
      if (breakIndex === -1) {
        console.error('Break not found in stylist breaks array:', { breakId, stylistBreaks: stylist.breaks });
        throw new Error(`Break with ID ${breakId} not found for stylist`);
      }
      
      const updatedBreaks = stylist.breaks.map((b: any) => 
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
    setClientEntries([{ id: uuidv4(), client: null, services: [], stylists: [], isForSomeoneElse: false }]);
    // Don't reset appointment times when closing drawer
    setAppointmentNotes('');
    setServiceSearchTerm('');
    setServiceGenderFilter(null);
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

  // Update handleDeleteAppointment function
  const handleDeleteAppointment = () => {
    if (!editingAppointment) return;
    
    setDeleteDialogOpen(true);
  };
  
  // Function to confirm and execute appointment deletion
  const confirmDeleteAppointment = async () => {
    if (!editingAppointment) return;
    
    try {
      // Send WhatsApp cancellation notification before deleting
      if (isWhatsAppEnabled() && editingAppointment) {
        const client = clients.find(c => c.id === editingAppointment.client_id);
        if (client && client.phone && isValidPhoneNumber(client.phone)) {
          try {
            const service = services.find(s => s.id === editingAppointment.service_id);
            const stylist = stylists.find(s => s.id === editingAppointment.stylist_id);
            
            if (service && stylist) {
              const appointmentData = {
                id: editingAppointment.id,
                client_id: editingAppointment.client_id,
                stylist_id: editingAppointment.stylist_id,
                service_id: editingAppointment.service_id,
                start_time: editingAppointment.start_time,
                end_time: editingAppointment.end_time,
                status: editingAppointment.status,
                notes: editingAppointment.notes || ''
              };

              const clientData = {
                id: client.id,
                full_name: client.full_name,
                phone: client.phone,
                email: client.email || ''
              };

              const servicesData = [{
                id: service.id,
                name: service.name,
                price: service.price || 0,
                duration: service.duration || 60
              }];

              const stylistsData = [{
                id: stylist.id,
                name: stylist.name
              }];

              // Send WhatsApp cancellation notification
              await sendAppointmentWhatsAppNotification(
                'cancelled',
                appointmentData,
                clientData,
                servicesData,
                stylistsData
              );

              console.log('[WhatsApp] Appointment cancellation notification sent successfully');
            }
          } catch (whatsappError) {
            console.error('[WhatsApp] Failed to send cancellation notification:', whatsappError);
            // Continue with deletion even if WhatsApp fails
          }
        }
      }

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

  // Function to view client history
  const handleViewClientHistory = useCallback(async () => {
    // Only proceed if we have a selected client with ID
    const selectedClient = clientEntries[0]?.client;
    if (!selectedClient?.id) return;
    
    try {
      // Filter appointments for this client
      const clientAppointments = allAppointments.filter(
        (appointment: MergedAppointment) => appointment.client_id === selectedClient.id
      );
      
      // Sort by date (newest first)
      clientAppointments.sort((a: MergedAppointment, b: MergedAppointment) => 
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      
      // Set client history
      setClientHistory(clientAppointments);
      setShowingClientHistory(true);
    } catch (error) {
      console.error('Error fetching client history:', error);
      toast.error('Could not load client history');
    }
  }, [clientEntries, allAppointments]);

  // Close client history panel
  const handleCloseClientHistory = () => {
    setShowingClientHistory(false);
  };

  // Function to add a new client
  const handleAddNewClient = async (clientEntry: ExtendedClientAppointmentEntry) => {
    if (!clientEntry.client) return null;
    
    const { full_name, phone, email = '' } = clientEntry.client;
    
    if (!full_name || !phone) {
      toast.error('Name and phone are required for new clients');
      return null;
    }
    
    try {
      const newClient = await updateClientFromAppointment(
        full_name,
        phone,
        email,
        'Created from appointment booking'
      );
      
      // Update entry with the new client
      updateEntry(clientEntry.id, { client: { ...newClient } });
      
      // Show success notification
      toast.success(`Client ${full_name} created successfully!`);
      return newClient;
    } catch (error) {
      console.error('Error creating new client:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create client: ${errorMessage}`);
      return null;
    }
  };

  // Update the handler for adding a new service
  const handleAddNewServiceClick = () => {
    const currentEntryId = clientEntries[0]?.id;
    if (!currentEntryId) {
      console.error("Client entry ID not found.");
      toast.error("Cannot add service: client context missing.");
      return;
    }

    const entry = clientEntries.find(e => e.id === currentEntryId);
    const hasMissingStylist = entry?.services.some(service => !service.stylistId);
    
    if (hasMissingStylist) {
      toast.warn("Please assign an expert to all services before adding a new one");
      return;
    }
    
    setSelectedEntryId(currentEntryId);
    
    const lastService = entry?.services[entry.services.length - 1];
    const fromTime = lastService?.toTime || appointmentTime.startTime || '10:00';
    const defaultStylistId = lastService?.stylistId || entry?.stylists[0]?.id || '';

    setInlineServiceData({
      serviceId: '',
      stylistId: defaultStylistId,
      fromTime,
      toTime: fromTime,
      additionalExperts: []
    });
    
    setShowInlineServiceSelection(true);
    setIsInlineServiceDropdownOpen(false); // Ensure dropdown is closed initially
  };

  // Add handler for finalizing service selection
  const handleInlineServiceAdd = () => {
    if (!inlineServiceData.serviceId) {
      toast.warn("Please select a service");
      return;
    }
    
    if (!inlineServiceData.stylistId) {
      toast.warn("Please select an expert");
      return;
    }
    
    // Validate additional experts - check if any are partially filled
    if (inlineServiceData.additionalExperts) {
      const hasIncompleteExperts = inlineServiceData.additionalExperts.some(expert => !expert.id || expert.id.trim() === '');
      if (hasIncompleteExperts) {
        toast.warn("Please assign all additional experts or remove empty ones");
        return;
      }
    }
    
    // Find the selected service details
    const selectedService = activeServices.find(s => s.id === inlineServiceData.serviceId);
    if (!selectedService) {
      toast.error("Selected service not found");
      return;
    }
    
    // Find stylist details
    const selectedStylist = stylists.find(s => s.id === inlineServiceData.stylistId);
    if (!selectedStylist) {
      toast.error("Selected expert not found");
      return;
    }
    
    // Get fromTime and prepare toTime
    const fromTime = inlineServiceData.fromTime;
    let toTime = inlineServiceData.toTime;
    
    // Parse times for validation
    const [fromHour, fromMinute] = fromTime.split(':').map(Number);
    const [toHour, toMinute] = toTime.split(':').map(Number);
    
    // Convert to minutes for easier comparison
    const fromTimeMinutes = (fromHour * 60) + fromMinute;
    const toTimeMinutes = (toHour * 60) + toMinute;
    
    // Calculate the service duration
    const serviceDuration = selectedService.duration || 60; // Default to 60 minutes
    
    // If toTime is equal to fromTime or earlier than fromTime, calculate a new toTime
    if (toTimeMinutes <= fromTimeMinutes) {
      let totalMinutes = fromTimeMinutes + serviceDuration;
      const newToHour = Math.floor(totalMinutes / 60) % 24; // Use modulo for 24h format
      const newToMinute = totalMinutes % 60;
      
      toTime = `${newToHour}:${newToMinute.toString().padStart(2, '0')}`;
      
      // Show notification about the adjusted time
      toast.info("End time adjusted to be after start time");
    }
    
    // Collect all experts (primary + additional)
    const allExperts = [
      { id: selectedStylist.id, name: selectedStylist.name }
    ];
    
    // Add additional experts if they exist
    if (inlineServiceData.additionalExperts) {
      const validAdditionalExperts = inlineServiceData.additionalExperts.filter(expert => expert.id && expert.id.trim() !== '');
      allExperts.push(...validAdditionalExperts);
    }

    // Create the new service entry
    const newService: ServiceEntry = {
      id: selectedService.id,
      name: selectedService.name,
      price: selectedService.price || 0,
      stylistId: selectedStylist.id,
      stylistName: selectedStylist.name,
      fromTime: fromTime,
      toTime: toTime,
      experts: allExperts
    };
    
    // Add to the client entry
    const entry = clientEntries.find(e => e.id === selectedEntryId);
    if (entry) {
      updateEntry(selectedEntryId, {
        services: [...entry.services, newService]
      });
      
      // Reset and hide the inline selection
      setInlineServiceData({ serviceId: '', stylistId: '', fromTime: '', toTime: '', additionalExperts: [] });
      setShowInlineServiceSelection(false);
      
      setServiceSelectedMessage(`${selectedService.name} added successfully!`);
      setTimeout(() => setServiceSelectedMessage(''), 2000);
    }
  };

  // New loading check after all hooks and before main return
  const isLoading = loadingAppointments || loadingServices || loadingStylists || loadingClients || loadingCollections;
  if (isLoading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Add a helper function to convert 24h time to 12h format with AM/PM
  const convertTo12Hour = (time24: string): string => {
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const hour12 = hour % 12 || 12;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minuteStr} ${period}`;
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
          {viewMode === 'calendar' ? '' : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            overflow: 'hidden',
            transition: 'right 0.3s ease',
          }}
        >
          {viewMode === 'calendar' ? (
            <StylistDayView
              stylists={(stylists?.map(s => ({ ...s, breaks: s.breaks || [] })) || []) as any}
              appointments={allAppointments}
              services={services}
              selectedDate={selectedDate}
              onSelectTimeSlot={handleDayViewSelect}
              onAppointmentClick={handleAppointmentClick}
              onAddBreak={handleAddBreak}
              onDeleteBreak={handleDeleteBreak}
              onUpdateBreak={handleUpdateBreak}
              onDateChange={setSelectedDate}
              onUpdateAppointment={(appointmentId, appointmentUpdates) => 
                Promise.resolve(updateAppointment({ id: appointmentId, ...appointmentUpdates }))
              }
              onDeleteAppointment={(appointmentId) => 
                Promise.resolve(deleteAppointment(appointmentId))
              }
              lastBookedAppointmentTime={lastBookedAppointmentTime}
              holidays={holidays}
              clients={clients}
            />
          ) : (
            <FutureAppointmentsList
              appointments={allAppointments || []}
              stylists={stylists || []}
              services={services || []}
              clients={clients || []}
              onDeleteAppointment={deleteAppointment}
              onEditAppointment={handleAppointmentClick}
              onUpdateAppointment={async (appointmentId: string, updates: any) => {
                await updateAppointment({ id: appointmentId, ...updates });
              }}
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
        {/* Header with back button, title, and calendar icon */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider', position: 'relative' }}
        >
          <IconButton onClick={handleCloseDrawer} sx={{ position: 'absolute', left: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#6B8E23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
          <Typography variant="h6" sx={{ color: '#6B8E23', flex: 1, textAlign: 'center' }}>
            {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
          </Typography>
          <IconButton
            onClick={(e) => setDrawerDatePickerAnchorEl(e.currentTarget)}
            sx={{ position: 'absolute', right: 8 }}
          >
            <CalendarIcon sx={{ color: '#6B8E23' }} />
          </IconButton>
        </Box>

        {/* Date Picker Popover */}
        <Popover
          open={datePickerOpen}
          anchorEl={drawerDatePickerAnchorEl}
          onClose={() => setDrawerDatePickerAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={drawerDate}
              onChange={(newDate) => newDate && setDrawerDate(newDate)}
              slotProps={{ textField: { sx: { m: 1 } } }}
            />
          </LocalizationProvider>
        </Popover>

        {/* Form Content Area - Allow Scrolling */}
        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, bgcolor: '#f5f5f0' }}>
                      {/* Guest Details Section */}
            <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                <span style={{ marginRight: '8px' }}>1.</span> Guest Details
              </Typography>
              {clientEntries[0]?.client?.id ? (
                <Button 
                  sx={{ 
                    color: '#6B8E23', 
                    textTransform: 'none' 
                  }}
                  size="small"
                  onClick={handleViewClientHistory}
                >
                  Client History
                </Button>
              ) : null}
            </Box>
            
            {/* Client search field */}
            <Autocomplete<Client & { inputValue?: string }, false, false, true>
              fullWidth
              freeSolo
              // @ts-ignore: Allow custom filterOptions for client search
              filterOptions={(options, params) => {
                const filtered = filterClients(options, params);
                // Suggest the creation of a new value
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option.full_name);
                if (inputValue !== '' && !isExisting) {
                  // Push new client option (bypass TS structural checks)
                  (filtered as any).push({
                    inputValue: `Add new client: "${inputValue}"`,
                    full_name: inputValue,
                    id: '',
                    phone: '',
                    email: '',
                    created_at: ''
                  } as unknown as Client & { inputValue: string });
                }
                return filtered;
              }}
              options={clients || []}
              getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                  return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                  return option.inputValue;
                }
                // Regular option from list
                return `${option.full_name}${option.phone ? ` (${option.phone})` : ''}`;
              }}
              value={clientEntries[0]?.client}
              onChange={(_, newValue) => {
                if (typeof newValue === 'string') {
                  // User typed a string, create a new client
                  updateEntry(clientEntries[0].id, { 
                    client: { 
                      id: '',
                      full_name: newValue,
                      phone: '',
                      email: '',
                      created_at: ''
                    } 
                  });
                } else if (newValue && newValue.inputValue) {
                  // Create a new client from the "Add new" option
                  updateEntry(clientEntries[0].id, { 
                    client: { 
                      id: '',
                      full_name: newValue.full_name,
                      phone: '',
                      email: '',
                      created_at: ''
                    } 
                  });
                } else {
                  // Regular option selected
                  updateEntry(clientEntries[0].id, { client: newValue });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search By Name Or No."
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                    sx: {
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0'
                      }
                    }
                  }}
                />
              )}
              renderOption={(props, option) => {
                // Show "Add new client" option differently
                if (option.inputValue) {
                  return (
                    <li {...props} style={{ fontStyle: 'italic', color: '#6B8E23' }}>
                      {option.inputValue}
                    </li>
                  );
                }
                
                // Regular client option
                return (
                  <li {...props}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">{option.full_name}</Typography>
                      {option.phone && (
                        <Typography variant="body2" color="text.secondary">
                          {option.phone}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
              ListboxProps={{
                style: { maxHeight: '250px', overflow: 'auto' },
              }}
            />

            {/* No client selected message */}
            {!clientEntries[0]?.client && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Select guest details
              </Typography>
            )}
            
            {/* Phone input for new client */}
            {clientEntries[0]?.client && !clientEntries[0]?.client.id && (
              <TextField
                fullWidth
                label="Mobile Number *"
                value={clientEntries[0]?.client?.phone || ''}
                onChange={(e) => {
                  // Update phone for a new client entry (client guaranteed non-null here)
                  const currentClient = clientEntries[0].client!;
                  const updatedClient: Client & { inputValue?: string } = {
                    ...currentClient,
                    phone: e.target.value
                  };
                  updateEntry(clientEntries[0].id, { client: updatedClient });
                }}
                required
                error={!clientEntries[0]?.client?.phone || !!(clientEntries[0]?.client?.phone && !isValidPhoneNumber(clientEntries[0]?.client?.phone))}
                helperText={
                  !clientEntries[0]?.client?.phone 
                    ? "Phone required for new client" 
                    : (clientEntries[0]?.client?.phone && !isValidPhoneNumber(clientEntries[0]?.client?.phone))
                      ? "Please enter a valid phone number"
                      : null
                }
                sx={{ mt: 2 }}
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    }
                  }
                }}
              />
            )}

            {/* Client Email Field for New Clients */}
            {clientEntries[0]?.client && !clientEntries[0]?.client.id && (
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={clientEntries[0]?.client?.email || ''}
                onChange={(e) => {
                  // Update email for a new client entry
                  const currentClient = clientEntries[0].client!;
                  const updatedClient: Client & { inputValue?: string } = {
                    ...currentClient,
                    email: e.target.value
                  };
                  updateEntry(clientEntries[0].id, { client: updatedClient });
                }}
                error={!!(clientEntries[0]?.client?.email && !isValidEmail(clientEntries[0]?.client?.email))}
                helperText={
                  (clientEntries[0]?.client?.email && !isValidEmail(clientEntries[0]?.client?.email))
                    ? "Please enter a valid email address"
                    : null
                }
                sx={{ mt: 2 }}
                InputProps={{
                  sx: {
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    }
                  }
                }}
              />
            )}

            {/* Add 'Book for someone else' checkbox */}
            {clientEntries[0]?.client && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={clientEntries[0].isForSomeoneElse}
                      onChange={(e) => updateEntry(clientEntries[0].id, { isForSomeoneElse: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Book for someone else"
                  sx={{ mt: 2 }}
                />
                
                {/* Booker's Information Fields */}
                {clientEntries[0].isForSomeoneElse && (
                  <Box sx={{ mt: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Booker's Information</Typography>
                    
                    <TextField
                      fullWidth
                      label="Booker's Name *"
                      value={clientEntries[0].bookerName || ''}
                      onChange={(e) => updateEntry(clientEntries[0].id, { bookerName: e.target.value })}
                      required
                      error={!clientEntries[0].bookerName}
                      helperText={!clientEntries[0].bookerName ? "Booker's name is required" : ""}
                      sx={{ mb: 2 }}
                      InputProps={{
                        sx: {
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0'
                          }
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Booker's Phone *"
                      value={clientEntries[0].bookerPhone || ''}
                      onChange={(e) => updateEntry(clientEntries[0].id, { bookerPhone: e.target.value })}
                      required
                      error={!clientEntries[0].bookerPhone || !!(clientEntries[0].bookerPhone && !isValidPhoneNumber(clientEntries[0].bookerPhone))}
                      helperText={
                        !clientEntries[0].bookerPhone 
                          ? "Booker's phone is required" 
                          : (clientEntries[0].bookerPhone && !isValidPhoneNumber(clientEntries[0].bookerPhone))
                            ? "Please enter a valid phone number"
                            : null
                      }
                      sx={{ mb: 2 }}
                      InputProps={{
                        sx: {
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0'
                          }
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Booker's Email"
                      type="email"
                      value={clientEntries[0].bookerEmail || ''}
                      onChange={(e) => updateEntry(clientEntries[0].id, { bookerEmail: e.target.value })}
                      error={!!(clientEntries[0].bookerEmail && !isValidEmail(clientEntries[0].bookerEmail))}
                      helperText={
                        (clientEntries[0].bookerEmail && !isValidEmail(clientEntries[0].bookerEmail))
                          ? "Please enter a valid email address"
                          : null
                      }
                      sx={{ mb: 2 }}
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
                )}
              </>
            )}

            {/* Client History Dialog */}
            <Dialog
              open={showingClientHistory}
              onClose={handleCloseClientHistory}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle sx={{ bgcolor: '#6B8E23', color: 'white' }}>
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
                      const service = services.find(s => s.id === appointment.service_id);
                      // Find stylist details
                      const stylist = stylists.find(s => s.id === appointment.stylist_id);
                      
                      return (
                        <ListItem
                          key={appointment.id}
                          divider
                          sx={{ 
                            borderLeft: '4px solid #6B8E23',
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
          <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Typography variant="body1" fontWeight="medium" mb={2}>
              <span style={{ marginRight: '8px' }}>2.</span> Service Details
            </Typography>
            
            {/* Service search dropdown */}
            <Autocomplete<ServiceOption, false, false, true>
              fullWidth
              freeSolo
              openOnFocus
              inputValue={serviceSearchTerm}
              ListboxComponent={CustomAutocompleteListbox as any}
              ListboxProps={{
                style: { padding: 0, maxHeight: 300 },
                serviceGenderFilterState: serviceGenderFilter,
                setServiceGenderFilterState: setServiceGenderFilter
              } as any}
              options={activeServices.filter(service => 
                (!serviceSearchTerm || service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())) &&
                (serviceGenderFilter === null || (service as ServiceWithGender).gender === serviceGenderFilter)
              )}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              renderOption={(props, option) => (
                <MenuItem component="li" {...props} key={option.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      {(option as ServiceWithGender).gender && (
                        <Typography variant="caption" color="text.secondary">
                          {(option as ServiceWithGender).gender === 'male' ? 'Male' : 'Female'}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight="medium">₹{option.price}</Typography>
                  </Box>
                </MenuItem>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search Service By Name"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    }
                  }}
                />
              )}
              onChange={(_, newValue) => {
                // Handle service selection immediately
                if (newValue && typeof newValue === 'object' && !newValue.groupHeader) {
                  const entryId = clientEntries[0].id;
                  const entry = clientEntries.find(e => e.id === entryId);
                  // Ensure all prior services have an expert assigned
                  if (entry?.services.some(s => !s.stylistId)) {
                    toast.warn("Please assign an expert to all services before adding a new one");
                    return;
                  }
                  addServiceToEntry(entryId, newValue as BaseService);
                  // Clear search term so dropdown shows fresh list on next open
                  setServiceSearchTerm('');
                  // Show confirmation message
                  setServiceSelectedMessage(`${(newValue as BaseService).name} selected!`);
                  setTimeout(() => setServiceSelectedMessage(''), 2000);
                }
              }}
              onInputChange={(_, newInputValue) => setServiceSearchTerm(newInputValue)}
              sx={{ mb: 3 }}
            />

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
                  {/* Display all assigned experts prominently */}
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Assigned Experts:
                  </Typography>
                  
                  {/* Show all experts as chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {(service.experts && service.experts.length > 0 ? service.experts : [{ id: service.stylistId, name: service.stylistName }])
                      .filter(expert => expert.id) // Only show experts with valid IDs
                      .map((expert, expertIndex) => (
                        <Chip
                          key={`${expert.id}-${expertIndex}`}
                          label={expert.name || 'Unknown Expert'}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: '#6B8E23',
                            color: '#6B8E23',
                            '& .MuiChip-deleteIcon': {
                              color: '#6B8E23',
                              '&:hover': {
                                color: '#566E1C'
                              }
                            }
                          }}
                          onDelete={() => {
                            if (clientEntries[0]?.services) {
                              const updatedServices = [...clientEntries[0].services];
                              if (updatedServices[serviceIndex].experts && updatedServices[serviceIndex].experts!.length > 1) {
                                // Remove this expert from the experts array
                                updatedServices[serviceIndex].experts!.splice(expertIndex, 1);
                                // If we removed the primary expert (index 0), update stylistId and stylistName
                                if (expertIndex === 0 && updatedServices[serviceIndex].experts!.length > 0) {
                                  const newPrimary = updatedServices[serviceIndex].experts![0];
                                  updatedServices[serviceIndex].stylistId = newPrimary.id || '';
                                  updatedServices[serviceIndex].stylistName = newPrimary.name || '';
                                }
                              } else {
                                // If this is the last expert, clear the stylist info but keep the service
                                updatedServices[serviceIndex].stylistId = '';
                                updatedServices[serviceIndex].stylistName = '';
                                updatedServices[serviceIndex].experts = [];
                              }
                              updateEntry(clientEntries[0].id, { services: updatedServices });
                            }
                          }}
                        />
                      ))}
                  </Box>

                  {/* Add Expert Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddExpert(clientEntries[0].id, serviceIndex)}
                    sx={{ 
                      mb: 2,
                      borderColor: '#6B8E23',
                      color: '#6B8E23',
                      '&:hover': {
                        borderColor: '#566E1C',
                        backgroundColor: 'rgba(107, 142, 35, 0.04)'
                      }
                    }}
                  >
                    Add Expert
                  </Button>

                  {/* Expert selection dropdown for unassigned experts */}
                  {service.experts?.some(expert => !expert.id) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Assign remaining experts:
                      </Typography>
                      {service.experts?.map((expert, expertIndex) => 
                        !expert.id ? (
                          <Box key={`unassigned-${expertIndex}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Autocomplete<Stylist, false, false, false>
                              fullWidth
                              options={stylists.filter((stylist: Stylist) => 
                                stylist.available !== false && 
                                // Don't show already assigned experts
                                !service.experts?.some(assignedExpert => assignedExpert.id === stylist.id)
                              ).sort((a, b) => a.name.localeCompare(b.name))}
                              getOptionLabel={(option: Stylist) => option.name}
                              value={null}
                              onChange={(_, newValue: Stylist | null) => {
                                if (newValue && clientEntries[0]?.services) {
                                  const updatedServices = [...clientEntries[0].services];
                                  if (!updatedServices[serviceIndex].experts) updatedServices[serviceIndex].experts = [];
                                  updatedServices[serviceIndex].experts![expertIndex] = { id: newValue.id, name: newValue.name };
                                  
                                  // If this is the first expert being assigned and there's no primary stylist, make this the primary
                                  if (!updatedServices[serviceIndex].stylistId) {
                                    updatedServices[serviceIndex].stylistId = newValue.id;
                                    updatedServices[serviceIndex].stylistName = newValue.name;
                                  }
                                  
                                  updateEntry(clientEntries[0].id, { services: updatedServices });
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Expert"
                                  variant="outlined"
                                  size="small"
                                  InputProps={{
                                    ...params.InputProps,
                                  }}
                                />
                              )}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (clientEntries[0]?.services) {
                                  const updatedServices = [...clientEntries[0].services];
                                  updatedServices[serviceIndex].experts?.splice(expertIndex, 1);
                                  updateEntry(clientEntries[0].id, { services: updatedServices });
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ) : null
                      )}
                    </Box>
                  )}
                </Box>
                
                {/* From/To Time Selection */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>From Time</InputLabel>
                      <Select
                        value={service.fromTime}
                        label="From Time"
                        displayEmpty
                        renderValue={(value) => convertTo12Hour(value)}
                        onChange={(e) => updateServiceTime(clientEntries[0].id, serviceIndex, 'fromTime', e.target.value)}
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
                        displayEmpty
                        renderValue={(value) => convertTo12Hour(value)}
                        onChange={(e) => updateServiceTime(clientEntries[0].id, serviceIndex, 'toTime', e.target.value)}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={`to-${option.value}`} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            {/* Add New Service Button - Only show if at least one service is already selected */}
            {clientEntries[0].services.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<AddIcon />}
                  onClick={handleAddNewServiceClick}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: '20px',
                    bgcolor: 'white',
                    borderColor: '#6B8E23',
                    color: '#6B8E23',
                    '&:hover': {
                      borderColor: '#566E1C',
                      bgcolor: 'rgba(107, 142, 35, 0.04)'
                    }
                  }}
                >
                  Add New Service
                </Button>
              </Box>
            )}

            {/* New Inline Service Selection Row */}
            {showInlineServiceSelection && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                border: '1px dashed', 
                borderColor: '#6B8E23', 
                borderRadius: 1,
                bgcolor: '#FAFFF2'
              }}>
                <Typography variant="subtitle2" fontWeight="medium" mb={2}>
                  Add New Service
                </Typography>
                
                {/* Searchable service selection */}
                <Autocomplete
                  fullWidth
                  // Removed openOnFocus and autoHighlight
                  options={activeServices}
                  open={isInlineServiceDropdownOpen} // Control open state
                  onOpen={() => setIsInlineServiceDropdownOpen(true)}
                  onClose={() => setIsInlineServiceDropdownOpen(false)}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={inlineServiceData.serviceId ? activeServices.find(s => s.id === inlineServiceData.serviceId) || null : null}
                  onChange={(_, newValue) => {
                    if (!newValue) {
                      setInlineServiceData(prev => ({
                        ...prev,
                        serviceId: ''
                      }));
                      // setIsInlineServiceDropdownOpen(false); // It will be closed by onClose
                      return;
                    }
                    
                    setInlineServiceData(prev => ({
                      ...prev,
                      serviceId: newValue.id
                    }));
                    
                    const serviceDuration = newValue.duration || 60;
                    const [fromHour, fromMinute] = inlineServiceData.fromTime.split(':').map(Number);
                    
                    let totalMinutes = (fromHour * 60) + fromMinute + serviceDuration;
                    const toHour = Math.floor(totalMinutes / 60);
                    const toMinute = totalMinutes % 60;
                    
                    const toTime = `${toHour}:${toMinute.toString().padStart(2, '0')}`;
                    
                    setInlineServiceData(prev => ({
                      ...prev,
                      toTime
                    }));
                    setIsInlineServiceDropdownOpen(false); // Close dropdown after selection
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search & Select Service"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            <Box component="span" sx={{ display: 'flex', marginRight: 1, pointerEvents: 'none' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="#757575" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Box>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                        sx: {
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0'
                          }
                        }
                      }}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: '#757575'
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <MenuItem {...props} key={option.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" fontWeight="medium">₹{option.price}</Typography>
                      </Box>
                    </MenuItem>
                  )}
                  filterOptions={(options, state) => {
                    return options.filter(option => 
                      option.name.toLowerCase().includes(state.inputValue.toLowerCase())
                    );
                  }}
                  sx={{ mb: 2 }}
                />
                
                {/* Expert Selection */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Autocomplete<Stylist, false, false, false>
                    fullWidth
                    options={stylists.filter((stylist: Stylist) => stylist.available !== false).sort((a, b) => a.name.localeCompare(b.name))}
                    getOptionLabel={(option: Stylist) => option.name}
                    value={stylists.find((s: Stylist) => s.id === inlineServiceData.stylistId) || null}
                    onChange={(_, newValue: Stylist | null) => { // Added type for newValue
                      setInlineServiceData(prev => ({
                        ...prev,
                        stylistId: newValue ? newValue.id : ''
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Expert"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                        }}
                      />
                    )}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setInlineServiceData(prev => ({
                        ...prev,
                        additionalExperts: [...(prev.additionalExperts || []), { id: '', name: '' }]
                      }));
                    }}
                    sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                  >
                    Add Expert
                  </Button>
                </Box>

                {/* Additional experts for inline service */}
                {inlineServiceData.additionalExperts?.map((expert, expertIndex) => (
                  <Box key={expertIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Autocomplete<Stylist, false, false, false>
                      fullWidth
                      options={stylists.filter((stylist: Stylist) => stylist.available !== false).sort((a, b) => a.name.localeCompare(b.name))}
                      getOptionLabel={(option: Stylist) => option.name}
                      value={stylists.find((s: Stylist) => s.id === expert.id) || null}
                      onChange={(_, newValue: Stylist | null) => {
                        if (newValue) {
                          setInlineServiceData(prev => {
                            const updatedExperts = [...(prev.additionalExperts || [])];
                            updatedExperts[expertIndex] = { id: newValue.id, name: newValue.name };
                            return {
                              ...prev,
                              additionalExperts: updatedExperts
                            };
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Expert ${expertIndex + 2}`}
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                          }}
                        />
                      )}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setInlineServiceData(prev => {
                          const updatedExperts = [...(prev.additionalExperts || [])];
                          updatedExperts.splice(expertIndex, 1);
                          return {
                            ...prev,
                            additionalExperts: updatedExperts
                          };
                        });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                
                {/* Time Selection */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>From Time</InputLabel>
                      <Select
                        value={inlineServiceData.fromTime}
                        label="From Time"
                        displayEmpty
                        renderValue={(value) => convertTo12Hour(value)}
                        onChange={(e) => {
                          const newFromTime = e.target.value as string;
                          setInlineServiceData(prev => ({
                            ...prev,
                            fromTime: newFromTime
                          }));
                          
                          // Update end time based on service duration
                          const service = activeServices.find(s => s.id === inlineServiceData.serviceId);
                          if (service) {
                            const [fromHour, fromMinute] = newFromTime.split(':').map(Number);
                            const serviceDuration = service.duration || 60;
                            
                            let totalMinutes = (fromHour * 60) + fromMinute + serviceDuration;
                            const toHour = Math.floor(totalMinutes / 60);
                            const toMinute = totalMinutes % 60;
                            
                            const toTime = `${toHour}:${toMinute.toString().padStart(2, '0')}`;
                            
                            setInlineServiceData(prev => ({
                              ...prev,
                              toTime
                            }));
                          }
                        }}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={`inline-from-${option.value}`} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>To Time</InputLabel>
                      <Select
                        value={inlineServiceData.toTime}
                        label="To Time"
                        displayEmpty
                        renderValue={(value) => convertTo12Hour(value)}
                        onChange={(e) => {
                          setInlineServiceData(prev => ({
                            ...prev,
                            toTime: e.target.value as string
                          }));
                        }}
                      >
                        {timeOptions.map(option => (
                          <MenuItem key={`inline-to-${option.value}`} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowInlineServiceSelection(false);
                      setInlineServiceData({ serviceId: '', stylistId: '', fromTime: '', toTime: '', additionalExperts: [] });
                    }}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: '#E0E0E0',
                      color: '#757575'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleInlineServiceAdd}
                    sx={{ 
                      textTransform: 'none',
                      bgcolor: '#6B8E23',
                      '&:hover': {
                        bgcolor: '#566E1C'
                      }
                    }}
                  >
                    Add Service
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Instruction Details Section */}
          <Box sx={{ mb: 3, bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
              bgcolor: '#6B8E23', // Changed to olive green
              '&:hover': {
                bgcolor: '#566E1C' // Darker shade for hover
              },
              borderRadius: '8px',
              textTransform: 'none',
              py: 1.5
            }}
          >
            {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
          </Button>

          {/* Create Bill Button - Show only when editing an existing appointment */}
          {editingAppointment && (
            <Button 
              onClick={() => {
                console.log("[Create Bill] Clicked. Editing Appointment:", editingAppointment);
                console.log("[Create Bill] Client from clientEntries[0]:", clientEntries[0]?.client);
                console.log("[Create Bill] Services from clientEntries[0]:", clientEntries[0]?.services);

                if (!editingAppointment || !clientEntries[0]?.client) {
                  toast.error("Cannot create bill: Missing appointment or client details.");
                  console.error("[Create Bill] Pre-condition failed: editingAppointment or clientEntries[0].client is missing.");
                  return;
                }

                if (!clientEntries[0]?.services?.length) {
                  toast.error("No services found for this appointment to create a bill.");
                  console.log("[Create Bill] No services to send to POS.");
                  return;
                }

                // Map services with all necessary details including experts
                const servicesForPOS = clientEntries[0].services.map(s => ({ 
                  id: s.id, 
                  name: s.name, 
                  price: s.price,
                  type: 'service',
                  hsn_code: s.hsn_code,
                  gst_percentage: s.gst_percentage,
                  category: s.category || 'service',
                  quantity: 1,
                  experts: s.experts || [{ id: s.stylistId, name: s.stylistName }] // Include all experts
                }));

                // Collect all unique experts from all services
                const allExperts = Array.from(
                  new Map(
                    clientEntries[0].services.flatMap(s => 
                      s.experts || [{ id: s.stylistId, name: s.stylistName }]
                    ).map(expert => [expert.id, expert])
                  ).values()
                ).filter(expert => expert.id); // Only include experts with valid IDs

                console.log("[Create Bill] Mapped servicesForPOS:", JSON.stringify(servicesForPOS, null, 2));
                console.log("[Create Bill] All unique experts:", JSON.stringify(allExperts, null, 2));

                const appointmentDataForPOS = {
                  clientName: clientEntries[0].client.full_name,
                  stylistId: editingAppointment.stylist_id,
                  allExperts: allExperts, // Pass all experts for multi-stylist UI
                  services: servicesForPOS,
                  id: editingAppointment.id,
                  type: servicesForPOS.length > 1 ? 'service_collection' : 'service',
                  appointmentTime: editingAppointment.start_time,
                  notes: appointmentNotes || '',
                  // Include additional service details for single service case
                  ...(servicesForPOS.length === 1 ? {
                    serviceId: servicesForPOS[0].id,
                    servicePrice: servicesForPOS[0].price,
                    serviceHsnCode: servicesForPOS[0].hsn_code,
                    serviceGstPercentage: servicesForPOS[0].gst_percentage
                  } : {})
                };

                console.log("[Create Bill] Final appointmentDataForPOS:", JSON.stringify(appointmentDataForPOS, null, 2));
                navigate('/pos', { state: { appointmentData: appointmentDataForPOS } });
                handleCloseDrawer();
              }}
              variant="contained"
              color="info"
              startIcon={<ReceiptIcon />}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                py: 1.5
              }}
            >
              Create Bill
            </Button>
          )}
          
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
        <DialogTitle id="delete-appointment-title" sx={{ color: '#6B8E23' }}>Delete Appointment?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-appointment-description">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              color: '#6B8E23',
              borderColor: '#6B8E23',
              '&:hover': {
                borderColor: '#566E1C',
                backgroundColor: 'rgba(107, 142, 35, 0.04)'
              }
            }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAppointment}
            sx={{
              bgcolor: '#6B8E23',
              color: 'white',
              '&:hover': {
                bgcolor: '#566E1C'
              }
            }}
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