import { supabase } from '../supabaseClient';

// Clear all Supabase-related data from localStorage
export const clearSupabaseSession = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Find Supabase-related keys
    const supabaseKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('sb-') ||
      key.includes('auth')
    );
    
    console.log('Found Supabase keys to clear:', supabaseKeys);
    
    // Clear each Supabase key
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('Cleared:', key);
    });
    
    // Also clear any session cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      if (name.includes('supabase') || name.includes('auth')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        console.log('Cleared cookie:', name);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing Supabase session:', error);
    return false;
  }
};

// Force sign out and clear all data
export const forceSignOut = async () => {
  try {
    console.log('Force signing out...');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear localStorage
    clearSupabaseSession();
    
    // Reload the page to reset all state
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error during force sign out:', error);
    return false;
  }
};

// Check if session is corrupted
export const isSessionCorrupted = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('Session error detected:', error);
      return true;
    }
    
    if (!data.user) {
      console.log('No user found in session');
      return false; // Not corrupted, just no session
    }
    
    // Try to make a simple API call to test the session
    const { error: apiError } = await supabase.from('categories').select('count').limit(1);
    
    if (apiError && apiError.message.includes('JWT')) {
      console.log('JWT error detected, session is corrupted');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking session corruption:', error);
    return true;
  }
};

// Auto-fix corrupted sessions
export const autoFixSession = async () => {
  const isCorrupted = await isSessionCorrupted();
  
  if (isCorrupted) {
    console.log('Corrupted session detected, clearing...');
    clearSupabaseSession();
    return true;
  }
  
  return false;
}; 