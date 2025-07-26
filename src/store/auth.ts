import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { useFavorites } from './favorites';
import { shouldUseCookies, setCookie, getCookie } from '../utils/cookies';

interface AuthState {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any } | undefined>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ error: any } | undefined>;
  resetPassword: (email: string) => Promise<{ error: any } | undefined>;
  validateSession: () => Promise<boolean>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    
    // Clear any existing corrupted session data before login
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      console.log("Cleared existing session data before login");
    } catch (error) {
      console.error("Error clearing session data before login:", error);
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      set({ user: data.user, loading: false });
      
      // Validate the session to ensure it's working properly
      const isValid = await get().validateSession();
      if (!isValid) {
        console.error('Session validation failed after login');
        // Clear the session and return error
        await supabase.auth.signOut();
        set({ user: null, loading: false });
        return { error: { message: 'Login successful but session validation failed. Please try again.' } };
      }
      
      // Store session info in cookies if enabled
      if (shouldUseCookies()) {
        setCookie('user_session', data.user.id, 7); // 7 days
      }
      // Fetch user's favorites after successful login
      const favoritesStore = useFavorites.getState();
      await favoritesStore.fetchFavorites(data.user.id);
    } else {
      set({ loading: false });
    }
    return { error };
  },
  register: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error) {
      set({ user: data.user, loading: false });
    } else {
      set({ loading: false });
    }
    return { error };
  },
  resetPassword: async (email) => {
    set({ loading: true });
    
    // Use the production domain if available, otherwise fallback to current origin
    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://skinvault.app/reset-password'
      : `${window.location.origin}/reset-password`;
    
    console.log('Password reset redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    set({ loading: false });
    return { error };
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
    // Clear session cookie if enabled
    if (shouldUseCookies()) {
      setCookie('user_session', '', -1); // Delete cookie
    }
  },
  checkSession: async () => {
    // Don't auto-check session if we're on the reset password page
    if (window.location.pathname === '/reset-password') {
      console.log('Skipping session check on reset password page');
      set({ loading: false });
      return;
    }
    
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Session check error:', error);
        // If there's an auth error, clear the session
        await supabase.auth.signOut();
        set({ user: null, loading: false });
        return;
      }
      
      if (data.user) {
        set({ user: data.user, loading: false });
        // Store session info in cookies if enabled
        if (shouldUseCookies()) {
          setCookie('user_session', data.user.id, 7); // 7 days
        }
        // Fetch user's favorites if they have an active session
        const favoritesStore = useFavorites.getState();
        await favoritesStore.fetchFavorites(data.user.id);
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      set({ user: null, loading: false });
    }
  },
  validateSession: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Session validation error:', error);
        return false;
      }
      
      if (!data.user) {
        console.log('No user found in session');
        return false;
      }
      
      // Test database access to ensure session is working
      const { error: dbError } = await supabase.from('categories').select('count').limit(1);
      
      if (dbError) {
        console.error('Database access error during session validation:', dbError);
        return false;
      }
      
      console.log('Session validation successful');
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  },
})); 