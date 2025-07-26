import { Link } from 'react-router-dom';
import { logoImage } from '../utils/images';

export default function Error500() {
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
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-warning to-yellow-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gradient mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-dark-text-primary mb-2">Server Error</h2>
          <p className="text-dark-text-secondary">
            Something went wrong on our end. We're working to fix it.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          <Link 
            to="/" 
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
          
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
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