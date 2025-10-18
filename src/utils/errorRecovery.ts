import { supabase } from '../supabaseClient';
import { useAuth } from '../store/auth';
import { forceSessionRecovery } from './sessionManager';

// Global error recovery manager
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private recoveryAttempts = 0;
  private maxRecoveryAttempts = 3;
  private recoveryCooldown = 5000; // 5 seconds
  private lockDetectionTimer: NodeJS.Timeout | null = null;
  private lastLockTime = 0;

  private constructor() {}

  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  // Detect if Supabase is stuck in lock acquisition loop
  public detectLockLoop(): boolean {
    const now = Date.now();
    const timeSinceLastLock = now - this.lastLockTime;
    
    // If locks are happening too frequently, we're probably stuck
    if (timeSinceLastLock < 100) { // Less than 100ms between locks
      console.warn('Supabase lock acquisition loop detected');
      return true;
    }
    
    this.lastLockTime = now;
    return false;
  }

  // Emergency recovery for lock loops
  public emergencyRecovery(): void {
    console.log('Emergency recovery triggered - clearing all auth data');
    
    // Clear all auth-related data immediately
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
        localStorage.removeItem(key);
      }
    });
    
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.includes('auth') || name.includes('session') || name.includes('token')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Force page reload
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Handle Supabase errors and attempt recovery
  public async handleSupabaseError(error: any): Promise<boolean> {
    console.error('Supabase error detected:', error);

    // Check if it's a session-related error
    if (this.isSessionError(error)) {
      console.log('Session error detected, attempting recovery...');
      return await this.attemptSessionRecovery();
    }

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      console.log('Network error detected, attempting recovery...');
      return await this.attemptNetworkRecovery();
    }

    return false;
  }

  // Check if error is session-related
  private isSessionError(error: any): boolean {
    if (!error) return false;
    
    const sessionErrorMessages = [
      'invalid_grant',
      'refresh_token_not_found',
      'token_expired',
      'invalid_token',
      'unauthorized',
      'authentication'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return sessionErrorMessages.some(msg => 
      errorMessage.includes(msg) || errorCode.includes(msg)
    );
  }

  // Check if error is network-related
  private isNetworkError(error: any): boolean {
    if (!error) return false;

    const networkErrorMessages = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'aborted',
      'offline'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return networkErrorMessages.some(msg => 
      errorMessage.includes(msg) || errorCode.includes(msg)
    );
  }

  // Attempt session recovery
  private async attemptSessionRecovery(): Promise<boolean> {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.log('Max recovery attempts reached');
      return false;
    }

    this.recoveryAttempts++;

    try {
      const recovered = await forceSessionRecovery();
      
      if (recovered) {
        console.log('Session recovery successful');
        this.recoveryAttempts = 0; // Reset on success
        return true;
      } else {
        console.log('Session recovery failed');
        // Wait before next attempt
        await this.waitForCooldown();
        return false;
      }
    } catch (error) {
      console.error('Session recovery error:', error);
      await this.waitForCooldown();
      return false;
    }
  }

  // Attempt network recovery
  private async attemptNetworkRecovery(): Promise<boolean> {
    try {
      // Simple network connectivity check
      const response = await fetch(supabase.supabaseUrl + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': supabase.supabaseKey,
        },
      });

      if (response.ok) {
        console.log('Network recovery successful');
        this.recoveryAttempts = 0; // Reset on success
        return true;
      }
    } catch (error) {
      console.error('Network recovery failed:', error);
    }

    return false;
  }

  // Wait for cooldown period
  private async waitForCooldown(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, this.recoveryCooldown);
    });
  }

  // Reset recovery attempts (call when user manually logs in)
  public resetRecoveryAttempts(): void {
    this.recoveryAttempts = 0;
  }

  // Get current recovery status
  public getRecoveryStatus(): { attempts: number; maxAttempts: number; canRetry: boolean } {
    return {
      attempts: this.recoveryAttempts,
      maxAttempts: this.maxRecoveryAttempts,
      canRetry: this.recoveryAttempts < this.maxRecoveryAttempts
    };
  }
}

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  const recoveryManager = ErrorRecoveryManager.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's a Supabase error
    if (event.reason && typeof event.reason === 'object') {
      const recovered = await recoveryManager.handleSupabaseError(event.reason);
      if (recovered) {
        console.log('Error recovered, preventing default behavior');
        event.preventDefault();
      }
    }
  });

  // Handle general errors
  window.addEventListener('error', async (event) => {
    console.error('Global error:', event.error);
    
    if (event.error && typeof event.error === 'object') {
      await recoveryManager.handleSupabaseError(event.error);
    }
  });

  // Monitor console for Supabase lock messages
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    
    // Check for Supabase lock acquisition messages
    if (message.includes('#_acquireLock')) {
      if (recoveryManager.detectLockLoop()) {
        console.warn('Lock loop detected, triggering emergency recovery');
        recoveryManager.emergencyRecovery();
      }
    }
    
    originalConsoleLog.apply(console, args);
  };
};

// Utility function to wrap Supabase calls with error recovery
export const withErrorRecovery = async <T>(
  supabaseCall: () => Promise<T>,
  fallback?: () => T
): Promise<T> => {
  const recoveryManager = ErrorRecoveryManager.getInstance();

  try {
    return await supabaseCall();
  } catch (error) {
    console.error('Supabase call failed:', error);
    
    const recovered = await recoveryManager.handleSupabaseError(error);
    
    if (recovered) {
      // Retry the call once after recovery
      try {
        return await supabaseCall();
      } catch (retryError) {
        console.error('Supabase call failed on retry:', retryError);
        if (fallback) {
          return fallback();
        }
        throw retryError;
      }
    } else {
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
};
