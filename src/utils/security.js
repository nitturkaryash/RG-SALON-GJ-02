// Security measures - only run in browser environment
const initializeSecurity = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('Security: Skipping browser-specific security measures (not in browser environment)');
    return;
  }

  console.log('Security: Initializing browser security measures');

  // Disable right click (temporarily disabled)
  // document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Only disable in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Disable Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
    }
    // Disable Ctrl+Shift+J (Windows) or Cmd+Option+J (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
      e.preventDefault();
    }
    // Disable Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
    }
    // Disable Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
    }
  });

  // Disable text selection (temporarily disabled)
  // document.addEventListener('selectstart', (e) => e.preventDefault());

  // Disable drag and drop (temporarily disabled)
  // document.addEventListener('dragstart', (e) => e.preventDefault());

  // Disable copy (temporarily disabled)
  // document.addEventListener('copy', (e) => e.preventDefault());

  // Disable cut (temporarily disabled)
  // document.addEventListener('cut', (e) => e.preventDefault());

  // Disable paste (temporarily disabled)
  // document.addEventListener('paste', (e) => e.preventDefault());
};

// Disable console.log
const disableConsole = () => {
  // Only disable in production and if we're in a browser
  if (typeof console === 'undefined' || process.env.NODE_ENV !== 'production') {
    return;
  }

  console.log('Security: Disabling console methods in production');
  
  const methods = ['log', 'debug', 'info', 'warn'];
  methods.forEach(method => {
    console[method] = () => {};
  });
  
  // Keep error, assert, and other critical methods for debugging
};

// Initialize security when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurity);
  } else {
    // DOM already loaded
    initializeSecurity();
  }
  
  // Initialize console disabling after a delay to ensure critical startup logs are visible
  setTimeout(() => {
    disableConsole();
  }, 5000);
} else {
  console.log('Security: Document not available, skipping browser security measures');
}

export { initializeSecurity }; 