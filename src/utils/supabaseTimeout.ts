import { PostgrestBuilder } from '@supabase/postgrest-js';

/**
 * Wraps a Supabase query with a timeout to prevent hanging requests
 * @param queryBuilder - The Supabase query builder
 * @param timeoutMs - Timeout in milliseconds (default: 15000ms / 15 seconds)
 * @returns Promise that resolves with the query result or rejects on timeout
 */
export async function withTimeout<Result = any>(
  queryBuilder: PostgrestBuilder<any, Result, false>,
  timeoutMs: number = 15000
): Promise<{ data: Result | null; error: any }> {
  const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Supabase request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      queryBuilder,
      timeoutPromise
    ]);
    return result as { data: Result | null; error: any };
  } catch (error: any) {
    console.error('Supabase query error or timeout:', error);
    return {
      data: null,
      error: error.message || 'Request failed or timed out'
    };
  }
}

/**
 * Wraps any async Supabase operation with a timeout and cancellation
 * @param operation - The async operation to execute
 * @param timeoutMs - Timeout in milliseconds (default: 10000ms / 10 seconds)
 * @returns Promise that resolves with the operation result or rejects on timeout
 */
export async function withOperationTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      console.warn(`⚠️ Operation timed out after ${timeoutMs}ms - forcing rejection`);
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      operation(),
      timeoutPromise
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error('❌ Operation error or timeout:', error);
    
    // Force a page reload if we're completely stuck
    if (error.message?.includes('timed out')) {
      console.error('💥 Detected timeout - operation may be hanging');
      // Don't reload automatically, just throw the error
    }
    
    throw error;
  }
}

/**
 * Emergency timeout for critical operations
 * Forces page reload if operation doesn't complete
 */
export async function withCriticalTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  let completed = false;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      if (!completed) {
        console.error('🚨 CRITICAL: Operation hung, forcing page reload in 2 seconds...');
        setTimeout(() => {
          if (!completed) {
            window.location.reload();
          }
        }, 2000);
      }
      reject(new Error(`Critical operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      operation(),
      timeoutPromise
    ]);
    completed = true;
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error: any) {
    completed = true;
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
}