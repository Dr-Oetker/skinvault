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
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      set({ user: data.user, loading: false });
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://skinvault.app/reset-password',
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
})); 