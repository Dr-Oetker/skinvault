import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Custom storage implementation that uses ONLY localStorage (no IndexedDB)
class LocalStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('LocalStorage getItem error:', e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('LocalStorage setItem error:', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('LocalStorage removeItem error:', e);
    }
  }
}

// Single global Supabase client - created once, used everywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false, // Manual refresh to prevent lock loops
    detectSessionInUrl: true,
    flowType: 'implicit',
    debug: false,
    storage: new LocalStorageAdapter(), // Use custom localStorage-only adapter
    storageKey: 'skinvault-auth-token'
  },
  global: {
    headers: {
      'X-Client-Info': 'skinvault-web'
    },
    fetch: (url, options = {}) => {
      // Aggressive timeout to prevent hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Request timeout, aborting:', url);
        controller.abort();
      }, 8000); // 8 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  db: {
    schema: 'public'
  }
}); 