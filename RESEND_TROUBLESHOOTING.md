# Resend 422 Error Troubleshooting Guide

## 🔍 **422 Error Causes**

The 422 error in Resend usually means one of these issues:

### **1. Domain Verification**
- **Issue**: Sending domain not verified in Resend
- **Fix**: Verify your domain in Resend dashboard

### **2. Invalid Email Format**
- **Issue**: Email address format is incorrect
- **Fix**: Check email validation

### **3. API Key Issues**
- **Issue**: Invalid or expired API key
- **Fix**: Regenerate API key

### **4. Rate Limiting**
- **Issue**: Too many requests
- **Fix**: Check usage limits

## 🛠️ **Step-by-Step Fix**

### **Step 1: Check Resend Dashboard**

1. **Go to [resend.com](https://resend.com)**
2. **Check "Domains" section**
3. **Verify your domain is listed and verified**
4. **Check "API Keys" section**
5. **Verify your API key is active**

### **Step 2: Verify Environment Variables**

Check your Vercel environment variables:

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@skinvault.app
EMAIL_FROM_NAME=SkinVault
```

### **Step 3: Test with Verified Domain**

If you don't have a verified domain, use Resend's sandbox domain:

```env
EMAIL_FROM=onboarding@resend.dev
```

### **Step 4: Check API Logs**

Add this to your API function for debugging:

```typescript
// In api/password-reset.ts
console.log('Email config:', {
  provider: emailConfig.provider,
  fromEmail: emailConfig.fromEmail,
  apiKey: emailConfig.apiKey ? '***' : 'MISSING'
});
```

## 🔧 **Quick Fixes**

### **Fix 1: Use Sandbox Domain**
```env
EMAIL_FROM=onboarding@resend.dev
```

### **Fix 2: Verify Your Domain**
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `skinvault.app`)
3. Follow DNS setup instructions
4. Wait for verification

### **Fix 3: Regenerate API Key**
1. Go to Resend Dashboard → API Keys
2. Create new API key
3. Update Vercel environment variables

## 🧪 **Testing Steps**

### **1. Test API Key**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": ["test@example.com"],
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### **2. Check Response**
- **200**: API key works
- **401**: Invalid API key
- **422**: Domain/format issues

## 📊 **Common Solutions**

### **Solution 1: Use Sandbox Domain**
```env
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=SkinVault
```

### **Solution 2: Verify Your Domain**
1. Add domain to Resend
2. Update DNS records
3. Wait for verification
4. Use verified domain

### **Solution 3: Check Email Format**
```typescript
// Ensure email is valid
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return { success: false, error: 'Invalid email format' };
}
```

## 🚨 **Emergency Fix**

If you need emails working immediately:

1. **Use sandbox domain**:
   ```env
   EMAIL_FROM=onboarding@resend.dev
   ```

2. **Test with simple email**:
   ```typescript
   const response = await fetch('https://api.resend.com/emails', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${apiKey}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       from: 'onboarding@resend.dev',
       to: [email],
       subject: 'Password Reset',
       html: '<p>Reset your password</p>'
     })
   });
   ```

## 📞 **Support**

### **Resend Support**
- **Documentation**: [resend.com/docs](https://resend.com/docs)
- **Status**: [status.resend.com](https://status.resend.com)
- **Contact**: Check Resend dashboard for support

### **Debug Commands**
```bash
# Test API key
curl -H "Authorization: Bearer YOUR_KEY" https://api.resend.com/domains

# Test email sending
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"onboarding@resend.dev","to":["test@example.com"],"subject":"Test","html":"<p>Test</p>"}'
``` 