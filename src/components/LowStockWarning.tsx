import React from 'react';
import { Alert, Box, Chip, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface LowStockWarningProps {
  stockQuantity?: number;
  lowStockThreshold?: number;
  outOfStockLabel?: string;
  lowStockLabel?: string;
  inStockLabel?: string;
  showChip?: boolean;
  showAlert?: boolean;
  productName?: string;
  variant?: 'standard' | 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

/**
 * Component to display stock status with appropriate styling and warnings
 * Can be used as a chip, alert, or both
 */
const LowStockWarning: React.FC<LowStockWarningProps> = ({
  stockQuantity,
  lowStockThreshold = 3,
  outOfStockLabel = 'Out of Stock',
  lowStockLabel = 'Low Stock',
  inStockLabel = 'In Stock',
  showChip = true,
  showAlert = false,
  productName,
  variant = 'filled',
  size = 'small',
}) => {
  // Skip rendering if not showing any UI elements
  if (!showChip && !showAlert) return null;
  
  // Define stock status for styling and labels
  const isOutOfStock = typeof stockQuantity === 'number' && stockQuantity <= 0;
  const isLowStock = typeof stockQuantity === 'number' && stockQuantity > 0 && stockQuantity <= lowStockThreshold;
  const isInStock = typeof stockQuantity === 'number' && stockQuantity > lowStockThreshold;
  
  // Define colors based on stock status
  let color: 'success' | 'warning' | 'error' | undefined = undefined;
  let label = '';
  
  if (isOutOfStock) {
    color = 'error';
    label = outOfStockLabel;
  } else if (isLowStock) {
    color = 'warning';
    label = `${lowStockLabel} (${stockQuantity})`;
  } else if (isInStock) {
    color = 'success';
    label = `${inStockLabel} (${stockQuantity})`;
  } else {
    // Unknown stock status
    return null;
  }
  
  return (
    <Box>
      {showChip && (
        <Chip
          label={label}
          color={color}
          size={size}
          icon={isLowStock || isOutOfStock ? <WarningIcon /> : undefined}
          variant={variant}
        />
      )}
      
      {showAlert && isLowStock && productName && (
        <Alert 
          severity="warning" 
          variant={variant === 'outlined' ? 'outlined' : 'standard'}
          sx={{ mt: 1 }}
        >
          <Typography variant="body2">
            <strong>{productName}</strong> is running low on stock ({stockQuantity} remaining)
          </Typography>
        </Alert>
      )}
      
      {showAlert && isOutOfStock && productName && (
        <Alert 
          severity="error" 
          variant={variant === 'outlined' ? 'outlined' : 'standard'}
          sx={{ mt: 1 }}
        >
          <Typography variant="body2">
            <strong>{productName}</strong> is out of stock!
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default LowStockWarning; 