import { useNavigate } from 'react-router-dom';

// Error types
export const ErrorType = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  ACCESS_DENIED: '403',
  NETWORK_ERROR: 'NETWORK',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
}

// Navigate to error page
export const navigateToError = (navigate: ReturnType<typeof useNavigate>, errorType: ErrorType, message?: string) => {
  const errorPath = `/${errorType}`;
  navigate(errorPath, { 
    state: { 
      error: {
        type: errorType,
        message: message || 'An error occurred',
        timestamp: new Date()
      }
    }
  });
};

// Handle API errors
export const handleApiError = (error: any, navigate: ReturnType<typeof useNavigate>) => {
  console.error('API Error:', error);
  
  if (error?.status === 404) {
    navigateToError(navigate, ErrorType.NOT_FOUND, 'The requested resource was not found');
  } else if (error?.status === 403) {
    navigateToError(navigate, ErrorType.ACCESS_DENIED, 'You do not have permission to access this resource');
  } else if (error?.status >= 500) {
    navigateToError(navigate, ErrorType.SERVER_ERROR, 'A server error occurred. Please try again later');
  } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    navigateToError(navigate, ErrorType.NETWORK_ERROR, 'Network error. Please check your connection');
  } else {
    navigateToError(navigate, ErrorType.UNKNOWN, 'An unexpected error occurred');
  }
};

// Log error for analytics/monitoring
export const logError = (error: AppError) => {
  // You can integrate with error reporting services here
  // Example: Sentry, LogRocket, etc.
  console.error('Application Error:', {
    type: error.type,
    message: error.message,
    details: error.details,
    timestamp: error.timestamp,
    url: window.location.href,
    userAgent: navigator.userAgent
  });
};

// Create error object
export const createError = (type: ErrorType, message: string, details?: string): AppError => ({
  type,
  message,
  details,
  timestamp: new Date()
}); 