// Browser API polyfills for better compatibility

// Polyfill for process.env in browser
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
    browser: true,
    version: '',
    versions: { node: '' },
    platform: 'browser',
  };
}

// Polyfill for global in browser
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Enhanced IndexedDB error handling
export function setupIndexedDBPolyfills() {
  if (!window.indexedDB) {
    console.warn('⚠️ IndexedDB not supported, offline functionality will be limited');
    return false;
  }

  // Handle IndexedDB errors gracefully
  const originalOpen = window.indexedDB.open;
  window.indexedDB.open = function(...args) {
    const request = originalOpen.apply(this, args);
    
    request.onerror = function(event) {
      console.error('❌ IndexedDB error:', event);
      // Don't let the error propagate and crash the app
      event.preventDefault();
      event.stopPropagation();
    };
    
    return request;
  };

  return true;
}

// Network API polyfills
export function setupNetworkPolyfills() {
  // Polyfill for navigator.connection if not available
  if (!('connection' in navigator)) {
    (navigator as any).connection = {
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
    };
  }

  // Enhanced online/offline detection
  if (!('onLine' in navigator)) {
    (navigator as any).onLine = true;
  }
}

// Storage API polyfills
export function setupStoragePolyfills() {
  // Polyfill for navigator.storage if not available
  if (!('storage' in navigator)) {
    (navigator as any).storage = {
      estimate: async () => ({
        quota: 50 * 1024 * 1024, // 50MB fallback
        usage: 0,
      }),
    };
  }
}

// AbortController polyfill for older browsers
export function setupAbortControllerPolyfill() {
  if (typeof AbortController === 'undefined') {
    (window as any).AbortController = class {
      signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      
      abort() {
        this.signal.aborted = true;
      }
    };
  }
}

// Initialize all polyfills
export function initializePolyfills() {
  try {
    setupIndexedDBPolyfills();
    setupNetworkPolyfills();
    setupStoragePolyfills();
    setupAbortControllerPolyfill();
    
    console.log('✅ Browser polyfills initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize polyfills:', error);
    return false;
  }
} 