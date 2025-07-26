import { supabase } from '../supabaseClient';
import crypto from 'crypto';

// Interface for password reset tokens
interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

// Generate a secure random token
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Create a password reset token in the database
export const createPasswordResetToken = async (email: string): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // First, get the user by email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    // Generate a secure token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the token in the database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userData.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (tokenError) {
      console.error('Error creating reset token:', tokenError);
      return { success: false, error: 'Failed to create reset token' };
    }

    return { success: true, token };
  } catch (error) {
    console.error('Error in createPasswordResetToken:', error);
    return { success: false, error: 'Internal server error' };
  }
};

// Validate a password reset token
export const validateResetToken = async (token: string): Promise<{ valid: boolean; userId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    // Check if token has expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, userId: data.user_id };
  } catch (error) {
    console.error('Error validating reset token:', error);
    return { valid: false, error: 'Internal server error' };
  }
};

// Mark a token as used
export const markTokenAsUsed = async (token: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    return !error;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
};

// Reset password using a valid token
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate the token
    const validation = await validateResetToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Update the user's password using Supabase admin API
    // Note: This requires admin privileges or a serverless function
    const { error } = await supabase.auth.admin.updateUserById(
      validation.userId!,
      { password: newPassword }
    );

    if (error) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Failed to update password' };
    }

    // Mark the token as used
    await markTokenAsUsed(token);

    return { success: true };
  } catch (error) {
    console.error('Error in resetPasswordWithToken:', error);
    return { success: false, error: 'Internal server error' };
  }
};

// Clean up expired tokens (can be run periodically)
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('password_reset_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  } catch (error) {
    console.error('Error in cleanupExpiredTokens:', error);
  }
}; 