import React, { useState } from 'react';
import { Button, CircularProgress, Box, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RefreshInventoryButtonProps {
  onRefresh?: () => Promise<void>;
  buttonText?: string;
  showIcon?: boolean;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
}

/**
 * A button component that triggers inventory data refresh
 * Can be placed in POS, Inventory, or any other view that needs real-time data
 */
const RefreshInventoryButton: React.FC<RefreshInventoryButtonProps> = ({
  onRefresh,
  buttonText = 'Refresh Stock',
  showIcon = true,
  tooltip = 'Refresh inventory data to see latest stock quantities',
  size = 'small',
  color = 'primary',
  variant = 'contained',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Dispatch a global event that other components can listen for
      window.dispatchEvent(new CustomEvent('inventory-refresh-requested'));

      // Call the custom refresh function if provided
      if (onRefresh) {
        await onRefresh();
      }

      // Wait a moment to show the loading indicator
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing inventory data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Tooltip title={tooltip}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={showIcon ? <RefreshIcon /> : undefined}
          size={size}
          color={color}
          variant={variant}
        >
          {buttonText}
        </Button>
        {isRefreshing && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default RefreshInventoryButton;
