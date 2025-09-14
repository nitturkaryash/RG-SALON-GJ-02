/**
 * Utility functions for formatting amounts consistently across the application
 */

/**
 * Rounds an amount to the nearest whole number
 * @param amount - The amount to round
 * @returns The rounded amount as a number
 */
export const roundAmount = (amount: number): number => {
  return Math.round(amount);
};

/**
 * Formats an amount as currency with rounding to whole numbers
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: '₹')
 * @returns Formatted currency string
 */
export const formatCurrencyRounded = (amount: number, currency: string = '₹'): string => {
  const rounded = roundAmount(amount);
  return `${currency}${rounded.toLocaleString()}`;
};

/**
 * Formats an amount for display with rounding
 * @param amount - The amount to format
 * @returns Formatted amount string with currency symbol
 */
export const formatAmount = (amount: number): string => {
  return formatCurrencyRounded(amount);
};

/**
 * Rounds amount for calculations while preserving precision
 * @param amount - The amount to round
 * @returns Rounded amount
 */
export const roundForCalculation = (amount: number): number => {
  return Math.round(amount * 100) / 100; // Round to 2 decimal places for calculations
};

/**
 * Rounds amount for final display (whole numbers)
 * @param amount - The amount to round
 * @returns Rounded amount for display
 */
export const roundForDisplay = (amount: number): number => {
  return Math.round(amount);
};
