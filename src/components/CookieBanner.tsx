import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function CookieBanner({ onAccept, onDecline }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice in this session
    const hasMadeChoice = sessionStorage.getItem('cookieChoice');
    if (!hasMadeChoice) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem('cookieChoice', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    sessionStorage.setItem('cookieChoice', 'declined');
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass-card border border-dark-border-primary/60 rounded-2xl shadow-dark-xl max-w-4xl mx-auto">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                We use cookies to enhance your experience
              </h3>
              <p className="text-dark-text-secondary text-sm leading-relaxed mb-4">
                This website uses cookies to provide essential functionality and improve your experience. 
                We use cookies for:
              </p>
              <ul className="text-dark-text-secondary text-sm space-y-1 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary mt-1">•</span>
                  <span>Maintaining your login session and preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary mt-1">•</span>
                  <span>Remembering your language and theme settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary mt-1">•</span>
                  <span>Ensuring secure data transmission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary mt-1">•</span>
                  <span>Analyzing website usage to improve our service</span>
                </li>
              </ul>
              <p className="text-dark-text-secondary text-sm">
                By clicking "Accept All", you consent to our use of cookies. You can change your 
                preferences at any time in our{' '}
                <Link to="/cookie-settings" className="text-accent-primary hover:text-accent-secondary transition-colors duration-200 underline">
                  Cookie Settings
                </Link>.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:min-w-[200px]">
              <button
                onClick={handleAccept}
                className="btn-primary px-6 py-3 text-sm font-medium"
              >
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="btn-secondary px-6 py-3 text-sm font-medium"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 