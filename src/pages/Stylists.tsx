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
  Tab,
  Tabs,
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
  CalendarMonth,
  CalendarViewMonth
} from '@mui/icons-material'
import { useStylists, Stylist } from '../hooks/useStylists'
import { useStylistHolidays, StylistHoliday } from '../hooks/useStylistHolidays'
import { useServices } from '../hooks/useServices'
import { useServiceCollections } from '../hooks/useServiceCollections'
import { toast } from 'react-toastify'
import { format, isToday, isBefore, isAfter, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parse, addMonths, subMonths } from 'date-fns'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { v4 as uuidv4 } from 'uuid'
import { useQueryClient } from '@tanstack/react-query'

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
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<StylistFormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [holidayDate, setHolidayDate] = useState<Date | null>(new Date())
  const [holidayReason, setHolidayReason] = useState<string>('')
  const [holidayDialogOpen, setHolidayDialogOpen] = useState<boolean>(false)
  const [selectedStylistForHoliday, setSelectedStylistForHoliday] = useState<Stylist | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<StylistHoliday | null>(null)
  const [viewType, setViewType] = useState<'grid' | 'calendar' | 'report'>('grid')
  const [reportMonth, setReportMonth] = useState<Date>(new Date())
  const [holidayReports, setHolidayReports] = useState<HolidayReport[]>([])
  const [stylistHolidays, setStylistHolidays] = useState<Record<string, StylistHoliday[]>>({})

  const queryClient = useQueryClient()

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

  // Load holidays for all stylists
  useEffect(() => {
    if (stylists?.length) {
      const loadHolidays = async () => {
        const holidaysMap: Record<string, StylistHoliday[]> = {};
        
        for (const stylist of stylists) {
          const stylistHolidays = await getStylistHolidays(stylist.id);
          holidaysMap[stylist.id] = stylistHolidays;
        }
        
        setStylistHolidays(holidaysMap);
      };
      
      loadHolidays();
    }
  }, [stylists, getStylistHolidays, allHolidays]);

  // Generate holiday reports whenever stylists or reportMonth changes
  useEffect(() => {
    if (stylists?.length) {
      const monthStart = startOfMonth(reportMonth);
      const monthEnd = endOfMonth(reportMonth);
      const today = new Date();

      const reports: HolidayReport[] = stylists.map(stylist => {
        const stylistHolidayList = stylistHolidays[stylist.id] || [];
        
        // Filter holidays for the selected month
        const holidaysInMonth = stylistHolidayList.filter(holiday => {
          const holidayDate = new Date(holiday.holiday_date);
          return isAfter(holidayDate, monthStart) && isBefore(holidayDate, monthEnd);
        });

        // Count upcoming and past holidays
        const upcomingHolidays = stylistHolidayList.filter(holiday => {
          const holidayDate = new Date(holiday.holiday_date);
          return isAfter(holidayDate, today) || isToday(holidayDate);
        }).length;

        const pastHolidays = stylistHolidayList.filter(holiday => {
          const holidayDate = new Date(holiday.holiday_date);
          return isBefore(holidayDate, today);
        }).length;

        return {
          stylistId: stylist.id,
          stylistName: stylist.name,
          totalHolidays: holidaysInMonth.length,
          upcomingHolidays,
          pastHolidays,
          holidays: holidaysInMonth.sort((a, b) => 
            new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()
          )
        };
      });

      setHolidayReports(reports);
    }
  }, [stylists, reportMonth, stylistHolidays]);

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

  const openHolidayDialog = (stylist: Stylist, existingHoliday?: StylistHoliday) => {
    setSelectedStylistForHoliday(stylist)
    
    if (existingHoliday) {
      // Edit mode
      setEditingHoliday(existingHoliday)
      setHolidayDate(new Date(existingHoliday.holiday_date))
      setHolidayReason(existingHoliday.reason || '')
    } else {
      // Add mode
      setEditingHoliday(null)
      setHolidayDate(new Date())
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
      toast.error('Please select a stylist and date')
      return
    }

    // Format date consistently
    const formattedDate = format(holidayDate, 'yyyy-MM-dd');

    try {
      if (editingHoliday) {
        // Update existing holiday
        await updateHoliday({
          holidayId: editingHoliday.id,
          holidayDate: formattedDate,
          reason: holidayReason
        });
        toast.success(`Holiday updated for ${selectedStylistForHoliday.name}`);
      } else {
        // Add new holiday
        await addHoliday({
          stylistId: selectedStylistForHoliday.id,
          holidayDate: formattedDate,
          reason: holidayReason
        });
        toast.success(`Holiday added for ${selectedStylistForHoliday.name}`);
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['stylist_holidays'] });
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      
      closeHolidayDialog();
    } catch (error) {
      console.error('Error managing holiday:', error);
      toast.error('Error saving holiday');
    }
  }

  const removeHoliday = async (stylist: Stylist, holidayId: string) => {
    if (!window.confirm(`Are you sure you want to remove this holiday for ${stylist.name}?`)) {
      return;
    }

    try {
      await deleteHoliday(holidayId);
      toast.success(`Holiday removed for ${stylist.name}`);
    } catch (error) {
      console.error('Error removing holiday:', error);
      toast.error('Error removing holiday');
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

  // Helper to handle previous/next month navigation
  const handlePrevMonth = () => {
    setReportMonth(subMonths(reportMonth, 1));
  }

  const handleNextMonth = () => {
    setReportMonth(addMonths(reportMonth, 1));
  }

  const getHolidayStatus = (stylist: Stylist): { isOnHoliday: boolean; holidayInfo?: StylistHoliday } => {
    if (!stylist.holidays || stylist.holidays.length === 0) {
      return { isOnHoliday: false };
    }
    
    const today = new Date();
    const holidayToday = stylist.holidays.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(holidayDate, today);
    });
    
    return { 
      isOnHoliday: !!holidayToday,
      holidayInfo: holidayToday
    };
  };

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

  if (isLoading || isLoadingServiceCollections || isLoadingHolidays) {
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
          severity="warning" 
          sx={{ mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body1">
              {stylistsOnHolidayToday.length === 1 
                ? `${stylistsOnHolidayToday[0].name} is on holiday today.` 
                : `${stylistsOnHolidayToday.length} stylists are on holiday today: ${stylistsOnHolidayToday.map(s => s.name).join(', ')}`
              }
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              color="warning"
              onClick={() => setViewType('report')}
            >
              View Holiday Report
            </Button>
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
          <Tabs 
            value={viewType} 
            onChange={(_, newValue) => setViewType(newValue)}
            sx={{ 
              mr: 2,
              '& .MuiTab-root': {
                minWidth: 'unset',
                p: '6px 16px'
              }
            }}
          >
            <Tab value="grid" icon={<Grid item />} label="Grid" />
            <Tab value="report" icon={<CalendarViewMonth />} label="Holiday Report" />
          </Tabs>
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

      {/* GRID VIEW */}
      {viewType === 'grid' && stylists?.length ? (
        <Grid container spacing={3} sx={{ 
          width: '100%', 
          m: 0, 
          boxSizing: 'border-box',
          justifyContent: 'flex-start' 
        }}>
          {stylists.map((stylist) => {
            // Check if stylist is on holiday today
            const stylistHolidaysList = stylistHolidays[stylist.id] || [];
            const today = format(new Date(), 'yyyy-MM-dd');
            const holidayToday = stylistHolidaysList.find(
              h => h.holiday_date === today
            );
            const isOnHolidayToday = !!holidayToday;
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={stylist.id} sx={{ 
                p: 2, 
                boxSizing: 'border-box',
                '& > *': { width: '100%', height: '100%' }
              }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  ...(isOnHolidayToday && {
                    borderColor: 'warning.main',
                    borderWidth: 2,
                    borderStyle: 'solid'
                  })
                }}>
                  {isOnHolidayToday && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: 'warning.main',
                      color: 'warning.contrastText',
                      px: 2,
                      py: 0.5,
                      borderBottomLeftRadius: 8,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}>
                      ON HOLIDAY TODAY
                    </Box>
                  )}
                  
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        stylist.holidays && stylist.holidays.length > 0 ? (
                          <Tooltip title={`${stylist.holidays.length} holiday(s) scheduled`}>
                            <HolidayIcon color="primary" />
                          </Tooltip>
                        ) : null
                      }
                    >
                      <Avatar 
                        src={stylist.imageUrl || DEFAULT_AVATAR} 
                        sx={{ width: 64, height: 64, mr: 2 }}
                      />
                    </Badge>
                    <Box>
                      <Typography variant="h6" component="div">
                        {stylist.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Face fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">
                          {stylist.gender === 'male' ? 'Male' : stylist.gender === 'female' ? 'Female' : 'Other'}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color={isOnHolidayToday ? 'warning.main' : (stylist.available ? 'success.main' : 'error.main')}
                        sx={{ fontWeight: 'medium' }}
                      >
                        {isOnHolidayToday 
                          ? `On Holiday${holidayToday?.reason ? `: ${holidayToday.reason}` : ''}` 
                          : (stylist.available ? 'Available' : 'Not Available')}
                      </Typography>
                      
                      {/* Holiday button */}
                      <Button
                        size="small"
                        startIcon={<HolidayIcon />}
                        color="secondary"
                        onClick={() => openHolidayDialog(stylist)}
                        sx={{ mt: 1, borderRadius: '4px', py: 0.5 }}
                        variant="outlined"
                      >
                        Add Holiday
                      </Button>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {stylist.bio && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {stylist.bio}
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Specialties:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {stylist.specialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          icon={getSpecialtyIcon(specialty)}
                          sx={{ mb: 0.5, mr: 0.5 }}
                        />
                      ))}
                    </Box>
                    
                    {/* Display upcoming holidays */}
                    {stylistHolidaysList.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                          Upcoming Holidays:
                        </Typography>
                        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {stylistHolidaysList
                            .filter(holiday => {
                              const holidayDate = new Date(holiday.holiday_date);
                              return isToday(holidayDate) || isAfter(holidayDate, new Date());
                            })
                            .sort((a, b) => 
                              new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()
                            )
                            .map((holiday) => (
                              <Box 
                                key={holiday.id} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  mb: 1,
                                  p: 1,
                                  bgcolor: holiday.holiday_date === today ? 'warning.light' : 'background.paper',
                                  borderRadius: '4px',
                                  border: '1px solid',
                                  borderColor: holiday.holiday_date === today ? 'warning.main' : 'divider'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <EventBusyIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      mr: 1, 
                                      color: holiday.holiday_date === today ? 'warning.main' : 'error.main' 
                                    }} 
                                  />
                                  <Box>
                                    <Typography variant="body2" fontWeight={holiday.holiday_date === today ? 'bold' : 'normal'}>
                                      {format(new Date(holiday.holiday_date), 'MMM dd, yyyy')}
                                      {holiday.holiday_date === today && ' (Today)'}
                                    </Typography>
                                    {holiday.reason && (
                                      <Typography variant="caption" color="text.secondary">
                                        {holiday.reason}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => openHolidayDialog(stylist, holiday)}
                                    sx={{ mr: 0.5 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => removeHoliday(stylist, holiday.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1.5, pt: 0 }}>
                    <IconButton onClick={() => handleEdit(stylist)} color="primary" size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(stylist.id)} color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : viewType === 'grid' ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No stylists found. Add your first stylist to get started.
          </Typography>
        </Paper>
      ) : null}

      {/* HOLIDAY REPORT VIEW - updated */}
      {viewType === 'report' && stylists?.length ? (
        <Paper sx={{ p: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Holiday Report: {format(reportMonth, 'MMMM yyyy')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={handlePrevMonth} 
                variant="outlined" 
                size="small"
              >
                Previous Month
              </Button>
              <Button 
                onClick={() => setReportMonth(new Date())} 
                variant="outlined" 
                size="small"
                color="primary"
              >
                Current Month
              </Button>
              <Button 
                onClick={handleNextMonth} 
                variant="outlined" 
                size="small"
              >
                Next Month
              </Button>
            </Box>
          </Box>

          {/* Summary section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Summary for {format(reportMonth, 'MMMM yyyy')}:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6">
                    {holidayReports.reduce((sum, report) => sum + report.totalHolidays, 0)}
                  </Typography>
                  <Typography variant="body2">
                    Total Holidays
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Typography variant="h6">
                    {stylistsOnHolidayToday.length}
                  </Typography>
                  <Typography variant="body2">
                    Stylists on Holiday Today
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
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

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stylist</TableCell>
                  <TableCell>Total Holidays</TableCell>
                  <TableCell>Holiday Dates</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidayReports.map((report) => {
                  const stylist = stylists.find(s => s.id === report.stylistId);
                  if (!stylist) return null;
                  
                  const isOnHolidayToday = checkStylistOnHolidayToday(stylist);
                  
                  return (
                    <TableRow 
                      key={report.stylistId}
                      sx={{ 
                        bgcolor: isOnHolidayToday ? 'warning.lighter' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              isOnHolidayToday ? (
                                <Tooltip title="On holiday today">
                                  <HolidayIcon color="warning" />
                                </Tooltip>
                              ) : null
                            }
                          >
                            <Avatar 
                              src={stylist.imageUrl || DEFAULT_AVATAR} 
                              sx={{ width: 40, height: 40, mr: 2 }}
                            />
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2">
                              {report.stylistName}
                            </Typography>
                            <Typography variant="caption" color={isOnHolidayToday ? 'warning.main' : 'text.secondary'}>
                              {isOnHolidayToday ? 'On Holiday Today' : stylist.available ? 'Available' : 'Not Available'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {report.totalHolidays > 0 ? (
                          <Chip 
                            label={`${report.totalHolidays} holiday(s)`} 
                            color={isOnHolidayToday ? "warning" : "primary"} 
                            size="small" 
                          />
                        ) : 'No holidays this month'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {report.holidays.map(holiday => {
                            const holidayDate = new Date(holiday.holiday_date);
                            const isToday = isSameDay(holidayDate, new Date());
                            const isPast = isBefore(holidayDate, new Date()) && !isToday;
                            
                            return (
                              <Tooltip 
                                key={holiday.id} 
                                title={holiday.reason || 'No reason provided'}
                              >
                                <Chip
                                  icon={<EventBusyIcon />}
                                  label={format(holidayDate, 'MMM dd (EEE)')}
                                  size="small"
                                  color={isToday ? 'warning' : isPast ? 'default' : 'primary'}
                                  sx={{ 
                                    m: 0.5,
                                    textDecoration: isPast ? 'line-through' : 'none',
                                    opacity: isPast ? 0.7 : 1
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<HolidayIcon />}
                            onClick={() => openHolidayDialog(stylist)}
                            color="primary"
                            variant="outlined"
                          >
                            Add Holiday
                          </Button>
                          {isOnHolidayToday && (
                            <Button
                              size="small"
                              color="warning"
                              variant="outlined"
                              onClick={() => {
                                const todayHoliday = getStylistHolidayForDate(stylist, new Date());
                                if (todayHoliday) {
                                  openHolidayDialog(stylist, todayHoliday);
                                }
                              }}
                            >
                              Edit Today's Holiday
                            </Button>
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
      ) : viewType === 'report' ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No stylists found. Add your first stylist to get started.
          </Typography>
        </Paper>
      ) : null}

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
                                bgcolor: isToday(new Date(holiday.date)) ? 'warning.light' : 'inherit'
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
                                        openHolidayDialog(tempStylist, holiday);
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
              <DatePicker
                label="Holiday Date"
                value={holidayDate}
                onChange={(newDate) => setHolidayDate(newDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    variant: "outlined"
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Reason (Optional)"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Vacation, Personal, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHolidayDialog}>Cancel</Button>
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