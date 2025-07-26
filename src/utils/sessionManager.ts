import { supabase } from '../supabaseClient';
import { useAuth } from '../store/auth';

// Session manager to handle auth state changes
export const initializeSessionManager = () => {
  const authStore = useAuth.getState();

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            authStore.user = session.user;
            // Fetch user's favorites after successful login
            const { useFavorites } = await import('../store/favorites');
            const favoritesStore = useFavorites.getState();
            await favoritesStore.fetchFavorites(session.user.id);
          }
          break;
          
        case 'SIGNED_OUT':
          authStore.user = null;
          // Clear favorites when user signs out
          const { useFavorites } = await import('../store/favorites');
          const favoritesStore = useFavorites.getState();
          favoritesStore.clearFavorites();
          break;
          
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            authStore.user = session.user;
          }
          break;
          
        case 'USER_UPDATED':
          if (session?.user) {
            authStore.user = session.user;
          }
          break;
      }
    }
  );

  // Return cleanup function
  return () => {
    subscription?.unsubscribe();
  };
};

// Check if session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return !error && !!data.user;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Refresh session if needed
export const refreshSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return false;
  }
}; 