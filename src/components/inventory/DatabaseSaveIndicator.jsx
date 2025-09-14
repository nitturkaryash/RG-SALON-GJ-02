import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, IconButton } from '@mui/material';
import { CheckCircle, Error, Close } from '@mui/icons-material';

/**
 * A component that shows database save status
 * @param {Object} props Component props
 * @param {string} props.status Save status: 'saving', 'success', 'error'
 * @param {string} props.message Message to display
 * @param {number} props.duration Duration in ms before auto-hiding (0 for no auto-hide)
 */
const DatabaseSaveIndicator = ({
  status = 'saving',
  message = '',
  duration = 5000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reset visibility when status changes
    setVisible(true);

    // Auto-hide after duration if not saving
    if (status !== 'saving' && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [status, duration]);

  if (!visible) return null;

  let alertProps = {
    severity: 'info',
    icon: <CircularProgress size={20} />,
    action: null,
  };

  switch (status) {
    case 'success':
      alertProps = {
        severity: 'success',
        icon: <CheckCircle />,
        action: (
          <IconButton
            aria-label='close'
            color='inherit'
            size='small'
            onClick={() => setVisible(false)}
          >
            <Close fontSize='inherit' />
          </IconButton>
        ),
      };
      break;
    case 'error':
      alertProps = {
        severity: 'error',
        icon: <Error />,
        action: (
          <IconButton
            aria-label='close'
            color='inherit'
            size='small'
            onClick={() => setVisible(false)}
          >
            <Close fontSize='inherit' />
          </IconButton>
        ),
      };
      break;
    default:
      // Default is saving/info
      break;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Alert
        variant='filled'
        {...alertProps}
        sx={{
          minWidth: '250px',
          boxShadow: 3,
          animation: 'fadeIn 0.3s ease-in-out',
        }}
      >
        {message ||
          (status === 'saving'
            ? 'Saving to database...'
            : status === 'success'
              ? 'Successfully saved to database!'
              : status === 'error'
                ? 'Failed to save to database'
                : 'Processing...')}
      </Alert>
    </Box>
  );
};

export default DatabaseSaveIndicator;
