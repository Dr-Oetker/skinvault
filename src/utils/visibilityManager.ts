import { isSessionValid, refreshSession } from './sessionManager';

// Handle visibility change (when user returns to the app)
export const initializeVisibilityManager = () => {
  const handleVisibilityChange = async () => {
    if (!document.hidden) {
      // Skip session checks on reset password page
      if (window.location.pathname === '/reset-password') {
        console.log('Skipping session check on reset password page (visibility change)');
        return;
      }
      
      // User has returned to the app
      console.log('App became visible, checking session...');
      
      try {
        // Check if session is still valid
        const isValid = await isSessionValid();
        
        if (!isValid) {
          console.log('Session invalid, attempting refresh...');
          const refreshed = await refreshSession();
          
          if (!refreshed) {
            console.log('Session refresh failed, user may need to log in again');
            // You could redirect to login here if needed
            // window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Error checking session on visibility change:', error);
      }
    }
  };

  // Add event listener
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Handle page focus (alternative to visibility change)
export const initializeFocusManager = () => {
  const handleFocus = async () => {
    // Skip session checks on reset password page
    if (window.location.pathname === '/reset-password') {
      console.log('Skipping session check on reset password page (focus)');
      return;
    }
    
    console.log('Window focused, checking session...');
    
    try {
      const isValid = await isSessionValid();
      
      if (!isValid) {
        console.log('Session invalid on focus, attempting refresh...');
        const refreshed = await refreshSession();
        
        if (!refreshed) {
          console.log('Session refresh failed on focus');
        }
      }
    } catch (error) {
      console.error('Error checking session on focus:', error);
    }
  };

  // Add event listener
  window.addEventListener('focus', handleFocus);

  // Return cleanup function
  return () => {
    window.removeEventListener('focus', handleFocus);
  };
}; 