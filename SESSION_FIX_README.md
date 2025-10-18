# Session Lock Loop Fix

## Problem
The app was experiencing frequent lock acquisition loops from Supabase's auth client, causing the app to freeze and become unresponsive. The logs showed:
```
GoTrueClient@0 (2.71.1) #_acquireLock begin -1
GoTrueClient@0 (2.71.1) #_acquireLock end
```
These messages were repeating rapidly in a loop.

## Root Cause
The Supabase auth client's `autoRefreshToken` feature was causing lock acquisition loops when:
- The browser tab was minimized
- The app lost focus
- Network conditions were poor
- Multiple tabs were open

## Solution Implemented

### 1. Disabled Auto Token Refresh
Changed `autoRefreshToken: false` in `src/supabaseClient.ts` to prevent the automatic token refresh that was causing lock loops.

### 2. Implemented Manual Token Refresh
Created a custom manual token refresh system in `src/utils/sessionManager.ts`:
- Refreshes tokens every 50 minutes (tokens expire at 60 minutes)
- Only runs when user is logged in
- Stops automatically on logout
- Handles errors gracefully

### 3. Changed Flow Type
Changed from `pkce` to `implicit` flow type to reduce lock contention.

### 4. Disabled Debug Logs
Set `debug: false` to reduce console spam and prevent performance issues.

### 5. Reduced Realtime Events
Lowered `eventsPerSecond` to 2 to prevent overload.

## How It Works

### On Login
1. User logs in successfully
2. `startManualTokenRefresh()` is called
3. A timer is set to refresh the token every 50 minutes
4. Session remains active as long as user is logged in

### On Logout
1. User logs out
2. `stopManualTokenRefresh()` is called
3. Timer is cleared
4. No more token refresh attempts

### On App Reload
1. App checks for existing session
2. If session exists, starts manual token refresh
3. User stays logged in seamlessly

## Console Messages
You'll see these messages in the console:

- `✅ Manual token refresh enabled (auto-refresh disabled to prevent lock loops)` - When you log in
- `🔄 Manual token refresh triggered (keeping session alive)` - Every 50 minutes
- `✅ Manual token refresh successful - session extended` - When refresh succeeds

## Benefits

1. **No More Lock Loops** - Eliminates the rapid lock acquisition cycles
2. **Stable Sessions** - Users stay logged in reliably
3. **Better Performance** - Reduced console spam and CPU usage
4. **Graceful Handling** - Errors are handled without freezing the app
5. **Multi-Tab Support** - Each tab manages its own refresh independently

## Recovery Options Still Available

### Manual Recovery Button
- Use the "Recover" button in navigation if issues occur

### Emergency Recovery
- Press `Ctrl+Shift+R` to trigger emergency recovery
- Clears all data and reloads the app

## Technical Details

**Files Modified:**
- `src/supabaseClient.ts` - Disabled auto-refresh, changed flow type
- `src/utils/sessionManager.ts` - Added manual token refresh
- `src/store/auth.ts` - Integrated manual refresh into auth flow

**Token Lifetime:**
- Tokens expire after 60 minutes
- We refresh at 50 minutes to provide a 10-minute buffer
- This ensures users never get logged out unexpectedly

## Verification
To verify the fix is working:
1. Log in to the app
2. Check console for: `✅ Manual token refresh enabled`
3. Leave app open for 50+ minutes
4. Check console for: `🔄 Manual token refresh triggered`
5. Verify no lock loop messages appear

## Recent Update: Fixed Aggressive Logout Issue

### Problem
The visibility and focus managers were being too aggressive with timeouts, causing users to be logged out when:
- Switching tabs while editing
- Slow network responses
- Browser performing background tasks

### Fix Applied
1. **Increased Timeouts**: Changed from 5 seconds to 30 seconds
2. **Added User Check**: Skips session validation if user is already authenticated
3. **Default to Valid**: On timeout or error, assumes session is still valid instead of logging out
4. **Network Error Handling**: Distinguishes between network errors and auth errors
5. **Longer Debounce**: Increased from 1-2 seconds to 2 seconds

### Result
- ✅ No more unexpected logouts when switching tabs
- ✅ Works reliably even with slow network
- ✅ Only logs out on actual authentication failures
- ✅ Maintains session state during temporary issues

## Latest Update: Added Timeout Protection to Save Operations

### Problem
After tab switching, save operations (especially for loadouts) would hang indefinitely, causing the app to freeze and all Supabase content to stop loading.

### Fix Applied
1. **Created Timeout Wrapper**: New `withOperationTimeout` utility function
2. **15-Second Timeout**: All save operations timeout after 15 seconds
3. **User Feedback**: Clear error messages when timeouts occur
4. **Graceful Failure**: App remains functional even when saves fail

### Files Protected
- `src/pages/LoadoutDetail.tsx` - Wear selection saves
- `src/pages/AdminLoadouts.tsx` - Admin loadout saves (20s timeout)
- `src/pages/EditLoadout.tsx` - User loadout edits

### Result
- ✅ Save operations never hang indefinitely
- ✅ App remains responsive even with slow network
- ✅ Clear timeout error messages guide users
- ✅ No more frozen state after tab switching

## If Issues Persist
1. Try the manual "Recover" button
2. Use emergency recovery (Ctrl+Shift+R)
3. Clear browser data and log in again
4. Check browser console for specific error messages

