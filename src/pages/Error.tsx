import { Link } from 'react-router-dom';
import { logoImage } from '../utils/images';

interface ErrorProps {
  code?: string;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  };
}

export default function Error({ 
  code = "Error",
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  icon,
  primaryAction,
  secondaryAction
}: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary">
      <div className="glass-card p-8 w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-6">
          <img 
            src={logoImage} 
            alt="SkinVault Logo" 
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
        </div>

        {/* Error Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-error to-red-600 rounded-full flex items-center justify-center mb-4">
            {icon || (
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gradient mb-4">{code}</h1>
          <h2 className="text-2xl font-semibold text-dark-text-primary mb-2">{title}</h2>
          <p className="text-dark-text-secondary">{message}</p>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          {primaryAction ? (
            <button 
              onClick={primaryAction.action}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          ) : (
            <Link 
              to="/" 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Homepage
            </Link>
          )}
          
          {secondaryAction ? (
            <button 
              onClick={secondaryAction.action}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          ) : (
            <button 
              onClick={() => window.history.back()} 
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-dark-border-primary/60">
          <p className="text-sm text-dark-text-muted mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/loadouts" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors">
              Loadouts
            </Link>
            <Link to="/sticker-crafts" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors">
              Sticker Crafts
            </Link>
            <Link to="/resell-tracker" className="text-sm text-accent-primary hover:text-accent-secondary transition-colors">
              Resell Tracker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 