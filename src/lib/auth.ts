import { supabase } from '../utils/supabase/supabaseClient.js'
import { toast } from 'react-toastify'

// Add function to authenticate with custom token
export async function authenticateWithToken(token: string) {
  try {
    // Store the token in localStorage for compatibility with existing system
    localStorage.setItem('auth_token', token);
    
    // Create a mock user object for the token
    const mockUser = {
      id: token,
      username: 'authenticated_user',
      email: 'user@example.com',
      name: 'Authenticated User',
      role: 'user',
      provider: 'token'
    };
    
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    // Trigger auth state change to update the context
    // Since we're using localStorage, the AuthContext will pick this up
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: mockUser, session: null } 
    }));
    
    toast.success('Authenticated successfully with token');
    return { data: mockUser, error: null };
  } catch (error) {
    console.error('Error authenticating with token:', error);
    toast.error('Failed to authenticate with token');
    return { data: null, error };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    console.error('Error signing in:', error)
    toast.error('Failed to sign in. Please check your credentials.')
    return { data: null, error }
  }
}

export async function signUp(email: string, password: string) {
  return {
    data: null,
    error: {
      message: 'Registration is disabled. Please contact administrators at nitturkashyash@gmail.com or pankajhadole@gmail.com to create an account.'
    }
  };
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    toast.success('Signed out successfully')
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    toast.error('Failed to sign out')
    return { error }
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    return { session, error: null }
  } catch (error) {
    console.error('Error getting session:', error)
    return { session: null, error }
  }
}

// Hook to subscribe to auth changes
export function subscribeToAuthChanges(callback: (event: any, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
} 