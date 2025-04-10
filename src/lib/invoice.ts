/**
 * Invoice number generator utility
 * Generates unique invoice numbers for orders
 */

/**
 * Generates a unique invoice number with format INV-YYYYMMDD-XXXX
 * where XXXX is a random number between 1000-9999
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  // Get current date in YYYYMMDD format
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;
  
  // Generate a random 4-digit number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  // Return formatted invoice number
  return `INV-${dateString}-${randomNum}`;
}; 