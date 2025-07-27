import { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { logoImage } from '../utils/images';
import { PasswordResetService } from '../services/passwordResetService';

export default function Login() {
  const { user, login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      navigate("/profile"); // Redirect to profile page
    }
  }, [user, navigate]);

  // Handle rate limit countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRateLimited && rateLimitCountdown > 0) {
      interval = setInterval(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitCountdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const result = await login(email, password);
    if (result && result.error) setError(result.error.message);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const result = await register(email, password);
    if (result && result.error) setError(result.error.message);
    else setSuccess("Registration successful! Please check your email to confirm your account.");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const result = await PasswordResetService.requestPasswordReset(email);
      
      if (result.success) {
        setSuccess("Password reset email sent! Please check your email (including spam folder) for instructions.");
        // In development, show the reset URL for testing
        if (import.meta.env.DEV && result.resetUrl) {
          console.log('Reset URL (dev only):', result.resetUrl);
        }
      } else {
        if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
        setError("Too many password reset attempts. Please wait a few minutes before trying again.");
        setIsRateLimited(true);
        setRateLimitCountdown(300); // 5 minutes countdown
      } else {
          setError(result.error || "Failed to send password reset email. Please try again.");
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const resetMode = () => {
    setMode("login");
    setError(null);
    setSuccess(null);
    setIsRateLimited(false);
    setRateLimitCountdown(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={logoImage} 
            alt="SkinVault Logo" 
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-dark-text-primary mb-2">Welcome to SkinVault</h1>
          <p className="text-dark-text-secondary">
            {mode === "forgot" 
              ? "Reset your password" 
              : "Sign in to your account or create a new one"
            }
          </p>
        </div>

        {/* Mode Toggle - Only show for login/register */}
        {mode !== "forgot" && (
        <div className="flex mb-8 bg-dark-bg-tertiary rounded-lg p-1">
          <button
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              mode === "login" 
                ? "bg-accent-primary text-white shadow-lg" 
                : "text-dark-text-secondary hover:text-dark-text-primary"
            }`}
            onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              mode === "register" 
                ? "bg-accent-primary text-white shadow-lg" 
                : "text-dark-text-secondary hover:text-dark-text-primary"
            }`}
            onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
          >
            Register
          </button>
        </div>
        )}

        {/* Form */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark w-full pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark w-full pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-accent-primary hover:text-accent-secondary transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>

            {error && (
              <div className="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin-slow w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : mode === "register" ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark w-full pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark w-full pl-10"
                  placeholder="Create a password"
                  required
                />
              </div>
              <p className="text-xs text-dark-text-muted mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {error && (
              <div className="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-accent-success/10 border border-accent-success/20 text-accent-success px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin-slow w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        ) : (
          // Forgot Password Form
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark w-full pl-10"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <p className="text-xs text-dark-text-muted mt-1">
                We'll send you a link to reset your password. If you don't see it, check your spam folder.
              </p>
            </div>

            {error && (
              <div className="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-accent-success/10 border border-accent-success/20 text-accent-success px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || isRateLimited}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin-slow w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending reset email...
                </div>
              ) : isRateLimited ? (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Try again in {Math.floor(rateLimitCountdown / 60)}:{(rateLimitCountdown % 60).toString().padStart(2, '0')}
                </div>
              ) : (
                'Send Reset Email'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={resetMode}
                className="text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors duration-200"
              >
                ← Back to login
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-dark-border-primary/50 text-center">
          <p className="text-sm text-dark-text-muted">
            By continuing, you agree to our{' '}
            <a href="/terms-of-service" className="text-accent-primary hover:text-accent-secondary transition-colors duration-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="text-accent-primary hover:text-accent-secondary transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 