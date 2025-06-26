import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import Sessions from './pages/Sessions'
import Communication from './pages/Communication'
import MeetingCenter from './pages/MeetingCenter'
import SystemManagement from './pages/SystemManagement'
import ClientDataManagementRefactored from './pages/ClientDataManagementRefactored'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/meetings" element={<MeetingCenter />} />
          <Route path="/system-management" element={<SystemManagement />} />
          <Route path="/client-data" element={<ClientDataManagementRefactored />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App 