/**
 * Format a number as Indian Rupees
 * @param amount - The amount to format
 * @returns Formatted string with ₹ symbol
 */
export const formatCurrency = (amount: number | null | undefined) => {
  // Default to 0 if amount is null or undefined
  const safeAmount = amount ?? 0;
  
  // Round the amount to remove decimals
  const roundedAmount = Math.round(safeAmount);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // No decimal places
  }).format(roundedAmount);
}

/**
 * Format a percentage value
 * @param value - The percentage value to format
 * @returns Formatted string with % symbol
 */
export const formatPercentage = (value: number) => {
  return `${Math.round(value)}%`
} 