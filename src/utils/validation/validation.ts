/**
 * Utility functions for form validation
 */

/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if the email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number format (specific to Indian phone numbers)
 * @param phone The phone number to validate
 * @returns True if the phone format is valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Phone number must be exactly 10 digits for Indian mobile numbers
  // starting with 6, 7, 8, or 9
  // OR exactly 12 digits starting with country code 91 followed by a valid
  // 10-digit number (first digit after 91 must be 6-9)

  // Case 1: 10-digit Indian mobile number without country code
  const isValid10Digit = cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);

  // Case 2: 12-digit number with country code 91
  const isValid12Digit =
    cleaned.length === 12 && /^91[6-9]\d{9}$/.test(cleaned);

  return isValid10Digit || isValid12Digit;
}
