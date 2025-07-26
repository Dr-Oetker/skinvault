// Email service for sending password reset emails
interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'nodemailer' | 'aws-ses' | 'mailgun' | 'brevo' | 'ethereal';
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  templateId?: string; // For SendGrid templates
  mailgunDomain?: string; // For Mailgun
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Send password reset email
  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string): Promise<boolean> {
    try {
      const subject = 'Reset Your SkinVault Password';
      const html = this.generatePasswordResetHTML(resetUrl, userName);
      const text = this.generatePasswordResetText(resetUrl, userName);

      const emailData: EmailData = {
        to,
        subject,
        html,
        text
      };

      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        case 'resend':
          return await this.sendWithResend(emailData);
        case 'nodemailer':
          return await this.sendWithNodemailer(emailData);
        case 'aws-ses':
          return await this.sendWithAwsSES(emailData);
        case 'mailgun':
          return await this.sendWithMailgun(emailData);
        case 'brevo':
          return await this.sendWithBrevo(emailData);
        case 'ethereal':
          return await this.sendWithEthereal(emailData);
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  // SendGrid implementation
  private async sendWithSendGrid(emailData: EmailData): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required');
    }

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.config.apiKey);

    const msg = {
      to: emailData.to,
      from: {
        email: this.config.fromEmail || 'noreply@skinvault.app',
        name: this.config.fromName || 'SkinVault'
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  // Resend implementation
  private async sendWithResend(emailData: EmailData): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key is required');
    }

    try {
      const emailPayload = {
        from: this.config.fromEmail || 'onboarding@resend.dev',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
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

  // Nodemailer implementation (for SMTP)
  private async sendWithNodemailer(emailData: EmailData): Promise<boolean> {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: this.config.fromEmail || 'noreply@skinvault.app',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });
      return true;
    } catch (error) {
      console.error('Nodemailer error:', error);
      return false;
    }
  }

  // AWS SES implementation
  private async sendWithAwsSES(emailData: EmailData): Promise<boolean> {
    const AWS = require('aws-sdk');
    
    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const params = {
      Source: this.config.fromEmail || 'noreply@skinvault.app',
      Destination: {
        ToAddresses: [emailData.to]
      },
      Message: {
        Subject: {
          Data: emailData.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: emailData.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: emailData.text || '',
            Charset: 'UTF-8'
          }
        }
      }
    };

    try {
      await ses.sendEmail(params).promise();
      return true;
    } catch (error) {
      console.error('AWS SES error:', error);
      return false;
    }
  }

  // Mailgun implementation
  private async sendWithMailgun(emailData: EmailData): Promise<boolean> {
    if (!this.config.apiKey || !this.config.mailgunDomain) {
      throw new Error('Mailgun API key and domain are required');
    }

    const formData = new URLSearchParams();
    formData.append('from', `${this.config.fromName || 'SkinVault'} <${this.config.fromEmail || 'noreply@skinvault.app'}>`);
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('html', emailData.html);
    if (emailData.text) {
      formData.append('text', emailData.text);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${this.config.mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    return response.ok;
  }

  // Brevo implementation
  private async sendWithBrevo(emailData: EmailData): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Brevo API key is required');
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey
      },
      body: JSON.stringify({
        sender: {
          name: this.config.fromName || 'SkinVault',
          email: this.config.fromEmail || 'noreply@skinvault.app'
        },
        to: [{ email: emailData.to }],
        subject: emailData.subject,
        htmlContent: emailData.html,
        textContent: emailData.text || ''
      })
    });

    return response.ok;
  }

  // Ethereal implementation (for development/testing)
  private async sendWithEthereal(emailData: EmailData): Promise<boolean> {
    const nodemailer = require('nodemailer');

    // Create test account
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    try {
      const info = await transporter.sendMail({
        from: this.config.fromEmail || 'noreply@skinvault.app',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });

      console.log('Ethereal Email Preview URL:', nodemailer.getTestMessageUrl(info));
      return true;
    } catch (error) {
      console.error('Ethereal error:', error);
      return false;
    }
  }

  // Generate HTML email template
  private generatePasswordResetHTML(resetUrl: string, userName?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 60px;
            height: 60px;
            margin-bottom: 20px;
        }
        .title {
            color: #1a1a1a;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555;
        }
        .button {
            display: inline-block;
            background-color: #6366f1;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #4f46e5;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 14px;
        }
        .link {
            color: #6366f1;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1 class="title">Reset Your Password</h1>
            <p class="subtitle">SkinVault Account Security</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hello${userName ? ` ${userName}` : ''},</p>
            
            <p class="message">
                We received a request to reset your password for your SkinVault account. 
                If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. 
                If you don't reset your password within this time, you'll need to request a new link.
            </div>
            
            <p class="message">
                If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #6366f1;">
                <a href="${resetUrl}" class="link">${resetUrl}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you because someone requested a password reset for your SkinVault account.</p>
            <p>If you didn't request this, please ignore this email or contact our support team.</p>
            <p>
                <a href="https://skinvault.app" class="link">SkinVault</a> | 
                <a href="https://skinvault.app/contact" class="link">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate plain text email
  private generatePasswordResetText(resetUrl: string, userName?: string): string {
    return `
Reset Your SkinVault Password

Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password for your SkinVault account. 
If you didn't make this request, you can safely ignore this email.

To reset your password, click the link below:

${resetUrl}

Important: This link will expire in 1 hour for security reasons. 
If you don't reset your password within this time, you'll need to request a new link.

If you didn't request this password reset, please ignore this email or contact our support team.

Best regards,
The SkinVault Team

---
SkinVault - https://skinvault.app
Support - https://skinvault.app/contact
    `;
  }
}

// Factory function to create email service
export const createEmailService = (config: EmailConfig): EmailService => {
  return new EmailService(config);
};

// Default email service configuration
export const getDefaultEmailConfig = (): EmailConfig => {
  const provider = (process.env.EMAIL_PROVIDER || 'resend') as EmailConfig['provider'];
  
  return {
    provider,
    apiKey: process.env.EMAIL_API_KEY,
    fromEmail: process.env.EMAIL_FROM || 'noreply@skinvault.app',
    fromName: process.env.EMAIL_FROM_NAME || 'SkinVault',
    templateId: process.env.SENDGRID_TEMPLATE_ID,
    mailgunDomain: process.env.MAILGUN_DOMAIN
  };
};

export default EmailService; 