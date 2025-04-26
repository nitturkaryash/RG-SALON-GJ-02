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
}

const AuthContext = React.createContext<AuthContextType>({
	session: null,
	loading: true,
	user: null,
	logout: async () => {}
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

	useEffect(() => {
		setLoading(true)
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		// Set up the listener for auth changes
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session)
				setUser(session?.user ?? null)
				// Set loading to false once we have auth state determined
				setLoading(false)
			}
		)

		// Cleanup function to unsubscribe when the component unmounts
		return () => {
			// Correctly access the subscription object and call unsubscribe
			authListener?.subscription?.unsubscribe() // Use optional chaining for safety
		}
	}, []) // Empty dependency array ensures this runs only once on mount

	const value = {
		user,
		session,
		loading,
		logout // Add logout function to the context value
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuthContext = () => React.useContext(AuthContext) 