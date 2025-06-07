// Disable right click
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Disable keyboard shortcuts
document.addEventListener('keydown', (e) => {
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

// Disable text selection
document.addEventListener('selectstart', (e) => e.preventDefault());

// Disable drag and drop
document.addEventListener('dragstart', (e) => e.preventDefault());

// Disable copy
document.addEventListener('copy', (e) => e.preventDefault());

// Disable cut
document.addEventListener('cut', (e) => e.preventDefault());

// Disable paste
document.addEventListener('paste', (e) => e.preventDefault());

// Disable console.log
const disableConsole = () => {
  const methods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'clear', 'count', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'timeLog', 'trace', 'profile', 'profileEnd', 'table', 'exception', 'timeStamp', 'takeHeapSnapshot', 'v8Profiler', 'v8Coverage'];
  methods.forEach(method => {
    console[method] = () => {};
  });
};

// Call disableConsole in production
if (process.env.NODE_ENV === 'production') {
  disableConsole();
} 