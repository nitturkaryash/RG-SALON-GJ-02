import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography,
  Chip,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import DateRangeCalendar from './DateRangeCalendar';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onDateRangeChange 
}: DateRangePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    onDateRangeChange(newStartDate, newEndDate);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        color="primary"
        startIcon={<CalendarIcon />}
        size="medium"
        sx={{
          borderRadius: 2,
          px: 2,
          py: 0.75,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'background.paper',
            borderColor: 'primary.main',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.primary">
            {format(startDate, 'd MMM yyyy')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            →
          </Typography>
          <Typography variant="body2" color="text.primary">
            {format(endDate, 'd MMM yyyy')}
          </Typography>
        </Box>
      </Button>

      <DateRangeCalendar
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
        onClose={handleClose}
        anchorEl={anchorEl}
      />
    </>
  );
} 