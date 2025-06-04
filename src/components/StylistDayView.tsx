/**
 * StylistDayView Component
 * 
 * SCROLL POSITION PRESERVATION:
 * This component implements a comprehensive scroll preservation system to prevent
 * unwanted scroll resets during user interactions:
 * 
 * FIXED ISSUES:
 * 1. ❌ Right-click context menu operations causing scroll reset
 * 2. ❌ Check-in/Check-out actions resetting scroll position  
 * 3. ❌ Opening appointment drawer resetting scroll position
 * 4. ❌ Opening break management dialogs resetting scroll position
 * 5. ❌ State changes triggering automatic scroll restoration
 * 
 * SOLUTION IMPLEMENTED:
 * - Enhanced scroll preservation with localStorage persistence
 * - Store scroll position before any dialog/context menu operations
 * - Restore scroll position only when all dialogs/menus are closed
 * - Use immediate scroll restoration (behavior: 'auto') to prevent animation conflicts
 * - Debounced scroll saving to prevent excessive localStorage writes
 * 
 * SCROLL MANAGEMENT STRATEGY:
 * - useScrollPreservation hook with localStorage support
 * - Automatic scroll position persistence across sessions
 * - Enhanced scroll handler with debounced saving
 * - Dialog handlers: Store position on open, restore on close
 * - Context menu: Preserves position during right-click operations
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
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
  Menu
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, Today, Receipt, CalendarMonth, Delete as DeleteIcon, Close as CloseIcon, Add as AddIcon, Edit as EditIcon, Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
import { sendAppointmentNotification } from '../utils/whatsapp';
import { StylistHoliday } from '../hooks/useStylistHolidays';
import { useScrollPreservation } from '../utils/scrollPreservation';
import { useLocalStorage } from '../utils/useLocalStorage';

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

// Height in pixels of the StylistColumn header (must match StylistHeader height)
const STYLIST_HEADER_HEIGHT = 56;

// Styled components
const DayViewContainer = styled(Paper)(({ theme }) => ({
  height: '100vh', // Changed from 100% to 100vh to ensure full viewport height
  minHeight: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'visible', // Allow vertical scrollbars
  backgroundColor: theme.palette.background.default,
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none',
}));

const DayViewHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper, // White background
  borderTopLeftRadius: 28, // Match container
  borderTopRightRadius: 28, // Match container
}));

const ScheduleGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  minHeight: `${((BUSINESS_HOURS.end - BUSINESS_HOURS.start + 1) * 4) * TIME_SLOT_HEIGHT + STYLIST_HEADER_HEIGHT}px`, // Ensure all slots are visible
  overflowY: 'visible',   // allow page to scroll vertically so headers stick to viewport
  overflowX: 'visible',   // defer horizontal scroll to outer wrapper for reliable sticky behavior
  position: 'relative',
  width: 'max-content', // expand to fit all columns so TimeColumn sticks across full scroll
  border: 'none',
  borderTop: 'none'
}));

const TimeColumn = styled(Box)(({ theme }) => ({
  width: 80, // Keep at 80px for consistency with CSS
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  left: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 12, // Higher than StylistHeader to ensure it stays above
  paddingTop: 0,
  marginTop: 0,
  borderTop: 'none'
}));

// Update HeaderWrapper for better transition
const HeaderWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000, // Very high z-index to ensure it's on top
  pointerEvents: 'none', // Let clicks pass through the wrapper
  transition: 'all 0.2s ease-in-out',
}));

// Update FixedStylistHeader with better contrast
const FixedStylistHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main, // Use primary color for better visibility
  height: STYLIST_HEADER_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto', // Re-enable pointer events for the header itself
  color: 'white',
  fontWeight: 'bold',
}));

const StylistColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 200,
  [theme.breakpoints.down('sm')]: {
    minWidth: 120,
  },
  position: 'relative',
  backgroundColor: theme.palette.salon.offWhite,
  height: '100%',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
  borderTop: 'none',
  // Removed CSS containment to ensure sticky headers can function
}));

// Update StylistHeader - replace 'left: 0' with overflow control
const StylistHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  borderTop: 'none',
  backgroundColor: theme.palette.salon.oliveLight,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  height: STYLIST_HEADER_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const TimeSlot = styled(Box)(({ theme }) => ({
  height: TIME_SLOT_HEIGHT,
  [theme.breakpoints.down('sm')]: {
    height: Math.floor(TIME_SLOT_HEIGHT * 0.7),
  },
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderTop: 'none',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.75),
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:first-of-type': {
    borderTop: 'none',
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
  borderTop: 'none',
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
  '&:first-of-type': {
    borderTop: 'none',
  },
}));

// Update the AppointmentCard component
const AppointmentCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPaid' && prop !== 'duration' && prop !== 'status' && prop !== 'isCheckedIn',
})<{ duration: number; isPaid: boolean; status: 'scheduled' | 'completed' | 'cancelled'; isCheckedIn?: boolean }>(
  ({ theme, duration, isPaid, status, isCheckedIn }) => ({
  position: 'absolute',
  left: theme.spacing(0.75),
  right: theme.spacing(0.75),
  height: `${Math.max(duration, TIME_SLOT_HEIGHT / 2)}px`, // Ensure minimum height
  // backgroundColor is effectively overridden by inline style for checked-in state,
  // this is the fallback.
  backgroundColor:
    status === 'completed'
      ? theme.palette.grey[400] // Grey background for completed appointments
      : isPaid
        ? theme.palette.success.light // Green if paid (and not completed)
        : theme.palette.primary.main, // Default olive if scheduled/cancelled and not paid
  color:
    isCheckedIn // Precedence for checked-in state
      ? theme.palette.getContrastText('#D2B48C') // Contrast text for Tan
      : status === 'completed'
      ? theme.palette.getContrastText(theme.palette.grey[400]) // Contrast text for grey
      : isPaid
        ? theme.palette.success.contrastText // Contrast text for success
        : theme.palette.primary.contrastText, // Contrast text for primary
  borderRadius: 8,
  padding: theme.spacing(1, 1.5),
  overflow: 'hidden',
  boxShadow:
    status === 'completed'
      ? '0px 2px 6px rgba(0, 0, 0, 0.15)' // Grey shadow for completed
      : isCheckedIn
      ? '0px 4px 12px rgba(177, 137, 99, 0.3)' // Tan-complementary shadow for checked-in
      : '0px 4px 12px rgba(107, 142, 35, 0.25)', // Default green shadow
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
  '&:after': { // Debug outline
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '1px dashed rgba(0,0,0,0.2)',
    borderRadius: 8,
    pointerEvents: 'none',
  }
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
    boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
  }
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
  available?: boolean;
  holidays?: StylistHoliday[]; // Add holidays array to stylist
  // ... other stylist properties ...
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
  onUpdateBreak?: (stylistId: string, breakId: string, breakData: Omit<Break, 'id'>) => Promise<void>; // Add this prop
  onDateChange?: (date: Date) => void;
  onStylistsChange?: (updatedStylists: Stylist[]) => void;
  onAppointmentClick?: (appointment: any) => void;
  lastBookedAppointmentTime?: string; // New prop to track last booked appointment time
  holidays?: StylistHoliday[]; // Add holidays prop
}

// Define filter for freeSolo client options
const filterClients = createFilterOptions<{ id: string; full_name: string; phone?: string; inputValue?: string }>();

// Memoized AppointmentCard component to prevent unnecessary re-renders
const MemoizedAppointmentCard = memo(({ 
  appointment, 
  isCheckedIn, 
  bgColor, 
  duration, 
  isPaid, 
  status, 
  onDragStart, 
  onClick, 
  onContextMenu, 
  style, 
  children 
}: any) => (
  <AppointmentCard
    draggable
    onDragStart={onDragStart}
    onClick={onClick}
    onContextMenu={onContextMenu}
    style={style}
    duration={duration}
    isPaid={isPaid}
    status={status}
    isCheckedIn={isCheckedIn}
  >
    {children}
  </AppointmentCard>
));

MemoizedAppointmentCard.displayName = 'MemoizedAppointmentCard';

// Add at the top of the StylistDayView component
const MemoizedScheduleGrid = React.memo(
  ({ children, scheduleGridRef, onScroll, ...rest }: { 
    children: React.ReactNode; 
    scheduleGridRef: React.RefObject<HTMLDivElement>;
    onScroll?: () => void;
    [key: string]: any;
  }) => {
    console.log("ScheduleGrid rendering");
    return (
      <ScheduleGrid 
        ref={scheduleGridRef} 
        onScroll={onScroll}
        {...rest}
      >
        {children}
      </ScheduleGrid>
    );
  }, 
  () => true // Always return true to prevent re-renders
);

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
}) => {
  const theme = useTheme();
  const { clients: allClients = [], isLoading: isLoadingClients } = useClients(); // Add default empty array
  const navigate = useNavigate();

  // Basic component state
  const [stylists, setStylists] = useState<Stylist[]>(initialStylists);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  
  // Break state
  const [breakDialogOpen, setBreakDialogOpen] = useState<boolean>(false);
  const [breakFormData, setBreakFormData] = useState({
    startTime: '',
    endTime: '',
    reason: ''
  });
  
  // Edit break state
  const [editingBreak, setEditingBreak] = useState<Break | null>(null);
  const [editBreakDialogOpen, setEditBreakDialogOpen] = useState(false);
  const [editBreakFormData, setEditBreakFormData] = useState({
    startTime: '',
    endTime: '',
    reason: ''
  });

  // Track checked-in appointments and context menu state
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [contextMenuPosition, setContextMenuPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [contextMenuAppointment, setContextMenuAppointment] = useState<any | null>(null);
  
  // Add confirmation dialog states for check-in/check-out
  const [checkInConfirmDialog, setCheckInConfirmDialog] = useState<{
    open: boolean;
    appointments: any[];
    singleAppointment: any;
  }>({
    open: false,
    appointments: [],
    singleAppointment: null
  });
  
  const [checkOutConfirmDialog, setCheckOutConfirmDialog] = useState<{
    open: boolean;
    appointments: any[];
    singleAppointment: any;
  }>({
    open: false,
    appointments: [],
    singleAppointment: null
  });
  
  // State variables for scroll position tracking
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [gridRect, setGridRect] = useState<DOMRect | null>(null);
  const isContextMenuOpen = useRef<boolean>(false);
  
  // Enhanced scroll position preservation
  const scrollPositionRef = useRef({ top: 0, left: 0 });
  const isScrollRestoringRef = useRef(false);
  
  // Add state to track stylist holidays
  const [stylistHolidays, setStylistHolidays] = useState<Record<string, StylistHoliday[]>>({});

  // Update stylistHolidays when holidays prop changes
  useEffect(() => {
    if (holidays && stylists?.length) {
      const holidaysMap: Record<string, StylistHoliday[]> = {};
      stylists.forEach(stylist => {
        holidaysMap[stylist.id] = holidays.filter(h => h.stylist_id === stylist.id);
      });
      setStylistHolidays(holidaysMap);
    }
  }, [holidays, stylists]);
  
  // Update the editFormData state type
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
    clientEntries: []
  });
  
  // State for drag and drop
  const [draggedAppointment, setDraggedAppointment] = useState<any | null>(null);
  
  // Add state for date picker popover
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<HTMLButtonElement | null>(null);
  const datePickerOpen = Boolean(datePickerAnchorEl);
  
  // Add state for service collections and search
  const [serviceCollections, setServiceCollections] = useState<any[]>([]);
  const [selectedServiceCollection, setSelectedServiceCollection] = useState<any>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [isLoadingCollectionServices, setIsLoadingCollectionServices] = useState(false);
  const [loadingStylists, setLoadingStylists] = useState(false);
  
  // Add state for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');
  
  const timeSlots = generateTimeSlots();
  const timeOptions = generateTimeOptions();
  
  // Enhanced scroll preservation with localStorage support
  const scheduleGridRef = useRef<HTMLDivElement>(null);
  const scrollElementId = `stylist-day-view-${format(currentDate, 'yyyy-MM-dd')}`;
  
  const {
    savePosition,
    restorePosition,
    loadFromStorage,
    createDebouncedSaver,
    withPreservation
  } = useScrollPreservation(scheduleGridRef, scrollElementId);
  
  // Create debounced scroll saver for continuous scroll events
  const debouncedScrollSaver = useMemo(() => {
    if (scheduleGridRef.current) {
      return createDebouncedSaver(300, true); // 300ms delay, persist to storage
    }
    return () => {};
  }, [createDebouncedSaver]);
  
  // Load scroll position from localStorage on component mount and date changes
  useEffect(() => {
    // Small delay to ensure the grid is rendered
    const timer = setTimeout(() => {
      loadFromStorage();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadFromStorage, currentDate]);
  
  // Enhanced scroll handler that saves position to localStorage
  const handleScrollWithPreservation = useCallback(() => {
    if (!isContextMenuOpen.current && !isScrollRestoringRef.current) {
      debouncedScrollSaver();
    }
  }, [debouncedScrollSaver]);
  
  // Enhanced handlers that preserve scroll position
  const handleDialogOpen = useCallback((dialogType: string) => {
    console.log(`Opening ${dialogType} dialog, saving scroll position`);
    savePosition(true); // Save to localStorage
  }, [savePosition]);
  
  const handleDialogClose = useCallback((dialogType: string) => {
    console.log(`Closing ${dialogType} dialog, restoring scroll position`);
    // Restore position after a small delay to allow dialog to close
    setTimeout(() => {
      restorePosition(true); // Immediate restoration
    }, 100);
  }, [restorePosition]);
  
  // Memoized handlers to prevent unnecessary re-renders
  const memoizedHandleCloseContextMenu = useCallback(() => {
    // Mark context menu as closed
    isContextMenuOpen.current = false;
    
    // Update state to close the context menu
    // This will trigger the useEffect hook that handles scroll restoration
    setContextMenuAppointment(null);
    setContextMenuPosition(null);
    
    // The scroll restoration is now handled by the useEffect hook
    // that listens to changes in contextMenuPosition.
  }, []);

  const memoizedHandleContextMenu = useCallback((event: React.MouseEvent, appointment: any) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Comment out the scroll position storing code as it's causing reset issues
    // const gridElement = gridRef.current;
    // if (gridElement) {
    //   scrollPositionRef.current = {
    //     top: gridElement.scrollTop,
    //     left: gridElement.scrollLeft
    //   };
    // }
    
    // Mark context menu as open
    isContextMenuOpen.current = true;
    
    // Set context menu state with viewport-relative coordinates for fixed positioning
    setContextMenuAppointment(appointment);
    setContextMenuPosition({ 
      mouseX: event.clientX, 
      mouseY: event.clientY 
    });
  }, []);

  const memoizedHandleCheckIn = useCallback(() => {
    if (contextMenuAppointment) {
      // Find all appointments for the same client on the same day
      const appointmentDate = format(new Date(contextMenuAppointment.start_time), 'yyyy-MM-dd');
      const currentDate_formatted = format(currentDate, 'yyyy-MM-dd');
      
      if (appointmentDate === currentDate_formatted) {
        const sameClientAppointments = appointments.filter(appointment => 
          appointment.client_id === contextMenuAppointment.client_id &&
          format(new Date(appointment.start_time), 'yyyy-MM-dd') === appointmentDate
        );

        if (sameClientAppointments.length > 1) {
          // Multiple appointments for the same client - show confirmation dialog
          setCheckInConfirmDialog({
            open: true,
            appointments: sameClientAppointments,
            singleAppointment: contextMenuAppointment
          });
        } else {
          // Single appointment - check in directly
          setCheckedInIds(prev => new Set(prev).add(contextMenuAppointment.id));
          // TODO: optionally call onUpdateAppointment to persist check-in status
        }
      } else {
        // Different date - check in single appointment
        setCheckedInIds(prev => new Set(prev).add(contextMenuAppointment.id));
        // TODO: optionally call onUpdateAppointment to persist check-in status
      }
    }
    memoizedHandleCloseContextMenu();
  }, [contextMenuAppointment, memoizedHandleCloseContextMenu, appointments, currentDate]);

  const memoizedHandleCheckOut = useCallback(() => {
    if (contextMenuAppointment) {
      // Find all appointments for the same client on the same day
      const appointmentDate = format(new Date(contextMenuAppointment.start_time), 'yyyy-MM-dd');
      const currentDate_formatted = format(currentDate, 'yyyy-MM-dd');
      
      if (appointmentDate === currentDate_formatted) {
        const sameClientAppointments = appointments.filter(appointment => 
          appointment.client_id === contextMenuAppointment.client_id &&
          format(new Date(appointment.start_time), 'yyyy-MM-dd') === appointmentDate
        );

        if (sameClientAppointments.length > 1) {
          // Multiple appointments for the same client - show confirmation dialog
          setCheckOutConfirmDialog({
            open: true,
            appointments: sameClientAppointments,
            singleAppointment: contextMenuAppointment
          });
        } else {
          // Single appointment - check out directly
          setCheckedInIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(contextMenuAppointment.id);
            return newSet;
          });
          // TODO: optionally call onUpdateAppointment to persist check-out status
        }
      } else {
        // Different date - check out single appointment
        setCheckedInIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(contextMenuAppointment.id);
          return newSet;
        });
        // TODO: optionally call onUpdateAppointment to persist check-out status
      }
    }
    memoizedHandleCloseContextMenu();
  }, [contextMenuAppointment, memoizedHandleCloseContextMenu, appointments, currentDate]);

  // Enhanced scroll handler that respects context menu state and scroll restoration
  const enhancedHandleScroll = useCallback(() => {
    const gridElement = scheduleGridRef.current;
    if (gridElement && !isContextMenuOpen.current && !isScrollRestoringRef.current) {
      // Only update stored scroll positions when not in context menu mode or restoring
      scrollPositionRef.current = {
        top: gridElement.scrollTop,
        left: gridElement.scrollLeft
      };
      // REDUCED: Only update these state variables if they've changed significantly to prevent excessive re-renders
      // setScrollTop(gridElement.scrollTop);
      // setScrollLeft(gridElement.scrollLeft);
      // setGridRect(gridElement.getBoundingClientRect());
    }
  }, []);

  // Update the original handleScroll to use enhanced version
  const handleScroll = enhancedHandleScroll;
  
  // Set up scroll listener
  useEffect(() => {
    const gridElement = scheduleGridRef.current;
    if (!gridElement) return;
    // Initialize positions
    handleScroll();
    // Listen for scroll
    gridElement.addEventListener('scroll', handleScroll);
    // Listen for resize to adjust bounds
    window.addEventListener('resize', handleScroll);
    return () => {
      gridElement.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);
  
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
  
  // Function to check if a stylist is on holiday for a specific date
  function isStylistOnHolidayForDate(stylist: Stylist, date: Date): boolean {
    // First check if stylist is manually set as unavailable
    if (stylist.available === false) {
      return true; 
    }
    
    // Then check holidays from stylistHolidays map
    if (stylist?.id && stylistHolidays[stylist.id]?.length > 0) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      return stylistHolidays[stylist.id].some(holiday => 
        holiday.holiday_date === formattedDate
      );
    }
    
    // Finally, check holidays directly on stylist object
    if (stylist?.holidays && stylist.holidays.length > 0) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      return stylist.holidays.some(holiday => {
        // Need to handle both possible formats
        if (typeof holiday === 'object') {
          return (
            (holiday.holiday_date && holiday.holiday_date === formattedDate) ||
            // Support legacy holiday format if it exists
            ((holiday as any).date && (holiday as any).date === formattedDate)
          );
        }
        return false;
      });
    }
    
    return false;
  }

  const handleSlotClick = (event: React.MouseEvent, stylistId: string, hour: number, minute: number) => {
    // Prevent default browser behavior and event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    // Comment out the scroll position storing code as it's causing reset issues
    // const gridElement = gridRef.current;
    // if (gridElement) {
    //   scrollPositionRef.current = {
    //     top: gridElement.scrollTop,
    //     left: gridElement.scrollLeft
    //   };
    //   console.log('Stored scroll position before slot click:', scrollPositionRef.current);
    // }
    
    // Find the stylist
    const stylist = stylists.find(s => s.id === stylistId);
    if (!stylist) {
      setSnackbarMessage('Stylist not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Check if the stylist is on holiday for the current date
    if (isStylistOnHolidayForDate(stylist, currentDate)) {
      setSnackbarMessage(`Cannot book appointment: ${stylist.name} is on holiday`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Check if this time slot is during a break
    if (isBreakTime(stylistId, hour, minute)) {
      setSnackbarMessage('Cannot book appointment during break time');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const slotTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hour,
      minute,
      0,
      0
    );
    
    // Check if there's already an appointment at this exact time slot
    const existingAppointment = appointments.find(appointment => {
      if (appointment.stylist_id !== stylistId) return false;
      
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);
      
      // Check if the slot time falls within an existing appointment
      return slotTime >= appointmentStart && slotTime < appointmentEnd;
    });
    
    if (existingAppointment) {
      setSnackbarMessage('Time slot is already booked');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    console.log('Slot clicked:', { stylistId, hour, minute, slotTime });
    onSelectTimeSlot(stylistId, slotTime);
    
    // Comment out scroll position restoration as it's causing reset issues
    // setTimeout(() => {
    //   if (gridElement && scrollPositionRef.current) {
    //     console.log('Restoring scroll position after slot click:', scrollPositionRef.current);
    //     gridElement.scrollTo({
    //       top: scrollPositionRef.current.top,
    //       left: scrollPositionRef.current.left,
    //       behavior: 'auto' // Use 'auto' for immediate restoration without animation
    //     });
    //   }
    // }, 100);
  };

  const handleAppointmentClick = (event: React.MouseEvent, appointment: any) => {
    // Prevent default browser behavior and event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    console.log("Internal StylistDayView handleAppointmentClick called", appointment); // Debug log
    
    // Use scroll preservation when opening appointment
    handleDialogOpen('appointment');
    
    // Ensure the prop function is called if it exists
    if (onAppointmentClick) {
      console.log("Calling onAppointmentClick prop..."); // Debug log
      onAppointmentClick(appointment);
    } else {
      console.warn("onAppointmentClick prop is missing in StylistDayView"); // Warning if prop not passed
    }
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
    // Use scroll preservation when closing dialog
    handleDialogClose('edit');
    
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
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // --- Break Conflict Validation ---
    // Format times for validation
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

    // Check for break conflicts with all assigned stylists
    for (const entry of editFormData.clientEntries) {
      if (entry.stylistList) {
        for (const stylist of entry.stylistList) {
          const hasBreakConflict = checkBreakConflict(stylist.id, start.toISOString(), end.toISOString());
          if (hasBreakConflict) {
            const stylistName = stylists.find(s => s.id === stylist.id)?.name || 'Unknown';
            setSnackbarMessage(`Cannot update appointment: Conflicts with break time for ${stylistName}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
          }
        }
      }
    }
    // --- End Break Conflict Validation ---
    
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
            stylistIds: entry.stylistList?.map(st => st.id) || [],
          };
        })
      );
      
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

        // Send WhatsApp notification for the update
        try {
          // Prepare notification data
          const notificationData = {
            clientName: primaryClient.full_name,
            clientPhone: primaryClient.phone || '',
            services: editFormData.clientEntries[0].services.map(s => s.name),
            stylists: editFormData.clientEntries[0].stylistList?.map(s => s.name) || [],
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            status: selectedAppointment.status,
            notes: editFormData.notes || ''
          };

          if (notificationData.clientPhone) {
            await sendAppointmentNotification('updated', notificationData);
            console.log('Appointment update notification sent successfully');
            toast.success('Appointment updated and notification sent');
          } else {
            console.warn('Could not send appointment update notification: Missing client phone number');
            toast.error('Appointment updated but notification could not be sent: Missing client contact information');
          }
        } catch (whatsappError) {
          console.error('Failed to send appointment update notification:', whatsappError);
          toast.error('Appointment updated but notification could not be sent. Please contact the client directly.');
        }
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
        // Get client details before deleting the appointment
        const clientDetails = selectedAppointment.clientDetails?.[0] || allClients.find(c => c.id === selectedAppointment.client_id);
        const stylistDetails = stylists.find(s => s.id === selectedAppointment.stylist_id);
        const serviceDetails = services.find(s => s.id === selectedAppointment.service_id);

        await onDeleteAppointment(selectedAppointment.id);

        // Send WhatsApp notification for the cancellation
        if (clientDetails?.phone) {
          try {
            const notificationData = {
              clientName: clientDetails.full_name,
              clientPhone: clientDetails.phone,
              services: [serviceDetails?.name || 'Unknown Service'],
              stylists: [stylistDetails?.name || 'Unknown Stylist'],
              startTime: selectedAppointment.start_time,
              endTime: selectedAppointment.end_time,
              status: 'cancelled',
              notes: selectedAppointment.notes || ''
            };

            await sendAppointmentNotification('cancelled', notificationData);
            console.log('Appointment cancellation notification sent successfully');
            toast.success('Appointment cancelled and notification sent');
          } catch (whatsappError) {
            console.error('Failed to send appointment cancellation notification:', whatsappError);
            toast.error('Appointment cancelled but notification could not be sent. Please contact the client directly.');
          }
        } else {
          console.warn('Could not send appointment cancellation notification: Missing client phone number');
          toast.error('Appointment cancelled but notification could not be sent: Missing client contact information');
        }

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
    // Explicitly create Date objects for clearer comparison
    const appointmentDate = new Date(appointment.start_time);
    console.log("Comparing appointment date:", {
      appointment_id: appointment.id,
      appointmentDate: appointmentDate.toISOString().split('T')[0],
      currentDate: currentDate.toISOString().split('T')[0],
      isSameDay: isSameDay(appointmentDate, currentDate),
      appClientName: appointment.clientDetails?.[0]?.full_name || 'Unknown'
    });
    
    // Use date-fns isSameDay to correctly compare dates regardless of time
    return isSameDay(appointmentDate, currentDate);
  });

  console.log("Filtered appointments:", todayAppointments.length, todayAppointments.map(a => ({ 
    id: a.id, 
    client: a.clientDetails?.[0]?.full_name || 'Unknown', 
    time: `${formatTime(a.start_time)} - ${formatTime(a.end_time)}` 
  })));
  
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
        0  // Zero milliseconds
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
      const totalMinutes = (hours * 60) + minutes;
      
      // Convert to pixels based on 15-minute slots and include header offset
      const positionExact = STYLIST_HEADER_HEIGHT + (totalMinutes / 15) * TIME_SLOT_HEIGHT;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Position for ${normalizedStartTime.toLocaleTimeString()}:`, {
          hours,
          minutes,
          totalMinutes,
          positionExact
        });
      }
      
      // Return exact position to the pixel for precise placement
      return positionExact;
    } catch (error) {
      console.error('Error calculating appointment position:', error, startTime);
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Duration calc for ${start.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}:`, {
          startTime: start.toLocaleTimeString(),
          endTime: endDate.toLocaleTimeString(),
          durationMinutes,
          heightExact
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

  // Handle navigation to POS with appointment data
  const handleCreateBill = () => {
    if (!selectedAppointment) return;
    
    // Get all services for this appointment
    const appointmentServices = selectedAppointment.services || [];
    const servicesForPOS = appointmentServices.map((service: { 
      id: string; 
      name: string; 
      price: number;
      hsn_code?: string;
      gst_percentage?: number;
      category?: string;
    }) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      type: 'service' as const,
      quantity: 1,
      hsn_code: service.hsn_code,
      gst_percentage: service.gst_percentage,
      category: service.category
    }));
    
    // If no services found, try to find from services array using service_id
    if (servicesForPOS.length === 0 && selectedAppointment.service_id) {
      const service = services.find(s => s.id === selectedAppointment.service_id);
      if (service) {
        servicesForPOS.push({
          id: service.id,
          name: service.name,
          price: service.price,
          type: 'service' as const,
          quantity: 1,
          hsn_code: service.hsn_code,
          gst_percentage: service.gst_percentage,
          category: service.category
        });
      }
    }
    
    // Navigate to POS with complete appointment data
    navigate('/pos', {
      state: {
        appointmentData: {
          id: selectedAppointment.id,
          clientName: selectedAppointment.clients?.full_name || '',
          stylistId: selectedAppointment.stylist_id,
          services: servicesForPOS,
          type: 'service_collection',
          appointmentTime: selectedAppointment.start_time,
          notes: selectedAppointment.notes || ''
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
      
      // Create a date object for the end of the slot (add 15 minutes for a 15-minute slot)
      const slotEndTime = new Date(currentDate);
      slotEndTime.setHours(hour, minute + 15, 0, 0);
      const slotEndTimeValue = slotEndTime.getTime();
      
      // Get only breaks for the current day to improve performance
      const todayBreaks = getStylistBreaks(stylistId);
      
      // Debug log for specific slots to track issues
      if (hour === 11 && minute === 0) {
        console.log('Checking break at 11:00:', {
          stylistId,
          hour,
          minute,
          slotTime: slotTime.toLocaleTimeString(),
          slotEndTime: slotEndTime.toLocaleTimeString(),
          breaks: todayBreaks.map((b: StylistBreak) => ({
            id: b.id,
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
    // Use scroll preservation when opening dialog
    handleDialogOpen('break');
    
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
    // Use scroll preservation when closing dialog
    handleDialogClose('break');
    
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

      // Remove local state updates since they will be handled by the parent component
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
      const stylistWithBreak = stylists.find(s => 
        s.breaks.some(b => b.id === breakId)
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
      
      console.log('Deleting break with id:', breakId, 'from stylist:', stylistWithBreak.id);
      
      if (onDeleteBreak) {
        // Call the prop function to update the database
        await onDeleteBreak(stylistWithBreak.id, breakId);
        
        // After successful server update, update the local state
        const updatedBreaks = stylistWithBreak.breaks.filter(b => b.id !== breakId);
        
        // Update both the stylists array and the selected stylist
        const updatedStylists = stylists.map(stylist => 
          stylist.id === stylistWithBreak.id 
            ? { ...stylist, breaks: updatedBreaks }
            : stylist
        );
        
        // Update local state
        setStylists(updatedStylists);
        if (selectedStylist && selectedStylist.id === stylistWithBreak.id) {
          setSelectedStylist({ ...selectedStylist, breaks: updatedBreaks });
        }

        // Update the parent component's state if callback exists
        if (onStylistsChange) {
          onStylistsChange(updatedStylists);
        }
        
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

  const handleEditBreakDialogOpen = (breakItem: Break) => {
    // Use scroll preservation when opening dialog
    handleDialogOpen('edit-break');
    
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
    // Use scroll preservation when closing dialog
    handleDialogClose('edit-break');
    
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

  // Debug log: Log all appointments on component mount/update
  useEffect(() => {
    console.log("Current appointments:", appointments.map(app => ({
      id: app.id,
      client: app.clientDetails?.[0]?.full_name || 'Unknown',
      start: new Date(app.start_time).toLocaleTimeString(),
      end: new Date(app.end_time).toLocaleTimeString(),
      start_raw: app.start_time,
      end_raw: app.end_time
    })));
    
    // Also log the selectedDate
    console.log("Selected date:", selectedDate, format(selectedDate, 'EEEE, MMMM d, yyyy'));
  }, [appointments, selectedDate]);

  // Keep currentDate in sync with selectedDate prop
  useEffect(() => {
    if (selectedDate && !isSameDay(selectedDate, currentDate)) {
      console.log("Updating currentDate from selectedDate prop:", {
        previousDate: currentDate.toISOString().split('T')[0],
        newDate: selectedDate.toISOString().split('T')[0]
      });
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);



  // Add date picker handlers
  const handleDatePickerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
      )
    }));
  };

  const handleClientPhoneChange = (entryId: string, phone: string) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? {
          ...entry,
          client: { ...entry.client, phone }
        } : entry
      )
    }));
  };

  const handleCollectionChange = (entryId: string, collection: any) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? {
          ...entry,
          selectedCollectionId: collection?.id || '',
          services: []
        } : entry
      )
    }));
  };

  const handleServicesChange = (entryId: string, services: any[]) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? { ...entry, services } : entry
      )
    }));
  };

  const handleStylistsChange = (entryId: string, stylists: { id: string; name: string }[]) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.map(entry =>
        entry.id === entryId ? { ...entry, stylistList: stylists } : entry
      )
    }));
  };

  const handleAddClientEntry = () => {
    const newEntry: ClientEntry = {
      id: `entry-${Date.now()}`,
      client: null,
      selectedCollectionId: '',
      services: [],
      stylistList: []
    };
    
    setEditFormData(prev => ({
      ...prev,
      clientEntries: [...prev.clientEntries, newEntry]
    }));
    
    // Focus on the service search field after a short delay to allow rendering
    setTimeout(() => {
      const serviceSearchField = document.getElementById(`service-search-${newEntry.id}`);
      if (serviceSearchField) {
        serviceSearchField.focus();
      }
    }, 100);
  };

  const handleRemoveClientEntry = (entryId: string) => {
    setEditFormData(prev => ({
      ...prev,
      clientEntries: prev.clientEntries.filter(entry => entry.id !== entryId)
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
      <TimeColumn className="time-column">
        {/* Time header */}
        <Box 
          sx={{ 
            height: STYLIST_HEADER_HEIGHT,
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.7)',
            position: 'sticky',
            top: 0,
            zIndex: 12
          }}
        >
          Time
        </Box>
        
        {/* Time slots */}
        {timeSlots.map((slot, index) => {
          const hour12 = slot.hour > 12 ? slot.hour - 12 : slot.hour === 0 ? 12 : slot.hour;
          const period = slot.hour >= 12 ? 'PM' : 'AM';
          const displayTime = slot.minute === 0 
            ? `${hour12}:00 ${period}`
            : `${hour12}:${slot.minute} ${period}`;
          
          return (
            <TimeSlot key={index} className="time-slot">
              <TimeLabel className="time-label">
                {displayTime}
              </TimeLabel>
            </TimeSlot>
          );
        })}
      </TimeColumn>
    );
  };

  // Update the renderAppointmentsForStylist function
  const renderAppointmentsForStylist = (stylistId: string) => {
    return todayAppointments
      .filter(appointment => appointment.stylist_id === stylistId)
      .map(appointment => {
        const isCheckedIn = checkedInIds.has(appointment.id);
        // Find the service details
        const serviceName = appointment.serviceDetails?.name || 
                           (services.find(s => s.id === appointment.service_id)?.name) || 
                           'Unknown Service';
        
        // Determine if the appointment is paid
        const isPaid = appointment.paid || false;
        
        // Determine appointment status
        const status = appointment.status || 'scheduled';
        
        // Format times properly
        const startTime = formatTime(appointment.start_time);
        const endTime = formatTime(appointment.end_time);
        
        // Compute background color, warm tan if checked in
        const bgColor = isCheckedIn
          ? '#D2B48C' // Warm Tan color that complements the default olive green
          : status === 'completed'
            ? theme.palette.grey[400]
            : isPaid
              ? theme.palette.success.light
              : theme.palette.primary.main;
        
        return (
          <MemoizedAppointmentCard
            key={appointment.id}
            appointment={appointment}
            isCheckedIn={isCheckedIn}
            bgColor={bgColor}
            duration={getAppointmentDuration(appointment.start_time, appointment.end_time)}
            isPaid={isPaid}
            status={status}
            onDragStart={(e: React.DragEvent) => handleDragStart(e, appointment)}
            onClick={(e: React.MouseEvent) => handleAppointmentClick(e, appointment)}
            onContextMenu={(e: React.MouseEvent) => memoizedHandleContextMenu(e, appointment)}
            style={{
              top: `${getAppointmentPosition(appointment.start_time)}px`,
              height: `${getAppointmentDuration(appointment.start_time, appointment.end_time)}px`,
              backgroundColor: bgColor, // Ensure the calculated bgColor is applied here
            }}
          >
            <Typography variant="subtitle2" className="appointment-client-name">
              {appointment.clientDetails?.[0]?.full_name
                || allClients.find(c => c.id === appointment.client_id)?.full_name
                || 'Unknown Client'}
            </Typography>
            <Typography variant="body2" className="appointment-service">
              {serviceName}
            </Typography>
            <Typography variant="caption" className="appointment-time">
              {`${startTime} - ${endTime}`}
            </Typography>
          </MemoizedAppointmentCard>
        );
      });
  };

  // Use the useServiceCollections hook to get service collections
  const { serviceCollections: fetchedServiceCollections, isLoading: isLoadingServiceCollections } = useServiceCollections();

  // Update service collections when fetched
  useEffect(() => {
    if (fetchedServiceCollections) {
      setServiceCollections(fetchedServiceCollections);
    }
  }, [fetchedServiceCollections]);

  // Auto-scroll to last booked appointment time
  useEffect(() => {
    // DISABLED: This was causing scroll reset issues when clicking on calendar
    // The auto-scroll was triggering unexpectedly and interfering with manual scrolling
    
    // const gridElement = gridRef.current;
    // 
    // // Only auto-scroll if we have a last booked appointment time and the grid is ready
    // if (gridElement && lastBookedAppointmentTime && !editDialogOpen && !contextMenuPosition) {
    //   try {
    //     // Calculate the scroll position for the last booked appointment
    //     const scrollToPosition = getAppointmentPosition(lastBookedAppointmentTime);
    //     
    //     // Add some buffer to show a bit before the appointment (about 2 time slots = 30 minutes)
    //     const bufferPosition = Math.max(0, scrollToPosition - (TIME_SLOT_HEIGHT * 2));
    //     
    //     // Store this as our target position
    //     scrollPositionRef.current = {
    //       top: bufferPosition,
    //       left: 0
    //     };
    //     
    //     // Scroll to the calculated position with smooth behavior
    //     setTimeout(() => {
    //       gridElement.scrollTo({
    //         top: bufferPosition,
    //         left: 0,
    //         behavior: 'smooth'
    //       });
    //     }, 100); // Small delay to ensure the grid is fully rendered
    //     
    //     console.log(`Auto-scrolling to last booked appointment at ${lastBookedAppointmentTime}, position: ${scrollToPosition}px`);
    //   } catch (error) {
    //     console.error('Error auto-scrolling to last booked appointment:', error);
    //   }
    // }
  }, [lastBookedAppointmentTime, editDialogOpen, contextMenuPosition]);

  // Add a function to handle service search and selection
  const handleServiceSearch = (event: React.ChangeEvent<HTMLInputElement>, entryId: string) => {
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
    if (matchingServices.length === 1 && 
        matchingServices[0].name.toLowerCase() === searchQuery.toLowerCase()) {
      // Find the collection this service belongs to
      const collection = serviceCollections.find(c => c.id === matchingServices[0].collection_id);
      
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
    const serviceSearchField = document.getElementById(`service-search-${entryId}`);
    if (serviceSearchField) {
      (serviceSearchField as HTMLInputElement).focus();
      // Clear any previous search
      (serviceSearchField as HTMLInputElement).value = '';
    }
    
    // Show a message to guide the user
    setSnackbarMessage('Please search and select a service');
    setSnackbarOpen(true);
  };

  // Add a wrapper component to handle horizontal scrolling separately
  const GridWrapper = styled(Box)(({ theme }) => ({
  display: 'flex', // Make wrapper a flex container
  flexDirection: 'column',
  flex: 1,         // Take remaining vertical space
  overflowX: 'auto',  // enable horizontal scroll within calendar wrapper for TimeColumn stickiness
  overflowY: 'visible', // Allow vertical scroll for ScheduleGrid
  width: '100%',
  position: 'relative', // Create stacking context
  border: 'none',
  borderTop: 'none',
  boxShadow: 'none',
  // Removed the ::before pseudo-element that might be causing the border issue
  // Removed CSS containment so sticky headers can anchor correctly
}));

  // Context menu handlers for check-in
  const handleContextMenu = (event: React.MouseEvent, appointment: any) => {
    memoizedHandleContextMenu(event, appointment);
  };
  
  const handleCloseContextMenu = memoizedHandleCloseContextMenu;
  
  const handleCheckIn = memoizedHandleCheckIn;
  
  const handleCheckOut = memoizedHandleCheckOut;

  // Count stylists on holiday today
  const stylistsOnHolidayToday = stylists?.filter(stylist => {
    // Check if stylist is on holiday today
    const today = format(new Date(), 'yyyy-MM-dd');
    return stylistHolidays[stylist.id]?.some(h => h.holiday_date === today) || false;
  }) || [];

  // Add function to check if a stylist is on holiday on a specific date
  const getStylistHolidayForDate = (stylist: Stylist, date: Date): StylistHoliday | undefined => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return stylistHolidays[stylist.id]?.find(holiday => 
      holiday.holiday_date === formattedDate
    );
  }

  // Add at the beginning of the component, with the other state declarations
  const somethingThatChanges = null; // This ensures a constant value to prevent remounting

  // Confirmation dialog handlers for check-in/check-out
  const handleConfirmCheckInAll = useCallback(() => {
    if (checkInConfirmDialog.appointments.length > 0) {
      const appointmentIds = checkInConfirmDialog.appointments.map(app => app.id);
      setCheckedInIds(prev => {
        const newSet = new Set(prev);
        appointmentIds.forEach(id => newSet.add(id));
        return newSet;
      });
      // TODO: optionally call onUpdateAppointment for each appointment to persist check-in status
    }
    setCheckInConfirmDialog({ open: false, appointments: [], singleAppointment: null });
  }, [checkInConfirmDialog.appointments]);

  const handleConfirmCheckInSingle = useCallback(() => {
    if (checkInConfirmDialog.singleAppointment) {
      setCheckedInIds(prev => new Set(prev).add(checkInConfirmDialog.singleAppointment.id));
      // TODO: optionally call onUpdateAppointment to persist check-in status
    }
    setCheckInConfirmDialog({ open: false, appointments: [], singleAppointment: null });
  }, [checkInConfirmDialog.singleAppointment]);

  const handleConfirmCheckOutAll = useCallback(() => {
    if (checkOutConfirmDialog.appointments.length > 0) {
      const appointmentIds = checkOutConfirmDialog.appointments.map(app => app.id);
      setCheckedInIds(prev => {
        const newSet = new Set(prev);
        appointmentIds.forEach(id => newSet.delete(id));
        return newSet;
      });
      // TODO: optionally call onUpdateAppointment for each appointment to persist check-out status
    }
    setCheckOutConfirmDialog({ open: false, appointments: [], singleAppointment: null });
  }, [checkOutConfirmDialog.appointments]);

  const handleConfirmCheckOutSingle = useCallback(() => {
    if (checkOutConfirmDialog.singleAppointment) {
      setCheckedInIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(checkOutConfirmDialog.singleAppointment.id);
        return newSet;
      });
      // TODO: optionally call onUpdateAppointment to persist check-out status
    }
    setCheckOutConfirmDialog({ open: false, appointments: [], singleAppointment: null });
  }, [checkOutConfirmDialog.singleAppointment]);

  const handleCancelCheckInDialog = useCallback(() => {
    setCheckInConfirmDialog({ open: false, appointments: [], singleAppointment: null });
  }, []);

  const handleCancelCheckOutDialog = useCallback(() => {
    setCheckOutConfirmDialog({ open: false, appointments: [], singleAppointment: null });
  }, []);

  return (
    <DayViewContainer>
      <DayViewHeader sx={{ 
        borderBottom: 'none', 
        mb: 0, 
        pb: 2 
      }}>
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
      
      <Box sx={{ 
        height: '1px', 
        width: '100%', 
        bgcolor: 'transparent',
        position: 'relative',
        zIndex: 15,
        pointerEvents: 'none'
      }} />
      
      <GridWrapper sx={{ mt: 0 }}>
        <MemoizedScheduleGrid 
          className="schedule-grid" 
          scheduleGridRef={scheduleGridRef}
          onScroll={handleScrollWithPreservation}
          sx={{ borderTop: 'none', mt: 0 }}
        >
          {/* Use the renderTimeColumn function to create the time column */}
          {renderTimeColumn()}
          
          {stylists
            .slice() // Create a copy to avoid mutating the original array
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
            .map((stylist, index, allStylists) => (
            <StylistColumn
              key={stylist.id}
              className="stylist-column"
              sx={{
                // Check both general availability and if stylist is on holiday for current date
                opacity: (stylist.available !== false && !isStylistOnHolidayForDate(stylist, currentDate)) ? 1 : 0.5,
                pointerEvents: (stylist.available !== false && !isStylistOnHolidayForDate(stylist, currentDate)) ? 'auto' : 'none'
              }}
            >
              <StylistHeader
                className="stylist-header"
                // Only allow opening break dialog if stylist is available
                onClick={() => { if (stylist.available !== false) handleBreakDialogOpen(stylist.id) }}
                sx={{
                  // Adjust cursor and colors based on availability
                  cursor: stylist.available !== false ? 'pointer' : 'default',
                  backgroundColor: stylist.available !== false
                    ? theme.palette.salon.oliveLight
                    : theme.palette.action.disabledBackground,
                  color: stylist.available !== false
                    ? 'white'
                    : theme.palette.text.disabled,
                  '&:hover': stylist.available !== false
                    ? { backgroundColor: theme.palette.salon.oliveLight, opacity: 0.9 }
                    : {},
                  ...(index === allStylists.length - 1 && {
                    borderRight: 'none'
                  })
                }}
              >
                <Typography variant="subtitle2">
                  {stylist.name}
                </Typography>
              </StylistHeader>
              
              {timeSlots.map(slot => (
                <AppointmentSlot
                  key={`slot-${stylist.id}-${slot.hour}-${slot.minute}`}
                  onClick={(e: React.MouseEvent) => handleSlotClick(e, stylist.id, slot.hour, slot.minute)}
                  onDragOver={(e) => handleDragOver(e, stylist.id, slot.hour, slot.minute)}
                  onDrop={(e) => handleDrop(e, stylist.id, slot.hour, slot.minute)}
                  sx={{
                    ...(index === allStylists.length - 1 && {
                      borderRight: 'none'
                    }),
                    ...(isBreakTime(stylist.id, slot.hour, slot.minute) && { 
                      backgroundColor: 'rgba(220, 53, 69, 0.6)', // Solid red background
                      border: '1px solid rgba(220, 0, 0, 0.8)', // Solid red border
                      cursor: 'not-allowed',
                      '&:hover': {
                        backgroundColor: 'rgba(220, 53, 69, 0.7)' // Slightly darker on hover
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
                
                // Format times properly
                const startTimeFormatted = formatTime(breakStartTime);
                const endTimeFormatted = formatTime(breakEndTime);
                
                const top = getAppointmentPosition(breakItem.startTime);
                const height = getAppointmentDuration(breakItem.startTime, breakItem.endTime);

                return (
                  <Box
                    key={breakItem.id}
                    className="break-block"
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
                      boxShadow: 'none',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      '&:hover': {
                        boxShadow: 'none',
                        transform: 'none'
                      }
                    }}
                    onClick={() => handleEditBreakDialogOpen(breakItem)}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                      Break Time
                    </Typography>
                    
                    {breakItem.reason && (
                      <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                        {breakItem.reason}
                      </Typography>
                    )}
                    
                    <Typography 
                      variant="caption" 
                      className="break-time-text"
                    >
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
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={e => e.stopPropagation()} // Prevent opening edit dialog when clicking buttons
                    >
                      <IconButton 
                        size="small" 
                        sx={{ padding: 0.3, backgroundColor: 'rgba(255,255,255,0.8)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBreakDialogOpen(breakItem);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ padding: 0.3, backgroundColor: 'rgba(255,255,255,0.8)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBreak(breakItem.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </StylistColumn>
          ))}
        </MemoizedScheduleGrid>
      </GridWrapper>
      
      {/* Edit Appointment Drawer */}
      <Drawer anchor="right" variant="persistent" open={editDialogOpen} onClose={handleEditDialogClose}
              ModalProps={{ keepMounted: true }}
              PaperProps={{
                sx: {
                  width: 500,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.complex,
                    easing: theme.transitions.easing.easeInOut,
                  }),
                }
              }}>
        
        {/* Header with calendar icon */}
        <Box sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', position: 'relative' }}>
          <IconButton onClick={handleDatePickerClick} sx={{ position: 'absolute', left: 8 }}>
            <CalendarMonth sx={{ color: theme.palette.primary.main }} />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>Edit Appointment</Typography>
          <IconButton onClick={handleEditDialogClose} sx={{ position: 'absolute', right: 8 }}>
            <CloseIcon />
          </IconButton>
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
            <Button 
              onClick={handleDeleteAppointment} 
              color="error" 
              sx={{ 
                mr: 'auto',
                borderColor: '#d32f2f',
                '&:hover': {
                  borderColor: '#b71c1c',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)'
                }
              }}
              variant="outlined"
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
                bgcolor: '#566E1C'
              }
            }}
            variant="contained"
            startIcon={<Receipt />}
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
                backgroundColor: 'rgba(107, 142, 35, 0.04)'
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateAppointment} 
            variant="contained" 
            sx={{ 
              bgcolor: '#6B8E23',
              '&:hover': {
                bgcolor: '#566E1C'
              }
            }}
          >
            Update Appointment
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
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {/* Custom context menu to prevent scroll interference */}
      {contextMenuPosition && (
        <Box
          tabIndex={-1}
          sx={{
            position: 'fixed',
            top: contextMenuPosition.mouseY,
            left: contextMenuPosition.mouseX,
            zIndex: 9999,
            backgroundColor: 'white',
            boxShadow: 3,
            borderRadius: 1,
            minWidth: '120px',
            border: '1px solid',
            borderColor: 'divider'
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Box
            tabIndex={-1}
            onClick={contextMenuAppointment && checkedInIds.has(contextMenuAppointment.id) ? handleCheckOut : handleCheckIn}
            sx={{
              px: 2,
              py: 1.5,
              cursor: 'pointer',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            {contextMenuAppointment && checkedInIds.has(contextMenuAppointment.id) ? 'Check Out' : 'Check In'}
          </Box>
        </Box>
      )}
      
      {contextMenuPosition && (
        <Box
          tabIndex={-1}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9998,
            backgroundColor: 'transparent'
          }}
          onClick={handleCloseContextMenu}
          onContextMenu={handleCloseContextMenu}
        />
      )}

      {/* Check-in Confirmation Dialog */}
      <Dialog
        open={checkInConfirmDialog.open}
        onClose={handleCancelCheckInDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'primary.main' }}>
          Check In Appointments
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have multiple appointments for this client today. Would you like to:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Check in all {checkInConfirmDialog.appointments.length} appointments for {
                checkInConfirmDialog.singleAppointment && 
                allClients.find(c => c.id === checkInConfirmDialog.singleAppointment.client_id)?.full_name || 'this client'
              }
            </Typography>
            <Typography variant="body2">
              • Or check in only this specific appointment
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCheckInDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmCheckInSingle}
            variant="outlined"
            color="primary"
          >
            Check In This Only
          </Button>
          <Button
            onClick={handleConfirmCheckInAll}
            variant="contained"
            color="primary"
          >
            Check In All {checkInConfirmDialog.appointments.length}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Confirmation Dialog */}
      <Dialog
        open={checkOutConfirmDialog.open}
        onClose={handleCancelCheckOutDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'primary.main' }}>
          Check Out Appointments
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have multiple appointments for this client today. Would you like to:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Check out all {checkOutConfirmDialog.appointments.length} appointments for {
                checkOutConfirmDialog.singleAppointment && 
                allClients.find(c => c.id === checkOutConfirmDialog.singleAppointment.client_id)?.full_name || 'this client'
              }
            </Typography>
            <Typography variant="body2">
              • Or check out only this specific appointment
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCheckOutDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmCheckOutSingle}
            variant="outlined"
            color="primary"
          >
            Check Out This Only
          </Button>
          <Button
            onClick={handleConfirmCheckOutAll}
            variant="contained"
            color="primary"
          >
            Check Out All {checkOutConfirmDialog.appointments.length}
          </Button>
        </DialogActions>
      </Dialog>
    </DayViewContainer>
  );
}

export default StylistDayView; 