import * as React from 'react'
import { Session, User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { getSession, subscribeToAuthChanges } from '../lib/auth'
import { useEffect, useState, createContext, useContext } from 'react'
import { supabase } from '../utils/supabase/supabaseClient'

type AuthContextType = {
	session: Session | null
	loading: boolean
	user: User | null
	logout: () => Promise<void>
	authenticateWithToken: (token: string) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType>({
	session: null,
	loading: true,
	user: null,
	logout: async () => {},
	authenticateWithToken: async () => {}
})

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	// Add logout function
	const logout = async () => {
		try {
			// Sign out from Supabase (if used)
			await supabase.auth.signOut();
			
			// Clear authentication data from localStorage
			localStorage.removeItem('auth_token');
			localStorage.removeItem('auth_user');
			
			// Reset the context state
			setSession(null);
			setUser(null);
		} catch (error) {
			console.error('Error logging out:', error);
			throw error; // Re-throw to allow the component to handle it
		}
	}

	// Add function to authenticate with custom token
	const authenticateWithToken = async (token: string) => {
		try {
			// Store the token in localStorage
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
			
			// Update the context state
			setUser(mockUser as any);
			setSession(null); // No session for token auth
			setLoading(false);
		} catch (error) {
			console.error('Error authenticating with token:', error);
			throw error;
		}
	}

	useEffect(() => {
		setLoading(true)
		
		// Check for existing localStorage auth (for backward compatibility)
		const token = localStorage.getItem('auth_token');
		const authUser = localStorage.getItem('auth_user');
		
		// Get initial session from Supabase
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				// Supabase session exists (Google OAuth)
				setSession(session)
				setUser(session.user)
				
				// Update localStorage for compatibility
				localStorage.setItem('auth_token', session.access_token);
				localStorage.setItem('auth_user', JSON.stringify({
					id: session.user.id,
					username: session.user.email,
					email: session.user.email,
					name: session.user.user_metadata?.full_name || session.user.email,
					role: 'user',
					provider: 'google'
				}));
			} else if (token && authUser) {
				// Fallback to localStorage auth (existing hardcoded system)
				// Create a mock session for compatibility
				try {
					const userData = JSON.parse(authUser);
					// Don't set session for hardcoded auth, just user
					setUser(userData as any);
				} catch (e) {
					console.error('Error parsing stored user data:', e);
					localStorage.removeItem('auth_token');
					localStorage.removeItem('auth_user');
				}
			}
			setLoading(false)
		})

		// Set up the listener for auth changes
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (event === 'SIGNED_IN' && session) {
					setSession(session)
					setUser(session.user)
					
					// Update localStorage for compatibility
					localStorage.setItem('auth_token', session.access_token);
					localStorage.setItem('auth_user', JSON.stringify({
						id: session.user.id,
						username: session.user.email,
						email: session.user.email,
						name: session.user.user_metadata?.full_name || session.user.email,
						role: 'user',
						provider: 'google'
					}));
				} else if (event === 'SIGNED_OUT') {
					setSession(null)
					setUser(null)
					localStorage.removeItem('auth_token');
					localStorage.removeItem('auth_user');
				}
				setLoading(false)
			}
		)

		// Listen for custom auth state changes (for token authentication)
		const handleCustomAuthChange = (event: CustomEvent) => {
			const { user: newUser, session: newSession } = event.detail;
			setUser(newUser);
			setSession(newSession);
			setLoading(false);
		};

		window.addEventListener('authStateChanged', handleCustomAuthChange as EventListener);

		// Cleanup function to unsubscribe when the component unmounts
		return () => {
			// Correctly access the subscription object and call unsubscribe
			authListener?.subscription?.unsubscribe() // Use optional chaining for safety
			window.removeEventListener('authStateChanged', handleCustomAuthChange as EventListener);
		}
	}, []) // Empty dependency array ensures this runs only once on mount

	const value = {
		user,
		session,
		loading,
		logout, // Add logout function to the context value
		authenticateWithToken // Add authenticateWithToken function to the context value
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuthContext = () => React.useContext(AuthContext) 