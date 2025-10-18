import { supabase } from '../supabaseClient';
import { useAuth } from '../store/auth';

// Session manager to handle auth state changes
export const initializeSessionManager = () => {
  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Use the proper Zustand setter instead of direct mutation
      const authStore = useAuth.getState();
      
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            // Use proper state update
            useAuth.setState({ user: session.user, loading: false });
            // Start manual token refresh
            startManualTokenRefresh();
            // Fetch user's favorites after successful login
            try {
              const { useFavorites } = await import('../store/favorites');
              const favoritesStore = useFavorites.getState();
              await favoritesStore.fetchFavorites(session.user.id);
            } catch (error) {
              console.error('Error fetching favorites after sign in:', error);
            }
          }
          break;
          
        case 'SIGNED_OUT':
          useAuth.setState({ user: null, loading: false });
          // Stop manual token refresh
          stopManualTokenRefresh();
          // Clear favorites when user signs out
          try {
            const { useFavorites } = await import('../store/favorites');
            const favoritesStore = useFavorites.getState();
            favoritesStore.clearFavorites();
          } catch (error) {
            console.error('Error clearing favorites after sign out:', error);
          }
          break;
          
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            useAuth.setState({ user: session.user, loading: false });
            console.log('Token refreshed successfully');
          }
          break;
          
        case 'USER_UPDATED':
          if (session?.user) {
            useAuth.setState({ user: session.user, loading: false });
          }
          break;
          
        case 'INITIAL_SESSION':
          // Handle initial session state
          if (session?.user) {
            useAuth.setState({ user: session.user, loading: false });
            // Fetch user's favorites on initial session
            try {
              const { useFavorites } = await import('../store/favorites');
              const favoritesStore = useFavorites.getState();
              await favoritesStore.fetchFavorites(session.user.id);
            } catch (error) {
              console.error('Error fetching favorites on initial session:', error);
            }
          } else {
            useAuth.setState({ user: null, loading: false });
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
    if (error) {
      console.log('Session validation returned error:', error.message);
      // Only return false for actual auth errors, not network errors
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.log('Network error during session validation, assuming valid');
        return true; // Assume valid on network errors
      }
      return !data.user;
    }
    return !!data.user;
  } catch (error) {
    console.error('Session validation error:', error);
    // Assume valid on errors to prevent unnecessary logouts
    return true;
  }
};

// Refresh session if needed
export const refreshSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.log('Session refresh returned error:', error.message);
      // Only return false for actual auth errors, not network errors
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        console.log('Network error during session refresh, assuming valid');
        return true; // Assume valid on network errors
      }
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    // Assume valid on errors to prevent unnecessary logouts
    return true;
  }
};

// Initialize app session on startup
export const initializeAppSession = async (): Promise<void> => {
  try {
    console.log('Initializing app session...');
    
    // Check if we have a stored session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting initial session:', error);
      return;
    }
    
    if (session?.user) {
      console.log('Found existing session for user:', session.user.id);
      // Update auth state with existing session
      useAuth.setState({ user: session.user, loading: false });
      
      // Fetch user's favorites
      try {
        const { useFavorites } = await import('../store/favorites');
        const favoritesStore = useFavorites.getState();
        await favoritesStore.fetchFavorites(session.user.id);
      } catch (error) {
        console.error('Error fetching favorites on app init:', error);
      }
      
      // Start manual token refresh timer (since autoRefreshToken is disabled)
      startManualTokenRefresh();
    } else {
      console.log('No existing session found');
      useAuth.setState({ user: null, loading: false });
    }
  } catch (error) {
    console.error('Failed to initialize app session:', error);
    useAuth.setState({ user: null, loading: false });
  }
};

// Manual token refresh to replace auto-refresh
let refreshIntervalId: NodeJS.Timeout | null = null;

export const startManualTokenRefresh = (): void => {
  // Clear any existing interval
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  
  console.log('✅ Manual token refresh enabled (auto-refresh disabled to prevent lock loops)');
  
  // Refresh token every 50 minutes (tokens expire after 60 minutes)
  refreshIntervalId = setInterval(async () => {
    console.log('🔄 Manual token refresh triggered (keeping session alive)');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ Manual token refresh failed:', error);
        // Clear interval and sign out user
        stopManualTokenRefresh();
        useAuth.setState({ user: null, loading: false });
      } else if (data.session?.user) {
        console.log('✅ Manual token refresh successful - session extended');
        useAuth.setState({ user: data.session.user, loading: false });
      }
    } catch (error) {
      console.error('❌ Manual token refresh error:', error);
      stopManualTokenRefresh();
      useAuth.setState({ user: null, loading: false });
    }
  }, 50 * 60 * 1000); // 50 minutes
};

export const stopManualTokenRefresh = (): void => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
};

// Force session recovery (useful when app gets stuck)
export const forceSessionRecovery = async (): Promise<boolean> => {
  try {
    console.log('Forcing session recovery...');
    
    // Clear any existing session locks by signing out first
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.log('Sign out during recovery failed (expected):', signOutError);
    }
    
    // Clear all auth-related data
    clearAllAuthData();
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to get any existing session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session during recovery:', error);
      useAuth.setState({ user: null, loading: false });
      return false;
    }
    
    if (session?.user) {
      console.log('Session recovery successful');
      useAuth.setState({ user: session.user, loading: false });
      
      // Fetch user's favorites
      try {
        const { useFavorites } = await import('../store/favorites');
        const favoritesStore = useFavorites.getState();
        await favoritesStore.fetchFavorites(session.user.id);
      } catch (error) {
        console.error('Error fetching favorites during recovery:', error);
      }
      
      return true;
    } else {
      console.log('No valid session found during recovery');
      useAuth.setState({ user: null, loading: false });
      return false;
    }
  } catch (error) {
    console.error('Session recovery error:', error);
    useAuth.setState({ user: null, loading: false });
    return false;
  }
};

// Clear all auth-related data
export const clearAllAuthData = (): void => {
  console.log('Clearing all auth data...');
  
  // Clear localStorage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear auth-related cookies
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.includes('auth') || name.includes('session') || name.includes('token')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  console.log('Auth data cleared');
}; 