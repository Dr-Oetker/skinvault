import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { logoImage } from '../utils/images';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Clear any existing session data to prevent auto-login issues
    const clearExistingSession = () => {
      try {
        // Clear Supabase session data
        localStorage.removeItem('sb-skinvault-web-auth-token');
        sessionStorage.clear();
        
        // Clear any other auth-related data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        console.log("Cleared existing session data");
      } catch (error) {
        console.error("Error clearing session data:", error);
      }
    };
    
    // Clear session data first
    clearExistingSession();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const type = urlParams.get("type");
    
    // Also check hash for backward compatibility
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const hashAccessToken = hashParams.get("access_token");
    const hashCode = hashParams.get("code");
    
    console.log("Reset Password Debug Info:", {
      urlParams: Object.fromEntries(urlParams.entries()),
      hashParams: Object.fromEntries(hashParams.entries()),
      currentUrl: window.location.href,
      type
    });

    // Set debug info
    setDebugInfo(`
      URL: ${window.location.href}
      Type: ${type}
      Code from URL: ${code ? 'Present' : 'Missing'}
      Code from Hash: ${hashCode ? 'Present' : 'Missing'}
      Access Token from URL: ${accessToken ? 'Present' : 'Missing'}
      Access Token from Hash: ${hashAccessToken ? 'Present' : 'Missing'}
      Refresh Token: ${refreshToken ? 'Present' : 'Missing'}
    `);

    // Handle different token formats
    let finalToken = null;
    
    if (code) {
      // Supabase sends a code that needs to be exchanged for a session
      console.log("Found code parameter, exchanging for session...");
      finalToken = code;
    } else if (accessToken || hashAccessToken) {
      // Direct access token
      finalToken = accessToken || hashAccessToken;
    }
    
    setToken(finalToken);
    
    if (finalToken) {
      if (code) {
        // Exchange code for session
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (error) {
            console.error("Error exchanging code for session:", error);
            setError("Failed to validate reset link. Please try again.");
          } else {
            console.log("Successfully exchanged code for session");
          }
        });
      } else {
        // Direct token - set session
        const session = {
          access_token: finalToken,
          refresh_token: refreshToken || finalToken
        };
        supabase.auth.setSession(session);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    
    try {
      // Check if we have a valid session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // Try to exchange code for session if we have a code
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        
        if (code) {
          console.log("Attempting to exchange code for session...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Error exchanging code:", exchangeError);
            setError("Invalid or expired reset link. Please request a new one.");
            setLoading(false);
            return;
          }
          
          console.log("Successfully exchanged code for session");
        } else {
          setError("Invalid reset link. Please request a new password reset.");
          setLoading(false);
          return;
        }
      }
      
      // Now update the password
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("Password update error:", error);
        setError(error.message);
      } else {
        setSuccess(true);
        setMessage("Password updated successfully! You can now log in with your new password.");
        
        // Clear any session data to prevent auto-login issues
        setTimeout(() => {
          supabase.auth.signOut();
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
    
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              src={logoImage} 
              alt="SkinVault Logo" 
              className="w-16 h-16 object-contain mx-auto mb-4"
            />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-center text-accent-error">Invalid Reset Link</h2>
          <p className="text-dark-text-secondary mb-6 text-center">
            The password reset link is invalid or has expired. Please request a new password reset.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/login'}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-secondary w-full"
            >
              Go to Homepage
            </button>
          </div>
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-dark-bg-secondary rounded-lg">
              <summary className="cursor-pointer text-sm text-dark-text-muted">Debug Info</summary>
              <pre className="text-xs text-dark-text-muted mt-2 whitespace-pre-wrap">{debugInfo}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={logoImage} 
            alt="SkinVault Logo" 
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-center">Set a New Password</h2>
        {success ? (
          <div className="bg-accent-success/10 border border-accent-success/20 text-accent-success px-4 py-3 rounded-lg text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="input-dark w-full"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="input-dark w-full"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 