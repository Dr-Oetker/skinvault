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
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const type = urlParams.get("type");
    
    // Also check hash for backward compatibility
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const hashAccessToken = hashParams.get("access_token");
    
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
      Access Token from URL: ${accessToken ? 'Present' : 'Missing'}
      Access Token from Hash: ${hashAccessToken ? 'Present' : 'Missing'}
      Refresh Token: ${refreshToken ? 'Present' : 'Missing'}
    `);

    // Use token from URL params first, then hash
    const finalToken = accessToken || hashAccessToken;
    setToken(finalToken);
    
    if (finalToken) {
      // Set the session for Supabase client
      const session = {
        access_token: finalToken,
        refresh_token: refreshToken || finalToken
      };
      supabase.auth.setSession(session);
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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setMessage("Password updated! You can now log in.");
    }
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