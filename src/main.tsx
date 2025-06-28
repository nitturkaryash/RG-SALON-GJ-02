import React from 'react'
import ReactDOM from 'react-dom/client'

// Import emotion cache first to ensure it's initialized before other UI libraries
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

// Pre-initialize framer-motion to ensure it loads before components
import { MotionConfig } from 'framer-motion'

// Now import other libraries
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'
import { queryClient } from './lib/query-client'
import { AuthContextProvider } from './contexts/AuthContext'
import App from './App.tsx'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'

// Add global error handler to catch any startup errors
window.addEventListener('error', (e) => {
  console.error('🚨 Global error caught:', e.error);
  console.error('🚨 Error details:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('🚨 Unhandled promise rejection:', e.reason);
  e.preventDefault(); // Prevent the error from being logged to console again
});

// Import security measures safely
try {
  import('./utils/security') // Import security measures
  console.log('✅ Security measures imported');
} catch (securityError) {
  console.warn('⚠️ Security measures failed to load:', securityError);
}

try {
  console.log('🚀 Starting application initialization...');

  // Create emotion cache
  const emotionCache = createCache({
    key: 'css',
    prepend: true, // This ensures styles are prepended to the <head> instead of appended
  })

  console.log('✅ Emotion cache created');
  console.log('✅ Framer motion imported');
  console.log('✅ All imports successful');

  console.log('🎯 Creating React root...');

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);

  console.log('🎯 Rendering React app...');

  root.render(
    <React.StrictMode>
      <CacheProvider value={emotionCache}>
        <MotionConfig reducedMotion="user">
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthContextProvider>
                <BrowserRouter>
                  <App />
                  <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </BrowserRouter>
              </AuthContextProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </MotionConfig>
      </CacheProvider>
    </React.StrictMode>,
  )

  console.log('✅ React app rendered successfully');

} catch (error) {
  console.error('🚨 Critical error during app initialization:', error);
  
  // Try to show a basic error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        padding: 20px; 
        font-family: Arial, sans-serif; 
        background: #f5f5f5; 
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center;
      ">
        <div style="
          background: white; 
          padding: 40px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 600px;
          text-align: center;
        ">
          <h1 style="color: #d32f2f; margin-bottom: 20px;">Application Error</h1>
          <p style="color: #666; margin-bottom: 20px;">
            The application failed to start. Please check the console for details.
          </p>
          <p style="color: #999; font-size: 14px; font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 4px;">
            ${error.message || 'Unknown error'}
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #1976d2; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 4px; 
              cursor: pointer; 
              font-size: 16px;
              margin-top: 20px;
            "
          >
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
