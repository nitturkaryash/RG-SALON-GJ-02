import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import { DevRefresher } from './components/DevRefresher';
import Login from './pages/Login';
import { theme } from './theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Eagerly loaded pages
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';

// Lazy-loaded components
const Appointments = lazy(() => import('./pages/Appointments'));
const Clients = lazy(() => import('./pages/Clients'));
const Stylists = lazy(() => import('./pages/Stylists'));
const ServiceCollections = lazy(() => import('./pages/ServiceCollections'));
const ServiceCollectionDetail = lazy(() => import('./pages/ServiceCollectionDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const POS = lazy(() => import('./pages/POS'));
const Products = lazy(() => import('./pages/InventoryManager'));
const ProductMaster = lazy(() => import('./pages/ProductMaster'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const MembershipTiers = lazy(() => import('./pages/MembershipTiers'));

// Loading fallback component
const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer position="top-right" theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="clients" element={<Clients />} />
            <Route path="stylists" element={
              <ErrorBoundary>
                <Stylists />
              </ErrorBoundary>
            } />
            <Route path="services" element={<ServiceCollections />} />
            <Route path="services/:id" element={<ServiceCollectionDetail />} />
            <Route path="members" element={<Members />} />
            <Route path="membership-tiers" element={
              <ErrorBoundary>
                <MembershipTiers />
              </ErrorBoundary>
            } />
            <Route path="products" element={<Products />} />
            <Route path="product-master" element={
              <ErrorBoundary>
                <ProductMaster />
              </ErrorBoundary>
            } />
            <Route path="orders" element={
              <ErrorBoundary>
                <Orders />
              </ErrorBoundary>
            } />
            <Route path="pos" element={<POS />} />
            <Route path="collections/:id" element={
              <ErrorBoundary>
                <CollectionDetail />
              </ErrorBoundary>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
        
        {/* Only renders in development */}
        <DevRefresher />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;