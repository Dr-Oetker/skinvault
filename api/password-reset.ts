import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { createEmailService, getDefaultEmailConfig } from '../src/services/emailService';

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate a secure random token
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, token, newPassword } = req.body;

  try {
    switch (action) {
      case 'request':
        return await handlePasswordResetRequest(email, res);
      case 'reset':
        return await handlePasswordReset(token, newPassword, res);
      case 'validate':
        return await handleTokenValidation(token, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePasswordResetRequest(email: string, res: VercelResponse) {
  try {
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
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
      return res.status(500).json({ error: 'Failed to create reset token' });
    }

    // Send email with reset link
    const resetUrl = `${process.env.VITE_APP_URL || 'https://skinvault.app'}/reset-password?token=${token}`;
    
    // Initialize email service
    const emailConfig = getDefaultEmailConfig();
    const emailService = createEmailService(emailConfig);
    
    // Get user's name if available
    const userName = userData.email?.split('@')[0]; // Simple fallback
    
    // Send the email
    const emailSent = await emailService.sendPasswordResetEmail(
      userData.email,
      resetUrl,
      userName
    );
    
    if (!emailSent) {
      console.error('Failed to send password reset email');
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Error in handlePasswordResetRequest:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleTokenValidation(token: string, res: VercelResponse) {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
    }

    // Check if token has expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return res.status(400).json({ valid: false, error: 'Token has expired' });
    }

    return res.status(200).json({ valid: true, userId: data.user_id });
  } catch (error) {
    console.error('Error in handleTokenValidation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePasswordReset(token: string, newPassword: string, res: VercelResponse) {
  try {
    // Validate the token
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check if token has expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    // Mark the token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in handlePasswordReset:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 