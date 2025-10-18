import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// SINGLE global instance - never recreate, just reset connections
let supabaseInstance: SupabaseClient | null = null;

// Create the Supabase client ONCE
function createSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    console.log('⚠️ Supabase client already exists, returning existing instance');
    return supabaseInstance;
  }

  console.log('✅ Creating Supabase client (first time)');
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true,
      flowType: 'implicit',
      debug: false,
      storage: localStorage,
      storageKey: 'skinvault-auth-token'
    },
    global: {
      headers: {
        'X-Client-Info': 'skinvault-web'
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
}

// Get the single Supabase client instance
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Don't recreate - instead just return the existing client
export function recreateSupabaseClient(): SupabaseClient {
  console.log('ℹ️ Client recreation requested, but using existing instance to avoid conflicts');
  return getSupabase();
}

// Wrap operations with retry logic WITHOUT recreating client
export async function withSupabaseRetry<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: any;
  const client = getSupabase();
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await operation(client);
      return result;
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // If it's a network/timeout error and we have retries left, continue
      if (attempt < maxRetries && (
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('aborted')
      )) {
        continue;
      }
      
      // Otherwise, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

// Dummy functions for compatibility
export function recordActivity() {
  // No-op - not needed with single instance
}

export function isClientStale(): boolean {
  return false; // Never stale with single instance
}
