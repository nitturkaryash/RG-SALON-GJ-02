import { toast } from 'react-toastify';

// Toast message types for better organization
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Common toast messages for consistency
export const TOAST_MESSAGES = {
  // Success messages
  SUCCESS: {
    SAVE: 'Saved successfully!',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
    CREATE: 'Created successfully!',
    LOGIN: 'Logged in successfully!',
    LOGOUT: 'Logged out successfully!',
    UPLOAD: 'File uploaded successfully!',
    DOWNLOAD: 'File downloaded successfully!',
    SYNC: 'Data synchronized successfully!',
    PAYMENT: 'Payment processed successfully!',
    APPOINTMENT: 'Appointment booked successfully!',
    ORDER: 'Order created successfully!',
    INVENTORY_UPDATE: 'Inventory updated successfully!',
    CLIENT_ADDED: 'Client added successfully!',
    STYLIST_ADDED: 'Stylist added successfully!',
    SERVICE_ADDED: 'Service added successfully!',
    PRODUCT_ADDED: 'Product added successfully!',
  },

  // Error messages
  ERROR: {
    SAVE: 'Failed to save. Please try again.',
    UPDATE: 'Failed to update. Please try again.',
    DELETE: 'Failed to delete. Please try again.',
    CREATE: 'Failed to create. Please try again.',
    LOGIN: 'Login failed. Please check your credentials.',
    LOGOUT: 'Logout failed. Please try again.',
    UPLOAD: 'File upload failed. Please try again.',
    DOWNLOAD: 'File download failed. Please try again.',
    SYNC: 'Data synchronization failed. Please try again.',
    PAYMENT: 'Payment processing failed. Please try again.',
    APPOINTMENT: 'Failed to book appointment. Please try again.',
    ORDER: 'Failed to create order. Please try again.',
    INVENTORY_UPDATE: 'Failed to update inventory. Please try again.',
    CLIENT_ADD: 'Failed to add client. Please try again.',
    STYLIST_ADD: 'Failed to add stylist. Please try again.',
    SERVICE_ADD: 'Failed to add service. Please try again.',
    PRODUCT_ADD: 'Failed to add product. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.',
    PERMISSION: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested item was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
  },

  // Warning messages
  WARNING: {
    UNSAVED_CHANGES:
      'You have unsaved changes. Are you sure you want to leave?',
    LOW_STOCK: 'Some items are running low on stock.',
    PAYMENT_PENDING: 'Payment is pending. Please complete the payment.',
    OFFLINE: 'You are currently offline. Some features may not be available.',
    SYNC_REQUIRED: 'Data synchronization is required.',
    EXPIRED_SESSION: 'Your session has expired. Please log in again.',
    INVALID_DATA:
      'Some data appears to be invalid. Please check and try again.',
  },

  // Info messages
  INFO: {
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    SAVING: 'Saving...',
    UPLOADING: 'Uploading...',
    DOWNLOADING: 'Downloading...',
    SYNCING: 'Synchronizing...',
    CONNECTING: 'Connecting...',
    OFFLINE_MODE: 'Working in offline mode.',
    DATA_LOADED: 'Data loaded successfully.',
    CHANGES_SAVED: 'Your changes have been saved.',
  },
} as const;

// Toast configuration options
export const TOAST_CONFIG = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: 'colored' as const,
};

// Utility functions for common toast operations
export const showToast = {
  success: (message: string, options?: any) => {
    toast.success(message, { ...TOAST_CONFIG, ...options });
  },

  error: (message: string, options?: any) => {
    toast.error(message, { ...TOAST_CONFIG, ...options });
  },

  warning: (message: string, options?: any) => {
    toast.warning(message, { ...TOAST_CONFIG, ...options });
  },

  info: (message: string, options?: any) => {
    toast.info(message, { ...TOAST_CONFIG, ...options });
  },

  // Predefined success messages
  saveSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.SAVE, options),
  updateSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.UPDATE, options),
  deleteSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.DELETE, options),
  createSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.CREATE, options),
  loginSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.LOGIN, options),
  logoutSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.LOGOUT, options),
  paymentSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.PAYMENT, options),
  appointmentSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.APPOINTMENT, options),
  orderSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.ORDER, options),
  inventoryUpdateSuccess: (options?: any) =>
    showToast.success(TOAST_MESSAGES.SUCCESS.INVENTORY_UPDATE, options),

  // Predefined error messages
  saveError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.SAVE, options),
  updateError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.UPDATE, options),
  deleteError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.DELETE, options),
  createError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.CREATE, options),
  loginError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.LOGIN, options),
  logoutError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.LOGOUT, options),
  paymentError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.PAYMENT, options),
  appointmentError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.APPOINTMENT, options),
  orderError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.ORDER, options),
  inventoryUpdateError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.INVENTORY_UPDATE, options),
  networkError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.NETWORK, options),
  validationError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.VALIDATION, options),
  permissionError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.PERMISSION, options),
  notFoundError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.NOT_FOUND, options),
  unauthorizedError: (options?: any) =>
    showToast.error(TOAST_MESSAGES.ERROR.UNAUTHORIZED, options),

  // Predefined warning messages
  unsavedChanges: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.UNSAVED_CHANGES, options),
  lowStock: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.LOW_STOCK, options),
  paymentPending: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.PAYMENT_PENDING, options),
  offline: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.OFFLINE, options),
  syncRequired: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.SYNC_REQUIRED, options),
  expiredSession: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.EXPIRED_SESSION, options),
  invalidData: (options?: any) =>
    showToast.warning(TOAST_MESSAGES.WARNING.INVALID_DATA, options),

  // Predefined info messages
  loading: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.LOADING, options),
  processing: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.PROCESSING, options),
  saving: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.SAVING, options),
  uploading: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.UPLOADING, options),
  downloading: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.DOWNLOADING, options),
  syncing: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.SYNCING, options),
  connecting: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.CONNECTING, options),
  offlineMode: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.OFFLINE_MODE, options),
  dataLoaded: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.DATA_LOADED, options),
  changesSaved: (options?: any) =>
    showToast.info(TOAST_MESSAGES.INFO.CHANGES_SAVED, options),
};

// Error handling utility
export const handleError = (error: any, customMessage?: string) => {
  console.error('Error:', error);

  let message = customMessage || TOAST_MESSAGES.ERROR.NETWORK;

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  showToast.error(message);
  return message;
};

// Success handling utility
export const handleSuccess = (message?: string, customMessage?: string) => {
  const finalMessage = customMessage || message || TOAST_MESSAGES.SUCCESS.SAVE;
  showToast.success(finalMessage);
  return finalMessage;
};

// Promise wrapper for async operations with toast feedback
export const withToast = async <T>(
  operation: () => Promise<T>,
  successMessage?: string,
  errorMessage?: string
): Promise<T | null> => {
  try {
    const result = await operation();
    if (successMessage) {
      showToast.success(successMessage);
    }
    return result;
  } catch (error) {
    handleError(error, errorMessage);
    return null;
  }
};

// Loading toast utility
export const showLoadingToast = (
  message: string = TOAST_MESSAGES.INFO.LOADING
) => {
  return toast.loading(message, { ...TOAST_CONFIG });
};

// Update loading toast
export const updateLoadingToast = (
  toastId: any,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'success'
) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 5000,
  });
};

// Dismiss toast
export const dismissToast = (toastId?: any) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Clear all toasts
export const clearAllToasts = () => {
  toast.dismiss();
};
