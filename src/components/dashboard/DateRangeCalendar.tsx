import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  ListItemIcon
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { format, addDays, addMonths, startOfMonth, endOfMonth, isSameDay, isWithinInterval, startOfWeek, startOfYear, startOfQuarter } from 'date-fns';

interface DateRangeCalendarProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isStartDate: boolean;
  isEndDate: boolean;
}

const presetOptions = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: -1 },
  { label: 'Last 7 days', days: -7 },
  { label: 'Last 30 days', days: -30 },
  { label: 'Last 90 days', days: -90 },
  { label: 'Last 365 days', days: -365 },
  { label: 'Last month', type: 'lastMonth' },
  { label: 'Last 12 months', type: 'last12Months' },
  { label: 'Last year', type: 'lastYear' },
  { label: 'Week to date', type: 'weekToDate' },
  { label: 'Month to date', type: 'monthToDate' },
  { label: 'Quarter to date', type: 'quarterToDate' },
  { label: 'Year to date', type: 'yearToDate' }
];

export default function DateRangeCalendar({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  onClose,
  anchorEl 
}: DateRangeCalendarProps) {
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(addMonths(new Date(), 1));
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    setLeftMonth(startDate);
    setRightMonth(addMonths(startDate, 1));
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setSelectionStart(startDate);
    setSelectionEnd(endDate);
    
    // Determine if the current date range matches any preset
    determineSelectedPreset(startDate, endDate);
  }, [startDate, endDate]);

  const determineSelectedPreset = (start: Date, end: Date) => {
    const today = new Date();
    
    // Check each preset to see if it matches the current date range
    for (const option of presetOptions) {
      let presetStart: Date;
      let presetEnd = new Date();
      
      if (option.type === 'lastMonth') {
        const lastMonth = addMonths(today, -1);
        presetStart = startOfMonth(lastMonth);
        presetEnd = endOfMonth(lastMonth);
      } else if (option.type === 'last12Months') {
        presetStart = addMonths(today, -12);
      } else if (option.type === 'lastYear') {
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        presetStart = lastYear;
        presetEnd = new Date(lastYear.getFullYear(), 11, 31);
      } else if (option.type === 'weekToDate') {
        presetStart = startOfWeek(today);
      } else if (option.type === 'monthToDate') {
        presetStart = startOfMonth(today);
      } else if (option.type === 'quarterToDate') {
        presetStart = startOfQuarter(today);
      } else if (option.type === 'yearToDate') {
        presetStart = startOfYear(today);
      } else if (option.days !== undefined) {
        presetStart = addDays(today, option.days);
      } else {
        continue;
      }
      
      // Check if the current date range matches this preset
      if (isSameDay(start, presetStart) && isSameDay(end, presetEnd)) {
        setSelectedPreset(option.label);
        return;
      }
    }
    
    setSelectedPreset(null);
  };

  const handlePresetSelect = (option: typeof presetOptions[0]) => {
    const today = new Date();
    let newStartDate: Date;
    let newEndDate = new Date();
    
    if (option.type === 'lastMonth') {
      const lastMonth = addMonths(today, -1);
      newStartDate = startOfMonth(lastMonth);
      newEndDate = endOfMonth(lastMonth);
    } else if (option.type === 'last12Months') {
      newStartDate = addMonths(today, -12);
    } else if (option.type === 'lastYear') {
      const lastYear = new Date(today.getFullYear() - 1, 0, 1);
      newStartDate = lastYear;
      newEndDate = new Date(lastYear.getFullYear(), 11, 31);
    } else if (option.type === 'weekToDate') {
      newStartDate = startOfWeek(today);
    } else if (option.type === 'monthToDate') {
      newStartDate = startOfMonth(today);
    } else if (option.type === 'quarterToDate') {
      newStartDate = startOfQuarter(today);
    } else if (option.type === 'yearToDate') {
      newStartDate = startOfYear(today);
    } else {
      newStartDate = addDays(today, option.days);
    }
    
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
    setSelectionStart(newStartDate);
    setSelectionEnd(newEndDate);
    setLeftMonth(newStartDate);
    setRightMonth(addMonths(newStartDate, 1));
    setSelectedPreset(option.label);
  };

  const handlePrevMonth = () => {
    setLeftMonth(prevMonth => addMonths(prevMonth, -1));
    setRightMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const handleNextMonth = () => {
    setLeftMonth(prevMonth => addMonths(prevMonth, 1));
    setRightMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    if (!selectionStart) {
      setSelectionStart(day);
      setSelectionEnd(null);
      setTempStartDate(day);
      setTempEndDate(day);
    } else if (!selectionEnd) {
      if (day < selectionStart) {
        setSelectionEnd(selectionStart);
        setSelectionStart(day);
        setTempStartDate(day);
        setTempEndDate(selectionStart);
      } else {
        setSelectionEnd(day);
        setTempEndDate(day);
      }
    } else {
      setSelectionStart(day);
      setSelectionEnd(null);
      setTempStartDate(day);
      setTempEndDate(day);
    }
    setSelectedPreset(null);
  };

  const handleDayHover = (day: Date) => {
    setHoverDate(day);
  };

  const handleApply = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const generateMonth = (month: Date): CalendarDay[][] => {
    const firstDay = startOfMonth(month);
    const lastDay = endOfMonth(month);
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(currentDate.getDate() + i);
      
      if (i > 0 && i % 7 === 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      const isCurrentMonth = currentDate.getMonth() === month.getMonth();
      const isStartDate = selectionStart && isSameDay(currentDate, selectionStart);
      const isEndDate = selectionEnd && isSameDay(currentDate, selectionEnd);
      const isSelected = isStartDate || isEndDate;
      
      let isInRange = false;
      if (selectionStart && selectionEnd) {
        isInRange = isWithinInterval(currentDate, {
          start: selectionStart,
          end: selectionEnd
        });
      } else if (selectionStart && hoverDate) {
        const rangeStart = selectionStart < hoverDate ? selectionStart : hoverDate;
        const rangeEnd = selectionStart < hoverDate ? hoverDate : selectionStart;
        isInRange = isWithinInterval(currentDate, {
          start: rangeStart,
          end: rangeEnd
        });
      }
      
      currentWeek.push({
        date: currentDate,
        isCurrentMonth,
        isSelected,
        isInRange,
        isToday: isSameDay(currentDate, today),
        isDisabled: false,
        isStartDate,
        isEndDate
      });
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks.slice(0, 6);
  };

  const renderMonth = (month: Date) => {
    const weeks = generateMonth(month);
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    return (
      <Box>
        <Typography variant="subtitle1" align="center" fontWeight="bold" mb={1}>
          {format(month, 'MMMM yyyy')}
        </Typography>
        
        <Grid container>
          {daysOfWeek.map(day => (
            <Grid item xs={12/7} key={day}>
              <Typography 
                align="center" 
                variant="caption" 
                sx={{ fontWeight: 500, color: 'text.secondary' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => (
              <Grid item xs={12/7} key={`${weekIndex}-${dayIndex}`}>
                <Box 
                  onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
                  onMouseEnter={() => day.isCurrentMonth && handleDayHover(day.date)}
                  sx={{
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: day.isCurrentMonth ? 'pointer' : 'default',
                    borderRadius: day.isStartDate || day.isEndDate ? '50%' : 
                              day.isInRange ? '4px' : 'none',
                    backgroundColor: day.isStartDate || day.isEndDate
                      ? 'primary.main' 
                      : day.isInRange 
                        ? 'primary.light' 
                        : 'transparent',
                    color: day.isStartDate || day.isEndDate
                      ? 'primary.contrastText' 
                      : day.isInRange 
                        ? 'primary.main' 
                        : day.isCurrentMonth 
                          ? day.isToday 
                            ? 'primary.main'
                            : 'text.primary' 
                          : 'text.disabled',
                    fontWeight: day.isToday || day.isSelected ? 'bold' : 'normal',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: day.isCurrentMonth && !day.isSelected 
                        ? 'action.hover' 
                        : undefined
                    },
                    border: day.isToday && !day.isSelected ? '1px solid' : 'none',
                    borderColor: day.isToday && !day.isSelected ? 'primary.main' : undefined,
                    // Add left and right borders for range styling
                    borderLeft: day.isInRange && !day.isStartDate ? '0px' : undefined,
                    borderRight: day.isInRange && !day.isEndDate ? '0px' : undefined,
                    // Special styling for start and end dates
                    '&::before': day.isStartDate && selectionEnd ? {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      width: '50%',
                      height: '100%',
                      backgroundColor: 'primary.light',
                      zIndex: -1,
                    } : undefined,
                    '&::after': day.isEndDate && selectionStart && selectionStart !== selectionEnd ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      width: '50%',
                      height: '100%',
                      backgroundColor: 'primary.light',
                      zIndex: -1,
                    } : undefined,
                    // Circle indicator for selected dates
                    boxShadow: day.isStartDate || day.isEndDate ? '0 0 0 2px #fff, 0 0 0 4px #6B8E23' : 'none',
                  }}
                >
                  <Typography 
                    variant="body2" 
                    component="span"
                    sx={{ 
                      lineHeight: 1,
                      fontWeight: day.isToday || day.isSelected ? 'bold' : 'normal',
                      zIndex: 1,
                    }}
                  >
                    {format(day.date, 'd')}
                  </Typography>
                </Box>
              </Grid>
            ))
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: 680,
          p: 2,
          display: 'flex',
        }
      }}
    >
      <Box sx={{ width: 200, borderRight: '1px solid', borderColor: 'divider', pr: 2, overflowY: 'auto', maxHeight: 500 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Select Range
        </Typography>
        <List disablePadding>
          {presetOptions.map((option) => (
            <ListItem key={option.label} disablePadding>
              <ListItemButton 
                onClick={() => handlePresetSelect(option)}
                dense
                selected={selectedPreset === option.label}
                sx={{
                  borderRadius: 1,
                  py: 0.5,
                  backgroundColor: selectedPreset === option.label ? 'rgba(107, 142, 35, 0.1)' : 'transparent',
                }}
              >
                {selectedPreset === option.label && (
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                )}
                <ListItemText 
                  primary={option.label} 
                  primaryTypographyProps={{
                    sx: { 
                      ml: selectedPreset === option.label ? 0 : 3.5,
                      fontWeight: selectedPreset === option.label ? 'bold' : 'normal'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Box sx={{ flex: 1, pl: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            backgroundColor: 'primary.light',
            px: 2,
            py: 0.5,
            borderRadius: 2,
          }}>
            <Typography variant="body1" fontWeight="medium">
              {format(tempStartDate, 'd MMM yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              →
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {format(tempEndDate, 'd MMM yyyy')}
            </Typography>
          </Box>
          
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {renderMonth(leftMonth)}
          </Box>
          <Box sx={{ flex: 1 }}>
            {renderMonth(rightMonth)}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
          <Button onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            variant="contained"
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Popover>
  );
} 