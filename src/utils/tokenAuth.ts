import { authenticateWithToken } from '../lib/auth';

/**
 * Token authentication utility functions
 */

// The provided authentication token
export const AUTH_TOKEN = '3f4b718f-70cb-4873-a62c-b8806a92e25b';

/**
 * Authenticates using the provided token
 * @returns Promise with authentication result
 */
export const authenticateWithProvidedToken = async () => {
  try {
    const result = await authenticateWithToken(AUTH_TOKEN);
    return result;
  } catch (error) {
    console.error('Token authentication failed:', error);
    throw error;
  }
};

/**
 * Checks if the user is authenticated with the token
 * @returns boolean indicating if user is authenticated
 */
export const isTokenAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  return !!(token && user);
};

/**
 * Gets the current authenticated user from localStorage
 * @returns User object or null if not authenticated
 */
export const getTokenAuthenticatedUser = () => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Logs out the token-authenticated user
 */
export const logoutTokenUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  
  // Trigger auth state change
  window.dispatchEvent(new CustomEvent('authStateChanged', { 
    detail: { user: null, session: null } 
  }));
};

/**
 * Validates if a token is in the correct format
 * @param token - The token to validate
 * @returns boolean indicating if token format is valid
 */
export const isValidTokenFormat = (token: string): boolean => {
  // Check if token is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
};

/**
 * Sets up automatic token authentication on app startup
 * This can be called from your main App component
 */
export const setupTokenAuthentication = () => {
  // Check if token is already stored
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  if (token && user) {
    // User is already authenticated with token
    console.log('User already authenticated with token');
    return true;
  }
  
  // Optionally auto-authenticate with the provided token
  // Uncomment the following lines if you want automatic authentication
  /*
  if (isValidTokenFormat(AUTH_TOKEN)) {
    authenticateWithProvidedToken().catch(error => {
      console.error('Auto-authentication failed:', error);
    });
  }
  */
  
  return false;
}; 