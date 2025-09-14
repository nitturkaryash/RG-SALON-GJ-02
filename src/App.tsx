import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { theme } from './theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { startAutomaticReminders } from './utils/appointmentReminders';

// Eagerly loaded pages
import Dashboard from './pages/Dashboard';
import InventoryManager from './pages/InventoryManager';

// Lazy-loaded components with error boundaries
const Appointments = lazy(() =>
  import('./pages/Appointments').catch(error => {
    console.error('Error loading Appointments page:', error);
    return { default: () => <div>Error loading Appointments page</div> };
  })
);
const Clients = lazy(() => import('./pages/Clients'));
const Stylists = lazy(() => import('./pages/Stylists'));
const ServiceCollections = lazy(() => import('./pages/ServiceCollections'));
const ServiceCollectionDetail = lazy(
  () => import('./pages/ServiceCollectionDetail')
);
const ServiceSubCollections = lazy(
  () => import('./pages/ServiceSubCollections')
);
const ServiceSubCollectionDetail = lazy(
  () => import('./pages/ServiceSubCollectionDetail')
);
const Orders = lazy(() => import('./pages/Orders'));
const POS = lazy(() => import('./pages/POS'));
const ProductMaster = lazy(() => import('./pages/ProductMaster'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const MembershipTiers = lazy(() => import('./pages/MembershipTiers'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const ServiceOverview = lazy(() => import('./pages/ServiceOverview'));

// Loading fallback component
const PageLoader = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minHeight='100vh'
  >
    <CircularProgress />
  </Box>
);

function App() {
  // Run maintenance functions on app startup
  useEffect(() => {
    // Initialize automatic appointment reminder system
    try {
      console.log('🚀 Initializing automatic appointment reminder system...');
      startAutomaticReminders();
      console.log('✅ Appointment reminder system initialized successfully');
    } catch (error) {
      console.error(
        '❌ Error initializing appointment reminder system:',
        error
      );
    }
  }, []);

  // Handle right-click control based on environment
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;

    const handleContextMenu = (e: MouseEvent) => {
      // Disable right-click in production
      if (!isDevelopment) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U in production
      if (!isDevelopment) {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Optional: Show a console message about the environment
    if (isDevelopment) {
      console.log(
        '🔧 Development mode: Right-click and developer tools enabled'
      );
    } else {
      console.log(
        '🚀 Production mode: Right-click and developer tools disabled'
      );
    }

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer position='top-right' theme='dark' />
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Outlet />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to='/dashboard' replace />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route
              path='appointments'
              element={
                <ErrorBoundary>
                  <Appointments />
                </ErrorBoundary>
              }
            />
            <Route path='clients' element={<Clients />} />
            <Route
              path='stylists'
              element={
                <ErrorBoundary>
                  <Stylists />
                </ErrorBoundary>
              }
            />
            <Route path='services' element={<ServiceOverview />} />
            <Route
              path='services/:collectionId'
              element={<ServiceSubCollections />}
            />
            <Route
              path='services/:collectionId/:subCollectionId'
              element={<ServiceSubCollectionDetail />}
            />
            <Route
              path='membership-tiers'
              element={
                <ErrorBoundary>
                  <MembershipTiers />
                </ErrorBoundary>
              }
            />
            <Route
              path='members'
              element={
                <ErrorBoundary>
                  <MembersPage />
                </ErrorBoundary>
              }
            />
            <Route path='inventory' element={<InventoryManager />} />
            <Route path='products' element={<InventoryManager />} />
            <Route
              path='product-master'
              element={
                <ErrorBoundary>
                  <ProductMaster />
                </ErrorBoundary>
              }
            />
            <Route
              path='orders'
              element={
                <ErrorBoundary>
                  <Orders />
                </ErrorBoundary>
              }
            />
            <Route path='pos' element={<POS />} />
            <Route
              path='collections/:id'
              element={
                <ErrorBoundary>
                  <CollectionDetail />
                </ErrorBoundary>
              }
            />
            <Route path='*' element={<Navigate to='/dashboard' replace />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
