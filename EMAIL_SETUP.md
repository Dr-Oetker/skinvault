# Email Setup Guide for Password Reset

This guide covers setting up email sending for the custom password reset functionality using various email providers.

## 🚀 Quick Start

### 1. Choose Your Email Provider

The system supports multiple email providers:

- **SendGrid** (Recommended) - Easy setup, great deliverability
- **Resend** - Modern API, good for developers
- **AWS SES** - Cost-effective for high volume
- **SMTP** (Nodemailer) - Any SMTP provider

### 2. Environment Variables

Add these to your Vercel environment variables:

```env
# Required for all providers
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_api_key_here
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault

# Optional
VITE_APP_URL=https://skinvault.app
```

## 📧 Email Provider Setup

### SendGrid (Recommended)

#### 1. Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com)
2. Sign up for a free account (100 emails/day)
3. Verify your domain or use a verified sender

#### 2. Get API Key
1. Go to Settings → API Keys
2. Create a new API Key with "Mail Send" permissions
3. Copy the API key

#### 3. Environment Variables
```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.your_sendgrid_api_key_here
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
```

#### 4. Domain Verification (Optional)
For better deliverability, verify your domain:
1. Go to Settings → Sender Authentication
2. Follow the domain verification process
3. Update `EMAIL_FROM` to use your verified domain

### Resend

#### 1. Create Resend Account
1. Go to [Resend](https://resend.com)
2. Sign up for a free account (3,000 emails/month)
3. Verify your domain

#### 2. Get API Key
1. Go to API Keys in your dashboard
2. Create a new API key
3. Copy the key

#### 3. Environment Variables
```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
```

### AWS SES

#### 1. AWS Setup
1. Create an AWS account
2. Go to SES (Simple Email Service)
3. Verify your email address or domain
4. Request production access if needed

#### 2. Create IAM User
1. Go to IAM → Users
2. Create a new user with SES permissions
3. Generate access keys

#### 3. Environment Variables
```env
EMAIL_PROVIDER=aws-ses
EMAIL_API_KEY=your_aws_access_key_id
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
```

### SMTP (Nodemailer)

#### 1. Choose SMTP Provider
Popular options:
- **Gmail** (requires app password)
- **Outlook/Hotmail**
- **Yahoo**
- **Custom SMTP server**

#### 2. Environment Variables
```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
```

#### 3. Gmail Setup Example
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password as `SMTP_PASS`

## 🔧 Configuration Examples

### SendGrid Configuration
```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
VITE_APP_URL=https://skinvault.app
```

### Resend Configuration
```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
VITE_APP_URL=https://skinvault.app
```

### AWS SES Configuration
```env
EMAIL_PROVIDER=aws-ses
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
VITE_APP_URL=https://skinvault.app
```

### Gmail SMTP Configuration
```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
VITE_APP_URL=https://skinvault.app
```

## 🧪 Testing

### 1. Development Testing
```bash
# Start development server
npm run dev

# Test password reset flow
# 1. Go to /login
# 2. Click "Forgot Password"
# 3. Enter your email
# 4. Check your email for reset link
```

### 2. Production Testing
1. Deploy to Vercel with environment variables
2. Test with real email addresses
3. Check email deliverability
4. Monitor email logs

### 3. Email Template Testing
The system includes:
- **HTML email** with responsive design
- **Plain text fallback**
- **Branded SkinVault styling**
- **Security warnings**
- **Mobile-friendly layout**

## 📊 Monitoring

### SendGrid Monitoring
1. Go to SendGrid Dashboard
2. Check Activity → Email Activity
3. Monitor bounce rates and delivery

### Resend Monitoring
1. Go to Resend Dashboard
2. Check Email Logs
3. Monitor delivery status

### AWS SES Monitoring
1. Go to AWS SES Console
2. Check Sending Statistics
3. Monitor bounce and complaint rates

## 🔒 Security Best Practices

### 1. API Key Security
- Store API keys in environment variables
- Never commit keys to version control
- Rotate keys regularly
- Use least privilege permissions

### 2. Email Security
- Use verified domains for sending
- Implement SPF, DKIM, and DMARC
- Monitor for abuse
- Set up bounce handling

### 3. Rate Limiting
- Implement rate limiting on reset requests
- Monitor for suspicious activity
- Set up alerts for unusual patterns

## 🚨 Troubleshooting

### Common Issues

#### 1. "Failed to send email"
- Check API key is correct
- Verify email provider is configured
- Check environment variables
- Review provider logs

#### 2. "Email not received"
- Check spam folder
- Verify sender email is correct
- Check domain verification status
- Test with different email providers

#### 3. "API key invalid"
- Regenerate API key
- Check key permissions
- Verify account status
- Contact provider support

### Debug Commands

```bash
# Check environment variables
echo $EMAIL_PROVIDER
echo $EMAIL_API_KEY

# Test email service
curl -X POST https://your-app.vercel.app/api/password-reset \
  -H "Content-Type: application/json" \
  -d '{"action":"request","email":"test@example.com"}'
```

## 📈 Performance Optimization

### 1. Email Queue
For high volume, consider:
- Implementing email queuing
- Using background jobs
- Rate limiting per user
- Caching email templates

### 2. Template Optimization
- Minimize HTML size
- Use inline CSS
- Optimize images
- Test across email clients

### 3. Delivery Optimization
- Warm up IP addresses
- Monitor reputation scores
- Implement feedback loops
- Use dedicated IPs for high volume

## 🔄 Migration from Supabase Default

### 1. Update Supabase Settings
1. Go to Supabase Dashboard
2. Remove password reset URLs from Auth settings
3. Keep only essential redirect URLs

### 2. Test Migration
1. Test with existing users
2. Verify no disruption
3. Monitor for issues
4. Update documentation

### 3. Rollback Plan
If issues occur:
1. Revert to Supabase default
2. Update environment variables
3. Test functionality
4. Plan gradual migration

## 📞 Support

### Email Provider Support
- **SendGrid**: [Support Center](https://support.sendgrid.com)
- **Resend**: [Documentation](https://resend.com/docs)
- **AWS SES**: [AWS Support](https://aws.amazon.com/ses/)
- **Gmail**: [Gmail Help](https://support.google.com/mail)

### Custom Support
For SkinVault-specific issues:
1. Check this documentation
2. Review environment variables
3. Test with different providers
4. Contact development team

## 🎯 Next Steps

### 1. Immediate Setup
1. Choose email provider
2. Set up environment variables
3. Test email sending
4. Deploy to production

### 2. Advanced Features
1. Email templates customization
2. Analytics and tracking
3. A/B testing
4. Advanced security features

### 3. Monitoring Setup
1. Set up email monitoring
2. Configure alerts
3. Track delivery rates
4. Monitor user engagement 