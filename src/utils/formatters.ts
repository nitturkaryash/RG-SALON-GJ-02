/**
 * Utility functions for formatting data in consistent ways across the application
 */

/**
 * Format a number or string as currency (INR)
 */
export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '₹0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '₹0';
  
  // Round the value to remove decimals
  const roundedValue = Math.round(numValue);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 // No decimal places
  }).format(roundedValue);
}

/**
 * Format a string as a percentage
 */
export function formatPercentage(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '18%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '18%';
  
  return `${numValue}%`;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  try {
    // For date only
    if (!dateString.includes(':')) {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    // For datetime
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Calculate CGST and SGST if not provided
 * Assumes 9% each for 18% GST (standard Indian GST structure)
 */
export function calculateGSTValues(taxableValue: number, tax: number, cgst?: number | null, sgst?: number | null) {
  let cgstValue = cgst !== null && cgst !== undefined ? cgst : null;
  let sgstValue = sgst !== null && sgst !== undefined ? sgst : null;
  
  // If both CGST and SGST are null but we have tax value
  if (cgstValue === null && sgstValue === null && tax > 0) {
    // Split tax equally between CGST and SGST (standard practice in India)
    cgstValue = tax / 2;
    sgstValue = tax / 2;
  } else if (cgstValue === null && sgstValue === null && taxableValue > 0) {
    // If no tax value but have taxable value, assume 9% CGST and 9% SGST (total 18% GST)
    cgstValue = taxableValue * 0.09;
    sgstValue = taxableValue * 0.09;
  }
  
  return {
    cgst: cgstValue || 0,
    sgst: sgstValue || 0
  };
}

/**
 * Calculate GST breakdown from an amount inclusive of GST
 */
export function calculateGSTBreakdown(amountInclGST: number, gstRate: number) {
  const gstRateFraction = gstRate / 100;
  const amountExclGST = amountInclGST / (1 + gstRateFraction);
  const gstAmount = amountInclGST - amountExclGST;
  
  return {
    taxableValue: amountExclGST,
    gstAmount: gstAmount,
    cgst: gstAmount / 2,
    sgst: gstAmount / 2
  };
}

/**
 * Get color for payment method chip/badge
 */
export function getPaymentMethodColor(method: string | null): string {
  switch (method?.toLowerCase()) {
    case 'cash':
      return '#4caf50'; // Green
    case 'card':
    case 'credit card':
    case 'debit card':
      return '#2196f3'; // Blue
    case 'upi':
    case 'phonepe':
    case 'google pay':
    case 'paytm':
      return '#ff9800'; // Orange
    case 'split':
      return '#9c27b0'; // Purple
    default:
      return '#757575'; // Gray
  }
}

/**
 * Get a color based on stock level (red for low, yellow for medium, green for good)
 */
export function getStockLevelColor(quantity: number | null | undefined, threshold: { low: number, medium: number } = { low: 5, medium: 10 }): string {
  if (quantity === null || quantity === undefined) return '#757575'; // Gray for unknown
  
  if (quantity <= threshold.low) return '#f44336'; // Red for low stock
  if (quantity <= threshold.medium) return '#ff9800'; // Orange for medium stock
  return '#4caf50'; // Green for good stock
} 