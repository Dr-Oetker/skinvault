// Debug helper for troubleshooting session issues
export const debugSessionState = () => {
  console.log('=== SESSION DEBUG INFO ===');
  
  // Check localStorage for Supabase session
  const supabaseSession = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
  console.log('Supabase session in localStorage:', supabaseSession ? 'Present' : 'Missing');
  
  // Check for any auth-related cookies
  const cookies = document.cookie.split(';').filter(cookie => 
    cookie.includes('auth') || cookie.includes('session') || cookie.includes('token')
  );
  console.log('Auth-related cookies:', cookies);
  
  // Check network connectivity
  navigator.onLine ? console.log('Network: Online') : console.log('Network: Offline');
  
  // Check if user agent suggests mobile/specific browser issues
  console.log('User Agent:', navigator.userAgent);
  
  console.log('========================');
};

// Function to clear all auth-related data (useful for troubleshooting)
export const clearAuthData = () => {
  console.log('Clearing all auth-related data...');
  
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
  
  console.log('Auth data cleared. Please refresh the page.');
};

// Make debug functions available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).debugSession = debugSessionState;
  (window as any).clearAuth = clearAuthData;
  console.log('Debug helpers available: window.debugSession() and window.clearAuth()');
}
