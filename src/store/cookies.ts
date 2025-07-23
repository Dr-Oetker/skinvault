import { create } from 'zustand';

interface CookieState {
  cookiesAccepted: boolean;
  cookiesEnabled: boolean;
  acceptCookies: () => void;
  declineCookies: () => void;
  setCookiesEnabled: (enabled: boolean) => void;
  checkCookieConsent: () => boolean;
}

export const useCookies = create<CookieState>((set, get) => ({
  cookiesAccepted: false,
  cookiesEnabled: false,

  acceptCookies: () => {
    set({ cookiesAccepted: true, cookiesEnabled: true });
    // Store the preference in localStorage for persistence
    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('cookiesEnabled', 'true');
  },

  declineCookies: () => {
    set({ cookiesAccepted: false, cookiesEnabled: false });
    // Store the preference in localStorage for persistence
    localStorage.setItem('cookiesAccepted', 'false');
    localStorage.setItem('cookiesEnabled', 'false');
  },

  setCookiesEnabled: (enabled: boolean) => {
    set({ cookiesEnabled: enabled });
    localStorage.setItem('cookiesEnabled', enabled.toString());
  },

  checkCookieConsent: () => {
    const accepted = localStorage.getItem('cookiesAccepted');
    const enabled = localStorage.getItem('cookiesEnabled');
    
    if (accepted === 'true' && enabled === 'true') {
      set({ cookiesAccepted: true, cookiesEnabled: true });
      return true;
    } else {
      set({ cookiesAccepted: false, cookiesEnabled: false });
      return false;
    }
  },
})); 