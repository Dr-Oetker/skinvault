// Google Analytics utility functions

// Google Analytics configuration
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || 'G-MYL66ZC2LR';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('📊 Google Analytics initialized with ID:', GA_TRACKING_ID);
  } else {
    console.warn('⚠️ Google Analytics not initialized - missing or invalid tracking ID');
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
    console.log('📊 Page view tracked:', url);
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('📊 Event tracked:', { action, category, label, value });
  }
};

// Track user interactions
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, details);
    console.log('📊 User action tracked:', { action, details });
  }
};

// Track e-commerce events (for skin purchases/tracking)
export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD', items: any[] = []) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
    console.log('📊 Purchase tracked:', { transactionId, value, currency });
  }
};

// Track skin-related events
export const trackSkinView = (skinName: string, skinPrice?: number) => {
  trackEvent('view_item', 'skin', skinName, skinPrice);
};

export const trackSkinFavorite = (skinName: string, action: 'add' | 'remove') => {
  trackEvent(action === 'add' ? 'add_to_favorites' : 'remove_from_favorites', 'skin', skinName);
};

export const trackLoadoutCreate = (loadoutType: 'user' | 'official') => {
  trackEvent('create_loadout', 'loadout', loadoutType);
};

export const trackLoadoutView = (loadoutId: string, loadoutType: 'user' | 'official') => {
  trackEvent('view_loadout', 'loadout', `${loadoutType}_${loadoutId}`);
};

export const trackResellTrackerAdd = (skinName: string, price: number) => {
  trackEvent('add_to_tracker', 'resell_tracker', skinName, price);
};

export const trackTradeUpView = (collectionName: string, profitAmount?: number) => {
  trackEvent('view_trade_up', 'trade_up', collectionName, profitAmount);
};

// Track search events
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', 'search', searchTerm, resultsCount);
};

// Track navigation events
export const trackNavigation = (from: string, to: string) => {
  trackEvent('navigation', 'navigation', `${from}_to_${to}`);
};

// Declare global types for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
