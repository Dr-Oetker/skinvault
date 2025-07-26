# Custom Password Reset Implementation

This document describes the custom password reset feature that replaces Supabase's built-in password reset functionality.

## Overview

The custom password reset system provides:
- **Own token generation and management**
- **Custom reset URLs** instead of Supabase's default
- **Better control** over the reset process
- **Enhanced security** with custom token validation
- **Improved user experience** with better error handling

## Architecture

### 1. Database Schema

**Table: `password_reset_tokens`**
```sql
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. API Endpoints

**Serverless Function: `/api/password-reset`**

Supports three actions:
- `request` - Create a new reset token
- `validate` - Validate a reset token
- `reset` - Reset password with token

### 3. Client-Side Services

**Service: `PasswordResetService`**
- Handles API communication
- Provides utility functions
- Manages password validation

## Implementation Details

### Token Generation
- Uses `crypto.randomBytes(32)` for secure token generation
- Tokens are 64-character hexadecimal strings
- Stored with expiration time (1 hour default)

### Security Features
- **Token expiration**: Automatic cleanup of expired tokens
- **Single-use tokens**: Tokens are marked as used after password reset
- **Rate limiting**: Built-in protection against abuse
- **Secure storage**: Tokens stored in database with proper indexing

### Password Validation
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Usage

### 1. Request Password Reset

```typescript
import { PasswordResetService } from '../services/passwordResetService';

const result = await PasswordResetService.requestPasswordReset(email);
if (result.success) {
  // Email sent (or in dev, URL logged to console)
}
```

### 2. Validate Reset Token

```typescript
const result = await PasswordResetService.validateToken(token);
if (result.valid) {
  // Token is valid, show reset form
}
```

### 3. Reset Password

```typescript
const result = await PasswordResetService.resetPassword(token, newPassword);
if (result.success) {
  // Password updated successfully
}
```

## URL Structure

### Reset Links
- **Format**: `https://skinvault.app/reset-password?token=<token>`
- **Token**: 64-character hexadecimal string
- **Expiration**: 1 hour from creation

### Example Reset URL
```
https://skinvault.app/reset-password?token=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

## Environment Variables

### Required
```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_APP_URL=https://skinvault.app
```

### Optional
```env
VITE_API_URL=https://skinvault.app/api
```

## Database Setup

### 1. Run Migration
Execute the SQL migration in `database/migrations/create_password_reset_tokens.sql`

### 2. Verify Table Creation
```sql
SELECT * FROM password_reset_tokens LIMIT 1;
```

### 3. Check Indexes
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'password_reset_tokens';
```

## Email Integration (TODO)

Currently, the system logs reset URLs to the console in development. For production:

### 1. Email Service Setup
- Integrate with SendGrid, AWS SES, or similar
- Configure email templates
- Set up proper error handling

### 2. Email Template
```html
<h2>Password Reset Request</h2>
<p>Click the link below to reset your password:</p>
<a href="{{resetUrl}}">Reset Password</a>
<p>This link expires in 1 hour.</p>
```

### 3. Update API Function
Replace the console.log with actual email sending:

```typescript
// In api/password-reset.ts
await sendPasswordResetEmail(email, resetUrl);
```

## Security Considerations

### 1. Token Security
- Tokens are cryptographically secure
- 64-character length provides 256-bit entropy
- Tokens expire after 1 hour
- Single-use only

### 2. Rate Limiting
- Implement rate limiting on API endpoints
- Prevent abuse of reset functionality
- Monitor for suspicious activity

### 3. Database Security
- Row Level Security (RLS) enabled
- Proper indexing for performance
- Automatic cleanup of expired tokens

## Testing

### 1. Development Testing
```bash
# Start development server
npm run dev

# Test password reset flow
# 1. Go to /login
# 2. Click "Forgot Password"
# 3. Enter email
# 4. Check console for reset URL
# 5. Visit reset URL
# 6. Set new password
```

### 2. Production Testing
- Test with real email addresses
- Verify token expiration
- Test invalid token handling
- Test password validation

## Monitoring

### 1. Logs to Monitor
- Token creation attempts
- Token validation failures
- Password reset successes/failures
- Rate limiting events

### 2. Metrics to Track
- Password reset request volume
- Success/failure rates
- Token expiration rates
- User engagement with reset emails

## Troubleshooting

### Common Issues

1. **Token not found**
   - Check if token exists in database
   - Verify token hasn't expired
   - Ensure token hasn't been used

2. **API errors**
   - Check environment variables
   - Verify Supabase service role key
   - Check database permissions

3. **Email not sending**
   - Verify email service configuration
   - Check email templates
   - Monitor email service logs

### Debug Commands

```sql
-- Check active tokens
SELECT * FROM password_reset_tokens WHERE used = false AND expires_at > NOW();

-- Clean up expired tokens
SELECT cleanup_expired_password_reset_tokens();

-- Check user by email
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

## Migration from Supabase Default

### 1. Update Supabase Settings
- Remove default password reset URLs from Supabase dashboard
- Keep only essential redirect URLs

### 2. Update Environment Variables
- Add required environment variables
- Configure API endpoints

### 3. Test Migration
- Test with existing users
- Verify no disruption to current functionality
- Monitor for any issues

## Future Enhancements

### 1. Additional Security
- IP-based rate limiting
- Device fingerprinting
- Multi-factor authentication integration

### 2. User Experience
- Password strength indicator
- Progressive password requirements
- Remember device option

### 3. Analytics
- Reset flow analytics
- User behavior tracking
- Security event monitoring 