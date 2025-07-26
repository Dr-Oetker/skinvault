const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate a secure random token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Simple email sending function
const sendEmail = async (to, subject, html, text) => {
  const apiKey = process.env.EMAIL_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  if (!apiKey) {
    console.error('Missing EMAIL_API_KEY');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
        text: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend API error:', response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = async function handler(req, res) {
  try {
    console.log('API handler started');
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, email, token, newPassword } = req.body;
    
    console.log('Password reset request:', { action, email: email ? '***' : undefined });

    if (action === 'request') {
      // Handle password reset request
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists using Supabase auth API
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error listing users:', userError);
        return res.status(500).json({ error: 'Failed to check user' });
      }

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate token and send email
      const resetToken = generateResetToken();
      const resetUrl = `https://www.skinvault.app/reset-password?token=${resetToken}`;
      
      const emailSent = await sendEmail(
        email,
        'Reset Your SkinVault Password',
        `<div>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></div>`,
        `Reset your password: ${resetUrl}`
      );

      if (emailSent) {
        return res.status(200).json({ 
          success: true, 
          message: 'Password reset email sent successfully'
        });
      } else {
        return res.status(500).json({ error: 'Failed to send email' });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 