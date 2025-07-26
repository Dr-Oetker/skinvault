# Supabase Password Reset Configuration Guide

This guide will help you fix the "Invalid or missing token" error when using password reset functionality.

## 🔧 **Step 1: Update Supabase Project Settings**

### 1.1 Go to Supabase Dashboard
1. Log in to your Supabase dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**

### 1.2 Update Site URL
Set your **Site URL** to your production domain:
```
https://skinvault.app
```

### 1.3 Update Redirect URLs
Add these redirect URLs to the **Redirect URLs** list:
```
https://skinvault.app/reset-password
https://skinvault.app/login
https://skinvault.app/
```

**Important**: Make sure to include the trailing slash for the homepage URL.

### 1.4 Update Additional Redirect URLs (if needed)
If you have other domains (staging, development), add them too:
```
http://localhost:5173/reset-password
http://localhost:5173/login
http://localhost:5173/
```

## 🔧 **Step 2: Check Email Templates**

### 2.1 Go to Email Templates
1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Select **Reset Password** template

### 2.2 Verify Template Configuration
Make sure the template includes:
- **Subject**: "Reset your password"
- **Action URL**: Should use the `{{ .ConfirmationURL }}` variable
- **Redirect URL**: Should point to your reset password page

## 🔧 **Step 3: Test the Configuration**

### 3.1 Request a Password Reset
1. Go to your app's login page
2. Click "Forgot Password"
3. Enter your email
4. Check the email you receive

### 3.2 Check the Reset Link
The reset link should look like:
```
https://skinvault.app/reset-password?access_token=xxx&refresh_token=xxx&type=recovery
```

**NOT** like:
```
https://your-old-domain.com/reset-password?access_token=xxx&refresh_token=xxx&type=recovery
```

## 🔧 **Step 4: Debugging**

### 4.1 Check Browser Console
When you click the reset link, check the browser console for debug information:
- URL parameters
- Token presence
- Any error messages

### 4.2 Check Network Tab
Look for any failed requests to Supabase endpoints.

### 4.3 Verify Token Format
The token should be a long string of characters, not empty or malformed.

## 🔧 **Step 5: Common Issues and Solutions**

### Issue 1: "Invalid or missing token"
**Cause**: Supabase is still using old domain in redirect URLs
**Solution**: Update Site URL and Redirect URLs in Supabase dashboard

### Issue 2: Token expires immediately
**Cause**: Token expiration time is too short
**Solution**: Check token expiration settings in Supabase Auth settings

### Issue 3: Link works but password update fails
**Cause**: Session not properly set
**Solution**: The updated code now handles this better

### Issue 4: Different behavior in development vs production
**Cause**: Different domains configured
**Solution**: Make sure both development and production URLs are in redirect list

## 🔧 **Step 6: Environment Variables**

Make sure your environment variables are correct:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 **Step 7: Testing Checklist**

- [ ] Site URL is set to `https://skinvault.app`
- [ ] Redirect URLs include `https://skinvault.app/reset-password`
- [ ] Email template uses correct variables
- [ ] Environment variables are correct
- [ ] Reset link contains valid tokens
- [ ] Password update works after clicking link

## 🔧 **Step 8: Production Deployment**

After making changes:

1. **Deploy your updated code** to Vercel
2. **Test the password reset flow** in production
3. **Monitor for any errors** in the browser console
4. **Check Supabase logs** for any authentication errors

## 🔧 **Step 9: Monitoring**

### 9.1 Supabase Logs
Check Supabase Dashboard → **Logs** → **Auth** for any errors.

### 9.2 Application Logs
The updated code includes debug logging. Check browser console for:
- URL parameters
- Token presence
- Session setting success/failure

## 🔧 **Step 10: Fallback Solutions**

If the issue persists:

1. **Clear browser cache** and try again
2. **Try in incognito/private mode**
3. **Check if the issue is browser-specific**
4. **Verify Supabase project is in the correct region**

## 🔧 **Step 11: Advanced Configuration**

### 11.1 Custom Email Templates
You can customize the email template in Supabase to include your branding.

### 11.2 Token Expiration
You can adjust token expiration times in Supabase Auth settings.

### 11.3 Rate Limiting
Check if you're hitting rate limits for password reset requests.

## 🔧 **Step 12: Security Considerations**

- Reset links expire after a set time (default: 1 hour)
- Tokens are single-use
- Failed attempts are rate-limited
- Consider implementing additional security measures

## 🔧 **Step 13: Troubleshooting Commands**

### Check Current Configuration
```bash
# In your app, check the console for debug info
console.log('Current URL:', window.location.href);
console.log('Environment:', process.env.NODE_ENV);
```

### Test Reset Flow
1. Request password reset
2. Check email for link
3. Click link and verify URL format
4. Check browser console for debug info
5. Try updating password

## 🔧 **Step 14: Support**

If you're still having issues:

1. **Check Supabase Status**: https://status.supabase.com
2. **Review Supabase Docs**: https://supabase.com/docs/guides/auth
3. **Check GitHub Issues**: For similar problems
4. **Contact Supabase Support**: If it's a platform issue

## 🔧 **Step 15: Prevention**

To prevent this issue in the future:

1. **Always update Supabase settings** when changing domains
2. **Test password reset flow** after deployments
3. **Monitor authentication logs** regularly
4. **Keep redirect URLs updated** for all environments 