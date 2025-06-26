import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'

// Use hardcoded values for demo purposes since import.meta.env may not be available
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Demo credentials for fallback authentication
const DEMO_CREDENTIALS = {
  'admin': { password: 'admin', role: 'admin', id: 'admin-001' },
  'salon_admin': { password: 'password123', role: 'admin', id: 'admin-002' },
  'super_admin': { password: 'super123', role: 'super_admin', id: 'admin-003' },
  'admin123': { password: 'admin123', role: 'admin', id: 'admin-004' },
  'admin@salon.com': { password: 'admin', role: 'admin', id: 'admin-005' },
}

interface User {
  id: string
  email: string
  role: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage (for demo purposes)
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('demo_admin_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error checking existing session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // First try Supabase authentication
      if (supabaseUrl !== 'https://your-project.supabase.co') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!error && data.user) {
          const newUser = {
            id: data.user.id,
            email: data.user.email || '',
            role: 'admin',
            created_at: data.user.created_at || ''
          }
          setUser(newUser)
          localStorage.setItem('demo_admin_user', JSON.stringify(newUser))
          return
        }
      }

      // Fallback to demo authentication
      const credential = DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS]
      if (credential && credential.password === password) {
        const newUser = {
          id: credential.id,
          email: email,
          role: credential.role,
          created_at: new Date().toISOString()
        }
        setUser(newUser)
        localStorage.setItem('demo_admin_user', JSON.stringify(newUser))
        return
      }

      throw new Error('Invalid credentials')
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('demo_admin_user')
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed')
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 