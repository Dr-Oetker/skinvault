import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordResetService, getTokenFromUrl, validatePassword } from "../services/passwordResetService";
import { logoImage } from '../utils/images';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = getTokenFromUrl();
    if (!urlToken) {
      setError("Invalid or missing reset token.");
      setValidating(false);
      return;
    }

    setToken(urlToken);
    validateResetToken(urlToken);
  }, []);

  const validateResetToken = async (token: string) => {
    try {
      const result = await PasswordResetService.validateToken(token);
      
      if (result.valid) {
        setValidating(false);
      } else {
        setError(result.error || "Invalid or expired reset token.");
        setValidating(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setError("Failed to validate reset token. Please try again.");
      setValidating(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Validate password strength
    const validation = validatePassword(newPassword);
    setPasswordErrors(validation.errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError("Please fix the password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    
    try {
      const result = await PasswordResetService.resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        setMessage("Password updated successfully! You can now log in with your new password.");
      } else {
        setError(result.error || "Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin-slow w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-dark-text-secondary">Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <img 
              src={logoImage} 
              alt="SkinVault Logo" 
              className="w-16 h-16 object-contain mx-auto mb-4"
            />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-dark-text-primary">Invalid Reset Link</h2>
          <p className="text-dark-text-secondary mb-6">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={logoImage} 
            alt="SkinVault Logo" 
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-dark-text-primary mb-2">Reset Your Password</h2>
          <p className="text-dark-text-secondary">Enter your new password below</p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="bg-accent-success/10 border border-accent-success/20 text-accent-success px-4 py-3 rounded-lg text-center">
              {message}
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className={`input-dark w-full ${passwordErrors.length > 0 ? 'border-accent-error' : ''}`}
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {passwordErrors.length > 0 && (
                <div className="mt-2 text-sm text-accent-error">
                  <ul className="list-disc list-inside space-y-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              disabled={loading || passwordErrors.length > 0}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 