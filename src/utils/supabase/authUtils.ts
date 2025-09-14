import { supabase } from './supabaseClient.js';
import { toast } from 'react-toastify';

/**
 * Checks if the user is authenticated and returns the user object
 * Throws an error if not authenticated
 */
export const checkAuthentication = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Authentication error:', error);
      toast.error(`Authentication error: ${error.message}`);
      throw new Error(`Authentication error: ${error.message}`);
    }

    if (!user) {
      const errorMsg = 'User is not authenticated. Please log in again.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Authentication error occurred');
    }
    throw error;
  }
};

/**
 * Creates a new user account using Supabase Auth
 */
export const createUserAccount = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
};

/**
 * Signs in a user using Supabase Auth
 */
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

/**
 * Signs out the current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    return true;
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
};

/**
 * Generic function to insert data with automatic user_id assignment
 */
export const insertWithAuth = async (table: string, data: any) => {
  try {
    const user = await checkAuthentication();

    const { data: result, error } = await supabase
      .from(table)
      .insert({
        ...data,
        user_id: user.id,
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
};

/**
 * Generic function to select data scoped to current user
 */
export const selectWithAuth = async (
  table: string,
  select: string = '*',
  filters: any = {}
) => {
  try {
    const user = await checkAuthentication();

    let query = supabase.from(table).select(select);

    // Add additional filters
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Error selecting from ${table}:`, error);
    throw error;
  }
};

/**
 * Generic function to update data scoped to current user
 */
export const updateWithAuth = async (
  table: string,
  id: string,
  updates: any
) => {
  try {
    const user = await checkAuthentication();

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete data scoped to current user
 */
export const deleteWithAuth = async (table: string, id: string) => {
  try {
    const user = await checkAuthentication();

    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
};

/**
 * Utility function to handle authentication errors
 * Redirects to login page after showing an error message
 */
export const handleAuthError = (error: unknown) => {
  console.error('Authentication error:', error);

  let errorMessage = 'Authentication error occurred';

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  toast.error(`Authentication error: ${errorMessage}`);

  // Redirect to login page after a short delay
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);

  return errorMessage;
};
