import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardActions,
  Avatar,
  FormControlLabel,
  Switch,
  IconButton,
  CircularProgress,
  Autocomplete,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  Alert
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCut,
  Palette,
  Spa,
  Face,
  Event as EventIcon,
  Add as AddIcon,
  HolidayVillage as HolidayIcon,
  EventBusy as EventBusyIcon,
  CalendarMonth
} from '@mui/icons-material'
import { useStylists, Stylist } from '../hooks/useStylists'
import { useStylistHolidays, StylistHoliday } from '../hooks/useStylistHolidays'
import { useServices } from '../hooks/useServices'
import { useServiceCollections } from '../hooks/useServiceCollections'
import { toast } from 'react-toastify'
import { format, isToday, isBefore, isAfter, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse, addMonths, subMonths, isWithinInterval } from 'date-fns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { v4 as uuidv4 } from 'uuid'
import { useQueryClient } from '@tanstack/react-query'
import { useOrders } from '../hooks/useOrders'
import { formatCurrency } from '../utils/format'
import DateRangePicker from '../components/dashboard/DateRangePicker'

// Default avatar image
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Stylist&background=6B8E23&color=fff&size=150'

type StylistFormData = Omit<Stylist, 'id'> & { id?: string }

interface HolidayReport {
  stylistId: string;
  stylistName: string;
  totalHolidays: number;
  upcomingHolidays: number;
  pastHolidays: number;
  holidays: StylistHoliday[];
  serviceRevenue: number;
}

const initialFormData: StylistFormData = {
  name: '',
  specialties: [],
  bio: '',
  gender: 'other',
  available: true,
  imageUrl: '',
  email: '',
  phone: '',
  breaks: [],
  holidays: [] // Initialize empty holidays array
}

export default function Stylists() {
  const { stylists, isLoading, createStylist, updateStylist, deleteStylist } = useStylists()
  const { 
    holidays: allHolidays, 
    isLoading: isLoadingHolidays,
    getStylistHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    isStylistOnHoliday
  } = useStylistHolidays()
  const { services } = useServices()
  const { serviceCollections, isLoading: isLoadingServiceCollections } = useServiceCollections()
  const { orders, isLoading: isLoadingOrders } = useOrders()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<StylistFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [holidayDate, setHolidayDate] = useState<Date | null>(new Date())
  const [holidayReason, setHolidayReason] = useState<string>('')
  const [holidayEndDate, setHolidayEndDate] = useState<Date | null>(new Date())
  const [holidayDialogOpen, setHolidayDialogOpen] = useState<boolean>(false)
  const [selectedStylistForHoliday, setSelectedStylistForHoliday] = useState<Stylist | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<StylistHoliday | null>(null)
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date.toISOString().split('T')[0];
  });
  const [holidayReports, setHolidayReports] = useState<HolidayReport[]>([])
  const [stylistHolidays, setStylistHolidays] = useState<Record<string, StylistHoliday[]>>({})

  const queryClient = useQueryClient()

  // Handle date range changes
  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate.toISOString().split('T')[0]);
    setEndDate(newEndDate.toISOString().split('T')[0]);
  };

  // Extract unique service names from service collections
  useEffect(() => {
    if (serviceCollections?.length) {
      // Extract all service names from service collections
      const allSpecialties = new Set<string>()
      
      // First try to get service names directly from the collections
      serviceCollections.forEach(collection => {
        allSpecialties.add(collection.name)
      })
      
      // If we have services data, add those names too
      if (services?.length) {
        services.forEach(service => {
          if (service.name) {
            allSpecialties.add(service.name)
          }
        })
      }
      
      // Convert set to sorted array
      setSpecialties(Array.from(allSpecialties).sort())
    }
  }, [serviceCollections, services])

  // Build stylistHolidays map from the fetched allHolidays list
  useEffect(() => {
    if (stylists?.length && allHolidays) {
      const holidaysMap: Record<string, StylistHoliday[]> = {};
      stylists.forEach(stylist => {
        holidaysMap[stylist.id] = allHolidays.filter(h => h.stylist_id === stylist.id);
      });
      setStylistHolidays(holidaysMap);
    }
  }, [stylists, allHolidays]);

  // Generate holiday reports whenever stylists or date range changes
  useEffect(() => {
    if (stylists?.length && allHolidays && orders) {
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      const today = new Date();

      const reports: HolidayReport[] = stylists.map(stylist => {
        const stylistHolidayList = stylistHolidays[stylist.id] || [];
        
        // Filter holidays for the selected date range
        const holidaysInRange = stylistHolidayList.filter(holiday => {
          const holidayDate = new Date(holiday.holiday_date);
          return isWithinInterval(holidayDate, { start: rangeStart, end: rangeEnd });
        });

        // Count upcoming and past holidays
        const upcomingHolidays = stylistHolidayList.filter(holiday => {
          const holidayDate = new Date(holiday.holiday_date);
          return isAfter(holidayDate, today) || isToday(holidayDate);
        }).length;

        const pastHolidays = stylistHolidayList.filter(holiday => {
          const holidayDate = new Date(holiday.holiday_date);
          return isBefore(holidayDate, today) && !isToday(holidayDate);
        }).length;
        
        // Calculate service revenue with proper multi-expert revenue splitting
        // Since POS now creates separate orders for each expert with split amounts, 
        // we can simply sum up the revenue from orders assigned to this stylist
        const stylistOrders = orders.filter(order => {
          const orderStylistId = (order as any).stylist?.id;
          const orderStylistName = (order as any).stylist_name || (order as any).stylist?.name;
          return orderStylistId ? orderStylistId === stylist.id : orderStylistName === stylist.name;
        });

        const serviceRevenue = stylistOrders.reduce((total, order) => {
          const orderDate = new Date((order as any).created_at || order.created_at);
          if (isWithinInterval(orderDate, { start: rangeStart, end: rangeEnd })) {
            if (order.status === 'completed' && (order as any).services && Array.isArray((order as any).services)) {
              const servicePriceInOrder = (order as any).services
                .filter((item: any) => !item.type || item.type === 'service')
                .reduce((sum: number, service: any) => sum + ((service.price || 0) * (service.quantity || 1)), 0);

              let revenueToAdd = servicePriceInOrder;
              
              // Add proportional tax if applicable
              if (servicePriceInOrder > 0 && (order as any).subtotal > 0 && (order as any).tax > 0) {
                const serviceTax = (servicePriceInOrder / (order as any).subtotal) * (order as any).tax;
                revenueToAdd += serviceTax;
              }
              
              console.log(`[Revenue Calculation] ${stylist.name}: Order ${order.id} contributes ${revenueToAdd} (Service: ${servicePriceInOrder}, Tax: ${servicePriceInOrder > 0 && (order as any).subtotal > 0 && (order as any).tax > 0 ? (servicePriceInOrder / (order as any).subtotal) * (order as any).tax : 0})`);
              
              return total + revenueToAdd;
            }
          }
          return total;
        }, 0);

        return {
          stylistId: stylist.id,
          stylistName: stylist.name,
          totalHolidays: holidaysInRange.length,
          upcomingHolidays,
          pastHolidays,
          holidays: holidaysInRange.sort((a: StylistHoliday, b: StylistHoliday) => 
            new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()
          ),
          serviceRevenue
        };
      });

      setHolidayReports(reports);
    }
  }, [stylists, startDate, endDate, stylistHolidays, allHolidays, orders]);

  const handleOpen = () => setOpen(true)
  
  const handleClose = () => {
    setOpen(false)
    setFormData(initialFormData)
    setEditingId(null)
  }

  const handleEdit = (stylist: Stylist) => {
    setFormData({
      name: stylist.name,
      specialties: stylist.specialties,
      bio: stylist.bio || '',
      gender: stylist.gender || 'other',
      available: stylist.available,
      imageUrl: stylist.imageUrl || '',
      email: stylist.email || '',
      phone: stylist.phone || '',
      breaks: stylist.breaks || [],
      holidays: stylist.holidays || []
    })
    setEditingId(stylist.id)
    setOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Stylist name is required')
      return
    }

    if (editingId) {
      updateStylist({ ...formData, id: editingId })
    } else {
      createStylist(formData)
    }
    
    handleClose()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stylist?')) {
      deleteStylist(id)
    }
  }

  const openHolidayDialog = (stylist: Stylist, existingHoliday?: any) => {
    setSelectedStylistForHoliday(stylist)
    
    if (existingHoliday) {
      // Edit mode
      setEditingHoliday(existingHoliday)
      setHolidayDate(new Date(existingHoliday.holiday_date))
      setHolidayEndDate(new Date(existingHoliday.holiday_date))
      setHolidayReason(existingHoliday.reason || '')
    } else {
      // Add mode
      setEditingHoliday(null)
      setHolidayDate(new Date())
      setHolidayEndDate(new Date())
      setHolidayReason('')
    }
    
    setHolidayDialogOpen(true)
  }

  const closeHolidayDialog = () => {
    setHolidayDialogOpen(false)
    setSelectedStylistForHoliday(null)
    setEditingHoliday(null)
  }

  const addOrUpdateHoliday = async () => {
    if (!selectedStylistForHoliday || !holidayDate) {
      toast.error('Please select a stylist and a start date')
      return
    }
    try {
      if (editingHoliday) {
        // Update existing holiday
        await updateHoliday.mutateAsync({
          holidayId: editingHoliday.id,
          holidayDate: format(holidayDate, 'yyyy-MM-dd'),
          reason: holidayReason
        })
        toast.success(`Holiday updated for ${selectedStylistForHoliday.name}`)
      } else {
        // Add new holiday(s) for the selected range
        if (!holidayEndDate) {
          toast.error('Please select an end date')
          return
        }
        if (holidayEndDate < holidayDate) {
          toast.error('End date cannot be before start date')
          return
        }
        const datesInRange = eachDayOfInterval({ start: holidayDate, end: holidayEndDate })
        for (const date of datesInRange) {
          await addHoliday.mutateAsync({
            stylistId: selectedStylistForHoliday.id,
            holidayDate: format(date, 'yyyy-MM-dd'),
            reason: holidayReason
          })
        }
        toast.success(`Holidays added for ${selectedStylistForHoliday.name}`)
      }
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] })
      queryClient.invalidateQueries({ queryKey: ['stylists'] })
      closeHolidayDialog()
    } catch (error) {
      console.error('Error managing holiday:', error)
      toast.error('Error saving holiday')
    }
  }

  const removeHoliday = async (stylist: Stylist, holidayId: string) => {
    if (!window.confirm(`Are you sure you want to remove this holiday for ${stylist.name}?`)) {
      return;
    }

    try {
      await deleteHoliday.mutateAsync(holidayId);
      toast.success(`Holiday removed for ${stylist.name}`);
      // Refresh queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] });
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      // Update local state to remove the holiday immediately
      setStylistHolidays(prev => ({
        ...prev,
        [stylist.id]: prev[stylist.id]?.filter(h => h.id !== holidayId) || []
      }));
    } catch (error) {
      console.error('Error removing holiday:', error);
      toast.error('Error removing holiday');
    }
  }

  // Handler to delete holiday from within the Edit Holiday dialog
  const handleDialogDelete = async () => {
    if (!selectedStylistForHoliday || !editingHoliday) return
    if (!window.confirm(`Are you sure you want to remove this holiday for ${selectedStylistForHoliday.name}?`)) return
    try {
      await deleteHoliday.mutateAsync(editingHoliday.id)
      toast.success(`Holiday removed for ${selectedStylistForHoliday.name}`)
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] })
      queryClient.invalidateQueries({ queryKey: ['stylists'] })
      closeHolidayDialog()
    } catch (error) {
      console.error('Error removing holiday:', error)
      toast.error('Error removing holiday')
    }
  }

  const checkStylistOnHolidayToday = async (stylist: Stylist): Promise<boolean> => {
    return isStylistOnHoliday(stylist.id);
  }

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'haircut':
        return <ContentCut fontSize="small" />
      case 'color':
        return <Palette fontSize="small" />
      default:
        return <Spa fontSize="small" />
    }
  }

  // Helper to get the day name for a date
  const getDayName = (date: Date): string => {
    return format(date, 'EEE');
  }

  // Add function to check if a stylist is on holiday on a specific date
  const getStylistHolidayForDate = (stylist: Stylist, date: Date): StylistHoliday | undefined => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return stylistHolidays[stylist.id]?.find(holiday => 
      holiday.holiday_date === formattedDate
    );
  }

  // Count stylists on holiday today
  const stylistsOnHolidayToday = stylists?.filter(stylist => {
    // Since this is an async function now, we need to ensure it's handled properly
    // We'll use the synchronous check based on the stylistHolidays map
    const today = format(new Date(), 'yyyy-MM-dd');
    return stylistHolidays[stylist.id]?.some(h => h.holiday_date === today) || false;
  }) || [];

  if (isLoading || isLoadingServiceCollections || isLoadingHolidays || isLoadingOrders) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'stretch'
    }}>
      {/* Add notification for stylists on holiday today */}
      {stylistsOnHolidayToday.length > 0 && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body1">
              {stylistsOnHolidayToday.length === 1 
                ? `${stylistsOnHolidayToday[0].name} is on holiday today.` 
                : `${stylistsOnHolidayToday.length} stylists are on holiday today: ${stylistsOnHolidayToday.map(s => s.name).join(', ')}`
              }
            </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        width: '100%'
      }}>
        <Typography variant="h1">
          Stylists
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PersonAddIcon />} 
            onClick={handleOpen}
          >
            Add Stylist
          </Button>
        </Box>
      </Box>

      {/* HOLIDAY REPORT VIEW - updated */}
      {stylists?.length ? (
        <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <DateRangePicker
              startDate={new Date(startDate)}
              endDate={new Date(endDate)}
              onDateRangeChange={handleDateRangeChange}
            />
          </Box>

          {/* Summary section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>


            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(107, 142, 35, 0.15)', 
                  color: '#6B8E23',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="h6">
                    {holidayReports.reduce((sum, report) => sum + report.totalHolidays, 0)}
                  </Typography>
                  <Typography variant="body2">
                    Total Holidays
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(107, 142, 35, 0.4)', 
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6">
                    {stylistsOnHolidayToday.length}
                  </Typography>
                  <Typography variant="body2">
                    Stylists on Holiday Today
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: '#6B8E23', 
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
                }}>
                  <Typography variant="h6">
                    {stylists.length - stylistsOnHolidayToday.length}
                  </Typography>
                  <Typography variant="body2">
                    Stylists Available Today
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stylist</TableCell>
                  <TableCell>Total Holidays</TableCell>
                  <TableCell>Holiday Dates</TableCell>
                  <TableCell>Service Revenue</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidayReports
                  .sort((a, b) => a.stylistName.localeCompare(b.stylistName))
                  .map((report) => {
                    const stylist = stylists.find(s => s.id === report.stylistId);
                    if (!stylist) return null;
                    
                    // Synchronously check if stylist is on holiday today
                    const todayDate = format(new Date(), 'yyyy-MM-dd');
                    const todayHoliday = getStylistHolidayForDate(stylist, new Date());
                    const isOnHolidayToday = !!todayHoliday;
                    
                    return (
                                              <TableRow 
                        key={report.stylistId}
                        sx={{ 
                          bgcolor: isOnHolidayToday ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={stylist.imageUrl || DEFAULT_AVATAR} 
                              sx={{ width: 40, height: 40 }}
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                {report.stylistName}
                              </Typography>
                              <Typography variant="caption" color={isOnHolidayToday ? 'success.main' : 'text.secondary'}>
                                {isOnHolidayToday ? 'On Holiday Today' : stylist.available ? 'Available' : 'Not Available'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {report.totalHolidays > 0 ? (
                            <Chip 
                              label={`${report.totalHolidays} holiday(s)`} 
                              color="success" 
                              size="small" 
                            />
                          ) : 'No holidays this month'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            {report.holidays.map(holiday => {
                              const holidayDate = new Date(holiday.holiday_date);
                              const isToday = isSameDay(holidayDate, new Date());
                              const isPast = isBefore(holidayDate, new Date()) && !isToday;
                              
                              return (
                                <Box key={holiday.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Tooltip title={holiday.reason || 'No reason provided'}>
                                    <Chip
                                      icon={<EventBusyIcon />}
                                      label={format(holidayDate, 'MMM dd (EEE)')}
                                      size="small"
                                      color="success"
                                      variant={isPast ? 'outlined' : 'filled'}
                                      sx={{ 
                                        textDecoration: isPast ? 'line-through' : 'none',
                                        opacity: isPast ? 0.7 : 1
                                      }}
                                    />
                                  </Tooltip>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => stylist && removeHoliday(stylist, holiday.id)}
                                    sx={{ 
                                      width: 24, 
                                      height: 24,
                                      ml: 0.5
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              );
                            })}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="primary">
                            {formatCurrency(report.serviceRevenue)}
                          </Typography>
                          {/* Show indicator if this stylist has any multi-expert orders in the current date range */}
                          {orders && orders.some(order => {
                            const orderDate = new Date((order as any).created_at || order.created_at);
                            const isInRange = isWithinInterval(orderDate, { start: new Date(startDate), end: new Date(endDate) });
                            const orderStylistId = (order as any).stylist?.id;
                            const orderStylistName = (order as any).stylist_name || (order as any).stylist?.name;
                            const isStylistOrder = orderStylistId ? orderStylistId === stylist.id : orderStylistName === stylist.name;
                            
                            // Check if this order is part of a multi-expert appointment
                            if (isInRange && isStylistOrder && (order as any).appointment_id) {
                              const relatedOrders = orders.filter(relOrder => 
                                (relOrder as any).appointment_id === (order as any).appointment_id && 
                                relOrder.status === 'completed' &&
                                relOrder.id !== order.id // Exclude the current order
                              );
                              return relatedOrders.length > 0; // If there are other orders with same appointment_id
                            }
                            return false;
                          }) && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                              * Revenue shared with other experts
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Add Holiday">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openHolidayDialog(stylist)}
                                sx={{ 
                                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.2)' }
                                }}
                              >
                                <HolidayIcon />
                              </IconButton>
                            </Tooltip>
                            {report.totalHolidays > 0 && (
                              <Tooltip title="Edit Holidays">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    // edit the first holiday in the list
                                    const firstHoliday = report.holidays[0];
                                    openHolidayDialog(stylist, firstHoliday);
                                  }}
                                  sx={{ 
                                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No stylists found. Add your first stylist to get started.
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Stylist Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Edit Stylist' : 'Add New Stylist'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender || 'other'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={specialties}
                  value={formData.specialties}
                  onChange={(_, newValue) => setFormData({ ...formData, specialties: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Specialties"
                      placeholder="Select specialties"
                      helperText="Select the services this stylist can perform"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        size="small"
                        icon={getSpecialtyIcon(option)}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  helperText="A short description of the stylist's experience and expertise"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Profile Image URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  fullWidth
                  helperText="Enter a URL for the stylist's profile image"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Available for appointments"
                />
              </Grid>

              {/* Holidays section in the edit dialog (optional) */}
              {editingId && formData.holidays && formData.holidays.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Holidays
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Day</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.holidays
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((holiday) => (
                                                          <TableRow 
                              key={holiday.id}
                              sx={{
                                bgcolor: isToday(new Date(holiday.date)) ? 'rgba(76, 175, 80, 0.1)' : 'inherit'
                              }}
                            >
                              <TableCell>{format(new Date(holiday.date), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>{format(new Date(holiday.date), 'EEEE')}</TableCell>
                              <TableCell>{holiday.reason || 'N/A'}</TableCell>
                              <TableCell align="right">
                                <Box>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      if (editingId) {
                                        // Create temporary stylist object to pass to the edit function
                                        const tempStylist: Stylist = {
                                          id: editingId,
                                          name: formData.name,
                                          specialties: formData.specialties,
                                          holidays: formData.holidays,
                                          gender: formData.gender as 'male' | 'female' | 'other',
                                          available: formData.available,
                                          breaks: formData.breaks
                                        };
                                        openHolidayDialog(tempStylist, holiday as any);
                                      }
                                    }}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        holidays: formData.holidays?.filter(h => h.id !== holiday.id) || []
                                      })
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add/Edit Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onClose={closeHolidayDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHoliday 
            ? `Edit Holiday for ${selectedStylistForHoliday?.name}` 
            : `Add Holiday for ${selectedStylistForHoliday?.name}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Note: The stylist will be automatically marked as unavailable on holiday dates.
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {!editingHoliday ? (
                <>
                  <DatePicker
                    label="Start Date"
                    value={holidayDate}
                    onChange={(newDate) => setHolidayDate(newDate)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal', variant: 'outlined' } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={holidayEndDate}
                    minDate={holidayDate}
                    onChange={(newDate) => setHolidayEndDate(newDate)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal', variant: 'outlined' } }}
                  />
                </>
              ) : (
                <DatePicker
                  label="Holiday Date"
                  value={holidayDate}
                  onChange={(newDate) => setHolidayDate(newDate)}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal', variant: 'outlined' } }}
                />
              )}
            </LocalizationProvider>

            <TextField
              label="Reason (Optional)"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Vacation, Personal, etc."
            />

            {/* Existing Holidays List */}
            {selectedStylistForHoliday && stylistHolidays[selectedStylistForHoliday.id]?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Existing Holidays
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stylistHolidays[selectedStylistForHoliday.id].map((holiday) => {
                    const hDate = new Date(holiday.holiday_date);
                    const isTodayChip = isSameDay(hDate, new Date());
                    const isPastChip = isBefore(hDate, new Date()) && !isTodayChip;
                    return (
                      <Box key={holiday.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, m: 0.5 }}>
                        <Tooltip title={holiday.reason || 'No reason provided'}>
                          <Chip
                            clickable
                            onClick={() => openHolidayDialog(selectedStylistForHoliday, holiday)}
                            icon={<EventBusyIcon />}
                            label={format(hDate, 'MMM dd (EEE)')}
                            size="small"
                            color="success"
                            variant={isPastChip ? 'outlined' : 'filled'}
                            sx={{ 
                              cursor: 'pointer', 
                              textDecoration: isPastChip ? 'line-through' : 'none', 
                              opacity: isPastChip ? 0.7 : 1 
                            }}
                          />
                        </Tooltip>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeHoliday(selectedStylistForHoliday, holiday.id)}
                          sx={{ width: 20, height: 20 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHolidayDialog}>Cancel</Button>
          {editingHoliday && (
            <Button onClick={handleDialogDelete} variant="outlined" color="error">
              Delete Holiday
            </Button>
          )}
          <Button 
            onClick={addOrUpdateHoliday} 
            variant="contained" 
            color="primary"
          >
            {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 