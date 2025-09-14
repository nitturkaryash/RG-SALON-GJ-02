import {
  Paper,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  TableChart as CsvIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useState, useRef, ReactNode } from 'react';
import { downloadData, DownloadData } from '../../utils/downloadUtils';

interface DownloadableCardProps {
  title: string;
  children: ReactNode;
  data: any[];
  downloadType:
    | 'staff-revenue'
    | 'sales-trend'
    | 'payment-methods'
    | 'customer-analytics'
    | 'inventory'
    | 'appointments'
    | 'real-time'
    | 'staff-utilization'
    | 'staff-efficiency'
    | 'monthly-comparison';
  height?: number;
  showDataCount?: boolean;
  subtitle?: string;
  icon?: ReactNode;
  actionButtons?: ReactNode;
}

export default function DownloadableCard({
  title,
  children,
  data,
  downloadType,
  height = 400,
  showDataCount = true,
  subtitle,
  icon,
  actionButtons,
}: DownloadableCardProps) {
  const [downloadMenuAnchor, setDownloadMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleDownloadMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  const handleDownload = async (format: 'excel' | 'csv' | 'png' | 'pdf') => {
    try {
      showNotification(`Preparing ${format.toUpperCase()} download...`, 'info');

      const downloadDataPayload: DownloadData = {
        title,
        data,
        chartElement: chartRef.current,
        type: downloadType,
      };

      await downloadData(format, downloadDataPayload);
      showNotification(
        `${format.toUpperCase()} downloaded successfully!`,
        'success'
      );
    } catch (error) {
      console.error('Download error:', error);
      showNotification(`Failed to download ${format.toUpperCase()}`, 'error');
    }
    handleDownloadMenuClose();
  };

  return (
    <>
      <Paper
        ref={cardRef}
        elevation={0}
        sx={{
          height: height,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 2,
            borderColor: 'primary.main',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Box>
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant='caption' color='text.secondary'>
                  {subtitle}
                </Typography>
              )}
              {showDataCount && data.length > 0 && (
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={`${data.length} records`}
                    size='small'
                    variant='outlined'
                    color='primary'
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actionButtons}

            <Tooltip title='Download Data'>
              <IconButton
                onClick={handleDownloadMenuOpen}
                size='small'
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Content */}
        <Box
          ref={chartRef}
          sx={{
            flex: 1,
            p: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>

        {/* Download Menu */}
        <Menu
          anchorEl={downloadMenuAnchor}
          open={Boolean(downloadMenuAnchor)}
          onClose={handleDownloadMenuClose}
          PaperProps={{
            sx: { minWidth: 200 },
          }}
        >
          <MenuItem onClick={() => handleDownload('excel')}>
            <ListItemIcon>
              <ExcelIcon color='success' />
            </ListItemIcon>
            <ListItemText
              primary='Excel (.xlsx)'
              secondary='Complete data with analytics'
            />
          </MenuItem>

          <MenuItem onClick={() => handleDownload('csv')}>
            <ListItemIcon>
              <CsvIcon color='info' />
            </ListItemIcon>
            <ListItemText
              primary='CSV (.csv)'
              secondary='Raw data for analysis'
            />
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => handleDownload('png')}>
            <ListItemIcon>
              <ImageIcon color='secondary' />
            </ListItemIcon>
            <ListItemText
              primary='Image (.png)'
              secondary='Chart visualization'
            />
          </MenuItem>

          <MenuItem onClick={() => handleDownload('pdf')}>
            <ListItemIcon>
              <PdfIcon color='error' />
            </ListItemIcon>
            <ListItemText
              primary='PDF (.pdf)'
              secondary='Report with chart & data'
            />
          </MenuItem>
        </Menu>
      </Paper>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
