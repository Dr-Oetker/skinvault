# Troubleshooting Guide - Database Content & Password Reset Issues

This guide addresses the specific issues you're experiencing:
- **Outside incognito**: Database content not loading
- **Incognito mode**: Invalid reset link
- **Localhost**: Everything works except password reset

## 🔧 **Issue 1: Database Content Not Loading (Outside Incognito)**

### **Root Cause**: Corrupted Session Data
The issue is likely caused by corrupted Supabase session data stored in your browser's localStorage.

### **Immediate Solutions**:

#### **Solution A: Clear Browser Data (Recommended)**
1. Open your browser's Developer Tools (F12)
2. Go to **Application** tab → **Storage**
3. Click **Clear storage** → **Clear site data**
4. Refresh the page

#### **Solution B: Use the Debug Panel**
1. Look for the red 🐛 button in the bottom-right corner (development only)
2. Click it to open the debug panel
3. Click **"Clear Session"** then **"Run Diagnostics"**
4. Check the results for any issues

#### **Solution C: Manual Cache Clear**
```javascript
// Run this in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Prevention**:
The updated code now automatically detects and fixes corrupted sessions on app start.

## 🔧 **Issue 2: Invalid Reset Link (Incognito Mode)**

### **Root Cause**: Supabase Configuration Mismatch
The password reset links are pointing to the wrong domain.

### **Immediate Solutions**:

#### **Solution A: Update Supabase Settings (CRITICAL)**
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **URL Configuration**
3. Update **Site URL** to: `https://skinvault.app`
4. Add these **Redirect URLs**:
   ```
   https://skinvault.app/reset-password
   https://skinvault.app/login
   https://skinvault.app/
   ```
5. **Save** the changes

#### **Solution B: Test the Configuration**
1. Request a new password reset
2. Check the email link - it should point to `https://skinvault.app/reset-password`
3. If it still points to the old domain, the Supabase settings haven't been updated

#### **Solution C: Check Email Template**
1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Verify it uses `{{ .ConfirmationURL }}` variable

## 🔧 **Issue 3: Localhost vs Production Differences**

### **Why Localhost Works**:
- No cached session data
- Fresh environment each time
- Different domain configuration

### **Why Production Has Issues**:
- Cached session data from old configuration
- Browser storing corrupted tokens
- Domain mismatch in Supabase settings

## 🔧 **Step-by-Step Fix Process**

### **Step 1: Update Supabase Configuration**
1. **Go to Supabase Dashboard**
2. **Authentication** → **URL Configuration**
3. **Site URL**: `https://skinvault.app`
4. **Redirect URLs**: Add all three URLs listed above
5. **Save changes**

### **Step 2: Deploy Updated Code**
1. **Deploy the updated code** to Vercel
2. **Wait for deployment** to complete
3. **Test in incognito mode** first

### **Step 3: Clear Browser Data**
1. **Open Developer Tools** (F12)
2. **Application** → **Storage** → **Clear storage**
3. **Refresh the page**

### **Step 4: Test Password Reset**
1. **Go to login page**
2. **Click "Forgot Password"**
3. **Enter your email**
4. **Check email** for reset link
5. **Verify link points to correct domain**

## 🔧 **Debugging Tools Added**

### **Debug Panel** (Development Only)
- Red 🐛 button in bottom-right corner
- **Run Diagnostics**: Check connection, session, database access
- **Clear Session**: Remove corrupted session data
- **Auto Fix**: Automatically detect and fix issues
- **Force Sign Out**: Complete reset of all data

### **Console Logging**
The updated code includes extensive console logging:
- Supabase connection status
- Session validation
- Token presence/absence
- Database access tests

### **Automatic Session Fixing**
The app now automatically:
- Detects corrupted sessions on startup
- Clears invalid session data
- Logs all session-related activities

## 🔧 **Testing Checklist**

### **Before Testing**:
- [ ] Supabase Site URL updated to `https://skinvault.app`
- [ ] Redirect URLs added to Supabase
- [ ] Code deployed to Vercel
- [ ] Browser cache cleared

### **Test Database Content**:
- [ ] Open site in normal mode
- [ ] Check if categories load
- [ ] Check if weapons load
- [ ] Check if skins load
- [ ] Try logging in

### **Test Password Reset**:
- [ ] Open site in incognito mode
- [ ] Go to login page
- [ ] Click "Forgot Password"
- [ ] Enter email address
- [ ] Check email for reset link
- [ ] Verify link domain is correct
- [ ] Click link and test password update

## 🔧 **Common Error Messages & Solutions**

### **"Invalid or missing token"**
- **Cause**: Supabase redirect URL mismatch
- **Solution**: Update Supabase URL configuration

### **"JWT expired"**
- **Cause**: Old session data
- **Solution**: Clear browser data or use debug panel

### **"Network error"**
- **Cause**: Environment variables missing
- **Solution**: Check Vercel environment variables

### **"Database content not loading"**
- **Cause**: Corrupted session
- **Solution**: Clear session data using debug panel

## 🔧 **Environment Variables Check**

Make sure these are set in Vercel:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 **Browser-Specific Issues**

### **Chrome/Edge**:
- Clear all site data
- Disable extensions temporarily
- Try incognito mode

### **Firefox**:
- Clear cookies and site data
- Try private browsing
- Check for privacy settings

### **Safari**:
- Clear website data
- Try private browsing
- Check for tracking prevention

## 🔧 **If Issues Persist**

### **1. Check Supabase Logs**
- Go to Supabase Dashboard → **Logs** → **Auth**
- Look for authentication errors
- Check for rate limiting

### **2. Check Vercel Logs**
- Go to Vercel Dashboard → **Functions** → **Logs**
- Look for build or runtime errors

### **3. Use Debug Panel**
- Click the 🐛 button
- Run diagnostics
- Check all reported issues

### **4. Contact Support**
If issues persist after following all steps:
1. Collect debug information from console
2. Note which browser and version
3. Describe exact steps to reproduce
4. Include any error messages

## 🔧 **Prevention for Future**

### **For Development**:
- Always test in incognito mode
- Clear cache regularly
- Use debug panel for troubleshooting

### **For Production**:
- Monitor Supabase logs
- Set up error tracking
- Test password reset flow after deployments

### **For Users**:
- Provide clear error messages
- Include troubleshooting steps
- Offer multiple ways to clear cache 