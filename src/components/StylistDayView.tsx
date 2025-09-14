import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  Menu,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Receipt as ReceiptIcon,
  CalendarMonth,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { format, addDays, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useClients, Client } from '../hooks/clients/useClients';
import { StylistBreak, useStylists } from '../hooks/useStylists';
import { useServiceCollections } from '../hooks/useServiceCollections';
import { useCollectionServices } from '../hooks/useCollectionServices';
import { Search as SearchIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/formatting/format';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ErrorBoundary from './common/ErrorBoundary';
import { toast } from 'react-toastify';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { sendAppointmentNotification } from '../utils/whatsapp';
import { MergedAppointment } from '../hooks/appointments/useAppointments';
import {
  StylistHoliday,
  useStylistHolidays,
} from '../hooks/useStylistHolidays';
import { useScrollPreservation } from '../utils/scrollPreservation';
import { useLocalStorage } from '../utils/useLocalStorage';
import { useOrders } from '../hooks/orders/useOrders';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../hooks/orders/usePOS';
import { supabase } from '../lib/supabase';
import { printBill } from '../utils/printUtils';
import { getClientName as getAppointmentClientName } from '../pages/Appointments';
import { v4 as uuidv4 } from 'uuid';

// Define a minimal service type for type guarding
interface ServiceLike {
  id: string;
  [key: string]: any;
}

// Custom implementations of date-fns functions
const formatTime = (time: string | Date): string => {
  const date = typeof time === 'string' ? new Date(time) : time;
  const hour = date.getHours();
  const minute = date.getMinutes();
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

// Define the time slots for the day (from 8 AM to 10 PM)
const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 22, // 10 PM
};

// Update the time slot height to make the calendar more readable
const TIME_SLOT_HEIGHT = 30; // Height in pixels for each 15-minute slot

// Height in pixels of the StylistColumn header (must match StylistHeader height)
const STYLIST_HEADER_HEIGHT = 56;

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
  height: '100%', // Ensure fixed height for sticky positioning
  margin: 0,
  padding: 0,
  // Better scrolling behavior and responsive width utilization
  scrollBehavior: 'smooth',
  // Ensure the grid utilizes all available horizontal space
  maxWidth: '100vw',
  '& > *': {
    // This affects all direct children
    height: 'fit-content', // Allow elements to grow beyond viewport
    minHeight: '100%', // But at minimum be full height
    flex: '1 1 auto', // Allow flexible growth
  },
}));

const TimeColumn = styled(Box)(({ theme }) => ({
  width: 80, // Fixed width - no responsive changes
  minWidth: 80, // Ensure minimum width is maintained
  maxWidth: 80, // Ensure maximum width doesn't exceed
  flexShrink: 0,
  flexGrow: 0, // Prevent growing
  borderRight: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  left: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 2,
  padding: 0, // Remove all padding
  margin: 0, // Remove all margin
  height: 'fit-content',
  minHeight: '100%',
  // Remove all responsive adjustments to keep fixed width
  // Only adjust on very small mobile screens
  [theme.breakpoints.down('xs')]: {
    width: 70, // Only slightly smaller on very small screens
    minWidth: 70,
    maxWidth: 70,
  },
}));

const StylistColumn = styled(Box, {
  shouldForwardProp: prop => prop !== 'isOnHoliday',
})<{ isOnHoliday?: boolean }>(({ theme, isOnHoliday }) => ({
  flex: 1,
  minWidth: 200, // Base minimum width for better spacing
  [theme.breakpoints.down('md')]: {
    minWidth: 150, // Slightly smaller on medium screens
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 120, // Compact on small screens
  },
  // Responsive width adjustment for better space utilization
  [theme.breakpoints.up('lg')]: {
    minWidth: 220, // Wider columns on large screens
  },
  [theme.breakpoints.up('xl')]: {
    minWidth: 250, // Even wider on extra large screens
  },
  position: 'relative',
  backgroundColor: theme.palette.salon.offWhite,
  height: 'fit-content',
  minHeight: '100%',
  paddingBottom: '50vh', // Add extra space at the bottom for scrolling
}));

const StylistHeader = styled(Box, {
  shouldForwardProp: prop => prop !== 'isOnHoliday' && prop !== 'stylistColor',
})<{ isOnHoliday?: boolean; stylistColor?: string }>(
  ({ theme, isOnHoliday, stylistColor }) => ({
    padding: theme.spacing(1.5),
    textAlign: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: isOnHoliday
      ? theme.palette.grey[400]
      : stylistColor || '#6B8E25',
    color: theme.palette.common.white,
    position: 'sticky',
    top: 0,
    zIndex: 10, // Increased z-index to ensure it stays above other elements
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isOnHoliday ? 0.8 : 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Add shadow for better visual separation
    '&::after': isOnHoliday
      ? {
          content: '"On Holiday"',
          position: 'absolute',
          bottom: 4,
          fontSize: '0.7rem',
          opacity: 0.9,
        }
      : {},
  })
);

const TimeSlot = styled(Box)(({ theme }) => ({
  height: TIME_SLOT_HEIGHT,
  [theme.breakpoints.down('sm')]: {
    height: Math.floor(TIME_SLOT_HEIGHT * 0.7),
  },
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
  [theme.breakpoints.down('sm')]: {
    height: Math.floor(TIME_SLOT_HEIGHT * 0.7),
  },
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
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
  '&.holiday': {
    backgroundColor: 'rgba(158, 158, 158, 0.15)',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'rgba(158, 158, 158, 0.2)',
    },
  },
}));

// Update the AppointmentCard component
const AppointmentCard = styled(Box, {
  shouldForwardProp: prop =>
    prop !== 'isPaid' &&
    prop !== 'duration' &&
    prop !== 'status' &&
    prop !== 'isCheckedIn',
})<{
  duration: number;
  isPaid: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  isCheckedIn: boolean;
}>(({ theme, duration, isPaid, status, isCheckedIn }) => ({
  position: 'absolute',
  left: theme.spacing(0.75),
  right: theme.spacing(0.75),
  height: `${Math.max(duration, TIME_SLOT_HEIGHT / 2)}px`,
  backgroundColor:
    status === 'completed'
      ? theme.palette.grey[400]
      : isPaid
        ? theme.palette.success.light
        : theme.palette.primary.main,
  color:
    status === 'completed'
      ? theme.palette.getContrastText(theme.palette.grey[400])
      : isPaid
        ? theme.palette.success.contrastText
        : theme.palette.primary.contrastText,
  borderRadius: 8,
  padding: theme.spacing(1, 1.5),
  overflow: 'hidden',
  boxShadow:
    status === 'completed'
      ? '0px 2px 6px rgba(0, 0, 0, 0.15)'
      : '0px 4px 12px rgba(107, 142, 35, 0.25)',
  zIndex: 1,
  fontSize: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.2s ease-in-out',
  cursor: 'move',
  border:
    status === 'completed'
      ? `1px solid ${theme.palette.grey[500]}`
      : '1px solid rgba(255, 255, 255, 0.25)',
  opacity: status === 'completed' ? 0.8 : 1,
  '&:hover': {
    boxShadow:
      status === 'completed'
        ? '0px 3px 8px rgba(0, 0, 0, 0.2)'
        : '0px 6px 16px rgba(107, 142, 35, 0.4)',
    transform: status === 'completed' ? 'none' : 'translateY(-2px)',
    zIndex: status === 'completed' ? 1 : 2,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '1px dashed rgba(0,0,0,0.2)',
    borderRadius: 8,
    pointerEvents: 'none',
  },
  ...(isCheckedIn && {
    backgroundColor: '#D2B48C', // Warm tan color
    boxShadow: '0px 4px 12px rgba(210, 180, 140, 0.25)', // Consistent shadow style with tan color
    '&:hover': {
      boxShadow: '0px 6px 16px rgba(210, 180, 140, 0.4)',
      transform: 'translateY(-2px)',
    },
  }),
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

// Add a new styled component for break blocks
const BreakBlock = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '1px',
  right: '1px',
  backgroundColor: 'rgba(220, 0, 0, 0.15)',
  color: '#d32f2f',
  borderRadius: '8px',
  padding: '8px 12px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  zIndex: 5,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderLeft: '4px solid #dc3545',
  '&:hover': {
    backgroundColor: 'rgba(220, 0, 0, 0.2)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
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

// Define interface for time options
interface TimeOption {
  value: string;
  label: string;
}

// Update the generateTimeOptions function to include 15-minute intervals
const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = [];
  for (let hour = BUSINESS_HOURS.start; hour <= BUSINESS_HOURS.end; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    // Add options for 0, 15, 30, and 45 minutes
    const timeFormats = [
      { minute: '00', value: `${hour}:00` },
      { minute: '15', value: `${hour}:15` },
      { minute: '30', value: `${hour}:30` },
      { minute: '45', value: `${hour}:45` },
    ];

    timeFormats.forEach(({ minute, value }) => {
      if (hour < BUSINESS_HOURS.end || minute === '00') {
        options.push({
          value: value,
          label: `${hour12}:${minute} ${period}`,
        });
      }
    });
  }
  return options;
};

// Create a helper function to format hour in 12-hour format with AM/PM
const formatHour = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${hour12}:00 ${period}`;
};

// Export the Break interface
export interface Break {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

// Reintroduce the local Stylist interface definition with necessary properties, including color:
interface Stylist {
  id: string; // Assuming string based on typical usage with UUIDs
  name: string;
  breaks: Break[];
  available?: boolean; // Add available property
  color?: string; // Add color property
  // Include other properties used by this component, potentially from initial data
  email?: string;
  phone?: string;
  specialties?: string[];
  gender?: 'male' | 'female' | 'other';
  imageUrl?: string;
  isOnHoliday?: boolean; // Add this property
}

// Add ClientEntry interface before the component definition
interface ClientEntry {
  id: string;
  client: any;
  selectedCollectionId: string;
  services: any[];
  stylistList?: { id: string; name: string }[];
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
  onUpdateBreak?: (
    stylistId: string,
    breakId: string,
    breakData: Omit<Break, 'id'>
  ) => Promise<void>;
  onDateChange?: (date: Date) => void;
  onStylistsChange?: (updatedStylists: Stylist[]) => void;
  onAppointmentClick?: (appointment: any) => void;
  lastBookedAppointmentTime?: string;
  holidays: StylistHoliday[];
  clients?: any[]; // Add clients prop
}

// Define filter for freeSolo client options
const filterClients = createFilterOptions<{
  id: string;
  full_name: string;
  phone?: string;
  inputValue?: string;
}>();

// Move getClientName function to component scope
const getClientName = (appointment: any, allClients: Client[] = []): string => {
  if (!appointment) return 'Unknown Client';

  // For appointments created from the new drawer, clientDetails will be present
  if (
    Array.isArray(appointment.clientDetails) &&
    appointment.clientDetails.length > 0
  ) {
    const clientDetail = appointment.clientDetails[0];
    if (clientDetail.full_name) {
      return clientDetail.full_name;
    }
    // Fallback if full_name isn't on the detail but clientId is
    if (clientDetail.clientId) {
      const client = allClients.find(c => c.id === clientDetail.clientId);
      if (client?.full_name) return client.full_name;
    }
  }

  // Legacy fields
  if (appointment.client_name) return appointment.client_name;
  if (appointment.client?.full_name) return appointment.client.full_name;

  // Lookup by ID
  if (appointment.client_id) {
    const client = allClients.find(c => c.id === appointment.client_id);
    if (client?.full_name) return client.full_name;
  }

  // For 'Book for someone else'
  if (appointment.is_for_someone_else && appointment.booker_name) {
    return `${appointment.booker_name} (Booker)`;
  }

  return 'Unknown Client';
};

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
  lastBookedAppointmentTime,
  holidays,
  clients = [], // Add default empty array
}) => {
  const theme = useTheme();
  const { clients: allClients, isLoading: isLoadingClients } = useClients();

  // State declarations
  const [currentDate, setCurrentDate] = useState<Date>(
    selectedDate || new Date()
  );
  const [stylists, setStylists] = useState<Stylist[]>(initialStylists);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<MergedAppointment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [breakDialogOpen, setBreakDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('info');
  const [datePickerAnchorEl, setDatePickerAnchorEl] =
    useState<null | HTMLElement>(null);
  const [isBilling, setIsBilling] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [breakFormData, setBreakFormData] = useState({
    startTime: '',
    endTime: '',
    reason: '',
  });
  const [editFormData, setEditFormData] = useState<{
    clientName: string;
    clientId: string;
    serviceId: string;
    stylistId: string;
    startTime: string;
    endTime: string;
    notes: string;
    mobileNumber: string;
    stylistIds: string[];
    isNewClient: boolean;
    clientEntries: ClientEntry[];
  }>({
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
    clientEntries: [],
  });

  const {
    holidays: allHolidays,
    isLoading: isLoadingHolidays,
    getStylistHolidays,
    addHoliday,
  } = useStylistHolidays();

  // 1. Define this helper function first
  const getStylistHolidayForDate = (
    stylist: Stylist,
    date: Date
  ): StylistHoliday | undefined => {
    // Ensure allHolidays is available before proceeding
    if (!stylist || !allHolidays || !date) return undefined;

    const formattedDate = format(date, 'yyyy-MM-dd');
    // Use allHolidays instead of stylistHolidays
    return allHolidays.find(
      holiday =>
        holiday.stylist_id === stylist.id &&
        holiday.holiday_date === formattedDate
    );
  };

  // 2. Then use it in your useMemo
  const availableStylists = useMemo(() => {
    if (isLoadingHolidays || !allHolidays) {
      return initialStylists;
    }
    // Always return all stylists, just mark those on holiday, and sort by name
    return initialStylists
      .map(stylist => {
        const holiday = getStylistHolidayForDate(stylist, currentDate);
        return {
          ...stylist,
          isOnHoliday: !!holiday,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [initialStylists, currentDate, allHolidays, isLoadingHolidays]);

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

  // Update the handleSlotClick function to not open the edit dialog
  const handleSlotClick = (stylistId: string, hour: number, minute: number) => {
    // Find the stylist
    const stylist = availableStylists.find(s => s.id === stylistId);
    if (!stylist) {
      console.error('Stylist not found:', stylistId);
      return;
    }

    // Check if the stylist is on holiday
    if (stylist.isOnHoliday) {
      setSnackbarMessage('Cannot book during a holiday');
      setSnackbarOpen(true);
      setSnackbarSeverity('warning');
      return;
    }

    // Check if this time slot is during a break
    if (isBreakTime(stylistId, hour, minute)) {
      setSnackbarMessage('Cannot move appointment to a break time');
      setSnackbarOpen(true);
      setSnackbarSeverity('warning');
      return;
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

  // Update the click handler function
  const handleAppointmentClick = (appointment: any) => {
    // For completed appointments, show bill details
    if (appointment.status === 'completed') {
      handleViewBillDetails(appointment);
      // Add a notification to inform users about right-click option
      setSnackbarMessage(
        'Right-click or use context menu to edit this appointment'
      );
      setSnackbarOpen(true);
      setSnackbarSeverity('info');
    } else if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  // Add a new function to handle context menu click (right click)
  const handleContextMenuClick = (
    appointment: any,
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault(); // Prevent the default browser context menu
    setSelectedAppointment(appointment);
    setContextMenuAppointment(appointment);
    setContextMenuAnchorEl(event.currentTarget as HTMLElement);

    const clientDetails = clients.find(c => c.id === appointment.client_id);
    const serviceDetails = services.find(s => s.id === appointment.service_id);

    const allExpertsForAppointment =
      appointment.clientDetails?.flatMap(
        (detail: any) =>
          detail.stylistIds
            ?.map((id: string) => stylists.find((s: any) => s.id === id))
            .filter(Boolean) || []
      ) || [];

    const uniqueExperts = Array.from(
      new Map(allExpertsForAppointment.map((e: any) => [e.id, e])).values()
    );

    if (uniqueExperts.length === 0 && appointment.stylist_id) {
      const primaryStylist = stylists.find(
        (s: any) => s.id === appointment.stylist_id
      );
      if (primaryStylist) uniqueExperts.push(primaryStylist);
    }

    const serviceCollection = serviceCollections.find(sc =>
      sc.service_ids.includes(appointment.service_id)
    );

    const clientEntry: ClientEntry = {
      id: uuidv4(),
      client: clientDetails,
      selectedCollectionId: serviceCollection?.id || '',
      services: [serviceDetails].filter(Boolean),
      stylistList: uniqueExperts.map((s: any) => ({ id: s.id, name: s.name })),
    };

    const [startHour, startMinute] = format(
      new Date(appointment.start_time),
      'HH:mm'
    ).split(':');
    const [endHour, endMinute] = format(
      new Date(appointment.end_time),
      'HH:mm'
    ).split(':');

    // Ensure proper zero-padding for the time format expected by the Select components
    const formattedStartTime = `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}`;
    const formattedEndTime = `${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}`;

    setEditFormData({
      ...editFormData,
      clientEntries: [clientEntry],
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      notes: appointment.notes || '',
      clientId: clientDetails?.id || '',
      clientName: clientDetails?.full_name || '',
      mobileNumber: clientDetails?.phone || '',
      stylistId: (uniqueExperts[0] as any)?.id || '',
      stylistIds: uniqueExperts
        .filter((s: any) => s && s.id)
        .map((s: any) => s.id),
      serviceId: serviceDetails?.id || '',
    });
    setEditDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    // Store the appointment being dragged
    setSelectedAppointment(appointment);
    // Set the drag image and data
    e.dataTransfer.setData('text/plain', appointment.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (
    e: React.DragEvent,
    stylistId: string,
    hour: number,
    minute: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (
    e: React.DragEvent,
    stylistId: string,
    hour: number,
    minute: number
  ) => {
    e.preventDefault();

    // Check if this time slot is during a break
    if (isBreakTime(stylistId, hour, minute)) {
      setSnackbarMessage('Cannot move appointment to a break time');
      setSnackbarOpen(true);
      setSnackbarSeverity('warning'); // Ensure severity is set
      return; // Don't allow booking during breaks
    }

    if (selectedAppointment && onUpdateAppointment) {
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
      const originalStart = new Date(selectedAppointment.start_time);
      const originalEnd = new Date(selectedAppointment.end_time);
      const durationMinutes =
        (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60);

      // Calculate the new end time by adding the same duration
      const newEndTime = new Date(
        dropTime.getTime() + durationMinutes * 60 * 1000
      );

      // Format as ISO strings for consistent storage
      const formattedStartTime = dropTime.toISOString();
      const formattedEndTime = newEndTime.toISOString();

      try {
        // Create an update object with only the fields that should be updated
        const appointmentUpdates = {
          id: selectedAppointment.id,
          stylist_id: stylistId,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          // Preserve other important fields
          service_id: selectedAppointment.service_id,
          client_id: selectedAppointment.client_id,
          status: selectedAppointment.status,
          paid: selectedAppointment.paid,
          notes: selectedAppointment.notes || '',
        };

        console.log('Updating dragged appointment with:', appointmentUpdates);

        await onUpdateAppointment(selectedAppointment.id, appointmentUpdates);

        // Clear the dragged appointment reference
        setSelectedAppointment(null);
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
    if (
      !editFormData.clientEntries ||
      editFormData.clientEntries.length === 0
    ) {
      console.error('Validation Error: No client entries');
      isValid = false;
    } else {
      // Validate each client entry
      editFormData.clientEntries.forEach((entry, idx) => {
        // Validate client info
        if (
          !entry.client ||
          !entry.client.full_name ||
          entry.client.full_name.trim() === ''
        ) {
          console.error(
            `Validation Error: Client name is missing or empty for entry ${idx + 1}`
          );
          isValid = false;
        }

        // Check if it's a new client and requires phone
        if (entry.client && !entry.client.id && !entry.client.phone) {
          console.error(
            `Validation Error: Phone number is required for new client in entry ${idx + 1}`
          );
          isValid = false;
        }

        // Validate collection
        if (!entry.selectedCollectionId) {
          console.error(
            `Validation Error: Service collection not selected for entry ${idx + 1}`
          );
          isValid = false;
        }

        // Validate services
        if (!entry.services || entry.services.length === 0) {
          console.error(
            `Validation Error: No services selected for entry ${idx + 1}`
          );
          isValid = false;
        }

        // Validate stylists
        if (!entry.stylistList || entry.stylistList.length === 0) {
          console.error(
            `Validation Error: No stylists selected for entry ${idx + 1}`
          );
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
              if (!clientName) {
                throw new Error(
                  `Cannot create client with empty name for entry ${idx + 1}`
                );
              }
              const newClient = await updateClientFromAppointment(
                clientName,
                entry.client.phone || '',
                entry.client.email || '',
                '' // No notes for now
              );
              finalClientId = newClient.id;
            } catch (clientError) {
              console.error('Error creating new client:', clientError);
              throw new Error(
                `Failed to create client for entry ${idx + 1}: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`
              );
            }
          }

          return {
            clientId: finalClientId,
            // Use a type guard to ensure services are valid before mapping
            serviceIds: entry.services
              .filter((s): s is ServiceLike => !!s?.id)
              .map(s => s.id),
            // Ensure all experts from stylistList are included in stylistIds
            stylistIds: entry.stylistList?.map((st: any) => st.id) || [],
          };
        })
      );

      // Format times for ISO string conversion
      const selectedDay = new Date(currentDate);
      const [startHour, startMinute] = editFormData.startTime
        .split(':')
        .map(Number);
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
        stylist_ids: Array.from(
          new Set(processedClientDetails.flatMap(d => d.stylistIds))
        ),
        // Use the first service from first client as primary (required field)
        service_id: processedClientDetails[0].serviceIds[0],
        // Collect all service IDs
        service_ids: Array.from(
          new Set(processedClientDetails.flatMap(d => d.serviceIds))
        ),
        // Collect all client IDs
        client_ids: processedClientDetails.map(d => d.clientId),
        // Use first client ID as primary (for backward compatibility)
        client_id: processedClientDetails[0].clientId,
        client_name: primaryClient.full_name,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        notes: editFormData.notes || '',
        status: selectedAppointment.status,
        paid: selectedAppointment.paid,
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
        clientEntries: [],
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      setSnackbarMessage(
        `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSnackbarOpen(true);
    }
  };

  // Add a helper function to check if an appointment conflicts with breaks
  const checkBreakConflict = (
    stylistId: string,
    startTime: string,
    endTime: string
  ): boolean => {
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

  const handleTimeChange = (
    event: SelectChangeEvent,
    field: 'startTime' | 'endTime'
  ) => {
    if (!selectedAppointment) return;

    const timeValue = event.target.value;
    console.log(`Time changed: ${field} = ${timeValue}`);

    // Parse the selected time
    const [hourStr, minuteStr] = timeValue.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Calculate minutes since midnight for easier comparison
    const selectedTimeMinutes = hour * 60 + minute;

    // Update the appropriate field in the editFormData state
    setEditFormData(prev => {
      if (!prev) return prev;

      // Create a copy of the previous state
      const updated = { ...prev };

      // Calculate minutes for the current start/end times
      const [currentStartHour, currentStartMinute] = updated.startTime
        .split(':')
        .map(Number);
      const [currentEndHour, currentEndMinute] = updated.endTime
        .split(':')
        .map(Number);

      const startTimeMinutes = currentStartHour * 60 + currentStartMinute;
      const endTimeMinutes = currentEndHour * 60 + currentEndMinute;

      // Update the appropriate field
      if (field === 'startTime') {
        updated.startTime = timeValue;

        // If the new start time is after or equal to the end time, adjust the end time
        if (selectedTimeMinutes >= endTimeMinutes) {
          // Set end time to start time + 15 minutes
          const newEndTimeMinutes = selectedTimeMinutes + 15;
          const newEndHour = Math.floor(newEndTimeMinutes / 60) % 24; // Use modulo for 24h wraparound
          const newEndMinute = newEndTimeMinutes % 60;

          updated.endTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

          // Show notification about adjusted time
          toast.success(
            'End time automatically adjusted to be after start time'
          );
        }
      } else {
        updated.endTime = timeValue;

        // If the new end time is before or equal to the start time, adjust the start time
        if (selectedTimeMinutes <= startTimeMinutes) {
          // Set start time to end time - 15 minutes
          const newStartTimeMinutes = selectedTimeMinutes - 15;
          // Handle negative minutes (wrap around to previous day)
          const adjustedStartTimeMinutes =
            newStartTimeMinutes < 0
              ? 24 * 60 + newStartTimeMinutes
              : newStartTimeMinutes;

          const newStartHour = Math.floor(adjustedStartTimeMinutes / 60) % 24;
          const newStartMinute = adjustedStartTimeMinutes % 60;

          updated.startTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;

          // Show notification about adjusted time
          toast.success(
            'Start time automatically adjusted to be before end time'
          );
        }
      }

      return updated;
    });
  };

  // Filter appointments for the current day
  const todayAppointments = appointments.filter(appointment => {
    // Explicitly create Date objects for clearer comparison
    const appointmentDate = new Date(appointment.start_time);

    // Only log in development and limit frequency
    if (import.meta.env.DEV && Math.random() < 0.1) {
      console.log('Appointment date comparison:', {
        appointment_id: appointment.id,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        currentDate: currentDate.toISOString().split('T')[0],
        isSameDay: isSameDay(appointmentDate, currentDate),
        appClientName: appointment.clientDetails?.[0]?.full_name || 'Unknown',
      });
    }

    // Use date-fns isSameDay to correctly compare dates regardless of time
    return isSameDay(appointmentDate, currentDate);
  });

  // Only log in development
  if (import.meta.env.DEV) {
    console.log(
      'Filtered appointments:',
      todayAppointments.length,
      todayAppointments.map(a => ({
        id: a.id,
        client: a.clientDetails?.[0]?.full_name || 'Unknown',
        time: `${formatTime(a.start_time)} - ${formatTime(a.end_time)}`,
      }))
    );
  }

  // Make sure date-times are normalized to the current date to ensure consistent display
  const normalizeDateTime = (dateTimeString: string) => {
    try {
      const dateTime = new Date(dateTimeString);

      // Create a new date using the current selected date but with the time from the input
      const normalizedDateTime = new Date(currentDate);
      normalizedDateTime.setHours(
        dateTime.getHours(),
        dateTime.getMinutes(),
        0, // Zero seconds
        0 // Zero milliseconds
      );

      return normalizedDateTime;
    } catch (error) {
      console.error('Error normalizing date time:', error, dateTimeString);
      return new Date(); // Return current date as fallback
    }
  };

  // Fix the getAppointmentPosition function to calculate positions more precisely
  const getAppointmentPosition = (startTime: string) => {
    try {
      const normalizedStartTime = normalizeDateTime(startTime);

      // Calculate hours since business start time
      const hours = normalizedStartTime.getHours() - BUSINESS_HOURS.start;
      // Calculate minutes (0-59)
      const minutes = normalizedStartTime.getMinutes();

      // Calculate total minutes since business hours start
      const totalMinutes = hours * 60 + minutes;

      // Convert to pixels based on 15-minute slots and include header offset
      const positionExact =
        STYLIST_HEADER_HEIGHT + (totalMinutes / 15) * TIME_SLOT_HEIGHT;

      // Reduce logging frequency to avoid spam
      if (import.meta.env.DEV && Math.random() < 0.05) {
        console.log(`Position calculation sample:`, {
          time: normalizedStartTime.toLocaleTimeString(),
          hours,
          minutes,
          totalMinutes,
          positionExact,
        });
      }

      // Return exact position to the pixel for precise placement
      return positionExact;
    } catch (error) {
      console.error(
        'Error calculating appointment position:',
        error,
        startTime
      );
      return 0; // Default to top
    }
  };

  // Fix the getAppointmentDuration function to calculate exact durations
  const getAppointmentDuration = (startTime: string, endTime: string) => {
    try {
      const start = normalizeDateTime(startTime);
      const end = normalizeDateTime(endTime);

      // Handle overnight appointments that cross midnight
      let endDate = end;
      if (end < start) {
        endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);
      }

      // Calculate duration in milliseconds
      const durationMs = endDate.getTime() - start.getTime();
      // Convert to minutes
      const durationMinutes = durationMs / (1000 * 60);
      // Convert to pixels based on 15-minute slots
      const heightExact = (durationMinutes / 15) * TIME_SLOT_HEIGHT;

      // Reduce logging frequency to avoid spam
      if (import.meta.env.DEV && Math.random() < 0.05) {
        console.log(`Duration calculation sample:`, {
          timeRange: `${start.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`,
          durationMinutes,
          heightExact,
        });
      }

      // Ensure a minimum height for very short appointments/breaks
      return Math.max(heightExact, TIME_SLOT_HEIGHT / 2);
    } catch (error) {
      console.error('Error calculating appointment duration:', error);
      // Return a default height if calculation fails
      return TIME_SLOT_HEIGHT * 2;
    }
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
          clientName: selectedAppointment.clientDetails?.[0]?.full_name || '',
          stylistId: selectedAppointment.stylist_id,
          serviceId: selectedAppointment.service_id,
          serviceName: service?.name || '',
          servicePrice: service?.price || 0,
          appointmentTime: selectedAppointment.start_time,
          type: 'service', // Explicitly set type as service
        },
      },
    });

    // Close the edit dialog
    handleEditDialogClose();
  };

  // Fix the isBreakTime function to ensure consistent Date objects for comparison
  const isBreakTime = (stylistId: string, hour: number, minute: number) => {
    const stylist = stylists.find(s => s.id === stylistId);
    if (!stylist || !stylist.breaks || stylist.breaks.length === 0) {
      return false;
    }

    try {
      // Create a date object for the slot time using the current date
      const slotTime = new Date(currentDate);
      slotTime.setHours(hour, minute, 0, 0);
      const slotTimeValue = slotTime.getTime();

      // Create a date object for the end of the slot using the current date
      const slotEndTime = new Date(currentDate);
      slotEndTime.setHours(hour, minute + 15, 0, 0);
      const slotEndTimeValue = slotEndTime.getTime();

      // Get only breaks for the current day to improve performance
      const todayBreaks = getStylistBreaks(stylistId);

      // Check if the slot time overlaps with any break period
      return todayBreaks.some((breakItem: StylistBreak) => {
        try {
          // Ensure Date objects are created from ISO strings for comparison
          const breakStart = new Date(breakItem.startTime).getTime();
          const breakEnd = new Date(breakItem.endTime).getTime();

          // Check for any overlap between the slot and the break
          return (
            (slotTimeValue >= breakStart && slotTimeValue < breakEnd) ||
            (slotEndTimeValue > breakStart && slotEndTimeValue <= breakEnd) ||
            (slotTimeValue <= breakStart && slotEndTimeValue >= breakEnd)
          );
        } catch (error) {
          console.error('Error checking break time element:', error, breakItem);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in isBreakTime function:', error);
      return false;
    }
  };

  // Fix the getStylistBreaks function to ensure consistent Date objects for comparison
  const getStylistBreaks = (stylistId: string) => {
    const stylist = stylists.find(s => s.id === stylistId);
    if (!stylist || !stylist.breaks || stylist.breaks.length === 0) {
      return [];
    }

    // Filter breaks for the current day
    return stylist.breaks.filter((breakItem: StylistBreak) => {
      try {
        // Ensure Date objects are created from ISO strings for comparison
        const breakDate = new Date(breakItem.startTime);

        // Use date-fns isSameDay for reliable date comparison
        return isSameDay(breakDate, currentDate);
      } catch (error) {
        console.error(
          'Error processing break date comparison:',
          error,
          breakItem
        );
        return false;
      }
    });
  };

  // Add state for snackbar
  const [editingAppointment, setEditingAppointment] =
    useState<MergedAppointment | null>(null);

  // Add handleSnackbarClose function
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleBreakDialogOpen = (stylistId: string) => {
    const foundStylist = stylists.find(s => s.id === stylistId);
    if (foundStylist) {
      setSelectedStylist(foundStylist);
      setBreakFormData({
        startTime: `${BUSINESS_HOURS.start}:00`,
        endTime: `${BUSINESS_HOURS.start + 1}:00`,
        reason: '',
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
      reason: '',
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
      const stylistAppointments = appointments.filter(
        app =>
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
        setSnackbarMessage(
          'Cannot add break: Conflicts with existing appointments'
        );
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
          (formattedStartDate >= existingBreakStart &&
            formattedStartDate < existingBreakEnd) || // New break starts during existing break
          (formattedEndDate > existingBreakStart &&
            formattedEndDate <= existingBreakEnd) || // New break ends during existing break
          (formattedStartDate <= existingBreakStart &&
            formattedEndDate >= existingBreakEnd) // Existing break is within new break
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
        reason: reason || '',
      };

      await onAddBreak(selectedStylist.id, breakData as Break);

      setBreakDialogOpen(false);
      setBreakFormData({
        startTime: '',
        endTime: '',
        reason: '',
      });

      // Update local state
      const newBreak: Break = {
        ...breakData,
        id: `break-${Date.now()}`, // Generate a temporary ID
      };

      const updatedStylists = stylists.map(stylist =>
        stylist.id === selectedStylist.id
          ? { ...stylist, breaks: [...stylist.breaks, newBreak] }
          : stylist
      );

      setStylists(updatedStylists);
      setSelectedStylist({
        ...selectedStylist,
        breaks: [...selectedStylist.breaks, newBreak],
      });

      setSnackbarMessage('Break added successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding break:', error);
      setSnackbarMessage('Failed to add break');
      setSnackbarOpen(true);
    }
  };

  // Fix the handleDeleteBreak function to properly delete breaks
  const handleDeleteBreak = async (breakId: string) => {
    try {
      // Find the stylist that has this break
      const stylistWithBreak = stylists.find((s: Stylist) =>
        s.breaks.some((b: StylistBreak) => b.id === breakId)
      );

      if (!stylistWithBreak) {
        console.error('Could not find stylist with break ID:', breakId);
        setSnackbarMessage('Could not find the break to delete');
        setSnackbarOpen(true);
        return;
      }

      // Add confirmation dialog
      if (!window.confirm('Are you sure you want to delete this break?')) {
        return;
      }

      console.log(
        'Deleting break with id:',
        breakId,
        'from stylist:',
        stylistWithBreak.id
      );

      if (onDeleteBreak) {
        // Call the prop function to update the database
        await onDeleteBreak(stylistWithBreak.id, breakId);

        // After successful server update, update the local state
        const updatedBreaks = stylistWithBreak.breaks.filter(
          b => b.id !== breakId
        );

        const updatedStylists = stylists.map(stylist =>
          stylist.id === stylistWithBreak.id
            ? { ...stylist, breaks: updatedBreaks }
            : stylist
        );

        setStylists(updatedStylists);
        setSnackbarMessage('Break time removed successfully');
        setSnackbarOpen(true);
      } else {
        console.error('onDeleteBreak prop is not provided');
        setSnackbarMessage(
          'Could not delete break: Delete function not available'
        );
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting break:', error);
      setSnackbarMessage(
        `Failed to delete break: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSnackbarOpen(true);
    }
  };

  const handleEditBreakDialogOpen = (breakItem: StylistBreak) => {
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
      reason: breakItem.reason || '',
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
      const stylistAppointments = appointments.filter(
        app =>
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
        setSnackbarMessage(
          'Cannot update break: Conflicts with existing appointments'
        );
        setSnackbarOpen(true);
        return;
      }

      // Check for conflicts with existing breaks (excluding the current break being edited)
      const hasBreakConflict = selectedStylist.breaks.some(
        (breakItem: StylistBreak) => {
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
            (formattedStartDate >= existingBreakStart &&
              formattedStartDate < existingBreakEnd) || // Updated break starts during existing break
            (formattedEndDate > existingBreakStart &&
              formattedEndDate <= existingBreakEnd) || // Updated break ends during existing break
            (formattedStartDate <= existingBreakStart &&
              formattedEndDate >= existingBreakEnd) // Existing break is within updated break
          );
        }
      );

      if (hasBreakConflict) {
        setSnackbarMessage(
          'Cannot update break: Conflicts with existing breaks'
        );
        setSnackbarOpen(true);
        return;
      }

      const breakData: Omit<Break, 'id'> = {
        startTime: formattedStartDate.toISOString(),
        endTime: formattedEndDate.toISOString(),
        reason: reason || '',
      };

      console.log('Updating break with data:', {
        stylistId: selectedStylist.id,
        breakId: editingBreak.id,
        breakData,
      });

      if (onUpdateBreak) {
        // Call the prop function to update the database
        await onUpdateBreak(selectedStylist.id, editingBreak.id, breakData);

        // After successful server update, update the local state
        const updatedBreaks = selectedStylist.breaks.map(b =>
          b.id === editingBreak.id ? { ...breakData, id: editingBreak.id } : b
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
        setSnackbarMessage(
          'Could not update break: Update function not available'
        );
        setSnackbarOpen(true);
      }

      setEditBreakDialogOpen(false);
      setEditingBreak(null);
    } catch (error) {
      console.error('Error updating break:', error);
      setSnackbarMessage(
        `Failed to update break: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setSnackbarOpen(true);
    }
  };

  // Debug log: Log all appointments on component mount/update
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(
        'Current appointments:',
        appointments.map(app => ({
          id: app.id,
          client: app.clientDetails?.[0]?.full_name || 'Unknown',
          start: new Date(app.start_time).toLocaleTimeString(),
          end: new Date(app.end_time).toLocaleTimeString(),
          start_raw: app.start_time,
          end_raw: app.end_time,
        }))
      );

      // Also log the selectedDate
      console.log(
        'Selected date:',
        selectedDate,
        format(selectedDate, 'EEEE, MMMM d, yyyy')
      );
    }
  }, [appointments, selectedDate]);

  // Keep currentDate in sync with selectedDate prop
  useEffect(() => {
    if (selectedDate && !isSameDay(selectedDate, currentDate)) {
      if (import.meta.env.DEV) {
        console.log('Updating currentDate from selectedDate prop:', {
          previousDate: currentDate.toISOString().split('T')[0],
          newDate: selectedDate.toISOString().split('T')[0],
        });
      }
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  // Add date picker handlers
  const handleDatePickerClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setDatePickerAnchorEl(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchorEl(null);
  };

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setCurrentDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
      handleDatePickerClose();
    }
  };

  // Add handler functions for client entries
  const handleClientChange = (entryId: string, newValue: any) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? { ...entry, client: newValue } : entry
      ),
    }));
  };

  const handleClientPhoneChange = (entryId: string, phone: string) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              client: { ...entry.client, phone },
            }
          : entry
      ),
    }));
  };

  const handleCollectionChange = (entryId: string, collection: any) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId
          ? {
              ...entry,
              selectedCollectionId: collection?.id || '',
              services: [],
            }
          : entry
      ),
    }));
  };

  const handleServicesChange = (entryId: string, newServices: any[]) => {
    const validServices = newServices.filter(
      (s): s is ServiceLike => s && typeof s === 'object' && !!s.id
    );

    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? { ...entry, services: validServices } : entry
      ),
    }));
  };

  const handleStylistsChange = (
    entryId: string,
    stylists: { id: string; name: string }[]
  ) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? { ...entry, stylistList: stylists } : entry
      ),
    }));
  };

  const handleAddClientEntry = () => {
    const newEntry: ClientEntry = {
      id: `entry-${Date.now()}`,
      client: null,
      selectedCollectionId: '',
      services: [],
      stylistList: [],
    };

    setEditFormData(prev => ({
      ...prev,
      clientEntries: [...prev.clientEntries, newEntry],
    }));

    // Focus on the service search field after a short delay to allow rendering
    setTimeout(() => {
      const serviceSearchField = document.getElementById(
        `service-search-${newEntry.id}`
      );
      if (serviceSearchField) {
        serviceSearchField.focus();
      }
    }, 100);
  };

  const handleRemoveClientEntry = (entryId: string) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.filter(entry => entry.id !== entryId),
    }));
  };

  // Add updateClientFromAppointment function
  const updateClientFromAppointment = async (
    name: string,
    phone: string,
    email: string,
    notes: string
  ): Promise<{ id: string }> => {
    // This should be implemented to actually create a new client
    // For now, return a mock response
    return { id: `client-${Date.now()}` };
  };

  // Update the renderTimeColumn function to include a time header with proper time formatting
  const renderTimeColumn = () => {
    return (
      <TimeColumn className='time-column'>
        {/* Time header */}
        <Box
          sx={{
            height: '56px',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.7)',
            position: 'sticky',
            top: 0,
            zIndex: 11, // Higher than stylist headers to stay above them
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Add shadow for better visual separation
          }}
        >
          Time
        </Box>

        {/* Time slots */}
        {timeSlots.map((slot, index) => {
          const hour12 =
            slot.hour > 12 ? slot.hour - 12 : slot.hour === 0 ? 12 : slot.hour;
          const period = slot.hour >= 12 ? 'PM' : 'AM';
          const displayTime =
            slot.minute === 0
              ? `${hour12}:00 ${period}`
              : `${hour12}:${slot.minute} ${period}`;

          return (
            <TimeSlot key={index} className='time-slot'>
              <TimeLabel className='time-label'>{displayTime}</TimeLabel>
            </TimeSlot>
          );
        })}
      </TimeColumn>
    );
  };

  // Update the renderAppointmentsForStylist function
  const renderAppointmentsForStylist = (stylistId: string) => {
    // 1. Collect and sort today's appointments for the stylist
    // For multi-expert appointments (with booking_id), only show in the primary expert's column
    const stylistAppointments = todayAppointments
      .filter(app => {
        // Always show appointments where this stylist is the primary stylist
        if (app.stylist_id === stylistId) {
          // If this appointment has a booking_id, check if this is the primary appointment
          if (app.booking_id) {
            // Find all appointments with the same booking_id
            const relatedAppointments = todayAppointments.filter(
              relApp =>
                relApp.booking_id === app.booking_id && relApp.booking_id
            );

            // If there are multiple appointments with the same booking_id,
            // determine the primary stylist for display to ensure consistent positioning
            if (relatedAppointments.length > 1) {
              // Strategy 1: Try to get the primary stylist from clientDetails first
              let primaryStylistId = null;

              // Look through all related appointments to find clientDetails with stylist info
              for (const relatedApp of relatedAppointments) {
                if (
                  relatedApp.clientDetails &&
                  relatedApp.clientDetails.length > 0
                ) {
                  const clientDetail = relatedApp.clientDetails[0];
                  if (
                    clientDetail.stylistIds &&
                    clientDetail.stylistIds.length > 0
                  ) {
                    primaryStylistId = clientDetail.stylistIds[0]; // Use first stylist as primary
                    console.log(
                      `[Multi-Expert Fix] Found primary stylist from clientDetails: ${primaryStylistId} for booking ${app.booking_id}`
                    );
                    break; // Found primary stylist, no need to continue
                  }
                }
              }

              // Strategy 2: If no primary stylist found in clientDetails, find the "main" appointment
              // Use the appointment with the smallest stylist_id (for deterministic behavior)
              if (!primaryStylistId) {
                const primaryAppointment = relatedAppointments.reduce(
                  (main, current) =>
                    current.stylist_id < main.stylist_id ? current : main
                );
                primaryStylistId = primaryAppointment.stylist_id;
                console.log(
                  `[Multi-Expert Fix] Using fallback primary stylist: ${primaryStylistId} for booking ${app.booking_id}`
                );
              }

              // Only show if this is the primary stylist's column
              const shouldShow = primaryStylistId === stylistId;
              if (shouldShow) {
                console.log(
                  `[Multi-Expert Fix] Showing multi-expert appointment in ${stylistId} column for booking ${app.booking_id}`
                );
              }
              return shouldShow;
            }
          }
          return true;
        }
        return false;
      })
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    // 2. Pre-compute a column index and total columns for each appointment so that
    //    overlapping ones appear side-by-side instead of on top of each other.
    //    This is a simple interval-partitioning algorithm.
    interface ColumnMeta {
      column: number;
      totalColumns: number;
    }
    const metaMap: Record<string, ColumnMeta> = {};
    const active: { id: string; end: number; column: number }[] = [];

    stylistAppointments.forEach(app => {
      const appStart = new Date(app.start_time).getTime();
      const appEndRaw = new Date(app.end_time).getTime();
      // Handle overnight appointments (end before start) – push to next day
      const appEnd =
        appEndRaw <= appStart ? appEndRaw + 24 * 60 * 60 * 1000 : appEndRaw;

      // Remove no-longer-overlapping appointments from active list
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].end <= appStart) {
          active.splice(i, 1);
        }
      }

      // Determine used columns among currently active appointments
      const usedColumns = new Set(active.map(a => a.column));
      let column = 0;
      while (usedColumns.has(column)) column++;

      // Assign column to current appointment and push to active list
      active.push({ id: app.id, end: appEnd, column });
      metaMap[app.id] = {
        column,
        totalColumns: Math.max(usedColumns.size + 1, column + 1),
      };

      // Update totalColumns for previously active appointments if needed
      active.forEach(a => {
        metaMap[a.id].totalColumns = Math.max(
          metaMap[a.id].totalColumns,
          metaMap[app.id].totalColumns
        );
      });
    });

    // Helper to compute positioning styles based on metaMap
    const getPositionStyle = (appointmentId: string): React.CSSProperties => {
      const meta = metaMap[appointmentId];
      if (!meta) return {};
      const { column, totalColumns } = meta;
      const gutterPx = 4; // space between columns
      const columnWidthPercent = 100 / totalColumns;
      const widthCalc = `calc(${columnWidthPercent}% - ${(gutterPx * (totalColumns - 1)) / totalColumns}px)`;
      const leftCalc = `calc(${column * columnWidthPercent}% + ${gutterPx * column}px)`;
      return {
        width: widthCalc,
        left: leftCalc,
        right: 'auto', // override default right spacing from styled component
      } as React.CSSProperties;
    };

    // 3. Render the appointment cards with the computed styles
    return stylistAppointments.map(appointment => {
      // Find the service details
      const serviceName =
        appointment.serviceDetails?.name ||
        services.find(s => s.id === appointment.service_id)?.name ||
        'Unknown Service';

      // Determine if the appointment is paid
      const isPaid = appointment.paid || false;
      const status = appointment.status || 'scheduled';
      const isCheckedIn = checkedInIds.has(appointment.id);
      const startTime = formatTime(appointment.start_time);
      const endTime = formatTime(appointment.end_time);

      const clientName = getAppointmentClientName(
        appointment,
        allClients || []
      );

      // Check if this is a multi-expert appointment
      const isMultiExpert =
        appointment.booking_id &&
        todayAppointments.filter(
          app => app.booking_id === appointment.booking_id && app.booking_id
        ).length > 1;
      const clientPhone = (() => {
        // First try clientDetails array
        if (
          appointment.clientDetails &&
          appointment.clientDetails.length > 0 &&
          appointment.clientDetails[0]?.phone
        ) {
          return appointment.clientDetails[0].phone;
        }
        if (appointment.phone) return appointment.phone;
        if (appointment.client_id && allClients && allClients.length > 0) {
          const client = allClients.find(c => c.id === appointment.client_id);
          if (client?.phone) return client.phone;
        }
        if (appointment.client && appointment.client.phone)
          return appointment.client.phone;
        if (appointment.is_for_someone_else && appointment.booker_phone)
          return appointment.booker_phone;
        return 'No phone';
      })();

      return (
        <Tooltip
          key={appointment.id}
          title={
            <Box sx={{ p: 1, maxWidth: 300 }}>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 'bold', color: 'common.white', mb: 1 }}
              >
                {clientName}
              </Typography>
              <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography
                    variant='body2'
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <PhoneIcon fontSize='small' />
                    {clientPhone || 'No phone'}
                  </Typography>
                </Grid>

                {isMultiExpert ? (
                  <>
                    <Grid item xs={12}>
                      <Typography
                        variant='caption'
                        sx={{ color: '#FFD700', fontWeight: 'bold' }}
                      >
                        👥 Multi-Expert Booking
                      </Typography>
                    </Grid>
                    {(() => {
                      const relatedAppointments = todayAppointments.filter(
                        app =>
                          app.booking_id === appointment.booking_id &&
                          app.booking_id
                      );

                      const serviceExpertMap = new Map<
                        string,
                        {
                          serviceName: string;
                          experts: Set<string>;
                          startTime: string;
                          endTime: string;
                        }
                      >();

                      relatedAppointments.forEach(relApp => {
                        const serviceId = relApp.service_id;
                        const serviceNameDetail =
                          relApp.serviceDetails?.name ||
                          services.find(s => s.id === serviceId)?.name ||
                          'Unknown Service';
                        const expertName =
                          stylists.find(s => s.id === relApp.stylist_id)
                            ?.name || 'Unknown';

                        if (!serviceExpertMap.has(serviceId)) {
                          serviceExpertMap.set(serviceId, {
                            serviceName: serviceNameDetail,
                            experts: new Set(),
                            startTime: relApp.start_time,
                            endTime: relApp.end_time,
                          });
                        }
                        serviceExpertMap
                          .get(serviceId)!
                          .experts.add(expertName);
                      });

                      return Array.from(serviceExpertMap.values()).map(
                        (serviceData, index) => (
                          <Grid item xs={12} key={index}>
                            <Box
                              sx={{
                                pl: 2,
                                borderLeft: '2px solid rgba(255,255,255,0.3)',
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant='body2'
                                sx={{ fontWeight: 'bold' }}
                              >
                                {serviceData.serviceName}
                              </Typography>
                              <Typography variant='caption'>
                                ⏰{' '}
                                {format(new Date(serviceData.startTime), 'p')} -{' '}
                                {format(new Date(serviceData.endTime), 'p')}
                              </Typography>
                              <br />
                              <Typography variant='caption'>
                                👤 {Array.from(serviceData.experts).join(', ')}
                              </Typography>
                            </Box>
                          </Grid>
                        )
                      );
                    })()}
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Typography variant='body2'>{serviceName}</Typography>
                    <Typography variant='caption'>
                      ⏰ {startTime} - {endTime}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                    {isCheckedIn && (
                      <Chip size='small' label='Checked In' color='info' />
                    )}
                    {isPaid && (
                      <Chip size='small' label='Paid' color='success' />
                    )}
                    {status === 'completed' && (
                      <Chip
                        size='small'
                        label='Completed'
                        sx={{ bgcolor: 'grey.700', color: 'white' }}
                      />
                    )}
                  </Stack>
                </Grid>

                {appointment.notes && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Typography variant='caption' sx={{ fontStyle: 'italic' }}>
                      Notes: {appointment.notes}
                    </Typography>
                  </Grid>
                )}

                {appointment.is_for_someone_else && appointment.booker_name && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Typography variant='caption' sx={{ fontWeight: 'bold' }}>
                      Booked by: {appointment.booker_name}
                      {appointment.booker_phone &&
                        ` (${appointment.booker_phone})`}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          }
          arrow
          placement='top-start'
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
        >
          <AppointmentCard
            draggable
            onDragStart={e => handleDragStart(e, appointment)}
            onClick={() => handleAppointmentClick(appointment)}
            onDoubleClick={() => handleAppointmentClick(appointment)}
            onContextMenu={e => handleContextMenuClick(appointment, e)}
            style={{
              top: `${getAppointmentPosition(appointment.start_time)}px`,
              height: `${getAppointmentDuration(appointment.start_time, appointment.end_time)}px`,
              backgroundColor:
                status === 'completed'
                  ? theme.palette.grey[400]
                  : isCheckedIn
                    ? '#D2B48C'
                    : isPaid
                      ? theme.palette.success.light
                      : theme.palette.primary.main,
              ...getPositionStyle(appointment.id),
            }}
            duration={getAppointmentDuration(
              appointment.start_time,
              appointment.end_time
            )}
            isPaid={isPaid}
            status={status as 'scheduled' | 'completed' | 'cancelled'}
            isCheckedIn={isCheckedIn}
          >
            <Typography
              variant='subtitle2'
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {clientName}
              {appointment.is_for_someone_else && ' 👤'}
              {isMultiExpert && ' 👥'}
            </Typography>
            <Typography
              variant='body2'
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {isMultiExpert ? 'Multi-Service' : serviceName}
            </Typography>
            <Typography variant='caption' className='appointment-time'>
              {`${startTime} - ${endTime}`}
            </Typography>
          </AppointmentCard>
        </Tooltip>
      );
    });
  };

  // Add state for edit break functionality
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);
  const [editBreakDialogOpen, setEditBreakDialogOpen] = useState(false);
  const [editBreakFormData, setEditBreakFormData] = useState({
    startTime: '',
    endTime: '',
    reason: '',
  });

  // Add state for service collections
  const [serviceCollections, setServiceCollections] = useState<any[]>([]);
  const [selectedServiceCollection, setSelectedServiceCollection] =
    useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [isLoadingCollectionServices, setIsLoadingCollectionServices] =
    useState(false);
  const [loadingStylists, setLoadingStylists] = useState(false);
  // Add state for stylist holidays map
  const [stylistHolidays, setStylistHolidays] = useState<
    Record<string, StylistHoliday[]>
  >({});

  // Use the useServiceCollections hook to get service collections
  const {
    serviceCollections: fetchedServiceCollections,
    isLoading: isLoadingServiceCollections,
  } = useServiceCollections();

  // Update service collections when fetched
  useEffect(() => {
    if (fetchedServiceCollections) {
      setServiceCollections(fetchedServiceCollections);
    }
  }, [fetchedServiceCollections]);

  // Add a function to handle service search and selection
  const handleServiceSearch = (
    event: React.ChangeEvent<HTMLInputElement>,
    entryId: string
  ) => {
    const searchQuery = event.target.value;
    setServiceSearchQuery(searchQuery);

    // If search query is empty, don't show any suggestions
    if (!searchQuery.trim()) {
      return;
    }

    // Find matching services
    const matchingServices = services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If we have exactly one match and it's an exact match, auto-select it
    if (
      matchingServices.length === 1 &&
      matchingServices[0].name.toLowerCase() === searchQuery.toLowerCase()
    ) {
      // Find the collection this service belongs to
      const collection = serviceCollections.find(
        c => c.id === matchingServices[0].collection_id
      );

      if (collection) {
        // Update the entry with the selected collection and service
        handleCollectionChange(entryId, collection);
        handleServicesChange(entryId, [matchingServices[0]]);
      }
    }
  };

  // Add a function to handle "Add New Service" button click
  const handleAddNewService = (entryId: string) => {
    // Find the entry
    const entry = editFormData.clientEntries.find(e => e.id === entryId);
    if (!entry) return;

    // Create a new service entry in the same entry
    const serviceSearchField = document.getElementById(
      `service-search-${entryId}`
    );
    if (serviceSearchField) {
      (serviceSearchField as HTMLInputElement).focus();
      // Clear any previous search
      (serviceSearchField as HTMLInputElement).value = '';
    }

    // Show a message to guide the user
    setSnackbarMessage('Please search and select a service');
    setSnackbarOpen(true);
  };

  // Build stylistHolidays map from the fetched allHolidays list
  useEffect(() => {
    if (stylists?.length && allHolidays && !isLoadingHolidays) {
      const holidaysMap: Record<string, StylistHoliday[]> = {};
      stylists.forEach(stylist => {
        holidaysMap[stylist.id] = allHolidays.filter(
          holiday => holiday.stylist_id === stylist.id
        );
      });
      setStylistHolidays(holidaysMap);
    }
  }, [stylists, allHolidays, isLoadingHolidays]);

  // Add these state declarations after the other state declarations
  const [contextMenuAppointment, setContextMenuAppointment] =
    useState<any>(null);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  // Add useEffect to initialize checkedInIds from fetched appointments
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const initialCheckedIn = new Set<string>();
      appointments.forEach(appointment => {
        if (appointment.checked_in) {
          initialCheckedIn.add(appointment.id);
        }
      });
      setCheckedInIds(initialCheckedIn);
    }
  }, [appointments]); // Rerun effect when appointments prop changes

  const [checkInConfirmDialog, setCheckInConfirmDialog] = useState<{
    open: boolean;
    appointments: any[];
    singleAppointment: any;
  }>({
    open: false,
    appointments: [],
    singleAppointment: null,
  });
  const [checkOutConfirmDialog, setCheckOutConfirmDialog] = useState<{
    open: boolean;
    appointments: any[];
    singleAppointment: any;
  }>({
    open: false,
    appointments: [],
    singleAppointment: null,
  });

  // Add these handlers after the other handler functions
  const memoizedHandleCloseContextMenu = useCallback(() => {
    setContextMenuAnchorEl(null);
    setContextMenuAppointment(null);
  }, []);

  const memoizedHandleCheckIn = useCallback(async () => {
    if (contextMenuAppointment) {
      const appointmentDate = format(
        new Date(contextMenuAppointment.start_time),
        'yyyy-MM-dd'
      );
      const currentDate_formatted = format(currentDate, 'yyyy-MM-dd');

      if (appointmentDate === currentDate_formatted) {
        const sameClientAppointments = appointments.filter(
          appointment =>
            appointment.client_id === contextMenuAppointment.client_id &&
            format(new Date(appointment.start_time), 'yyyy-MM-dd') ===
              appointmentDate
        );

        // Determine whether these multiple records actually belong to **different** bookings.
        // If they all share the same booking_id (typical in multi-expert scenarios) we
        // treat them as a single booking and skip the bulk-check-in dialog.
        const contextBookingKey =
          contextMenuAppointment.booking_id ||
          `appt-${contextMenuAppointment.id}`;
        const hasDifferentBooking = sameClientAppointments.some(appt => {
          if (appt.id === contextMenuAppointment.id) return false; // skip itself
          const apptBookingKey = appt.booking_id || `appt-${appt.id}`;
          return apptBookingKey !== contextBookingKey;
        });

        if (hasDifferentBooking) {
          setCheckInConfirmDialog({
            open: true,
            appointments: sameClientAppointments,
            singleAppointment: contextMenuAppointment,
          });
        } else {
          // Update backend and local state for single appointment
          if (onUpdateAppointment) {
            try {
              await onUpdateAppointment(contextMenuAppointment.id, {
                checked_in: true,
              });
              setCheckedInIds(prev =>
                new Set(prev).add(contextMenuAppointment.id)
              );
              setSnackbarMessage('Appointment checked in');
              setSnackbarOpen(true);
            } catch (error) {
              console.error('Failed to check in appointment:', error);
              setSnackbarMessage('Failed to check in appointment');
              setSnackbarOpen(true);
              setSnackbarSeverity('error');
            }
          }
        }
      } else {
        // Update backend and local state for single appointment (different day)
        if (onUpdateAppointment) {
          try {
            await onUpdateAppointment(contextMenuAppointment.id, {
              checked_in: true,
            });
            setCheckedInIds(prev =>
              new Set(prev).add(contextMenuAppointment.id)
            );
            setSnackbarMessage('Appointment checked in');
            setSnackbarOpen(true);
          } catch (error) {
            console.error('Failed to check in appointment:', error);
            setSnackbarMessage('Failed to check in appointment');
            setSnackbarOpen(true);
            setSnackbarSeverity('error');
          }
        }
      }
    }
    memoizedHandleCloseContextMenu();
  }, [
    contextMenuAppointment,
    memoizedHandleCloseContextMenu,
    appointments,
    currentDate,
    onUpdateAppointment,
  ]);

  const memoizedHandleCheckOut = useCallback(async () => {
    if (contextMenuAppointment) {
      const appointmentDate = format(
        new Date(contextMenuAppointment.start_time),
        'yyyy-MM-dd'
      );
      const currentDate_formatted = format(currentDate, 'yyyy-MM-dd');

      if (appointmentDate === currentDate_formatted) {
        const sameClientAppointments = appointments.filter(
          appointment =>
            appointment.client_id === contextMenuAppointment.client_id &&
            format(new Date(appointment.start_time), 'yyyy-MM-dd') ===
              appointmentDate
        );

        // Skip multi-expert duplicates: show bulk dialog only if there are appointments from
        // a different booking (different booking_id or independent appointment).
        const contextBookingKey =
          contextMenuAppointment.booking_id ||
          `appt-${contextMenuAppointment.id}`;
        const hasDifferentBooking = sameClientAppointments.some(appt => {
          if (appt.id === contextMenuAppointment.id) return false;
          const apptBookingKey = appt.booking_id || `appt-${appt.id}`;
          return apptBookingKey !== contextBookingKey;
        });

        if (hasDifferentBooking) {
          setCheckOutConfirmDialog({
            open: true,
            appointments: sameClientAppointments,
            singleAppointment: contextMenuAppointment,
          });
        } else {
          // Update backend and local state for single appointment
          if (onUpdateAppointment) {
            try {
              await onUpdateAppointment(contextMenuAppointment.id, {
                checked_in: false,
              });
              setCheckedInIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(contextMenuAppointment.id);
                return newSet;
              });
              setSnackbarMessage('Appointment checked out');
              setSnackbarOpen(true);
            } catch (error) {
              console.error('Failed to check out appointment:', error);
              setSnackbarMessage('Failed to check out appointment');
              setSnackbarOpen(true);
              setSnackbarSeverity('error');
            }
          }
        }
      } else {
        // Update backend and local state for single appointment (different day)
        if (onUpdateAppointment) {
          try {
            await onUpdateAppointment(contextMenuAppointment.id, {
              checked_in: false,
            });
            setCheckedInIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(contextMenuAppointment.id);
              return newSet;
            });
            setSnackbarMessage('Appointment checked out');
            setSnackbarOpen(true);
          } catch (error) {
            console.error('Failed to check out appointment:', error);
            setSnackbarMessage('Failed to check out appointment');
            setSnackbarOpen(true);
            setSnackbarSeverity('error');
          }
        }
      }
    }
    memoizedHandleCloseContextMenu();
  }, [
    contextMenuAppointment,
    memoizedHandleCloseContextMenu,
    appointments,
    currentDate,
    onUpdateAppointment,
  ]);

  // Add state for bill details dialog
  const [billDetailsOpen, setBillDetailsOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const { getOrdersByAppointmentId } = useOrders();

  // Function to handle viewing bill details for completed appointments
  const handleViewBillDetails = async (appointment: any) => {
    if (appointment.status === 'completed') {
      try {
        console.log(
          'DEBUG: Viewing bill details for completed appointment:',
          appointment
        );

        // Fetch order details based on appointment ID
        if (!appointment.id) {
          console.error('DEBUG: Appointment ID is missing', appointment);
          setSnackbarMessage('Cannot fetch bill: Appointment ID is missing');
          setSnackbarOpen(true);
          return;
        }

        // First try direct Supabase query for the appointment ID
        try {
          const { data: directOrders, error: directError } = await supabase
            .from('pos_orders')
            .select('*')
            .eq('appointment_id', appointment.id)
            .order('created_at', { ascending: false });

          console.log(
            'DEBUG: Direct query for appointment_id:',
            appointment.id
          );
          console.log('DEBUG: Direct query results:', directOrders);

          if (directOrders && directOrders.length > 0) {
            console.log('DEBUG: Found orders directly with appointment_id!');

            // For multi-expert appointments, we need to aggregate the data
            if (directOrders.length > 1) {
              const consolidatedBill = {
                ...directOrders[0], // Use first order as base
                // Aggregate services from all orders
                services: directOrders.flatMap(order => order.services || []),
                // Show all stylists involved
                stylist_name: directOrders
                  .map(order => order.stylist_name)
                  .filter(Boolean)
                  .join(', '),
                // Aggregate totals
                subtotal: directOrders.reduce(
                  (sum, order) => sum + (order.subtotal || 0),
                  0
                ),
                tax: directOrders.reduce(
                  (sum, order) => sum + (order.tax || 0),
                  0
                ),
                total: directOrders.reduce(
                  (sum, order) => sum + (order.total || 0),
                  0
                ),
                total_amount: directOrders.reduce(
                  (sum, order) =>
                    sum + (order.total_amount || order.total || 0),
                  0
                ),
                // Combine payments from all orders
                payments: directOrders.flatMap(order => order.payments || []),
                // Mark as multi-expert
                is_multi_expert: true,
                expert_count: directOrders.length,
              };
              console.log(
                'DEBUG: Consolidated multi-expert bill:',
                consolidatedBill
              );
              setSelectedBill(consolidatedBill);
            } else {
              setSelectedBill(directOrders[0]);
            }
            setBillDetailsOpen(true);
            return;
          }
        } catch (directQueryError) {
          console.error('DEBUG: Error in direct query:', directQueryError);
        }

        // Try the hook method as backup
        const orderResponse = await getOrdersByAppointmentId(appointment.id);
        console.log('DEBUG: Orders from hook:', orderResponse);

        if (orderResponse && orderResponse.length > 0) {
          // Get the latest order (in case there are multiple)
          const order = orderResponse[0];
          console.log('DEBUG: Selected bill for display from hook:', order);
          setSelectedBill(order);
          setBillDetailsOpen(true);
          return;
        }

        // If hook approach didn't work, try to find orders created without appointment_id but at the same time
        const appointmentStartTime = new Date(appointment.start_time);

        // Look for orders created within 10 minutes of the appointment start time
        const tenMinutesInMs = 10 * 60 * 1000;
        const startTimeRange = new Date(
          appointmentStartTime.getTime() - tenMinutesInMs
        );
        const endTimeRange = new Date(
          appointmentStartTime.getTime() + tenMinutesInMs
        );

        // Format dates for Supabase query
        const startTimeStr = startTimeRange.toISOString();
        const endTimeStr = endTimeRange.toISOString();

        console.log(
          `DEBUG: Looking for orders between ${startTimeStr} and ${endTimeStr}`
        );

        // Search for orders by client name and time range
        const clientName = getAppointmentClientName(appointment, clients);
        if (clientName !== 'Unknown Client') {
          try {
            const { data: timeRangeOrders, error: timeRangeError } =
              await supabase
                .from('pos_orders')
                .select('*')
                .eq('client_name', clientName)
                .gte('created_at', startTimeStr)
                .lte('created_at', endTimeStr)
                .order('created_at', { ascending: false });

            console.log(
              'DEBUG: Orders by time range and client name:',
              timeRangeOrders
            );

            if (timeRangeOrders && timeRangeOrders.length > 0) {
              // Use the first matching order
              setSelectedBill(timeRangeOrders[0]);
              setBillDetailsOpen(true);
              return;
            }
          } catch (timeRangeQueryError) {
            console.error(
              'DEBUG: Error in time range query:',
              timeRangeQueryError
            );
          }
        }

        // No order found for this appointment
        console.warn(`DEBUG: No bill found for appointment ${appointment.id}`);
        setSnackbarMessage('No bill found for this appointment');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('DEBUG: Error fetching bill details:', error);
        setSnackbarMessage('Error fetching bill details');
        setSnackbarOpen(true);
      }
    } else {
      // For non-completed appointments, just do the regular appointment click handling
      console.log(
        'DEBUG: Appointment is not completed, handling regular click'
      );
      if (onAppointmentClick) onAppointmentClick(appointment);
    }
  };

  // Function to close the bill details dialog
  const handleCloseBillDetails = () => {
    setBillDetailsOpen(false);
    setSelectedBill(null);
  };

  // Format order ID for display
  const formatOrderId = (order: any) => {
    if (!order || !order.id) return 'Unknown';

    // Check if this is a salon consumption order
    const isSalonOrder =
      order.is_salon_consumption === true ||
      order.type === 'salon_consumption' ||
      order.type === 'salon-consumption' ||
      order.consumption_purpose ||
      order.client_name === 'Salon Consumption';

    // Get the year from the order date
    const orderDate = new Date(order.created_at || '');
    const year = orderDate.getFullYear();

    // Format year as 2526 for 2025-2026 period
    const yearFormat =
      year >= 2025
        ? '2526'
        : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;

    // Create a simple numeric ID from the hash
    const hashNumber =
      Math.abs(
        order.id.split('').reduce((a: number, b: string) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      ) % 10000;

    const formattedNumber = String(hashNumber).padStart(4, '0');

    return isSalonOrder
      ? `SC${formattedNumber}/${yearFormat}`
      : `RNG${formattedNumber}/${yearFormat}`;
  };

  return (
    <Box
      sx={{
        width: '100%', // ensure full-width usage on any screen size
        height: '100%', // flex-basis 100% of available parent height
        minHeight: '100vh', // still guarantee full-viewport height as a baseline
        maxWidth: '100vw', // ensure we don't exceed viewport width
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        // Responsive adjustments for better space utilization
        '@media (max-width: 768px)': {
          minHeight: 'calc(100vh - 64px)', // Account for mobile header
        },
        // Fullscreen mode adjustments
        '@media (display-mode: fullscreen)': {
          minHeight: '100vh',
          height: '100vh',
        },
      }}
    >
      <DayViewHeader>
        <Box>
          <Box display='flex' alignItems='center'>
            <IconButton onClick={handlePrevDay}>
              <ChevronLeft />
            </IconButton>
            <Tooltip title='Today'>
              <IconButton onClick={handleToday} sx={{ ml: 1 }}>
                <Today />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant='h6' fontWeight='bold'>
          {format(currentDate, 'EEE, MMM dd, yyyy')}
        </Typography>
        <Box>
          <IconButton onClick={handleNextDay}>
            <ChevronRight />
          </IconButton>
          <Tooltip title='Select Date'>
            <IconButton onClick={handleDatePickerClick}>
              <CalendarMonth />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(datePickerAnchorEl)}
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
                borderRadius: 2,
              },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: 320 }}>
              <Typography variant='h6' sx={{ mb: 2, textAlign: 'center' }}>
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
                        sx: { mb: 2 },
                      },
                    }}
                  />
                </ErrorBoundary>
              </LocalizationProvider>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button onClick={handleDatePickerClose} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
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

      <ScheduleGrid>
        {/* Time Column */}
        {renderTimeColumn()}

        {/* Stylist Columns */}
        {availableStylists.map(stylist => {
          const isOnHoliday = stylist.isOnHoliday;

          // If on holiday, disable break dialog and show tooltip
          const headerContent = (
            <StylistHeader
              isOnHoliday={isOnHoliday}
              stylistColor={stylist.color}
              sx={{ cursor: isOnHoliday ? 'not-allowed' : 'pointer' }}
            >
              <Typography variant='subtitle1'>{stylist.name}</Typography>
            </StylistHeader>
          );

          return (
            <StylistColumn key={stylist.id}>
              {isOnHoliday ? (
                <Tooltip title='Cannot add breaks: Stylist is on holiday'>
                  <span>{headerContent}</span>
                </Tooltip>
              ) : (
                <span onClick={() => handleBreakDialogOpen(stylist.id)}>
                  {headerContent}
                </span>
              )}
              {timeSlots.map((slot, index) => {
                const hour = slot.hour;
                const minute = slot.minute;

                const appointmentSlot = (
                  <AppointmentSlot
                    key={`${stylist.id}-${hour}-${minute}`}
                    className={isOnHoliday ? 'holiday' : ''}
                    sx={{
                      ...(index === availableStylists.length - 1 && {
                        borderRight: 'none',
                      }),
                      ...(isBreakTime(stylist.id, hour, minute) && {
                        backgroundColor: 'rgba(220, 53, 69, 0.3)',
                        backgroundImage:
                          'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(220, 53, 69, 0.5) 6px, rgba(220, 53, 69, 0.5) 12px)',
                        border: '1px dashed rgba(220, 0, 0, 0.8)',
                        cursor: 'not-allowed',
                        '&:hover': {
                          backgroundColor: 'rgba(220, 53, 69, 0.4)',
                        },
                      }),
                    }}
                  />
                );

                // Wrap holiday slots in a Tooltip
                if (isOnHoliday) {
                  return (
                    <Tooltip
                      key={`${stylist.id}-${hour}-${minute}`}
                      title='Stylist is on holiday'
                    >
                      {appointmentSlot}
                    </Tooltip>
                  );
                } else {
                  // For non-holiday slots, add click and drop handlers directly
                  return React.cloneElement(appointmentSlot, {
                    onClick: () => handleSlotClick(stylist.id, hour, minute),
                    onDragOver: (e: React.DragEvent) =>
                      handleDragOver(e, stylist.id, hour, minute),
                    onDrop: (e: React.DragEvent) =>
                      handleDrop(e, stylist.id, hour, minute),
                  });
                }
              })}

              {renderAppointmentsForStylist(stylist.id)}

              {getStylistBreaks(stylist.id).map((breakItem: StylistBreak) => {
                const breakDate = new Date(breakItem.startTime);
                // Only show breaks for the current day
                if (!isSameDay(breakDate, currentDate)) return null;

                // Normalize the break times to ensure consistent handling
                const breakStartTime = normalizeDateTime(breakItem.startTime);
                const breakEndTime = normalizeDateTime(breakItem.endTime);

                // Format times properly
                const startTimeFormatted = formatTime(breakStartTime);
                const endTimeFormatted = formatTime(breakEndTime);

                const top = getAppointmentPosition(breakItem.startTime);
                const height = getAppointmentDuration(
                  breakItem.startTime,
                  breakItem.endTime
                );

                return (
                  <Box
                    key={breakItem.id}
                    className='break-block'
                    sx={{
                      position: 'absolute',
                      left: theme.spacing(0.75),
                      right: theme.spacing(0.75),
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: 'rgba(220, 0, 0, 0.8)',
                      color: 'white',
                      borderRadius: '8px',
                      padding: theme.spacing(1, 1.5),
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      '&:hover': {
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handleEditBreakDialogOpen(breakItem)}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ fontWeight: 'bold', color: 'white' }}
                    >
                      Break Time
                    </Typography>

                    {breakItem.reason && (
                      <Typography
                        variant='body2'
                        sx={{ color: 'white', mb: 1 }}
                      >
                        {breakItem.reason}
                      </Typography>
                    )}

                    <Typography variant='caption' className='break-time-text'>
                      {`${startTimeFormatted} - ${endTimeFormatted}`}
                    </Typography>

                    {/* Add edit and delete buttons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: 'flex',
                        gap: 0.5,
                        opacity: 0.7,
                        '&:hover': { opacity: 1 },
                      }}
                      onClick={e => e.stopPropagation()} // Prevent opening edit dialog when clicking buttons
                    >
                      <IconButton
                        size='small'
                        sx={{
                          padding: 0.3,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleEditBreakDialogOpen(breakItem);
                        }}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        sx={{
                          padding: 0.3,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteBreak(breakItem.id);
                        }}
                      >
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </StylistColumn>
          );
        })}
      </ScheduleGrid>

      {/* Edit Appointment Drawer */}
      <Drawer
        anchor='right'
        variant='persistent'
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: '90vw', md: 500 }, // Responsive width
            maxWidth: 500,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            top: 0,
            right: { xs: 0, sm: 16, md: 16 }, // Add margin from right edge
            position: 'fixed',
            margin: { xs: 0, sm: '0 16px 0 0', md: '0 16px 0 0' }, // Add margin on larger screens
            boxShadow: 3, // Add shadow for better visual separation
            zIndex: 1300, // Ensure it stays above other elements
            // Match the calendar's visual structure
            '& > *': {
              flex: 'none', // Prevent flex children from stretching
            },
            '& > *:nth-of-type(2)': {
              flex: 1, // Only the content area should flex
              overflow: 'auto',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant='h6'>Edit Appointment</Typography>
          <IconButton onClick={handleEditDialogClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable content area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {/* --- Render Dynamic Client Sections --- */}
          {editFormData.clientEntries
            ? editFormData.clientEntries.map((entry, idx) => (
                <Paper
                  key={entry.id}
                  elevation={2}
                  sx={{
                    mb: 3,
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    position: 'relative',
                  }}
                >
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      variant='subtitle1'
                      component='div'
                      fontWeight='medium'
                    >
                      Client {idx + 1}
                    </Typography>
                    {editFormData.clientEntries &&
                      editFormData.clientEntries.length > 1 && (
                        <Tooltip title='Remove Client Entry'>
                          <IconButton
                            onClick={() => handleRemoveClientEntry(entry.id)}
                            size='small'
                            color='error'
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            <DeleteIcon fontSize='small' />
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
                          const filtered = filterClients(
                            options as any,
                            params
                          );
                          // Suggest the creation of a new value
                          const { inputValue } = params;
                          const isExisting = options.some(
                            option => inputValue === (option as any).full_name
                          );
                          if (inputValue !== '' && !isExisting) {
                            filtered.push({
                              inputValue: `Add "${inputValue}"`, // Presentation for adding new
                              full_name: inputValue, // Actual value to use
                              id: '', // Indicate it's new
                              phone: '',
                            });
                          }
                          return filtered;
                        }}
                        options={allClients || []}
                        loading={isLoadingClients}
                        getOptionLabel={option => {
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
                        onChange={(_, newValue) =>
                          handleClientChange(entry.id, newValue)
                        }
                        isOptionEqualToValue={(option, value) => {
                          if (!value) return false;
                          return option.id === value.id;
                        }}
                        renderOption={(props, option) => {
                          // Distinguish between regular options and the "Add..." option
                          if ((option as any).inputValue) {
                            return (
                              <li {...props} key={(option as any).inputValue}>
                                {(option as any).inputValue}
                              </li>
                            );
                          }
                          return (
                            <li
                              {...props}
                              key={option.id}
                            >{`${option.full_name}${option.phone ? ` (${option.phone})` : ''}`}</li>
                          );
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Client *'
                            required
                            error={!entry.client || !entry.client.full_name}
                            helperText={
                              !entry.client || !entry.client.full_name
                                ? 'Client name required'
                                : ''
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingClients ? (
                                    <CircularProgress
                                      color='inherit'
                                      size={20}
                                    />
                                  ) : null}
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
                          label='Mobile Number *'
                          value={entry.client.phone || ''}
                          onChange={e =>
                            handleClientPhoneChange(entry.id, e.target.value)
                          }
                          fullWidth
                          size='small'
                          required
                          error={!entry.client.phone}
                          helperText={
                            !entry.client.phone
                              ? 'Phone required for new client'
                              : ''
                          }
                        />
                      </Grid>
                    )}

                    {/* 2a. Service Collection Selector */}
                    <Grid item xs={12}>
                      <Autocomplete
                        options={serviceCollections || []}
                        getOptionLabel={collection => collection.name}
                        value={
                          serviceCollections?.find(
                            c => c.id === entry.selectedCollectionId
                          ) || null
                        }
                        onChange={(_, collection) =>
                          handleCollectionChange(entry.id, collection)
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.id === value?.id
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        )}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Service Collection *'
                            required
                            error={!entry.selectedCollectionId}
                            helperText={
                              !entry.selectedCollectionId
                                ? 'Select a collection'
                                : ''
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingCollectionServices ? (
                                    <CircularProgress
                                      color='inherit'
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        fullWidth
                        size='small'
                      />
                    </Grid>

                    {/* 2b. Services multi-select */}
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={
                          services?.filter(
                            s =>
                              (s as any).collection_id ===
                              entry.selectedCollectionId
                          ) || []
                        }
                        getOptionLabel={s => `${s.name} (${s.duration} min)`}
                        value={entry.services}
                        onChange={(_, services) =>
                          handleServicesChange(entry.id, services)
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        disabled={!entry.selectedCollectionId}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {`${option.name} (${option.duration} min)`}
                          </li>
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((s, i) => (
                            <Chip
                              {...getTagProps({ index: i })}
                              key={s.id}
                              label={s.name}
                              size='small'
                              variant='outlined'
                            />
                          ))
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Service(s) *'
                            required
                            error={
                              !!entry.selectedCollectionId &&
                              entry.services.length === 0
                            }
                            helperText={
                              !entry.selectedCollectionId
                                ? 'Select a collection first'
                                : entry.services.length === 0
                                  ? 'Select at least one service'
                                  : ''
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingCollectionServices &&
                                  entry.selectedCollectionId ? (
                                    <CircularProgress
                                      color='inherit'
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        fullWidth
                        size='small'
                      />
                    </Grid>

                    {/* 3. Stylists multi-select */}
                    <Grid item xs={12}>
                      <Autocomplete
                        sx={{ mb: 2 }}
                        multiple
                        options={
                          (availableStylists || []) // Use availableStylists
                            .filter(st => st.available !== false) // Only show available stylists
                            .sort((a, b) => a.name.localeCompare(b.name)) // Sort by name
                            .map(st => ({ id: st.id, name: st.name })) // Map to {id, name} format
                        }
                        getOptionLabel={st => st.name}
                        value={entry.stylistList || []} // Ensure value is always an array
                        onChange={(_, stylists) =>
                          handleStylistsChange(entry.id, stylists)
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {option.name}
                          </li>
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((st, i) => {
                            const { key, ...rest } = getTagProps({ index: i });
                            return (
                              <Chip
                                key={key}
                                {...rest}
                                label={st.name}
                                size='small'
                                variant='outlined'
                              />
                            );
                          })
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Stylist(s) *'
                            required
                            error={
                              !entry.stylistList ||
                              entry.stylistList.length === 0
                            } // Added null check
                            helperText={
                              !entry.stylistList ||
                              entry.stylistList.length === 0
                                ? 'Select at least one stylist'
                                : ''
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingStylists ? (
                                    <CircularProgress
                                      color='inherit'
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))
            : null}

          <Button
            variant='outlined'
            onClick={handleAddClientEntry}
            startIcon={<AddIcon />}
            fullWidth
            sx={{
              mb: 3,
              mt: 1,
              py: 1.5,
              borderColor: 'primary.light',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            Add Another Client
          </Button>
          {/* --- End Dynamic Client Sections --- */}

          <Divider sx={{ my: 3 }} />

          {/* Step 4: Select Time (Now Global) */}
          <Typography variant='subtitle1' gutterBottom fontWeight='medium'>
            Select Time
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth required size='small'>
                <InputLabel>Start Time</InputLabel>
                <Select
                  value={editFormData.startTime}
                  onChange={e => handleTimeChange(e, 'startTime')}
                  label='Start Time'
                  error={!editFormData.startTime}
                >
                  {timeOptions.map(option => (
                    <MenuItem
                      key={`start-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {!editFormData.startTime && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                    Start time required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required size='small'>
                <InputLabel>End Time</InputLabel>
                <Select
                  value={editFormData.endTime}
                  onChange={e => handleTimeChange(e, 'endTime')}
                  label='End Time'
                  error={!editFormData.endTime}
                >
                  {timeOptions.map(option => (
                    <MenuItem key={`end-${option.value}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {!editFormData.endTime && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
                    End time required
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Step 5: Notes */}
          <Typography variant='subtitle1' gutterBottom fontWeight='medium'>
            Notes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label='Appointment Notes (Optional)'
                value={editFormData.notes}
                onChange={e =>
                  setEditFormData({ ...editFormData, notes: e.target.value })
                }
                multiline
                rows={3}
                fullWidth
                size='small'
                placeholder='Add any relevant notes for the overall appointment...'
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer with action buttons */}
        <Box
          sx={{
            p: 3,
            pt: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {onDeleteAppointment && (
            <Button
              onClick={handleDeleteAppointment}
              color='error'
              sx={{
                mr: 'auto',
                borderColor: '#d32f2f',
                '&:hover': {
                  borderColor: '#b71c1c',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                },
              }}
              variant='outlined'
            >
              Delete
            </Button>
          )}
          <Button
            onClick={handleCreateBill}
            sx={{
              mr: 'auto',
              bgcolor: '#6B8E23',
              color: 'white',
              '&:hover': {
                bgcolor: '#566E1C',
              },
            }}
            variant='contained'
            startIcon={<ReceiptIcon />}
          >
            Create Bill
          </Button>
          <Button
            onClick={handleEditDialogClose}
            sx={{
              color: '#6B8E23',
              borderColor: '#6B8E23',
              '&:hover': {
                borderColor: '#566E1C',
                backgroundColor: 'rgba(107, 142, 35, 0.04)',
              },
            }}
            variant='outlined'
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAppointment}
            variant='contained'
            sx={{
              bgcolor: '#6B8E23',
              '&:hover': {
                bgcolor: '#566E1C',
              },
            }}
          >
            Update Appointment
          </Button>
        </Box>
      </Drawer>

      {/* Break Dialog */}
      <Dialog
        open={breakDialogOpen}
        onClose={handleBreakDialogClose}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Manage Break Time</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
              Add New Break
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={breakFormData.startTime}
                    onChange={e =>
                      setBreakFormData({
                        ...breakFormData,
                        startTime: e.target.value as string,
                      })
                    }
                    label='Start Time'
                  >
                    {timeOptions.map(option => (
                      <MenuItem
                        key={`break-start-${option.value}`}
                        value={option.value}
                      >
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
                    onChange={e =>
                      setBreakFormData({
                        ...breakFormData,
                        endTime: e.target.value as string,
                      })
                    }
                    label='End Time'
                  >
                    {timeOptions.map(option => (
                      <MenuItem
                        key={`break-end-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label='Reason'
                  value={breakFormData.reason}
                  onChange={e =>
                    setBreakFormData({
                      ...breakFormData,
                      reason: e.target.value,
                    })
                  }
                  fullWidth
                  placeholder='Optional: Enter reason for break'
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={handleAddBreak}
                  variant='contained'
                  color='primary'
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
            <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
              Existing Breaks
            </Typography>
            {selectedStylist &&
            selectedStylist.breaks &&
            selectedStylist.breaks.length > 0 ? (
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStylist.breaks.map(
                      (breakItem: Break, index: number) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {formatTime(breakItem.startTime)}
                          </TableCell>
                          <TableCell>{formatTime(breakItem.endTime)}</TableCell>
                          <TableCell>{breakItem.reason || '-'}</TableCell>
                          <TableCell align='right'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() =>
                                handleEditBreakDialogOpen(breakItem)
                              }
                              title='Edit break'
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize='small' />
                            </IconButton>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteBreak(breakItem.id)}
                              title='Delete break'
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper
                variant='outlined'
                sx={{
                  p: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                  bgcolor: 'grey.50',
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
      <Dialog
        open={editBreakDialogOpen}
        onClose={handleEditBreakDialogClose}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Edit Break Time</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Start Time</InputLabel>
                  <Select
                    value={editBreakFormData.startTime}
                    onChange={e =>
                      setEditBreakFormData({
                        ...editBreakFormData,
                        startTime: e.target.value as string,
                      })
                    }
                    label='Start Time'
                  >
                    {timeOptions.map(option => (
                      <MenuItem
                        key={`break-edit-start-${option.value}`}
                        value={option.value}
                      >
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
                    onChange={e =>
                      setEditBreakFormData({
                        ...editBreakFormData,
                        endTime: e.target.value as string,
                      })
                    }
                    label='End Time'
                  >
                    {timeOptions.map(option => (
                      <MenuItem
                        key={`break-edit-end-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Reason (Optional)'
                  value={editBreakFormData.reason}
                  onChange={e =>
                    setEditBreakFormData({
                      ...editBreakFormData,
                      reason: e.target.value,
                    })
                  }
                  variant='outlined'
                  placeholder='Lunch, Meeting, etc.'
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditBreakDialogClose}>Cancel</Button>
          <Button
            onClick={handleUpdateBreak}
            variant='contained'
            color='primary'
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
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Check-in Confirmation Dialog */}
      <Dialog
        open={checkInConfirmDialog.open}
        onClose={() =>
          setCheckInConfirmDialog(prev => ({ ...prev, open: false }))
        }
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Check In Appointments</DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            You have multiple appointments for this client today. Would you like
            to:
          </Typography>
          <Box component='ul' sx={{ pl: 2, mb: 2 }}>
            <Typography component='li' variant='body1' sx={{ mb: 1 }}>
              Check in all {checkInConfirmDialog.appointments.length}{' '}
              appointments for{' '}
              {checkInConfirmDialog.singleAppointment?.clientDetails?.[0]
                ?.full_name || 'this client'}
            </Typography>
            <Typography component='li' variant='body1'>
              Or check in only this specific appointment
            </Typography>
          </Box>
          {/* Optionally, keep a list of appointments for reference */}
          {/* <List>
            {checkInConfirmDialog.appointments.map((appointment) => (
              <ListItem key={appointment.id}>
                <ListItemText
                  primary={appointment.clientDetails?.[0]?.full_name || 'Unknown Client'}
                  secondary={`${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`}
                />
              </ListItem>
            ))}
          </List> */}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={() =>
              setCheckInConfirmDialog(prev => ({ ...prev, open: false }))
            }
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (checkInConfirmDialog.singleAppointment) {
                // Update backend for single appointment
                if (onUpdateAppointment) {
                  try {
                    await onUpdateAppointment(
                      checkInConfirmDialog.singleAppointment.id,
                      { checked_in: true }
                    );
                    // Update local state only after successful backend update
                    setCheckedInIds(prev =>
                      new Set(prev).add(
                        checkInConfirmDialog.singleAppointment.id
                      )
                    );
                    setSnackbarMessage('Appointment checked in');
                    setSnackbarOpen(true);
                    setSnackbarSeverity('success');
                  } catch (error) {
                    console.error(
                      'Failed to check in single appointment:',
                      error
                    );
                    setSnackbarMessage('Failed to check in appointment');
                    setSnackbarOpen(true);
                    setSnackbarSeverity('error');
                  }
                }
              }
              setCheckInConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            variant='outlined'
            color='primary'
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(107, 142, 35, 0.04)',
              },
            }}
          >
            Check In This Only
          </Button>
          <Button
            onClick={async () => {
              if (onUpdateAppointment) {
                try {
                  // Update backend for all appointments in the group
                  await Promise.all(
                    checkInConfirmDialog.appointments.map(appointment =>
                      onUpdateAppointment(appointment.id, { checked_in: true })
                    )
                  );
                  // Update local state after all backend updates are successful
                  setCheckedInIds(prev => {
                    const newSet = new Set(prev);
                    checkInConfirmDialog.appointments.forEach(appointment =>
                      newSet.add(appointment.id)
                    );
                    return newSet;
                  });
                  setSnackbarMessage('All appointments checked in');
                  setSnackbarOpen(true);
                  setSnackbarSeverity('success');
                } catch (error) {
                  console.error('Failed to check in all appointments:', error);
                  setSnackbarMessage('Failed to check in appointments');
                  setSnackbarOpen(true);
                  setSnackbarSeverity('error');
                }
              }
              setCheckInConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            variant='contained'
            color='primary'
            sx={{ bgcolor: '#6B8E23', '&:hover': { bgcolor: '#566E1C' } }}
          >
            Check In All {checkInConfirmDialog.appointments.length}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Confirmation Dialog */}
      <Dialog
        open={checkOutConfirmDialog.open}
        onClose={() =>
          setCheckOutConfirmDialog(prev => ({ ...prev, open: false }))
        }
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Check Out Appointments</DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            This client has multiple appointments today. Would you like to:
          </Typography>
          <Box component='ul' sx={{ pl: 2, mb: 2 }}>
            <Typography component='li' variant='body1' sx={{ mb: 1 }}>
              Check out all {checkOutConfirmDialog.appointments.length}{' '}
              appointments for{' '}
              {checkOutConfirmDialog.singleAppointment?.clientDetails?.[0]
                ?.full_name || 'this client'}
            </Typography>
            <Typography component='li' variant='body1'>
              Or check out only this specific appointment
            </Typography>
          </Box>
          {/* Optionally, keep a list of appointments for reference */}
          {/* <List>
            {checkOutConfirmDialog.appointments.map((appointment) => (
              <ListItem key={appointment.id}>
                <ListItemText
                  primary={appointment.clientDetails?.[0]?.full_name || 'Unknown Client'}
                  secondary={`${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`}
                />
              </ListItem>
            ))}
          </List> */}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={() =>
              setCheckOutConfirmDialog(prev => ({ ...prev, open: false }))
            }
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (checkOutConfirmDialog.singleAppointment) {
                // Update backend for single appointment
                if (onUpdateAppointment) {
                  try {
                    await onUpdateAppointment(
                      checkOutConfirmDialog.singleAppointment.id,
                      { checked_in: false }
                    );
                    // Update local state only after successful backend update
                    setCheckedInIds(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(checkOutConfirmDialog.singleAppointment.id);
                      return newSet;
                    });
                    setSnackbarMessage('Appointment checked out');
                    setSnackbarOpen(true);
                    setSnackbarSeverity('success');
                  } catch (error) {
                    console.error(
                      'Failed to check out single appointment:',
                      error
                    );
                    setSnackbarMessage('Failed to check out appointment');
                    setSnackbarOpen(true);
                    setSnackbarSeverity('error');
                  }
                }
                setCheckOutConfirmDialog({
                  ...checkOutConfirmDialog,
                  open: false,
                });
              }
            }}
            color='primary'
            variant='contained'
          >
            Check Out This Only
          </Button>
          <Button
            onClick={async () => {
              if (checkOutConfirmDialog.appointments) {
                // Update backend for all related appointments
                if (onUpdateAppointment) {
                  try {
                    await Promise.all(
                      checkOutConfirmDialog.appointments.map(async appt => {
                        await onUpdateAppointment(appt.id, {
                          checked_in: false,
                        });
                      })
                    );
                    // Update local state only after successful backend update
                    const idsToUncheck = new Set(
                      checkOutConfirmDialog.appointments.map(appt => appt.id)
                    );
                    setCheckedInIds(
                      prev =>
                        new Set([...prev].filter(id => !idsToUncheck.has(id)))
                    );
                    setSnackbarMessage('All related appointments checked out');
                    setSnackbarOpen(true);
                    setSnackbarSeverity('success');
                  } catch (error) {
                    console.error(
                      'Failed to check out related appointments:',
                      error
                    );
                    setSnackbarMessage(
                      'Failed to check out related appointments'
                    );
                    setSnackbarOpen(true);
                    setSnackbarSeverity('error');
                  }
                }
                setCheckOutConfirmDialog({
                  ...checkOutConfirmDialog,
                  open: false,
                });
              }
            }}
            color='secondary'
          >
            Check Out All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={Boolean(contextMenuAnchorEl)}
        anchorEl={contextMenuAnchorEl}
        onClose={memoizedHandleCloseContextMenu}
      >
        <MenuItem
          onClick={() => {
            if (contextMenuAppointment && onAppointmentClick) {
              onAppointmentClick(contextMenuAppointment);
              memoizedHandleCloseContextMenu();
            }
          }}
        >
          Edit Appointment
        </MenuItem>
        {contextMenuAppointment &&
          !checkedInIds.has(contextMenuAppointment.id) && (
            <MenuItem onClick={memoizedHandleCheckIn}>Check In</MenuItem>
          )}
        {contextMenuAppointment &&
          checkedInIds.has(contextMenuAppointment.id) && (
            <MenuItem onClick={memoizedHandleCheckOut}>Check Out</MenuItem>
          )}
      </Menu>

      {/* Bill Details Dialog */}
      {selectedBill && (
        <Dialog
          open={billDetailsOpen}
          onClose={handleCloseBillDetails}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant='h6'>Bill Details</Typography>
              </Box>
              <IconButton onClick={handleCloseBillDetails} size='small'>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' gutterBottom>
                  Order Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant='body2'>
                    <strong>Order ID:</strong> {formatOrderId(selectedBill)}
                    {selectedBill.is_multi_expert && (
                      <Chip
                        size='small'
                        label='Multi-Expert Order'
                        color='secondary'
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Date:</strong>{' '}
                    {new Date(selectedBill.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Customer:</strong> {selectedBill.client_name}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>
                      Stylist{selectedBill.is_multi_expert ? 's' : ''}:
                    </strong>{' '}
                    {selectedBill.stylist_name}
                    {selectedBill.is_multi_expert && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        Revenue split among all experts
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Status:</strong>{' '}
                    {selectedBill.status || 'completed'}
                  </Typography>
                  <Typography variant='body2'>
                    <strong>Payment Method:</strong>{' '}
                    {(() => {
                      if (
                        selectedBill.payments &&
                        selectedBill.payments.length > 0
                      ) {
                        const uniqueMethods = [
                          ...new Set(
                            selectedBill.payments.map(
                              (p: any) => p.payment_method
                            )
                          ),
                        ] as string[];
                        return uniqueMethods
                          .map(
                            (method: string) =>
                              PAYMENT_METHOD_LABELS[method as PaymentMethod] ||
                              method
                                .replace('_', ' ')
                                .replace(/\b\w/g, (l: string) =>
                                  l.toUpperCase()
                                )
                          )
                          .join(', ');
                      }
                      return (
                        PAYMENT_METHOD_LABELS[
                          selectedBill.payment_method as PaymentMethod
                        ] ||
                        selectedBill.payment_method
                          ?.replace('_', ' ')
                          .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
                        'Cash'
                      );
                    })()}
                  </Typography>
                  {selectedBill.appointment_time && (
                    <Typography variant='body2'>
                      <strong>Appointment Time:</strong>{' '}
                      {new Date(selectedBill.appointment_time).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' gutterBottom>
                  Payment Summary
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2'>Subtotal:</Typography>
                    <Typography variant='body2'>
                      {formatCurrency(selectedBill.subtotal || 0)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2'>GST (18%):</Typography>
                    <Typography variant='body2'>
                      {formatCurrency(selectedBill.tax || 0)}
                    </Typography>
                  </Box>
                  {(selectedBill.discount || 0) > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant='body2'>Discount:</Typography>
                      <Typography variant='body2' color='error'>
                        -{formatCurrency(selectedBill.discount || 0)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2' fontWeight='bold'>
                      Total:
                    </Typography>
                    <Typography variant='body2' fontWeight='bold'>
                      {(() => {
                        // Calculate total from actual payments for accuracy (same logic as Orders page)
                        let displayTotal =
                          selectedBill.total_amount || selectedBill.total || 0;
                        if (
                          selectedBill.payments &&
                          selectedBill.payments.length > 0
                        ) {
                          const paymentTotal = selectedBill.payments.reduce(
                            (sum: number, payment: any) =>
                              sum + (payment.amount || 0),
                            0
                          );
                          if (paymentTotal > 0) {
                            displayTotal = paymentTotal;
                          }
                        }
                        return formatCurrency(displayTotal);
                      })()}
                    </Typography>
                  </Box>

                  {/* Show payment details for split payments - only when multiple payment methods or multi-expert */}
                  {(selectedBill.is_split_payment ||
                    selectedBill.is_multi_expert) &&
                    selectedBill.payments &&
                    selectedBill.payments.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant='subtitle2' gutterBottom>
                          Payment Details
                        </Typography>
                        <TableContainer component={Paper} variant='outlined'>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>Method</TableCell>
                                <TableCell align='right'>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(() => {
                                // Aggregate payments by method (same logic as Orders page)
                                const aggregatedPayments =
                                  selectedBill.payments.reduce(
                                    (acc: any, payment: any) => {
                                      const method = payment.payment_method;
                                      if (!acc[method]) {
                                        acc[method] = {
                                          payment_method: method,
                                          amount: 0,
                                        };
                                      }
                                      acc[method].amount += payment.amount || 0;
                                      return acc;
                                    },
                                    {}
                                  );

                                return Object.values(aggregatedPayments).map(
                                  (payment: any) => (
                                    <TableRow key={payment.payment_method}>
                                      <TableCell>
                                        {PAYMENT_METHOD_LABELS[
                                          payment.payment_method as PaymentMethod
                                        ] || payment.payment_method}
                                      </TableCell>
                                      <TableCell align='right'>
                                        {formatCurrency(payment.amount)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                );
                              })()}
                              {(selectedBill.pending_amount || 0) > 0 &&
                                selectedBill.status !== 'completed' && (
                                  <TableRow>
                                    <TableCell>
                                      <Typography color='error'>
                                        Pending Payment:
                                      </Typography>
                                    </TableCell>
                                    <TableCell align='right'>
                                      <Typography color='error'>
                                        {formatCurrency(
                                          selectedBill.pending_amount || 0
                                        )}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  Order Items
                </Typography>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align='right'>Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        if (!selectedBill.services) return null;

                        // Aggregate services by name (same logic as Orders page)
                        const aggregatedServices = selectedBill.services.reduce(
                          (acc: any, item: any) => {
                            const serviceName = item.service_name || item.name;
                            if (!acc[serviceName]) {
                              acc[serviceName] = {
                                service_name: serviceName,
                                name: serviceName,
                                type: item.type || 'Service',
                                forSalonUse: item.forSalonUse,
                                price: 0,
                                quantity: 0,
                              };
                            }
                            acc[serviceName].price +=
                              (item.price || 0) * (item.quantity || 1);
                            acc[serviceName].quantity += item.quantity || 1;
                            return acc;
                          },
                          {}
                        );

                        return Object.values(aggregatedServices).map(
                          (item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                {item.service_name || item.name}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size='small'
                                  label={item.type || 'Service'}
                                  color={
                                    item.type === 'product'
                                      ? 'secondary'
                                      : 'primary'
                                  }
                                />
                                {item.forSalonUse && (
                                  <Chip
                                    size='small'
                                    label='Salon Use'
                                    color='warning'
                                    sx={{ ml: 0.5 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell align='right'>
                                {formatCurrency(item.price)}
                              </TableCell>
                            </TableRow>
                          )
                        );
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => selectedBill && printBill(selectedBill)}
              variant='contained'
              color='secondary'
              startIcon={<ReceiptIcon />}
              sx={{ mr: 1 }}
            >
              Print Bill
            </Button>
            <Button
              onClick={() => {
                // Find the appointment associated with this bill
                const appointment = appointments.find(
                  a =>
                    a.id === selectedBill.appointment_id ||
                    (selectedBill.client_name &&
                      a.clientDetails &&
                      a.clientDetails[0]?.full_name ===
                        selectedBill.client_name)
                );

                if (appointment && onAppointmentClick) {
                  // Close the bill details dialog
                  handleCloseBillDetails();
                  // Open the appointment edit dialog
                  onAppointmentClick(appointment);
                } else {
                  setSnackbarMessage(
                    'Could not find the associated appointment'
                  );
                  setSnackbarOpen(true);
                  setSnackbarSeverity('error');
                }
              }}
              variant='contained'
              color='primary'
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Edit Appointment
            </Button>
            <Button
              onClick={handleCloseBillDetails}
              variant='contained'
              color='primary'
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default StylistDayView;
