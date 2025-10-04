/**
 * Utility functions for formatting data in the inventory system
 */

/**
 * Format currency values for display
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(2);
};

/**
 * Format numbers for display with Indian locale
 */
export const formatNumber = (value: any): string => {
  return value ? Number(value).toLocaleString('en-IN') : '0';
};

/**
 * Format date to Kolkata timezone for display
 */
export const formatDateKolkata = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + istOffset * 60000);

    return istTime.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTimeForDisplay = (
  dateTimeString: string | null | undefined
): string => {
  if (!dateTimeString) return '';

  try {
    const date = new Date(dateTimeString);

    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + istOffset * 60000);

    return istTime.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '';
  }
};

/**
 * Parse numeric input safely
 */
export const parseNumericInput = (
  value: string | number | undefined | null
): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Safe number conversion for exports
 */
export const safeNumber = (value: any, decimals: number = 2): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : parseFloat(num.toFixed(decimals));
};

/**
 * Safe string conversion
 */
export const safeString = (value: any): string => {
  return value?.toString() || '';
};

/**
 * Safe date conversion
 */
export const safeDate = (value: any): string => {
  if (!value) return '';
  try {
    return new Date(value).toISOString().split('T')[0];
  } catch {
    return '';
  }
};
