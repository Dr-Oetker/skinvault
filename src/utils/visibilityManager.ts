import { isSessionValid, refreshSession, clearAllAuthData } from './sessionManager';
import { useAuth } from '../store/auth';

// Debounce timer to prevent multiple rapid calls
let visibilityDebounceTimer: NodeJS.Timeout | null = null;
let focusDebounceTimer: NodeJS.Timeout | null = null;

// Track when tab was hidden
let tabHiddenTime: number = 0;
const RELOAD_THRESHOLD = 30000; // 30 seconds

// Handle visibility change (when user returns to the app)
export const initializeVisibilityManager = () => {
  const handleVisibilityChange = async () => {
    if (document.hidden) {
      // Tab is being hidden - record the time
      tabHiddenTime = Date.now();
      console.log('⏸️ Tab hidden at', new Date(tabHiddenTime).toLocaleTimeString());
    } else {
      // Tab is visible again - check if we should reload
      if (tabHiddenTime > 0) {
        const timeHidden = Date.now() - tabHiddenTime;
        console.log('👁️ Tab visible again after', Math.round(timeHidden / 1000), 'seconds');
        
        if (timeHidden > RELOAD_THRESHOLD) {
          console.log('🔄 Tab was hidden for >30s, reloading page to prevent Supabase client corruption...');
          window.location.reload();
          return;
        }
      }
      
      // Clear any existing timer
      if (visibilityDebounceTimer) {
        clearTimeout(visibilityDebounceTimer);
      }
      
      // Debounce the visibility check to prevent lock acquisition loops
      visibilityDebounceTimer = setTimeout(async () => {
        console.log('App became visible, checking session...');
        
        // First check if we already have a user in state
        const authStore = useAuth.getState();
        if (authStore.user) {
          console.log('User already authenticated, skipping session check');
          return;
        }
        
        try {
          // Check if session is still valid with longer timeout
          const isValid = await Promise.race([
            isSessionValid(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 30000)) // 30 second timeout, default to valid
          ]);
          
          if (!isValid) {
            console.log('Session appears invalid, attempting refresh...');
            const refreshed = await Promise.race([
              refreshSession(),
              new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 30000)) // 30 second timeout, default to success
            ]);
            
            if (refreshed) {
              console.log('Session refreshed successfully');
              // Force a session check to update the auth state
              await authStore.checkSession();
            }
          } else {
            // Session is valid, but ensure auth state is synced
            if (!authStore.user) {
              console.log('Session valid but auth state missing, syncing...');
              await authStore.checkSession();
            }
          }
        } catch (error) {
          console.error('Error checking session on visibility change:', error);
          // Don't clear auth on error - could be temporary network issue
        }
      }, 2000); // 2 second debounce
    }
  };

  // Add event listener
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (visibilityDebounceTimer) {
      clearTimeout(visibilityDebounceTimer);
    }
  };
};

// Handle page focus (alternative to visibility change)
export const initializeFocusManager = () => {
  const handleFocus = async () => {
    // Clear any existing timer
    if (focusDebounceTimer) {
      clearTimeout(focusDebounceTimer);
    }
    
    // Debounce the focus check to prevent lock acquisition loops
    focusDebounceTimer = setTimeout(async () => {
      console.log('Window focused, checking session...');
      
      // First check if we already have a user in state
      const authStore = useAuth.getState();
      if (authStore.user) {
        console.log('User already authenticated, skipping session check');
        return;
      }
      
      try {
        // Check if session is still valid with longer timeout
        const isValid = await Promise.race([
          isSessionValid(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 30000)) // 30 second timeout, default to valid
        ]);
        
        if (!isValid) {
          console.log('Session appears invalid on focus, attempting refresh...');
          const refreshed = await Promise.race([
            refreshSession(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 30000)) // 30 second timeout, default to success
          ]);
          
          if (refreshed) {
            console.log('Session refreshed on focus');
            // Force a session check to update the auth state
            await authStore.checkSession();
          }
        } else {
          // Session is valid, but ensure auth state is synced
          if (!authStore.user) {
            console.log('Session valid but auth state missing on focus, syncing...');
            await authStore.checkSession();
          }
        }
      } catch (error) {
        console.error('Error checking session on focus:', error);
        // Don't clear auth on error - could be temporary network issue
      }
    }, 2000); // 2 second debounce
  };

  // Add event listener
  window.addEventListener('focus', handleFocus);

  // Return cleanup function
  return () => {
    window.removeEventListener('focus', handleFocus);
    if (focusDebounceTimer) {
      clearTimeout(focusDebounceTimer);
    }
  };
}; 