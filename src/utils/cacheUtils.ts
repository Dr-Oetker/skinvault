// Clear all app-related cache and storage
export const clearAllAppData = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('localStorage cleared');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('sessionStorage cleared');
    
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    console.log('Cookies cleared');
    
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
};

// Check if browser supports required features
export const checkBrowserSupport = () => {
  const issues: string[] = [];
  
  // Check localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (error) {
    issues.push('localStorage not supported');
  }
  
  // Check sessionStorage
  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
  } catch (error) {
    issues.push('sessionStorage not supported');
  }
  
  // Check fetch
  if (!window.fetch) {
    issues.push('fetch not supported');
  }
  
  return {
    supported: issues.length === 0,
    issues
  };
};

// Get browser information
export const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    platform: navigator.platform,
    vendor: navigator.vendor
  };
};

// Create a troubleshooting guide for users
export const createTroubleshootingSteps = () => {
  return [
    '1. Clear your browser cache and cookies',
    '2. Try opening the site in an incognito/private window',
    '3. Disable browser extensions temporarily',
    '4. Try a different browser',
    '5. Check your internet connection',
    '6. If the issue persists, contact support'
  ];
}; 