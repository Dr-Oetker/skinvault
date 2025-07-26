// Password reset service for client-side operations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://skinvault.app/api';

export interface PasswordResetRequest {
  action: 'request' | 'reset' | 'validate';
  email?: string;
  token?: string;
  newPassword?: string;
}

export interface PasswordResetResponse {
  success?: boolean;
  valid?: boolean;
  message?: string;
  error?: string;
  resetUrl?: string;
  userId?: string;
}

export class PasswordResetService {
  private static async makeRequest(data: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
        };
      }

      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Request a password reset
  static async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    return this.makeRequest({
      action: 'request',
      email,
    });
  }

  // Validate a reset token
  static async validateToken(token: string): Promise<PasswordResetResponse> {
    return this.makeRequest({
      action: 'validate',
      token,
    });
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    return this.makeRequest({
      action: 'reset',
      token,
      newPassword,
    });
  }
}

// Utility function to get token from URL
export const getTokenFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

// Utility function to validate password strength
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}; 