import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Email service configuration
interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'nodemailer' | 'aws-ses' | 'mailgun' | 'brevo' | 'ethereal';
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  region?: string;
  domain?: string;
}

// Get email configuration from environment variables
const getDefaultEmailConfig = (): EmailConfig => {
  return {
    provider: (process.env.EMAIL_PROVIDER as any) || 'resend',
    apiKey: process.env.EMAIL_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@skinvault.app',
    fromName: process.env.EMAIL_FROM_NAME || 'SkinVault',
    region: process.env.EMAIL_REGION,
    domain: process.env.EMAIL_DOMAIN
  };
};

// Simple email service for the API
class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendPasswordResetEmail(email: string, resetUrl: string, userName?: string): Promise<boolean> {
    const subject = 'Reset Your SkinVault Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>You requested a password reset for your SkinVault account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The SkinVault Team</p>
      </div>
    `;
    const text = `
      Reset Your Password
      
      Hello ${userName || 'there'},
      
      You requested a password reset for your SkinVault account.
      
      Click this link to reset your password: ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this reset, please ignore this email.
      
      Best regards,
      The SkinVault Team
    `;

    return this.sendEmail(email, subject, html, text);
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (this.config.provider === 'resend') {
      return this.sendWithResend(to, subject, html, text);
    }
    
    console.error('Unsupported email provider:', this.config.provider);
    return false;
  }

  private async sendWithResend(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error('Resend API key is missing');
      return false;
    }

    try {
      const emailPayload = {
        from: this.config.fromEmail,
        to: [to],
        subject: subject,
        html: html,
        text: text
      };

      console.log('Sending email to Resend:', {
        from: emailPayload.from,
        to: emailPayload.to,
        subject: emailPayload.subject
      });

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Resend API error:', response.status, errorData);
        return false;
      }

      const result = await response.json();
      console.log('Resend email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Resend request error:', error);
      return false;
    }
  }
}

const createEmailService = (config: EmailConfig) => new EmailService(config);

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
  try {
    // Enable CORS for all origins
    const allowedOrigins = [
      'https://skinvault.app',
      'https://www.skinvault.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, email, token, newPassword } = req.body;
    
    console.log('Password reset request:', { action, email: email ? '***' : undefined });

      try {
      switch (action) {
        case 'request':
          return await handlePasswordResetRequest(email, res, req);
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
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePasswordResetRequest(email: string, res: VercelResponse, req: VercelRequest) {
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

    // Send email with reset link - use the same domain as the request
    const requestOrigin = req.headers.origin || req.headers.host;
    const baseUrl = requestOrigin ? `https://${requestOrigin.replace(/^https?:\/\//, '')}` : (process.env.VITE_APP_URL || 'https://skinvault.app');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    // Initialize email service
    const emailConfig = getDefaultEmailConfig();
    console.log('Email config:', {
      provider: emailConfig.provider,
      fromEmail: emailConfig.fromEmail,
      apiKey: emailConfig.apiKey ? '***' : 'MISSING'
    });
    
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